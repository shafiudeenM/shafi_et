import React from 'react';
import { 
  Home, 
  BookOpen, 
  Target, 
  ShieldAlert, 
  MoreHorizontal,
  Zap,
  Layers,
  Sparkles
} from 'lucide-react';
import { triggerHaptic } from '../services/nativeMobileService';

export type MobileTabGroup = 'home' | 'practice' | 'exam' | 'vault' | 'more';

interface MobileBottomNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenMoreSheet: () => void;
  isTamil: boolean;
  mistakeCount?: number;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  setActiveTab,
  onOpenMoreSheet,
  isTamil,
  mistakeCount = 0,
}) => {
  // Determine which group is currently active
  const getActiveGroup = (): MobileTabGroup => {
    if (activeTab === 'dashboard' || activeTab === 'daily_plan') return 'home';
    if (activeTab === 'practice' || activeTab === 'flashcards' || activeTab === 'pyq') return 'practice';
    if (activeTab === 'simulator' || activeTab === 'diagnostic') return 'exam';
    if (activeTab === 'mistakes' || activeTab === 'srs_review' || activeTab === 'mark_budget') return 'vault';
    return 'more';
  };

  const currentGroup = getActiveGroup();

  const handleTabClick = (tabId: string) => {
    triggerHaptic.light();
    setActiveTab(tabId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleMoreClick = () => {
    triggerHaptic.light();
    onOpenMoreSheet();
  };

  return (
    <nav 
      aria-label="Mobile Navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#0e0e0e]/95 backdrop-blur-xl border-t border-white/[0.08] shadow-[0_-8px_30px_rgba(0,0,0,0.6)]"
      style={{ paddingBottom: 'max(8px, env(safe-area-inset-bottom, 8px))' }}
    >
      <div className="flex items-center justify-around px-2 pt-1.5 pb-0.5">
        {/* 1. Home / Daily Plan */}
        <button
          id="mobile-nav-home"
          onClick={() => handleTabClick('dashboard')}
          className={`flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-xl transition-all duration-150 relative ${
            currentGroup === 'home'
              ? 'text-[#c5a059]'
              : 'text-white/40 hover:text-white/70'
          }`}
        >
          <div className={`p-1 rounded-lg transition-transform ${currentGroup === 'home' ? 'scale-110 bg-[#c5a059]/15' : ''}`}>
            <Home className="w-5 h-5" />
          </div>
          <span className="text-[10px] font-semibold tracking-tight mt-0.5">
            {isTamil ? 'முகப்பு' : 'Home'}
          </span>
          {currentGroup === 'home' && (
            <span className="w-1 h-1 rounded-full bg-[#c5a059] absolute bottom-0" />
          )}
        </button>

        {/* 2. Practice (Question Bank & Flashcards) */}
        <button
          id="mobile-nav-practice"
          onClick={() => handleTabClick(activeTab === 'flashcards' || activeTab === 'pyq' ? activeTab : 'practice')}
          className={`flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-xl transition-all duration-150 relative ${
            currentGroup === 'practice'
              ? 'text-[#c5a059]'
              : 'text-white/40 hover:text-white/70'
          }`}
        >
          <div className={`p-1 rounded-lg transition-transform ${currentGroup === 'practice' ? 'scale-110 bg-[#c5a059]/15' : ''}`}>
            <BookOpen className="w-5 h-5" />
          </div>
          <span className="text-[10px] font-semibold tracking-tight mt-0.5">
            {isTamil ? 'பயிற்சி' : 'Practice'}
          </span>
          {currentGroup === 'practice' && (
            <span className="w-1 h-1 rounded-full bg-[#c5a059] absolute bottom-0" />
          )}
        </button>

        {/* 3. Center Highlight: Mock Exam / Simulator */}
        <button
          id="mobile-nav-exam"
          onClick={() => handleTabClick('simulator')}
          className="flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-xl -mt-3 group"
        >
          <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shadow-lg transition-all duration-200 border ${
            currentGroup === 'exam'
              ? 'bg-gradient-to-tr from-[#c5a059] to-[#dfb86c] text-black border-[#f5d485] shadow-[#c5a059]/30 scale-105'
              : 'bg-[#1a1a1a] text-[#c5a059] border-[#c5a059]/40 hover:border-[#c5a059]'
          }`}>
            <Target className="w-5 h-5" />
          </div>
          <span className={`text-[10px] font-bold tracking-tight mt-1 ${
            currentGroup === 'exam' ? 'text-[#c5a059]' : 'text-white/50'
          }`}>
            {isTamil ? 'தேர்வு' : '150Q Test'}
          </span>
        </button>

        {/* 4. Vault / Mistakes Queue */}
        <button
          id="mobile-nav-vault"
          onClick={() => handleTabClick('mistakes')}
          className={`flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-xl transition-all duration-150 relative ${
            currentGroup === 'vault'
              ? 'text-[#c5a059]'
              : 'text-white/40 hover:text-white/70'
          }`}
        >
          <div className={`p-1 rounded-lg transition-transform relative ${currentGroup === 'vault' ? 'scale-110 bg-[#c5a059]/15' : ''}`}>
            <ShieldAlert className="w-5 h-5" />
            {mistakeCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-amber-500 text-black text-[9px] font-black flex items-center justify-center shadow">
                {mistakeCount > 99 ? '99+' : mistakeCount}
              </span>
            )}
          </div>
          <span className="text-[10px] font-semibold tracking-tight mt-0.5">
            {isTamil ? 'பிழைகள்' : 'Vault'}
          </span>
          {currentGroup === 'vault' && (
            <span className="w-1 h-1 rounded-full bg-[#c5a059] absolute bottom-0" />
          )}
        </button>

        {/* 5. More (All features sheet) */}
        <button
          id="mobile-nav-more"
          onClick={handleMoreClick}
          className={`flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-xl transition-all duration-150 relative ${
            currentGroup === 'more'
              ? 'text-[#c5a059]'
              : 'text-white/40 hover:text-white/70'
          }`}
        >
          <div className={`p-1 rounded-lg transition-transform ${currentGroup === 'more' ? 'scale-110 bg-[#c5a059]/15' : ''}`}>
            <MoreHorizontal className="w-5 h-5" />
          </div>
          <span className="text-[10px] font-semibold tracking-tight mt-0.5">
            {isTamil ? 'கூடுதல்' : 'More'}
          </span>
          {currentGroup === 'more' && (
            <span className="w-1 h-1 rounded-full bg-[#c5a059] absolute bottom-0" />
          )}
        </button>
      </div>
    </nav>
  );
};
