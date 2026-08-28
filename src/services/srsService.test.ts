import { describe, it, expect, beforeEach } from 'vitest';
import {
  calculateNextInterval,
  mapPerformanceToQuality,
  createSRSItem,
  updateSRSItem,
  getDueItems,
  calculateSRSStats,
  calculateDailyReviewCapacity,
  SRSItem,
} from '../services/srsService';

describe('SRS Service', () => {
  describe('calculateNextInterval', () => {
    it('should reset interval on failed review (quality < 3)', () => {
      const result = calculateNextInterval(10, 5, 2.5, 1);
      expect(result.interval).toBe(1);
      expect(result.repetition).toBe(0);
    });

    it('should set interval to 1 day on first success', () => {
      const result = calculateNextInterval(0, 0, 2.5, 4);
      expect(result.interval).toBe(1);
      expect(result.repetition).toBe(1);
    });

    it('should set interval to 3 days on second success', () => {
      const result = calculateNextInterval(1, 1, 2.5, 4);
      expect(result.interval).toBe(3);
      expect(result.repetition).toBe(2);
    });

    it('should multiply by ease factor on subsequent successes', () => {
      const result = calculateNextInterval(3, 2, 2.5, 4);
      expect(result.interval).toBe(8); // 3 * 2.5 = 7.5, rounded to 8
      expect(result.repetition).toBe(3);
    });

    it('should decrease ease factor on difficult reviews', () => {
      const result = calculateNextInterval(3, 2, 2.5, 3);
      expect(result.easeFactor).toBeLessThan(2.5);
    });

    it('should increase ease factor on easy reviews', () => {
      const result = calculateNextInterval(3, 2, 2.5, 5);
      expect(result.easeFactor).toBeGreaterThan(2.5);
    });

    it('should cap ease factor at MAX_EASE_FACTOR (3.0)', () => {
      const result = calculateNextInterval(3, 2, 2.9, 5);
      expect(result.easeFactor).toBeLessThanOrEqual(3.0);
    });

    it('should not go below MIN_EASE_FACTOR (1.3)', () => {
      const result = calculateNextInterval(3, 2, 1.4, 0);
      expect(result.easeFactor).toBeGreaterThanOrEqual(1.3);
    });

    it('should cap interval at 180 days', () => {
      const result = calculateNextInterval(100, 10, 3.0, 5);
      expect(result.interval).toBeLessThanOrEqual(180);
    });
  });

  describe('mapPerformanceToQuality', () => {
    it('should return 0 for quick wrong answer', () => {
      expect(mapPerformanceToQuality(false, 8)).toBe(0);
    });

    it('should return 1 for moderate-time wrong answer', () => {
      expect(mapPerformanceToQuality(false, 20)).toBe(1);
    });

    it('should return 2 for slow wrong answer', () => {
      expect(mapPerformanceToQuality(false, 40)).toBe(2);
    });

    it('should return 5 for fast, confident, correct answer', () => {
      expect(mapPerformanceToQuality(true, 10, 'high')).toBe(5);
    });

    it('should return 4 for reasonable-time correct answer', () => {
      expect(mapPerformanceToQuality(true, 25)).toBe(4);
    });

    it('should return 3 for slow correct answer', () => {
      expect(mapPerformanceToQuality(true, 50)).toBe(3);
    });
  });

  describe('createSRSItem', () => {
    it('should create an SRS item with correct defaults', () => {
      const item = createSRSItem('q1', 'user1');
      expect(item.questionId).toBe('q1');
      expect(item.userId).toBe('user1');
      expect(item.interval).toBe(0);
      expect(item.repetition).toBe(0);
      expect(item.easeFactor).toBe(2.5);
      expect(item.totalReviews).toBe(0);
      expect(item.isGraduated).toBe(false);
    });
  });

  describe('updateSRSItem', () => {
    it('should update interval after successful review', () => {
      const item = createSRSItem('q1', 'user1');
      const updated = updateSRSItem(item, 4);
      expect(updated.repetition).toBe(1);
      expect(updated.interval).toBe(1);
      expect(updated.totalReviews).toBe(1);
      expect(updated.correctReviews).toBe(1);
    });

    it('should reset after failed review', () => {
      const item = createSRSItem('q1', 'user1');
      // First make it successful
      const updated = updateSRSItem(item, 4);
      // Then fail it
      const failed = updateSRSItem(updated, 1);
      expect(failed.repetition).toBe(0);
      expect(failed.interval).toBe(1);
      expect(failed.currentStreak).toBe(0);
    });

    it('should mark as graduated when interval >= 30 days', () => {
      const item = createSRSItem('q1', 'user1');
      item.repetition = 5;
      item.interval = 25;
      const updated = updateSRSItem(item, 5);
      expect(updated.isGraduated).toBe(true);
    });

    it('should track streak correctly', () => {
      let item = createSRSItem('q1', 'user1');
      item = updateSRSItem(item, 4);
      item = updateSRSItem(item, 4);
      item = updateSRSItem(item, 4);
      expect(item.currentStreak).toBe(3);
      expect(item.longestStreak).toBe(3);
    });

    it('should break streak on failed review', () => {
      let item = createSRSItem('q1', 'user1');
      item = updateSRSItem(item, 4);
      item = updateSRSItem(item, 4);
      item = updateSRSItem(item, 1); // fail
      expect(item.currentStreak).toBe(0);
      expect(item.longestStreak).toBe(2);
    });
  });

  describe('getDueItems', () => {
    it('should return items due for review', () => {
      const now = Date.now();
      const items: SRSItem[] = [
        { ...createSRSItem('q1', 'u1'), nextReviewDate: now - 1000 },
        { ...createSRSItem('q2', 'u1'), nextReviewDate: now + 100000 },
        { ...createSRSItem('q3', 'u1'), nextReviewDate: now - 5000 },
      ];

      const due = getDueItems(items, 10);
      expect(due).toHaveLength(2);
      expect(due[0].questionId).toBe('q3'); // Earlier due date first
    });

    it('should exclude graduated items', () => {
      const now = Date.now();
      const items: SRSItem[] = [
        { ...createSRSItem('q1', 'u1'), nextReviewDate: now - 1000, isGraduated: true },
        { ...createSRSItem('q2', 'u1'), nextReviewDate: now - 1000 },
      ];

      const due = getDueItems(items, 10);
      expect(due).toHaveLength(1);
    });

    it('should respect maxItems limit', () => {
      const now = Date.now();
      const items: SRSItem[] = Array.from({ length: 50 }, (_, i) => ({
        ...createSRSItem(`q${i}`, 'u1'),
        nextReviewDate: now - 1000,
      }));

      const due = getDueItems(items, 10);
      expect(due).toHaveLength(10);
    });
  });

  describe('calculateSRSStats', () => {
    it('should calculate correct stats', () => {
      const items: SRSItem[] = [
        { ...createSRSItem('q1', 'u1'), totalReviews: 5, correctReviews: 4, isGraduated: false },
        { ...createSRSItem('q2', 'u1'), totalReviews: 10, correctReviews: 9, isGraduated: true },
        { ...createSRSItem('q3', 'u1'), totalReviews: 0, correctReviews: 0, isGraduated: false },
      ];

      const stats = calculateSRSStats(items);
      expect(stats.totalItems).toBe(3);
      expect(stats.mastered).toBe(1);
      expect(stats.newItems).toBe(1);
expect(stats.retentionRate).toBe(87);  // 13/15 = 86.67% rounds to 87
    });

    it('should return zeros for empty items', () => {
      const stats = calculateSRSStats([]);
      expect(stats.totalItems).toBe(0);
      expect(stats.retentionRate).toBe(0);
    });
  });

  describe('calculateDailyReviewCapacity', () => {
    it('should calculate 40% of time divided by 2 min per question', () => {
      expect(calculateDailyReviewCapacity(60)).toBe(12); // 60 * 0.4 / 2 = 12
    });

    it('should return at least 0 for very short time', () => {
      expect(calculateDailyReviewCapacity(1)).toBe(0);
    });
  });
});
