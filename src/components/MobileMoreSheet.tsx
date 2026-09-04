import React from 'react';
import { 
  PaperType, 
  LanguageMode, 
  ThemeMode,
  AuthUser 
} from '../types';
import { 
  Layers, 
  Calendar, 
  FileText, 
  HelpCircle, 
  LogOut, 
  X, 
  Check, 
  Sun, 
  Moon, 
  Settings, 
  ShieldCheck, 
  GraduationCap,
  Sparkles,
  BookOpen,
  History,
  TrendingUp,
  RotateCcw
} from 'lucide-react';
import { triggerHaptic } from '../services/nativeMobileService';

interface MobileMoreSheetProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  selectedPaper: PaperType;
  onSelectPaper: (paper: PaperType) => void;
  languageMode: LanguageMode;
  onLanguageChange: (mode: LanguageMode) => void;
  theme?: ThemeMode;
  onToggleTheme?: () => void;
  onOpenProfile: () => void;
  onOpenPDFExportModal?: () => void;
  onOpenIntegrationsModal?: () => void;
  user?: AuthUser | null;
  onLogout?: () => void;
}

export const MobileMoreSheet: React.FC<MobileMoreSheetProps> = ({
  isOpen,
  onClose,
  activeTab,
  setActiveTab,
  selectedPaper,
  onSelectPaper,
  languageMode,
  onLanguageChange,
  theme = 'dark',
  onToggleTheme,
  onOpenProfile,
  onOpenPDFExportModal,
  onOpenIntegrationsModal,
  user,
  onLogout,
}) => {
  if (!isOpen) return null;

  const isTamil = languageMode === 'tamil';

  const handleSelectTab = (tabId: string) => {
    triggerHaptic.light();
    setActiveTab(tabId);
    onClose();
  };

  const papers: { id: PaperType; titleEn: string; titleTa: string; sub: string }[] = [
    {
      id: 'PAPER_I',
      titleEn: 'Paper I (Classes 1–5)',
      titleTa: 'தாள் I (வகுப்பு 1–5)',
      sub: 'CDP + Tamil + English + Maths + EVS'
    },
    {
      id: 'PAPER_II_MATH_SCI',
      titleEn: 'Paper II: Maths & Science (6–8)',
      titleTa: 'தாள் II: கணிதம் & அறிவியல் (6–8)',
      sub: 'CDP + Tamil + English + Maths & Science'
    },
    {
      id: 'PAPER_II_SOC_SCI',
      titleEn: 'Paper II: Social Science (6–8)',
      titleTa: 'தாள் II: சமூக அறிவியல் (6–8)',
      sub: 'CDP + Tamil + English + Social Science'
    }
  ];

  return (
    <div className="md:hidden fixed inset-0 z-50 flex flex-col justify-end">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Sheet Content */}
      <div 
        className="relative z-10 bg-[#121212] border-t border-[#262626] rounded-t-3xl max-h-[85vh] overflow-y-auto shadow-2xl p-5"
        style={{ paddingBottom: 'max(24px, env(safe-area-inset-bottom, 24px))' }}
      >
        {/* Handle bar */}
        <div className="w-12 h-1.5 bg-white/20 rounded-full mx-auto mb-4" />

        {/* Sheet Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/[0.08] mb-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#c5a059]" />
              <span>{isTamil ? 'அனைத்து பிரிவுகள் & அமைப்புகள்' : 'All Sections & Settings'}</span>
            </h3>
            <p className="text-[11px] text-white/50">
              {isTamil ? 'TNTET 2026 பிரத்யேக பயிற்சிகள்' : 'TNTET 2026 Preparation Tools'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-white/[0.05] text-white/70 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Paper Switcher Section */}
        <div className="mb-5">
          <label className="text-[11px] font-bold text-[#c5a059] uppercase tracking-wider block mb-2">
            {isTamil ? 'இலக்கு தாள் (Select Paper)' : 'Active Target Paper'}
          </label>
          <div className="space-y-2">
            {papers.map((p) => {
              const isSelected = selectedPaper === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => {
                    triggerHaptic.medium();
                    onSelectPaper(p.id);
                  }}
                  className={`w-full text-left p-3 rounded-xl border transition flex items-center justify-between ${
                    isSelected
                      ? 'bg-[#c5a059]/15 border-[#c5a059] text-white'
                      : 'bg-white/[0.02] border-white/[0.08] text-white/70 hover:bg-white/[0.05]'
                  }`}
                >
                  <div>
                    <div className="text-xs font-bold">{isTamil ? p.titleTa : p.titleEn}</div>
                    <div className="text-[10px] text-white/40 mt-0.5">{p.sub}</div>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-[#c5a059]" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Feature Sections Grid */}
        <div className="mb-5">
          <label className="text-[11px] font-bold text-[#c5a059] uppercase tracking-wider block mb-2">
            {isTamil ? 'முக்கிய தொகுதிகள்' : 'Modules & Vaults'}
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleSelectTab('daily_plan')}
              className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition ${
                activeTab === 'daily_plan' ? 'bg-[#c5a059]/15 border-[#c5a059]' : 'bg-white/[0.02] border-white/[0.08] hover:bg-white/[0.05]'
              }`}
            >
              <Calendar className="w-4 h-4 text-emerald-400 mt-0.5" />
              <div>
                <div className="text-xs font-bold text-white">{isTamil ? 'தினசரி 35m' : 'Daily 35m'}</div>
                <div className="text-[10px] text-white/50">{isTamil ? 'பயிற்சித் திட்டம்' : 'Workout Routine'}</div>
              </div>
            </button>

            <button
              onClick={() => handleSelectTab('pyq')}
              className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition ${
                activeTab === 'pyq' ? 'bg-[#c5a059]/15 border-[#c5a059]' : 'bg-white/[0.02] border-white/[0.08] hover:bg-white/[0.05]'
              }`}
            >
              <History className="w-4 h-4 text-blue-400 mt-0.5" />
              <div>
                <div className="text-xs font-bold text-white">{isTamil ? 'முந்தைய வினாக்கள்' : 'PYQ Vault'}</div>
                <div className="text-[10px] text-white/50">{isTamil ? 'TRB 2012–2023' : 'Past Exams'}</div>
              </div>
            </button>

            <button
              onClick={() => handleSelectTab('flashcards')}
              className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition ${
                activeTab === 'flashcards' ? 'bg-[#c5a059]/15 border-[#c5a059]' : 'bg-white/[0.02] border-white/[0.08] hover:bg-white/[0.05]'
              }`}
            >
              <Sparkles className="w-4 h-4 text-amber-400 mt-0.5" />
              <div>
                <div className="text-xs font-bold text-white">{isTamil ? 'நினைவு அட்டைகள்' : 'Flashcards'}</div>
                <div className="text-[10px] text-white/50">{isTamil ? 'விரைவு மீள்பார்வை' : 'Rapid Revision'}</div>
              </div>
            </button>

            <button
              onClick={() => handleSelectTab('diagnostic')}
              className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition ${
                activeTab === 'diagnostic' ? 'bg-[#c5a059]/15 border-[#c5a059]' : 'bg-white/[0.02] border-white/[0.08] hover:bg-white/[0.05]'
              }`}
            >
              <TrendingUp className="w-4 h-4 text-indigo-400 mt-0.5" />
              <div>
                <div className="text-xs font-bold text-white">{isTamil ? 'குறை கண்டறிதல்' : 'Diagnostic'}</div>
                <div className="text-[10px] text-white/50">{isTamil ? 'திறன் மதிப்பீடு' : 'Baseline Test'}</div>
              </div>
            </button>

            <button
              onClick={() => handleSelectTab('srs_review')}
              className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition ${
                activeTab === 'srs_review' ? 'bg-[#c5a059]/15 border-[#c5a059]' : 'bg-white/[0.02] border-white/[0.08] hover:bg-white/[0.05]'
              }`}
            >
              <RotateCcw className="w-4 h-4 text-purple-400 mt-0.5" />
              <div>
                <div className="text-xs font-bold text-white">{isTamil ? 'SRS மறுபார்வை' : 'SRS Review'}</div>
                <div className="text-[10px] text-white/50">{isTamil ? 'மறதிக்கு முற்றுப்புள்ளி' : 'Spaced Repetition'}</div>
              </div>
            </button>

            <button
              onClick={() => handleSelectTab('syllabus')}
              className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition ${
                activeTab === 'syllabus' ? 'bg-[#c5a059]/15 border-[#c5a059]' : 'bg-white/[0.02] border-white/[0.08] hover:bg-white/[0.05]'
              }`}
            >
              <BookOpen className="w-4 h-4 text-[#c5a059] mt-0.5" />
              <div>
                <div className="text-xs font-bold text-white">{isTamil ? 'பாடத்திட்டம்' : 'Syllabus'}</div>
                <div className="text-[10px] text-white/50">{isTamil ? 'SCERT தலைப்புகள்' : 'Weightage Map'}</div>
              </div>
            </button>
          </div>
        </div>

        {/* Quick Utilities & Actions */}
        <div className="space-y-2 mb-5">
          {onOpenIntegrationsModal && (
            <button
              onClick={() => { triggerHaptic.light(); onClose(); onOpenIntegrationsModal(); }}
              className="w-full p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center gap-3 text-xs font-bold"
            >
              <Calendar className="w-4 h-4" />
              <span>{isTamil ? 'Google Calendar & OMR கருவிகள்' : 'Google Calendar & OMR Sheet'}</span>
            </button>
          )}

          {onOpenPDFExportModal && (
            <button
              onClick={() => { triggerHaptic.light(); onClose(); onOpenPDFExportModal(); }}
              className="w-full p-3 rounded-xl bg-[#c5a059]/10 border border-[#c5a059]/20 text-[#c5a059] flex items-center gap-3 text-xs font-bold"
            >
              <FileText className="w-4 h-4" />
              <span>{isTamil ? 'முன்னேற்ற PDF அறிக்கை பதிவிறக்கு' : 'Export Readiness PDF Dossier'}</span>
            </button>
          )}

          <button
            onClick={() => { triggerHaptic.light(); onClose(); onOpenProfile(); }}
            className="w-full p-3 rounded-xl bg-white/[0.03] border border-white/[0.08] text-white flex items-center justify-between text-xs font-bold"
          >
            <div className="flex items-center gap-3">
              <Settings className="w-4 h-4 text-white/60" />
              <span>{isTamil ? 'சுயவிவரம் & தேர்வு அமைப்புகள்' : 'Profile & Category Settings'}</span>
            </div>
          </button>
        </div>

        {/* Theme & Logout Footer */}
        <div className="pt-3 border-t border-white/[0.08] flex items-center justify-between">
          <button
            onClick={onToggleTheme}
            className="flex items-center gap-2 text-xs text-white/70 px-3 py-2 rounded-lg bg-white/[0.04]"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-[#c5a059]" /> : <Moon className="w-4 h-4 text-blue-400" />}
            <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
          </button>

          {onLogout && (
            <button
              onClick={() => { triggerHaptic.medium(); onClose(); onLogout(); }}
              className="flex items-center gap-1.5 text-xs font-bold text-red-400 px-3 py-2 rounded-lg hover:bg-red-950/30"
            >
              <LogOut className="w-4 h-4" />
              <span>{isTamil ? 'வெளியேறு' : 'Log Out'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
