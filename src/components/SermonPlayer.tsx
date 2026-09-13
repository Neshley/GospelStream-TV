import React, { useState, useRef, useEffect } from 'react';
import { 
  Sermon, 
  SyncState, 
  SermonNote 
} from '../types';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize, 
  Bookmark, 
  Heart, 
  DownloadCloud, 
  Check, 
  BookOpen, 
  FileText, 
  ListOrdered, 
  Cast, 
  X, 
  Share2, 
  RotateCcw, 
  ChevronRight, 
  Clock, 
  Plus, 
  Trash2,
  Headphones,
  RefreshCw,
  Youtube,
  ShieldCheck,
  ExternalLink,
  Film
} from 'lucide-react';
import { extractYouTubeId, getYouTubeEmbedUrl } from '../utils/christianFilter';
import { getCachedMediaUrl } from '../services/offlineService';

interface SermonPlayerProps {
  sermon: Sermon;
  syncState: SyncState;
  onClose: () => void;
  onToggleFavorite: (sermonId: string) => void;
  onToggleWatchLater: (sermonId: string) => void;
  onSaveProgress: (sermonId: string, progressSeconds: number, totalSeconds: number) => void;
  onSaveNote: (note: { sermonId: string; sermonTitle: string; timestamp: number; content: string }) => void;
  onDeleteNote: (noteId: string) => void;
  onDownloadSermon: (sermonId: string, quality: '1080p' | '720p' | 'Audio Only', sizeMb: number) => void;
  onOpenSyncModal: () => void;
  isOfflineMode: boolean;
}

export const SermonPlayer: React.FC<SermonPlayerProps> = ({
  sermon,
  syncState,
  onClose,
  onToggleFavorite,
  onToggleWatchLater,
  onSaveProgress,
  onSaveNote,
  onDeleteNote,
  onDownloadSermon,
  onOpenSyncModal,
  isOfflineMode,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [videoSrc, setVideoSrc] = useState<string>(sermon.videoUrl);
  const [hasVideoError, setHasVideoError] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(sermon.duration || 1800);
  const [activeSideTab, setActiveSideTab] = useState<'scripture' | 'notes' | 'chapters' | 'takeaways'>('scripture');
  const [newNoteText, setNewNoteText] = useState('');
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);

  const isFavorite = syncState.favorites.includes(sermon.id);
  const isWatchLater = syncState.watchLater.includes(sermon.id);
  const isDownloaded = syncState.downloadedSermons.some((d) => d.sermonId === sermon.id);

  const youtubeVideoId = sermon.youtubeId || extractYouTubeId(sermon.videoUrl);
  const isYouTubeVideo = Boolean(youtubeVideoId);

  useEffect(() => {
    let active = true;
    setVideoSrc(sermon.videoUrl); setHasVideoError(false); setIsPlaying(true);
    if (isOfflineMode && !youtubeVideoId) getCachedMediaUrl(sermon.id).then((url) => { if (active && url) setVideoSrc(url); });
    return () => { active = false; };
  }, [sermon.id, sermon.videoUrl, isOfflineMode, youtubeVideoId]);

  // Check if there was previous continue-watching progress
  useEffect(() => {
    const saved = syncState.continueWatching.find((item) => item.sermonId === sermon.id);
    if (saved && saved.progressSeconds > 0 && videoRef.current) {
      videoRef.current.currentTime = saved.progressSeconds;
      setCurrentTime(saved.progressSeconds);
    }
  }, [sermon.id]);

  // Track progress and update continue watching
  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const current = videoRef.current.currentTime;
    setCurrentTime(current);
    const dur = videoRef.current.duration || sermon.duration;
    setDuration(dur);

    // Periodically update continue watching progress
    if (Math.floor(current) % 5 === 0) {
      onSaveProgress(sermon.id, Math.floor(current), Math.floor(dur));
    }
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play().catch(() => {});
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) {
      setIsMuted(!isMuted);
      return;
    }
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleVideoError = () => {
    setHasVideoError(true);
  };

  const handleRetryStream = () => {
    setHasVideoError(false);
    setVideoSrc(sermon.videoUrl);
    if (videoRef.current) {
      videoRef.current.load();
      videoRef.current.play().catch(() => {});
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const target = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = target;
      setCurrentTime(target);
    }
  };

  const handleSpeedChange = (speed: number) => {
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
      setPlaybackSpeed(speed);
    }
  };

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteText.trim()) return;
    onSaveNote({
      sermonId: sermon.id,
      sermonTitle: sermon.title,
      timestamp: Math.floor(currentTime),
      content: newNoteText.trim(),
    });
    setNewNoteText('');
  };

  const startDownload = (quality: '1080p' | '720p' | 'Audio Only') => {
    if (isDownloaded || isYouTubeVideo || isDownloading) return;
    setIsDownloading(true); setDownloadProgress(0);
    // The parent performs the real IndexedDB download. This component only reports UI progress.
    onDownloadSermon(sermon.id, quality, sermon.downloadSizeMb);
    setDownloadProgress(100);
    setIsDownloading(false);
  };

  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const sermonNotes = syncState.notes.filter((n) => n.sermonId === sermon.id);

  return (
    <div 
      id="sermon-player-modal"
      className="fixed inset-0 z-50 flex flex-col bg-slate-950/98 text-slate-100 overflow-y-auto animate-in fade-in duration-200"
    >
      {/* Top Bar */}
      <div className="flex items-center justify-between border-b border-slate-800 px-4 py-3 bg-slate-900/90 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 rounded-xl bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:bg-slate-700 hover:text-white transition"
          >
            <RotateCcw className="h-4 w-4" />
            <span>Return to Catalog</span>
          </button>
          <div>
            <span className="rounded bg-blue-500/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-blue-400">
              {sermon.category}
            </span>
            <h2 className="text-sm sm:text-base font-bold text-white line-clamp-1">
              {sermon.title}
            </h2>
          </div>
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onToggleFavorite(sermon.id)}
            className={`rounded-xl p-2 transition ${
              isFavorite ? 'bg-red-500/20 text-red-400' : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
            title="Save to Favorites"
          >
            <Heart className={`h-4 w-4 ${isFavorite ? 'fill-current' : ''}`} />
          </button>

          <button
            onClick={() => onToggleWatchLater(sermon.id)}
            className={`rounded-xl p-2 transition ${
              isWatchLater ? 'bg-blue-500/20 text-blue-400' : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
            title="Watch Later"
          >
            <Bookmark className={`h-4 w-4 ${isWatchLater ? 'fill-current' : ''}`} />
          </button>

          <button
            onClick={onOpenSyncModal}
            className="rounded-xl bg-slate-800 p-2 text-slate-300 hover:bg-slate-700 hover:text-white transition"
            title="Cast / Handoff to TV or Device"
          >
            <Cast className="h-4 w-4 text-blue-400" />
          </button>

          <button
            onClick={onClose}
            className="rounded-xl bg-slate-800 p-2 text-slate-400 hover:bg-slate-700 hover:text-white transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 p-4 sm:p-6 max-w-7xl mx-auto w-full">
        {/* Left: Video Player & Details */}
        <div className="lg:col-span-8 flex flex-col space-y-4">
          {/* Video Container */}
          <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-black border border-slate-800 shadow-2xl">
            {isYouTubeVideo ? (
              <div className="relative h-full w-full bg-black">
                <iframe
                  src={getYouTubeEmbedUrl(youtubeVideoId!, { autoplay: true, mute: false, rel: 0 })}
                  title={sermon.title}
                  className="h-full w-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
                {/* Status Watermark */}
                <div className={`absolute top-3 left-3 z-10 flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold backdrop-blur-md pointer-events-none shadow-lg ${
                  sermon.isLive
                    ? 'bg-slate-950/85 border border-red-500/50 text-red-300'
                    : 'bg-slate-950/85 border border-slate-700 text-slate-300'
                }`}>
                  {sermon.isLive ? (
                    <>
                      <span className="h-2 w-2 rounded-full bg-red-500 animate-ping" />
                      <span>🔴 LIVE ON YOUTUBE</span>
                    </>
                  ) : (
                    <>
                      <Film className="h-3.5 w-3.5 text-blue-400" />
                      <span>🎬 RECORDED MESSAGE</span>
                    </>
                  )}
                </div>
              </div>
            ) : !hasVideoError ? (
              <video
                ref={videoRef}
                key={videoSrc}
                src={videoSrc}
                autoPlay
                playsInline
                muted={isMuted}
                onError={handleVideoError}
                onTimeUpdate={handleTimeUpdate}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                className="h-full w-full object-cover"
              />
            ) : (
              /* Atmospheric Devotional Pulpit Presentation Mode if video stream fails */
              <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 p-6 text-center relative overflow-hidden">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-xl mb-3">
                  <BookOpen className="h-8 w-8" />
                </div>
                <span className="rounded-full bg-blue-500/20 px-3 py-1 text-xs font-bold text-blue-400 mb-2">
                  {sermon.category}
                </span>
                <h3 className="text-lg sm:text-xl font-bold text-white mb-1 line-clamp-1">
                  {sermon.title}
                </h3>
                <p className="text-sm text-slate-300 mb-3 font-medium">
                  {sermon.preacher} • {sermon.ministry}
                </p>
                <div className="rounded-xl bg-slate-900/80 border border-slate-800 px-4 py-2 text-xs sm:text-sm text-amber-200 mb-4 max-w-md backdrop-blur-md">
                  📖 <strong>{sermon.scripture}:</strong> "{sermon.scriptureText}"
                </div>
                <button
                  onClick={handleRetryStream}
                  className="flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-500 px-4 py-2 text-xs font-bold text-white transition shadow-lg"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  <span>Retry Media Source</span>
                </button>
              </div>
            )}

            {/* Tap to unmute pill when muted */}
            {isMuted && !hasVideoError && (
              <button
                onClick={toggleMute}
                className="absolute top-3 left-3 z-10 flex items-center gap-1.5 rounded-full bg-slate-900/80 hover:bg-slate-900 border border-white/20 px-3 py-1 text-xs font-medium text-white shadow-xl backdrop-blur-md transition active:scale-95"
              >
                <VolumeX className="h-3.5 w-3.5 text-amber-400 animate-pulse" />
                <span>Tap to Unmute</span>
              </button>
            )}

            {/* Offline Playback Banner */}
            {isOfflineMode && (
              <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5 rounded-lg bg-amber-600/90 px-2.5 py-1 text-[11px] font-bold text-white shadow backdrop-blur-sm">
                <Check className="h-3.5 w-3.5" />
                <span>Playing from Local Offline Storage</span>
              </div>
            )}
          </div>

          {/* Custom Media Controls Bar */}
          <div className="rounded-2xl bg-slate-900 p-4 border border-slate-800 space-y-3">
            {/* Scrub Slider with Time */}
            <div className="space-y-1">
              <input
                type="range"
                min={0}
                max={duration || sermon.duration}
                value={currentTime}
                onChange={handleSeek}
                className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-slate-800 accent-blue-500"
              />
              <div className="flex justify-between text-xs font-mono text-slate-400">
                <span>{formatSeconds(currentTime)}</span>
                <span>{formatSeconds(duration || sermon.duration)}</span>
              </div>
            </div>

            {/* Control buttons */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <button
                  onClick={togglePlay}
                  className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 hover:bg-blue-500 text-white shadow-lg transition active:scale-95"
                >
                  {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 fill-current ml-0.5" />}
                </button>

                <button
                  onClick={toggleMute}
                  className="rounded-xl bg-slate-800 hover:bg-slate-700 p-2.5 text-slate-300 transition"
                  title={isMuted ? 'Unmute' : 'Mute'}
                >
                  {isMuted ? <VolumeX className="h-4 w-4 text-red-400" /> : <Volume2 className="h-4 w-4 text-slate-200" />}
                </button>

                {/* Speed selector */}
                <div className="flex items-center rounded-xl bg-slate-800 p-1 text-xs">
                  {[0.75, 1, 1.25, 1.5].map((spd) => (
                    <button
                      key={spd}
                      onClick={() => handleSpeedChange(spd)}
                      className={`rounded-lg px-2 py-1 font-mono font-semibold transition ${
                        playbackSpeed === spd ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {spd}x
                    </button>
                  ))}
                </div>
              </div>

              {/* Offline media: browser-cache only for direct media sources */}
              <div className="flex items-center gap-2">
                {isYouTubeVideo ? (
                  <span className="inline-flex items-center gap-1.5 rounded-xl bg-slate-800 px-3 py-1.5 text-xs text-slate-400 border border-slate-700">
                    Offline download unavailable for YouTube videos
                  </span>
                ) : isDownloaded ? (
                  <span className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-500/20 px-3 py-1.5 text-xs font-bold text-emerald-400 border border-emerald-500/30">
                    <Check className="h-4 w-4" />
                    <span>Downloaded ({sermon.downloadSizeMb} MB)</span>
                  </span>
                ) : isDownloading ? (
                  <div className="flex items-center gap-2 rounded-xl bg-blue-500/20 px-3 py-1.5 text-xs font-bold text-blue-300 border border-blue-500/30">
                    <DownloadCloud className="h-4 w-4 animate-bounce" />
                    <span>Downloading... {downloadProgress}%</span>
                  </div>
                ) : (
                  <button
                    onClick={() => startDownload('1080p')}
                    className="flex items-center gap-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 px-3 py-1.5 text-xs font-semibold text-slate-200 border border-slate-700 transition"
                    title="Save this direct media file to this device"
                  >
                    <DownloadCloud className="h-4 w-4 text-blue-400" />
                    <span>Save Offline</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* YouTube Streaming Source Banner */}
          {isYouTubeVideo && (
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-gradient-to-r from-red-950/40 via-slate-900 to-slate-900 border border-red-900/30 p-3.5 px-4 shadow-lg">
              <div className="flex items-center gap-2.5">
                {sermon.isLive ? (
                  <span className="flex items-center gap-1.5 rounded-lg bg-red-600 px-2.5 py-1 text-xs font-black uppercase tracking-wider text-white shadow animate-pulse">
                    <span className="h-2 w-2 rounded-full bg-white animate-ping" />
                    <span>LIVE STREAM ON YOUTUBE</span>
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 rounded-lg bg-slate-800 border border-slate-700 px-2.5 py-1 text-xs font-bold text-slate-200 shadow">
                    <Film className="h-3.5 w-3.5 text-blue-400" />
                    <span>RECORDED / UPLOADED VIDEO</span>
                  </span>
                )}
                <span className="flex items-center gap-1 text-xs text-emerald-300 font-medium">
                  <ShieldCheck className="h-4 w-4 text-emerald-400" />
                  <span>Verified Christian Content</span>
                </span>
              </div>
              <a
                href={`https://www.youtube.com/watch?v=${youtubeVideoId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 px-3 py-1.5 text-xs font-semibold text-slate-200 border border-slate-700 transition"
              >
                <span>Watch on YouTube</span>
                <ExternalLink className="h-3.5 w-3.5 text-slate-400" />
              </a>
            </div>
          )}

          {/* Sermon Title & Minister Profile */}
          <div className="rounded-2xl bg-slate-900/60 p-5 border border-slate-850 space-y-3">
            <div>
              <div className="flex items-center gap-2 text-xs font-mono text-amber-400">
                <span>{sermon.date}</span>
                <span>•</span>
                <span>{sermon.viewsCount} Views</span>
                {sermon.series && (
                  <>
                    <span>•</span>
                    <span className="text-blue-400">Series: {sermon.series}</span>
                  </>
                )}
              </div>
              <h1 className="font-display text-xl sm:text-2xl font-bold text-white tracking-tight mt-1">
                {sermon.title}
              </h1>
              <p className="text-sm font-semibold text-slate-300 mt-1">
                {sermon.preacher} <span className="text-slate-500 font-normal">({sermon.ministry})</span>
              </p>
            </div>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {sermon.description}
            </p>

            {/* Tag Pills */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {sermon.tags.map((tag) => (
                <span key={tag} className="rounded-lg bg-slate-800 px-2.5 py-1 text-[11px] font-medium text-slate-400">
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Scripture Companion, Sermon Notes & Chapters */}
        <div className="lg:col-span-4 flex flex-col space-y-4">
          {/* Side Tabs Navigation */}
          <div className="grid grid-cols-4 gap-1 rounded-2xl bg-slate-900 p-1 border border-slate-800">
            <button
              onClick={() => setActiveSideTab('scripture')}
              className={`flex flex-col items-center justify-center py-2 rounded-xl text-[11px] font-semibold transition ${
                activeSideTab === 'scripture'
                  ? 'bg-blue-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <BookOpen className="h-3.5 w-3.5 mb-0.5" />
              <span>Scripture</span>
            </button>
            <button
              onClick={() => setActiveSideTab('notes')}
              className={`flex flex-col items-center justify-center py-2 rounded-xl text-[11px] font-semibold transition ${
                activeSideTab === 'notes'
                  ? 'bg-blue-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <FileText className="h-3.5 w-3.5 mb-0.5" />
              <span>Notes ({sermonNotes.length})</span>
            </button>
            <button
              onClick={() => setActiveSideTab('chapters')}
              className={`flex flex-col items-center justify-center py-2 rounded-xl text-[11px] font-semibold transition ${
                activeSideTab === 'chapters'
                  ? 'bg-blue-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <ListOrdered className="h-3.5 w-3.5 mb-0.5" />
              <span>Chapters</span>
            </button>
            <button
              onClick={() => setActiveSideTab('takeaways')}
              className={`flex flex-col items-center justify-center py-2 rounded-xl text-[11px] font-semibold transition ${
                activeSideTab === 'takeaways'
                  ? 'bg-blue-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Clock className="h-3.5 w-3.5 mb-0.5" />
              <span>Points</span>
            </button>
          </div>

          {/* TAB 1: SCRIPTURE COMPANION */}
          {activeSideTab === 'scripture' && (
            <div className="flex-1 rounded-2xl bg-slate-900 p-4 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400">
                  Scripture Passages
                </h4>
                <span className="text-[11px] text-slate-400 font-mono">
                  {sermon.biblePassages.length} References
                </span>
              </div>

              <div className="space-y-3">
                {sermon.biblePassages.map((passage, i) => (
                  <div key={i} className="rounded-xl bg-slate-950/80 p-3.5 border border-slate-800 space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-bold text-amber-300">
                      <span>📖 {passage.reference}</span>
                      <span className="rounded bg-slate-800 px-1.5 py-0.5 text-[10px] font-mono text-slate-400">
                        {passage.translation}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-200 italic leading-relaxed">
                      "{passage.text}"
                    </p>
                  </div>
                ))}
              </div>

              <div className="rounded-xl bg-blue-950/40 p-3 border border-blue-900/30 text-xs text-blue-200">
                💡 <em>"Thy word is a lamp unto my feet, and a light unto my path." — Psalm 119:105</em>
              </div>
            </div>
          )}

          {/* TAB 2: SERMON NOTES */}
          {activeSideTab === 'notes' && (
            <div className="flex-1 rounded-2xl bg-slate-900 p-4 border border-slate-800 space-y-4 flex flex-col">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-blue-400">
                  Personal Study Reflections
                </h4>
                <span className="text-[11px] text-slate-400 font-mono">
                  At {formatSeconds(currentTime)}
                </span>
              </div>

              {/* Form to add note */}
              <form onSubmit={handleAddNote} className="space-y-2">
                <textarea
                  value={newNoteText}
                  onChange={(e) => setNewNoteText(e.target.value)}
                  placeholder={`Write your reflection at ${formatSeconds(currentTime)}...`}
                  rows={3}
                  className="w-full rounded-xl bg-slate-950 p-3 text-xs text-slate-200 placeholder-slate-500 border border-slate-800 focus:border-blue-500 focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={!newNoteText.trim()}
                  className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 py-2 text-xs font-bold text-white transition"
                >
                  <Plus className="h-4 w-4" />
                  <span>Save Reflection to Library</span>
                </button>
              </form>

              {/* List of notes for this sermon */}
              <div className="space-y-2.5 flex-1 overflow-y-auto max-h-72">
                {sermonNotes.length === 0 ? (
                  <p className="text-xs text-slate-500 text-center py-6">
                    No notes taken yet. Write your thoughts while listening to the Word!
                  </p>
                ) : (
                  sermonNotes.map((note) => (
                    <div key={note.id} className="rounded-xl bg-slate-950/90 p-3 border border-slate-850 space-y-1 relative group">
                      <div className="flex items-center justify-between">
                        <button
                          onClick={() => {
                            if (videoRef.current) {
                              videoRef.current.currentTime = note.timestamp;
                              setCurrentTime(note.timestamp);
                            }
                          }}
                          className="font-mono text-[11px] font-bold text-amber-400 hover:underline"
                        >
                          ⏱️ Jump to {formatSeconds(note.timestamp)}
                        </button>
                        <button
                          onClick={() => onDeleteNote(note.id)}
                          className="text-slate-600 hover:text-red-400 transition"
                          title="Delete Note"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <p className="text-xs text-slate-200 leading-relaxed">
                        {note.content}
                      </p>
                      <span className="text-[10px] text-slate-500 block">
                        Saved {note.createdAt}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 3: CHAPTERS */}
          {activeSideTab === 'chapters' && (
            <div className="flex-1 rounded-2xl bg-slate-900 p-4 border border-slate-800 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800 pb-2">
                Sermon Chapters
              </h4>
              <div className="space-y-2">
                {sermon.chapters.map((chap, idx) => {
                  const isCurrent = currentTime >= chap.time && (idx === sermon.chapters.length - 1 || currentTime < sermon.chapters[idx + 1].time);
                  return (
                    <button
                      key={idx}
                      onClick={() => {
                        if (videoRef.current) {
                          videoRef.current.currentTime = chap.time;
                          setCurrentTime(chap.time);
                        }
                      }}
                      className={`w-full flex items-center justify-between rounded-xl p-2.5 text-left text-xs font-semibold transition ${
                        isCurrent
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-950 hover:bg-slate-850 text-slate-300 border border-slate-850'
                      }`}
                    >
                      <span className="line-clamp-1">{chap.title}</span>
                      <span className="font-mono text-[11px] opacity-80">{formatSeconds(chap.time)}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 4: KEY TAKEAWAYS */}
          {activeSideTab === 'takeaways' && (
            <div className="flex-1 rounded-2xl bg-slate-900 p-4 border border-slate-800 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 border-b border-slate-800 pb-2">
                Core Message Takeaways
              </h4>
              <ul className="space-y-2.5 text-xs sm:text-sm text-slate-300">
                {sermon.keyPoints.map((point, index) => (
                  <li key={index} className="flex items-start gap-2 rounded-xl bg-slate-950/80 p-3 border border-slate-850">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-500/20 text-amber-300 text-[11px] font-bold">
                      {index + 1}
                    </span>
                    <span className="leading-relaxed">{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
