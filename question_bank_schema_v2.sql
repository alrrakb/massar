-- Create question bank table (separate from exam questions)

-- Create enum types if not exist
DO $$ BEGIN
    CREATE TYPE question_type AS ENUM ('multiple_choice', 'true_false', 'essay', 'short_answer');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE difficulty_level AS ENUM ('easy', 'medium', 'hard');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- Create question_bank table
CREATE TABLE IF NOT EXISTS question_bank (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    teacher_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    course_id INTEGER REFERENCES courses(id) ON DELETE SET NULL,
    content TEXT NOT NULL,
    type question_type NOT NULL DEFAULT 'multiple_choice',
    difficulty difficulty_level NOT NULL DEFAULT 'medium',
    options JSONB DEFAULT NULL,
    correct_answer TEXT,
    explanation TEXT,
    tags TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

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
