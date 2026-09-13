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
  uploadSyncState,
  downloadSyncState,
  createCloudSyncCode,
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
import { HomeExperience } from './components/HomeExperience';
import { ONLINE_CHRISTIAN_VIDEOS } from './data/christianOnlineData';
import { cacheDirectMedia, deleteCachedMedia } from './services/offlineService';
import { extractYouTubeId } from './utils/christianFilter';
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

  // Combined library: keep the built-in catalog and add verified YouTube results.
  const allSermons = React.useMemo(() => {
    const map = new Map<string, Sermon>();
    [...SERMONS, ...ONLINE_CHRISTIAN_VIDEOS, ...liveYouTubeSermons, ...customOnlineVideos].forEach((s) => map.set(s.id, s));
    return [...map.values()];
  }, [liveYouTubeSermons, customOnlineVideos]);

  // Persist locally immediately and synchronize with the server after changes settle.
  useEffect(() => {
    saveSyncState(syncState);
    const timer = window.setTimeout(() => {
      uploadSyncState(syncState)
        .then((uploaded) => setSyncState((prev) => prev.lastSynced === syncState.lastSynced ? { ...prev, lastSynced: uploaded.lastSynced } : prev))
        .catch((error) => console.warn('Cloud sync unavailable:', error));
    }, 700);
    return () => window.clearTimeout(timer);
  }, [syncState]);

  // Same-browser tabs sync immediately; paired devices pull the latest state periodically.
  useEffect(() => {
    const unsubscribe = subscribeToCrossDeviceSync((remoteState) => setSyncState(remoteState));
    const timer = window.setInterval(async () => {
      if (!syncState.syncCode) return;
      try {
        const remote = await downloadSyncState(syncState.syncCode);
        const remoteTime = Date.parse(remote.lastSynced);
        const localTime = Date.parse(syncState.lastSynced);
        if (remoteTime > localTime + 1000) setSyncState(remote);
      } catch { /* pairing code may not exist yet */ }
    }, 5000);
    return () => { unsubscribe(); window.clearInterval(timer); };
  }, [syncState.syncCode, syncState.lastSynced]);

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
          if (channels[chIdx]) {
            setCurrentChannel(channels[chIdx]);
            showToast(`Switched to CH ${channels[chIdx].number}: ${channels[chIdx].name}`);
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
  }, [currentTab, selectedSermon, isSyncModalOpen, isAlertsOpen, channels, currentChannel]);

  // Channel changing
  const changeChannelDelta = (delta: number) => {
    const currentIndex = channels.findIndex((c) => c.id === currentChannel.id);
    let nextIndex = currentIndex < 0 ? 0 : currentIndex + delta;
    if (nextIndex < 0) nextIndex = channels.length - 1;
    if (nextIndex >= channels.length) nextIndex = 0;
    const nextCh = channels[nextIndex];
    setCurrentChannel(nextCh);
    showToast(`Tuning to CH ${nextCh.number}: ${nextCh.name}`);
  };

  const jumpToChannelNumber = (channelNum: number) => {
    const found = channels.find((c) => c.number === channelNum);
    if (found) {
      setCurrentChannel(found);
      setCurrentTab('live-tv');
      showToast(`Tuned to CH ${found.number}: ${found.name}`);
    } else {
      showToast(`Channel ${channelNum} not found.`);
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

  const handleDownloadSermon = useCallback(async (sermonId: string, quality: '1080p' | '720p' | 'Audio Only', _sizeMb: number) => {
    const sermon = allSermons.find((s) => s.id === sermonId);
    if (!sermon) return;
    if (sermon.youtubeId || extractYouTubeId(sermon.videoUrl)) {
      showToast('YouTube videos cannot be downloaded by this app. Use YouTube-supported offline features where available.');
      return;
    }
    try {
      const result = await cacheDirectMedia(sermon.id, sermon.videoUrl);
      setSyncState((prev) => ({ ...prev, downloadedSermons: [
        { sermonId, downloadedAt: new Date().toISOString(), quality, sizeMb: result.sizeMb, sourceUrl: sermon.videoUrl, storageKey: sermon.id },
        ...prev.downloadedSermons.filter((d) => d.sermonId !== sermonId),
      ] }));
      showToast(`Saved ${result.sizeMb} MB to this device for offline playback.`);
    } catch (error: any) {
      showToast(error?.message || 'Offline caching failed.');
    }
  }, [allSermons]);

  const handleDeleteDownload = useCallback(async (sermonId: string) => {
    await deleteCachedMedia(sermonId);
    setSyncState((prev) => ({ ...prev, downloadedSermons: prev.downloadedSermons.filter((d) => d.sermonId !== sermonId) }));
    showToast('Removed offline media from this device.');
  }, []);

  const handleSelectProfile = useCallback((profileId: string) => {
    setSyncState((prev) => ({ ...prev, currentProfileId: profileId }));
    const profile = syncState.profiles.find((p) => p.id === profileId);
    showToast(`Switched profile to ${profile?.name || 'Family'}`);
  }, [syncState.profiles]);

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
          showToast(next ? 'Offline mode enabled: only media cached on this device is shown.' : 'Online mode restored');
        }}
        syncState={syncState}
        onSelectProfile={handleSelectProfile}
        unreadAlertsCount={syncState.reminders.length}
        onOpenAlerts={() => setIsAlertsOpen(true)}
      />

      {/* Main Body Container formatted for device mode */}
      <main id="app-content" className={`flex-1 p-4 sm:p-6 transition-all mx-auto w-full ${
        deviceMode === 'mobile'
          ? 'max-w-md border-x border-slate-800 shadow-2xl min-h-[800px] my-2'
          : deviceMode === 'tablet'
          ? 'max-w-4xl border-x border-slate-800 shadow-2xl min-h-[700px] my-2'
          : deviceMode === 'smart-tv'
          ? 'max-w-[1500px] p-6 lg:p-8'
          : 'max-w-7xl'
      }`}>
        {/* TAB: HOME / LIVE EXPERIENCE */}
        {currentTab === 'live-tv' && (
          <div className="page-home">
            <HomeExperience
              sermons={displayedSermons}
              syncState={syncState}
              onPlay={(s) => setSelectedSermon(s)}
              onNavigate={(tab) => setCurrentTab(tab)}
            />
            <div className="home-live-stage">
              <div className="stage-label"><Radio size={16} /> CHANNELS & LIVE TELEVISION</div>
              <LiveTvPlayer
                currentChannel={currentChannel}
                channels={channels}
                onSelectChannel={(ch) => { setCurrentChannel(ch); showToast(`Watching CH ${ch.number}: ${ch.name}`); }}
                onOpenGuide={() => setCurrentTab('guide')}
                onOpenSermonModal={(sermonId) => { const s = allSermons.find((item) => item.id === sermonId); if (s) setSelectedSermon(s); }}
                isFavoriteChannel={syncState.favorites.includes(currentChannel.id)}
                onToggleFavoriteChannel={(id) => handleToggleFavorite(id)}
                onOpenSyncModal={() => setIsSyncModalOpen(true)}
                deviceMode={deviceMode}
              />
            </div>
          </div>
        )}

        {/* TAB: ONLINE CHRISTIAN VIDEOS (YOUTUBE INTEGRATION) */}
        {currentTab === 'online-videos' && (
          <div className="animate-in fade-in duration-300 page-view">
            <OnlineChristianVideos
              onSelectVideo={(s) => setSelectedSermon(s)}
              syncState={syncState}
              onToggleFavorite={handleToggleFavorite}
              onToggleWatchLater={handleToggleWatchLater}
              onAddCustomChristianVideo={(newV) => {
                setCustomOnlineVideos((prev) => [newV, ...prev]);
                showToast(`Added verified Christian video "${newV.title}" to the catalog.`);
              }}
            />
          </div>
        )}

        {/* TAB: EPG PROGRAM GUIDE */}
        {currentTab === 'guide' && (
          <div className="animate-in fade-in duration-300 page-view">
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
          <div className="animate-in fade-in duration-300 page-view">
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
          <div className="animate-in fade-in duration-300 page-view">
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
          <div className="animate-in fade-in duration-300 page-view">
            <EventsCalendar
              events={UPCOMING_EVENTS}
              syncState={syncState}
              onToggleReminder={handleToggleReminder}
              onTuneToChannel={(channelId) => {
                const target = channels.find((c) => c.id === channelId) || channels[0];
                setCurrentChannel(target);
                setCurrentTab('live-tv');
                showToast(`Tuned to ${target.name}`);
              }}
            />
          </div>
        )}

        {/* TAB: OFFLINE DOWNLOADS */}
        {currentTab === 'downloads' && (
          <div className="animate-in fade-in duration-300 page-view">
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
        onPairDevice={async (code) => {
          const remote = await downloadSyncState(code);
          setSyncState(remote);
          showToast('This device is now paired and syncing through the server.');
        }}
        onGenerateSyncCode={async () => {
          const code = await createCloudSyncCode();
          setSyncState((prev) => ({ ...prev, syncCode: code }));
          return code;
        }}
      />

      {/* Alerts Popover */}
      <AlertsPopover
        isOpen={isAlertsOpen}
        onClose={() => setIsAlertsOpen(false)}
        events={UPCOMING_EVENTS}
        syncState={syncState}
        onToggleReminder={handleToggleReminder}
        onTuneToChannel={(channelId) => {
          const target = channels.find((c) => c.id === channelId) || channels[0];
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
