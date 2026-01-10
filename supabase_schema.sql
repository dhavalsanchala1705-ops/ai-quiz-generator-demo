-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Enum Types for Type Safety
CREATE TYPE user_role AS ENUM ('teacher', 'student');
CREATE TYPE room_status AS ENUM ('waiting', 'active', 'completed');
CREATE TYPE question_type AS ENUM ('mcq', 'tf', 'fitb');
CREATE TYPE difficulty_level AS ENUM ('easy', 'medium', 'hard');

-- 1. Profiles Table (Extends Supabase auth.users)
-- This table matches the user ID from Supabase Auth
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    role user_role DEFAULT 'student',
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster lookups by email
CREATE INDEX idx_profiles_email ON profiles(email);

-- 2. Quizzes Table
-- Stores the generated quiz metadata. Questions are stored separately.
CREATE TABLE quizzes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    teacher_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    subject TEXT NOT NULL,
    topic TEXT NOT NULL,
    difficulty difficulty_level DEFAULT 'easy',
    total_questions INTEGER DEFAULT 5,
    is_public BOOLEAN DEFAULT FALSE, -- Allow sharing later
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Questions Table
-- Normalized storage for questions allows better analytics than JSONB
CREATE TABLE questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    quiz_id UUID REFERENCES quizzes(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    question_type question_type NOT NULL,
    options JSONB, -- Stores array of strings for MCQ options
    correct_answer TEXT NOT NULL, -- Stores index or text
    explanation TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_questions_quiz_id ON questions(quiz_id);

-- 4. Rooms Table
-- Represents a live class session
CREATE TABLE rooms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(6) UNIQUE NOT NULL, -- The 6-digit access code
    teacher_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    quiz_id UUID REFERENCES quizzes(id), -- The quiz being played
    status room_status DEFAULT 'waiting',
    started_at TIMESTAMPTZ,
    ended_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_rooms_code ON rooms(code);
CREATE INDEX idx_rooms_teacher_id ON rooms(teacher_id);

-- 5. Room Participants Table
-- Tracks who joined which room
CREATE TABLE room_participants (
    room_id UUID REFERENCES rooms(id) ON DELETE CASCADE,
    student_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    score INTEGER DEFAULT 0,
    completed_at TIMESTAMPTZ,
    PRIMARY KEY (room_id, student_id)
);

-- 6. Student Responses Table (Detailed Analytics)
-- Stores every answer given by a student
CREATE TABLE student_responses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    room_id UUID REFERENCES rooms(id) ON DELETE CASCADE,
    student_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    question_id UUID REFERENCES questions(id) ON DELETE SET NULL,
    response_text TEXT, -- What they answered
    is_correct BOOLEAN,
    time_taken_seconds INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_responses_student_room ON student_responses(student_id, room_id);

-- Row Level Security (RLS) Policies (Examples)

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;

-- Profiles: Public read, Self update
CREATE POLICY "Public profiles are viewable by everyone" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Rooms: Teachers see their own, Students see via code
CREATE POLICY "Teachers view own rooms" ON rooms FOR SELECT USING (auth.uid() = teacher_id);
CREATE POLICY "Students view rooms by code" ON rooms FOR SELECT USING (true); -- Simplified, usually check participant

-- Function to handle new user signup automatically (Supabase Trigger)
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name', (new.raw_user_meta_data->>'role')::user_role);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call the function on auth.users insert
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
