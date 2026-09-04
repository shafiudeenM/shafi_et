import { AuthUser, PaperType, ReservationCategory } from '../types';

export interface RegisterPayload {
  name: string;
  email: string;
  password?: string;
  targetPaper: PaperType;
  category: ReservationCategory;
  dailyMinutes: number;
}

export interface LoginPayload {
  email: string;
  password?: string;
  rememberMe?: boolean;
  autoProvision?: boolean;
}

const AUTH_USER_KEY = 'tntet_auth_current_user';
const USERS_REGISTRY_KEY = 'tntet_registered_users_db';

// Seed initial default candidate profiles
const SEED_USERS: AuthUser[] = [
  {
    id: 'user_kavitha_01',
    email: 'kavitha.tntet@gmail.com',
    name: 'Kavitha S.',
    role: 'candidate',
    provider: 'email',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
    createdAt: '2026-01-15T10:00:00Z',
    lastLoginAt: new Date().toISOString(),
    targetPaper: 'PAPER_II_MATH_SCI',
    category: 'BC_MBC_SC_ST',
    dailyMinutes: 45,
    isVerified: true
  },
  {
    id: 'user_anand_02',
    email: 'anand.primary@gmail.com',
    name: 'Anand Kumar',
    role: 'candidate',
    provider: 'google',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250',
    createdAt: '2026-02-01T14:30:00Z',
    lastLoginAt: new Date().toISOString(),
    targetPaper: 'PAPER_I',
    category: 'OC_GENERAL',
    dailyMinutes: 35,
    isVerified: true
  }
];

class AuthService {
  private currentUser: AuthUser | null = null;
  private listeners: ((user: AuthUser | null) => void)[] = [];

  constructor() {
    this.init();
  }

  private init() {
    try {
      // Ensure seed registry exists
      const existing = localStorage.getItem(USERS_REGISTRY_KEY);
      if (!existing) {
        localStorage.setItem(USERS_REGISTRY_KEY, JSON.stringify(SEED_USERS));
      }

      // Check current session
      const savedUserJson = localStorage.getItem(AUTH_USER_KEY);
      if (savedUserJson) {
        this.currentUser = JSON.parse(savedUserJson);
      }
    } catch (e) {
      console.warn('Auth initialization fallback:', e);
      this.currentUser = null;
    }
  }

  public getCurrentUser(): AuthUser | null {
    return this.currentUser;
  }

  public isAuthenticated(): boolean {
    return this.currentUser !== null;
  }

  public subscribe(listener: (user: AuthUser | null) => void): () => void {
    this.listeners.push(listener);
    listener(this.currentUser);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach(l => l(this.currentUser));
  }

  private getRegisteredUsers(): AuthUser[] {
    try {
      const raw = localStorage.getItem(USERS_REGISTRY_KEY);
      return raw ? JSON.parse(raw) : SEED_USERS;
    } catch {
      return SEED_USERS;
    }
  }

  private saveUsersRegistry(users: AuthUser[]) {
    try {
      localStorage.setItem(USERS_REGISTRY_KEY, JSON.stringify(users));
    } catch (e) {
      console.error('Failed to save user registry:', e);
    }
  }

  // 1. Email & Password Sign Up
  public async register(payload: RegisterPayload): Promise<AuthUser> {
    await new Promise(r => setTimeout(r, 450)); // Realistic network latency

    const users = this.getRegisteredUsers();
    const cleanEmail = payload.email.trim().toLowerCase();

    // Check duplicate
    const existing = users.find(u => u.email.toLowerCase() === cleanEmail);
    if (existing) {
      throw new Error('An account with this email already exists. Please sign in.');
    }

    const newUser: AuthUser = {
      id: 'usr_' + Math.random().toString(36).substring(2, 9) + Date.now().toString(36),
      email: cleanEmail,
      name: payload.name.trim(),
      role: 'candidate',
      provider: 'email',
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
      targetPaper: payload.targetPaper,
      category: payload.category,
      dailyMinutes: payload.dailyMinutes || 35,
      isVerified: true
    };

    users.push(newUser);
    this.saveUsersRegistry(users);
    this.setCurrentSession(newUser);
    return newUser;
  }

  // 2. Email & Password Sign In
  public async login(payload: LoginPayload): Promise<AuthUser> {
    await new Promise(r => setTimeout(r, 400));

    const cleanEmail = payload.email.trim().toLowerCase();
    const users = this.getRegisteredUsers();
    let targetUser = users.find(u => u.email.toLowerCase() === cleanEmail);

    if (!targetUser) {
      if (!payload.autoProvision) {
        throw new Error('No account found with this email. Please register first.');
      }
      // Auto-provision candidate account so sign-in is always seamless
      targetUser = {
        id: 'usr_' + Math.random().toString(36).substring(2, 9) + Date.now().toString(36),
        email: cleanEmail,
        name: cleanEmail.split('@')[0],
        role: 'candidate',
        provider: 'email',
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
        targetPaper: 'PAPER_II_MATH_SCI',
        category: 'BC_MBC_SC_ST',
        dailyMinutes: 45,
        isVerified: true
      };
      users.push(targetUser);
      this.saveUsersRegistry(users);
    }

    const updatedUser: AuthUser = {
      ...targetUser,
      lastLoginAt: new Date().toISOString()
    };

    this.setCurrentSession(updatedUser);
    return updatedUser;
  }

  // 3. Google 1-Click OAuth Sign In
  public async signInWithGoogle(customEmail?: string, customName?: string): Promise<AuthUser> {
    await new Promise(r => setTimeout(r, 550));

    const email = (customEmail || 'aspirant.google@gmail.com').toLowerCase();
    const name = customName || 'TN Teacher Aspirant';
    const users = this.getRegisteredUsers();
    let user = users.find(u => u.email.toLowerCase() === email);

    if (!user) {
      user = {
        id: 'usr_g_' + Math.random().toString(36).substring(2, 9),
        email,
        name,
        role: 'candidate',
        provider: 'google',
        avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=250',
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
        targetPaper: 'PAPER_II_MATH_SCI',
        category: 'BC_MBC_SC_ST',
        dailyMinutes: 45,
        isVerified: true
      };
      users.push(user);
      this.saveUsersRegistry(users);
    } else {
      user = {
        ...user,
        provider: 'google',
        lastLoginAt: new Date().toISOString()
      };
    }

    this.setCurrentSession(user);
    return user;
  }

  // 4. Update Profile
  public updateProfile(updates: Partial<AuthUser>) {
    if (!this.currentUser) return;
    const updated: AuthUser = {
      ...this.currentUser,
      ...updates
    };
    this.setCurrentSession(updated);

    // Update in registry
    const users = this.getRegisteredUsers();
    const idx = users.findIndex(u => u.id === updated.id);
    if (idx !== -1) {
      users[idx] = updated;
      this.saveUsersRegistry(users);
    }
  }

  // 5. Sign Out
  public logout() {
    this.currentUser = null;
    try {
      localStorage.removeItem(AUTH_USER_KEY);
    } catch (e) {
      console.warn('Logout removal error:', e);
    }
    this.notify();
  }

  private setCurrentSession(user: AuthUser) {
    this.currentUser = user;
    try {
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
    } catch (e) {
      console.error('Session persist error:', e);
    }
    this.notify();
  }
}

export const authService = new AuthService();
