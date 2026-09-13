export interface Program {
  id: string;
  title: string;
  speaker: string;
  scriptureRef?: string;
  startTimeFormatted: string;
  endTimeFormatted: string;
  startMinutes: number; // minutes from midnight or relative
  endMinutes: number;
  durationMinutes: number;
  description: string;
  isLive: boolean;
  category: string;
}

export interface Channel {
  id: string;
  number: number;
  name: string;
  tagline: string;
  badge: string;
  logoColor: string;
  currentProgram: Program;
  upcomingPrograms: Program[];
  streamUrl: string;
  youtubeId?: string;
  category: string;
}

export interface ScripturePassage {
  reference: string;
  text: string;
  translation: string;
}

export interface Chapter {
  title: string;
  time: number; // in seconds
}

export interface Sermon {
  id: string;
  title: string;
  preacher: string;
  ministry: string;
  scripture: string;
  scriptureText: string;
  duration: number; // seconds
  durationFormatted: string;
  thumbnailUrl: string;
  videoUrl: string;
  youtubeId?: string;
  isOnlineVideo?: boolean;
  sourceType?: 'youtube' | 'direct' | 'livestream';
  isLive?: boolean; // TRUE if video is live on YouTube, FALSE if recorded/uploaded
  verifiedChristian?: boolean;
  category: 'Sunday Sermons' | 'Faith & Healing' | 'Walking in the Spirit' | 'Family & Marriage' | 'Prayer & Fasting' | 'Deep Bible Study' | 'Worship Nights' | 'Documentaries' | string;
  series?: string;
  date: string;
  description: string;
  chapters: Chapter[];
  biblePassages: ScripturePassage[];
  keyPoints: string[];
  downloadSizeMb: number;
  tags: string[];
  viewsCount: string;
}

export interface LiveEvent {
  id: string;
  title: string;
  speaker: string;
  ministry: string;
  startTime: string; // ISO or relative
  formattedDate: string;
  formattedTime: string;
  channelId: string;
  channelName: string;
  description: string;
  thumbnail: string;
  scriptureTheme: string;
  badgeText: string;
}

export interface SermonNote {
  id: string;
  sermonId: string;
  sermonTitle: string;
  timestamp: number; // seconds into video
  content: string;
  createdAt: string;
}

export interface ContinueWatchingItem {
  sermonId: string;
  progressSeconds: number;
  totalSeconds: number;
  lastWatched: string;
}

export interface DownloadedItem {
  sermonId: string;
  downloadedAt: string;
  quality: '1080p' | '720p' | 'Audio Only';
  sizeMb: number;
  sourceUrl?: string;
  storageKey?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  avatarColor: string;
  role: string;
}

export interface SyncState {
  syncCode: string;
  lastSynced: string;
  deviceName: string;
  currentProfileId: string;
  profiles: UserProfile[];
  favorites: string[]; // sermon IDs
  watchLater: string[]; // sermon IDs
  continueWatching: ContinueWatchingItem[];
  reminders: string[]; // event IDs
  notes: SermonNote[];
  downloadedSermons: DownloadedItem[];
  fontSize: 'normal' | 'large' | 'extra-large';
  closedCaptionsEnabled: boolean;
}

export type DeviceMode = 'smart-tv' | 'tablet' | 'mobile' | 'desktop';
export type AppTab = 'live-tv' | 'online-videos' | 'guide' | 'sermons' | 'library' | 'events' | 'downloads' | 'sync';
