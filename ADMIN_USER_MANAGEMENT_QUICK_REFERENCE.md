# 🚀 ADMIN USER MANAGEMENT - QUICK IMPLEMENTATION REFERENCE

**Project:** Exam Management System  
**Phase:** Day 3-4 - Page Assembly  
**Date:** April 17, 2026  
**Status:** ✅ Ready for Implementation

---

## 📋 QUICK START CHECKLIST

### Prerequisites
- ✅ API Layer (Day 1) - `useAdminUsers`, `useUpdateUserStatus`, `useDeleteUser`
- ✅ UI Components (Day 2) - All 8 components created
- ✅ Database Schema - Profiles table ready

### Files to Create
1. `src/features/admin/pages/StudentManagementPage.tsx`
2. `src/features/admin/pages/TeacherManagementPage.tsx`
3. `src/features/admin/components/common/EditStudentModal.tsx`
4. `src/features/admin/components/common/EditTeacherModal.tsx`

---

## 🎯 STUDENT MANAGEMENT PAGE - CODE TEMPLATE

```tsx
// src/features/admin/pages/StudentManagementPage.tsx
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
import { EditStudentModal } from "../components/common/EditStudentModal";

export function StudentManagementPage() {
  // State
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "suspended">("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  // API
  const { data, isLoading, refetch } = useAdminUsers({
    role: "student",
    status: statusFilter,
    search,
    page: currentPage,
    limit: 20,
  });

  const updateUserStatus = useUpdateUserStatus();
  const deleteUser = useDeleteUser();

  // Handlers
  const handleEdit = (user: any) => {
    setSelectedUser(user);
    setEditModalOpen(true);
  };

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

  // Columns
  const columns = [
    { key: "full_name", label: "Full Name", sortable: true },
    { key: "email", label: "Email", sortable: true },
    { key: "student_id", label: "Student ID", sortable: true },
    {
      key: "status",
      label: "Status",
      render: (row: any) => <UserStatusBadge status={row.status} size="sm" />,
    },
  ];

  return (
    <div className="space-y-6">
      <DashboardStats
        totalStudents={data?.total || 0}
        activeUsers={data?.users?.filter((u: any) => u.status === "active").length || 0}
        suspendedUsers={data?.users?.filter((u: any) => u.status === "suspended").length || 0}
        isLoading={isLoading}
      />

      <SearchFilterBar
        searchValue={search}
        onSearchChange={setSearch}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        resultsCount={data?.total}
      />

      <UserDataTable
        columns={columns}
        data={data?.users || []}
        isLoading={isLoading}
        totalCount={data?.total || 0}
        currentPage={currentPage}
        pageSize={20}
        onRowAction={(action, row) => {
          if (action === "edit") handleEdit(row);
          if (action === "delete") handleDelete(row);
        }}
      />

      <EditStudentModal
        isOpen={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
          setSelectedUser(null);
        }}
        student={selectedUser}
        onSave={async (data) => {
          // Implement save logic
          setEditModalOpen(false);
          setSelectedUser(null);
          refetch();
        }}
      />

      <ConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setSelectedUser(null);
        }}
        onConfirm={handleDeleteConfirm}
        title="Delete Student"
        description={`Delete ${selectedUser?.full_name}?`}
        confirmText={`DELETE_STUDENT_${selectedUser?.full_name || ""}`}
        type="delete"
      />
    </div>
  );
}
```

---

## 👨‍🏫 TEACHER MANAGEMENT PAGE - CODE TEMPLATE

```tsx
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
import { useDeleteUser } from "../api/hooks/useUserActions";

export function TeacherManagementPage() {
  const [search, setSearch] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "suspended">("all");
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const { data, isLoading, refetch } = useAdminUsers({
    role: "teacher",
    status: statusFilter,
    search,
    page: 1,
    limit: 20,
  });

  const deleteUser = useDeleteUser();

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

  const columns = [
    { key: "full_name", label: "Full Name", sortable: true },
    { key: "email", label: "Email", sortable: true },
    { key: "employee_id", label: "Employee ID", sortable: true },
    { key: "department", label: "Department", sortable: true },
    {
      key: "status",
      label: "Status",
      render: (row: any) => <UserStatusBadge status={row.status} size="sm" />,
    },
  ];

  return (
    <div className="space-y-6">
      <DashboardStats
        totalTeachers={data?.total || 0}
        activeUsers={data?.users?.filter((u: any) => u.status === "active").length || 0}
        suspendedUsers={data?.users?.filter((u: any) => u.status === "suspended").length || 0}
        isLoading={isLoading}
      />

      <SearchFilterBar
        searchValue={search}
        onSearchChange={setSearch}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        resultsCount={data?.total}
      />

      <UserDataTable
        columns={columns}
        data={data?.users || []}
        isLoading={isLoading}
        totalCount={data?.total || 0}
        onRowAction={(action, row) => {
          if (action === "delete") handleDelete(row);
        }}
      />

      <ConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setSelectedUser(null);
        }}
        onConfirm={handleDeleteConfirm}
        title="Delete Teacher"
        description={`Delete ${selectedUser?.full_name}?`}
        confirmText={`DELETE_TEACHER_${selectedUser?.full_name || ""}`}
        type="delete"
      />
    </div>
  );
}
```

---

## 📝 EDIT MODAL TEMPLATE

```tsx
// src/features/admin/components/common/EditStudentModal.tsx
"use client";

import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function EditStudentModal({
  isOpen,
  onClose,
  student,
  onSave,
}: {
  isOpen: boolean;
  onClose: () => void;
  student: any;
  onSave: (data: any) => Promise<void>;
}) {
  const [formData, setFormData] = useState({
    full_name: student?.full_name || "",
    email: student?.email || "",
    student_id: student?.student_id || "",
    major: student?.major || "",
    level: student?.level || "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave(formData);
  };

  if (!isOpen || !student) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="fixed inset-y-0 right-0 w-full max-w-2xl bg-white dark:bg-gray-900 p-6 overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Edit Student</h2>
          <button onClick={onClose} className="text-gray-400">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Full Name</Label>
            <Input
              value={formData.full_name}
              onChange={(e) =>
                setFormData({ ...formData, full_name: e.target.value })
              }
              required
            />
          </div>

          <div>
            <Label>Email</Label>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              required
            />
          </div>

          <div>
            <Label>Student ID</Label>
            <Input
              value={formData.student_id}
              onChange={(e) =>
                setFormData({ ...formData, student_id: e.target.value })
              }
              required
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Save Changes</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
```

---

## 🔗 ACTION INTEGRATION PATTERN

```typescript
// In both pages

// Delete Action
const handleDelete = (user: any) => {
  setSelectedUser(user);
  setDeleteModalOpen(true);
};

const handleDeleteConfirm = async () => {
  if (!selectedUser) return;
  
  await deleteUser.mutateAsync(selectedUser.id);
  
  setDeleteModalOpen(false);
  setSelectedUser(null);
  refetch(); // Refresh data
};

// Suspend/Activate Action
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

// In ActionButtons
<ActionButtons
  onEdit={() => handleEdit(row)}
  onToggleStatus={() => handleSuspend(row)}
  currentStatus={row.status}
  onDelete={() => handleDelete(row)}
  isLoading={isLoading}
/>
```

---

## 📊 CSV EXPORT PATTERN

```typescript
const handleExportCSV = async () => {
  const { data: allUsers } = await useAllAdminUsers();
  
  if (!allUsers || allUsers.length === 0) return;

  const headers = ["Full Name", "Email", "Student ID", "Major", "Status"];
  const rows = allUsers.map((user) => [
    `"${user.full_name || ""}"`,
    `"${user.email || ""}"`,
    `"${user.student_id || ""}"`,
    `"${user.major || ""}"`,
    `"${user.status || ""}"`,
  ]);

  const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
  
  const blob = new Blob([csv], { type: "text/csv" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `users_export_${new Date().toISOString().split("T")[0]}.csv`;
  link.click();
};
```

---

## ✅ FINAL CHECKLIST

### Student Page
- [ ] Search & filter working
- [ ] Table displays data
- [ ] Edit modal opens/closes
- [ ] Delete confirmation works
- [ ] CSV export works
- [ ] Loading states show
- [ ] Empty states show

### Teacher Page
- [ ] Department filter works
- [ ] Table displays teacher data
- [ ] Delete confirmation works
- [ ] CSV export works
- [ ] All states handled

### Both Pages
- [ ] RBAC protection in place
- [ ] All actions use mutations
- [ ] Safety-first confirmation
- [ ] Data refreshes after actions
- [ ] Error handling in place

---

**Status:** ✅ Ready to Implement  
**Timeline:** 2 days  
**Next:** Begin Day 3 implementation

---

*End of Quick Implementation Reference*
