import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { 
  Youtube, 
  Search, 
  ShieldCheck, 
  ShieldAlert, 
  Play, 
  PlusCircle, 
  Filter, 
  BookOpen, 
  Radio, 
  Bookmark, 
  Clock, 
  ExternalLink, 
  Sparkles, 
  Check, 
  Flame, 
  Info,
  X,
  Layers,
  Music,
  Film,
  Loader2,
  ChevronDown,
  Tv,
  RefreshCw,
  Eye
} from 'lucide-react';
import { Sermon, SyncState } from '../types';
import { 
  ONLINE_CHRISTIAN_CATEGORIES 
} from '../data/christianOnlineData';
import { 
  extractYouTubeId, 
  verifyChristianContent, 
  checkSearchRelevance,
  getYouTubeThumbnail 
} from '../utils/christianFilter';
import { 
  fetchChristianYouTubeVideos, 
  checkYouTubeVideoStatus 
} from '../services/youtubeService';

interface OnlineChristianVideosProps {
  onSelectVideo: (sermon: Sermon) => void;
  syncState: SyncState;
  onToggleFavorite: (sermonId: string) => void;
  onToggleWatchLater: (sermonId: string) => void;
  onAddCustomChristianVideo?: (video: Sermon) => void;
}

const DISCOVERY_TOPICS = [
  'Christian worship live stream',
  'Christian sermon Bible study',
  'gospel preaching live',
  'Christian prayer worship',
  'Bible teaching Christian ministry',
];

export const OnlineChristianVideos: React.FC<OnlineChristianVideosProps> = ({
  onSelectVideo,
  syncState,
  onToggleFavorite,
  onToggleWatchLater,
  onAddCustomChristianVideo,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [liveFilter, setLiveFilter] = useState<'all' | 'live' | 'recorded'>('all');
  
  // Real YouTube dynamic videos
  const [youtubeVideos, setYoutubeVideos] = useState<Sermon[]>([]);
  const [isInitialLoading, setIsInitialLoading] = useState<boolean>(true);
  const [isFetchingMore, setIsFetchingMore] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [topicIndex, setTopicIndex] = useState<number>(0);
  
  // Modals state
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [showFilterInfoModal, setShowFilterInfoModal] = useState(false);
  
  // Custom video import form state
  const [inputUrl, setInputUrl] = useState('');
  const [inputTitle, setInputTitle] = useState('');
  const [inputMinistry, setInputMinistry] = useState('');
  const [inputCategory, setInputCategory] = useState<'Sunday Sermons' | 'Faith & Healing' | 'Walking in the Spirit' | 'Family & Marriage' | 'Prayer & Fasting' | 'Deep Bible Study' | 'Worship Nights' | 'Documentaries'>('Sunday Sermons');
  const [inputScripture, setInputScripture] = useState('');
  const [importStatusMessage, setImportStatusMessage] = useState<{ text: string; isError: boolean } | null>(null);
  const [isCheckingCustomUrl, setIsCheckingCustomUrl] = useState(false);

  // Pagination / Visible count for smooth infinite display
  const [visibleCount, setVisibleCount] = useState<number>(12);
  const loadMoreSentinelRef = useRef<HTMLDivElement | null>(null);

  // Initial load directly from real YouTube API
  const loadInitialVideos = useCallback(async () => {
    setIsInitialLoading(true);
    try {
      const res = await fetchChristianYouTubeVideos({
        query: 'Christian worship sermon live Bible',
        filter: 'all',
      });
      if (res.videos.length > 0) {
        setYoutubeVideos(res.videos);
      }
    } catch (err) {
      console.warn('Initial YouTube fetch error:', err);
    } finally {
      setIsInitialLoading(false);
    }
  }, []);

  useEffect(() => {
    loadInitialVideos();
  }, [loadInitialVideos]);

  // Debounced search directly to YouTube when user enters search term
  useEffect(() => {
    if (!searchQuery.trim()) return;

    const timer = setTimeout(async () => {
      setIsFetchingMore(true);
      try {
        const res = await fetchChristianYouTubeVideos({
          query: searchQuery,
          filter: liveFilter,
        });
        if (res.videos.length > 0) {
          // Prepend or replace search results
          setYoutubeVideos((prev) => {
            const newMap = new Map<string, Sermon>();
            res.videos.forEach((v) => newMap.set(v.id, v));
            prev.forEach((v) => {
              if (!newMap.has(v.id)) newMap.set(v.id, v);
            });
            return Array.from(newMap.values());
          });
          setVisibleCount(12);
        }
      } catch (err) {
        console.warn('Search YouTube error:', err);
      } finally {
        setIsFetchingMore(false);
      }
    }, 450);

    return () => clearTimeout(timer);
  }, [searchQuery, liveFilter]);

  // Refresh feeds directly from YouTube
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const res = await fetchChristianYouTubeVideos({
        query: searchQuery || 'Christian worship sermon live',
        filter: liveFilter,
      });
      if (res.videos.length > 0) {
        setYoutubeVideos(res.videos);
      }
    } catch (err) {
      console.warn('Error refreshing feeds:', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Continuous discovery with NO LIMIT directly from YouTube
  const handleFetchMoreFromYouTube = async () => {
    if (isFetchingMore) return;
    setIsFetchingMore(true);
    try {
      const nextTopic = DISCOVERY_TOPICS[topicIndex % DISCOVERY_TOPICS.length];
      setTopicIndex((prev) => prev + 1);

      const res = await fetchChristianYouTubeVideos({
        query: nextTopic,
        filter: liveFilter,
      });

      if (res.videos.length > 0) {
        setYoutubeVideos((prev) => {
          const map = new Map<string, Sermon>();
          prev.forEach((v) => map.set(v.id, v));
          res.videos.forEach((v) => map.set(v.id, v));
          return Array.from(map.values());
        });
        setVisibleCount((prev) => prev + 8);
      }
    } catch (err) {
      console.warn('Fetch more YouTube error:', err);
    } finally {
      setIsFetchingMore(false);
    }
  };

  // Search relevance check (guards against inappropriate or secular queries)
  const searchRelevance = useMemo(() => {
    return checkSearchRelevance(searchQuery);
  }, [searchQuery]);

  // Live count and recorded count calculation
  const liveCount = useMemo(() => {
    return youtubeVideos.filter((v) => v.isLive).length;
  }, [youtubeVideos]);

  const recordedCount = useMemo(() => {
    return youtubeVideos.filter((v) => !v.isLive).length;
  }, [youtubeVideos]);

  // Filtered video list based on Live/Recorded filter, Category, and Search
  const filteredVideos = useMemo(() => {
    if (!searchRelevance.isPermitted) {
      return [];
    }

    return youtubeVideos.filter((video) => {
      // 1. Strict Live vs Recorded Filter
      if (liveFilter === 'live' && !video.isLive) return false;
      if (liveFilter === 'recorded' && video.isLive) return false;

      // 2. Category filter
      if (selectedCategory !== 'all') {
        if (selectedCategory === 'livestreams' && !video.isLive) return false;
        if (selectedCategory === 'sermons' && video.category !== 'Sunday Sermons' && video.category !== 'Faith & Healing') return false;
        if (selectedCategory === 'worship' && video.category !== 'Worship Nights') return false;
        if (selectedCategory === 'bibleproject' && !video.ministry.toLowerCase().includes('bibleproject') && !video.title.toLowerCase().includes('bible')) return false;
        if (selectedCategory === 'chosen' && !video.title.toLowerCase().includes('chosen') && video.category !== 'Documentaries') return false;
        if (selectedCategory === 'prayer' && video.category !== 'Prayer & Fasting' && video.category !== 'Walking in the Spirit') return false;
      }

      // 3. Text search
      if (!searchQuery.trim()) return true;
      const query = searchQuery.toLowerCase();
      return (
        video.title.toLowerCase().includes(query) ||
        video.preacher.toLowerCase().includes(query) ||
        video.ministry.toLowerCase().includes(query) ||
        video.scripture.toLowerCase().includes(query) ||
        video.tags.some((t) => t.toLowerCase().includes(query))
      );
    });
  }, [youtubeVideos, liveFilter, selectedCategory, searchQuery, searchRelevance]);

  // Visible sliced videos for infinite scrolling
  const visibleVideos = useMemo(() => {
    return filteredVideos.slice(0, visibleCount);
  }, [filteredVideos, visibleCount]);

  const hasMoreToDisplay = visibleCount < filteredVideos.length;

  // Infinite Scroll Sentinel
  useEffect(() => {
    const sentinel = loadMoreSentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first.isIntersecting) {
          if (hasMoreToDisplay) {
            setVisibleCount((prev) => Math.min(prev + 8, filteredVideos.length));
          }
        }
      },
      { rootMargin: '300px' }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMoreToDisplay, isFetchingMore, filteredVideos.length, youtubeVideos.length]);

  // Live verification diagnostic for the import form
  const liveVerification = useMemo(() => {
    if (!inputTitle && !inputMinistry && !inputUrl) return null;
    const extractedId = extractYouTubeId(inputUrl);
    const verification = verifyChristianContent(
      inputTitle || 'Christian video',
      inputScripture,
      inputMinistry || 'Church'
    );
    return {
      extractedId,
      isValidUrl: Boolean(extractedId),
      ...verification
    };
  }, [inputUrl, inputTitle, inputMinistry, inputScripture]);

  // Handle importing a validated Christian YouTube video with real-time Live check
  const handleImportVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    setImportStatusMessage(null);

    const youtubeId = extractYouTubeId(inputUrl);
    if (!youtubeId) {
      setImportStatusMessage({
        text: 'Please enter a valid YouTube URL (e.g., https://www.youtube.com/watch?v=... or https://youtu.be/...)',
        isError: true,
      });
      return;
    }

    setIsCheckingCustomUrl(true);
    try {
      // Check whether this specific video is currently live on YouTube
      const statusRes = await checkYouTubeVideoStatus(youtubeId);
      if (!statusRes.available) throw new Error('YouTube status verification is unavailable. Configure YOUTUBE_API_KEY on the server before importing videos.');
      if (!statusRes.verifiedChristian || (statusRes.verificationConfidence || 0) < 75) {
        throw new Error('This YouTube video did not meet the server-side Christian-content threshold. Try a sermon, worship service, Bible study, or ministry broadcast.');
      }
      const isLiveNow = statusRes.isLive;
      const displayTitle = inputTitle.trim() || statusRes.title || 'Christian YouTube video';
      const scriptureRef = inputScripture.trim();

      const newVideo: Sermon = {
        id: `yt-import-${youtubeId}-${Date.now()}`,
        title: displayTitle,
        preacher: inputMinistry.trim() || statusRes.author || 'YouTube Ministry',
        ministry: inputMinistry.trim() || statusRes.author || 'YouTube Ministry',
        scripture: scriptureRef,
        scriptureText: '',
        duration: isLiveNow ? 0 : 2700,
        durationFormatted: isLiveNow ? 'LIVE' : '45:00',
        thumbnailUrl: getYouTubeThumbnail(youtubeId),
        videoUrl: `https://www.youtube-nocookie.com/embed/${youtubeId}`,
        youtubeId,
        isOnlineVideo: true,
        sourceType: isLiveNow ? 'livestream' : 'youtube',
        isLive: isLiveNow,
        verifiedChristian: true,
        category: inputCategory,
        date: isLiveNow ? 'Streaming Live on YouTube' : 'Uploaded to YouTube',
        description: statusRes.description || `${displayTitle}. ${isLiveNow ? 'Live on YouTube.' : 'Recorded on YouTube.'}`,
        chapters: [
          { title: isLiveNow ? 'Live Stream' : 'Full Sermon / Worship', time: 0 },
        ],
        biblePassages: [
          {
            reference: scriptureRef,
            translation: '',
            text: ''
          }
        ],
        keyPoints: [
          'Faith comes by hearing, and hearing by the Word of God.',
          isLiveNow ? 'Real-time live stream from YouTube.' : 'Recorded and uploaded video on demand.'
        ],
        downloadSizeMb: 0,
        tags: ['YouTube', isLiveNow ? 'LIVE NOW' : 'Recorded', inputCategory, statusRes.author || 'Ministry'],
        viewsCount: isLiveNow ? 'Live on YouTube' : 'Recorded Video'
      };

      setYoutubeVideos((prev) => [newVideo, ...prev]);
      if (onAddCustomChristianVideo) {
        onAddCustomChristianVideo(newVideo);
      }

      // Reset form
      setInputUrl('');
      setInputTitle('');
      setInputMinistry('');
      setInputScripture('');
      setIsImportModalOpen(false);

      // Play the newly added video
      onSelectVideo(newVideo);
    } catch (err) {
      console.warn('Import error:', err);
    } finally {
      setIsCheckingCustomUrl(false);
    }
  };

  const featuredVideo = filteredVideos[0] || youtubeVideos[0];

  return (
    <div id="christian-online-hub" className="space-y-8 animate-in fade-in duration-300">
      {/* Top Banner & YouTube Live Integration Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 p-6 sm:p-8 shadow-2xl">
        <div className="absolute -right-12 -bottom-12 h-64 w-64 rounded-full bg-red-600/10 blur-3xl pointer-events-none" />
        <div className="absolute left-1/3 -top-12 h-48 w-48 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="flex items-center gap-1.5 rounded-full bg-red-600 px-3 py-1 text-xs font-bold text-white shadow-md">
                <Youtube className="h-3.5 w-3.5 fill-current" />
                <span>Live YouTube Feed</span>
              </span>

              {/* Real-time sync indicator */}
              <div className="flex items-center gap-2 rounded-full bg-slate-950/80 border border-slate-700 px-3 py-1 text-xs font-medium text-slate-200">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                <span>Sync Active: {liveCount} Live Streams • {recordedCount} Recorded</span>
              </div>

              {/* Strict Christian Filter Badge */}
              <button
                onClick={() => setShowFilterInfoModal(true)}
                className="flex items-center gap-1.5 rounded-full bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 px-3 py-1 text-xs font-semibold text-emerald-300 transition active:scale-95"
              >
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                <span>Christian Content Guard</span>
                <Info className="h-3 w-3 text-emerald-400/80 ml-0.5" />
              </button>
            </div>

            <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight">
              Live YouTube Christian Sanctuary
            </h1>

            <p className="text-sm text-slate-300 leading-relaxed">
              Streams and videos fetched directly live from YouTube. When a video is currently live on YouTube, it displays as <strong>LIVE</strong> with real-time viewer counters. When a video was recorded and uploaded, it displays as <strong>RECORDED</strong> with precise durations.
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="flex items-center gap-2 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-slate-700 px-4 py-3 text-xs sm:text-sm font-semibold text-white transition active:scale-95 disabled:opacity-50"
              title="Refresh feeds live from YouTube"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin text-blue-400' : 'text-slate-300'}`} />
              <span>{isRefreshing ? 'Refreshing...' : 'Refresh YouTube'}</span>
            </button>

            <button
              onClick={handleFetchMoreFromYouTube}
              disabled={isFetchingMore}
              className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 px-4 py-3 text-xs sm:text-sm font-bold text-white shadow-lg shadow-red-500/25 transition active:scale-95 border border-red-400/30 disabled:opacity-50"
              title="Continuously discover more Christian live streams and recorded messages from YouTube with no limit"
            >
              {isFetchingMore ? (
                <Loader2 className="h-4 w-4 animate-spin text-white" />
              ) : (
                <Tv className="h-4 w-4 text-white" />
              )}
              <span>{isFetchingMore ? 'Discovering...' : 'Discover More Christian Videos'}</span>
            </button>

            <button
              onClick={() => setIsImportModalOpen(true)}
              className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 px-4 py-3 text-xs sm:text-sm font-bold text-white shadow-lg shadow-blue-500/20 transition active:scale-95 border border-blue-400/30"
            >
              <PlusCircle className="h-4 w-4" />
              <span>Import Video</span>
            </button>
          </div>
        </div>
      </div>

      {/* Featured Video Spotlight */}
      {featuredVideo && !searchQuery && (
        <div className="relative overflow-hidden rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl group">
          <div className="grid grid-cols-1 lg:grid-cols-12">
            <div className="lg:col-span-7 relative aspect-video overflow-hidden bg-black cursor-pointer" onClick={() => onSelectVideo(featuredVideo)}>
              <img
                src={featuredVideo.thumbnailUrl}
                alt={featuredVideo.title}
                referrerPolicy="no-referrer"
                className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />
              
              <div className="absolute top-4 left-4 flex items-center gap-2">
                {featuredVideo.isLive ? (
                  <span className="flex items-center gap-1.5 rounded-lg bg-red-600 px-3 py-1 text-xs font-black uppercase tracking-wider text-white shadow-lg animate-pulse">
                    <span className="h-2 w-2 rounded-full bg-white animate-ping" />
                    <span>LIVE ON YOUTUBE</span>
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 rounded-lg bg-slate-900/90 border border-slate-700 px-2.5 py-1 text-xs font-semibold text-slate-200 shadow backdrop-blur-md">
                    <Film className="h-3.5 w-3.5 text-blue-400" />
                    <span>RECORDED MESSAGE</span>
                  </span>
                )}
                <span className="rounded-lg bg-black/80 px-2.5 py-1 text-xs font-mono text-amber-300 backdrop-blur-md">
                  {featuredVideo.isLive ? 'LIVE' : featuredVideo.durationFormatted}
                </span>
              </div>

              {/* Play Button Overlay */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-600 text-white shadow-2xl scale-90 group-hover:scale-100 transition-transform">
                  <Play className="h-8 w-8 fill-current ml-1" />
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 p-6 sm:p-8 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                  <span className="text-amber-400 font-semibold">{featuredVideo.category}</span>
                  <span>{featuredVideo.viewsCount}</span>
                </div>

                <h2 
                  onClick={() => onSelectVideo(featuredVideo)}
                  className="font-display text-lg sm:text-xl font-bold text-white hover:text-blue-300 transition cursor-pointer leading-snug"
                >
                  {featuredVideo.title}
                </h2>

                <p className="text-xs text-slate-400 font-semibold">
                  By {featuredVideo.preacher} • <span className="text-slate-500">{featuredVideo.ministry}</span>
                </p>

                <p className="text-xs sm:text-sm text-slate-300 line-clamp-3 leading-relaxed">
                  {featuredVideo.description}
                </p>

                <div className="pt-2">
                  <div className="rounded-xl bg-slate-950/70 border border-slate-800/80 p-3 text-xs text-amber-200/90 font-serif italic">
                    "{featuredVideo.scriptureText}"
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={() => onSelectVideo(featuredVideo)}
                  className={`flex-1 flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold text-white transition shadow-md ${
                    featuredVideo.isLive ? 'bg-red-600 hover:bg-red-500 shadow-red-600/30' : 'bg-blue-600 hover:bg-blue-500'
                  }`}
                >
                  <Play className="h-4 w-4 fill-current" />
                  <span>{featuredVideo.isLive ? 'Tune Into Live Stream' : 'Watch Recorded Message'}</span>
                </button>

                <button
                  onClick={() => onToggleWatchLater(featuredVideo.id)}
                  className={`flex items-center justify-center rounded-xl p-2.5 border transition ${
                    syncState.watchLater.includes(featuredVideo.id)
                      ? 'bg-amber-500 text-slate-950 border-amber-400'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                  }`}
                  title="Watch Later"
                >
                  <Clock className="h-4 w-4" />
                </button>

                <button
                  onClick={() => onToggleFavorite(featuredVideo.id)}
                  className={`flex items-center justify-center rounded-xl p-2.5 border transition ${
                    syncState.favorites.includes(featuredVideo.id)
                      ? 'bg-red-500 text-white border-red-400'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                  }`}
                  title="Add to Favorites"
                >
                  <Bookmark className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Search Bar & Broadcast Status Controls */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search live Christian streams or recorded sermons on YouTube..."
              className="w-full rounded-2xl bg-slate-900 border border-slate-800 pl-10 pr-10 py-3 text-xs sm:text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none transition shadow-inner"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Broadcast Status Toggle (All vs Live vs Recorded) */}
          <div className="flex items-center gap-1.5 rounded-2xl bg-slate-900 p-1 border border-slate-800 shrink-0">
            <button
              onClick={() => setLiveFilter('all')}
              className={`rounded-xl px-3.5 py-2 text-xs font-semibold transition ${
                liveFilter === 'all'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              All Content ({youtubeVideos.length})
            </button>
            <button
              onClick={() => setLiveFilter('live')}
              className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-semibold transition ${
                liveFilter === 'live'
                  ? 'bg-red-600 text-white shadow-sm animate-pulse'
                  : 'text-slate-400 hover:text-red-400'
              }`}
            >
              <span className="h-2 w-2 rounded-full bg-red-400 animate-ping" />
              <span>Live on YouTube ({liveCount})</span>
            </button>
            <button
              onClick={() => setLiveFilter('recorded')}
              className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-semibold transition ${
                liveFilter === 'recorded'
                  ? 'bg-slate-700 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Film className="h-3 w-3 text-blue-400" />
              <span>Recorded ({recordedCount})</span>
            </button>
          </div>
        </div>

        {/* Prohibited / Secular Search Warning Notification */}
        {!searchRelevance.isPermitted && (
          <div className="rounded-2xl bg-red-950/80 border border-red-800/80 p-4 text-xs text-red-200 flex items-start gap-3 shadow-lg">
            <ShieldAlert className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-red-300">Christian Guardian Filter Notice:</p>
              <p className="mt-0.5">{searchRelevance.warning}</p>
              <p className="mt-1 text-[11px] text-red-400">
                GospelStream TV only streams Christ-centered praise, sermons, and biblical broadcasts.
              </p>
            </div>
          </div>
        )}

        {/* Category Pills Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {ONLINE_CHRISTIAN_CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-slate-900/90 text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-slate-800'
                }`}
              >
                <span>{cat.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Videos Grid Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            {liveFilter === 'live' ? (
              <span className="flex h-2.5 w-2.5 rounded-full bg-red-500 animate-ping" />
            ) : (
              <Youtube className="h-4 w-4 text-red-500" />
            )}
            <h2 className="font-display text-lg font-bold text-white tracking-tight">
              {liveFilter === 'live' 
                ? 'Streams Live on YouTube Right Now' 
                : liveFilter === 'recorded' 
                ? 'Recorded & Uploaded Christian Messages' 
                : 'Christian Videos Live From YouTube'}
            </h2>
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-400 font-mono">
            <span>Showing {visibleVideos.length} of {filteredVideos.length} items</span>
          </div>
        </div>

        {/* Loading Spinner */}
        {isInitialLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
            <Loader2 className="h-10 w-10 animate-spin text-red-500" />
            <div className="space-y-1">
              <h3 className="font-display text-base font-bold text-white">Connecting Directly to YouTube Live...</h3>
              <p className="text-xs text-slate-400 max-w-sm">
                Scanning YouTube's global Christian channels to verify live broadcast status.
              </p>
            </div>
          </div>
        ) : filteredVideos.length === 0 ? (
          <div className="rounded-3xl bg-slate-900/40 p-12 text-center border border-slate-800 space-y-3">
            <Youtube className="h-10 w-10 text-red-500/50 mx-auto" />
            <h3 className="text-base font-bold text-white">No Christian Videos Matching Filter</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              {liveFilter === 'live' 
                ? 'No live streams found in this category right now. Switch to All Content or Recorded Messages.'
                : 'Try searching for another topic or click below to discover more from YouTube.'}
            </p>
            <button
              onClick={() => {
                setLiveFilter('all');
                setSelectedCategory('all');
                setSearchQuery('');
              }}
              className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-500 transition"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {visibleVideos.map((video) => {
              const isFav = syncState.favorites.includes(video.id);
              const isWL = syncState.watchLater.includes(video.id);

              return (
                <div
                  key={video.id}
                  className="group flex flex-col justify-between rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-blue-500/50 transition-all hover:-translate-y-1 shadow-lg overflow-hidden"
                >
                  <div>
                    {/* Thumbnail Container */}
                    <div 
                      onClick={() => onSelectVideo(video)}
                      className="relative aspect-video w-full overflow-hidden bg-slate-950 cursor-pointer"
                    >
                      <img
                        src={video.thumbnailUrl}
                        alt={video.title}
                        referrerPolicy="no-referrer"
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />

                      {/* Gradient overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-black/30" />

                      {/* Christian-content match Shield Badge */}
                      <div className="absolute top-2 left-2 flex items-center gap-1.5 rounded-lg bg-emerald-600/90 px-2 py-0.5 text-[10px] font-bold text-white shadow backdrop-blur-sm">
                        <ShieldCheck className="h-3 w-3 text-white" />
                        <span>Christian-content match</span>
                      </div>

                      {/* LIVE vs RECORDED badge */}
                      {video.isLive ? (
                        <div className="absolute top-2 right-2 flex items-center gap-1.5 rounded-lg bg-red-600 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-white shadow animate-pulse">
                          <span className="h-1.5 w-1.5 rounded-full bg-white animate-ping" />
                          <span>LIVE</span>
                        </div>
                      ) : (
                        <div className="absolute top-2 right-2 flex items-center gap-1 rounded-lg bg-slate-900/90 border border-slate-700 px-2 py-0.5 text-[10px] font-semibold text-slate-300 shadow backdrop-blur-sm">
                          <Film className="h-3 w-3 text-blue-400" />
                          <span>RECORDED</span>
                        </div>
                      )}

                      {/* Duration at Bottom Right */}
                      <div className={`absolute bottom-2 right-2 rounded px-2 py-0.5 text-[10px] font-mono backdrop-blur-sm ${
                        video.isLive ? 'bg-red-600 font-bold text-white animate-pulse' : 'bg-black/80 text-white'
                      }`}>
                        {video.isLive ? 'LIVE' : video.durationFormatted}
                      </div>

                      {/* Center Play Button on hover */}
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30">
                        <div className={`flex h-12 w-12 items-center justify-center rounded-xl text-white shadow-xl ${
                          video.isLive ? 'bg-red-600' : 'bg-blue-600'
                        }`}>
                          <Play className="h-6 w-6 fill-current ml-0.5" />
                        </div>
                      </div>
                    </div>

                    {/* Content Info */}
                    <div className="p-4 space-y-2">
                      <div className="flex items-center justify-between text-[11px] font-mono">
                        <span className="text-amber-400 font-semibold line-clamp-1">
                          📖 {video.scripture}
                        </span>
                        <span className={`text-[10px] shrink-0 font-medium ${video.isLive ? 'text-red-400 font-bold' : 'text-slate-400'}`}>
                          {video.viewsCount}
                        </span>
                      </div>

                      <h3 
                        onClick={() => onSelectVideo(video)}
                        className="font-display text-sm font-bold text-white group-hover:text-blue-300 transition line-clamp-2 cursor-pointer leading-snug"
                      >
                        {video.title}
                      </h3>

                      <p className="text-xs text-slate-400 line-clamp-1 font-medium">
                        {video.preacher} • <span className="text-slate-500">{video.ministry}</span>
                      </p>

                      <p className="text-[11px] text-slate-300 line-clamp-2 leading-relaxed">
                        {video.description}
                      </p>
                    </div>
                  </div>

                  {/* Bottom Action Footer */}
                  <div className="p-4 pt-0 flex items-center justify-between gap-2 border-t border-slate-800/80 mt-2">
                    <button
                      onClick={() => onSelectVideo(video)}
                      className={`flex-1 flex items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-bold text-white transition shadow ${
                        video.isLive 
                          ? 'bg-red-600 hover:bg-red-500 shadow-red-600/30' 
                          : 'bg-blue-600/90 hover:bg-blue-600'
                      }`}
                    >
                      <Play className="h-3.5 w-3.5 fill-current" />
                      <span>{video.isLive ? 'Watch Live' : 'Watch Video'}</span>
                    </button>

                    <button
                      onClick={() => onToggleWatchLater(video.id)}
                      className={`p-2 rounded-xl border transition ${
                        isWL
                          ? 'bg-amber-500 text-slate-950 border-amber-400'
                          : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300 border-slate-700'
                      }`}
                      title={isWL ? 'In Watch Later' : 'Add to Watch Later'}
                    >
                      <Clock className="h-3.5 w-3.5" />
                    </button>

                    <button
                      onClick={() => onToggleFavorite(video.id)}
                      className={`p-2 rounded-xl border transition ${
                        isFav
                          ? 'bg-red-500 text-white border-red-400'
                          : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300 border-slate-700'
                      }`}
                      title={isFav ? 'Favorited' : 'Favorite'}
                    >
                      <Bookmark className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Infinite Scroll Sentinel & Discovery Bar */}
        <div ref={loadMoreSentinelRef} className="pt-6 pb-8 flex flex-col items-center justify-center gap-4">
          <div className="flex flex-col items-center gap-3">
            <button
              onClick={handleFetchMoreFromYouTube}
              disabled={isFetchingMore}
              className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-xs transition shadow-xl shadow-red-500/20 disabled:opacity-50"
            >
              {isFetchingMore ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin text-white" />
                  <span>Loading Real Feeds Live From YouTube...</span>
                </>
              ) : (
                <>
                  <ChevronDown className="h-4 w-4" />
                  <span>Keep Loading More From YouTube (No Limit)</span>
                </>
              )}
            </button>
            <span className="text-[11px] text-slate-400">
              Scroll down or click to load continuous live streams and recorded messages directly from YouTube
            </span>
          </div>
        </div>
      </div>

      {/* IMPORT MODAL */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-600/20 text-red-400">
                  <Youtube className="h-5 w-5 fill-current" />
                </div>
                <div>
                  <h3 className="font-display text-base font-bold text-white">Import YouTube Christian Video</h3>
                  <p className="text-xs text-slate-400">Live or recorded video will be checked against the Christian-content rules</p>
                </div>
              </div>
              <button
                onClick={() => setIsImportModalOpen(false)}
                className="rounded-xl p-2 text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Christian Safeguard Notice */}
            <div className="rounded-xl bg-emerald-950/50 border border-emerald-800/60 p-3 text-xs text-emerald-200 flex items-center gap-2.5">
              <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
              <span>
                <strong>Christian Filter Active:</strong> Only videos adhering to Christian faith, Scripture, praise, and ministry teachings are accepted.
              </span>
            </div>

            <form onSubmit={handleImportVideo} className="space-y-4">
              {/* URL */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">
                  YouTube Video Link or ID *
                </label>
                <input
                  type="text"
                  value={inputUrl}
                  onChange={(e) => setInputUrl(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=... or youtu.be/..."
                  required
                  className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:border-blue-500 focus:outline-none"
                />
              </div>

              {/* Title */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">
                  Sermon / Song Title *
                </label>
                <input
                  type="text"
                  value={inputTitle}
                  onChange={(e) => setInputTitle(e.target.value)}
                  placeholder="e.g. Walking in Divine Grace"
                  required
                  className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:border-blue-500 focus:outline-none"
                />
              </div>

              {/* Ministry / Preacher */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">
                    Preacher / Ministry
                  </label>
                  <input
                    type="text"
                    value={inputMinistry}
                    onChange={(e) => setInputMinistry(e.target.value)}
                    placeholder="e.g. Pastor David / First Baptist"
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">
                    Category
                  </label>
                  <select
                    value={inputCategory}
                    onChange={(e) => setInputCategory(e.target.value as any)}
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3.5 py-2.5 text-xs text-white focus:border-blue-500 focus:outline-none"
                  >
                    <option value="Sunday Sermons">Sunday Sermons</option>
                    <option value="Worship Nights">Worship Nights</option>
                    <option value="Deep Bible Study">Deep Bible Study</option>
                    <option value="Faith & Healing">Faith & Healing</option>
                    <option value="Walking in the Spirit">Walking in the Spirit</option>
                    <option value="Family & Marriage">Family & Marriage</option>
                    <option value="Prayer & Fasting">Prayer & Fasting</option>
                    <option value="Documentaries">Documentaries</option>
                  </select>
                </div>
              </div>

              {/* Scripture */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">
                  Scripture Reference (Optional)
                </label>
                <input
                  type="text"
                  value={inputScripture}
                  onChange={(e) => setInputScripture(e.target.value)}
                  placeholder="e.g. Romans 8:28 or Psalm 23"
                  className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:border-blue-500 focus:outline-none"
                />
              </div>

              {/* Live Diagnostic Preview */}
              {liveVerification && (
                <div className={`rounded-xl p-3 text-xs border ${
                  liveVerification.isChristian 
                    ? 'bg-emerald-950/40 border-emerald-800/80 text-emerald-300' 
                    : 'bg-amber-950/40 border-amber-800/80 text-amber-300'
                }`}>
                  <div className="flex items-center gap-1.5 font-bold mb-1">
                    {liveVerification.isChristian ? (
                      <>
                        <ShieldCheck className="h-4 w-4 text-emerald-400" />
                        <span>Christian-content match</span>
                      </>
                    ) : (
                      <>
                        <ShieldAlert className="h-4 w-4 text-amber-400" />
                        <span>Christian-content classification required</span>
                      </>
                    )}
                  </div>
                  {liveVerification.matchedKeywords.length > 0 && (
                    <p className="text-[11px] opacity-90">
                      Matched Christian context: {liveVerification.matchedKeywords.slice(0, 5).join(', ')}
                    </p>
                  )}
                  {liveVerification.blockedReason && (
                    <p className="text-[11px] text-amber-200 mt-0.5">
                      {liveVerification.blockedReason}
                    </p>
                  )}
                </div>
              )}

              {/* Error Status Message */}
              {importStatusMessage && (
                <div className="rounded-xl bg-red-950/60 border border-red-800 p-3 text-xs text-red-200">
                  {importStatusMessage.text}
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsImportModalOpen(false)}
                  className="rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCheckingCustomUrl}
                  className="flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-500 px-5 py-2.5 text-xs font-bold text-white transition shadow-lg disabled:opacity-50"
                >
                  {isCheckingCustomUrl ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      <span>Checking YouTube Live Status...</span>
                    </>
                  ) : (
                    <span>Verify & Import</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* FILTER INFO MODAL */}
      {showFilterInfoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-md rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-display text-base font-bold text-white">Strict Christian Content Guard</h3>
                  <p className="text-xs text-slate-400">How GospelStream TV protects your spiritual feed</p>
                </div>
              </div>
              <button
                onClick={() => setShowFilterInfoModal(false)}
                className="rounded-xl p-2 text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
              <p>
                GospelStream TV streams exclusively Christ-centered media live from YouTube. Our server-side live status detector inspects every stream in real-time:
              </p>

              <div className="rounded-xl bg-slate-950 p-3 space-y-2 border border-slate-800">
                <div className="flex items-start gap-2">
                  <span className="text-red-400 font-bold">🔴</span>
                  <span><strong>Live Streams:</strong> When a church or ministry is broadcasting live right now on YouTube, it displays as <strong>LIVE</strong> with an active viewer count.</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-blue-400 font-bold">🎬</span>
                  <span><strong>Recorded / Uploaded:</strong> When a sermon or study was previously recorded and uploaded, it shows as <strong>RECORDED</strong> with exact run-time duration.</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold">✓</span>
                  <span><strong>Continuous Discovery:</strong> Click "Keep Loading More" to load unlimited additional Christian live streams and messages directly from YouTube.</span>
                </div>
              </div>

              <p className="text-[11px] text-slate-400">
                "Finally, brothers and sisters, whatever is true, whatever is noble, whatever is right, whatever is pure, whatever is lovely, whatever is admirable... think about such things." — Philippians 4:8
              </p>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setShowFilterInfoModal(false)}
                className="rounded-xl bg-blue-600 hover:bg-blue-500 px-4 py-2 text-xs font-bold text-white"
              >
                Understood
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
