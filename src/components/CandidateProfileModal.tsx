import React, { useState, useEffect } from 'react';
import { 
  PaperType, 
  ReservationCategory, 
  LanguageMode, 
  AuthUser,
  UserProfile
} from '../types';
import { 
  X, 
  User, 
  Mail, 
  Award, 
  Target, 
  Clock, 
  Calendar, 
  CheckCircle2, 
  ShieldCheck, 
  Sparkles, 
  Layers, 
  HelpCircle,
  Save,
  BookOpen,
  Calculator,
  Percent,
  Sliders,
  TrendingUp
} from 'lucide-react';

interface CandidateProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: AuthUser | null;
  userProfile: UserProfile;
  languageMode: LanguageMode;
  onSaveProfile: (updates: {
    name?: string;
    targetPaper?: PaperType;
    category?: ReservationCategory;
    dailyMinutes?: number;
    targetExamDate?: string;
  }) => void;
}

export const CandidateProfileModal: React.FC<CandidateProfileModalProps> = ({
  isOpen,
  onClose,
  user,
  userProfile,
  languageMode,
  onSaveProfile
}) => {
  const isTamil = languageMode === 'tamil';

  // Form State
  const [name, setName] = useState(user?.name || userProfile.name || '');
  const [targetPaper, setTargetPaper] = useState<PaperType>(
    user?.targetPaper || userProfile.selectedPaper || 'PAPER_II_MATH_SCI'
  );
  const [category, setCategory] = useState<ReservationCategory>(
    user?.category || userProfile.category || 'BC_MBC_SC_ST'
  );
  const [dailyMinutes, setDailyMinutes] = useState<number>(
    user?.dailyMinutes || userProfile.dailyStudyMinutes || 45
  );
  const [targetExamDate, setTargetExamDate] = useState<string>(
    userProfile.targetExamDate || '2026-10-18'
  );

  const [activeTab, setActiveTab] = useState<'profile' | 'category' | 'exam' | 'calculator'>('category');
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Normalization Calculator State
  const [calcRawScore, setCalcRawScore] = useState<number>(85);
  const [calcShiftDifficulty, setCalcShiftDifficulty] = useState<'tough' | 'moderate' | 'easy'>('moderate');
  const [calcUGPercent, setCalcUGPercent] = useState<number>(75);
  const [calcBEdPercent, setCalcBEdPercent] = useState<number>(80);

  useEffect(() => {
    if (isOpen) {
      setName(user?.name || userProfile.name || '');
      setTargetPaper(user?.targetPaper || userProfile.selectedPaper || 'PAPER_II_MATH_SCI');
      setCategory(user?.category || userProfile.category || 'BC_MBC_SC_ST');
      setDailyMinutes(user?.dailyMinutes || userProfile.dailyStudyMinutes || 45);
      setTargetExamDate(userProfile.targetExamDate || '2026-10-18');
      setSaveSuccess(false);
    }
  }, [isOpen, user, userProfile]);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveProfile({
      name: name.trim() || user?.name || userProfile.name,
      targetPaper,
      category,
      dailyMinutes,
      targetExamDate
    });
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      onClose();
    }, 1200);
  };

  const targetMarks = category === 'OC_GENERAL' ? 90 : 82;
  const targetPercent = category === 'OC_GENERAL' ? 60 : 54.67;

  return (
    <div className="fixed inset-0 z-50 bg-[#0a0a0a]/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div 
        id="modal-candidate-profile"
        className="bg-[#121212] border border-[#2a2a2a] rounded-2xl max-w-2xl w-full max-h-[92vh] shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-[#262626] bg-[#171717] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#c5a059]/15 border border-[#c5a059]/30 flex items-center justify-center text-[#c5a059]">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-serif font-bold text-white flex items-center gap-2">
                <span>{isTamil ? 'ஆசிரியர் சுயவிவரம் & தேர்வு அமைப்புகள்' : 'Candidate Profile & Settings'}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#c5a059]/20 text-[#c5a059] border border-[#c5a059]/40 font-mono">
                  TNTET 2026
                </span>
              </h2>
              <p className="text-xs text-white/50">
                {isTamil 
                  ? 'இடஒதுக்கீட்டுப் பிரிவு, தகுதி மதிப்பெண்கள் மற்றும் தினசரி படிப்பு அட்டவணை' 
                  : 'Manage reservation category qualifying benchmark, study targets, and account details'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-white/50 hover:text-white hover:bg-white/10 transition"
            title="Close Profile Modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection Bar */}
        <div className="flex border-b border-[#262626] bg-[#141414] px-4 sm:px-6 gap-2 text-xs font-semibold overflow-x-auto scrollbar-none">
          <button
            type="button"
            onClick={() => setActiveTab('category')}
            className={`py-3 px-3 border-b-2 flex items-center gap-2 whitespace-nowrap transition ${
              activeTab === 'category'
                ? 'border-[#c5a059] text-[#c5a059]'
                : 'border-transparent text-white/60 hover:text-white'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>{isTamil ? 'இடஒதுக்கீடு & தகுதி மதிப்பெண் (விருப்பம்)' : 'Category & Qualifying Marks (Optional)'}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('exam')}
            className={`py-3 px-3 border-b-2 flex items-center gap-2 whitespace-nowrap transition ${
              activeTab === 'exam'
                ? 'border-[#c5a059] text-[#c5a059]'
                : 'border-transparent text-white/60 hover:text-white'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>{isTamil ? 'தேர்வு தாள் & தினசரி நேரம்' : 'Exam Paper & Schedule'}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('calculator')}
            className={`py-3 px-3 border-b-2 flex items-center gap-2 whitespace-nowrap transition ${
              activeTab === 'calculator'
                ? 'border-[#c5a059] text-[#c5a059]'
                : 'border-transparent text-white/60 hover:text-white'
            }`}
          >
            <Calculator className="w-4 h-4" />
            <span>{isTamil ? 'கட்-ஆஃப் & நார்மலைசேஷன் கால்குலேட்டர்' : 'Cutoff & Normalization Calculator'}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            className={`py-3 px-3 border-b-2 flex items-center gap-2 whitespace-nowrap transition ${
              activeTab === 'profile'
                ? 'border-[#c5a059] text-[#c5a059]'
                : 'border-transparent text-white/60 hover:text-white'
            }`}
          >
            <User className="w-4 h-4" />
            <span>{isTamil ? 'கணக்கு விவரங்கள்' : 'Account Details'}</span>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 text-xs sm:text-sm text-white">
          
          {/* TAB 1: RESERVATION CATEGORY & QUALIFYING MARKS (OPTIONAL) */}
          {activeTab === 'category' && (
            <div className="space-y-5 animate-fadeIn">
              
              {/* Category Info Banner */}
              <div className="p-4 rounded-xl bg-[#171717] border border-[#2d2d2d] space-y-2.5">
                <div className="flex items-center gap-2 text-[#c5a059] font-bold text-xs">
                  <ShieldCheck className="w-4 h-4" />
                  <span>
                    {isTamil 
                      ? 'TRB அதிகாரப்பூர்வ தகுதி மதிப்பெண் விதிமுறைகள் (G.O. Ms. No. 25 & 29)' 
                      : 'TRB Official Qualifying Criteria (Govt of Tamil Nadu)'}
                  </span>
                </div>
                <p className="text-xs text-white/70 leading-relaxed">
                  {isTamil 
                    ? 'TNTET தேர்வில் மொத்தம் 150 வினாக்கள் உள்ளன. பொதுப் பிரிவினருக்கு 60% (90 மதிப்பெண்கள்) மற்றும் BC, BCM, MBC, DNC, SC, SCA, ST பிரிவினருக்கு 55% (82 மதிப்பெண்கள்) தகுதி வரம்பாக நிர்ணயிக்கப்பட்டுள்ளது. இப்பிரிவு விருப்பத்தேர்வாகும்; உங்கள் டாஷ்போர்டு இலக்கை துல்லியமாக கணக்கிட இது உதவுகிறது.' 
                    : 'The TNTET examination consists of 150 marks. The qualifying benchmark is 60% (90 marks) for Open Competition (OC) and 55% (82 marks) for BC, BCM, MBC, DNC, SC, SC(A), ST and PwD candidates. Setting this is optional and customizes your readiness gauge.'}
                </p>
              </div>

              {/* Category Option Cards */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-white/90 uppercase tracking-wider">
                    {isTamil ? 'உங்கள் இடஒதுக்கீட்டுப் பிரிவை தேர்ந்தெடுக்கவும் (விருப்பத்தேர்வு):' : 'Select Qualifying Benchmark Target (Optional):'}
                  </label>
                  <span className="text-[11px] text-[#c5a059] font-mono">
                    Current: <strong>{targetMarks} / 150 Marks</strong>
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Reserved Option (82 Marks) */}
                  <div
                    onClick={() => setCategory('BC_MBC_SC_ST')}
                    className={`cursor-pointer p-4 rounded-xl border transition relative ${
                      category === 'BC_MBC_SC_ST'
                        ? 'bg-[#c5a059]/15 border-[#c5a059] shadow-lg shadow-[#c5a059]/5'
                        : 'bg-[#181818] border-[#2c2c2c] hover:border-white/20'
                    }`}
                  >
                    {category === 'BC_MBC_SC_ST' && (
                      <div className="absolute top-3 right-3 text-[#c5a059]">
                        <CheckCircle2 className="w-5 h-5" />
                      </div>
                    )}
                    <div className="text-xs font-bold text-emerald-400">
                      BC / BCM / MBC / DNC / SC / ST
                    </div>
                    <div className="text-[11px] text-white/50 mt-0.5">
                      {isTamil ? 'பிற்படுத்தப்பட்ட & ஆதிதிராவிடர் பிரிவுகள்' : 'Reserved Category Candidates'}
                    </div>

                    <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between">
                      <div>
                        <div className="text-[10px] text-white/50 uppercase font-semibold">Qualifying Cutoff</div>
                        <div className="text-base font-serif font-bold text-emerald-400">82 / 150</div>
                      </div>
                      <div className="text-right">
                        <div className="text-[10px] text-white/50 uppercase font-semibold">Percentage</div>
                        <div className="text-sm font-bold text-white font-mono">55%</div>
                      </div>
                    </div>
                  </div>

                  {/* General Option (90 Marks) */}
                  <div
                    onClick={() => setCategory('OC_GENERAL')}
                    className={`cursor-pointer p-4 rounded-xl border transition relative ${
                      category === 'OC_GENERAL'
                        ? 'bg-[#c5a059]/15 border-[#c5a059] shadow-lg shadow-[#c5a059]/5'
                        : 'bg-[#181818] border-[#2c2c2c] hover:border-white/20'
                    }`}
                  >
                    {category === 'OC_GENERAL' && (
                      <div className="absolute top-3 right-3 text-[#c5a059]">
                        <CheckCircle2 className="w-5 h-5" />
                      </div>
                    )}
                    <div className="text-xs font-bold text-[#c5a059]">
                      OC / General Competition
                    </div>
                    <div className="text-[11px] text-white/50 mt-0.5">
                      {isTamil ? 'பொதுப் பிரிவு (Open Competition)' : 'Standard Open Merit Benchmark'}
                    </div>

                    <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between">
                      <div>
                        <div className="text-[10px] text-white/50 uppercase font-semibold">Qualifying Cutoff</div>
                        <div className="text-base font-serif font-bold text-[#c5a059]">90 / 150</div>
                      </div>
                      <div className="text-right">
                        <div className="text-[10px] text-white/50 uppercase font-semibold">Percentage</div>
                        <div className="text-sm font-bold text-white font-mono">60%</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Target Cutoff Calibration Meter */}
              <div className="p-4 rounded-xl bg-[#181818] border border-[#2c2c2c] space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-white/80 flex items-center gap-1.5">
                    <Target className="w-3.5 h-3.5 text-[#c5a059]" />
                    {isTamil ? 'தேர்வு தகுதி அளவுகோல் (150 மதிப்பெண்கள்):' : 'Calibrated Qualification Threshold (out of 150):'}
                  </span>
                  <span className="text-xs font-bold text-[#c5a059]">
                    {targetMarks} Marks ({category === 'OC_GENERAL' ? '60%' : '55%'})
                  </span>
                </div>

                <div className="relative h-3 bg-[#111111] rounded-full overflow-hidden border border-white/10">
                  {/* Benchmark fill */}
                  <div 
                    className="h-full bg-gradient-to-r from-emerald-600 via-[#c5a059] to-[#e5c581] transition-all duration-300"
                    style={{ width: `${(targetMarks / 150) * 100}%` }}
                  />
                  {/* 82 marker */}
                  <div className="absolute top-0 bottom-0 left-[54.67%] w-0.5 bg-emerald-400" title="82 Marks (Reserved)" />
                  {/* 90 marker */}
                  <div className="absolute top-0 bottom-0 left-[60%] w-0.5 bg-[#c5a059]" title="90 Marks (General)" />
                </div>

                <div className="flex justify-between text-[10px] text-white/50 font-mono">
                  <span>0 Marks</span>
                  <span className="text-emerald-400 font-bold">82 (Reserved 55%)</span>
                  <span className="text-[#c5a059] font-bold">90 (General 60%)</span>
                  <span>150 Marks (Max)</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: EXAM PAPER & DAILY TIME */}
          {activeTab === 'exam' && (
            <div className="space-y-5 animate-fadeIn">
              {/* Target Exam Paper */}
              <div>
                <label className="block text-xs font-bold text-white/90 uppercase tracking-wider mb-2">
                  {isTamil ? 'தேர்வு தாள் (Target Exam Paper):' : 'Select Target Exam Paper:'}
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div
                    onClick={() => setTargetPaper('PAPER_I')}
                    className={`cursor-pointer p-3.5 rounded-xl border transition ${
                      targetPaper === 'PAPER_I'
                        ? 'bg-[#c5a059]/15 border-[#c5a059] text-white'
                        : 'bg-[#181818] border-[#2c2c2c] text-white/70 hover:border-white/20'
                    }`}
                  >
                    <div className="font-bold text-sm">Paper I</div>
                    <div className="text-[11px] text-white/50 mt-0.5">Classes 1–5 (Primary)</div>
                    <div className="text-[10px] text-[#c5a059] mt-2 font-mono">CDP + Tam + Eng + Mat + EVS</div>
                  </div>

                  <div
                    onClick={() => setTargetPaper('PAPER_II_MATH_SCI')}
                    className={`cursor-pointer p-3.5 rounded-xl border transition ${
                      targetPaper === 'PAPER_II_MATH_SCI'
                        ? 'bg-[#c5a059]/15 border-[#c5a059] text-white'
                        : 'bg-[#181818] border-[#2c2c2c] text-white/70 hover:border-white/20'
                    }`}
                  >
                    <div className="font-bold text-sm">Paper II (M&S)</div>
                    <div className="text-[11px] text-white/50 mt-0.5">Classes 6–8 (Math & Sci)</div>
                    <div className="text-[10px] text-[#c5a059] mt-2 font-mono">CDP + Tam + Eng + (Math/Sci 60Q)</div>
                  </div>

                  <div
                    onClick={() => setTargetPaper('PAPER_II_SOC_SCI')}
                    className={`cursor-pointer p-3.5 rounded-xl border transition ${
                      targetPaper === 'PAPER_II_SOC_SCI'
                        ? 'bg-[#c5a059]/15 border-[#c5a059] text-white'
                        : 'bg-[#181818] border-[#2c2c2c] text-white/70 hover:border-white/20'
                    }`}
                  >
                    <div className="font-bold text-sm">Paper II (Soc)</div>
                    <div className="text-[11px] text-white/50 mt-0.5">Classes 6–8 (Social Sci)</div>
                    <div className="text-[10px] text-[#c5a059] mt-2 font-mono">CDP + Tam + Eng + (Social 60Q)</div>
                  </div>
                </div>
              </div>

              {/* Daily Study Minutes Commitment */}
              <div>
                <label className="block text-xs font-bold text-white/90 uppercase tracking-wider mb-2 flex items-center justify-between">
                  <span>{isTamil ? 'தினசரி படிக்கும் நேரம் (Daily Study Time):' : 'Daily Study Commitment:'}</span>
                  <span className="text-[#c5a059] font-bold font-mono">{dailyMinutes} Minutes / Day</span>
                </label>

                <div className="grid grid-cols-4 gap-2">
                  {[35, 45, 60, 90].map((mins) => (
                    <button
                      key={mins}
                      type="button"
                      onClick={() => setDailyMinutes(mins)}
                      className={`py-2 rounded-xl text-xs font-semibold border transition ${
                        dailyMinutes === mins
                          ? 'bg-[#c5a059] text-black border-[#c5a059] font-bold'
                          : 'bg-[#181818] text-white/70 border-[#2c2c2c] hover:border-white/20'
                      }`}
                    >
                      {mins} Mins
                    </button>
                  ))}
                </div>
              </div>

              {/* Target Exam Date */}
              <div className="p-4 rounded-xl bg-[#181818] border border-[#2c2c2c] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-xs text-white flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-[#c5a059]" />
                    {isTamil ? 'இலக்கு தேர்வு தேதி:' : 'Target Exam Date:'}
                  </span>
                  <span className="text-xs font-mono text-[#c5a059] font-bold">{targetExamDate}</span>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="date"
                    value={targetExamDate}
                    onChange={(e) => setTargetExamDate(e.target.value)}
                    className="px-3 py-2 rounded-lg bg-[#121212] border border-[#2c2c2c] text-white text-xs focus:outline-none focus:border-[#c5a059]"
                  />
                  <span className="text-[11px] text-white/50">
                    {isTamil ? 'அறிவிக்கப்பட்ட தேர்வுத் தேதியை இங்கு அமைக்கலாம்.' : 'Set according to the official TRB examination notification.'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* TAB: CUTOFF & NORMALIZATION CALCULATOR */}
          {activeTab === 'calculator' && (() => {
            const shiftParams = {
              tough: { mu: 64.0, sigma: 13.5, labelEn: 'Hard Shift (Tough Questions)', labelTa: 'கடினமான ஷிப்ட் (Tough Shift)' },
              moderate: { mu: 74.0, sigma: 14.5, labelEn: 'Standard Shift (Moderate)', labelTa: 'நடுத்தர ஷிப்ட் (Moderate Shift)' },
              easy: { mu: 84.0, sigma: 15.5, labelEn: 'Easy Shift (High Averages)', labelTa: 'எளிதான ஷிப்ட் (Easy Shift)' }
            }[calcShiftDifficulty];

            const mu_g = 75.0;
            const sigma_g = 14.5;
            const normalized = Math.min(150, Math.max(0, Math.round(((calcRawScore - shiftParams.mu) / shiftParams.sigma) * sigma_g + mu_g)));
            const requiredCutoff = category === 'OC_GENERAL' ? 90 : 82;
            const margin = normalized - requiredCutoff;
            const isQualified = normalized >= requiredCutoff;

            const tntetWeightage = Number(((normalized / 150) * 60).toFixed(2));
            const ugWeightage = Number(((calcUGPercent / 100) * 15).toFixed(2));
            const bedWeightage = Number(((calcBEdPercent / 100) * 15).toFixed(2));
            const totalMerit = Number((tntetWeightage + ugWeightage + bedWeightage).toFixed(2));

            return (
              <div className="space-y-5 animate-fadeIn">
                {/* Intro Banner */}
                <div className="p-4 rounded-xl bg-[#171717] border border-[#2d2d2d] space-y-2">
                  <div className="flex items-center gap-2 text-[#c5a059] font-bold text-xs">
                    <Calculator className="w-4 h-4" />
                    <span>
                      {isTamil 
                        ? 'TRB கணினி வழி தேர்வு (CBT) நார்மலைசேஷன் & கட்-ஆஃப் சிமுலேட்டர்' 
                        : 'TRB Multi-Session CBT Score Normalization & Cutoff Calculator'}
                    </span>
                  </div>
                  <p className="text-xs text-white/70 leading-relaxed">
                    {isTamil 
                      ? 'தமிழ்நாடு ஆசிரியர் தேர்வு வாரியம் பல்வேறு ஷிப்டுகளில் நடத்தும் தேர்வுகளில் வினாக்களின் கடினத்தன்மையை சமன் செய்ய கணித சூத்திரத்தின்படி (Standard Deviation Normalization Formula) மதிப்பெண்களை கணக்கிடுகிறது.' 
                      : 'Simulate how TRB multi-session CBT normalization affects your raw score based on shift difficulty and your category qualifying threshold (OC 90 vs BC/MBC/SC/ST 82).'}
                  </p>
                </div>

                {/* Interactive Inputs */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Raw Score Slider */}
                  <div className="p-4 rounded-xl bg-[#181818] border border-[#2c2c2c] space-y-2.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-white/90">
                        {isTamil ? 'உத்தேச நேரடி மதிப்பெண் (Raw Score):' : 'Expected Raw Marks (out of 150):'}
                      </label>
                      <span className="text-base font-bold font-mono text-[#c5a059]">{calcRawScore} / 150</span>
                    </div>
                    <input
                      type="range"
                      min="40"
                      max="150"
                      value={calcRawScore}
                      onChange={(e) => setCalcRawScore(Number(e.target.value))}
                      className="w-full accent-[#c5a059] cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-white/40 font-mono">
                      <span>40 Min</span>
                      <span>82 (Reserved)</span>
                      <span>90 (OC)</span>
                      <span>150 Max</span>
                    </div>
                  </div>

                  {/* Shift Difficulty Selector */}
                  <div className="p-4 rounded-xl bg-[#181818] border border-[#2c2c2c] space-y-2.5">
                    <label className="text-xs font-semibold text-white/90 block">
                      {isTamil ? 'தேர்வு ஷிப்ட் கடினத்தன்மை:' : 'CBT Session Difficulty Level:'}
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {(['tough', 'moderate', 'easy'] as const).map((lvl) => (
                        <button
                          key={lvl}
                          type="button"
                          onClick={() => setCalcShiftDifficulty(lvl)}
                          className={`py-2 px-1 text-center rounded-lg text-xs font-semibold border transition ${
                            calcShiftDifficulty === lvl
                              ? 'bg-[#c5a059]/20 border-[#c5a059] text-[#c5a059]'
                              : 'bg-[#121212] border-white/10 text-white/60 hover:text-white'
                          }`}
                        >
                          {lvl === 'tough' ? 'Hard (+)' : lvl === 'moderate' ? 'Moderate' : 'Easy (-)'}
                        </button>
                      ))}
                    </div>
                    <p className="text-[10px] text-white/40">
                      {shiftParams.labelEn} (Mean: {shiftParams.mu})
                    </p>
                  </div>
                </div>

                {/* Real-time Calculation Result Card */}
                <div className={`p-5 rounded-2xl border transition-all ${
                  isQualified 
                    ? 'bg-emerald-950/20 border-emerald-500/40 shadow-lg ring-1 ring-emerald-500/20' 
                    : 'bg-rose-950/20 border-rose-500/40 shadow-lg'
                }`}>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-wider text-white/50">
                        {isTamil ? 'கணக்கிடப்பட்ட நார்மலைஸ்டு மதிப்பெண்' : 'Projected Normalized Score'}
                      </div>
                      <div className="text-3xl font-serif font-bold text-white mt-0.5 flex items-baseline gap-2">
                        <span>{normalized}</span>
                        <span className="text-xs text-white/40 font-sans font-normal">/ 150 Marks</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${
                        isQualified 
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                          : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      }`}>
                        {isQualified ? <CheckCircle2 className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
                        <span>{isQualified ? (isTamil ? 'சான்றிதழ் சரிபார்ப்புக்கு தகுதி (QUALIFIED)' : 'QUALIFIED FOR CV') : (isTamil ? 'தகுதி பெறவில்லை (BELOW CUTOFF)' : 'BELOW CUTOFF')}</span>
                      </div>
                      <div className="text-[11px] text-white/60 mt-1 font-mono">
                        Target Cutoff: <strong>{requiredCutoff} Marks</strong> ({category === 'OC_GENERAL' ? 'OC 60%' : 'BC/MBC/SC/ST 55%'})
                      </div>
                    </div>
                  </div>

                  {/* Shift Delta & Margin */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-4 text-xs">
                    <div className="p-2.5 rounded-xl bg-white/[0.03]">
                      <div className="text-[10px] text-white/40">{isTamil ? 'ஷிப்ட் சரிசெய்தல் (Delta):' : 'Shift Delta:'}</div>
                      <div className={`font-mono font-bold text-sm ${normalized >= calcRawScore ? 'text-emerald-400' : 'text-amber-400'}`}>
                        {normalized >= calcRawScore ? `+${normalized - calcRawScore}` : `${normalized - calcRawScore}`} Marks
                      </div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-white/[0.03]">
                      <div className="text-[10px] text-white/40">{isTamil ? 'கட்-ஆஃப் பாதுகாப்பு இடைவெளி:' : 'Safety Margin:'}</div>
                      <div className={`font-mono font-bold text-sm ${margin >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {margin >= 0 ? `+${margin} Marks (Safe)` : `${margin} Marks (Deficit)`}
                      </div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-white/[0.03] col-span-2 sm:col-span-1">
                      <div className="text-[10px] text-white/40">{isTamil ? 'TNTET வெயிட்டேஜ் (60%):' : 'TNTET Weightage (60%):'}</div>
                      <div className="font-mono font-bold text-sm text-[#c5a059]">
                        {tntetWeightage} / 60.00
                      </div>
                    </div>
                  </div>
                </div>

                {/* Additional Merit Weightage Calculator (Degree + B.Ed) */}
                <div className="p-4 rounded-xl bg-[#181818] border border-[#2c2c2c] space-y-3">
                  <div className="flex items-center justify-between text-xs font-semibold text-[#c5a059]">
                    <span className="flex items-center gap-1.5">
                      <TrendingUp className="w-3.5 h-3.5" />
                      {isTamil ? 'TRB ஆசிரியர் தேர்வு இறுதி தகுதி பட்டியல் (Merit Weightage Projection)' : 'TRB Final Merit Weightage Calculator (UG + B.Ed + TNTET)'}
                    </span>
                    <span className="text-[11px] font-mono text-white/60">Total: <strong>{totalMerit} / 90.00</strong></span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="block text-white/70 mb-1">
                        {isTamil ? 'பட்டப்படிப்பு (UG Degree %):' : 'UG Degree Percentage (%):'}
                      </label>
                      <input
                        type="number"
                        min="40"
                        max="100"
                        value={calcUGPercent}
                        onChange={(e) => setCalcUGPercent(Math.min(100, Math.max(0, Number(e.target.value))))}
                        className="w-full bg-[#121212] border border-[#2c2c2c] px-3 py-1.5 rounded-lg text-white font-mono"
                      />
                      <span className="text-[10px] text-white/40">Weightage (15%): {ugWeightage} pts</span>
                    </div>

                    <div>
                      <label className="block text-white/70 mb-1">
                        {isTamil ? 'பி.எட் (B.Ed Degree %):' : 'B.Ed Degree Percentage (%):'}
                      </label>
                      <input
                        type="number"
                        min="40"
                        max="100"
                        value={calcBEdPercent}
                        onChange={(e) => setCalcBEdPercent(Math.min(100, Math.max(0, Number(e.target.value))))}
                        className="w-full bg-[#121212] border border-[#2c2c2c] px-3 py-1.5 rounded-lg text-white font-mono"
                      />
                      <span className="text-[10px] text-white/40">Weightage (15%): {bedWeightage} pts</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* TAB 3: ACCOUNT DETAILS */}
          {activeTab === 'profile' && (
            <div className="space-y-4 animate-fadeIn">
              <div>
                <label className="block text-xs font-semibold text-white/80 mb-1.5">
                  {isTamil ? 'ஆசிரியர் பெயர் (Candidate Full Name)' : 'Candidate Full Name'}
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-white/40 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Meena S."
                    className="w-full bg-[#181818] border border-[#2c2c2c] focus:border-[#c5a059] rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-white placeholder-white/30 outline-none transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/80 mb-1.5">
                  {isTamil ? 'பதிவு செய்யப்பட்ட மின்னஞ்சல் (Registered Email)' : 'Registered Email'}
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-white/40 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    disabled
                    value={user?.email || 'candidate@tntet2026.com'}
                    className="w-full bg-[#151515] border border-[#242424] rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-white/50 cursor-not-allowed outline-none"
                  />
                </div>
                <p className="text-[10px] text-white/40 mt-1">
                  {isTamil ? 'கணக்கு மின்னஞ்சல் மாற்றுவதற்கு நிர்வாகியை தொடர்பு கொள்ளவும்.' : 'Email is locked to your authenticated candidate profile.'}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-[#181818] border border-[#262626] space-y-1.5">
                <div className="text-[11px] font-bold text-white flex items-center justify-between">
                  <span>Candidate Authentication Provider</span>
                  <span className="capitalize text-[#c5a059]">{user?.provider || 'Email/Password'}</span>
                </div>
                <div className="text-[10px] text-white/50">
                  Profile synchronization is active across offline local storage and cloud database.
                </div>
              </div>
            </div>
          )}

          {/* Success Toast */}
          {saveSuccess && (
            <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-800 text-emerald-300 text-xs font-semibold flex items-center gap-2 animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>
                {isTamil 
                  ? 'சுயவிவர அமைப்புகள் வெற்றிகரமாக சேமிக்கப்பட்டன!' 
                  : 'Candidate profile and qualifying target updated successfully!'}
              </span>
            </div>
          )}

          {/* Action Footer */}
          <div className="pt-3 border-t border-[#262626] flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-[#181818] hover:bg-[#222222] border border-[#333333] text-white font-semibold text-xs transition"
            >
              {isTamil ? 'ரத்து செய்க' : 'Cancel'}
            </button>

            <button
              type="submit"
              id="btn-save-profile-settings"
              className="px-5 py-2.5 rounded-xl bg-[#c5a059] hover:bg-[#d8b56f] text-black font-bold text-xs transition flex items-center gap-2 shadow-lg shadow-[#c5a059]/10"
            >
              <Save className="w-4 h-4" />
              <span>{isTamil ? 'மாற்றங்களை சேமிக்க' : 'Save Changes'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
