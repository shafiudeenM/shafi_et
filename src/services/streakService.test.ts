import { describe, it, expect, beforeEach } from 'vitest';
import {
  getTodayString,
  getYesterdayString,
  daysBetween,
  getCurrentMilestone,
  getNextMilestone,
  getStreakHealth,
  STREAK_MILESTONES,
  StreakData,
  seedStreakFromStudyDates,
} from '../services/streakService';

describe('Streak Service', () => {
  describe('getTodayString', () => {
    it('should return today as YYYY-MM-DD', () => {
      const today = getTodayString();
      expect(today).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(today).toBe(new Date().toISOString().split('T')[0]);
    });
  });

  describe('getYesterdayString', () => {
    it('should return yesterday as YYYY-MM-DD', () => {
      const yesterday = getYesterdayString();
      const d = new Date();
      d.setDate(d.getDate() - 1);
      expect(yesterday).toBe(d.toISOString().split('T')[0]);
    });
  });

  describe('daysBetween', () => {
    it('should calculate days between two dates', () => {
      expect(daysBetween('2026-01-01', '2026-01-02')).toBe(1);
      expect(daysBetween('2026-01-01', '2026-01-10')).toBe(9);
    });

    it('should return 0 for same dates', () => {
      expect(daysBetween('2026-01-01', '2026-01-01')).toBe(0);
    });

    it('should be symmetric', () => {
      expect(daysBetween('2026-01-01', '2026-01-10')).toBe(
        daysBetween('2026-01-10', '2026-01-01')
      );
    });
  });

  describe('getCurrentMilestone', () => {
    it('should return null for streak of 0', () => {
      expect(getCurrentMilestone(0)).toBeNull();
    });

    it('should return first milestone for streak of 1', () => {
      const milestone = getCurrentMilestone(1);
      expect(milestone).not.toBeNull();
      expect(milestone?.days).toBe(1);
    });

    it('should return highest achieved milestone', () => {
      const milestone = getCurrentMilestone(25);
      expect(milestone?.days).toBe(21); // Habit Master
    });

    it('should return last milestone for very high streak', () => {
      const milestone = getCurrentMilestone(100);
      expect(milestone?.days).toBe(90); // TNTET Legend
    });
  });

  describe('getNextMilestone', () => {
    it('should return first milestone for streak of 0', () => {
      const next = getNextMilestone(0);
      expect(next?.days).toBe(1);
    });

    it('should return next milestone after current', () => {
      const next = getNextMilestone(5);
      expect(next?.days).toBe(7); // Week Warrior
    });

    it('should return null when all milestones achieved', () => {
      const next = getNextMilestone(100);
      expect(next).toBeNull();
    });
  });

  describe('getStreakHealth', () => {
    it('should return excellent for meeting weekly goal', () => {
      const data: StreakData = {
        currentStreak: 7,
        longestStreak: 14,
        lastStudyDate: '',
        totalStudyDays: 20,
        todayMinutes: 30,
        todayQuestions: 15,
        todayCorrect: 12,
        weeklyGoal: 6,
        weeklyActual: 6,
        monthlyGoal: 25,
        monthlyActual: 18,
      };
      const health = getStreakHealth(data);
      expect(health.status).toBe('excellent');
    });

    it('should return critical for low weekly actual', () => {
      const data: StreakData = {
        currentStreak: 2,
        longestStreak: 10,
        lastStudyDate: '',
        totalStudyDays: 15,
        todayMinutes: 10,
        todayQuestions: 5,
        todayCorrect: 3,
        weeklyGoal: 6,
        weeklyActual: 2,
        monthlyGoal: 25,
        monthlyActual: 10,
      };
      const health = getStreakHealth(data);
      expect(health.status).toBe('critical');
    });
  });

  describe('STREAK_MILESTONES', () => {
    it('should have milestones in ascending order', () => {
      for (let i = 1; i < STREAK_MILESTONES.length; i++) {
        expect(STREAK_MILESTONES[i].days).toBeGreaterThan(STREAK_MILESTONES[i - 1].days);
      }
    });

    it('should have all required fields', () => {
      STREAK_MILESTONES.forEach(m => {
        expect(m.days).toBeGreaterThan(0);
        expect(m.titleEn).toBeTruthy();
        expect(m.titleTa).toBeTruthy();
        expect(m.descriptionEn).toBeTruthy();
        expect(m.descriptionTa).toBeTruthy();
        expect(m.icon).toBeTruthy();
      });
    });
  });

  describe('seedStreakFromStudyDates', () => {
    beforeEach(() => {
      localStorage.clear();
    });

    it('computes a streak from cloud study dates', () => {
      // Build 3 consecutive days ending today.
      const days: string[] = [0, 1, 2].map((n) => {
        const d = new Date();
        d.setDate(d.getDate() - n);
        return d.toISOString().split('T')[0];
      });
      const seeded = seedStreakFromStudyDates(days);
      expect(seeded.currentStreak).toBe(3);
    });

    it('returns 0 streak for disjoint recent dates', () => {
      const old = new Date();
      old.setDate(old.getDate() - 10);
      const seeded = seedStreakFromStudyDates([old.toISOString().split('T')[0]]);
      expect(seeded.currentStreak).toBe(0);
    });
  });
});
