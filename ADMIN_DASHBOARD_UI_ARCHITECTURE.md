# 🎨 ADMIN DASHBOARD UI ARCHITECTURE - DAY 2

**Project:** Exam Management System (Graduation Project)  
**Phase:** Day 2 - UI Architecture & Shared Components  
**Date:** 2026-04-16  
**Status:** ✅ Design Complete - Ready for Implementation  
**Architect:** The Architect

---

## 📊 EXECUTIVE SUMMARY

Day 2 focuses on building the **UI foundation** for the Admin Dashboard with:
- ✅ 8+ reusable shared components
- ✅ Professional data table with sorting & filtering
- ✅ Dashboard overview with data storytelling
- ✅ Permission guard implementation
- ✅ Admin-specific layout & navigation

**Timeline:** 1 day (Day 2)  
**Deliverables:** 8 components, 1 layout, 1 guard, 1 dashboard page

---

## 🎨 PART 1: SHARED ADMIN COMPONENTS MANIFEST

### Folder Structure
```
src/features/admin/components/common/
├── UserDataTable.tsx          # Professional data table
├── UserStatusBadge.tsx        # Status indicator
├── ActionButtons.tsx          # Edit/Suspend/Delete actions
├── SearchFilterBar.tsx        # Search & filter controls
├── Pagination.tsx             # Page navigation
├── BulkActionToolbar.tsx      # Bulk operations toolbar
├── ConfirmationModal.tsx      # Delete/suspend confirmation
├── LoadingSpinner.tsx         # Loading states
└── index.ts                   # Barrel exports
```

---

### 1. UserDataTable Component

**Purpose:** Professional, sortable, filterable data table for user management

**Features:**
- ✅ Column sorting (click headers)
- ✅ Row selection (checkboxes)
- ✅ Status indicators in cells
- ✅ Action menu per row
- ✅ Responsive design
- ✅ Loading skeleton states
- ✅ Empty state handling
- ✅ Export to CSV button

**Props Interface:**
```typescript
interface UserDataTableProps<T extends { id: string }> {
  columns: TableColumn<T>[];
  data: T[];
  isLoading?: boolean;
  totalCount?: number;
  currentPage?: number;
  pageSize?: number;
  onSort?: (column: string, direction: 'asc' | 'desc') => void;
  onRowSelect?: (rowIds: string[]) => void;
  onRowAction?: (action: 'edit' | 'suspend' | 'delete', row: T) => void;
  onExport?: () => void;
  emptyMessage?: string;
  actionsColumn?: boolean;
}
```

**Component Design:**
```tsx
// src/features/admin/components/common/UserDataTable.tsx
"use client";

import { cn } from "@/lib/utils";
import { ChevronUp, ChevronDown, MoreHorizontal, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface TableColumn<T> {
  key: keyof T | "actions";
  label: string;
  sortable?: boolean;
  render?: (row: T) => React.ReactNode;
}

export function UserDataTable<T extends { id: string }>({
  columns,
  data,
  isLoading = false,
  totalCount = 0,
  currentPage = 1,
  pageSize = 20,
  onSort,
  onRowSelect,
  onRowAction,
  onExport,
  emptyMessage = "No data available",
  actionsColumn = true,
}: UserDataTableProps<T>) {
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: "asc" | "desc";
  } | null>(null);

  const handleSort = (key: string) => {
    const direction =
      sortConfig?.key === key && sortConfig.direction === "asc"
        ? "desc"
        : "asc";
    setSortConfig({ key, direction });
    onSort?.(key, direction);
  };

  if (isLoading) {
    return <DataTableSkeleton columns={columns.length} />;
  }

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-gray-500">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="text-sm text-gray-600">
          Showing {Math.min((currentPage - 1) * pageSize + 1, totalCount)} -{" "}
          {Math.min(currentPage * pageSize, totalCount)} of {totalCount} users
        </div>
        {onExport && (
          <Button variant="outline" size="sm" onClick={onExport}>
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              {actionsColumn && (
                <th className="w-12 p-4">
                  <Checkbox
                    onChange={(checked) => {
                      const allIds = data.map((row) => row.id);
                      onRowSelect?.(checked ? allIds : []);
                    }}
                  />
                </th>
              )}
              {columns.map((column) => (
                <th
                  key={String(column.key)}
                  className={cn(
                    "p-4 text-left text-sm font-semibold text-gray-700",
                    column.sortable && "cursor-pointer hover:bg-gray-100"
                  )}
                  onClick={() => column.sortable && handleSort(String(column.key))}
                >
                  <div className="flex items-center gap-2">
                    {column.label}
                    {column.sortable && (
                      <span className="text-gray-400">
                        {sortConfig?.key === String(column.key) &&
                        sortConfig.direction === "asc" ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : sortConfig?.key === String(column.key) ? (
                          <ChevronDown className="w-4 h-4" />
                        ) : (
                          <ChevronUp className="w-4 h-4 opacity-30" />
                        )}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((row) => (
              <tr
                key={row.id}
                className="hover:bg-gray-50 transition-colors"
              >
                {actionsColumn && (
                  <td className="p-4">
                    <Checkbox
                      onChange={(checked) => {
                        onRowSelect?.(
                          checked
                            ? [...(onRowSelect?.([]) || []), row.id]
                            : (onRowSelect?.([]) || []).filter((id) => id !== row.id)
                        );
                      }}
                    />
                  </td>
                )}
                {columns.map((column) => (
                  <td key={String(column.key)} className="p-4 text-sm">
                    {column.render ? column.render(row) : String(row[column.key])}
                  </td>
                ))}
                {actionsColumn && (
                  <td className="p-4">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onRowAction?.("edit", row)}>
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onRowAction?.("suspend", row)}>
                          {row.status === "active" ? "Suspend" : "Activate"}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => onRowAction?.("delete", row)}
                        >
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={Math.ceil(totalCount / pageSize)}
        onPageChange={(page) => {/* handle page change */}}
      />
    </div>
  );
}
```

---

### 2. UserStatusBadge Component

**Purpose:** Visual indicator for user status (Active/Suspended)

**Design:**
- ✅ Color-coded badges
- ✅ Icon indicators
- ✅ Tooltip on hover
- ✅ Accessible (ARIA labels)

**Props Interface:**
```typescript
interface UserStatusBadgeProps {
  status: "active" | "suspended" | "inactive";
  size?: "sm" | "md" | "lg";
  showTooltip?: boolean;
}
```

**Component Design:**
```tsx
// src/features/admin/components/common/UserStatusBadge.tsx
import { cn } from "@/lib/utils";
import { CheckCircle2, XCircle } from "lucide-react";

export function UserStatusBadge({
  status,
  size = "md",
  showTooltip = true,
}: UserStatusBadgeProps) {
  const styles = {
    active: {
      bg: "bg-green-100",
      text: "text-green-800",
      border: "border-green-200",
      icon: CheckCircle2,
      label: "Active",
    },
    suspended: {
      bg: "bg-red-100",
      text: "text-red-800",
      border: "border-red-200",
      icon: XCircle,
      label: "Suspended",
    },
    inactive: {
      bg: "bg-gray-100",
      text: "text-gray-800",
      border: "border-gray-200",
      icon: XCircle,
      label: "Inactive",
    },
  };

  const sizeStyles = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-2.5 py-0.5 text-sm",
    lg: "px-3 py-1 text-base",
  };

  const StatusIcon = styles[status].icon;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border font-medium",
        styles[status].bg,
        styles[status].text,
        styles[status].border,
        sizeStyles[size]
      )}
      title={showTooltip ? styles[status].label : undefined}
      role="status"
      aria-label={`Status: ${styles[status].label}`}
    >
      <StatusIcon className={cn("w-3.5 h-3.5", status === "active" ? "text-green-600" : "text-red-600")} />
      {styles[status].label}
    </span>
  );
}
```

---

### 3. ActionButtons Component

**Purpose:** Reusable action buttons with tooltips and icons

**Features:**
- ✅ Edit button (pencil icon)
- ✅ Suspend/Activate button (toggle)
- ✅ Delete button (trash icon, red)
- ✅ Tooltip on hover
- ✅ Loading state
- ✅ Confirmation before delete

**Props Interface:**
```typescript
interface ActionButtonsProps {
  onEdit?: () => void;
  onToggleStatus?: () => void;
  currentStatus?: "active" | "suspended";
  onDelete?: () => void;
  isLoading?: boolean;
  showDelete?: boolean;
  size?: "sm" | "md";
}
```

**Component Design:**
```tsx
// src/features/admin/components/common/ActionButtons.tsx
import { Edit, UserX, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function ActionButtons({
  onEdit,
  onToggleStatus,
  currentStatus = "active",
  onDelete,
  isLoading = false,
  showDelete = true,
  size = "sm",
}: ActionButtonsProps) {
  const buttonSize = size === "sm" ? "h-8 w-8" : "h-10 w-10";

  return (
    <div className="flex items-center gap-1">
      {onEdit && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size={size === "sm" ? "icon" : "default"}
              className={buttonSize}
              onClick={onEdit}
              disabled={isLoading}
            >
              <Edit className="w-4 h-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Edit user</TooltipContent>
        </Tooltip>
      )}

      {onToggleStatus && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size={size === "sm" ? "icon" : "default"}
              className={cn(buttonSize, currentStatus === "suspended" && "text-orange-600")}
              onClick={onToggleStatus}
              disabled={isLoading}
            >
              <UserX className="w-4 h-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            {currentStatus === "active" ? "Suspend user" : "Activate user"}
          </TooltipContent>
        </Tooltip>
      )}

      {showDelete && onDelete && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size={size === "sm" ? "icon" : "default"}
              className={cn(buttonSize, "text-red-600 hover:text-red-700 hover:bg-red-50")}
              onClick={onDelete}
              disabled={isLoading}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Delete user</TooltipContent>
        </Tooltip>
      )}
    </div>
  );
}
```

---

### 4. SearchFilterBar Component

**Purpose:** Combined search input and filter dropdowns

**Features:**
- ✅ Search input with debounce
- ✅ Role filter dropdown
- ✅ Status filter dropdown
- ✅ Clear all filters button
- ✅ Results count

**Props Interface:**
```typescript
interface SearchFilterBarProps {
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  roleFilter?: "admin" | "teacher" | "student" | "all";
  onRoleFilterChange?: (role: "admin" | "teacher" | "student" | "all") => void;
  statusFilter?: "all" | "active" | "suspended";
  onStatusFilterChange?: (status: "all" | "active" | "suspended") => void;
  resultsCount?: number;
  placeholder?: string;
}
```

**Component Design:**
```tsx
// src/features/admin/components/common/SearchFilterBar.tsx
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function SearchFilterBar({
  searchValue = "",
  onSearchChange,
  roleFilter = "all",
  onRoleFilterChange,
  statusFilter = "all",
  onStatusFilterChange,
  resultsCount,
  placeholder = "Search users...",
}: SearchFilterBarProps) {
  const hasFilters = searchValue || roleFilter !== "all" || statusFilter !== "all";

  const handleClearFilters = () => {
    onSearchChange?.("");
    onRoleFilterChange?.("all");
    onStatusFilterChange?.("all");
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4">
      {/* Search Input */}
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          type="text"
          placeholder={placeholder}
          value={searchValue}
          onChange={(e) => onSearchChange?.(e.target.value)}
          className="pl-10"
        />
        {searchValue && (
          <button
            onClick={() => onSearchChange?.("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        <Select value={roleFilter} onValueChange={(v) => onRoleFilterChange?.(v as any)}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="All Roles" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="student">Students</SelectItem>
            <SelectItem value="teacher">Teachers</SelectItem>
            <SelectItem value="admin">Admins</SelectItem>
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={(v) => onStatusFilterChange?.(v as any)}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="suspended">Suspended</SelectItem>
          </SelectContent>
        </Select>

        {hasFilters && (
          <Button variant="outline" size="sm" onClick={handleClearFilters}>
            Clear
          </Button>
        )}
      </div>

      {/* Results Count */}
      {resultsCount !== undefined && (
        <div className="text-sm text-gray-600 self-center">
          {resultsCount} user{resultsCount !== 1 ? "s" : ""} found
        </div>
      )}
    </div>
  );
}
```

---

### 5. Pagination Component

**Purpose:** Page navigation with previous/next and page numbers

**Features:**
- ✅ Previous/Next buttons
- ✅ Page number buttons
- ✅ Ellipsis for large page counts
- ✅ Current page indicator
- ✅ Disabled states

---

### 6. BulkActionToolbar Component

**Purpose:** Toolbar that appears when rows are selected

**Features:**
- ✅ Shows selected count
- ✅ Bulk suspend/activate button
- ✅ Bulk delete button
- ✅ Deselect all button
- ✅ Auto-hide when no selection

---

### 7. ConfirmationModal Component

**Purpose:** Reusable confirmation dialog for destructive actions

**Features:**
- ✅ Customizable title and message
- ✅ Confirm/cancel buttons
- ✅ Loading state
- ✅ Icon indicators
- ✅ Keyboard accessible

---

### 8. LoadingSpinner Component

**Purpose:** Loading state indicator

**Variants:**
- ✅ Small (8x8)
- ✅ Medium (16x16)
- ✅ Large (full page)
- ✅ Inline (with text)

---

## 📊 PART 2: DASHBOARD OVERVIEW PAGE

### Layout: `/admin/dashboard`

**Purpose:** Executive overview of system health and recent activity

### 1. Stats Cards (Data Storytelling)

**Design Principles:**
- ✅ Clear, actionable metrics
- ✅ Visual hierarchy
- ✅ Trend indicators
- ✅ Color-coded status

**Stats Card Components:**

```tsx
// Stats Card 1: Total Students
<Card>
  <CardHeader>
    <CardTitle className="text-sm font-medium text-gray-600">
      Total Students
    </CardTitle>
  </CardHeader>
  <CardContent>
    <div className="text-3xl font-bold">1,247</div>
    <p className="text-sm text-green-600 mt-1">
      ↑ 12% from last month
    </p>
  </CardContent>
</Card>

// Stats Card 2: Total Teachers
<Card>
  <CardHeader>
    <CardTitle className="text-sm font-medium text-gray-600">
      Total Teachers
    </CardTitle>
  </CardHeader>
  <CardContent>
    <div className="text-3xl font-bold">89</div>
    <p className="text-sm text-green-600 mt-1">
      ↑ 3 new this month
    </p>
  </CardContent>
</Card>

// Stats Card 3: Active vs Suspended
<Card>
  <CardHeader>
    <CardTitle className="text-sm font-medium text-gray-600">
      User Status
    </CardTitle>
  </CardHeader>
  <CardContent>
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-500" />
          <span className="text-sm">Active</span>
        </div>
        <span className="font-semibold">1,298</span>
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500" />
          <span className="text-sm">Suspended</span>
        </div>
        <span className="font-semibold">38</span>
      </div>
    </div>
    <div className="mt-4">
      <Progress value={97} className="h-2" />
      <p className="text-xs text-gray-500 mt-1">97% active rate</p>
    </div>
  </CardContent>
</Card>

// Stats Card 4: Recent Activity
<Card>
  <CardHeader>
    <CardTitle className="text-sm font-medium text-gray-600">
      Today's Activity
    </CardTitle>
  </CardHeader>
  <CardContent>
    <div className="grid grid-cols-2 gap-4">
      <div>
        <div className="text-2xl font-bold">23</div>
        <p className="text-xs text-gray-500">New Registrations</p>
      </div>
      <div>
        <div className="text-2xl font-bold">5</div>
        <p className="text-xs text-gray-500">Status Changes</p>
      </div>
    </div>
  </CardContent>
</Card>
```

### 2. Recent Activity Feed

**Purpose:** Show recent user actions

**Features:**
- ✅ Chronological list
- ✅ User avatar and name
- ✅ Action description
- ✅ Timestamp
- ✅ Action type icons

**Activity Types:**
- 👤 User registered
- ✏️ Profile updated
- ⚡ Status changed (Active ↔ Suspended)
- 🗑️ User deleted
- 📝 Course created
- 📊 Exam created

**Component Design:**
```tsx
// RecentActivityFeed.tsx
interface ActivityItem {
  id: string;
  user: {
    name: string;
    avatar?: string;
    role: string;
  };
  action: string;
  timestamp: Date;
  type: "register" | "update" | "suspend" | "delete" | "create";
}

function RecentActivityFeed({ activities }: { activities: ActivityItem[] }) {
  return (
    <div className="space-y-4">
      {activities.map((activity) => (
        <div key={activity.id} className="flex gap-4 p-4 bg-gray-50 rounded-lg">
          <Avatar src={activity.user.avatar}>
            <AvatarFallback>{activity.user.name[0]}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <p className="text-sm">
              <span className="font-semibold">{activity.user.name}</span>
              <span className="text-gray-600"> {activity.action}</span>
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {formatDistanceToNow(activity.timestamp)} ago
            </p>
          </div>
          <ActivityIcon type={activity.type} />
        </div>
      ))}
    </div>
  );
}
```

---

## 🛡️ PART 3: PERMISSION GUARD IMPLEMENTATION

### AdminGuard Component

**Purpose:** Protect all `/admin/*` routes from unauthorized access

**Placement Strategy:**

```
src/app/
├── admin/
│   ├── layout.tsx          # Admin layout with sidebar
│   ├── page.tsx            # Dashboard
│   ├── students/
│   │   └── page.tsx        # Student management
│   └── teachers/
│       └── page.tsx        # Teacher management
└── ...
```

**Implementation:**

```tsx
// src/app/admin/layout.tsx
import { PermissionGuard } from "@/features/admin/components/common/PermissionGuard";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PermissionGuard requiredRole="admin" fallback={<AdminAccessDenied />}>
      <div className="flex h-screen bg-gray-100">
        <AdminSidebar />
        <div className="flex-1 overflow-auto">
          <AdminHeader />
          <main className="p-6">{children}</main>
        </div>
      </div>
    </PermissionGuard>
  );
}
```

**PermissionGuard Component:**

```tsx
// src/features/admin/components/common/PermissionGuard.tsx
"use client";

import { useAuth } from "@supabase/auth-helpers-react";
import { useQuery } from "@tanstack/react-query";
import { Navigate } from "react-router-dom";

interface PermissionGuardProps {
  requiredRole: "admin";
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function PermissionGuard({
  requiredRole,
  children,
  fallback,
}: PermissionGuardProps) {
  const { user } = useAuth();

  const { data: profile, isLoading } = useQuery({
    queryKey: ["user-profile", user?.id],
    queryFn: async () => {
      const supabase = getSupabaseClient();
      const { data } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user?.id)
        .single();
      return data;
    },
    enabled: !!user,
  });

  if (isLoading) {
    return <LoadingSpinner size="lg" />;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (profile?.role !== requiredRole) {
    return fallback || <AdminAccessDenied />;
  }

  return <>{children}</>;
}
```

**Access Denied Page:**

```tsx
// src/features/admin/components/common/AdminAccessDenied.tsx
export function AdminAccessDenied() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="text-center p-8 bg-white rounded-lg shadow-lg max-w-md">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Lock className="w-8 h-8 text-red-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          Access Denied
        </h1>
        <p className="text-gray-600 mb-6">
          You don't have permission to access the admin dashboard.
          Please contact your system administrator.
        </p>
        <Button onClick={() => navigate("/")} variant="outline">
          Go to Home
        </Button>
      </div>
    </div>
  );
}
```

---

## 🎨 PART 4: LAYOUT STRATEGY

### Admin Layout Structure

```
AdminLayout
├── AdminSidebar (left, fixed)
│   ├── Logo/Brand
│   ├── Navigation Menu
│   │   ├── Dashboard
│   │   ├── Students
│   │   ├── Teachers
│   │   └── Settings
│   └── User Profile (bottom)
│
├── AdminHeader (top, sticky)
│   ├── Breadcrumb
│   ├── Page Title
│   ├── Search (global)
│   └── Notifications
│
└── MainContent (scrollable)
    ├── Stats Cards (dashboard only)
    ├── Data Tables
    └── Forms & Modals
```

### Sidebar Navigation Items

**Admin-Only Items:**
- 📊 Dashboard
- 👥 Students
- 👨‍🏫 Teachers
- ⚙️ Settings

**Navigation Structure:**
```tsx
// src/features/admin/components/layout/AdminSidebar.tsx
const navigationItems = [
  {
    title: "Dashboard",
    href: "/admin/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Students",
    href: "/admin/students",
    icon: Users,
    badge: studentCount,
  },
  {
    title: "Teachers",
    href: "/admin/teachers",
    icon: UserCheck,
    badge: teacherCount,
  },
  {
    title: "Settings",
    href: "/admin/settings",
    icon: Settings,
  },
];
```

### Theme Integration

**Admin-Specific Styling:**
- ✅ Consistent with main app theme
- ✅ Distinct admin color accents (blue/purple)
- ✅ Professional, enterprise feel
- ✅ Dark mode support

**Color Palette:**
```css
/* Admin-specific colors */
--admin-primary: #3b82f6;  /* Blue */
--admin-secondary: #8b5cf6; /* Purple */
--admin-success: #10b981;   /* Green */
--admin-danger: #ef4444;    /* Red */
--admin-warning: #f59e0b;   /* Amber */
```

---

## ✅ PART 5: IMPLEMENTATION CHECKLIST

### Day 2 Tasks

**Morning (9:00 - 12:00):**
- [ ] Create `UserDataTable.tsx`
- [ ] Create `UserStatusBadge.tsx`
- [ ] Create `ActionButtons.tsx`
- [ ] Create `SearchFilterBar.tsx`

**Afternoon (13:00 - 17:00):**
- [ ] Create `Pagination.tsx`
- [ ] Create `BulkActionToolbar.tsx`
- [ ] Create `ConfirmationModal.tsx`
- [ ] Create `LoadingSpinner.tsx`

**Late Afternoon (17:00 - 18:00):**
- [ ] Create `PermissionGuard.tsx`
- [ ] Create Admin layout structure
- [ ] Test all components in isolation

---

## 📊 SUCCESS METRICS

| Metric | Target | Status |
|--------|--------|--------|
| **Components Created** | 8+ | ⏳ Pending |
| **Dashboard Page** | Complete | ⏳ Pending |
| **Permission Guard** | 100% | ⏳ Pending |
| **Theme Integration** | Complete | ⏳ Pending |
| **Accessibility** | WCAG 2.1 AA | ⏳ Pending |

---

## 🚀 NEXT STEPS

1. ✅ **Review** UI architecture blueprint
2. ⏳ **Begin implementation** (Day 2)
3. ⏳ **Create all 8 components**
4. ⏳ **Build dashboard page**
5. ⏳ **Test with real data**

---

**Blueprint Status:** ✅ Complete  
**Ready for Implementation:** ✅ Yes  
**Timeline:** 1 day (Day 2)  
**Next Action:** Begin component creation

---

*End of Admin Dashboard UI Architecture Blueprint*
