import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';

describe('Supabase Schema Security', () => {
  const schema = readFileSync(
    join(process.cwd(), 'supabase_schema.sql'),
    'utf-8'
  );

  // All 12 tables in the schema
  const ALL_TABLES = [
    'subjects',
    'syllabus_topics',
    'question_papers',
    'questions',
    'category_cutoffs',
    'question_topics',
    'user_profiles',
    'topic_masteries',
    'mistake_queue',
    'daily_study_logs',
    'study_sessions',
    'simulation_history',
  ];

  // User-data tables that require owner-only RLS
  const USER_TABLES = [
    'user_profiles',
    'topic_masteries',
    'mistake_queue',
    'daily_study_logs',
    'study_sessions',
    'simulation_history',
  ];

  // Reference tables that are public read-only
  const REFERENCE_TABLES = [
    'subjects',
    'syllabus_topics',
    'question_papers',
    'questions',
    'category_cutoffs',
    'question_topics',
  ];

  describe('All Tables Exist', () => {
    it('should create all 12 tables', () => {
      for (const table of ALL_TABLES) {
        expect(schema).toContain(`CREATE TABLE IF NOT EXISTS public.${table}`);
      }
    });
  });

  describe('Row Level Security (RLS)', () => {
    it('should enable RLS on all 12 tables', () => {
      for (const table of ALL_TABLES) {
        expect(schema).toContain(`ALTER TABLE public.${table} ENABLE ROW LEVEL SECURITY`);
      }
    });

    it('should NOT have permissive USING (true) policies on user tables', () => {
      expect(schema).not.toContain('USING (true) WITH CHECK (true)');
    });

    it('should use auth.uid() for user isolation on user tables', () => {
      expect(schema).toContain('auth.uid() = id');
      expect(schema).toContain('auth.uid() = user_id');
    });

    it('should have public read policies on reference tables', () => {
      for (const table of REFERENCE_TABLES) {
        expect(schema).toContain(`Anyone can view ${table}`);
      }
    });

    it('should have SELECT, INSERT, UPDATE for user_profiles', () => {
      expect(schema).toContain('Users can view own profile');
      expect(schema).toContain('Users can insert own profile');
      expect(schema).toContain('Users can update own profile');
    });

    it('should have full CRUD for topic_masteries', () => {
      expect(schema).toContain('Users can view own masteries');
      expect(schema).toContain('Users can insert own masteries');
      expect(schema).toContain('Users can update own masteries');
      expect(schema).toContain('Users can delete own masteries');
    });

    it('should have full CRUD for mistake_queue', () => {
      expect(schema).toContain('Users can view own mistakes');
      expect(schema).toContain('Users can insert own mistakes');
      expect(schema).toContain('Users can update own mistakes');
      expect(schema).toContain('Users can delete own mistakes');
    });

    it('should have SELECT, INSERT, UPDATE for daily_study_logs', () => {
      expect(schema).toContain('Users can view own daily logs');
      expect(schema).toContain('Users can insert own daily logs');
      expect(schema).toContain('Users can update own daily logs');
    });

    it('should have SELECT, INSERT, UPDATE for study_sessions', () => {
      expect(schema).toContain('Users can view own sessions');
      expect(schema).toContain('Users can insert own sessions');
      expect(schema).toContain('Users can update own sessions');
    });

    it('should have SELECT, INSERT, DELETE for simulation_history', () => {
      expect(schema).toContain('Users can view own simulations');
      expect(schema).toContain('Users can insert own simulations');
      expect(schema).toContain('Users can delete own simulations');
    });
  });

  describe('Table Structure', () => {
    it('should have user_profiles with UUID FK to auth.users', () => {
      expect(schema).toContain('REFERENCES auth.users(id) ON DELETE CASCADE');
    });

    it('should have foreign keys from user data tables to auth.users', () => {
      for (const table of USER_TABLES.filter(t => t !== 'user_profiles')) {
        expect(schema).toMatch(/user_id\s+UUID NOT NULL REFERENCES auth\.users\(id\)/);
      }
    });

    it('should have foreign keys from questions to question_papers', () => {
      expect(schema).toMatch(/paper_id\s+TEXT NOT NULL REFERENCES public\.question_papers\(id\)/);
    });

    it('should have foreign keys from questions to subjects and syllabus_topics', () => {
      expect(schema).toMatch(/subject_id\s+TEXT NOT NULL REFERENCES public\.subjects\(id\)/);
      expect(schema).toMatch(/topic_id\s+TEXT NOT NULL REFERENCES public\.syllabus_topics\(id\)/);
    });

    it('should have foreign keys from syllabus_topics to subjects', () => {
      expect(schema).toMatch(/subject_id\s+TEXT NOT NULL REFERENCES public\.subjects\(id\) ON DELETE CASCADE/);
    });

    it('should have question_topics junction table', () => {
      expect(schema).toContain('CREATE TABLE IF NOT EXISTS public.question_topics');
      expect(schema).toMatch(/is_primary\s+BOOLEAN NOT NULL DEFAULT false/);
      expect(schema).toMatch(/relevance_score\s+NUMERIC\(3,2\)/);
    });

    it('should have daily_study_logs with study_date', () => {
      expect(schema).toMatch(/study_date\s+DATE NOT NULL/);
      expect(schema).toMatch(/minutes_studied\s+INTEGER NOT NULL DEFAULT 0/);
      expect(schema).toMatch(/topics_touched\s+TEXT\[\]/);
    });

    it('should have study_sessions with session_type', () => {
      expect(schema).toContain('session_type');
      expect(schema).toContain('accuracy_pct');
      expect(schema).toContain('started_at');
    });

    it('should have simulation_history with JSONB fields', () => {
      expect(schema).toContain('time_distribution');
      expect(schema).toContain('answer_changes');
    });
  });

  describe('Indexes', () => {
    it('should have indexes on syllabus_topics', () => {
      expect(schema).toContain('idx_syllabus_topics_subject');
      expect(schema).toContain('idx_syllabus_topics_paper');
    });

    it('should have composite index on questions (subject, topic)', () => {
      expect(schema).toContain('idx_questions_subject_topic');
    });

    it('should have unique index on topic_masteries (user_id, topic_id)', () => {
      expect(schema).toContain('idx_topic_masteries_unique');
    });

    it('should have unique index on daily_study_logs (user_id, study_date)', () => {
      expect(schema).toContain('idx_daily_study_logs_unique');
    });

    it('should have unique index on category_cutoffs (category, year)', () => {
      expect(schema).toContain('idx_category_cutoffs_unique');
    });

    it('should have index on study_sessions by user and date', () => {
      expect(schema).toContain('idx_study_sessions_user_date');
    });

    it('should have index on mistake_queue for active items', () => {
      expect(schema).toContain('idx_mistake_queue_active');
      expect(schema).toContain('idx_mistake_queue_review');
    });
  });

  describe('Seed Data', () => {
    it('should seed 7 subjects', () => {
      expect(schema).toContain("('cdp'");
      expect(schema).toContain("('tamil'");
      expect(schema).toContain("('english'");
      expect(schema).toContain("('maths'");
      expect(schema).toContain("('evs'");
      expect(schema).toContain("('maths_science'");
      expect(schema).toContain("('social_science'");
    });

    it('should seed category_cutoffs', () => {
      expect(schema).toContain("'OC_GENERAL'");
      expect(schema).toContain("'BC_MBC_SC_ST'");
      expect(schema).toContain('cutoff_marks');
    });
  });
});
