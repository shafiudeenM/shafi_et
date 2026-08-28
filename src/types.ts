export type PaperType = 'PAPER_I' | 'PAPER_II_MATH_SCI' | 'PAPER_II_SOC_SCI';

export type LanguageMode = 'tamil' | 'bilingual' | 'english';

export type CandidatePersona = 'first_time' | 'repeat_aspirant' | 'working_candidate' | 'tamil_medium';

export type ReservationCategory = 'OC_GENERAL' | 'BC_MBC_SC_ST'; // 90 marks (60%) vs 82 marks (55%)

export type SubjectId = 
  | 'cdp' 
  | 'tamil' 
  | 'english' 
  | 'maths' 
  | 'evs' 
  | 'maths_science' 
  | 'social_science';

export type ErrorType = 
  | 'knowledge_gap' 
  | 'concept_confusion' 
  | 'misread_question' 
  | 'careless_error' 
  | 'time_pressure';

export interface SubjectMeta {
  id: SubjectId;
  nameEn: string;
  nameTa: string;
  totalOfficialMarks: number;
  iconName: string;
  color: string;
  descriptionEn: string;
  descriptionTa: string;
}

export interface Question {
  id: string;
  paper: PaperType;
  subject: SubjectId;
  unit: string;
  chapter: string;
  topic: string;
  topicId: string;
  subtopic: string;
  concept: string;
  questionType: 'conceptual' | 'factual' | 'application' | 'pedagogy';
  difficulty: 'Easy' | 'Medium' | 'Hard';
  source: string; // e.g., "TRB TNTET 2022 Paper I Q.32", "TRB TNTET 2019 Paper II", "July 2026 Shift 1"
  year: number;
  
  // Content in English and Tamil
  questionEn: string;
  questionTa: string;
  optionsEn: [string, string, string, string];
  optionsTa: [string, string, string, string];
  correctOptionIndex: number; // 0, 1, 2, 3
  
  explanationEn: string;
  explanationTa: string;
  
  // Specific mistake analysis per distractor option (0-3)
  distractorNotes?: {
    [optionIndex: number]: {
      en: string;
      ta: string;
      likelyError: ErrorType;
    };
  };
  
  conceptSummaryEn: string;
  conceptSummaryTa: string;
  syllabusRef: string; // e.g., "SCERT Std 6-8 Math, Unit 2"
}

export interface UserInteraction {
  id: string;
  questionId: string;
  selectedOptionIndex: number;
  isCorrect: boolean;
  timeSpentSec: number;
  confidence?: 'high' | 'medium' | 'low';
  detectedErrorType?: ErrorType;
  timestamp: number;
  testContext?: 'diagnostic' | 'daily_practice' | 'mistake_review' | 'quick_check' | 'full_simulation';
}

export interface TopicMastery {
  topicId: string;
  topicNameEn: string;
  topicNameTa: string;
  subjectId: SubjectId;
  masteryPercent: number; // 0 to 100
  status: 'weak' | 'developing' | 'exam_ready';
  totalAttempted: number;
  correctCount: number;
  avgTimePerQuestionSec: number;
  lastPracticedAt: number;
  dominantErrorType?: ErrorType;
  subconcepts: {
    conceptName: string;
    masteryPercent: number;
  }[];
}

export interface MistakeQueueItem {
  id: string;
  question: Question;
  lastInteraction: UserInteraction;
  retestCount: number;
  isResolved: boolean;
  scheduledForSpacedRevision?: number; // timestamp
}

export interface DailySessionPlan {
  id: string;
  date: string;
  availableMinutes: number; // e.g. 35, 45, 60
  targetSubject: SubjectId;
  targetTopicId: string;
  targetTopicNameEn: string;
  targetTopicNameTa: string;
  whyChosenReasonEn: string;
  whyChosenReasonTa: string;
  
  // 4 Blocks (Learn -> Practice -> Review -> Quick check)
  learnBlock: {
    estimatedMinutes: number;
    conceptTitleEn: string;
    conceptTitleTa: string;
    conceptKeyPointsEn: string[];
    conceptKeyPointsTa: string[];
    officialTerminologyNotesEn: string;
    officialTerminologyNotesTa: string;
    isCompleted: boolean;
  };
  
  practiceBlock: {
    estimatedMinutes: number;
    questionCount: number;
    questionIds: string[];
    completedCount: number;
    isCompleted: boolean;
  };
  
  reviewBlock: {
    estimatedMinutes: number;
    mistakeQuestionIds: string[];
    isCompleted: boolean;
  };
  
  quickCheckBlock: {
    estimatedMinutes: number;
    questionIds: string[];
    isCompleted: boolean;
    passScorePercentage: number;
  };
  
  overallCompleted: boolean;
}

export interface ReadinessScoreBreakdown {
  overallScore: number; // 0 to 100
  knowledgeScore: number; // 0 to 100
  accuracyScore: number; // 0 to 100
  speedScore: number; // 0 to 100
  consistencyScore: number; // 0 to 100
  
  qualifyingThreshold: number; // 90 for OC (60%), 82 for BC/MBC/SC/ST (55%)
  projectedMarks: number; // e.g. 98 out of 150
  marginAboveCutoff: number; // e.g. +8 or -6
  isQualifyingProjected: boolean;
  
  subjectScores: {
    subjectId: SubjectId;
    subjectNameEn: string;
    subjectNameTa: string;
    masteryPercent: number;
    estimatedMarks: number;
    maxMarks: number;
    status: 'weak' | 'developing' | 'exam_ready';
  }[];
  
  primaryBottlenecksEn: string[];
  primaryBottlenecksTa: string[];
}

export interface SimulationResult {
  id: string;
  date: string;
  paper: PaperType;
  totalScore: number; // max 150
  totalCorrect: number;
  totalWrong: number;
  totalUnanswered: number;
  totalTimeSpentMinutes: number;
  timeDistributionBySubject: {
    subjectId: SubjectId;
    timeSpentMinutes: number;
    score: number;
    total: number;
  }[];
  answerChangeAnalysis: {
    changedWrongToRight: number;
    changedRightToWrong: number;
    changedWrongToWrong: number;
  };
  carelessErrorCount: number;
  timePressureDropCount: number; // mistakes in the last 20% of the session
  diagnosticPrescriptionEn: string;
  diagnosticPrescriptionTa: string;
}

export type ThemeMode = 'dark' | 'light';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: 'candidate' | 'educator' | 'admin';
  provider: 'email' | 'google' | 'guest';
  avatarUrl?: string;
  createdAt: string;
  lastLoginAt: string;
  targetPaper: PaperType;
  category: ReservationCategory;
  dailyMinutes: number;
  isVerified: boolean;
}

export interface UserProfile {
  id?: string;
  email?: string;
  name: string;
  selectedPaper: PaperType;
  languageMode: LanguageMode;
  persona: CandidatePersona;
  category: ReservationCategory;
  dailyStudyMinutes: number;
  hasCompletedDiagnostic: boolean;
  joinedDate: string;
  streakDays: number;
  targetExamDate?: string; // e.g. "2026-10-18"
  theme?: ThemeMode;
}

// ============================================================================
// DATABASE ROW TYPES — match Supabase table schemas exactly
// ============================================================================

/** subjects table row */
export interface DbSubject {
  id: string;
  name_en: string;
  name_ta: string;
  color: string;
  icon_name: string;
  created_at: string;
}

/** syllabus_topics table row */
export interface DbSyllabusTopic {
  id: string;
  subject_id: string;
  paper: 'PAPER_I' | 'PAPER_II';
  unit_id: string;
  unit_name_en: string;
  unit_name_ta: string;
  name_en: string;
  name_ta: string;
  keyword_en: string[];
  keyword_ta: string[];
  created_at: string;
}

/** question_papers table row */
export interface DbQuestionPaper {
  id: string;
  year: number;
  paper_type: PaperType;
  shift: string | null;
  source: string;
  total_questions: number;
  created_at: string;
}

/** questions table row */
export interface DbQuestion {
  id: string;
  paper_id: string;
  subject_id: string;
  topic_id: string;
  sno: number | null;
  question_no: string | null;
  question_en: string;
  question_ta: string;
  option_a_en: string;
  option_a_ta: string;
  option_b_en: string;
  option_b_ta: string;
  option_c_en: string;
  option_c_ta: string;
  option_d_en: string;
  option_d_ta: string;
  correct_option: number;
  difficulty: 'easy' | 'medium' | 'hard';
  question_type: 'conceptual' | 'factual' | 'application' | 'pedagogy';
  explanation_en: string | null;
  explanation_ta: string | null;
  concept_summary_en: string | null;
  concept_summary_ta: string | null;
  syllabus_ref: string | null;
  year: number;
  is_active: boolean;
  created_at: string;
}

/** category_cutoffs table row */
export interface DbCategoryCutoff {
  id: string;
  category: ReservationCategory;
  year: number;
  cutoff_marks: number;
  total_marks: number;
  percentage: number;
  source: string | null;
  created_at: string;
}

/** question_topics junction table row */
export interface DbQuestionTopic {
  id: string;
  question_id: string;
  topic_id: string;
  is_primary: boolean;
  relevance_score: number;
  created_at: string;
}

/** user_profiles table row (linked to auth.users) */
export interface DbUserProfile {
  id: string; // auth.users UUID
  email: string | null;
  name: string;
  selected_paper: PaperType;
  language_mode: LanguageMode;
  persona: CandidatePersona;
  category: ReservationCategory;
  daily_study_minutes: number;
  has_completed_diagnostic: boolean;
  target_exam_date: string | null;
  streak_days: number;
  longest_streak: number;
  theme: ThemeMode;
  created_at: string;
  updated_at: string;
}

/** topic_masteries table row */
export interface DbTopicMastery {
  id: string;
  user_id: string;
  topic_id: string;
  subject_id: string;
  mastery_score: number;
  questions_attempted: number;
  questions_correct: number;
  avg_time_per_question: number;
  status: 'weak' | 'developing' | 'exam_ready';
  last_attempt_at: string | null;
  created_at: string;
  updated_at: string;
}

/** mistake_queue table row */
export interface DbMistakeQueue {
  id: string;
  user_id: string;
  question_id: string;
  subject_id: string;
  topic_id: string;
  mistake_tag: ErrorType;
  selected_option: number | null;
  review_count: number;
  next_review_at: string | null;
  is_resolved: boolean;
  created_at: string;
  updated_at: string;
}

/** daily_study_logs table row */
export interface DbDailyStudyLog {
  id: string;
  user_id: string;
  study_date: string; // YYYY-MM-DD
  minutes_studied: number;
  questions_attempted: number;
  questions_correct: number;
  topics_touched: string[];
  streak_day_number: number;
  created_at: string;
}

/** study_sessions table row */
export interface DbStudySession {
  id: string;
  user_id: string;
  session_type: 'diagnostic' | 'daily_practice' | 'mistake_review' | 'quick_check' | 'full_simulation';
  subject_id: string | null;
  topic_id: string | null;
  duration_seconds: number;
  questions_attempted: number;
  questions_correct: number;
  accuracy_pct: number;
  avg_time_per_question: number;
  started_at: string;
  ended_at: string | null;
  created_at: string;
}

/** simulation_history table row */
export interface DbSimulationHistory {
  id: string;
  user_id: string;
  paper: PaperType;
  category: ReservationCategory;
  score: number;
  total_questions: number;
  correct_count: number;
  wrong_count: number;
  unanswered_count: number;
  time_spent_seconds: number;
  is_qualified: boolean;
  time_distribution: Record<string, unknown>;
  answer_changes: Record<string, unknown>;
  careless_errors: number;
  time_pressure_drops: number;
  prescription_en: string | null;
  prescription_ta: string | null;
  started_at: string | null;
  created_at: string;
}
