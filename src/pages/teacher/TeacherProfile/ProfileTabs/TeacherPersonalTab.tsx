import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useEffect } from 'react';
import {
    User, Shield, BookOpen, BarChart2, Mail,
    Phone, Calendar
} from 'lucide-react';
import { supabase } from '../../../../services/supabase';
import { toast } from 'react-hot-toast';
import styles from '../../../student/StudentProfile.module.css';

// ─── Zod Schema ──────────────────────────────────────────────────────────────
const personalSchema = z.object({
    full_name: z.string().min(2, 'Name must be at least 2 characters'),
    mobile: z
        .string()
        .regex(/^(\+\d{1,3}\s?)?\d{9,13}$/, 'Invalid phone number (e.g. +201234567890)')
        .optional()
        .or(z.literal('')),
    date_of_birth: z
        .string()
        .refine(v => !v || v <= new Date().toISOString().split('T')[0], 'DOB cannot be in the future')
        .optional(),
    headline: z.string().max(100, 'Headline must be under 100 characters').optional(),
    bio: z.string().max(500, 'Bio must be under 500 characters').optional(),
});

type PersonalFormData = z.infer<typeof personalSchema>;

interface Props {
    userId: string;
    email: string;
    studentId?: string; // Kept for interface compatibility, but unused here
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
export default function TeacherPersonalTab({ initialData }: Props) {
    const { reset, watch } = useForm<PersonalFormData>({
        resolver: zodResolver(personalSchema),
        defaultValues: {
            full_name: initialData.full_name ?? '',
            mobile: initialData.mobile ?? '',
            date_of_birth: initialData.date_of_birth ?? '',
            headline: initialData.headline ?? '',
            bio: initialData.bio ?? '',
        },
    });

    useEffect(() => {
        reset({
            full_name: initialData.full_name ?? '',
            mobile: initialData.mobile ?? '',
            date_of_birth: initialData.date_of_birth ?? '',
            headline: initialData.headline ?? '',
            bio: initialData.bio ?? '',
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [initialData]);

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

                <div style={{ gridColumn: '1 / -1', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <Field label="Major" icon={<BookOpen size={14} />}>
                        <div className={styles.displayField}>{watch('major') || 'N/A'}</div>
                    </Field>
                </div>

                <div style={{ gridColumn: '1 / -1', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <Field label="Bio" icon={<BarChart2 size={14} />}>
                        <div className={styles.displayField} style={{ minHeight: '80px', whiteSpace: 'pre-wrap' }}>
                            {watch('bio') || 'No bio available'}
                        </div>
                    </Field>
                </div>

                {/* REQUESTED MODIFICATION: Always Enabled Phone Number */}
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
