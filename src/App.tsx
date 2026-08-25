import React, { useState, useEffect, useMemo } from 'react';
import { 
  PaperType, 
  LanguageMode, 
  ReservationCategory, 
  UserInteraction, 
  DailySessionPlan, 
  MistakeQueueItem,
  Question,
  ErrorType,
  TopicMastery,
  UserProfile,
  ThemeMode,
  AuthUser
} from './types';
import { 
  ALL_QUESTIONS, 
  INITIAL_TOPIC_MASTERIES, 
  DEFAULT_USER_PROFILE 
} from './data/tntetData';
import { 
  calculateCandidateReadiness, 
  generateDailyPlan, 
  updateMasteryWithInteraction 
} from './services/recommendationEngine';
import { Navbar } from './components/Navbar';
import { LandingPage } from './components/LandingPage';
import { AuthModal } from './components/AuthModal';
import { DashboardView } from './components/DashboardView';
import { DiagnosticView } from './components/DiagnosticView';
import { DailySessionView } from './components/DailySessionView';
import { PracticeView } from './components/PracticeView';
import { MistakeQueueView } from './components/MistakeQueueView';
import { PYQVaultView } from './components/PYQVaultView';
import { FlashcardsDeckView } from './components/FlashcardsDeckView';
import { AdminDashboardView } from './components/AdminDashboardView';
import { ExamSimulatorView } from './components/ExamSimulatorView';
import { AITutorModal } from './components/AITutorModal';
import { PDFReportExportModal } from './components/PDFReportExportModal';
import { CandidateProfileModal } from './components/CandidateProfileModal';
import { IntegrationsModal } from './components/IntegrationsModal';
import { MobileExportModal } from './components/MobileExportModal';
import { dbSyncService } from './services/dbSyncService';
import { authService } from './services/authService';
import { initNativeMobileApp } from './services/nativeMobileService';

export default function App() {
  // Authentication & View Mode State
  const [authUser, setAuthUser] = useState<AuthUser | null>(() => authService.getCurrentUser());
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authModalInitialMode, setAuthModalInitialMode] = useState<'signin' | 'signup'>('signup');
  const [viewMode, setViewMode] = useState<'landing' | 'app'>(() => {
    return authService.isAuthenticated() ? 'app' : 'landing';
  });

  // Navigation tab in authenticated app
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  // Preferences & Profile
  const [selectedPaper, setSelectedPaper] = useState<PaperType>(() => {
    if (authUser?.targetPaper) return authUser.targetPaper;
    const saved = localStorage.getItem('tntet_paper') as PaperType;
    return saved === 'PAPER_I' || saved === 'PAPER_II_MATH_SCI' || saved === 'PAPER_II_SOC_SCI' 
      ? saved 
      : 'PAPER_II_MATH_SCI';
  });

  const [languageMode, setLanguageMode] = useState<LanguageMode>(() => {
    const saved = localStorage.getItem('tntet_lang') as LanguageMode;
    return saved || 'bilingual';
  });

  const [category, setCategory] = useState<ReservationCategory>(() => {
    if (authUser?.category) return authUser.category;
    const saved = localStorage.getItem('tntet_category') as ReservationCategory;
    return saved === 'OC_GENERAL' || saved === 'BC_MBC_SC_ST' ? saved : 'BC_MBC_SC_ST';
  });

  const [availableDailyMinutes, setAvailableDailyMinutes] = useState<number>(() => {
    if (authUser?.dailyMinutes) return authUser.dailyMinutes;
    const saved = localStorage.getItem('tntet_daily_mins');
    return saved ? parseInt(saved, 10) : 40;
  });

  const [targetExamDate, setTargetExamDate] = useState<string>(() => {
    const saved = localStorage.getItem('tntet_target_exam_date');
    return saved || '2026-10-18';
  });

  // State: Theme (Dark / Light)
  const [theme, setTheme] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem('tntet_theme') as ThemeMode;
    return saved === 'light' ? 'light' : 'dark';
  });

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // State: Modals
  const [isProfileModalOpen, setIsProfileModalOpen] = useState<boolean>(false);
  const [isPDFExportModalOpen, setIsPDFExportModalOpen] = useState<boolean>(false);
  const [isIntegrationsModalOpen, setIsIntegrationsModalOpen] = useState<boolean>(false);
  const [isMobileExportModalOpen, setIsMobileExportModalOpen] = useState<boolean>(false);

  // State: Topic Masteries (TopicMastery[])
  const [topicMasteries, setTopicMasteries] = useState<TopicMastery[]>(() => {
    const saved = localStorage.getItem('tntet_topic_masteries');
    return saved ? JSON.parse(saved) : INITIAL_TOPIC_MASTERIES;
  });

  // State: User Interactions
  const [userInteractions, setUserInteractions] = useState<UserInteraction[]>(() => {
    const saved = localStorage.getItem('tntet_interactions');
    return saved ? JSON.parse(saved) : [];
  });

  // State: Mistake Queue
  const [mistakeQueue, setMistakeQueue] = useState<MistakeQueueItem[]>(() => {
    const saved = localStorage.getItem('tntet_mistakes');
    if (saved) return JSON.parse(saved);

    // Default sample mistake queue
    return [
      {
        id: 'mq_1',
        question: ALL_QUESTIONS[0],
        lastInteraction: {
          id: 'int_sample_1',
          questionId: ALL_QUESTIONS[0].id,
          selectedOptionIndex: 1,
          isCorrect: false,
          timeSpentSec: 42,
          confidence: 'medium',
          detectedErrorType: 'concept_confusion',
          timestamp: Date.now() - 86400000,
          testContext: 'daily_practice',
        },
        retestCount: 1,
        isResolved: false,
      },
      {
        id: 'mq_2',
        question: ALL_QUESTIONS[1],
        lastInteraction: {
          id: 'int_sample_2',
          questionId: ALL_QUESTIONS[1].id,
          selectedOptionIndex: 3,
          isCorrect: false,
          timeSpentSec: 28,
          confidence: 'low',
          detectedErrorType: 'knowledge_gap',
          timestamp: Date.now() - 172800000,
          testContext: 'daily_practice',
        },
        retestCount: 2,
        isResolved: false,
      },
      {
        id: 'mq_3',
        question: ALL_QUESTIONS[2],
        lastInteraction: {
          id: 'int_sample_3',
          questionId: ALL_QUESTIONS[2].id,
          selectedOptionIndex: 0,
          isCorrect: false,
          timeSpentSec: 15,
          confidence: 'high',
          detectedErrorType: 'misread_question',
          timestamp: Date.now() - 259200000,
          testContext: 'full_simulation',
        },
        retestCount: 1,
        isResolved: false,
      },
    ];
  });

  // State: Daily Plan
  const [dailyPlan, setDailyPlan] = useState<DailySessionPlan>(() => {
    return generateDailyPlan(INITIAL_TOPIC_MASTERIES, mistakeQueue, availableDailyMinutes);
  });

  // State: AI Tutor Modal
  const [isAITutorOpen, setIsAITutorOpen] = useState(false);
  const [tutorTopic, setTutorTopic] = useState('Piaget & Vygotsky Cognitive Theories');

  // Persistence & Cloud Synchronization
  useEffect(() => {
    localStorage.setItem('tntet_paper', selectedPaper);
  }, [selectedPaper]);

  useEffect(() => {
    localStorage.setItem('tntet_lang', languageMode);
  }, [languageMode]);

  useEffect(() => {
    localStorage.setItem('tntet_category', category);
  }, [category]);

  useEffect(() => {
    localStorage.setItem('tntet_daily_mins', availableDailyMinutes.toString());
  }, [availableDailyMinutes]);

  useEffect(() => {
    localStorage.setItem('tntet_topic_masteries', JSON.stringify(topicMasteries));
    if (dbSyncService.isCloudConnected()) {
      dbSyncService.debouncedSyncTopicMasteries(topicMasteries);
    }
  }, [topicMasteries]);

  useEffect(() => {
    localStorage.setItem('tntet_interactions', JSON.stringify(userInteractions));
  }, [userInteractions]);

  useEffect(() => {
    localStorage.setItem('tntet_mistakes', JSON.stringify(mistakeQueue));
    if (dbSyncService.isCloudConnected()) {
      dbSyncService.debouncedSyncMistakeQueue(mistakeQueue);
    }
  }, [mistakeQueue]);

  useEffect(() => {
    localStorage.setItem('tntet_target_exam_date', targetExamDate);
  }, [targetExamDate]);

  useEffect(() => {
    localStorage.setItem('tntet_theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
    document.body.setAttribute('data-theme', theme);
    // Sync native mobile status bar color and back button listener
    initNativeMobileApp({ isDarkMode: theme === 'dark' });
  }, [theme]);

  // Derived readiness score
  const readiness = useMemo(() => {
    return calculateCandidateReadiness(topicMasteries, userInteractions, category);
  }, [topicMasteries, userInteractions, category]);

  const userProfile: UserProfile = {
    ...DEFAULT_USER_PROFILE,
    selectedPaper,
    languageMode,
    category,
    dailyStudyMinutes: availableDailyMinutes,
    targetExamDate,
    theme,
  };

  // Background sync candidate profile
  useEffect(() => {
    if (dbSyncService.isCloudConnected()) {
      dbSyncService.syncUserProfile(userProfile).catch(console.warn);
    }
  }, [selectedPaper, languageMode, category, availableDailyMinutes, targetExamDate]);

  // Handlers
  const handleOpenAITutor = (topicOrQuestion: string | Question) => {
    if (typeof topicOrQuestion === 'string') {
      setTutorTopic(topicOrQuestion);
    } else {
      setTutorTopic(topicOrQuestion.topic || topicOrQuestion.questionEn);
    }
    setIsAITutorOpen(true);
  };

  const handleRecordAnswer = (
    question: Question,
    selectedIndex: number,
    isCorrect: boolean,
    timeSec: number,
    errorType?: ErrorType
  ) => {
    const interaction: UserInteraction = {
      id: `int_${Date.now()}_${Math.random()}`,
      questionId: question.id,
      selectedOptionIndex: selectedIndex,
      isCorrect,
      timeSpentSec: timeSec,
      confidence: 'medium',
      detectedErrorType: errorType,
      timestamp: Date.now(),
      testContext: 'daily_practice',
    };

    const nextInteractions = [...userInteractions, interaction];
    setUserInteractions(nextInteractions);

    // Update topic mastery
    setTopicMasteries((prev) => {
      return prev.map((t) => {
        if (t.topicId === question.topicId) {
          const newPct = updateMasteryWithInteraction(t.masteryPercent, isCorrect, timeSec);
          return {
            ...t,
            masteryPercent: newPct,
            totalAttempted: t.totalAttempted + 1,
            correctCount: isCorrect ? t.correctCount + 1 : t.correctCount,
            status: newPct >= 75 ? 'exam_ready' : newPct < 55 ? 'weak' : 'developing',
            lastPracticedAt: Date.now(),
          };
        }
        return t;
      });
    });

    // If wrong answer, auto-enqueue to mistake queue
    if (!isCorrect) {
      const existingIdx = mistakeQueue.findIndex((m) => m.question.id === question.id);
      if (existingIdx >= 0) {
        const copy = [...mistakeQueue];
        copy[existingIdx] = {
          ...copy[existingIdx],
          lastInteraction: interaction,
          retestCount: copy[existingIdx].retestCount + 1,
          isResolved: false,
        };
        setMistakeQueue(copy);
      } else {
        const newMistake: MistakeQueueItem = {
          id: `mq_${Date.now()}`,
          question,
          lastInteraction: interaction,
          retestCount: 1,
          isResolved: false,
        };
        setMistakeQueue((prev) => [newMistake, ...prev]);
      }
    }
  };

  const handleCompleteDiagnostic = (interactions: UserInteraction[]) => {
    const nextInteractions = [...userInteractions, ...interactions];
    setUserInteractions(nextInteractions);

    // Update masteries from diagnostic
    setTopicMasteries((prev) => {
      return prev.map((t) => {
        const matching = interactions.filter((i) => {
          const q = ALL_QUESTIONS.find((item) => item.id === i.questionId);
          return q && q.topicId === t.topicId;
        });

        if (matching.length > 0) {
          let updatedPct = t.masteryPercent;
          matching.forEach((m) => {
            updatedPct = updateMasteryWithInteraction(updatedPct, m.isCorrect, m.timeSpentSec);
          });
          return {
            ...t,
            masteryPercent: updatedPct,
            status: updatedPct >= 75 ? 'exam_ready' : updatedPct < 55 ? 'weak' : 'developing',
            lastPracticedAt: Date.now(),
          };
        }
        return t;
      });
    });

    // Regenerate daily plan tailored to diagnostic findings
    const newPlan = generateDailyPlan(topicMasteries, mistakeQueue, availableDailyMinutes);
    setDailyPlan(newPlan);
    setActiveTab('daily_plan');
  };

  const handleRetestMistake = (mistakeId: string, isCorrect: boolean) => {
    setMistakeQueue((prev) =>
      prev.map((m) =>
        m.id === mistakeId
          ? {
              ...m,
              isResolved: isCorrect,
              retestCount: (m.retestCount || 0) + 1,
            }
          : m
      )
    );
  };

  const handleBookmarkQuestion = (question: Question) => {
    setMistakeQueue((prev) => {
      const existing = prev.find((m) => m.question.id === question.id);
      if (existing) {
        return prev.filter((m) => m.question.id !== question.id);
      }
      const newMistake: MistakeQueueItem = {
        id: `bm_${question.id}_${Date.now()}`,
        question,
        lastInteraction: {
          id: `int_bm_${question.id}_${Date.now()}`,
          questionId: question.id,
          selectedOptionIndex: -1,
          isCorrect: false,
          timeSpentSec: 0,
          confidence: 'medium',
          detectedErrorType: 'knowledge_gap',
          timestamp: Date.now(),
          testContext: 'daily_practice'
        },
        retestCount: 0,
        isResolved: false
      };
      return [newMistake, ...prev];
    });
  };

  const handleAuthSuccess = (user: AuthUser) => {
    setAuthUser(user);
    setSelectedPaper(user.targetPaper);
    setCategory(user.category);
    setAvailableDailyMinutes(user.dailyMinutes);
    setViewMode('app');
    setIsAuthModalOpen(false);
  };

  const handleLogout = () => {
    authService.logout();
    setAuthUser(null);
    setViewMode('landing');
  };

  const handleSaveProfile = (updates: {
    name?: string;
    targetPaper?: PaperType;
    category?: ReservationCategory;
    dailyMinutes?: number;
    targetExamDate?: string;
  }) => {
    if (updates.targetPaper) setSelectedPaper(updates.targetPaper);
    if (updates.category) setCategory(updates.category);
    if (updates.dailyMinutes) setAvailableDailyMinutes(updates.dailyMinutes);
    if (updates.targetExamDate) setTargetExamDate(updates.targetExamDate);

    // Persist to authService profile
    authService.updateProfile({
      ...(updates.name ? { name: updates.name } : {}),
      ...(updates.targetPaper ? { targetPaper: updates.targetPaper } : {}),
      ...(updates.category ? { category: updates.category } : {}),
      ...(updates.dailyMinutes ? { dailyMinutes: updates.dailyMinutes } : {})
    });
    setAuthUser(authService.getCurrentUser());
  };

  const handleCompleteSimulation = (score: number, total: number) => {
    if (dbSyncService.isCloudConnected()) {
      dbSyncService.saveSimulationResult(score, total, selectedPaper, category).catch(console.warn);
    }
  };

  // If user is on landing page or not authenticated yet
  if (viewMode === 'landing' || !authUser) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col font-sans selection:bg-[#c5a059] selection:text-[#0a0a0a]">
        <LandingPage
          onOpenAuth={(mode) => {
            setAuthModalInitialMode(mode);
            setIsAuthModalOpen(true);
          }}
          languageMode={languageMode}
          onLanguageChange={setLanguageMode}
          theme={theme}
          onToggleTheme={toggleTheme}
        />

        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          initialMode={authModalInitialMode}
          languageMode={languageMode}
          theme={theme}
          onAuthSuccess={handleAuthSuccess}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col font-sans selection:bg-[#c5a059] selection:text-[#0a0a0a]">
      {/* Top Navigation */}
      <Navbar
        selectedPaper={selectedPaper}
        onSelectPaper={setSelectedPaper}
        languageMode={languageMode}
        onLanguageChange={setLanguageMode}
        readiness={readiness}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenSettings={() => setIsProfileModalOpen(true)}
        onOpenPDFExportModal={() => setIsPDFExportModalOpen(true)}
        onOpenIntegrationsModal={() => setIsIntegrationsModalOpen(true)}
        onOpenMobileExportModal={() => setIsMobileExportModalOpen(true)}
        dailyPlan={dailyPlan}
        onStartDailyPlan={() => setActiveTab('daily_plan')}
        theme={theme}
        onToggleTheme={toggleTheme}
        user={authUser}
        onLogout={handleLogout}
        onGoToLanding={() => setViewMode('landing')}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-4">
        {/* Dynamic Admin Broadcast Banner if enabled */}
        {(() => {
          const cfg = localStorage.getItem('tntet_admin_app_config');
          if (cfg) {
            try {
              const parsed = JSON.parse(cfg);
              if (parsed?.announcementBanner?.enabled) {
                return (
                  <div className="p-3.5 rounded-xl bg-gradient-to-r from-amber-950/60 to-amber-900/40 border border-amber-500/30 text-amber-200 text-xs sm:text-sm flex items-center justify-between gap-3 shadow-lg animate-fadeIn">
                    <span className="flex-1">
                      {languageMode === 'tamil' ? parsed.announcementBanner.textTa : parsed.announcementBanner.textEn}
                    </span>
                    <button 
                      onClick={() => setActiveTab('simulator')}
                      className="px-2.5 py-1 rounded bg-[#c5a059] text-black font-bold text-xs whitespace-nowrap hover:bg-[#d6b26d] transition"
                    >
                      {languageMode === 'tamil' ? 'மாதிரி தேர்வு' : 'Take 150Q CBT'}
                    </button>
                  </div>
                );
              }
            } catch {}
          }
          return null;
        })()}
        {activeTab === 'dashboard' && (
          <DashboardView
            readiness={readiness}
            topicMasteries={topicMasteries}
            dailyPlan={dailyPlan}
            userProfile={userProfile}
            languageMode={languageMode}
            onStartDailyPlan={() => setActiveTab('daily_plan')}
            onStartDiagnostic={() => setActiveTab('diagnostic')}
            onNavigateToTopic={(topicId) => {
              setActiveTab('practice');
            }}
            onOpenAITutor={handleOpenAITutor}
            onOpenPDFExportModal={() => setIsPDFExportModalOpen(true)}
            onOpenIntegrationsModal={() => setIsIntegrationsModalOpen(true)}
          />
        )}

        {activeTab === 'daily_plan' && (
          <DailySessionView
            plan={dailyPlan}
            languageMode={languageMode}
            onUpdatePlan={setDailyPlan}
            onOpenAITutor={handleOpenAITutor}
          />
        )}

        {activeTab === 'pyq' && (
          <PYQVaultView
            selectedPaper={selectedPaper}
            languageMode={languageMode}
            onOpenAITutor={handleOpenAITutor}
            onBookmarkQuestion={handleBookmarkQuestion}
            bookmarkedQuestionIds={mistakeQueue.map((m) => m.question.id)}
          />
        )}

        {activeTab === 'flashcards' && (
          <FlashcardsDeckView
            languageMode={languageMode}
            onOpenAITutor={handleOpenAITutor}
          />
        )}

        {activeTab === 'diagnostic' && (
          <DiagnosticView
            selectedPaper={selectedPaper}
            languageMode={languageMode}
            category={category}
            onCompleteDiagnostic={handleCompleteDiagnostic}
            onOpenAITutor={handleOpenAITutor}
          />
        )}

        {activeTab === 'practice' && (
          <PracticeView
            languageMode={languageMode}
            onOpenAITutor={handleOpenAITutor}
            onRecordAnswer={handleRecordAnswer}
          />
        )}

        {activeTab === 'mistakes' && (
          <MistakeQueueView
            mistakes={mistakeQueue}
            languageMode={languageMode}
            onRetestMistake={handleRetestMistake}
            onOpenAITutor={handleOpenAITutor}
          />
        )}

        {activeTab === 'simulator' && (
          <ExamSimulatorView
            selectedPaper={selectedPaper}
            languageMode={languageMode}
            category={category}
            onCompleteSimulation={handleCompleteSimulation}
            onOpenAITutor={handleOpenAITutor}
            onOpenPDFExportModal={() => setIsPDFExportModalOpen(true)}
          />
        )}

        {activeTab === 'admin' && (
          <AdminDashboardView
            languageMode={languageMode}
            onOpenAITutor={handleOpenAITutor}
            onOpenMobileExportModal={() => setIsMobileExportModalOpen(true)}
          />
        )}

        {activeTab === 'syllabus' && (
          <div className="space-y-6">
            <div className="bg-[#121212] border border-[#262626] rounded-2xl p-6 sm:p-8 shadow-xl">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] px-3 py-1 rounded-full bg-[#c5a059]/15 text-[#c5a059] border border-[#c5a059]/30">
                SCERT Blueprint
              </span>
              <h2 className="text-xl sm:text-2xl font-serif font-bold text-white mt-3 mb-2">
                {languageMode === 'tamil' ? 'அதிகாரப்பூர்வ TRB TNTET பாடத்திட்ட வரைபடம் & முந்தைய வினாக்கள்' : 'Official TRB TNTET Syllabus Blueprint & PYQ Weightage'}
              </h2>
              <p className="text-xs sm:text-sm text-[#a3a3a3] leading-relaxed">
                {languageMode === 'tamil' 
                  ? 'தமிழ்நாடு SCERT 1 முதல் 10 ஆம் வகுப்பு வரையிலான பாடத்திட்டங்கள் மற்றும் TRB 2012-2022 வினாத்தாள் முறைமைகள்.'
                  : 'Based on Tamil Nadu SCERT Class 1-10 syllabus guidelines and TRB TNTET 2012-2022 recurring question trends.'
                }
              </p>
            </div>
            <PracticeView
              languageMode={languageMode}
              onOpenAITutor={handleOpenAITutor}
              onRecordAnswer={handleRecordAnswer}
            />
          </div>
        )}
      </main>

      {/* Persistent AI Tutor Floating Modal / Drawer */}
      <AITutorModal
        isOpen={isAITutorOpen}
        onClose={() => setIsAITutorOpen(false)}
        topicName={tutorTopic}
        languageMode={languageMode}
      />

      {/* Official TNTET Performance Dossier PDF Export Modal */}
      <PDFReportExportModal
        isOpen={isPDFExportModalOpen}
        onClose={() => setIsPDFExportModalOpen(false)}
        userProfile={userProfile}
        readiness={readiness}
        topicMasteries={topicMasteries}
        mistakeQueue={mistakeQueue}
        languageMode={languageMode}
      />

      {/* Useful Google Integrations & Printable TRB OMR Modal */}
      <IntegrationsModal
        isOpen={isIntegrationsModalOpen}
        onClose={() => setIsIntegrationsModalOpen(false)}
        userProfile={userProfile}
        readiness={readiness}
        topicMasteries={topicMasteries}
        mistakeQueue={mistakeQueue}
        questions={ALL_QUESTIONS}
        languageMode={languageMode}
      />

      {/* Candidate Profile & Exam Settings Modal */}
      <CandidateProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        user={authUser}
        userProfile={userProfile}
        languageMode={languageMode}
        onSaveProfile={handleSaveProfile}
      />

      {/* Native Mobile Export (Capacitor APK) Modal */}
      <MobileExportModal
        isOpen={isMobileExportModalOpen}
        onClose={() => setIsMobileExportModalOpen(false)}
        languageMode={languageMode}
      />
    </div>
  );
}
