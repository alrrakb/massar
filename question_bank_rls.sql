-- Add indexes and RLS to question_bank

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_question_bank_teacher_id ON question_bank(teacher_id);
CREATE INDEX IF NOT EXISTS idx_question_bank_course_id ON question_bank(course_id);
CREATE INDEX IF NOT EXISTS idx_question_bank_type ON question_bank(type);
CREATE INDEX IF NOT EXISTS idx_question_bank_difficulty ON question_bank(difficulty);
CREATE INDEX IF NOT EXISTS idx_question_bank_created_at ON question_bank(created_at DESC);

-- Enable RLS
ALTER TABLE question_bank ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Teachers can view their own question bank"
    ON question_bank FOR SELECT
    USING (teacher_id = auth.uid());

CREATE POLICY "Teachers can insert to their question bank"
    ON question_bank FOR INSERT
    WITH CHECK (teacher_id = auth.uid());

CREATE POLICY "Teachers can update their question bank"
    ON question_bank FOR UPDATE
    USING (teacher_id = auth.uid())
    WITH CHECK (teacher_id = auth.uid());

CREATE POLICY "Teachers can delete from their question bank"
    ON question_bank FOR DELETE
    USING (teacher_id = auth.uid());

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE question_bank;
