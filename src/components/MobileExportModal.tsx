import React, { useState } from 'react';
import { 
  Smartphone, 
  Download, 
  Terminal, 
  CheckCircle2, 
  Copy, 
  Check, 
  ExternalLink, 
  Layers, 
  Cpu, 
  ShieldCheck, 
  Zap, 
  Sparkles,
  X
} from 'lucide-react';
import { triggerHaptic } from '../services/nativeMobileService';
import { LanguageMode } from '../types';

interface MobileExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  languageMode: LanguageMode;
}

export const MobileExportModal: React.FC<MobileExportModalProps> = ({
  isOpen,
  onClose,
  languageMode
}) => {
  const isTamil = languageMode === 'tamil';
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  if (!isOpen) return null;

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    triggerHaptic.light();
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const steps = [
    {
      step: 1,
      title: isTamil ? '1. செயலியைத் தொகுக்கவும் (Production Build)' : '1. Generate Web Bundle',
      desc: isTamil ? 'உங்கள் அனைத்து வினாக்கள், தமிழ் எழுத்துருக்கள் மற்றும் ஆஃப்லைன் தற்காலிக நினைவகத்தை தொகுக்கவும்.' : 'Compiles all React modules, Tamil typography, and offline indexed storage.',
      cmd: 'npm run build'
    },
    {
      step: 2,
      title: isTamil ? '2. ஆண்ட்ராய்டு தளத்தை இணைக்கவும் (Capacitor Sync)' : '2. Synchronize Native Assets',
      desc: isTamil ? 'தொகுக்கப்பட்ட கோப்புகளை நேட்டிவ் ஆண்ட்ராய்டு/iOS கோப்பகத்தில் ஒத்திசைக்கவும்.' : 'Copies the compiled production dist assets into Android Studio & Xcode projects.',
      cmd: 'npx cap sync'
    },
    {
      step: 3,
      title: isTamil ? '3. Android Studio-வில் திறக்கவும்' : '3. Launch in Android Studio',
      desc: isTamil ? 'நேரடியாக Android Studio-வில் திறந்து ஒன்-கிளிக் மூலம் APK / AAB கோப்பை உருவாக்கவும்.' : 'Opens the full native Android workspace where you can click "Build > Build APK".',
      cmd: 'npx cap open android'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#121212] border border-white/10 rounded-2xl max-w-2xl w-full p-6 sm:p-7 space-y-6 shadow-2xl my-8 text-white relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-lg text-white/50 hover:text-white hover:bg-white/[0.06] transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#c5a059] to-[#8d6f30] flex items-center justify-center text-black font-bold shadow-lg shadow-[#c5a059]/20 shrink-0">
            <Smartphone className="w-6 h-6" />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 text-[10px] font-bold uppercase tracking-wider border border-emerald-500/30">
              <Sparkles className="w-3 h-3" />
              <span>Capacitor Native Engine</span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold font-serif-luxury text-white">
              {isTamil ? 'மொபைல் செயலி (Android APK & iOS) உருவாக்கம்' : 'Convert to Native Mobile App (Android & iOS)'}
            </h2>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-white/70 leading-relaxed">
          {isTamil
            ? 'இந்த பயன்பாட்டில் Capacitor Native Engine முன்பே கட்டமைக்கப்பட்டுள்ளது. கீழே உள்ள 3 படிகளைப் பின்பற்றி உடனடியாக உங்கள் மொபைல் செயலியை (APK) பெறலாம்.'
            : 'Capacitor Native Engine is already configured in your workspace with full native status bar, splash screen, hardware back button, and haptic feedback support.'}
        </p>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10 space-y-1">
            <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
              <Zap className="w-3.5 h-3.5" />
              <span>Zero-Lag Haptics</span>
            </div>
            <p className="text-white/50 text-[11px]">Tactile vibration on question taps & timers.</p>
          </div>

          <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10 space-y-1">
            <div className="flex items-center gap-1.5 text-[#c5a059] font-bold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Offline First</span>
            </div>
            <p className="text-white/50 text-[11px]">Full 150Q CBT mock exams work without internet.</p>
          </div>

          <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10 space-y-1">
            <div className="flex items-center gap-1.5 text-indigo-400 font-bold">
              <Cpu className="w-3.5 h-3.5" />
              <span>Play Store Ready</span>
            </div>
            <p className="text-white/50 text-[11px]">Generate signed .aab bundles for Google Play.</p>
          </div>
        </div>

        {/* Steps List */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-white/50">
            {isTamil ? 'செயலி உருவாக்கும் படிகள்' : 'Fast 3-Step Build Workflow'}
          </h3>

          {steps.map((item, idx) => (
            <div key={item.step} className="p-3.5 rounded-xl bg-white/[0.02] border border-white/10 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-xs sm:text-sm text-white">{item.title}</span>
                <button
                  onClick={() => handleCopy(item.cmd, idx)}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] text-xs text-white/80 font-mono transition"
                  title="Copy command"
                >
                  {copiedIndex === idx ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span className="text-emerald-400 font-bold">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>

              <p className="text-xs text-white/60">{item.desc}</p>

              <div className="p-2 rounded-lg bg-black/60 font-mono text-xs text-[#c5a059] flex items-center gap-2 border border-white/5">
                <Terminal className="w-3.5 h-3.5 text-white/40" />
                <span>{item.cmd}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Footer Actions */}
        <div className="pt-2 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-white/50 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Configured package ID: <strong className="text-white font-mono">com.tntetcoach.app</strong></span>
          </div>

          <button
            onClick={() => {
              triggerHaptic.medium();
              onClose();
            }}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#c5a059] hover:bg-[#d8b56f] text-black text-xs sm:text-sm font-bold shadow-lg transition"
          >
            {isTamil ? 'புரிந்தது / முடிந்தது' : 'Got It'}
          </button>
        </div>
      </div>
    </div>
  );
};
