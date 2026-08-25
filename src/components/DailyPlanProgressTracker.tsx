import React from 'react';
import { DailySessionPlan } from '../types';
import { CheckCircle2, Clock } from 'lucide-react';

interface DailyPlanProgressTrackerProps {
  dailyPlan: DailySessionPlan;
  isTamil?: boolean;
  onStartDailyPlan?: () => void;
  compact?: boolean;
}

export const DailyPlanProgressTracker: React.FC<DailyPlanProgressTrackerProps> = ({
  dailyPlan,
  isTamil = false,
  onStartDailyPlan,
  compact = false,
}) => {
  const blocks = [
    { id: 'learn', nameEn: 'Learn', nameTa: 'கற்றல்', completed: dailyPlan.learnBlock.isCompleted, mins: dailyPlan.learnBlock.estimatedMinutes },
    { id: 'practice', nameEn: 'Practice', nameTa: 'பயிற்சி', completed: dailyPlan.practiceBlock.isCompleted, mins: dailyPlan.practiceBlock.estimatedMinutes },
    { id: 'review', nameEn: 'Review', nameTa: 'திருப்புதல்', completed: dailyPlan.reviewBlock.isCompleted, mins: dailyPlan.reviewBlock.estimatedMinutes },
    { id: 'check', nameEn: 'Check', nameTa: 'சரிபார்த்தல்', completed: dailyPlan.quickCheckBlock.isCompleted, mins: dailyPlan.quickCheckBlock.estimatedMinutes },
  ];

  const completedCount = blocks.filter(b => b.completed).length;
  const progressPercent = Math.round((completedCount / blocks.length) * 100);

  if (compact) {
    return (
      <div 
        onClick={onStartDailyPlan}
        className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-xs cursor-pointer transition select-none group"
        title="Today's 35m Study Plan Progress"
      >
        <Clock className="w-3.5 h-3.5 text-[#c5a059]" />
        <span className="text-[11px] font-medium text-white/80 group-hover:text-white hidden xl:inline">
          {isTamil ? 'இன்றைய இலக்கு:' : "Today's Target:"}
        </span>

        <div className="flex items-center gap-1">
          {blocks.map((b) => (
            <span
              key={b.id}
              className={`w-2 h-2 rounded-full transition ${
                b.completed ? 'bg-emerald-400' : 'bg-white/20'
              }`}
              title={`${isTamil ? b.nameTa : b.nameEn} (${b.mins}m)`}
            />
          ))}
        </div>

        <span className="font-mono text-[11px] font-bold text-[#c5a059]">
          {progressPercent}%
        </span>
      </div>
    );
  }

  return (
    <div className="bg-[#141414] border border-white/10 rounded-xl p-4 flex flex-col justify-between h-full">
      <div className="flex items-center justify-between gap-3 mb-2.5">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-bold tracking-wider text-white/50">
                {isTamil ? "இன்றைய முன்னேற்றம்" : "Today's Progress"}
              </span>
              <span className="text-[11px] text-emerald-400 font-medium">
                {completedCount}/4 {isTamil ? 'நிலைகள்' : 'Phases'}
              </span>
            </div>
            <p className="text-xs font-semibold text-white mt-0.5">
              {dailyPlan.availableMinutes} {isTamil ? 'நிமிட பயிற்சி இலக்கு' : 'Min Focused Loop'}
            </p>
          </div>
        </div>

        <span className="text-base font-mono font-bold text-[#c5a059]">
          {progressPercent}%
        </span>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden my-2">
        <div 
          className="bg-gradient-to-r from-[#c5a059] to-emerald-400 h-full rounded-full transition-all duration-500"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* 4 Block Indicators */}
      <div className="grid grid-cols-4 gap-1.5">
        {blocks.map((block, idx) => (
          <div
            key={block.id}
            className={`p-1.5 rounded-md border text-center transition ${
              block.completed
                ? 'bg-emerald-950/40 border-emerald-700/50 text-emerald-300'
                : 'bg-white/[0.02] border-white/[0.06] text-white/60'
            }`}
          >
            <div className="flex items-center justify-center gap-1 text-[10px] font-medium">
              {block.completed ? <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400" /> : null}
              <span>{isTamil ? block.nameTa : block.nameEn}</span>
            </div>
            <div className="text-[8px] text-white/40">{block.mins}m</div>
          </div>
        ))}
      </div>
    </div>
  );
};
