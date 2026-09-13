import React, { useState } from 'react';
import { 
  SyncState 
} from '../types';
import { 
  Cast, 
  Tv, 
  Smartphone, 
  Tablet, 
  Monitor, 
  Check, 
  Copy, 
  RefreshCw, 
  QrCode, 
  X, 
  Radio, 
  Share2, 
  ArrowRight,
  ShieldCheck,
  Flame
} from 'lucide-react';
import { generateDeviceSyncCode } from '../services/storageService';

interface DeviceSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  syncState: SyncState;
  onUpdateSyncState: (updater: (prev: SyncState) => SyncState) => void;
  onHandoffToDevice: (deviceName: string) => void;
}

export const DeviceSyncModal: React.FC<DeviceSyncModalProps> = ({
  isOpen,
  onClose,
  syncState,
  onUpdateSyncState,
  onHandoffToDevice,
}) => {
  const [inputCode, setInputCode] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);
  const [pairSuccessMessage, setPairSuccessMessage] = useState<string | null>(null);
  const [handoffSuccessDevice, setHandoffSuccessDevice] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(syncState.syncCode).catch(() => {});
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2500);
  };

  const handlePairDevice = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = inputCode.trim().toUpperCase();
    if (!cleanCode) return;

    onUpdateSyncState((prev) => ({
      ...prev,
      syncCode: cleanCode,
      lastSynced: 'Just now',
    }));

    setPairSuccessMessage(`Successfully connected with device code ${cleanCode}! All sermons, watch history, and library notes are now synchronized.`);
    setInputCode('');
    setTimeout(() => setPairSuccessMessage(null), 5000);
  };

  const handleGenerateNewCode = () => {
    const newCode = generateDeviceSyncCode();
    onUpdateSyncState((prev) => ({
      ...prev,
      syncCode: newCode,
      lastSynced: 'Just now',
    }));
  };

  const handleHandoff = (devName: string) => {
    onHandoffToDevice(devName);
    setHandoffSuccessDevice(devName);
    setTimeout(() => setHandoffSuccessDevice(null), 3000);
  };

  const registeredDevices = [
    {
      id: 'dev-1',
      name: 'Living Room Smart TV (LG OLED)',
      type: 'tv',
      icon: <Tv className="h-5 w-5 text-blue-400" />,
      status: 'Active Now',
      isCurrent: syncState.deviceName.includes('Living Room'),
    },
    {
      id: 'dev-2',
      name: 'Family Tablet (iPad Air)',
      type: 'tablet',
      icon: <Tablet className="h-5 w-5 text-amber-400" />,
      status: 'Synced 3 mins ago',
      isCurrent: false,
    },
    {
      id: 'dev-3',
      name: 'Mobile Phone (iPhone 16 / Android)',
      type: 'mobile',
      icon: <Smartphone className="h-5 w-5 text-emerald-400" />,
      status: 'Connected',
      isCurrent: false,
    },
  ];

  return (
    <div 
      id="device-sync-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md animate-in fade-in"
    >
      <div 
        id="device-sync-modal-container"
        className="w-full max-w-2xl rounded-3xl bg-slate-900 border border-slate-700 shadow-2xl p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-600/20 text-blue-400 border border-blue-500/30">
              <Cast className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-display text-xl font-bold text-white tracking-tight">
                Cross-Platform Device Sync
              </h3>
              <p className="text-xs text-slate-400">
                Seamless Christian streaming across Mobile, Tablet, and Smart TV.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-full p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Success Alert */}
        {pairSuccessMessage && (
          <div className="rounded-2xl bg-emerald-950/80 p-4 border border-emerald-500/40 text-xs text-emerald-200 flex items-center gap-3">
            <ShieldCheck className="h-5 w-5 text-emerald-400 shrink-0" />
            <span>{pairSuccessMessage}</span>
          </div>
        )}

        {handoffSuccessDevice && (
          <div className="rounded-2xl bg-blue-950/80 p-4 border border-blue-500/40 text-xs text-blue-200 flex items-center gap-3 animate-in fade-in">
            <Cast className="h-5 w-5 text-blue-400 shrink-0" />
            <span>Successfully handed off broadcast to <strong>{handoffSuccessDevice}</strong> with exact playback progress!</span>
          </div>
        )}

        {/* Device Sync Code Showcase */}
        <div className="rounded-3xl bg-gradient-to-br from-slate-950 to-blue-950/50 p-6 border border-slate-800 text-center space-y-4">
          <span className="text-[11px] font-bold uppercase tracking-widest text-blue-400">
            THIS DEVICE'S SYNC CODE
          </span>

          <div className="flex items-center justify-center gap-4">
            <div className="rounded-2xl bg-slate-900 px-6 py-3 border-2 border-blue-500/40 font-mono text-3xl font-extrabold tracking-widest text-amber-400 shadow-inner">
              {syncState.syncCode}
            </div>

            <button
              onClick={handleCopyCode}
              className="flex items-center gap-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 px-3.5 py-3 text-xs font-semibold text-slate-200 border border-slate-700 transition active:scale-95"
              title="Copy Code"
            >
              {copySuccess ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
              <span>{copySuccess ? 'Copied' : 'Copy'}</span>
            </button>

            <button
              onClick={handleGenerateNewCode}
              className="rounded-xl bg-slate-800 hover:bg-slate-700 p-3 text-slate-400 hover:text-white transition"
              title="Generate New Sync Code"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>

          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Open GospelStream TV on your <strong>Smart TV, iPhone, iPad, or Android</strong> and enter this 6-digit code to link your accounts instantly.
          </p>
        </div>

        {/* Enter Code to Pair Another Device */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Pair with Another Screen / Smart TV
          </h4>

          <form onSubmit={handlePairDevice} className="flex gap-2">
            <input
              type="text"
              value={inputCode}
              onChange={(e) => setInputCode(e.target.value)}
              placeholder="Enter 6-digit code (e.g. 842-190)"
              className="flex-1 rounded-2xl bg-slate-950 px-4 py-3 text-sm font-mono text-white placeholder-slate-500 border border-slate-800 focus:border-blue-500 focus:outline-none"
            />
            <button
              type="submit"
              disabled={!inputCode.trim()}
              className="flex items-center gap-2 rounded-2xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 px-5 py-3 text-xs font-bold text-white transition active:scale-95 shadow-md shadow-blue-600/30"
            >
              <span>Pair Device</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>
        </div>

        {/* Connected Ecosystem Devices & Instant Handoff */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Active Synced Ecosystem
            </h4>
            <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
              Auto-Syncing Active
            </span>
          </div>

          <div className="space-y-2.5">
            {registeredDevices.map((dev) => (
              <div
                key={dev.id}
                className="flex items-center justify-between rounded-2xl bg-slate-950/80 p-3.5 border border-slate-800 transition"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 border border-slate-800">
                    {dev.icon}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs sm:text-sm font-bold text-white">
                        {dev.name}
                      </span>
                      {dev.isCurrent && (
                        <span className="rounded bg-blue-500/20 px-1.5 py-0.5 text-[9px] font-bold text-blue-400">
                          Current Device
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-slate-400">
                      {dev.status}
                    </span>
                  </div>
                </div>

                {!dev.isCurrent && (
                  <button
                    onClick={() => handleHandoff(dev.name)}
                    className="flex items-center gap-1.5 rounded-xl bg-slate-900 hover:bg-blue-600/30 px-3 py-1.5 text-xs font-semibold text-blue-300 border border-slate-800 hover:border-blue-500/40 transition active:scale-95"
                    title={`Send current video playback to ${dev.name}`}
                  >
                    <Cast className="h-3.5 w-3.5" />
                    <span>Handoff to Screen</span>
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Sync Summary Checklist */}
        <div className="rounded-2xl bg-slate-950 p-4 border border-slate-850 text-xs text-slate-400 space-y-2">
          <div className="font-semibold text-slate-300 flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            <span>What is synchronized across your devices?</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <div className="flex items-center gap-1 text-slate-300">✓ Personalized Library & Favorites</div>
            <div className="flex items-center gap-1 text-slate-300">✓ Continue Watching Timestamps</div>
            <div className="flex items-center gap-1 text-slate-300">✓ Sermon Study Notes</div>
            <div className="flex items-center gap-1 text-slate-300">✓ Live Broadcast Reminders</div>
          </div>
        </div>

        {/* Done button */}
        <div className="flex justify-end pt-2">
          <button
            onClick={onClose}
            className="rounded-2xl bg-blue-600 hover:bg-blue-500 px-6 py-2.5 text-xs font-bold text-white transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
