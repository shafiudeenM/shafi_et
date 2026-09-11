import React, { useMemo } from 'react';
import { Target, TrendingUp, TrendingDown, AlertTriangle, CheckCircle2, BarChart3 } from 'lucide-react';
import { LanguageMode, ReservationCategory, TopicMastery, PaperType } from '../types';
import { generateMarkBudget, getPriorityColor, getPriorityLabelTa, MarkBudgetPlan } from '../services/markBudgetService';

interface MarkBudgetViewProps {
  languageMode: LanguageMode;
  category: ReservationCategory;
  selectedPaper: PaperType;
  topicMasteries: TopicMastery[];
}

export const MarkBudgetView: React.FC<MarkBudgetViewProps> = ({
  languageMode,
  category,
  selectedPaper,
  topicMasteries,
}) => {
  const isTamil = languageMode === 'tamil';

  const plan: MarkBudgetPlan = useMemo(
    () => generateMarkBudget(category, selectedPaper, topicMasteries),
    [category, selectedPaper, topicMasteries]
  );

  const getMarginColor = (margin: number) => {
    if (margin >= 15) return 'text-[#4ade80]';
    if (margin >= 0) return 'text-[#c5a059]';
    return 'text-[#fca5a5]';
  };

  return (
    <div className="max-w-4xl mx-auto space-y-5 pb-12">
      {/* Header Card */}
      <div className="bg-[#121212] border border-[#262626] rounded-2xl p-6 shadow-xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 rounded-xl bg-[#c5a059]/15 text-[#c5a059] border border-[#c5a059]/30">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-serif font-bold text-white">
              {isTamil ? 'மதிப்பெண் இலக்கு திட்டம்' : 'Mark Budget Planner'}
            </h2>
            <p className="text-[10px] text-[#a3a3a3]">
              {isTamil ? 'பாட வாரியான இலக்குகள் மற்றும் தகுதி மதிப்பெண் பகுப்பாய்வு' : 'Subject-wise targets & qualifying score analysis'}
            </p>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-xl bg-[#181818] border border-[#262626]">
            <span className="text-[9px] text-[#a3a3a3] font-bold uppercase tracking-wider">
              {isTamil ? 'தகுதி மதிப்பெண்' : 'Qualifying Score'}
            </span>
            <div className="text-lg font-serif font-bold text-[#c5a059] mt-0.5">
              {plan.qualifyingScore}/150
            </div>
            <span className="text-[10px] text-[#8f8f8f]">{plan.qualifyingPercent}%</span>
          </div>

          <div className="p-3.5 rounded-xl bg-[#181818] border border-[#262626]">
            <span className="text-[9px] text-[#a3a3a3] font-bold uppercase tracking-wider">
              {isTamil ? 'மதிப்பிடப்பட்ட மதிப்பெண்' : 'Projected Score'}
            </span>
            <div className={`text-lg font-serif font-bold mt-0.5 ${getMarginColor(plan.margin)}`}>
              {plan.currentProjected}/150
            </div>
            <span className="text-[10px] text-[#8f8f8f]">
              {plan.margin >= 0 ? '+' : ''}{plan.margin} {isTamil ? 'மதிப்பு வித்தியாசம்' : 'margin'}
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-[#181818] border border-[#262626]">
            <span className="text-[9px] text-[#a3a3a3] font-bold uppercase tracking-wider">
              {isTamil ? 'கவனம் செலுத்த வேண்டியது' : 'Needs Focus'}
            </span>
            <div className="text-lg font-serif font-bold text-[#ef4444] mt-0.5">
              {plan.subjectBudgets.filter(b => b.priority === 'focus').length}
            </div>
            <span className="text-[10px] text-[#8f8f8f]">
              {isTamil ? 'பாடங்கள்' : 'subjects'}
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-[#181818] border border-[#262626]">
            <span className="text-[9px] text-[#a3a3a3] font-bold uppercase tracking-wider">
              {isTamil ? 'திட்டம்' : 'Plan Status'}
            </span>
            <div className={`text-lg font-serif font-bold mt-0.5 ${plan.margin >= 0 ? 'text-[#4ade80]' : 'text-[#fca5a5]'}`}>
              {plan.margin >= 0
                ? (isTamil ? 'பாதையில்' : 'On Track')
                : (isTamil ? 'ஆபத்து' : 'At Risk')
              }
            </div>
            <span className="text-[10px] text-[#8f8f8f]">
              {isTamil ? 'தற்போதைய நிலை' : 'Current Status'}
            </span>
          </div>
        </div>
      </div>

      {/* Overall Strategy */}
      <div className={`p-4 rounded-xl border ${
        plan.margin >= 15 ? 'bg-[#052e16] border-[#22c55e]/30' :
        plan.margin >= 0 ? 'bg-[#422006] border-[#f59e0b]/30' :
        'bg-[#450a0a] border-[#ef4444]/30'
      }`}>
        <div className="flex items-start gap-2">
          {plan.margin >= 15 ? (
            <CheckCircle2 className="w-4 h-4 text-[#4ade80] mt-0.5 shrink-0" />
          ) : plan.margin >= 0 ? (
            <TrendingUp className="w-4 h-4 text-[#f59e0b] mt-0.5 shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-[#ef4444] mt-0.5 shrink-0" />
          )}
          <p className="text-xs leading-relaxed text-[#d4d4d4]">
            {isTamil ? plan.overallStrategyTa : plan.overallStrategyEn}
          </p>
        </div>
      </div>

      {/* Subject Budget Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {plan.subjectBudgets.map(budget => (
          <div
            key={budget.subjectId}
            className="bg-[#121212] border border-[#262626] rounded-2xl p-5 shadow-xl"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: getPriorityColor(budget.priority) }} />
                <h4 className="text-xs font-serif font-bold text-white">
                  {isTamil ? budget.nameTa : budget.nameEn}
                </h4>
              </div>
              <span
                className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
                style={{
                  backgroundColor: `${getPriorityColor(budget.priority)}20`,
                  color: getPriorityColor(budget.priority),
                }}
              >
                {isTamil ? getPriorityLabelTa(budget.priority) : budget.priority.toUpperCase()}
              </span>
            </div>

            {/* Progress Bar */}
            <div className="mb-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[9px] text-[#a3a3a3]">
                  {isTamil ? 'மதிப்பிடப்பட்டது' : 'Estimated'}
                </span>
                <span className="text-[9px] text-[#a3a3a3]">
                  {budget.estimatedMarks}/{budget.maxMarks} {isTamil ? 'மதிப்பு' : 'marks'}
                </span>
              </div>
              <div className="h-2 bg-[#262626] rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min(100, (budget.estimatedMarks / budget.maxMarks) * 100)}%`,
                    backgroundColor: getPriorityColor(budget.priority),
                  }}
                />
              </div>
            </div>

            {/* Target Line */}
            <div className="flex items-center justify-between mb-2">
              <span className="text-[9px] text-[#8f8f8f]">
                {isTamil ? 'இலக்கு' : 'Target'}: {budget.targetMarks}/{budget.maxMarks}
              </span>
              <span className={`text-[9px] font-bold ${budget.gap <= 0 ? 'text-[#4ade80]' : 'text-[#fca5a5]'}`}>
                {budget.gap <= 0 ? (isTamil ? 'இலக்கு எட்டப்பட்டது' : 'Target Met') : `${budget.gap} ${isTamil ? 'மதிப்பு தேவை' : 'marks gap'}`}
              </span>
            </div>

            {/* Strategy */}
            <p className="text-[10px] text-[#a3a3a3] leading-relaxed">
              {isTamil ? budget.strategyTa : budget.strategyEn}
            </p>

            {/* Mastery Badge */}
            <div className="mt-3 flex items-center gap-2">
              <BarChart3 className="w-3 h-3 text-[#8f8f8f]" />
              <span className="text-[9px] text-[#8f8f8f]">
                {isTamil ? 'தற்போதைய திறன்' : 'Current Mastery'}: {budget.currentMastery}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
