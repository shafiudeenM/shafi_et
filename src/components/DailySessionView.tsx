import React, { useState } from 'react';
import { 
  DailySessionPlan, 
  Question, 
  LanguageMode, 
  UserInteraction 
} from '../types';
import { ALL_QUESTIONS } from '../data/tntetData';
import { 
  BookOpen, 
  CheckCircle2, 
  Clock, 
  ArrowRight, 
  Brain, 
  Sparkles, 
  RotateCcw, 
  Flame, 
  Target,
  Award
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface DailySessionViewProps {
  plan: DailySessionPlan;
  languageMode: LanguageMode;
  onUpdatePlan: (updatedPlan: DailySessionPlan) => void;
  onOpenAITutor: (topicName: string) => void;
}

export const DailySessionView: React.FC<DailySessionViewProps> = ({
  plan,
  languageMode,
  onUpdatePlan,
  onOpenAITutor,
}) => {
  const isTamil = languageMode === 'tamil';

  const [activeBlock, setActiveBlock] = useState<'learn' | 'practice' | 'review' | 'quickCheck'>('learn');

  // Practice state
  const [practiceQIndex, setPracticeQIndex] = useState(0);
  const [practiceSelected, setPracticeSelected] = useState<number | null>(null);
  const [practiceSubmitted, setPracticeSubmitted] = useState(false);
  const [practiceCorrectCount, setPracticeCorrectCount] = useState(0);

  // Review state
  const [reviewQIndex, setReviewQIndex] = useState(0);
  const [reviewSelected, setReviewSelected] = useState<number | null>(null);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  // Quick check state
  const [checkQIndex, setCheckQIndex] = useState(0);
  const [checkSelected, setCheckSelected] = useState<number | null>(null);
  const [checkSubmitted, setCheckSubmitted] = useState(false);
  const [checkCorrectCount, setCheckCorrectCount] = useState(0);

  const practiceQuestions = ALL_QUESTIONS.filter((q) => q.topicId === plan.targetTopicId).concat(ALL_QUESTIONS).slice(0, 10);
  const reviewQuestions = ALL_QUESTIONS.slice(0, 3);
  const checkQuestions = ALL_QUESTIONS.slice(3, 8);

  const handleCompleteLearn = () => {
    const updated = {
      ...plan,
      learnBlock: { ...plan.learnBlock, isCompleted: true },
    };
    onUpdatePlan(updated);
    setActiveBlock('practice');
  };

  const handlePracticeConfirm = () => {
    if (practiceSelected === null) return;
    const currentQ = practiceQuestions[practiceQIndex];
    if (practiceSelected === currentQ.correctOptionIndex) {
      setPracticeCorrectCount((prev) => prev + 1);
    }
    setPracticeSubmitted(true);
  };

  const handlePracticeNext = () => {
    setPracticeSubmitted(false);
    setPracticeSelected(null);
    if (practiceQIndex + 1 < practiceQuestions.length) {
      setPracticeQIndex((prev) => prev + 1);
    } else {
      const updated = {
        ...plan,
        practiceBlock: { ...plan.practiceBlock, isCompleted: true, completedCount: practiceQuestions.length },
      };
      onUpdatePlan(updated);
      setActiveBlock('review');
    }
  };

  const handleReviewConfirm = () => {
    if (reviewSelected === null) return;
    setReviewSubmitted(true);
  };

  const handleReviewNext = () => {
    setReviewSubmitted(false);
    setReviewSelected(null);
    if (reviewQIndex + 1 < reviewQuestions.length) {
      setReviewQIndex((prev) => prev + 1);
    } else {
      const updated = {
        ...plan,
        reviewBlock: { ...plan.reviewBlock, isCompleted: true },
      };
      onUpdatePlan(updated);
      setActiveBlock('quickCheck');
    }
  };

  const handleCheckConfirm = () => {
    if (checkSelected === null) return;
    const currentQ = checkQuestions[checkQIndex];
    if (checkSelected === currentQ.correctOptionIndex) {
      setCheckCorrectCount((prev) => prev + 1);
    }
    setCheckSubmitted(true);
  };

  const handleCheckNext = () => {
    setCheckSubmitted(false);
    setCheckSelected(null);
    if (checkQIndex + 1 < checkQuestions.length) {
      setCheckQIndex((prev) => prev + 1);
    } else {
      const updated = {
        ...plan,
        quickCheckBlock: { ...plan.quickCheckBlock, isCompleted: true },
        overallCompleted: true,
      };
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.5 } });
      onUpdatePlan(updated);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Session Top Card */}
      <div className="bg-[#121212] border border-[#262626] rounded-2xl p-6 sm:p-7 text-white shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#c5a059]/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] px-3 py-1 rounded-full bg-[#c5a059]/15 text-[#c5a059] border border-[#c5a059]/30">
                {plan.availableMinutes} {isTamil ? 'நிமிட தினசரி அமர்வு' : 'Min Daily Session'}
              </span>
              <span className="text-xs text-[#a3a3a3] font-medium">{plan.date}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white mt-2 tracking-tight">
              {isTamil ? plan.targetTopicNameTa : plan.targetTopicNameEn}
            </h1>
            <p className="text-xs sm:text-sm text-[#a3a3a3] mt-1.5 max-w-2xl leading-relaxed">
              {isTamil ? plan.whyChosenReasonTa : plan.whyChosenReasonEn}
            </p>
          </div>

          <button
            onClick={() => onOpenAITutor(plan.targetTopicNameEn)}
            className="px-4 py-2.5 rounded-xl bg-[#1f1f1f] hover:bg-[#262626] text-[#c5a059] border border-[#c5a059]/30 hover:border-[#c5a059] font-bold text-xs flex items-center gap-2 self-start sm:self-center transition shadow-lg shrink-0"
          >
            <Brain className="w-4 h-4 text-[#c5a059]" />
            <span>{isTamil ? 'AI ஆசிரியரிடம் பேசு' : 'Consult AI Tutor'}</span>
          </button>
        </div>

        {/* 4 Block Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-7">
          <button
            onClick={() => setActiveBlock('learn')}
            className={`p-3.5 rounded-xl text-left border transition ${
              activeBlock === 'learn'
                ? 'bg-[#c5a059] text-[#0a0a0a] font-bold border-[#c5a059] shadow-lg shadow-[#c5a059]/20'
                : plan.learnBlock.isCompleted
                ? 'bg-[#052e16]/60 text-[#4ade80] border-[#22c55e]/40'
                : 'bg-[#181818] text-[#a3a3a3] border-[#262626] hover:border-[#333333] hover:text-white'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold">1. {isTamil ? 'கற்றல்' : 'Learn'}</span>
              {plan.learnBlock.isCompleted && <CheckCircle2 className="w-3.5 h-3.5" />}
            </div>
            <span className="text-[11px] opacity-80 mt-0.5 block">{plan.learnBlock.estimatedMinutes}m · Concept Grounding</span>
          </button>

          <button
            onClick={() => setActiveBlock('practice')}
            className={`p-3.5 rounded-xl text-left border transition ${
              activeBlock === 'practice'
                ? 'bg-[#c5a059] text-[#0a0a0a] font-bold border-[#c5a059] shadow-lg shadow-[#c5a059]/20'
                : plan.practiceBlock.isCompleted
                ? 'bg-[#052e16]/60 text-[#4ade80] border-[#22c55e]/40'
                : 'bg-[#181818] text-[#a3a3a3] border-[#262626] hover:border-[#333333] hover:text-white'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold">2. {isTamil ? 'பயிற்சி' : 'Practice'}</span>
              {plan.practiceBlock.isCompleted && <CheckCircle2 className="w-3.5 h-3.5" />}
            </div>
            <span className="text-[11px] opacity-80 mt-0.5 block">{plan.practiceBlock.estimatedMinutes}m · 10 Qs</span>
          </button>

          <button
            onClick={() => setActiveBlock('review')}
            className={`p-3.5 rounded-xl text-left border transition ${
              activeBlock === 'review'
                ? 'bg-[#c5a059] text-[#0a0a0a] font-bold border-[#c5a059] shadow-lg shadow-[#c5a059]/20'
                : plan.reviewBlock.isCompleted
                ? 'bg-[#052e16]/60 text-[#4ade80] border-[#22c55e]/40'
                : 'bg-[#181818] text-[#a3a3a3] border-[#262626] hover:border-[#333333] hover:text-white'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold">3. {isTamil ? 'திருப்புதல்' : 'Review'}</span>
              {plan.reviewBlock.isCompleted && <CheckCircle2 className="w-3.5 h-3.5" />}
            </div>
            <span className="text-[11px] opacity-80 mt-0.5 block">{plan.reviewBlock.estimatedMinutes}m · 3 Errors</span>
          </button>

          <button
            onClick={() => setActiveBlock('quickCheck')}
            className={`p-3.5 rounded-xl text-left border transition ${
              activeBlock === 'quickCheck'
                ? 'bg-[#c5a059] text-[#0a0a0a] font-bold border-[#c5a059] shadow-lg shadow-[#c5a059]/20'
                : plan.quickCheckBlock.isCompleted
                ? 'bg-[#052e16]/60 text-[#4ade80] border-[#22c55e]/40'
                : 'bg-[#181818] text-[#a3a3a3] border-[#262626] hover:border-[#333333] hover:text-white'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold">4. {isTamil ? 'உறுதி செய்தல்' : 'Check'}</span>
              {plan.quickCheckBlock.isCompleted && <CheckCircle2 className="w-3.5 h-3.5" />}
            </div>
            <span className="text-[11px] opacity-80 mt-0.5 block">{plan.quickCheckBlock.estimatedMinutes}m · 5 Qs</span>
          </button>
        </div>
      </div>

      {/* BLOCK 1: LEARN CONCEPT */}
      {activeBlock === 'learn' && (
        <div className="bg-[#121212] border border-[#262626] rounded-2xl p-6 sm:p-7 shadow-xl space-y-6">
          <div className="flex items-center justify-between border-b border-[#262626] pb-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#c5a059]">
                Block 1: 12-Minute Concept Grounding
              </span>
              <h2 className="text-xl font-serif font-bold text-white mt-1">
                {isTamil ? plan.learnBlock.conceptTitleTa : plan.learnBlock.conceptTitleEn}
              </h2>
            </div>
            <span className="px-3 py-1 rounded-full bg-[#181818] border border-[#333333] text-xs font-mono font-bold text-[#c5a059]">
              ~12 mins
            </span>
          </div>

          <div className="space-y-4">
            <div className="p-5 rounded-xl bg-[#181818] border border-[#262626]">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#c5a059] mb-3 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{isTamil ? 'முக்கிய அடிப்படைக் குறிப்புகள் (SCERT பாடநூல் படி):' : 'Key Pedagogical Takeaways (SCERT Standards):'}</span>
              </h3>
              <ul className="space-y-2.5 text-xs sm:text-sm text-[#d4d4d4] list-disc list-inside leading-relaxed">
                {(isTamil ? plan.learnBlock.conceptKeyPointsTa : plan.learnBlock.conceptKeyPointsEn).map((pt, i) => (
                  <li key={i}>{pt}</li>
                ))}
              </ul>
            </div>

            <div className="p-5 rounded-xl bg-[#181818] border border-[#262626]">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-2">
                {isTamil ? 'கலைச்சொல் துல்லியம் (Official Terminology):' : 'Official Terminology Notes:'}
              </h4>
              <p className="text-xs sm:text-sm text-[#a3a3a3] leading-relaxed">
                {isTamil ? plan.learnBlock.officialTerminologyNotesTa : plan.learnBlock.officialTerminologyNotesEn}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-[#262626]">
            <button
              onClick={() => onOpenAITutor(plan.targetTopicNameEn)}
              className="text-xs font-bold text-[#c5a059] hover:underline flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isTamil ? 'AI ஆசிரியரிடம் சந்தேகங்களை கேளுங்கள்' : 'Deep-Dive with AI Tutor'}</span>
            </button>

            <button
              onClick={handleCompleteLearn}
              className="px-6 py-3 rounded-xl bg-[#c5a059] hover:bg-[#d4b068] text-[#0a0a0a] font-bold text-xs shadow-lg shadow-[#c5a059]/20 transition flex items-center gap-2"
            >
              <span>{isTamil ? 'புரிந்தது, பயிற்சிக்கு செல்' : 'Understood, Proceed to Practice (15m)'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* BLOCK 2: PRACTICE (10 Questions) */}
      {activeBlock === 'practice' && (
        <div className="bg-[#121212] border border-[#262626] rounded-2xl p-6 sm:p-7 shadow-xl space-y-6">
          <div className="flex items-center justify-between border-b border-[#262626] pb-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#c5a059]">
                Block 2: Adaptive Practice
              </span>
              <h2 className="text-xl font-serif font-bold text-white mt-1">
                {isTamil ? 'இலக்கு சார்ந்த பயிற்சி வினாக்கள்' : 'Targeted Concept Application'}
              </h2>
            </div>
            <span className="text-xs font-mono font-bold text-[#c5a059] px-3 py-1 rounded-full bg-[#181818] border border-[#333333]">
              {practiceQIndex + 1} / {practiceQuestions.length}
            </span>
          </div>

          {practiceQuestions[practiceQIndex] && (
            <div className="space-y-5">
              <div className="space-y-2">
                {languageMode !== 'english' && (
                  <p className="text-base sm:text-lg font-bold text-white leading-relaxed">
                    {practiceQuestions[practiceQIndex].questionTa}
                  </p>
                )}
                {languageMode !== 'tamil' && (
                  <p className="text-sm sm:text-base text-[#a3a3a3] leading-relaxed">
                    {practiceQuestions[practiceQIndex].questionEn}
                  </p>
                )}
              </div>

              <div className="space-y-3">
                {practiceQuestions[practiceQIndex].optionsEn.map((optEn, idx) => {
                  const optTa = practiceQuestions[practiceQIndex].optionsTa[idx];
                  const isSelected = practiceSelected === idx;
                  const isCorrect = idx === practiceQuestions[practiceQIndex].correctOptionIndex;

                  let style = 'border-[#262626] bg-[#181818] text-[#d4d4d4] hover:border-[#333333]';
                  if (practiceSubmitted) {
                    if (isCorrect) style = 'border-[#22c55e] bg-[#052e16]/60 text-[#4ade80] font-bold';
                    else if (isSelected) style = 'border-[#ef4444] bg-[#450a0a]/60 text-[#fca5a5]';
                  } else if (isSelected) {
                    style = 'border-[#c5a059] bg-[#c5a059]/10 text-white ring-1 ring-[#c5a059] font-bold';
                  }

                  return (
                    <button
                      key={idx}
                      disabled={practiceSubmitted}
                      onClick={() => setPracticeSelected(idx)}
                      className={`w-full text-left p-3.5 rounded-xl border transition flex items-center justify-between ${style}`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-lg bg-[#262626] text-xs font-bold text-[#c5a059] flex items-center justify-center shrink-0">
                          {String.fromCharCode(65 + idx)}
                        </span>
                        <span className="text-xs sm:text-sm font-medium">{isTamil ? optTa : optEn}</span>
                      </div>
                      {practiceSubmitted && isCorrect && <CheckCircle2 className="w-4 h-4 text-[#22c55e]" />}
                    </button>
                  );
                })}
              </div>

              {practiceSubmitted && (
                <div className="p-4 rounded-xl bg-[#181818] border border-[#262626] text-xs space-y-2">
                  <span className="font-bold text-[#c5a059] uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                    <Brain className="w-3.5 h-3.5" />
                    <span>{isTamil ? 'விளக்கம்:' : 'Concept Solution:'}</span>
                  </span>
                  <p className="text-[#d4d4d4] leading-relaxed">
                    {isTamil ? practiceQuestions[practiceQIndex].explanationTa : practiceQuestions[practiceQIndex].explanationEn}
                  </p>
                </div>
              )}

              <div className="flex justify-end pt-3">
                {!practiceSubmitted ? (
                  <button
                    disabled={practiceSelected === null}
                    onClick={handlePracticeConfirm}
                    className="px-6 py-2.5 rounded-xl bg-[#c5a059] hover:bg-[#d4b068] text-[#0a0a0a] font-bold text-xs shadow-lg shadow-[#c5a059]/20 transition disabled:opacity-40"
                  >
                    {isTamil ? 'விடையை சரிபார்' : 'Check Answer'}
                  </button>
                ) : (
                  <button
                    onClick={handlePracticeNext}
                    className="px-6 py-2.5 rounded-xl bg-[#c5a059] hover:bg-[#d4b068] text-[#0a0a0a] font-bold text-xs shadow-lg shadow-[#c5a059]/20 transition flex items-center gap-2"
                  >
                    <span>{practiceQIndex + 1 === practiceQuestions.length ? (isTamil ? 'அடுத்த பகுதிக்கு செல்' : 'Proceed to Mistake Review') : (isTamil ? 'அடுத்த வினா' : 'Next Question')}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* BLOCK 3: REVIEW PAST MISTAKES */}
      {activeBlock === 'review' && (
        <div className="bg-[#121212] border border-[#262626] rounded-2xl p-6 sm:p-7 shadow-xl space-y-6">
          <div className="flex items-center justify-between border-b border-[#262626] pb-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#ef4444]">
                Block 3: 5-Minute Mistake Retention
              </span>
              <h2 className="text-xl font-serif font-bold text-white mt-1">
                {isTamil ? 'கடந்த கால பிழைகள் மறுபரிசீலனை' : 'Revisiting Previous Missed Questions'}
              </h2>
            </div>
            <span className="text-xs font-mono font-bold text-[#c5a059] px-3 py-1 rounded-full bg-[#181818] border border-[#333333]">
              {reviewQIndex + 1} / {reviewQuestions.length}
            </span>
          </div>

          {reviewQuestions[reviewQIndex] && (
            <div className="space-y-5">
              <p className="text-base sm:text-lg font-bold text-white leading-relaxed">
                {isTamil ? reviewQuestions[reviewQIndex].questionTa : reviewQuestions[reviewQIndex].questionEn}
              </p>

              <div className="space-y-3">
                {reviewQuestions[reviewQIndex].optionsEn.map((optEn, idx) => {
                  const optTa = reviewQuestions[reviewQIndex].optionsTa[idx];
                  const isSelected = reviewSelected === idx;
                  const isCorrect = idx === reviewQuestions[reviewQIndex].correctOptionIndex;

                  let style = 'border-[#262626] bg-[#181818] text-[#d4d4d4] hover:border-[#333333]';
                  if (reviewSubmitted) {
                    if (isCorrect) style = 'border-[#22c55e] bg-[#052e16]/60 text-[#4ade80] font-bold';
                    else if (isSelected) style = 'border-[#ef4444] bg-[#450a0a]/60 text-[#fca5a5]';
                  } else if (isSelected) {
                    style = 'border-[#c5a059] bg-[#c5a059]/10 text-white ring-1 ring-[#c5a059] font-bold';
                  }

                  return (
                    <button
                      key={idx}
                      disabled={reviewSubmitted}
                      onClick={() => setReviewSelected(idx)}
                      className={`w-full text-left p-3.5 rounded-xl border transition flex items-center justify-between ${style}`}
                    >
                      <span className="text-xs sm:text-sm font-medium">{isTamil ? optTa : optEn}</span>
                      {reviewSubmitted && isCorrect && <CheckCircle2 className="w-4 h-4 text-[#22c55e]" />}
                    </button>
                  );
                })}
              </div>

              <div className="flex justify-end pt-3">
                {!reviewSubmitted ? (
                  <button
                    disabled={reviewSelected === null}
                    onClick={handleReviewConfirm}
                    className="px-6 py-2.5 rounded-xl bg-[#c5a059] hover:bg-[#d4b068] text-[#0a0a0a] font-bold text-xs shadow-lg shadow-[#c5a059]/20 transition disabled:opacity-40"
                  >
                    {isTamil ? 'விடையை சரிபார்' : 'Check Answer'}
                  </button>
                ) : (
                  <button
                    onClick={handleReviewNext}
                    className="px-6 py-2.5 rounded-xl bg-[#c5a059] hover:bg-[#d4b068] text-[#0a0a0a] font-bold text-xs shadow-lg shadow-[#c5a059]/20 transition flex items-center gap-2"
                  >
                    <span>{reviewQIndex + 1 === reviewQuestions.length ? (isTamil ? 'உறுதி சோதனையைத் துவங்கு' : 'Proceed to Quick Check') : (isTamil ? 'அடுத்த வினா' : 'Next Question')}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* BLOCK 4: QUICK CHECK */}
      {activeBlock === 'quickCheck' && (
        <div className="bg-[#121212] border border-[#262626] rounded-2xl p-6 sm:p-7 shadow-xl space-y-6">
          <div className="flex items-center justify-between border-b border-[#262626] pb-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#22c55e]">
                Block 4: 5-Minute Gap Confirmation
              </span>
              <h2 className="text-xl font-serif font-bold text-white mt-1">
                {isTamil ? 'கற்றல் இடைவெளி சரிசெய்யப்பட்டதை உறுதிசெய்தல்' : 'Verifying the Concept Gap is Permanently Closed'}
              </h2>
            </div>
            <span className="text-xs font-mono font-bold text-[#c5a059] px-3 py-1 rounded-full bg-[#181818] border border-[#333333]">
              {checkQIndex + 1} / {checkQuestions.length}
            </span>
          </div>

          {checkQuestions[checkQIndex] && (
            <div className="space-y-5">
              <p className="text-base sm:text-lg font-bold text-white leading-relaxed">
                {isTamil ? checkQuestions[checkQIndex].questionTa : checkQuestions[checkQIndex].questionEn}
              </p>

              <div className="space-y-3">
                {checkQuestions[checkQIndex].optionsEn.map((optEn, idx) => {
                  const optTa = checkQuestions[checkQIndex].optionsTa[idx];
                  const isSelected = checkSelected === idx;
                  const isCorrect = idx === checkQuestions[checkQIndex].correctOptionIndex;

                  let style = 'border-[#262626] bg-[#181818] text-[#d4d4d4] hover:border-[#333333]';
                  if (checkSubmitted) {
                    if (isCorrect) style = 'border-[#22c55e] bg-[#052e16]/60 text-[#4ade80] font-bold';
                    else if (isSelected) style = 'border-[#ef4444] bg-[#450a0a]/60 text-[#fca5a5]';
                  } else if (isSelected) {
                    style = 'border-[#c5a059] bg-[#c5a059]/10 text-white ring-1 ring-[#c5a059] font-bold';
                  }

                  return (
                    <button
                      key={idx}
                      disabled={checkSubmitted}
                      onClick={() => setCheckSelected(idx)}
                      className={`w-full text-left p-3.5 rounded-xl border transition flex items-center justify-between ${style}`}
                    >
                      <span className="text-xs sm:text-sm font-medium">{isTamil ? optTa : optEn}</span>
                      {checkSubmitted && isCorrect && <CheckCircle2 className="w-4 h-4 text-[#22c55e]" />}
                    </button>
                  );
                })}
              </div>

              <div className="flex justify-end pt-3">
                {!checkSubmitted ? (
                  <button
                    disabled={checkSelected === null}
                    onClick={handleCheckConfirm}
                    className="px-6 py-2.5 rounded-xl bg-[#c5a059] hover:bg-[#d4b068] text-[#0a0a0a] font-bold text-xs shadow-lg shadow-[#c5a059]/20 transition disabled:opacity-40"
                  >
                    {isTamil ? 'விடையை உறுதிசெய்' : 'Confirm'}
                  </button>
                ) : (
                  <button
                    onClick={handleCheckNext}
                    className="px-6 py-2.5 rounded-xl bg-[#c5a059] hover:bg-[#d4b068] text-[#0a0a0a] font-bold text-xs shadow-lg shadow-[#c5a059]/20 transition flex items-center gap-2"
                  >
                    <span>{checkQIndex + 1 === checkQuestions.length ? (isTamil ? 'இன்றைய திட்டத்தை நிறைவு செய்!' : 'Finish Today\'s Plan!') : (isTamil ? 'அடுத்த வினா' : 'Next Question')}</span>
                    <Award className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
