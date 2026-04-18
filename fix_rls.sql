-- Fix RLS for notification_recipients to allow teachers to insert

-- Drop existing restrictive policies if any
DROP POLICY IF EXISTS "Teachers can insert notification recipients" ON notification_recipients;

-- Create policy to allow teachers to insert recipients
CREATE POLICY "Teachers can insert notification recipients"
    ON notification_recipients FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM notifications 
            WHERE notifications.id = notification_recipients.notification_id 
            AND notifications.sender_id = auth.uid()
        )
        OR
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('teacher', 'admin'))
    );

-- Also ensure teachers can view all recipients for their notifications
DROP POLICY IF EXISTS "Teachers can view notification recipients" ON notification_recipients;

CREATE POLICY "Teachers can view notification recipients"
    ON notification_recipients FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM notifications 
            WHERE notifications.id = notification_recipients.notification_id 
            AND notifications.sender_id = auth.uid()
        )
    );

-- Enable insert for authenticated users (alternative simpler approach)
-- This is needed because when a teacher creates a notification, 
-- the system automatically creates recipient records
ALTER TABLE notification_recipients FORCE ROW LEVEL SECURITY;

-- Drop and recreate a more permissive insert policy
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON notification_recipients;

CREATE POLICY "Enable insert for authenticated users"
    ON notification_recipients FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');
