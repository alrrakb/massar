import { useState } from 'react';
import { X, Loader2, Save } from 'lucide-react';
import { adminApi } from '../api/adminApi';
import type { AdminUser, UpdateUserProfileInput } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  user: AdminUser;
  onSave: () => void;
}

export default function EditUserModal({ isOpen, onClose, user, onSave }: Props) {
  const [form, setForm] = useState<UpdateUserProfileInput>({
    full_name: user.full_name,
    department: user.department ?? '',
    specialization: user.specialization ?? '',
    avatar_url: user.avatar_url ?? '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (error) setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.full_name?.trim()) {
      setError('Full name is required.');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await adminApi.updateUserProfile(user.id, {
        full_name: form.full_name.trim(),
        department: form.department || null,
        specialization: form.specialization || null,
        avatar_url: form.avatar_url || null,
      });
      onSave();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save changes.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50" style={{ background: 'rgba(0,0,0,0.65)' }}>
      <div
        className="glass-card w-full max-w-md shadow-2xl"
        style={{ maxHeight: '90vh', overflowY: 'auto' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <div>
            <h2 className="text-lg font-bold" style={{ color: 'var(--text-main)' }}>Edit Profile</h2>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{user.email}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg transition-colors hover:bg-white/10"
            style={{ color: 'var(--text-muted)' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="rounded-lg px-4 py-3 text-sm" style={{ background: 'rgba(251,113,133,0.12)', color: '#fb7185', border: '1px solid rgba(251,113,133,0.25)' }}>
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-muted)' }}>
              Full Name <span style={{ color: '#fb7185' }}>*</span>
            </label>
            <input
              type="text"
              name="full_name"
              value={form.full_name ?? ''}
              onChange={handleChange}
              required
              className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
              style={{
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.12)',
                color: 'var(--text-main)',
              }}
              placeholder="Full name"
            />
          </div>

          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-muted)' }}>
              Email
            </label>
            <input
              type="email"
              value={user.email}
              disabled
              className="w-full px-3 py-2.5 rounded-xl text-sm opacity-50 cursor-not-allowed"
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                color: 'var(--text-muted)',
              }}
            />
          </div>

          {user.role === 'teacher' && (
            <>
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-muted)' }}>
                  Department
                </label>
                <input
                  type="text"
                  name="department"
                  value={form.department ?? ''}
                  onChange={handleChange}
                  className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                  style={{
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.12)',
                    color: 'var(--text-main)',
                  }}
                  placeholder="e.g. Computer Science"
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-muted)' }}>
                  Specialization
                </label>
                <input
                  type="text"
                  name="specialization"
                  value={form.specialization ?? ''}
                  onChange={handleChange}
                  className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                  style={{
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.12)',
                    color: 'var(--text-main)',
                  }}
                  placeholder="e.g. Software Engineering"
                />
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-muted)' }}>
              Avatar URL
            </label>
            <input
              type="url"
              name="avatar_url"
              value={form.avatar_url ?? ''}
              onChange={handleChange}
              className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
              style={{
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.12)',
                color: 'var(--text-main)',
              }}
              placeholder="https://..."
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="px-4 py-2 rounded-xl text-sm font-medium transition-colors hover:bg-white/10 disabled:opacity-50"
              style={{ color: 'var(--text-muted)', border: '1px solid rgba(255,255,255,0.1)' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 disabled:opacity-50 transition-colors"
              style={{ background: 'linear-gradient(135deg,#6366f1,#4f46e5)', color: '#fff' }}
            >
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
