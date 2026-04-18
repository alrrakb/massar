-- Create question bank schema

-- Create enum types
CREATE TYPE question_type AS ENUM ('multiple_choice', 'true_false', 'essay', 'short_answer');
CREATE TYPE difficulty_level AS ENUM ('easy', 'medium', 'hard');

-- Create questions table
CREATE TABLE IF NOT EXISTS questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    teacher_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    subject_id INTEGER REFERENCES courses(id) ON DELETE SET NULL,
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
CREATE INDEX IF NOT EXISTS idx_questions_teacher_id ON questions(teacher_id);
CREATE INDEX IF NOT EXISTS idx_questions_subject_id ON questions(subject_id);
CREATE INDEX IF NOT EXISTS idx_questions_type ON questions(type);
CREATE INDEX IF NOT EXISTS idx_questions_difficulty ON questions(difficulty);
CREATE INDEX IF NOT EXISTS idx_questions_created_at ON questions(created_at DESC);

-- Enable RLS
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Teachers can view their own questions"
    ON questions FOR SELECT
    USING (teacher_id = auth.uid());

CREATE POLICY "Teachers can insert their own questions"
    ON questions FOR INSERT
    WITH CHECK (teacher_id = auth.uid());

CREATE POLICY "Teachers can update their own questions"
    ON questions FOR UPDATE
    USING (teacher_id = auth.uid())
    WITH CHECK (teacher_id = auth.uid());

CREATE POLICY "Teachers can delete their own questions"
    ON questions FOR DELETE
    USING (teacher_id = auth.uid());

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE questions;
