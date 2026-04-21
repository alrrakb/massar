import { useState, useEffect } from 'react';
import { X, Loader2, Save } from 'lucide-react';
import { adminApi } from '../api/adminApi';
import { getSupabaseClient } from '../../../services/supabase';
import type { AdminUser, UpdateUserProfileInput, Major, AcademicLevel } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  user: AdminUser;
  onSave: () => void;
}

interface StudentExtra {
  major_id: number | null;
  level_id: number | null;
}

const inputStyle = {
  background: 'rgba(255,255,255,0.06)',
  border: '1px solid rgba(255,255,255,0.12)',
  color: 'var(--text-main)',
} as const;

const disabledStyle = {
  background: 'rgba(255,255,255,0.03)',
  border: '1px solid rgba(255,255,255,0.07)',
  color: 'var(--text-muted)',
} as const;

export default function EditUserModal({ isOpen, onClose, user, onSave }: Props) {
  const [form, setForm] = useState<UpdateUserProfileInput>({
    full_name: user.full_name,
    department: user.department ?? '',
    specialization: user.specialization ?? '',
  });
  const [studentExtra, setStudentExtra] = useState<StudentExtra>({ major_id: null, level_id: null });
  const [majors, setMajors] = useState<Major[]>([]);
  const [levels, setLevels] = useState<AcademicLevel[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    if (user.role !== 'student') return;

    const supabase = getSupabaseClient();

    Promise.all([
      adminApi.getMajors(),
      adminApi.getAcademicLevels(),
      supabase
        .from('student_profiles')
        .select('major_id, level_id')
        .eq('id', user.id)
        .maybeSingle(),
    ]).then(([maj, lvl, { data: sp }]) => {
      setMajors(maj as Major[]);
      setLevels(lvl as AcademicLevel[]);
      setStudentExtra({
        major_id: sp?.major_id ?? null,
        level_id: sp?.level_id ?? null,
      });
    });
  }, [isOpen, user.id, user.role]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'major_id' || name === 'level_id') {
      setStudentExtra(prev => ({ ...prev, [name]: value ? Number(value) : null }));
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
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
      });

      if (user.role === 'student') {
        await adminApi.updateStudentProfile(user.id, {
          major_id: studentExtra.major_id,
          level_id: studentExtra.level_id,
        });
      }

      onSave();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save changes.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50" style={{ background: 'rgba(0,0,0,0.65)' }}>
      <div className="glass-card w-full max-w-md shadow-2xl" style={{ maxHeight: '90vh', overflowY: 'auto' }}>

        {/* Header */}
        <div
          className="flex items-center justify-between p-6"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}
        >
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
            <div
              className="rounded-lg px-4 py-3 text-sm"
              style={{ background: 'rgba(251,113,133,0.12)', color: '#fb7185', border: '1px solid rgba(251,113,133,0.25)' }}
            >
              {error}
            </div>
          )}

          {/* Full Name */}
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
              style={inputStyle}
              placeholder="Full name"
            />
          </div>

          {/* Email (read-only) */}
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-muted)' }}>
              Email
            </label>
            <input
              type="email"
              value={user.email}
              disabled
              className="w-full px-3 py-2.5 rounded-xl text-sm cursor-not-allowed"
              style={disabledStyle}
            />
          </div>

          {/* Teacher fields */}
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
                  style={inputStyle}
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
                  style={inputStyle}
                  placeholder="e.g. Software Engineering"
                />
              </div>
            </>
          )}

          {/* Student fields: Major & Level */}
          {user.role === 'student' && (
            <>
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-muted)' }}>
                  Major
                </label>
                <select
                  name="major_id"
                  value={studentExtra.major_id ?? ''}
                  onChange={handleChange}
                  className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                  style={inputStyle}
                >
                  <option value="" style={{ background: '#1e293b', color: 'white' }}>— Select major —</option>
                  {majors.map(m => (
                    <option key={m.id} value={m.id} style={{ background: '#1e293b', color: 'white' }}>{m.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-muted)' }}>
                  Academic Level
                </label>
                <select
                  name="level_id"
                  value={studentExtra.level_id ?? ''}
                  onChange={handleChange}
                  className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                  style={inputStyle}
                >
                  <option value="" style={{ background: '#1e293b', color: 'white' }}>— Select level —</option>
                  {levels.map(l => (
                    <option key={l.id} value={l.id} style={{ background: '#1e293b', color: 'white' }}>{l.name}</option>
                  ))}
                </select>
              </div>
            </>
          )}

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
