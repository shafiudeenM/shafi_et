import React, { useState } from 'react';
import { 
  MistakeQueueItem, 
  LanguageMode, 
  ErrorType, 
  Question,
  SubjectId 
} from '../types';
import { 
  AlertCircle, 
  RotateCcw, 
  CheckCircle, 
  Brain, 
  Sparkles, 
  Filter, 
  Trash2, 
  BookOpen, 
  Bookmark,
  Award,
  Zap,
  HelpCircle,
  FileText,
  Search,
  Check,
  X,
  Layers
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface MistakeQueueViewProps {
  mistakes: MistakeQueueItem[];
  languageMode: LanguageMode;
  onRetestMistake: (mistakeId: string, isCorrect: boolean) => void;
  onOpenAITutor: (topicName: string) => void;
  onRemoveMistake?: (mistakeId: string) => void;
  bookmarkedQuestions?: Question[];
}

export const MistakeQueueView: React.FC<MistakeQueueViewProps> = ({
  mistakes,
  languageMode,
  onRetestMistake,
  onOpenAITutor,
  onRemoveMistake,
  bookmarkedQuestions = [],
}) => {
  const isTamil = languageMode === 'tamil';

  // Filters
  const [selectedTab, setSelectedTab] = useState<'active' | 'resolved' | 'bookmarks' | 'all'>('active');
  const [selectedErrorFilter, setSelectedErrorFilter] = useState<ErrorType | 'all'>('all');
  const [selectedSubject, setSelectedSubject] = useState<SubjectId | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Retest modal / state
  const [activeRetestItem, setActiveRetestItem] = useState<MistakeQueueItem | null>(null);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isRetestChecked, setIsRetestChecked] = useState(false);

  // Candidate custom notes per mistake
  const [candidateNotes, setCandidateNotes] = useState<Record<string, string>>(() => {
    const saved = localStorage.getItem('tntet_mistake_notes');
    return saved ? JSON.parse(saved) : {};
  });

  const handleSaveNote = (id: string, text: string) => {
    const next = { ...candidateNotes, [id]: text };
    setCandidateNotes(next);
    localStorage.setItem('tntet_mistake_notes', JSON.stringify(next));
  };

  const handleStartRetest = (item: MistakeQueueItem) => {
    setActiveRetestItem(item);
    setSelectedOption(null);
    setIsRetestChecked(false);
  };

  const handleConfirmRetest = () => {
    if (!activeRetestItem || selectedOption === null) return;
    setIsRetestChecked(true);
    const isCorrect = selectedOption === activeRetestItem.question.correctOptionIndex;
    if (isCorrect) {
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.85 } });
    }
    onRetestMistake(activeRetestItem.id, isCorrect);
  };

  // Error label configuration
  const errorLabels: Record<ErrorType, { en: string; ta: string; color: string }> = {
    concept_confusion: { en: 'Concept Confusion', ta: 'கருத்து தெளிவின்மை', color: 'bg-rose-950/60 text-rose-300 border-rose-800/40' },
    knowledge_gap: { en: 'Knowledge Gap', ta: 'அறிவுக் குறைபாடு', color: 'bg-[#c5a059]/15 text-[#c5a059] border border-[#c5a059]/30' },
    misread_question: { en: 'Misread Question', ta: 'வினாவை தவறாக வாசித்தல்', color: 'bg-sky-950/60 text-sky-300 border-sky-800/40' },
    careless_error: { en: 'Careless Error', ta: 'கவனக்குறைவு பிழை', color: 'bg-indigo-950/60 text-indigo-300 border-indigo-800/40' },
    time_pressure: { en: 'Time Pressure', ta: 'நேர நெருக்கடி', color: 'bg-purple-950/60 text-purple-300 border-purple-800/40' },
  };

  // Filter items
  const filteredMistakes = mistakes.filter((m) => {
    if (selectedTab === 'active' && m.isResolved) return false;
    if (selectedTab === 'resolved' && !m.isResolved) return false;
    if (selectedErrorFilter !== 'all' && m.lastInteraction.detectedErrorType !== selectedErrorFilter) return false;
    if (selectedSubject !== 'all' && m.question.subject !== selectedSubject) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchEn = m.question.questionEn.toLowerCase().includes(q) || m.question.topic.toLowerCase().includes(q);
      const matchTa = m.question.questionTa.includes(q) || m.question.topic.includes(q);
      return matchEn || matchTa;
    }
    return true;
  });

  const activeCount = mistakes.filter((m) => !m.isResolved).length;
  const resolvedCount = mistakes.filter((m) => m.isResolved).length;

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      {/* 1. Top Banner */}
      <div className="bg-[#121212] border border-white/10 rounded-2xl p-5 sm:p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] px-2.5 py-0.5 rounded-full bg-rose-950/60 text-rose-300 border border-rose-800/40 flex items-center gap-1">
                <Bookmark className="w-3 h-3 fill-current" />
                {isTamil ? 'எனது பலவீன பெட்டகம்' : 'My Weakness Vault & Notebook'}
              </span>
              <span className="text-xs text-white/50 font-mono">
                {activeCount} {isTamil ? 'நிலுவையில் உள்ளவை' : 'Active Gaps'} · {resolvedCount} {isTamil ? 'தீர்க்கப்பட்டவை' : 'Resolved'}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-serif-luxury font-bold text-white">
              {isTamil ? 'பிழைகளை நிரந்தர நினைவாற்றலாக மாற்றுதல்' : 'Converting Errors into Permanent Retention'}
            </h1>
            <p className="text-xs sm:text-sm text-white/60 max-w-2xl leading-relaxed">
              {isTamil
                ? 'பயிற்சிகள் மற்றும் தேர்வுகளில் தவறான விடைகள் மற்றும் நீங்கள் சேமித்த வினாக்கள் இங்கு வகைப்படுத்தப்பட்டுள்ளன.'
                : 'Every wrong answer is automatically cataloged with error tags and distractor breakdowns so you can achieve 100% mastery.'
              }
            </p>
          </div>

          {/* Rapid Retest Blitz Button */}
          {activeMistakesLength(mistakes) > 0 && (
            <button
              onClick={() => {
                const firstActive = mistakes.find((m) => !m.isResolved);
                if (firstActive) handleStartRetest(firstActive);
              }}
              className="px-4 py-2.5 rounded-xl bg-[#c5a059] hover:bg-[#d8b56f] text-black font-bold text-xs uppercase tracking-wider transition flex items-center gap-2 shadow-lg shrink-0"
            >
              <Zap className="w-4 h-4 fill-black" />
              <span>{isTamil ? 'மறுதேர்வு தொடங்கு' : 'Start Retest Blitz'}</span>
            </button>
          )}
        </div>

        {/* Status Counters */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-5 pt-4 border-t border-white/[0.06]">
          <button
            onClick={() => setSelectedTab('active')}
            className={`p-3 rounded-xl border text-left transition ${
              selectedTab === 'active'
                ? 'bg-rose-950/30 border-rose-600/50 text-white'
                : 'bg-white/[0.02] border-white/[0.06] text-white/60 hover:text-white'
            }`}
          >
            <div className="text-[10px] uppercase tracking-wider font-semibold text-rose-400">
              {isTamil ? 'தீர்க்கப்படாத பிழைகள்' : 'Active Errors'}
            </div>
            <div className="text-lg font-bold text-white font-mono mt-0.5">{activeCount}</div>
          </button>

          <button
            onClick={() => setSelectedTab('resolved')}
            className={`p-3 rounded-xl border text-left transition ${
              selectedTab === 'resolved'
                ? 'bg-emerald-950/30 border-emerald-600/50 text-white'
                : 'bg-white/[0.02] border-white/[0.06] text-white/60 hover:text-white'
            }`}
          >
            <div className="text-[10px] uppercase tracking-wider font-semibold text-emerald-400">
              {isTamil ? 'சரிசெய்யப்பட்டவை' : 'Resolved Mastery'}
            </div>
            <div className="text-lg font-bold text-white font-mono mt-0.5">{resolvedCount}</div>
          </button>

          <button
            onClick={() => setSelectedTab('all')}
            className={`p-3 rounded-xl border text-left transition ${
              selectedTab === 'all'
                ? 'bg-white/10 border-white/30 text-white'
                : 'bg-white/[0.02] border-white/[0.06] text-white/60 hover:text-white'
            }`}
          >
            <div className="text-[10px] uppercase tracking-wider font-semibold text-[#c5a059]">
              {isTamil ? 'அனைத்து பதிவுகள்' : 'All Vault Items'}
            </div>
            <div className="text-lg font-bold text-white font-mono mt-0.5">{mistakes.length}</div>
          </button>

          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] text-left">
            <div className="text-[10px] uppercase tracking-wider font-semibold text-white/40">
              {isTamil ? 'வெற்றி விகிதம்' : 'Recovery Rate'}
            </div>
            <div className="text-lg font-bold text-emerald-400 font-mono mt-0.5">
              {mistakes.length > 0 ? Math.round((resolvedCount / mistakes.length) * 100) : 0}%
            </div>
          </div>
        </div>
      </div>

      {/* 2. Search & Filter Strip */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-[#141414] border border-white/10 p-3 rounded-xl">
        <div className="flex flex-wrap items-center gap-2">
          {/* Error Type Filter */}
          <div className="flex items-center gap-1 bg-white/[0.03] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white">
            <Filter className="w-3.5 h-3.5 text-[#c5a059]" />
            <select
              value={selectedErrorFilter}
              onChange={(e) => setSelectedErrorFilter(e.target.value as any)}
              className="bg-transparent text-white text-xs font-medium focus:outline-none cursor-pointer"
            >
              <option value="all" className="bg-[#181818]">{isTamil ? 'அனைத்து பிழை வகைகள்' : 'All Error Categories'}</option>
              <option value="concept_confusion" className="bg-[#181818]">{isTamil ? 'கருத்து தெளிவின்மை' : 'Concept Confusion'}</option>
              <option value="knowledge_gap" className="bg-[#181818]">{isTamil ? 'அறிவுக் குறைபாடு' : 'Knowledge Gap'}</option>
              <option value="misread_question" className="bg-[#181818]">{isTamil ? 'வினா தவறாக வாசித்தல்' : 'Misread Question'}</option>
              <option value="careless_error" className="bg-[#181818]">{isTamil ? 'கவனக்குறைவு பிழை' : 'Careless Error'}</option>
              <option value="time_pressure" className="bg-[#181818]">{isTamil ? 'நேர நெருக்கடி' : 'Time Pressure'}</option>
            </select>
          </div>

          {/* Subject Filter */}
          <div className="flex items-center gap-1 bg-white/[0.03] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white">
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value as any)}
              className="bg-transparent text-white text-xs font-medium focus:outline-none cursor-pointer"
            >
              <option value="all" className="bg-[#181818]">{isTamil ? 'அனைத்து பாடங்கள்' : 'All Subjects'}</option>
              <option value="cdp" className="bg-[#181818]">CDP</option>
              <option value="tamil" className="bg-[#181818]">Tamil</option>
              <option value="english" className="bg-[#181818]">English</option>
              <option value="maths" className="bg-[#181818]">Maths</option>
              <option value="science" className="bg-[#181818]">Science</option>
              <option value="evs" className="bg-[#181818]">EVS</option>
            </select>
          </div>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search className="w-3.5 h-3.5 text-white/40 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={isTamil ? 'தேடவும்...' : 'Search mistake vault...'}
            className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/10 text-xs text-white placeholder-white/40 focus:outline-none focus:border-[#c5a059]"
          />
        </div>
      </div>

      {/* 3. Retest Modal / Overlay */}
      {activeRetestItem && (
        <div className="fixed inset-0 z-50 bg-[#0a0a0a]/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#121212] border border-white/15 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-[#c5a059] flex items-center gap-1.5">
                <RotateCcw className="w-4 h-4" />
                {isTamil ? 'மறுபயிற்சி சோதனை' : 'Concept Re-Check Challenge'}
              </span>
              <button
                onClick={() => setActiveRetestItem(null)}
                className="text-xs text-white/50 hover:text-white font-bold"
              >
                ✕ {isTamil ? 'மூடு' : 'Close'}
              </button>
            </div>

            <div className="space-y-2">
              <p className="text-base font-bold text-white leading-relaxed">
                {isTamil ? activeRetestItem.question.questionTa : activeRetestItem.question.questionEn}
              </p>
              {languageMode === 'bilingual' && (
                <p className="text-xs text-white/50 leading-relaxed font-light">
                  {activeRetestItem.question.questionEn}
                </p>
              )}
            </div>

            <div className="space-y-2.5">
              {activeRetestItem.question.optionsEn.map((optEn, idx) => {
                const optTa = activeRetestItem.question.optionsTa[idx];
                const isSelected = selectedOption === idx;
                const isCorrect = idx === activeRetestItem.question.correctOptionIndex;

                let style = 'border-white/10 bg-white/[0.02] text-white/80';
                if (isRetestChecked) {
                  if (isCorrect) style = 'border-emerald-500 bg-emerald-950/60 text-emerald-300 font-bold';
                  else if (isSelected) style = 'border-rose-500 bg-rose-950/60 text-rose-300';
                } else if (isSelected) {
                  style = 'border-[#c5a059] bg-[#c5a059]/10 text-white font-bold ring-1 ring-[#c5a059]';
                }

                return (
                  <button
                    key={idx}
                    disabled={isRetestChecked}
                    onClick={() => setSelectedOption(idx)}
                    className={`w-full p-3 rounded-lg border text-left text-xs sm:text-sm transition flex items-center justify-between gap-3 ${style}`}
                  >
                    <span>{isTamil ? optTa : optEn}</span>
                    {isRetestChecked && isCorrect && <Check className="w-4 h-4 text-emerald-400 shrink-0" />}
                    {isRetestChecked && isSelected && !isCorrect && <X className="w-4 h-4 text-rose-400 shrink-0" />}
                  </button>
                );
              })}
            </div>

            {/* Check Button or Post-Check Resolution */}
            <div className="pt-2 flex items-center justify-between">
              {!isRetestChecked ? (
                <button
                  disabled={selectedOption === null}
                  onClick={handleConfirmRetest}
                  className="w-full py-2.5 rounded-xl bg-[#c5a059] disabled:opacity-40 text-black font-bold text-xs uppercase tracking-wider transition"
                >
                  {isTamil ? 'விடையைச் சரிபார்' : 'Verify Answer'}
                </button>
              ) : (
                <div className="w-full space-y-3">
                  <div className={`p-3 rounded-lg text-xs leading-relaxed ${
                    selectedOption === activeRetestItem.question.correctOptionIndex
                      ? 'bg-emerald-950/40 text-emerald-300 border border-emerald-800/40'
                      : 'bg-rose-950/40 text-rose-300 border border-rose-800/40'
                  }`}>
                    <strong>{selectedOption === activeRetestItem.question.correctOptionIndex ? (isTamil ? '✅ சரியானது! பிழை சரிசெய்யப்பட்டது.' : '✅ Correct! Concept gap resolved.') : (isTamil ? '❌ மீண்டும் தவறாக உள்ளது. கீழே உள்ள விளக்கத்தைப் பார்க்கவும்.' : '❌ Still incorrect. Review explanation below.')}</strong>
                    <p className="mt-1 text-white/70">
                      {isTamil ? activeRetestItem.question.explanationTa : activeRetestItem.question.explanationEn}
                    </p>
                  </div>

                  <button
                    onClick={() => setActiveRetestItem(null)}
                    className="w-full py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white font-medium text-xs transition"
                  >
                    {isTamil ? 'முடிந்தது' : 'Done & Return'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 4. Mistakes List */}
      <div className="space-y-4">
        {filteredMistakes.length === 0 ? (
          <div className="bg-[#121212] border border-white/10 rounded-2xl p-12 text-center space-y-3">
            <CheckCircle className="w-10 h-10 text-emerald-400 mx-auto opacity-70" />
            <h3 className="text-base font-semibold text-white">
              {isTamil ? 'அனைத்து பிழைகளும் சரிசெய்யப்பட்டுள்ளன!' : 'No Active Weaknesses in this Filter!'}
            </h3>
            <p className="text-xs text-white/50 max-w-md mx-auto">
              {isTamil ? 'நீங்கள் அனைத்து பிழைகளையும் சிறப்பாக சரிசெய்துள்ளீர்கள்.' : 'Your retention on these topics is solid. Continue workouts to maintain mastery.'}
            </p>
          </div>
        ) : (
          filteredMistakes.map((item) => {
            const errType = item.lastInteraction.detectedErrorType || 'concept_confusion';
            const errBadge = errorLabels[errType] || errorLabels.concept_confusion;
            const candidateNote = candidateNotes[item.id] || '';

            return (
              <div
                key={item.id}
                className={`bg-[#121212] border rounded-xl p-5 shadow-lg space-y-3 transition duration-200 ${
                  item.isResolved 
                    ? 'border-emerald-500/30 bg-emerald-950/[0.02]' 
                    : 'border-white/10 hover:border-white/20'
                }`}
              >
                {/* Top Strip */}
                <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-white/[0.06]">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${errBadge.color}`}>
                      {isTamil ? errBadge.ta : errBadge.en}
                    </span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-white/[0.04] text-white/60 border border-white/10">
                      {item.question.subject.toUpperCase()}
                    </span>
                    <span className="text-[10px] text-white/40 font-mono">
                      Retests: {item.retestCount}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {item.isResolved ? (
                      <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold flex items-center gap-1">
                        <Check className="w-3 h-3" />
                        {isTamil ? 'தீர்க்கப்பட்டது' : 'Resolved'}
                      </span>
                    ) : (
                      <button
                        onClick={() => handleStartRetest(item)}
                        className="px-3 py-1 rounded-lg bg-[#c5a059] hover:bg-[#d8b56f] text-black font-semibold text-xs transition flex items-center gap-1"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>{isTamil ? 'மீண்டும் செய்' : 'Re-Test'}</span>
                      </button>
                    )}

                    <button
                      onClick={() => onOpenAITutor(item.question.topic)}
                      className="px-2 py-1 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-white text-xs border border-white/10 transition flex items-center gap-1"
                    >
                      <Brain className="w-3.5 h-3.5 text-[#c5a059]" />
                      <span className="hidden sm:inline">{isTamil ? 'AI ஆசிரியர்' : 'AI Tutor'}</span>
                    </button>
                  </div>
                </div>

                {/* Question Text */}
                <div>
                  <h3 className="text-sm font-semibold text-white leading-relaxed">
                    {isTamil ? item.question.questionTa : item.question.questionEn}
                  </h3>
                  {languageMode === 'bilingual' && (
                    <p className="text-xs text-white/50 mt-0.5 leading-relaxed font-light">
                      {item.question.questionEn}
                    </p>
                  )}
                </div>

                {/* Core Explanation Box */}
                <div className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.06] text-xs text-white/70 space-y-1">
                  <div className="text-[10px] uppercase font-bold text-[#c5a059]">
                    {isTamil ? 'சரியான விடை விளக்கம்:' : 'Official Explanation:'}
                  </div>
                  <p className="leading-relaxed">
                    {isTamil ? item.question.explanationTa : item.question.explanationEn}
                  </p>
                </div>

                {/* Candidate Personal Note Input */}
                <div className="pt-2 flex items-center gap-2">
                  <input
                    type="text"
                    value={candidateNote}
                    onChange={(e) => handleSaveNote(item.id, e.target.value)}
                    placeholder={isTamil ? 'எனது திருப்புதல் குறிப்பு (எ.கா: சூத்திரம் நினைவில் கொள்ளவும்)...' : 'My personal cue/memory note for this question...'}
                    className="flex-1 px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/10 text-xs text-white placeholder-white/30 focus:outline-none focus:border-[#c5a059]"
                  />
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

function activeMistakesLength(mistakes: MistakeQueueItem[]) {
  return mistakes.filter((m) => !m.isResolved).length;
}
