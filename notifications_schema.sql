-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    target_type VARCHAR(50) NOT NULL CHECK (target_type IN ('individual', 'level', 'major', 'global')),
    target_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    level VARCHAR(50),
    major VARCHAR(100),
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create notification_recipients table for tracking read status per student
CREATE TABLE IF NOT EXISTS notification_recipients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    notification_id UUID NOT NULL REFERENCES notifications(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(notification_id, student_id)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_notifications_sender_id ON notifications(sender_id);
CREATE INDEX IF NOT EXISTS idx_notifications_target_type ON notifications(target_type);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notification_recipients_student_id ON notification_recipients(student_id);
CREATE INDEX IF NOT EXISTS idx_notification_recipients_notification_id ON notification_recipients(notification_id);

-- Enable RLS on notifications table
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_recipients ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Teachers can view all notifications they sent
CREATE POLICY "Teachers can view their sent notifications"
    ON notifications FOR SELECT
    USING (sender_id = auth.uid());

-- RLS Policy: Students can view notifications intended for them
CREATE POLICY "Students can view their notifications"
    ON notifications FOR SELECT
    USING (
        target_type = 'global'
        OR (target_type = 'individual' AND target_id = auth.uid())
        OR (target_type = 'level' AND EXISTS (
            SELECT 1 FROM profiles WHERE id = auth.uid() AND level = notifications.level
        ))
        OR (target_type = 'major' AND EXISTS (
            SELECT 1 FROM profiles WHERE id = auth.uid() AND (major = notifications.major OR specialization = notifications.major OR department = notifications.major)
        ))
    );

-- RLS Policy: Teachers can insert notifications
CREATE POLICY "Teachers can send notifications"
    ON notifications FOR INSERT
    WITH CHECK (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('teacher', 'admin'))
    );

-- RLS Policy: Teachers can update/delete their own notifications
CREATE POLICY "Teachers can update their notifications"
    ON notifications FOR UPDATE
    USING (sender_id = auth.uid());

CREATE POLICY "Teachers can delete their notifications"
    ON notifications FOR DELETE
    USING (sender_id = auth.uid());

-- RLS for notification_recipients
CREATE POLICY "Students can view their notification recipients records"
    ON notification_recipients FOR SELECT
    USING (student_id = auth.uid());

CREATE POLICY "Students can update their read status"
    ON notification_recipients FOR UPDATE
    USING (student_id = auth.uid());

-- Enable realtime for notifications
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE notification_recipients;
