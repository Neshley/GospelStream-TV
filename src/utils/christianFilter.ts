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
  try {
    const url = new URL(input);
    if (url.hostname === 'youtu.be') return url.pathname.slice(1).match(/^[A-Za-z0-9_-]{6,20}$/)?.[0] || null;
    if (url.hostname.endsWith('youtube.com')) {
      const v = url.searchParams.get('v');
      if (v && /^[A-Za-z0-9_-]{6,20}$/.test(v)) return v;
      const match = url.pathname.match(/\/embed\/([A-Za-z0-9_-]{6,20})/);
      return match?.[1] || null;
    }
  } catch { /* not a URL */ }
  return null;
}

export function getYouTubeEmbedUrl(id: string, options: { autoplay?: boolean; mute?: boolean; rel?: number; loop?: boolean } = {}) {
  const params = new URLSearchParams({ autoplay: options.autoplay ? '1' : '0', mute: options.mute ? '1' : '0', rel: String(options.rel ?? 0), enablejsapi: '1', modestbranding: '1' });
  if (options.loop) { params.set('loop', '1'); params.set('playlist', id); }
  if (typeof window !== 'undefined') params.set('origin', window.location.origin);
  return `https://www.youtube-nocookie.com/embed/${id}?${params}`;
}

export function getYouTubeThumbnail(id: string) { return `https://i.ytimg.com/vi/${id}/hqdefault.jpg`; }
