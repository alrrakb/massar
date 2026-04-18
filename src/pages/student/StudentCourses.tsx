import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { courseService, EnrolledCourse } from '../../services/courseService';
import { Loader2, FileText, BarChart2, Library, BookOpen, Book, Search, Filter, Users, Calendar, Plus, Info } from 'lucide-react';
import styles from './StudentCourses.module.css';

export default function StudentCourses() {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [filterSemester, setFilterSemester] = useState('all');
    const [filterDept, setFilterDept] = useState('all');
    const [activeTab, setActiveTab] = useState<'current' | 'past' | 'all'>('current');
    const [courses, setCourses] = useState<EnrolledCourse[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const data = await courseService.getEnrolledCourses();
                setCourses(data);
            } catch (error) {
                console.error("Failed to fetch courses", error);
            } finally {
                setLoading(false);
            }
        };
        fetchCourses();
    }, []);

    const filteredCourses = courses.filter(course => {
        const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            course.code.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesTab = activeTab === 'all' ||
            (activeTab === 'current' && course.enrollment_status === 'enrolled') ||
            (activeTab === 'past' && course.enrollment_status === 'completed');

        const matchesSemester = filterSemester === 'all' || course.semester === filterSemester;
        const matchesDept = filterDept === 'all' || course.department === filterDept;

        return matchesSearch && matchesTab && matchesSemester && matchesDept;
    });

    if (loading) {
        return (
            <div className={styles.loading}>
                <Loader2 className="animate-spin" size={40} />
            </div>
        );
    }

    return (
        <div className={styles.container}>

            {/* Header */}
            <div className={styles.header}>
                <div>
                    <h1 className={styles.title}>
                        <Book /> My Courses
                    </h1>
                    <p className={styles.subtitle}>Manage your enrolled courses and view details.</p>
                </div>
                <button className={styles.registerBtn}>
                    <Plus size={20} /> Register New Course
                </button>
            </div>

            {/* Filters Bar */}
            <div className={styles.filtersBar}>
                <div className={styles.searchWrapper}>
                    <div className={styles.searchIcon}>
                        <Search size={20} />
                    </div>
                    <input
                        type="text"
                        placeholder="Search for a course..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className={styles.searchInput}
                    />
                </div>

                <div className={styles.filtersGroup}>
                    <div className={styles.dropdownWrapper}>
                        <select
                            value={filterSemester}
                            onChange={(e) => setFilterSemester(e.target.value)}
                            className={styles.dropdownSelect}
                        >
                            <option value="all">All Semesters</option>
                            <option value="Fall 2024">Fall 2024</option>
                            <option value="Spring 2024">Spring 2024</option>
                        </select>
                        <div className={styles.dropdownIcon}>
                            <Filter size={18} />
                        </div>
                    </div>

                    <div className={styles.dropdownWrapper}>
                        <select
                            value={filterDept}
                            onChange={(e) => setFilterDept(e.target.value)}
                            className={styles.dropdownSelect}
                        >
                            <option value="all">All Departments</option>
                            <option value="Computer Science">Computer Science</option>
                            <option value="Information Systems">Information Systems</option>
                        </select>
                        <div className={styles.dropdownIcon}>
                            <Filter size={18} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Layout */}
            <div className={styles.contentLayout}>

                {/* Main Content */}
                <div className={styles.mainColumn}>
                    {/* Tabs */}
                    <div className={styles.tabsRow}>
                        {['current', 'past', 'all'].map(tab => {
                            const isActive = activeTab === tab;
                            return (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab as typeof activeTab)}
                                    className={`${styles.tabBtn} ${isActive ? styles.activeTab : ''}`}
                                >
                                    {tab} Courses ({courses.filter(c => {
                                        if (tab === 'all') return true;
                                        if (tab === 'current') return c.enrollment_status === 'enrolled';
                                        if (tab === 'past') return c.enrollment_status === 'completed';
                                        return false;
                                    }).length})
                                </button>
                            );
                        })}
                    </div>

                    {/* Course Cards */}
                    <div className={styles.courseList}>
                        {filteredCourses.map(course => (
                            <div key={course.id} className={styles.courseCard}>
                                {/* Course Header */}
                                <div className={styles.cardHeader}>
                                    <div className={styles.courseInfo}>
                                        <div className={styles.courseIcon}>
                                            <BookOpen size={28} color="#8b5cf6" />
                                        </div>
                                        <div>
                                            <h3 className={styles.courseTitle}>{course.title}</h3>
                                            <p className={styles.courseMeta}>
                                                <span className={styles.courseCode}>{course.code}</span>
                                                <span>•</span>
                                                <Users size={14} /> {course.instructor}
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => navigate(`/student/courses/${course.id}`)}
                                        className={styles.viewBtn}
                                    >
                                        View Details →
                                    </button>
                                </div>

                                {/* Compact 2-Column Grid */}
                                <div className={styles.detailsGrid}>

                                    {/* Left Column: Info & Progress */}
                                    <div className={styles.detailColumn}>
                                        <div className={styles.detailSection}>
                                            <h4 className={styles.detailSectionTitle}>
                                                <Info size={16} color="var(--primary)" /> Course Info
                                            </h4>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                                <div className={styles.detailRow}><span className={styles.detailLabel}>Credits:</span> <span className={styles.detailValue}>{course.credits}</span></div>
                                                <div className={styles.detailRow}><span className={styles.detailLabel}>Semester:</span> <span className={styles.detailValue}>{course.semester}</span></div>
                                                <div className={styles.detailRow}><span className={styles.detailLabel}>Department:</span> <span className={styles.detailValue}>{course.department}</span></div>
                                            </div>
                                        </div>

                                        {/* Progress Bar */}
                                        <div>
                                            <div className={styles.progressLabel}>
                                                <span className={styles.progressLabelText}>Course Progress</span>
                                                <span className={styles.progressLabelValue}>{course.average_score}%</span>
                                            </div>
                                            <div className={styles.progressBar}>
                                                <div className={styles.progressFill} style={{ width: `${course.average_score}%` }}></div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right Column: Performance & Upcoming */}
                                    <div className={styles.detailColumn}>
                                        <div className={styles.detailSection}>
                                            <h4 className={styles.detailSectionTitle}>
                                                <BarChart2 size={16} color="var(--primary)" /> Performance
                                            </h4>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                                <div className={styles.detailRow}><span className={styles.detailLabel}>Exams Taken:</span> <span className={styles.detailValue}>{course.exams_taken} / {course.total_exams}</span></div>
                                                <div className={styles.detailRow}><span className={styles.detailLabel}>Average Score:</span> <span className={styles.detailValueGreen}>{course.average_score}%</span></div>
                                            </div>
                                        </div>

                                        <div className={styles.upcomingBox}>
                                            <h4 className={styles.upcomingTitle}>
                                                <Calendar size={14} color="#f59e0b" /> Upcoming
                                            </h4>
                                            <div className={styles.upcomingItem}>
                                                {course.upcoming_exams.length > 0 ? (
                                                    course.upcoming_exams.slice(0, 1).map((event, idx) => (
                                                        <span key={idx} style={{ fontSize: '0.85rem' }}>
                                                            {event.title} <br /><span className={styles.upcomingDate}>{event.date}</span>
                                                        </span>
                                                    ))
                                                ) : (
                                                    <span style={{ fontSize: '0.85rem' }}>No upcoming exams</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Actions Footer */}
                                <div className={styles.actionsFooter}>
                                    <button
                                        className={styles.actionBtn}
                                        onClick={() => navigate(`/student/courses/${course.id}`, { state: { activeTab: 'exams' } })}
                                    >
                                        <FileText size={16} /> Exams
                                    </button>
                                    <button
                                        className={styles.actionBtn}
                                        onClick={() => navigate(`/student/courses/${course.id}`, { state: { activeTab: 'grades' } })}
                                    >
                                        <BarChart2 size={16} /> Grades
                                    </button>
                                    <button
                                        className={styles.actionBtn}
                                        onClick={() => navigate(`/student/courses/${course.id}`, { state: { activeTab: 'materials' } })}
                                    >
                                        <Library size={16} /> Materials
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Sidebar Stats */}
                <div className={styles.sidebar}>
                    <div className={styles.statsCard}>
                        <h3 className={styles.statsTitle}>General Stats</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            <div className={styles.statRow}>
                                <span className={styles.statLabel}>Cumulative GPA</span>
                                <span className={styles.statValueGreen}>3.45 <span className={styles.statValueSmall}>/ 4.0</span></span>
                            </div>
                            <div className={styles.statRow}>
                                <span className={styles.statLabel}>Credits Earned</span>
                                <span className={styles.statValue}>87</span>
                            </div>
                            <div className={styles.statRow}>
                                <span className={styles.statLabel}>Credits Remaining</span>
                                <span className={styles.statValue}>45</span>
                            </div>

                            <div className={styles.degreeProgressBox}>
                                <div className={styles.degreeProgressHeader}>
                                    <span className={styles.degreeProgressLabel}>Degree Progress</span>
                                    <span className={styles.degreeProgressValue}>66%</span>
                                </div>
                                <div className={styles.degreeProgressBar}>
                                    <div className={styles.degreeProgressFill}></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
