import { useSyncExternalStore } from 'react';
import { Question, SubjectId, PaperType } from '../types';
import { ALL_QUESTIONS, SUBJECT_METADATA } from '../data/tntetData';
import { ALL_SYLLABUS_SUBJECTS } from '../data/trbSyllabusData';
import { getSupabase, isSupabaseConfigured } from './supabaseClient';

// ---------------------------------------------------------------------------
// Topic -> metadata lookup
// ---------------------------------------------------------------------------

interface TopicMeta {
  nameEn: string;
  nameTa: string;
  subjectId: SubjectId;
  unitEn: string;
  unitTa: string;
  paper: PaperType;
}

const TOPIC_META: Map<string, TopicMeta> = new Map();

for (const subject of ALL_SYLLABUS_SUBJECTS) {
  const subjectId = subject.id as SubjectId;
  const paper: PaperType =
    subject.paper === 'PAPER_II'
      ? subjectId === 'social_science'
        ? 'PAPER_II_SOC_SCI'
        : 'PAPER_II_MATH_SCI'
      : 'PAPER_I';
  for (const unit of subject.units) {
    for (const topic of unit.topics) {
      TOPIC_META.set(topic.id, {
        nameEn: topic.nameEn,
        nameTa: topic.nameTa,
        subjectId,
        unitEn: unit.nameEn,
        unitTa: unit.nameTa,
        paper,
      });
    }
  }
}

const DIFFICULTY_MAP: Record<string, Question['difficulty']> = {
  easy: 'Easy',
  medium: 'Medium',
  hard: 'Hard',
};

const TYPE_MAP: Record<string, Question['questionType']> = {
  conceptual: 'conceptual',
  factual: 'factual',
  application: 'application',
  pedagogy: 'pedagogy',
};

// ---------------------------------------------------------------------------
// DbQuestion -> Question mapper
// ---------------------------------------------------------------------------

export function dbQuestionToApp(row: {
  id: string;
  paper_id?: string;
  subject_id: string;
  topic_id: string;
  question_en: string;
  question_ta: string;
  option_a_en: string;
  option_a_ta: string;
  option_b_en: string;
  option_b_ta: string;
  option_c_en: string;
  option_c_ta: string;
  option_d_en: string;
  option_d_ta: string;
  correct_option: number;
  difficulty?: string | null;
  question_type?: string | null;
  explanation_en?: string | null;
  explanation_ta?: string | null;
  concept_summary_en?: string | null;
  concept_summary_ta?: string | null;
  syllabus_ref?: string | null;
  year: number;
  paper?: { paper_type?: string | null } | null;
  question_papers?: { paper_type?: string | null } | null;
}): Question | null {
  const subject = row.subject_id as SubjectId;
  if (!SUBJECT_METADATA[subject]) {
    console.warn(`[questionBank] Skipping question ${row.id}: unknown subject ${row.subject_id}`);
    return null;
  }

  const topicMeta = TOPIC_META.get(row.topic_id);
  const embeddedPaper = row.paper?.paper_type || row.question_papers?.paper_type;
  const paperType = (embeddedPaper as PaperType) ||
    topicMeta?.paper ||
    (subject === 'maths_science' || subject === 'social_science' ? 'PAPER_II_SOC_SCI' : 'PAPER_I') as PaperType;

  const subjectMeta = SUBJECT_METADATA[subject];
  const chapterEn = topicMeta?.nameEn || subjectMeta.nameEn;
  const chapterTa = topicMeta?.nameTa || subjectMeta.nameTa;

  return {
    id: row.id,
    paper: paperType,
    subject,
    unit: topicMeta?.unitEn || 'TRB Question Bank',
    chapter: chapterEn,
    topic: chapterEn,
    topicId: row.topic_id,
    subtopic: '',
    concept: chapterEn,
    questionType: TYPE_MAP[row.question_type || ''] || 'conceptual',
    difficulty: DIFFICULTY_MAP[row.difficulty || ''] || 'Medium',
    source: 'TRB TNTET Official',
    year: row.year || new Date().getFullYear(),
    questionEn: row.question_en,
    questionTa: row.question_ta,
    optionsEn: [row.option_a_en, row.option_b_en, row.option_c_en, row.option_d_en] as [string, string, string, string],
    optionsTa: [row.option_a_ta, row.option_b_ta, row.option_c_ta, row.option_d_ta] as [string, string, string, string],
    correctOptionIndex: row.correct_option,
    explanationEn: row.explanation_en || '',
    explanationTa: row.explanation_ta || '',
    conceptSummaryEn: row.concept_summary_en || '',
    conceptSummaryTa: row.concept_summary_ta || '',
    syllabusRef: row.syllabus_ref || chapterEn,
  };
}

// ---------------------------------------------------------------------------
// Question bank store
// ---------------------------------------------------------------------------

let bank: Question[] = [...ALL_QUESTIONS];
const listeners = new Set<() => void>();
let hydrationPromise: Promise<void> | null = null;
let hasHydrated = false;

function emit() {
  for (const l of [...listeners]) l();
}

function setBank(next: Question[]) {
  bank = next;
  emit();
}

/**
 * Returns the full merged question bank (static seed + DB questions, DB wins on id).
 */
export function getQuestionBank(): Question[] {
  return bank;
}

/**
 * Returns a single question by id, or undefined.
 */
export function getQuestionById(id: string): Question | undefined {
  return bank.find((q) => q.id === id);
}

/**
 * Returns questions filtered to a subject (all papers).
 */
export function getQuestionsForSubject(subject: SubjectId): Question[] {
  return bank.filter((q) => q.subject === subject);
}

/**
 * Fetches the active question bank from Supabase and merges it into memory.
 *
 * Merge rule: DB questions are authoritative. On id conflict the DB row wins;
 * otherwise DB rows are appended to the static seed bank. If Supabase is not
 * configured, the static bank is returned unchanged. Safe to call multiple times
 * (idempotent, single in-flight request).
 */
export async function initQuestionBank(): Promise<void> {
  if (hydrationPromise) return hydrationPromise;
  if (!isSupabaseConfigured()) {
    hasHydrated = true;
    return;
  }

  hydrationPromise = (async () => {
    const supabase = getSupabase();
    if (!supabase) {
      hasHydrated = true;
      return;
    }
    try {
      const { data, error } = await supabase
        .from('questions')
        .select('*, question_papers(paper_type)')
        .eq('is_active', true)
        .limit(3000);

      if (error) {
        console.warn('[questionBank] fetch error:', error.message);
        return;
      }
      if (!data || data.length === 0) return;

      const merged = new Map<string, Question>();
      for (const q of ALL_QUESTIONS) merged.set(q.id, q);
      for (const row of data) {
        const mapped = dbQuestionToApp(row as Parameters<typeof dbQuestionToApp>[0]);
        if (mapped) merged.set(mapped.id, mapped);
      }
      setBank([...merged.values()]);
    } finally {
      hasHydrated = true;
    }
  })();

  return hydrationPromise;
}

/**
 * Clears the bank back to the static seed bank. Mostly used for tests/reset.
 */
export function resetQuestionBank(): void {
  bank = [...ALL_QUESTIONS];
  hasHydrated = false;
  hydrationPromise = null;
  emit();
}

export function isQuestionBankHydrated(): boolean {
  return hasHydrated;
}

/**
 * React hook — subscribes to the live question bank. Components that read
 * questions (simulator, practice, diagnostic, daily session, chapter counts)
 * should use this so they re-render once DB questions finish hydrating.
 */
export function useQuestionBank(): Question[] {
  return useSyncExternalStore(
    (onStoreChange) => {
      listeners.add(onStoreChange);
      return () => listeners.delete(onStoreChange);
    },
    getQuestionBank,
    getQuestionBank,
  );
}
