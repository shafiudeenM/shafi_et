// PWA Registration and Offline Synchronization Manager for TNTET Coach

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

class PWAService {
  private deferredPrompt: BeforeInstallPromptEvent | null = null;
  private isOnlineStatus: boolean = typeof navigator !== 'undefined' ? navigator.onLine : true;
  private isInstalledStatus: boolean = false;
  private listeners: (() => void)[] = [];

  constructor() {
    if (typeof window !== 'undefined') {
      this.init();
    }
  }

  private init() {
    // Check if app is running in standalone mode (already installed)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || 
      (window.navigator as any).standalone || 
      document.referrer.includes('android-app://');
    this.isInstalledStatus = isStandalone;

    // Listen to network status changes
    window.addEventListener('online', () => {
      this.isOnlineStatus = true;
      this.notify();
      console.log('[PWA] Connection restored: Online synchronization active.');
    });

    window.addEventListener('offline', () => {
      this.isOnlineStatus = false;
      this.notify();
      console.log('[PWA] Connection lost: Operating in Offline-First mode with LocalStorage persistence.');
    });

    // Capture install prompt event
    window.addEventListener('beforeinstallprompt', (e: Event) => {
      e.preventDefault();
      this.deferredPrompt = e as BeforeInstallPromptEvent;
      this.notify();
      console.log('[PWA] Application installation prompt captured and ready.');
    });

    // App installed event
    window.addEventListener('appinstalled', () => {
      this.isInstalledStatus = true;
      this.deferredPrompt = null;
      this.notify();
      console.log('[PWA] Application successfully installed.');
    });

    // Register Service Worker
    this.registerServiceWorker();
  }

  public registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/sw.js')
          .then((registration) => {
            console.log('[PWA] ServiceWorker successfully registered with scope:', registration.scope);
            
            // Check for updates
            registration.onupdatefound = () => {
              const installingWorker = registration.installing;
              if (installingWorker) {
                installingWorker.onstatechange = () => {
                  if (installingWorker.state === 'installed') {
                    if (navigator.serviceWorker.controller) {
                      console.log('[PWA] New version of TNTET Coach available.');
                    } else {
                      console.log('[PWA] Content is cached for offline use.');
                    }
                  }
                };
              }
            };
          })
          .catch((error) => {
            console.warn('[PWA] ServiceWorker registration notice:', error);
          });
      });
    }
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach((l) => l());
  }

  public isOnline(): boolean {
    return this.isOnlineStatus;
  }

  public canInstall(): boolean {
    return this.deferredPrompt !== null && !this.isInstalledStatus;
  }

  public isInstalled(): boolean {
    return this.isInstalledStatus;
  }

  public async promptInstall(): Promise<boolean> {
    if (!this.deferredPrompt) {
      return false;
    }
    try {
      await this.deferredPrompt.prompt();
      const choice = await this.deferredPrompt.userChoice;
      this.deferredPrompt = null;
      this.notify();
      return choice.outcome === 'accepted';
    } catch (err) {
      console.error('[PWA] Install prompt error:', err);
      return false;
    }
  }
}

export const pwaService = new PWAService();
