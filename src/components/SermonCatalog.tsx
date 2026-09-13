import React, { useState } from 'react';
import { 
  Sermon, 
  SyncState 
} from '../types';
import { 
  Search, 
  Play, 
  Heart, 
  Bookmark, 
  DownloadCloud, 
  Check, 
  BookOpen, 
  Clock, 
  Sparkles, 
  Flame, 
  Filter, 
  Film,
  Tag,
  Youtube
} from 'lucide-react';

interface SermonCatalogProps {
  sermons: Sermon[];
  onSelectSermon: (sermon: Sermon) => void;
  syncState: SyncState;
  onToggleFavorite: (sermonId: string) => void;
  onToggleWatchLater: (sermonId: string) => void;
  onDownloadSermon: (sermonId: string, quality: '1080p' | '720p' | 'Audio Only', sizeMb: number) => void;
}

export const SermonCatalog: React.FC<SermonCatalogProps> = ({
  sermons,
  onSelectSermon,
  syncState,
  onToggleFavorite,
  onToggleWatchLater,
  onDownloadSermon,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [broadcastFilter, setBroadcastFilter] = useState<'all' | 'live' | 'recorded'>('all');

  const categories = [
    'All',
    'Online YouTube',
    'Sunday Sermons',
    'Faith & Healing',
    'Walking in the Spirit',
    'Family & Marriage',
    'Prayer & Fasting',
    'Deep Bible Study',
    'Worship Nights',
    'Documentaries',
  ];

  const liveCount = sermons.filter((s) => s.isLive).length;
  const recordedCount = sermons.filter((s) => !s.isLive).length;

  const filteredSermons = sermons.filter((sermon) => {
    // Broadcast status filter (live vs recorded on YouTube)
    if (broadcastFilter === 'live' && !sermon.isLive) return false;
    if (broadcastFilter === 'recorded' && sermon.isLive) return false;

    const matchesCategory =
      selectedCategory === 'All' ||
      (selectedCategory === 'Online YouTube' ? Boolean(sermon.isOnlineVideo || sermon.youtubeId) : sermon.category === selectedCategory);
    const query = searchQuery.toLowerCase().trim();
    if (!query) return matchesCategory;

    const matchesTitle = sermon.title.toLowerCase().includes(query);
    const matchesPreacher = sermon.preacher.toLowerCase().includes(query);
    const matchesScripture = sermon.scripture.toLowerCase().includes(query);
    const matchesTags = sermon.tags.some((t) => t.toLowerCase().includes(query));
    const matchesSeries = sermon.series?.toLowerCase().includes(query) || false;

    return matchesCategory && (matchesTitle || matchesPreacher || matchesScripture || matchesTags || matchesSeries);
  });

  const featuredSermon = sermons[0];

  return (
    <div id="sermon-catalog-view" className="w-full space-y-8">
      {/* Search & Filter Bar */}
      <div className="space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1 max-w-xl">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search sermons by title, scripture (e.g. Romans 8), preacher, or topic..."
              className="w-full rounded-2xl bg-slate-900/90 pl-10 pr-4 py-2.5 text-xs sm:text-sm text-slate-200 placeholder-slate-500 border border-slate-800 focus:border-blue-500 focus:outline-none transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500 hover:text-slate-300"
              >
                Clear
              </button>
            )}
          </div>

          {/* Broadcast Status Toggle (All vs Live on YouTube vs Recorded) */}
          <div className="flex items-center gap-1.5 rounded-2xl bg-slate-900/90 p-1 border border-slate-800">
            <button
              onClick={() => setBroadcastFilter('all')}
              className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
                broadcastFilter === 'all'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              All Content ({sermons.length})
            </button>
            <button
              onClick={() => setBroadcastFilter('live')}
              className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
                broadcastFilter === 'live'
                  ? 'bg-red-600 text-white shadow-sm animate-pulse'
                  : 'text-slate-400 hover:text-red-400'
              }`}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-red-400 animate-ping" />
              <span>Live on YouTube ({liveCount})</span>
            </button>
            <button
              onClick={() => setBroadcastFilter('recorded')}
              className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
                broadcastFilter === 'recorded'
                  ? 'bg-slate-700 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Film className="h-3 w-3 text-blue-400" />
              <span>Recorded & Uploaded ({recordedCount})</span>
            </button>
          </div>
        </div>

        {/* Results Counter */}
        <div className="flex items-center justify-between text-xs text-slate-400 px-1 font-mono">
          <span>Showing {filteredSermons.length} sermons</span>
          <span>{liveCount} Live Streams • {recordedCount} Recorded Videos</span>
        </div>
      </div>

      {/* Category Pills Shelf */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 shelf-scroll">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`rounded-xl px-3.5 py-2 text-xs font-semibold whitespace-nowrap transition ${
              selectedCategory === cat
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-slate-800'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Featured Banner (Shown when no search filter is active) */}
      {!searchQuery && selectedCategory === 'All' && featuredSermon && (
        <div 
          className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-950 via-slate-900 to-blue-950/70 border border-slate-800 shadow-2xl p-6 sm:p-8"
        >
          <div className="relative z-10 max-w-2xl space-y-4">
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1 rounded-lg bg-amber-500/20 px-2.5 py-1 text-[11px] font-bold text-amber-300 border border-amber-500/30">
                <Sparkles className="h-3.5 w-3.5" />
                Featured Sermon of the Week
              </span>
              <span className="text-xs font-mono text-slate-400">
                {featuredSermon.durationFormatted}
              </span>
            </div>

            <h2 className="font-display text-2xl sm:text-4xl font-bold tracking-tight text-white">
              {featuredSermon.title}
            </h2>

            <p className="text-xs sm:text-sm text-slate-300 line-clamp-2 leading-relaxed">
              {featuredSermon.description}
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => onSelectSermon(featuredSermon)}
                className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 px-5 py-3 text-xs sm:text-sm font-bold text-white shadow-lg shadow-blue-600/30 transition active:scale-95"
              >
                <Play className="h-4 w-4 fill-current" />
                <span>Watch Message Now</span>
              </button>

              <button
                onClick={() => onToggleFavorite(featuredSermon.id)}
                className={`flex items-center gap-2 rounded-2xl px-4 py-3 text-xs sm:text-sm font-semibold backdrop-blur-md transition border ${
                  syncState.favorites.includes(featuredSermon.id)
                    ? 'bg-red-500/20 text-red-300 border-red-500/40'
                    : 'bg-slate-900/80 text-slate-300 border-slate-700 hover:bg-slate-800'
                }`}
              >
                <Heart className={`h-4 w-4 ${syncState.favorites.includes(featuredSermon.id) ? 'fill-current' : ''}`} />
                <span>{syncState.favorites.includes(featuredSermon.id) ? 'Favorited' : 'Favorite'}</span>
              </button>

              <button
                onClick={() => onToggleWatchLater(featuredSermon.id)}
                className={`flex items-center gap-2 rounded-2xl px-4 py-3 text-xs sm:text-sm font-semibold backdrop-blur-md transition border ${
                  syncState.watchLater.includes(featuredSermon.id)
                    ? 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                    : 'bg-slate-900/80 text-slate-300 border-slate-700 hover:bg-slate-800'
                }`}
              >
                <Bookmark className={`h-4 w-4 ${syncState.watchLater.includes(featuredSermon.id) ? 'fill-current' : ''}`} />
                <span>{syncState.watchLater.includes(featuredSermon.id) ? 'Saved for Later' : 'Watch Later'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sermons Grid */}
      <div className="space-y-4">
        <h3 className="font-display text-lg font-bold text-white tracking-tight flex items-center gap-2">
          <Film className="h-4 w-4 text-blue-400" />
          <span>{selectedCategory === 'All' ? 'All Messages & Teachings' : selectedCategory}</span>
        </h3>

        {filteredSermons.length === 0 ? (
          <div className="rounded-3xl bg-slate-900/40 p-12 text-center border border-slate-850">
            <BookOpen className="h-10 w-10 text-slate-600 mx-auto mb-3" />
            <h4 className="text-base font-bold text-slate-300">No Sermons Found</h4>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Try searching with another keyword like "grace", "faith", "prayer", or select another category.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {filteredSermons.map((sermon) => {
              const isFavorite = syncState.favorites.includes(sermon.id);
              const isWatchLater = syncState.watchLater.includes(sermon.id);
              const isDownloaded = syncState.downloadedSermons.some((d) => d.sermonId === sermon.id);
              const continueItem = syncState.continueWatching.find((c) => c.sermonId === sermon.id);

              return (
                <div
                  key={sermon.id}
                  className="group relative flex flex-col overflow-hidden rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-blue-500/50 transition-all duration-200 hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-500/10"
                >
                  {/* Thumbnail */}
                  <div 
                    onClick={() => onSelectSermon(sermon)}
                    className="relative aspect-video w-full overflow-hidden bg-slate-950 cursor-pointer"
                  >
                    <img
                      src={sermon.thumbnailUrl}
                      alt={sermon.title}
                      referrerPolicy="no-referrer"
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />

                    {/* Duration or LIVE Badge */}
                    <div className={`absolute bottom-2.5 right-2.5 rounded-lg px-2 py-0.5 text-[11px] font-mono font-semibold backdrop-blur-sm ${
                      sermon.isLive ? 'bg-red-600 text-white font-bold animate-pulse' : 'bg-black/80 text-slate-200'
                    }`}>
                      {sermon.isLive ? 'LIVE' : sermon.durationFormatted}
                    </div>

                    {/* Downloaded Badge */}
                    {isDownloaded && (
                      <div className="absolute top-2.5 left-2.5 rounded-lg bg-emerald-600/90 px-2 py-0.5 text-[10px] font-bold text-white flex items-center gap-1 shadow">
                        <Check className="h-3 w-3" />
                        <span>Offline Ready</span>
                      </div>
                    )}

                    {/* Live vs Recorded Status Badge */}
                    {sermon.isLive ? (
                      <div className="absolute top-2.5 right-2.5 rounded-lg bg-red-600 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-white flex items-center gap-1 shadow animate-pulse">
                        <span className="h-1.5 w-1.5 rounded-full bg-white animate-ping" />
                        <span>LIVE NOW</span>
                      </div>
                    ) : (
                      <div className="absolute top-2.5 right-2.5 rounded-lg bg-slate-900/90 border border-slate-700 px-2 py-0.5 text-[10px] font-semibold text-slate-300 flex items-center gap-1 shadow">
                        <Film className="h-3 w-3 text-blue-400" />
                        <span>RECORDED</span>
                      </div>
                    )}

                    {/* Play Hover Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-white shadow-xl scale-90 group-hover:scale-100 transition-transform">
                        <Play className="h-6 w-6 fill-current ml-0.5" />
                      </div>
                    </div>

                    {/* Progress Bar for Continued Watching */}
                    {continueItem && continueItem.progressSeconds > 0 && (
                      <div className="absolute bottom-0 inset-x-0 h-1 bg-slate-800">
                        <div 
                          className="h-full bg-blue-500"
                          style={{
                            width: `${Math.min(100, (continueItem.progressSeconds / continueItem.totalSeconds) * 100)}%`,
                          }}
                        />
                      </div>
                    )}
                  </div>

                  {/* Body Content */}
                  <div className="flex flex-1 flex-col p-4 space-y-2">
                    <div className="flex items-center justify-between gap-1 text-[11px] font-mono text-amber-400">
                      <span>📖 {sermon.scripture}</span>
                      <span className="text-slate-500">{sermon.date}</span>
                    </div>

                    <h4 
                      onClick={() => onSelectSermon(sermon)}
                      className="cursor-pointer text-sm font-bold text-white group-hover:text-blue-300 transition line-clamp-2"
                    >
                      {sermon.title}
                    </h4>

                    <p className="text-xs text-slate-400 line-clamp-1">
                      {sermon.preacher} • <span className="text-slate-500">{sermon.ministry}</span>
                    </p>

                    {/* Action Bar */}
                    <div className="mt-auto flex items-center justify-between border-t border-slate-800/80 pt-3">
                      <button
                        onClick={() => onSelectSermon(sermon)}
                        className="text-xs font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1"
                      >
                        <Play className="h-3 w-3 fill-current" />
                        <span>Watch</span>
                      </button>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => onToggleFavorite(sermon.id)}
                          className={`rounded-lg p-1.5 transition ${
                            isFavorite ? 'text-red-400 bg-red-500/10' : 'text-slate-400 hover:text-white hover:bg-slate-800'
                          }`}
                          title="Save to Favorites"
                        >
                          <Heart className={`h-4 w-4 ${isFavorite ? 'fill-current' : ''}`} />
                        </button>

                        <button
                          onClick={() => onToggleWatchLater(sermon.id)}
                          className={`rounded-lg p-1.5 transition ${
                            isWatchLater ? 'text-blue-400 bg-blue-500/10' : 'text-slate-400 hover:text-white hover:bg-slate-800'
                          }`}
                          title="Save to Watch Later"
                        >
                          <Bookmark className={`h-4 w-4 ${isWatchLater ? 'fill-current' : ''}`} />
                        </button>

                        {!isDownloaded && (
                          <button
                            onClick={() => onDownloadSermon(sermon.id, '1080p', sermon.downloadSizeMb)}
                            className="rounded-lg p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 transition"
                            title="Download for Offline Playback"
                          >
                            <DownloadCloud className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
