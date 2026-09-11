import React, { useState, useEffect } from 'react';
import { 
  Question, 
  UserInteraction, 
  LanguageMode, 
  PaperType, 
  ErrorType, 
  ReservationCategory 
} from '../types';
import { 
  SUBJECT_METADATA 
} from '../data/tntetData';
import { useQuestionBank } from '../services/questionBankService';
import { classifyError } from '../services/recommendationEngine';
import { 
  Zap, 
  Clock, 
  CheckCircle, 
  XCircle, 
  HelpCircle, 
  ArrowRight, 
  Sparkles, 
  Brain, 
  BarChart3, 
  AlertCircle,
  RotateCcw
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface DiagnosticViewProps {
  selectedPaper: PaperType;
  languageMode: LanguageMode;
  category: ReservationCategory;
  onCompleteDiagnostic: (interactions: UserInteraction[]) => void;
  onOpenAITutor: (topicName: string) => void;
}

export const DiagnosticView: React.FC<DiagnosticViewProps> = ({
  selectedPaper,
  languageMode,
  category,
  onCompleteDiagnostic,
  onOpenAITutor,
}) => {
  const isTamil = languageMode === 'tamil';
  const questions = useQuestionBank();

  // Sample questions across subjects for a concise 10-question diagnostic
  const diagnosticQuestions = questions.slice(0, 10);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [confidence, setConfidence] = useState<'high' | 'medium' | 'low'>('medium');
  const [interactions, setInteractions] = useState<UserInteraction[]>([]);
  const [isFinished, setIsFinished] = useState(false);
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [questionSeconds, setQuestionSeconds] = useState<number>(0);
  const [showInstantExplanation, setShowInstantExplanation] = useState(false);

  useEffect(() => {
    setStartTime(Date.now());
    setQuestionSeconds(0);
    const timer = setInterval(() => {
      setQuestionSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [currentIndex]);

  const currentQ = diagnosticQuestions[currentIndex];

  const handleSelectOption = (idx: number) => {
    setSelectedOption(idx);
  };

  const handleConfirmAnswer = () => {
    if (selectedOption === null) return;

    const timeSpent = Math.round((Date.now() - startTime) / 1000);
    const isCorrect = selectedOption === currentQ.correctOptionIndex;
    const errorType = isCorrect ? undefined : classifyError(currentQ, selectedOption, timeSpent, confidence);

    const interaction: UserInteraction = {
      id: `diag_int_${Date.now()}_${currentIndex}`,
      questionId: currentQ.id,
      selectedOptionIndex: selectedOption,
      isCorrect,
      timeSpentSec: timeSpent,
      confidence,
      detectedErrorType: errorType,
      timestamp: Date.now(),
      testContext: 'diagnostic',
    };

    const nextInteractions = [...interactions, interaction];
    setInteractions(nextInteractions);
    setShowInstantExplanation(true);
  };

  const handleNextQuestion = () => {
    setShowInstantExplanation(false);
    setSelectedOption(null);
    setConfidence('medium');

    if (currentIndex + 1 < diagnosticQuestions.length) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setIsFinished(true);
      confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } });
      onCompleteDiagnostic(interactions);
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setSelectedOption(null);
    setInteractions([]);
    setIsFinished(false);
    setShowInstantExplanation(false);
  };

  // If test finished, display rich diagnostic report
  if (isFinished) {
    const correctCount = interactions.filter((i) => i.isCorrect).length;
    const scorePct = Math.round((correctCount / diagnosticQuestions.length) * 100);
    const qualifyingCutoff = category === 'OC_GENERAL' ? 60 : 55;
    const totalTimeSec = interactions.reduce((sum, i) => sum + i.timeSpentSec, 0);
    const avgTimeSec = Math.round(totalTimeSec / interactions.length);

    // Group errors by error type
    const errorMap: Record<ErrorType, number> = {
      concept_confusion: 0,
      knowledge_gap: 0,
      misread_question: 0,
      careless_error: 0,
      time_pressure: 0,
    };
    interactions.forEach((i) => {
      if (!i.isCorrect && i.detectedErrorType) {
        errorMap[i.detectedErrorType] = (errorMap[i.detectedErrorType] || 0) + 1;
      }
    });

    return (
      <div className="max-w-4xl mx-auto space-y-6 pb-12">
        <div className="bg-[#121212] border border-[#262626] rounded-2xl p-6 sm:p-8 text-white text-center shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-[#c5a059]/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
          
          <div className="relative z-10">
            <div className="inline-flex p-3 rounded-2xl bg-[#c5a059]/15 text-[#c5a059] mb-3 border border-[#c5a059]/30">
              <Zap className="w-8 h-8" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white tracking-tight">
              {isTamil ? 'குறை கண்டறி தேர்வு முடிவுகள்' : 'Diagnostic Assessment Results'}
            </h2>
            <p className="text-xs sm:text-sm text-[#a3a3a3] max-w-xl mx-auto mt-2 leading-relaxed">
              {isTamil
                ? 'உங்கள் மதிப்பெண், விடை வேகம் மற்றும் பிழை காரணங்கள் துல்லியமாக பகுப்பாய்வு செய்யப்பட்டுள்ளன.'
                : 'Your baseline readiness, pacing, and root-cause mistake taxonomy have been mapped.'
              }
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl mx-auto mt-6 text-left">
              <div className="p-3.5 rounded-xl bg-[#181818] border border-[#262626]">
                <span className="text-[10px] text-[#a3a3a3] font-bold uppercase tracking-wider">{isTamil ? 'துல்லிய மதிப்பெண்' : 'Score'}</span>
                <div className="text-xl font-serif font-bold text-[#c5a059] mt-0.5">{correctCount} / {diagnosticQuestions.length}</div>
                <span className="text-[10px] text-[#8f8f8f]">{scorePct}% {isTamil ? 'சரியானது' : 'Accuracy'}</span>
              </div>

              <div className="p-3.5 rounded-xl bg-[#181818] border border-[#262626]">
                <span className="text-[10px] text-[#a3a3a3] font-bold uppercase tracking-wider">{isTamil ? 'சராசரி நேரம்' : 'Avg Pacing'}</span>
                <div className="text-xl font-serif font-bold text-white mt-0.5">{avgTimeSec}s</div>
                <span className="text-[10px] text-[#8f8f8f]">{avgTimeSec <= 50 ? 'Optimal' : 'High time'}</span>
              </div>

              <div className="p-3.5 rounded-xl bg-[#181818] border border-[#262626]">
                <span className="text-[10px] text-[#a3a3a3] font-bold uppercase tracking-wider">{isTamil ? 'தகுதி நிலை' : 'Cutoff Delta'}</span>
                <div className={`text-xl font-serif font-bold mt-0.5 ${scorePct >= qualifyingCutoff ? 'text-[#4ade80]' : 'text-[#fca5a5]'}`}>
                  {scorePct >= qualifyingCutoff ? `+${scorePct - qualifyingCutoff}%` : `${scorePct - qualifyingCutoff}%`}
                </div>
                <span className="text-[10px] text-[#8f8f8f]">{scorePct >= qualifyingCutoff ? 'Safe' : 'Needs boost'}</span>
              </div>

              <div className="p-3.5 rounded-xl bg-[#181818] border border-[#262626]">
                <span className="text-[10px] text-[#a3a3a3] font-bold uppercase tracking-wider">{isTamil ? 'முக்கிய பிழை' : 'Top Trap'}</span>
                <div className="text-base font-bold text-[#c5a059] truncate mt-0.5">Concept Trap</div>
                <span className="text-[10px] text-[#8f8f8f]">Targeted in Daily Plan</span>
              </div>
            </div>
          </div>
        </div>

        {/* Mistake Taxonomy Routing */}
        <div className="bg-[#121212] border border-[#262626] rounded-2xl p-6 shadow-xl">
          <h3 className="text-base font-serif font-bold text-white mb-1.5">
            {isTamil ? 'பிழை வகைப்பாடு & தீர்வு முறை' : 'Mistake Root-Cause Breakdown'}
          </h3>
          <p className="text-xs text-[#a3a3a3] mb-4">
            {isTamil
              ? 'ஒவ்வொரு தவறும் வெவ்வேறு வழிகளில் சரிசெய்யப்பட வேண்டும்:'
              : 'Different error types require different remedial interventions, not just more reading:'
            }
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            <div className="p-4 rounded-xl bg-[#181818] border border-[#262626]">
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-xs font-bold text-white">Concept Confusion</span>
                <span className="text-xs font-bold text-[#fca5a5]">{errorMap.concept_confusion} {isTamil ? 'வினாக்கள்' : 'Qs'}</span>
              </div>
              <p className="text-[11px] text-[#a3a3a3] leading-relaxed">
                {isTamil ? 'தீர்வு: AI ஆசிரியரின் தெளிவான கருத்து வேறுபாடு விளக்கம்.' : 'Fix: Targeted AI Tutor contrastive concept explanation.'}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#181818] border border-[#262626]">
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-xs font-bold text-white">Knowledge Gap</span>
                <span className="text-xs font-bold text-[#c5a059]">{errorMap.knowledge_gap} {isTamil ? 'வினாக்கள்' : 'Qs'}</span>
              </div>
              <p className="text-[11px] text-[#a3a3a3] leading-relaxed">
                {isTamil ? 'தீர்வு: SCERT பாடநூல் வரையறைகள் & சூத்திரங்களை மீண்டும் படித்தல்.' : 'Fix: Core SCERT definitions & formula recall.'}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#181818] border border-[#262626]">
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-xs font-bold text-white">Careless / Misread</span>
                <span className="text-xs font-bold text-[#38bdf8]">{errorMap.careless_error + errorMap.misread_question} {isTamil ? 'வினாக்கள்' : 'Qs'}</span>
              </div>
              <p className="text-[11px] text-[#a3a3a3] leading-relaxed">
                {isTamil ? 'தீர்வு: கேள்வி முக்கிய சொற்களை (not, except) கவனிக்கும் பழக்கம்.' : 'Fix: Question keyword underline training.'}
              </p>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <button
            onClick={handleRestart}
            className="px-4 py-2.5 rounded-xl bg-[#181818] hover:bg-[#262626] border border-[#333333] text-[#d4d4d4] text-xs font-bold transition flex items-center gap-1.5"
          >
            <RotateCcw className="w-4 h-4" />
            <span>{isTamil ? 'மீண்டும் தேர்வு எழுது' : 'Retake Diagnostic'}</span>
          </button>

          <button
            onClick={() => onCompleteDiagnostic(interactions)}
            className="px-6 py-3 rounded-xl bg-[#c5a059] hover:bg-[#d4b068] text-[#0a0a0a] text-xs font-bold shadow-lg shadow-[#c5a059]/20 transition flex items-center gap-2"
          >
            <span>{isTamil ? 'இன்றைய தனிப்பயன் திட்டத்தை தொடங்கு' : 'Generate & Start Tailored Daily Plan'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-5 pb-12">
      {/* Header & Progress Bar */}
      <div className="bg-[#121212] border border-[#262626] rounded-2xl p-4 sm:p-5 shadow-xl">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] px-3 py-1 rounded-full bg-[#c5a059]/15 text-[#c5a059] border border-[#c5a059]/30">
              {isTamil ? 'குறை கண்டறி சோதனை' : 'Adaptive Diagnostic'}
            </span>
            <span className="text-xs text-[#a3a3a3] font-semibold">
              {currentIndex + 1} / {diagnosticQuestions.length}
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#c5a059]">
            <Clock className="w-4 h-4 text-[#c5a059]" />
            <span>{questionSeconds}s</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-[#181818] h-2 rounded-full overflow-hidden border border-[#262626]">
          <div
            className="bg-[#c5a059] h-full rounded-full transition-all duration-300 shadow-sm"
            style={{ width: `${((currentIndex + 1) / diagnosticQuestions.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Question Card */}
      <div className="bg-[#121212] border border-[#262626] rounded-2xl p-5 sm:p-6 shadow-xl space-y-5">
        {/* Subject & Taxonomy breadcrumb */}
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[#a3a3a3] border-b border-[#262626] pb-3">
          <div className="flex items-center gap-1.5 font-bold text-[#c5a059]">
            <span>{SUBJECT_METADATA[currentQ.subject].nameEn}</span>
            <span>·</span>
            <span>{currentQ.topic}</span>
          </div>
          <span className="px-2.5 py-0.5 rounded bg-[#181818] border border-[#262626] text-[11px] font-medium text-[#d4d4d4]">
            {currentQ.source}
          </span>
        </div>

        {/* Question Text */}
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
        <div className="space-y-2.5">
          {currentQ.optionsEn.map((optEn, idx) => {
            const optTa = currentQ.optionsTa[idx];
            const isSelected = selectedOption === idx;
            const isCorrect = idx === currentQ.correctOptionIndex;

            let buttonStyle = 'border-[#262626] hover:border-[#333333] bg-[#181818] text-[#d4d4d4]';
            
            if (showInstantExplanation) {
              if (isCorrect) {
                buttonStyle = 'border-[#22c55e] bg-[#052e16]/60 text-[#4ade80] font-bold';
              } else if (isSelected && !isCorrect) {
                buttonStyle = 'border-[#ef4444] bg-[#450a0a]/60 text-[#fca5a5]';
              }
            } else if (isSelected) {
              buttonStyle = 'border-[#c5a059] bg-[#c5a059]/10 text-white font-bold ring-1 ring-[#c5a059]';
            }

            return (
              <button
                key={idx}
                disabled={showInstantExplanation}
                onClick={() => handleSelectOption(idx)}
                className={`w-full text-left p-3.5 rounded-xl border transition flex items-start gap-3 ${buttonStyle}`}
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

                {showInstantExplanation && isCorrect && (
                  <CheckCircle className="w-5 h-5 text-[#22c55e] shrink-0 self-center" />
                )}
                {showInstantExplanation && isSelected && !isCorrect && (
                  <XCircle className="w-5 h-5 text-[#ef4444] shrink-0 self-center" />
                )}
              </button>
            );
          })}
        </div>

        {/* Confidence Picker (shown before submitting) */}
        {!showInstantExplanation && (
          <div className="p-3 rounded-xl bg-[#181818] border border-[#262626] flex flex-wrap items-center justify-between gap-2 text-xs">
            <span className="text-[#a3a3a3] font-semibold">
              {isTamil ? 'உங்கள் நம்பிக்கை அளவு:' : 'Confidence Level:'}
            </span>
            <div className="flex items-center gap-1.5">
              {(['high', 'medium', 'low'] as const).map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => setConfidence(lvl)}
                  className={`px-3 py-1 rounded-lg font-bold capitalize transition ${
                    confidence === lvl
                      ? 'bg-[#c5a059] text-[#0a0a0a] shadow-sm'
                      : 'bg-[#262626] text-[#a3a3a3] hover:text-white'
                  }`}
                >
                  {lvl === 'high' ? (isTamil ? 'உறுதியானது' : 'High') : lvl === 'medium' ? (isTamil ? 'நடுத்தரம்' : 'Medium') : (isTamil ? 'ஊகம்' : 'Guess / Low')}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Instant Concept & Trap Analysis on Submit */}
        {showInstantExplanation && (
          <div className="p-4 rounded-xl bg-[#181818] border border-[#262626] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[#c5a059] flex items-center gap-1.5">
                <Brain className="w-4 h-4" />
                {isTamil ? 'விளக்கம் & பொறி பகுப்பாய்வு' : 'Concept Explanation & Trap Analysis'}
              </span>
              <button
                onClick={() => onOpenAITutor(currentQ.topic)}
                className="text-xs font-bold text-[#c5a059] hover:underline flex items-center gap-1"
              >
                <span>{isTamil ? 'AI ஆசிரியரிடம் மேலும் கேள்' : 'Ask AI Tutor in Tamil'}</span>
                <Sparkles className="w-3.5 h-3.5" />
              </button>
            </div>

            <p className="text-xs text-[#d4d4d4] leading-relaxed">
              {isTamil ? currentQ.explanationTa : currentQ.explanationEn}
            </p>

            {selectedOption !== currentQ.correctOptionIndex && currentQ.distractorNotes && currentQ.distractorNotes[selectedOption!] && (
              <div className="p-3 rounded-lg bg-[#450a0a]/60 border border-[#ef4444]/40 text-xs text-[#fca5a5]">
                <strong>{isTamil ? 'நீங்கள் தேர்வு செய்த பிழைக் காரணம்: ' : 'Why your choice was a trap: '}</strong>
                {isTamil ? currentQ.distractorNotes[selectedOption!].ta : currentQ.distractorNotes[selectedOption!].en}
              </div>
            )}
          </div>
        )}

        {/* Submit / Next Actions */}
        <div className="flex items-center justify-between pt-2">
          <span className="text-xs text-[#8f8f8f]">
            {isTamil ? 'அனைத்து பாடப் பிரிவுகளும் மாதிரி எடுக்கப்படும்' : 'Sampling all key syllabus areas'}
          </span>

          {!showInstantExplanation ? (
            <button
              disabled={selectedOption === null}
              onClick={handleConfirmAnswer}
              className={`px-6 py-2.5 rounded-xl font-bold text-xs transition shadow-lg ${
                selectedOption !== null
                  ? 'bg-[#c5a059] hover:bg-[#d4b068] text-[#0a0a0a] shadow-[#c5a059]/20'
                  : 'bg-[#181818] text-[#8f8f8f] border border-[#262626] cursor-not-allowed'
              }`}
            >
              {isTamil ? 'விடையை உறுதிசெய்' : 'Confirm & Check'}
            </button>
          ) : (
            <button
              onClick={handleNextQuestion}
              className="px-6 py-2.5 rounded-xl bg-[#c5a059] hover:bg-[#d4b068] text-[#0a0a0a] font-bold text-xs shadow-lg shadow-[#c5a059]/20 transition flex items-center gap-1.5"
            >
              <span>{currentIndex + 1 === diagnosticQuestions.length ? (isTamil ? 'முடிவுகளைக் காண்க' : 'View Results') : (isTamil ? 'அடுத்த வினா' : 'Next Question')}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
