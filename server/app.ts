import express from 'express';
import crypto from 'crypto';
import { verifyChristianContent, checkSearchRelevance } from '../src/utils/christianFilter';

const app = express();
const CACHE_TTL_MS = 2 * 60 * 1000;
const MAX_QUERY_LENGTH = 120;
const MAX_BODY_BYTES = 256 * 1024;
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY?.trim();

app.disable('x-powered-by');
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  next();
});
app.use(express.json({ limit: MAX_BODY_BYTES }));

const cache = new Map<string, { timestamp: number; data: unknown }>();
const requestBuckets = new Map<string, { started: number; count: number }>();
function rateLimit(req: express.Request, res: express.Response, next: express.NextFunction) {
  const key = req.ip || 'unknown';
  const now = Date.now();
  const bucket = requestBuckets.get(key);
  if (!bucket || now - bucket.started >= 60_000) {
    requestBuckets.set(key, { started: now, count: 1 });
    return next();
  }
  bucket.count += 1;
  if (requestBuckets.size > 10000) requestBuckets.clear();
  if (bucket.count > 60) return res.status(429).json({ success: false, error: 'Too many requests. Try again shortly.' });
  next();
}
app.use('/api', rateLimit);

function cleanQuery(value: unknown, fallback: string) {
  const q = typeof value === 'string' ? value.trim().replace(/\s+/g, ' ') : '';
  return (q || fallback).slice(0, MAX_QUERY_LENGTH);
}

function cacheGet<T>(key: string): T | undefined {
  const item = cache.get(key);
  if (!item || Date.now() - item.timestamp > CACHE_TTL_MS) return undefined;
  return item.data as T;
}
function cacheSet(key: string, data: unknown) {
  if (cache.size >= 100) cache.delete(cache.keys().next().value as string);
  cache.set(key, { timestamp: Date.now(), data });
}

function parseDuration(text: string) {
  const parts = text.split(':').map(Number);
  if (parts.some(Number.isNaN)) return 0;
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  return 0;
}

function categoryFor(title: string) {
  const t = title.toLowerCase();
  if (/worship|praise|hymn/.test(t)) return 'Worship Nights';
  if (/prayer|fasting|intercession/.test(t)) return 'Prayer & Fasting';
  if (/bible|study|scripture|verse|testament/.test(t)) return 'Deep Bible Study';
  if (/heal|faith|miracle/.test(t)) return 'Faith & Healing';
  if (/spirit|holy|revival/.test(t)) return 'Walking in the Spirit';
  return 'Sunday Sermons';
}

function parseYoutubeError(data: any) {
  return data?.error?.message || 'YouTube API request failed';
}

async function youtubeApi(endpoint: string, params: Record<string, string>) {
  if (!YOUTUBE_API_KEY) throw new Error('YOUTUBE_API_KEY is not configured');
  const url = new URL(`https://www.googleapis.com/youtube/v3/${endpoint}`);
  Object.entries({ ...params, key: YOUTUBE_API_KEY }).forEach(([k, v]) => url.searchParams.set(k, v));
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8_000);
  try {
    const response = await fetch(url, { signal: controller.signal });
    const data = await response.json();
    if (!response.ok) throw new Error(parseYoutubeError(data));
    return data;
  } finally {
    clearTimeout(timer);
  }
}

async function searchYouTube(query: string, liveOnly: boolean) {
  const cacheKey = `yt:${query}:${liveOnly}`;
  const cached = cacheGet<any[]>(cacheKey);
  if (cached) return cached;
  if (!YOUTUBE_API_KEY) return [];

  const search = await youtubeApi('search', {
    part: 'snippet', type: 'video', maxResults: '20', q: query,
    ...(liveOnly ? { eventType: 'live' } : {}),
  });
  const ids = (search.items || []).map((x: any) => x.id?.videoId).filter(Boolean).join(',');
  if (!ids) return [];
  const details = await youtubeApi('videos', { part: 'snippet,contentDetails,liveStreamingDetails', id: ids });
  const items = (details.items || []).map((v: any) => {
    const title = String(v.snippet?.title || '').trim();
    const description = String(v.snippet?.description || '').trim();
    const channel = String(v.snippet?.channelTitle || '').trim();
    const verification = verifyChristianContent(title, description, channel);
    const live = Boolean(v.snippet?.liveBroadcastContent === 'live' || v.liveStreamingDetails?.actualStartTime && !v.liveStreamingDetails?.actualEndTime);
    if (!verification.isChristian || verification.confidence < 75) return null;
    const durationFormatted = live ? 'LIVE' : formatIsoDuration(v.contentDetails?.duration);
    const scriptureMatch = `${title} ${description}`.match(/\b(?:Genesis|Exodus|Leviticus|Numbers|Deuteronomy|Joshua|Judges|Ruth|1 Samuel|2 Samuel|1 Kings|2 Kings|Psalms?|Proverbs|Ecclesiastes|Isaiah|Jeremiah|Daniel|Matthew|Mark|Luke|John|Acts|Romans|1 Corinthians|2 Corinthians|Galatians|Ephesians|Philippians|Colossians|1 Thessalonians|2 Thessalonians|1 Timothy|2 Timothy|Hebrews|James|1 Peter|2 Peter|1 John|Revelation)\s+\d+(?::[\d-]+)?/i);
    const scripture = scriptureMatch?.[0] || '';
    return {
      id: `yt-${v.id}`,
      youtubeId: v.id,
      title,
      preacher: channel,
      ministry: channel,
      scripture,
      scriptureText: '',
      duration: parseDuration(durationFormatted),
      durationFormatted,
      thumbnailUrl: v.snippet?.thumbnails?.high?.url || `https://i.ytimg.com/vi/${v.id}/hqdefault.jpg`,
      videoUrl: `https://www.youtube-nocookie.com/embed/${v.id}`,
      isOnlineVideo: true,
      sourceType: live ? 'livestream' : 'youtube',
      isLive: live,
      verifiedChristian: true,
      verificationConfidence: verification.confidence,
      category: categoryFor(title),
      series: live ? 'Live Broadcast' : 'Recorded Ministry Teaching',
      date: v.snippet?.publishedAt || '',
      description,
      chapters: [{ title: 'Full Video', time: 0 }],
      biblePassages: scripture ? [{ reference: scripture, translation: '', text: '' }] : [],
      keyPoints: [live ? 'Currently live.' : 'Recorded message available on demand.'],
      downloadSizeMb: 0,
      tags: [live ? 'Live' : 'Recorded', channel, categoryFor(title)],
      viewsCount: '',
    };
  }).filter(Boolean);
  cacheSet(cacheKey, items);
  return items;
}

function formatIsoDuration(iso = '') {
  const m = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!m) return 'Recorded';
  const h = Number(m[1] || 0), min = Number(m[2] || 0), sec = Number(m[3] || 0);
  return h ? `${h}:${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}` : `${min}:${String(sec).padStart(2, '0')}`;
}

app.get('/api/health', (_req, res) => res.json({ success: true, youtubeConfigured: Boolean(YOUTUBE_API_KEY), syncConfigured: Boolean(KV_URL && KV_TOKEN) || process.env.NODE_ENV !== 'production' }));

app.get('/api/youtube/christian', async (req, res) => {
  const q = cleanQuery(req.query.q, 'Christian worship sermon');
  const filter = ['all', 'live', 'recorded'].includes(String(req.query.filter)) ? String(req.query.filter) : 'all';
  const category = cleanQuery(req.query.category, 'All');
  const relevance = checkSearchRelevance(q);
  if (!relevance.isPermitted) return res.status(400).json({ success: false, error: relevance.warning });
  if (!YOUTUBE_API_KEY) return res.json({ success: true, configured: false, query: q, total: 0, liveCount: 0, recordedCount: 0, videos: [] });
  try {
    let videos = await searchYouTube(q, filter === 'live');
    if (filter === 'live') videos = videos.filter((v: any) => v.isLive);
    if (filter === 'recorded') videos = videos.filter((v: any) => !v.isLive);
    if (category !== 'All' && category !== 'Online YouTube') videos = videos.filter((v: any) => v.category === category);
    res.json({ success: true, configured: true, query: q, filter, total: videos.length, liveCount: videos.filter((v: any) => v.isLive).length, recordedCount: videos.filter((v: any) => !v.isLive).length, videos });
  } catch (error: any) {
    res.status(502).json({ success: false, error: error?.message || 'YouTube service unavailable' });
  }
});

app.get('/api/youtube/channels', async (_req, res) => {
  if (!YOUTUBE_API_KEY) return res.json({ success: true, configured: false, channels: [] });
  try {
    const videos = await searchYouTube('Christian worship live', true);
    const channels = videos.slice(0, 6).map((v: any, i: number) => ({
      id: `yt-ch-${v.youtubeId}`,
      number: 101 + i,
      name: v.ministry,
      tagline: v.title,
      badge: 'LIVE',
      logoColor: 'from-blue-600 to-cyan-500',
      category: v.category,
      streamUrl: v.videoUrl,
      youtubeId: v.youtubeId,
      currentProgram: {
        id: `yt-program-${v.youtubeId}`,
        title: v.title,
        speaker: v.preacher,
        scriptureRef: v.scripture || undefined,
        startTimeFormatted: 'LIVE NOW',
        endTimeFormatted: 'LIVE',
        startMinutes: 0,
        endMinutes: 1440,
        durationMinutes: 1440,
        description: v.description,
        isLive: true,
        category: v.category,
      },
      upcomingPrograms: [],
    }));
    res.json({ success: true, configured: true, channels });
  } catch (error: any) {
    res.status(502).json({ success: false, error: error?.message || 'YouTube service unavailable' });
  }
});

app.get('/api/youtube/status/:videoId', async (req, res) => {
  const id = String(req.params.videoId || '');
  if (!/^[A-Za-z0-9_-]{6,20}$/.test(id)) return res.status(400).json({ success: false, error: 'Invalid YouTube video ID' });
  if (!YOUTUBE_API_KEY) return res.status(503).json({ success: false, error: 'YouTube API is not configured' });
  try {
    const data = await youtubeApi('videos', { part: 'snippet,liveStreamingDetails', id });
    const v = data.items?.[0];
    if (!v) return res.status(404).json({ success: false, error: 'Video not found' });
    const title = String(v.snippet?.title || '').trim();
    const description = String(v.snippet?.description || '').trim();
    const author = String(v.snippet?.channelTitle || '').trim();
    const verification = verifyChristianContent(title, description, author);
    const isLive = Boolean(v.snippet?.liveBroadcastContent === 'live' || (v.liveStreamingDetails?.actualStartTime && !v.liveStreamingDetails?.actualEndTime));
    res.json({ success: true, videoId: id, isLive, status: isLive ? 'LIVE' : 'RECORDED', title, author, description, verifiedChristian: verification.isChristian && verification.confidence >= 75, verificationConfidence: verification.confidence, verificationReason: verification.blockedReason || '' });
  } catch (error: any) {
    res.status(502).json({ success: false, error: error?.message || 'YouTube service unavailable' });
  }
});

function isSyncCode(code: unknown): code is string {
  return typeof code === 'string' && /^\d{3}-\d{3}$/.test(code);
}
function newSyncCode() { return `${crypto.randomInt(100, 1000)}-${crypto.randomInt(100, 1000)}`; }
function newSyncToken() { return crypto.randomBytes(32).toString('base64url'); }
function tokenHash(token: string) { return crypto.createHash('sha256').update(token).digest('hex'); }
function codeHash(code: string) { return crypto.createHash('sha256').update(`code:${code}`).digest('hex'); }
function sanitizeSyncState(state: any) {
  if (!state || typeof state !== 'object') throw new Error('Invalid sync state');
  const arr = (x: any) => Array.isArray(x) ? x.slice(0, 500) : [];
  const profiles = Array.isArray(state.profiles) ? state.profiles.slice(0, 10).map((p: any) => ({
    id: typeof p?.id === 'string' ? p.id.slice(0, 80) : '',
    name: typeof p?.name === 'string' ? p.name.slice(0, 80) : 'Profile',
    avatarColor: typeof p?.avatarColor === 'string' ? p.avatarColor.slice(0, 80) : '',
    role: typeof p?.role === 'string' ? p.role.slice(0, 80) : 'Member',
  })) : [];
  return {
    syncCode: isSyncCode(state.syncCode) ? state.syncCode : '',
    lastSynced: typeof state.lastSynced === 'string' && !Number.isNaN(Date.parse(state.lastSynced)) ? state.lastSynced : new Date().toISOString(),
    deviceName: typeof state.deviceName === 'string' ? state.deviceName.slice(0, 80) : 'GospelStream Device',
    currentProfileId: typeof state.currentProfileId === 'string' ? state.currentProfileId.slice(0, 80) : '',
    profiles,
    favorites: arr(state.favorites), watchLater: arr(state.watchLater), continueWatching: arr(state.continueWatching),
    reminders: arr(state.reminders), notes: arr(state.notes),
    // Device-local media must never be treated as cloud-synced bytes.
    downloadedSermons: [],
    fontSize: ['normal', 'large', 'extra-large'].includes(state.fontSize) ? state.fontSize : 'normal',
    closedCaptionsEnabled: Boolean(state.closedCaptionsEnabled),
  };
}

type SyncRecord = { tokenHash: string; state: unknown; updatedAt: number; expiresAt: number };
const syncByToken = new Map<string, SyncRecord>();
const pairingCodes = new Map<string, { token: string; expiresAt: number }>();
const KV_URL = process.env.KV_REST_API_URL?.trim();
const KV_TOKEN = process.env.KV_REST_API_TOKEN?.trim();

async function kvCommand<T = any>(command: string[]): Promise<T | null> {
  if (!KV_URL || !KV_TOKEN) return null;
  const response = await fetch(KV_URL, {
    method: 'POST', headers: { Authorization: `Bearer ${KV_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(command),
  });
  if (!response.ok) throw new Error(`Sync database request failed (${response.status})`);
  const data = await response.json();
  return (data?.result ?? null) as T | null;
}
async function savePairing(code: string, token: string, expiresAt: number) {
  const value = JSON.stringify({ token, expiresAt });
  if (KV_URL && KV_TOKEN) {
    await kvCommand(['SET', `gstv:pair:${codeHash(code)}`, value, 'EX', String(Math.max(1, Math.ceil((expiresAt - Date.now()) / 1000)))]);
  } else {
    pairingCodes.set(code, { token, expiresAt });
  }
}
async function consumePairing(code: string): Promise<{ token: string; expiresAt: number } | null> {
  if (KV_URL && KV_TOKEN) {
    const key = `gstv:pair:${codeHash(code)}`;
    const raw = await kvCommand<string>(['GET', key]);
    if (!raw) return null;
    await kvCommand(['DEL', key]);
    return JSON.parse(raw);
  }
  const pairing = pairingCodes.get(code) || null;
  pairingCodes.delete(code);
  return pairing;
}

async function saveSyncRecord(record: SyncRecord) {
  const key = `gstv:sync:${record.tokenHash}`;
  const value = JSON.stringify(record);
  if (KV_URL && KV_TOKEN) {
    await kvCommand(['SET', key, value, 'EX', String(Math.max(1, Math.ceil((record.expiresAt - Date.now()) / 1000)))]);
  } else {
    syncByToken.set(record.tokenHash, record);
  }
}
async function getSyncRecord(hash: string): Promise<SyncRecord | null> {
  if (KV_URL && KV_TOKEN) {
    const raw = await kvCommand<string>(['GET', `gstv:sync:${hash}`]);
    return raw ? JSON.parse(raw) : null;
  }
  return syncByToken.get(hash) || null;
}
function bearerToken(req: express.Request) {
  const header = req.header('authorization') || '';
  return header.startsWith('Bearer ') ? header.slice(7).trim() : '';
}

app.post('/api/sync/code', async (_req, res) => {
  if (process.env.NODE_ENV === 'production' && (!KV_URL || !KV_TOKEN)) return res.status(503).json({ success: false, error: 'Cloud sync storage is not configured. Set KV_REST_API_URL and KV_REST_API_TOKEN.' });
  const token = newSyncToken();
  let code = newSyncCode();
  for (let i = 0; i < 10 && (pairingCodes.has(code)); i++) code = newSyncCode();
  const expiresAt = Date.now() + 10 * 60 * 1000;
  await savePairing(code, token, expiresAt);
  res.json({ success: true, code, token, expiresAt });
});

app.post('/api/sync/pair', async (req, res) => {
  const requested = String(req.body?.code || '').trim().toUpperCase();
  if (!isSyncCode(requested)) return res.status(400).json({ success: false, error: 'Enter a valid 6-digit pairing code in 123-456 format.' });
  const pairing = await consumePairing(requested);
  if (!pairing || pairing.expiresAt <= Date.now()) {
    return res.status(404).json({ success: false, error: 'Pairing code not found or expired. Generate a new code on the other device.' });
  }
  pairingCodes.delete(requested);
  const record = await getSyncRecord(tokenHash(pairing.token));
  res.json({ success: true, token: pairing.token, state: record?.state || null, updatedAt: record?.updatedAt || null });
});

app.put('/api/sync/state', async (req, res) => {
  const token = bearerToken(req);
  if (!token || token.length < 40) return res.status(401).json({ success: false, error: 'A valid sync token is required.' });
  try {
    const state = sanitizeSyncState(req.body?.state);
    const hash = tokenHash(token);
    const existing = await getSyncRecord(hash);
    const now = Date.now();
    const record: SyncRecord = {
      tokenHash: hash,
      state,
      updatedAt: now,
      expiresAt: Math.max(existing?.expiresAt || 0, now + 30 * 24 * 60 * 60 * 1000),
    };
    await saveSyncRecord(record);
    res.json({ success: true, state, updatedAt: now });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error?.message || 'Invalid sync state' });
  }
});

app.get('/api/sync/state', async (req, res) => {
  const token = bearerToken(req);
  if (!token || token.length < 40) return res.status(401).json({ success: false, error: 'A valid sync token is required.' });
  try {
    const record = await getSyncRecord(tokenHash(token));
    if (!record || record.expiresAt <= Date.now()) return res.status(404).json({ success: false, error: 'Sync session expired or not found.' });
    res.json({ success: true, state: record.state, updatedAt: record.updatedAt });
  } catch (error: any) {
    res.status(503).json({ success: false, error: error?.message || 'Sync database unavailable' });
  }
});

export default app;
