import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { examService } from '../../services/examService';
import LoadingSpinner from '../../components/LoadingSpinner';
import { Search, Filter, Download as DownloadIcon, Trophy, TrendingUp, Target, Clock, AlertCircle } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, Tooltip, XAxis, YAxis, CartesianGrid } from 'recharts';
import styles from './StudentResults.module.css';

export default function StudentResults() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [results, setResults] = useState<any[]>([]);
    const [filteredResults, setFilteredResults] = useState<any[]>([]);

    // Filters & Sorting
    const [search, setSearch] = useState('');
    const [subjectFilter, setSubjectFilter] = useState('All');
    const [sortOrder, setSortOrder] = useState('Newest');

    useEffect(() => {
        const fetchResults = async () => {
            try {
                const data = await examService.getUserResults();
                setResults(data);
                setFilteredResults(data);
            } catch (error) {
                console.error("Failed to load results", error);
            } finally {
                setLoading(false);
            }
        };
        fetchResults();
    }, []);

    useEffect(() => {
        let res = [...results];

        // 1. Search Filter
        if (search) {
            res = res.filter(r => r.title.toLowerCase().includes(search.toLowerCase()));
        }

        // 2. Subject Filter
        if (subjectFilter !== 'All') {
            res = res.filter(r => r.subject === subjectFilter);
        }

        // 3. Sorting
        res.sort((a, b) => {
            if (sortOrder === 'Newest') return new Date(b.date).getTime() - new Date(a.date).getTime();
            if (sortOrder === 'Oldest') return new Date(a.date).getTime() - new Date(b.date).getTime();
            if (sortOrder === 'Highest') return b.percentage - a.percentage;
            if (sortOrder === 'Lowest') return a.percentage - b.percentage;
            return 0;
        });

        setFilteredResults(res);
    }, [search, subjectFilter, sortOrder, results]);

    // Safe Stats Calculation (O(N) safe from stack overflow)
    const totalExams = filteredResults.length;
    const avgScore = totalExams > 0
        ? Math.round(filteredResults.reduce((acc, curr) => acc + curr.percentage, 0) / totalExams)
        : 0;

    const highestScore = totalExams > 0
        ? filteredResults.reduce((max, r) => (r.percentage > max ? r.percentage : max), 0)
        : 0;

    const lowestScore = totalExams > 0
        ? filteredResults.reduce((min, r) => (r.percentage < min ? r.percentage : min), 100)
        : 0;

    const handleDownload = () => {
        if (filteredResults.length === 0) return;

        const headers = ['Exam Title', 'Subject', 'Date', 'Score (%)', 'Status'];
        const csvRows = [
            headers.join(','),
            ...filteredResults.map(r => [
                `"${r.title}"`,
                `"${r.subject || 'General'}"`,
                new Date(r.date).toLocaleDateString(),
                r.percentage,
                r.status
            ].join(','))
        ];

        const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `my-results-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    if (loading) return <LoadingSpinner fullScreen text="Loading results..." />;

    return (
        <div className={styles.container}>
            {/* Header */}
            <div className={styles.header}>
                <h1 className={styles.pageTitle}>My Results</h1>
                <p className={styles.pageSubtitle}>Track your progress and analyze your performance.</p>
            </div>

            {/* Filters Bar */}
            <div className={`glass-card ${styles.filtersBar}`}>
                {/* Search */}
                <div className={styles.searchWrapper}>
                    <input
                        type="text"
                        placeholder="Search exams..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className={styles.searchInput}
                    />
                    <span className={styles.searchIcon}>
                        <Search size={20} />
                    </span>
                </div>

                {/* Subject Filter */}
                <div className={styles.filterWrapper}>
                    <select
                        value={subjectFilter}
                        onChange={(e) => setSubjectFilter(e.target.value)}
                        className={styles.filterSelect}
                    >
                        <option value="All">All Subjects</option>
                        {Array.from(new Set(results.map(r => r.subject).filter(Boolean))).map(sub => (
                            <option key={String(sub)} value={String(sub)}>{String(sub)}</option>
                        ))}
                    </select>
                    <span className={styles.filterIcon}>
                        <Filter size={20} />
                    </span>
                </div>

                {/* Sort Order Select */}
                <div className={styles.filterWrapper}>
                    <select
                        value={sortOrder}
                        onChange={(e) => setSortOrder(e.target.value)}
                        className={styles.filterSelect}
                    >
                        <option value="Newest">Sort: Newest First</option>
                        <option value="Oldest">Sort: Oldest First</option>
                        <option value="Highest">Sort: Highest Score</option>
                        <option value="Lowest">Sort: Lowest Score</option>
                    </select>
                </div>

                {/* Export Button */}
                <button
                    onClick={handleDownload}
                    disabled={filteredResults.length === 0}
                    className={styles.exportBtn}
                >
                    <DownloadIcon size={20} /> <span>Export CSV</span>
                </button>
            </div>

            {/* General Stats */}
            <div className={`glass-card ${styles.statsCard}`}>
                <h3 className={styles.statsHeader}>General Statistics</h3>
                <div className={styles.statsGrid}>
                    <div className={styles.statItem}>
                        <div className={styles.statLabel}>Overall Average</div>
                        <div className={`${styles.statValue} ${avgScore >= 75 ? styles.statValueGreen : avgScore >= 50 ? '' : styles.statValueRed}`} style={{ color: avgScore >= 75 ? '#10b981' : avgScore >= 50 ? '#f59e0b' : '#ef4444' }}>
                            {avgScore}%
                        </div>
                    </div>
                    <div className={`${styles.statItem} ${styles.statItemBordered}`}>
                        <div className={styles.statLabel}>Total Exams</div>
                        <div className={`${styles.statValue} ${styles.statValueWhite}`}>
                            {totalExams}
                        </div>
                    </div>
                    <div className={`${styles.statItem} ${styles.statItemBordered}`}>
                        <div className={styles.statLabel}>Highest Score</div>
                        <div className={`${styles.statValue} ${styles.statValueGreen}`}>
                            {highestScore}%
                        </div>
                    </div>
                    <div className={`${styles.statItem} ${styles.statItemBordered}`}>
                        <div className={styles.statLabel}>Lowest Score</div>
                        <div className={`${styles.statValue} ${styles.statValueRed}`}>
                            {lowestScore}%
                        </div>
                    </div>
                </div>
            </div>

            {/* Performance Trend Chart */}
            <div className={`glass-card ${styles.chartCard}`}>
                <h3 className={styles.chartHeader}>
                    <span className={styles.chartHeaderIcon}><TrendingUp size={24} /></span> Performance Trend
                </h3>
                <div className={styles.chartWrapper}>
                    {results.length > 1 ? (
                        <div className={styles.chartContainer}>
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={[...results].reverse()} margin={{ top: 20, right: 20, left: -20, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorScore" x1="0" y1="0" x2="1" y2="0">
                                            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={1} />
                                            <stop offset="95%" stopColor="#6366f1" stopOpacity={1} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                    <XAxis
                                        dataKey="date"
                                        tickFormatter={(t) => new Date(t).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                        stroke="rgba(255,255,255,0.2)"
                                        tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }}
                                        dy={10}
                                    />
                                    <YAxis
                                        domain={[0, 100]}
                                        stroke="rgba(255,255,255,0.2)"
                                        tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }}
                                    />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '12px', background: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(255,255,255,0.1)' }}
                                        itemStyle={{ color: '#10b981', fontWeight: 'bold' }}
                                        labelFormatter={(label) => new Date(label).toLocaleDateString()}
                                        formatter={(value: any) => [`${value}%`, 'Score']}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="percentage"
                                        stroke="url(#colorScore)"
                                        strokeWidth={4}
                                        dot={{ fill: 'var(--bg-card)', stroke: '#8b5cf6', strokeWidth: 2, r: 5 }}
                                        activeDot={{ r: 7, fill: '#6366f1', stroke: 'white' }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    ) : results.length === 1 ? (
                        <div className={styles.singleResultPlaceholder}>
                            <svg viewBox="0 0 1000 300" style={{ position: 'absolute', width: '100%', height: '100%', opacity: 0.1, pointerEvents: 'none' }}>
                                <path d="M 0 300 Q 250 150 500 200 T 1000 50" fill="none" stroke="url(#placeholderGradient)" strokeWidth="4" />
                                <defs>
                                    <linearGradient id="placeholderGradient" x1="0" y1="0" x2="1" y2="0">
                                        <stop offset="0%" stopColor="#8b5cf6" />
                                        <stop offset="100%" stopColor="#6366f1" />
                                    </linearGradient>
                                </defs>
                            </svg>
                            <div className={styles.placeholderCard}>
                                <TrendingUp size={36} color="#8b5cf6" />
                                <h4 className={styles.placeholderTitle}>Baseline Established</h4>
                                <p className={styles.placeholderText}>
                                    You scored <strong>{results[0].percentage}%</strong> on your first exam. Take more exams to unlock live trend tracking!
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className={styles.emptyChart}>
                            <div style={{ opacity: 0.3 }}><TrendingUp size={48} /></div>
                            Insufficient data. Take your first exam to view statistics.
                        </div>
                    )}
                </div>
            </div>

            {/* Detailed Results List or Empty State */}
            {filteredResults.length === 0 ? (
                <div className={`glass-card ${styles.emptyState}`}>
                    <div className={styles.emptyIconCircle}>
                        <AlertCircle size={40} />
                    </div>
                    <h3 className={styles.emptyTitle}>No Results Found</h3>
                    <p className={styles.emptyText}>
                        We couldn't find any exams matching your current search or filter criteria. Try adjusting your filters to see more results.
                    </p>
                </div>
            ) : (
                <div className={styles.resultsList}>
                    {filteredResults.map((result) => (
                        <div key={result.id} className={`glass-card ${styles.resultCard}`}>
                            <div className={styles.resultHeader}>
                                <div>
                                    <h3 className={styles.resultTitle}>{result.title}</h3>
                                    <div className={styles.resultMeta}>
                                        {new Date(result.date).toLocaleDateString()} • {result.subject || 'General'}
                                    </div>
                                </div>
                                <div className={styles.resultScore}>
                                    <div className={styles.scoreValue} style={{ color: result.percentage >= 80 ? '#10b981' : result.percentage >= 50 ? '#f59e0b' : '#ef4444' }}>
                                        {result.percentage}%
                                    </div>
                                    <div className={`${styles.statusBadge} ${result.status === 'Passed' ? styles.statusPassed : styles.statusFailed}`}>
                                        {result.status}
                                    </div>
                                </div>
                            </div>

                            {/* Progress Bar */}
                            <div className={styles.progressBar}>
                                <div
                                    className={styles.progressFill}
                                    style={{
                                        width: `${result.percentage}%`,
                                        background: result.percentage >= 80 ? '#10b981' : result.percentage >= 50 ? '#f59e0b' : '#ef4444'
                                    }}
                                />
                            </div>

                            {/* Actions */}
                            <div className={styles.actions}>
                                <button
                                    onClick={() => navigate(`/student/exams/${result.examId}`)}
                                    className={styles.viewDetailsBtn}
                                >
                                    View Details
                                </button>
                                <button
                                    onClick={() => navigate(`/student/exams/${result.examId}/review`)}
                                    className={`btn-primary ${styles.reviewBtn}`}
                                >
                                    Review Answers
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Bottom Stats Cards */}
            <div className={styles.bottomStatsGrid}>
                <StatCard icon={<Trophy size={32} />} title="Top Result" value={`${highestScore}%`} subtext="Best performance yet" color="#fbbf24" />
                <StatCard icon={<TrendingUp size={32} />} title="Progress" value="+12%" subtext="vs last month" color="#3b82f6" />
                <StatCard icon={<Target size={32} />} title="Accuracy" value="88%" subtext="Correct answers" color="#10b981" />
                <StatCard icon={<Clock size={32} />} title="Avg Speed" value="35m" subtext="Per exam" color="#8b5cf6" />
            </div>
        </div>
    );
}

function StatCard({ icon, title, value, subtext, color }: any) {
    return (
        <div className={`glass-card ${styles.statCard}`}>
            <div className={styles.statCardGlow} style={{ background: color }} />
            <div className={styles.statCardIcon} style={{ color: color }}>
                {icon}
            </div>
            <div className={styles.statCardTitle}>{title}</div>
            <div className={styles.statCardValue}>{value}</div>
            <div className={styles.statCardSubtext}>{subtext}</div>
        </div>
    );
}
