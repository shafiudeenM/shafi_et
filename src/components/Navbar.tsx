import React, { useState, useEffect } from 'react';
import { pwaService } from '../services/pwaService';
import { 
  PaperType, 
  LanguageMode, 
  ReservationCategory, 
  ReadinessScoreBreakdown,
  ThemeMode,
  AuthUser,
  DailySessionPlan
} from '../types';
import { DailyPlanProgressTracker } from './DailyPlanProgressTracker';
import { 
  GraduationCap, 
  Settings, 
  ChevronDown,
  Target,
  FileText,
  Sun,
  Moon,
  LogOut,
  User,
  Home,
  Download,
  Calendar,
  Sparkles,
  ShieldCheck,
  Smartphone
} from 'lucide-react';

interface NavbarProps {
  selectedPaper: PaperType;
  onSelectPaper: (paper: PaperType) => void;
  languageMode: LanguageMode;
  onLanguageChange: (mode: LanguageMode) => void;
  readiness: ReadinessScoreBreakdown;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenSettings: () => void;
  onOpenPDFExportModal?: () => void;
  onOpenIntegrationsModal?: () => void;
  onOpenMobileExportModal?: () => void;
  dailyPlan?: DailySessionPlan;
  onStartDailyPlan?: () => void;
  theme?: ThemeMode;
  onToggleTheme?: () => void;
  user?: AuthUser | null;
  onLogout?: () => void;
  onGoToLanding?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  selectedPaper,
  onSelectPaper,
  languageMode,
  onLanguageChange,
  readiness,
  activeTab,
  setActiveTab,
  onOpenSettings,
  onOpenPDFExportModal,
  onOpenIntegrationsModal,
  onOpenMobileExportModal,
  dailyPlan,
  onStartDailyPlan,
  theme = 'dark',
  onToggleTheme,
  user,
  onLogout,
  onGoToLanding,
}) => {
  const isTamil = languageMode === 'tamil';
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  // PWA State
  const [isOnline, setIsOnline] = useState(pwaService.isOnline());
  const [canInstall, setCanInstall] = useState(pwaService.canInstall());

  useEffect(() => {
    const unsubscribe = pwaService.subscribe(() => {
      setIsOnline(pwaService.isOnline());
      setCanInstall(pwaService.canInstall());
    });
    return unsubscribe;
  }, []);

  const handleInstallClick = async () => {
    await pwaService.promptInstall();
  };

  const paperLabel = {
    PAPER_I: isTamil ? 'தாள் I (1–5)' : 'Paper I (1–5)',
    PAPER_II_MATH_SCI: isTamil ? 'தாள் II (கணிதம் & அறி)' : 'Paper II (Math & Sci)',
    PAPER_II_SOC_SCI: isTamil ? 'தாள் II (சமூக அறி)' : 'Paper II (Social Sci)',
  }[selectedPaper];

  const navItems = [
    { id: 'dashboard', labelEn: 'Dashboard', labelTa: 'முகப்பு' },
    { id: 'daily_plan', labelEn: 'Daily Workout', labelTa: 'தினசரி பயிற்சி' },
    { id: 'pyq', labelEn: 'PYQ Vault', labelTa: 'முந்தைய வினாக்கள்' },
    { id: 'flashcards', labelEn: 'Flashcards', labelTa: 'நினைவு அட்டைகள்' },
    { id: 'practice', labelEn: 'Question Bank', labelTa: 'வினா வங்கி' },
    { id: 'mistakes', labelEn: 'Weakness Vault', labelTa: 'பலவீன பெட்டகம்' },
    { id: 'diagnostic', labelEn: 'Diagnostic Test', labelTa: 'குறை கண்டறி' },
    { id: 'simulator', labelEn: '150Q Simulator', labelTa: 'மாதிரி தேர்வு' },
    { id: 'mark_budget', labelEn: 'Mark Budget', labelTa: 'மதிப்பெண் திட்டமிடல்' },
    { id: 'srs_review', labelEn: 'SRS Review', labelTa: 'மறுபார்வை பயிற்சி' },
    { id: 'syllabus', labelEn: 'Syllabus', labelTa: 'பாடத்திட்டம்' },
    { id: 'admin', labelEn: 'Admin Console', labelTa: 'நிர்வாக மையம்' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#0c0c0c]/95 backdrop-blur-md border-b border-[#222222] text-white shadow-xl">
      {/* Top Header Row */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between gap-3">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#c5a059] to-[#8d6f30] flex items-center justify-center shadow-md shadow-[#c5a059]/15 text-black font-bold border border-[#c5a059]/40">
            <GraduationCap className="w-5 h-5 text-black" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-serif font-bold text-base tracking-tight text-white">
                TNTET <span className="text-[#c5a059] font-normal italic">Coach</span>
              </span>
              <span className="text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-[#c5a059]/15 text-[#c5a059] border border-[#c5a059]/30">
                SCERT 2026
              </span>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Paper Selector Dropdown */}
          <div className="relative group">
            <button className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-xs font-medium text-white/90 hover:text-white transition">
              <span>{paperLabel}</span>
              <ChevronDown className="w-3.5 h-3.5 text-white/40 group-hover:text-white transition-transform duration-200 group-hover:rotate-180" />
            </button>
            <div className="absolute right-0 mt-1.5 w-60 bg-[#141414] border border-[#2a2a2a] rounded-xl shadow-2xl py-1 hidden group-hover:block z-50 backdrop-blur-xl">
              <button
                onClick={() => onSelectPaper('PAPER_I')}
                className={`w-full text-left px-3.5 py-2 text-xs font-medium hover:bg-white/[0.05] transition ${
                  selectedPaper === 'PAPER_I' ? 'text-[#c5a059] bg-[#c5a059]/10 font-semibold' : 'text-white/70'
                }`}
              >
                Paper I (Classes 1–5 Primary)
              </button>
              <button
                onClick={() => onSelectPaper('PAPER_II_MATH_SCI')}
                className={`w-full text-left px-3.5 py-2 text-xs font-medium hover:bg-white/[0.05] transition ${
                  selectedPaper === 'PAPER_II_MATH_SCI' ? 'text-[#c5a059] bg-[#c5a059]/10 font-semibold' : 'text-white/70'
                }`}
              >
                Paper II (Maths & Science)
              </button>
              <button
                onClick={() => onSelectPaper('PAPER_II_SOC_SCI')}
                className={`w-full text-left px-3.5 py-2 text-xs font-medium hover:bg-white/[0.05] transition ${
                  selectedPaper === 'PAPER_II_SOC_SCI' ? 'text-[#c5a059] bg-[#c5a059]/10 font-semibold' : 'text-white/70'
                }`}
              >
                Paper II (Social Science)
              </button>
            </div>
          </div>

          {/* Language Toggle */}
          <div className="flex items-center bg-white/[0.04] rounded-lg p-0.5 border border-white/10 text-xs">
            <button
              onClick={() => onLanguageChange('tamil')}
              className={`px-2 py-1 rounded-md text-xs font-medium transition ${
                languageMode === 'tamil' ? 'bg-[#c5a059] text-black font-bold' : 'text-white/50 hover:text-white'
              }`}
              title="தமிழ் விளக்கம்"
            >
              தமிழ்
            </button>
            <button
              onClick={() => onLanguageChange('bilingual')}
              className={`px-2 py-1 rounded-md text-xs font-medium transition ${
                languageMode === 'bilingual' ? 'bg-[#c5a059] text-black font-bold' : 'text-white/50 hover:text-white'
              }`}
              title="Bilingual"
            >
              BIL
            </button>
            <button
              onClick={() => onLanguageChange('english')}
              className={`px-2 py-1 rounded-md text-xs font-medium transition ${
                languageMode === 'english' ? 'bg-[#c5a059] text-black font-bold' : 'text-white/50 hover:text-white'
              }`}
              title="English Medium"
            >
              ENG
            </button>
          </div>

          {/* Daily Plan Progress Tracker (Compact) */}
          {dailyPlan && (
            <DailyPlanProgressTracker
              dailyPlan={dailyPlan}
              isTamil={isTamil}
              onStartDailyPlan={onStartDailyPlan}
              compact={true}
            />
          )}

          {/* Useful Integrations & OMR Button */}
          {onOpenIntegrationsModal && (
            <button
              id="btn-navbar-integrations"
              onClick={onOpenIntegrationsModal}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-semibold transition"
              title="Google Calendar, Sheets & OMR Practice Tools"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span className="hidden md:inline">{isTamil ? 'ஒருங்கிணைப்புகள் & OMR' : 'Sync & OMR'}</span>
            </button>
          )}

          {/* PDF Report Button */}
          {onOpenPDFExportModal && (
            <button
              id="btn-navbar-pdf-dossier"
              onClick={onOpenPDFExportModal}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#c5a059]/15 hover:bg-[#c5a059]/25 text-[#c5a059] border border-[#c5a059]/30 text-xs font-semibold transition"
              title="Export Performance PDF Report"
            >
              <FileText className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{isTamil ? 'PDF அறிக்கை' : 'PDF Report'}</span>
            </button>
          )}

          {/* PWA Install Button if eligible */}
          {canInstall && (
            <button
              onClick={handleInstallClick}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-white/80 border border-white/10 text-xs font-medium transition"
              title="Install TNTET Coach App"
            >
              <Download className="w-3.5 h-3.5 text-[#c5a059]" />
              <span className="hidden md:inline">{isTamil ? 'நிறுவுக' : 'Install'}</span>
            </button>
          )}

          {/* User Account / Profile Dropdown & Settings */}
          <div className="relative">
            <button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="flex items-center gap-2 pl-2 pr-2.5 py-1 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-xs text-white transition"
              title="Candidate Profile Menu"
            >
              <div className="w-5 h-5 rounded-full bg-gradient-to-br from-[#c5a059] to-[#8d6f30] flex items-center justify-center text-black font-bold text-[10px]">
                {user?.name ? user.name[0].toUpperCase() : 'C'}
              </div>
              <span className="max-w-[70px] sm:max-w-[100px] truncate font-medium text-[11px]">
                {user?.name || 'Candidate'}
              </span>
              <ChevronDown className={`w-3 h-3 text-white/50 transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {isUserMenuOpen && (
              <div className="absolute right-0 mt-2 w-56 rounded-xl bg-[#141414] border border-[#2a2a2a] shadow-2xl p-2 z-50 animate-fadeIn text-xs space-y-1 backdrop-blur-xl">
                <div className="px-2.5 py-2 border-b border-white/10 mb-1">
                  <div className="font-bold text-white truncate">{user?.name || 'TNTET Candidate'}</div>
                  <div className="text-[10px] text-white/50 truncate">{user?.email || 'Logged in'}</div>
                  <div className="mt-1 flex items-center gap-1.5">
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#c5a059]/15 text-[#c5a059] font-bold">
                      {user?.category === 'OC_GENERAL' ? 'OC Benchmark (90M)' : 'Reserved Benchmark (82M)'}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => { setIsUserMenuOpen(false); onOpenSettings(); }}
                  className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-white/[0.06] text-white/90 hover:text-white flex items-center gap-2 transition"
                >
                  <Settings className="w-3.5 h-3.5 text-[#c5a059]" />
                  <span>{isTamil ? 'சுயவிவரம் & தகுதி மதிப்பெண்' : 'Profile & Qualifying Benchmark'}</span>
                </button>

                <button
                  onClick={() => { setIsUserMenuOpen(false); setActiveTab('admin'); }}
                  className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-emerald-950/40 text-emerald-400 hover:text-emerald-300 flex items-center gap-2 transition"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>{isTamil ? 'நிர்வாக மையம் (Admin Console)' : 'Super Admin Console'}</span>
                </button>

                {onOpenMobileExportModal && (
                  <button
                    onClick={() => { setIsUserMenuOpen(false); onOpenMobileExportModal(); }}
                    className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-[#c5a059]/10 text-[#c5a059] hover:text-[#d8b56f] flex items-center gap-2 transition"
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                    <span>{isTamil ? 'மொபைல் செயலி (Android APK)' : 'Mobile App Export (Capacitor APK)'}</span>
                  </button>
                )}

                {onOpenIntegrationsModal && (
                  <button
                    onClick={() => { setIsUserMenuOpen(false); onOpenIntegrationsModal(); }}
                    className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-white/[0.06] text-emerald-400 hover:text-emerald-300 flex items-center gap-2 transition"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{isTamil ? 'Google Calendar & Sheets Sync' : 'Google Calendar & Sheets Sync'}</span>
                  </button>
                )}

                {onGoToLanding && (
                  <button
                    onClick={() => { setIsUserMenuOpen(false); onGoToLanding(); }}
                    className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-white/[0.06] text-white/80 hover:text-white flex items-center gap-2 transition"
                  >
                    <Home className="w-3.5 h-3.5 text-white/50" />
                    <span>{isTamil ? 'முகப்பு பக்கம் (Landing)' : 'Public Landing Page'}</span>
                  </button>
                )}

                {onLogout && (
                  <button
                    onClick={() => { setIsUserMenuOpen(false); onLogout(); }}
                    className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-red-950/40 text-red-400 hover:text-red-300 flex items-center gap-2 transition border-t border-white/5 pt-1.5"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>{isTamil ? 'வெளியேறுக (Log Out)' : 'Log Out'}</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Clean Tab Bar */}
      <div className="border-t border-white/[0.06] bg-[#0f0f0f]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex space-x-1 sm:space-x-2 overflow-x-auto py-1.5 scrollbar-none">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`nav-tab-${item.id}`}
                onClick={() => setActiveTab(item.id)}
                className={`whitespace-nowrap px-3 py-1.5 rounded-lg text-xs font-medium transition flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-[#c5a059] text-black font-bold shadow-sm'
                    : 'text-white/60 hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                <span>{languageMode === 'tamil' ? item.labelTa : item.labelEn}</span>
                {item.id === 'daily_plan' && (
                  <span className={`text-[10px] uppercase font-bold px-1.5 py-0.2 rounded ${
                    isActive ? 'bg-black text-[#c5a059]' : 'bg-[#c5a059]/15 text-[#c5a059]'
                  }`}>
                    35m
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
