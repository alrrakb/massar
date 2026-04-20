import { Edit2, BarChart3, Trash2, ShieldOff, ShieldCheck } from 'lucide-react';
import type { AdminUser } from '../types';

interface Props {
  users: AdminUser[];
  loading: boolean;
  onEdit: (id: string) => void;
  onStats: (id: string) => void;
  onConfirmAction: (type: 'suspend' | 'activate' | 'delete', userId: string) => void;
}

export default function UserTable({ users, loading, onEdit, onStats, onConfirmAction }: Props) {
  if (loading) {
    return (
      <div className="glass-card p-8">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-full bg-white/10" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-white/10 rounded w-1/3" />
                <div className="h-3 bg-white/10 rounded w-1/4" />
              </div>
              <div className="h-6 w-20 bg-white/10 rounded-full" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!users || users.length === 0) {
    return (
      <div className="glass-card p-12 text-center">
        <p style={{ color: 'var(--text-muted)' }}>No users found matching your filters.</p>
      </div>
    );
  }

  return (
    <div className="glass-card overflow-hidden">
      <table className="min-w-full">
        <thead>
          <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
            <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
              User
            </th>
            <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
              Role
            </th>
            <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
              Joined
            </th>
            <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {users.map((user, idx) => (
            <tr
              key={user.id}
              style={{
                borderBottom: idx < users.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                transition: 'background 0.15s',
              }}
              className="hover:bg-white/5"
            >
              {/* User Info */}
              <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                  <img
                    className="h-9 w-9 rounded-full object-cover ring-2 ring-white/10"
                    src={
                      user.avatar_url ||
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(user.full_name)}&background=6366f1&color=fff&size=72`
                    }
                    alt={user.full_name}
                  />
                  <div>
                    <div className="text-sm font-semibold" style={{ color: 'var(--text-main)' }}>
                      {user.full_name}
                    </div>
                    <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      {user.email}
                    </div>
                  </div>
                </div>
              </td>

              {/* Role */}
              <td className="px-6 py-4">
                <span
                  className="px-2.5 py-1 text-xs font-medium rounded-full capitalize"
                  style={{
                    background:
                      user.role === 'teacher'
                        ? 'rgba(167,139,250,0.15)'
                        : user.role === 'admin'
                        ? 'rgba(251,191,36,0.15)'
                        : 'rgba(56,189,248,0.15)',
                    color:
                      user.role === 'teacher'
                        ? '#a78bfa'
                        : user.role === 'admin'
                        ? '#fbbf24'
                        : '#38bdf8',
                  }}
                >
                  {user.role}
                </span>
              </td>

              {/* Status */}
              <td className="px-6 py-4">
                <span
                  className="px-2.5 py-1 text-xs font-semibold rounded-full capitalize"
                  style={{
                    background: user.status === 'active' ? 'rgba(52,211,153,0.15)' : 'rgba(251,113,133,0.15)',
                    color: user.status === 'active' ? '#34d399' : '#fb7185',
                  }}
                >
                  {user.status}
                </span>
              </td>

              {/* Joined */}
              <td className="px-6 py-4 text-xs" style={{ color: 'var(--text-muted)' }}>
                {user.created_at
                  ? new Date(user.created_at).toLocaleDateString('en-US', {
                      year: 'numeric', month: 'short', day: 'numeric',
                    })
                  : '—'}
              </td>

              {/* Actions */}
              <td className="px-6 py-4">
                <div className="flex items-center justify-end gap-1">
                  {/* Edit */}
                  <button
                    onClick={() => onEdit(user.id)}
                    title="Edit Profile"
                    className="p-1.5 rounded-lg transition-colors hover:bg-white/10"
                    style={{ color: '#6366f1' }}
                  >
                    <Edit2 size={16} />
                  </button>

                  {/* Stats */}
                  <button
                    onClick={() => onStats(user.id)}
                    title="Account Stats"
                    className="p-1.5 rounded-lg transition-colors hover:bg-white/10"
                    style={{ color: '#2dd4bf' }}
                  >
                    <BarChart3 size={16} />
                  </button>

                  {/* Suspend / Activate toggle */}
                  {user.status === 'active' ? (
                    <button
                      onClick={() => onConfirmAction('suspend', user.id)}
                      title="Disable Account"
                      className="p-1.5 rounded-lg transition-colors hover:bg-white/10"
                      style={{ color: '#f59e0b' }}
                    >
                      <ShieldOff size={16} />
                    </button>
                  ) : (
                    <button
                      onClick={() => onConfirmAction('activate', user.id)}
                      title="Enable Account"
                      className="p-1.5 rounded-lg transition-colors hover:bg-white/10"
                      style={{ color: '#34d399' }}
                    >
                      <ShieldCheck size={16} />
                    </button>
                  )}

                  {/* Delete */}
                  <button
                    onClick={() => onConfirmAction('delete', user.id)}
                    title="Delete Account"
                    className="p-1.5 rounded-lg transition-colors hover:bg-white/10"
                    style={{ color: '#fb7185' }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
