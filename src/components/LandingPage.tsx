import React, { useState } from 'react';
import { pwaService } from '../services/pwaService';
import { 
  PaperType, 
  ReservationCategory, 
  LanguageMode, 
  ThemeMode, 
  AuthUser 
} from '../types';
import { 
  GraduationCap, 
  Sparkles, 
  Target, 
  BookOpen, 
  CheckCircle2, 
  Flame, 
  ShieldCheck, 
  ArrowRight, 
  Play, 
  Clock, 
  FileText, 
  Brain, 
  Award, 
  ChevronRight, 
  Check, 
  HelpCircle, 
  Sun, 
  Moon, 
  User, 
  Download,
  Wifi,
  WifiOff,
  Layers, 
  BarChart3,
  Calendar,
  Globe
} from 'lucide-react';

interface LandingPageProps {
  onOpenAuth: (mode: 'signin' | 'signup') => void;
  languageMode: LanguageMode;
  onLanguageChange: (mode: LanguageMode) => void;
  theme: ThemeMode;
  onToggleTheme: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onOpenAuth,
  languageMode,
  onLanguageChange,
  theme,
  onToggleTheme,
}) => {
  const isTamil = languageMode === 'tamil';

  // PWA State
  const [isOnline, setIsOnline] = useState(pwaService.isOnline());
  const [canInstall, setCanInstall] = useState(pwaService.canInstall());
  const [isInstalled, setIsInstalled] = useState(pwaService.isInstalled());

  React.useEffect(() => {
    const unsubscribe = pwaService.subscribe(() => {
      setIsOnline(pwaService.isOnline());
      setCanInstall(pwaService.canInstall());
      setIsInstalled(pwaService.isInstalled());
    });
    return unsubscribe;
  }, []);

  const handleInstallClick = async () => {
    await pwaService.promptInstall();
  };

  // Calculator State
  const [calcCategory, setCalcCategory] = useState<ReservationCategory>('BC_MBC_SC_ST');
  const [calcPaper, setCalcPaper] = useState<PaperType>('PAPER_II_MATH_SCI');

  // Interactive Sample Question State for Live Demo Card
  const [selectedDemoOption, setSelectedDemoOption] = useState<number | null>(null);
  const [isDemoSubmitted, setIsDemoSubmitted] = useState<boolean>(false);

  // Active Blueprint Tab
  const [activeBlueprintTab, setActiveBlueprintTab] = useState<'paper1' | 'paper2_math' | 'paper2_soc'>('paper2_math');

  // Active FAQ Accordion Item
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  // Sample SCERT Question
  const sampleQuestion = {
    subject: 'Child Development & Pedagogy (CDP) / குழந்தை மேம்பாடும் கற்பித்தலும்',
    qTa: 'பியாஜேயின் அறிவாற்றல் வளர்ச்சிக் கோட்பாட்டின்படி, "பொருட்களின் மாறாத்தன்மை" (Conservation) எந்தக் கட்டத்தில் முழுமையாக உருவாகிறது?',
    qEn: 'According to Piaget\'s Theory of Cognitive Development, at which stage does the concept of "Conservation" fully develop?',
    optionsTa: [
      'புலனியக்க நிலை (Sensorimotor Stage)',
      'செயல்பாட்டிற்கு முந்தைய நிலை (Pre-operational Stage)',
      'பருப்பொருள் செயல்பாட்டு நிலை (Concrete Operational Stage)',
      'முறையான செயல்பாட்டு நிலை (Formal Operational Stage)'
    ],
    optionsEn: [
      'Sensorimotor Stage (0–2 years)',
      'Pre-operational Stage (2–7 years)',
      'Concrete Operational Stage (7–11 years)',
      'Formal Operational Stage (11+ years)'
    ],
    correctIndex: 2,
    explanationTa: 'பருப்பொருள் செயல்பாட்டு நிலையில் (7-11 வயது) குழந்தைகள் வடிவ மாற்றம் அடைந்தாலும் பொருட்களின் அளவு மாறாது என்பதைப் புரிந்து கொள்ளும் "பொருட்களின் மாறாத்தன்மை" திறனை அடைகின்றனர். (SCERT B.Ed / D.T.Ed CDP பாடம்).',
    explanationEn: 'During the Concrete Operational Stage (7–11 years), children master conservation—understanding that quantity remains identical despite changes in shape or appearance.'
  };

  const handleDemoSubmit = (idx: number) => {
    setSelectedDemoOption(idx);
    setIsDemoSubmitted(true);
  };

  const faqItems = [
    {
      qEn: 'What is the qualifying mark for TNTET 2026?',
      qTa: 'TNTET 2026 தேர்வில் தேர்ச்சி பெற எத்தனை மதிப்பெண்கள் தேவை?',
      aEn: 'As per Tamil Nadu TRB norms, General / OC candidates must score at least 90 out of 150 (60%), while BC, BCM, MBC, DNC, SC, SCA, and ST candidates must score 82 out of 150 (55%). There is no sectional cutoff or negative marking.',
      aTa: 'தமிழக ஆசிரியர் தேர்வு வாரிய (TRB) விதிகளின்படி, பொதுப் பிரிவினர் (OC) 150-க்கு 90 மதிப்பெண்களும் (60%), BC, BCM, MBC, SC, ST பிரிவினர் 150-க்கு 82 மதிப்பெண்களும் (55%) பெற வேண்டும். இதில் எதிர்மறை மதிப்பெண்கள் (Negative Marks) கிடையாது.'
    },
    {
      qEn: 'Is TNTET certificate valid for a lifetime in Tamil Nadu?',
      qTa: 'TNTET சான்றிதழின் செல்லுபடியாகும் காலம் வாழ்நாளா?',
      aEn: 'Yes! The Government of Tamil Nadu and NCTE have officially declared that TNTET qualifying certificates are valid for a lifetime.',
      aTa: 'ஆம்! மத்திய NCTE மற்றும் தமிழ்நாடு அரசு அரசாணையின்படி, TNTET தகுதிச் சான்றிதழ் வாழ்நாள் முழுமைக்கும் (Lifetime Validity) செல்லுபடியாகும்.'
    },
    {
      qEn: 'Are all questions authentic to TN SCERT Samacheer Kalvi textbooks?',
      qTa: 'கேள்விகள் அனைத்தும் தமிழ்நாடு சமச்சீர் கல்வி பாடப்புத்தகங்களின்படி உள்ளதா?',
      aEn: 'Yes, 100% of our question bank, distractor notes, and topic classifications are curated directly from Tamil Nadu State Board (SCERT) textbooks from Class 1 to 10 with bilingual explanations.',
      aTa: 'முற்றிலும் உண்மை! அனைத்துக் கேள்விகளும் 1 முதல் 10-ஆம் வகுப்பு வரையிலான தமிழ்நாடு SCERT சமச்சீர் கல்விப் பாடத்திட்டம் மற்றும் TRB முந்தைய ஆண்டு வினாத்தாள்களை அடிப்படையாகக் கொண்டவை.'
    },
    {
      qEn: 'How does the 35-minute adaptive daily session work?',
      qTa: 'தினசரி 35 நிமிட பயிற்சி முறை எவ்வாறு செயல்படுகிறது?',
      aEn: 'The coach analyzes your diagnostic score and mistake queue to generate a daily 4-block schedule: 1. Core Concept Refresher (8m), 2. Weakest Topic Drill (15m), 3. Spaced Mistake Repetition (7m), and 4. Speed Sprint (5m).',
      aTa: 'உங்கள் ஆரம்ப நிலைத் தேர்வு மற்றும் பிழைகளைக் கணக்கிட்டு, தினசரி 4 அடுக்குகளாக (கருத்து மீள்பார்வை, பலவீனமான பாடம், பிழை திருத்தம், விரைவுத் தேர்வு) தானாகப் பிரித்து வழிகாட்டுகிறது.'
    }
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col font-sans transition-colors duration-200">
      {/* 1. Top Global Announcement Bar */}
      <div className="bg-gradient-to-r from-[#181818] via-[#221c12] to-[#181818] border-b border-[#c5a059]/20 py-2 px-4 text-center text-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-2 text-white/90">
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#c5a059] text-black">TRB 2026</span>
          <span>
            {isTamil 
              ? 'தமிழ்நாடு ஆசிரியர் தகுதித் தேர்வு (Paper I & II) 2026 அறிவிப்பிற்கான பிரத்யேக தயாரிப்புத் தளம்' 
              : 'Official TNTET 2026 Examination Preparation Portal'}
          </span>
          <span className="hidden sm:inline text-[#c5a059] font-semibold underline cursor-pointer ml-1" onClick={() => onOpenAuth('signup')}>
            {isTamil ? 'இலவசமாக சேரவும் →' : 'Get Started →'}
          </span>
        </div>
      </div>

      {/* 2. Main Navigation Bar */}
      <header className="sticky top-0 z-40 bg-[#0a0a0a]/95 backdrop-blur-md border-b border-[#262626]" style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}>
        <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 sm:py-3.5 flex items-center justify-between gap-2 sm:gap-4">
          {/* Brand Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#c5a059] to-[#8d6f30] flex items-center justify-center shadow-lg shadow-[#c5a059]/15 text-black border border-[#c5a059]/40">
              <GraduationCap className="w-5 h-5 text-white dark:text-[#0a0a0a]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-base tracking-wide text-white font-cinzel">TNTET</span>
                <span className="text-xs text-[#c5a059] font-semibold italic">Coach</span>
                <span className="hidden sm:inline-block px-1.5 py-0.2 rounded text-[9px] font-bold bg-[#c5a059]/15 text-[#c5a059] border border-[#c5a059]/30">
                  SCERT 2026
                </span>
              </div>
              <p className="text-[10px] text-white/50 tracking-wider">Tamil Nadu Teacher Eligibility Test</p>
            </div>
          </div>

          {/* Center Nav Links (Desktop) */}
          <nav className="hidden md:flex items-center gap-6 text-xs text-white/70 font-medium">
            <a href="#features" className="hover:text-white transition">Features</a>
            <a href="#calculator" className="hover:text-white transition">90 vs 82 Marks</a>
            <a href="#syllabus" className="hover:text-white transition">Paper Blueprints</a>
            <a href="#pedagogy" className="hover:text-white transition">4-Pillar Method</a>
            <a href="#faq" className="hover:text-white transition">FAQ</a>
          </nav>

          {/* Right Actions (PWA Install, Language, Theme, Sign In, Sign Up) */}
          <div className="flex items-center gap-2.5">
            {/* Offline Status Pill */}
            {!isOnline && (
              <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-950/60 border border-amber-800/60 text-amber-300 text-xs font-semibold">
                <WifiOff className="w-3.5 h-3.5" />
                <span className="text-[10px] hidden sm:inline">Offline Mode (Local Sync Active)</span>
              </div>
            )}

            {/* PWA Install Button */}
            {canInstall && (
              <button
                onClick={handleInstallClick}
                className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#c5a059]/15 hover:bg-[#c5a059]/25 border border-[#c5a059]/35 text-[#c5a059] text-xs font-semibold transition"
                title="Install TNTET Coach App on your device for offline study"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{isTamil ? 'செயலியை நிறுவுக' : 'Install App'}</span>
              </button>
            )}

            {/* Language Switcher */}
            <div className="flex items-center bg-[#181818] border border-[#2c2c2c] rounded-lg p-0.5 text-[11px]">
              <button
                onClick={() => onLanguageChange('bilingual')}
                className={`px-2 py-1 rounded transition ${languageMode === 'bilingual' ? 'bg-[#c5a059] text-black font-bold' : 'text-white/60 hover:text-white'}`}
              >
                இருமொழி
              </button>
              <button
                onClick={() => onLanguageChange('tamil')}
                className={`px-2 py-1 rounded transition ${languageMode === 'tamil' ? 'bg-[#c5a059] text-black font-bold' : 'text-white/60 hover:text-white'}`}
              >
                தமிழ்
              </button>
              <button
                onClick={() => onLanguageChange('english')}
                className={`px-2 py-1 rounded transition ${languageMode === 'english' ? 'bg-[#c5a059] text-black font-bold' : 'text-white/60 hover:text-white'}`}
              >
                EN
              </button>
            </div>

            {/* Dark / Light Mode Toggle */}
            <button
              onClick={onToggleTheme}
              className="p-2 rounded-lg bg-[#181818] border border-[#2c2c2c] hover:border-[#c5a059]/40 text-[#c5a059] transition"
              title="Toggle Dark / Light Mode"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-[#c5a059]" /> : <Moon className="w-4 h-4 text-[#2563eb]" />}
            </button>

            {/* Sign In Trigger */}
            <button
              onClick={() => onOpenAuth('signin')}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white/80 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 transition"
            >
              {isTamil ? 'உள்நுழைக' : 'Sign In'}
            </button>

            {/* Primary Sign Up CTA */}
            <button
              onClick={() => onOpenAuth('signup')}
              className="px-4 py-1.5 rounded-lg text-xs font-bold text-black bg-gradient-to-r from-[#c5a059] to-[#8d6f30] hover:from-[#d6b066] hover:to-[#9e7d37] shadow-md shadow-[#c5a059]/20 transition flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isTamil ? 'பதிவு செய்க' : 'Get Started'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* 3. Hero Section */}
      <section className="relative pt-12 pb-20 px-4 sm:px-6 overflow-hidden">
        {/* Subtle Ambient Radial Glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-[#c5a059]/10 blur-[130px] rounded-full pointer-events-none"></div>

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
          {/* Left Column: Value Proposition */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#181818] border border-[#c5a059]/30 text-xs text-[#c5a059] font-semibold">
              <Award className="w-4 h-4 text-[#c5a059]" />
              <span>{isTamil ? 'தமிழ்நாடு SCERT 100% சமச்சீர் கல்வி பாடத்திட்டம்' : '100% SCERT Samacheer Kalvi Syllabus Aligned'}</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-[1.15] tracking-tight">
              {isTamil ? (
                <>
                  TNTET 2026 தேர்வில் முதல் முயற்சியிலேயே <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#c5a059] via-[#e5c581] to-[#8d6f30]">தேர்ச்சி பெறுங்கள்</span>
                </>
              ) : (
                <>
                  Crack TNTET 2026 on Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#c5a059] via-[#e5c581] to-[#8d6f30]">First Attempt</span>
                </>
              )}
            </h1>

            <p className="text-sm sm:text-base text-white/70 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
              {isTamil
                ? 'தாள் 1 (தொடக்கப்பள்ளி) மற்றும் தாள் 2 (பட்டதாரி ஆசிரியர்) தேர்வுகளுக்கான பிரத்யேக வழிகாட்டி. 35 நிமிட தினசரி பயிற்சி, 150 நிமிட முழு மாதிரித் தேர்வு, 5 வகை பிழைப் பகுப்பாய்வு மற்றும் இருமொழி விளக்கம்.'
                : 'Adaptive preparation system for Paper I (Primary 1–5) & Paper II (Graduate Teachers). Features 35-minute micro-plans, full 150-minute TRB simulators, 5-tier distractor diagnosis, and instant Tamil-first AI tutoring.'}
            </p>

            {/* Key Trust Checkmarks */}
            <div className="grid grid-cols-2 sm:grid-cols-2 gap-3 pt-2 max-w-xl mx-auto lg:mx-0 text-left">
              <div className="flex items-center gap-2 text-xs text-white/80">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span><strong>90 vs 82 Marks</strong> Target Calibration</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-white/80">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span><strong>150-Minute TRB</strong> Exam Simulator</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-white/80">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span><strong>5-Tier Mistake</strong> Queue Remediation</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-white/80">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span><strong>Bilingual</strong> Tamil & English Support</span>
              </div>
            </div>

            {/* Primary Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-4">
              <button
                id="btn-hero-signup"
                onClick={() => onOpenAuth('signup')}
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-gradient-to-r from-[#c5a059] to-[#8d6f30] hover:from-[#d6b066] hover:to-[#9e7d37] text-black font-bold text-sm shadow-xl shadow-[#c5a059]/25 flex items-center justify-center gap-2 transition"
              >
                <span>{isTamil ? 'இலவச கணக்கு தொடங்கி படிக்கவும்' : 'Start Free 15-Min Diagnostic Test'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                id="btn-hero-signin"
                onClick={() => onOpenAuth('signin')}
                className="w-full sm:w-auto px-5 py-3.5 rounded-xl bg-[#1a1a1a] hover:bg-[#242424] border border-[#333333] hover:border-[#c5a059]/40 text-white font-semibold text-xs transition flex items-center justify-center gap-2"
              >
                <User className="w-4 h-4 text-[#c5a059]" />
                <span>{isTamil ? 'ஆசிரியர் உள்நுழைவு (Sign In)' : 'Candidate Sign In'}</span>
              </button>
            </div>

            {/* Sub-note with Offline PWA readiness statement */}
            <div className="flex items-center justify-center lg:justify-start gap-2 text-[11px] text-white/50 pt-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              <span>
                {isTamil 
                  ? 'PWA ஆஃப்லைன் ஆதரவு & உள்ளூர் தரவு ஒத்திசைவு (Local Storage Synchronization) செயல்படுகிறது.' 
                  : 'Installable PWA • Works offline with real-time local storage data synchronization.'}
              </span>
            </div>
          </div>

          {/* Right Column: Live Interactive SCERT Question Card */}
          <div className="lg:col-span-5">
            <div className="rounded-2xl bg-[#121212] border border-[#262626] p-5 shadow-2xl relative overflow-hidden">
              {/* Header Badge */}
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#222222]">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span className="text-xs font-bold text-white uppercase tracking-wider">Live SCERT Question Preview</span>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#c5a059]/15 text-[#c5a059] border border-[#c5a059]/30">
                  TRB Standard
                </span>
              </div>

              <div className="text-[11px] text-[#c5a059] font-medium mb-1">
                {sampleQuestion.subject}
              </div>

              {/* Question Text */}
              <p className="text-xs font-semibold text-white/95 leading-relaxed mb-3">
                {isTamil ? sampleQuestion.qTa : sampleQuestion.qEn}
              </p>

              {/* Option Radio Buttons */}
              <div className="space-y-2 mb-4">
                {(isTamil ? sampleQuestion.optionsTa : sampleQuestion.optionsEn).map((opt, idx) => {
                  let optStyle = "bg-[#181818] border-[#2a2a2a] text-white/80 hover:border-white/30";
                  if (isDemoSubmitted) {
                    if (idx === sampleQuestion.correctIndex) {
                      optStyle = "bg-emerald-950/50 border-emerald-500 text-emerald-300 font-semibold";
                    } else if (selectedDemoOption === idx) {
                      optStyle = "bg-red-950/50 border-red-500 text-red-300";
                    }
                  } else if (selectedDemoOption === idx) {
                    optStyle = "bg-[#c5a059]/20 border-[#c5a059] text-white font-semibold";
                  }

                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleDemoSubmit(idx)}
                      className={`w-full p-2.5 rounded-xl border text-left text-xs transition flex items-center justify-between ${optStyle}`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="w-5 h-5 rounded-full bg-black/40 border border-white/20 flex items-center justify-center text-[10px] font-bold text-white/70">
                          {String.fromCharCode(65 + idx)}
                        </span>
                        <span className="text-[11px]">{opt}</span>
                      </div>
                      {isDemoSubmitted && idx === sampleQuestion.correctIndex && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Feedback Drawer upon answering */}
              {isDemoSubmitted && (
                <div className="p-3 rounded-xl bg-[#181818] border border-[#2a2a2a] space-y-2 animate-fadeIn">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {selectedDemoOption === sampleQuestion.correctIndex ? 'Correct Answer / சரியான விடை' : 'SCERT Diagnostic Review'}
                    </span>
                    <span className="text-[10px] text-white/50">SCERT Std 6-8 CDP</span>
                  </div>
                  <p className="text-[11px] text-white/70 leading-relaxed">
                    {isTamil ? sampleQuestion.explanationTa : sampleQuestion.explanationEn}
                  </p>
                  <div className="pt-2 flex items-center justify-between border-t border-white/10">
                    <span className="text-[10px] text-white/50">Ready to test 150 questions?</span>
                    <button
                      onClick={() => onOpenAuth('signup')}
                      className="px-2.5 py-1 rounded bg-[#c5a059] text-black font-bold text-[10px] hover:bg-[#d6b066] transition"
                    >
                      Take Full Test →
                    </button>
                  </div>
                </div>
              )}

              {!isDemoSubmitted && (
                <div className="text-center py-1">
                  <span className="text-[11px] text-white/40">👆 Click any option above to test the pedagogical feedback</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 4. Interactive Target Score Calculator (90 vs 82 Marks Rule) */}
      <section id="calculator" className="py-16 px-4 sm:px-6 bg-[#0f0f0f] border-y border-[#262626]">
        <div className="max-w-5xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <span className="px-3 py-1 rounded-full bg-[#c5a059]/15 text-[#c5a059] text-xs font-bold uppercase tracking-wider">
              TRB Cutoff Calibration
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              {isTamil ? 'உங்கள் இடஒதுக்கீட்டுப் பிரிவு இலக்கு கால்குலேட்டர்' : 'Your Personalized TNTET Qualifying Target'}
            </h2>
            <p className="text-xs sm:text-sm text-white/60 max-w-xl mx-auto">
              {isTamil 
                ? 'உங்கள் பிரிவைத் தேர்ந்தெடுத்து, தேர்ச்சி பெற தேவையான மதிப்பெண்களையும் தினசரி அட்டவணையையும் அறியவும்.'
                : 'Select your reservation category and exam paper to see exact qualification thresholds.'}
            </p>
          </div>

          <div className="p-6 sm:p-8 rounded-2xl bg-[#141414] border border-[#2a2a2a] shadow-xl grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            {/* Left Selectors */}
            <div className="md:col-span-7 space-y-5">
              <div>
                <label className="block text-xs font-bold text-white/80 mb-2">1. Reservation Category (பிரிவு)</label>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    onClick={() => setCalcCategory('BC_MBC_SC_ST')}
                    className={`p-3 rounded-xl border text-left transition ${
                      calcCategory === 'BC_MBC_SC_ST'
                        ? 'bg-[#c5a059]/15 border-[#c5a059] text-white'
                        : 'bg-[#1a1a1a] border-[#2a2a2a] text-white/70 hover:border-white/20'
                    }`}
                  >
                    <div className="text-xs font-bold text-emerald-400">BC / BCM / MBC / SC / ST</div>
                    <div className="text-[10px] text-white/50">Qualifying: 82 / 150 (55%)</div>
                  </button>
                  <button
                    onClick={() => setCalcCategory('OC_GENERAL')}
                    className={`p-3 rounded-xl border text-left transition ${
                      calcCategory === 'OC_GENERAL'
                        ? 'bg-[#c5a059]/15 border-[#c5a059] text-white'
                        : 'bg-[#1a1a1a] border-[#2a2a2a] text-white/70 hover:border-white/20'
                    }`}
                  >
                    <div className="text-xs font-bold text-[#c5a059]">OC / General Category</div>
                    <div className="text-[10px] text-white/50">Qualifying: 90 / 150 (60%)</div>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-white/80 mb-2">2. Target Exam Paper (தேர்வுத் தாள்)</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => setCalcPaper('PAPER_I')}
                    className={`p-2.5 rounded-xl border text-left text-xs transition ${
                      calcPaper === 'PAPER_I'
                        ? 'bg-[#c5a059]/15 border-[#c5a059] text-white font-bold'
                        : 'bg-[#1a1a1a] border-[#2a2a2a] text-white/70'
                    }`}
                  >
                    <div>Paper I</div>
                    <div className="text-[10px] text-white/50">Primary 1–5</div>
                  </button>
                  <button
                    onClick={() => setCalcPaper('PAPER_II_MATH_SCI')}
                    className={`p-2.5 rounded-xl border text-left text-xs transition ${
                      calcPaper === 'PAPER_II_MATH_SCI'
                        ? 'bg-[#c5a059]/15 border-[#c5a059] text-white font-bold'
                        : 'bg-[#1a1a1a] border-[#2a2a2a] text-white/70'
                    }`}
                  >
                    <div>Paper II</div>
                    <div className="text-[10px] text-white/50">Maths & Sci</div>
                  </button>
                  <button
                    onClick={() => setCalcPaper('PAPER_II_SOC_SCI')}
                    className={`p-2.5 rounded-xl border text-left text-xs transition ${
                      calcPaper === 'PAPER_II_SOC_SCI'
                        ? 'bg-[#c5a059]/15 border-[#c5a059] text-white font-bold'
                        : 'bg-[#1a1a1a] border-[#2a2a2a] text-white/70'
                    }`}
                  >
                    <div>Paper II</div>
                    <div className="text-[10px] text-white/50">Social Sci</div>
                  </button>
                </div>
              </div>
            </div>

            {/* Right Target Summary Box */}
            <div className="md:col-span-5 p-5 rounded-xl bg-[#1c1c1c] border border-[#c5a059]/30 space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <span className="text-xs text-white/60">TRB Target Cutoff</span>
                <span className="text-2xl font-extrabold text-[#c5a059]">
                  {calcCategory === 'OC_GENERAL' ? '90 Marks' : '82 Marks'}
                </span>
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-white/70">
                  <span>Pass Percentage:</span>
                  <span className="font-semibold text-white">{calcCategory === 'OC_GENERAL' ? '60%' : '55%'}</span>
                </div>
                <div className="flex justify-between text-white/70">
                  <span>Total Questions:</span>
                  <span className="font-semibold text-white">150 Questions</span>
                </div>
                <div className="flex justify-between text-white/70">
                  <span>Negative Marking:</span>
                  <span className="font-semibold text-emerald-400">Zero (None)</span>
                </div>
                <div className="flex justify-between text-white/70">
                  <span>Daily Micro-Practice:</span>
                  <span className="font-semibold text-[#c5a059]">35 Mins / Day</span>
                </div>
              </div>

              <button
                onClick={() => onOpenAuth('signup')}
                className="w-full py-2.5 rounded-lg bg-[#c5a059] hover:bg-[#d6b066] text-black font-bold text-xs shadow-md transition"
              >
                Set This Goal in Coach →
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Paper Blueprints & Subject Structure */}
      <section id="syllabus" className="py-16 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <span className="px-3 py-1 rounded-full bg-[#c5a059]/15 text-[#c5a059] text-xs font-bold uppercase tracking-wider">
              Exam Blueprints
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              {isTamil ? 'தாள் வாரியான பாடப்பிரிவுகள் மற்றும் மதிப்பெண் பகிர்வு' : 'Paper-Wise Syllabus & Marks Breakdown'}
            </h2>
            <p className="text-xs sm:text-sm text-white/60 max-w-xl mx-auto">
              Authentic 150-mark structure prescribed by TRB Tamil Nadu.
            </p>
          </div>

          {/* Tab Navigation */}
          <div className="flex justify-center">
            <div className="inline-flex p-1 rounded-xl bg-[#141414] border border-[#2a2a2a]">
              <button
                onClick={() => setActiveBlueprintTab('paper1')}
                className={`px-4 py-2 rounded-lg text-xs font-semibold transition ${
                  activeBlueprintTab === 'paper1' ? 'bg-[#c5a059] text-black' : 'text-white/60 hover:text-white'
                }`}
              >
                Paper I (Classes 1–5)
              </button>
              <button
                onClick={() => setActiveBlueprintTab('paper2_math')}
                className={`px-4 py-2 rounded-lg text-xs font-semibold transition ${
                  activeBlueprintTab === 'paper2_math' ? 'bg-[#c5a059] text-black' : 'text-white/60 hover:text-white'
                }`}
              >
                Paper II (Maths & Science)
              </button>
              <button
                onClick={() => setActiveBlueprintTab('paper2_soc')}
                className={`px-4 py-2 rounded-lg text-xs font-semibold transition ${
                  activeBlueprintTab === 'paper2_soc' ? 'bg-[#c5a059] text-black' : 'text-white/60 hover:text-white'
                }`}
              >
                Paper II (Social Science)
              </button>
            </div>
          </div>

          {/* Blueprint Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {activeBlueprintTab === 'paper1' && (
              <>
                <div className="p-5 rounded-xl bg-[#141414] border border-[#262626] space-y-2">
                  <div className="text-xs font-bold text-[#c5a059]">Child Development (CDP)</div>
                  <div className="text-2xl font-extrabold text-white">30 Marks</div>
                  <p className="text-xs text-white/60">Piaget, Vygotsky, Kohlberg, inclusive education, learning theories.</p>
                </div>
                <div className="p-5 rounded-xl bg-[#141414] border border-[#262626] space-y-2">
                  <div className="text-xs font-bold text-emerald-400">Language I (Tamil) & Lang II (English)</div>
                  <div className="text-2xl font-extrabold text-white">60 Marks (30+30)</div>
                  <p className="text-xs text-white/60">Grammar, comprehension, literature from SCERT textbooks (Std 1–5).</p>
                </div>
                <div className="p-5 rounded-xl bg-[#141414] border border-[#262626] space-y-2">
                  <div className="text-xs font-bold text-amber-400">Mathematics & EVS</div>
                  <div className="text-2xl font-extrabold text-white">60 Marks (30+30)</div>
                  <p className="text-xs text-white/60">Primary arithmetic, geometry, environmental science, everyday ecology.</p>
                </div>
              </>
            )}

            {activeBlueprintTab === 'paper2_math' && (
              <>
                <div className="p-5 rounded-xl bg-[#141414] border border-[#262626] space-y-2">
                  <div className="text-xs font-bold text-[#c5a059]">Child Development & Pedagogy</div>
                  <div className="text-2xl font-extrabold text-white">30 Marks</div>
                  <p className="text-xs text-white/60">Adolescent psychology, cognitive domains, classroom management.</p>
                </div>
                <div className="p-5 rounded-xl bg-[#141414] border border-[#262626] space-y-2">
                  <div className="text-xs font-bold text-emerald-400">Language I (Tamil) & Lang II (English)</div>
                  <div className="text-2xl font-extrabold text-white">60 Marks (30+30)</div>
                  <p className="text-xs text-white/60">SCERT Standards 6–8 core with difficulty link up to Std 10.</p>
                </div>
                <div className="p-5 rounded-xl bg-[#141414] border border-[#c5a059]/40 bg-[#c5a059]/5 space-y-2">
                  <div className="text-xs font-bold text-[#c5a059]">Mathematics & Science Core</div>
                  <div className="text-2xl font-extrabold text-white">60 Marks</div>
                  <p className="text-xs text-white/60">Algebra, Geometry, Physics, Chemistry, Biology & pedagogical concepts.</p>
                </div>
              </>
            )}

            {activeBlueprintTab === 'paper2_soc' && (
              <>
                <div className="p-5 rounded-xl bg-[#141414] border border-[#262626] space-y-2">
                  <div className="text-xs font-bold text-[#c5a059]">Child Development & Pedagogy</div>
                  <div className="text-2xl font-extrabold text-white">30 Marks</div>
                  <p className="text-xs text-white/60">Adolescent psychology, educational philosophy, evaluation methods.</p>
                </div>
                <div className="p-5 rounded-xl bg-[#141414] border border-[#262626] space-y-2">
                  <div className="text-xs font-bold text-emerald-400">Language I (Tamil) & Lang II (English)</div>
                  <div className="text-2xl font-extrabold text-white">60 Marks (30+30)</div>
                  <p className="text-xs text-white/60">Grammar, prose, poetry, phonetics, pedagogy of language learning.</p>
                </div>
                <div className="p-5 rounded-xl bg-[#141414] border border-[#262626] space-y-2">
                  <div className="text-xs font-bold text-amber-400">Social Science Core</div>
                  <div className="text-2xl font-extrabold text-white">60 Marks</div>
                  <p className="text-xs text-white/60">History of Tamil Nadu, Indian Constitution, Geography, Economics.</p>
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      {/* 6. The 4-Pillar Pedagogical Advantage */}
      <section id="pedagogy" className="py-16 px-4 sm:px-6 bg-[#0e0e0e] border-t border-[#262626]">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-2">
            <span className="px-3 py-1 rounded-full bg-[#c5a059]/15 text-[#c5a059] text-xs font-bold uppercase tracking-wider">
              Preparation Methodology
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              {isTamil ? 'வெற்றியை உறுதி செய்யும் 4-அடுக்கு கற்றல் முறை' : 'The 4-Pillar Pedagogical Engine'}
            </h2>
            <p className="text-xs sm:text-sm text-white/60 max-w-xl mx-auto">
              Engineered specifically for busy Tamil Nadu teacher aspirants.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-xl bg-[#141414] border border-[#262626] space-y-3">
              <div className="w-10 h-10 rounded-lg bg-[#c5a059]/15 text-[#c5a059] flex items-center justify-center font-bold">
                <Clock className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white">35-Min Daily Sessions</h3>
              <p className="text-xs text-white/60 leading-relaxed">
                4 structured micro-blocks daily: Core Concept, Weak-Topic Drill, Mistake Queue Review, and Speed Sprint.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-[#141414] border border-[#262626] space-y-3">
              <div className="w-10 h-10 rounded-lg bg-red-500/15 text-red-400 flex items-center justify-center font-bold">
                <Brain className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white">5-Tier Mistake Queue</h3>
              <p className="text-xs text-white/60 leading-relaxed">
                Automatically categorizes errors into Factual, Conceptual, Trap Distractor, Misread, or Calculation slips.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-[#141414] border border-[#262626] space-y-3">
              <div className="w-10 h-10 rounded-lg bg-blue-500/15 text-blue-400 flex items-center justify-center font-bold">
                <Target className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white">150-Q TRB Simulator</h3>
              <p className="text-xs text-white/60 leading-relaxed">
                Exact 150-minute exam timer with OMR-style palette, answer review, and printable diagnostic PDF dossier.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-[#141414] border border-[#262626] space-y-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/15 text-emerald-400 flex items-center justify-center font-bold">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white">Tamil-First AI Tutor</h3>
              <p className="text-xs text-white/60 leading-relaxed">
                Context-aware instant explanations with zero-latency LRU caching for repeat questions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Candidate Success Stories & Testimonials */}
      <section className="py-16 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <span className="px-3 py-1 rounded-full bg-[#c5a059]/15 text-[#c5a059] text-xs font-bold uppercase tracking-wider">
              Candidate Feedback
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              {isTamil ? 'ஆசிரியர் தேர்வர்களின் அனுபவங்கள்' : 'Trusted by TN Teacher Aspirants'}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="p-6 rounded-2xl bg-[#141414] border border-[#262626] space-y-3">
              <div className="flex items-center gap-1 text-[#c5a059]">
                {'★★★★★'.split('').map((s, i) => <span key={i}>{s}</span>)}
              </div>
              <p className="text-xs text-white/70 italic leading-relaxed">
                "The 82-mark target calibration gave me clear confidence. The CDP explanation in Tamil solved my confusion in Piaget vs Vygotsky theories!"
              </p>
              <div className="pt-2 border-t border-white/10">
                <div className="text-xs font-bold text-white">Kavitha Sundaram</div>
                <div className="text-[10px] text-white/50">Paper II (Maths & Science) • Madurai</div>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-[#141414] border border-[#262626] space-y-3">
              <div className="flex items-center gap-1 text-[#c5a059]">
                {'★★★★★'.split('').map((s, i) => <span key={i}>{s}</span>)}
              </div>
              <p className="text-xs text-white/70 italic leading-relaxed">
                "As a working parent, having a 35-minute daily plan with instant mistake retesting was a game changer. The 150-min exam simulator felt like the real TRB test."
              </p>
              <div className="pt-2 border-t border-white/10">
                <div className="text-xs font-bold text-white">Anand Kumar</div>
                <div className="text-[10px] text-white/50">Paper I (Primary Teacher) • Salem</div>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-[#141414] border border-[#262626] space-y-3">
              <div className="flex items-center gap-1 text-[#c5a059]">
                {'★★★★★'.split('').map((s, i) => <span key={i}>{s}</span>)}
              </div>
              <p className="text-xs text-white/70 italic leading-relaxed">
                "The SCERT question bank is 100% authentic. The printable PDF diagnostic report helped me spot my weak chapters in Tamil Grammar instantly."
              </p>
              <div className="pt-2 border-t border-white/10">
                <div className="text-xs font-bold text-white">Selvi Murugesan</div>
                <div className="text-[10px] text-white/50">Paper II (Social Science) • Tiruchirappalli</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 8. FAQ Accordion Section */}
      <section id="faq" className="py-16 px-4 sm:px-6 bg-[#0f0f0f] border-t border-[#262626]">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <span className="px-3 py-1 rounded-full bg-[#c5a059]/15 text-[#c5a059] text-xs font-bold uppercase tracking-wider">
              Frequently Asked Questions
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              {isTamil ? 'அடிக்கடி கேட்கப்படும் கேள்விகள்' : 'Everything You Need to Know'}
            </h2>
          </div>

          <div className="space-y-3">
            {faqItems.map((item, index) => {
              const isOpen = openFaqIndex === index;
              return (
                <div 
                  key={index}
                  className="rounded-xl bg-[#141414] border border-[#2a2a2a] overflow-hidden transition"
                >
                  <button
                    onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                    className="w-full p-4 text-left flex items-center justify-between text-xs sm:text-sm font-bold text-white hover:text-[#c5a059] transition"
                  >
                    <span>{isTamil ? item.qTa : item.qEn}</span>
                    <span className="text-[#c5a059] font-mono text-base">{isOpen ? '−' : '+'}</span>
                  </button>
                  {isOpen && (
                    <div className="px-4 pb-4 text-xs text-white/70 leading-relaxed border-t border-[#222222] pt-3 animate-fadeIn">
                      {isTamil ? item.aTa : item.aEn}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 9. Bottom High-Impact CTA Banner */}
      <section className="py-16 px-4 sm:px-6 bg-gradient-to-b from-[#141414] to-[#0a0a0a] border-t border-[#262626] text-center relative overflow-hidden">
        <div className="max-w-4xl mx-auto space-y-6 relative z-10">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#c5a059] to-[#8d6f30] mx-auto flex items-center justify-center text-black shadow-xl shadow-[#c5a059]/20">
            <GraduationCap className="w-6 h-6" />
          </div>

          <h2 className="text-2xl sm:text-4xl font-extrabold text-white">
            {isTamil 
              ? 'இன்றே உங்கள் TNTET 2026 பயிற்சியைத் தொடங்குங்கள்'
              : 'Begin Your TNTET 2026 Preparation Today'}
          </h2>

          <p className="text-xs sm:text-sm text-white/70 max-w-xl mx-auto">
            {isTamil
              ? '15 நிமிட இலவச ஆரம்ப நிலைத் தேர்வு மூலம் உங்கள் தற்போதைய மதிப்பெண்ணைக் கணக்கிட்டு முன்னேறுங்கள்.'
              : 'Join thousands of teacher aspirants. Calculate your baseline readiness score in 15 minutes.'}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={() => onOpenAuth('signup')}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-[#c5a059] to-[#8d6f30] hover:from-[#d6b066] hover:to-[#9e7d37] text-black font-bold text-sm shadow-xl shadow-[#c5a059]/25 flex items-center justify-center gap-2 transition"
            >
              <span>{isTamil ? 'இலவச கணக்கை உருவாக்குக' : 'Create Free Candidate Account'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => onOpenAuth('signin')}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-[#1c1c1c] hover:bg-[#262626] border border-[#333333] text-white font-semibold text-xs transition"
            >
              {isTamil ? 'ஏற்கனவே கணக்கு உள்ளதா? உள்நுழைக' : 'Already Registered? Sign In'}
            </button>
          </div>
        </div>
      </section>

      {/* 10. Footer */}
      <footer className="py-8 px-4 sm:px-6 bg-[#080808] border-t border-[#1c1c1c] text-xs text-white/40">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-[#c5a059]" />
            <span className="font-bold text-white/80">TNTET 2026 Coach</span>
            <span>• Tamil Nadu Teachers Recruitment Board (TRB) Alignment</span>
          </div>
          <div>
            <span>SCERT Samacheer Kalvi Standards</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
