import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { X, ChevronDown } from 'lucide-react';
import { Course, CourseFormData } from '../../types';

const courseSchema = z.object({
    title: z.string().min(3, 'Title must be at least 3 characters').max(100, 'Title is too long'),
    code: z.string().min(2, 'Course code is required'),
    description: z.string().optional(),
    visibility: z.enum(['active', 'hidden', 'disabled']),
    instructor: z.string().optional(),
    department: z.string().optional(),
    semester: z.string().optional(),
    credits: z.preprocess((val) => (val ? Number(val) : undefined), z.number().min(0).optional()),
});

interface CourseFormProps {
    course?: Course | null;
    onSubmit: (data: CourseFormData) => Promise<void>;
    onClose: () => void;
}

export function CourseForm({ course, onSubmit, onClose }: CourseFormProps) {
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<CourseFormData>({
        resolver: zodResolver(courseSchema),
        defaultValues: {
            title: course?.title || '',
            code: course?.code || '',
            description: course?.description || '',
            visibility: course?.visibility || 'active',
            instructor: course?.instructor || '',
            department: course?.department || '',
            semester: course?.semester || '',
            credits: course?.credits || 0,
        },
    });

    useEffect(() => {
        if (course) {
            reset({
                title: course.title,
                code: course.code,
                description: course.description || '',
                visibility: course.visibility,
                instructor: course.instructor || '',
                department: course.department || '',
                semester: course.semester || '',
                credits: course.credits || 0,
            });
        } else {
            reset({
                title: '',
                code: '',
                description: '',
                visibility: 'active',
                instructor: '',
                department: '',
                semester: '',
                credits: 0,
            });
        }
    }, [course, reset]);

    return (
        <div className="fixed inset-0 z-[100] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6" dir="ltr">
            <div className="bg-slate-900 rounded-[2rem] shadow-2xl border border-slate-800 w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 relative max-h-[90vh] flex flex-col">
                <div className="absolute top-0 right-0 left-0 h-1.5 bg-gradient-to-r from-indigo-500 to-purple-600"></div>

                <div className="flex justify-between items-center p-6 border-b border-slate-800">
                    <div>
                        <h2 className="font-bold text-xl text-white">{course ? 'Edit Course' : 'Create New Course'}</h2>
                        <p className="text-slate-400 text-sm mt-1">{course ? 'Update course details and settings' : 'Fill in the details for your new course'}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2.5 bg-slate-800/50 hover:bg-slate-800 rounded-full transition-colors text-slate-400 hover:text-white border border-slate-800/0 hover:border-slate-700"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6 overflow-y-auto">
                    <div className="space-y-5">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            <div>
                                <label className="block text-sm font-semibold text-slate-300 mb-2">Course Title <span className="text-rose-500">*</span></label>
                                <input
                                    {...register('title')}
                                    placeholder="e.g. Advanced Calculus"
                                    className="w-full px-4 py-3 bg-slate-950/50 border border-slate-800 rounded-xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all text-white placeholder-slate-600 shadow-inner"
                                />
                                {errors.title && <p className="text-rose-400 text-sm mt-1.5 flex items-center gap-1"><span className="w-1 h-1 rounded-full bg-rose-400"></span>{errors.title.message}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-300 mb-2">Course Code <span className="text-rose-500">*</span></label>
                                <input
                                    {...register('code')}
                                    placeholder="e.g. MATH101"
                                    className="w-full px-4 py-3 bg-slate-950/50 border border-slate-800 rounded-xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all text-white placeholder-slate-600 font-mono shadow-inner uppercase"
                                />
                                {errors.code && <p className="text-rose-400 text-sm mt-1.5 flex items-center gap-1"><span className="w-1 h-1 rounded-full bg-rose-400"></span>{errors.code.message}</p>}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            <div>
                                <label className="block text-sm font-semibold text-slate-300 mb-2">Instructor Name</label>
                                <input
                                    {...register('instructor')}
                                    placeholder="e.g. Dr. Ahmed"
                                    className="w-full px-4 py-3 bg-slate-950/50 border border-slate-800 rounded-xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all text-white placeholder-slate-600 shadow-inner"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-300 mb-2">Department</label>
                                <input
                                    {...register('department')}
                                    placeholder="e.g. Computer Science"
                                    className="w-full px-4 py-3 bg-slate-950/50 border border-slate-800 rounded-xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all text-white placeholder-slate-600 shadow-inner"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            <div>
                                <label className="block text-sm font-semibold text-slate-300 mb-2">Semester</label>
                                <input
                                    {...register('semester')}
                                    placeholder="e.g. Fall 2026"
                                    className="w-full px-4 py-3 bg-slate-950/50 border border-slate-800 rounded-xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all text-white placeholder-slate-600 shadow-inner"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-300 mb-2">Credits</label>
                                <input
                                    type="number"
                                    {...register('credits')}
                                    placeholder="e.g. 3"
                                    className="w-full px-4 py-3 bg-slate-950/50 border border-slate-800 rounded-xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all text-white placeholder-slate-600 shadow-inner"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-300 mb-2">Description</label>
                            <textarea
                                {...register('description')}
                                rows={4}
                                placeholder="Briefly describe the course objectives..."
                                className="w-full px-4 py-3 bg-slate-950/50 border border-slate-800 rounded-xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all text-white placeholder-slate-600 resize-none shadow-inner leading-relaxed"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-300 mb-2">Visibility Status</label>
                            <div className="relative">
                                <select
                                    {...register('visibility')}
                                    className="w-full px-4 py-3 pr-10 bg-slate-950/50 border border-slate-800 rounded-xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all text-white shadow-inner appearance-none cursor-pointer"
                                    style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', borderColor: 'rgba(255, 255, 255, 0.1)' }}
                                >
                                    <option value="hidden" style={{ background: '#1e293b' }}>Hidden (Draft/Preparation)</option>
                                    <option value="active" style={{ background: '#1e293b' }}>Active (Visible to Students)</option>
                                    <option value="disabled" style={{ background: '#1e293b' }}>Disabled (Archived)</option>
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                            </div>
                        </div>
                    </div>

                    <div className="pt-6 mt-2 border-t border-slate-800 flex gap-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 bg-slate-800 hover:bg-slate-700 text-white py-3.5 rounded-xl font-semibold transition-colors border border-slate-700"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white py-3.5 rounded-xl font-semibold transition-all shadow-lg shadow-indigo-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? 'Saving...' : 'Save Course'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
