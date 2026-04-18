import { Eye, EyeOff, Trash2, Edit, BookOpen, Users, Calendar, TrendingUp } from 'lucide-react';
import { Course } from '../../types';

interface CourseCardProps {
    course: Course;
    onEdit: (course: Course) => void;
    onDelete: (id: number) => void;
    onToggleVisibility: (id: number, currentVisibility: Course['visibility']) => void;
    onManageStudents?: (course: Course) => void;
    onManageContent?: (course: Course) => void;
    onViewStats?: (course: Course) => void;
}

export function CourseCard({ course, onEdit, onDelete, onToggleVisibility, onManageStudents, onManageContent, onViewStats }: CourseCardProps) {
    const isActive = course.visibility === 'active';
    const createdDate = course.created_at
        ? new Date(course.created_at).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        })
        : '—';

    return (
        <div
            className="bg-slate-900/40 border border-slate-800/60 p-5 rounded-2xl hover:border-slate-700 transition-colors flex flex-col gap-4 group"
            dir="ltr"
        >
            {/* Top Row: title + badge */}
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <h3 className="font-semibold text-white text-base truncate leading-tight" title={course.title}>
                        {course.title}
                    </h3>
                    <p className="text-xs text-slate-500 font-mono mt-1">{course.code}</p>
                </div>

                <span
                    className={`shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${isActive
                        ? 'bg-emerald-500/10 text-emerald-400'
                        : course.visibility === 'disabled'
                            ? 'bg-slate-500/10 text-slate-400'
                            : 'bg-amber-500/10 text-amber-400'
                        }`}
                >
                    {isActive ? 'Active' : course.visibility === 'disabled' ? 'Disabled' : 'Hidden'}
                </span>
            </div>

            {/* Description */}
            <p className="text-sm text-slate-400 line-clamp-2 leading-relaxed">
                {course.description || 'No description provided.'}
            </p>

            {/* Stats Row */}
            <div className="flex items-center gap-4 text-xs text-slate-500 font-medium">
                <span className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5" />{course.student_count ?? 0} Students
                </span>
                <span className="flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5" />{course.materials_count ?? 0} Materials
                </span>
            </div>

            {/* Footer: date + actions */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-800/60 mt-auto">
                <span className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium tracking-wide">
                    <Calendar className="w-3.5 h-3.5" />
                    {createdDate}
                </span>

                <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                    <button
                        onClick={() => onViewStats?.(course)}
                        title="Course Statistics"
                        className="p-1.5 text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-colors flex-shrink-0"
                    >
                        <TrendingUp className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => onManageContent?.(course)}
                        title="Course Content (Materials & Exams)"
                        className="p-1.5 text-slate-400 hover:text-amber-400 hover:bg-amber-500/10 rounded-lg transition-colors flex-shrink-0"
                    >
                        <BookOpen className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => onManageStudents?.(course)}
                        title="Manage Students"
                        className="p-1.5 text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition-colors flex-shrink-0"
                    >
                        <Users className="w-4 h-4" />
                    </button>

                    <div className="w-px h-4 bg-slate-800 mx-1"></div>

                    <button
                        onClick={() => onToggleVisibility(course.id, course.visibility)}
                        title={isActive ? 'Hide course' : 'Show course'}
                        className={`p-1.5 rounded-lg transition-colors ${isActive
                            ? 'text-emerald-400 hover:bg-emerald-500/10'
                            : 'text-slate-400 hover:text-slate-300 hover:bg-slate-800'
                            }`}
                    >
                        {isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </button>

                    <button
                        onClick={() => onEdit(course)}
                        title="Edit course settings"
                        className="p-1.5 text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
                    >
                        <Edit className="w-4 h-4" />
                    </button>

                    <button
                        onClick={() => {
                            if (window.confirm('Are you sure you want to delete this course?')) {
                                onDelete(course.id);
                            }
                        }}
                        title="Delete course"
                        className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors ml-1"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}
