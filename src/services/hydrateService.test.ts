import { describe, it, expect, beforeEach } from 'vitest';
import {
  dbTopicMasteryToApp,
  dbMistakeQueueToApp,
  mergeMasteries,
  mergeMistakeQueue,
  studyDatesFromDailyLogs,
} from './hydrateService';
import {
  DbTopicMastery,
  DbMistakeQueue,
  DbDailyStudyLog,
  TopicMastery,
} from '../types';

const KNOWN_TOPIC_ID = 'cdp_physical_growth';

const baseMastery: DbTopicMastery = {
  id: 'm1',
  user_id: 'u1',
  topic_id: KNOWN_TOPIC_ID,
  subject_id: 'cdp',
  mastery_score: 72,
  questions_attempted: 10,
  questions_correct: 7,
  avg_time_per_question: 45,
  status: 'developing',
  last_attempt_at: '2026-08-01T10:00:00Z',
  created_at: '2026-07-01T10:00:00Z',
  updated_at: '2026-08-01T10:00:00Z',
};

const baseMistake: DbMistakeQueue = {
  id: 'mq_c1',
  user_id: 'u1',
  question_id: 'tntet_cdp_001',
  subject_id: 'cdp',
  topic_id: KNOWN_TOPIC_ID,
  mistake_tag: 'concept_confusion',
  selected_option: 2,
  review_count: 1,
  next_review_at: '2026-08-02T10:00:00Z',
  is_resolved: false,
  created_at: '2026-07-30T10:00:00Z',
  updated_at: '2026-07-30T10:00:00Z',
};

describe('Hydrate Service', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('dbTopicMasteryToApp', () => {
    it('maps a known topic mastery into app shape', () => {
      const mapped = dbTopicMasteryToApp(baseMastery);
      expect(mapped).not.toBeNull();
      expect(mapped!.topicId).toBe(KNOWN_TOPIC_ID);
      expect(mapped!.topicNameEn.length).toBeGreaterThan(0);
      expect(mapped!.topicNameTa.length).toBeGreaterThan(0);
      expect(mapped!.masteryPercent).toBe(72);
      expect(mapped!.status).toBe('developing');
      expect(mapped!.totalAttempted).toBe(10);
      expect(mapped!.correctCount).toBe(7);
      expect(mapped!.subjectId).toBe('cdp');
    });

    it('returns null for an unknown topic id', () => {
      expect(dbTopicMasteryToApp({ ...baseMastery, topic_id: 'does_not_exist' })).toBeNull();
    });

    it('defaults status from score when status field is garbage', () => {
      const mapped = dbTopicMasteryToApp({
        ...baseMastery,
        status: 'nonsense' as any,
        mastery_score: 90,
      });
      expect(mapped!.status).toBe('exam_ready');
    });
  });

  describe('dbMistakeQueueToApp', () => {
    it('maps a known-question mistake into app shape', () => {
      const mapped = dbMistakeQueueToApp(baseMistake);
      expect(mapped).not.toBeNull();
      expect(mapped!.id).toBe('mq_c1');
      expect(mapped!.retestCount).toBe(1);
      expect(mapped!.isResolved).toBe(false);
      expect(mapped!.lastInteraction.detectedErrorType).toBe('concept_confusion');
      expect(mapped!.lastInteraction.selectedOptionIndex).toBe(2);
    });

    it('returns null when question cannot be resolved', () => {
      expect(dbMistakeQueueToApp({ ...baseMistake, question_id: 'missing_q' })).toBeNull();
    });
  });

  describe('mergeMasteries', () => {
    const local: TopicMastery[] = [
      {
        topicId: 'cdp_social_emotional',
        topicNameEn: 'Local Social',
        topicNameTa: 'உள்ளூர்',
        subjectId: 'cdp',
        masteryPercent: 10,
        status: 'weak',
        totalAttempted: 1,
        correctCount: 0,
        avgTimePerQuestionSec: 0,
        lastPracticedAt: 0,
        subconcepts: [],
      },
    ];

    it('replaces matching local topic with cloud value', () => {
      const merged = mergeMasteries(local, [baseMastery]);
      const target = merged.find((t) => t.topicId === KNOWN_TOPIC_ID);
      expect(target!.masteryPercent).toBe(72);
      // Local-only topic preserved.
      expect(merged.some((t) => t.topicId === 'cdp_social_emotional')).toBe(true);
    });

    it('returns local unchanged when cloud is empty', () => {
      expect(mergeMasteries(local, [])).toEqual(local);
    });
  });

  describe('mergeMistakeQueue', () => {
    it('keeps cloud mistake when it is the only source', () => {
      const merged = mergeMistakeQueue([], [baseMistake]);
      expect(merged.some((m) => m.id === 'mq_c1')).toBe(true);
    });

    it('preserves unresolved local items not present in cloud', () => {
      const localItem = {
        id: 'local_unresolved',
        question: { id: 'x', questionEn: 'x' } as any,
        lastInteraction: { id: 'i', questionId: 'x', isCorrect: false, timeSpentSec: 0, timestamp: 0 } as any,
        retestCount: 0,
        isResolved: false,
      };
      const merged = mergeMistakeQueue([localItem], []);
      expect(merged.some((m) => m.id === 'local_unresolved')).toBe(true);
    });
  });

  describe('studyDatesFromDailyLogs', () => {
    it('returns unique ascending study dates', () => {
      const logs: DbDailyStudyLog[] = [
        { id: '1', user_id: 'u', study_date: '2026-08-02', minutes_studied: 30, questions_attempted: 5, questions_correct: 4, topics_touched: [], streak_day_number: 2, created_at: '' },
        { id: '2', user_id: 'u', study_date: '2026-08-01', minutes_studied: 30, questions_attempted: 5, questions_correct: 4, topics_touched: [], streak_day_number: 1, created_at: '' },
        { id: '3', user_id: 'u', study_date: '2026-08-01', minutes_studied: 10, questions_attempted: 1, questions_correct: 1, topics_touched: [], streak_day_number: 3, created_at: '' },
      ];
      expect(studyDatesFromDailyLogs(logs)).toEqual(['2026-08-01', '2026-08-02']);
    });

    it('returns empty for no logs', () => {
      expect(studyDatesFromDailyLogs([])).toEqual([]);
    });
  });
});
