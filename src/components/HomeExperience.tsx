import React from 'react';
import { Play, Radio, Sparkles, ArrowRight, Clock3, Bookmark, Flame } from 'lucide-react';
import { Sermon, SyncState } from '../types';

interface HomeExperienceProps {
  sermons: Sermon[];
  syncState: SyncState;
  onPlay: (sermon: Sermon) => void;
  onNavigate: (tab: 'sermons' | 'online-videos' | 'library') => void;
}

const pickHero = (sermons: Sermon[]) => sermons.find(s => s.isLive) || sermons[0];

export function HomeExperience({ sermons, syncState, onPlay, onNavigate }: HomeExperienceProps) {
  const hero = pickHero(sermons);
  const continueItems = syncState.continueWatching
    .map(item => ({ item, sermon: sermons.find(s => s.id === item.sermonId) }))
    .filter((x): x is { item: typeof x.item; sermon: Sermon } => Boolean(x.sermon))
    .slice(0, 8);
  const liveNow = sermons.filter(s => s.isLive).slice(0, 8);
  const recommended = sermons.filter(s => !s.isLive).slice(0, 10);

  const Shelf = ({ title, subtitle, icon, items, action, actionLabel }: any) => (
    <section className="home-shelf">
      <div className="home-shelf-head">
        <div>
          <div className="home-kicker">{icon}{subtitle}</div>
          <h2>{title}</h2>
        </div>
        {action && <button className="home-see-all" onClick={action}>{actionLabel || 'See all'} <ArrowRight size={16}/></button>}
      </div>
      <div className="home-row">
        {items.map((s: Sermon, i: number) => (
          <button key={s.id} className="home-card" onClick={() => onPlay(s)}>
            <div className="home-card-art">
              <img src={s.thumbnailUrl} alt="" referrerPolicy="no-referrer" />
              <div className="home-card-shade" />
              {s.isLive && <span className="live-pill"><i />LIVE</span>}
              <span className="play-orb"><Play size={18} fill="currentColor" /></span>
              {i < 3 && <span className="rank-num">{i + 1}</span>}
            </div>
            <strong>{s.title}</strong>
            <span>{s.preacher} · {s.durationFormatted}</span>
          </button>
        ))}
      </div>
    </section>
  );

  return (
    <div className="home-experience">
      {hero && <section className="home-hero">
        <img className="home-hero-bg" src={hero.thumbnailUrl} alt="" referrerPolicy="no-referrer" />
        <div className="home-hero-vignette" />
        <div className="home-hero-content">
          <div className="hero-eyebrow"><Sparkles size={15}/> GOSPELSTREAM PREMIERE</div>
          <div className="hero-live"><span /><Radio size={14}/>{hero.isLive ? 'LIVE NOW' : 'FEATURED MESSAGE'}</div>
          <h1>{hero.title}</h1>
          <p>{hero.description || hero.scriptureText}</p>
          <div className="hero-meta">
            <span>{hero.preacher}</span><b>•</b><span>{hero.ministry}</span><b>•</b><span>{hero.durationFormatted}</span>
          </div>
          <div className="hero-actions">
            <button className="hero-play" onClick={() => onPlay(hero)}><Play size={19} fill="currentColor"/> Watch now</button>
            <button className="hero-info" onClick={() => onNavigate('sermons')}>Browse messages</button>
          </div>
        </div>
      </section>}

      <div className="home-command">
        <button onClick={() => onNavigate('online-videos')}><Radio size={18}/><span>Live Now</span></button>
        <button onClick={() => onNavigate('sermons')}><Flame size={18}/><span>Trending</span></button>
        <button onClick={() => onNavigate('library')}><Bookmark size={18}/><span>My Library</span></button>
        <div><Clock3 size={18}/><span>{sermons.length} messages ready</span></div>
      </div>

      {continueItems.length > 0 && (
        <section className="home-shelf continue-shelf">
          <div className="home-shelf-head"><div><div className="home-kicker"><Clock3 size={15}/> PICK UP WHERE YOU LEFT OFF</div><h2>Continue watching</h2></div><button className="home-see-all" onClick={() => onNavigate('library')}>Library <ArrowRight size={16}/></button></div>
          <div className="home-row">
            {continueItems.map(({ sermon, item }: any) => {
              const pct = Math.min(100, Math.round(item.progressSeconds / Math.max(item.totalSeconds, 1) * 100));
              return <button key={sermon.id} className="home-card continue-card" onClick={() => onPlay(sermon)}>
                <div className="home-card-art"><img src={sermon.thumbnailUrl} alt="" referrerPolicy="no-referrer"/><span className="play-orb"><Play size={18} fill="currentColor"/></span><div className="progress-rail"><i style={{width: `${pct}%`}}/></div></div>
                <strong>{sermon.title}</strong><span>{pct}% watched</span>
              </button>
            })}
          </div>
        </section>
      )}

      {liveNow.length > 0 && <Shelf title="Live now" subtitle="JOIN THE BROADCAST" icon={<Radio size={15}/>} items={liveNow} action={() => onNavigate('online-videos')} actionLabel="Open live feeds" />}
      <Shelf title="Made for your next moment" subtitle="CURATED FOR YOU" icon={<Sparkles size={15}/>} items={recommended} action={() => onNavigate('sermons')} actionLabel="Explore all" />
    </div>
  );
}
