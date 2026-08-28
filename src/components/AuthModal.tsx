import React, { useState } from 'react';
import { 
  PaperType, 
  ReservationCategory, 
  LanguageMode, 
  ThemeMode,
  AuthUser 
} from '../types';
import { authService } from '../services/authService';
import { supabaseAuthService } from '../services/supabaseAuthService';
import { 
  GraduationCap, 
  X, 
  Mail, 
  Lock, 
  User, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  Sparkles, 
  BookOpen, 
  ShieldCheck, 
  Zap,
  Target
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'signin' | 'signup';
  languageMode?: LanguageMode;
  theme?: ThemeMode;
  onAuthSuccess: (user: AuthUser) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'signup',
  languageMode = 'bilingual',
  theme = 'dark',
  onAuthSuccess,
}) => {
  const isTamil = languageMode === 'tamil';

  const [mode, setMode] = useState<'signin' | 'signup' | 'forgot'>(initialMode);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [targetPaper, setTargetPaper] = useState<PaperType>('PAPER_II_MATH_SCI');
  const [category, setCategory] = useState<ReservationCategory>('BC_MBC_SC_ST');
  const [dailyMinutes, setDailyMinutes] = useState<number>(45);

  if (!isOpen) return null;

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setErrorMsg(isTamil ? 'மின்னஞ்சல் முகவரியை உள்ளிடவும்' : 'Please enter your email address');
      return;
    }
    setErrorMsg(null);
    setLoading(true);
    try {
      // Prefer real Supabase Auth, fall back to mock authService.
      let user: AuthUser;
      if (supabaseAuthService.isAvailable()) {
        const result = await supabaseAuthService.signIn(email, password);
        if (result.ok && result.user) {
          user = result.user;
        } else {
          setErrorMsg(result.error || 'Login failed. Please check credentials.');
          return;
        }
      } else {
        user = await authService.login({ email, password });
      }
      onAuthSuccess(user);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg(isTamil ? 'உங்கள் பெயரை உள்ளிடவும்' : 'Please enter your full name');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setErrorMsg(isTamil ? 'சரியான மின்னஞ்சலை உள்ளிடவும்' : 'Please enter a valid email address');
      return;
    }
    setErrorMsg(null);
    setLoading(true);
    try {
      // Prefer real Supabase Auth, fall back to mock authService.
      let user: AuthUser;
      if (supabaseAuthService.isAvailable()) {
        const result = await supabaseAuthService.signUp({
          name,
          email,
          password,
          targetPaper,
          category,
          dailyMinutes,
        });
        if (result.ok && result.user) {
          user = result.user;
          if (result.requiresEmailConfirmation) {
            setSuccessMsg(
              isTamil
                ? 'கணக்கு உருவாக்கப்பட்டது! உங்கள் மின்னஞ்சலை உறுதிப்படுத்தவும்.'
                : 'Account created! Please confirm your email to continue.'
            );
            setTimeout(() => {
              setSuccessMsg(null);
              setMode('signin');
            }, 2500);
            return;
          }
        } else {
          setErrorMsg(result.error || 'Registration failed. Please try again.');
          return;
        }
      } else {
        user = await authService.register({
          name,
          email,
          password,
          targetPaper,
          category,
          dailyMinutes
        });
      }
      onAuthSuccess(user);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      // Prefer real Supabase Google OAuth (redirect flow), fall back to mock.
      let user: AuthUser | null = null;
      if (supabaseAuthService.isAvailable()) {
        const result = await supabaseAuthService.signInWithGoogle();
        // The OAuth flow redirects the browser; only proceed if it resolved
        // synchronously with a user (e.g. used in a non-redirect context).
        if (result.ok && result.user) {
          user = result.user;
        } else if (result.error) {
          setErrorMsg(result.error);
          return;
        }
        if (!user) {
          // Browser will redirect for Google OAuth; don't close modal.
          return;
        }
      } else {
        user = await authService.signInWithGoogle();
      }
      if (user) {
        onAuthSuccess(user);
        onClose();
      }
    } catch (err: any) {
      setErrorMsg('Google Sign-In authentication error. Please try again or use email.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setErrorMsg(isTamil ? 'மின்னஞ்சலை உள்ளிடவும்' : 'Enter your registered email');
      return;
    }
    setErrorMsg(null);
    if (supabaseAuthService.isAvailable()) {
      supabaseAuthService.resetPassword(email).then((res) => {
        if (res.ok) {
          setSuccessMsg(isTamil ? 'கடவுச்சொல் மீட்டெடுப்பு இணைப்பு அனுப்பப்பட்டது!' : 'Password reset link sent to your email!');
          setTimeout(() => {
            setMode('signin');
            setSuccessMsg(null);
          }, 2000);
        } else {
          setErrorMsg(res.error || 'Password reset failed. Please try again.');
        }
      });
    } else {
      setSuccessMsg(isTamil ? 'கடவுச்சொல் மீட்டெடுப்பு இணைப்பு அனுப்பப்பட்டது!' : 'Password reset link sent to your email!');
      setTimeout(() => {
        setMode('signin');
        setSuccessMsg(null);
      }, 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div 
        className="relative w-full max-w-xl rounded-2xl bg-[#121212] border border-[#262626] shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        id="auth-modal-container"
      >
        {/* Header Ribbon */}
        <div className="px-6 pt-5 pb-4 border-b border-[#262626] flex items-center justify-between bg-gradient-to-r from-[#181818] to-[#121212]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#c5a059] to-[#8d6f30] flex items-center justify-center text-[#0a0a0a] shadow-lg shadow-[#c5a059]/15">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-white font-bold text-base tracking-wide">
                  TNTET 2026 Candidate Portal
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#c5a059]/15 text-[#c5a059] border border-[#c5a059]/30 uppercase">
                  TRB Verified
                </span>
              </div>
              <p className="text-xs text-white/50">
                {isTamil ? 'தமிழ்நாடு ஆசிரியர் தகுதித் தேர்வு ஆசிரியர் கணக்கு' : 'Personalized Preparation & SCERT Diagnostic Engine'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector (Sign In vs Create Account) */}
        {mode !== 'forgot' && (
          <div className="grid grid-cols-2 p-1.5 bg-[#0a0a0a] border-b border-[#262626]">
            <button
              onClick={() => { setMode('signup'); setErrorMsg(null); }}
              className={`py-2.5 rounded-lg text-xs font-semibold transition flex items-center justify-center gap-1.5 ${
                mode === 'signup' 
                  ? 'bg-[#262626] text-white shadow-sm border border-white/10' 
                  : 'text-white/50 hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-[#c5a059]" />
              {isTamil ? 'புதிய ஆசிரியர் பதிவு (Sign Up)' : 'Create Candidate Account'}
            </button>
            <button
              onClick={() => { setMode('signin'); setErrorMsg(null); }}
              className={`py-2.5 rounded-lg text-xs font-semibold transition flex items-center justify-center gap-1.5 ${
                mode === 'signin' 
                  ? 'bg-[#262626] text-white shadow-sm border border-white/10' 
                  : 'text-white/50 hover:text-white'
              }`}
            >
              <User className="w-3.5 h-3.5 text-[#c5a059]" />
              {isTamil ? 'உள்நுழைக (Sign In)' : 'Sign In'}
            </button>
          </div>
        )}

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-4">
          {/* Error / Success Alerts */}
          {errorMsg && (
            <div className="p-3 rounded-lg bg-red-950/40 border border-red-800/60 text-red-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{errorMsg}</span>
            </div>
          )}
          {successMsg && (
            <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-800/60 text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* 1. Quick One-Click Google OAuth */}
          <div>
            <button
              type="button"
              id="btn-google-auth"
              onClick={handleGoogleAuth}
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-zinc-100 text-zinc-900 font-semibold text-xs flex items-center justify-center gap-2 shadow-sm transition disabled:opacity-50"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
              <span>{isTamil ? 'Google கணக்கு மூலம் தொடர்க' : 'Continue with Google Account'}</span>
            </button>
          </div>

          <div className="relative flex items-center justify-center my-2">
            <div className="border-t border-[#262626] w-full"></div>
            <span className="bg-[#121212] px-3 text-[11px] text-white/40 uppercase tracking-wider">
              {isTamil ? 'அல்லது மின்னஞ்சல் மூலம்' : 'or with registered email'}
            </span>
          </div>

          {/* 2. Mode Forms */}
          {mode === 'signup' && (
            <form onSubmit={handleSignUp} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-white/80 mb-1">
                  {isTamil ? 'முழுப் பெயர் (Candidate Name)' : 'Full Name'}
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-white/40 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Kavitha Sundaram"
                    className="w-full bg-[#181818] border border-[#2c2c2c] focus:border-[#c5a059] rounded-xl pl-9 pr-3.5 py-2 text-xs text-white placeholder-white/30 outline-none transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/80 mb-1">
                  {isTamil ? 'மின்னஞ்சல் முகவரி (Email Address)' : 'Email Address'}
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-white/40 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="candidate@tntet2026.com"
                    className="w-full bg-[#181818] border border-[#2c2c2c] focus:border-[#c5a059] rounded-xl pl-9 pr-3.5 py-2 text-xs text-white placeholder-white/30 outline-none transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/80 mb-1">
                  {isTamil ? 'கடவுச்சொல் (Password)' : 'Password'}
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-white/40 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-[#181818] border border-[#2c2c2c] focus:border-[#c5a059] rounded-xl pl-9 pr-3.5 py-2 text-xs text-white placeholder-white/30 outline-none transition"
                  />
                </div>
              </div>

              {/* Target Paper Selection */}
              <div className="pt-1">
                <label className="block text-xs font-semibold text-white/80 mb-1.5 flex items-center justify-between">
                  <span>{isTamil ? 'தேர்வு தாள் தேர்வு (Target Exam Paper)' : 'Target Exam Paper'}</span>
                  <span className="text-[10px] text-[#c5a059]">150 Marks Total</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setTargetPaper('PAPER_I')}
                    className={`p-2 rounded-xl text-left border transition text-xs ${
                      targetPaper === 'PAPER_I'
                        ? 'bg-[#c5a059]/15 border-[#c5a059] text-white'
                        : 'bg-[#181818] border-[#2c2c2c] text-white/70 hover:border-white/20'
                    }`}
                  >
                    <div className="font-bold">Paper I</div>
                    <div className="text-[10px] text-white/50">Primary (1–5)</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setTargetPaper('PAPER_II_MATH_SCI')}
                    className={`p-2 rounded-xl text-left border transition text-xs ${
                      targetPaper === 'PAPER_II_MATH_SCI'
                        ? 'bg-[#c5a059]/15 border-[#c5a059] text-white'
                        : 'bg-[#181818] border-[#2c2c2c] text-white/70 hover:border-white/20'
                    }`}
                  >
                    <div className="font-bold">Paper II (M&S)</div>
                    <div className="text-[10px] text-white/50">Maths & Science</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setTargetPaper('PAPER_II_SOC_SCI')}
                    className={`p-2 rounded-xl text-left border transition text-xs ${
                      targetPaper === 'PAPER_II_SOC_SCI'
                        ? 'bg-[#c5a059]/15 border-[#c5a059] text-white'
                        : 'bg-[#181818] border-[#2c2c2c] text-white/70 hover:border-white/20'
                    }`}
                  >
                    <div className="font-bold">Paper II (Soc)</div>
                    <div className="text-[10px] text-white/50">Social Science</div>
                  </button>
                </div>
              </div>

              {/* Daily Study Commitment */}
              <div>
                <label className="block text-xs font-semibold text-white/80 mb-1.5 flex items-center justify-between">
                  <span>{isTamil ? 'தினசரி படிக்கும் நேரம்' : 'Daily Study Commitment'}</span>
                  <span className="text-xs text-[#c5a059] font-bold">{dailyMinutes} Mins / Day</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[35, 45, 60].map((mins) => (
                    <button
                      key={mins}
                      type="button"
                      onClick={() => setDailyMinutes(mins)}
                      className={`py-1.5 rounded-lg text-xs font-medium border transition ${
                        dailyMinutes === mins
                          ? 'bg-[#c5a059] text-black border-[#c5a059] font-bold'
                          : 'bg-[#181818] text-white/70 border-[#2c2c2c]'
                      }`}
                    >
                      {mins} mins
                    </button>
                  ))}
                </div>
              </div>

              {/* Optional Reservation Category Notice */}
              <div className="p-2.5 rounded-lg bg-white/[0.03] border border-white/10 flex items-start gap-2 text-[11px] text-white/60">
                <span className="text-[#c5a059] font-bold">ℹ</span>
                <span>
                  {isTamil 
                    ? 'குறிப்பு: இடஒதுக்கீட்டுப் பிரிவு மற்றும் தகுதி மதிப்பெண் இலக்கு (82 vs 90) சுயவிவரப் பகுதியில் (Candidate Profile) விருப்பத்தேர்வாக அமைக்கலாம்.' 
                    : 'Note: Reservation Category & Qualifying Marks target (82 vs 90) is optional and can be calibrated anytime in your Candidate Profile.'}
                </span>
              </div>

              <button
                type="submit"
                id="btn-signup-submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-[#c5a059] to-[#8d6f30] hover:from-[#d6b066] hover:to-[#9e7d37] text-[#0a0a0a] font-bold text-xs shadow-lg shadow-[#c5a059]/15 flex items-center justify-center gap-2 transition disabled:opacity-50 mt-4"
              >
                <span>{loading ? 'Creating Candidate Profile...' : isTamil ? 'பயிற்சியைத் தொடங்குக (Create Profile & Enter)' : 'Create Profile & Enter Platform'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {mode === 'signin' && (
            <form onSubmit={handleSignIn} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-white/80 mb-1">
                  {isTamil ? 'மின்னஞ்சல் முகவரி (Email Address)' : 'Registered Email Address'}
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-white/40 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="candidate@tntet2026.com"
                    className="w-full bg-[#181818] border border-[#2c2c2c] focus:border-[#c5a059] rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-white placeholder-white/30 outline-none transition"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-white/80">
                    {isTamil ? 'கடவுச்சொல் (Password)' : 'Password'}
                  </label>
                  <button
                    type="button"
                    onClick={() => setMode('forgot')}
                    className="text-[11px] text-[#c5a059] hover:underline"
                  >
                    {isTamil ? 'கடவுச்சொல் மறந்துவிட்டதா?' : 'Forgot password?'}
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-white/40 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-[#181818] border border-[#2c2c2c] focus:border-[#c5a059] rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-white placeholder-white/30 outline-none transition"
                  />
                </div>
              </div>

              <button
                type="submit"
                id="btn-signin-submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-[#c5a059] to-[#8d6f30] hover:from-[#d6b066] hover:to-[#9e7d37] text-[#0a0a0a] font-bold text-xs shadow-lg shadow-[#c5a059]/15 flex items-center justify-center gap-2 transition disabled:opacity-50 mt-2"
              >
                <span>{loading ? 'Authenticating...' : isTamil ? 'உள்நுழைக (Sign In & Continue)' : 'Sign In & Access Dashboard'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {mode === 'forgot' && (
            <form onSubmit={handleForgotPassword} className="space-y-3.5">
              <p className="text-xs text-white/70">
                {isTamil
                  ? 'உங்கள் பதிவுசெய்த மின்னஞ்சலை உள்ளிடவும். கடவுச்சொல் மீட்டமைக்கும் வழிமுறை அனுப்பப்படும்.'
                  : 'Enter your registered email address to receive password reset instructions.'}
              </p>
              <div>
                <label className="block text-xs font-semibold text-white/80 mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-white/40 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="candidate@tntet2026.com"
                    className="w-full bg-[#181818] border border-[#2c2c2c] focus:border-[#c5a059] rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-white placeholder-white/30 outline-none transition"
                  />
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setMode('signin')}
                  className="w-1/3 py-2.5 rounded-xl bg-[#222222] hover:bg-[#2a2a2a] text-white/80 font-semibold text-xs transition"
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="w-2/3 py-2.5 rounded-xl bg-[#c5a059] text-black font-bold text-xs transition"
                >
                  Send Reset Link
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Footer Guarantee */}
        <div className="px-6 py-3 bg-[#0d0d0d] border-t border-[#262626] flex items-center justify-between text-[11px] text-white/40">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            100% Free Tier • SCERT Samacheer Syllabus
          </span>
          <span>TRB TNTET 2026 Cycle</span>
        </div>
      </div>
    </div>
  );
};
