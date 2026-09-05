import { getSupabase, isSupabaseConfigured } from './supabaseClient';
import { AuthUser, PaperType, ReservationCategory } from '../types';
import { dbSyncService } from './dbSyncService';

/**
 * Supabase Auth integration.
 *
 * When Supabase is configured this service performs real authentication
 * (email/password + Google OAuth), sets the Supabase auth UUID on
 * dbSyncService via setUserId(), and hydrates cloud data on sign-in.
 *
 * When Supabase is NOT configured, methods resolve to null so the app can
 * fall back to the mock authService.
 */

export interface SupabaseSignUpPayload {
  name: string;
  email: string;
  password: string;
  targetPaper: PaperType;
  category: ReservationCategory;
  dailyMinutes: number;
}

export interface SupabaseAuthResult {
  ok: boolean;
  error?: string | null;
  user: AuthUser | null;
  requiresEmailConfirmation?: boolean;
  /** True when the browser is being redirected to the OAuth provider. */
  redirecting?: boolean;
  /** True when the OAuth provider is disabled/unavailable in Supabase config. */
  providerUnavailable?: boolean;
}

const toAuthUser = (email: string, name: string, provider: 'email' | 'google', targetPaper: PaperType, category: ReservationCategory, dailyMinutes: number, idSuffix?: string): AuthUser => {
  return {
    id: idSuffix || `${provider}_${Date.now().toString(36)}`,
    email,
    name,
    role: 'candidate',
    provider,
    createdAt: new Date().toISOString(),
    lastLoginAt: new Date().toISOString(),
    targetPaper,
    category,
    dailyMinutes: dailyMinutes || 40,
    isVerified: true,
  };
};

/** Reads persisted user_metadata preferences, falling back to safe defaults. */
const getProfilePrefs = (meta: Record<string, unknown> | undefined) => {
  const category = (meta?.category as ReservationCategory) || (meta?.reservation_category as ReservationCategory) || 'BC_MBC_SC_ST';
  const rawMinutes = Number(meta?.daily_minutes ?? meta?.dailyMinutes ?? NaN);
  const dailyMinutes = Number.isFinite(rawMinutes) && rawMinutes > 0 ? Math.round(rawMinutes) : 40;
  return { category, dailyMinutes };
};

class SupabaseAuthService {
  /** True when Supabase is configured and usable. */
  public isAvailable(): boolean {
    return isSupabaseConfigured();
  }

  /**
   * Registers a new user with email + password via Supabase Auth and
   * creates a matching row in user_profiles.
   */
  public async signUp(payload: SupabaseSignUpPayload): Promise<SupabaseAuthResult> {
    const supabase = getSupabase();
    if (!supabase) {
      return { ok: false, error: 'Supabase is not configured. Using offline mode.', user: null };
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email: payload.email.trim().toLowerCase(),
        password: payload.password,
        options: {
          data: {
            name: payload.name.trim(),
            target_paper: payload.targetPaper,
            category: payload.category,
            daily_minutes: payload.dailyMinutes,
          },
        },
      });

      if (error) {
        return { ok: false, error: error.message, user: null };
      }

      const authUser = data.user;
      const supabaseId = authUser?.id || null;
      const requiresConfirmation = Boolean(authUser && !data.session);

      // Only wire up sync once a confirmed session exists. An unconfirmed
      // account has no session, so RLS-protected writes would fail silently.
      if (data.session?.user?.id) {
        dbSyncService.setUserId(data.session.user.id);
      }

      const user = toAuthUser(
        payload.email.trim().toLowerCase(),
        payload.name.trim(),
        'email',
        payload.targetPaper,
        payload.category,
        payload.dailyMinutes,
        supabaseId || `email_${Date.now().toString(36)}`,
      );

      // Create the user_profiles row (RLS insert allowed via auth.uid() on
      // confirmed sessions only; without a session this may be skipped).
      if (supabaseId && data.session) {
        await dbSyncService.syncUserProfile({
          name: payload.name.trim(),
          email: payload.email.trim().toLowerCase(),
          selectedPaper: payload.targetPaper,
          languageMode: 'bilingual',
          persona: 'first_time',
          category: payload.category,
          dailyStudyMinutes: payload.dailyMinutes,
          hasCompletedDiagnostic: false,
          joinedDate: new Date().toISOString(),
          streakDays: 0,
          targetExamDate: undefined,
          theme: 'dark',
        });
      }

      return {
        ok: true,
        error: null,
        user,
        requiresEmailConfirmation: requiresConfirmation,
      };
    } catch (err: any) {
      return { ok: false, error: err.message || 'Sign-up failed', user: null };
    }
  }

  /**
   * Signs in with email + password via Supabase Auth.
   */
  public async signIn(email: string, password: string): Promise<SupabaseAuthResult> {
    const supabase = getSupabase();
    if (!supabase) {
      return { ok: false, error: 'Supabase is not configured. Using offline mode.', user: null };
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      if (error) {
        return { ok: false, error: error.message, user: null };
      }

      const supabaseUser = data.user;
      const supabaseId = supabaseUser?.id || null;
      dbSyncService.setUserId(supabaseId);

      // Pull metadata + profile for display.
      const meta = supabaseUser?.user_metadata || {};
      const name = (meta.name as string) || email.trim().split('@')[0];
      const { category, dailyMinutes } = getProfilePrefs(meta);

      const user = toAuthUser(
        supabaseUser?.email || email.trim().toLowerCase(),
        name,
        'email',
        (meta.target_paper as PaperType) || 'PAPER_II_MATH_SCI',
        category,
        dailyMinutes,
        supabaseId || `email_${Date.now().toString(36)}`,
      );

      // NOTE: cloud hydration is handled centrally by the caller (App.tsx
      // handleAuthSuccess) to avoid concurrent/raced pulls.

      return { ok: true, error: null, user };
    } catch (err: any) {
      return { ok: false, error: err.message || 'Sign-in failed', user: null };
    }
  }

  /**
   * Initiates Google OAuth flow via Supabase redirect.
   *
   * Returns `{ ok: true, redirecting: true }` once the browser starts the
   * redirect (the caller should not attempt any further login). Returns
   * `{ ok: false, providerUnavailable: true }` when the Google provider is
   * disabled in the Supabase project, so the caller can fall back gracefully.
   */
  public async signInWithGoogle(): Promise<SupabaseAuthResult> {
    const supabase = getSupabase();
    if (!supabase) {
      return { ok: false, error: 'Supabase is not configured.', user: null, providerUnavailable: true };
    }

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin + window.location.pathname,
        },
      });

      if (error) {
        const msg = error.message || '';
        const providerUnavailable = /provider.*(not\s*enabled|is\s*not|disabled|missing|unsupported)/i.test(msg) || /google.*(enabled|configured)/i.test(msg);
        return { ok: false, error: msg, user: null, providerUnavailable };
      }

      // OAuth redirects the browser. Report success + redirecting so callers
      // don't try to log the user in locally.
      return { ok: true, error: null, user: null, redirecting: true };
    } catch (err: any) {
      return { ok: false, error: err.message || 'Google sign-in failed', user: null };
    }
  }

  /**
   * Reads the current Supabase session (useful on app load / after OAuth
   * redirect) and wires up dbSyncService.
   */
  public async getSessionUser(): Promise<AuthUser | null> {
    const supabase = getSupabase();
    if (!supabase) return null;

    try {
      const { data, error } = await supabase.auth.getSession();
      if (error || !data.session) return null;

      const su = data.session.user;
      dbSyncService.setUserId(su?.id || null);

      const meta = su?.user_metadata || {};
      const name = (meta.name as string) || (su?.email || '').split('@')[0];
      const { category, dailyMinutes } = getProfilePrefs(meta);

      return toAuthUser(
        su?.email || '',
        name,
        (su?.app_metadata?.provider as 'google' | 'email') || 'email',
        (meta.target_paper as PaperType) || 'PAPER_II_MATH_SCI',
        category,
        dailyMinutes,
        su?.id || `session_${Date.now().toString(36)}`,
      );
    } catch (err) {
      console.warn('Supabase getSessionUser exception:', err);
      return null;
    }
  }

  /**
   * Subscribes to Supabase auth state changes. When a session appears or
   * disappears, updates dbSyncService userId and (on sign-in) hydrates data.
   * Returns an unsubscribe function.
   */
  public onAuthStateChange(
    callback: (user: AuthUser | null) => void,
  ): () => void {
    const supabase = getSupabase();
    if (!supabase) {
      return () => {};
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const su = session?.user || null;
      dbSyncService.setUserId(su?.id || null);

      if (su) {
        const meta = su.user_metadata || {};
        const name = (meta.name as string) || (su.email || '').split('@')[0];
        const { category, dailyMinutes } = getProfilePrefs(meta);
        const user = toAuthUser(
          su.email || '',
          name,
          (su.app_metadata?.provider as 'google' | 'email') || 'email',
          (meta.target_paper as PaperType) || 'PAPER_II_MATH_SCI',
          category,
          dailyMinutes,
          su.id,
        );
        callback(user);
        // NOTE: cloud hydration is handled centrally by App.tsx to avoid
        // concurrent/raced pulls against the same cloud tables.
      } else {
        callback(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }

  /**
   * Signs out of Supabase and clears dbSyncService user id.
   */
  public async signOut(): Promise<void> {
    const supabase = getSupabase();
    dbSyncService.setUserId(null);
    if (!supabase) return;
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.warn('Supabase signOut exception:', err);
    }
  }

  /**
   * Sends a password reset email via Supabase.
   */
  public async resetPassword(email: string): Promise<{ ok: boolean; error?: string }> {
    const supabase = getSupabase();
    if (!supabase) return { ok: false, error: 'Supabase is not configured.' };
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
        redirectTo: window.location.origin,
      });
      if (error) return { ok: false, error: error.message };
      return { ok: true };
    } catch (err: any) {
      return { ok: false, error: err.message || 'Reset failed' };
    }
  }
}

export const supabaseAuthService = new SupabaseAuthService();
