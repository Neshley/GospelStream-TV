import React from 'react';
import { 
  LiveEvent, 
  SyncState 
} from '../types';
import { 
  Bell, 
  Tv, 
  Check, 
  Trash2, 
  X, 
  Calendar, 
  Radio, 
  Clock 
} from 'lucide-react';

interface AlertsPopoverProps {
  isOpen: boolean;
  onClose: () => void;
  events: LiveEvent[];
  syncState: SyncState;
  onToggleReminder: (eventId: string) => void;
  onTuneToChannel: (channelId: string) => void;
  onClearAllReminders: () => void;
}

export const AlertsPopover: React.FC<AlertsPopoverProps> = ({
  isOpen,
  onClose,
  events,
  syncState,
  onToggleReminder,
  onTuneToChannel,
  onClearAllReminders,
}) => {
  if (!isOpen) return null;

  const remindedEvents = events.filter((e) => syncState.reminders.includes(e.id));

  return (
    <div 
      id="alerts-popover-backdrop"
      className="fixed inset-0 z-50 flex items-start justify-end p-4 pt-16 bg-black/60 backdrop-blur-sm animate-in fade-in"
      onClick={onClose}
    >
      <div 
        id="alerts-popover-card"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-3xl bg-slate-900 border border-slate-700 shadow-2xl p-5 space-y-4 text-slate-100"
      >
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400">
              <Bell className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">
                Upcoming Stream Alerts
              </h3>
              <span className="text-[11px] text-slate-400 font-mono">
                {remindedEvents.length} Active Reminders
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {remindedEvents.length > 0 && (
              <button
                onClick={onClearAllReminders}
                className="text-[11px] text-slate-400 hover:text-red-400 transition"
              >
                Clear All
              </button>
            )}
            <button
              onClick={onClose}
              className="rounded-full p-1 text-slate-400 hover:bg-slate-800 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="space-y-3 max-h-96 overflow-y-auto">
          {remindedEvents.length === 0 ? (
            <div className="py-8 text-center text-slate-500 text-xs">
              <Bell className="h-8 w-8 text-slate-600 mx-auto mb-2 opacity-60" />
              <p>No active stream reminders scheduled.</p>
              <p className="mt-1 text-[11px] text-slate-600">
                Browse the "Live Events" tab or EPG Guide to set broadcast reminders.
              </p>
            </div>
          ) : (
            remindedEvents.map((ev) => (
              <div
                key={ev.id}
                className="rounded-2xl bg-slate-950 p-3.5 border border-slate-850 space-y-2 relative group"
              >
                <div className="flex items-center justify-between">
                  <span className="rounded bg-red-600/20 px-2 py-0.5 text-[10px] font-bold uppercase text-red-400">
                    {ev.formattedDate}
                  </span>
                  <span className="font-mono text-xs font-bold text-amber-400">
                    {ev.formattedTime}
                  </span>
                </div>

                <h4 className="text-xs sm:text-sm font-bold text-white leading-snug">
                  {ev.title}
                </h4>

                <p className="text-[11px] text-slate-400">
                  {ev.speaker} • <span className="text-slate-300">{ev.channelName}</span>
                </p>

                <div className="flex items-center justify-between border-t border-slate-850 pt-2 text-xs">
                  <button
                    onClick={() => {
                      onTuneToChannel(ev.channelId);
                      onClose();
                    }}
                    className="flex items-center gap-1 font-semibold text-blue-400 hover:text-blue-300"
                  >
                    <Tv className="h-3.5 w-3.5" />
                    <span>Go to Channel</span>
                  </button>

                  <button
                    onClick={() => onToggleReminder(ev.id)}
                    className="text-slate-500 hover:text-red-400 transition"
                    title="Remove Reminder"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
