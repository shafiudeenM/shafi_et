import { getSupabase, isSupabaseConfigured } from './supabaseClient';
import { 
  UserProfile, 
  TopicMastery, 
  MistakeQueueItem, 
  SimulationResult 
} from '../types';

export interface SyncStatus {
  isConfigured: boolean;
  isConnected: boolean;
  lastSyncedAt: Date | null;
  errorMessage: string | null;
}

class DatabaseSyncService {
  private userId: string;
  private masteryTimer: any = null;
  private mistakeTimer: any = null;
  private pendingMasteries: TopicMastery[] | null = null;
  private pendingMistakes: MistakeQueueItem[] | null = null;

  constructor() {
    // Generate or retrieve consistent anonymous/candidate user ID
    let storedId = localStorage.getItem('tntet_user_id');
    if (!storedId) {
      storedId = 'candidate_' + Math.random().toString(36).substring(2, 11);
      localStorage.setItem('tntet_user_id', storedId);
    }
    this.userId = storedId;
  }

  public getUserId(): string {
    return this.userId;
  }

  public isCloudConnected(): boolean {
    return isSupabaseConfigured();
  }

  /**
   * Syncs candidate profile state to Supabase
   */
  public async syncUserProfile(profile: UserProfile): Promise<boolean> {
    const supabase = getSupabase();
    if (!supabase) return false;

    try {
      const { error } = await supabase
        .from('user_profiles')
        .upsert({
          id: this.userId,
          name: profile.name,
          selected_paper: profile.selectedPaper,
          language_mode: profile.languageMode,
          category: profile.category,
          daily_study_minutes: profile.dailyStudyMinutes,
          has_completed_diagnostic: profile.hasCompletedDiagnostic,
          target_exam_date: profile.targetExamDate || '2026-10-18',
          streak_days: profile.streakDays,
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
    }, 4000); // 4-second coalesce buffer
  }

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
    }, 4000); // 4-second coalesce buffer
  }

  /**
   * Fetches remote profile if available
   */
  public async fetchUserProfile(): Promise<Partial<UserProfile> | null> {
    const supabase = getSupabase();
    if (!supabase) return null;

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
        category: data.category,
        dailyStudyMinutes: data.daily_study_minutes,
        hasCompletedDiagnostic: data.has_completed_diagnostic,
        targetExamDate: data.target_exam_date,
        streakDays: data.streak_days,
      };
    } catch (err) {
      console.warn('Supabase fetchUserProfile exception:', err);
      return null;
    }
  }

  /**
   * Syncs all topic masteries to Supabase
   */
  public async syncTopicMasteries(masteries: TopicMastery[]): Promise<boolean> {
    const supabase = getSupabase();
    if (!supabase || masteries.length === 0) return false;

    try {
      const records = masteries.map((m) => ({
        id: `${this.userId}_${m.topicId}`,
        user_id: this.userId,
        topic_id: m.topicId,
        subject_id: m.subjectId,
        mastery_score: m.masteryPercent,
        questions_attempted: m.totalAttempted,
        questions_correct: m.correctCount,
        last_attempt_date: new Date(m.lastPracticedAt || Date.now()).toISOString(),
        updated_at: new Date().toISOString()
      }));

      const { error } = await supabase
        .from('topic_masteries')
        .upsert(records);

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

  /**
   * Syncs mistake queue items to Supabase
   */
  public async syncMistakeQueue(items: MistakeQueueItem[]): Promise<boolean> {
    const supabase = getSupabase();
    if (!supabase) return false;

    try {
      if (items.length === 0) return true;

      const records = items.map((item) => ({
        id: `${this.userId}_${item.id}`,
        user_id: this.userId,
        question_id: item.question.id,
        subject_id: item.question.subject,
        topic_id: item.question.topicId,
        question_text_ta: item.question.questionTa,
        question_text_en: item.question.questionEn,
        selected_option_id: item.lastInteraction?.selectedOptionIndex?.toString() || '0',
        correct_option_id: item.question.correctOptionIndex?.toString() || '0',
        explanation_ta: item.question.explanationTa,
        explanation_en: item.question.explanationEn,
        mistake_tag: item.lastInteraction?.detectedErrorType || 'concept_confusion',
        review_count: item.retestCount || 0,
        is_resolved: item.isResolved,
        updated_at: new Date().toISOString()
      }));

      const { error } = await supabase
        .from('mistake_queue')
        .upsert(records);

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

  /**
   * Logs a completed simulation test to Supabase
   */
  public async saveSimulationResult(
    score: number, 
    total: number, 
    paper: string, 
    category: string,
    timeSpentSec: number = 0,
    answerChanges: any = {}
  ): Promise<boolean> {
    const supabase = getSupabase();
    if (!supabase) return false;

    try {
      const qualifyingCutoff = category === 'OC_GENERAL' ? 90 : 82;
      const isQualified = score >= qualifyingCutoff;

      const { error } = await supabase
        .from('simulation_history')
        .insert({
          id: `sim_${this.userId}_${Date.now()}`,
          user_id: this.userId,
          score,
          total_questions: total,
          time_spent_seconds: timeSpentSec,
          category,
          paper,
          is_qualified: isQualified,
          answer_changes: answerChanges,
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
}

export const dbSyncService = new DatabaseSyncService();
