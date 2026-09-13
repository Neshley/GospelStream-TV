import React, { useState, useRef, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize, 
  Radio, 
  RotateCcw, 
  Tv, 
  List, 
  Bookmark, 
  Heart, 
  Share2, 
  Clock, 
  Sparkles, 
  ChevronRight, 
  ChevronLeft, 
  MessageSquare, 
  Headphones, 
  Layers,
  Cast,
  RefreshCw,
  Volume1,
  Youtube,
  ShieldCheck,
  Film
} from 'lucide-react';
import { Channel, Sermon } from '../types';
import { getYouTubeEmbedUrl } from '../utils/christianFilter';

interface LiveTvPlayerProps {
  currentChannel: Channel;
  channels: Channel[];
  onSelectChannel: (channel: Channel) => void;
  onOpenGuide: () => void;
  onOpenSermonModal: (sermonId: string) => void;
  isFavoriteChannel: boolean;
  onToggleFavoriteChannel: (channelId: string) => void;
  onOpenSyncModal: () => void;
  deviceMode: string;
}

export const LiveTvPlayer: React.FC<LiveTvPlayerProps> = ({
  currentChannel,
  channels,
  onSelectChannel,
  onOpenGuide,
  onOpenSermonModal,
  isFavoriteChannel,
  onToggleFavoriteChannel,
  onOpenSyncModal,
  deviceMode,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [showOsd, setShowOsd] = useState(true);
  const [showCaptions, setShowCaptions] = useState(true);
  const [isAudioOnly, setIsAudioOnly] = useState(false);
  const [channelSurfNotice, setChannelSurfNotice] = useState<string | null>(null);
  const [videoSrc, setVideoSrc] = useState<string>(currentChannel.streamUrl);
  const [hasVideoError, setHasVideoError] = useState(false);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Synchronize streamUrl when channel changes
  useEffect(() => {
    setVideoSrc(currentChannel.streamUrl);
    setHasVideoError(false);
    setIsPlaying(true);
  }, [currentChannel.id, currentChannel.streamUrl]);

  // Auto-hide TV banner after 5 seconds of inactivity
  const resetOsdTimer = () => {
    setShowOsd(true);
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    hideTimerRef.current = setTimeout(() => {
      setShowOsd(false);
    }, 5000);
  };

  useEffect(() => {
    resetOsdTimer();
    return () => {
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    };
  }, [currentChannel]);

  // Handle play/pause safely with promise catch
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

  // Handle mute
  const toggleMute = () => {
    if (!videoRef.current) {
      setIsMuted(!isMuted);
      return;
    }
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  // Handle video error with fallback stream and broadcast state
  const handleVideoError = (e: React.SyntheticEvent<HTMLVideoElement, Event>) => {
    e.preventDefault();
    setHasVideoError(true);
    setIsPlaying(false);
  };

  const handleRetryStream = () => {
    setHasVideoError(false);
    setVideoSrc(currentChannel.streamUrl);
    if (videoRef.current) {
      videoRef.current.load();
      videoRef.current.play().catch(() => {});
    }
  };

  // Handle Fullscreen
  const toggleFullscreen = () => {
    const container = document.getElementById('tv-player-container');
    if (!container) return;
    if (!document.fullscreenElement) {
      container.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  // Channel changing
  const changeChannelDelta = (delta: number) => {
    const currentIndex = channels.findIndex((c) => c.id === currentChannel.id);
    let nextIndex = currentIndex + delta;
    if (nextIndex < 0) nextIndex = channels.length - 1;
    if (nextIndex >= channels.length) nextIndex = 0;
    const nextChannel = channels[nextIndex];
    onSelectChannel(nextChannel);

    setChannelSurfNotice(`CH ${nextChannel.number} • ${nextChannel.name}`);
    setTimeout(() => setChannelSurfNotice(null), 2500);
  };

  return (
    <div 
      id="tv-player-container"
      onMouseMove={resetOsdTimer}
      onClick={resetOsdTimer}
      className={`relative w-full overflow-hidden bg-black transition-all ${
        deviceMode === 'smart-tv' 
          ? 'h-[72vh] min-h-[480px] rounded-2xl border-4 border-slate-800 shadow-2xl' 
          : 'h-[62vh] min-h-[380px] rounded-2xl border border-slate-800 shadow-xl'
      }`}
    >
      {/* Video Element or Broadcast Backdrop */}
      {currentChannel.youtubeId && !isAudioOnly ? (
        <div className="relative h-full w-full bg-black">
          <iframe
            src={getYouTubeEmbedUrl(currentChannel.youtubeId, { autoplay: true, mute: isMuted, rel: 0 })}
            title={currentChannel.name}
            className="h-full w-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
          <div className={`absolute top-4 left-4 z-20 flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold backdrop-blur-md pointer-events-none shadow-lg ${
            currentChannel.currentProgram.isLive
              ? 'bg-slate-950/85 border border-red-500/50 text-red-300'
              : 'bg-slate-950/85 border border-slate-700 text-slate-300'
          }`}>
            {currentChannel.currentProgram.isLive ? (
              <>
                <span className="h-2 w-2 rounded-full bg-red-500 animate-ping" />
                <span>🔴 YouTube Live Stream</span>
              </>
            ) : (
              <>
                <Film className="h-3.5 w-3.5 text-blue-400" />
                <span>🎬 Recorded Christian Broadcast</span>
              </>
            )}
          </div>
        </div>
      ) : !isAudioOnly && !hasVideoError ? (
        <video
          ref={videoRef}
          key={videoSrc}
          src={videoSrc}
          autoPlay
          playsInline
          muted={isMuted}
          loop
          onError={handleVideoError}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          className="h-full w-full object-cover"
        />
      ) : hasVideoError ? (
        /* Honest network-error state: never simulate live media when the stream is unavailable. */
        <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 p-6 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(59,130,246,0.15),transparent_70%)] pointer-events-none" />
          
          <div className="relative z-10 flex flex-col items-center max-w-lg">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-400 text-slate-950 shadow-xl mb-4 font-bold text-xl">
              CH {currentChannel.number}
            </div>
            {currentChannel.currentProgram.isLive ? (
              <span className="rounded-full bg-red-600/90 px-3 py-1 text-xs font-bold uppercase tracking-wider text-white mb-2 flex items-center gap-1.5 animate-pulse">
                <span className="h-2 w-2 rounded-full bg-white animate-ping" />
                Live stream unavailable
              </span>
            ) : (
              <span className="rounded-full bg-slate-800 border border-slate-700 px-3 py-1 text-xs font-bold uppercase tracking-wider text-slate-300 mb-2 flex items-center gap-1.5">
                <Film className="h-3.5 w-3.5 text-blue-400" />
                Recorded Sanctuary Broadcast
              </span>
            )}
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-1">
              {currentChannel.currentProgram.title}
            </h2>
            <p className="text-sm text-blue-300 font-medium mb-3">
              {currentChannel.currentProgram.speaker} • {currentChannel.name}
            </p>

            {currentChannel.currentProgram.scriptureRef && (
              <div className="rounded-xl bg-slate-900/80 border border-slate-800 px-4 py-2.5 text-xs sm:text-sm text-amber-200 mb-4 max-w-md backdrop-blur-md">
                📖 <strong>Scripture theme:</strong> {currentChannel.currentProgram.scriptureRef}
              </div>
            )}

            {/* Network unavailable indicator */}
            <div className="flex gap-1.5 items-end h-8 mb-5">
              <span className="w-1.5 bg-blue-500 rounded-full animate-bounce h-4" />
              <span className="w-1.5 bg-blue-400 rounded-full animate-bounce h-7" />
              <span className="w-1.5 bg-amber-400 rounded-full animate-bounce h-5" />
              <span className="w-1.5 bg-blue-500 rounded-full animate-bounce h-8" />
              <span className="w-1.5 bg-indigo-400 rounded-full animate-bounce h-6" />
              <span className="w-1.5 bg-blue-400 rounded-full animate-bounce h-3" />
            </div>

            <button
              onClick={handleRetryStream}
              className="flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-500 px-4 py-2 text-xs font-bold text-white transition shadow-lg"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Reconnect Stream</span>
            </button>
          </div>
        </div>
      ) : (
        /* Audio Only Spiritual Backdrop */
        <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-b from-slate-900 via-slate-950 to-blue-950 p-6 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-blue-600/20 text-blue-400 border border-blue-500/30 shadow-2xl mb-4 animate-pulse">
            <Headphones className="h-10 w-10" />
          </div>
          <h2 className="text-xl font-bold text-white mb-1">
            Audio Stream Active
          </h2>
          <p className="text-sm text-slate-400 max-w-md">
            The selected broadcast could not be loaded. Check your connection and try again.
          </p>
          <div className="mt-4 flex gap-1 items-end h-8">
            <span className="w-1.5 bg-blue-500 rounded-full animate-bounce h-4" />
            <span className="w-1.5 bg-blue-400 rounded-full animate-bounce h-7" />
            <span className="w-1.5 bg-blue-300 rounded-full animate-bounce h-5" />
            <span className="w-1.5 bg-blue-500 rounded-full animate-bounce h-8" />
            <span className="w-1.5 bg-blue-400 rounded-full animate-bounce h-3" />
          </div>
        </div>
      )}

      {/* Unmute prompt pill when muted */}
      {isMuted && !hasVideoError && (
        <button
          onClick={toggleMute}
          className="absolute top-4 left-4 z-20 flex items-center gap-2 rounded-full bg-slate-900/80 hover:bg-slate-900 border border-white/20 px-3.5 py-1.5 text-xs font-medium text-white shadow-xl backdrop-blur-md transition active:scale-95"
        >
          <VolumeX className="h-4 w-4 text-amber-400 animate-pulse" />
          <span>Tap to Unmute Sound</span>
        </button>
      )}

      {/* Channel Watermark / Corner Badge - Accurate YouTube Live vs Recorded Status */}
      <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
        {currentChannel.currentProgram.isLive ? (
          <span className="flex items-center gap-1.5 rounded-lg bg-red-600 px-2.5 py-1 text-[11px] font-black uppercase tracking-wider text-white shadow-lg backdrop-blur-sm animate-pulse">
            <span className="h-2 w-2 rounded-full bg-white animate-ping" />
            LIVE
          </span>
        ) : (
          <span className="flex items-center gap-1.5 rounded-lg bg-slate-800/90 border border-slate-700 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-300 shadow-lg backdrop-blur-sm">
            <Film className="h-3 w-3 text-slate-400" />
            RECORDED
          </span>
        )}
        <div className="flex items-center gap-1 rounded-lg bg-black/60 px-3 py-1 text-xs font-bold text-slate-200 backdrop-blur-md border border-white/10">
          <span className="text-amber-400 font-mono">CH {currentChannel.number}</span>
          <span className="text-slate-400 text-[10px]">|</span>
          <span className="tracking-wide">{currentChannel.currentProgram.isLive ? 'LIVE' : 'RECORDED VOD'}</span>
        </div>
      </div>

      {/* Channel Surf Flash Notification */}
      {channelSurfNotice && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 rounded-2xl bg-black/85 px-8 py-5 text-center text-white backdrop-blur-xl border border-blue-500/50 shadow-2xl animate-in zoom-in-95 duration-150">
          <Radio className="h-8 w-8 text-blue-400 mx-auto mb-2 animate-spin" />
          <div className="font-display text-2xl font-bold tracking-tight text-white">
            {channelSurfNotice}
          </div>
          <p className="text-xs text-slate-400 mt-1 font-medium">Connecting to the selected broadcast...</p>
        </div>
      )}

      {/* Closed Captions / Live Scripture Overlay */}
      {showCaptions && (
        <div className="absolute bottom-28 left-1/2 -translate-x-1/2 z-20 max-w-2xl px-4 text-center pointer-events-none">
          <div className="inline-block rounded-xl bg-black/75 px-4 py-1.5 text-xs sm:text-sm font-medium text-amber-200 shadow-xl backdrop-blur-md border border-amber-400/20">
            {currentChannel.currentProgram.scriptureRef ? (
              <span>📖 <strong className="text-white">Scripture theme:</strong> {currentChannel.currentProgram.scriptureRef}</span>
            ) : (
              <span>🕊️ Christian broadcast</span>
            )}
          </div>
        </div>
      )}

      {/* TV Channel Banner (OSD - Lower Third) */}
      <div 
        className={`absolute bottom-0 inset-x-0 z-20 bg-gradient-to-t from-black via-slate-950/90 to-transparent p-4 sm:p-6 transition-transform duration-300 ${
          showOsd ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0 pointer-events-none'
        }`}
      >
        <div className="flex flex-col gap-3">
          {/* Top Bar of Banner */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-mono text-base font-bold shadow-lg border border-white/20">
                {currentChannel.number}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm sm:text-base font-bold text-white tracking-tight">
                    {currentChannel.name}
                  </h3>
                  <button
                    onClick={() => onToggleFavoriteChannel(currentChannel.id)}
                    className="text-slate-400 hover:text-red-400 transition"
                    title="Add channel to favorites"
                  >
                    <Heart className={`h-4 w-4 ${isFavoriteChannel ? 'text-red-500 fill-current' : ''}`} />
                  </button>
                </div>
                <p className="text-xs text-slate-300 font-medium line-clamp-1">
                  {currentChannel.tagline}
                </p>
              </div>
            </div>

            {/* Quick Playback Actions */}
            <div className="flex items-center gap-2">
              <button
                id="tv-btn-play-toggle"
                onClick={togglePlay}
                className="flex items-center gap-1.5 rounded-xl bg-white/10 hover:bg-white/20 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-md transition active:scale-95"
              >
                {isPlaying ? <Pause className="h-4 w-4 text-amber-400" /> : <Play className="h-4 w-4 text-emerald-400 fill-current" />}
                <span className="hidden sm:inline">{isPlaying ? 'Pause' : 'Play'}</span>
              </button>

              <button
                id="tv-btn-mute-toggle"
                onClick={toggleMute}
                className="rounded-xl bg-white/10 hover:bg-white/20 p-2 text-white backdrop-blur-md transition active:scale-95"
                title={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted ? <VolumeX className="h-4 w-4 text-red-400" /> : <Volume2 className="h-4 w-4 text-blue-400" />}
              </button>

              <button
                id="tv-btn-captions"
                onClick={() => setShowCaptions(!showCaptions)}
                className={`rounded-xl px-2.5 py-1.5 text-xs font-semibold backdrop-blur-md transition ${
                  showCaptions ? 'bg-blue-600 text-white' : 'bg-white/10 text-slate-300 hover:bg-white/20'
                }`}
                title="Toggle Subtitles / Scripture Captions"
              >
                CC
              </button>

              <button
                id="tv-btn-audio-only"
                onClick={() => setIsAudioOnly(!isAudioOnly)}
                className={`rounded-xl px-2.5 py-1.5 text-xs font-semibold backdrop-blur-md transition ${
                  isAudioOnly ? 'bg-amber-600 text-white' : 'bg-white/10 text-slate-300 hover:bg-white/20'
                }`}
                title="Audio-Only Background Mode"
              >
                <Headphones className="h-3.5 w-3.5 inline mr-1" />
                <span className="hidden md:inline">Audio Only</span>
              </button>

              <button
                id="tv-btn-guide"
                onClick={onOpenGuide}
                className="flex items-center gap-1.5 rounded-xl bg-blue-600/30 hover:bg-blue-600/50 px-3 py-1.5 text-xs font-semibold text-blue-300 border border-blue-500/30 backdrop-blur-md transition"
              >
                <List className="h-4 w-4" />
                <span>EPG Guide</span>
              </button>

              <button
                id="tv-btn-cast"
                onClick={onOpenSyncModal}
                title="Cast / Handoff to Smart TV or Mobile"
                className="rounded-xl bg-white/10 hover:bg-white/20 p-2 text-white backdrop-blur-md transition"
              >
                <Cast className="h-4 w-4 text-blue-400" />
              </button>

              <button
                id="tv-btn-fullscreen"
                onClick={toggleFullscreen}
                className="rounded-xl bg-white/10 hover:bg-white/20 p-2 text-white backdrop-blur-md transition"
                title="Fullscreen TV Cinema Mode"
              >
                <Maximize className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Current Program Details */}
          <div className="rounded-2xl bg-slate-900/80 p-3.5 border border-slate-800/80 backdrop-blur-lg">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <span className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 ${
                    currentChannel.currentProgram.isLive
                      ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                      : 'bg-slate-700/40 text-slate-300 border border-slate-700'
                  }`}>
                    {currentChannel.currentProgram.isLive ? (
                      <>
                        <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-ping" />
                        <span>Live Stream</span>
                      </>
                    ) : (
                      <>
                        <Film className="h-3 w-3 text-slate-400" />
                        <span>Recorded / VOD</span>
                      </>
                    )}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">
                    {currentChannel.currentProgram.startTimeFormatted} - {currentChannel.currentProgram.endTimeFormatted}
                  </span>
                </div>
                <h4 className="text-sm sm:text-base font-bold text-white mt-1">
                  {currentChannel.currentProgram.title}
                </h4>
                <p className="text-xs text-slate-300">
                  By {currentChannel.currentProgram.speaker} 
                  {currentChannel.currentProgram.scriptureRef && (
                    <span className="text-amber-400 font-medium ml-2">
                      • {currentChannel.currentProgram.scriptureRef}
                    </span>
                  )}
                </p>
              </div>

              {/* Next Program Teaser */}
              {currentChannel.upcomingPrograms[0] && (
                <div className="border-t md:border-t-0 md:border-l border-slate-800 pt-2 md:pt-0 md:pl-4 text-left md:text-right">
                  <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider block">
                    Coming Up Next ({currentChannel.upcomingPrograms[0].startTimeFormatted})
                  </span>
                  <span className="text-xs font-semibold text-slate-200 line-clamp-1">
                    {currentChannel.upcomingPrograms[0].title}
                  </span>
                  <span className="text-[11px] text-slate-400 block">
                    {currentChannel.upcomingPrograms[0].speaker}
                  </span>
                </div>
              )}
            </div>

            {/* Broadcast Time Elapsed Bar */}
            <div className="mt-2.5">
              <div className="h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-blue-500 to-amber-500 rounded-full w-[45%]" />
              </div>
            </div>
          </div>

          {/* Quick TV Channel Surf Bar (101 - 106) */}
          <div className="flex items-center justify-between gap-2 overflow-x-auto pt-1">
            <button
              onClick={() => changeChannelDelta(-1)}
              className="flex items-center gap-1 rounded-xl bg-white/5 hover:bg-white/15 px-2.5 py-1.5 text-xs text-slate-300 transition"
              title="Previous Channel"
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="hidden sm:inline font-mono">CH-</span>
            </button>

            <div className="flex items-center gap-1.5 overflow-x-auto py-1">
              {channels.map((ch) => {
                const isSelected = ch.id === currentChannel.id;
                return (
                  <button
                    key={ch.id}
                    onClick={() => onSelectChannel(ch)}
                    className={`flex items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-all ${
                      isSelected
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 scale-105'
                        : 'bg-slate-900/90 text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-slate-800'
                    }`}
                  >
                    <span className="font-mono text-amber-300 text-[11px]">{ch.number}</span>
                    <span>{ch.name}</span>
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => changeChannelDelta(1)}
              className="flex items-center gap-1 rounded-xl bg-white/5 hover:bg-white/15 px-2.5 py-1.5 text-xs text-slate-300 transition"
              title="Next Channel"
            >
              <span className="hidden sm:inline font-mono">CH+</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
