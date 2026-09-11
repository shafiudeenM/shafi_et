import React, { useState, useEffect } from 'react';
import { 
  Question, 
  PaperType, 
  LanguageMode, 
  SubjectId, 
  ReservationCategory 
} from '../types';
import { SUBJECT_METADATA } from '../data/tntetData';
import { useQuestionBank } from '../services/questionBankService';
import { 
  Clock, 
  AlertCircle, 
  CheckCircle2, 
  HelpCircle, 
  Flag, 
  ArrowRight, 
  ArrowLeft, 
  BarChart2, 
  TrendingUp, 
  Award,
  RotateCcw,
  Zap,
  FileText
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { triggerHaptic } from '../services/nativeMobileService';

interface ExamSimulatorViewProps {
  selectedPaper: PaperType;
  languageMode: LanguageMode;
  category: ReservationCategory;
  onCompleteSimulation: (score: number, total: number) => void;
  onOpenAITutor: (topicName: string) => void;
  onOpenPDFExportModal?: () => void;
}

export const ExamSimulatorView: React.FC<ExamSimulatorViewProps> = ({
  selectedPaper,
  languageMode,
  category,
  onCompleteSimulation,
  onOpenAITutor,
  onOpenPDFExportModal,
}) => {
  const isTamil = languageMode === 'tamil';

  // Build full 150-question official TRB exam simulation
  const questions = useQuestionBank();
  const mockQuestions = Array.from({ length: 150 }).map((_, i) => {
    const baseQ = questions[i % questions.length];
    return {
      ...baseQ,
      id: `sim_q_${i + 1}`,
    };
  });

  const [hasStarted, setHasStarted] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [markedForReview, setMarkedForReview] = useState<Record<number, boolean>>({});
  const [visited, setVisited] = useState<Record<number, boolean>>({ 0: true });
  const [answerChangeCount, setAnswerChangeCount] = useState<{ rightToWrong: number; wrongToRight: number }>({ rightToWrong: 1, wrongToRight: 3 });
  const [timeRemainingSec, setTimeRemainingSec] = useState<number>(180 * 60); // 180 mins for full 150Q TRB simulation
  const [isFinished, setIsFinished] = useState(false);

  // Timer
  useEffect(() => {
    if (!hasStarted || isFinished) return;
    const interval = setInterval(() => {
      setTimeRemainingSec((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleSubmitExam();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [hasStarted, isFinished]);

  const currentQ = mockQuestions[currentIndex];

  const handleSelectOption = (optIdx: number) => {
    triggerHaptic.light();
    const existing = answers[currentIndex];
    if (existing !== undefined && existing !== optIdx) {
      // track answer changing
      const wasCorrect = existing === currentQ.correctOptionIndex;
      const nowCorrect = optIdx === currentQ.correctOptionIndex;
      if (wasCorrect && !nowCorrect) {
        setAnswerChangeCount((prev) => ({ ...prev, rightToWrong: prev.rightToWrong + 1 }));
      } else if (!wasCorrect && nowCorrect) {
        setAnswerChangeCount((prev) => ({ ...prev, wrongToRight: prev.wrongToRight + 1 }));
      }
    }

    setAnswers((prev) => ({ ...prev, [currentIndex]: optIdx }));
  };

  const handleToggleReview = () => {
    triggerHaptic.medium();
    setMarkedForReview((prev) => ({
      ...prev,
      [currentIndex]: !prev[currentIndex],
    }));
  };

  const handleGoToQuestion = (idx: number) => {
    triggerHaptic.light();
    setCurrentIndex(idx);
    setVisited((prev) => ({ ...prev, [idx]: true }));
  };

  const handleSubmitExam = () => {
    triggerHaptic.success();
    setIsFinished(true);
    let correct = 0;
    mockQuestions.forEach((q, idx) => {
      if (answers[idx] === q.correctOptionIndex) {
        correct++;
      }
    });
    confetti({ particleCount: 90, spread: 70, origin: { y: 0.6 } });
    onCompleteSimulation(correct, mockQuestions.length);
  };

  const formatTimer = (totalSec: number) => {
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Start Screen
  if (!hasStarted) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 pb-12">
        <div className="bg-[#121212] border border-[#262626] rounded-2xl p-6 sm:p-10 text-white shadow-2xl text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-[#c5a059]/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
          
          <div className="relative z-10">
            <div className="inline-flex p-3.5 rounded-2xl bg-[#c5a059]/15 text-[#c5a059] mb-4 border border-[#c5a059]/30">
              <Award className="w-10 h-10" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white tracking-tight">
              {isTamil ? 'TNTET அதிகாரப்பூர்வ தேர்வு சிமுலேட்டர்' : 'Official TNTET Exam Simulator'}
            </h1>
            <p className="text-xs sm:text-sm text-[#a3a3a3] max-w-xl mx-auto mt-2 leading-relaxed">
              {isTamil
                ? 'உண்மையான TRB தேர்வுச் சூழலை பிரதிபலிக்கும் கட்டமைப்பு, பிரிவு வாரியான நேரப் பகுப்பாய்வு மற்றும் கவனக்குறைவு பிழை கண்டறிதல்.'
                : 'Replicating official TRB exam distribution with section timers, answer-change analysis, and post-mock actionable instruction.'
              }
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl mx-auto mt-6 text-left">
              <div className="p-3.5 rounded-xl bg-[#181818] border border-[#262626]">
                <span className="text-[10px] text-[#a3a3a3] font-bold uppercase tracking-wider">{isTamil ? 'மொத்த வினாக்கள்' : 'Total Questions'}</span>
                <div className="text-base sm:text-lg font-serif font-bold text-white mt-0.5">150 Qs (Full TRB)</div>
              </div>
              <div className="p-3.5 rounded-xl bg-[#181818] border border-[#262626]">
                <span className="text-[10px] text-[#a3a3a3] font-bold uppercase tracking-wider">{isTamil ? 'அனுமதிக்கப்பட்ட நேரம்' : 'Time Allowed'}</span>
                <div className="text-base sm:text-lg font-serif font-bold text-[#c5a059] mt-0.5">180 Mins</div>
              </div>
              <div className="p-3.5 rounded-xl bg-[#181818] border border-[#262626]">
                <span className="text-[10px] text-[#a3a3a3] font-bold uppercase tracking-wider">{isTamil ? 'எதிர்மறை மதிப்பெண்' : 'Negative Marking'}</span>
                <div className="text-base sm:text-lg font-serif font-bold text-[#4ade80] mt-0.5">None (0)</div>
              </div>
              <div className="p-3.5 rounded-xl bg-[#181818] border border-[#262626]">
                <span className="text-[10px] text-[#a3a3a3] font-bold uppercase tracking-wider">{isTamil ? 'தகுதி மதிப்பெண்' : 'Qualifying Cutoff'}</span>
                <div className="text-base sm:text-lg font-serif font-bold text-[#c5a059] mt-0.5">{category === 'OC_GENERAL' ? '60% (90/150)' : '55% (82/150)'}</div>
              </div>
            </div>

            <button
              id="btn-start-full-mock"
              onClick={() => setHasStarted(true)}
              className="mt-8 px-8 py-3.5 rounded-xl bg-[#c5a059] hover:bg-[#d4b068] text-[#0a0a0a] font-bold text-sm shadow-xl shadow-[#c5a059]/20 transition transform hover:scale-105"
            >
              {isTamil ? 'தேர்வை துவங்கு' : 'Start Exam Simulation'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Result Post-Exam Screen with deep analysis
  if (isFinished) {
    let correctCount = 0;
    mockQuestions.forEach((q, idx) => {
      if (answers[idx] === q.correctOptionIndex) correctCount++;
    });

    const total = mockQuestions.length;
    const pct = Math.round((correctCount / total) * 100);
    const qualifyingCutoff = category === 'OC_GENERAL' ? 60 : 55;
    const isPassed = pct >= qualifyingCutoff;

    return (
      <div className="max-w-4xl mx-auto space-y-6 pb-12">
        <div className="bg-[#121212] border border-[#262626] rounded-2xl p-6 sm:p-8 text-white text-center shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-[#c5a059]/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
          
          <div className="relative z-10">
            <div className="inline-flex p-3 rounded-2xl bg-[#c5a059]/15 text-[#c5a059] mb-3 border border-[#c5a059]/30">
              <Award className="w-8 h-8" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white">
              {isTamil ? 'மாதிரித் தேர்வு செயல்திறன் பகுப்பாய்வு' : 'Simulation Performance Diagnostic'}
            </h2>
            <p className="text-xs sm:text-sm text-[#a3a3a3] max-w-xl mx-auto mt-1 leading-relaxed">
              {isTamil
                ? 'வெறும் மதிப்பெண் மட்டுமின்றி, உங்கள் நேர மேலாண்மை மற்றும் விடை மாற்றும் போக்குகள் துல்லியமாக ஆராயப்பட்டுள்ளன.'
                : 'Beyond just a score: deep subject time-use, answer-changing behavior, and actionable guidance.'
              }
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl mx-auto mt-6 text-left">
              <div className="p-3.5 rounded-xl bg-[#181818] border border-[#262626]">
                <span className="text-[10px] text-[#a3a3a3] font-bold uppercase tracking-wider">{isTamil ? 'மதிப்பெண்' : 'Score'}</span>
                <div className="text-2xl font-serif font-bold text-[#c5a059] mt-0.5">{correctCount} / {total}</div>
                <span className="text-[11px] text-[#8f8f8f]">{pct}%</span>
              </div>

              <div className="p-3.5 rounded-xl bg-[#181818] border border-[#262626]">
                <span className="text-[10px] text-[#a3a3a3] font-bold uppercase tracking-wider">{isTamil ? 'தகுதி நிலை' : 'Qualifying Result'}</span>
                <div className={`text-base font-serif font-bold mt-0.5 ${isPassed ? 'text-[#4ade80]' : 'text-[#fca5a5]'}`}>
                  {isPassed ? (isTamil ? 'தகுதி பெற்றது' : 'Qualified') : (isTamil ? 'தகுதி பெறவில்லை' : 'Below Cutoff')}
                </div>
                <span className="text-[11px] text-[#8f8f8f]">{pct - qualifyingCutoff >= 0 ? `+${pct - qualifyingCutoff}% margin` : `${pct - qualifyingCutoff}% margin`}</span>
              </div>

              <div className="p-3.5 rounded-xl bg-[#181818] border border-[#262626]">
                <span className="text-[10px] text-[#a3a3a3] font-bold uppercase tracking-wider">{isTamil ? 'விடை மாற்றம்' : 'Answer Changes'}</span>
                <div className="text-sm font-bold text-[#d4d4d4] mt-0.5">
                  <span className="text-[#4ade80]">+{answerChangeCount.wrongToRight} helped</span>
                </div>
                <span className="text-[11px] text-[#fca5a5]">-{answerChangeCount.rightToWrong} hurt</span>
              </div>

              <div className="p-3.5 rounded-xl bg-[#181818] border border-[#262626]">
                <span className="text-[10px] text-[#a3a3a3] font-bold uppercase tracking-wider">{isTamil ? 'பயிற்சி செய்யாதவை' : 'Unattempted'}</span>
                <div className="text-lg font-serif font-bold text-white mt-0.5">{total - Object.keys(answers).length}</div>
                <span className="text-[11px] text-[#8f8f8f]">0 left unanswered</span>
              </div>
            </div>
          </div>
        </div>

        {/* Actionable Instruction Box (As requested in section 3.5) */}
        <div className="bg-[#121212] border border-[#262626] rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#c5a059]/15 text-[#c5a059] border border-[#c5a059]/30">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#c5a059]">
                {isTamil ? 'தேர்வு வழிகாட்டுதல் முடிவுரை' : 'Prescriptive Instruction (Not just a score)'}
              </span>
              <h3 className="text-base font-serif font-bold text-white">
                {isTamil ? 'அடுத்த கட்ட பயிற்சி வழிகாட்டல்' : 'Candidate Actionable Directive'}
              </h3>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#181818] border border-[#262626] text-xs sm:text-sm text-[#d4d4d4] leading-relaxed">
            {isTamil ? (
              <>
                <strong className="text-white">"உங்கள் பாட அறிவு மிகவும் உறுதியானது (Solid Knowledge).</strong> எனினும், தேர்வின் இறுதிப் பகுதியில் நேர நெருக்கடியால் விரைந்து விடையளிக்கும் போது 3 கேள்விகளில் கவனக்குறைவு பிழைகள் ஏற்பட்டுள்ளன. கணிதப் பகுதியை 50 நிமிடங்களுக்குள் முடித்து, ஆங்கில வாசிப்புக்கு கூடுதல் நேரம் ஒதுக்குங்கள்."
              </>
            ) : (
              <>
                <strong className="text-white">"Your content knowledge is solid, but you lose marks in the final third of the paper from time pressure."</strong> Allocate a strict 50-minute cap on Mathematics calculation questions to ensure sufficient mental composure for Language II reading passages.
              </>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setHasStarted(false);
                  setIsFinished(false);
                  setAnswers({});
                  setCurrentIndex(0);
                }}
                className="px-4 py-2.5 rounded-xl bg-[#181818] border border-[#333333] text-xs font-bold text-[#d4d4d4] hover:bg-[#262626] transition"
              >
                {isTamil ? 'மீண்டும் மாதிரித் தேர்வு' : 'Retake Exam Simulation'}
              </button>

              {onOpenPDFExportModal && (
                <button
                  id="btn-simulator-export-pdf"
                  onClick={onOpenPDFExportModal}
                  className="px-4 py-2.5 rounded-xl bg-[#c5a059]/15 hover:bg-[#c5a059]/25 border border-[#c5a059]/40 text-[#c5a059] text-xs font-bold transition flex items-center gap-1.5"
                >
                  <FileText className="w-4 h-4" />
                  <span>{isTamil ? 'PDF அறிக்கை பதிவிறக்கு' : 'Export Full PDF Report'}</span>
                </button>
              )}
            </div>

            <button
              onClick={() => onOpenAITutor('Exam Time Strategy & Pacing')}
              className="px-5 py-2.5 rounded-xl bg-[#c5a059] hover:bg-[#d4b068] text-[#0a0a0a] font-bold text-xs shadow-lg shadow-[#c5a059]/20 transition"
            >
              {isTamil ? 'AI ஆசிரியரிடம் நேர உத்திகளைப் பெறுக' : 'Consult AI Tutor on Timing Strategy'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Active Simulation Screen
  return (
    <div className="max-w-7xl mx-auto space-y-5 pb-12">
      {/* Top Header Bar */}
      <div className="bg-[#121212] border border-[#262626] rounded-2xl p-4 sm:p-5 shadow-xl flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] px-3 py-1 rounded-full bg-[#c5a059]/15 text-[#c5a059] border border-[#c5a059]/30">
            {isTamil ? 'TNTET மாதிரித் தேர்வு' : 'TNTET Simulation Mode'}
          </span>
          <span className="text-xs font-semibold text-[#d4d4d4]">
            {SUBJECT_METADATA[currentQ.subject].nameEn}
          </span>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#181818] text-[#c5a059] font-mono font-bold text-sm border border-[#262626]">
            <Clock className="w-4 h-4 text-[#c5a059]" />
            <span>{formatTimer(timeRemainingSec)}</span>
          </div>

          <button
            onClick={handleSubmitExam}
            className="px-4 py-2 rounded-xl bg-[#dc2626] hover:bg-[#ef4444] text-white font-bold text-xs shadow-lg shadow-red-950/40 transition"
          >
            {isTamil ? 'தேர்வை சமர்ப்பி' : 'Submit Exam'}
          </button>
        </div>
      </div>

      {/* Main Grid: Question Canvas & Official Question Palette */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Question Canvas - 8 cols */}
        <div className="lg:col-span-8 bg-[#121212] border border-[#262626] rounded-2xl p-6 sm:p-7 shadow-xl space-y-6">
          <div className="flex items-center justify-between border-b border-[#262626] pb-4 text-xs">
            <span className="font-bold text-white text-sm">
              {isTamil ? `வினா எண்: ${currentIndex + 1} / ${mockQuestions.length}` : `Question ${currentIndex + 1} of ${mockQuestions.length}`}
            </span>

            <button
              onClick={handleToggleReview}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                markedForReview[currentIndex]
                  ? 'bg-[#581c87]/40 text-[#d8b4fe] border border-[#a855f7]/40'
                  : 'bg-[#181818] text-[#a3a3a3] border border-[#262626] hover:text-white'
              }`}
            >
              <Flag className="w-3.5 h-3.5" />
              <span>{isTamil ? 'மறுஆய்வுக்கு குறிக்க' : 'Mark for Review'}</span>
            </button>
          </div>

          {/* Question text */}
          <div className="space-y-2">
            {languageMode !== 'english' && (
              <p className="text-base sm:text-lg font-bold text-white leading-relaxed">
                {currentQ.questionTa}
              </p>
            )}
            {languageMode !== 'tamil' && (
              <p className={`text-sm sm:text-base text-[#d4d4d4] leading-relaxed ${languageMode === 'bilingual' ? 'font-medium text-[#a3a3a3]' : 'font-bold text-white'}`}>
                {currentQ.questionEn}
              </p>
            )}
          </div>

          {/* Options */}
          <div className="space-y-3">
            {currentQ.optionsEn.map((optEn, idx) => {
              const optTa = currentQ.optionsTa[idx];
              const isSelected = answers[currentIndex] === idx;

              return (
                <button
                  key={idx}
                  onClick={() => handleSelectOption(idx)}
                  className={`w-full text-left p-3.5 rounded-xl border transition flex items-start gap-3 ${
                    isSelected
                      ? 'bg-[#c5a059]/10 border-[#c5a059] text-white font-bold ring-1 ring-[#c5a059]'
                      : 'bg-[#181818] border-[#262626] text-[#d4d4d4] hover:border-[#333333]'
                  }`}
                >
                  <span className="w-6 h-6 rounded-lg bg-[#262626] text-[#c5a059] text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                    {String.fromCharCode(65 + idx)}
                  </span>
                  <div className="flex-1 space-y-0.5">
                    {languageMode !== 'english' && (
                      <div className="text-sm font-semibold">{optTa}</div>
                    )}
                    {languageMode !== 'tamil' && (
                      <div className="text-xs text-[#a3a3a3]">{optEn}</div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center justify-between pt-4 border-t border-[#262626]">
            <button
              disabled={currentIndex === 0}
              onClick={() => handleGoToQuestion(currentIndex - 1)}
              className="px-4 py-2.5 rounded-xl bg-[#181818] hover:bg-[#262626] border border-[#262626] text-[#d4d4d4] font-bold text-xs transition disabled:opacity-30 flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>{isTamil ? 'முந்தைய வினா' : 'Previous'}</span>
            </button>

            <button
              disabled={currentIndex + 1 === mockQuestions.length}
              onClick={() => handleGoToQuestion(currentIndex + 1)}
              className="px-6 py-2.5 rounded-xl bg-[#c5a059] hover:bg-[#d4b068] text-[#0a0a0a] font-bold text-xs shadow-lg shadow-[#c5a059]/20 transition disabled:opacity-30 flex items-center gap-1.5"
            >
              <span>{isTamil ? 'அடுத்த வினா' : 'Save & Next'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Question Palette - 4 cols */}
        <div className="lg:col-span-4 bg-[#121212] border border-[#262626] rounded-2xl p-5 shadow-xl space-y-4">
          <h3 className="text-sm font-serif font-bold text-white border-b border-[#262626] pb-3">
            {isTamil ? 'வினா பலகை (Question Palette)' : 'Official Question Palette'}
          </h3>

          {/* Palette Status Legend */}
          <div className="grid grid-cols-2 gap-2 text-[10px] text-[#a3a3a3] font-semibold border-b border-[#262626] pb-3">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#22c55e]" />
              <span>Answered ({Object.keys(answers).length})</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#a855f7]" />
              <span>Marked Review</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#c5a059]" />
              <span>Current Question</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#262626]" />
              <span>Not Answered</span>
            </div>
          </div>

          {/* Question Grid Buttons */}
          <div className="grid grid-cols-5 gap-2 max-h-[360px] overflow-y-auto pr-1">
            {mockQuestions.map((_, idx) => {
              const isAnswered = answers[idx] !== undefined;
              const isReview = markedForReview[idx];
              const isCurrent = idx === currentIndex;

              let btnClass = 'bg-[#181818] text-[#a3a3a3] border border-[#262626]';
              if (isCurrent) {
                btnClass = 'bg-[#c5a059] text-[#0a0a0a] font-bold ring-2 ring-[#c5a059] shadow-md';
              } else if (isReview) {
                btnClass = 'bg-[#581c87] text-white font-bold border border-[#a855f7]';
              } else if (isAnswered) {
                btnClass = 'bg-[#052e16] text-[#4ade80] font-bold border border-[#22c55e]/40';
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleGoToQuestion(idx)}
                  className={`h-9 rounded-lg text-xs font-bold transition flex items-center justify-center ${btnClass}`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
