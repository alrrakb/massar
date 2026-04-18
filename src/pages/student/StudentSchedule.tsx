import { useState, useEffect } from 'react';
import { examService, Exam } from '../../services/examService';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useNavigate } from 'react-router-dom';
import styles from './StudentSchedule.module.css';

const Icons = {
    ChevronLeft: () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width="20" height="20"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>,
    ChevronRight: () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width="20" height="20"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>,
    Calendar: () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width="20" height="20"><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 9v7.5m-9-6h.008v.008H12v-.008zM12 15h.008v.008H12V15zm0 2.25h.008v.008H12v-.008zM9.75 15h.008v.008H9.75V15zm0 2.25h.008v.008H9.75v-.008zM7.5 15h.008v.008H7.5V15zm0 2.25h.008v.008H7.5v-.008zm6.75-4.5h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V15zm0 2.25h.008v.008h-.008v-.008zm2.25-4.5h.008v.008H16.5v-.008zm0 2.25h.008v.008H16.5V15z" /></svg>,
    List: () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width="20" height="20"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" /></svg>,
    Clock: () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width="14" height="14"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
};

export default function StudentSchedule() {
    const navigate = useNavigate();
    const [exams, setExams] = useState<Exam[]>([]);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState<'month' | 'week' | 'list'>('month');
    const [currentDate, setCurrentDate] = useState(new Date());

    useEffect(() => {
        const loadExams = async () => {
            try {
                const data = await examService.getExams();
                setExams(data);
            } catch (err) {
                console.error("Failed to load exams", err);
            } finally {
                setLoading(false);
            }
        };
        loadExams();
    }, []);

    // --- Calendar Logic ---

    const getDaysInMonth = (year: number, month: number) => {
        return new Date(year, month + 1, 0).getDate();
    };

    const getFirstDayOfMonth = (year: number, month: number) => {
        return new Date(year, month, 1).getDay(); // 0 = Sunday
    };

    const navigatePeriod = (direction: 'prev' | 'next') => {
        const newDate = new Date(currentDate);
        if (view === 'week') {
            newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
        } else {
            newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
        }
        setCurrentDate(newDate);
    };

    const isSameDate = (d1: Date, d2: Date) => {
        return d1.getFullYear() === d2.getFullYear() &&
            d1.getMonth() === d2.getMonth() &&
            d1.getDate() === d2.getDate();
    };

    const getStatus = (exam: Exam) => {
        if (!exam.start_time) return 'upcoming'; // Default
        const examDate = new Date(exam.start_time);
        const now = new Date();
        const isSubmitted = exam.submission_status === 'submitted';

        if (isSubmitted) return 'completed';
        if (examDate < now && !isSubmitted) return 'missed';
        if (isSameDate(examDate, now)) return 'today';
        return 'upcoming';
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed': return { bg: 'rgba(249, 115, 22, 0.2)', text: '#f97316', border: '#f97316' }; // Orange
            case 'missed': return { bg: 'rgba(239, 68, 68, 0.2)', text: '#ef4444', border: '#ef4444' }; // Red
            case 'today': return { bg: 'rgba(16, 185, 129, 0.2)', text: '#10b981', border: '#10b981' }; // Green
            case 'upcoming': return { bg: 'rgba(59, 130, 246, 0.2)', text: '#3b82f6', border: '#3b82f6' }; // Blue
            default: return { bg: 'rgba(255, 255, 255, 0.1)', text: '#9ca3af', border: '#4b5563' };
        }
    };

    // --- Render Helpers ---

    const monthNames = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    if (loading) return <LoadingSpinner fullScreen text="Loading schedule..." />;

    const renderDayCell = (dayDate: Date, isOutsideMonth: boolean = false) => {
        const dayExams = exams.filter(e => e.start_time && isSameDate(new Date(e.start_time), dayDate));
        const isToday = isSameDate(dayDate, new Date());

        const cellClasses = [
            styles.dayCell,
            dayExams.length > 0 ? styles.dayCellHasExams : '',
            isToday ? styles.dayCellToday : '',
            isOutsideMonth ? styles.dayCellOutside : '',
        ].filter(Boolean).join(' ');

        return (
            <div key={dayDate.toISOString()} className={cellClasses}
                onClick={() => {
                    if (dayExams.length > 0) {
                        navigate('/student/exams');
                    }
                }}
            >
                <div className={`${styles.dayNumber} ${isToday ? styles.dayNumberToday : ''}`}>
                    {dayDate.getDate()}
                </div>

                <div className={styles.examChipsContainer}>
                    {dayExams.map(exam => {
                        const status = getStatus(exam);
                        const colors = getStatusColor(status);
                        return (
                            <div key={exam.id}
                                className={styles.examChip}
                                style={{ background: colors.bg, color: colors.text, borderLeft: `2px solid ${colors.border}` }}
                                title={`${exam.title} - ${new Date(exam.start_time!).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
                            >
                                <span>{exam.title}</span>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    const renderMonthView = () => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const daysInMonth = getDaysInMonth(year, month);
        const firstDay = getFirstDayOfMonth(year, month);

        const days = [];
        // Empty slots
        for (let i = 0; i < firstDay; i++) {
            days.push(<div key={`empty-${i}`} className={`${styles.dayCell} ${styles.dayCellEmpty}`}></div>);
        }

        // Days
        for (let day = 1; day <= daysInMonth; day++) {
            days.push(renderDayCell(new Date(year, month, day)));
        }

        return (
            <div className={styles.calendarGrid}>
                {daysOfWeek.map(d => (
                    <div key={d} className={styles.dayHeader}>{d}</div>
                ))}
                {days}
            </div>
        );
    };

    const renderWeekView = () => {
        const startOfWeek = new Date(currentDate);
        const day = startOfWeek.getDay();
        startOfWeek.setDate(startOfWeek.getDate() - day); // Set to Sunday

        const days = [];
        for (let i = 0; i < 7; i++) {
            const date = new Date(startOfWeek);
            date.setDate(startOfWeek.getDate() + i);
            days.push(renderDayCell(date));
        }

        return (
            <div className={styles.calendarGrid}>
                {daysOfWeek.map(d => (
                    <div key={d} className={styles.dayHeader}>{d}</div>
                ))}
                {days}
            </div>
        );
    };

    const renderListView = () => {
        const monthExams = exams.filter(e => {
            if (!e.start_time) return false;
            const d = new Date(e.start_time);
            return d.getMonth() === currentDate.getMonth() && d.getFullYear() === currentDate.getFullYear();
        }).sort((a, b) => new Date(a.start_time!).getTime() - new Date(b.start_time!).getTime());

        if (monthExams.length === 0) {
            return <div className={styles.listEmpty}>No exams found for this month.</div>;
        }

        return (
            <div className={styles.listContainer}>
                {monthExams.map(exam => {
                    const status = getStatus(exam);
                    const colors = getStatusColor(status);
                    return (
                        <div key={exam.id}
                            onClick={() => navigate(`/student/exam/${exam.id}`)}
                            className={`glass-card ${styles.listItem}`}
                            style={{ borderLeft: `4px solid ${colors.border}` }}
                        >
                            <div className={styles.listItemContent}>
                                <h3 className={styles.listItemTitle}>{exam.title}</h3>
                                <p className={styles.listItemDate}>
                                    {new Date(exam.start_time!).toLocaleDateString()} at {new Date(exam.start_time!).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </p>
                            </div>
                            <span className={styles.statusBadge} style={{ background: colors.bg, color: colors.text }}>
                                {status.toUpperCase()}
                            </span>
                        </div>
                    );
                })}
            </div>
        );
    };

    return (
        <div className={styles.container}>
            {/* Header */}
            <div className={styles.header}>
                <h1 className={styles.pageTitle}>Exam Schedule</h1>
                <p className={styles.pageSubtitle}>Stay organized and never miss an upcoming exam.</p>
            </div>

            {/* Controls Bar */}
            <div className={`glass-card ${styles.controlsBar}`}>

                {/* View Toggles */}
                <div className={styles.viewToggleGroup}>
                    <button
                        onClick={() => setView('month')}
                        className={`${styles.viewToggleBtn} ${view === 'month' ? styles.viewToggleBtnActive : ''}`}
                    >
                        <Icons.Calendar /> Month
                    </button>
                    <button
                        onClick={() => setView('week')}
                        className={`${styles.viewToggleBtn} ${view === 'week' ? styles.viewToggleBtnActive : ''}`}
                    >
                        <Icons.List /> Week
                    </button>
                    <button
                        onClick={() => setView('list')}
                        className={`${styles.viewToggleBtn} ${view === 'list' ? styles.viewToggleBtnActive : ''}`}
                    >
                        <Icons.List /> List
                    </button>
                </div>

                {/* Month Navigation */}
                <div className={styles.navGroup}>
                    <button onClick={() => navigatePeriod('prev')} className={styles.navBtn}>
                        <Icons.ChevronLeft />
                    </button>
                    <span className={styles.navLabel}>
                        {view === 'week'
                            ? `Week of ${monthNames[currentDate.getMonth()]} ${currentDate.getDate()}`
                            : `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`
                        }
                    </span>
                    <button onClick={() => navigatePeriod('next')} className={styles.navBtn}>
                        <Icons.ChevronRight />
                    </button>
                </div>
            </div>

            {/* Calendar Grid */}
            <div className={`glass-card ${styles.calendarContainer}`}>
                {view === 'month' && renderMonthView()}
                {view === 'week' && renderWeekView()}
                {view === 'list' && renderListView()}
            </div>

            {/* Legend */}
            <div className={styles.legend}>
                <div className={styles.legendItem}>
                    <div className={styles.legendDot} style={{ background: '#3b82f6' }}></div>
                    <span className={styles.legendLabel}>Upcoming</span>
                </div>
                <div className={styles.legendItem}>
                    <div className={styles.legendDot} style={{ background: '#10b981' }}></div>
                    <span className={styles.legendLabel}>Today</span>
                </div>
                <div className={styles.legendItem}>
                    <div className={styles.legendDot} style={{ background: '#f97316' }}></div>
                    <span className={styles.legendLabel}>Completed</span>
                </div>
                <div className={styles.legendItem}>
                    <div className={styles.legendDot} style={{ background: '#ef4444' }}></div>
                    <span className={styles.legendLabel}>Missed / Overdue</span>
                </div>
            </div>
        </div>
    );
}
