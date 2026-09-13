import React, { useState } from 'react';
import {
  Tv, List, BookOpen, Bookmark, Bell, DownloadCloud, Cast, Flame,
  Check, ChevronDown, Youtube, MoreHorizontal
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
  currentTab, onTabChange, onOpenSyncModal, syncState,
  onSelectProfile, unreadAlertsCount, onOpenAlerts,
}) => {
  const [profileOpen, setProfileOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const currentProfile = syncState.profiles.find(p => p.id === syncState.currentProfileId) || syncState.profiles[0];

  const primary: { id: AppTab; label: string; icon: React.ReactNode }[] = [
    { id: 'live-tv', label: 'Home', icon: <Tv /> },
    { id: 'online-videos', label: 'Discover', icon: <Youtube /> },
    { id: 'guide', label: 'Guide', icon: <List /> },
    { id: 'sermons', label: 'Sermons', icon: <BookOpen /> },
    { id: 'library', label: 'My Library', icon: <Bookmark /> },
  ];

  const secondary: { id: AppTab; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: 'events', label: 'Live Events', icon: <Bell />, badge: syncState.reminders.length },
    { id: 'downloads', label: 'Offline', icon: <DownloadCloud />, badge: syncState.downloadedSermons.length },
  ];

  const navigate = (tab: AppTab) => { onTabChange(tab); setMoreOpen(false); };

  return (
    <header id="app-main-header" className="gs-topbar">
      <div className="gs-topbar-inner">
        <button id="brand-home-button" onClick={() => navigate('live-tv')} className="gs-brand" aria-label="GospelStream home">
          <span className="gs-brand-mark"><Flame size={20} fill="currentColor" /></span>
          <span className="gs-brand-copy"><strong>GospelStream</strong><em>TV</em></span>
        </button>

        <nav className="gs-main-nav" aria-label="Main navigation">
          {primary.map(tab => (
            <button key={tab.id} onClick={() => navigate(tab.id)} className={currentTab === tab.id ? 'active' : ''}>
              {tab.icon}<span>{tab.label}</span>
            </button>
          ))}
        </nav>

        <div className="gs-actions">
          <div className="gs-more-wrap">
            <button className={`gs-icon-btn ${moreOpen ? 'selected' : ''}`} onClick={() => setMoreOpen(v => !v)} aria-label="More GospelStream options" title="More">
              <MoreHorizontal size={19} />
            </button>
            {moreOpen && (
              <div className="gs-popover gs-more-menu">
                <div className="gs-menu-label">More</div>
                {secondary.map(item => (
                  <button key={item.id} onClick={() => navigate(item.id)} className={currentTab === item.id ? 'current' : ''}>
                    {item.icon}<span>{item.label}</span>{item.badge ? <b>{item.badge}</b> : null}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button id="btn-header-notifications" className="gs-icon-btn" onClick={onOpenAlerts} aria-label="Notifications" title="Notifications">
            <Bell size={18} />{unreadAlertsCount > 0 && <span className="gs-badge">{unreadAlertsCount}</span>}
          </button>

          <button id="btn-open-sync-modal" className="gs-sync-btn" onClick={onOpenSyncModal} title="Sync across your devices">
            <Cast size={16}/><span>Sync</span>{syncState.syncCode && <small>{syncState.syncCode}</small>}
          </button>

          <div className="gs-profile-wrap">
            <button id="btn-profile-dropdown" className="gs-profile-btn" onClick={() => setProfileOpen(v => !v)} aria-expanded={profileOpen}>
              <span className={`gs-avatar ${currentProfile?.avatarColor || 'bg-blue-600'}`}>{currentProfile?.name?.[0] || 'G'}</span>
              <span className="gs-profile-name">{currentProfile?.name || 'Family'}</span>
              <ChevronDown size={14}/>
            </button>
            {profileOpen && (
              <div id="profile-dropdown-menu" className="gs-popover gs-profile-menu">
                <div className="gs-menu-label">Profiles</div>
                {syncState.profiles.map(prof => (
                  <button key={prof.id} onClick={() => { onSelectProfile(prof.id); setProfileOpen(false); }}>
                    <span className={`gs-avatar ${prof.avatarColor}`}>{prof.name[0]}</span>
                    <span className="gs-profile-details"><strong>{prof.name}</strong><small>{prof.role}</small></span>
                    {prof.id === syncState.currentProfileId && <Check size={16} className="gs-check"/>}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="gs-mobile-nav" aria-label="Mobile navigation">
        {primary.map(tab => (
          <button key={tab.id} onClick={() => navigate(tab.id)} className={currentTab === tab.id ? 'active' : ''}>
            {tab.icon}<span>{tab.label}</span>
          </button>
        ))}
      </div>
    </header>
  );
};
