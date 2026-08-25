-- ==============================================================================
-- TNTET PERSONAL COACH - SUPABASE POSTGRESQL SCHEMA
-- Execute this script in your Supabase project's SQL Editor
-- (Dashboard -> SQL Editor -> New Query -> Run)
-- ==============================================================================

-- 1. Create User Profiles Table
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL DEFAULT 'TNTET Candidate',
    selected_paper TEXT NOT NULL DEFAULT 'PAPER_I',
    language_mode TEXT NOT NULL DEFAULT 'tamil',
    category TEXT NOT NULL DEFAULT 'OC_GENERAL',
    daily_study_minutes INTEGER NOT NULL DEFAULT 40,
    has_completed_diagnostic BOOLEAN NOT NULL DEFAULT false,
    target_exam_date TEXT NOT NULL DEFAULT '2026-10-18',
    streak_days INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Create Topic Masteries Table
CREATE TABLE IF NOT EXISTS public.topic_masteries (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    topic_id TEXT NOT NULL,
    subject_id TEXT NOT NULL,
    mastery_score NUMERIC NOT NULL DEFAULT 0,
    questions_attempted INTEGER NOT NULL DEFAULT 0,
    questions_correct INTEGER NOT NULL DEFAULT 0,
    last_attempt_date TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Create 5-Tier Mistake Queue Table
CREATE TABLE IF NOT EXISTS public.mistake_queue (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    question_id TEXT NOT NULL,
    subject_id TEXT NOT NULL,
    topic_id TEXT NOT NULL,
    question_text_ta TEXT,
    question_text_en TEXT,
    selected_option_id TEXT,
    correct_option_id TEXT,
    explanation_ta TEXT,
    explanation_en TEXT,
    mistake_tag TEXT NOT NULL DEFAULT 'CONCEPT_CONFUSION',
    review_count INTEGER NOT NULL DEFAULT 0,
    is_resolved BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Create Exam Simulation History Table
CREATE TABLE IF NOT EXISTS public.simulation_history (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    score INTEGER NOT NULL,
    total_questions INTEGER NOT NULL DEFAULT 150,
    time_spent_seconds INTEGER NOT NULL DEFAULT 0,
    category TEXT NOT NULL DEFAULT 'OC_GENERAL',
    paper TEXT NOT NULL DEFAULT 'PAPER_I',
    is_qualified BOOLEAN NOT NULL DEFAULT false,
    answer_changes JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for ultra-fast candidate queries
CREATE INDEX IF NOT EXISTS idx_topic_masteries_user_id ON public.topic_masteries(user_id);
CREATE INDEX IF NOT EXISTS idx_mistake_queue_user_id ON public.mistake_queue(user_id);
CREATE INDEX IF NOT EXISTS idx_mistake_queue_resolved ON public.mistake_queue(user_id, is_resolved);
CREATE INDEX IF NOT EXISTS idx_simulation_history_user_id ON public.simulation_history(user_id);

-- Enable Row Level Security (RLS)
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.topic_masteries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mistake_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.simulation_history ENABLE ROW LEVEL SECURITY;

-- Anonymous/Public access policies for local/client tokens
CREATE POLICY "Allow public read/write on user_profiles" ON public.user_profiles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read/write on topic_masteries" ON public.topic_masteries FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read/write on mistake_queue" ON public.mistake_queue FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read/write on simulation_history" ON public.simulation_history FOR ALL USING (true) WITH CHECK (true);
