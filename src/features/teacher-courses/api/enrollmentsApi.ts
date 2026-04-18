import { supabase } from '../../../services/supabase';
import { Database } from '../../../types/supabase';

export type EnrolledStudent = {
    id: string;
    student_id: string | null;
    enrolled_at: string | null;
    enrollment_type: Database['public']['Enums']['enrollment_type'];
    status: Database['public']['Enums']['enrollment_status'] | null;
    academic_level: string | null;
    specialty: string | null;
    profiles: {
        id: string;
        full_name: string | null;
        email: string | null;
        student_id: string | null;
        avatar_url: string | null;
        level: string | null;
        major: string | null;
    } | null;
};

export type StudentProfile = {
    id: string;
    full_name: string | null;
    email: string | null;
    student_id: string | null;
    avatar_url: string | null;
    level: string | null;
    major: string | null;
};

export const enrollmentsApi = {
    /** Fetch all students enrolled in a course (with profile details) */
    async getEnrolledStudents(courseId: number): Promise<EnrolledStudent[]> {
        const { data, error } = await supabase
            .from('enrollments')
            .select(`
        id,
        student_id,
        enrolled_at,
        enrollment_type,
        status,
        academic_level,
        specialty,
        profiles:student_id (
          id,
          full_name,
          email,
          student_id,
          avatar_url,
          level,
          major
        )
      `)
            .eq('course_id', courseId)
            .order('enrolled_at', { ascending: false });

        if (error) throw error;
        return (data ?? []) as unknown as EnrolledStudent[];
    },

    /** Search students by name or student ID (not yet enrolled in this course) */
    async searchStudents(query: string, courseId: number): Promise<StudentProfile[]> {
        const { data: enrolled } = await supabase
            .from('enrollments')
            .select('student_id')
            .eq('course_id', courseId);

        const enrolledIds = (enrolled ?? []).map((e) => e.student_id).filter(Boolean) as string[];

        let queryBuilder = supabase
            .from('profiles')
            .select('id, full_name, email, student_id, avatar_url, level, major')
            .eq('role', 'student')
            .or(`full_name.ilike.%${query}%,student_id.ilike.%${query}%`)
            .limit(10);

        if (enrolledIds.length > 0) {
            queryBuilder = queryBuilder.not('id', 'in', `(${enrolledIds.join(',')})`);
        }

        const { data, error } = await queryBuilder;
        if (error) throw error;
        return (data ?? []) as StudentProfile[];
    },

    /** Enroll a single student (individual) */
    async enrollStudent(courseId: number, studentId: string): Promise<void> {
        const { error } = await supabase.from('enrollments').insert({
            course_id: courseId,
            student_id: studentId,
            enrollment_type: 'individual',
            status: 'enrolled',
        });
        if (error) throw error;
    },

    /** Bulk enroll all students matching a level and/or major (group) */
    async enrollGroup(
        courseId: number,
        filters: { level?: string; major?: string }
    ): Promise<number> {
        let query = supabase
            .from('profiles')
            .select('id')
            .eq('role', 'student');

        if (filters.level) query = query.eq('level', filters.level);
        if (filters.major) query = query.eq('major', filters.major);

        const { data: students, error: fetchError } = await query;
        if (fetchError) throw fetchError;
        if (!students || students.length === 0) return 0;

        const { data: existing } = await supabase
            .from('enrollments')
            .select('student_id')
            .eq('course_id', courseId);

        const existingIds = new Set((existing ?? []).map((e) => e.student_id));

        const toInsert = students
            .filter((s) => !existingIds.has(s.id))
            .map((s) => ({
                course_id: courseId,
                student_id: s.id,
                enrollment_type: 'group' as const,
                status: 'enrolled' as const,
                academic_level: filters.level ?? null,
                specialty: filters.major ?? null,
            }));

        if (toInsert.length === 0) return 0;

        const { error } = await supabase.from('enrollments').insert(toInsert);
        if (error) throw error;
        return toInsert.length;
    },

    /** Remove a student from a course */
    async removeEnrollment(enrollmentId: string): Promise<void> {
        const { error } = await supabase
            .from('enrollments')
            .delete()
            .eq('id', enrollmentId);
        if (error) throw error;
    },
};
