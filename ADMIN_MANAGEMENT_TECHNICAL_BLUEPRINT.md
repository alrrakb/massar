# 🎯 ADMIN MANAGEMENT SYSTEM - TECHNICAL BLUEPRINT

**Project:** Exam Management System (Graduation Project)  
**Date:** 2026-04-16  
**Status:** ✅ Design Complete - Ready for Implementation  
**Architect:** The Architect

---

## 📊 PART 1: DATABASE SCHEMA VERIFICATION

### Profiles Table Structure

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK, FK → auth.users.id | User unique identifier |
| `email` | TEXT | Nullable | User email address |
| `full_name` | TEXT | Nullable | User's full name |
| `role` | app_role | Default: 'student' | **admin | teacher | student** |
| `status` | user_status | NOT NULL, Default: 'active' | **active | suspended** |
| `created_at` | TIMESTAMPTZ | Default: NOW() | Account creation timestamp |
| `updated_at` | TIMESTAMPTZ | Default: NOW() | Last update timestamp |
| `student_id` | TEXT | Nullable | Student ID (for students) |
| `major_id` | INTEGER | FK → majors.id | Academic major |
| `level_id` | INTEGER | FK → academic_levels.id | Academic level/year |
| `employee_id` | TEXT | Nullable | Employee ID (for teachers) |
| `department` | TEXT | Nullable | Department (for teachers) |
| `subjects` | TEXT | Nullable | Teaching subjects (for teachers) |
| `specialization` | TEXT | Nullable | Teacher specialization |
| `mobile` | TEXT | Nullable | Contact number |
| `avatar_url` | TEXT | Nullable | Profile picture URL |
| `bio` | TEXT | Nullable | User biography |

### Triggers on Profiles Table
- ✅ `tr_set_student_id` (INSERT) - Auto-generate student ID
- ✅ `trg_assign_student_id` (INSERT) - Assign student ID from academic levels

### RLS Policies
- ✅ Authenticated users can SELECT their own profile
- ✅ Admins can SELECT/UPDATE/DELETE all profiles
- ✅ Teachers can SELECT/UPDATE their own profile

---

## 🏗️ PART 2: API LAYER DESIGN

### Folder Structure
```
src/features/admin/
├── api/
│   ├── client.ts              # Singleton Supabase client
│   ├── hooks/
│   │   ├── useAdminUsers.ts   # Fetch users with filters
│   │   ├── useUserActions.ts  # CRUD mutations
│   │   └── index.ts
│   ├── queries/
│   │   └── userQueries.ts     # Raw query functions
│   └── mutations/
│       └── userMutations.ts   # Write operations
```

### 1. useAdminUsers.ts - Fetch Users

```typescript
// src/features/admin/api/hooks/useAdminUsers.ts
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getSupabaseClient } from '../../../../services/supabase';
import type { UserProfile } from '../../../../types';

export interface UserFilters {
  role?: 'admin' | 'teacher' | 'student';
  status?: 'active' | 'suspended';
  search?: string;
  page?: number;
  limit?: number;
}

export function useAdminUsers(filters: UserFilters = {}) {
  const { role, status, search, page = 1, limit = 20 } = filters;
  
  return useQuery({
    queryKey: ['admin-users', role, status, search, page, limit],
    queryFn: async () => {
      const supabase = getSupabaseClient();
      
      let query = supabase
        .from('profiles')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range((page - 1) * limit, page * limit - 1);

      // Apply filters
      if (role) query = query.eq('role', role);
      if (status) query = query.eq('status', status);
      
      if (search) {
        query = query.or(
          `full_name.ilike.%${search}%,email.ilike.%${search}%,student_id.ilike.%${search}%`
        );
      }

      const { data, error, count } = await query;
      if (error) throw error;
      
      return {
        users: data as UserProfile[],
        total: count || 0,
        page,
        limit,
        totalPages: Math.ceil((count || 0) / limit)
      };
    },
  });
}

// Helper hook for getting all users (no pagination)
export function useAllAdminUsers(role?: 'admin' | 'teacher' | 'student') {
  return useQuery({
    queryKey: ['all-admin-users', role],
    queryFn: async () => {
      const supabase = getSupabaseClient();
      let query = supabase.from('profiles').select('*');
      
      if (role) query = query.eq('role', role);
      
      const { data, error } = await query;
      if (error) throw error;
      return data as UserProfile[];
    },
  });
}
```

### 2. useUserActions.ts - CRUD Mutations

```typescript
// src/features/admin/api/hooks/useUserActions.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { getServiceClient } from '../../../../services/supabase';
import type { UserProfile } from '../../../../types';

export function useUpdateUserStatus() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      userId, 
      status 
    }: { 
      userId: string; 
      status: 'active' | 'suspended' 
    }) => {
      const supabase = getServiceClient();
      const { error } = await supabase
        .from('profiles')
        .update({ 
          status, 
          updated_at: new Date().toISOString() 
        })
        .eq('id', userId);
      
      if (error) throw error;
      return { userId, status };
    },
    onSuccess: (_, { userId }) => {
      // Invalidate and refetch user lists
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      queryClient.invalidateQueries({ queryKey: ['all-admin-users'] });
    },
  });
}

export function useUpdateUserProfile() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      userId, 
      userData 
    }: { 
      userId: string; 
      userData: Partial<UserProfile> 
    }) => {
      const supabase = getServiceClient();
      const { data, error } = await supabase
        .from('profiles')
        .update({ 
          ...userData, 
          updated_at: new Date().toISOString() 
        })
        .eq('id', userId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      queryClient.invalidateQueries({ queryKey: ['all-admin-users'] });
      queryClient.invalidateQueries({ queryKey: ['user-profile', userId] });
    },
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (userId: string) => {
      const supabase = getServiceClient();
      
      // Step 1: Delete from profiles
      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);
      
      if (profileError) throw profileError;
      
      // Step 2: Delete from auth.users (requires admin)
      const { error: authError } = await supabase.auth.admin.deleteUser(userId);
      
      if (authError) {
        // Rollback: restore profile if auth deletion fails
        // Note: In production, you'd want to log this and handle manually
        throw authError;
      }
      
      return userId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      queryClient.invalidateQueries({ queryKey: ['all-admin-users'] });
    },
  });
}

export function useBulkSuspendUsers() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      userIds, 
      status 
    }: { 
      userIds: string[]; 
      status: 'active' | 'suspended' 
    }) => {
      const supabase = getServiceClient();
      
      const { error } = await supabase
        .from('profiles')
        .update({ 
          status, 
          updated_at: new Date().toISOString() 
        })
        .in('id', userIds);
      
      if (error) throw error;
      return { userIds, status };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      queryClient.invalidateQueries({ queryKey: ['all-admin-users'] });
    },
  });
}
```

---

## 🎨 PART 3: UI/UX STRATEGY

### 1. High-End Data Table Features

**Components:**
- ✅ Sorting (clickable column headers)
- ✅ Filtering (role, status, search)
- ✅ Pagination (client-side for <1000 rows, server-side for more)
- ✅ Row selection (checkboxes for bulk actions)
- ✅ Export to CSV/Excel
- ✅ Column customization (show/hide columns)
- ✅ Responsive design (mobile-friendly)

**Tech Stack:**
- `@tanstack/react-table` - Headless table components
- `@radix-ui/react-dialog` - Modal dialogs
- `@radix-ui/react-dropdown-menu` - Action menus
- `lucide-react` - Icon library

### 2. Suspension Logic Design

**Problem:** How does `is_active = false` (or `status = 'suspended'`) affect login?

**Solution: Middleware/Authentication Guard**

```typescript
// src/lib/authMiddleware.ts
import { createClient } from '@supabase/supabase-js';

export async function checkUserStatus(session: any) {
  if (!session?.user) {
    return { authenticated: false, error: 'No session' };
  }
  
  const supabase = createClient(
    import.meta.env.VITE_SUPABASE_URL,
    import.meta.env.VITE_SUPABASE_ANON_KEY
  );
  
  // Fetch user profile
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('status, role')
    .eq('id', session.user.id)
    .single();
  
  if (error) {
    return { authenticated: false, error: 'Failed to fetch profile' };
  }
  
  // Check if user is suspended
  if (profile?.status === 'suspended') {
    return { 
      authenticated: false, 
      error: 'Your account has been suspended. Please contact support.',
      suspended: true 
    };
  }
  
  return { 
    authenticated: true, 
    user: { ...session.user, ...profile } 
  };
}

// Usage in middleware or auth wrapper
export function AuthWrapper({ children }: { children: React.ReactNode }) {
  const { data: { session } } = useSession();
  const { data: authCheck, isLoading } = useQuery({
    queryKey: ['auth-check', session],
    queryFn: () => checkUserStatus(session),
    enabled: !!session,
  });
  
  if (isLoading) return <LoadingSpinner />;
  
  if (!authCheck?.authenticated) {
    if (authCheck?.suspended) {
      return <SuspendedAccountPage message={authCheck.error} />;
    }
    return <Navigate to="/login" />;
  }
  
  return <>{children}</>;
}
```

**Suspension Flow:**
1. Admin toggles user status to 'suspended'
2. User's session remains valid until token expires (1 hour)
3. On next auth check, middleware detects suspended status
4. User is logged out and shown suspension message
5. User cannot re-login until admin reactivates account

### 3. Safety Delete Confirmation

**Component Design:**

```typescript
// src/features/admin/components/common/DeleteConfirmationModal.tsx
interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  userName: string;
  userType: 'student' | 'teacher' | 'admin';
}

export function DeleteConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  userName,
  userType,
}: DeleteConfirmationModalProps) {
  const [confirmText, setConfirmText] = useState('');
  
  const isConfirmValid = confirmText === `DELETE_${userType.toUpperCase()}_${userName}`;
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-red-600">⚠️ Permanent Delete Confirmation</DialogTitle>
          <DialogDescription>
            This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4 space-y-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="font-semibold text-red-800">
              You are about to delete: <span className="font-bold">{userName}</span>
            </p>
            <p className="text-sm text-red-600 mt-2">
              Type <code className="bg-red-100 px-2 py-1 rounded">DELETE_{userType.toUpperCase()}_{userName}</code> to confirm
            </p>
          </div>
          
          <Input
            placeholder={`Type DELETE_${userType.toUpperCase()}_${userName}`}
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            className="font-mono"
          />
          
          <div className="text-xs text-gray-500">
            <p>⚠️ This will:</p>
            <ul className="list-disc list-inside mt-1 space-y-1">
              <li>Permanently delete the user's profile</li>
              <li>Remove all their exams, submissions, and courses</li>
              <li>Revoke all their access tokens</li>
              <li><strong>CANNOT BE REVERSED</strong></li>
            </ul>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button 
            variant="destructive" 
            onClick={onConfirm}
            disabled={!isConfirmValid}
            className={isConfirmValid ? 'animate-pulse' : ''}
          >
            {isConfirmValid ? '✅ CONFIRM DELETE' : 'Type the code to confirm'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

---

## 📁 PART 4: FSD FOLDER MANIFEST

### Complete Folder Structure

```
src/features/admin/
├── README.md                          # Feature overview and usage
├── index.ts                           # Public API exports
│
├── api/                               # Data access layer
│   ├── client.ts                      # Singleton Supabase client
│   ├── hooks/                         # React Query hooks
│   │   ├── useAdminUsers.ts           # Fetch users with filters
│   │   ├── useUserActions.ts          # CRUD mutations
│   │   ├── useBulkActions.ts          # Bulk operations
│   │   └── index.ts                   # Barrel exports
│   ├── queries/                       # Raw query functions
│   │   ├── userQueries.ts             # User data queries
│   │   └── index.ts
│   └── mutations/                     # Write operations
│       ├── userMutations.ts           # User CRUD mutations
│       └── index.ts
│
├── components/                        # UI components (organized by slice)
│   ├── common/                        # Shared components
│   │   ├── AdminDataTable.tsx         # High-end data table
│   │   ├── UserForm.tsx               # Create/Edit user form
│   │   ├── DeleteConfirmationModal.tsx # Safety delete modal
│   │   ├── SuspensionModal.tsx        # Suspension confirmation
│   │   ├── RoleBadge.tsx              # Role indicator badge
│   │   ├── StatusBadge.tsx            # Active/Suspended badge
│   │   ├── PermissionGuard.tsx        # RBAC wrapper
│   │   ├── BulkActionToolbar.tsx      # Bulk selection toolbar
│   │   ├── UserSearchFilter.tsx       # Search and filter inputs
│   │   ├── Pagination.tsx             # Page navigation
│   │   └── index.ts
│   │
│   ├── student-management/            # Student Management slice
│   │   ├── StudentList.tsx            # Main student list view
│   │   ├── StudentForm.tsx            # Create/Edit student form
│   │   ├── StudentActions.tsx         # Row action menu
│   │   ├── StudentBulkActions.tsx     # Bulk student operations
│   │   ├── AcademicDataPanel.tsx      # Edit major/level
│   │   └── index.ts
│   │
│   └── teacher-management/            # Teacher Management slice
│       ├── TeacherList.tsx            # Main teacher list view
│       ├── TeacherForm.tsx            # Create/Edit teacher form
│       ├── TeacherActions.tsx         # Row action menu
│       ├── TeacherBulkActions.tsx     # Bulk teacher operations
│       ├── ExpertisePanel.tsx         # Edit department/subjects
│       └── index.ts
│
├── hooks/                             # Feature-specific hooks
│   ├── useRBAC.ts                     # Role-based access control
│   ├── useUserSelection.ts            # Bulk selection state
│   ├── useExportUsers.ts              # CSV/Excel export
│   └── index.ts
│
├── logic/                             # Business logic
│   ├── validateUserCreation.ts        # Form validation
│   ├── suspendUserLogic.ts            # Suspension workflow
│   ├── deleteUserSafety.ts            # Delete confirmation logic
│   ├── bulkOperationValidator.ts      # Bulk action validation
│   └── index.ts
│
├── types/                             # TypeScript types
│   ├── index.ts                       # Main exports
│   ├── user.types.ts                  # User-related types
│   └── api.types.ts                   # API response types
│
├── services/                          # Business services
│   ├── UserService.ts                 # User management service
│   ├── BulkOperationService.ts        # Bulk operations
│   └── index.ts
│
└── pages/                             # Page-level components
    ├── StudentManagementPage.tsx      # /admin/students
    ├── TeacherManagementPage.tsx      # /admin/teachers
    └── index.ts
```

---

## 🎯 PART 5: PAGE SPECIFICATIONS

### 1. Student Management Page

**Route:** `/admin/students`

**Features:**
- ✅ View all student profiles in data table
- ✅ Search by name, email, student ID
- ✅ Filter by role (student), status (active/suspended)
- ✅ Sort by any column
- ✅ Edit student academic data (major, level, mobile, etc.)
- ✅ Toggle student status (Active/Suspended)
- ✅ Delete student account (with confirmation)
- ✅ Bulk operations (suspend/activate multiple students)
- ✅ Export to CSV/Excel

**Columns:**
| Column | Sortable | Filterable | Editable |
|--------|----------|------------|----------|
| Avatar | ❌ | ❌ | ❌ |
| Full Name | ✅ | ✅ | ✅ |
| Email | ✅ | ✅ | ✅ |
| Student ID | ✅ | ✅ | ✅ |
| Major | ✅ | ✅ | ✅ |
| Level/Year | ✅ | ✅ | ✅ |
| Status | ✅ | ✅ | ✅ |
| Created At | ✅ | ✅ | ❌ |
| Actions | ❌ | ❌ | ❌ |

**Actions Menu:**
- Edit Profile
- Toggle Status (Suspend/Activate)
- Delete Account
- View Submissions (link to student's exam results)

---

### 2. Teacher Management Page

**Route:** `/admin/teachers`

**Features:**
- ✅ View all teacher profiles in data table
- ✅ Search by name, email, employee ID
- ✅ Filter by role (teacher), status, department
- ✅ Sort by any column
- ✅ Edit teacher expertise (department, subjects, specialization)
- ✅ Toggle teacher status (Active/Suspended)
- ✅ Delete teacher account (with confirmation)
- ✅ Bulk operations (suspend/activate multiple teachers)
- ✅ Export to CSV/Excel

**Columns:**
| Column | Sortable | Filterable | Editable |
|--------|----------|------------|----------|
| Avatar | ❌ | ❌ | ❌ |
| Full Name | ✅ | ✅ | ✅ |
| Email | ✅ | ✅ | ✅ |
| Employee ID | ✅ | ✅ | ✅ |
| Department | ✅ | ✅ | ✅ |
| Subjects | ✅ | ✅ | ✅ |
| Specialization | ✅ | ✅ | ✅ |
| Status | ✅ | ✅ | ✅ |
| Created At | ✅ | ✅ | ❌ |
| Actions | ❌ | ❌ | ❌ |

**Actions Menu:**
- Edit Profile
- Edit Expertise (department, subjects)
- Toggle Status (Suspend/Activate)
- Delete Account
- View Courses (link to teacher's courses)
- View Performance (link to teacher metrics)

---

## 🔒 PART 6: RBAC & SECURITY

### Permission Guard Component

```typescript
// src/features/admin/components/common/PermissionGuard.tsx
interface PermissionGuardProps {
  requiredRole: 'admin';
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function PermissionGuard({ 
  requiredRole, 
  children, 
  fallback 
}: PermissionGuardProps) {
  const { user } = useAuth();
  const { data: profile } = useQuery({
    queryKey: ['user-profile', user?.id],
    queryFn: async () => {
      const supabase = getSupabaseClient();
      const { data } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user?.id)
        .single();
      return data;
    },
    enabled: !!user,
  });
  
  if (!user) {
    return <Navigate to="/login" />;
  }
  
  if (profile?.role !== requiredRole) {
    return fallback || (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800">Access Denied</h1>
          <p className="text-gray-600 mt-2">You don't have permission to access this page.</p>
          <Button onClick={() => navigate('/')} className="mt-4">
            Go Home
          </Button>
        </div>
      </div>
    );
  }
  
  return <>{children}</>;
}
```

### Route Protection

```typescript
// src/App.tsx or src/routes.tsx
import { PermissionGuard } from './features/admin/components/common/PermissionGuard';

<Route 
  path="/admin/students" 
  element={
    <PermissionGuard requiredRole="admin">
      <StudentManagementPage />
    </PermissionGuard>
  } 
/>
<Route 
  path="/admin/teachers" 
  element={
    <PermissionGuard requiredRole="admin">
      <TeacherManagementPage />
    </PermissionGuard>
  } 
/>
```

---

## ✅ PART 7: IMPLEMENTATION CHECKLIST

### Phase 1: API Layer (Day 1)
- [ ] Create `src/features/admin/api/client.ts` (singleton)
- [ ] Implement `useAdminUsers.ts` hook
- [ ] Implement `useUserActions.ts` hooks
- [ ] Create query and mutation files
- [ ] Test all hooks with Supabase

### Phase 2: Common Components (Day 2)
- [ ] Create `AdminDataTable.tsx`
- [ ] Create `DeleteConfirmationModal.tsx`
- [ ] Create `SuspensionModal.tsx`
- [ ] Create `RoleBadge.tsx`, `StatusBadge.tsx`
- [ ] Create `PermissionGuard.tsx`
- [ ] Create `BulkActionToolbar.tsx`

### Phase 3: Feature Components (Day 3-4)
- [ ] Build Student Management page
- [ ] Build Teacher Management page
- [ ] Create StudentForm and TeacherForm
- [ ] Implement search and filter logic
- [ ] Implement bulk operations

### Phase 4: Testing & Polish (Day 5)
- [ ] Test RBAC access control
- [ ] Test suspension logic
- [ ] Test delete confirmation
- [ ] Test bulk operations
- [ ] Performance optimization
- [ ] Bug fixes

---

## 📊 SUCCESS METRICS

| Metric | Target | Status |
|--------|--------|--------|
| **API Hooks** | 5+ | ⏳ Pending |
| **Components** | 15+ | ⏳ Pending |
| **Type Safety** | 100% | ⏳ Pending |
| **RBAC Coverage** | 100% | ⏳ Pending |
| **Delete Safety** | 100% | ⏳ Pending |
| **Suspension Logic** | 100% | ⏳ Pending |

---

## 🚀 NEXT STEPS

1. ✅ **Review** this blueprint
2. ⏳ **Approve** design with stakeholders
3. ⏳ **Begin Phase 1** (API Layer - Day 1)
4. ⏳ **Execute** 5-day implementation plan
5. ⏳ **Test** all features end-to-end

---

**Blueprint Status:** ✅ Complete  
**Ready for Implementation:** ✅ Yes  
**Timeline:** 5 days  
**Next Action:** Begin Phase 1 (API Layer Foundation)

---

*End of Admin Management System Technical Blueprint*
