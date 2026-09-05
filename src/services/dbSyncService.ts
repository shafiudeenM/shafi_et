import { getSupabase, isSupabaseConfigured } from './supabaseClient';
import { 
  UserProfile, 
  TopicMastery, 
  MistakeQueueItem, 
  SimulationResult,
  DbUserProfile,
  DbTopicMastery,
  DbMistakeQueue,
  DbSimulationHistory,
  DbDailyStudyLog,
  DbStudySession,
} from '../types';

export interface SyncStatus {
  isConfigured: boolean;
  isConnected: boolean;
  lastSyncedAt: Date | null;
  errorMessage: string | null;
}

type HydrationResult = {
  profile: Partial<UserProfile> | null;
  masteries: DbTopicMastery[];
  mistakeQueue: DbMistakeQueue[];
  dailyLogs: DbDailyStudyLog[];
};

class DatabaseSyncService {
  private userId: string | null = null;
  private masteryTimer: any = null;
  private mistakeTimer: any = null;
  private pendingMasteries: TopicMastery[] | null = null;
  private pendingMistakes: MistakeQueueItem[] | null = null;
  private hydrationInFlight: Promise<HydrationResult> | null = null;

  /**
   * Set the authenticated user ID (called after Supabase Auth sign-in)
   */
  public setUserId(id: string | null): void {
    this.userId = id;
  }

  public getUserId(): string | null {
    return this.userId;
  }

  public isCloudConnected(): boolean {
    return isSupabaseConfigured();
  }

  // ---------------------------------------------------------------------------
  // USER PROFILE
  // ---------------------------------------------------------------------------

  /**
   * Syncs candidate profile state to Supabase
   */
  public async syncUserProfile(profile: UserProfile): Promise<boolean> {
    const supabase = getSupabase();
    if (!supabase || !this.userId) return false;

    try {
      const { error } = await supabase
        .from('user_profiles')
        .upsert({
          id: this.userId,
          email: profile.email || null,
          name: profile.name,
          selected_paper: profile.selectedPaper,
          language_mode: profile.languageMode,
          persona: profile.persona,
          category: profile.category,
          daily_study_minutes: profile.dailyStudyMinutes,
          has_completed_diagnostic: profile.hasCompletedDiagnostic,
          target_exam_date: profile.targetExamDate || null,
          streak_days: profile.streakDays,
          theme: profile.theme || 'dark',
          updated_at: new Date().toISOString()
        });

      if (error) {
        console.warn('Supabase syncUserProfile error:', error.message);
        return false;
      }
      return true;
    } catch (err) {
      console.warn('Supabase syncUserProfile exception:', err);
      return false;
    }
  }

  /**
   * Fetches remote profile if available
   */
  public async fetchUserProfile(): Promise<Partial<UserProfile> | null> {
    const supabase = getSupabase();
    if (!supabase || !this.userId) return null;

    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', this.userId)
        .single();

      if (error || !data) return null;

      return {
        name: data.name,
        selectedPaper: data.selected_paper,
        languageMode: data.language_mode,
        persona: data.persona,
        category: data.category,
        dailyStudyMinutes: data.daily_study_minutes,
        hasCompletedDiagnostic: data.has_completed_diagnostic,
        targetExamDate: data.target_exam_date,
        streakDays: data.streak_days,
        theme: data.theme,
      };
    } catch (err) {
      console.warn('Supabase fetchUserProfile exception:', err);
      return null;
    }
  }

  // ---------------------------------------------------------------------------
  // TOPIC MASTERIES
  // ---------------------------------------------------------------------------

  /**
   * Debounced sync for Topic Masteries to minimize DB write rate
   */
  public debouncedSyncTopicMasteries(masteries: TopicMastery[]): void {
    this.pendingMasteries = masteries;
    if (this.masteryTimer) clearTimeout(this.masteryTimer);
    this.masteryTimer = setTimeout(() => {
      if (this.pendingMasteries) {
        this.syncTopicMasteries(this.pendingMasteries).catch(console.warn);
        this.pendingMasteries = null;
      }
    }, 4000);
  }

  /**
   * Syncs all topic masteries to Supabase
   */
  public async syncTopicMasteries(masteries: TopicMastery[]): Promise<boolean> {
    const supabase = getSupabase();
    if (!supabase || !this.userId || masteries.length === 0) return false;

    try {
      const records = masteries.map((m) => ({
        user_id: this.userId,
        topic_id: m.topicId,
        subject_id: m.subjectId,
        mastery_score: m.masteryPercent,
        questions_attempted: m.totalAttempted,
        questions_correct: m.correctCount,
        avg_time_per_question: m.avgTimePerQuestionSec,
        status: m.status,
        last_attempt_at: m.lastPracticedAt ? new Date(m.lastPracticedAt).toISOString() : null,
        updated_at: new Date().toISOString()
      }));

      const { error } = await supabase
        .from('topic_masteries')
        .upsert(records, { onConflict: 'user_id,topic_id' });

      if (error) {
        console.warn('Supabase syncTopicMasteries error:', error.message);
        return false;
      }
      return true;
    } catch (err) {
      console.warn('Supabase syncTopicMasteries exception:', err);
      return false;
    }
  }

  // ---------------------------------------------------------------------------
  // MISTAKE QUEUE
  // ---------------------------------------------------------------------------

  /**
   * Debounced sync for Mistake Queue to minimize DB write rate
   */
  public debouncedSyncMistakeQueue(items: MistakeQueueItem[]): void {
    this.pendingMistakes = items;
    if (this.mistakeTimer) clearTimeout(this.mistakeTimer);
    this.mistakeTimer = setTimeout(() => {
      if (this.pendingMistakes) {
        this.syncMistakeQueue(this.pendingMistakes).catch(console.warn);
        this.pendingMistakes = null;
      }
    }, 4000);
  }

  /**
   * Syncs mistake queue items to Supabase
   */
  public async syncMistakeQueue(items: MistakeQueueItem[]): Promise<boolean> {
    const supabase = getSupabase();
    if (!supabase || !this.userId) return false;

    try {
      if (items.length === 0) return true;

      const records = items.map((item) => ({
        user_id: this.userId,
        question_id: item.question.id,
        subject_id: item.question.subject,
        topic_id: item.question.topicId,
        mistake_tag: item.lastInteraction?.detectedErrorType || 'concept_confusion',
        selected_option: item.lastInteraction?.selectedOptionIndex ?? null,
        review_count: item.retestCount || 0,
        next_review_at: item.scheduledForSpacedRevision
          ? new Date(item.scheduledForSpacedRevision).toISOString()
          : null,
        is_resolved: item.isResolved,
        updated_at: new Date().toISOString()
      }));

      const { error } = await supabase
        .from('mistake_queue')
        .upsert(records, { onConflict: 'user_id,question_id' });

      if (error) {
        console.warn('Supabase syncMistakeQueue error:', error.message);
        return false;
      }
      return true;
    } catch (err) {
      console.warn('Supabase syncMistakeQueue exception:', err);
      return false;
    }
  }

  // ---------------------------------------------------------------------------
  // DAILY STUDY LOGS
  // ---------------------------------------------------------------------------

  /**
   * Upserts a daily study log entry (one row per day per user)
   */
  public async syncDailyStudyLog(log: {
    studyDate: string;
    minutesStudied: number;
    questionsAttempted: number;
    questionsCorrect: number;
    topicsTouched: string[];
    streakDayNumber: number;
  }): Promise<boolean> {
    const supabase = getSupabase();
    if (!supabase || !this.userId) return false;

    try {
      const { error } = await supabase
        .from('daily_study_logs')
        .upsert({
          user_id: this.userId,
          study_date: log.studyDate,
          minutes_studied: log.minutesStudied,
          questions_attempted: log.questionsAttempted,
          questions_correct: log.questionsCorrect,
          topics_touched: log.topicsTouched,
          streak_day_number: log.streakDayNumber,
        }, { onConflict: 'user_id,study_date' });

      if (error) {
        console.warn('Supabase syncDailyStudyLog error:', error.message);
        return false;
      }
      return true;
    } catch (err) {
      console.warn('Supabase syncDailyStudyLog exception:', err);
      return false;
    }
  }

  // ---------------------------------------------------------------------------
  // STUDY SESSIONS
  // ---------------------------------------------------------------------------

  /**
   * Logs a completed study session
   */
  public async logStudySession(session: {
    sessionType: DbStudySession['session_type'];
    subjectId?: string | null;
    topicId?: string | null;
    durationSeconds: number;
    questionsAttempted: number;
    questionsCorrect: number;
    startedAt: string;
    endedAt?: string;
  }): Promise<boolean> {
    const supabase = getSupabase();
    if (!supabase || !this.userId) return false;

    try {
      const accuracy = session.questionsAttempted > 0
        ? (session.questionsCorrect / session.questionsAttempted) * 100
        : 0;
      const avgTime = session.questionsAttempted > 0
        ? session.durationSeconds / session.questionsAttempted
        : 0;

      const { error } = await supabase
        .from('study_sessions')
        .insert({
          user_id: this.userId,
          session_type: session.sessionType,
          subject_id: session.subjectId || null,
          topic_id: session.topicId || null,
          duration_seconds: session.durationSeconds,
          questions_attempted: session.questionsAttempted,
          questions_correct: session.questionsCorrect,
          accuracy_pct: accuracy,
          avg_time_per_question: avgTime,
          started_at: session.startedAt,
          ended_at: session.endedAt || new Date().toISOString(),
        });

      if (error) {
        console.warn('Supabase logStudySession error:', error.message);
        return false;
      }
      return true;
    } catch (err) {
      console.warn('Supabase logStudySession exception:', err);
      return false;
    }
  }

  // ---------------------------------------------------------------------------
  // SIMULATION HISTORY
  // ---------------------------------------------------------------------------

  /**
   * Logs a completed simulation test to Supabase
   */
  public async saveSimulationResult(
    score: number, 
    total: number, 
    paper: string, 
    category: string,
    timeSpentSec: number = 0,
    answerChanges: Record<string, unknown> = {},
    extra?: {
      correctCount?: number;
      wrongCount?: number;
      unansweredCount?: number;
      carelessErrors?: number;
      timePressureDrops?: number;
      prescriptionEn?: string;
      prescriptionTa?: string;
      timeDistribution?: Record<string, unknown>;
      startedAt?: string;
    }
  ): Promise<boolean> {
    const supabase = getSupabase();
    if (!supabase || !this.userId) return false;

    try {
      const qualifyingCutoff = category === 'OC_GENERAL' ? 90 : 82;
      const isQualified = score >= qualifyingCutoff;

      const correct = extra?.correctCount ?? score;
      const wrong = extra?.wrongCount ?? 0;
      const unanswered = extra?.unansweredCount ?? (total - correct - wrong);

      const { error } = await supabase
        .from('simulation_history')
        .insert({
          user_id: this.userId,
          score,
          total_questions: total,
          correct_count: correct,
          wrong_count: wrong,
          unanswered_count: unanswered,
          time_spent_seconds: timeSpentSec,
          category,
          paper,
          is_qualified: isQualified,
          time_distribution: extra?.timeDistribution || {},
          answer_changes: answerChanges,
          careless_errors: extra?.carelessErrors || 0,
          time_pressure_drops: extra?.timePressureDrops || 0,
          prescription_en: extra?.prescriptionEn || null,
          prescription_ta: extra?.prescriptionTa || null,
          started_at: extra?.startedAt || null,
          created_at: new Date().toISOString()
        });

      if (error) {
        console.warn('Supabase saveSimulationResult error:', error.message);
        return false;
      }
      return true;
    } catch (err) {
      console.warn('Supabase saveSimulationResult exception:', err);
      return false;
    }
  }

  /**
   * Fetches simulation history for the current user
   */
  public async fetchSimulationHistory(limit: number = 20): Promise<DbSimulationHistory[]> {
    const supabase = getSupabase();
    if (!supabase || !this.userId) return [];

    try {
      const { data, error } = await supabase
        .from('simulation_history')
        .select('*')
        .eq('user_id', this.userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error || !data) return [];
      return data;
    } catch (err) {
      console.warn('Supabase fetchSimulationHistory exception:', err);
      return [];
    }
  }

  /**
   * Fetches topic masteries from cloud for the current user
   */
  public async fetchTopicMasteries(): Promise<DbTopicMastery[]> {
    const supabase = getSupabase();
    if (!supabase || !this.userId) return [];

    try {
      const { data, error } = await supabase
        .from('topic_masteries')
        .select('*')
        .eq('user_id', this.userId);

      if (error || !data) return [];
      return data;
    } catch (err) {
      console.warn('Supabase fetchTopicMasteries exception:', err);
      return [];
    }
  }

  /**
   * Fetches active mistake queue items from cloud for the current user
   */
  public async fetchMistakeQueue(): Promise<DbMistakeQueue[]> {
    const supabase = getSupabase();
    if (!supabase || !this.userId) return [];

    try {
      const { data, error } = await supabase
        .from('mistake_queue')
        .select('*')
        .eq('user_id', this.userId)
        .eq('is_resolved', false);

      if (error || !data) return [];
      return data;
    } catch (err) {
      console.warn('Supabase fetchMistakeQueue exception:', err);
      return [];
    }
  }

  /**
   * Fetches daily study logs from cloud for the current user
   */
  public async fetchDailyStudyLogs(): Promise<DbDailyStudyLog[]> {
    const supabase = getSupabase();
    if (!supabase || !this.userId) return [];

    try {
      const { data, error } = await supabase
        .from('daily_study_logs')
        .select('*')
        .eq('user_id', this.userId)
        .order('study_date', { ascending: false });

      if (error || !data) return [];
      return data;
    } catch (err) {
      console.warn('Supabase fetchDailyStudyLogs exception:', err);
      return [];
    }
  }

  /**
   * Hydrates local state from cloud on login.
   * Returns all user data needed to initialize the app.
   *
   * Concurrent calls share a single in-flight request, so a sign-in flow that
   * triggers multiple hydrations (auth state change + App.tsx) never performs
   * overlapping pulls that could race and clobber newer cloud/local rows.
   */
  public async hydrateFromCloud(): Promise<{
    profile: Partial<UserProfile> | null;
    masteries: DbTopicMastery[];
    mistakeQueue: DbMistakeQueue[];
    dailyLogs: DbDailyStudyLog[];
  }> {
    if (!this.userId) {
      return { profile: null, masteries: [], mistakeQueue: [], dailyLogs: [] };
    }

    if (this.hydrationInFlight) {
      return this.hydrationInFlight;
    }

    this.hydrationInFlight = this.doHydrate().finally(() => {
      this.hydrationInFlight = null;
    });
    return this.hydrationInFlight;
  }

  private async doHydrate(): Promise<HydrationResult> {
    const [profile, masteries, mistakeQueue, dailyLogs] = await Promise.all([
      this.fetchUserProfile(),
      this.fetchTopicMasteries(),
      this.fetchMistakeQueue(),
      this.fetchDailyStudyLogs(),
    ]);

    return { profile, masteries, mistakeQueue, dailyLogs };
  }
}

export const dbSyncService = new DatabaseSyncService();
