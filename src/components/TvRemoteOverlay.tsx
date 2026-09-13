import React, { useState } from 'react';
import { 
  Tv, 
  ChevronUp, 
  ChevronDown, 
  ChevronLeft, 
  ChevronRight, 
  Volume2, 
  VolumeX, 
  Play, 
  Pause, 
  List, 
  RotateCcw, 
  Radio, 
  X, 
  Maximize, 
  MessageSquare
} from 'lucide-react';

interface TvRemoteOverlayProps {
  onNavigate: (direction: 'up' | 'down' | 'left' | 'right' | 'select' | 'back') => void;
  onChannelChange: (delta: number) => void;
  onChannelJump: (channelNum: number) => void;
  onTogglePlay: () => void;
  onToggleMute: () => void;
  onToggleGuide: () => void;
  onToggleFullscreen: () => void;
  onToggleCaptions: () => void;
  isPlaying: boolean;
  isMuted: boolean;
  currentChannelNum?: number;
  isOpen: boolean;
  onClose: () => void;
}

export const TvRemoteOverlay: React.FC<TvRemoteOverlayProps> = ({
  onNavigate,
  onChannelChange,
  onChannelJump,
  onTogglePlay,
  onToggleMute,
  onToggleGuide,
  onToggleFullscreen,
  onToggleCaptions,
  isPlaying,
  isMuted,
  currentChannelNum = 101,
  isOpen,
  onClose,
}) => {
  const [keypadInput, setKeypadInput] = useState('');

  if (!isOpen) return null;

  const handleNumClick = (num: number) => {
    const next = keypadInput + num.toString();
    setKeypadInput(next);
    if (next.length >= 3) {
      const channelNumber = parseInt(next, 10);
      onChannelJump(channelNumber);
      setKeypadInput('');
    }
  };

  return (
    <div 
      id="smart-tv-remote-modal"
      className="fixed bottom-6 right-6 z-50 w-72 rounded-3xl bg-slate-950/95 p-4 text-slate-100 shadow-2xl border border-slate-700/80 backdrop-blur-xl animate-in fade-in slide-in-from-bottom-6 duration-200"
    >
      {/* Remote Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600/30 text-blue-400 border border-blue-500/30">
            <Tv className="h-4 w-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold tracking-wider uppercase text-slate-200">Smart TV Remote</h4>
            <span className="text-[10px] text-blue-400 font-mono">CH {currentChannelNum}</span>
          </div>
        </div>
        <button
          id="btn-close-remote"
          onClick={onClose}
          className="rounded-full p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          title="Close Virtual Remote"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Direct Channel Dial Screen */}
      <div className="mt-3 flex items-center justify-between rounded-xl bg-slate-900 px-3 py-2 border border-slate-800">
        <span className="text-[11px] text-slate-400 uppercase tracking-wider">Dial Ch:</span>
        <span className="font-mono text-sm font-semibold tracking-widest text-emerald-400">
          {keypadInput || `CH ${currentChannelNum}`}
        </span>
        {keypadInput && (
          <button 
            onClick={() => setKeypadInput('')} 
            className="text-[10px] text-slate-500 hover:text-slate-300"
          >
            Clear
          </button>
        )}
      </div>

      {/* D-Pad Controller */}
      <div className="mt-4 flex flex-col items-center justify-center">
        <div className="relative flex h-40 w-40 items-center justify-center rounded-full bg-slate-900 border-2 border-slate-800 shadow-inner">
          {/* UP */}
          <button
            id="remote-btn-up"
            onClick={() => onNavigate('up')}
            className="absolute top-1 flex h-10 w-12 items-center justify-center rounded-t-full text-slate-400 hover:bg-blue-600/30 hover:text-blue-300 active:scale-95 transition-all"
            title="Navigate Up"
          >
            <ChevronUp className="h-5 w-5" />
          </button>

          {/* DOWN */}
          <button
            id="remote-btn-down"
            onClick={() => onNavigate('down')}
            className="absolute bottom-1 flex h-10 w-12 items-center justify-center rounded-b-full text-slate-400 hover:bg-blue-600/30 hover:text-blue-300 active:scale-95 transition-all"
            title="Navigate Down"
          >
            <ChevronDown className="h-5 w-5" />
          </button>

          {/* LEFT */}
          <button
            id="remote-btn-left"
            onClick={() => onNavigate('left')}
            className="absolute left-1 flex h-12 w-10 items-center justify-center rounded-l-full text-slate-400 hover:bg-blue-600/30 hover:text-blue-300 active:scale-95 transition-all"
            title="Navigate Left"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          {/* RIGHT */}
          <button
            id="remote-btn-right"
            onClick={() => onNavigate('right')}
            className="absolute right-1 flex h-12 w-10 items-center justify-center rounded-r-full text-slate-400 hover:bg-blue-600/30 hover:text-blue-300 active:scale-95 transition-all"
            title="Navigate Right"
          >
            <ChevronRight className="h-5 w-5" />
          </button>

          {/* OK / SELECT CENTER */}
          <button
            id="remote-btn-select"
            onClick={() => onNavigate('select')}
            className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-blue-700 font-bold text-white shadow-lg hover:brightness-110 active:scale-90 transition-all"
            title="OK / Select"
          >
            OK
          </button>
        </div>
      </div>

      {/* Navigation Buttons: Back, Guide, Fullscreen */}
      <div className="mt-4 grid grid-cols-3 gap-2">
        <button
          id="remote-btn-back"
          onClick={() => onNavigate('back')}
          className="flex flex-col items-center justify-center rounded-xl bg-slate-900 py-2 text-slate-300 hover:bg-slate-800 active:scale-95 border border-slate-800 transition"
        >
          <RotateCcw className="h-4 w-4 mb-0.5 text-slate-400" />
          <span className="text-[10px] font-medium">Back</span>
        </button>

        <button
          id="remote-btn-guide"
          onClick={onToggleGuide}
          className="flex flex-col items-center justify-center rounded-xl bg-slate-900 py-2 text-blue-300 hover:bg-blue-900/30 active:scale-95 border border-blue-900/40 transition"
        >
          <List className="h-4 w-4 mb-0.5 text-blue-400" />
          <span className="text-[10px] font-medium">EPG Guide</span>
        </button>

        <button
          id="remote-btn-fullscreen"
          onClick={onToggleFullscreen}
          className="flex flex-col items-center justify-center rounded-xl bg-slate-900 py-2 text-slate-300 hover:bg-slate-800 active:scale-95 border border-slate-800 transition"
        >
          <Maximize className="h-4 w-4 mb-0.5 text-slate-400" />
          <span className="text-[10px] font-medium">Full TV</span>
        </button>
      </div>

      {/* Rocker Controls: Channel +/- and Volume/Mute */}
      <div className="mt-3 grid grid-cols-2 gap-3">
        {/* Channel Rocker */}
        <div className="flex items-center justify-between rounded-2xl bg-slate-900 p-1 border border-slate-800">
          <button
            id="remote-btn-ch-down"
            onClick={() => onChannelChange(-1)}
            className="flex-1 py-1.5 text-center text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl active:scale-95"
            title="Channel Down"
          >
            CH -
          </button>
          <Radio className="h-3 w-3 text-blue-400 mx-1" />
          <button
            id="remote-btn-ch-up"
            onClick={() => onChannelChange(1)}
            className="flex-1 py-1.5 text-center text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl active:scale-95"
            title="Channel Up"
          >
            CH +
          </button>
        </div>

        {/* Play & Mute */}
        <div className="flex items-center justify-between rounded-2xl bg-slate-900 p-1 border border-slate-800">
          <button
            id="remote-btn-play-pause"
            onClick={onTogglePlay}
            className="flex-1 py-1.5 flex justify-center text-xs text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl active:scale-95"
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? <Pause className="h-4 w-4 text-emerald-400" /> : <Play className="h-4 w-4 text-emerald-400 fill-current" />}
          </button>
          <button
            id="remote-btn-mute"
            onClick={onToggleMute}
            className="flex-1 py-1.5 flex justify-center text-xs text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl active:scale-95"
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? <VolumeX className="h-4 w-4 text-red-400" /> : <Volume2 className="h-4 w-4 text-blue-400" />}
          </button>
        </div>
      </div>

      {/* Number Pad for direct channels 101-106 */}
      <div className="mt-3">
        <div className="grid grid-cols-3 gap-1 text-center">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
            <button
              key={n}
              onClick={() => handleNumClick(n)}
              className="rounded-lg bg-slate-900/80 py-1.5 text-xs font-semibold text-slate-300 hover:bg-slate-800 hover:text-white active:scale-95 border border-slate-850"
            >
              {n}
            </button>
          ))}
          <button
            onClick={onToggleCaptions}
            className="rounded-lg bg-slate-900/80 py-1.5 text-[11px] font-semibold text-slate-400 hover:bg-slate-800 flex items-center justify-center gap-1"
            title="Toggle Subtitles / CC"
          >
            <MessageSquare className="h-3 w-3" />
            CC
          </button>
          <button
            onClick={() => handleNumClick(0)}
            className="rounded-lg bg-slate-900/80 py-1.5 text-xs font-semibold text-slate-300 hover:bg-slate-800"
          >
            0
          </button>
          <button
            onClick={() => {
              onChannelJump(101);
            }}
            className="rounded-lg bg-blue-900/40 py-1.5 text-[10px] font-bold text-blue-300 hover:bg-blue-800/50"
            title="Jump to Main Gospel Channel"
          >
            GBN 101
          </button>
        </div>
      </div>
      
      <p className="mt-2 text-center text-[10px] text-slate-500">
        Keyboard: Arrows = Nav, Enter = Select, C = Guide, Spc = Pause
      </p>
    </div>
  );
};
