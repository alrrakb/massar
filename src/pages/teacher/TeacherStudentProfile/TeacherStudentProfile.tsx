import { useParams, useNavigate } from 'react-router-dom';
import { useStudentProfile } from '../../../features/teacher-student-profile/hooks/useStudentProfile';
import {
    ArrowLeft, Mail, User, GraduationCap, BookOpen,
    TrendingUp, CheckCircle, XCircle, Award, Calendar,
    Phone, Building2, Bookmark
} from 'lucide-react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, BarChart, Bar, Cell
} from 'recharts';
import styles from './TeacherStudentProfile.module.css';

export default function TeacherStudentProfile() {
    const { studentId } = useParams<{ studentId: string }>();
    const navigate = useNavigate();
    const { profile, submissions, stats, loading, error } = useStudentProfile(studentId);

    const handleBack = () => {
        navigate(-1);
    };

    const getInitials = (name: string | null) => {
        if (!name) return 'ST';
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    };

    // Prepare chart data - last 10 submissions in chronological order
    const chartData = [...submissions]
        .slice(0, 10)
        .reverse()
        .map((sub, index) => ({
            name: `Exam ${index + 1}`,
            fullName: sub.exam_title,
            score: sub.percentage || 0,
            date: sub.submitted_at ? new Date(sub.submitted_at).toLocaleDateString() : 'N/A'
        }));

    if (loading) {
        return (
            <div className={styles.container}>
                <div className={styles.loadingState}>
                    <div className={styles.spinner}></div>
                    <p>Loading student profile...</p>
                </div>
            </div>
        );
    }

    if (error || !profile) {
        return (
            <div className={styles.container}>
                <div className={styles.errorState}>
                    <XCircle size={48} color="#ef4444" />
                    <h2>Error Loading Profile</h2>
                    <p>{error || 'Student not found'}</p>
                    <button onClick={handleBack} className={styles.backButton}>
                        <ArrowLeft size={16} />
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            {/* Header */}
            <div className={styles.header}>
                <button onClick={handleBack} className={styles.backLink}>
                    <ArrowLeft size={18} />
                    Back
                </button>
            </div>

            {/* Profile Card */}
            <div className={styles.profileCard}>
                <div className={styles.avatarSection}>
                    {profile.avatar_url ? (
                        <img
                            src={profile.avatar_url}
                            alt={profile.full_name || 'Student'}
                            className={styles.avatar}
                        />
                    ) : (
                        <div className={styles.avatarPlaceholder}>
                            {getInitials(profile.full_name)}
                        </div>
                    )}
                </div>
                <div className={styles.infoSection}>
                    <h1 className={styles.name}>{profile.full_name || 'Unknown Student'}</h1>
                    <div className={styles.metaRow}>
                        <span className={styles.metaItem}>
                            <User size={14} />
                            ID: {profile.student_id || 'N/A'}
                        </span>
                        <span className={styles.metaItem}>
                            <Mail size={14} />
                            {profile.email}
                        </span>
                        <span className={styles.metaItem}>
                            <Phone size={14} />
                            {profile.mobile || 'N/A'}
                        </span>
                        <span className={styles.metaItem}>
                            <GraduationCap size={14} />
                            Level: {profile.level || 'N/A'}
                        </span>
                        <span className={styles.metaItem}>
                            <Bookmark size={14} />
                            Major: {profile.major || profile.specialization || profile.department || 'N/A'}
                        </span>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            {stats && (
                <div className={styles.statsGrid}>
                    <div className={styles.statCard}>
                        <div className={styles.statIcon} style={{ background: 'rgba(99, 102, 241, 0.1)' }}>
                            <TrendingUp size={20} color="#6366f1" />
                        </div>
                        <div className={styles.statContent}>
                            <span className={styles.statValue}>{stats.averageScore}%</span>
                            <span className={styles.statLabel}>Average Score</span>
                        </div>
                    </div>

                    <div className={styles.statCard}>
                        <div className={styles.statIcon} style={{ background: 'rgba(16, 185, 129, 0.1)' }}>
                            <BookOpen size={20} color="#10b981" />
                        </div>
                        <div className={styles.statContent}>
                            <span className={styles.statValue}>{stats.completedExams}</span>
                            <span className={styles.statLabel}>Exams Completed</span>
                        </div>
                    </div>

                    <div className={styles.statCard}>
                        <div className={styles.statIcon} style={{ background: 'rgba(139, 92, 246, 0.1)' }}>
                            <Award size={20} color="#8b5cf6" />
                        </div>
                        <div className={styles.statContent}>
                            <span className={styles.statValue}>{stats.passRate}%</span>
                            <span className={styles.statLabel}>Pass Rate</span>
                        </div>
                    </div>

                    <div className={styles.statCard}>
                        <div className={styles.statIcon} style={{ background: stats.passCount >= stats.failCount ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)' }}>
                            {stats.passCount >= stats.failCount ? (
                                <CheckCircle size={20} color="#10b981" />
                            ) : (
                                <XCircle size={20} color="#ef4444" />
                            )}
                        </div>
                        <div className={styles.statContent}>
                            <span className={styles.statValue}>{stats.passCount}/{stats.failCount}</span>
                            <span className={styles.statLabel}>Pass/Fail</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Analytics Section */}
            <div className={styles.analyticsSection}>
                <h2 className={styles.sectionTitle}>Performance Analytics</h2>
                {submissions.length > 0 ? (
                    <div className={styles.chartContainer}>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                                <XAxis
                                    dataKey="name"
                                    stroke="#64748b"
                                    fontSize={12}
                                    tickLine={false}
                                />
                                <YAxis
                                    stroke="#64748b"
                                    fontSize={12}
                                    tickLine={false}
                                    domain={[0, 100]}
                                    tickFormatter={(value) => `${value}%`}
                                />
                                <Tooltip
                                    contentStyle={{
                                        background: '#1e293b',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        borderRadius: '8px',
                                        color: '#fff'
                                    }}
                                    formatter={(value: number) => [`${value}%`, 'Score']}
                                    labelFormatter={(label, payload) => {
                                        const item = payload?.[0]?.payload;
                                        return item?.fullName || label;
                                    }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="score"
                                    stroke="#6366f1"
                                    strokeWidth={3}
                                    dot={{ fill: '#6366f1', strokeWidth: 0, r: 4 }}
                                    activeDot={{ r: 6, fill: '#818cf8' }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                ) : (
                    <div className={styles.emptyChart}>
                        <TrendingUp size={48} color="#64748b" />
                        <p>No exam data available for analytics</p>
                    </div>
                )}
            </div>

            {/* Recent Exams Table */}
            <div className={styles.examsSection}>
                <h2 className={styles.sectionTitle}>Recent Exams</h2>
                {submissions.length > 0 ? (
                    <div className={styles.tableContainer}>
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th>Exam Name</th>
                                    <th>Subject</th>
                                    <th>Date</th>
                                    <th>Score</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {submissions.map((sub) => {
                                    const isPass = (sub.percentage || 0) >= 60;
                                    return (
                                        <tr key={sub.id}>
                                            <td>
                                                <div className={styles.examNameCell}>
                                                    <BookOpen size={16} color="#64748b" />
                                                    <span>{sub.exam_title}</span>
                                                </div>
                                            </td>
                                            <td>{sub.exam_subject || '-'}</td>
                                            <td>
                                                <div className={styles.dateCell}>
                                                    <Calendar size={14} color="#64748b" />
                                                    {sub.submitted_at
                                                        ? new Date(sub.submitted_at).toLocaleDateString()
                                                        : 'N/A'
                                                    }
                                                </div>
                                            </td>
                                            <td>
                                                <div className={styles.scoreCell}>
                                                    <span className={styles.scoreValue}>
                                                        {sub.score} / {sub.total_marks}
                                                    </span>
                                                    <span
                                                        className={styles.scorePercentage}
                                                        style={{ color: isPass ? '#10b981' : '#ef4444' }}
                                                    >
                                                        {sub.percentage}%
                                                    </span>
                                                </div>
                                            </td>
                                            <td>
                                                <span className={`${styles.statusBadge} ${isPass ? styles.passBadge : styles.failBadge}`}>
                                                    {isPass ? 'PASS' : 'FAIL'}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className={styles.emptyState}>
                        <BookOpen size={48} color="#64748b" />
                        <p>No completed exams yet</p>
                    </div>
                )}
            </div>
        </div>
    );
}
