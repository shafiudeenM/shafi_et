import { describe, it, expect, beforeEach, vi } from 'vitest';

// We test authService logic in isolation since it's a singleton
// Each test uses unique emails to avoid cross-contamination

describe('AuthService', () => {
  const AUTH_USER_KEY = 'tntet_auth_current_user';
  const USERS_REGISTRY_KEY = 'tntet_registered_users_db';

  beforeEach(() => {
    localStorage.clear();
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      const { authService } = await import('../services/authService');
      const result = await authService.register({
        name: 'Test User',
        email: 'register1@test.com',
        targetPaper: 'PAPER_I',
        category: 'OC_GENERAL',
        dailyMinutes: 40,
      });

      expect(result).toBeDefined();
      expect(result.email).toBe('register1@test.com');
      expect(result.name).toBe('Test User');
      expect(result.role).toBe('candidate');
      expect(result.provider).toBe('email');
      expect(result.isVerified).toBe(true);
    });

    it('should prevent duplicate email registration', async () => {
      const { authService } = await import('../services/authService');

      await authService.register({
        name: 'Test User',
        email: 'duplicate@test.com',
        targetPaper: 'PAPER_I',
        category: 'OC_GENERAL',
        dailyMinutes: 40,
      });

      await expect(
        authService.register({
          name: 'Another User',
          email: 'duplicate@test.com',
          targetPaper: 'PAPER_I',
          category: 'OC_GENERAL',
          dailyMinutes: 40,
        })
      ).rejects.toThrow('An account with this email already exists');
    });

    it('should normalize email to lowercase', async () => {
      const { authService } = await import('../services/authService');
      const result = await authService.register({
        name: 'Test User',
        email: 'NORM@test.com',
        targetPaper: 'PAPER_I',
        category: 'OC_GENERAL',
        dailyMinutes: 40,
      });

      expect(result.email).toBe('norm@test.com');
    });
  });

  describe('login', () => {
    it('should login existing user successfully', async () => {
      const { authService } = await import('../services/authService');

      await authService.register({
        name: 'Login User',
        email: 'login@test.com',
        targetPaper: 'PAPER_I',
        category: 'OC_GENERAL',
        dailyMinutes: 40,
      });

      const result = await authService.login({
        email: 'login@test.com',
      });

      expect(result).toBeDefined();
      expect(result.email).toBe('login@test.com');
    });

    it('should throw error for non-existent user (no auto-provisioning)', async () => {
      const { authService } = await import('../services/authService');

      await expect(
        authService.login({
          email: 'nonexistent@test.com',
        })
      ).rejects.toThrow('No account found with this email');
    });

    it('should normalize email before login check', async () => {
      const { authService } = await import('../services/authService');

      await authService.register({
        name: 'Normalize User',
        email: 'normalize@test.com',
        targetPaper: 'PAPER_I',
        category: 'OC_GENERAL',
        dailyMinutes: 40,
      });

      const result = await authService.login({
        email: 'NORMALIZE@TEST.COM',
      });

      expect(result.email).toBe('normalize@test.com');
    });
  });

  describe('session management', () => {
    it('should persist user session in localStorage', async () => {
      const { authService } = await import('../services/authService');

      await authService.register({
        name: 'Session User',
        email: 'session@test.com',
        targetPaper: 'PAPER_I',
        category: 'OC_GENERAL',
        dailyMinutes: 40,
      });

      const stored = localStorage.getItem(AUTH_USER_KEY);
      expect(stored).toBeTruthy();
      expect(JSON.parse(stored!).email).toBe('session@test.com');
    });

    it('should return current user after login', async () => {
      const { authService } = await import('../services/authService');

      await authService.register({
        name: 'Current User',
        email: 'current@test.com',
        targetPaper: 'PAPER_I',
        category: 'OC_GENERAL',
        dailyMinutes: 40,
      });

      const user = authService.getCurrentUser();
      expect(user).toBeDefined();
      expect(user?.email).toBe('current@test.com');
    });

    it('should clear session on logout', async () => {
      const { authService } = await import('../services/authService');

      await authService.register({
        name: 'Logout User',
        email: 'logout@test.com',
        targetPaper: 'PAPER_I',
        category: 'OC_GENERAL',
        dailyMinutes: 40,
      });

      authService.logout();
      expect(authService.getCurrentUser()).toBeNull();
      expect(localStorage.getItem(AUTH_USER_KEY)).toBeNull();
    });
  });

  describe('updateProfile', () => {
    it('should update user profile successfully', async () => {
      const { authService } = await import('../services/authService');

      await authService.register({
        name: 'Update User',
        email: 'update@test.com',
        targetPaper: 'PAPER_I',
        category: 'OC_GENERAL',
        dailyMinutes: 40,
      });

      authService.updateProfile({
        name: 'Updated Name',
        dailyMinutes: 60,
      });

      const user = authService.getCurrentUser();
      expect(user?.name).toBe('Updated Name');
      expect(user?.dailyMinutes).toBe(60);
    });
  });

  describe('subscribe/listeners', () => {
    it('should notify listeners on state changes', async () => {
      const { authService } = await import('../services/authService');
      const listener = vi.fn();
      authService.subscribe(listener);

      await authService.register({
        name: 'Listener User',
        email: 'listener@test.com',
        targetPaper: 'PAPER_I',
        category: 'OC_GENERAL',
        dailyMinutes: 40,
      });

      expect(listener).toHaveBeenCalled();
    });
  });
});
