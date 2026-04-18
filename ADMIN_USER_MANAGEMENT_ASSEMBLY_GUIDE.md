# 🏗️ ADMIN USER MANAGEMENT - ASSEMBLY GUIDE

**Project:** Exam Management System (Graduation Project)  
**Phase:** Day 3-4 - Page Assembly & Integration  
**Date:** April 17, 2026  
**Status:** ✅ Assembly Blueprint Ready  
**Architect:** The Architect

---

## 📊 EXECUTIVE SUMMARY

This guide provides the **complete assembly blueprint** for integrating the API layer (Day 1) and UI components (Day 2) into production-ready Student and Teacher Management pages.

**Key Deliverables:**
- ✅ Student Management Page with full CRUD flow
- ✅ Teacher Management Page with department filtering
- ✅ Edit/Suspend/Delete action integration
- ✅ CSV export functionality
- ✅ State management patterns for modals
- ✅ Safety-first confirmation logic

**Timeline:** 2 days (Day 3-4)

---

## 🎯 PART 1: STUDENT MANAGEMENT PAGE

### Page Structure

**Route:** `/admin/students`  
**Layout:** Full-width admin layout with sidebar  
**Component Hierarchy:**

```
StudentManagementPage
├── DashboardStats (overview)
├── SearchFilterBar (search & filters)
├── UserDataTable (main table)
├── EditStudentModal (slide-over drawer)
└── ConfirmationModal (delete/suspend)
```

### State Management

```typescript
// src/features/admin/pages/StudentManagementPage.tsx
"use client";

import { useState, useMemo } from "react";
import {
  UserDataTable,
  UserStatusBadge,
  ActionButtons,
  SearchFilterBar,
  ConfirmationModal,
  DashboardStats,
} from "../components/common";
import { useAdminUsers } from "../api/hooks/useAdminUsers";
import { useUpdateUserStatus, useDeleteUser } from "../api/hooks/useUserActions";

export function StudentManagementPage() {
  // Search & Filter State
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | "student">("student");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "suspended">("all");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 20;

  // Selection State
  const [selectedRows, setSelectedRows] = useState<string[]>([]);

  // Modal State
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [suspendModalOpen, setSuspendModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);

  // API Hooks
  const { data, isLoading, refetch } = useAdminUsers({
    role: roleFilter,
    status: statusFilter,
    search,
    page: currentPage,
    limit: pageSize,
  });

  const updateUserStatus = useUpdateUserStatus();
  const deleteUser = useDeleteUser();

  // Derived State
  const totalStudents = data?.total || 0;
  const activeUsers = data?.users?.filter((u: any) => u.status === "active").length || 0;
  const suspendedUsers = data?.users?.filter((u: any) => u.status === "suspended").length || 0;

  // Handlers
  const handleEdit = (user: any) => {
    setSelectedUser(user);
    setEditModalOpen(true);
  };

  const handleDelete = (user: any) => {
    setSelectedUser(user);
    setDeleteModalOpen(true);
  };

  const handleSuspend = (user: any) => {
    setSelectedUser(user);
    setSuspendModalOpen(true);
  };

  const handleStatusToggle = async () => {
    if (!selectedUser) return;
    
    const newStatus = selectedUser.status === "active" ? "suspended" : "active";
    
    await updateUserStatus.mutateAsync({
      userId: selectedUser.id,
      status: newStatus,
    });
    
    setSuspendModalOpen(false);
    setSelectedUser(null);
    refetch();
  };

  const handleDeleteConfirm = async () => {
    if (!selectedUser) return;
    
    await deleteUser.mutateAsync(selectedUser.id);
    
    setDeleteModalOpen(false);
    setSelectedUser(null);
    refetch();
  };

  // Columns Definition
  const columns = [
    {
      key: "full_name" as const,
      label: "Full Name",
      sortable: true,
    },
    {
      key: "email" as const,
      label: "Email",
      sortable: true,
    },
    {
      key: "student_id" as const,
      label: "Student ID",
      sortable: true,
    },
    {
      key: "major" as const,
      label: "Major",
      sortable: true,
      render: (row: any) => row.major || "N/A",
    },
    {
      key: "level" as const,
      label: "Academic Level",
      sortable: true,
      render: (row: any) => row.level || "N/A",
    },
    {
      key: "status" as const,
      label: "Status",
      sortable: true,
      render: (row: any) => (
        <UserStatusBadge status={row.status} size="sm" />
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <DashboardStats
        totalStudents={totalStudents}
        activeUsers={activeUsers}
        suspendedUsers={suspendedUsers}
        isLoading={isLoading}
      />

      {/* Search & Filters */}
      <SearchFilterBar
        searchValue={search}
        onSearchChange={setSearch}
        roleFilter={roleFilter}
        onRoleFilterChange={setRoleFilter}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        resultsCount={totalStudents}
      />

      {/* Data Table */}
      <UserDataTable
        columns={columns}
        data={data?.users || []}
        isLoading={isLoading}
        totalCount={totalStudents}
        currentPage={currentPage}
        pageSize={pageSize}
        onSort={(column, direction) => {
          console.log(`Sorting ${column} ${direction}`);
          // Implement sorting logic here
        }}
        onRowSelect={setSelectedRows}
        onRowAction={(action, row) => {
          switch (action) {
            case "edit":
              handleEdit(row);
              break;
            case "suspend":
              handleSuspend(row);
              break;
            case "delete":
              handleDelete(row);
              break;
          }
        }}
        onExport={handleExportCSV}
      />

      {/* Edit Student Modal (Slide-Over Drawer) */}
      <EditStudentModal
        isOpen={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
          setSelectedUser(null);
        }}
        student={selectedUser}
        onSave={handleSaveStudent}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setSelectedUser(null);
        }}
        onConfirm={handleDeleteConfirm}
        title="Delete Student"
        description={`Are you sure you want to delete ${selectedUser?.full_name}? This action cannot be undone.`}
        confirmText={`DELETE_STUDENT_${selectedUser?.full_name || ""}`}
        type="delete"
      />

      {/* Suspend Confirmation Modal */}
      <ConfirmationModal
        isOpen={suspendModalOpen}
        onClose={() => {
          setSuspendModalOpen(false);
          setSelectedUser(null);
        }}
        onConfirm={handleStatusToggle}
        title={selectedUser?.status === "active" ? "Suspend Student" : "Activate Student"}
        description={
          selectedUser?.status === "active"
            ? `Are you sure you want to suspend ${selectedUser?.full_name}? They will lose access to the system.`
            : `Are you sure you want to activate ${selectedUser?.full_name}? They will regain access to the system.`
        }
        confirmText={
          selectedUser?.status === "active"
            ? `SUSPEND_${selectedUser?.full_name || ""}`
            : `ACTIVATE_${selectedUser?.full_name || ""}`
        }
        type="suspend"
      />
    </div>
  );
}
```

---

### Edit Student Modal (Slide-Over Drawer)

**Why Slide-Over Drawer?**
- ✅ Better for complex forms with many fields
- ✅ Shows context (user can see the table behind)
- ✅ Easier to scan all fields
- ✅ Better mobile experience than modal

**Implementation:**

```tsx
// src/features/admin/components/common/EditStudentModal.tsx
"use client";

import { cn } from "@/lib/utils";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEffect, useState } from "react";

export interface EditStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: any;
  onSave: (data: any) => void;
}

export function EditStudentModal({
  isOpen,
  onClose,
  student,
  onSave,
}: EditStudentModalProps) {
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    student_id: "",
    major: "",
    level: "",
    mobile: "",
    department: "",
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (student) {
      setFormData({
        full_name: student.full_name || "",
        email: student.email || "",
        student_id: student.student_id || "",
        major: student.major || "",
        level: student.level || "",
        mobile: student.mobile || "",
        department: student.department || "",
      });
    }
  }, [student]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error("Failed to save student:", error);
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen || !student) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Slide-Over Drawer */}
      <div className="fixed inset-y-0 right-0 flex max-w-full pl-10">
        <div
          className={cn(
            "w-screen max-w-2xl transform transition-transform",
            "bg-white dark:bg-gray-900",
            "shadow-xl",
            "overflow-y-auto"
          )}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              Edit Student
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              aria-label="Close modal"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Personal Information */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
                Personal Information
              </h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="full_name">Full Name</Label>
                  <Input
                    id="full_name"
                    value={formData.full_name}
                    onChange={(e) =>
                      setFormData({ ...formData, full_name: e.target.value })
                    }
                    required
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    required
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="mobile">Mobile Number</Label>
                  <Input
                    id="mobile"
                    value={formData.mobile}
                    onChange={(e) =>
                      setFormData({ ...formData, mobile: e.target.value })
                    }
                    className="mt-1"
                  />
                </div>
              </div>
            </div>

            {/* Academic Information */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
                Academic Information
              </h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="student_id">Student ID</Label>
                  <Input
                    id="student_id"
                    value={formData.student_id}
                    onChange={(e) =>
                      setFormData({ ...formData, student_id: e.target.value })
                    }
                    required
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="major">Major</Label>
                  <Input
                    id="major"
                    value={formData.major}
                    onChange={(e) =>
                      setFormData({ ...formData, major: e.target.value })
                    }
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="level">Academic Level</Label>
                  <Input
                    id="level"
                    value={formData.level}
                    onChange={(e) =>
                      setFormData({ ...formData, level: e.target.value })
                    }
                    className="mt-1"
                  />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-200 dark:border-gray-800">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
```

---

### CSV Export Implementation

```typescript
// src/features/admin/pages/StudentManagementPage.tsx (continued)

import { useAllAdminUsers } from "../api/hooks/useAdminUsers";

const handleExportCSV = async () => {
  // Fetch ALL students (not just paginated)
  const { data: allStudents } = useAllAdminUsers();
  
  if (!allStudents || allStudents.length === 0) {
    console.warn("No students to export");
    return;
  }

  // Define CSV headers
  const headers = [
    "Full Name",
    "Email",
    "Student ID",
    "Major",
    "Academic Level",
    "Status",
    "Mobile",
    "Created At",
  ];

  // Convert data to CSV rows
  const rows = allStudents.map((student) => [
    `"${student.full_name || ""}"`,
    `"${student.email || ""}"`,
    `"${student.student_id || ""}"`,
    `"${student.major || ""}"`,
    `"${student.level || ""}"`,
    `"${student.status || ""}"`,
    `"${student.mobile || ""}"`,
    `"${new Date(student.created_at).toLocaleDateString()}"`,
  ]);

  // Combine headers and rows
  const csvContent = [
    headers.join(","),
    ...rows.map((row) => row.join(",")),
  ].join("\n");

  // Create download link
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  
  link.setAttribute("href", url);
  link.setAttribute(
    "download",
    `students_export_${new Date().toISOString().split("T")[0]}.csv`
  );
  link.style.visibility = "hidden";
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
```

---

## 👨‍🏫 PART 2: TEACHER MANAGEMENT PAGE

### Page Structure

**Route:** `/admin/teachers`  
**Special Features:** Department filtering, specialization display

### State Management

```typescript
// src/features/admin/pages/TeacherManagementPage.tsx
"use client";

import { useState } from "react";
import {
  UserDataTable,
  UserStatusBadge,
  ActionButtons,
  SearchFilterBar,
  ConfirmationModal,
  DashboardStats,
} from "../components/common";
import { useAdminUsers } from "../api/hooks/useAdminUsers";
import { useUpdateUserStatus, useDeleteUser } from "../api/hooks/useUserActions";

export function TeacherManagementPage() {
  // Search & Filter State
  const [search, setSearch] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "suspended">("all");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 20;

  // Modal State
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);

  // API Hooks
  const { data, isLoading, refetch } = useAdminUsers({
    role: "teacher",
    status: statusFilter,
    search,
    page: currentPage,
    limit: pageSize,
  });

  const deleteUser = useDeleteUser();

  // Available Departments (from majors or hardcoded)
  const departments = [
    "all",
    "Computer Science",
    "Information Technology",
    "Software Engineering",
    "Data Science",
    "Artificial Intelligence",
  ];

  // Handlers
  const handleDelete = (user: any) => {
    setSelectedUser(user);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedUser) return;
    
    await deleteUser.mutateAsync(selectedUser.id);
    
    setDeleteModalOpen(false);
    setSelectedUser(null);
    refetch();
  };

  // Columns Definition (Teacher-Specific)
  const columns = [
    {
      key: "full_name" as const,
      label: "Full Name",
      sortable: true,
    },
    {
      key: "email" as const,
      label: "Email",
      sortable: true,
    },
    {
      key: "employee_id" as const,
      label: "Employee ID",
      sortable: true,
    },
    {
      key: "department" as const,
      label: "Department",
      sortable: true,
      render: (row: any) => row.department || "N/A",
    },
    {
      key: "specialization" as const,
      label: "Specialization",
      sortable: true,
      render: (row: any) => row.specialization || "N/A",
    },
    {
      key: "subjects" as const,
      label: "Subjects Taught",
      sortable: false,
      render: (row: any) => (
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {row.subjects ? row.subjects.split(",").length : 0} subjects
        </span>
      ),
    },
    {
      key: "status" as const,
      label: "Status",
      sortable: true,
      render: (row: any) => (
        <UserStatusBadge status={row.status} size="sm" />
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <DashboardStats
        totalTeachers={data?.total || 0}
        activeUsers={data?.users?.filter((u: any) => u.status === "active").length || 0}
        suspendedUsers={data?.users?.filter((u: any) => u.status === "suspended").length || 0}
        isLoading={isLoading}
      />

      {/* Search & Filters */}
      <SearchFilterBar
        searchValue={search}
        onSearchChange={setSearch}
        roleFilter="all" // Teachers only
        onRoleFilterChange={() => {}}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        resultsCount={data?.total}
      />

      {/* Department Filter */}
      <div className="flex items-center gap-4">
        <Label htmlFor="department">Department</Label>
        <Select
          value={departmentFilter}
          onValueChange={setDepartmentFilter}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="All Departments" />
          </SelectTrigger>
          <SelectContent>
            {departments.map((dept) => (
              <SelectItem key={dept} value={dept}>
                {dept === "all" ? "All Departments" : dept}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Data Table */}
      <UserDataTable
        columns={columns}
        data={data?.users || []}
        isLoading={isLoading}
        totalCount={data?.total || 0}
        currentPage={currentPage}
        pageSize={pageSize}
        onRowAction={(action, row) => {
          if (action === "delete") {
            setSelectedUser(row);
            setDeleteModalOpen(true);
          }
        }}
        onExport={handleExportCSV}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setSelectedUser(null);
        }}
        onConfirm={handleDeleteConfirm}
        title="Delete Teacher"
        description={`Are you sure you want to delete ${selectedUser?.full_name}? This will remove all their courses and exams.`}
        confirmText={`DELETE_TEACHER_${selectedUser?.full_name || ""}`}
        type="delete"
      />
    </div>
  );
}
```

---

### Department Filter Logic

```typescript
// Filter teachers by department
const filteredTeachers = useMemo(() => {
  if (departmentFilter === "all") {
    return data?.users || [];
  }
  
  return (data?.users || []).filter(
    (teacher: any) => teacher.department === departmentFilter
  );
}, [data?.users, departmentFilter]);

// Apply to table
<UserDataTable
  data={filteredTeachers}
  // ... other props
/>
```

---

## 🔗 PART 3: ACTION INTEGRATION

### Linking ActionButtons to Mutations

```typescript
// In both StudentManagementPage and TeacherManagementPage

// Suspend/Activate Handler
const handleSuspend = (user: any) => {
  setSelectedUser(user);
  setSuspendModalOpen(true);
};

const handleStatusToggle = async () => {
  if (!selectedUser) return;
  
  const newStatus = selectedUser.status === "active" ? "suspended" : "active";
  
  await updateUserStatus.mutateAsync({
    userId: selectedUser.id,
    status: newStatus,
  });
  
  // Close modal and refresh data
  setSuspendModalOpen(false);
  setSelectedUser(null);
  refetch();
};

// Delete Handler
const handleDelete = (user: any) => {
  setSelectedUser(user);
  setDeleteModalOpen(true);
};

const handleDeleteConfirm = async () => {
  if (!selectedUser) return;
  
  await deleteUser.mutateAsync(selectedUser.id);
  
  setDeleteModalOpen(false);
  setSelectedUser(null);
  refetch();
};
```

### ActionButtons Integration

```tsx
// In UserDataTable columns
{
  key: "actions" as const,
  label: "Actions",
  render: (row: any) => (
    <ActionButtons
      onEdit={() => handleEdit(row)}
      onToggleStatus={() => handleSuspend(row)}
      currentStatus={row.status}
      onDelete={() => handleDelete(row)}
      isLoading={isLoading}
    />
  ),
}
```

---

## 🛡️ PART 4: SAFETY-FIRST CONFIRMATION LOGIC

### Confirmation Modal Types

```typescript
// Type definitions
type ConfirmationType = "delete" | "suspend" | "warning";

interface ConfirmationConfig {
  type: ConfirmationType;
  title: string;
  description: string;
  confirmText: string;
  iconColor: string;
  buttonColor: string;
}

// Configuration for each action
const confirmationConfigs: Record<ConfirmationType, ConfirmationConfig> = {
  delete: {
    type: "delete",
    title: "Delete User",
    description: "This action cannot be undone.",
    confirmText: "DELETE_USER_NAME",
    iconColor: "text-red-600",
    buttonColor: "bg-red-600",
  },
  suspend: {
    type: "suspend",
    title: "Suspend User",
    description: "User will lose access to the system.",
    confirmText: "SUSPEND_USER_NAME",
    iconColor: "text-orange-600",
    buttonColor: "bg-orange-600",
  },
  warning: {
    type: "warning",
    title: "Warning",
    description: "Proceed with caution.",
    confirmText: "CONFIRM_ACTION",
    iconColor: "text-yellow-600",
    buttonColor: "bg-yellow-600",
  },
};
```

### Safety Checks

```typescript
// Before any destructive action
const performSafeAction = async (
  action: "delete" | "suspend",
  user: any,
  callback: () => Promise<void>
) => {
  // Check 1: User is selected
  if (!user) {
    console.error("No user selected");
    return;
  }

  // Check 2: Action is not already in progress
  if (isLoading) {
    console.warn("Action already in progress");
    return;
  }

  // Check 3: Confirmation modal is open
  if (!isModalOpen) {
    console.error("Confirmation modal not open");
    return;
  }

  // Execute action
  try {
    await callback();
    console.log("Action completed successfully");
  } catch (error) {
    console.error("Action failed:", error);
    // Handle error (show toast, etc.)
  }
};
```

---

## 📦 PART 5: STATE MANAGEMENT PATTERNS

### Selected User Pattern

```typescript
// Centralized state for selected user
const [selectedUser, setSelectedUser] = useState<any>(null);

// Clear selected user after action
const clearSelectedUser = () => {
  setSelectedUser(null);
};

// Use in all modals
<EditStudentModal
  isOpen={editModalOpen}
  student={selectedUser}
  onClose={() => {
    setEditModalOpen(false);
    clearSelectedUser();
  }}
/>
```

### Modal State Pattern

```typescript
// Separate state for each modal
const [editModalOpen, setEditModalOpen] = useState(false);
const [deleteModalOpen, setDeleteModalOpen] = useState(false);
const [suspendModalOpen, setSuspendModalOpen] = useState(false);

// Helper to close all modals
const closeAllModals = () => {
  setEditModalOpen(false);
  setDeleteModalOpen(false);
  setSuspendModalOpen(false);
  setSelectedUser(null);
};
```

### Data Fetching Pattern

```typescript
// Use refetch after mutations
const { data, isLoading, refetch } = useAdminUsers({ ... });

const handleSave = async () => {
  await mutation.mutateAsync(data);
  refetch(); // Refresh data after mutation
};
```

---

## ✅ PART 6: IMPLEMENTATION CHECKLIST

### Day 3 Tasks

**Morning (9:00 - 12:00):**
- [ ] Create StudentManagementPage.tsx
- [ ] Implement state management
- [ ] Integrate UserDataTable
- [ ] Implement SearchFilterBar
- [ ] Create EditStudentModal (slide-over)

**Afternoon (13:00 - 17:00):**
- [ ] Implement delete/suspend actions
- [ ] Create ConfirmationModal integration
- [ ] Implement CSV export
- [ ] Test all flows

### Day 4 Tasks

**Morning (9:00 - 12:00):**
- [ ] Create TeacherManagementPage.tsx
- [ ] Implement department filter
- [ ] Add teacher-specific columns
- [ ] Integrate actions

**Afternoon (13:00 - 17:00):**
- [ ] Test both pages
- [ ] Fix bugs
- [ ] Performance optimization
- [ ] Final testing

---

## 🎯 SUCCESS METRICS

| Metric | Target | Status |
|--------|--------|--------|
| Student Page Complete | 100% | ⏳ Pending |
| Teacher Page Complete | 100% | ⏳ Pending |
| All Actions Working | 100% | ⏳ Pending |
| CSV Export Working | 100% | ⏳ Pending |
| Safety First Logic | 100% | ⏳ Pending |
| State Management | Clean | ⏳ Pending |

---

## 🚀 NEXT STEPS

1. ✅ **Review Assembly Guide**
2. ⏳ **Begin Day 3** (Student Page)
3. ⏳ **Complete Student Page**
4. ⏳ **Begin Day 4** (Teacher Page)
5. ⏳ **Complete Teacher Page**
6. ⏳ **Final Testing**

---

**Blueprint Status:** ✅ Complete  
**Ready for Implementation:** ✅ Yes  
**Timeline:** 2 days (Day 3-4)  
**Next Action:** Begin Student Management Page

---

*End of Assembly Guide*
