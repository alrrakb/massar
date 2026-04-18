import { useState, useEffect } from 'react';
import { instructorService, InstructorMetrics } from '../../../../services/instructorService';
import { BookOpen, Users, FileText, Star, Loader2, Compass, Briefcase, Award, Hash, Building } from 'lucide-react';
import styles from '../../../student/StudentProfile.module.css';

interface Props {
    userId: string;
    initialData?: {
        employee_id?: string;
        department?: string;
        specialization?: string;
        academic_degree?: string;
        years_of_experience?: number;
    };
}


export default function TeacherProfessionalTab({ userId, initialData, onSaved }: Props) {
    const [metrics, setMetrics] = useState<InstructorMetrics | null>(null);
    const [loadingMetrics, setLoadingMetrics] = useState(true);

    const formData = {
        employee_id: initialData?.employee_id || '',
        department: initialData?.department || '',
        specialization: initialData?.specialization || '',
        academic_degree: initialData?.academic_degree || '',
        years_of_experience: initialData?.years_of_experience || 0
    };

    useEffect(() => {
        instructorService.getMetrics(userId).then(data => {
            setMetrics(data);
            setLoadingMetrics(false);
        });
    }, [userId]);

    const handleSave = async () => {
        try {
            setErrors({});
            const validData = professionalSchema.parse(formData);

            setSaving(true);
            const { error } = await supabase
                .from('profiles')
                .update(validData)
                .eq('id', userId);

            if (error) throw error;

            onSaved(validData);
            setIsEditing(false);
            toast.success('Professional details updated successfully');
        } catch (err: any) {
            if (err instanceof z.ZodError) {
                const newErrors: any = {};
                err.issues.forEach((e: z.ZodIssue) => {
                    if (e.path[0]) newErrors[e.path[0]] = e.message;
                });
                setErrors(newErrors);
                toast.error('Please check the form for errors');
            } else {
                toast.error('Failed to save professional data');
                console.error(err);
            }
        } finally {
            setSaving(false);
        }
    };

    const statCards = [
        { label: 'Courses Managed', value: metrics ? String(metrics.totalCourses) : '—', icon: BookOpen, color: '#60a5fa' },
        { label: 'Exams Published', value: metrics ? String(metrics.examsPublished) : '—', icon: FileText, color: '#34d399' },
        { label: 'Active Students', value: metrics ? String(metrics.activeStudents) : '—', icon: Users, color: '#a78bfa' },
        { label: 'Avg. Rating', value: metrics ? String(metrics.averageRating) : '—', icon: Star, color: '#fb923c' },
    ];

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

            {/* Instructor Metrics Grid */}
            <div className={styles.card} style={{ border: '1px solid rgba(139, 92, 246, 0.2)', background: 'linear-gradient(135deg, rgba(99,102,241,0.05) 0%, rgba(139,92,246,0.05) 100%)' }}>
                <div className={styles.cardHeader}>
                    <h3 className={styles.cardTitle}>Instructor Performance</h3>
                </div>
                {loadingMetrics ? (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
                        <Loader2 size={32} className={styles.spin} color="rgba(255,255,255,0.2)" />
                    </div>
                ) : (
                    <div className={styles.statsGrid}>
                        {statCards.map(s => (
                            <div key={s.label} className={styles.statCard}>
                                <div className={styles.statHeader}>
                                    <div className={styles.statIcon} style={{ background: `${s.color}20`, color: s.color }}>
                                        <s.icon size={22} />
                                    </div>
                                </div>
                                <div className={styles.statValue}>{s.value}</div>
                                <div className={styles.statLabel}>{s.label}</div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Academic Credentials Form */}
            <div className={styles.card}>
                <div className={styles.cardHeader}>
                    <h3 className={styles.cardTitle}>Academic Credentials</h3>
                </div>

                <div className={styles.cardBody}>
                    <div className={styles.formGrid}>

                        <div className={styles.formGroup}>
                            <label className={styles.label}>Teacher ID <Hash size={14} /></label>
                            <div className={styles.displayField}>{formData.employee_id || 'N/A'}</div>
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.label}>Department <Building size={14} /></label>
                            <div className={styles.displayField}>{formData.department || 'N/A'}</div>
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.label}>Specialization <Compass size={14} /></label>
                            <div className={styles.displayField}>{formData.specialization || 'N/A'}</div>
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.label}>Academic Degree <Award size={14} /></label>
                            <div className={styles.displayField}>{formData.academic_degree || 'N/A'}</div>
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.label}>Years of Experience <Briefcase size={14} /></label>
                            <div className={styles.displayField}>{formData.years_of_experience || 0} years</div>
                        </div>

                    </div>
                </div>
            </div>

        </div>
    );
}
