import { Question, SubjectId, PaperType, ErrorType, AuthUser, ReservationCategory } from '../types';

export interface AppConfigSettings {
  liveExamShift: {
    activeShiftName: string;
    paper: PaperType;
    isCbtSimulatorActive: boolean;
    examDate: string;
    totalRegisteredMockTakers: number;
  };
  normalizationParams: {
    baseMean: number;        // mu_g (e.g. 78.4)
    baseStdDev: number;      // sigma_g (e.g. 14.8)
    shiftMean: number;       // mu_i (e.g. 74.2)
    shiftStdDev: number;     // sigma_i (e.g. 15.1)
    applyNegativeMarking: boolean; // false for TNTET
  };
  aiTutorSettings: {
    model: 'gemini-2.5-flash' | 'gemini-1.5-pro' | 'gemini-1.5-flash';
    temperature: number;
    maxTokens: number;
    rateLimitPerUserDay: number;
    enablePedagogyVoiceSynthesis: boolean;
  };
  maintenanceMode: boolean;
  announcementBanner: {
    enabled: boolean;
    textEn: string;
    textTa: string;
    type: 'info' | 'warning' | 'alert';
  };
}

export interface CandidateCohortMetric {
  userId: string;
  name: string;
  email: string;
  paper: PaperType;
  category: ReservationCategory;
  testsAttempted: number;
  avgScore: number;
  readinessPercentage: number;
  lastActive: string;
  weakestSubject: SubjectId;
  predictedQualified: boolean;
}

export interface HardestDistractorMetric {
  questionId: string;
  questionSnippetEn: string;
  questionSnippetTa: string;
  subject: SubjectId;
  paper: PaperType;
  totalAttempts: number;
  accuracyRate: number; // percentage
  mostTrappedOptionIndex: number;
  trappedErrorType: ErrorType;
}

export interface SystemTelemetry {
  p95LatencyMs: number;
  activeUsersNow: number;
  cacheHitRatio: number;
  storageUsageMb: number;
  aiApiStatus: 'operational' | 'degraded' | 'offline';
  dbSyncStatus: 'synced' | 'syncing' | 'offline';
}
