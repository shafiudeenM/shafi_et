-- ==============================================================================
-- TNTET PERSONAL COACH — SUPABASE POSTGRESQL SCHEMA
-- Execute in: Dashboard → SQL Editor → New Query → Run
-- ==============================================================================

-- ============================================================================
-- LAYER 1: REFERENCE DATA (shared, read-only)
-- ============================================================================

-- 1. SUBJECTS — 7 unique subjects across Paper I & II
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.subjects (
    id              TEXT PRIMARY KEY,              -- 'cdp', 'tamil', 'english', 'maths', 'evs', 'maths_science', 'social_science'
    name_en         TEXT NOT NULL,
    name_ta         TEXT NOT NULL,
    color           TEXT NOT NULL DEFAULT '#c5a059',
    icon_name       TEXT NOT NULL DEFAULT 'BookOpen',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. SYLLABUS_TOPICS — 94 official TRB topics (63 Paper I + 31 Paper II)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.syllabus_topics (
    id              TEXT PRIMARY KEY,              -- 'cdp_p1_physical_growth'
    subject_id      TEXT NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
    paper           TEXT NOT NULL,                 -- 'PAPER_I' or 'PAPER_II'
    unit_id         TEXT NOT NULL,                 -- 'cdp_child_dev'
    unit_name_en    TEXT NOT NULL,
    unit_name_ta    TEXT NOT NULL,
    name_en         TEXT NOT NULL,
    name_ta         TEXT NOT NULL,
    keyword_en      TEXT[] NOT NULL DEFAULT '{}',
    keyword_ta      TEXT[] NOT NULL DEFAULT '{}',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_syllabus_topics_subject ON public.syllabus_topics(subject_id);
CREATE INDEX IF NOT EXISTS idx_syllabus_topics_paper ON public.syllabus_topics(paper);

-- 3. QUESTION_PAPERS — metadata for each exam sitting
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.question_papers (
    id              TEXT PRIMARY KEY,              -- 'trb_2022_p1_morning'
    year            INTEGER NOT NULL,
    paper_type      TEXT NOT NULL,                 -- 'PAPER_I', 'PAPER_II_MATH_SCI', 'PAPER_II_SOC_SCI'
    shift           TEXT,                          -- 'morning', 'afternoon', NULL
    source          TEXT NOT NULL DEFAULT 'TRB Official',
    total_questions INTEGER NOT NULL DEFAULT 150,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_question_papers_year ON public.question_papers(year);
CREATE INDEX IF NOT EXISTS idx_question_papers_type ON public.question_papers(paper_type);

-- 4. QUESTIONS — the central question bank (up to 3000)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.questions (
    id              TEXT PRIMARY KEY,              -- 'q_trb_2022_p1_001'
    paper_id        TEXT NOT NULL REFERENCES public.question_papers(id) ON DELETE CASCADE,
    subject_id      TEXT NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
    topic_id        TEXT NOT NULL REFERENCES public.syllabus_topics(id) ON DELETE SET NULL,
    sno             INTEGER,                      -- serial number from source file
    question_no     TEXT,                         -- original Q number in exam paper

    -- Bilingual content
    question_en     TEXT NOT NULL DEFAULT '',
    question_ta     TEXT NOT NULL DEFAULT '',
    option_a_en     TEXT NOT NULL DEFAULT '',
    option_a_ta     TEXT NOT NULL DEFAULT '',
    option_b_en     TEXT NOT NULL DEFAULT '',
    option_b_ta     TEXT NOT NULL DEFAULT '',
    option_c_en     TEXT NOT NULL DEFAULT '',
    option_c_ta     TEXT NOT NULL DEFAULT '',
    option_d_en     TEXT NOT NULL DEFAULT '',
    option_d_ta     TEXT NOT NULL DEFAULT '',
    correct_option  SMALLINT NOT NULL DEFAULT 0,  -- 0-3

    -- Classification
    difficulty      TEXT NOT NULL DEFAULT 'medium',   -- 'easy', 'medium', 'hard'
    question_type   TEXT NOT NULL DEFAULT 'conceptual', -- 'conceptual', 'factual', 'application', 'pedagogy'

    -- Explanations (nullable — can be filled later)
    explanation_en      TEXT,
    explanation_ta      TEXT,
    concept_summary_en  TEXT,
    concept_summary_ta  TEXT,
    syllabus_ref        TEXT,                      -- free-text reference

    -- Denormalized for fast filtering
    year            INTEGER NOT NULL,

    -- Soft delete
    is_active       BOOLEAN NOT NULL DEFAULT true,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_questions_paper ON public.questions(paper_id);
CREATE INDEX IF NOT EXISTS idx_questions_subject ON public.questions(subject_id);
CREATE INDEX IF NOT EXISTS idx_questions_topic ON public.questions(topic_id);
CREATE INDEX IF NOT EXISTS idx_questions_year ON public.questions(year);
CREATE INDEX IF NOT EXISTS idx_questions_difficulty ON public.questions(difficulty);
CREATE INDEX IF NOT EXISTS idx_questions_subject_topic ON public.questions(subject_id, topic_id);
CREATE INDEX IF NOT EXISTS idx_questions_active ON public.questions(is_active) WHERE is_active = true;

-- 5. CATEGORY_CUTOFFS — official TRB qualifying marks by category & year
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.category_cutoffs (
    id              TEXT PRIMARY KEY,              -- 'oc_2022'
    category        TEXT NOT NULL,                 -- 'OC_GENERAL', 'BC_MBC_SC_ST'
    year            INTEGER NOT NULL,
    cutoff_marks    INTEGER NOT NULL,              -- 90 for OC, 82 for BC
    total_marks     INTEGER NOT NULL DEFAULT 150,
    percentage      NUMERIC(5,2) NOT NULL,        -- 60.00, 55.00
    source          TEXT,                          -- official notification reference
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_category_cutoffs_unique ON public.category_cutoffs(category, year);

-- ============================================================================
-- LAYER 2: MAPPING DATA
-- ============================================================================

-- 6. QUESTION_TOPICS — many-to-many (for future multi-topic support)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.question_topics (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question_id     TEXT NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
    topic_id        TEXT NOT NULL REFERENCES public.syllabus_topics(id) ON DELETE CASCADE,
    is_primary      BOOLEAN NOT NULL DEFAULT false,  -- primary topic link
    relevance_score NUMERIC(3,2) DEFAULT 1.00,        -- 0.00-1.00, weight of this topic for the question
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_question_topics_unique ON public.question_topics(question_id, topic_id);
CREATE INDEX IF NOT EXISTS idx_question_topics_topic ON public.question_topics(topic_id);

-- ============================================================================
-- LAYER 3: USER DATA (per-candidate, read-write)
-- All user tables reference auth.users(id) via UUID
-- ============================================================================

-- 7. USER_PROFILES — one row per authenticated user
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id                      UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email                   TEXT,
    name                    TEXT NOT NULL DEFAULT 'TNTET Candidate',
    selected_paper          TEXT NOT NULL DEFAULT 'PAPER_I',
    language_mode           TEXT NOT NULL DEFAULT 'tamil',
    persona                 TEXT NOT NULL DEFAULT 'first_time',
    category                TEXT NOT NULL DEFAULT 'OC_GENERAL',
    daily_study_minutes     INTEGER NOT NULL DEFAULT 40,
    has_completed_diagnostic BOOLEAN NOT NULL DEFAULT false,
    target_exam_date        DATE,
    streak_days             INTEGER NOT NULL DEFAULT 0,
    longest_streak          INTEGER NOT NULL DEFAULT 0,
    theme                   TEXT NOT NULL DEFAULT 'dark',
    created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 8. TOPIC_MASTERIES — per-topic mastery cache (materialized from study_sessions)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.topic_masteries (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id                 UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    topic_id                TEXT NOT NULL REFERENCES public.syllabus_topics(id) ON DELETE CASCADE,
    subject_id              TEXT NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
    mastery_score           NUMERIC NOT NULL DEFAULT 0,           -- 0-100
    questions_attempted     INTEGER NOT NULL DEFAULT 0,
    questions_correct       INTEGER NOT NULL DEFAULT 0,
    avg_time_per_question   NUMERIC NOT NULL DEFAULT 0,           -- seconds
    status                  TEXT NOT NULL DEFAULT 'weak',         -- 'weak', 'developing', 'exam_ready'
    last_attempt_at         TIMESTAMPTZ,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_topic_masteries_unique ON public.topic_masteries(user_id, topic_id);
CREATE INDEX IF NOT EXISTS idx_topic_masteries_user ON public.topic_masteries(user_id);
CREATE INDEX IF NOT EXISTS idx_topic_masteries_status ON public.topic_masteries(user_id, status);

-- 9. MISTAKE_QUEUE — spaced repetition items per user
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.mistake_queue (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id                 UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    question_id             TEXT NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
    subject_id              TEXT NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
    topic_id                TEXT NOT NULL REFERENCES public.syllabus_topics(id) ON DELETE SET NULL,
    mistake_tag             TEXT NOT NULL DEFAULT 'concept_confusion',
    selected_option         SMALLINT,                            -- which option user picked (0-3)
    review_count            INTEGER NOT NULL DEFAULT 0,
    next_review_at          TIMESTAMPTZ,                         -- SRS schedule
    is_resolved             BOOLEAN NOT NULL DEFAULT false,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_mistake_queue_user ON public.mistake_queue(user_id);
CREATE INDEX IF NOT EXISTS idx_mistake_queue_active ON public.mistake_queue(user_id, is_resolved) WHERE is_resolved = false;
CREATE INDEX IF NOT EXISTS idx_mistake_queue_review ON public.mistake_queue(user_id, next_review_at) WHERE is_resolved = false;

-- 10. DAILY_STUDY_LOGS — one row per day per user (replaces localStorage streak)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.daily_study_logs (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id                 UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    study_date              DATE NOT NULL,
    minutes_studied         INTEGER NOT NULL DEFAULT 0,
    questions_attempted     INTEGER NOT NULL DEFAULT 0,
    questions_correct       INTEGER NOT NULL DEFAULT 0,
    topics_touched          TEXT[] NOT NULL DEFAULT '{}',         -- array of topic_ids
    streak_day_number       INTEGER NOT NULL DEFAULT 1,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_daily_study_logs_unique ON public.daily_study_logs(user_id, study_date);
CREATE INDEX IF NOT EXISTS idx_daily_study_logs_user ON public.daily_study_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_study_logs_date ON public.daily_study_logs(user_id, study_date DESC);

-- 11. STUDY_SESSIONS — granular event log (daily_study_logs computed from this)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.study_sessions (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id                 UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    session_type            TEXT NOT NULL,                        -- 'diagnostic', 'daily_practice', 'mistake_review', 'quick_check', 'full_simulation'
    subject_id              TEXT REFERENCES public.subjects(id) ON DELETE SET NULL,
    topic_id                TEXT REFERENCES public.syllabus_topics(id) ON DELETE SET NULL,
    duration_seconds        INTEGER NOT NULL DEFAULT 0,
    questions_attempted     INTEGER NOT NULL DEFAULT 0,
    questions_correct       INTEGER NOT NULL DEFAULT 0,
    accuracy_pct            NUMERIC NOT NULL DEFAULT 0,
    avg_time_per_question   NUMERIC NOT NULL DEFAULT 0,
    started_at              TIMESTAMPTZ NOT NULL,
    ended_at                TIMESTAMPTZ,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_study_sessions_user ON public.study_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_study_sessions_user_date ON public.study_sessions(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_study_sessions_user_topic ON public.study_sessions(user_id, topic_id);
CREATE INDEX IF NOT EXISTS idx_study_sessions_user_type ON public.study_sessions(user_id, session_type);

-- 12. SIMULATION_HISTORY — full mock test results
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.simulation_history (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id                 UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    paper                   TEXT NOT NULL,
    category                TEXT NOT NULL,
    score                   INTEGER NOT NULL,
    total_questions         INTEGER NOT NULL DEFAULT 150,
    correct_count           INTEGER NOT NULL DEFAULT 0,
    wrong_count             INTEGER NOT NULL DEFAULT 0,
    unanswered_count        INTEGER NOT NULL DEFAULT 0,
    time_spent_seconds      INTEGER NOT NULL DEFAULT 0,
    is_qualified            BOOLEAN NOT NULL DEFAULT false,
    time_distribution       JSONB DEFAULT '{}'::jsonb,           -- per-subject breakdown
    answer_changes          JSONB DEFAULT '{}'::jsonb,           -- changed answer analysis
    careless_errors         INTEGER NOT NULL DEFAULT 0,
    time_pressure_drops     INTEGER NOT NULL DEFAULT 0,
    prescription_en         TEXT,
    prescription_ta         TEXT,
    started_at              TIMESTAMPTZ,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_simulation_history_user ON public.simulation_history(user_id);
CREATE INDEX IF NOT EXISTS idx_simulation_history_user_date ON public.simulation_history(user_id, created_at DESC);

-- ============================================================================
-- SEED DATA: subjects
-- ============================================================================
INSERT INTO public.subjects (id, name_en, name_ta, color, icon_name) VALUES
    ('cdp',              'Child Development & Pedagogy',  'குழந்தை வளர்ச்சியும் கற்பித்தல் முறைகளும்',     '#e74c3c', 'Brain'),
    ('tamil',            'Language I — Tamil',             'மொழி I — தமிழ்',                                   '#3498db', 'Languages'),
    ('english',          'Language II — English',          'மொழி II — ஆங்கிலம்',                                '#2ecc71', 'Languages'),
    ('maths',            'Mathematics',                    'கணிதம்',                                            '#f39c12', 'Calculator'),
    ('evs',              'Environmental Studies',          'சுற்றுச்சூழல் பாடம்',                                 '#9b59b6', 'Leaf'),
    ('maths_science',    'Mathematics & Science',          'கணிதம் & அறிவியல்',                                  '#e67e22', 'FlaskConical'),
    ('social_science',   'Social Science',                 'சமூக அறிவியல்',                                      '#1abc9c', 'Globe')
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- SEED DATA: category_cutoffs (2022 official TRB)
-- ============================================================================
INSERT INTO public.category_cutoffs (id, category, year, cutoff_marks, total_marks, percentage, source) VALUES
    ('oc_2022',         'OC_GENERAL',   2022, 90, 150, 60.00, 'TRB TNTET 2022 Official Notification'),
    ('bc_mbc_sc_st_2022', 'BC_MBC_SC_ST', 2022, 82, 150, 55.00, 'TRB TNTET 2022 Official Notification'),
    ('oc_2019',         'OC_GENERAL',   2019, 90, 150, 60.00, 'TRB TNTET 2019 Official Notification'),
    ('bc_mbc_sc_st_2019', 'BC_MBC_SC_ST', 2019, 82, 150, 55.00, 'TRB TNTET 2019 Official Notification')
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

-- Reference data: public read, no public write
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.syllabus_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.question_papers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.category_cutoffs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.question_topics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view subjects"           ON public.subjects           FOR SELECT USING (true);
CREATE POLICY "Anyone can view syllabus_topics"    ON public.syllabus_topics    FOR SELECT USING (true);
CREATE POLICY "Anyone can view question_papers"    ON public.question_papers    FOR SELECT USING (true);
CREATE POLICY "Anyone can view questions"          ON public.questions          FOR SELECT USING (true);
CREATE POLICY "Anyone can view category_cutoffs"   ON public.category_cutoffs   FOR SELECT USING (true);
CREATE POLICY "Anyone can view question_topics"    ON public.question_topics    FOR SELECT USING (true);

-- User data: owner-only access via auth.uid()
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.topic_masteries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mistake_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_study_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.simulation_history ENABLE ROW LEVEL SECURITY;

-- user_profiles
CREATE POLICY "Users can view own profile"     ON public.user_profiles     FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile"   ON public.user_profiles     FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile"   ON public.user_profiles     FOR UPDATE USING (auth.uid() = id);

-- topic_masteries
CREATE POLICY "Users can view own masteries"      ON public.topic_masteries  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own masteries"    ON public.topic_masteries  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own masteries"    ON public.topic_masteries  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own masteries"    ON public.topic_masteries  FOR DELETE USING (auth.uid() = user_id);

-- mistake_queue
CREATE POLICY "Users can view own mistakes"       ON public.mistake_queue    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own mistakes"     ON public.mistake_queue    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own mistakes"     ON public.mistake_queue    FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own mistakes"     ON public.mistake_queue    FOR DELETE USING (auth.uid() = user_id);

-- daily_study_logs
CREATE POLICY "Users can view own daily logs"     ON public.daily_study_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own daily logs"   ON public.daily_study_logs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own daily logs"   ON public.daily_study_logs FOR UPDATE USING (auth.uid() = user_id);

-- study_sessions
CREATE POLICY "Users can view own sessions"       ON public.study_sessions   FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own sessions"     ON public.study_sessions   FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own sessions"     ON public.study_sessions   FOR UPDATE USING (auth.uid() = user_id);

-- simulation_history
CREATE POLICY "Users can view own simulations"    ON public.simulation_history FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own simulations"  ON public.simulation_history FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own simulations"  ON public.simulation_history FOR DELETE USING (auth.uid() = user_id);
