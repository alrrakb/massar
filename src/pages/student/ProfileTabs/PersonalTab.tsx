import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState, useEffect } from 'react';
import {
    User, Shield, BookOpen, BarChart2, Mail,
    Phone, Calendar
} from 'lucide-react';
import { supabase } from '../../../services/supabase';
import { toast } from 'react-hot-toast';
import styles from '../StudentProfile.module.css';

// ─── Zod Schema ──────────────────────────────────────────────────────────────
const personalSchema = z.object({
    full_name: z.string().min(2, 'Name must be at least 2 characters'),
    major: z.string().min(1, 'Please select a major'),
    level: z.string().min(1, 'Please select a level'),
    mobile: z
        .string()
        .regex(/^(\+\d{1,3}\s?)?\d{9,13}$/, 'Invalid phone number (e.g. +201234567890)')
        .optional()
        .or(z.literal('')),
    date_of_birth: z
        .string()
        .refine(v => !v || v <= new Date().toISOString().split('T')[0], 'DOB cannot be in the future')
        .optional(),
});

type PersonalFormData = z.infer<typeof personalSchema>;

interface Props {
    userId: string;
    email: string;
    studentId: string;         // read-only, not in the editable form
    initialData: Partial<PersonalFormData>;
    onSaved?: (saved: Partial<PersonalFormData>) => void;
}

// ─── Inline Error Message ─────────────────────────────────────────────────────
function FieldError({ msg }: { msg?: string }) {
    if (!msg) return null;
    return (
        <span style={{ fontSize: '0.75rem', color: '#f87171', marginTop: '-4px', display: 'block' }}>
            {msg}
        </span>
    );
}

// ─── Field Wrapper ────────────────────────────────────────────────────────────
function Field({ label, icon, children, error }: { label: string; icon: React.ReactNode; children: React.ReactNode; error?: string }) {
    return (
        <div className={styles.inputGroup}>
            <label className={styles.label}>
                {icon} {label}
            </label>
            {children}
            <FieldError msg={error} />
        </div>
    );
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function PersonalTab({ userId, email, studentId, initialData, onSaved }: Props) {
    const [isEditing, setIsEditing] = useState(false);

    const { register, handleSubmit, formState: { errors, isDirty, isSubmitting }, reset } = useForm<PersonalFormData>({
        resolver: zodResolver(personalSchema),
        defaultValues: {
            full_name: initialData.full_name ?? '',
            major: initialData.major ?? '',
            level: initialData.level ?? '',
            mobile: initialData.mobile ?? '',
            date_of_birth: initialData.date_of_birth ?? '',
        },
    });

    // ── Bug 1 Fix: re-sync form when async initialData arrives from parent fetch
    useEffect(() => {
        reset({
            full_name: initialData.full_name ?? '',
            major: initialData.major ?? '',
            level: initialData.level ?? '',
            mobile: initialData.mobile ?? '',
            date_of_birth: initialData.date_of_birth ?? '',
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [initialData]);

    const onSubmit = async (data: PersonalFormData) => {
        try {
            const { error: profileError } = await supabase
                .from('profiles')
                .update({
                    full_name: data.full_name,
                    major: data.major,
                    level: data.level,
                    mobile: data.mobile,
                    date_of_birth: data.date_of_birth || null,
                })
                .eq('id', userId);

            if (profileError) throw profileError;

            await supabase.auth.updateUser({
                data: { full_name: data.full_name, major: data.major, level: data.level },
            });

            toast.success('Profile updated successfully ✓');
            reset(data);          // mark form as pristine with new values
            onSaved?.(data);      // Bug 2 Fix: notify parent to update header card
            setIsEditing(false);
        } catch {
            toast.error('Failed to update profile');
        }
    };

    // Bug 3 Fix: reset to initialData (last server values), not empty mount defaults
    const handleCancel = () => { reset(initialData); setIsEditing(false); };

    const inputCls = (hasError?: boolean) =>
        `${styles.input} ${!isEditing ? styles.inputDisabled : ''} ${hasError ? 'ring-error' : ''}`;

    return (
        <div className={styles.card}>
            <style>{`
                .ring-error { border-color: #f87171 !important; }
                .ring-error:focus { box-shadow: 0 0 0 4px rgba(248,113,113,0.15) !important; }
            `}</style>

            <div className={styles.cardHeader}>
                <div>
                    <h3 className={styles.cardTitle}>Personal Information</h3>
                    <p className={styles.cardSubtitle}>Contact the admin to edit the data.</p>
                </div>
            </div>


            <div className={styles.formGrid}>

                <Field label="Full Name" icon={<User size={14} />}>
                    <div className={styles.displayField}>{watch('full_name') || 'N/A'}</div>
                </Field>

                {/* Always-readonly: Student ID */}
                <Field label="Student ID" icon={<Shield size={14} />}>
                    <div className={styles.inputWrapper}>
                        <input
                            type="text"
                            value={studentId}
                            disabled
                            className={`${styles.input} ${styles.inputDisabled}`}
                        />
                        <Lock size={14} className={styles.lockIcon} />
                    </div>
                </Field>

                <Field label="Major" icon={<BookOpen size={14} />}>
                    <div className={styles.displayField}>{watch('major') || 'N/A'}</div>
                </Field>

                <Field label="Level / Year" icon={<BarChart2 size={14} />}>
                    <div className={styles.displayField}>{watch('level') ? `Level ${watch('level')}` : 'N/A'}</div>
                </Field>

                {/* Always-readonly */}
                <Field label="Email Address" icon={<Mail size={14} />}>
                    <div className={styles.inputWrapper}>
                        <input type="email" value={email} disabled
                            className={`${styles.input} ${styles.inputDisabled}`} />
                        <Lock size={14} className={styles.lockIcon} />
                    </div>
                </Field>

                <Field label="Mobile Number" icon={<Phone size={14} />}>
                    <div className={styles.displayField}>{watch('mobile') || 'N/A'}</div>
                </Field>

                <Field label="Date of Birth" icon={<Calendar size={14} />}>
                    <div className={styles.displayField}>{watch('date_of_birth') || 'N/A'}</div>
                </Field>

            </div>
        </div>
    );
}
