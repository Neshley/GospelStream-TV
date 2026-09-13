import React, { useState } from 'react';
import { 
  SyncState 
} from '../types';
import { Cast, Check, Copy, RefreshCw, X, ArrowRight, ShieldCheck } from 'lucide-react';

interface DeviceSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  syncState: SyncState;
  onPairDevice: (code: string) => Promise<void>;
  onGenerateSyncCode: () => Promise<string>;
}

export const DeviceSyncModal: React.FC<DeviceSyncModalProps> = ({
  isOpen,
  onClose,
  syncState,
  onPairDevice,
  onGenerateSyncCode,
}) => {
  const [inputCode, setInputCode] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);
  const [pairSuccessMessage, setPairSuccessMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(syncState.syncCode).catch(() => {});
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2500);
  };

  const handlePairDevice = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = inputCode.trim().toUpperCase();
    if (!/^\d{3}-\d{3}$/.test(cleanCode)) { setErrorMessage('Enter a code in 123-456 format.'); return; }
    setBusy(true); setErrorMessage(null);
    try {
      await onPairDevice(cleanCode);
      setPairSuccessMessage(`Paired with ${cleanCode}. Library, notes, reminders, and watch progress will sync through the server.`);
      setInputCode('');
      setTimeout(() => setPairSuccessMessage(null), 5000);
    } catch (error: any) { setErrorMessage(error?.message || 'Could not pair this device.'); }
    finally { setBusy(false); }
  };

  const handleGenerateNewCode = async () => {
    setBusy(true); setErrorMessage(null);
    try {
      const newCode = await onGenerateSyncCode();
      setPairSuccessMessage(`New cloud pairing code created: ${newCode}`);
      setTimeout(() => setPairSuccessMessage(null), 4000);
    } catch (error: any) { setErrorMessage(error?.message || 'Could not create a pairing code.'); }
    finally { setBusy(false); }
  };



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

        {errorMessage && (
          <div className="rounded-2xl bg-red-950/80 p-4 border border-red-500/40 text-xs text-red-200">{errorMessage}</div>
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
              disabled={busy}
              className="rounded-xl bg-slate-800 hover:bg-slate-700 p-3 text-slate-400 hover:text-white transition"
              title="Generate New Sync Code"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>

          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Open GospelStream TV on another device and enter this pairing code. The server stores the shared library state for 30 days; do not share the code publicly.
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
              disabled={!inputCode.trim() || busy}
              className="flex items-center gap-2 rounded-2xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 px-5 py-3 text-xs font-bold text-white transition active:scale-95 shadow-md shadow-blue-600/30"
            >
              <span>Pair Device</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>
        </div>

        {/* Paired-device status */}
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

          <div className="rounded-2xl bg-slate-950/80 p-4 border border-slate-800 text-xs text-slate-300 space-y-2">
            <p><strong>Current device:</strong> {syncState.deviceName}</p>
            <p className="text-slate-500">Paired devices use the same code to read and write the shared state. Playback itself remains on the device because browser apps cannot remotely control an unrelated screen without a dedicated receiver.</p>
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
