import {
  DbTopicMastery,
  DbMistakeQueue,
  DbDailyStudyLog,
  TopicMastery,
  MistakeQueueItem,
  SubjectId,
  ErrorType,
} from '../types';
import { getQuestionById } from './questionBankService';
import { ALL_SYLLABUS_SUBJECTS } from '../data/trbSyllabusData';

/**
 * Hydration service.
 *
 * Maps cloud DB rows (returned by dbSyncService.hydrateFromCloud()) back into
 * the app's in-memory shapes (TopicMastery[], MistakeQueueItem[]) and defines
 * the merge strategy used when a Supabase session is restored.
 *
 * Merge rules:
 *  - Topic masteries: CLOUD WINS. Instances synced from cloud activity are
 *    authoritative; local defaults represent no real progress.
 *  - Mistake queue: MERGE. Keep unique cloud items, keep local unresolved
 *    items the cloud does not have. Never overwrite resolved local state.
 */

// Build a flattened topic-id -> topic lookup across the full syllabus.
const SYLLABUS_TOPIC_BY_ID = new Map<string, { nameEn: string; nameTa: string; subjectId: SubjectId }>();
for (const subject of ALL_SYLLABUS_SUBJECTS) {
  for (const unit of subject.units) {
    for (const topic of unit.topics) {
      SYLLABUS_TOPIC_BY_ID.set(topic.id, {
        nameEn: topic.nameEn,
        nameTa: topic.nameTa,
        subjectId: subject.id as SubjectId,
      });
    }
  }
}

const isSubjectId = (value: string | null | undefined): value is SubjectId => {
  if (!value) return false;
  return (
    value === 'cdp' ||
    value === 'tamil' ||
    value === 'english' ||
    value === 'maths' ||
    value === 'evs' ||
    value === 'maths_science' ||
    value === 'social_science'
  );
};

const isErrorType = (value: string | null | undefined): value is ErrorType => {
  if (!value) return false;
  return (
    value === 'knowledge_gap' ||
    value === 'concept_confusion' ||
    value === 'misread_question' ||
    value === 'careless_error' ||
    value === 'time_pressure'
  );
};

/**
 * Map a cloud topic_masteries row to an app TopicMastery.
 * Falls back to topic metadata from the syllabus; if the topic id is unknown
 * the row is skipped (can't render a meaningful mastery without a name).
 */
export function dbTopicMasteryToApp(row: DbTopicMastery): TopicMastery | null {
  const meta = SYLLABUS_TOPIC_BY_ID.get(row.topic_id);
  if (!meta) {
    console.warn(`[hydrate] Skipping mastery for unknown topic: ${row.topic_id}`);
    return null;
  }

  const attempted = row.questions_attempted || 0;
  const mastered = attempted > 0 ? Math.max(0, Math.min(100, Math.round(row.mastery_score ?? 0))) : 0;

  return {
    topicId: row.topic_id,
    topicNameEn: meta.nameEn,
    topicNameTa: meta.nameTa,
    subjectId: meta.subjectId,
    masteryPercent: mastered,
    status: row.status && (row.status === 'weak' || row.status === 'developing' || row.status === 'exam_ready')
      ? row.status
      : mastered >= 75
        ? 'exam_ready'
        : mastered >= 40
          ? 'developing'
          : 'weak',
    totalAttempted: attempted,
    correctCount: row.questions_correct || 0,
    avgTimePerQuestionSec: row.avg_time_per_question || 0,
    lastPracticedAt: row.last_attempt_at ? new Date(row.last_attempt_at).getTime() : 0,
    subconcepts: [],
  };
}

/**
 * Map a cloud mistake_queue row to an app MistakeQueueItem.
 * Requires a resolvable Question (by id) — otherwise the item cannot be
 * rendered and is skipped.
 */
export function dbMistakeQueueToApp(row: DbMistakeQueue): MistakeQueueItem | null {
  const question = getQuestionById(row.question_id);
  if (!question) {
    console.warn(`[hydrate] Skipping mistake for unknown question: ${row.question_id}`);
    return null;
  }

  return {
    id: row.id,
    question,
    lastInteraction: {
      id: `cloud_${row.id}`,
      questionId: question.id,
      selectedOptionIndex: row.selected_option ?? 0,
      isCorrect: false,
      timeSpentSec: 0,
      detectedErrorType: isErrorType(row.mistake_tag) ? row.mistake_tag : 'knowledge_gap',
      timestamp: row.updated_at ? new Date(row.updated_at).getTime() : Date.now(),
      testContext: 'mistake_review',
    },
    retestCount: row.review_count || 0,
    isResolved: Boolean(row.is_resolved),
    scheduledForSpacedRevision: row.next_review_at ? new Date(row.next_review_at).getTime() : undefined,
  };
}

/**
 * Merge strategy for topic masteries. Cloud is authoritative when it has a
 * row for the topic; local-only topics are kept. Cloud values replace local
 * entries for matching topic ids.
 */
export function mergeMasteries(local: TopicMastery[], cloud: DbTopicMastery[]): TopicMastery[] {
  if (!cloud || cloud.length === 0) return local;

  const cloudItems: TopicMastery[] = [];
  for (const row of cloud) {
    const mapped = dbTopicMasteryToApp(row);
    if (mapped) cloudItems.push(mapped);
  }
  if (cloudItems.length === 0) return local;

  const cloudByTopic = new Map<string, TopicMastery>();
  for (const item of cloudItems) cloudByTopic.set(item.topicId, item);

  const merged = local
    .filter((item) => !cloudByTopic.has(item.topicId))
    .concat([...cloudByTopic.values()]);

  return merged;
}

/**
 * Merge strategy for mistake queue. Keeps every unique cloud item plus any
 * local item that is both unresolved and not superseded by the cloud.
 */
export function mergeMistakeQueue(
  local: MistakeQueueItem[],
  cloud: DbMistakeQueue[],
): MistakeQueueItem[] {
  if (!cloud || cloud.length === 0) return local;

  const cloudItems: MistakeQueueItem[] = [];
  for (const row of cloud) {
    const mapped = dbMistakeQueueToApp(row);
    if (mapped) cloudItems.push(mapped);
  }

  const existingIds = new Set<string>();
  const merged: MistakeQueueItem[] = [];

  // Cloud items first (authoritative, includes their review state).
  for (const item of cloudItems) {
    if (existingIds.has(item.id)) continue;
    existingIds.add(item.id);
    merged.push(item);
  }

  // Preserve local items that are unresolved and not present in cloud.
  for (const item of local) {
    if (existingIds.has(item.id)) continue;
    existingIds.add(item.id);
    if (!item.isResolved) merged.push(item);
  }

  return merged;
}

/**
 * Reconstructs the list of distinct study dates (YYYY-MM-DD) from cloud daily
 * study logs, in ascending order. Used to seed the local streak history so the
 * streak recomputes correctly after a fresh login.
 */
export function studyDatesFromDailyLogs(logs: DbDailyStudyLog[]): string[] {
  if (!logs || logs.length === 0) return [];
  const dates = logs
    .map((l) => l.study_date)
    .filter(Boolean)
    .sort();
  return [...new Set(dates)];
}
