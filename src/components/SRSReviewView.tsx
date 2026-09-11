import React, { useState, useMemo, useCallback } from 'react';
import {
  RotateCcw,
  CheckCircle2,
  XCircle,
  Clock,
  Brain,
  ChevronRight,
  Zap,
} from 'lucide-react';
import { LanguageMode, MistakeQueueItem } from '../types';
import {
  SRSItem,
  SRSDifficulty,
  createSRSItem,
  updateSRSItem,
  getDueItems,
  loadSRSItems,
  upsertSRSItem,
  calculateSRSStats,
  mapPerformanceToQuality,
  calculateDailyReviewCapacity,
} from '../services/srsService';

interface SRSReviewViewProps {
  languageMode: LanguageMode;
  mistakeQueue: MistakeQueueItem[];
  availableMinutes: number;
  onReviewComplete: (questionId: string, isCorrect: boolean) => void;
}

export const SRSReviewView: React.FC<SRSReviewViewProps> = ({
  languageMode,
  mistakeQueue,
  availableMinutes,
  onReviewComplete,
}) => {
  const isTamil = languageMode === 'tamil';
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [sessionStats, setSessionStats] = useState({ reviewed: 0, correct: 0 });

  // Get SRS items for all mistake queue items
  const srsItems = useMemo(() => {
    const existing = loadSRSItems();
    const existingMap = new Map(existing.map(i => [i.questionId, i]));

    return mistakeQueue.map(mq => {
      const existingSRS = existingMap.get(mq.question.id);
      return existingSRS || createSRSItem(mq.question.id, 'current_user', mq);
    });
  }, [mistakeQueue]);

  // Get items due for review
  const dueItems = useMemo(() => {
    const maxReview = calculateDailyReviewCapacity(availableMinutes);
    const due = getDueItems(srsItems, maxReview);
    // If no items are due, show all items sorted by next review
    return due.length > 0 ? due : srsItems.filter(s => !s.isGraduated).slice(0, maxReview);
  }, [srsItems, availableMinutes]);

  const currentSRS = dueItems[currentIndex];
  const currentMistake = mistakeQueue.find(mq => mq.question.id === currentSRS?.questionId);
  const stats = calculateSRSStats(srsItems);

  const handleAnswer = useCallback((isCorrect: boolean, timeSpentSec: number = 30) => {
    if (!currentSRS) return;

    const quality = mapPerformanceToQuality(isCorrect, timeSpentSec);
    const updated = updateSRSItem(currentSRS, quality);
    upsertSRSItem(updated);

    setSessionStats(prev => ({
      reviewed: prev.reviewed + 1,
      correct: prev.correct + (isCorrect ? 1 : 0),
    }));

    onReviewComplete(currentSRS.questionId, isCorrect);

    // Move to next
    if (currentIndex < dueItems.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setShowAnswer(false);
      setSelectedOption(null);
    } else {
      // Session complete
      setCurrentIndex(dueItems.length);
    }
  }, [currentSRS, currentIndex, dueItems.length, onReviewComplete]);

  const handleOptionSelect = (optIdx: number) => {
    setSelectedOption(optIdx);
    setShowAnswer(true);
  };

  const isCorrect = selectedOption !== null && currentMistake
    ? selectedOption === currentMistake.question.correctOptionIndex
    : false;

  // Session Complete Screen
  if (currentIndex >= dueItems.length && dueItems.length > 0) {
    const accuracy = sessionStats.reviewed > 0
      ? Math.round((sessionStats.correct / sessionStats.reviewed) * 100)
      : 0;

    return (
      <div className="max-w-2xl mx-auto space-y-6 pb-12">
        <div className="bg-[#121212] border border-[#262626] rounded-2xl p-8 text-center shadow-2xl">
          <div className="inline-flex p-3 rounded-2xl bg-[#c5a059]/15 text-[#c5a059] mb-4 border border-[#c5a059]/30">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-serif font-bold text-white mb-2">
            {isTamil ? 'மீள்பார்வை அமர்வு முடிந்தது!' : 'Review Session Complete!'}
          </h2>
          <div className="grid grid-cols-3 gap-4 max-w-sm mx-auto mt-6">
            <div className="p-3 rounded-xl bg-[#181818] border border-[#262626]">
              <div className="text-lg font-serif font-bold text-white">{sessionStats.reviewed}</div>
              <span className="text-[9px] text-[#8f8f8f]">{isTamil ? 'மீள்பார்வை' : 'Reviewed'}</span>
            </div>
            <div className="p-3 rounded-xl bg-[#181818] border border-[#262626]">
              <div className="text-lg font-serif font-bold text-[#4ade80]">{sessionStats.correct}</div>
              <span className="text-[9px] text-[#8f8f8f]">{isTamil ? 'சரி' : 'Correct'}</span>
            </div>
            <div className="p-3 rounded-xl bg-[#181818] border border-[#262626]">
              <div className="text-lg font-serif font-bold text-[#c5a059]">{accuracy}%</div>
              <span className="text-[9px] text-[#8f8f8f]">{isTamil ? 'திறன்' : 'Accuracy'}</span>
            </div>
          </div>
          <button
            onClick={() => {
              setCurrentIndex(0);
              setSessionStats({ reviewed: 0, correct: 0 });
              setShowAnswer(false);
              setSelectedOption(null);
            }}
            className="mt-6 px-6 py-2.5 rounded-xl bg-[#c5a059] hover:bg-[#d4b068] text-[#0a0a0a] font-bold text-xs shadow-lg shadow-[#c5a059]/20 transition"
          >
            {isTamil ? 'மீண்டும் பயிற்சி' : 'Review Again'}
          </button>
        </div>
      </div>
    );
  }

  // No items to review
  if (dueItems.length === 0) {
    return (
      <div className="max-w-2xl mx-auto space-y-6 pb-12">
        <div className="bg-[#121212] border border-[#262626] rounded-2xl p-8 text-center shadow-2xl">
          <div className="inline-flex p-3 rounded-2xl bg-[#22c55e]/15 text-[#4ade80] mb-4 border border-[#22c55e]/30">
            <Brain className="w-8 h-8" />
          </div>
          <h2 className="text-lg font-serif font-bold text-white mb-2">
            {isTamil ? 'மீள்பார்வை தேவையில்லை!' : 'No Reviews Due!'}
          </h2>
          <p className="text-xs text-[#a3a3a3]">
            {isTamil
              ? 'அனைத்து தவறுகளும் கற்றுக்கொள்ளப்பட்டன. அடுத்த மீள்பார்வைக்கு காத்திருங்கள்.'
              : 'All mistakes have been learned. Wait for the next review interval.'}
          </p>
        </div>
      </div>
    );
  }

  if (!currentSRS || !currentMistake) return null;

  const q = currentMistake.question;
  const nextReviewDays = currentSRS.interval || 1;

  return (
    <div className="max-w-4xl mx-auto space-y-5 pb-12">
      {/* Progress Header */}
      <div className="bg-[#121212] border border-[#262626] rounded-2xl p-4 shadow-xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <RotateCcw className="w-4 h-4 text-[#c5a059]" />
          <span className="text-xs font-bold text-white">
            {isTamil ? 'SRS மீள்பார்வை' : 'SRS Review'}
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-[10px] text-[#a3a3a3]">
            {currentIndex + 1}/{dueItems.length}
          </span>
          <div className="flex items-center gap-2 text-[10px]">
            <span className="text-[#4ade80]">{sessionStats.correct} ✓</span>
            <span className="text-[#fca5a5]">{sessionStats.reviewed - sessionStats.correct} ✗</span>
          </div>
        </div>
      </div>

      {/* SRS Info Bar */}
      <div className="flex items-center gap-3 px-1">
        <div className="flex items-center gap-1.5 text-[10px] text-[#8f8f8f]">
          <Clock className="w-3 h-3" />
          <span>
            {isTamil ? 'அடுத்த மீள்பார்வை' : 'Next Review'}: {nextReviewDays} {isTamil ? 'நாள்' : 'days'}
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] text-[#8f8f8f]">
          <Zap className="w-3 h-3" />
          <span>
            {isTamil ? 'திறன்' : 'Ease'}: {currentSRS.easeFactor.toFixed(1)}
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] text-[#8f8f8f]">
          <span>🔥 {currentSRS.currentStreak}</span>
        </div>
      </div>

      {/* Question Card */}
      <div className="bg-[#121212] border border-[#262626] rounded-2xl p-6 shadow-xl space-y-5">
        {/* Question */}
        <div className="space-y-2">
          {isTamil && (
            <p className="text-base font-bold text-white leading-relaxed">{q.questionTa}</p>
          )}
          {!isTamil && (
            <p className="text-base font-bold text-white leading-relaxed">{q.questionEn}</p>
          )}
          {languageMode === 'bilingual' && (
            <p className="text-sm text-[#a3a3a3] leading-relaxed">{q.questionEn}</p>
          )}
        </div>

        {/* Options */}
        <div className="space-y-2.5">
          {(isTamil ? q.optionsTa : q.optionsEn).map((opt, idx) => {
            const isSelected = selectedOption === idx;
            const isCorrectOption = idx === q.correctOptionIndex;
            const showCorrect = showAnswer && isCorrectOption;
            const showWrong = showAnswer && isSelected && !isCorrectOption;

            return (
              <button
                key={idx}
                onClick={() => !showAnswer && handleOptionSelect(idx)}
                disabled={showAnswer}
                className={`w-full text-left p-3.5 rounded-xl border transition flex items-start gap-3 ${
                  showCorrect
                    ? 'bg-[#052e16] border-[#22c55e] text-[#4ade80] ring-1 ring-[#22c55e]'
                    : showWrong
                    ? 'bg-[#450a0a] border-[#ef4444] text-[#fca5a5] ring-1 ring-[#ef4444]'
                    : isSelected
                    ? 'bg-[#c5a059]/10 border-[#c5a059] text-white ring-1 ring-[#c5a059]'
                    : 'bg-[#181818] border-[#262626] text-[#d4d4d4] hover:border-[#333]'
                }`}
              >
                <span className={`w-6 h-6 rounded-lg text-xs font-bold flex items-center justify-center shrink-0 mt-0.5 ${
                  showCorrect ? 'bg-[#22c55e]/20 text-[#4ade80]' :
                  showWrong ? 'bg-[#ef4444]/20 text-[#fca5a5]' :
                  'bg-[#262626] text-[#c5a059]'
                }`}>
                  {showCorrect ? '✓' : showWrong ? '✗' : String.fromCharCode(65 + idx)}
                </span>
                <span className="text-sm">{opt}</span>
              </button>
            );
          })}
        </div>

        {/* Explanation (shown after answer) */}
        {showAnswer && (
          <div className={`p-4 rounded-xl border ${isCorrect ? 'bg-[#052e16] border-[#22c55e]/30' : 'bg-[#450a0a] border-[#ef4444]/30'}`}>
            <div className="flex items-start gap-2">
              {isCorrect ? (
                <CheckCircle2 className="w-4 h-4 text-[#4ade80] mt-0.5 shrink-0" />
              ) : (
                <XCircle className="w-4 h-4 text-[#ef4444] mt-0.5 shrink-0" />
              )}
              <div className="text-xs leading-relaxed text-[#d4d4d4]">
                {isTamil ? q.explanationTa : q.explanationEn}
              </div>
            </div>

            {/* Quick Rating Buttons */}
            <div className="flex items-center gap-2 mt-3 pt-3 border-t border-white/10">
              <span className="text-[10px] text-[#a3a3a3]">
                {isTamil ? 'இது எவ்வளவு எளிதாக நினைவுகூர்ந்தீர்கள்?' : 'How easy was this to recall?'}
              </span>
              <div className="flex items-center gap-1 ml-auto">
                {([1, 2, 3, 4, 5] as SRSDifficulty[]).map(q => (
                  <button
                    key={q}
                    onClick={() => handleAnswer(isCorrect, q < 3 ? 60 : q < 4 ? 30 : 15)}
                    className={`w-7 h-7 rounded-lg text-[10px] font-bold transition ${
                      q <= 2
                        ? 'bg-[#ef4444]/20 text-[#fca5a5] hover:bg-[#ef4444]/40'
                        : q <= 3
                        ? 'bg-[#f59e0b]/20 text-[#fbbf24] hover:bg-[#f59e0b]/40'
                        : 'bg-[#22c55e]/20 text-[#4ade80] hover:bg-[#22c55e]/40'
                    }`}
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions (shown before answer) */}
        {!showAnswer && (
          <div className="flex items-center justify-between pt-3 border-t border-[#262626]">
            <button
              onClick={() => handleAnswer(false, 60)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#450a0a] border border-[#ef4444]/30 text-[#fca5a5] text-xs font-bold hover:bg-[#ef4444]/20 transition"
            >
              <XCircle className="w-3.5 h-3.5" />
              <span>{isTamil ? 'தெரியவில்லை' : "Didn't Know"}</span>
            </button>
            <button
              onClick={() => handleAnswer(true, 15)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#052e16] border border-[#22c55e]/30 text-[#4ade80] text-xs font-bold hover:bg-[#22c55e]/20 transition"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{isTamil ? 'தெரியும்' : 'Knew It'}</span>
            </button>
          </div>
        )}
      </div>

      {/* SRS Stats Summary */}
      <div className="bg-[#181818] border border-[#262626] rounded-xl p-4">
        <div className="flex items-center justify-between text-[10px] text-[#8f8f8f]">
          <span>
            {isTamil ? 'மொத்தம்' : 'Total'}: {stats.totalItems} | {isTamil ? 'மீள்பார்வை' : 'Due'}: {stats.dueForReview}
          </span>
          <span>
            {isTamil ? 'கற்றல்' : 'Learning'}: {stats.learning} | {isTamil ? 'தேர்ச்சி' : 'Mastered'}: {stats.mastered}
          </span>
          <span>{isTamil ? 'திறன்' : 'Retention'}: {stats.retentionRate}%</span>
        </div>
      </div>
    </div>
  );
};
