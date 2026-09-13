import { Sermon, Channel } from '../types';

export interface YouTubeFetchOptions {
  query?: string;
  filter?: 'all' | 'live' | 'recorded';
  category?: string;
  liveOnly?: boolean;
}

export interface YouTubeFetchResult {
  videos: Sermon[];
  liveCount: number;
  recordedCount: number;
  total: number;
}

/**
 * Fetch real Christian videos directly from YouTube via the server-side API.
 * Accurately determines if each video is LIVE on YouTube or a recorded video.
 */
export async function fetchChristianYouTubeVideos(
  options: YouTubeFetchOptions = {}
): Promise<YouTubeFetchResult> {
  const {
    query = 'Christian worship sermon live',
    filter = 'all',
    category = 'All',
    liveOnly = false,
  } = options;

  try {
    const params = new URLSearchParams();
    if (query) params.append('q', query);
    if (filter) params.append('filter', filter);
    if (category && category !== 'All') params.append('category', category);
    if (liveOnly) params.append('liveOnly', 'true');

    const res = await fetch(`/api/youtube/christian?${params.toString()}`);
    if (!res.ok) {
      throw new Error(`API error: ${res.statusText}`);
    }

    const data = await res.json();
    if (!data.success || !Array.isArray(data.videos)) {
      return { videos: [], liveCount: 0, recordedCount: 0, total: 0 };
    }

    return {
      videos: data.videos,
      liveCount: data.liveCount || 0,
      recordedCount: data.recordedCount || 0,
      total: data.total || 0,
    };
  } catch (err) {
    console.warn('Could not fetch YouTube videos from API:', err);
    return { videos: [], liveCount: 0, recordedCount: 0, total: 0 };
  }
}

/**
 * Fetch dynamic Christian Live TV channels generated directly from YouTube
 * (combines live broadcasts and ministry feeds).
 */
export async function fetchLiveYouTubeChannels(): Promise<Channel[]> {
  try {
    const res = await fetch('/api/youtube/channels');
    if (!res.ok) {
      throw new Error(`API error: ${res.statusText}`);
    }
    const data = await res.json();
    if (data.success && Array.isArray(data.channels) && data.channels.length > 0) {
      return data.channels;
    }
    return [];
  } catch (err) {
    console.warn('Could not fetch YouTube channels from API:', err);
    return [];
  }
}

/**
 * Checks in real time whether a specific YouTube video ID is currently LIVE or recorded.
 */
export async function checkYouTubeVideoStatus(videoId: string): Promise<{
  isLive: boolean;
  status: 'LIVE' | 'RECORDED';
  title: string;
  author: string;
  available: boolean;
}> {
  try {
    const res = await fetch(`/api/youtube/status/${videoId}`);
    if (!res.ok) {
      return { isLive: false, status: 'RECORDED', title: '', author: '', available: false };
    }
    const data = await res.json();
    return {
      isLive: Boolean(data.isLive),
      status: data.isLive ? 'LIVE' : 'RECORDED',
      title: data.title || '',
      author: data.author || '',
      available: Boolean(data.success),
    };
  } catch {
    return { isLive: false, status: 'RECORDED', title: '', author: '', available: false };
  }
}
