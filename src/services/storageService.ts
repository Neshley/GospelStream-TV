import { SyncState } from '../types';
import { INITIAL_SYNC_STATE } from '../data/mockData';

const STORAGE_KEY = 'gospelstream_tv_state_v3';
const SYNC_CHANNEL = 'gospelstream_state_sync_v3';
let broadcastChannel: BroadcastChannel | null = null;
try { if (typeof window !== 'undefined' && 'BroadcastChannel' in window) broadcastChannel = new BroadcastChannel(SYNC_CHANNEL); } catch { broadcastChannel = null; }

function mergeState(parsed: Partial<SyncState>): SyncState {
  return {
    ...INITIAL_SYNC_STATE,
    ...parsed,
    syncCode: typeof parsed.syncCode === 'string' ? parsed.syncCode : '',
    syncToken: typeof parsed.syncToken === 'string' ? parsed.syncToken : undefined,
    favorites: Array.isArray(parsed.favorites) ? parsed.favorites : [],
    watchLater: Array.isArray(parsed.watchLater) ? parsed.watchLater : [],
    continueWatching: Array.isArray(parsed.continueWatching) ? parsed.continueWatching : [],
    reminders: Array.isArray(parsed.reminders) ? parsed.reminders : [],
    notes: Array.isArray(parsed.notes) ? parsed.notes : [],
    // Actual media is device-local and is reconciled separately with IndexedDB.
    downloadedSermons: Array.isArray(parsed.downloadedSermons) ? parsed.downloadedSermons : [],
    profiles: Array.isArray(parsed.profiles) ? parsed.profiles : INITIAL_SYNC_STATE.profiles,
  };
}

export function loadSyncState(): SyncState {
  if (typeof window === 'undefined') return INITIAL_SYNC_STATE;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return mergeState(JSON.parse(raw));
    const initial = mergeState({ ...INITIAL_SYNC_STATE, lastSynced: new Date().toISOString(), downloadedSermons: [] });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
    return initial;
  } catch {
    return mergeState({ ...INITIAL_SYNC_STATE, downloadedSermons: [] });
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

export async function createCloudSyncCode(): Promise<{ code: string; token: string; expiresAt: number }> {
  const response = await fetch('/api/sync/code', { method: 'POST' });
  const data = await response.json();
  if (!response.ok || !data.success || !data.token) throw new Error(data.error || 'Could not create sync code');
  return { code: data.code, token: data.token, expiresAt: data.expiresAt };
}

export async function uploadSyncState(state: SyncState): Promise<SyncState> {
  if (!state.syncToken) throw new Error('This device is not connected to cloud sync.');
  const response = await fetch('/api/sync/state', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${state.syncToken}` },
    body: JSON.stringify({ state: { ...state, downloadedSermons: [] } }),
  });
  const data = await response.json();
  if (!response.ok || !data.success) throw new Error(data.error || 'Could not synchronize state');
  return mergeState({ ...data.state, syncToken: state.syncToken });
}

export async function downloadSyncState(token: string): Promise<SyncState> {
  const response = await fetch('/api/sync/state', { headers: { Authorization: `Bearer ${token}` } });
  const data = await response.json();
  if (!response.ok || !data.success) throw new Error(data.error || 'Sync session not found');
  return mergeState({ ...data.state, syncToken: token });
}

export async function pairCloudSyncCode(code: string): Promise<{ token: string; state: SyncState | null }> {
  const response = await fetch('/api/sync/pair', {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ code }),
  });
  const data = await response.json();
  if (!response.ok || !data.success || !data.token) throw new Error(data.error || 'Could not pair device');
  return { token: data.token, state: data.state ? mergeState({ ...data.state, syncToken: data.token }) : null };
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
