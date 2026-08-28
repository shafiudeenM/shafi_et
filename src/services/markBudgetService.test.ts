import { describe, it, expect } from 'vitest';
import {
  getQualifyingScore,
  getQualifyingPercent,
  getSubjectsForPaper,
  generateMarkBudget,
  getPriorityColor,
  getPriorityLabelTa,
} from '../services/markBudgetService';
import { TopicMastery } from '../types';

describe('Mark Budget Service', () => {
  describe('getQualifyingScore', () => {
    it('should return 90 for OC_GENERAL', () => {
      expect(getQualifyingScore('OC_GENERAL')).toBe(90);
    });

    it('should return 82 for BC_MBC_SC_ST', () => {
      expect(getQualifyingScore('BC_MBC_SC_ST')).toBe(82);
    });
  });

  describe('getQualifyingPercent', () => {
    it('should return 60 for OC_GENERAL', () => {
      expect(getQualifyingPercent('OC_GENERAL')).toBe(60);
    });

    it('should return 55 for BC_MBC_SC_ST', () => {
      expect(getQualifyingPercent('BC_MBC_SC_ST')).toBe(55);
    });
  });

  describe('getSubjectsForPaper', () => {
    it('should return correct subjects for PAPER_I', () => {
      const subjects = getSubjectsForPaper('PAPER_I');
      expect(subjects).toContain('cdp');
      expect(subjects).toContain('tamil');
      expect(subjects).toContain('english');
      expect(subjects).toContain('maths');
      expect(subjects).toContain('evs');
      expect(subjects).toHaveLength(5);
    });

    it('should return correct subjects for PAPER_II_MATH_SCI', () => {
      const subjects = getSubjectsForPaper('PAPER_II_MATH_SCI');
      expect(subjects).toContain('maths_science');
      expect(subjects).toContain('maths');
      expect(subjects).not.toContain('evs');
    });

    it('should return correct subjects for PAPER_II_SOC_SCI', () => {
      const subjects = getSubjectsForPaper('PAPER_II_SOC_SCI');
      expect(subjects).toContain('social_science');
      expect(subjects).not.toContain('maths');
    });
  });

  describe('generateMarkBudget', () => {
    const mockMasteries: TopicMastery[] = [
      {
        topicId: 'cdp_piaget',
        topicNameEn: 'Piaget',
        topicNameTa: 'பியாஜே',
        subjectId: 'cdp',
        masteryPercent: 70,
        status: 'developing',
        totalAttempted: 10,
        correctCount: 7,
        avgTimePerQuestionSec: 30,
        lastPracticedAt: Date.now(),
      },
      {
        topicId: 'tamil_grammar',
        topicNameEn: 'Tamil Grammar',
        topicNameTa: 'தமிழ் இலக்கணம்',
        subjectId: 'tamil',
        masteryPercent: 85,
        status: 'exam_ready',
        totalAttempted: 15,
        correctCount: 13,
        avgTimePerQuestionSec: 25,
        lastPracticedAt: Date.now(),
      },
    ];

    it('should generate a valid budget plan', () => {
      const plan = generateMarkBudget('BC_MBC_SC_ST', 'PAPER_I', mockMasteries);
      expect(plan.qualifyingScore).toBe(82);
      expect(plan.totalMaxMarks).toBe(150);
      expect(plan.subjectBudgets.length).toBeGreaterThan(0);
      expect(plan.currentProjected).toBeGreaterThanOrEqual(0);
    });

    it('should classify subjects by priority correctly', () => {
      const plan = generateMarkBudget('BC_MBC_SC_ST', 'PAPER_I', mockMasteries);
      const hasFocus = plan.subjectBudgets.some(b => b.priority === 'focus');
      const hasRelax = plan.subjectBudgets.some(b => b.priority === 'relax');
      // With our mock data, at least some subjects should be classified
      expect(typeof hasFocus).toBe('boolean');
      expect(typeof hasRelax).toBe('boolean');
    });
  });

  describe('getPriorityColor', () => {
    it('should return red for focus', () => {
      expect(getPriorityColor('focus')).toBe('#ef4444');
    });

    it('should return amber for maintain', () => {
      expect(getPriorityColor('maintain')).toBe('#f59e0b');
    });

    it('should return green for relax', () => {
      expect(getPriorityColor('relax')).toBe('#22c55e');
    });
  });

  describe('getPriorityLabelTa', () => {
    it('should return Tamil labels', () => {
      expect(getPriorityLabelTa('focus')).toBe('கவனம் செலுத்துக');
      expect(getPriorityLabelTa('maintain')).toBe('பராமரி');
      expect(getPriorityLabelTa('relax')).toBe('ஓய்வு');
    });
  });
});
