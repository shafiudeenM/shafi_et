import React, { useState } from 'react';
import { 
  ReadinessScoreBreakdown, 
  TopicMastery, 
  DailySessionPlan, 
  LanguageMode, 
  UserProfile 
} from '../types';
import { ExamCountdown } from './ExamCountdown';
import { DailyPlanProgressTracker } from './DailyPlanProgressTracker';
import { RechartsMasteryDashboard } from './RechartsMasteryDashboard';
import { 
  Compass, 
  TrendingUp, 
  AlertTriangle, 
  PlayCircle, 
  Target, 
  Brain, 
  Clock, 
  ArrowRight,
  Sparkles,
  Zap,
  FileText,
  Calendar,
  Layers,
  LayoutGrid,
  List
} from 'lucide-react';

interface DashboardViewProps {
  readiness: ReadinessScoreBreakdown;
  topicMasteries: TopicMastery[];
  dailyPlan: DailySessionPlan;
  userProfile: UserProfile;
  languageMode: LanguageMode;
  onStartDailyPlan: () => void;
  onStartDiagnostic: () => void;
  onNavigateToTopic: (topicId: string) => void;
  onOpenAITutor: (topicName: string) => void;
  onOpenPDFExportModal: () => void;
  onOpenIntegrationsModal?: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  readiness,
  topicMasteries,
  dailyPlan,
  userProfile,
  languageMode,
  onStartDailyPlan,
  onStartDiagnostic,
  onNavigateToTopic,
  onOpenAITutor,
  onOpenPDFExportModal,
  onOpenIntegrationsModal,
}) => {
  const isTamil = languageMode === 'tamil';

  // Section Tabs: 'focus' (Daily Prescription & Readiness), 'analytics' (Recharts & 5 Subjects), 'remediation' (Weak Areas & Traps)
  const [activeSection, setActiveSection] = useState<'focus' | 'analytics' | 'remediation' | 'all'>('focus');

  const weakestTopics = [...topicMasteries]
    .sort((a, b) => a.masteryPercent - b.masteryPercent)
    .slice(0, 3);

  const weakCount = topicMasteries.filter(t => t.status === 'weak').length;

  return (
    <div className="space-y-5 max-w-7xl mx-auto pb-10">
      {/* 1. Header & Quick Actions */}
      <div className="bg-[#121212] border border-white/10 rounded-xl p-4 sm:p-5 text-white shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border border-[#c5a059]/30 bg-[#c5a059]/10 text-[#c5a059] text-[10px] font-semibold uppercase tracking-wider">
                <Sparkles className="w-3 h-3" />
                {userProfile.selectedPaper === 'PAPER_I' ? 'TNTET Paper I (Classes 1–5)' : 'TNTET Paper II (Classes 6–8)'}
              </span>
              <span className="text-[11px] font-mono text-white/50 px-2 py-0.5 rounded bg-white/[0.04] border border-white/[0.06]">
                {userProfile.category === 'OC_GENERAL' ? 'OC Cutoff: 90/150' : 'BC/MBC/SC/ST Cutoff: 82/150'}
              </span>
            </div>
            
            <h1 className="text-lg sm:text-xl font-serif-luxury font-normal tracking-tight text-white">
              {isTamil 
                ? `வணக்கம், ${userProfile.name}. இன்றைய 35 நிமிட பயிற்சி இலக்கு தயார்.`
                : `Welcome back, ${userProfile.name}. Today's workout is ready.`
              }
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {onOpenIntegrationsModal && (
              <button
                id="btn-open-integrations-top"
                onClick={onOpenIntegrationsModal}
                className="px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 font-medium text-xs transition flex items-center gap-1.5"
                title="Google Calendar, Sheets & OMR Tools"
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>{isTamil ? 'ஒருங்கிணைப்புகள் & OMR' : 'Google Sync & OMR'}</span>
              </button>
            )}

            <button
              id="btn-export-dossier-top"
              onClick={onOpenPDFExportModal}
              className="px-3 py-1.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-white font-medium text-xs transition flex items-center gap-1.5"
            >
              <FileText className="w-3.5 h-3.5 text-[#c5a059]" />
              <span>{isTamil ? 'PDF அறிக்கை' : 'Export PDF'}</span>
            </button>

            {!userProfile.hasCompletedDiagnostic ? (
              <button
                id="btn-take-diagnostic"
                onClick={onStartDiagnostic}
                className="px-3.5 py-1.5 rounded-lg bg-[#c5a059] hover:bg-[#d8b56f] text-black font-semibold text-xs transition flex items-center gap-1.5 shadow-md"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>{isTamil ? 'குறை கண்டறி தேர்வு (15 நிமி)' : 'Diagnostic Test (15m)'}</span>
              </button>
            ) : (
              <button
                id="btn-start-today-session"
                onClick={onStartDailyPlan}
                className="px-4 py-1.5 rounded-lg bg-[#c5a059] hover:bg-[#d8b56f] text-black font-bold text-xs uppercase tracking-wider shadow-md transition flex items-center gap-1.5"
              >
                <PlayCircle className="w-4 h-4 fill-black text-[#c5a059]" />
                <span>{isTamil ? 'பயிற்சியை துவங்கு' : 'Start Daily Workout'}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 2. Top Milestone & Daily Progress Strip */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-7">
          <ExamCountdown
            targetExamDate={userProfile.targetExamDate || '2026-10-18'}
            isTamil={isTamil}
            selectedPaper={userProfile.selectedPaper}
          />
        </div>
        <div className="lg:col-span-5">
          <DailyPlanProgressTracker
            dailyPlan={dailyPlan}
            isTamil={isTamil}
            onStartDailyPlan={onStartDailyPlan}
          />
        </div>
      </div>

      {/* 3. Section Navigation Bar (Prevents Long Scrolling) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#141414] border border-white/10 p-1.5 rounded-xl">
        {/* Main Segmented Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
          <button
            id="tab-dashboard-focus"
            onClick={() => setActiveSection('focus')}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition flex items-center gap-2 whitespace-nowrap ${
              activeSection === 'focus'
                ? 'bg-[#c5a059] text-black shadow-md'
                : 'text-white/60 hover:text-white hover:bg-white/[0.04]'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>{isTamil ? 'இன்றைய இலக்கு & தயார்நிலை' : "Today's Focus & Readiness"}</span>
          </button>

          <button
            id="tab-dashboard-analytics"
            onClick={() => setActiveSection('analytics')}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition flex items-center gap-2 whitespace-nowrap ${
              activeSection === 'analytics'
                ? 'bg-[#c5a059] text-black shadow-md'
                : 'text-white/60 hover:text-white hover:bg-white/[0.04]'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>{isTamil ? 'செயல்திறன் & பாட வரைபடங்கள்' : 'Performance Analytics'}</span>
          </button>

          <button
            id="tab-dashboard-remediation"
            onClick={() => setActiveSection('remediation')}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition flex items-center gap-2 whitespace-nowrap ${
              activeSection === 'remediation'
                ? 'bg-[#c5a059] text-black shadow-md'
                : 'text-white/60 hover:text-white hover:bg-white/[0.04]'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>{isTamil ? 'பலவீனப் பகுதிகள் & பிழை ஆய்வு' : 'Priority Remediation'}</span>
            {weakCount > 0 && (
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                activeSection === 'remediation' ? 'bg-black text-[#c5a059]' : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
              }`}>
                {weakCount}
              </span>
            )}
          </button>
        </div>

        {/* View Mode Toggle (Tabbed vs Full Stack) */}
        <div className="hidden sm:flex items-center gap-1 border-l border-white/10 pl-3 pr-1 text-xs text-white/50">
          <button
            onClick={() => setActiveSection(activeSection === 'all' ? 'focus' : 'all')}
            className={`px-2.5 py-1.5 rounded-md transition flex items-center gap-1.5 ${
              activeSection === 'all'
                ? 'bg-white/10 text-white font-medium'
                : 'hover:text-white hover:bg-white/[0.04]'
            }`}
            title="Toggle between tabbed compact view and expanded full view"
          >
            {activeSection === 'all' ? <LayoutGrid className="w-3.5 h-3.5 text-[#c5a059]" /> : <List className="w-3.5 h-3.5" />}
            <span className="text-[11px]">{activeSection === 'all' ? 'Expanded' : 'Expand All'}</span>
          </button>
        </div>
      </div>

      {/* 4. TAB CONTENT AREA */}

      {/* TAB 1: Today's Focus & Readiness */}
      {(activeSection === 'focus' || activeSection === 'all') && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Left: Overall Readiness & Cutoff (5 cols) */}
          <div className="lg:col-span-5 bg-[#121212] border border-white/10 rounded-xl p-5 shadow-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-white/[0.06]">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#c5a059]/10 border border-[#c5a059]/30 flex items-center justify-center text-[#c5a059]">
                    <Compass className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-white">
                      {isTamil ? 'தேர்வு தயார்நிலை' : 'Exam Readiness Index'}
                    </h3>
                    <p className="text-[11px] text-white/50">
                      {isTamil ? 'மதிப்பீட்டு நிலை & தகுதி வரம்பு' : 'Current score vs qualifying cutoff'}
                    </p>
                  </div>
                </div>

                <div className="text-right font-mono text-xs">
                  <span className="text-white/50">{isTamil ? 'வரம்பு:' : 'Cutoff:'} </span>
                  <strong className="text-[#c5a059]">{readiness.qualifyingThreshold}/150</strong>
                </div>
              </div>

              {/* Score & Projected Marks */}
              <div className="flex items-center gap-4 p-3.5 rounded-lg bg-white/[0.02] border border-white/[0.06] mb-4">
                <div className="flex flex-col items-center justify-center w-18 h-18 rounded-full border border-[#c5a059]/30 bg-[#c5a059]/5 shrink-0">
                  <span className="text-xl font-serif-luxury font-bold text-white">
                    {readiness.overallScore}%
                  </span>
                  <span className="text-[8px] font-semibold text-white/40 uppercase tracking-wider">
                    {isTamil ? 'தயார்நிலை' : 'Readiness'}
                  </span>
                </div>

                <div className="space-y-1.5 flex-1">
                  <div className="flex items-baseline justify-between">
                    <span className="text-xs text-white/60">
                      {isTamil ? 'மதிப்பிடப்பட்ட மதிப்பெண்:' : 'Projected Marks:'}
                    </span>
                    <span className="text-lg font-serif-luxury font-bold text-white">
                      {readiness.projectedMarks} <span className="text-xs text-white/30 font-sans font-normal">/ 150</span>
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded border ${
                      readiness.marginAboveCutoff >= 0 
                        ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800/40' 
                        : 'bg-rose-950/60 text-rose-300 border-rose-800/40'
                    }`}>
                      {readiness.marginAboveCutoff >= 0 ? `+${readiness.marginAboveCutoff}` : `${readiness.marginAboveCutoff}`} {isTamil ? 'மதிப்பெண்' : 'pts'}
                    </span>
                    <span className="text-[11px] text-white/40">
                      {readiness.marginAboveCutoff >= 0 
                        ? (isTamil ? 'பாதுகாப்பான நிலை' : 'Safe Margin') 
                        : (isTamil ? 'தகுதி பெற வேண்டும்' : 'Below Cutoff')
                      }
                    </span>
                  </div>
                </div>
              </div>

              {/* 4 Pillars: Knowledge, Accuracy, Speed, Consistency */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.06]">
                  <div className="flex justify-between text-white/60 mb-1">
                    <span className="text-[11px]">{isTamil ? 'பாட அறிவு' : 'Knowledge'}</span>
                    <strong className="text-white font-mono">{readiness.knowledgeScore}%</strong>
                  </div>
                  <div className="w-full bg-white/10 h-1 rounded-full overflow-hidden">
                    <div className="bg-[#c5a059] h-full rounded-full" style={{ width: `${readiness.knowledgeScore}%` }} />
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.06]">
                  <div className="flex justify-between text-white/60 mb-1">
                    <span className="text-[11px]">{isTamil ? 'துல்லியம்' : 'Accuracy'}</span>
                    <strong className="text-white font-mono">{readiness.accuracyScore}%</strong>
                  </div>
                  <div className="w-full bg-white/10 h-1 rounded-full overflow-hidden">
                    <div className="bg-[#c5a059] h-full rounded-full" style={{ width: `${readiness.accuracyScore}%` }} />
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.06]">
                  <div className="flex justify-between text-white/60 mb-1">
                    <span className="text-[11px]">{isTamil ? 'வேகம்' : 'Speed'}</span>
                    <strong className="text-white font-mono">{readiness.speedScore}%</strong>
                  </div>
                  <div className="w-full bg-white/10 h-1 rounded-full overflow-hidden">
                    <div className="bg-[#c5a059] h-full rounded-full" style={{ width: `${readiness.speedScore}%` }} />
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.06]">
                  <div className="flex justify-between text-white/60 mb-1">
                    <span className="text-[11px]">{isTamil ? 'நிலைத்தன்மை' : 'Consistency'}</span>
                    <strong className="text-white font-mono">{readiness.consistencyScore}%</strong>
                  </div>
                  <div className="w-full bg-white/10 h-1 rounded-full overflow-hidden">
                    <div className="bg-[#c5a059] h-full rounded-full" style={{ width: `${readiness.consistencyScore}%` }} />
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs text-white/50">
              <span>{isTamil ? 'இலக்கு: 85%+' : 'Benchmark: 85%+'}</span>
              <button onClick={onStartDiagnostic} className="text-[#c5a059] hover:underline flex items-center gap-1 transition">
                <span>{isTamil ? 'மறு ஆய்வு' : 'Retest Diagnostic'}</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Right: Today's 35m Prescription (7 cols) */}
          <div className="lg:col-span-7 bg-[#121212] border border-white/10 rounded-xl p-5 shadow-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-white/[0.06]">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#c5a059]/10 border border-[#c5a059]/30 flex items-center justify-center text-[#c5a059]">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-white">
                      {isTamil ? 'இன்றைய பயிற்சி திட்டம்' : "Today's Study Prescription"}
                    </h3>
                    <p className="text-[11px] text-white/50">
                      {isTamil ? '35 நிமிட கவனக்குவிப்பு பயிற்சி' : 'Daily 35-minute focused recovery plan'}
                    </p>
                  </div>
                </div>

                <span className="px-2.5 py-0.5 rounded-full bg-[#c5a059]/10 text-[#c5a059] text-[10px] font-semibold border border-[#c5a059]/30">
                  {dailyPlan.availableMinutes}m Daily
                </span>
              </div>

              {/* Target Topic Details */}
              <div className="p-3.5 rounded-lg bg-white/[0.02] border border-white/[0.06] mb-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-[#c5a059]">
                      {isTamil ? 'முக்கிய பலவீனப் பகுதி' : 'High-Yield Focus Gap'}
                    </span>
                    <h4 className="text-sm sm:text-base font-semibold text-white mt-0.5">
                      {isTamil ? dailyPlan.targetTopicNameTa : dailyPlan.targetTopicNameEn}
                    </h4>
                  </div>
                  <button
                    onClick={() => onOpenAITutor(dailyPlan.targetTopicNameEn)}
                    className="px-2.5 py-1 rounded bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-white text-xs font-medium flex items-center gap-1.5 transition shrink-0"
                  >
                    <Brain className="w-3.5 h-3.5 text-[#c5a059]" />
                    <span>{isTamil ? 'AI ஆசிரியர்' : 'AI Tutor'}</span>
                  </button>
                </div>
                <p className="text-xs text-white/60 mt-1.5 font-light leading-relaxed">
                  {isTamil ? dailyPlan.whyChosenReasonTa : dailyPlan.whyChosenReasonEn}
                </p>
              </div>

              {/* The 4 Blocks */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <div className={`p-2 rounded-lg border text-center transition ${
                  dailyPlan.learnBlock.isCompleted 
                    ? 'bg-emerald-950/30 border-emerald-800/40 text-emerald-300'
                    : 'bg-white/[0.02] border-white/[0.06] text-white/70'
                }`}>
                  <div className="font-semibold text-white text-[11px] mb-0.5">
                    1. {isTamil ? 'கற்றல்' : 'Learn'}
                  </div>
                  <div className="text-[10px] text-white/40">{dailyPlan.learnBlock.estimatedMinutes}m · {isTamil ? 'விளக்கம்' : 'Concept'}</div>
                </div>

                <div className={`p-2 rounded-lg border text-center transition ${
                  dailyPlan.practiceBlock.isCompleted 
                    ? 'bg-emerald-950/30 border-emerald-800/40 text-emerald-300'
                    : 'bg-white/[0.02] border-white/[0.06] text-white/70'
                }`}>
                  <div className="font-semibold text-white text-[11px] mb-0.5">
                    2. {isTamil ? 'பயிற்சி' : 'Practice'}
                  </div>
                  <div className="text-[10px] text-white/40">{dailyPlan.practiceBlock.estimatedMinutes}m · 15 Qs</div>
                </div>

                <div className={`p-2 rounded-lg border text-center transition ${
                  dailyPlan.reviewBlock.isCompleted 
                    ? 'bg-emerald-950/30 border-emerald-800/40 text-emerald-300'
                    : 'bg-white/[0.02] border-white/[0.06] text-white/70'
                }`}>
                  <div className="font-semibold text-white text-[11px] mb-0.5">
                    3. {isTamil ? 'திருப்புதல்' : 'Review'}
                  </div>
                  <div className="text-[10px] text-white/40">{dailyPlan.reviewBlock.estimatedMinutes}m · Errors</div>
                </div>

                <div className={`p-2 rounded-lg border text-center transition ${
                  dailyPlan.quickCheckBlock.isCompleted 
                    ? 'bg-emerald-950/30 border-emerald-800/40 text-emerald-300'
                    : 'bg-white/[0.02] border-white/[0.06] text-white/70'
                }`}>
                  <div className="font-semibold text-white text-[11px] mb-0.5">
                    4. {isTamil ? 'சரிபார்த்தல்' : 'Check'}
                  </div>
                  <div className="text-[10px] text-white/40">{dailyPlan.quickCheckBlock.estimatedMinutes}m · 5 Qs</div>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between">
              <span className="text-xs text-white/40">
                {dailyPlan.overallCompleted 
                  ? (isTamil ? '✅ இன்றைய பயிற்சி முடிந்தது' : '✅ Completed for today') 
                  : (isTamil ? 'தானியங்கி தேர்ச்சி புதுப்பிப்பு' : 'Auto-syncs mastery upon finish')
                }
              </span>
              <button
                onClick={onStartDailyPlan}
                className="px-4 py-2 rounded-lg bg-[#c5a059] hover:bg-[#d8b56f] text-black font-semibold text-xs uppercase tracking-wider transition flex items-center gap-1.5 cursor-pointer"
              >
                <span>{dailyPlan.overallCompleted ? (isTamil ? 'மீண்டும் பயிற்சி' : 'Practice Again') : (isTamil ? 'தொடங்கு' : 'Begin Workout')}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Performance Analytics & 5 Subjects */}
      {(activeSection === 'analytics' || activeSection === 'all') && (
        <div className="space-y-5">
          {/* Dynamic Recharts Dashboard */}
          <RechartsMasteryDashboard
            topicMasteries={topicMasteries}
            readiness={readiness}
            languageMode={languageMode}
          />

          {/* Subject Mastery Cards (5 Subjects) */}
          <div className="bg-[#121212] border border-white/10 rounded-xl p-5 shadow-xl">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-white/[0.06]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white">
                    {isTamil ? 'பாடவாரி தேர்ச்சி நிலை' : 'Subject Mastery Breakdown'}
                  </h3>
                  <p className="text-[11px] text-white/50">
                    {isTamil ? '5 பாடங்களின் மதிப்பீட்டு நிலவரம்' : 'Score potential across all 5 exam sections'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 text-xs text-white/50">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span>≥75%</span>
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-[#c5a059]" />
                  <span>55–74%</span>
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-rose-400" />
                  <span>&lt;55%</span>
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
              {readiness.subjectScores.map((sub) => (
                <div
                  key={sub.subjectId}
                  className="p-3.5 rounded-lg bg-white/[0.02] border border-white/[0.06] hover:border-white/15 transition flex flex-col justify-between"
                >
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-xs font-semibold text-white">
                        {isTamil ? sub.subjectNameTa : sub.subjectNameEn}
                      </span>
                      <span className={`w-2 h-2 rounded-full ${
                        sub.status === 'exam_ready'
                          ? 'bg-emerald-400'
                          : sub.status === 'developing'
                          ? 'bg-[#c5a059]'
                          : 'bg-rose-400'
                      }`} />
                    </div>
                    <div className="flex items-baseline justify-between text-xs mb-1">
                      <span className="text-white/40 text-[10px] uppercase tracking-wider">{isTamil ? 'தேர்ச்சி:' : 'Mastery:'}</span>
                      <span className="font-mono font-bold text-white">{sub.masteryPercent}%</span>
                    </div>
                    <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          sub.status === 'exam_ready'
                            ? 'bg-emerald-400'
                            : sub.status === 'developing'
                            ? 'bg-[#c5a059]'
                            : 'bg-rose-400'
                        }`}
                        style={{ width: `${sub.masteryPercent}%` }}
                      />
                    </div>
                  </div>

                  <div className="mt-3 pt-2 border-t border-white/[0.06] text-[11px] flex justify-between text-white/40">
                    <span>{isTamil ? 'மதிப்பீடு:' : 'Est. Marks:'}</span>
                    <strong className="text-white font-mono">{sub.estimatedMarks} / {sub.maxMarks}</strong>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Priority Remediation & Cognitive Traps */}
      {(activeSection === 'remediation' || activeSection === 'all') && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Weakest Concepts Drilldown (7 cols) */}
          <div className="lg:col-span-7 bg-[#121212] border border-white/10 rounded-xl p-5 shadow-xl">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-white/[0.06]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white">
                    {isTamil ? 'அதிக கவன தேவை உள்ள பகுதிகள்' : 'Priority Remediation Topics'}
                  </h3>
                  <p className="text-[11px] text-white/50">
                    {isTamil ? 'மதிப்பெண் இழப்பை தடுக்கும் தலைப்புகள்' : 'Remediate high-margin error areas first'}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-2.5">
              {weakestTopics.map((topic) => (
                <div
                  key={topic.topicId}
                  className="p-3.5 rounded-lg bg-white/[0.02] border border-white/[0.06] flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-[#c5a059]/40 transition duration-200"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-rose-950/60 border border-rose-800/40 text-rose-300">
                        {topic.subjectId.toUpperCase()}
                      </span>
                      <h4 className="text-xs font-semibold text-white">
                        {isTamil ? topic.topicNameTa : topic.topicNameEn}
                      </h4>
                    </div>
                    <div className="flex flex-wrap items-center gap-2.5 text-[11px] text-white/40">
                      <span>{isTamil ? 'தேர்ச்சி:' : 'Mastery:'} <strong className="text-rose-400 font-mono">{topic.masteryPercent}%</strong></span>
                      <span>·</span>
                      <span>{isTamil ? 'முக்கிய பிழை:' : 'Error Pattern:'} <strong className="text-[#c5a059] capitalize">{topic.dominantErrorType?.replace('_', ' ') || 'Concept Confusion'}</strong></span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <button
                      onClick={() => onOpenAITutor(topic.topicNameEn)}
                      className="px-2.5 py-1.5 rounded-md bg-white/[0.04] hover:bg-white/[0.08] text-white text-xs font-medium border border-white/10 transition flex items-center gap-1"
                    >
                      <Brain className="w-3 h-3 text-[#c5a059]" />
                      <span>{isTamil ? 'விளக்கம்' : 'Explain'}</span>
                    </button>
                    <button
                      onClick={() => onNavigateToTopic(topic.topicId)}
                      className="px-3 py-1.5 rounded-md bg-[#c5a059] hover:bg-[#d8b56f] text-black text-xs font-semibold uppercase tracking-wider transition"
                    >
                      {isTamil ? 'பயிற்சி' : 'Drill'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Cognitive Traps & Exam Bottlenecks (5 cols) */}
          <div className="lg:col-span-5 bg-[#121212] border border-white/10 rounded-xl p-5 shadow-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2.5 pb-3 mb-4 border-b border-white/[0.06]">
                <div className="w-8 h-8 rounded-lg bg-[#c5a059]/10 border border-[#c5a059]/30 flex items-center justify-center text-[#c5a059]">
                  <Target className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white">
                    {isTamil ? 'தேர்வு பிழை பகுப்பாய்வு' : 'Cognitive Exam Traps'}
                  </h3>
                  <p className="text-[11px] text-white/50">
                    {isTamil ? 'மதிப்பெண் இழப்புக்கான அடிப்படைக் காரணங்கள்' : 'Underlying behavioural pitfalls'}
                  </p>
                </div>
              </div>

            <div className="space-y-2.5">
              <div className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.06]">
                <span className="text-[10px] uppercase font-bold tracking-wider text-rose-400">
                  {isTamil ? 'நேர ஒதுக்கீடு பிழை' : 'Time Allocation Pitfall'}
                </span>
                <p className="text-xs text-white/70 font-light mt-1 leading-relaxed">
                  {isTamil 
                    ? 'கணித வினாக்களுக்கு அதிக நேரம் செலவிடுவதால், மொழிப் பகுதிகளில் அவசரத்தில் பிழைகள் ஏற்படுகின்றன.'
                    : 'Over-calculating in Mathematics reduces time buffers for English reading comprehension.'
                  }
                </p>
              </div>

              <div className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.06]">
                <span className="text-[10px] uppercase font-bold tracking-wider text-[#c5a059]">
                  {isTamil ? 'திசைதிருப்பும் விடைகள்' : 'Distractor Vulnerability'}
                </span>
                <p className="text-xs text-white/70 font-light mt-1 leading-relaxed">
                  {isTamil
                    ? 'பியாஜேயின் வளர்ச்சி நிலைகளில் குழப்பம் அடைந்து தவறான விடையை தேர்வு செய்தல்.'
                    : 'Confusing Pre-operational Centration with Concrete Operational Conservation in CDP.'
                  }
                </p>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-white/[0.06]">
            <button
              onClick={() => onOpenAITutor('Time Management & Exam Traps')}
              className="w-full py-2 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-white font-medium text-xs border border-white/10 transition flex items-center justify-center gap-1.5"
            >
              <Brain className="w-3.5 h-3.5 text-[#c5a059]" />
              <span>{isTamil ? 'AI ஆசிரியருடன் சரிசெய்' : 'Deconstruct Traps with AI'}</span>
            </button>
          </div>
        </div>
      </div>
      )}
    </div>
  );
};
