import React, { useState } from 'react';
import { 
  Channel, 
  Program 
} from '../types';
import { 
  Tv, 
  Play, 
  Bell, 
  Check, 
  Info, 
  Clock, 
  Calendar, 
  Radio, 
  Search,
  Volume2,
  BookOpen,
  ArrowRight,
  Sparkles
} from 'lucide-react';

interface ChannelGuideProps {
  channels: Channel[];
  currentChannel: Channel;
  onSelectChannel: (channel: Channel) => void;
  reminders: string[];
  onToggleReminder: (eventIdOrTitle: string) => void;
  onCloseGuide?: () => void;
}

export const ChannelGuide: React.FC<ChannelGuideProps> = ({
  channels,
  currentChannel,
  onSelectChannel,
  reminders,
  onToggleReminder,
  onCloseGuide,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [activeProgramDetail, setActiveProgramDetail] = useState<{ channel: Channel; program: Program } | null>(null);
  const [guideSearch, setGuideSearch] = useState<string>('');

  const categories = ['All', 'Sermons & Preaching', 'Praise & Worship', 'Theological Teaching', 'Family & Marriage', 'Documentaries'];

  const filteredChannels = channels.filter((c) => {
    const matchesCategory = selectedCategory === 'All' || c.category === selectedCategory;
    if (!guideSearch.trim()) return matchesCategory;
    const q = guideSearch.toLowerCase();
    const matchesName = c.name.toLowerCase().includes(q) || String(c.number).includes(q);
    const matchesProg = c.currentProgram?.title.toLowerCase().includes(q) || c.currentProgram?.speaker.toLowerCase().includes(q);
    return matchesCategory && (matchesName || matchesProg);
  });

  return (
    <div id="epg-channel-guide" className="w-full space-y-6">
      {/* Currently Tuned Station Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-950/80 via-slate-900 to-slate-950 p-6 border border-blue-500/30 shadow-2xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 relative z-10">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-400 font-mono text-xl font-bold text-slate-950 shadow-lg shadow-amber-500/20">
              CH {currentChannel.number}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-red-400 bg-red-500/10 px-2 py-0.5 rounded border border-red-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
                  Currently Tuned
                </span>
                <span className="text-xs text-slate-400 font-medium">{currentChannel.category}</span>
              </div>
              <h3 className="font-display text-xl sm:text-2xl font-bold text-white tracking-tight mt-1">
                {currentChannel.currentProgram?.title || currentChannel.name}
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 mt-0.5">
                {currentChannel.currentProgram?.speaker} · Airing on <strong className="text-white">{currentChannel.name}</strong>
                {currentChannel.currentProgram?.scriptureRef && (
                  <span className="text-amber-300 ml-2 font-mono">({currentChannel.currentProgram.scriptureRef})</span>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => {
                if (onCloseGuide) onCloseGuide();
              }}
              className="flex items-center gap-2 rounded-xl bg-white hover:bg-slate-100 text-slate-950 px-5 py-2.5 text-xs font-bold transition shadow-lg active:scale-95"
            >
              <Play size={15} fill="currentColor" />
              <span>Watch Main Stage</span>
            </button>
            <button
              onClick={() => setActiveProgramDetail({ channel: currentChannel, program: currentChannel.currentProgram })}
              className="flex items-center gap-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white px-4 py-2.5 text-xs font-semibold border border-slate-700 transition"
            >
              <Info size={14} />
              <span>Show Details</span>
            </button>
          </div>
        </div>
      </div>

      {/* Guide Header & Search / Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={guideSearch}
            onChange={(e) => setGuideSearch(e.target.value)}
            placeholder="Search channels, pastors, or broadcasts..."
            className="w-full rounded-xl bg-slate-900/90 pl-10 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 border border-slate-800 focus:border-blue-500 focus:outline-none transition"
          />
        </div>

        {/* Category Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 shelf-scroll">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`rounded-xl px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition ${
                selectedCategory === cat
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-900/80 text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Guide Time Headers (Desktop) */}
      <div className="hidden lg:grid grid-cols-12 gap-3 text-xs font-mono font-semibold uppercase tracking-wider text-slate-500 px-3">
        <div className="col-span-3">Station Network</div>
        <div className="col-span-5">Now Airing (Live Broadcast)</div>
        <div className="col-span-4">Up Next Schedule</div>
      </div>

      {/* Channel Rows */}
      <div className="space-y-3">
        {filteredChannels.map((channel) => {
          const isCurrentlyPlaying = channel.id === currentChannel.id;
          const currentProg = channel.currentProgram;
          const nextProg = channel.upcomingPrograms[0];

          return (
            <div
              key={channel.id}
              className={`rounded-2xl border transition-all ${
                isCurrentlyPlaying
                  ? 'bg-gradient-to-r from-blue-950/40 via-slate-900/95 to-slate-900 border-blue-500/50 shadow-lg shadow-blue-500/10'
                  : 'bg-slate-950/70 border-slate-800/80 hover:border-slate-700'
              }`}
            >
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 p-4 items-center">
                {/* Channel Header / Left Column */}
                <div className="lg:col-span-3 flex items-center justify-between lg:justify-start gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-900 font-mono text-base font-bold text-amber-400 border border-slate-800 shadow-inner">
                      {channel.number}
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-sm font-bold text-white tracking-tight leading-snug truncate">
                        {channel.name}
                      </h4>
                      <span className="text-[11px] text-slate-400 font-medium truncate block">
                        {channel.tagline}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      onSelectChannel(channel);
                      if (onCloseGuide) onCloseGuide();
                    }}
                    className={`shrink-0 rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
                      isCurrentlyPlaying
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-blue-600 hover:bg-blue-500 text-white'
                    }`}
                  >
                    {isCurrentlyPlaying ? 'Watching' : 'Tune In'}
                  </button>
                </div>

                {/* Now Playing Slot (Live) */}
                <div 
                  onClick={() => setActiveProgramDetail({ channel, program: currentProg })}
                  className="lg:col-span-5 cursor-pointer rounded-xl bg-slate-900/80 hover:bg-slate-850 p-3.5 border border-slate-800/80 transition group"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <span className="flex h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                      <span className="text-[10px] font-black uppercase tracking-wider text-red-400">
                        {currentProg.isLive ? 'LIVE' : 'FEATURED AIRING'}
                      </span>
                    </div>
                    <span className="text-[11px] font-mono text-slate-400">
                      {currentProg.startTimeFormatted} - {currentProg.endTimeFormatted}
                    </span>
                  </div>

                  <h5 className="text-xs sm:text-sm font-bold text-white group-hover:text-blue-300 transition mt-1 line-clamp-1">
                    {currentProg.title}
                  </h5>

                  <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">
                    {currentProg.speaker}
                    {currentProg.scriptureRef && (
                      <span className="text-amber-400 font-medium ml-1.5 font-mono">
                        · {currentProg.scriptureRef}
                      </span>
                    )}
                  </p>
                </div>

                {/* Up Next Slot */}
                {nextProg ? (
                  <div 
                    onClick={() => setActiveProgramDetail({ channel, program: nextProg })}
                    className="lg:col-span-4 cursor-pointer rounded-xl bg-slate-900/40 hover:bg-slate-850 p-3.5 border border-slate-850 transition group"
                  >
                    <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                      <span className="uppercase text-slate-500 font-bold">UP NEXT</span>
                      <span>{nextProg.startTimeFormatted}</span>
                    </div>
                    <h5 className="text-xs font-semibold text-slate-200 group-hover:text-amber-300 transition mt-1 line-clamp-1">
                      {nextProg.title}
                    </h5>
                    <p className="text-[11px] text-slate-400 line-clamp-1">
                      {nextProg.speaker}
                    </p>
                  </div>
                ) : (
                  <div className="lg:col-span-4 text-xs text-slate-600 italic p-3">
                    Scheduled broadcast resumes shortly
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Program Detail Modal */}
      {activeProgramDetail && (
        <div 
          id="epg-program-modal"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md animate-in fade-in"
        >
          <div className="w-full max-w-lg rounded-3xl bg-slate-900 p-6 border border-slate-700 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="rounded-lg bg-blue-600 px-2 py-0.5 font-mono text-xs font-bold text-white">
                  CH {activeProgramDetail.channel.number}
                </span>
                <span className="text-xs font-semibold text-slate-300">
                  {activeProgramDetail.channel.name}
                </span>
              </div>
              <button
                onClick={() => setActiveProgramDetail(null)}
                className="text-slate-400 hover:text-white text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div>
              <div className="text-xs font-mono text-amber-400 mb-1">
                {activeProgramDetail.program.startTimeFormatted} - {activeProgramDetail.program.endTimeFormatted}
              </div>
              <h3 className="font-display text-xl font-bold text-white">
                {activeProgramDetail.program.title}
              </h3>
              <p className="text-sm font-semibold text-blue-300 mt-1">
                {activeProgramDetail.program.speaker}
              </p>
              {activeProgramDetail.program.scriptureRef && (
                <div className="mt-3 rounded-xl bg-slate-950/60 p-3 text-xs text-amber-200 border border-slate-800 font-mono">
                  Scripture Theme: {activeProgramDetail.program.scriptureRef}
                </div>
              )}
              <p className="text-xs text-slate-300 mt-3 leading-relaxed">
                {activeProgramDetail.program.description}
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                onClick={() => onToggleReminder(activeProgramDetail.program.id || activeProgramDetail.program.title)}
                className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-semibold transition border ${
                  reminders.includes(activeProgramDetail.program.id || activeProgramDetail.program.title)
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                }`}
              >
                <Bell size={14} />
                <span>
                  {reminders.includes(activeProgramDetail.program.id || activeProgramDetail.program.title)
                    ? 'Reminder Set'
                    : 'Set Broadcast Reminder'}
                </span>
              </button>
              <button
                onClick={() => {
                  onSelectChannel(activeProgramDetail.channel);
                  setActiveProgramDetail(null);
                  if (onCloseGuide) onCloseGuide();
                }}
                className="flex items-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white px-5 py-2 text-xs font-bold transition"
              >
                <Play size={14} fill="currentColor" />
                <span>Watch Channel Now</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
