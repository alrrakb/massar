import { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import UserAvatar from './UserAvatar';
import NotificationBell from '../features/notifications/components/NotificationBell/NotificationBell';
import styles from './Layout.module.css'

// Simple Icon Components for cleaner JSX
const Icons = {
    Dashboard: () => (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width="20" height="20">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
        </svg>
    ),
    Exams: () => (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width="20" height="20">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
        </svg>
    ),
    Results: () => (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width="20" height="20">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
        </svg>
    ),
    Schedule: () => (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width="20" height="20">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
        </svg>
    ),
    Subjects: () => (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width="20" height="20">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
        </svg>
    ),
    Users: () => (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width="20" height="20">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
        </svg>
    ),
    Settings: () => (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width="20" height="20">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 011.45.12l.773.774c.39.389.44 1.002.12 1.45l-.527.737c-.25.35-.272.806-.107 1.204.165.397.505.71.93.78l.893.15c.543.09.94.56.94 1.109v1.094c0 .55-.397 1.02-.94 1.11l-.894.149c-.424.07-.764.383-.929.78-.165.398-.143.854.107 1.204l.527.738c.32.447.269 1.06-.12 1.45l-.774.773a1.125 1.125 0 01-1.449.12l-.738-.527c-.35-.25-.806-.272-1.203-.107-.397.165-.71.505-.781.929l-.149.894c-.09.542-.56.94-1.11.94h-1.094c-.55 0-1.019-.398-1.11-.94l-.148-.894c-.071-.424-.384-.764-.781-.93-.398-.164-.854-.142-1.204.108l-.738.527c-.447.32-1.06.269-1.45-.12l-.773-.774a1.125 1.125 0 01-.12-1.45l.527-.737c.25-.35.273-.806.108-1.204-.165-.397-.506-.71-.93-.78l-.894-.15c-.542-.09-.94-.56-.94-1.109v-1.094c0-.55.398-1.02.94-1.11l.894-.149c.424-.07.765-.383.93-.78.165-.398.143-.854-.107-1.204l-.527-.738a1.125 1.125 0 01.12-1.45l.773-.773a1.125 1.125 0 011.45-.12l.737.527c.35.25.807.272 1.204.107.397-.165.71-.505.78-.929l.15-.894z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
    ),
    Logout: () => (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width="20" height="20">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
        </svg>
    ),
    Plus: () => (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width="20" height="20">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
    ),
    Menu: () => (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width="24" height="24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
        </svg>
    ),
    Close: () => (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width="24" height="24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
    ),
    Notifications: () => (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width="20" height="20">
            <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
        </svg>
    ),
    BookOpen: () => (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width="20" height="20">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
        </svg>
    ),
    Students: () => (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width="20" height="20">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A48.767 48.767 0 0012 4.69a48.767 48.767 0 008.232 3.644 50.57 50.57 0 00-2.658.813m-15.482 0A50.55 50.55 0 0112 2.253a50.55 50.55 0 018.232 3.644m-15.482 0a50.55 50.55 0 012.658.813A48.767 48.767 0 0012 13.31a48.767 48.767 0 00-8.232-3.644 50.55 50.55 0 01-2.658-.813" />
        </svg>
    ),
    Teachers: () => (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width="20" height="20">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
        </svg>
    )
};



export default function Layout() {
    const { user, signOut } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const handleLogout = async () => {
        const isAdmin = user?.role === 'admin';
        await signOut();
        navigate(isAdmin ? '/admin/login' : '/login');
    };

    const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
    const closeSidebar = () => setSidebarOpen(false);

    if (!user) return <Navigate to="/login" replace />;

    return (
        <div className={styles.layout}>
            {/* Mobile Menu Button */}
            <button
                className={styles.mobileMenuBtn}
                onClick={toggleSidebar}
                title="Open Menu"
            >
                <Icons.Menu />
            </button>

            {/* Mobile Overlay */}
            <div
                className={`${styles.sidebarOverlay} ${sidebarOpen ? styles.showOverlay : ''}`}
                onClick={closeSidebar}
            />

            <aside className={`${styles.sidebar} ${isCollapsed ? styles.collapsed : ''} ${sidebarOpen ? styles.open : ''}`}>

                {/* Close Button for Mobile */}
                <button
                    className={styles.closeBtn}
                    onClick={closeSidebar}
                    title="Close Menu"
                >
                    <Icons.Close />
                </button>

                {/* Toggle Button (Desktop) */}
                <button
                    className={styles.collapseBtn}
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" width="20" height="20"
                        style={{ transform: isCollapsed ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s' }}
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                    </svg>
                </button>

                {/* Profile Section */}
                <div className={styles.profileSection}>
                    <UserAvatar
                        url={user.avatar_url}
                        name={user.full_name || user.email}
                        size={48}
                        className={styles.avatar}
                    />
                    {!isCollapsed && (
                        <div className={styles.profileInfo}>
                            <div className={styles.profileName}>
                                {user.full_name || 'User'}
                            </div>
                            <div className={styles.profileEmail}>
                                {user.email}
                            </div>
                        </div>
                    )}
                </div>

                <nav className={styles.nav}>
                    {user.role === 'student' && (
                        <>
                            <Link to="/student/dashboard" title="Dashboard" onClick={closeSidebar} className={`${styles.navLink} ${location.pathname === '/student/dashboard' ? styles.activeLink : ''}`}>
                                <Icons.Dashboard /> {!isCollapsed && <span>Dashboard</span>}
                            </Link>
                            <Link to="/student/exams" title="My Exams" onClick={closeSidebar} className={`${styles.navLink} ${location.pathname.includes('/student/exams') ? styles.activeLink : ''}`}>
                                <Icons.Exams /> {!isCollapsed && <span>My Exams</span>}
                            </Link>
                            <Link to="/student/results" title="My Results" onClick={closeSidebar} className={`${styles.navLink} ${location.pathname.includes('/student/results') ? styles.activeLink : ''}`}>
                                <Icons.Results /> {!isCollapsed && <span>My Results</span>}
                            </Link>
                            <Link to="/student/schedule" title="Schedule" onClick={closeSidebar} className={`${styles.navLink} ${location.pathname.includes('/student/schedule') ? styles.activeLink : ''}`}>
                                <Icons.Schedule /> {!isCollapsed && <span>Schedule</span>}
                            </Link>
                            <Link to="/student/courses" title="My Courses" onClick={closeSidebar} className={`${styles.navLink} ${location.pathname.includes('/student/courses') ? styles.activeLink : ''}`}>
                                <Icons.Subjects /> {!isCollapsed && <span>My Courses</span>}
                            </Link>
                        </>
                    )}

                    {user.role === 'teacher' && (
                        <>
                            <Link to="/teacher/dashboard" title="Dashboard" onClick={closeSidebar} className={`${styles.navLink} ${location.pathname === '/teacher/dashboard' ? styles.activeLink : ''}`}>
                                <Icons.Dashboard /> {!isCollapsed && <span>Dashboard</span>}
                            </Link>
                            <Link to="/teacher/courses" title="Manage Courses" onClick={closeSidebar} className={`${styles.navLink} ${location.pathname.includes('/teacher/courses') ? styles.activeLink : ''}`}>
                                <Icons.Subjects /> {!isCollapsed && <span>Manage Courses</span>}
                            </Link>
                            <Link to="/teacher/exams" title="Manage Exams" onClick={closeSidebar} className={`${styles.navLink} ${location.pathname.includes('/teacher/exams') ? styles.activeLink : ''}`}>
                                <Icons.Exams /> {!isCollapsed && <span>Manage Exams</span>}
                            </Link>
                            <Link to="/teacher/students" title="Students" onClick={closeSidebar} className={`${styles.navLink} ${location.pathname.includes('/teacher/students') ? styles.activeLink : ''}`}>
                                <Icons.Users /> {!isCollapsed && <span>Students</span>}
                            </Link>
                            <Link to="/teacher/notifications" title="Notifications" onClick={closeSidebar} className={`${styles.navLink} ${location.pathname.includes('/teacher/notifications') ? styles.activeLink : ''}`}>
                                <Icons.Notifications /> {!isCollapsed && <span>Notifications</span>}
                            </Link>
                            <Link to="/teacher/question-bank" title="Question Bank" onClick={closeSidebar} className={`${styles.navLink} ${location.pathname.includes('/teacher/question-bank') ? styles.activeLink : ''}`}>
                                <Icons.BookOpen /> {!isCollapsed && <span>Question Bank</span>}
                            </Link>
                            <Link to="/teacher/create-exam" title="Create Exam" onClick={closeSidebar} className={`${styles.navLink} ${location.pathname.includes('/teacher/create-exam') ? styles.activeLink : ''}`}>
                                <Icons.Plus /> {!isCollapsed && <span>Create Exam</span>}
                            </Link>
                        </>
                    )}

                    {user.role === 'admin' && (
                        <>
                            <Link to="/admin/dashboard" title="Dashboard" onClick={closeSidebar} className={`${styles.navLink} ${location.pathname === '/admin/dashboard' ? styles.activeLink : ''}`}>
                                <Icons.Dashboard /> {!isCollapsed && <span>Dashboard</span>}
                            </Link>
                            <Link to="/admin/students" title="Students" onClick={closeSidebar} className={`${styles.navLink} ${location.pathname === '/admin/students' ? styles.activeLink : ''}`}>
                                <Icons.Students /> {!isCollapsed && <span>Students</span>}
                            </Link>
                            <Link to="/admin/teachers" title="Teachers" onClick={closeSidebar} className={`${styles.navLink} ${location.pathname === '/admin/teachers' ? styles.activeLink : ''}`}>
                                <Icons.Teachers /> {!isCollapsed && <span>Teachers</span>}
                            </Link>
                        </>
                    )}
                </nav>

                <div style={{ padding: isCollapsed ? '0 0.5rem' : '0 1rem' }}>
                    <Link
                        to={user?.role === 'student' ? '/student/profile' : user?.role === 'teacher' ? '/teacher/profile' : '/settings'}
                        title="Profile"
                        onClick={closeSidebar}
                        className={`${styles.navLink} ${location.pathname.includes('/profile') ? styles.activeLink : ''}`}
                        style={{ marginBottom: '0.5rem', justifyContent: isCollapsed ? 'center' : 'flex-start' }}
                    >
                        <Icons.Settings /> {!isCollapsed && <span>{user?.role === 'admin' ? 'Settings' : 'Profile'}</span>}
                    </Link>
                </div>

                <button onClick={handleLogout} title="Logout" className={styles.logoutBtn} style={{ justifyContent: isCollapsed ? 'center' : 'flex-start' }}>
                    <Icons.Logout /> {!isCollapsed && <span>Logout</span>}
                </button>
            </aside>

            <main className={styles.mainContent}>
                {user.role === 'student' && (
                    <div className={styles.studentHeader}>
                        <h2 className={styles.pageTitle}>Student Portal</h2>
                        <div className={styles.headerActions}>
                            <NotificationBell />
                        </div>
                    </div>
                )}
                <Outlet />
            </main>
        </div>
    );
}
