// Service for client-side Google OAuth token management (Calendar & Sheets)
declare const google: any;

const SCOPES = [
  'https://www.googleapis.com/auth/calendar.events',
  'https://www.googleapis.com/auth/spreadsheets'
].join(' ');

let tokenClient: any = null;
let currentAccessToken: string | null = null;
let tokenExpiresAt = 0;

export interface GoogleAuthStatus {
  isConnected: boolean;
  userEmail?: string;
  hasCalendarScope: boolean;
  hasSheetsScope: boolean;
}

const GOOGLE_TOKEN_STORAGE_KEY = 'tntet_google_access_token';
const GOOGLE_USER_EMAIL_KEY = 'tntet_google_user_email';

export const googleAuthService = {
  getStoredToken(): string | null {
    if (currentAccessToken && Date.now() < tokenExpiresAt) {
      return currentAccessToken;
    }
    try {
      const stored = localStorage.getItem(GOOGLE_TOKEN_STORAGE_KEY);
      const expiry = localStorage.getItem(GOOGLE_TOKEN_STORAGE_KEY + '_exp');
      if (stored && expiry && Number(expiry) > Date.now()) {
        currentAccessToken = stored;
        tokenExpiresAt = Number(expiry);
        return stored;
      }
    } catch {
      // ignore
    }
    return null;
  },

  getStoredEmail(): string | null {
    return localStorage.getItem(GOOGLE_USER_EMAIL_KEY);
  },

  isConnected(): boolean {
    return !!this.getStoredToken();
  },

  async requestAccessToken(): Promise<string> {
    const existing = this.getStoredToken();
    if (existing) {
      return existing;
    }

    return new Promise((resolve, reject) => {
      if (typeof google === 'undefined' || !google.accounts || !google.accounts.oauth2) {
        // Retry for GSI script load
        setTimeout(() => {
          if (typeof google === 'undefined' || !google.accounts || !google.accounts.oauth2) {
            reject(new Error('Google Identity Services script not loaded. Please check your internet connection.'));
            return;
          }
          this.initAndPrompt(resolve, reject);
        }, 1000);
        return;
      }

      this.initAndPrompt(resolve, reject);
    });
  },

  initAndPrompt(resolve: (token: string) => void, reject: (err: any) => void) {
    try {
      tokenClient = google.accounts.oauth2.initTokenClient({
        client_id: '561192344595-5t7lggc32l84q92oau567r1sqq89h5o1.apps.googleusercontent.com', // Auto-wired via OAuth setup
        scope: SCOPES,
        callback: (response: any) => {
          if (response.error) {
            console.error('Google OAuth Error:', response);
            reject(new Error(response.error_description || response.error));
            return;
          }
          if (response.access_token) {
            currentAccessToken = response.access_token;
            const expiresInSec = Number(response.expires_in) || 3600;
            tokenExpiresAt = Date.now() + (expiresInSec - 60) * 1000;
            
            localStorage.setItem(GOOGLE_TOKEN_STORAGE_KEY, response.access_token);
            localStorage.setItem(GOOGLE_TOKEN_STORAGE_KEY + '_exp', String(tokenExpiresAt));

            // Fetch basic profile email if possible
            fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
              headers: { Authorization: `Bearer ${response.access_token}` }
            })
            .then(res => res.json())
            .then(info => {
              if (info.email) {
                localStorage.setItem(GOOGLE_USER_EMAIL_KEY, info.email);
              }
            })
            .catch(() => {});

            resolve(response.access_token);
          } else {
            reject(new Error('Failed to obtain Google access token'));
          }
        },
      });

      tokenClient.requestAccessToken({ prompt: 'consent' });
    } catch (e) {
      reject(e);
    }
  },

  disconnect() {
    currentAccessToken = null;
    tokenExpiresAt = 0;
    localStorage.removeItem(GOOGLE_TOKEN_STORAGE_KEY);
    localStorage.removeItem(GOOGLE_TOKEN_STORAGE_KEY + '_exp');
    localStorage.removeItem(GOOGLE_USER_EMAIL_KEY);
  }
};
