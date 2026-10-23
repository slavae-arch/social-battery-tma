// Telegram WebApp Service with Fallback for Browser Development

interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
}

class TelegramService {
  private tg: any;

  constructor() {
    this.tg = typeof window !== 'undefined' ? (window as any).Telegram?.WebApp : null;
  }

  public isAvailable(): boolean {
    return Boolean(this.tg && this.tg.initDataUnsafe && Object.keys(this.tg.initDataUnsafe).length > 0);
  }

  public init() {
    if (this.tg) {
      try {
        this.tg.ready();
        this.tg.expand();
        // Set header color to match dark background
        if (this.tg.setHeaderColor) {
          this.tg.setHeaderColor('#020617');
        }
        if (this.tg.setBackgroundColor) {
          this.tg.setBackgroundColor('#020617');
        }
      } catch (err) {
        console.warn('Telegram WebApp init warning:', err);
      }
    }
  }

  public getUser(): TelegramUser {
    if (this.isAvailable() && this.tg?.initDataUnsafe?.user) {
      return this.tg.initDataUnsafe.user;
    }
    // Default Dev Mock User
    return {
      id: 7770001,
      first_name: 'Алексей',
      last_name: 'Смирнов',
      username: 'alex_energy',
      photo_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    };
  }

  public getInitData(): string {
    return this.tg?.initData || 'mock_dev_init_data';
  }

  public hapticImpact(style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft' = 'medium') {
    if (this.tg?.HapticFeedback) {
      try {
        this.tg.HapticFeedback.impactOccurred(style);
        return;
      } catch {
        // Fallback
      }
    }
    // Web Audio fallback for browser development feedback
    this.playAudioTick();
  }

  public hapticNotification(type: 'error' | 'success' | 'warning' = 'success') {
    if (this.tg?.HapticFeedback) {
      try {
        this.tg.HapticFeedback.notificationOccurred(type);
        return;
      } catch {
        // Fallback
      }
    }
    this.playAudioTick(type === 'success' ? 880 : 330);
  }

  public hapticSelection() {
    if (this.tg?.HapticFeedback) {
      try {
        this.tg.HapticFeedback.selectionChanged();
        return;
      } catch {
        // Fallback
      }
    }
  }

  private playAudioTick(freq = 440) {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.02, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.05);
    } catch {
      // Audio might be blocked before user interaction
    }
  }

  public openTelegramChat(username?: string, userId?: number) {
    if (username) {
      const url = `https://t.me/${username.replace('@', '')}`;
      if (this.tg?.openTelegramLink) {
        this.tg.openTelegramLink(url);
      } else {
        window.open(url, '_blank');
      }
    } else if (userId) {
      const url = `tg://user?id=${userId}`;
      if (this.tg?.openTelegramLink) {
        this.tg.openTelegramLink(url);
      } else {
        window.open(url, '_blank');
      }
    }
  }

  public shareToStory(mediaUrl: string, caption?: string) {
    if (this.tg?.shareToStory) {
      try {
        this.tg.shareToStory(mediaUrl, {
          text: caption || 'Мой уровень социальной батарейки 🔋',
          widget_link: {
            url: `https://t.me/my_social_battery_bot?start=ref_${this.getUser().id}`,
            name: 'Проверить заряд'
          }
        });
        return true;
      } catch (err) {
        console.warn('shareToStory failed:', err);
      }
    }
    return false;
  }

  public addToHomeScreen() {
    if (this.tg?.addToHomeScreen) {
      try {
        this.tg.addToHomeScreen();
        return true;
      } catch (err) {
        console.warn('addToHomeScreen failed:', err);
      }
    }
    return false;
  }
}

export const telegram = new TelegramService();
