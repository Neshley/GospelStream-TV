import { SyncState, Sermon, LiveEvent, SermonNote, DownloadedItem } from '../types';
import { INITIAL_SYNC_STATE, SERMONS } from '../data/mockData';

const STORAGE_KEY = 'gospelstream_tv_sync_state_v1';
const SYNC_BROADCAST_CHANNEL = 'gospelstream_device_sync_channel';

// Initialize broadcast channel for real-time cross-tab / cross-window sync
let broadcastChannel: BroadcastChannel | null = null;
try {
  if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
    broadcastChannel = new BroadcastChannel(SYNC_BROADCAST_CHANNEL);
  }
} catch {
  // BroadcastChannel might fail in restricted iframes
  broadcastChannel = null;
}

export function loadSyncState(): SyncState {
  if (typeof window === 'undefined') return INITIAL_SYNC_STATE;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return { ...INITIAL_SYNC_STATE, ...parsed };
    }
  } catch (err) {
    console.warn('Failed to read from localStorage:', err);
  }
  return INITIAL_SYNC_STATE;
}

export function saveSyncState(state: SyncState): void {
  if (typeof window === 'undefined') return;
  try {
    const updated = { ...state, lastSynced: 'Just now' };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    if (broadcastChannel) {
      broadcastChannel.postMessage({ type: 'STATE_UPDATED', payload: updated });
    }
  } catch (err) {
    console.warn('Failed to save to localStorage:', err);
  }
}

export function subscribeToCrossDeviceSync(callback: (state: SyncState) => void): () => void {
  if (!broadcastChannel) return () => {};

  const handleMessage = (event: MessageEvent) => {
    if (event.data && event.data.type === 'STATE_UPDATED' && event.data.payload) {
      callback(event.data.payload);
    }
  };

  broadcastChannel.addEventListener('message', handleMessage);
  return () => {
    broadcastChannel?.removeEventListener('message', handleMessage);
  };
}

// Generate new 6-digit sync code
export function generateDeviceSyncCode(): string {
  const num1 = Math.floor(100 + Math.random() * 900);
  const num2 = Math.floor(100 + Math.random() * 900);
  return `${num1}-${num2}`;
}

// Offline media store helper
export function isSermonDownloaded(sermonId: string, state: SyncState): boolean {
  return state.downloadedSermons.some((item) => item.sermonId === sermonId);
}

// Browser Push / Notification API helper
export async function requestNotificationPermission(): Promise<boolean> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return false;
  }
  try {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  } catch {
    return false;
  }
}

export function sendLocalNotification(title: string, body: string, icon?: string): void {
  if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
    try {
      new Notification(title, {
        body,
        icon: icon || 'https://images.unsplash.com/photo-1507692049790-de58290a4334?auto=format&fit=crop&w=128&q=80',
        badge: '/assets/icon.png',
      });
    } catch {
      // Notification failed in iframe sandbox
    }
  }
}
