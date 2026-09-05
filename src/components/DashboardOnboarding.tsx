import React from 'react';
import {
  Brain,
  ClipboardList,
  PlayCircle,
  Route,
  Sparkles,
  Target,
  FileText,
  CalendarSync,
  TrendingUp,
} from 'lucide-react';

interface DashboardOnboardingProps {
  name: string;
  isTamil: boolean;
  onStartDiagnostic: () => void;
  onStartDailyPlan: () => void;
}

export const DashboardOnboarding: React.FC<DashboardOnboardingProps> = ({
  name,
  isTamil,
  onStartDiagnostic,
  onStartDailyPlan,
}) => {
  const steps = [
    {
      icon: ClipboardList,
      title: isTamil ? 'கண்டறி சோதனையை முடிக்கவும் (15 நிமிடம்)' : 'Take a 15-minute diagnostic',
      desc: isTamil
        ? 'அனைத்து 5 பாடங்களிலும் 15 கேள்விகள் உங்கள் வலிமையையும் இடைவெளிகளையும் கண்டறியும்.'
        : '15 questions across all 5 subjects map your current strengths and gaps.',
    },
    {
      icon: Target,
      title: isTamil ? 'உங்கள் தனிப்பயன் தினசரி திட்டத்தைப் பெறுங்கள்' : 'Get your personalised daily plan',
      desc: isTamil
        ? 'உங்கள் பலவீனங்களைச் சுற்றி 35 நிமிட கற்றல் -> பயிற்சி -> மறுபரிசீலனை சுழற்சி. ஒவ்வொரு நாளும் முடியும்.'
        : 'A 35-minute learn -> practice -> review cycle built around your weak areas. Doable every day.',
    },
    {
      icon: TrendingUp,
      title: isTamil ? 'முன்னேற்றத்தைக் கண்காணிக்கவும்' : 'Track your progress',
      desc: isTamil
        ? 'தயார்நிலை மதிப்பெண், தொடர் நாட்கள் மற்றும் முழு மாதிரித் தேர்வுகள் உங்களைப் பாதையில் வைத்திருக்கும்.'
        : 'A readiness score, daily streaks, and full mock exams keep you on track to qualify.',
    },
  ];

  return (
    <div className="space-y-5 max-w-4xl mx-auto pb-10">
      {/* Hero card */}
      <div className="bg-gradient-to-br from-[#161210] via-[#121212] to-[#0f0f0f] border border-[#c5a059]/25 rounded-2xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-[#c5a059]/10 blur-3xl pointer-events-none" />
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border border-[#c5a059]/30 bg-[#c5a059]/10 text-[#c5a059] text-[10px] font-semibold uppercase tracking-wider">
            <Sparkles className="w-3 h-3" />
            TNTET 2026 Coach
          </span>
        </div>

        <h1 className="mt-4 text-2xl sm:text-3xl font-serif-luxury font-normal tracking-tight text-white">
          {isTamil ? `வணக்கம், ${name}!` : `Welcome, ${name}!`}
        </h1>
        <p className="mt-2 text-sm text-white/70 max-w-xl leading-relaxed">
          {isTamil
            ? 'இந்த பயிற்சி திட்டம் TNTET சிலபஸை ஒரு எளிய தினசரி வழக்கமாக மாற்றுகிறது. தொடங்க 2 நிமிடங்கள் மட்டுமே.'
            : 'TNTET Personal Coach turns the full syllabus into one simple daily routine. It only takes 2 minutes to get started.'}
        </p>

        <div className="mt-6 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <button
            id="btn-onboarding-diagnostic"
            onClick={onStartDiagnostic}
            className="px-5 py-3 rounded-xl bg-[#c5a059] hover:bg-[#d8b56f] text-black font-bold text-sm uppercase tracking-wider shadow-lg transition flex items-center justify-center gap-2"
          >
            <ClipboardList className="w-4 h-4" />
            {isTamil ? 'கண்டறி தேர்வைத் தொடங்கு (15 நிமி)' : 'Start Diagnostic (15 mins)'}
          </button>
          <button
            id="btn-onboarding-skip"
            onClick={onStartDailyPlan}
            className="px-5 py-3 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-white font-medium text-sm transition flex items-center justify-center gap-2"
          >
            <PlayCircle className="w-4 h-4 text-[#c5a059]" />
            {isTamil ? 'தவிர்க்கவும் - இன்றைய பயிற்சியைத் தொடங்கவும்' : 'Skip — start today\'s practice'}
          </button>
        </div>
      </div>

      {/* Steps */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {steps.map((step, idx) => (
          <div
            key={idx}
            className="bg-[#121212] border border-white/10 rounded-xl p-5 shadow-lg flex flex-col gap-3"
          >
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 rounded-lg bg-[#c5a059]/10 border border-[#c5a059]/30 flex items-center justify-center text-[#c5a059]">
                <step.icon className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-mono font-bold text-white/30">STEP {idx + 1}</span>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white leading-snug">{step.title}</h3>
              <p className="mt-1.5 text-xs text-white/60 font-light leading-relaxed">{step.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Reassurance chips */}
      <div className="flex flex-wrap items-center justify-center gap-3">
        {[
          { icon: Route, label: isTamil ? 'தினசரி 35 நிமிட திட்டம்' : 'Daily 35-min plan' },
          { icon: Brain, label: isTamil ? 'AI ஆசிரியர்' : 'AI Tutor' },
          { icon: FileText, label: isTamil ? 'அச்சிடக்கூடிய PDF அறிக்கைகள்' : 'Printable PDF reports' },
          { icon: CalendarSync, label: isTamil ? 'Google காலண்டர் / Sheets' : 'Google Calendar / Sheets' },
        ].map((chip, idx) => (
          <span
            key={idx}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.08] text-[11px] text-white/60"
          >
            <chip.icon className="w-3 h-3 text-[#c5a059]" />
            {chip.label}
          </span>
        ))}
      </div>
    </div>
  );
};