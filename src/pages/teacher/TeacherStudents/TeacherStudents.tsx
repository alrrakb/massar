import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Search, Mail, GraduationCap, ChevronRight } from 'lucide-react';
import { supabase } from '../../../services/supabase';
import styles from './TeacherStudents.module.css';

interface Student {
    id: string;
    full_name: string | null;
    email: string;
    student_id: string | null;
    avatar_url: string | null;
    level: string | null;
}

export default function TeacherStudents() {
    const navigate = useNavigate();
    const [students, setStudents] = useState<Student[]>([]);
    const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchStudents();
    }, []);

    useEffect(() => {
        const filtered = students.filter(student =>
            (student.full_name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
            (student.email?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
            (student.student_id?.toLowerCase() || '').includes(searchQuery.toLowerCase())
        );
        setFilteredStudents(filtered);
    }, [searchQuery, students]);

    const fetchStudents = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('id, full_name, email, student_id, avatar_url, level')
                .eq('role', 'student')
                .order('full_name', { ascending: true });

            if (error) throw error;
            setStudents(data || []);
            setFilteredStudents(data || []);
        } catch (err) {
            console.error('Error fetching students:', err);
        } finally {
            setLoading(false);
        }
    };

    const getInitials = (name: string | null) => {
        if (!name) return 'ST';
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    };

    const handleViewProfile = (studentId: string) => {
        navigate(`/teacher/students/${studentId}`);
    };

    return (
        <div className={styles.container}>
            {/* Header */}
            <div className={styles.header}>
                <div>
                    <h1 className={styles.title}>Students</h1>
                    <p className={styles.subtitle}>View and manage your students' profiles and performance.</p>
                </div>
            </div>

            {/* Search Bar */}
            <div className={styles.searchBar}>
                <div className={styles.searchBox}>
                    <Search size={18} className={styles.searchIcon} />
                    <input
                        type="text"
                        placeholder="Search by name, email, or student ID..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className={styles.searchInput}
                    />
                </div>
                <span className={styles.studentCount}>
                    {filteredStudents.length} student{filteredStudents.length !== 1 ? 's' : ''}
                </span>
            </div>

            {/* Students Grid */}
            {loading ? (
                <div className={styles.loadingState}>
                    <div className={styles.spinner}></div>
                    <p>Loading students...</p>
                </div>
            ) : filteredStudents.length === 0 ? (
                <div className={styles.emptyState}>
                    <Users size={48} color="#64748b" />
                    <h3>No students found</h3>
                    <p>{searchQuery ? 'Try adjusting your search query.' : 'No students registered in the system.'}</p>
                </div>
            ) : (
                <div className={styles.studentsGrid}>
                    {filteredStudents.map((student) => (
                        <div
                            key={student.id}
                            className={styles.studentCard}
                            onClick={() => handleViewProfile(student.id)}
                        >
                            <div className={styles.cardHeader}>
                                {student.avatar_url ? (
                                    <img
                                        src={student.avatar_url}
                                        alt={student.full_name || 'Student'}
                                        className={styles.avatar}
                                    />
                                ) : (
                                    <div className={styles.avatarPlaceholder}>
                                        {getInitials(student.full_name)}
                                    </div>
                                )}
                                <div className={styles.cardActions}>
                                    <ChevronRight size={20} color="#64748b" />
                                </div>
                            </div>

                            <div className={styles.cardInfo}>
                                <h3 className={styles.studentName}>
                                    {student.full_name || 'Unknown Student'}
                                </h3>
                                <div className={styles.metaList}>
                                    <span className={styles.metaItem}>
                                        <Mail size={14} />
                                        {student.email}
                                    </span>
                                    <span className={styles.metaItem}>
                                        <GraduationCap size={14} />
                                        ID: {student.student_id || 'N/A'} • Level: {student.level || 'N/A'}
                                    </span>
                                </div>
                            </div>

                            <button className={styles.viewProfileBtn}>
                                View Profile
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
