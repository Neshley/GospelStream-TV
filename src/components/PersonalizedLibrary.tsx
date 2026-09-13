import React, { useState } from 'react';
import { 
  Sermon, 
  SyncState 
} from '../types';
import { 
  Bookmark, 
  Heart, 
  Clock, 
  FileText, 
  Play, 
  Trash2, 
  Sparkles, 
  Check, 
  DownloadCloud, 
  Share2, 
  RotateCcw,
  BookOpen
} from 'lucide-react';

interface PersonalizedLibraryProps {
  sermons: Sermon[];
  syncState: SyncState;
  onSelectSermon: (sermon: Sermon) => void;
  onToggleFavorite: (sermonId: string) => void;
  onToggleWatchLater: (sermonId: string) => void;
  onDeleteNote: (noteId: string) => void;
  onClearContinueWatching: (sermonId: string) => void;
}

export const PersonalizedLibrary: React.FC<PersonalizedLibraryProps> = ({
  sermons,
  syncState,
  onSelectSermon,
  onToggleFavorite,
  onToggleWatchLater,
  onDeleteNote,
  onClearContinueWatching,
}) => {
  const [activeLibraryTab, setActiveLibraryTab] = useState<'continue' | 'favorites' | 'watch-later' | 'notes'>('continue');

  const favoriteSermons = sermons.filter((s) => syncState.favorites.includes(s.id));
  const watchLaterSermons = sermons.filter((s) => syncState.watchLater.includes(s.id));

  // Map continue watching items to sermon data
  const continueWatchingItems = syncState.continueWatching
    .map((item) => {
      const sermon = sermons.find((s) => s.id === item.sermonId);
      return sermon ? { ...item, sermon } : null;
    })
    .filter(Boolean) as {
      sermonId: string;
      progressSeconds: number;
      totalSeconds: number;
      lastWatched: string;
      sermon: Sermon;
    }[];

  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const currentProfile = syncState.profiles.find((p) => p.id === syncState.currentProfileId) || syncState.profiles[0];

  return (
    <div id="personalized-library-view" className="w-full space-y-8">
      {/* Profile & Sync Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-3xl bg-slate-900/70 p-6 border border-slate-800 shadow-xl">
        <div className="flex items-center gap-4">
          <div className={`flex h-14 w-14 items-center justify-center rounded-2xl ${currentProfile.avatarColor} text-xl font-bold text-white shadow-lg`}>
            {currentProfile.name[0]}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-display text-xl font-bold text-white tracking-tight">
                {currentProfile.name}'s Personalized Library
              </h2>
              <span className="rounded-lg bg-blue-500/20 px-2 py-0.5 text-[10px] font-bold text-blue-400 border border-blue-500/30">
                Synced Across Devices
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Your saved messages, resume positions, and personal reflections sync seamlessly to your phone, tablet, and smart TV.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-slate-400 bg-slate-950/60 px-3.5 py-2 rounded-xl border border-slate-800/80">
          <span>Device Sync Code:</span>
          <span className="font-bold text-amber-400">{syncState.syncCode}</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3 overflow-x-auto">
        <button
          onClick={() => setActiveLibraryTab('continue')}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold whitespace-nowrap transition ${
            activeLibraryTab === 'continue'
              ? 'bg-blue-600 text-white shadow'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Clock className="h-4 w-4" />
          <span>Continue Watching</span>
          {continueWatchingItems.length > 0 && (
            <span className="rounded-full bg-blue-500 text-white px-1.5 py-0.2 text-[10px]">
              {continueWatchingItems.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveLibraryTab('favorites')}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold whitespace-nowrap transition ${
            activeLibraryTab === 'favorites'
              ? 'bg-blue-600 text-white shadow'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Heart className="h-4 w-4" />
          <span>Favorite Messages</span>
          {favoriteSermons.length > 0 && (
            <span className="rounded-full bg-slate-800 text-slate-300 px-1.5 py-0.2 text-[10px]">
              {favoriteSermons.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveLibraryTab('watch-later')}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold whitespace-nowrap transition ${
            activeLibraryTab === 'watch-later'
              ? 'bg-blue-600 text-white shadow'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Bookmark className="h-4 w-4" />
          <span>Watch Later Queue</span>
          {watchLaterSermons.length > 0 && (
            <span className="rounded-full bg-slate-800 text-slate-300 px-1.5 py-0.2 text-[10px]">
              {watchLaterSermons.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveLibraryTab('notes')}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold whitespace-nowrap transition ${
            activeLibraryTab === 'notes'
              ? 'bg-blue-600 text-white shadow'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <FileText className="h-4 w-4" />
          <span>Sermon Notes & Highlights</span>
          {syncState.notes.length > 0 && (
            <span className="rounded-full bg-slate-800 text-slate-300 px-1.5 py-0.2 text-[10px]">
              {syncState.notes.length}
            </span>
          )}
        </button>
      </div>

      {/* TAB 1: CONTINUE WATCHING */}
      {activeLibraryTab === 'continue' && (
        <div className="space-y-4">
          {continueWatchingItems.length === 0 ? (
            <div className="rounded-3xl bg-slate-900/40 p-12 text-center border border-slate-850">
              <Clock className="h-10 w-10 text-slate-600 mx-auto mb-3" />
              <h4 className="text-base font-bold text-slate-300">No Sermons in Progress</h4>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                When you pause any sermon, your exact timestamp will be saved here automatically so you can resume on any device.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {continueWatchingItems.map(({ sermon, progressSeconds, totalSeconds, lastWatched }) => {
                const percent = Math.min(100, Math.round((progressSeconds / totalSeconds) * 100));
                return (
                  <div
                    key={sermon.id}
                    className="group relative flex flex-col overflow-hidden rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-blue-500/50 transition-all shadow-lg"
                  >
                    <div 
                      onClick={() => onSelectSermon(sermon)}
                      className="relative aspect-video w-full overflow-hidden bg-slate-950 cursor-pointer"
                    >
                      <img
                        src={sermon.thumbnailUrl}
                        alt={sermon.title}
                        referrerPolicy="no-referrer"
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />
                      
                      {/* Play Hover Overlay */}
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-white shadow-xl">
                          <Play className="h-6 w-6 fill-current ml-0.5" />
                        </div>
                      </div>

                      {/* Progress bar */}
                      <div className="absolute bottom-0 inset-x-0 h-1.5 bg-slate-800">
                        <div 
                          className="h-full bg-blue-500" 
                          style={{ width: `${percent}%` }} 
                        />
                      </div>

                      <div className="absolute bottom-2.5 right-2.5 rounded-lg bg-black/80 px-2 py-0.5 text-[10px] font-mono font-bold text-amber-300">
                        {percent}% completed
                      </div>
                    </div>

                    <div className="flex flex-1 flex-col p-4 space-y-2">
                      <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                        <span>Left off at {formatSeconds(progressSeconds)}</span>
                        <span>{lastWatched}</span>
                      </div>

                      <h4 
                        onClick={() => onSelectSermon(sermon)}
                        className="cursor-pointer text-sm font-bold text-white group-hover:text-blue-300 transition line-clamp-1"
                      >
                        {sermon.title}
                      </h4>

                      <p className="text-xs text-slate-400">
                        {sermon.preacher}
                      </p>

                      <div className="mt-auto flex items-center justify-between border-t border-slate-800 pt-3">
                        <button
                          onClick={() => onSelectSermon(sermon)}
                          className="flex items-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 px-3.5 py-1.5 text-xs font-bold text-white transition active:scale-95"
                        >
                          <Play className="h-3.5 w-3.5 fill-current" />
                          <span>Resume ({formatSeconds(progressSeconds)})</span>
                        </button>

                        <button
                          onClick={() => onClearContinueWatching(sermon.id)}
                          className="text-xs text-slate-500 hover:text-red-400 p-1 transition"
                          title="Remove from Continue Watching"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: FAVORITES */}
      {activeLibraryTab === 'favorites' && (
        <div className="space-y-4">
          {favoriteSermons.length === 0 ? (
            <div className="rounded-3xl bg-slate-900/40 p-12 text-center border border-slate-850">
              <Heart className="h-10 w-10 text-slate-600 mx-auto mb-3" />
              <h4 className="text-base font-bold text-slate-300">No Favorite Messages Yet</h4>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Tap the heart icon on any sermon to keep it in your favorites collection for easy replay.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {favoriteSermons.map((sermon) => (
                <div
                  key={sermon.id}
                  className="group relative flex flex-col overflow-hidden rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-blue-500/50 transition-all shadow-lg"
                >
                  <div 
                    onClick={() => onSelectSermon(sermon)}
                    className="relative aspect-video w-full overflow-hidden bg-slate-950 cursor-pointer"
                  >
                    <img
                      src={sermon.thumbnailUrl}
                      alt={sermon.title}
                      referrerPolicy="no-referrer"
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute bottom-2.5 right-2.5 rounded-lg bg-black/80 px-2 py-0.5 text-[11px] font-mono font-semibold text-slate-200">
                      {sermon.durationFormatted}
                    </div>
                  </div>

                  <div className="flex flex-1 flex-col p-4 space-y-2">
                    <span className="text-[11px] font-mono text-amber-400">📖 {sermon.scripture}</span>
                    <h4 
                      onClick={() => onSelectSermon(sermon)}
                      className="cursor-pointer text-sm font-bold text-white group-hover:text-blue-300 transition line-clamp-1"
                    >
                      {sermon.title}
                    </h4>
                    <p className="text-xs text-slate-400">{sermon.preacher}</p>

                    <div className="mt-auto flex items-center justify-between border-t border-slate-800 pt-3">
                      <button
                        onClick={() => onSelectSermon(sermon)}
                        className="text-xs font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1"
                      >
                        <Play className="h-3 w-3 fill-current" />
                        <span>Watch</span>
                      </button>

                      <button
                        onClick={() => onToggleFavorite(sermon.id)}
                        className="text-red-400 hover:text-red-300 p-1 transition"
                        title="Remove from Favorites"
                      >
                        <Heart className="h-4 w-4 fill-current" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: WATCH LATER QUEUE */}
      {activeLibraryTab === 'watch-later' && (
        <div className="space-y-4">
          {watchLaterSermons.length === 0 ? (
            <div className="rounded-3xl bg-slate-900/40 p-12 text-center border border-slate-850">
              <Bookmark className="h-10 w-10 text-slate-600 mx-auto mb-3" />
              <h4 className="text-base font-bold text-slate-300">Watch Later Queue is Empty</h4>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Bookmark sermons you discover to build your personal queue for weekend study or evening family devotion.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {watchLaterSermons.map((sermon) => (
                <div
                  key={sermon.id}
                  className="group relative flex flex-col overflow-hidden rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-blue-500/50 transition-all shadow-lg"
                >
                  <div 
                    onClick={() => onSelectSermon(sermon)}
                    className="relative aspect-video w-full overflow-hidden bg-slate-950 cursor-pointer"
                  >
                    <img
                      src={sermon.thumbnailUrl}
                      alt={sermon.title}
                      referrerPolicy="no-referrer"
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute bottom-2.5 right-2.5 rounded-lg bg-black/80 px-2 py-0.5 text-[11px] font-mono font-semibold text-slate-200">
                      {sermon.durationFormatted}
                    </div>
                  </div>

                  <div className="flex flex-1 flex-col p-4 space-y-2">
                    <span className="text-[11px] font-mono text-amber-400">📖 {sermon.scripture}</span>
                    <h4 
                      onClick={() => onSelectSermon(sermon)}
                      className="cursor-pointer text-sm font-bold text-white group-hover:text-blue-300 transition line-clamp-1"
                    >
                      {sermon.title}
                    </h4>
                    <p className="text-xs text-slate-400">{sermon.preacher}</p>

                    <div className="mt-auto flex items-center justify-between border-t border-slate-800 pt-3">
                      <button
                        onClick={() => onSelectSermon(sermon)}
                        className="text-xs font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1"
                      >
                        <Play className="h-3 w-3 fill-current" />
                        <span>Watch Now</span>
                      </button>

                      <button
                        onClick={() => onToggleWatchLater(sermon.id)}
                        className="text-blue-400 hover:text-blue-300 p-1 transition"
                        title="Remove from Watch Later"
                      >
                        <Bookmark className="h-4 w-4 fill-current" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: SERMON NOTES & REFLECTIONS */}
      {activeLibraryTab === 'notes' && (
        <div className="space-y-4">
          {syncState.notes.length === 0 ? (
            <div className="rounded-3xl bg-slate-900/40 p-12 text-center border border-slate-850">
              <FileText className="h-10 w-10 text-slate-600 mx-auto mb-3" />
              <h4 className="text-base font-bold text-slate-300">No Sermon Notes Yet</h4>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                While watching any sermon, open the "Notes" tab to write timestamped reflections that sync across all your devices.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {syncState.notes.map((note) => {
                const matchedSermon = sermons.find((s) => s.id === note.sermonId);
                return (
                  <div
                    key={note.id}
                    className="rounded-2xl bg-slate-900/90 p-5 border border-slate-800 shadow-md space-y-3 relative group"
                  >
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                      <div>
                        <h4 className="text-sm font-bold text-white line-clamp-1">
                          {note.sermonTitle}
                        </h4>
                        <span className="text-[11px] text-slate-500 font-mono">
                          Saved on {note.createdAt}
                        </span>
                      </div>

                      <button
                        onClick={() => onDeleteNote(note.id)}
                        className="text-slate-600 hover:text-red-400 p-1 transition"
                        title="Delete Note"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed italic">
                      "{note.content}"
                    </p>

                    {matchedSermon && (
                      <div className="pt-2 flex items-center justify-between">
                        <button
                          onClick={() => onSelectSermon(matchedSermon)}
                          className="font-mono text-xs font-semibold text-amber-400 hover:underline flex items-center gap-1"
                        >
                          <Play className="h-3 w-3 fill-current" />
                          <span>Jump to Timestamp ({formatSeconds(note.timestamp)})</span>
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
