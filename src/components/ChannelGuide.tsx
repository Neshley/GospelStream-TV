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
  Filter, 
  Clock, 
  Calendar, 
  Radio, 
  ChevronRight,
  BookOpen
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

  const categories = ['All', 'Sermons & Preaching', 'Praise & Worship', 'Theological Teaching', 'Family & Marriage', 'Documentaries'];

  const filteredChannels = selectedCategory === 'All'
    ? channels
    : channels.filter((c) => c.category === selectedCategory);

  return (
    <div id="epg-channel-guide" className="w-full space-y-6">
      {/* Guide Header & Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30">
              <Tv className="h-4 w-4" />
            </div>
            <h2 className="font-display text-xl font-bold text-white tracking-tight">
              Electronic Program Guide (EPG)
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Live broadcast schedules across all 6 Christian television satellite streams.
          </p>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`rounded-xl px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition ${
                selectedCategory === cat
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Guide Time Headers */}
      <div className="hidden lg:grid grid-cols-12 gap-2 text-xs font-mono font-semibold uppercase tracking-wider text-slate-500 px-2">
        <div className="col-span-3">Channel Network</div>
        <div className="col-span-4">Now On Air (Live)</div>
        <div className="col-span-3">Up Next</div>
        <div className="col-span-2 text-right">Later Today</div>
      </div>

      {/* Channel Rows */}
      <div className="space-y-3">
        {filteredChannels.map((channel) => {
          const isCurrentlyPlaying = channel.id === currentChannel.id;
          const currentProg = channel.currentProgram;
          const nextProg = channel.upcomingPrograms[0];
          const laterProg = channel.upcomingPrograms[1];

          return (
            <div
              key={channel.id}
              className={`rounded-2xl border transition-all ${
                isCurrentlyPlaying
                  ? 'bg-slate-900/95 border-blue-500/50 shadow-lg shadow-blue-500/10'
                  : 'bg-slate-950/80 border-slate-850 hover:border-slate-700'
              }`}
            >
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 p-3.5 items-center">
                {/* Channel Header / Left Column */}
                <div className="lg:col-span-3 flex items-center justify-between lg:justify-start gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-900 font-mono text-base font-bold text-amber-400 border border-slate-800 shadow-inner">
                      {channel.number}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white tracking-tight leading-snug">
                        {channel.name}
                      </h4>
                      <span className="text-[11px] text-slate-400 font-medium line-clamp-1">
                        {channel.tagline}
                      </span>
                    </div>
                  </div>

                  {/* Tune Channel Button */}
                  <button
                    onClick={() => {
                      onSelectChannel(channel);
                      if (onCloseGuide) onCloseGuide();
                    }}
                    className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
                      isCurrentlyPlaying
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-blue-600 hover:bg-blue-500 text-white'
                    }`}
                  >
                    {isCurrentlyPlaying ? 'Watching' : 'Watch Live'}
                  </button>
                </div>

                {/* Now Playing Slot (Live) */}
                <div 
                  onClick={() => setActiveProgramDetail({ channel, program: currentProg })}
                  className="lg:col-span-4 cursor-pointer rounded-xl bg-slate-900/90 hover:bg-slate-850 p-3 border border-slate-800 transition group"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      {currentProg.isLive ? (
                        <>
                          <span className="flex h-2 w-2 rounded-full bg-red-500 animate-ping" />
                          <span className="text-[10px] font-black uppercase tracking-wider text-red-400">
                            LIVE STREAM
                          </span>
                        </>
                      ) : (
                        <>
                          <span className="flex h-2 w-2 rounded-full bg-slate-400" />
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            RECORDED / VOD
                          </span>
                        </>
                      )}
                    </div>
                    <span className="text-[11px] font-mono text-slate-400">
                      {currentProg.startTimeFormatted} - {currentProg.endTimeFormatted}
                    </span>
                  </div>

                  <h5 className="text-xs sm:text-sm font-bold text-white group-hover:text-blue-300 transition mt-1">
                    {currentProg.title}
                  </h5>

                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {currentProg.speaker}
                    {currentProg.scriptureRef && (
                      <span className="text-amber-400 font-medium ml-1.5">
                        • {currentProg.scriptureRef}
                      </span>
                    )}
                  </p>
                </div>

                {/* Up Next Slot */}
                {nextProg ? (
                  <div 
                    onClick={() => setActiveProgramDetail({ channel, program: nextProg })}
                    className="lg:col-span-3 cursor-pointer rounded-xl bg-slate-900/40 hover:bg-slate-850 p-3 border border-slate-850 transition group"
                  >
                    <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                      <span>NEXT PROGRAM</span>
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
                  <div className="lg:col-span-3 text-xs text-slate-600 italic p-3">
                    Scheduled broadcast resumes shortly
                  </div>
                )}

                {/* Later Slot */}
                {laterProg ? (
                  <div 
                    onClick={() => setActiveProgramDetail({ channel, program: laterProg })}
                    className="lg:col-span-2 cursor-pointer rounded-xl bg-slate-900/20 hover:bg-slate-850 p-3 border border-slate-850 transition group"
                  >
                    <div className="text-[10px] font-mono text-slate-500">
                      {laterProg.startTimeFormatted}
                    </div>
                    <h5 className="text-xs font-medium text-slate-300 group-hover:text-slate-100 transition line-clamp-1 mt-0.5">
                      {laterProg.title}
                    </h5>
                  </div>
                ) : (
                  <div className="lg:col-span-2" />
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
                className="rounded-full p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div>
              <div className="flex items-center gap-2 text-xs font-mono text-amber-400 mb-1">
                <Clock className="h-3.5 w-3.5" />
                <span>{activeProgramDetail.program.startTimeFormatted} - {activeProgramDetail.program.endTimeFormatted} ({activeProgramDetail.program.durationMinutes} min)</span>
                {activeProgramDetail.program.isLive && (
                  <span className="rounded bg-red-600 px-1.5 text-[10px] font-bold text-white">
                    LIVE NOW
                  </span>
                )}
              </div>
              <h3 className="text-xl font-bold text-white tracking-tight">
                {activeProgramDetail.program.title}
              </h3>
              <p className="text-sm text-slate-300 mt-1 font-medium">
                Minister / Host: <strong className="text-white">{activeProgramDetail.program.speaker}</strong>
              </p>
              {activeProgramDetail.program.scriptureRef && (
                <div className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-amber-500/10 px-2.5 py-1 text-xs font-semibold text-amber-300 border border-amber-500/20">
                  <BookOpen className="h-3.5 w-3.5" />
                  Scripture: {activeProgramDetail.program.scriptureRef}
                </div>
              )}
            </div>

            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              {activeProgramDetail.program.description}
            </p>

            <div className="flex items-center gap-3 pt-2">
              {activeProgramDetail.program.isLive ? (
                <button
                  onClick={() => {
                    onSelectChannel(activeProgramDetail.channel);
                    setActiveProgramDetail(null);
                    if (onCloseGuide) onCloseGuide();
                  }}
                  className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-500 py-2.5 text-xs font-bold text-white shadow-lg transition"
                >
                  <Play className="h-4 w-4 fill-current" />
                  <span>Watch Stream Now</span>
                </button>
              ) : (
                <button
                  onClick={() => {
                    onToggleReminder(activeProgramDetail.program.id);
                  }}
                  className={`flex-1 flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold transition ${
                    reminders.includes(activeProgramDetail.program.id)
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                  }`}
                >
                  {reminders.includes(activeProgramDetail.program.id) ? (
                    <>
                      <Check className="h-4 w-4 text-emerald-400" />
                      <span>Reminder Scheduled</span>
                    </>
                  ) : (
                    <>
                      <Bell className="h-4 w-4 text-amber-400" />
                      <span>Set Airing Notification</span>
                    </>
                  )}
                </button>
              )}

              <button
                onClick={() => setActiveProgramDetail(null)}
                className="rounded-xl bg-slate-800 px-4 py-2.5 text-xs font-medium text-slate-300 hover:bg-slate-750"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
