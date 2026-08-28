import { describe, it, expect, beforeEach } from 'vitest';
import {
  dbQuestionToApp,
  getQuestionBank,
  getQuestionById,
  getQuestionsForSubject,
  resetQuestionBank,
} from './questionBankService';

describe('questionBankService', () => {
  beforeEach(() => {
    resetQuestionBank();
  });

  const sampleRow = {
    id: 'q_sample_cdp_pg_001',
    subject_id: 'cdp',
    topic_id: 'cdp_piaget_vygotsky',
    question_en: 'According to Piaget, at what age range does the concrete operational stage occur?',
    question_ta: 'பியாஜேயின் கோட்பாட்டின்படி, பருப்பொருள் செயல்பாட்டு நிலை எந்த வயதில் நிகழ்கிறது?',
    option_a_en: '0-2 years',
    option_a_ta: '0-2 ஆண்டுகள்',
    option_b_en: '2-7 years',
    option_b_ta: '2-7 ஆண்டுகள்',
    option_c_en: '7-11 years',
    option_c_ta: '7-11 ஆண்டுகள்',
    option_d_en: '11+ years',
    option_d_ta: '11+ ஆண்டுகள்',
    correct_option: 2,
    difficulty: 'medium',
    question_type: 'factual',
    explanation_en: 'Concrete operational stage spans ages 7-11.',
    explanation_ta: 'பருப்பொருள் செயல்பாட்டு நிலை 7-11 வயது.',
    capacity_summary_en: null,
    capacity_summary_ta: null,
    syllabus_ref: 'SCERT Educational Psychology Unit 2',
    year: 2022,
  } as Parameters<typeof dbQuestionToApp>[0];

  describe('dbQuestionToApp', () => {
    it('maps all bilingual fields correctly', () => {
      const q = dbQuestionToApp(sampleRow);
      expect(q).not.toBeNull();
      expect(q!.id).toBe('q_sample_cdp_pg_001');
      expect(q!.subject).toBe('cdp');
      expect(q!.paper).toBe('PAPER_I');
      expect(q!.difficulty).toBe('Medium');
      expect(q!.questionType).toBe('factual');
      expect(q!.correctOptionIndex).toBe(2);
      expect(q!.optionsEn).toHaveLength(4);
      expect(q!.optionsTa).toHaveLength(4);
      expect(q!.questionEn).toBe(sampleRow.question_en);
      expect(q!.questionTa).toBe(sampleRow.question_ta);
      expect(q!.explanationEn).toBe('Concrete operational stage spans ages 7-11.');
      expect(q!.topicId).toBe('cdp_piaget_vygotsky');
    });

    it('infers paper from embedded question_papers relation', () => {
      const row = { ...sampleRow, question_papers: { paper_type: 'PAPER_II_SOC_SCI' } };
      const q = dbQuestionToApp(row);
      expect(q!.paper).toBe('PAPER_II_SOC_SCI');
    });

    it('maps PAPER_II subject by default when no paper info present', () => {
      const row = { ...sampleRow, subject_id: 'social_science', topic_id: 'social_civics_access' };
      const q = dbQuestionToApp(row);
      expect(q).not.toBeNull();
      expect(q!.paper).toBe('PAPER_II_SOC_SCI');
    });

    it('returns null for an unknown subject id', () => {
      const q = dbQuestionToApp({ ...sampleRow, subject_id: 'nonsense' });
      expect(q).toBeNull();
    });

    it('defaults difficulty to Medium when invalid', () => {
      const q = dbQuestionToApp({ ...sampleRow, difficulty: 'impossible' });
      expect(q!.difficulty).toBe('Medium');
    });
  });

  describe('store accessors', () => {
    it('seeds from ALL_QUESTIONS by default', () => {
      expect(getQuestionBank().length).toBeGreaterThan(0);
    });

    it('resetQuestionBank restores the static seed bank', () => {
      resetQuestionBank();
      const before = getQuestionBank().length;
      expect(before).toBeGreaterThan(0);
    });

    it('getQuestionById finds an existing seed question', () => {
      const q = getQuestionById(getQuestionBank()[0].id);
      expect(q).toBeDefined();
      expect(q!.id).toBe(getQuestionBank()[0].id);
    });

    it('getQuestionsForSubject filters by subject', () => {
      const subject = getQuestionBank()[0].subject;
      const rows = getQuestionsForSubject(subject);
      expect(rows.length).toBeGreaterThan(0);
      rows.forEach((r) => expect(r.subject).toBe(subject));
    });
  });
});
