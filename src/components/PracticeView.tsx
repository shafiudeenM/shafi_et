import React, { useState } from 'react';
import { 
  Question, 
  SubjectId, 
  LanguageMode, 
  ErrorType,
  PaperType 
} from '../types';
import { SUBJECT_METADATA } from '../data/tntetData';
import { useQuestionBank, getQuestionBank } from '../services/questionBankService';
import { classifyError } from '../services/recommendationEngine';
import { triggerHaptic } from '../services/nativeMobileService';
import { SCERTChapterSelector } from './SCERTChapterSelector';
import { 
  Filter, 
  Search, 
  Brain, 
  Sparkles, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Tag, 
  BookOpen, 
  HelpCircle,
  Zap,
  ArrowRight
} from 'lucide-react';

interface PracticeViewProps {
  languageMode: LanguageMode;
  selectedPaper?: PaperType;
  onOpenAITutor: (topicName: string) => void;
  onRecordAnswer: (question: Question, selectedIndex: number, isCorrect: boolean, timeSec: number, errorType?: ErrorType) => void;
}

export const PracticeView: React.FC<PracticeViewProps> = ({
  languageMode,
  selectedPaper = 'PAPER_II_MATH_SCI',
  onOpenAITutor,
  onRecordAnswer,
}) => {
  const isTamil = languageMode === 'tamil';
  const questions = useQuestionBank();

  const [selectedSubject, setSelectedSubject] = useState<SubjectId | 'all'>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [selectedTopicIds, setSelectedTopicIds] = useState<string[]>([]);
  const [showChapterDrawer, setShowChapterDrawer] = useState(false);
  const [activeQuestionId, setActiveQuestionId] = useState<string>(getQuestionBank()[0].id);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswerRevealed, setIsAnswerRevealed] = useState(false);
  const [timeSpent, setTimeSpent] = useState(25);

  const filteredQuestions = questions.filter((q) => {
    if (selectedSubject !== 'all' && q.subject !== selectedSubject) return false;
    if (selectedDifficulty !== 'all' && q.difficulty !== selectedDifficulty) return false;
    if (selectedTopicIds.length > 0 && !selectedTopicIds.includes(q.topicId)) return false;
    return true;
  });

  const currentQ = filteredQuestions.find((q) => q.id === activeQuestionId) || filteredQuestions[0] || getQuestionBank()[0];

  const handleSelectOption = (idx: number) => {
    if (isAnswerRevealed) return;
    triggerHaptic.light();
    setSelectedOption(idx);
  };

  const handleCheckAnswer = () => {
    if (selectedOption === null) return;
    setIsAnswerRevealed(true);
    const isCorrect = selectedOption === currentQ.correctOptionIndex;
    if (isCorrect) {
      triggerHaptic.success();
    } else {
      triggerHaptic.error();
    }
    const errorType = isCorrect ? undefined : classifyError(currentQ, selectedOption, timeSpent);
    onRecordAnswer(currentQ, selectedOption, isCorrect, timeSpent, errorType);
  };

  const handleNext = () => {
    triggerHaptic.medium();
    setIsAnswerRevealed(false);
    setSelectedOption(null);
    const currentIndex = filteredQuestions.findIndex((q) => q.id === currentQ.id);
    if (currentIndex + 1 < filteredQuestions.length) {
      setActiveQuestionId(filteredQuestions[currentIndex + 1].id);
    } else {
      setActiveQuestionId(filteredQuestions[0].id);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* Top Filter Bar */}
      <div className="bg-[#121212] border border-[#262626] rounded-2xl p-5 sm:p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#c5a059] flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5" />
              {isTamil ? 'அடாப்டிவ் வினா வங்கி (PYQ சார்ந்தவை)' : 'Adaptive Question Engine (PYQ Grounded)'}
            </span>
            <h2 className="text-xl font-serif font-bold text-white mt-1">
              {isTamil ? 'பாட வாரியான பயிற்சி வினாக்கள்' : 'Subject & Provenance-Tagged Practice'}
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs">
            {/* Subject Filter */}
            <select
              value={selectedSubject}
              onChange={(e) => {
                setSelectedSubject(e.target.value as any);
                setIsAnswerRevealed(false);
                setSelectedOption(null);
              }}
              className="px-3.5 py-2.5 rounded-xl bg-[#181818] border border-[#262626] text-[#d4d4d4] font-semibold focus:outline-none focus:border-[#c5a059]"
            >
              <option value="all">{isTamil ? 'அனைத்துப் பாடங்கள்' : 'All Subjects'}</option>
              {Object.values(SUBJECT_METADATA).map((s) => (
                <option key={s.id} value={s.id}>
                  {isTamil ? s.nameTa : s.nameEn}
                </option>
              ))}
            </select>

            {/* Difficulty Filter */}
            <select
              value={selectedDifficulty}
              onChange={(e) => {
                setSelectedDifficulty(e.target.value);
                setIsAnswerRevealed(false);
                setSelectedOption(null);
              }}
              className="px-3.5 py-2.5 rounded-xl bg-[#181818] border border-[#262626] text-[#d4d4d4] font-semibold focus:outline-none focus:border-[#c5a059]"
            >
              <option value="all">{isTamil ? 'அனைத்து கடின நிலைகள்' : 'All Difficulties'}</option>
              <option value="Easy">Easy (எளியது)</option>
              <option value="Medium">Medium (நடுத்தரம்)</option>
              <option value="Hard">Hard (கடினம்)</option>
            </select>

            {/* SCERT Chapter Filter Toggle */}
            <button
              onClick={() => setShowChapterDrawer(!showChapterDrawer)}
              className={`px-3.5 py-2.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition ${
                showChapterDrawer || selectedTopicIds.length > 0
                  ? 'bg-[#c5a059] text-black border-[#c5a059] font-bold shadow-md'
                  : 'bg-[#181818] border-[#262626] text-[#d4d4d4] hover:border-[#c5a059]/40'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>
                {selectedTopicIds.length > 0 
                  ? `${selectedTopicIds.length} ${isTamil ? 'பாடங்கள்' : 'Topics'}`
                  : isTamil ? 'பாடநூல் இயல்கள்' : 'SCERT Chapters'
                }
              </span>
            </button>
          </div>
        </div>

        {/* Collapsible SCERT Chapter Selector */}
        {showChapterDrawer && (
          <div className="mt-4 pt-4 border-t border-[#262626] animate-fadeIn">
            <SCERTChapterSelector
              selectedPaper={selectedPaper}
              languageMode={languageMode}
              selectedTopicIds={selectedTopicIds}
              onSelectTopics={setSelectedTopicIds}
            />
          </div>
        )}
      </div>

      {/* Main Layout: Question Canvas & Question Navigator */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Active Question Canvas - 8 cols */}
        <div className="lg:col-span-8 bg-[#121212] border border-[#262626] rounded-2xl p-6 sm:p-7 shadow-xl space-y-6">
          {/* Metadata tags */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#262626] pb-4 text-xs">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full font-bold uppercase tracking-wider text-[10px] bg-[#c5a059]/15 text-[#c5a059] border border-[#c5a059]/30">
                {SUBJECT_METADATA[currentQ.subject].nameEn}
              </span>
              <span className="text-[#a3a3a3] font-medium">{currentQ.chapter}</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded bg-[#181818] border border-[#262626] text-[#d4d4d4] font-semibold text-[11px]">
                {currentQ.source}
              </span>
              <span className="px-2.5 py-0.5 rounded bg-[#181818] border border-[#262626] text-[#c5a059] text-[11px] font-bold">
                {currentQ.difficulty}
              </span>
            </div>
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
          <div className="space-y-3">
            {currentQ.optionsEn.map((optEn, idx) => {
              const optTa = currentQ.optionsTa[idx];
              const isSelected = selectedOption === idx;
              const isCorrect = idx === currentQ.correctOptionIndex;

              let style = 'border-[#262626] bg-[#181818] text-[#d4d4d4] hover:border-[#333333]';
              if (isAnswerRevealed) {
                if (isCorrect) {
                  style = 'border-[#22c55e] bg-[#052e16]/60 text-[#4ade80] font-bold';
                } else if (isSelected) {
                  style = 'border-[#ef4444] bg-[#450a0a]/60 text-[#fca5a5]';
                }
              } else if (isSelected) {
                style = 'border-[#c5a059] bg-[#c5a059]/10 text-white font-bold ring-1 ring-[#c5a059]';
              }

              return (
                <button
                  key={idx}
                  disabled={isAnswerRevealed}
                  onClick={() => handleSelectOption(idx)}
                  className={`w-full text-left p-3.5 rounded-xl border transition flex items-start gap-3 ${style}`}
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
                  {isAnswerRevealed && isCorrect && <CheckCircle2 className="w-5 h-5 text-[#22c55e] shrink-0 self-center" />}
                  {isAnswerRevealed && isSelected && !isCorrect && <XCircle className="w-5 h-5 text-[#ef4444] shrink-0 self-center" />}
                </button>
              );
            })}
          </div>

          {/* Solution & Distractor Note */}
          {isAnswerRevealed && (
            <div className="p-5 rounded-xl bg-[#181818] border border-[#262626] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[#c5a059] flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5" />
                  {isTamil ? 'பாடநூல் வழிகாட்டுதல் & விளக்கம்' : 'SCERT Syllabus Explanation'}
                </span>

                <button
                  onClick={() => onOpenAITutor(currentQ.topic)}
                  className="px-3.5 py-1.5 rounded-xl bg-[#1f1f1f] hover:bg-[#262626] border border-[#c5a059]/30 hover:border-[#c5a059] text-[#c5a059] font-bold text-xs flex items-center gap-1.5 shadow-lg transition"
                >
                  <Brain className="w-3.5 h-3.5" />
                  <span>{isTamil ? 'AI ஆசிரியருடன் ஆழமாக அறி' : 'Ask AI Tutor in Tamil'}</span>
                </button>
              </div>

              <p className="text-xs text-[#d4d4d4] leading-relaxed">
                {isTamil ? currentQ.explanationTa : currentQ.explanationEn}
              </p>

              {selectedOption !== currentQ.correctOptionIndex && currentQ.distractorNotes && currentQ.distractorNotes[selectedOption!] && (
                <div className="p-3 rounded-xl bg-[#450a0a]/60 border border-[#ef4444]/40 text-xs text-[#fca5a5]">
                  <strong>{isTamil ? 'பிழை வகைப்பாடு: ' : 'Error Identified: '}</strong>
                  {isTamil ? currentQ.distractorNotes[selectedOption!].ta : currentQ.distractorNotes[selectedOption!].en}
                </div>
              )}
            </div>
          )}

          {/* Canvas Actions */}
          <div className="flex items-center justify-between pt-3 border-t border-[#262626]">
            <span className="text-xs text-[#737373] font-medium">
              {currentQ.syllabusRef}
            </span>

            {!isAnswerRevealed ? (
              <button
                disabled={selectedOption === null}
                onClick={handleCheckAnswer}
                className="px-6 py-2.5 rounded-xl bg-[#c5a059] hover:bg-[#d4b068] text-[#0a0a0a] font-bold text-xs shadow-lg shadow-[#c5a059]/20 transition disabled:opacity-40"
              >
                {isTamil ? 'விடையை சரிபார்' : 'Check Answer'}
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="px-6 py-2.5 rounded-xl bg-[#c5a059] hover:bg-[#d4b068] text-[#0a0a0a] font-bold text-xs shadow-lg shadow-[#c5a059]/20 transition flex items-center gap-2"
              >
                <span>{isTamil ? 'அடுத்த வினா' : 'Next Question'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Question Bank Sidebar / Navigator - 4 cols */}
        <div className="lg:col-span-4 bg-[#121212] border border-[#262626] rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-[#262626] pb-3">
            <h3 className="text-sm font-serif font-bold text-white">
              {isTamil ? 'வினா வரிசை' : 'Question Bank'} ({filteredQuestions.length})
            </h3>
            <span className="text-xs text-[#c5a059] font-medium">PYQ Weighted</span>
          </div>

          <div className="space-y-2 max-h-[480px] overflow-y-auto pr-1">
            {filteredQuestions.map((q, idx) => {
              const isActive = q.id === currentQ.id;
              return (
                <div
                  key={q.id}
                  onClick={() => {
                    setActiveQuestionId(q.id);
                    setIsAnswerRevealed(false);
                    setSelectedOption(null);
                  }}
                  className={`p-3 rounded-xl border transition cursor-pointer flex items-center justify-between gap-2 ${
                    isActive
                      ? 'bg-[#c5a059]/10 border-[#c5a059] text-white font-bold'
                      : 'bg-[#181818] border-[#262626] text-[#a3a3a3] hover:border-[#333333] hover:text-white'
                  }`}
                >
                  <div className="space-y-0.5 truncate">
                    <div className="flex items-center gap-1.5 text-xs">
                      <span className="font-bold text-[#c5a059]">Q.{idx + 1}</span>
                      <span className="truncate">{q.concept}</span>
                    </div>
                    <div className="text-[10px] text-[#737373] truncate">{q.source}</div>
                  </div>
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-[#262626] text-[#c5a059] shrink-0">
                    {q.difficulty}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
