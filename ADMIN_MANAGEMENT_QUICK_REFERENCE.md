# ✅ ADMIN MANAGEMENT SYSTEM - QUICK REFERENCE

**Project:** Exam Management System  
**Date:** 2026-04-16  
**Status:** ✅ Blueprint Complete

---

## 🎯 EXECUTIVE SUMMARY

Professional Admin Management System for Exam Management System (Graduation Project) with:
- ✅ Teacher Management (View, Edit, Suspend, Delete)
- ✅ Student Management (View, Edit, Suspend, Delete)
- ✅ High-end Data Tables with sorting, filtering, pagination
- ✅ Safety Delete Confirmation
- ✅ Suspension Logic with middleware
- ✅ RBAC Protection (Admin only)

---

## 📊 DATABASE SCHEMA (Profiles Table)

### Key Columns for Admin Management

| Column | Type | Purpose |
|--------|------|---------|
| `id` | UUID | User identifier (PK) |
| `role` | app_role | **admin | teacher | student** |
| `status` | user_status | **active | suspended** |
| `full_name` | TEXT | User's display name |
| `email` | TEXT | User email |
| `department` | TEXT | Teacher department |
| `subjects` | TEXT | Teacher subjects |
| `major_id` | INTEGER | Student major (FK) |
| `level_id` | INTEGER | Student level (FK) |

---

## 🏗️ API LAYER (5 Hooks)

### 1. `useAdminUsers(filters)`
**Purpose:** Fetch users with pagination and filters  
**Returns:** `{ users, total, page, totalPages }`  
**Filters:** `role`, `status`, `search`, `page`, `limit`

### 2. `useAllAdminUsers(role?)`
**Purpose:** Get all users (no pagination)  
**Returns:** `UserProfile[]`

### 3. `useUpdateUserStatus()`
**Purpose:** Toggle active/suspended status  
**Input:** `{ userId, status }`

### 4. `useUpdateUserProfile()`
**Purpose:** Update user profile data  
**Input:** `{ userId, userData }`

### 5. `useDeleteUser()`
**Purpose:** Permanently delete user  
**Input:** `userId`  
**Safety:** Requires confirmation code

### 6. `useBulkSuspendUsers()`
**Purpose:** Bulk suspend/activate users  
**Input:** `{ userIds[], status }`

---

## 🎨 UI/UX STRATEGY

### Data Table Features
- ✅ Sorting (clickable headers)
- ✅ Filtering (role, status, search)
- ✅ Pagination (server-side)
- ✅ Row selection (checkboxes)
- ✅ Export to CSV/Excel
- ✅ Responsive design

### Suspension Logic
```typescript
// Middleware check on every auth
if (profile.status === 'suspended') {
  // Log out user and show suspension message
  return { authenticated: false, error: 'Account suspended' };
}
```

**Flow:**
1. Admin toggles status → 'suspended'
2. User session valid until token expires (1 hour)
3. Next auth check detects suspended status
4. User logged out with suspension message
5. Cannot re-login until reactivated

### Safety Delete Confirmation
```typescript
// User must type exact code to confirm
DELETE_TEACHER_John_Doe
DELETE_STUDENT_Jane_Smith

// Visual feedback: Button pulses when code is correct
// Warning: Shows all consequences before delete
```

---

## 📁 FSD FOLDER MANIFEST

```
src/features/admin/
├── api/
│   ├── client.ts              # Singleton Supabase client
│   ├── hooks/
│   │   ├── useAdminUsers.ts   # Fetch users
│   │   ├── useUserActions.ts  # CRUD mutations
│   │   └── useBulkActions.ts  # Bulk operations
│   ├── queries/
│   │   └── userQueries.ts
│   └── mutations/
│       └── userMutations.ts
│
├── components/
│   ├── common/
│   │   ├── AdminDataTable.tsx
│   │   ├── UserForm.tsx
│   │   ├── DeleteConfirmationModal.tsx
│   │   ├── SuspensionModal.tsx
│   │   ├── RoleBadge.tsx
│   │   ├── StatusBadge.tsx
│   │   ├── PermissionGuard.tsx
│   │   ├── BulkActionToolbar.tsx
│   │   └── UserSearchFilter.tsx
│   │
│   ├── student-management/
│   │   ├── StudentList.tsx
│   │   ├── StudentForm.tsx
│   │   ├── StudentActions.tsx
│   │   ├── StudentBulkActions.tsx
│   │   └── AcademicDataPanel.tsx
│   │
│   └── teacher-management/
│       ├── TeacherList.tsx
│       ├── TeacherForm.tsx
│       ├── TeacherActions.tsx
│       ├── TeacherBulkActions.tsx
│       └── ExpertisePanel.tsx
│
├── hooks/
│   ├── useRBAC.ts
│   ├── useUserSelection.ts
│   └── useExportUsers.ts
│
├── logic/
│   ├── validateUserCreation.ts
│   ├── suspendUserLogic.ts
│   ├── deleteUserSafety.ts
│   └── bulkOperationValidator.ts
│
├── types/
│   ├── user.types.ts
│   └── api.types.ts
│
├── services/
│   ├── UserService.ts
│   └── BulkOperationService.ts
│
└── pages/
    ├── StudentManagementPage.tsx  # /admin/students
    └── TeacherManagementPage.tsx  # /admin/teachers
```

---

## 🎯 PAGE SPECIFICATIONS

### Student Management Page (`/admin/students`)

**Features:**
- View all students in data table
- Search by name, email, student ID
- Filter by status (active/suspended)
- Edit academic data (major, level, mobile)
- Toggle status (Active/Suspended)
- Delete account (with confirmation)
- Bulk suspend/activate
- Export to CSV

**Columns:**
- Avatar, Full Name, Email, Student ID
- Major, Level/Year, Status, Created At
- Actions (Edit, Toggle Status, Delete)

---

### Teacher Management Page (`/admin/teachers`)

**Features:**
- View all teachers in data table
- Search by name, email, employee ID
- Filter by status, department
- Edit expertise (department, subjects, specialization)
- Toggle status (Active/Suspended)
- Delete account (with confirmation)
- Bulk suspend/activate
- Export to CSV

**Columns:**
- Avatar, Full Name, Email, Employee ID
- Department, Subjects, Specialization
- Status, Created At, Actions

---

## 🔒 RBAC & SECURITY

### Permission Guard
```typescript
<PermissionGuard requiredRole="admin">
  <StudentManagementPage />
</PermissionGuard>
```

**Protection:**
- Only `role = 'admin'` can access admin pages
- Unauthorized users see "Access Denied" page
- All API calls use service client (admin privileges)

### Delete Safety
- Requires exact confirmation code
- Shows all consequences before delete
- Cannot be undone
- Logs deletion in audit trail (future feature)

---

## ✅ IMPLEMENTATION TIMELINE

| Phase | Day | Deliverables |
|-------|-----|--------------|
| **API Layer** | 1 | 5 hooks, queries, mutations |
| **Common Components** | 2 | 9 shared components |
| **Feature Components** | 3-4 | Student & Teacher pages |
| **Testing & Polish** | 5 | E2E testing, bug fixes |

**Total:** 5 days

---

## 📊 SUCCESS METRICS

| Metric | Target |
|--------|--------|
| API Hooks | 5+ |
| Components | 15+ |
| Type Safety | 100% |
| RBAC Coverage | 100% |
| Delete Safety | 100% |
| Suspension Logic | 100% |

---

## 🚀 NEXT STEPS

1. ✅ Review blueprint
2. ⏳ Approve design
3. ⏳ Begin Phase 1 (Day 1: API Layer)
4. ⏳ Execute 5-day plan
5. ⏳ Test and deploy

---

**Status:** ✅ Blueprint Complete  
**Ready for:** Implementation  
**Timeline:** 5 days

---

*End of Quick Reference*
