import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useEffect } from 'react';
import {
    User, Shield, BookOpen, BarChart2, Mail,
    Phone, Calendar, Lock,
} from 'lucide-react';
import styles from '../StudentProfile.module.css';

// major and level are display-only — populated via student_profiles JOIN, not editable here
const personalSchema = z.object({
    full_name: z.string().min(2, 'Name must be at least 2 characters'),
    major: z.string().optional(),
    level: z.string().optional(),
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
    studentId: string;
    initialData: Partial<PersonalFormData>;
    onSaved?: (saved: Partial<PersonalFormData>) => void;
}

function FieldError({ msg }: { msg?: string }) {
    if (!msg) return null;
    return (
        <span style={{ fontSize: '0.75rem', color: '#f87171', marginTop: '-4px', display: 'block' }}>
            {msg}
        </span>
    );
}

function Field({ label, icon, children, error }: { label: string; icon: React.ReactNode; children: React.ReactNode; error?: string }) {
    return (
        <div className={styles.inputGroup}>
            <label className={styles.label}>{icon} {label}</label>
            {children}
            <FieldError msg={error} />
        </div>
    );
}

export default function PersonalTab({ email, studentId, initialData }: Props) {
    const { watch, reset } = useForm<PersonalFormData>({
        resolver: zodResolver(personalSchema),
        defaultValues: {
            full_name: initialData.full_name ?? '',
            major: initialData.major ?? '',
            level: initialData.level ?? '',
            mobile: initialData.mobile ?? '',
            date_of_birth: initialData.date_of_birth ?? '',
        },
    });

    // Re-sync when async initialData arrives from parent fetch
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

    return (
        <div className={styles.card}>
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
