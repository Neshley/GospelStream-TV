import React, { useState } from 'react';
import { 
  Tv, 
  List, 
  BookOpen, 
  Bookmark, 
  Bell, 
  DownloadCloud, 
  RefreshCw, 
  Wifi, 
  WifiOff, 
  Smartphone, 
  Tablet, 
  Monitor, 
  Flame, 
  Cast, 
  User, 
  Check, 
  ChevronDown,
  Youtube
} from 'lucide-react';
import { AppTab, DeviceMode, SyncState } from '../types';

interface HeaderProps {
  currentTab: AppTab;
  onTabChange: (tab: AppTab) => void;
  deviceMode: DeviceMode;
  onDeviceModeChange: (mode: DeviceMode) => void;
  isTvRemoteOpen: boolean;
  onToggleTvRemote: () => void;
  onOpenSyncModal: () => void;
  isOfflineMode: boolean;
  onToggleOfflineMode: () => void;
  syncState: SyncState;
  onSelectProfile: (profileId: string) => void;
  unreadAlertsCount: number;
  onOpenAlerts: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onTabChange,
  deviceMode,
  onDeviceModeChange,
  isTvRemoteOpen,
  onToggleTvRemote,
  onOpenSyncModal,
  isOfflineMode,
  onToggleOfflineMode,
  syncState,
  onSelectProfile,
  unreadAlertsCount,
  onOpenAlerts,
}) => {
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const currentProfile = syncState.profiles.find((p) => p.id === syncState.currentProfileId) || syncState.profiles[0];

  const tabs: { id: AppTab; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: 'live-tv', label: 'Live TV', icon: <Tv className="h-4 w-4" /> },
    { id: 'online-videos', label: 'Online Videos', icon: <Youtube className="h-4 w-4 text-red-400" /> },
    { id: 'guide', label: 'TV Guide (EPG)', icon: <List className="h-4 w-4" /> },
    { id: 'sermons', label: 'Sermons', icon: <BookOpen className="h-4 w-4" /> },
    { 
      id: 'library', 
      label: 'My Library', 
      icon: <Bookmark className="h-4 w-4" />, 
      badge: syncState.favorites.length + syncState.watchLater.length 
    },
    { 
      id: 'events', 
      label: 'Live Events', 
      icon: <Bell className="h-4 w-4" />,
      badge: syncState.reminders.length
    },
    { 
      id: 'downloads', 
      label: 'Offline', 
      icon: <DownloadCloud className="h-4 w-4" />,
      badge: syncState.downloadedSermons.length
    },
  ];

  return (
    <header 
      id="app-main-header"
      className="sticky top-0 z-40 w-full border-b border-slate-800/90 bg-slate-950/95 backdrop-blur-md px-4 py-2.5 transition-all"
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
        {/* Brand & TV Indicator */}
        <div className="flex items-center gap-3">
          <button 
            id="brand-home-button"
            onClick={() => onTabChange('live-tv')}
            className="flex items-center gap-2.5 text-left group focus:outline-none"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-amber-600 via-amber-500 to-yellow-400 text-slate-950 shadow-md shadow-amber-500/20 group-hover:scale-105 transition-transform">
              <Flame className="h-5 w-5 fill-current text-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-display text-lg font-bold tracking-tight text-white group-hover:text-amber-300 transition-colors">
                  GospelStream
                </span>
                <span className="rounded bg-blue-500/20 px-1.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-blue-400 border border-blue-500/30">
                  TV
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium hidden sm:block">
                Christian Television & Sermons
              </p>
            </div>
          </button>
        </div>

        {/* Navigation Tabs */}
        <nav className="hidden lg:flex items-center gap-1">
          {tabs.map((tab) => {
            const isActive = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`nav-tab-${tab.id}`}
                onClick={() => onTabChange(tab.id)}
                className={`relative flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold tracking-wide transition-all ${
                  isActive
                    ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30 shadow-sm'
                    : 'text-slate-300 hover:bg-slate-900 hover:text-white'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span className={`flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-bold ${
                    isActive ? 'bg-blue-500 text-white' : 'bg-slate-800 text-slate-300'
                  }`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Controls Toolbar */}
        <div className="flex items-center gap-2">
          {/* Offline Mode Toggle */}
          <button
            id="btn-toggle-offline-mode"
            onClick={onToggleOfflineMode}
            title={isOfflineMode ? 'Exit Offline Mode' : 'Test Offline Playback Mode'}
            className={`flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-xs font-medium transition-all ${
              isOfflineMode
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            {isOfflineMode ? <WifiOff className="h-3.5 w-3.5 text-amber-400" /> : <Wifi className="h-3.5 w-3.5 text-emerald-400" />}
            <span className="hidden md:inline">{isOfflineMode ? 'Offline Active' : 'Online'}</span>
          </button>

          {/* Device Form-Factor Switcher */}
          <div className="hidden sm:flex items-center rounded-xl bg-slate-900 p-0.5 border border-slate-800">
            <button
              id="device-btn-tv"
              onClick={() => onDeviceModeChange('smart-tv')}
              title="Smart TV 10-Foot Mode (Large font & D-Pad focus)"
              className={`flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-semibold transition ${
                deviceMode === 'smart-tv'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Tv className="h-3.5 w-3.5" />
              <span>TV</span>
            </button>
            <button
              id="device-btn-tablet"
              onClick={() => onDeviceModeChange('tablet')}
              title="Tablet Layout"
              className={`flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-semibold transition ${
                deviceMode === 'tablet'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Tablet className="h-3.5 w-3.5" />
              <span className="hidden lg:inline">Tablet</span>
            </button>
            <button
              id="device-btn-mobile"
              onClick={() => onDeviceModeChange('mobile')}
              title="Mobile Phone View"
              className={`flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-semibold transition ${
                deviceMode === 'mobile'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Smartphone className="h-3.5 w-3.5" />
              <span className="hidden lg:inline">Mobile</span>
            </button>
            <button
              id="device-btn-desktop"
              onClick={() => onDeviceModeChange('desktop')}
              title="Standard Desktop View"
              className={`flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-semibold transition ${
                deviceMode === 'desktop'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Monitor className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* TV Remote Toggle Button */}
          <button
            id="btn-toggle-tv-remote"
            onClick={onToggleTvRemote}
            title="Toggle Smart TV Remote Control"
            className={`flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-xs font-semibold transition-all ${
              isTvRemoteOpen
                ? 'bg-amber-600 text-white shadow-md shadow-amber-600/30'
                : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
            }`}
          >
            <Tv className="h-4 w-4 text-amber-400" />
            <span className="hidden xl:inline">TV Remote</span>
          </button>

          {/* Cross-Device Sync Modal Trigger */}
          <button
            id="btn-open-sync-modal"
            onClick={onOpenSyncModal}
            title={`Cross-Platform Sync (Code: ${syncState.syncCode})`}
            className="flex items-center gap-1.5 rounded-xl bg-slate-900 px-2.5 py-1.5 text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-800 transition"
          >
            <Cast className="h-3.5 w-3.5 text-blue-400" />
            <span className="font-mono text-[11px] text-blue-300 hidden md:inline">{syncState.syncCode}</span>
            <span className="text-[11px] hidden sm:inline">Sync</span>
          </button>

          {/* Event Alerts Button */}
          <button
            id="btn-header-notifications"
            onClick={onOpenAlerts}
            title="Upcoming Broadcast Notifications"
            className="relative rounded-xl bg-slate-900 p-2 text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-slate-800 transition"
          >
            <Bell className="h-4 w-4" />
            {unreadAlertsCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow">
                {unreadAlertsCount}
              </span>
            )}
          </button>

          {/* Profile Switcher */}
          <div className="relative">
            <button
              id="btn-profile-dropdown"
              onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
              className="flex items-center gap-1.5 rounded-xl bg-slate-900 px-2 py-1.5 border border-slate-800 hover:bg-slate-850 transition"
            >
              <div className={`flex h-6 w-6 items-center justify-center rounded-lg ${currentProfile.avatarColor} text-[11px] font-bold text-white`}>
                {currentProfile.name[0]}
              </div>
              <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
            </button>

            {profileDropdownOpen && (
              <div 
                id="profile-dropdown-menu"
                className="absolute right-0 mt-2 w-48 rounded-2xl bg-slate-900 p-2 shadow-2xl border border-slate-850 z-50 animate-in fade-in"
              >
                <div className="px-2 py-1 border-b border-slate-800 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Switch Profile
                </div>
                {syncState.profiles.map((prof) => (
                  <button
                    key={prof.id}
                    onClick={() => {
                      onSelectProfile(prof.id);
                      setProfileDropdownOpen(false);
                    }}
                    className="mt-1 flex w-full items-center justify-between rounded-xl px-2.5 py-1.5 text-left text-xs font-medium text-slate-200 hover:bg-slate-800 transition"
                  >
                    <div className="flex items-center gap-2">
                      <div className={`flex h-6 w-6 items-center justify-center rounded-lg ${prof.avatarColor} text-[10px] font-bold text-white`}>
                        {prof.name[0]}
                      </div>
                      <div>
                        <div>{prof.name}</div>
                        <div className="text-[10px] text-slate-500">{prof.role}</div>
                      </div>
                    </div>
                    {prof.id === syncState.currentProfileId && (
                      <Check className="h-4 w-4 text-emerald-400" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Sub-Navigation Bar */}
      <div className="mt-2 flex lg:hidden items-center justify-around border-t border-slate-850 pt-2 overflow-x-auto pb-1 gap-1">
        {tabs.map((tab) => {
          const isActive = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11px] font-semibold whitespace-nowrap transition ${
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
              {tab.badge !== undefined && tab.badge > 0 && (
                <span className="rounded-full bg-slate-800 px-1 text-[9px]">
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </header>
  );
};
