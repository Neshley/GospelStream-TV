export interface ChristianOnlineCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
}

export const ONLINE_CHRISTIAN_CATEGORIES: ChristianOnlineCategory[] = [
  { id: 'all', name: 'All Christian Videos', description: 'Curated Christian video library', icon: 'Sparkles' },
  { id: 'livestreams', name: 'Live Worship & Streams', description: '24/7 Gospel praise and live church broadcasts', icon: 'Radio' },
  { id: 'sermons', name: 'Pulpit Sermons', description: 'Powerful preaching from renowned biblical teachers', icon: 'BookOpen' },
  { id: 'worship', name: 'Praise & Worship', description: 'Uplifting gospel and contemporary worship music', icon: 'Music' },
  { id: 'bibleproject', name: 'BibleProject Studies', description: 'Visual theology and deep book-by-book overviews', icon: 'Layers' },
  { id: 'chosen', name: 'The Chosen & Drama', description: 'Biblical cinema, gospel narratives, and church history', icon: 'Film' },
  { id: 'prayer', name: 'Prayer & Deliverance', description: 'Intercession, fasting, and spiritual breakthrough', icon: 'Flame' },
];

