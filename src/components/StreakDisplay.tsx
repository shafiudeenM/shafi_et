import React, { useEffect, useState } from 'react';
import { Flame, Trophy, Target, Calendar, TrendingUp } from 'lucide-react';
import { LanguageMode } from '../types';
import {
  StreakData,
  loadStreakData,
  checkStreakStatus,
  getCurrentMilestone,
  getNextMilestone,
  getStreakHealth,
  STREAK_MILESTONES,
} from '../services/streakService';

interface StreakDisplayProps {
  languageMode: LanguageMode;
}

export const StreakDisplay: React.FC<StreakDisplayProps> = ({ languageMode }) => {
  const isTamil = languageMode === 'tamil';
  const [streakData, setStreakData] = useState<StreakData>(loadStreakData());

  useEffect(() => {
    const updated = checkStreakStatus();
    setStreakData(updated);
  }, []);

  const currentMilestone = getCurrentMilestone(streakData.currentStreak);
  const nextMilestone = getNextMilestone(streakData.currentStreak);
  const health = getStreakHealth(streakData);

  const healthColor = {
    excellent: 'text-[#4ade80]',
    good: 'text-[#c5a059]',
    warning: 'text-[#f59e0b]',
    critical: 'text-[#ef4444]',
  }[health.status];

  const healthBg = {
    excellent: 'bg-[#052e16] border-[#22c55e]/30',
    good: 'bg-[#422006] border-[#f59e0b]/30',
    warning: 'bg-[#422006] border-[#f59e0b]/30',
    critical: 'bg-[#450a0a] border-[#ef4444]/30',
  }[health.status];

  return (
    <div className="bg-[#121212] border border-[#262626] rounded-2xl p-5 shadow-xl">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-[#262626]">
        <Flame className="w-5 h-5 text-[#c5a059]" />
        <h3 className="text-sm font-serif font-bold text-white">
          {isTamil ? 'தினசரி தொடர் காட்டி' : 'Daily Streak'}
        </h3>
      </div>

      {/* Main Streak Display */}
      <div className="text-center mb-4">
        {currentMilestone && (
          <span className="text-3xl mb-2 block">{currentMilestone.icon}</span>
        )}
        <div className="text-4xl font-serif font-bold text-[#c5a059]">
          {streakData.currentStreak}
        </div>
        <span className="text-xs text-[#a3a3a3]">
          {isTamil ? 'நாள் தொடர்' : 'Day Streak'}
        </span>
        {currentMilestone && (
          <div className="mt-1">
            <span className="text-[10px] text-[#c5a059] font-bold">
              {isTamil ? currentMilestone.titleTa : currentMilestone.titleEn}
            </span>
          </div>
        )}
      </div>

      {/* Next Milestone */}
      {nextMilestone && (
        <div className="mb-4 p-3 rounded-xl bg-[#181818] border border-[#262626]">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] text-[#a3a3a3] font-bold uppercase tracking-wider">
              {isTamil ? 'அடுத்த மைல்கல்' : 'Next Milestone'}
            </span>
            <span className="text-[10px] text-[#c5a059] font-bold">
              {nextMilestone.days - streakData.currentStreak} {isTamil ? 'நாள் மீதம்' : 'days left'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-lg">{nextMilestone.icon}</span>
            <div>
              <span className="text-[10px] font-bold text-white block">
                {isTamil ? nextMilestone.titleTa : nextMilestone.titleEn}
              </span>
              <span className="text-[9px] text-[#737373]">
                {isTamil ? nextMilestone.descriptionTa : nextMilestone.descriptionEn}
              </span>
            </div>
          </div>
          {/* Progress bar to next milestone */}
          <div className="mt-2 h-1.5 bg-[#262626] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#c5a059] rounded-full transition-all duration-500"
              style={{
                width: `${Math.min(100, (streakData.currentStreak / nextMilestone.days) * 100)}%`,
              }}
            />
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        <div className="p-2.5 rounded-lg bg-[#181818] border border-[#262626]">
          <Trophy className="w-3.5 h-3.5 text-[#c5a059] mb-1" />
          <div className="text-sm font-serif font-bold text-white">{streakData.longestStreak}</div>
          <span className="text-[9px] text-[#737373]">{isTamil ? 'சிறந்த தொடர்' : 'Best Streak'}</span>
        </div>

        <div className="p-2.5 rounded-lg bg-[#181818] border border-[#262626]">
          <Calendar className="w-3.5 h-3.5 text-[#c5a059] mb-1" />
          <div className="text-sm font-serif font-bold text-white">{streakData.totalStudyDays}</div>
          <span className="text-[9px] text-[#737373]">{isTamil ? 'மொத்த நாள்' : 'Total Days'}</span>
        </div>

        <div className="p-2.5 rounded-lg bg-[#181818] border border-[#262626]">
          <Target className="w-3.5 h-3.5 text-[#c5a059] mb-1" />
          <div className="text-sm font-serif font-bold text-white">
            {streakData.weeklyActual}/{streakData.weeklyGoal}
          </div>
          <span className="text-[9px] text-[#737373]">{isTamil ? 'இந்த வாரம்' : 'This Week'}</span>
        </div>

        <div className="p-2.5 rounded-lg bg-[#181818] border border-[#262626]">
          <TrendingUp className="w-3.5 h-3.5 text-[#c5a059] mb-1" />
          <div className="text-sm font-serif font-bold text-white">
            {streakData.monthlyActual}/{streakData.monthlyGoal}
          </div>
          <span className="text-[9px] text-[#737373]">{isTamil ? 'இந்த மாதம்' : 'This Month'}</span>
        </div>
      </div>

      {/* Today's Activity */}
      <div className="p-3 rounded-xl bg-[#181818] border border-[#262626] mb-3">
        <span className="text-[10px] text-[#a3a3a3] font-bold uppercase tracking-wider">
          {isTamil ? 'இன்றைய செயல்பாடு' : "Today's Activity"}
        </span>
        <div className="flex items-center gap-4 mt-1.5">
          <div>
            <span className="text-sm font-bold text-white">{streakData.todayMinutes}</span>
            <span className="text-[9px] text-[#737373] ml-1">{isTamil ? 'நிமிடம்' : 'min'}</span>
          </div>
          <div>
            <span className="text-sm font-bold text-white">{streakData.todayQuestions}</span>
            <span className="text-[9px] text-[#737373] ml-1">{isTamil ? 'வினா' : 'Q'}</span>
          </div>
          <div>
            <span className="text-sm font-bold text-[#4ade80]">{streakData.todayCorrect}</span>
            <span className="text-[9px] text-[#737373] ml-1">{isTamil ? 'சரி' : 'correct'}</span>
          </div>
        </div>
      </div>

      {/* Health Status */}
      <div className={`p-3 rounded-xl ${healthBg} border`}>
        <p className={`text-[11px] font-semibold ${healthColor}`}>
          {isTamil ? health.messageTa : health.messageEn}
        </p>
      </div>

      {/* Milestone Timeline */}
      <div className="mt-4 pt-3 border-t border-[#262626]">
        <span className="text-[10px] text-[#a3a3a3] font-bold uppercase tracking-wider block mb-2">
          {isTamil ? 'மைல்கல் காலவரிசை' : 'Milestone Timeline'}
        </span>
        <div className="flex items-center gap-1 overflow-x-auto pb-1">
          {STREAK_MILESTONES.map(m => {
            const achieved = streakData.currentStreak >= m.days;
            const isCurrent = getCurrentMilestone(streakData.currentStreak)?.days === m.days;
            return (
              <div
                key={m.days}
                className={`flex flex-col items-center p-1.5 rounded-lg min-w-[44px] ${
                  isCurrent ? 'bg-[#c5a059]/15 border border-[#c5a059]/40' :
                  achieved ? 'bg-[#052e16] border border-[#22c55e]/30' :
                  'bg-[#181818] border border-[#262626]'
                }`}
              >
                <span className="text-sm">{m.icon}</span>
                <span className={`text-[8px] font-bold ${achieved ? 'text-[#4ade80]' : 'text-[#737373]'}`}>
                  {m.days}d
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
