import React, { useState, useMemo } from 'react';
import { Question, LanguageMode, PaperType, SubjectId } from '../types';
import { PYQ_PAPERS_METADATA, PYQ_QUESTIONS_ARCHIVE } from '../data/pyqData';
import { 
  Archive, 
  CheckCircle2, 
  HelpCircle, 
  Calendar, 
  Filter, 
  Search, 
  Sparkles, 
  BookOpen, 
  Brain, 
  Bookmark, 
  Play, 
  FileText, 
  Award,
  ChevronRight,
  Eye,
  RotateCcw,
  Check,
  X
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface PYQVaultViewProps {
  selectedPaper: PaperType;
  languageMode: LanguageMode;
  onOpenAITutor: (topicName: string) => void;
  onBookmarkQuestion?: (question: Question) => void;
  bookmarkedQuestionIds?: string[];
}

export const PYQVaultView: React.FC<PYQVaultViewProps> = ({
  selectedPaper,
  languageMode,
  onOpenAITutor,
  onBookmarkQuestion,
  bookmarkedQuestionIds = [],
}) => {
  const isTamil = languageMode === 'tamil';

  // State
  const [selectedYear, setSelectedYear] = useState<number | 'all'>('all');
  const [selectedSubject, setSelectedSubject] = useState<SubjectId | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [mode, setMode] = useState<'study' | 'solve'>('study');

  // Interactive solve state
  const [userAnswers, setUserAnswers] = useState<Record<string, number>>({});
  const [revealedSolutions, setRevealedSolutions] = useState<Record<string, boolean>>({});

  // Filter questions
  const filteredQuestions = useMemo(() => {
    return PYQ_QUESTIONS_ARCHIVE.filter((q) => {
      // Paper filter
      if (selectedPaper === 'PAPER_I' && q.paper !== 'PAPER_I') {
        // Show if general or paper 1
      }
      // Year filter
      if (selectedYear !== 'all' && q.year !== selectedYear) return false;
      // Subject filter
      if (selectedSubject !== 'all' && q.subject !== selectedSubject) return false;
      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchEn = q.questionEn.toLowerCase().includes(query) || q.topic.toLowerCase().includes(query);
        const matchTa = q.questionTa.includes(query) || q.topic.includes(query);
        const matchSource = q.source.toLowerCase().includes(query);
        return matchEn || matchTa || matchSource;
      }
      return true;
    });
  }, [selectedPaper, selectedYear, selectedSubject, searchQuery]);

  const handleSelectOption = (qId: string, optIndex: number, correctIndex: number) => {
    setUserAnswers((prev) => ({ ...prev, [qId]: optIndex }));
    setRevealedSolutions((prev) => ({ ...prev, [qId]: true }));
    if (optIndex === correctIndex) {
      confetti({ particleCount: 35, spread: 50, origin: { y: 0.8 } });
    }
  };

  const handleToggleReveal = (qId: string) => {
    setRevealedSolutions((prev) => ({ ...prev, [qId]: !prev[qId] }));
  };

  const handleResetSession = () => {
    setUserAnswers({});
    setRevealedSolutions({});
  };

  // Stats calculation
  const totalInFilter = filteredQuestions.length;
  const totalAttempted = Object.keys(userAnswers).length;
  const totalCorrect = filteredQuestions.filter(
    (q) => userAnswers[q.id] === q.correctOptionIndex
  ).length;

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* 1. Header Banner */}
      <div className="bg-[#121212] border border-white/10 rounded-2xl p-5 sm:p-6 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] px-2.5 py-0.5 rounded-full bg-[#c5a059]/15 text-[#c5a059] border border-[#c5a059]/30 flex items-center gap-1">
                <Archive className="w-3 h-3" />
                {isTamil ? 'TRB முந்தைய ஆண்டு வினா வங்கி' : 'TRB Official PYQ Vault (2012–2022)'}
              </span>
              <span className="text-xs text-white/50 font-mono">
                {selectedPaper === 'PAPER_I' ? 'Paper I' : 'Paper II'}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-serif-luxury font-bold text-white">
              {isTamil 
                ? 'அசல் TRB வினாக்கள் & அதிகாரப்பூர்வ விடைக் குறிப்புகள்' 
                : 'Authentic TRB Question Bank & Official Answer Keys'}
            </h1>
            <p className="text-xs sm:text-sm text-white/60 max-w-3xl leading-relaxed">
              {isTamil
                ? 'தமிழ்நாடு ஆசிரியர் தேர்வு வாரியம் (TRB) 2012 முதல் 2022 வரை நடத்திய அசல் வினாக்கள், விளக்கங்கள் மற்றும் SCERT பாடப்புத்தக குறிப்புகள்.'
                : 'Review official TRB past papers with authentic answer keys, deep bilingual pedagogical step-by-step explanations, and SCERT references.'
              }
            </p>
          </div>

          {/* Mode Switcher */}
          <div className="flex items-center gap-2 bg-white/[0.04] p-1.5 rounded-xl border border-white/10 shrink-0">
            <button
              onClick={() => setMode('study')}
              className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
                mode === 'study'
                  ? 'bg-[#c5a059] text-black shadow-md'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>{isTamil ? 'படிப்பகம் (கற்றல்)' : 'Study & Solutions'}</span>
            </button>
            <button
              onClick={() => setMode('solve')}
              className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
                mode === 'solve'
                  ? 'bg-[#c5a059] text-black shadow-md'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>{isTamil ? 'தேர்வு முறை (பயிற்சி)' : 'Interactive Solve'}</span>
            </button>
          </div>
        </div>

        {/* Paper Archive Highlights Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 mt-5 pt-4 border-t border-white/[0.06]">
          {PYQ_PAPERS_METADATA.map((p) => (
            <button
              key={p.id}
              onClick={() => setSelectedYear(selectedYear === p.year ? 'all' : p.year)}
              className={`p-2.5 rounded-xl border text-left transition ${
                selectedYear === p.year
                  ? 'bg-[#c5a059]/15 border-[#c5a059] text-white shadow-lg ring-1 ring-[#c5a059]/40'
                  : 'bg-white/[0.02] border-white/[0.06] text-white/70 hover:border-white/20'
              }`}
            >
              <div className="flex items-center justify-between text-[10px] font-mono text-[#c5a059]">
                <span>{p.year} Exam</span>
                <span className="text-[9px] text-white/40">{p.paper === 'PAPER_I' ? 'P-I' : 'P-II'}</span>
              </div>
              <div className="font-semibold text-xs text-white truncate mt-0.5">
                {isTamil ? p.sessionTitleTa : p.sessionTitleEn}
              </div>
              <div className="text-[9px] text-white/40 truncate mt-0.5">
                {p.officialExamDate}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* 2. Filter & Search Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-[#141414] border border-white/10 p-3 rounded-xl">
        <div className="flex flex-wrap items-center gap-2">
          {/* Year Filter */}
          <div className="flex items-center gap-1 bg-white/[0.03] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white">
            <Calendar className="w-3.5 h-3.5 text-[#c5a059]" />
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value === 'all' ? 'all' : Number(e.target.value))}
              className="bg-transparent text-white text-xs font-medium focus:outline-none cursor-pointer"
            >
              <option value="all" className="bg-[#181818]">{isTamil ? 'அனைத்து ஆண்டுகள்' : 'All Years'}</option>
              <option value="2022" className="bg-[#181818]">2022 CBT Exam</option>
              <option value="2019" className="bg-[#181818]">2019 OMR Paper</option>
              <option value="2017" className="bg-[#181818]">2017 Standard Paper</option>
              <option value="2013" className="bg-[#181818]">2013 Historic Drive</option>
            </select>
          </div>

          {/* Subject Filter */}
          <div className="flex items-center gap-1 bg-white/[0.03] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white">
            <Filter className="w-3.5 h-3.5 text-emerald-400" />
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value as any)}
              className="bg-transparent text-white text-xs font-medium focus:outline-none cursor-pointer"
            >
              <option value="all" className="bg-[#181818]">{isTamil ? 'அனைத்து பாடங்களும்' : 'All Subjects'}</option>
              <option value="cdp" className="bg-[#181818]">{isTamil ? 'குழந்தை மேம்பாடு (CDP)' : 'Child Development & Pedagogy'}</option>
              <option value="tamil" className="bg-[#181818]">{isTamil ? 'தமிழ் (Tamil)' : 'Tamil Language I'}</option>
              <option value="english" className="bg-[#181818]">{isTamil ? 'ஆங்கிலம் (English)' : 'English Language II'}</option>
              <option value="maths" className="bg-[#181818]">{isTamil ? 'கணிதம் (Maths)' : 'Mathematics'}</option>
              <option value="science" className="bg-[#181818]">{isTamil ? 'அறிவியல் (Science)' : 'Science'}</option>
              <option value="evs" className="bg-[#181818]">{isTamil ? 'சூழ்நிலையியல் (EVS)' : 'EVS'}</option>
            </select>
          </div>

          {/* Reset session button in solve mode */}
          {mode === 'solve' && totalAttempted > 0 && (
            <button
              onClick={handleResetSession}
              className="px-2.5 py-1.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-xs text-white/70 hover:text-white flex items-center gap-1 transition"
            >
              <RotateCcw className="w-3 h-3" />
              <span>{isTamil ? 'மறுதொடக்கம்' : 'Reset'}</span>
            </button>
          )}
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-72">
          <Search className="w-3.5 h-3.5 text-white/40 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={isTamil ? 'வினா அல்லது தலைப்பை தேடுக...' : 'Search PYQ topics or keywords...'}
            className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/10 text-xs text-white placeholder-white/40 focus:outline-none focus:border-[#c5a059]"
          />
        </div>
      </div>

      {/* 3. Interactive Solve Stats Bar (When in solve mode) */}
      {mode === 'solve' && (
        <div className="p-4 rounded-xl bg-gradient-to-r from-[#171717] to-[#141414] border border-white/10 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#c5a059]/10 border border-[#c5a059]/30 flex items-center justify-center text-[#c5a059]">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-semibold text-white">
                {isTamil ? 'பயிற்சி செயல்திறன்' : 'Solve Mode Session Progress'}
              </div>
              <div className="text-[11px] text-white/50">
                {totalAttempted} / {totalInFilter} {isTamil ? 'முயன்ற வினாக்கள்' : 'Attempted'}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono">
            <div className="px-3 py-1 rounded-lg bg-emerald-950/40 border border-emerald-800/40 text-emerald-400">
              {isTamil ? 'சரியானவை:' : 'Correct:'} <strong>{totalCorrect}</strong>
            </div>
            <div className="px-3 py-1 rounded-lg bg-rose-950/40 border border-rose-800/40 text-rose-400">
              {isTamil ? 'தவறானவை:' : 'Incorrect:'} <strong>{totalAttempted - totalCorrect}</strong>
            </div>
            <div className="px-3 py-1 rounded-lg bg-[#c5a059]/10 border border-[#c5a059]/30 text-[#c5a059]">
              {isTamil ? 'துல்லியம்:' : 'Accuracy:'} <strong>{totalAttempted > 0 ? Math.round((totalCorrect / totalAttempted) * 100) : 0}%</strong>
            </div>
          </div>
        </div>
      )}

      {/* 4. Questions List */}
      <div className="space-y-4">
        {filteredQuestions.length === 0 ? (
          <div className="bg-[#121212] border border-white/10 rounded-2xl p-12 text-center space-y-3">
            <BookOpen className="w-8 h-8 text-[#c5a059] mx-auto opacity-70" />
            <h3 className="text-base font-semibold text-white">
              {isTamil ? 'வினாக்கள் ஏதும் கிடைக்கவில்லை' : 'No PYQ Questions Match Filter'}
            </h3>
            <p className="text-xs text-white/50 max-w-md mx-auto">
              {isTamil ? 'வடிப்பானை மாற்றி அல்லது வேறு சொல்லைப் பயன்படுத்தி தேடவும்.' : 'Try changing your subject/year filter or clear your search keywords.'}
            </p>
            <button
              onClick={() => { setSelectedYear('all'); setSelectedSubject('all'); setSearchQuery(''); }}
              className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/15 text-xs text-white transition font-medium"
            >
              {isTamil ? 'அனைத்து வினாக்களையும் காட்டு' : 'Reset All Filters'}
            </button>
          </div>
        ) : (
          filteredQuestions.map((q, idx) => {
            const isAnswered = userAnswers[q.id] !== undefined;
            const selectedOpt = userAnswers[q.id];
            const isCorrect = selectedOpt === q.correctOptionIndex;
            const isRevealed = mode === 'study' || revealedSolutions[q.id];
            const isBookmarked = bookmarkedQuestionIds.includes(q.id);

            return (
              <div
                key={q.id}
                id={`pyq-card-${q.id}`}
                className={`bg-[#121212] border rounded-xl p-5 shadow-lg transition duration-200 ${
                  isAnswered
                    ? isCorrect
                      ? 'border-emerald-500/40 bg-emerald-950/[0.04]'
                      : 'border-rose-500/40 bg-rose-950/[0.04]'
                    : 'border-white/10 hover:border-white/20'
                }`}
              >
                {/* Card Top Strip */}
                <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-3 border-b border-white/[0.06]">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#c5a059]/15 text-[#c5a059] border border-[#c5a059]/30">
                      Q.{idx + 1}
                    </span>
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-white/[0.05] text-white/70 border border-white/10">
                      {q.source}
                    </span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-purple-950/40 text-purple-300 border border-purple-800/40">
                      {q.subject.toUpperCase()}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {onBookmarkQuestion && (
                      <button
                        onClick={() => onBookmarkQuestion(q)}
                        className={`p-1.5 rounded-lg border text-xs transition flex items-center gap-1 ${
                          isBookmarked
                            ? 'bg-[#c5a059]/20 border-[#c5a059] text-[#c5a059]'
                            : 'bg-white/[0.03] border-white/10 text-white/50 hover:text-white'
                        }`}
                        title={isBookmarked ? 'Bookmarked in Weakness Vault' : 'Save to Weakness Vault'}
                      >
                        <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-current' : ''}`} />
                      </button>
                    )}

                    <button
                      onClick={() => onOpenAITutor(q.topic)}
                      className="px-2 py-1 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-white text-xs border border-white/10 transition flex items-center gap-1"
                      title="Ask AI Pedagogical Tutor"
                    >
                      <Brain className="w-3.5 h-3.5 text-[#c5a059]" />
                      <span className="hidden sm:inline">{isTamil ? 'AI விளக்கம்' : 'AI Tutor'}</span>
                    </button>
                  </div>
                </div>

                {/* Question Statement */}
                <div className="space-y-1.5 mb-4">
                  <h3 className="text-sm sm:text-base font-semibold text-white leading-relaxed">
                    {isTamil ? q.questionTa : q.questionEn}
                  </h3>
                  {languageMode === 'bilingual' && (
                    <p className="text-xs text-white/60 leading-relaxed font-light">
                      {q.questionEn}
                    </p>
                  )}
                </div>

                {/* Options */}
                <div className="space-y-2 mb-4">
                  {q.optionsEn.map((optEn, optIdx) => {
                    const optTa = q.optionsTa[optIdx];
                    const isOptionSelected = selectedOpt === optIdx;
                    const isOptionCorrect = optIdx === q.correctOptionIndex;

                    let optStyle = 'border-white/10 bg-white/[0.02] text-white/80 hover:bg-white/[0.05] hover:border-white/20';

                    if (isRevealed) {
                      if (isOptionCorrect) {
                        optStyle = 'border-emerald-500/60 bg-emerald-950/40 text-emerald-300 font-semibold ring-1 ring-emerald-500/30';
                      } else if (isOptionSelected && !isOptionCorrect) {
                        optStyle = 'border-rose-500/60 bg-rose-950/40 text-rose-300 ring-1 ring-rose-500/30';
                      }
                    } else if (isOptionSelected) {
                      optStyle = 'border-[#c5a059] bg-[#c5a059]/10 text-white font-bold ring-1 ring-[#c5a059]';
                    }

                    return (
                      <button
                        key={optIdx}
                        disabled={mode === 'study'}
                        onClick={() => handleSelectOption(q.id, optIdx, q.correctOptionIndex)}
                        className={`w-full p-3 rounded-lg border text-left text-xs sm:text-sm transition flex items-center justify-between gap-3 ${optStyle}`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="w-5 h-5 rounded-full border border-white/20 flex items-center justify-center text-[10px] font-mono shrink-0">
                            {String.fromCharCode(65 + optIdx)}
                          </span>
                          <span>{isTamil ? optTa : optEn}</span>
                        </div>

                        {isRevealed && isOptionCorrect && (
                          <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 shrink-0">
                            <Check className="w-3 h-3" />
                            {isTamil ? 'அதிகாரப்பூர்வ விடை' : 'TRB Key'}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Explanation Drawer / Reveal Button */}
                {mode === 'solve' && !isRevealed && (
                  <button
                    onClick={() => handleToggleReveal(q.id)}
                    className="text-xs text-[#c5a059] hover:underline flex items-center gap-1 font-medium transition"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>{isTamil ? 'அதிகாரப்பூர்வ விடை & விளக்கம் பார்க்க' : 'Reveal TRB Solution & Explanation'}</span>
                  </button>
                )}

                {isRevealed && (
                  <div className="mt-3 p-3.5 rounded-lg bg-white/[0.02] border border-[#c5a059]/30 space-y-2 animate-in fade-in duration-200">
                    <div className="flex items-center justify-between text-xs text-[#c5a059] font-semibold">
                      <span className="flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5" />
                        {isTamil ? 'அதிகாரப்பூர்வ தீர்வு & கருத்து விளக்கம்:' : 'Official TRB Pedagogical Solution:'}
                      </span>
                      <span className="text-[10px] font-mono text-white/40">{q.syllabusRef}</span>
                    </div>

                    <p className="text-xs text-white/80 leading-relaxed font-light">
                      {isTamil ? q.explanationTa : q.explanationEn}
                    </p>

                    <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between text-[11px] text-white/50">
                      <span>💡 <strong>{isTamil ? 'முக்கிய விதி:' : 'Core Rule:'}</strong> {isTamil ? q.conceptSummaryTa : q.conceptSummaryEn}</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
