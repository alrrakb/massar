import { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Filter, Copy, Trash2, Edit, BookOpen, X } from 'lucide-react';
import { questionBankService } from '../../../features/question-bank/api/questionBankService';
import { Question, QuestionFilters, QuestionType, DifficultyLevel, questionTypeLabels, difficultyLabels, difficultyColors } from '../../../features/question-bank/types';
import QuestionFormModal from './components/QuestionFormModal';
import styles from './QuestionBank.module.css';

export default function QuestionBank() {
    const [questions, setQuestions] = useState<Question[]>([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState<QuestionFilters>({});
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
    const [courses, setCourses] = useState<{ id: number; title: string; code: string }[]>([]);
    const [tags, setTags] = useState<string[]>([]);

    useEffect(() => {
        loadQuestions();
        loadCourses();
        loadTags();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const loadQuestions = useCallback(async () => {
        try {
            setLoading(true);
            const data = await questionBankService.getQuestions(filters);
            setQuestions(data);
        } catch (err) {
            console.error('Error loading questions:', err);
        } finally {
            setLoading(false);
        }
    }, [filters]);

    useEffect(() => {
        loadQuestions();
    }, [loadQuestions]);

    const loadCourses = async () => {
        try {
            const data = await questionBankService.getTeacherCourses();
            setCourses(data);
        } catch (err) {
            console.error('Error loading courses:', err);
        }
    };

    const loadTags = async () => {
        try {
            const data = await questionBankService.getUniqueTags();
            setTags(data);
        } catch (err) {
            console.error('Error loading tags:', err);
        }
    };

    const handleSearch = (search: string) => {
        setFilters(prev => ({ ...prev, search: search || undefined }));
    };

    const handleFilterChange = (key: keyof QuestionFilters, value: any) => {
        setFilters(prev => ({ ...prev, [key]: value || undefined }));
    };

    const clearFilters = () => {
        setFilters({});
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this question?')) return;

        try {
            await questionBankService.deleteQuestion(id);
            loadQuestions();
        } catch (err) {
            console.error('Error deleting question:', err);
        }
    };

    const handleDuplicate = async (question: Question) => {
        try {
            await questionBankService.duplicateQuestion(question.id);
            loadQuestions();
        } catch (err) {
            console.error('Error duplicating question:', err);
        }
    };

    const handleEdit = (question: Question) => {
        setEditingQuestion(question);
        setIsModalOpen(true);
    };

    const handleAddNew = () => {
        setEditingQuestion(null);
        setIsModalOpen(true);
    };

    const handleModalClose = () => {
        setIsModalOpen(false);
        setEditingQuestion(null);
    };

    const handleSave = async () => {
        loadQuestions();
        loadTags();
        handleModalClose();
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const getQuestionPreview = (content: string) => {
        return content.length > 150 ? content.substring(0, 150) + '...' : content;
    };

    const hasActiveFilters = Object.values(filters).some(v => v !== undefined && v !== '');

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div>
                    <h1 className={styles.title}>Question Bank</h1>
                    <p className={styles.subtitle}>Manage your question library</p>
                </div>
                <button className={styles.addBtn} onClick={handleAddNew}>
                    <Plus size={20} />
                    Add New Question
                </button>
            </div>

            {/* Filters */}
            <div className={styles.filtersCard}>
                <div className={styles.searchRow}>
                    <div className={styles.searchBox}>
                        <Search size={18} className={styles.searchIcon} />
                        <input
                            type="text"
                            placeholder="Search questions..."
                            value={filters.search || ''}
                            onChange={(e) => handleSearch(e.target.value)}
                            className={styles.searchInput}
                        />
                    </div>
                    {hasActiveFilters && (
                        <button className={styles.clearBtn} onClick={clearFilters}>
                            <X size={16} />
                            Clear Filters
                        </button>
                    )}
                </div>

                <div className={styles.filterRow}>
                    <div className={styles.filterGroup}>
                        <Filter size={14} />
                        <select
                            value={filters.course_id || ''}
                            onChange={(e) => handleFilterChange('course_id', e.target.value ? parseInt(e.target.value) : undefined)}
                            className={styles.filterSelect}
                        >
                            <option value="">All Courses</option>
                            {courses.map(course => (
                                <option key={course.id} value={course.id}>
                                    {course.code} - {course.title}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className={styles.filterGroup}>
                        <select
                            value={filters.type || ''}
                            onChange={(e) => handleFilterChange('type', e.target.value || undefined)}
                            className={styles.filterSelect}
                        >
                            <option value="">All Types</option>
                            {Object.entries(questionTypeLabels).map(([value, label]) => (
                                <option key={value} value={value}>{label}</option>
                            ))}
                        </select>
                    </div>

                    <div className={styles.filterGroup}>
                        <select
                            value={filters.difficulty || ''}
                            onChange={(e) => handleFilterChange('difficulty', e.target.value || undefined)}
                            className={styles.filterSelect}
                        >
                            <option value="">All Difficulties</option>
                            {Object.entries(difficultyLabels).map(([value, label]) => (
                                <option key={value} value={value}>{label}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Questions List */}
            {loading ? (
                <div className={styles.loading}>
                    <div className={styles.spinner}></div>
                    <span>Loading questions...</span>
                </div>
            ) : questions.length === 0 ? (
                <div className={styles.emptyState}>
                    <BookOpen size={64} color="#64748b" />
                    <h3>No questions found</h3>
                    <p>{hasActiveFilters ? 'Try adjusting your filters' : 'Start building your question bank by adding new questions'}</p>
                    {!hasActiveFilters && (
                        <button className={styles.addBtn} onClick={handleAddNew}>
                            <Plus size={20} />
                            Add Your First Question
                        </button>
                    )}
                </div>
            ) : (
                <div className={styles.questionsGrid}>
                    {questions.map((question, index) => (
                        <div
                            key={question.id}
                            className={styles.questionCard}
                            style={{ animationDelay: `${index * 0.05}s` }}
                        >
                            <div className={styles.cardHeader}>
                                <div className={styles.badges}>
                                    <span
                                        className={styles.difficultyBadge}
                                        style={{ background: `${difficultyColors[question.difficulty]}20`, color: difficultyColors[question.difficulty], borderColor: `${difficultyColors[question.difficulty]}40` }}
                                    >
                                        {difficultyLabels[question.difficulty]}
                                    </span>
                                    <span className={styles.typeBadge}>
                                        {questionTypeLabels[question.type]}
                                    </span>
                                </div>
                                <div className={styles.actions}>
                                    <button
                                        className={styles.actionBtn}
                                        onClick={() => handleDuplicate(question)}
                                        title="Duplicate"
                                    >
                                        <Copy size={16} />
                                    </button>
                                    <button
                                        className={styles.actionBtn}
                                        onClick={() => handleEdit(question)}
                                        title="Edit"
                                    >
                                        <Edit size={16} />
                                    </button>
                                    <button
                                        className={`${styles.actionBtn} ${styles.deleteBtn}`}
                                        onClick={() => handleDelete(question.id)}
                                        title="Delete"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>

                            <div className={styles.cardContent}>
                                <p className={styles.questionText}>
                                    {getQuestionPreview(question.content)}
                                </p>

                                {question.course && (
                                    <div className={styles.courseInfo}>
                                        <BookOpen size={14} />
                                        {question.course.code} - {question.course.title}
                                    </div>
                                )}

                                {question.tags && question.tags.length > 0 && (
                                    <div className={styles.tags}>
                                        {question.tags.map(tag => (
                                            <span key={tag} className={styles.tag}>{tag}</span>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className={styles.cardFooter}>
                                <span className={styles.date}>
                                    Added {formatDate(question.created_at)}
                                </span>
                                {question.options && (
                                    <span className={styles.optionsCount}>
                                        {question.options.length} options
                                    </span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal */}
            {isModalOpen && (
                <QuestionFormModal
                    question={editingQuestion}
                    courses={courses}
                    onClose={handleModalClose}
                    onSave={handleSave}
                />
            )}
        </div>
    );
}
