import React from 'react';
import { 
  Sermon, 
  SyncState 
} from '../types';
import { 
  DownloadCloud, 
  WifiOff, 
  Wifi, 
  Play, 
  Trash2, 
  HardDrive, 
  CheckCircle2, 
  ShieldCheck, 
  Info,
  Plus
} from 'lucide-react';

interface OfflineDownloadsProps {
  sermons: Sermon[];
  syncState: SyncState;
  isOfflineMode: boolean;
  onToggleOfflineMode: () => void;
  onSelectSermon: (sermon: Sermon) => void;
  onDeleteDownload: (sermonId: string) => void;
  onDownloadSermon: (sermonId: string, quality: '1080p' | '720p' | 'Audio Only', sizeMb: number) => void;
  onNavigateToCatalog: () => void;
}

export const OfflineDownloads: React.FC<OfflineDownloadsProps> = ({
  sermons,
  syncState,
  isOfflineMode,
  onToggleOfflineMode,
  onSelectSermon,
  onDeleteDownload,
  onDownloadSermon,
  onNavigateToCatalog,
}) => {
  // Join downloaded items with full sermon details
  const downloadedItems = syncState.downloadedSermons
    .map((item) => {
      const sermon = sermons.find((s) => s.id === item.sermonId);
      return sermon ? { ...item, sermon } : null;
    })
    .filter(Boolean) as {
      sermonId: string;
      downloadedAt: string;
      quality: '1080p' | '720p' | 'Audio Only';
      sizeMb: number;
      sermon: Sermon;
    }[];

  const totalSizeMb = downloadedItems.reduce((acc, curr) => acc + curr.sizeMb, 0);
  const totalStorageGb = 32;
  const usedStorageGb = (totalSizeMb / 1024).toFixed(2);
  const percentUsed = Math.min(100, Math.round(((totalSizeMb / 1024) / totalStorageGb) * 100));

  return (
    <div id="offline-downloads-view" className="w-full space-y-8">
      {/* Offline Mode Status Card */}
      <div className={`rounded-3xl p-6 border transition-all shadow-xl ${
        isOfflineMode 
          ? 'bg-gradient-to-r from-amber-950/80 via-slate-900 to-slate-950 border-amber-500/50' 
          : 'bg-slate-900/80 border-slate-800'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${
              isOfflineMode ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/30' : 'bg-slate-800 text-slate-400'
            }`}>
              {isOfflineMode ? <WifiOff className="h-6 w-6" /> : <Wifi className="h-6 w-6" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-display text-lg font-bold text-white tracking-tight">
                  {isOfflineMode ? 'Offline Playback Mode: ACTIVE' : 'Device Media Storage & Offline Cache'}
                </h2>
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                  isOfflineMode ? 'bg-amber-400 text-slate-950' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                }`}>
                  {isOfflineMode ? 'Airplane / Disconnected' : 'Storage Ready'}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1 max-w-xl">
                {isOfflineMode
                  ? 'Your app is disconnected from the internet. You can seamlessly play any sermon cached in your local downloads below without using cellular data or Wi-Fi.'
                  : 'Download Christian sermons and worship sessions for offline viewing during flights, road trips, or areas with poor internet connection.'}
              </p>
            </div>
          </div>

          <button
            id="btn-toggle-offline-view"
            onClick={onToggleOfflineMode}
            className={`rounded-2xl px-5 py-3 text-xs font-bold transition active:scale-95 shadow-md ${
              isOfflineMode
                ? 'bg-white text-slate-950 hover:bg-slate-200'
                : 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-600/20'
            }`}
          >
            {isOfflineMode ? 'Switch Back to Online' : 'Simulate Offline Mode'}
          </button>
        </div>

        {/* Local Storage Quota Bar */}
        <div className="mt-6 pt-4 border-t border-slate-800/80 space-y-2">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400">
            <span className="flex items-center gap-1.5">
              <HardDrive className="h-3.5 w-3.5 text-blue-400" />
              <span>Offline Media Usage: {totalSizeMb} MB ({usedStorageGb} GB) of {totalStorageGb} GB</span>
            </span>
            <span className="text-slate-300 font-bold">{downloadedItems.length} Sermons Cached</span>
          </div>

          <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full transition-all duration-300"
              style={{ width: `${Math.max(5, percentUsed)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Downloaded Sermons List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-lg font-bold text-white tracking-tight flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-emerald-400" />
            <span>Downloaded Sermons Available Offline ({downloadedItems.length})</span>
          </h3>

          <button
            onClick={onNavigateToCatalog}
            className="flex items-center gap-1.5 text-xs font-semibold text-blue-400 hover:text-blue-300 transition"
          >
            <Plus className="h-4 w-4" />
            <span>Browse More Sermons to Download</span>
          </button>
        </div>

        {downloadedItems.length === 0 ? (
          <div className="rounded-3xl bg-slate-900/40 p-12 text-center border border-slate-850 space-y-3">
            <DownloadCloud className="h-12 w-12 text-slate-600 mx-auto" />
            <h4 className="text-base font-bold text-slate-300">No Sermons Downloaded Yet</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Tap the download button on any sermon in the catalog to cache it locally on this device for offline playback.
            </p>
            <button
              onClick={onNavigateToCatalog}
              className="rounded-xl bg-blue-600 hover:bg-blue-500 px-4 py-2 text-xs font-bold text-white transition"
            >
              Browse Sermon Catalog
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {downloadedItems.map(({ sermon, downloadedAt, quality, sizeMb }) => (
              <div
                key={sermon.id}
                className="group relative flex flex-col overflow-hidden rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-emerald-500/50 transition-all shadow-xl"
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
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />

                  {/* Offline Ready Badge */}
                  <div className="absolute top-2.5 left-2.5 rounded-lg bg-emerald-600 px-2 py-0.5 text-[10px] font-bold text-white flex items-center gap-1 shadow">
                    <CheckCircle2 className="h-3 w-3" />
                    <span>Offline Cache: {quality}</span>
                  </div>

                  <div className="absolute bottom-2.5 right-2.5 rounded-lg bg-black/80 px-2 py-0.5 text-[10px] font-mono font-bold text-slate-200">
                    {sermon.durationFormatted} • {sizeMb} MB
                  </div>

                  {/* Play Hover Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-600 text-white shadow-xl">
                      <Play className="h-6 w-6 fill-current ml-0.5" />
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="flex flex-1 flex-col p-4 space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                    <span className="text-amber-400 font-semibold">📖 {sermon.scripture}</span>
                    <span>Cached {downloadedAt}</span>
                  </div>

                  <h4 
                    onClick={() => onSelectSermon(sermon)}
                    className="cursor-pointer text-sm font-bold text-white group-hover:text-emerald-300 transition line-clamp-1"
                  >
                    {sermon.title}
                  </h4>

                  <p className="text-xs text-slate-400">
                    {sermon.preacher}
                  </p>

                  <div className="mt-auto flex items-center justify-between border-t border-slate-800 pt-3">
                    <button
                      onClick={() => onSelectSermon(sermon)}
                      className="flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 px-3.5 py-1.5 text-xs font-bold text-white transition active:scale-95 shadow-md shadow-emerald-600/20"
                    >
                      <Play className="h-3.5 w-3.5 fill-current" />
                      <span>Play Offline</span>
                    </button>

                    <button
                      onClick={() => onDeleteDownload(sermon.id)}
                      className="flex items-center gap-1 text-xs text-slate-400 hover:text-red-400 p-1 transition"
                      title="Remove downloaded file from device"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="text-[11px]">Remove</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recommended for Offline Download Shelf */}
      <div className="rounded-3xl bg-slate-900/50 p-6 border border-slate-850 space-y-4">
        <h4 className="font-display text-base font-bold text-white tracking-tight flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-blue-400" />
          <span>Recommended for Weekend Offline Devotions</span>
        </h4>
        <p className="text-xs text-slate-400">
          Popular messages chosen by thousands of believers for road trips and prayer retreats.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {sermons.slice(1, 4).map((sermon) => {
            const isDownloaded = syncState.downloadedSermons.some((d) => d.sermonId === sermon.id);
            return (
              <div key={sermon.id} className="flex items-center justify-between rounded-xl bg-slate-950 p-3 border border-slate-800">
                <div className="flex items-center gap-3">
                  <img
                    src={sermon.thumbnailUrl}
                    alt={sermon.title}
                    referrerPolicy="no-referrer"
                    className="h-12 w-16 rounded-lg object-cover"
                  />
                  <div>
                    <h5 className="text-xs font-bold text-white line-clamp-1">{sermon.title}</h5>
                    <span className="text-[11px] text-slate-400">{sermon.preacher}</span>
                  </div>
                </div>

                {isDownloaded ? (
                  <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="h-4 w-4" />
                  </span>
                ) : (
                  <button
                    onClick={() => onDownloadSermon(sermon.id, '1080p', sermon.downloadSizeMb)}
                    className="rounded-lg bg-blue-600 hover:bg-blue-500 p-2 text-white transition"
                    title={`Download (${sermon.downloadSizeMb} MB)`}
                  >
                    <DownloadCloud className="h-4 w-4" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
