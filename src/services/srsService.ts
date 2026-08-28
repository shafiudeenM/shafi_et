// Spaced Repetition System (SRS) for TNTET Mistake Queue
// Implements an SM-2 inspired algorithm optimized for exam preparation
// Candidates review mistakes at increasing intervals until mastery

import { MistakeQueueItem, Question, UserInteraction } from '../types';

/**
 * SRS Difficulty Rating (based on quality of response)
 * - 0: Complete blackout (no recall at all)
 * - 1: Wrong answer, but recognized the topic
 * - 2: Wrong answer, had to think hard
 * - 3: Correct with significant difficulty
 * - 4: Correct with some hesitation
 * - 5: Perfect, instant recall
 */
export type SRSDifficulty = 0 | 1 | 2 | 3 | 4 | 5;

export interface SRSItem {
  id: string;
  questionId: string;
  userId: string;

  // Core SRS fields
  interval: number;           // Days until next review
  repetition: number;         // Number of successful reviews in a row
  easeFactor: number;         // Difficulty multiplier (1.3 to 3.0)
  nextReviewDate: number;     // Timestamp of next review
  lastReviewDate: number;     // Timestamp of last review

  // Tracking
  totalReviews: number;
  correctReviews: number;
  currentStreak: number;      // Correct answers in a row
  longestStreak: number;

  // Metadata
  createdAt: number;
  updatedAt: number;
  isGraduated: boolean;       // True when mastered (interval > 30 days)
}

const MIN_EASE_FACTOR = 1.3;
const MAX_EASE_FACTOR = 3.0;
const DEFAULT_EASE_FACTOR = 2.5;
const GRADUATION_INTERVAL_DAYS = 30;

/**
 * Calculate next SRS interval based on SM-2 algorithm
 * Adapted for exam prep: shorter intervals for harder items
 */
export function calculateNextInterval(
  currentInterval: number,
  repetition: number,
  easeFactor: number,
  quality: SRSDifficulty
): { interval: number; repetition: number; easeFactor: number } {
  let newInterval: number;
  let newRepetition: number;
  let newEaseFactor: number;

  if (quality < 3) {
    // Failed review - reset to beginning
    newRepetition = 0;
    newInterval = 1; // Review again tomorrow
  } else {
    // Successful review - increase interval
    newRepetition = repetition + 1;

    if (newRepetition === 1) {
      newInterval = 1; // First success: review tomorrow
    } else if (newRepetition === 2) {
      newInterval = 3; // Second success: review in 3 days
    } else {
      // Subsequent: multiply by ease factor
      newInterval = Math.round(currentInterval * easeFactor);
    }
  }

  // Update ease factor based on quality
  newEaseFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  newEaseFactor = Math.max(MIN_EASE_FACTOR, Math.min(MAX_EASE_FACTOR, newEaseFactor));

  // Cap interval at 180 days (6 months) - TNTET is annual
  newInterval = Math.min(newInterval, 180);

  return {
    interval: newInterval,
    repetition: newRepetition,
    easeFactor: newEaseFactor,
  };
}

/**
 * Maps user's exam performance to SRS quality rating
 */
export function mapPerformanceToQuality(
  isCorrect: boolean,
  timeSpentSec: number,
  confidence?: 'high' | 'medium' | 'low'
): SRSDifficulty {
  if (!isCorrect) {
    // Wrong answer
    if (timeSpentSec < 10) return 0; // Quick wrong = complete blackout
    if (timeSpentSec < 30) return 1; // Moderate time but wrong
    return 2; // Slow and wrong
  }

  // Correct answer
  if (timeSpentSec < 15 && confidence === 'high') return 5; // Fast, confident, correct
  if (timeSpentSec < 30) return 4; // Reasonable time
  if (timeSpentSec < 60) return 3; // Slow but correct
  return 3; // Very slow but correct
}

/**
 * Creates a new SRS item from a mistake queue item
 */
export function createSRSItem(
  questionId: string,
  userId: string,
  mistakeItem?: MistakeQueueItem
): SRSItem {
  const now = Date.now();
  return {
    id: `srs_${questionId}_${userId}`,
    questionId,
    userId,
    interval: 0,
    repetition: 0,
    easeFactor: DEFAULT_EASE_FACTOR,
    nextReviewDate: now,
    lastReviewDate: now,
    totalReviews: 0,
    correctReviews: 0,
    currentStreak: 0,
    longestStreak: 0,
    createdAt: now,
    updatedAt: now,
    isGraduated: false,
  };
}

/**
 * Updates an SRS item after a review
 */
export function updateSRSItem(
  item: SRSItem,
  quality: SRSDifficulty
): SRSItem {
  const { interval, repetition, easeFactor } = calculateNextInterval(
    item.interval,
    item.repetition,
    item.easeFactor,
    quality
  );

  const isCorrect = quality >= 3;
  const newStreak = isCorrect ? item.currentStreak + 1 : 0;

  const now = Date.now();
  const nextReviewMs = interval * 24 * 60 * 60 * 1000;

  return {
    ...item,
    interval,
    repetition,
    easeFactor,
    nextReviewDate: now + nextReviewMs,
    lastReviewDate: now,
    totalReviews: item.totalReviews + 1,
    correctReviews: item.correctReviews + (isCorrect ? 1 : 0),
    currentStreak: newStreak,
    longestStreak: Math.max(item.longestStreak, newStreak),
    updatedAt: now,
    isGraduated: interval >= GRADUATION_INTERVAL_DAYS,
  };
}

/**
 * Gets items due for review
 */
export function getDueItems(items: SRSItem[], maxItems: number = 20): SRSItem[] {
  const now = Date.now();
  return items
    .filter(item => !item.isGraduated && item.nextReviewDate <= now)
    .sort((a, b) => a.nextReviewDate - b.nextReviewDate)
    .slice(0, maxItems);
}

/**
 * Gets new (never reviewed) items that need first exposure
 */
export function getNewItems(items: SRSItem[], maxItems: number = 10): SRSItem[] {
  return items
    .filter(item => item.totalReviews === 0)
    .slice(0, maxItems);
}

/**
 * Calculates SRS statistics for a user
 */
export function calculateSRSStats(items: SRSItem[]): {
  totalItems: number;
  dueForReview: number;
  newItems: number;
  learning: number;
  mastered: number;
  retentionRate: number;
  avgEaseFactor: number;
} {
  const now = Date.now();
  const due = items.filter(i => !i.isGraduated && i.nextReviewDate <= now).length;
  const newCount = items.filter(i => i.totalReviews === 0).length;
  const learning = items.filter(i => !i.isGraduated && i.totalReviews > 0).length;
  const mastered = items.filter(i => i.isGraduated).length;

  const totalCorrect = items.reduce((sum, i) => sum + i.correctReviews, 0);
  const totalReviews = items.reduce((sum, i) => sum + i.totalReviews, 0);
  const retentionRate = totalReviews > 0 ? Math.round((totalCorrect / totalReviews) * 100) : 0;

  const avgEase = items.length > 0
    ? items.reduce((sum, i) => sum + i.easeFactor, 0) / items.length
    : DEFAULT_EASE_FACTOR;

  return {
    totalItems: items.length,
    dueForReview: due,
    newItems: newCount,
    learning,
    mastered,
    retentionRate,
    avgEaseFactor: Math.round(avgEase * 100) / 100,
  };
}

/**
 * SRS Storage Keys
 */
const SRS_STORAGE_KEY = 'tntet_srs_items';

/**
 * Saves SRS items to localStorage
 */
export function saveSRSItems(items: SRSItem[]): void {
  try {
    localStorage.setItem(SRS_STORAGE_KEY, JSON.stringify(items));
  } catch (e) {
    console.error('Failed to save SRS items:', e);
  }
}

/**
 * Loads SRS items from localStorage
 */
export function loadSRSItems(): SRSItem[] {
  try {
    const raw = localStorage.getItem(SRS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/**
 * Adds or updates an SRS item in the collection
 */
export function upsertSRSItem(newItem: SRSItem): SRSItem[] {
  const items = loadSRSItems();
  const existingIdx = items.findIndex(i => i.questionId === newItem.questionId);

  if (existingIdx >= 0) {
    items[existingIdx] = newItem;
  } else {
    items.push(newItem);
  }

  saveSRSItems(items);
  return items;
}

/**
 * Gets SRS items for a specific question
 */
export function getSRSItemForQuestion(questionId: string): SRSItem | null {
  const items = loadSRSItems();
  return items.find(i => i.questionId === questionId) || null;
}

/**
 * Removes an SRS item (for when mistake is resolved)
 */
export function removeSRSItem(questionId: string): SRSItem[] {
  const items = loadSRSItems();
  const filtered = items.filter(i => i.questionId !== questionId);
  saveSRSItems(filtered);
  return filtered;
}

/**
 * Calculates the optimal daily review count based on available time
 * Assumes ~2 minutes per review question
 */
export function calculateDailyReviewCapacity(availableMinutes: number): number {
  const MINUTES_PER_REVIEW = 2;
  return Math.floor(availableMinutes * 0.4 / MINUTES_PER_REVIEW); // 40% of time for reviews
}
