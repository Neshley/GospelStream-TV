import React, { useState } from 'react';
import {
  Tv, List, BookOpen, Bookmark, Bell, DownloadCloud, Cast, Flame,
  Check, ChevronDown, Youtube, Radio
} from 'lucide-react';
import { AppTab, SyncState } from '../types';

interface HeaderProps {
  currentTab: AppTab;
  onTabChange: (tab: AppTab) => void;
  onOpenSyncModal: () => void;
  syncState: SyncState;
  onSelectProfile: (profileId: string) => void;
  unreadAlertsCount: number;
  onOpenAlerts: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab, onTabChange, onOpenSyncModal, syncState,
  onSelectProfile, unreadAlertsCount, onOpenAlerts,
}) => {
  const [profileOpen, setProfileOpen] = useState(false);
  const currentProfile = syncState.profiles.find(p => p.id === syncState.currentProfileId) || syncState.profiles[0];

  const navItems: { id: AppTab; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: 'live-tv', label: 'Home', icon: <Tv size={16} /> },
    { id: 'guide', label: 'Channel Guide', icon: <List size={16} /> },
    { id: 'sermons', label: 'Sermon Vault', icon: <BookOpen size={16} /> },
    { id: 'online-videos', label: 'Discover', icon: <Youtube size={16} /> },
    { id: 'events', label: 'Live Events', icon: <Radio size={16} />, badge: syncState.reminders.length || undefined },
    { id: 'library', label: 'My Library', icon: <Bookmark size={16} /> },
    { id: 'downloads', label: 'Offline', icon: <DownloadCloud size={16} />, badge: syncState.downloadedSermons.length || undefined },
  ];

  const navigate = (tab: AppTab) => {
    onTabChange(tab);
    setProfileOpen(false);
  };

  return (
    <header id="app-main-header" className="gs-topbar sticky top-0 z-50 backdrop-blur-xl bg-slate-950/85 border-b border-slate-800/80">
      <div className="gs-topbar-inner max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-6">
        {/* Brand */}
        <button
          id="brand-home-button"
          onClick={() => navigate('live-tv')}
          className="flex items-center gap-3 shrink-0 group text-left"
          aria-label="GospelStream TV Home"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 via-amber-400 to-yellow-300 flex items-center justify-center text-slate-950 shadow-md shadow-amber-500/20 group-hover:scale-105 transition-transform">
            <Flame size={20} fill="currentColor" />
          </div>
          <div className="flex flex-col">
            <span className="font-display font-bold text-base tracking-tight text-white flex items-center gap-1.5 leading-none">
              GospelStream <span className="text-[10px] uppercase tracking-widest font-extrabold text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded border border-blue-400/20">TV</span>
            </span>
            <span className="text-[10px] text-slate-400 font-medium tracking-wide mt-0.5 hidden sm:inline">
              Faith · Live · Together
            </span>
          </div>
        </button>

        {/* Navigation Tabs */}
        <nav className="hidden lg:flex items-center gap-1 overflow-x-auto py-1" aria-label="Main navigation">
          {navItems.map(item => {
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => navigate(item.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-blue-600/20 text-white border border-blue-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900/60'
                }`}
                aria-current={isActive ? 'page' : undefined}
              >
                {item.icon}
                <span>{item.label}</span>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-slate-800 text-amber-300 font-bold border border-slate-700">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Actions Zone */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* Notifications */}
          <button
            id="btn-header-notifications"
            onClick={onOpenAlerts}
            className="relative p-2 rounded-xl text-slate-300 hover:text-white bg-slate-900/70 hover:bg-slate-800 border border-slate-800 transition"
            aria-label="Alerts & Reminders"
            title="Alerts & Broadcast Reminders"
          >
            <Bell size={17} />
            {unreadAlertsCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white font-mono text-[9px] font-bold flex items-center justify-center border-2 border-slate-950">
                {unreadAlertsCount}
              </span>
            )}
          </button>

          {/* Cross-device sync */}
          <button
            id="btn-open-sync-modal"
            onClick={onOpenSyncModal}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-blue-300 bg-blue-950/40 hover:bg-blue-900/50 border border-blue-500/30 transition shadow-sm"
            title="Cross-Device Sync"
          >
            <Cast size={15} className="text-blue-400" />
            <span className="hidden sm:inline">Sync</span>
            {syncState.syncToken ? (
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" title="Connected" />
            ) : (
              <span className="text-[10px] font-mono text-amber-400 font-bold hidden md:inline">
                {syncState.syncCode}
              </span>
            )}
          </button>

          {/* Profile Menu */}
          <div className="relative">
            <button
              id="btn-profile-dropdown"
              onClick={() => setProfileOpen(v => !v)}
              className="flex items-center gap-2 p-1.5 pr-2 rounded-xl bg-slate-900/80 hover:bg-slate-850 border border-slate-800 transition"
              aria-expanded={profileOpen}
              aria-haspopup="menu"
            >
              <span className={`w-7 h-7 rounded-lg ${currentProfile?.avatarColor || 'bg-blue-600'} text-white font-bold text-xs flex items-center justify-center shadow`}>
                {currentProfile?.name?.[0] || 'G'}
              </span>
              <span className="text-xs font-semibold text-slate-200 hidden md:inline max-w-[80px] truncate">
                {currentProfile?.name || 'Family'}
              </span>
              <ChevronDown size={13} className="text-slate-400" />
            </button>

            {profileOpen && (
              <div
                id="profile-dropdown-menu"
                className="absolute right-0 mt-2 w-56 rounded-2xl bg-slate-900 p-2 border border-slate-700 shadow-2xl z-50 backdrop-blur-xl animate-in fade-in slide-in-from-top-2"
              >
                <div className="px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Switch Profiles
                </div>
                {syncState.profiles.map(prof => (
                  <button
                    key={prof.id}
                    onClick={() => { onSelectProfile(prof.id); setProfileOpen(false); }}
                    className="w-full flex items-center gap-2.5 p-2 rounded-xl hover:bg-slate-800 text-left transition"
                  >
                    <span className={`w-6 h-6 rounded-md ${prof.avatarColor} text-white font-bold text-xs flex items-center justify-center`}>
                      {prof.name[0]}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold text-white truncate">{prof.name}</div>
                      <div className="text-[10px] text-slate-400">{prof.role}</div>
                    </div>
                    {prof.id === syncState.currentProfileId && (
                      <Check size={14} className="text-emerald-400 shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile / Tablet Horizontal Navigation Scroll */}
      <div className="lg:hidden border-t border-slate-850 bg-slate-950/90 px-3 py-2 flex items-center gap-1.5 overflow-x-auto shelf-scroll">
        {navItems.map(item => {
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => navigate(item.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                isActive
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 bg-slate-900/40'
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
              {item.badge !== undefined && item.badge > 0 && (
                <span className="text-[9px] font-mono px-1 rounded-full bg-slate-800 text-amber-300 font-bold">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </header>
  );
};
