import { useAuth } from '../hooks/useAuth';
import { useTeacherDashboard } from '../hooks/useTeacherDashboard';
import { ClipboardList, Users, FileText, Clock, GraduationCap, Brain, TrendingUp, Loader2, AlertCircle } from 'lucide-react';
import StatCard from '../components/dashboard/StatCard';
import QuickActions from '../components/dashboard/QuickActions';
import PerformanceChart from '../components/dashboard/PerformanceChart';
import ActivityFeed from '../components/dashboard/ActivityFeed';
import UpcomingExams from '../components/dashboard/UpcomingExams';
import EmptyDashboard from '../components/dashboard/EmptyDashboard';

export default function TeacherDashboard() {
    const { user } = useAuth();
    const { stats, recentActivity, upcomingExams, examScores, loading, error, refetch } = useTeacherDashboard();

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-full min-h-[60vh] gap-4">
                <Loader2 size={40} className="animate-spin" style={{ color: 'var(--primary)' }} />
                <p style={{ color: 'var(--text-muted)' }}>Loading dashboard...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center h-full min-h-[60vh] gap-4">
                <AlertCircle size={40} style={{ color: 'var(--danger)' }} />
                <p style={{ color: 'var(--danger)' }}>{error}</p>
                <button onClick={refetch} className="btn-primary">Retry</button>
            </div>
        );
    }

    const isEmpty = stats.totalExams === 0 && stats.totalCourses === 0;

    if (isEmpty) {
        return (
            <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
                <h1 className="text-2xl md:text-3xl font-bold mb-8" style={{ color: 'var(--text-main)' }}>
                    Welcome, {user?.full_name?.split(' ')[0] || 'Teacher'}! 👋
                </h1>
                <EmptyDashboard />
            </div>
        );
    }

    return (
        <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold" style={{ color: 'var(--text-main)' }}>
                        Welcome back, {user?.full_name?.split(' ')[0] || 'Teacher'}! 👋
                    </h1>
                    <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
                        Here&apos;s what&apos;s happening across your {stats.totalCourses} course{stats.totalCourses !== 1 ? 's' : ''}
                    </p>
                </div>
            </div>

            {/* Quick Actions */}
            <QuickActions />

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard
                    icon={<ClipboardList size={22} />}
                    label="Total Exams"
                    value={stats.totalExams}
                    color="#6366f1"
                    bgColor="rgba(99,102,241,0.15)"
                />
                <StatCard
                    icon={<Users size={22} />}
                    label="Students"
                    value={stats.totalStudents}
                    color="#2dd4bf"
                    bgColor="rgba(45,212,191,0.15)"
                />
                <StatCard
                    icon={<FileText size={22} />}
                    label="Materials"
                    value={stats.totalMaterials}
                    color="#fb923c"
                    bgColor="rgba(251,146,60,0.15)"
                />
                <StatCard
                    icon={<Clock size={22} />}
                    label="Pending Grade"
                    value={stats.pendingGrading}
                    color="#fb7185"
                    bgColor="rgba(251,113,133,0.15)"
                />
            </div>

            {/* Two-column layout: Chart + Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
                {/* Performance Chart */}
                <div className="glass-card p-5 lg:col-span-3">
                    <div className="flex items-center gap-2 mb-4">
                        <TrendingUp size={18} style={{ color: 'var(--primary)' }} />
                        <h2 className="font-semibold" style={{ color: 'var(--text-main)' }}>Performance Overview</h2>
                    </div>
                    <PerformanceChart data={examScores} />
                </div>

                {/* Recent Activity */}
                <div className="glass-card p-5 lg:col-span-2">
                    <div className="flex items-center gap-2 mb-4">
                        <Clock size={18} style={{ color: 'var(--accent)' }} />
                        <h2 className="font-semibold" style={{ color: 'var(--text-main)' }}>Recent Activity</h2>
                    </div>
                    <ActivityFeed activities={recentActivity} />
                </div>
            </div>

            {/* Two-column: Upcoming + AI Insights */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
                {/* Upcoming Exams */}
                <div className="glass-card p-5 lg:col-span-3">
                    <div className="flex items-center gap-2 mb-4">
                        <GraduationCap size={18} style={{ color: 'var(--accent)' }} />
                        <h2 className="font-semibold" style={{ color: 'var(--text-main)' }}>Upcoming Exams</h2>
                    </div>
                    <UpcomingExams exams={upcomingExams} />
                </div>

                {/* AI & Content Insights */}
                <div className="glass-card p-5 lg:col-span-2">
                    <div className="flex items-center gap-2 mb-4">
                        <Brain size={18} style={{ color: '#8b5cf6' }} />
                        <h2 className="font-semibold" style={{ color: 'var(--text-main)' }}>AI & Content</h2>
                    </div>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 rounded-lg" style={{ background: 'rgba(99,102,241,0.08)' }}>
                            <span className="text-sm" style={{ color: 'var(--text-muted)' }}>Question Bank</span>
                            <span className="text-sm font-bold" style={{ color: 'var(--primary)' }}>{stats.questionBankCount}</span>
                        </div>
                        <div className="flex items-center justify-between p-3 rounded-lg" style={{ background: 'rgba(139,92,246,0.08)' }}>
                            <span className="text-sm" style={{ color: 'var(--text-muted)' }}>Indexed Documents</span>
                            <span className="text-sm font-bold" style={{ color: '#8b5cf6' }}>{stats.indexedDocuments}</span>
                        </div>
                        <div className="flex items-center justify-between p-3 rounded-lg" style={{ background: 'rgba(45,212,191,0.08)' }}>
                            <span className="text-sm" style={{ color: 'var(--text-muted)' }}>Course Materials</span>
                            <span className="text-sm font-bold" style={{ color: 'var(--accent)' }}>{stats.totalMaterials}</span>
                        </div>
                        <div className="flex items-center justify-between p-3 rounded-lg" style={{ background: 'rgba(251,146,60,0.08)' }}>
                            <span className="text-sm" style={{ color: 'var(--text-muted)' }}>Active Courses</span>
                            <span className="text-sm font-bold" style={{ color: '#fb923c' }}>{stats.totalCourses}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
