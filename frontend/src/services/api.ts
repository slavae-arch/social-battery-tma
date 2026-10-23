import { UserProfile, Friend, MoodTag, PrivacyOption } from '../types';
import { telegram } from './telegram';

const API_BASE = '/api';

class ApiService {
  private getHeaders(): HeadersInit {
    const initData = telegram.getInitData();
    return {
      'Content-Type': 'application/json',
      'X-Telegram-Init-Data': initData,
    };
  }

  public async getMyStatus(): Promise<UserProfile | null> {
    try {
      const res = await fetch(`${API_BASE}/battery/me`, {
        headers: this.getHeaders(),
      });
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn('Failed to load my status:', err);
      return null;
    }
  }

  public async updateBattery(
    level: number,
    moodTag: MoodTag,
    privacy: PrivacyOption = 'all',
    duration: string = '4h'
  ): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE}/battery`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          battery_level: level,
          mood_tag: moodTag,
          privacy,
          duration,
        }),
      });
      return res.ok;
    } catch (err) {
      console.warn('Failed to update battery:', err);
      return false;
    }
  }

  public async getFriends(): Promise<Friend[]> {
    try {
      const res = await fetch(`${API_BASE}/friends`, {
        headers: this.getHeaders(),
      });
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn('Failed to load friends:', err);
      return [];
    }
  }

  public async processInvite(
    referrerTelegramId: number
  ): Promise<{ status: string; friend_name?: string } | null> {
    try {
      const res = await fetch(`${API_BASE}/friends/invite`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ referrer_telegram_id: referrerTelegramId }),
      });
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn('Failed to process invite:', err);
      return null;
    }
  }

  public async toggleCloseFriend(friendId: number): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE}/friends/toggle_close`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ friend_id: friendId }),
      });
      return res.ok;
    } catch (err) {
      console.warn('Failed to toggle close friend:', err);
      return false;
    }
  }

  public async sendPing(friendTelegramId: number, message: string): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE}/ping`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          friend_telegram_id: friendTelegramId,
          message,
        }),
      });
      return res.ok;
    } catch (err) {
      console.warn('Failed to send ping:', err);
      return false;
    }
  }

  public async getRooms(): Promise<any[]> {
    try {
      const res = await fetch(`${API_BASE}/rooms`, {
        headers: this.getHeaders(),
      });
      if (!res.ok) return [];
      return await res.json();
    } catch {
      return [];
    }
  }
}

export const api = new ApiService();
