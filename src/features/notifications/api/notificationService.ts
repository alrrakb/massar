import { supabase } from '../../../services/supabase';
import { Notification, NotificationWithReadStatus, CreateNotificationRequest, NotificationTargetType } from '../types';

export const notificationService = {
    // Teacher: Send notification
    async sendNotification(data: CreateNotificationRequest): Promise<Notification | null> {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Not authenticated');

        const { data: notification, error } = await supabase
            .from('notifications')
            .insert({
                sender_id: user.id,
                target_type: data.target_type,
                target_id: data.target_id || null,
                level: data.level || null,
                major: data.major || null,
                title: data.title,
                message: data.message
            })
            .select('*')
            .single();

        if (error) {
            console.error('Error sending notification:', error);
            throw error;
        }

        // Create recipient records based on target type
        await this.createRecipientsForNotification(notification);

        return notification;
    },

    // Create recipient records based on target type
    async createRecipientsForNotification(notification: Notification): Promise<void> {
        let targetStudentIds: string[] = [];

        if (notification.target_type === 'global') {
            // Get all students
            const { data } = await supabase
                .from('profiles')
                .select('id')
                .eq('role', 'student');
            targetStudentIds = data?.map(p => p.id) || [];
        } else if (notification.target_type === 'individual' && notification.target_id) {
            targetStudentIds = [notification.target_id];
        } else if (notification.target_type === 'level' && notification.level) {
            const { data } = await supabase
                .from('profiles')
                .select('id')
                .eq('role', 'student')
                .eq('level', notification.level);
            targetStudentIds = data?.map(p => p.id) || [];
        } else if (notification.target_type === 'major' && notification.major) {
            const { data } = await supabase
                .from('profiles')
                .select('id')
                .eq('role', 'student')
                .or(`major.eq.${notification.major},specialization.eq.${notification.major},department.eq.${notification.major}`);
            targetStudentIds = data?.map(p => p.id) || [];
        }

        console.log('Target type:', notification.target_type);
        console.log('Target student IDs found:', targetStudentIds);

        if (targetStudentIds.length > 0) {
            const recipients = targetStudentIds.map(studentId => ({
                notification_id: notification.id,
                student_id: studentId
            }));

            console.log('Creating recipients:', recipients);

            const { data, error } = await supabase
                .from('notification_recipients')
                .insert(recipients)
                .select();

            if (error) {
                console.error('Error creating recipients:', error);
            } else {
                console.log('Recipients created successfully:', data);
            }
        } else {
            console.warn('No target students found for notification');
        }
    },

    // Teacher: Get sent notifications
    async getSentNotifications(): Promise<Notification[]> {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Not authenticated');

        const { data, error } = await supabase
            .from('notifications')
            .select(`
                *,
                recipients:notification_recipients(count)
            `)
            .eq('sender_id', user.id)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching sent notifications:', error);
            throw error;
        }

        return data || [];
    },

    // Student: Get my notifications with read status
    async getMyNotifications(): Promise<NotificationWithReadStatus[]> {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Not authenticated');

        // Get notifications with recipient info through the join table
        const { data, error } = await supabase
            .from('notification_recipients')
            .select(`
                id,
                is_read,
                read_at,
                notification:notification_id (
                    id,
                    sender_id,
                    target_type,
                    target_id,
                    level,
                    major,
                    title,
                    message,
                    created_at,
                    updated_at,
                    sender:sender_id (full_name, avatar_url)
                )
            `)
            .eq('student_id', user.id)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching notifications:', error);
            throw error;
        }

        console.log('Raw notifications data:', data);
        console.log('Current user ID:', user.id);

        // Transform the data to match our interface
        return (data || []).map((item: any) => ({
            ...item.notification,
            is_read: item.is_read,
            read_at: item.read_at,
            recipient_id: item.id
        }));
    },

    // Student: Get unread count
    async getUnreadCount(): Promise<number> {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return 0;

        const { count, error } = await supabase
            .from('notification_recipients')
            .select('*', { count: 'exact', head: true })
            .eq('student_id', user.id)
            .eq('is_read', false);

        if (error) {
            console.error('Error fetching unread count:', error);
            return 0;
        }

        return count || 0;
    },

    // Student: Mark as read
    async markAsRead(recipientId: string): Promise<void> {
        const { error } = await supabase
            .from('notification_recipients')
            .update({
                is_read: true,
                read_at: new Date().toISOString()
            })
            .eq('id', recipientId);

        if (error) {
            console.error('Error marking as read:', error);
            throw error;
        }
    },

    // Student: Mark all as read
    async markAllAsRead(): Promise<void> {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Not authenticated');

        const { error } = await supabase
            .from('notification_recipients')
            .update({
                is_read: true,
                read_at: new Date().toISOString()
            })
            .eq('student_id', user.id)
            .eq('is_read', false);

        if (error) {
            console.error('Error marking all as read:', error);
            throw error;
        }
    },

    // Teacher: Delete notification
    async deleteNotification(notificationId: string): Promise<void> {
        const { error } = await supabase
            .from('notifications')
            .delete()
            .eq('id', notificationId);

        if (error) {
            console.error('Error deleting notification:', error);
            throw error;
        }
    },

    // Get available levels for targeting
    async getAvailableLevels(): Promise<string[]> {
        const { data, error } = await supabase
            .from('profiles')
            .select('level')
            .eq('role', 'student')
            .not('level', 'is', null);

        if (error) {
            console.error('Error fetching levels:', error);
            return [];
        }

        const levels = [...new Set(data?.map(p => p.level).filter(Boolean))];
        return levels.sort();
    },

    // Get available majors for targeting
    async getAvailableMajors(): Promise<string[]> {
        const { data, error } = await supabase
            .from('profiles')
            .select('major, specialization, department')
            .eq('role', 'student');

        if (error) {
            console.error('Error fetching majors:', error);
            return [];
        }

        const majors = new Set<string>();
        data?.forEach(p => {
            if (p.major) majors.add(p.major);
            if (p.specialization) majors.add(p.specialization);
            if (p.department) majors.add(p.department);
        });

        return [...majors].sort();
    },

    // Search students for individual targeting
    async searchStudents(query: string): Promise<{ id: string; full_name: string | null; student_id: string | null }[]> {
        const { data, error } = await supabase
            .from('profiles')
            .select('id, full_name, student_id')
            .eq('role', 'student')
            .or(`full_name.ilike.%${query}%,student_id.ilike.%${query}%`)
            .limit(10);

        if (error) {
            console.error('Error searching students:', error);
            return [];
        }

        return data || [];
    }
};
