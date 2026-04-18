// ============================================================
// ADMIN MANAGEMENT TYPES
// Bounded Context: User Management (Core)
// ============================================================

export type UserRole = 'admin' | 'teacher' | 'student';
export type UserStatus = 'active' | 'suspended' | 'inactive';

export interface AdminUser {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  status: UserStatus;
  major?: string | null;
  level?: string | null;
  specialization?: string | null;
  department?: string | null;
  student_id?: string | null;
  avatar_url?: string | null;
  two_factor_enabled: boolean;
  last_sign_in_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface AdminUserFilters {
  role?: UserRole | 'student' | 'teacher';
  status?: UserStatus;
  search?: string;
  major?: string;
  level?: string;
  page?: number;
  limit?: number;
}

export interface AdminUserPagination {
  data: AdminUser[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface UpdateUserProfileInput {
  full_name?: string;
  major?: string | null;
  level?: string | null;
  specialization?: string | null;
  department?: string | null;
  avatar_url?: string | null;
}

export interface UpdateUserStatusInput {
  status: UserStatus;
}

export interface Major {
  id: number;
  name: string;
  code?: string | null;
}

export interface AcademicLevel {
  id: number;
  name: string;
  code?: string | null;
  display_order?: number | null;
}

export interface CreateUserInput {
  email: string;
  password: string;
  full_name: string;
  role: UserRole;
  major?: string | null;
  level?: string | null;
  specialization?: string | null;
  department?: string | null;
  student_id?: string | null;
}
