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
  | 'science' 
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
