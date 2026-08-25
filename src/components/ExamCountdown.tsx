import React, { useState, useEffect } from 'react';
import { Calendar, Clock } from 'lucide-react';

interface ExamCountdownProps {
  targetExamDate?: string;
  isTamil?: boolean;
  selectedPaper?: string;
}

export const ExamCountdown: React.FC<ExamCountdownProps> = ({
  targetExamDate = '2026-10-18',
  isTamil = false,
}) => {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    isPast: boolean;
  }>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isPast: false,
  });

  useEffect(() => {
    const calculateTime = () => {
      const examDate = new Date(targetExamDate + 'T09:30:00+05:30').getTime();
      const now = new Date().getTime();
      const difference = examDate - now;

      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isPast: true });
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds, isPast: false });
    };

    calculateTime();
    const timer = setInterval(calculateTime, 1000);
    return () => clearInterval(timer);
  }, [targetExamDate]);

  const formattedExamDate = new Date(targetExamDate).toLocaleDateString(isTamil ? 'ta-IN' : 'en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <div className="bg-[#141414] border border-white/10 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      {/* Left: Milestone Info */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-[#c5a059]/10 border border-[#c5a059]/30 flex items-center justify-center text-[#c5a059] shrink-0">
          <Calendar className="w-4 h-4" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-bold tracking-wider text-white/50">
              {isTamil ? 'அதிகாரப்பூர்வ தேர்வு நாள்' : 'Official TRB Milestone'}
            </span>
            <span className="text-[11px] text-[#c5a059] font-medium">
              {formattedExamDate}
            </span>
          </div>
          <p className="text-xs font-semibold text-white mt-0.5">
            {isTamil ? 'தேர்வுக்கு மீதமுள்ள அவகாசம்' : 'Target Exam Countdown'}
          </p>
        </div>
      </div>

      {/* Right: Digital Countdown Digits */}
      <div className="flex items-center gap-2 self-start sm:self-auto font-mono">
        {/* Days */}
        <div className="flex items-baseline gap-1 bg-white/[0.04] border border-white/10 px-3 py-1.5 rounded-lg">
          <span className="text-lg sm:text-xl font-bold text-white tracking-tight">
            {String(timeLeft.days).padStart(2, '0')}
          </span>
          <span className="text-[10px] font-sans font-medium text-white/40 uppercase">
            {isTamil ? 'நாள்' : 'd'}
          </span>
        </div>

        <span className="text-white/20 font-bold">:</span>

        {/* Hours */}
        <div className="flex items-baseline gap-1 bg-white/[0.04] border border-white/10 px-2.5 py-1.5 rounded-lg">
          <span className="text-base sm:text-lg font-bold text-white/90">
            {String(timeLeft.hours).padStart(2, '0')}
          </span>
          <span className="text-[10px] font-sans font-medium text-white/40 uppercase">
            {isTamil ? 'மணி' : 'h'}
          </span>
        </div>

        <span className="text-white/20 font-bold">:</span>

        {/* Mins */}
        <div className="flex items-baseline gap-1 bg-white/[0.04] border border-white/10 px-2.5 py-1.5 rounded-lg">
          <span className="text-base sm:text-lg font-bold text-white/90">
            {String(timeLeft.minutes).padStart(2, '0')}
          </span>
          <span className="text-[10px] font-sans font-medium text-white/40 uppercase">
            {isTamil ? 'நிமி' : 'm'}
          </span>
        </div>

        <span className="text-white/20 font-bold hidden sm:inline">:</span>

        {/* Secs */}
        <div className="hidden sm:flex items-baseline gap-1 bg-white/[0.04] border border-white/10 px-2.5 py-1.5 rounded-lg">
          <span className="text-base sm:text-lg font-bold text-[#c5a059]">
            {String(timeLeft.seconds).padStart(2, '0')}
          </span>
          <span className="text-[10px] font-sans font-medium text-white/40 uppercase">
            {isTamil ? 'நொடி' : 's'}
          </span>
        </div>
      </div>
    </div>
  );
};
