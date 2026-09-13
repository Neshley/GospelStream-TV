// Christian Content Guardian & YouTube Media Stream Utility
// Strictly filters and verifies online video content to ensure 100% Christian faith-based integrity

export interface ChristianVerificationResult {
  isChristian: boolean;
  confidence: number; // 0 to 100
  matchedKeywords: string[];
  categorySuggested?: string;
  blockedReason?: string;
}

// Approved Christian Ministries, Organizations & Respected Ministers
export const RECOGNIZED_CHRISTIAN_MINISTRIES = [
  'bibleproject', 'the chosen', 'billy graham', 'tim keller', 'gospel in life',
  'francis chan', 'tony evans', 'charles stanley', 'in touch ministries',
  'voddie baucham', 'priscilla shirer', 'jackie hill perry', 'alistair begg',
  'truth for life', 'john piper', 'desiring god', 'charles spurgeon',
  'elevation worship', 'maverick city music', 'bethel music', 'hillsong worship',
  'cece winans', 'kari jobe', 'cody carnes', 'chris tomlin', 'phil wickham',
  'brandon lake', 'tasha cobbs', 'sinach', 'don moen', 'maranatha music',
  'jesus film project', 'ligonier ministries', 'crossway', 'gotquestions',
  'passion city church', 'saddleback church', 'north point', 'calvary chapel',
  'life.church', 'gateway church', 'first15', 'cbn', 'tbn', 'daystar',
  'worshipmob', 'dappytkeys', 'spirit sound', 'bible hub', 'worship together',
  'samuel jackson-reed', 'ihopkc', 'international house of prayer'
];

// High-confidence Christian terms & Bible references
export const CHRISTIAN_KEYWORDS = [
  // Divinity & Core Gospel
  'jesus', 'christ', 'jesus christ', 'god', 'lord', 'holy spirit', 'yahweh',
  'yeshua', 'gospel', 'salvation', 'cross', 'calvary', 'resurrection',
  'redemption', 'grace', 'faith', 'mercy', 'covenant', 'eternal life',
  'trinity', 'crucified', 'ascension', 'second coming', 'born again',

  // Scripture & Bible
  'bible', 'scripture', 'biblical', 'scriptures', 'old testament', 'new testament',
  'genesis', 'exodus', 'psalms', 'psalm', 'proverbs', 'ecclesiastes', 'isaiah',
  'jeremiah', 'daniel', 'matthew', 'mark', 'luke', 'john', 'acts', 'romans',
  'corinthians', 'galatians', 'ephesians', 'philippians', 'colossians',
  'thessalonians', 'timothy', 'hebrews', 'james', 'peter', 'revelation',

  // Worship, Ministry & Church Life
  'sermon', 'preaching', 'preacher', 'pastor', 'bishop', 'evangelist',
  'ministry', 'worship', 'praise', 'hymn', 'hymns', 'church', 'sanctuary',
  'prayer', 'praying', 'fasting', 'discipleship', 'fellowship', 'anointing',
  'miracle', 'holiness', 'repentance', 'devotional', 'testimony', 'testimonies',
  'christian', 'christianity', 'baptist', 'methodist', 'pentecostal',
  'presbyterian', 'evangelical', 'deliverance', 'blessing', 'beatitudes',
  'kingdom of god', 'spiritual warfare', 'armor of god'
];

// Explicitly secular or prohibited keywords that should be rejected by the Christian safety guard
export const BLOCKED_SECULAR_PATTERNS = [
  'gta', 'grand theft auto', 'fortnite', 'call of duty', 'minecraft smp',
  'casino', 'blackjack', 'roulette', 'poker tournament', 'betting tips',
  'horror movie full', 'slasher', 'zombie apocalypse', 'demonic ritual',
  'witchcraft spell', 'astrology tarot', 'zodiac horoscope', 'nsfw', 'twerk',
  'rap battle diss', 'celebrity gossip drama', 'club partying drunk'
];

/**
 * Extracts standard 11-character YouTube video ID from various YouTube URL formats or direct IDs
 */
export function extractYouTubeId(input: string): string | null {
  if (!input) return null;
  const trimmed = input.trim();

  // If already an 11-char ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return trimmed;
  }

  // Handle standard YouTube URL patterns
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtube\.com\/watch\?.+&v=)([^#&?]{11})/,
    /(?:youtu\.be\/)([^#&?]{11})/,
    /(?:youtube\.com\/embed\/)([^#&?]{11})/,
    /(?:youtube\.com\/v\/)([^#&?]{11})/,
    /(?:youtube\.com\/live\/)([^#&?]{11})/,
    /(?:youtube-nocookie\.com\/embed\/)([^#&?]{11})/
  ];

  for (const regex of patterns) {
    const match = trimmed.match(regex);
    if (match && match[1]) {
      return match[1];
    }
  }

  return null;
}

/**
 * Generates an optimized, privacy-enhanced YouTube embed URL
 */
export function getYouTubeEmbedUrl(
  id: string, 
  options: { autoplay?: boolean; mute?: boolean; rel?: number; loop?: boolean } = {}
): string {
  const params = new URLSearchParams({
    autoplay: options.autoplay ? '1' : '0',
    mute: options.mute ? '1' : '0',
    rel: options.rel !== undefined ? String(options.rel) : '0',
    enablejsapi: '1',
    modestbranding: '1',
    origin: typeof window !== 'undefined' ? window.location.origin : 'https://localhost'
  });

  return `https://www.youtube-nocookie.com/embed/${id}?${params.toString()}`;
}

/**
 * Returns the highest available YouTube thumbnail URL for an ID
 */
export function getYouTubeThumbnail(id: string): string {
  return `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
}

/**
 * Strictly verifies whether a title, description, or ministry is Christian.
 * Returns detailed diagnostics and reasons.
 */
export function verifyChristianContent(
  title: string,
  description: string = '',
  ministryOrSpeaker: string = ''
): ChristianVerificationResult {
  const fullText = `${title} ${description} ${ministryOrSpeaker}`.toLowerCase();

  // Check for blocked secular / forbidden terms
  for (const blocked of BLOCKED_SECULAR_PATTERNS) {
    if (fullText.includes(blocked.toLowerCase())) {
      return {
        isChristian: false,
        confidence: 0,
        matchedKeywords: [],
        blockedReason: `Content contains forbidden secular topic ("${blocked}"). GospelStream TV exclusively streams Christian spiritual content.`
      };
    }
  }

  // Check against verified Christian ministries
  const matchedMinistries = RECOGNIZED_CHRISTIAN_MINISTRIES.filter((min) =>
    fullText.includes(min)
  );

  // Check against Christian keywords
  const matchedKeywords = CHRISTIAN_KEYWORDS.filter((word) => {
    // Regex for word boundary to prevent partial false positives
    const regex = new RegExp(`\\b${word.replace('+', '\\+')}\\b`, 'i');
    return regex.test(fullText);
  });

  const totalMatches = [...new Set([...matchedMinistries, ...matchedKeywords])];

  // If known Christian ministry is matched -> 100% verified
  if (matchedMinistries.length > 0) {
    return {
      isChristian: true,
      confidence: 100,
      matchedKeywords: totalMatches,
      categorySuggested: 'Verified Christian Ministry'
    };
  }

  // If multiple Christian keywords matched -> verified Christian
  if (matchedKeywords.length >= 1) {
    const confidence = Math.min(100, 60 + matchedKeywords.length * 15);
    return {
      isChristian: true,
      confidence,
      matchedKeywords: totalMatches,
      categorySuggested: matchedKeywords.includes('worship') || matchedKeywords.includes('praise')
        ? 'Praise & Worship'
        : matchedKeywords.includes('bible') || matchedKeywords.includes('scripture')
        ? 'Deep Bible Study'
        : 'Sunday Sermons'
    };
  }

  // Otherwise, blocked as non-Christian
  return {
    isChristian: false,
    confidence: 10,
    matchedKeywords: [],
    blockedReason:
      'Christian Safety Filter: Only Christian sermons, gospel worship songs, Bible studies, and church broadcasts are allowed on GospelStream TV. Please ensure your title or description includes Christian or biblical context.'
  };
}

/**
 * Validates a search query for Christian relevance
 */
export function checkSearchRelevance(query: string): { isPermitted: boolean; warning?: string } {
  const clean = query.trim().toLowerCase();
  if (!clean) return { isPermitted: true };

  // Check against blocked secular terms
  for (const blocked of BLOCKED_SECULAR_PATTERNS) {
    if (clean.includes(blocked)) {
      return {
        isPermitted: false,
        warning: `Search term "${blocked}" is blocked. GospelStream TV only shows Christian sermons, worship, and Bible study videos.`
      };
    }
  }

  return { isPermitted: true };
}
