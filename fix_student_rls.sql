-- Fix RLS for students to view their notification recipients

-- Drop existing policy if any
DROP POLICY IF EXISTS "Students can view their notification recipients" ON notification_recipients;

-- Create policy to allow students to view their own recipient records
CREATE POLICY "Students can view their notification recipients"
    ON notification_recipients FOR SELECT
    USING (student_id = auth.uid());

-- Also ensure students can see notifications through the join
-- The notifications table RLS already handles this, but let's verify notification_recipients

-- Drop and recreate the student update policy to be more permissive
DROP POLICY IF EXISTS "Students can update their read status" ON notification_recipients;

CREATE POLICY "Students can update their read status"
    ON notification_recipients FOR UPDATE
    USING (student_id = auth.uid())
    WITH CHECK (student_id = auth.uid());
