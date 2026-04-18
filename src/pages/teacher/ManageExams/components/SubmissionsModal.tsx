import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Clock, FileText, Activity, Layers, CheckCircle, AlertCircle, RefreshCw, Download, User } from 'lucide-react';
import styles from './SubmissionsModal.module.css';
import { examService } from '../../../../services/examService';
import { exportSubmissionsToExcel } from '../../../../features/submission-export/api/exportToExcel';
import LoadingSpinner from '../../../../components/LoadingSpinner';
import toast from 'react-hot-toast';

interface SubmissionsModalProps {
    exam: any; // The exam object selected from the dashboard
    onClose: () => void;
}

export default function SubmissionsModal({ exam, onClose }: SubmissionsModalProps) {
    const navigate = useNavigate();
    const [submissions, setSubmissions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const handleViewProfile = (studentId: string) => {
        navigate(`/teacher/students/${studentId}`);
    };

    const fetchSubmissions = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await examService.getExamSubmissions(exam.id);
            setSubmissions(data || []);
        } catch (err: any) {
            console.error("Failed to load submissions", err);
            setError(err.message || 'Failed to load submissions');
        } finally {
            setLoading(false);
        }
    };

    const handleExport = async () => {
        const count = await exportSubmissionsToExcel(submissions, exam.title, exam.total_marks);
        if (count > 0) {
            toast.success(`Exported ${count} student grades`);
        } else {
            toast.error('No graded submissions to export');
        }
    };

    useEffect(() => {
        if (exam?.id) {
            fetchSubmissions();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [exam?.id]);

    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    // Derived Stats
    const totalSubmissions = submissions.length;
    const gradedSubmissions = submissions.filter(s => s.status === 'submitted');
    const avgScore = gradedSubmissions.length > 0
        ? Math.round(gradedSubmissions.reduce((acc, curr) => acc + (curr.score || 0), 0) / gradedSubmissions.length)
        : 0;

    return (
        <div className={styles.overlay} onClick={handleBackdropClick}>
            <div className={styles.modal}>
                <header className={styles.header}>
                    <div className={styles.titleArea}>
                        <h2>{exam.title}</h2>
                        <div className={styles.statsRow}>
                            <span className={styles.statBadge}>
                                <FileText size={16} />
                                {totalSubmissions} Submissions
                            </span>
                            <span className={styles.statBadge}>
                                <Activity size={16} />
                                Avg Score: {avgScore} / {exam.total_marks || '?'}
                            </span>
                        </div>
                        <button
                            className={styles.exportBtn}
                            onClick={handleExport}
                            disabled={gradedSubmissions.length === 0}
                        >
                            <Download size={16} />
                            Export Excel
                        </button>
                    </div>
                    <button className={styles.closeBtn} onClick={onClose} aria-label="Close modal">
                        <X size={20} />
                    </button>
                </header>

                <div className={styles.content}>
                    {loading ? (
                        <LoadingSpinner fullScreen={false} text="Loading submissions..." />
                    ) : error ? (
                        <div className={styles.emptyState}>
                            <AlertCircle className={styles.emptyIcon} style={{ color: '#ef4444' }} />
                            <h3>Error Loading Submissions</h3>
                            <p>{error}</p>
                            <button
                                onClick={fetchSubmissions}
                                style={{
                                    display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                                    marginTop: '1rem', padding: '0.6rem 1.2rem',
                                    background: 'rgba(99, 102, 241, 0.1)',
                                    border: '1px solid rgba(99, 102, 241, 0.3)',
                                    color: 'var(--primary)', borderRadius: '8px',
                                    cursor: 'pointer', fontWeight: 500
                                }}
                            >
                                <RefreshCw size={14} /> Try Again
                            </button>
                        </div>
                    ) : submissions.length === 0 ? (
                        <div className={styles.emptyState}>
                            <Layers className={styles.emptyIcon} />
                            <h3>No submissions yet</h3>
                            <p>When students take this exam, their results will appear here.</p>
                        </div>
                    ) : (
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th>Student</th>
                                    <th>Started At</th>
                                    <th>Status</th>
                                    <th>Score</th>
                                    <th style={{ textAlign: 'right' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {submissions.map((sub: any) => {
                                    const profile = sub.profiles;
                                    const isSubmitted = sub.status === 'submitted';
                                    const pct = exam.total_marks > 0 && isSubmitted
                                        ? Math.round(((sub.score || 0) / exam.total_marks) * 100)
                                        : 0;

                                    return (
                                        <tr key={sub.id}>
                                            <td>
                                                <div
                                                    className={styles.studentCell}
                                                    style={{ cursor: 'pointer' }}
                                                    onClick={() => handleViewProfile(sub.student_id)}
                                                    title="Click to view student profile"
                                                >
                                                    <img
                                                        src={profile?.avatar_url || 'https://ui-avatars.com/api/?name=Student&background=random'}
                                                        alt="Avatar"
                                                        className={styles.avatar}
                                                    />
                                                    <div>
                                                        <span className={`${styles.studentName} ${styles.clickableName}`}>
                                                            {profile?.full_name || 'Unknown Student'}
                                                        </span>
                                                        <span className={styles.studentId}>
                                                            ID: {profile?.student_id || 'N/A'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <div className={styles.studentCell}>
                                                    <Clock size={14} style={{ color: '#64748b' }} />
                                                    <span className={styles.timestamp}>
                                                        {sub.started_at ? new Date(sub.started_at).toLocaleString() : 'N/A'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td>
                                                <span className={`${styles.statusBadge} ${styles[`status_${sub.status}`]}`}>
                                                    {isSubmitted ? 'Graded' : 'In Progress'}
                                                </span>
                                            </td>
                                            <td>
                                                {isSubmitted ? (
                                                    <div className={styles.scoreBox}>
                                                        <span className={styles.scoreVal}>{sub.score} / {exam.total_marks}</span>
                                                        <span className={styles.scorePct}>{pct}%</span>
                                                    </div>
                                                ) : (
                                                    <span className={styles.scorePct}>Pending</span>
                                                )}
                                            </td>
                                            <td style={{ textAlign: 'right' }}>
                                                <div className={styles.actionButtons}>
                                                    <button
                                                        className={styles.profileBtn}
                                                        onClick={() => handleViewProfile(sub.student_id)}
                                                        title="View student profile"
                                                    >
                                                        <User size={16} />
                                                        Profile
                                                    </button>
                                                    <button
                                                        className={styles.reviewBtn}
                                                        disabled={!isSubmitted}
                                                        style={!isSubmitted ? { opacity: 0.3 } : undefined}
                                                    >
                                                        <CheckCircle size={16} />
                                                        Review
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
}
