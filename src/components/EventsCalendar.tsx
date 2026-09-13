import React, { useState } from 'react';
import { 
  LiveEvent, 
  SyncState 
} from '../types';
import { 
  Bell, 
  Check, 
  Calendar, 
  Clock, 
  Radio, 
  Sparkles, 
  Play, 
  Share2, 
  Download, 
  BookOpen, 
  Tv, 
  AlertCircle,
  Volume2
} from 'lucide-react';
import { requestNotificationPermission, sendLocalNotification } from '../services/storageService';

interface EventsCalendarProps {
  events: LiveEvent[];
  syncState: SyncState;
  onToggleReminder: (eventId: string) => void;
  onTuneToChannel: (channelId: string) => void;
}

export const EventsCalendar: React.FC<EventsCalendarProps> = ({
  events,
  syncState,
  onToggleReminder,
  onTuneToChannel,
}) => {
  const [notificationPermissionStatus, setNotificationPermissionStatus] = useState<string>(
    typeof window !== 'undefined' && 'Notification' in window ? Notification.permission : 'default'
  );
  const [selectedEvent, setSelectedEvent] = useState<LiveEvent | null>(null);
  const [testNotificationSent, setTestNotificationSent] = useState(false);

  const handleEnableBrowserNotifications = async () => {
    const granted = await requestNotificationPermission();
    if (granted) {
      setNotificationPermissionStatus('granted');
      sendLocalNotification(
        'GospelStream TV Notifications Enabled! 🕊️',
        'You will receive live stream alerts for upcoming worship services, prayer vigils, and sermon broadcasts.'
      );
      setTestNotificationSent(true);
      setTimeout(() => setTestNotificationSent(false), 4000);
    } else {
      setNotificationPermissionStatus('denied');
    }
  };

  const handleToggleReminderWithPermission = async (eventId: string, eventTitle: string) => {
    if (notificationPermissionStatus === 'default') {
      await requestNotificationPermission();
      if (typeof window !== 'undefined' && 'Notification' in window) {
        setNotificationPermissionStatus(Notification.permission);
      }
    }
    onToggleReminder(eventId);
    const isNowReminded = !syncState.reminders.includes(eventId);
    if (isNowReminded) {
      sendLocalNotification(
        'Live Broadcast Reminder Set! 🔔',
        `We will notify you before "${eventTitle}" goes live on Christian TV.`
      );
    }
  };

  // Generate .ics calendar file for export
  const downloadCalendarFile = (event: LiveEvent) => {
    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//GospelStream TV//Christian Programming//EN
BEGIN:VEVENT
SUMMARY:${event.title}
DESCRIPTION:${event.description} - Airing on ${event.channelName}
DTSTART:20260913T140000Z
DTEND:20260913T160000Z
LOCATION:${event.channelName}
STATUS:CONFIRMED
END:VEVENT
END:VCALENDAR`;

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${event.title.slice(0, 20)}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div id="live-events-view" className="w-full space-y-8">
      {/* Notifications Permission & Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 p-6 border border-blue-800/40 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 shadow-md">
              <Bell className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-display text-lg font-bold text-white tracking-tight">
                  Live Stream Notifications & Broadcast Calendar
                </h2>
                <span className="rounded-full bg-red-600 px-2 py-0.5 text-[10px] font-black uppercase text-white animate-pulse">
                  Upcoming
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1 max-w-xl">
                Never miss a live prayer vigil, Sunday service communion, or conference. Receive notifications on your TV, phone, and tablet before broadcasts start.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {notificationPermissionStatus !== 'granted' ? (
              <button
                id="btn-enable-notifications"
                onClick={handleEnableBrowserNotifications}
                className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-amber-600 to-yellow-500 hover:from-amber-500 hover:to-yellow-400 px-5 py-3 text-xs font-bold text-slate-950 shadow-lg transition active:scale-95"
              >
                <Bell className="h-4 w-4 fill-current" />
                <span>Enable Live Alerts</span>
              </button>
            ) : (
              <div className="flex items-center gap-2 rounded-2xl bg-emerald-500/20 px-4 py-2.5 text-xs font-bold text-emerald-400 border border-emerald-500/30">
                <Check className="h-4 w-4" />
                <span>Device Notifications Enabled</span>
              </div>
            )}
          </div>
        </div>

        {testNotificationSent && (
          <div className="mt-4 rounded-xl bg-emerald-950/60 p-3 border border-emerald-500/30 text-xs text-emerald-200 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-emerald-400" />
            <span>Test Notification dispatched! You will receive reminders for all scheduled streams.</span>
          </div>
        )}
      </div>

      {/* Featured Upcoming Broadcast */}
      {events[0] && (
        <div className="relative overflow-hidden rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-8 shadow-2xl">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="max-w-2xl space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-lg bg-red-600 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-white">
                  NEXT WORLDWIDE BROADCAST
                </span>
                <span className="font-mono text-xs font-bold text-amber-400">
                  {events[0].formattedTime}
                </span>
                <span className="text-xs text-slate-400">
                  • {events[0].channelName}
                </span>
              </div>

              <h3 className="font-display text-xl sm:text-3xl font-bold tracking-tight text-white">
                {events[0].title}
              </h3>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                {events[0].description}
              </p>

              <div className="flex items-center gap-2 text-xs text-slate-400 pt-1">
                <span>Minister: <strong className="text-white">{events[0].speaker}</strong></span>
                <span>•</span>
                <span className="text-amber-300 font-mono">📖 {events[0].scriptureTheme}</span>
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-3">
                <button
                  onClick={() => handleToggleReminderWithPermission(events[0].id, events[0].title)}
                  className={`flex items-center gap-2 rounded-2xl px-5 py-3 text-xs font-bold transition active:scale-95 shadow-md ${
                    syncState.reminders.includes(events[0].id)
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      : 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-600/20'
                  }`}
                >
                  {syncState.reminders.includes(events[0].id) ? (
                    <>
                      <Check className="h-4 w-4 text-emerald-400" />
                      <span>Reminder Scheduled (Alert On)</span>
                    </>
                  ) : (
                    <>
                      <Bell className="h-4 w-4" />
                      <span>Set Live Stream Notification</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => onTuneToChannel(events[0].channelId)}
                  className="flex items-center gap-2 rounded-2xl bg-blue-600 hover:bg-blue-500 px-4 py-3 text-xs font-bold text-white transition"
                >
                  <Tv className="h-4 w-4" />
                  <span>Go to Channel</span>
                </button>

                <button
                  onClick={() => downloadCalendarFile(events[0])}
                  className="flex items-center gap-1.5 rounded-2xl bg-slate-800 hover:bg-slate-750 px-4 py-3 text-xs font-medium text-slate-300 transition"
                  title="Add to Google Calendar / iCal"
                >
                  <Calendar className="h-4 w-4 text-slate-400" />
                  <span>Export to Calendar (.ics)</span>
                </button>
              </div>
            </div>

            <div className="relative aspect-video w-full md:w-80 rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 shadow-xl shrink-0">
              <img
                src={events[0].thumbnail}
                alt={events[0].title}
                referrerPolicy="no-referrer"
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-4">
                <span className="rounded-lg bg-black/80 px-2 py-0.5 font-mono text-[11px] font-bold text-amber-300">
                  {events[0].badgeText}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Events Schedule Grid */}
      <div className="space-y-4">
        <h3 className="font-display text-lg font-bold text-white tracking-tight flex items-center gap-2">
          <Calendar className="h-5 w-5 text-blue-400" />
          <span>Scheduled Live Broadcasts & Intercession Hours</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {events.map((event) => {
            const isReminded = syncState.reminders.includes(event.id);
            return (
              <div
                key={event.id}
                className={`rounded-2xl border p-5 transition-all shadow-lg ${
                  isReminded
                    ? 'bg-slate-900/95 border-amber-500/40 shadow-amber-500/5'
                    : 'bg-slate-900/70 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex flex-col justify-between h-full space-y-4">
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="rounded-lg bg-blue-600/20 px-2.5 py-0.5 text-[10px] font-bold text-blue-400 border border-blue-500/30">
                        {event.formattedDate}
                      </span>
                      <span className="font-mono text-xs font-semibold text-amber-400">
                        {event.formattedTime}
                      </span>
                    </div>

                    <h4 className="text-base font-bold text-white mt-2 leading-snug">
                      {event.title}
                    </h4>

                    <p className="text-xs text-slate-400 mt-1">
                      {event.speaker} • <span className="text-slate-300 font-medium">{event.channelName}</span>
                    </p>

                    <p className="text-xs text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                      {event.description}
                    </p>
                  </div>

                  <div className="border-t border-slate-800 pt-3 flex items-center justify-between gap-2">
                    <button
                      onClick={() => handleToggleReminderWithPermission(event.id, event.title)}
                      className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
                        isReminded
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          : 'bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700'
                      }`}
                    >
                      {isReminded ? (
                        <>
                          <Check className="h-3.5 w-3.5 text-emerald-400" />
                          <span>Reminder Set</span>
                        </>
                      ) : (
                        <>
                          <Bell className="h-3.5 w-3.5 text-amber-400" />
                          <span>Set Notification</span>
                        </>
                      )}
                    </button>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => onTuneToChannel(event.channelId)}
                        className="rounded-xl bg-blue-600/20 hover:bg-blue-600/30 px-3 py-1.5 text-xs font-semibold text-blue-300 border border-blue-500/30 transition"
                      >
                        Tune
                      </button>

                      <button
                        onClick={() => downloadCalendarFile(event)}
                        className="rounded-xl bg-slate-800 hover:bg-slate-750 p-2 text-slate-400 hover:text-white transition"
                        title="Export to Calendar"
                      >
                        <Calendar className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
