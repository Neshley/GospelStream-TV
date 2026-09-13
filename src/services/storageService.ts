import { SyncState } from '../types';
import { INITIAL_SYNC_STATE } from '../data/mockData';

const STORAGE_KEY = 'gospelstream_tv_state_v2';
const DEVICE_KEY = 'gospelstream_tv_device_v1';
const SYNC_CHANNEL = 'gospelstream_state_sync_v2';
let broadcastChannel: BroadcastChannel | null = null;
try { if (typeof window !== 'undefined' && 'BroadcastChannel' in window) broadcastChannel = new BroadcastChannel(SYNC_CHANNEL); } catch { broadcastChannel = null; }

function mergeState(parsed: Partial<SyncState>): SyncState {
  return {
    ...INITIAL_SYNC_STATE,
    ...parsed,
    favorites: Array.isArray(parsed.favorites) ? parsed.favorites : [],
    watchLater: Array.isArray(parsed.watchLater) ? parsed.watchLater : [],
    continueWatching: Array.isArray(parsed.continueWatching) ? parsed.continueWatching : [],
    reminders: Array.isArray(parsed.reminders) ? parsed.reminders : [],
    notes: Array.isArray(parsed.notes) ? parsed.notes : [],
    downloadedSermons: Array.isArray(parsed.downloadedSermons) ? parsed.downloadedSermons : [],
    profiles: Array.isArray(parsed.profiles) ? parsed.profiles : INITIAL_SYNC_STATE.profiles,
  };
}

export function loadSyncState(): SyncState {
  if (typeof window === 'undefined') return INITIAL_SYNC_STATE;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return mergeState(JSON.parse(raw));
    const initial = mergeState({ ...INITIAL_SYNC_STATE, syncCode: generateDeviceSyncCode(), lastSynced: new Date().toISOString() });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
    return initial;
  } catch {
    return mergeState({ ...INITIAL_SYNC_STATE, syncCode: generateDeviceSyncCode(), lastSynced: new Date().toISOString() });
  }
}

export function saveSyncState(state: SyncState, broadcast = true): void {
  if (typeof window === 'undefined') return;
  const updated = { ...state, lastSynced: new Date().toISOString() };
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(updated)); } catch (err) { console.warn('Local state save failed', err); }
  if (broadcast) broadcastChannel?.postMessage({ type: 'STATE_UPDATED', payload: updated });
}

export function subscribeToCrossDeviceSync(callback: (state: SyncState) => void): () => void {
  if (!broadcastChannel) return () => {};
  const handler = (event: MessageEvent) => { if (event.data?.type === 'STATE_UPDATED') callback(mergeState(event.data.payload)); };
  broadcastChannel.addEventListener('message', handler);
  return () => broadcastChannel?.removeEventListener('message', handler);
}

export function generateDeviceSyncCode(): string {
  const a = cryptoRandomInt(100, 1000), b = cryptoRandomInt(100, 1000);
  return `${a}-${b}`;
}
function cryptoRandomInt(min: number, max: number) { return Math.floor(Math.random() * (max - min)) + min; }

export async function createCloudSyncCode(): Promise<string> {
  const response = await fetch('/api/sync/code', { method: 'POST' });
  const data = await response.json();
  if (!response.ok || !data.success) throw new Error(data.error || 'Could not create sync code');
  return data.code;
}

export async function uploadSyncState(state: SyncState): Promise<SyncState> {
  const response = await fetch(`/api/sync/${encodeURIComponent(state.syncCode)}`, {
    method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ state }),
  });
  const data = await response.json();
  if (!response.ok || !data.success) throw new Error(data.error || 'Could not synchronize state');
  return mergeState(data.state);
}

export async function downloadSyncState(code: string): Promise<SyncState> {
  const response = await fetch(`/api/sync/${encodeURIComponent(code)}`);
  const data = await response.json();
  if (!response.ok || !data.success) throw new Error(data.error || 'Pairing code not found');
  return mergeState(data.state);
}

export function isSermonDownloaded(sermonId: string, state: SyncState) { return state.downloadedSermons.some((item) => item.sermonId === sermonId); }

export async function requestNotificationPermission(): Promise<boolean> {
  if (typeof window === 'undefined' || !('Notification' in window)) return false;
  try { return (await Notification.requestPermission()) === 'granted'; } catch { return false; }
}
export function sendLocalNotification(title: string, body: string, icon?: string): void {
  if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
    try { new Notification(title, { body, icon }); } catch { /* ignore */ }
  }
}
