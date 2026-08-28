// Daily Streak Tracking for TNTET Personal Coach
// Tracks candidate's daily study consistency with streak management
// Gamification element to keep candidates motivated

export interface StreakData {
  currentStreak: number;      // Consecutive days studied
  longestStreak: number;      // All-time longest streak
  lastStudyDate: string;      // ISO date string (YYYY-MM-DD)
  totalStudyDays: number;     // Total days with any study activity
  todayMinutes: number;       // Minutes studied today
  todayQuestions: number;     // Questions attempted today
  todayCorrect: number;       // Correct answers today
  weeklyGoal: number;         // Target days per week (default 6)
  weeklyActual: number;       // Days studied this week
  monthlyGoal: number;        // Target days per month (default 25)
  monthlyActual: number;      // Days studied this month
}

export interface StreakMilestone {
  days: number;
  titleEn: string;
  titleTa: string;
  descriptionEn: string;
  descriptionTa: string;
  icon: string;
}

export const STREAK_MILESTONES: StreakMilestone[] = [
  {
    days: 1,
    titleEn: 'First Step',
    titleTa: 'முதல் படி',
    descriptionEn: 'You started your preparation journey!',
    descriptionTa: 'உங்கள் தயாரிப்புப் பயணம் தொடங்கியது!',
    icon: '🌱',
  },
  {
    days: 3,
    titleEn: 'Getting Started',
    titleTa: 'ஆரம்பம்',
    descriptionEn: '3 days in a row! Building momentum.',
    descriptionTa: '3 நாள் தொடர்ச்சி! வேகம் பிடிக்கிறீர்கள்.',
    icon: '🔥',
  },
  {
    days: 7,
    titleEn: 'Week Warrior',
    titleTa: 'வார வீரர்',
    descriptionEn: '7 days straight! A full week of dedication.',
    descriptionTa: '7 நாள் தொடர்ச்சி! முழு வார அர்ப்பணிப்பு.',
    icon: '⚡',
  },
  {
    days: 14,
    titleEn: 'Fortnight Champion',
    titleTa: 'இரண்டு வார சாம்பியன்',
    descriptionEn: '14 days! You are building serious discipline.',
    descriptionTa: '14 நாள்! கடுமையான ஒழுக்கத்தை உருவாக்குகிறீர்கள்.',
    icon: '💪',
  },
  {
    days: 21,
    titleEn: 'Habit Master',
    titleTa: 'பழக்க மாஸ்டர்',
    descriptionEn: '21 days! This is now a habit. TNTET ready!',
    descriptionTa: '21 நாள்! இது இப்போது பழக்கம். TNTET தயார்!',
    icon: '🏆',
  },
  {
    days: 30,
    titleEn: 'Monthly Legend',
    titleTa: 'மாத லெஜெண்ட்',
    descriptionEn: '30 days! You are unstoppable. Exam ready!',
    descriptionTa: '30 நாள்! உங்களை யாரும் தடுக்க முடியாது. தேர்வு தயார்!',
    icon: '👑',
  },
  {
    days: 60,
    titleEn: 'Diamond Dedication',
    titleTa: 'வைர அர்ப்பணிப்பு',
    descriptionEn: '60 days! You have achieved exceptional discipline.',
    descriptionTa: '60 நாள்! விதிவிலக்கான ஒழுக்கத்தை அடைந்தீர்கள்.',
    icon: '💎',
  },
  {
    days: 90,
    titleEn: 'TNTET Legend',
    titleTa: 'TNTET லெஜெண்ட்',
    descriptionEn: '90 days! You are a true Tamil Nadu teacher candidate.',
    descriptionTa: '90 நாள்! நீங்கள் உண்மையான தமிழ்நாடு ஆசிரியர் வேட்பாளர்.',
    icon: '🎯',
  },
];

const STREAK_STORAGE_KEY = 'tntet_streak_data';

/**
 * Gets today's date as YYYY-MM-DD string
 */
export function getTodayString(): string {
  return new Date().toISOString().split('T')[0];
}

/**
 * Gets yesterday's date as YYYY-MM-DD string
 */
export function getYesterdayString(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().split('T')[0];
}

/**
 * Calculates the difference in days between two date strings
 */
export function daysBetween(date1: string, date2: string): number {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  const diffTime = Math.abs(d2.getTime() - d1.getTime());
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Gets the ISO week number for a date
 */
function getWeekNumber(dateStr: string): number {
  const d = new Date(dateStr);
  const startOfYear = new Date(d.getFullYear(), 0, 1);
  const daysSinceStart = Math.floor((d.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24));
  return Math.ceil(daysSinceStart / 7);
}

/**
 * Calculates current week's study days from streak history
 */
function calculateWeeklyActual(streakHistory: string[]): number {
  const today = getTodayString();
  const todayWeek = getWeekNumber(today);
  return streakHistory.filter(date => getWeekNumber(date) === todayWeek).length;
}

/**
 * Calculates current month's study days from streak history
 */
function calculateMonthlyActual(streakHistory: string[]): number {
  const today = getTodayString();
  const currentMonth = today.substring(0, 7); // YYYY-MM
  return streakHistory.filter(date => date.startsWith(currentMonth)).length;
}

/**
 * Loads streak data from localStorage
 */
export function loadStreakData(): StreakData {
  try {
    const raw = localStorage.getItem(STREAK_STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.warn('Failed to load streak data:', e);
  }

  // Default streak data
  return {
    currentStreak: 0,
    longestStreak: 0,
    lastStudyDate: '',
    totalStudyDays: 0,
    todayMinutes: 0,
    todayQuestions: 0,
    todayCorrect: 0,
    weeklyGoal: 6,
    weeklyActual: 0,
    monthlyGoal: 25,
    monthlyActual: 0,
  };
}

/**
 * Saves streak data to localStorage
 */
export function saveStreakData(data: StreakData): void {
  try {
    localStorage.setItem(STREAK_STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save streak data:', e);
  }
}

/**
 * Records a study session (call this when user completes any study activity)
 * Returns updated streak data
 */
export function recordStudySession(minutes: number, questions: number, correct: number): StreakData {
  const data = loadStreakData();
  const today = getTodayString();
  const yesterday = getYesterdayString();

  // Update today's stats
  data.todayMinutes += minutes;
  data.todayQuestions += questions;
  data.todayCorrect += correct;

  // Check if this is a new day
  if (data.lastStudyDate !== today) {
    // Check if streak continues (studied yesterday)
    if (data.lastStudyDate === yesterday) {
      data.currentStreak += 1;
    } else if (data.lastStudyDate !== today) {
      // Streak broken (or first day)
      data.currentStreak = 1;
    }

    data.totalStudyDays += 1;
    data.lastStudyDate = today;

    // Reset daily counters for new day
    data.todayMinutes = minutes;
    data.todayQuestions = questions;
    data.todayCorrect = correct;
  }

  // Update longest streak
  data.longestStreak = Math.max(data.longestStreak, data.currentStreak);

  // Calculate weekly and monthly actuals
  // Store the date in a history array (we'll reconstruct from totalStudyDays)
  const streakHistory = getStreakHistory();
  if (!streakHistory.includes(today)) {
    streakHistory.push(today);
    saveStreakHistory(streakHistory);
  }

  data.weeklyActual = calculateWeeklyActual(streakHistory);
  data.monthlyActual = calculateMonthlyActual(streakHistory);

  saveStreakData(data);
  return data;
}

/**
 * Streak history storage (simple array of date strings)
 */
const STREAK_HISTORY_KEY = 'tntet_streak_history';

function getStreakHistory(): string[] {
  try {
    const raw = localStorage.getItem(STREAK_HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveStreakHistory(history: string[]): void {
  // Keep only last 365 days
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 365);
  const cutoffStr = cutoff.toISOString().split('T')[0];
  const filtered = history.filter(d => d >= cutoffStr);
  localStorage.setItem(STREAK_HISTORY_KEY, JSON.stringify(filtered));
}

/**
 * Recomputes the current consecutive-day streak from a sorted history of
 * study dates (YYYY-MM-DD), counting backwards from today (or yesterday if
 * the user has not studied yet today).
 */
function computeStreakFromHistory(studyDates: string[]): number {
  if (!studyDates || studyDates.length === 0) return 0;

  const set = new Set(studyDates);
  // Start from today, or from yesterday if today is not yet present.
  let anchor = new Date();
  const todayStr = anchor.toISOString().split('T')[0];
  if (!set.has(todayStr)) {
    anchor.setDate(anchor.getDate() - 1);
  }

  const minCursor = new Date(anchor.getTime() - 365 * 86400000);

  let streak = 0;
  let cursor = new Date(anchor);
  while (cursor >= minCursor) {
    const dayStr = cursor.toISOString().split('T')[0];
    if (!set.has(dayStr)) break;
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

/**
 * Seeds the local streak history with dates reconstructed from cloud study
 * logs (union with existing local history) and recomputes current/longest
 * streak. Call once after a Supabase session is restored so the displayed
 * streak reflects the user's real cloud progress on a fresh device.
 */
export function seedStreakFromStudyDates(cloudStudyDates: string[]): StreakData {
  const data = loadStreakData();
  const history = getStreakHistory();

  const merged = [...new Set([...history, ...(cloudStudyDates || [])])].sort();
  saveStreakHistory(merged);

  data.currentStreak = computeStreakFromHistory(merged);
  data.longestStreak = Math.max(data.longestStreak, data.currentStreak);
  data.totalStudyDays = merged.length;

  // Restore the most recent study date if the local one is missing.
  const lastStored = merged[merged.length - 1];
  if (lastStored && !data.lastStudyDate) {
    data.lastStudyDate = lastStored;
  }

  data.weeklyActual = calculateWeeklyActual(merged);
  data.monthlyActual = calculateMonthlyActual(merged);
  saveStreakData(data);
  return data;
}

/**
 * Checks and updates streak status (call on app load)
 * Handles streak break detection
 */
export function checkStreakStatus(): StreakData {
  const data = loadStreakData();
  const today = getTodayString();
  const yesterday = getYesterdayString();

  // If last study was not today or yesterday, streak is broken
  if (data.lastStudyDate && data.lastStudyDate !== today && data.lastStudyDate !== yesterday) {
    data.currentStreak = 0;
    saveStreakData(data);
  }

  // Recalculate weekly/monthly
  const streakHistory = getStreakHistory();
  data.weeklyActual = calculateWeeklyActual(streakHistory);
  data.monthlyActual = calculateMonthlyActual(streakHistory);
  saveStreakData(data);

  return data;
}

/**
 * Gets the current streak milestone
 */
export function getCurrentMilestone(streak: number): StreakMilestone | null {
  let milestone: StreakMilestone | null = null;
  for (const m of STREAK_MILESTONES) {
    if (streak >= m.days) {
      milestone = m;
    }
  }
  return milestone;
}

/**
 * Gets the next streak milestone
 */
export function getNextMilestone(streak: number): StreakMilestone | null {
  for (const m of STREAK_MILESTONES) {
    if (streak < m.days) {
      return m;
    }
  }
  return null;
}

/**
 * Gets streak health status
 */
export function getStreakHealth(data: StreakData): {
  status: 'excellent' | 'good' | 'warning' | 'critical';
  messageEn: string;
  messageTa: string;
} {
  const { weeklyActual, weeklyGoal, monthlyActual, monthlyGoal } = data;

  if (weeklyActual >= weeklyGoal) {
    return {
      status: 'excellent',
      messageEn: `Outstanding! ${weeklyActual}/${weeklyGoal} days this week. You are on track!`,
      messageTa: `சிறப்பு! இந்த வாரம் ${weeklyActual}/${weeklyGoal} நாள். சரியான பாதையில் உள்ளீர்கள்!`,
    };
  }

  if (weeklyActual >= weeklyGoal - 1) {
    return {
      status: 'good',
      messageEn: `Good pace! ${weeklyActual}/${weeklyGoal} days this week. Keep going!`,
      messageTa: `நல்ல வேகம்! இந்த வாரம் ${weeklyActual}/${weeklyGoal} நாள். தொடருங்கள்!`,
    };
  }

  if (weeklyActual >= weeklyGoal - 2) {
    return {
      status: 'warning',
      messageEn: `Falling behind! ${weeklyActual}/${weeklyGoal} days this week. Study today!`,
      messageTa: `பின்தங்கிறீர்கள்! இந்த வாரம் ${weeklyActual}/${weeklyGoal} நாள். இன்று படியுங்கள்!`,
    };
  }

  return {
    status: 'critical',
    messageEn: `Urgent! Only ${weeklyActual}/${weeklyGoal} days this week. Don't break your streak!`,
    messageTa: `அவசரம்! இந்த வாரம் ${weeklyActual}/${weeklyGoal} நாள் மட்டுமே. உங்கள் தொடரை துண்டிக்காதீர்கள்!`,
  };
}
