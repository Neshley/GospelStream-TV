import React, { useState, useEffect, useCallback } from 'react';
import { 
  AppTab, 
  DeviceMode, 
  SyncState, 
  Channel, 
  Sermon, 
  LiveEvent,
  SermonNote 
} from './types';
import { 
  CHANNELS, 
  SERMONS, 
  UPCOMING_EVENTS 
} from './data/mockData';
import { 
  loadSyncState, 
  saveSyncState, 
  subscribeToCrossDeviceSync,
  sendLocalNotification 
} from './services/storageService';
import { Header } from './components/Header';
import { LiveTvPlayer } from './components/LiveTvPlayer';
import { ChannelGuide } from './components/ChannelGuide';
import { SermonCatalog } from './components/SermonCatalog';
import { SermonPlayer } from './components/SermonPlayer';
import { PersonalizedLibrary } from './components/PersonalizedLibrary';
import { OfflineDownloads } from './components/OfflineDownloads';
import { EventsCalendar } from './components/EventsCalendar';
import { DeviceSyncModal } from './components/DeviceSyncModal';
import { TvRemoteOverlay } from './components/TvRemoteOverlay';
import { AlertsPopover } from './components/AlertsPopover';
import { OnlineChristianVideos } from './components/OnlineChristianVideos';
import { ONLINE_CHRISTIAN_VIDEOS } from './data/christianOnlineData';
import { 
  Tv, 
  WifiOff, 
  Check, 
  Radio, 
  Flame, 
  Sparkles,
  Info,
  Film
} from 'lucide-react';
import { 
  fetchChristianYouTubeVideos, 
  fetchLiveYouTubeChannels 
} from './services/youtubeService';

export default function App() {
  const [syncState, setSyncState] = useState<SyncState>(loadSyncState);
  const [currentTab, setCurrentTab] = useState<AppTab>('live-tv');
  const [channels, setChannels] = useState<Channel[]>(CHANNELS);
  const [currentChannel, setCurrentChannel] = useState<Channel>(CHANNELS[0]);
  const [selectedSermon, setSelectedSermon] = useState<Sermon | null>(null);
  const [deviceMode, setDeviceMode] = useState<DeviceMode>('desktop');
  const [isTvRemoteOpen, setIsTvRemoteOpen] = useState(false);
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);
  const [isAlertsOpen, setIsAlertsOpen] = useState(false);
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [customOnlineVideos, setCustomOnlineVideos] = useState<Sermon[]>([]);
  const [liveYouTubeSermons, setLiveYouTubeSermons] = useState<Sermon[]>([]);

  // Dynamically load YouTube live Christian channels and videos
  useEffect(() => {
    const loadFeeds = async () => {
      try {
        const [channelsRes, videosRes] = await Promise.allSettled([
          fetchLiveYouTubeChannels(),
          fetchChristianYouTubeVideos({ query: 'Christian worship sermon live praise', filter: 'all' }),
        ]);

        if (channelsRes.status === 'fulfilled' && channelsRes.value.length > 0) {
          setChannels(channelsRes.value);
          setCurrentChannel((prev) => {
            const found = channelsRes.value.find((c) => c.id === prev.id);
            return found || channelsRes.value[0];
          });
        }

        if (videosRes.status === 'fulfilled' && videosRes.value.videos.length > 0) {
          setLiveYouTubeSermons(videosRes.value.videos);
        }
      } catch (err) {
        console.warn('Could not sync YouTube channels/videos:', err);
      }
    };

    loadFeeds();
  }, []);

  // Combined library: dynamically fetched YouTube videos prioritized, verified live status
  const allSermons = React.useMemo(() => {
    if (liveYouTubeSermons.length > 0) {
      return [...liveYouTubeSermons, ...customOnlineVideos];
    }
    return [...SERMONS, ...ONLINE_CHRISTIAN_VIDEOS, ...customOnlineVideos];
  }, [liveYouTubeSermons, customOnlineVideos]);

  // Sync state persistence
  useEffect(() => {
    saveSyncState(syncState);
  }, [syncState]);

  // Real-time cross-tab / cross-device synchronization
  useEffect(() => {
    const unsubscribe = subscribeToCrossDeviceSync((remoteState) => {
      setSyncState(remoteState);
      showToast('State updated via Cross-Device Cloud Sync! 🔄');
    });
    return () => unsubscribe();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Keyboard navigation for TV experience
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept when typing in input or textarea
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) {
        return;
      }

      switch (e.key) {
        case 'c':
        case 'C':
          setCurrentTab((prev) => (prev === 'guide' ? 'live-tv' : 'guide'));
          break;
        case 'Escape':
          if (selectedSermon) {
            setSelectedSermon(null);
          } else if (isSyncModalOpen) {
            setIsSyncModalOpen(false);
          } else if (isAlertsOpen) {
            setIsAlertsOpen(false);
          } else if (currentTab !== 'live-tv') {
            setCurrentTab('live-tv');
          }
          break;
        case '1':
        case '2':
        case '3':
        case '4':
        case '5':
        case '6': {
          const chIdx = parseInt(e.key, 10) - 1;
          if (CHANNELS[chIdx]) {
            setCurrentChannel(CHANNELS[chIdx]);
            showToast(`Switched to CH ${CHANNELS[chIdx].number}: ${CHANNELS[chIdx].name}`);
          }
          break;
        }
        case 'ArrowUp':
          if (currentTab === 'live-tv') {
            changeChannelDelta(1);
          }
          break;
        case 'ArrowDown':
          if (currentTab === 'live-tv') {
            changeChannelDelta(-1);
          }
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentTab, selectedSermon, isSyncModalOpen, isAlertsOpen]);

  // Channel changing
  const changeChannelDelta = (delta: number) => {
    const currentIndex = CHANNELS.findIndex((c) => c.id === currentChannel.id);
    let nextIndex = currentIndex + delta;
    if (nextIndex < 0) nextIndex = CHANNELS.length - 1;
    if (nextIndex >= CHANNELS.length) nextIndex = 0;
    const nextCh = CHANNELS[nextIndex];
    setCurrentChannel(nextCh);
    showToast(`Tuning to CH ${nextCh.number}: ${nextCh.name}`);
  };

  const jumpToChannelNumber = (channelNum: number) => {
    const found = CHANNELS.find((c) => c.number === channelNum);
    if (found) {
      setCurrentChannel(found);
      setCurrentTab('live-tv');
      showToast(`Tuned to CH ${found.number}: ${found.name}`);
    } else {
      showToast(`Channel ${channelNum} not found. Available: 101 - 106`);
    }
  };

  // State manipulation handlers
  const handleToggleFavorite = useCallback((sermonId: string) => {
    setSyncState((prev) => {
      const exists = prev.favorites.includes(sermonId);
      const newFavs = exists
        ? prev.favorites.filter((id) => id !== sermonId)
        : [...prev.favorites, sermonId];
      return { ...prev, favorites: newFavs };
    });
    showToast('Updated Favorite Messages in your library');
  }, []);

  const handleToggleWatchLater = useCallback((sermonId: string) => {
    setSyncState((prev) => {
      const exists = prev.watchLater.includes(sermonId);
      const newWL = exists
        ? prev.watchLater.filter((id) => id !== sermonId)
        : [...prev.watchLater, sermonId];
      return { ...prev, watchLater: newWL };
    });
    showToast('Updated Watch Later queue');
  }, []);

  const handleSaveProgress = useCallback((sermonId: string, progressSeconds: number, totalSeconds: number) => {
    setSyncState((prev) => {
      const existing = prev.continueWatching.filter((c) => c.sermonId !== sermonId);
      return {
        ...prev,
        continueWatching: [
          {
            sermonId,
            progressSeconds,
            totalSeconds,
            lastWatched: 'Just now',
          },
          ...existing,
        ],
      };
    });
  }, []);

  const handleClearContinueWatching = useCallback((sermonId: string) => {
    setSyncState((prev) => ({
      ...prev,
      continueWatching: prev.continueWatching.filter((c) => c.sermonId !== sermonId),
    }));
    showToast('Removed from Continue Watching shelf');
  }, []);

  const handleSaveNote = useCallback((noteData: { sermonId: string; sermonTitle: string; timestamp: number; content: string }) => {
    const newNote: SermonNote = {
      id: `note-${Date.now()}`,
      sermonId: noteData.sermonId,
      sermonTitle: noteData.sermonTitle,
      timestamp: noteData.timestamp,
      content: noteData.content,
      createdAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    };
    setSyncState((prev) => ({
      ...prev,
      notes: [newNote, ...prev.notes],
    }));
    showToast('Reflection saved to your personalized library! 📖');
  }, []);

  const handleDeleteNote = useCallback((noteId: string) => {
    setSyncState((prev) => ({
      ...prev,
      notes: prev.notes.filter((n) => n.id !== noteId),
    }));
    showToast('Note removed from library');
  }, []);

  const handleToggleReminder = useCallback((eventId: string) => {
    setSyncState((prev) => {
      const exists = prev.reminders.includes(eventId);
      const newReminders = exists
        ? prev.reminders.filter((id) => id !== eventId)
        : [...prev.reminders, eventId];
      return { ...prev, reminders: newReminders };
    });
  }, []);

  const handleClearAllReminders = useCallback(() => {
    setSyncState((prev) => ({ ...prev, reminders: [] }));
    showToast('All broadcast reminders cleared');
  }, []);

  const handleDownloadSermon = useCallback((sermonId: string, quality: '1080p' | '720p' | 'Audio Only', sizeMb: number) => {
    setSyncState((prev) => {
      if (prev.downloadedSermons.some((d) => d.sermonId === sermonId)) return prev;
      return {
        ...prev,
        downloadedSermons: [
          {
            sermonId,
            downloadedAt: 'Today',
            quality,
            sizeMb,
          },
          ...prev.downloadedSermons,
        ],
      };
    });
    showToast(`Downloaded for offline playback! (${sizeMb} MB) 📴`);
  }, []);

  const handleDeleteDownload = useCallback((sermonId: string) => {
    setSyncState((prev) => ({
      ...prev,
      downloadedSermons: prev.downloadedSermons.filter((d) => d.sermonId !== sermonId),
    }));
    showToast('Removed sermon from device offline storage');
  }, []);

  const handleSelectProfile = useCallback((profileId: string) => {
    setSyncState((prev) => ({ ...prev, currentProfileId: profileId }));
    const profile = syncState.profiles.find((p) => p.id === profileId);
    showToast(`Switched profile to ${profile?.name || 'Family'}`);
  }, [syncState.profiles]);

  const handleHandoffToDevice = useCallback((deviceName: string) => {
    showToast(`Streaming transferred to ${deviceName}! Playback resumed seamlessly.`);
  }, []);

  // Filter sermons when offline mode is active
  const displayedSermons = isOfflineMode
    ? allSermons.filter((s) => syncState.downloadedSermons.some((d) => d.sermonId === s.id))
    : allSermons;

  return (
    <div className={`min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white ${
      deviceMode === 'smart-tv' ? 'text-base' : 'text-sm'
    }`}>
      {/* Offline Mode Indicator Ribbon */}
      {isOfflineMode && (
        <div className="bg-amber-600 px-4 py-1.5 text-center text-xs font-bold text-slate-950 flex items-center justify-center gap-2 shadow-md">
          <WifiOff className="h-4 w-4" />
          <span>OFFLINE PLAYBACK MODE ACTIVE — Showing media cached on this device</span>
          <button
            onClick={() => setIsOfflineMode(false)}
            className="underline ml-2 hover:text-white text-[11px]"
          >
            Switch Online
          </button>
        </div>
      )}

      {/* Main Header */}
      <Header
        currentTab={currentTab}
        onTabChange={(tab) => {
          setCurrentTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        deviceMode={deviceMode}
        onDeviceModeChange={setDeviceMode}
        isTvRemoteOpen={isTvRemoteOpen}
        onToggleTvRemote={() => setIsTvRemoteOpen(!isTvRemoteOpen)}
        onOpenSyncModal={() => setIsSyncModalOpen(true)}
        isOfflineMode={isOfflineMode}
        onToggleOfflineMode={() => {
          const next = !isOfflineMode;
          setIsOfflineMode(next);
          showToast(next ? 'Simulated Offline Mode enabled' : 'Online Mode restored');
        }}
        syncState={syncState}
        onSelectProfile={handleSelectProfile}
        unreadAlertsCount={syncState.reminders.length}
        onOpenAlerts={() => setIsAlertsOpen(true)}
      />

      {/* Main Body Container formatted for device mode */}
      <main className={`flex-1 p-4 sm:p-6 transition-all mx-auto w-full ${
        deviceMode === 'mobile'
          ? 'max-w-md border-x border-slate-800 shadow-2xl min-h-[800px] my-2'
          : deviceMode === 'tablet'
          ? 'max-w-4xl border-x border-slate-800 shadow-2xl min-h-[700px] my-2'
          : deviceMode === 'smart-tv'
          ? 'max-w-[1500px] p-6 lg:p-8'
          : 'max-w-7xl'
      }`}>
        {/* TAB: LIVE TV */}
        {currentTab === 'live-tv' && (
          <div className="space-y-8 animate-in fade-in duration-200">
            {/* TV Player */}
            <LiveTvPlayer
              currentChannel={currentChannel}
              channels={channels}
              onSelectChannel={(ch) => {
                setCurrentChannel(ch);
                showToast(`Watching CH ${ch.number}: ${ch.name}`);
              }}
              onOpenGuide={() => setCurrentTab('guide')}
              onOpenSermonModal={(sermonId) => {
                const s = allSermons.find((item) => item.id === sermonId);
                if (s) setSelectedSermon(s);
              }}
              isFavoriteChannel={syncState.favorites.includes(currentChannel.id)}
              onToggleFavoriteChannel={(id) => handleToggleFavorite(id)}
              onOpenSyncModal={() => setIsSyncModalOpen(true)}
              deviceMode={deviceMode}
            />

            {/* Quick Sermons Shelf Below TV */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/20 text-amber-400">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <h3 className="font-display text-lg font-bold text-white tracking-tight">
                    Christian Videos Live From YouTube
                  </h3>
                </div>
                <button
                  onClick={() => setCurrentTab('online-videos')}
                  className="text-xs font-semibold text-blue-400 hover:text-blue-300"
                >
                  Explore All YouTube Feeds →
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {displayedSermons.slice(0, 4).map((sermon) => (
                  <div
                    key={sermon.id}
                    onClick={() => setSelectedSermon(sermon)}
                    className="group cursor-pointer rounded-2xl bg-slate-900/80 p-3 border border-slate-800 hover:border-blue-500/50 transition-all hover:-translate-y-1 shadow-lg"
                  >
                    <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-slate-950 mb-2.5">
                      <img
                        src={sermon.thumbnailUrl}
                        alt={sermon.title}
                        referrerPolicy="no-referrer"
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />

                      {/* LIVE vs RECORDED status */}
                      {sermon.isLive ? (
                        <div className="absolute top-1.5 right-1.5 rounded-lg bg-red-600 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-white flex items-center gap-1 shadow animate-pulse">
                          <span className="h-1.5 w-1.5 rounded-full bg-white animate-ping" />
                          <span>LIVE</span>
                        </div>
                      ) : (
                        <div className="absolute top-1.5 right-1.5 rounded-lg bg-slate-900/90 border border-slate-700 px-1.5 py-0.5 text-[9px] font-semibold text-slate-300 flex items-center gap-1 shadow">
                          <Film className="h-2.5 w-2.5 text-blue-400" />
                          <span>RECORDED</span>
                        </div>
                      )}

                      <div className={`absolute bottom-1.5 right-1.5 rounded px-1.5 py-0.5 text-[10px] font-mono ${
                        sermon.isLive ? 'bg-red-600 text-white font-bold animate-pulse' : 'bg-black/80 text-slate-200'
                      }`}>
                        {sermon.isLive ? 'LIVE' : sermon.durationFormatted}
                      </div>
                    </div>
                    <span className="text-[10px] font-mono text-amber-400 font-semibold">📖 {sermon.scripture}</span>
                    <h4 className="text-xs font-bold text-white group-hover:text-blue-300 transition line-clamp-1 mt-0.5">
                      {sermon.title}
                    </h4>
                    <p className="text-[11px] text-slate-400 line-clamp-1">{sermon.preacher}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB: ONLINE CHRISTIAN VIDEOS (YOUTUBE INTEGRATION) */}
        {currentTab === 'online-videos' && (
          <div className="animate-in fade-in duration-200">
            <OnlineChristianVideos
              onSelectVideo={(s) => setSelectedSermon(s)}
              syncState={syncState}
              onToggleFavorite={handleToggleFavorite}
              onToggleWatchLater={handleToggleWatchLater}
              onAddCustomChristianVideo={(newV) => {
                setCustomOnlineVideos((prev) => [newV, ...prev]);
                showToast(`Verified & added "${newV.title}" to Christian catalog! ✨`);
              }}
            />
          </div>
        )}

        {/* TAB: EPG PROGRAM GUIDE */}
        {currentTab === 'guide' && (
          <div className="animate-in fade-in duration-200">
            <ChannelGuide
              channels={channels}
              currentChannel={currentChannel}
              onSelectChannel={(ch) => {
                setCurrentChannel(ch);
                setCurrentTab('live-tv');
                showToast(`Now watching CH ${ch.number}: ${ch.name}`);
              }}
              reminders={syncState.reminders}
              onToggleReminder={handleToggleReminder}
              onCloseGuide={() => setCurrentTab('live-tv')}
            />
          </div>
        )}

        {/* TAB: SERMONS CATALOG */}
        {currentTab === 'sermons' && (
          <div className="animate-in fade-in duration-200">
            <SermonCatalog
              sermons={displayedSermons}
              onSelectSermon={(s) => setSelectedSermon(s)}
              syncState={syncState}
              onToggleFavorite={handleToggleFavorite}
              onToggleWatchLater={handleToggleWatchLater}
              onDownloadSermon={handleDownloadSermon}
            />
          </div>
        )}

        {/* TAB: PERSONALIZED LIBRARY */}
        {currentTab === 'library' && (
          <div className="animate-in fade-in duration-200">
            <PersonalizedLibrary
              sermons={allSermons}
              syncState={syncState}
              onSelectSermon={(s) => setSelectedSermon(s)}
              onToggleFavorite={handleToggleFavorite}
              onToggleWatchLater={handleToggleWatchLater}
              onDeleteNote={handleDeleteNote}
              onClearContinueWatching={handleClearContinueWatching}
            />
          </div>
        )}

        {/* TAB: LIVE EVENTS & NOTIFICATIONS */}
        {currentTab === 'events' && (
          <div className="animate-in fade-in duration-200">
            <EventsCalendar
              events={UPCOMING_EVENTS}
              syncState={syncState}
              onToggleReminder={handleToggleReminder}
              onTuneToChannel={(channelId) => {
                const target = CHANNELS.find((c) => c.id === channelId) || CHANNELS[0];
                setCurrentChannel(target);
                setCurrentTab('live-tv');
                showToast(`Tuned to ${target.name}`);
              }}
            />
          </div>
        )}

        {/* TAB: OFFLINE DOWNLOADS */}
        {currentTab === 'downloads' && (
          <div className="animate-in fade-in duration-200">
            <OfflineDownloads
              sermons={allSermons}
              syncState={syncState}
              isOfflineMode={isOfflineMode}
              onToggleOfflineMode={() => setIsOfflineMode(!isOfflineMode)}
              onSelectSermon={(s) => setSelectedSermon(s)}
              onDeleteDownload={handleDeleteDownload}
              onDownloadSermon={handleDownloadSermon}
              onNavigateToCatalog={() => setCurrentTab('sermons')}
            />
          </div>
        )}
      </main>

      {/* Sermon Player Modal */}
      {selectedSermon && (
        <SermonPlayer
          sermon={selectedSermon}
          syncState={syncState}
          onClose={() => setSelectedSermon(null)}
          onToggleFavorite={handleToggleFavorite}
          onToggleWatchLater={handleToggleWatchLater}
          onSaveProgress={handleSaveProgress}
          onSaveNote={handleSaveNote}
          onDeleteNote={handleDeleteNote}
          onDownloadSermon={handleDownloadSermon}
          onOpenSyncModal={() => setIsSyncModalOpen(true)}
          isOfflineMode={isOfflineMode}
        />
      )}

      {/* Cross-Device Sync Modal */}
      <DeviceSyncModal
        isOpen={isSyncModalOpen}
        onClose={() => setIsSyncModalOpen(false)}
        syncState={syncState}
        onUpdateSyncState={(updater) => setSyncState(updater)}
        onHandoffToDevice={handleHandoffToDevice}
      />

      {/* Alerts Popover */}
      <AlertsPopover
        isOpen={isAlertsOpen}
        onClose={() => setIsAlertsOpen(false)}
        events={UPCOMING_EVENTS}
        syncState={syncState}
        onToggleReminder={handleToggleReminder}
        onTuneToChannel={(channelId) => {
          const target = CHANNELS.find((c) => c.id === channelId) || CHANNELS[0];
          setCurrentChannel(target);
          setCurrentTab('live-tv');
          showToast(`Tuned to ${target.name}`);
        }}
        onClearAllReminders={handleClearAllReminders}
      />

      {/* Smart TV Remote Control Overlay */}
      <TvRemoteOverlay
        isOpen={isTvRemoteOpen}
        onClose={() => setIsTvRemoteOpen(false)}
        onNavigate={(dir) => {
          if (dir === 'up') changeChannelDelta(1);
          if (dir === 'down') changeChannelDelta(-1);
          if (dir === 'back') {
            if (selectedSermon) setSelectedSermon(null);
            else setCurrentTab('live-tv');
          }
          if (dir === 'select') {
            showToast('Smart TV OK Selected');
          }
        }}
        onChannelChange={(delta) => changeChannelDelta(delta)}
        onChannelJump={(num) => jumpToChannelNumber(num)}
        onTogglePlay={() => {
          const video = document.querySelector('video');
          if (video) {
            if (video.paused) video.play();
            else video.pause();
          }
        }}
        onToggleMute={() => {
          const video = document.querySelector('video');
          if (video) video.muted = !video.muted;
        }}
        onToggleGuide={() => setCurrentTab((prev) => (prev === 'guide' ? 'live-tv' : 'guide'))}
        onToggleFullscreen={() => {
          if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(() => {});
          } else {
            document.exitFullscreen().catch(() => {});
          }
        }}
        onToggleCaptions={() => {
          showToast('Toggled Closed Captions / Subtitles');
        }}
        isPlaying={true}
        isMuted={false}
        currentChannelNum={currentChannel.number}
      />

      {/* Floating In-App Toast Alert */}
      {toastMessage && (
        <div 
          id="app-toast-alert"
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 rounded-2xl bg-slate-900/95 px-5 py-3 text-xs font-semibold text-white shadow-2xl border border-blue-500/40 backdrop-blur-xl animate-in fade-in slide-in-from-bottom-3 duration-200 flex items-center gap-2.5"
        >
          <span className="flex h-2 w-2 rounded-full bg-blue-400 animate-ping" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
