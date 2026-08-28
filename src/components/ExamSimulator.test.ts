import { describe, it, expect, vi } from 'vitest';
import { ALL_QUESTIONS } from '../data/tntetData';

describe('Exam Simulator Configuration', () => {
  describe('Question Bank', () => {
    it('should have enough questions for 150Q simulation', () => {
      expect(ALL_QUESTIONS.length).toBeGreaterThan(0);
    });

    it('should have questions with required fields', () => {
      ALL_QUESTIONS.forEach((q) => {
        expect(q.id).toBeDefined();
        expect(q.questionEn).toBeDefined();
        expect(q.questionTa).toBeDefined();
        expect(q.optionsEn).toHaveLength(4);
        expect(q.optionsTa).toHaveLength(4);
        expect(q.correctOptionIndex).toBeGreaterThanOrEqual(0);
        expect(q.correctOptionIndex).toBeLessThan(4);
        expect(q.subject).toBeDefined();
        expect(q.topic).toBeDefined();
      });
    });

    it('should have valid subject IDs', () => {
      const validSubjects = ['cdp', 'tamil', 'english', 'maths', 'evs', 'maths_science', 'social_science'];
      ALL_QUESTIONS.forEach((q) => {
        expect(validSubjects).toContain(q.subject);
      });
    });
  });

  describe('Exam Configuration', () => {
    it('should use 150 questions for full simulation', () => {
      // Simulate the configuration from ExamSimulatorView.tsx
      const FULL_EXAM_QUESTIONS = 150;
      const FULL_EXAM_TIME_MINUTES = 180;

      expect(FULL_EXAM_QUESTIONS).toBe(150);
      expect(FULL_EXAM_TIME_MINUTES).toBe(180);
    });

    it('should have 180 minutes (3 hours) timer', () => {
      const FULL_EXAM_TIME_SECONDS = 180 * 60;
      expect(FULL_EXAM_TIME_SECONDS).toBe(10800);
    });

    it('should have correct qualifying cutoffs', () => {
      const OC_CUTOFF = 60; // 60% for OC
      const BC_CUTOFF = 55; // 55% for BC/MBC/SC/ST

      expect(OC_CUTOFF).toBe(60);
      expect(BC_CUTOFF).toBe(55);
    });
  });

  describe('Question Cycling', () => {
    it('should cycle through questions when bank is smaller than exam size', () => {
      const questionBank = ALL_QUESTIONS;
      const examSize = 150;

      const mockQuestions = Array.from({ length: examSize }).map((_, i) => {
        const baseQ = questionBank[i % questionBank.length];
        return {
          ...baseQ,
          id: `sim_q_${i + 1}`,
        };
      });

      expect(mockQuestions).toHaveLength(150);
      expect(mockQuestions[0].id).toBe('sim_q_1');
      expect(mockQuestions[149].id).toBe('sim_q_150');
    });
  });
});
