import React from 'react';
import { Play, Radio, Sparkles, ArrowRight, Clock3, Bookmark, Flame, Tv, Volume2, BookOpen, Music, Check } from 'lucide-react';
import { Sermon, SyncState, Channel } from '../types';

interface HomeExperienceProps {
  sermons: Sermon[];
  syncState: SyncState;
  onPlay: (sermon: Sermon) => void;
  onNavigate: (tab: any) => void;
  channels?: Channel[];
  currentChannel?: Channel | null;
  onSelectChannel?: (channel: Channel) => void;
}

const HERO_IMAGE = '/src/assets/images/gospelstream_hero_cinema_1793967304070.jpg';
const WORSHIP_IMAGE = '/src/assets/images/worship_praise_banner_1793967304867.jpg';
const SCRIPTURE_IMAGE = '/src/assets/images/bible_wisdom_study_1793967306328.jpg';
const CRUSADE_IMAGE = '/src/assets/images/live_crusade_gathering_1793967305591.jpg';

export function HomeExperience({
  sermons,
  syncState,
  onPlay,
  onNavigate,
  channels = [],
  currentChannel,
  onSelectChannel,
}: HomeExperienceProps) {
  const heroSermon = sermons.find(s => s.isLive) || sermons[0];
  const continueItems = syncState.continueWatching
    .map(item => ({ item, sermon: sermons.find(s => s.id === item.sermonId) }))
    .filter((x): x is { item: typeof x.item; sermon: Sermon } => Boolean(x.sermon))
    .slice(0, 8);
  const liveNow = sermons.filter(s => s.isLive).slice(0, 8);
  const worshipSermons = sermons.filter(s => s.category.toLowerCase().includes('worship') || s.title.toLowerCase().includes('worship')).slice(0, 8);
  const recommended = sermons.filter(s => !s.isLive).slice(0, 10);

  return (
    <div className="home-experience pb-12">
      {/* Cinematic Hero */}
      <section className="home-hero relative">
        <img
          className="home-hero-bg"
          src={HERO_IMAGE}
          alt="GospelStream Sanctuary"
          referrerPolicy="no-referrer"
          onError={(e) => {
            if (heroSermon?.thumbnailUrl) (e.currentTarget as HTMLImageElement).src = heroSermon.thumbnailUrl;
          }}
        />
        <div className="home-hero-vignette" />
        <div className="home-hero-content z-10">
          <div className="flex items-center gap-3 text-xs tracking-wider font-semibold text-amber-400 uppercase">
            <span className="flex items-center gap-1.5"><Sparkles size={14} className="text-amber-400" /> Curated Broadcast</span>
            <span className="text-slate-500">·</span>
            <span className="text-slate-300">Faith · Live · Together</span>
          </div>

          <h1 className="font-display font-bold text-white text-3xl sm:text-5xl lg:text-6xl tracking-tight leading-tight mt-3 mb-4 max-w-3xl">
            {heroSermon ? heroSermon.title : 'Life’s Search for Meaning & Eternal Hope'}
          </h1>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-2xl mb-5 line-clamp-3">
            {heroSermon?.description || 'Experience 24/7 Christian preaching, continuous worship, prophetic bible studies, and live satellite broadcasts.'}
          </p>

          <div className="flex flex-wrap items-center gap-2.5 text-xs text-slate-300 mb-7 font-medium">
            <span className="text-amber-300 font-semibold">{heroSermon?.preacher || 'Dr. Billy Graham'}</span>
            <span className="text-slate-600">·</span>
            <span>{heroSermon?.ministry || 'Gospel Broadcast Network'}</span>
            {heroSermon?.scripture && (
              <>
                <span className="text-slate-600">·</span>
                <span className="text-slate-200 font-mono">{heroSermon.scripture}</span>
              </>
            )}
            <span className="text-slate-600">·</span>
            <span className="text-slate-400">{heroSermon?.durationFormatted || 'Full Message'}</span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {heroSermon && (
              <button
                onClick={() => onPlay(heroSermon)}
                className="flex items-center gap-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-950 font-bold px-6 py-3.5 text-sm transition-all shadow-xl hover:shadow-2xl active:scale-95"
              >
                <Play size={18} fill="currentColor" />
                <span>Watch Featured Message</span>
              </button>
            )}
            <button
              onClick={() => onNavigate('guide')}
              className="flex items-center gap-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-white font-semibold px-5 py-3.5 text-sm border border-slate-700/80 backdrop-blur-md transition-all active:scale-95"
            >
              <Tv size={17} className="text-blue-400" />
              <span>Program Guide (EPG)</span>
            </button>
            <button
              onClick={() => onNavigate('sermons')}
              className="flex items-center gap-2 rounded-xl bg-slate-950/60 hover:bg-slate-900 text-slate-300 hover:text-white font-semibold px-4 py-3.5 text-sm border border-slate-800/80 backdrop-blur-md transition-all"
            >
              <span>Explore Vault</span>
              <ArrowRight size={15} />
            </button>
          </div>
        </div>
      </section>

      {/* Quick Access Channels Strip */}
      {channels.length > 0 && (
        <section className="px-4 sm:px-8 mt-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Radio size={16} className="text-red-400" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Live Satellite Channels</h3>
            </div>
            <button
              onClick={() => onNavigate('guide')}
              className="text-xs font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1"
            >
              Full EPG Schedule <ArrowRight size={13} />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {channels.slice(0, 6).map((ch) => {
              const isSelected = currentChannel?.id === ch.id;
              return (
                <button
                  key={ch.id}
                  onClick={() => {
                    if (onSelectChannel) onSelectChannel(ch);
                    const el = document.getElementById('live-tv-player');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className={`group relative text-left p-3.5 rounded-2xl border transition-all ${
                    isSelected
                      ? 'bg-gradient-to-b from-blue-950/80 to-slate-900 border-blue-500/60 shadow-lg shadow-blue-500/10'
                      : 'bg-slate-900/60 hover:bg-slate-850/80 border-slate-800/80 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-xs font-bold text-amber-400">CH {ch.number}</span>
                    <span className="flex items-center gap-1 text-[10px] font-bold text-red-400 uppercase tracking-wider">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
                      Live
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-white line-clamp-1 group-hover:text-blue-300 transition-colors">
                    {ch.name}
                  </h4>
                  <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                    {ch.currentProgram?.title || ch.tagline}
                  </p>
                  {isSelected && (
                    <div className="mt-2 flex items-center gap-1 text-[10px] font-bold text-emerald-400">
                      <Check size={12} /> Playing on Main Stage
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </section>
      )}

      {/* Continue Watching */}
      {continueItems.length > 0 && (
        <section className="home-shelf continue-shelf">
          <div className="home-shelf-head">
            <div>
              <div className="home-kicker"><Clock3 size={15}/> RESUME PLAYBACK</div>
              <h2>Continue Watching</h2>
            </div>
            <button className="home-see-all" onClick={() => onNavigate('library')}>
              My Library <ArrowRight size={16}/>
            </button>
          </div>
          <div className="home-row">
            {continueItems.map(({ sermon, item }: any) => {
              const pct = Math.min(100, Math.round((item.progressSeconds / Math.max(item.totalSeconds, 1)) * 100));
              return (
                <button key={sermon.id} className="home-card continue-card" onClick={() => onPlay(sermon)}>
                  <div className="home-card-art">
                    <img src={sermon.thumbnailUrl} alt={sermon.title} referrerPolicy="no-referrer"/>
                    <span className="play-orb"><Play size={18} fill="currentColor"/></span>
                    <div className="progress-rail"><i style={{width: `${pct}%`}}/></div>
                  </div>
                  <strong>{sermon.title}</strong>
                  <span className="text-slate-400 text-xs">{sermon.preacher} · {pct}% completed</span>
                </button>
              );
            })}
          </div>
        </section>
      )}

      {/* Featured Curated Spotlights Bento */}
      <section className="px-4 sm:px-8 mt-10">
        <div className="mb-4">
          <div className="home-kicker text-amber-400 text-xs font-bold tracking-wider uppercase mb-1 flex items-center gap-1.5">
            <Sparkles size={14} /> Curated Ministry Collections
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Spiritual Vault Spotlights</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Spotlight 1: Worship Nights */}
          <div
            onClick={() => onNavigate('sermons')}
            className="group cursor-pointer relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-900/60 aspect-[16/10] flex flex-col justify-end p-5 transition-all hover:border-blue-500/50 hover:shadow-xl"
          >
            <img
              src={WORSHIP_IMAGE}
              alt="Worship Nights"
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />
            <div className="relative z-10">
              <span className="text-[10px] font-bold tracking-wider text-amber-400 uppercase flex items-center gap-1 mb-1">
                <Music size={12} /> Worship & Praise
              </span>
              <h3 className="text-base font-bold text-white group-hover:text-blue-200 transition-colors">
                Encounter & Adoration Nights
              </h3>
              <p className="text-xs text-slate-300 mt-1 line-clamp-2">
                Unbroken praise, uplifting anthems, and reflective prayer environments.
              </p>
            </div>
          </div>

          {/* Spotlight 2: Bible Wisdom */}
          <div
            onClick={() => onNavigate('sermons')}
            className="group cursor-pointer relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-900/60 aspect-[16/10] flex flex-col justify-end p-5 transition-all hover:border-blue-500/50 hover:shadow-xl"
          >
            <img
              src={SCRIPTURE_IMAGE}
              alt="Bible Study"
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />
            <div className="relative z-10">
              <span className="text-[10px] font-bold tracking-wider text-amber-400 uppercase flex items-center gap-1 mb-1">
                <BookOpen size={12} /> Deep Exegesis
              </span>
              <h3 className="text-base font-bold text-white group-hover:text-blue-200 transition-colors">
                Book-by-Book Scripture Studies
              </h3>
              <p className="text-xs text-slate-300 mt-1 line-clamp-2">
                Apostolic theology, Romans 8 exposition, and timeless biblical foundations.
              </p>
            </div>
          </div>

          {/* Spotlight 3: Global Crusades */}
          <div
            onClick={() => onNavigate('events')}
            className="group cursor-pointer relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-900/60 aspect-[16/10] flex flex-col justify-end p-5 transition-all hover:border-blue-500/50 hover:shadow-xl"
          >
            <img
              src={CRUSADE_IMAGE}
              alt="Revival Gatherings"
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />
            <div className="relative z-10">
              <span className="text-[10px] font-bold tracking-wider text-amber-400 uppercase flex items-center gap-1 mb-1">
                <Flame size={12} /> Revival & Community
              </span>
              <h3 className="text-base font-bold text-white group-hover:text-blue-200 transition-colors">
                Global Crusades & Live Vigils
              </h3>
              <p className="text-xs text-slate-300 mt-1 line-clamp-2">
                Worldwide intercession and community prayer broadcasts streaming live.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Live Now Shelf */}
      {liveNow.length > 0 && (
        <section className="home-shelf">
          <div className="home-shelf-head">
            <div>
              <div className="home-kicker"><Radio size={15}/> SATELLITE & WEBDESK</div>
              <h2>Live Broadcasts Now Airing</h2>
            </div>
            <button className="home-see-all" onClick={() => onNavigate('online-videos')}>
              Explore Live Feeds <ArrowRight size={16}/>
            </button>
          </div>
          <div className="home-row">
            {liveNow.map((s, i) => (
              <button key={s.id} className="home-card" onClick={() => onPlay(s)}>
                <div className="home-card-art">
                  <img src={s.thumbnailUrl} alt={s.title} referrerPolicy="no-referrer" />
                  <div className="home-card-shade" />
                  <span className="live-pill"><i />LIVE NOW</span>
                  <span className="play-orb"><Play size={18} fill="currentColor" /></span>
                  {i < 3 && <span className="rank-num">{i + 1}</span>}
                </div>
                <strong>{s.title}</strong>
                <span>{s.preacher} · {s.ministry}</span>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Curated Recommendations Shelf */}
      <section className="home-shelf">
        <div className="home-shelf-head">
          <div>
            <div className="home-kicker"><Flame size={15}/> ESSENTIAL TEACHINGS</div>
            <h2>Pulpit Classics & Sermons</h2>
          </div>
          <button className="home-see-all" onClick={() => onNavigate('sermons')}>
            Full Catalog ({sermons.length}) <ArrowRight size={16}/>
          </button>
        </div>
        <div className="home-row">
          {recommended.map((s, i) => (
            <button key={s.id} className="home-card" onClick={() => onPlay(s)}>
              <div className="home-card-art">
                <img src={s.thumbnailUrl} alt={s.title} referrerPolicy="no-referrer" />
                <div className="home-card-shade" />
                <span className="play-orb"><Play size={18} fill="currentColor" /></span>
                {i < 3 && <span className="rank-num">{i + 1}</span>}
              </div>
              <strong>{s.title}</strong>
              <span>{s.preacher} · {s.durationFormatted}</span>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
