import { Capacitor } from '@capacitor/core';
import { StatusBar, Style } from '@capacitor/status-bar';
import { SplashScreen } from '@capacitor/splash-screen';
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';
import { App as CapacitorApp } from '@capacitor/app';

export const isNativePlatform = (): boolean => {
  return Capacitor.isNativePlatform();
};

export const getPlatform = (): 'android' | 'ios' | 'web' => {
  return Capacitor.getPlatform() as 'android' | 'ios' | 'web';
};

export const initNativeMobileApp = async (options?: {
  isDarkMode?: boolean;
  onHardwareBack?: () => void;
}) => {
  if (!isNativePlatform()) {
    return;
  }

  try {
    // 1. Hide Splash Screen after launch
    await SplashScreen.hide();
  } catch (e) {
    console.warn('Native SplashScreen hide error:', e);
  }

  try {
    // 2. Configure Native Status Bar
    if (Capacitor.isPluginAvailable('StatusBar')) {
      const isDark = options?.isDarkMode !== false;
      await StatusBar.setStyle({
        style: isDark ? Style.Dark : Style.Light,
      });
      if (getPlatform() === 'android') {
        await StatusBar.setBackgroundColor({
          color: isDark ? '#0a0a0a' : '#f8fafc',
        });
      }
    }
  } catch (e) {
    console.warn('Native StatusBar config error:', e);
  }

  try {
    // 3. Android Back Button listener
    if (getPlatform() === 'android' && Capacitor.isPluginAvailable('App')) {
      CapacitorApp.addListener('backButton', ({ canGoBack }) => {
        if (options?.onHardwareBack) {
          options.onHardwareBack();
        } else if (canGoBack) {
          window.history.back();
        }
      });
    }
  } catch (e) {
    console.warn('Native backButton listener error:', e);
  }
};

// Haptic feedback triggers for mobile devices
export const triggerHaptic = {
  light: async () => {
    try {
      if (Capacitor.isPluginAvailable('Haptics')) {
        await Haptics.impact({ style: ImpactStyle.Light });
      } else if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate(10);
      }
    } catch {}
  },
  medium: async () => {
    try {
      if (Capacitor.isPluginAvailable('Haptics')) {
        await Haptics.impact({ style: ImpactStyle.Medium });
      } else if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate(25);
      }
    } catch {}
  },
  heavy: async () => {
    try {
      if (Capacitor.isPluginAvailable('Haptics')) {
        await Haptics.impact({ style: ImpactStyle.Heavy });
      } else if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate(50);
      }
    } catch {}
  },
  success: async () => {
    try {
      if (Capacitor.isPluginAvailable('Haptics')) {
        await Haptics.notification({ type: NotificationType.Success });
      } else if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate([20, 50, 20]);
      }
    } catch {}
  },
  warning: async () => {
    try {
      if (Capacitor.isPluginAvailable('Haptics')) {
        await Haptics.notification({ type: NotificationType.Warning });
      } else if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate([30, 80, 30]);
      }
    } catch {}
  },
  error: async () => {
    try {
      if (Capacitor.isPluginAvailable('Haptics')) {
        await Haptics.notification({ type: NotificationType.Error });
      } else if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate([60, 40, 60]);
      }
    } catch {}
  }
};
