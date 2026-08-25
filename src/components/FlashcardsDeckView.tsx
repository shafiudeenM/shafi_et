import React, { useState, useEffect, useMemo } from 'react';
import { SubjectId, LanguageMode } from '../types';
import { FLASHCARDS_DECK, Flashcard } from '../data/flashcardsData';
import { 
  Sparkles, 
  RotateCw, 
  CheckCircle2, 
  XCircle, 
  Volume2, 
  VolumeX, 
  Shuffle, 
  Layers, 
  Clock, 
  Brain, 
  Flame, 
  Filter, 
  ChevronLeft, 
  ChevronRight,
  BookOpen,
  Award
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface FlashcardsDeckViewProps {
  languageMode: LanguageMode;
  onOpenAITutor: (topicName: string) => void;
}

export const FlashcardsDeckView: React.FC<FlashcardsDeckViewProps> = ({
  languageMode,
  onOpenAITutor,
}) => {
  const isTamil = languageMode === 'tamil';

  // Filters
  const [selectedSubject, setSelectedSubject] = useState<SubjectId | 'all'>('all');
  const [selectedFrequency, setSelectedFrequency] = useState<string>('all');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  // Spaced repetition state
  const [knownCards, setKnownCards] = useState<Set<string>>(() => {
    const saved = localStorage.getItem('tntet_flashcards_known');
    return saved ? new Set(JSON.parse(saved)) : new Set();
  });
  const [streak, setStreak] = useState(0);

  // Timed auto-flip mode
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(15);

  // Speech state
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Filtered deck
  const deck = useMemo(() => {
    return FLASHCARDS_DECK.filter((card) => {
      if (selectedSubject !== 'all' && card.subjectId !== selectedSubject) return false;
      if (selectedFrequency !== 'all' && card.examFrequency !== selectedFrequency) return false;
      return true;
    });
  }, [selectedSubject, selectedFrequency]);

  const currentCard: Flashcard | undefined = deck[currentIndex] || deck[0];

  // Save known cards to storage
  useEffect(() => {
    localStorage.setItem('tntet_flashcards_known', JSON.stringify(Array.from(knownCards)));
  }, [knownCards]);

  // Handle auto timer
  useEffect(() => {
    if (!isTimerActive) return;
    if (timeLeft <= 0) {
      setIsFlipped(true);
      return;
    }
    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [isTimerActive, timeLeft]);

  // Reset flip & timer on card change
  const goToCard = (index: number) => {
    setIsFlipped(false);
    setCurrentIndex(index);
    setTimeLeft(15);
  };

  const handleNext = () => {
    if (currentIndex < deck.length - 1) {
      goToCard(currentIndex + 1);
    } else {
      goToCard(0);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      goToCard(currentIndex - 1);
    } else {
      goToCard(deck.length - 1);
    }
  };

  const handleShuffle = () => {
    goToCard(Math.floor(Math.random() * deck.length));
  };

  const handleMarkKnown = (cardId: string) => {
    setKnownCards((prev) => {
      const next = new Set(prev);
      next.add(cardId);
      return next;
    });
    setStreak((prev) => prev + 1);
    confetti({ particleCount: 30, spread: 45, origin: { y: 0.85 } });
    setTimeout(handleNext, 350);
  };

  const handleMarkUnknown = (cardId: string) => {
    setKnownCards((prev) => {
      const next = new Set(prev);
      next.delete(cardId);
      return next;
    });
    setStreak(0);
    setTimeout(handleNext, 350);
  };

  const handleSpeak = (text: string) => {
    if (!('speechSynthesis' in window)) return;
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = isTamil ? 'ta-IN' : 'en-US';
    utterance.rate = 0.95;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  if (!currentCard) {
    return (
      <div className="max-w-4xl mx-auto p-12 text-center bg-[#121212] border border-white/10 rounded-2xl">
        <Layers className="w-10 h-10 text-[#c5a059] mx-auto opacity-70 mb-3" />
        <h3 className="text-base font-semibold text-white">No cards in this filter</h3>
        <button
          onClick={() => { setSelectedSubject('all'); setSelectedFrequency('all'); }}
          className="mt-3 px-4 py-2 rounded-lg bg-[#c5a059] text-black font-semibold text-xs"
        >
          Reset Deck Filters
        </button>
      </div>
    );
  }

  const isCurrentKnown = knownCards.has(currentCard.id);
  const masteryPercent = deck.length > 0 ? Math.round((knownCards.size / deck.length) * 100) : 0;

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      {/* 1. Header Strip */}
      <div className="bg-[#121212] border border-white/10 rounded-2xl p-5 sm:p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] px-2.5 py-0.5 rounded-full bg-[#c5a059]/15 text-[#c5a059] border border-[#c5a059]/30 flex items-center gap-1">
                <Brain className="w-3 h-3" />
                {isTamil ? 'நினைவாற்றல் அட்டைப் பெட்டி' : 'Spaced Repetition Flashcard Deck'}
              </span>
              <div className="flex items-center gap-1 text-xs font-mono text-amber-400 bg-amber-950/40 px-2 py-0.5 rounded border border-amber-800/40">
                <Flame className="w-3.5 h-3.5 fill-current" />
                <span>{streak} Streak</span>
              </div>
            </div>
            <h1 className="text-xl sm:text-2xl font-serif-luxury font-bold text-white">
              {isTamil ? 'சூத்திரங்கள் & முக்கிய கருத்துகளின் உடனடி மீள்பார்வை' : 'High-Yield Formula & Rule Revision'}
            </h1>
            <p className="text-xs sm:text-sm text-white/60 max-w-2xl leading-relaxed">
              {isTamil
                ? 'பியாஜே, வைகோட்ஸ்கி கோட்பாடுகள், தமிழ் இலக்கண விதிகள், கணித அளவியல் மற்றும் அறிவியல் மாறிலிகளை விரைவாக மனனம் செய்யுங்கள்.'
                : 'Rapid-recall flashcards for CDP developmental stages, Tamil grammar rules, English pedagogy, and core Maths/Science formulas.'
              }
            </p>
          </div>

          {/* Quick Mastery Gauge */}
          <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/10 shrink-0">
            <div className="text-right">
              <div className="text-xs text-white/50">{isTamil ? 'அட்டை தேர்ச்சி:' : 'Deck Mastery:'}</div>
              <div className="text-base font-mono font-bold text-[#c5a059]">{knownCards.size} / {deck.length}</div>
            </div>
            <div className="w-12 h-12 rounded-full border-2 border-[#c5a059]/30 flex items-center justify-center font-mono font-bold text-xs text-white bg-[#c5a059]/10">
              {masteryPercent}%
            </div>
          </div>
        </div>

        {/* 2. Control Bar (Subject Filters + Timer + Shuffle) */}
        <div className="flex flex-wrap items-center justify-between gap-3 mt-5 pt-4 border-t border-white/[0.06]">
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1 bg-white/[0.03] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white">
              <Filter className="w-3.5 h-3.5 text-[#c5a059]" />
              <select
                value={selectedSubject}
                onChange={(e) => { setSelectedSubject(e.target.value as any); goToCard(0); }}
                className="bg-transparent text-white text-xs font-medium focus:outline-none cursor-pointer"
              >
                <option value="all" className="bg-[#181818]">{isTamil ? 'அனைத்து பாடங்கள்' : 'All Subjects'}</option>
                <option value="cdp" className="bg-[#181818]">CDP / உளவியல்</option>
                <option value="tamil" className="bg-[#181818]">Tamil / தமிழ்</option>
                <option value="english" className="bg-[#181818]">English / ஆங்கிலம்</option>
                <option value="maths" className="bg-[#181818]">Maths / கணிதம்</option>
                <option value="science" className="bg-[#181818]">Science / அறிவியல்</option>
              </select>
            </div>

            <div className="flex items-center gap-1 bg-white/[0.03] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white">
              <select
                value={selectedFrequency}
                onChange={(e) => { setSelectedFrequency(e.target.value); goToCard(0); }}
                className="bg-transparent text-white text-xs font-medium focus:outline-none cursor-pointer"
              >
                <option value="all" className="bg-[#181818]">{isTamil ? 'அனைத்து முக்கியத்துவமும்' : 'All Weightages'}</option>
                <option value="Critical" className="bg-[#181818]">🔴 Critical (கட்டாயம் வரும்)</option>
                <option value="Very High" className="bg-[#181818]">🟠 Very High (அடிக்கடி வரும்)</option>
                <option value="High" className="bg-[#181818]">🟡 High (முக்கியமானது)</option>
              </select>
            </div>

            <button
              onClick={handleShuffle}
              className="px-2.5 py-1.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-xs text-white/80 hover:text-white border border-white/10 transition flex items-center gap-1.5"
              title="Shuffle Flashcard Order"
            >
              <Shuffle className="w-3.5 h-3.5 text-[#c5a059]" />
              <span>{isTamil ? 'கலக்கு' : 'Shuffle'}</span>
            </button>
          </div>

          {/* Timed Drill Mode Toggle */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setIsTimerActive(!isTimerActive);
                setTimeLeft(15);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition flex items-center gap-1.5 ${
                isTimerActive
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 ring-1 ring-amber-500/30'
                  : 'bg-white/[0.03] text-white/60 border-white/10 hover:text-white'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>{isTimerActive ? `Timer: ${timeLeft}s` : (isTamil ? '15 வினாடி வேகம்' : '15s Speed Drill')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. The 3D Interactive Flashcard */}
      <div className="relative perspective-1000">
        <div
          id="flashcard-container"
          onClick={() => setIsFlipped(!isFlipped)}
          className={`w-full min-h-[360px] sm:min-h-[400px] rounded-2xl border transition-all duration-500 cursor-pointer shadow-2xl p-6 sm:p-8 flex flex-col justify-between select-none ${
            isFlipped
              ? 'bg-gradient-to-br from-[#1c1c1c] to-[#141414] border-[#c5a059]/40 ring-1 ring-[#c5a059]/20'
              : 'bg-gradient-to-br from-[#141414] to-[#0f0f0f] border-white/15 hover:border-white/30'
          }`}
        >
          {/* Card Top Metadata */}
          <div className="flex items-center justify-between border-b border-white/[0.08] pb-3 mb-4">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-white/[0.06] text-white/70 border border-white/10">
                {currentIndex + 1} / {deck.length}
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-[#c5a059]/15 text-[#c5a059] border border-[#c5a059]/30">
                {isTamil ? currentCard.categoryTa : currentCard.categoryEn}
              </span>
              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${
                currentCard.examFrequency === 'Critical'
                  ? 'bg-rose-950/60 text-rose-300 border-rose-800/40'
                  : 'bg-amber-950/60 text-amber-300 border-amber-800/40'
              }`}>
                {currentCard.examFrequency}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleSpeak(
                    isFlipped 
                      ? (isTamil ? currentCard.backTa : currentCard.backEn) 
                      : (isTamil ? currentCard.frontTa : currentCard.frontEn)
                  );
                }}
                className="p-1.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-white/70 hover:text-white transition"
                title="Pronounce / Read Card"
              >
                {isSpeaking ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-[#c5a059]" />}
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenAITutor(currentCard.topicEn);
                }}
                className="px-2 py-1 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-xs text-white font-medium border border-white/10 transition flex items-center gap-1"
                title="Deep AI Explanation"
              >
                <Brain className="w-3.5 h-3.5 text-[#c5a059]" />
                <span className="hidden sm:inline">{isTamil ? 'AI விளக்கம்' : 'AI Explain'}</span>
              </button>
            </div>
          </div>

          {/* Card Body (Front vs Back) */}
          <div className="flex-1 flex flex-col justify-center py-4 space-y-4">
            {!isFlipped ? (
              // FRONT SIDE: The Prompt / Question / Concept Challenge
              <div className="space-y-4 animate-in fade-in zoom-in-95 duration-200">
                <div className="text-xs font-mono text-[#c5a059] uppercase tracking-wider font-semibold">
                  {isTamil ? currentCard.topicTa : currentCard.topicEn}
                </div>
                <h2 className="text-lg sm:text-2xl font-serif-luxury font-bold text-white leading-relaxed">
                  {isTamil ? currentCard.frontTa : currentCard.frontEn}
                </h2>
                {languageMode === 'bilingual' && (
                  <p className="text-xs sm:text-sm text-white/50 leading-relaxed font-light">
                    {currentCard.frontEn}
                  </p>
                )}
                <div className="pt-4 flex items-center gap-2 text-xs text-white/40 italic">
                  <RotateCw className="w-3.5 h-3.5" />
                  <span>{isTamil ? 'விடையைப் பார்க்க அட்டையைத் தொடவும்...' : 'Click or tap card to flip and reveal answer...'}</span>
                </div>
              </div>
            ) : (
              // BACK SIDE: The Full Breakdown / Mnemonic / SCERT Rule
              <div className="space-y-4 animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between text-xs text-[#c5a059] font-semibold border-b border-white/[0.06] pb-2">
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    {isTamil ? 'அதிகாரப்பூர்வ விளக்கம் & விதிகள்:' : 'High-Yield Memory Breakdown:'}
                  </span>
                  <span className="text-[10px] font-mono text-white/40">{currentCard.scertRef}</span>
                </div>

                <div className="text-xs sm:text-sm text-white/90 leading-relaxed whitespace-pre-line font-normal">
                  {isTamil ? currentCard.backTa : currentCard.backEn}
                </div>

                {/* Mnemonic / Memory Hack Box */}
                {(currentCard.mnemonicEn || currentCard.mnemonicTa) && (
                  <div className="p-3 rounded-lg bg-white/[0.03] border border-[#c5a059]/30 text-xs text-white/80 space-y-1">
                    <div className="text-[10px] uppercase font-bold tracking-wider text-[#c5a059] flex items-center gap-1">
                      <span>💡 {isTamil ? 'நினைவுச் சுருக்கம் (Mnemonic):' : 'Memory Mnemonic & Shortcut:'}</span>
                    </div>
                    <p className="italic text-white/70">
                      {isTamil ? (currentCard.mnemonicTa || currentCard.mnemonicEn) : currentCard.mnemonicEn}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Card Bottom Strip */}
          <div className="pt-3 border-t border-white/[0.08] flex items-center justify-between text-xs text-white/40">
            <span className="flex items-center gap-1">
              <BookOpen className="w-3 h-3 text-[#c5a059]" />
              <span>{currentCard.scertRef}</span>
            </span>
            <span className="font-mono text-[11px]">
              {isCurrentKnown ? (isTamil ? '✅ தேர்ச்சி பெற்றது' : '✅ Mastered') : (isTamil ? '🔄 பயிற்சி தேவை' : '🔄 Needs Review')}
            </span>
          </div>
        </div>
      </div>

      {/* 4. Navigation & Spaced Repetition Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Left/Right Prev/Next */}
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrev}
            className="px-3.5 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-white border border-white/10 text-xs font-semibold transition flex items-center gap-1"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>{isTamil ? 'முந்தையது' : 'Previous'}</span>
          </button>
          <button
            onClick={handleNext}
            className="px-3.5 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-white border border-white/10 text-xs font-semibold transition flex items-center gap-1"
          >
            <span>{isTamil ? 'அடுத்தது' : 'Next'}</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Spaced Repetition Action Buttons */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={() => handleMarkUnknown(currentCard.id)}
            className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-rose-950/60 hover:bg-rose-900/80 border border-rose-800/60 text-rose-200 text-xs font-semibold transition flex items-center justify-center gap-1.5 shadow-lg"
          >
            <XCircle className="w-4 h-4 text-rose-400" />
            <span>{isTamil ? 'மறந்தது / கடினம்' : 'Still Learning (Hard)'}</span>
          </button>

          <button
            onClick={() => handleMarkKnown(currentCard.id)}
            className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-emerald-950/60 hover:bg-emerald-900/80 border border-emerald-800/60 text-emerald-200 text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-lg ring-1 ring-emerald-500/30"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{isTamil ? 'நன்கு தெரியும் (தேர்ச்சி)' : 'Got It (Mastered)'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
