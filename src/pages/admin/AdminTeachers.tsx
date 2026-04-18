import { useState, useEffect } from 'react';
import { UserCircle, BarChart3 } from 'lucide-react';
import { useAdminUsers, adminApi } from '../../features/admin/api';
import type { AdminUser as UserProfile, Major, AcademicLevel } from '../../features/admin/types';
import UserFilters from '../../features/admin/components/UserFilters';
import UserTable from '../../features/admin/components/UserTable';
import AddUserModal from '../../features/admin/components/AddUserModal';
import ConfirmModal from '../../features/admin/components/ConfirmModal';
import EditUserModal from '../../features/admin/components/EditUserModal';
import UserStats from '../../features/admin/components/UserStats';

export default function AdminTeachers() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{
    type: 'suspend' | 'activate' | 'delete';
    userId: string;
    title: string;
    message: string;
    confirmLabel: string;
    actionType: 'danger' | 'warning' | 'info';
  } | null>(null);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [statsUser, setStatsUser] = useState<UserProfile | null>(null);
  const [editUser, setEditUser] = useState<UserProfile | null>(null);
  const [majors, setMajors] = useState<Major[]>([]);
  const [academicLevels, setAcademicLevels] = useState<AcademicLevel[]>([]);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  const { users, loading, filters, updateFilter, suspendUser, activateUser, deleteUser, refresh, ToastComponent } = 
    useAdminUsers({ role: 'teacher' });

  useEffect(() => {
    adminApi.getMajors().then(setMajors).catch(console.error);
    adminApi.getAcademicLevels().then(setAcademicLevels).catch(console.error);
  }, []);

  // Defensive programming: Use optional chaining and fallback to empty array
  const activeCount = (users || []).filter(u => u.status === 'active').length;
  const suspendedCount = (users || []).filter(u => u.status === 'suspended').length;

  const handleEdit = (id: string) => {
    const user = users.find(u => u.id === id);
    if (user) setEditUser(user);
  };

  const handleStats = (id: string) => {
    const user = users.find(u => u.id === id);
    if (user) setStatsUser(user);
  };

  const handleConfirmAction = (type: 'suspend' | 'activate' | 'delete', userId: string) => {
    const user = users.find(u => u.id === userId);
    if (!user) return;

    const configs = {
      suspend: {
        title: 'Suspend Account',
        message: `Are you sure you want to suspend ${user.full_name}? They will lose access to the platform until reactivated.`,
        confirmLabel: 'Suspend',
        actionType: 'warning' as const,
      },
      activate: {
        title: 'Activate Account',
        message: `Are you sure you want to activate ${user.full_name}? They will regain full access to the platform.`,
        confirmLabel: 'Activate',
        actionType: 'info' as const,
      },
      delete: {
        title: 'Delete Account',
        message: `Are you sure you want to permanently delete ${user.full_name}? This action cannot be undone and all their data will be lost.`,
        confirmLabel: 'Delete',
        actionType: 'danger' as const,
      },
    };

    setConfirmAction({ type, userId, ...configs[type] });
  };

  const executeConfirmAction = async () => {
    if (!confirmAction) return;
    setConfirmLoading(true);

    try {
      switch (confirmAction.type) {
        case 'suspend':
          await suspendUser(confirmAction.userId);
          break;
        case 'activate':
          await activateUser(confirmAction.userId);
          break;
        case 'delete':
          await deleteUser(confirmAction.userId);
          break;
      }
      setConfirmAction(null);
    } catch (err) {
      console.error('Action failed:', err);
    } finally {
      setConfirmLoading(false);
    }
  };

  // Loading state - show skeleton spinner
  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="animate-pulse space-y-6">
          <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
          <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg" style={{ background: 'rgba(167,139,250,0.15)' }}>
            <UserCircle size={28} style={{ color: '#a78bfa' }} />
          </div>
          <div>
            <h1 className="text-2xl font-bold" style={{ color: 'var(--text-main)' }}>
              Teacher Management
            </h1>
            <p style={{ color: 'var(--text-muted)' }}>
              Manage teacher accounts and course assignments
            </p>
          </div>
        </div>
        
        {/* Quick Stats */}
        <div className="flex gap-3">
          <div className="glass-card px-4 py-2 flex items-center gap-2">
            <BarChart3 size={16} style={{ color: '#34d399' }} />
            <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
              Active: <strong style={{ color: '#34d399' }}>{activeCount}</strong>
            </span>
          </div>
          <div className="glass-card px-4 py-2 flex items-center gap-2">
            <BarChart3 size={16} style={{ color: '#fb7185' }} />
            <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
              Suspended: <strong style={{ color: '#fb7185' }}>{suspendedCount}</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Filters - Role locked to teacher */}
      <UserFilters 
        search={filters.search || ''}
        role="teacher"
        status={filters.status || ''}
        onSearchChange={(v) => updateFilter('search', v || undefined)}
        onRoleChange={() => {}}
        onStatusChange={(v) => updateFilter('status', v || undefined)}
        onAddUser={() => setShowAddModal(true)}
      />
      
      {/* User Table */}
      <UserTable 
        users={users}
        loading={loading}
        onEdit={handleEdit}
        onStats={handleStats}
        onConfirmAction={handleConfirmAction}
      />

      {/* Confirmation Modal */}
      {confirmAction && (
        <ConfirmModal
          isOpen={true}
          title={confirmAction.title}
          message={confirmAction.message}
          confirmLabel={confirmAction.confirmLabel}
          type={confirmAction.actionType}
          onConfirm={executeConfirmAction}
          onCancel={() => setConfirmAction(null)}
          loading={confirmLoading}
        />
      )}

      {/* Edit User Modal */}
      {editUser && (
        <EditUserModal
          user={editUser}
          onClose={() => setEditUser(null)}
          onSuccess={refresh}
          majors={majors}
          academicLevels={academicLevels}
        />
      )}

      {/* User Stats Modal */}
      {statsUser && (
        <UserStats
          user={statsUser}
          onClose={() => setStatsUser(null)}
        />
      )}

      {/* Add User Modal */}
      {showAddModal && (
        <AddUserModal 
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          initialRole="teacher"
          onSuccess={() => {
            setShowAddModal(false);
            refresh();
            setSuccessMessage("Teacher created successfully!");
            setTimeout(() => setSuccessMessage(null), 3000);
          }}
        />
      )}

      {/* Success Message */}
      {successMessage && (
        <div className="fixed bottom-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50">
          <p className="font-medium">{successMessage}</p>
        </div>
      )}

      {ToastComponent}
    </div>
  );
}
