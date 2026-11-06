export interface ChristianVerificationResult {
  isChristian: boolean;
  confidence: number;
  matchedKeywords: string[];
  matchedMinistries?: string[];
  categorySuggested?: string;
  blockedReason?: string;
}

const BLOCKED_SECULAR_PATTERNS = [
  'porn', 'pornography', 'explicit sexual', 'sex tape', 'onlyfans', 'gambling',
  'casino', 'betting', 'lottery', 'nude', 'nudity', 'xxx', 'drug deal',
];

const RECOGNIZED_CHRISTIAN_MINISTRIES = [
  'billy graham', 'billy graham evangelistic association', 'desiring god',
  'john piper', 'the gospel coalition', 'got questions', 'crossway',
  'international house of prayer', 'ihopkc', 'elevation worship', 'hillsong',
  'bethel music', 'jesus culture', 'christianity today',
];

const STRONG_KEYWORDS = [
  'jesus christ', 'gospel of jesus', 'salvation', 'repentance', 'resurrection of jesus',
  'bible study', 'holy spirit', 'christian sermon', 'christian worship', 'christian prayer',
  'word of god', 'scripture', 'church service', 'worship service', 'praise and worship',
  'christian teaching', 'christian preaching', 'sermon', 'gospel', 'jesus', 'christian', 'bible',
];
const SUPPORTING_KEYWORDS = ['worship', 'praise', 'prayer', 'faith', 'grace', 'salvation', 'scripture', 'church', 'pastor', 'preaching', 'ministry', 'revival', 'holy spirit'];

function containsPhrase(text: string, phrase: string) {
  const escaped = phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\s+/g, '\\s+');
  return new RegExp(`(?:^|\\b)${escaped}(?:$|\\b)`, 'i').test(text);
}

export function verifyChristianContent(title: string, description = '', ministryOrSpeaker = ''): ChristianVerificationResult {
  const fullText = `${title} ${description} ${ministryOrSpeaker}`.replace(/\s+/g, ' ').trim();
  const lower = fullText.toLowerCase();
  const blocked = BLOCKED_SECULAR_PATTERNS.find((term) => lower.includes(term));
  if (blocked) return { isChristian: false, confidence: 0, matchedKeywords: [], blockedReason: `Blocked topic detected: ${blocked}` };

  const ministries = RECOGNIZED_CHRISTIAN_MINISTRIES.filter((m) => containsPhrase(fullText, m));
  const strong = STRONG_KEYWORDS.filter((k) => containsPhrase(fullText, k));
  const supporting = SUPPORTING_KEYWORDS.filter((k) => containsPhrase(fullText, k));
  const scripture = /\b(?:Genesis|Exodus|Leviticus|Numbers|Deuteronomy|Joshua|Judges|Ruth|1 Samuel|2 Samuel|1 Kings|2 Kings|Psalms?|Proverbs|Ecclesiastes|Isaiah|Jeremiah|Lamentations|Ezekiel|Daniel|Hosea|Joel|Amos|Obadiah|Jonah|Micah|Nahum|Habakkuk|Zephaniah|Haggai|Zechariah|Malachi|Matthew|Mark|Luke|John|Acts|Romans|1 Corinthians|2 Corinthians|Galatians|Ephesians|Philippians|Colossians|1 Thessalonians|2 Thessalonians|1 Timothy|2 Timothy|Titus|Philemon|Hebrews|James|1 Peter|2 Peter|1 John|2 John|3 John|Jude|Revelation)\s+\d+/i.test(fullText);

  let confidence = 0;
  confidence += Math.min(60, strong.length * 15);
  confidence += Math.min(20, supporting.length * 4);
  if (scripture) confidence += 15;
  if (ministries.length) confidence = Math.max(confidence, 95);
  const isChristian = confidence >= 75;
  return {
    isChristian,
    confidence: Math.min(100, confidence),
    matchedKeywords: [...new Set([...strong, ...supporting])],
    matchedMinistries: ministries,
    categorySuggested: strong.some((x) => /worship|praise/.test(x)) ? 'Praise & Worship' : strong.some((x) => /bible|scripture/.test(x)) ? 'Deep Bible Study' : 'Sunday Sermons',
    blockedReason: isChristian ? undefined : 'Insufficient Christian-context evidence.',
  };
}

export function checkSearchRelevance(query: string) {
  const clean = query.trim();
  if (!clean) return { isPermitted: true };
  const blocked = BLOCKED_SECULAR_PATTERNS.find((term) => clean.toLowerCase().includes(term));
  return blocked ? { isPermitted: false, warning: `Search term contains a blocked topic: ${blocked}` } : { isPermitted: true };
}

export function extractYouTubeId(input: string): string | null {
  if (!input) return null;
  const raw = String(input).trim();
  // If it's already an 11-char YouTube ID
  if (/^[A-Za-z0-9_-]{11}$/.test(raw)) return raw;

  // Try parsing as standard URL
  try {
    const url = new URL(raw);
    const host = url.hostname.toLowerCase();
    if (host === 'youtu.be') {
      const id = url.pathname.slice(1).split('/')[0];
      if (/^[A-Za-z0-9_-]{11}$/.test(id)) return id;
    }
    if (host.includes('youtube.com')) {
      const v = url.searchParams.get('v');
      if (v && /^[A-Za-z0-9_-]{11}$/.test(v)) return v;

      const pathParts = url.pathname.split('/').filter(Boolean);
      // Handles /embed/ID, /live/ID, /shorts/ID, /v/ID
      const specialIndex = pathParts.findIndex((p) => ['embed', 'live', 'shorts', 'v'].includes(p.toLowerCase()));
      if (specialIndex !== -1 && pathParts[specialIndex + 1]) {
        const candidate = pathParts[specialIndex + 1].match(/^[A-Za-z0-9_-]{11}/)?.[0];
        if (candidate) return candidate;
      }
    }
  } catch {
    // If not a standard URL, search string with regex
  }

  const match = raw.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|live\/|shorts\/))([A-Za-z0-9_-]{11})/);
  return match?.[1] || null;
}

export function getYouTubeEmbedUrl(id: string, options: { autoplay?: boolean; mute?: boolean; rel?: number; loop?: boolean } = {}) {
  const params = new URLSearchParams({
    autoplay: options.autoplay ? '1' : '0',
    mute: options.mute ? '1' : '0',
    rel: '0',
    enablejsapi: '1',
    playsinline: '1',
    modestbranding: '1',
  });
  if (options.loop) {
    params.set('loop', '1');
    params.set('playlist', id);
  }
  return `https://www.youtube-nocookie.com/embed/${id}?${params.toString()}`;
}

export function getYouTubeThumbnail(id: string) {
  return `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
}

export interface VideoSourceInfo {
  type: 'youtube' | 'vimeo' | 'dailymotion' | 'direct' | 'iframe';
  embedUrl: string;
  externalUrl: string;
  providerName: string;
  rawId?: string;
  thumbnailUrl?: string;
  isEmbeddable: boolean;
}

export function resolveVideoSource(inputUrlOrId: string, options: { autoplay?: boolean; mute?: boolean } = {}): VideoSourceInfo {
  if (!inputUrlOrId) {
    return {
      type: 'direct',
      embedUrl: '',
      externalUrl: '',
      providerName: 'Media Stream',
      isEmbeddable: false,
    };
  }

  const raw = String(inputUrlOrId).trim();

  // 1. YouTube Detection
  const ytId = extractYouTubeId(raw);
  if (ytId) {
    return {
      type: 'youtube',
      rawId: ytId,
      embedUrl: getYouTubeEmbedUrl(ytId, options),
      externalUrl: `https://www.youtube.com/watch?v=${ytId}`,
      providerName: 'YouTube',
      thumbnailUrl: getYouTubeThumbnail(ytId),
      isEmbeddable: true,
    };
  }

  // 2. Vimeo Detection (vimeo.com/123456789 or player.vimeo.com/video/123456789)
  const vimeoMatch = raw.match(/(?:vimeo\.com\/(?:video\/)?|player\.vimeo\.com\/video\/)(\d+)/);
  if (vimeoMatch?.[1]) {
    const vimeoId = vimeoMatch[1];
    return {
      type: 'vimeo',
      rawId: vimeoId,
      embedUrl: `https://player.vimeo.com/video/${vimeoId}?autoplay=${options.autoplay ? '1' : '0'}&muted=${options.mute ? '1' : '0'}&dnt=1`,
      externalUrl: `https://vimeo.com/${vimeoId}`,
      providerName: 'Vimeo',
      thumbnailUrl: `https://vumbnail.com/${vimeoId}.jpg`,
      isEmbeddable: true,
    };
  }

  // 3. Dailymotion Detection (dailymotion.com/video/ID or dai.ly/ID)
  const dmMatch = raw.match(/(?:dailymotion\.com\/(?:video\/|embed\/video\/)|dai\.ly\/)([A-Za-z0-9]+)/);
  if (dmMatch?.[1]) {
    const dmId = dmMatch[1];
    return {
      type: 'dailymotion',
      rawId: dmId,
      embedUrl: `https://www.dailymotion.com/embed/video/${dmId}?autoplay=${options.autoplay ? '1' : '0'}&mute=${options.mute ? '1' : '0'}`,
      externalUrl: `https://www.dailymotion.com/video/${dmId}`,
      providerName: 'Dailymotion',
      thumbnailUrl: `https://www.dailymotion.com/thumbnail/video/${dmId}`,
      isEmbeddable: true,
    };
  }

  // 4. Direct video files & streams (.mp4, .webm, .ogg, .m3u8, .mov)
  if (/\.(mp4|webm|ogv|ogg|mov|m3u8)(\?.*)?$/i.test(raw)) {
    return {
      type: 'direct',
      embedUrl: raw,
      externalUrl: raw,
      providerName: 'Direct Video Stream',
      isEmbeddable: true,
    };
  }

  // 5. Generic HTTPS iframe / Embed link (e.g. Christian ministry embeds, soundcloud, sermon audio)
  if (/^https?:\/\//i.test(raw)) {
    return {
      type: 'iframe',
      embedUrl: raw,
      externalUrl: raw,
      providerName: 'External Web Stream',
      isEmbeddable: true,
    };
  }

  return {
    type: 'direct',
    embedUrl: raw,
    externalUrl: raw,
    providerName: 'Video Stream',
    isEmbeddable: false,
  };
}
