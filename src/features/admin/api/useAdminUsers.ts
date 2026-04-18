// ============================================================
// USE ADMIN USERS HOOK
// Bounded Context: User Management (Core)
// ============================================================

import { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminApi } from './adminApi';
import type { AdminUser, AdminUserFilters, AdminUserPagination } from '../types';

const ADMIN_USERS_KEY = ['admin_users'] as const;

export function useAdminUsers(initialFilters: AdminUserFilters = {}) {
  const [filters, setFilters] = useState<AdminUserFilters>(initialFilters);

  const updateFilter = useCallback((key: keyof AdminUserFilters, value: string | undefined) => {
    setFilters(prev => ({
      ...prev,
      [key]: value || undefined,
    }));
  }, []);

  const { data, isLoading, error, refetch } = useQuery<AdminUserPagination, Error>({
    queryKey: [...ADMIN_USERS_KEY, filters],
    queryFn: () => adminApi.getUsers(filters),
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
  });

  return {
    users: data?.data || [],
    loading: isLoading,
    error,
    filters,
    updateFilter,
    refresh: refetch,
    // Placeholder functions - to be implemented
    suspendUser: async (_userId: string) => {},
    activateUser: async (_userId: string) => {},
    deleteUser: async (_userId: string) => {},
    ToastComponent: null,
  };
}

export function useAdminUserCount() {
  return useQuery<Record<string, number>, Error>({
    queryKey: [...ADMIN_USERS_KEY, 'counts'],
    queryFn: () => adminApi.getActiveUsersCountByRole(),
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
  });
}

export function useAdminUser(userId: string) {
  return useQuery<AdminUser | null, Error>({
    queryKey: [...ADMIN_USERS_KEY, 'by_id', userId],
    queryFn: () => adminApi.getUserById(userId),
    enabled: !!userId,
    staleTime: 1000 * 60 * 2, // 2 minutes
    refetchOnWindowFocus: false,
  });
}

export function useAdminUsersByRole(role: 'teacher' | 'student') {
  return useQuery<AdminUser[], Error>({
    queryKey: [...ADMIN_USERS_KEY, 'by_role', role],
    queryFn: () => adminApi.getUsersByRole(role),
    enabled: !!role,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
  });
}
