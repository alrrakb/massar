# 🚨 PROJECT RESET: EXAM MANAGEMENT SYSTEM

**Project:** Exam Management System (Graduation Project)  
**Date:** 2026-04-16  
**Status:** 🚨 CRITICAL RESET IN PROGRESS  
**Architect:** The Architect

---

## 🎯 MISSION OBJECTIVE

**CRITICAL INSTRUCTION:** This project is for an EXAM MANAGEMENT SYSTEM ONLY. All inventory, perfume, incense, SKU, and stock management code must be PURGED.

**Tasks:**
1. ✅ **The Great Purge** - Delete all inventory-related files and database tables
2. ✅ **Fix Auth Error** - Resolve "Multiple GoTrueClient instances" using Singleton Pattern
3. ✅ **Fix 400 Bad Request** - Fix profile creation (triggers handle it from auth.users)
4. ✅ **Admin Feature Planning** - Plan Student/Teacher management pages

---

## 🗑️ PART 1: THE GREAT PURGE

### Files to Delete

**Documentation (8 files):**
```bash
rm -f ADMIN_DASHBOARD_ARCHITECTURE_DESIGN.md
rm -f ADMIN_DASHBOARD_EXECUTIVE_SUMMARY.md
rm -f ADMIN_DASHBOARD_RECONSTRUCTION_BLUEPRINT.md
rm -f PHASE_2_ARCHITECTURE_SUMMARY.md
rm -f PHASE_2_API_FRONTEND_ARCHITECTURE.md
rm -f PHASE_2_EXECUTION_GUIDE.md
rm -f PHASE_2_SEED_DATA_EXECUTION_CONFIRMATION.md
rm -f database-architecture-analysis.md
```

**Migration (1 file):**
```bash
rm -f migrations/20260416_admin_dashboard_phase2_seed_data.sql
```

**Skills (3 folders):**
```bash
rm -rf .agent/skills/inventory-demand-planning/
rm -rf .windsurf/skills/inventory-demand-planning/
rm -rf .agent/skills/pptx-official/scripts/inventory.py
rm -rf .windsurf/skills/pptx-official/scripts/inventory.py
```

### SQL Purge Script

**Execute this script on your Supabase database:**

```sql
-- See: migrations/20260416_project_reset_inventory_purge.sql
-- This script drops:
-- - 6 tables (inventory_*, admin_*, system_*, teacher_*)
-- - 6 enum types (stock_status, transaction_type, admin_role, etc.)
-- - 5 functions (validate_infinity_stock, update_*_timestamps)
-- - 19 indexes
-- - All RLS policies on dropped tables
```

**Status:** ✅ Script created at `migrations/20260416_project_reset_inventory_purge.sql`

---

## 🔧 PART 2: AUTH ERROR FIXES

### Issue 1: "Multiple GoTrueClient Instances"

**Root Cause:** Multiple files creating separate Supabase client instances

**Solution:** Singleton Pattern

**File:** `src/services/supabase.ts`

```typescript
import { createClient, SupabaseClient } from '@supabase/supabase-js'

// Singleton pattern - only ONE instance created
let supabaseClient: SupabaseClient | null = null

export function getSupabaseClient(): SupabaseClient {
  if (!supabaseClient) {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Missing Supabase environment variables')
    }

    supabaseClient = createClient(supabaseUrl, supabaseAnonKey)
  }
  
  return supabaseClient
}

// Default export for convenience
export const supabase = getSupabaseClient()

// Service role client (separate instance for admin operations)
let serviceClient: SupabaseClient | null = null

export function getServiceClient(): SupabaseClient {
  if (!serviceClient) {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
    const serviceKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY
    
    if (!serviceKey) {
      throw new Error('Service role key not available')
    }
    
    serviceClient = createClient(supabaseUrl, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    })
  }
  
  return serviceClient
}
```

**Usage in adminApi.ts:**
```typescript
import { getSupabaseClient, getServiceClient } from '../../../services/supabase';

export const adminApi = {
  async getUsers() {
    const client = getSupabaseClient(); // Singleton - no duplicate instances
    // ... rest of code
  },
  
  async createUser(userData) {
    const client = getServiceClient(); // Separate singleton for service operations
    // ... rest of code
  }
};
```

---

### Issue 2: 400 Bad Request on POST /profiles

**Root Cause:** Manually inserting into `profiles` table when a trigger should handle it from `auth.users`

**Problem Code:**
```typescript
// ❌ WRONG - Don't manually insert into profiles
await supabase.from('profiles').insert({
  id: userId,
  email: userData.email,
  full_name: userData.name,
  role: 'student',
  // ... other fields
});
```

**Correct Approach:**
```typescript
// ✅ CORRECT - Let trigger handle profile creation from auth.users
// When a user signs up via auth.users, the trigger automatically creates the profile

// If you need to update profile AFTER creation:
export const adminApi = {
  async updateUser(userId: string, userData: Partial<UserProfile>) {
    const client = getServiceClient();
    const { data, error } = await client
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
  }
};
```

**Database Trigger Check:**
```sql
-- Verify triggers exist on profiles table
SELECT 
    trigger_name,
    event_manipulation,
    action_statement
FROM information_schema.triggers
WHERE event_object_table = 'profiles';

-- Expected triggers:
-- - tr_set_student_id (INSERT)
-- - trg_assign_student_id (INSERT)
```

**Required Fields for Profile Creation (via trigger):**
- `id` (from auth.users) - AUTO
- `email` - AUTO from auth.users
- `full_name` - Optional
- `role` - Required (admin/teacher/student)
- `status` - Default: 'active'

**If manually creating a user:**
```typescript
// Step 1: Create user in auth
const { data: authData, error: authError } = await supabase.auth.admin.createUser({
  email: userData.email,
  password: temporaryPassword,
  user_metadata: {
    full_name: userData.full_name,
    role: userData.role
  }
});

// Step 2: Profile is created automatically by trigger
// No need to manually insert into profiles table!
```

---

## 📁 PART 3: ADMIN FEATURE PLANNING

### Folder Structure

```
src/features/admin/
├── README.md                          # Feature overview
├── index.ts                           # Public API exports
│
├── api/                               # Data access layer
│   ├── client.ts                      # Supabase client (singleton)
│   ├── hooks/                         # React Query hooks
│   │   ├── useAdminUsers.ts
│   │   ├── useStudentManagement.ts
│   │   ├── useTeacherManagement.ts
│   │   └── index.ts
│   ├── queries/                       # Raw query functions
│   │   ├── userQueries.ts
│   │   └── index.ts
│   └── mutations/                     # Write operations
│       ├── userMutations.ts
│       └── index.ts
│
├── components/                        # UI components
│   ├── common/                        # Shared components
│   │   ├── UserTable.tsx
│   │   ├── UserForm.tsx
│   │   ├── RoleBadge.tsx
│   │   ├── StatusBadge.tsx
│   │   ├── PermissionGuard.tsx
│   │   └── index.ts
│   │
│   ├── student-management/            # Student Management slice
│   │   ├── StudentList.tsx
│   │   ├── StudentForm.tsx
│   │   ├── StudentActions.tsx
│   │   └── index.ts
│   │
│   └── teacher-management/            # Teacher Management slice
│       ├── TeacherList.tsx
│       ├── TeacherForm.tsx
│       ├── TeacherActions.tsx
│       └── index.ts
│
├── hooks/                             # Feature-specific hooks
│   ├── useRBAC.ts                     # Role-based access control
│   └── index.ts
│
├── logic/                             # Business logic
│   ├── validateUser.ts
│   ├── suspendUser.ts
│   └── index.ts
│
├── types/                             # TypeScript types
│   ├── index.ts
│   └── user.types.ts
│
└── pages/                             # Page-level components
    ├── StudentManagementPage.tsx
    ├── TeacherManagementPage.tsx
    └── index.ts
```

---

### Page Specifications

#### **1. Student Management Page**

**Route:** `/admin/students`

**Features:**
- ✅ View all student profiles (table with search, filter, pagination)
- ✅ Edit student data (name, email, major, level, etc.)
- ✅ Suspend/Activate students (toggle `is_active` or `status`)
- ✅ Delete student accounts (with confirmation)
- ✅ Filter by: Role (student), Status (active/suspended), Search

**RBAC:** Only users with `role = 'admin'` can access

**API Endpoints:**
```typescript
GET /api/admin/students - List all students
GET /api/admin/students/:id - Get student by ID
POST /api/admin/students - Create new student (via auth.users)
PUT /api/admin/students/:id - Update student
DELETE /api/admin/students/:id - Delete student
PATCH /api/admin/students/:id/suspend - Suspend/activate student
```

---

#### **2. Teacher Management Page**

**Route:** `/admin/teachers`

**Features:**
- ✅ View all teacher profiles (table with search, filter, pagination)
- ✅ Edit teacher expertise/department/specialization
- ✅ Suspend/Activate teachers
- ✅ Delete teacher accounts
- ✅ Filter by: Role (teacher), Status, Department, Search

**RBAC:** Only users with `role = 'admin'` can access

**API Endpoints:**
```typescript
GET /api/admin/teachers - List all teachers
GET /api/admin/teachers/:id - Get teacher by ID
POST /api/admin/teachers - Create new teacher (via auth.users)
PUT /api/admin/teachers/:id - Update teacher
DELETE /api/admin/teachers/:id - Delete teacher
PATCH /api/admin/teachers/:id/suspend - Suspend/activate teacher
```

---

#### **3. Permission Guard Component**

**Component:** `PermissionGuard.tsx`

**Purpose:** Protect routes and components from unauthorized access

```typescript
interface PermissionGuardProps {
  requiredRole: 'admin';
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function PermissionGuard({ requiredRole, children, fallback }: PermissionGuardProps) {
  const { user } = useAuth();
  const { hasRole } = useRBAC();
  
  if (!user) {
    return <Navigate to="/login" />;
  }
  
  if (!hasRole(requiredRole)) {
    return fallback || <div>You don't have permission to access this page</div>;
  }
  
  return <>{children}</>;
}
```

**Usage:**
```typescript
<Route 
  path="/admin/students" 
  element={
    <PermissionGuard requiredRole="admin">
      <StudentManagementPage />
    </PermissionGuard>
  } 
/>
```

---

## ✅ EXECUTION CHECKLIST

### Phase 1: Purge (Immediate)
- [ ] Execute SQL purge script on Supabase
- [ ] Delete 8 documentation files
- [ ] Delete 1 migration file
- [ ] Delete 3 skill folders
- [ ] Verify no inventory code remains

### Phase 2: Auth Fixes (Day 1)
- [ ] Refactor `src/services/supabase.ts` to Singleton Pattern
- [ ] Update `adminApi.ts` to use singleton clients
- [ ] Remove manual profile insertion code
- [ ] Test user creation via auth.users only
- [ ] Verify triggers handle profile creation

### Phase 3: Admin Feature (Day 2-3)
- [ ] Create folder structure
- [ ] Implement API layer (client, hooks, mutations)
- [ ] Build Student Management page
- [ ] Build Teacher Management page
- [ ] Implement PermissionGuard component
- [ ] Test RBAC access control

---

## 📊 SUCCESS METRICS

| Metric | Target | Status |
|--------|--------|--------|
| **Inventory Files Deleted** | 12 | ⏳ Pending |
| **Database Tables Dropped** | 6 | ⏳ Pending |
| **Singleton Pattern Implemented** | 100% | ⏳ Pending |
| **Manual Profile Insertion Removed** | 100% | ⏳ Pending |
| **Student Management Page** | Complete | ⏳ Pending |
| **Teacher Management Page** | Complete | ⏳ Pending |
| **RBAC Access Control** | 100% | ⏳ Pending |

---

## 🚨 CRITICAL NOTES

1. **NO INVENTORY CODE** - This is an EXAM MANAGEMENT SYSTEM, not an e-commerce platform
2. **NO MANUAL PROFILE INSERTION** - Let database triggers handle profile creation from `auth.users`
3. **SINGLETON PATTERN** - Only ONE Supabase client instance per environment (anon/service)
4. **RBAC ENFORCEMENT** - All admin routes protected by `PermissionGuard`

---

**Status:** 🚨 **CRITICAL RESET IN PROGRESS**  
**Next Step:** Execute SQL purge script immediately  
**Timeline:** Complete purge within 1 hour

---

*End of Project Reset Document*
