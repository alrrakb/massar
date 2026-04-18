import { useState } from 'react';
import { Plus, Search } from 'lucide-react';
import { useAuth } from '../../../hooks/useAuth';
import {
    CoursesGrid,
    CourseForm,
    useCourses,
    Course,
    CourseFormData,
    CourseContentTabs,
    CourseExamStats,
    DeleteConfirmModal,
} from '../../../features/teacher-courses';
import { EnrollmentManager } from '../../../features/teacher-courses/components/Enrollment/EnrollmentManager';
import { toast } from 'react-hot-toast';

export default function TeacherCourses() {
    const { user } = useAuth();
    const { courses, isLoading, createCourse, updateCourse, deleteCourse } = useCourses(user?.id);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingCourse, setEditingCourse] = useState<Course | null>(null);
    const [managingCourse, setManagingCourse] = useState<Course | null>(null);
    const [contentCourse, setContentCourse] = useState<Course | null>(null);
    const [statsCourse, setStatsCourse] = useState<Course | null>(null);
    const [courseToDelete, setCourseToDelete] = useState<Course | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const handleOpenForm = (course?: Course) => {
        setEditingCourse(course || null);
        setIsFormOpen(true);
    };

    const handleCloseForm = () => {
        setEditingCourse(null);
        setIsFormOpen(false);
    };

    const handleSubmit = async (data: CourseFormData) => {
        try {
            if (editingCourse) {
                await updateCourse(editingCourse.id, data);
                toast.success('Course updated successfully');
            } else {
                await createCourse(data);
                toast.success('Course created successfully');
            }
            handleCloseForm();
        } catch (error) {
            console.error(error);
            toast.error('An error occurred while saving the course');
        }
    };

    const handleDeleteClick = (id: number) => {
        const course = courses.find(c => c.id === id);
        if (course) setCourseToDelete(course);
    };

    const confirmDelete = async () => {
        if (!courseToDelete) return;
        setIsDeleting(true);
        try {
            await deleteCourse(courseToDelete.id);
            toast.success('Course deleted successfully');
            setCourseToDelete(null);
        } catch (error) {
            console.error(error);
            toast.error('Failed to delete the course');
        } finally {
            setIsDeleting(false);
        }
    };

    const handleToggleVisibility = async (id: number, currentVisibility: Course['visibility']) => {
        const newVisibility = currentVisibility === 'active' ? 'hidden' : 'active';
        try {
            await updateCourse(id, { visibility: newVisibility });
            toast.success(newVisibility === 'active' ? 'Course is now active' : 'Course is now hidden');
        } catch (error) {
            console.error(error);
            toast.error('Failed to toggle course visibility');
        }
    };

    const filteredCourses = courses.filter((course) =>
        course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.code.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-10 max-w-7xl mx-auto" dir="ltr">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6 mb-6 sm:mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Course Management</h1>
                    <p className="text-slate-400 text-sm mt-1">Create and manage your educational courses</p>
                </div>

                <button
                    onClick={() => handleOpenForm()}
                    className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg font-medium transition-all shadow-lg shadow-indigo-500/20 w-full sm:w-auto justify-center"
                >
                    <Plus className="w-4 h-4" />
                    Create New Course
                </button>
            </div>

            {/* Search Bar */}
            <div className="relative w-full max-w-md mb-6 sm:mb-8">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="w-4 h-4 text-slate-500" />
                </div>
                <input
                    type="text"
                    placeholder="Search courses by title or code..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-slate-900/50 border border-slate-800 rounded-xl px-10 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-slate-200 w-full transition-all placeholder-slate-600"
                />
            </div>

            {/* Course Grid */}
            <CoursesGrid
                courses={filteredCourses}
                isLoading={isLoading}
                onEdit={handleOpenForm}
                onDelete={handleDeleteClick}
                onToggleVisibility={handleToggleVisibility}
                onManageStudents={setManagingCourse}
                onManageContent={setContentCourse}
                onViewStats={setStatsCourse}
                onCreateFirst={() => handleOpenForm()}
            />

            {/* Create/Edit Modal */}
            {isFormOpen && (
                <CourseForm
                    course={editingCourse}
                    onSubmit={handleSubmit}
                    onClose={handleCloseForm}
                />
            )}

            {/* Enrollment Manager Side Panel */}
            {managingCourse && (
                <EnrollmentManager
                    courseId={managingCourse.id}
                    courseTitle={managingCourse.title}
                    onClose={() => setManagingCourse(null)}
                />
            )}

            {/* Content Tabs Side Panel */}
            {contentCourse && (
                <CourseContentTabs
                    courseId={contentCourse.id}
                    courseTitle={contentCourse.title}
                    onClose={() => setContentCourse(null)}
                />
            )}

            {/* Stats Modal */}
            {statsCourse && (
                <CourseExamStats
                    courseId={statsCourse.id}
                    courseTitle={statsCourse.title}
                    onClose={() => setStatsCourse(null)}
                />
            )}

            {/* Delete Confirmation Modal */}
            {courseToDelete && (
                <DeleteConfirmModal
                    title="Delete Course"
                    itemName={courseToDelete.title}
                    isDeleting={isDeleting}
                    onConfirm={confirmDelete}
                    onCancel={() => !isDeleting && setCourseToDelete(null)}
                />
            )}
        </div>
    );
}
