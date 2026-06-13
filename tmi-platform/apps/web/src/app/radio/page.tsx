'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

interface Station {
  id: string;
  name: string;
  genre: string;
  host: string;
  listeners: number;
  emoji: string;
  accent: string;
  tagline: string;
  xpPerMin: number;
}

const STATIONS: Station[] = [
  { id: 'hip-hop-1',   name: 'Crown Radio',         genre: 'Hip-Hop',  host: 'Big Ace',       listeners: 1240, emoji: '🎤', accent: '#FFD700', tagline: 'The #1 battle hip-hop station',        xpPerMin: 5 },
  { id: 'rnb-1',       name: 'Flame FM',            genre: 'R&B',      host: 'Lani Flame',    listeners: 892,  emoji: '🔥', accent: '#FF2DAA', tagline: 'Soul, heat, and high vibes',           xpPerMin: 4 },
  { id: 'edm-1',       name: 'Blend Station',       genre: 'EDM',      host: 'DJ Blend',      listeners: 2140, emoji: '🎧', accent: '#00FFFF', tagline: 'Non-stop DJ sets from the arena',      xpPerMin: 6 },
  { id: 'gospel-1',    name: 'Sacred Sound Radio',  genre: 'Gospel',   host: 'Blessed Voice', listeners: 430,  emoji: '🙏', accent: '#00FF88', tagline: 'Faith, rhythm, and community',         xpPerMin: 4 },
  { id: 'jazz-1',      name: 'Midnight Orbit Radio',genre: 'Jazz',     host: 'Global Vibes',  listeners: 310,  emoji: '🎷', accent: '#AA2DFF', tagline: 'Smooth jazz from the digital lounge',  xpPerMin: 3 },
  { id: 'rap-1',       name: 'Bars & Beats Radio',  genre: 'Rap',      host: 'Bobby Stanley', listeners: 760,  emoji: '🎙️', accent: '#39FF14', tagline: 'Bars that hit different',               xpPerMin: 5 },
  { id: 'pop-1',       name: 'Pop Signal',          genre: 'Pop',      host: 'Poptronica',    listeners: 1820, emoji: '🎀', accent: '#FF6B35', tagline: 'The charts come alive here',           xpPerMin: 5 },
  { id: 'cypher-live', name: 'Cypher Live Radio',   genre: 'All',      host: 'TMI Arena',     listeners: 3240, emoji: '⚡', accent: '#FF2DAA', tagline: 'Live cypher sessions 24/7',            xpPerMin: 8 },
];

const TRACK_QUEUE = [
  { title: 'Crown Season',        artist: 'Big Ace',       dur: '3:24' },
  { title: 'Neon Frequency',      artist: 'DJ Blend',      dur: '4:02' },
  { title: 'Flame Protocol',      artist: 'Lani Flame',    dur: '3:47' },
  { title: 'Street Doctrine',     artist: 'Bobby Stanley', dur: '3:31' },
  { title: 'Pop Signal (Radio Edit)', artist: 'Poptronica',dur: '2:58' },
];

export default function RadioPage() {
  const [activeStation, setActiveStation] = useState<string>('edm-1');
  const [playing, setPlaying] = useState(true);
  const [volume, setVolume] = useState(80);
  const [xpEarned, setXpEarned] = useState(0);
  const [trackIdx, setTrackIdx] = useState(0);
  const [progress, setProgress] = useState(0);
  const [listeners, setListeners] = useState<Record<string, number>>({});
  const tickRef = useRef<NodeJS.Timeout | null>(null);

  const station = STATIONS.find(s => s.id === activeStation) ?? STATIONS[2]!;
  const track = TRACK_QUEUE[trackIdx % TRACK_QUEUE.length]!;

  // XP drip while playing
  useEffect(() => {
    if (!playing) { if (tickRef.current) clearInterval(tickRef.current); return; }
    tickRef.current = setInterval(() => {
      setXpEarned(x => x + station.xpPerMin);
      setProgress(p => {
        if (p >= 100) { setTrackIdx(i => i + 1); return 0; }
        return p + 1.4;
      });
    }, 1000);
    return () => { if (tickRef.current) clearInterval(tickRef.current); };
  }, [playing, station.xpPerMin]);

  // Listener count drift
  useEffect(() => {
    const id = setInterval(() => {
      setListeners(prev => {
        const next = { ...prev };
        STATIONS.forEach(s => {
          const base = s.listeners;
          next[s.id] = base + Math.floor(Math.sin(Date.now() / 3000 + base) * 20);
        });
        return next;
      });
    }, 2500);
    return () => clearInterval(id);
  }, []);

  return (
    <main style={{ minHeight: '100vh', background: '#050510', color: '#fff', fontFamily: "'Inter', sans-serif", paddingBottom: 120 }}>

      {/* Header */}
      <div style={{
        background: `linear-gradient(135deg, ${station.accent}18, #0a0510)`,
        borderBottom: `2px solid ${station.accent}44`,
        padding: '20px 24px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12,
        transition: 'background 0.5s ease',
      }}>
        <div>
          <div style={{ fontSize: 9, fontWeight: 800, color: station.accent, letterSpacing: '0.25em', marginBottom: 4 }}>TMI STREAM & WIN RADIO</div>
          <div style={{ fontSize: 'clamp(18px,3vw,26px)', fontWeight: 900, color: '#fff' }}>{station.name}</div>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,.4)', marginTop: 2 }}>Hosted by {station.host} · {station.genre}</div>
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 22, fontWeight: 900, color: '#FFD700' }}>+{xpEarned}</div>
            <div style={{ fontSize: 8, color: 'rgba(255,255,255,.35)', letterSpacing: '0.1em' }}>XP EARNED</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 14, fontWeight: 900, color: '#00FF88' }}>{(listeners[activeStation] ?? station.listeners).toLocaleString()}</div>
            <div style={{ fontSize: 8, color: 'rgba(255,255,255,.35)', letterSpacing: '0.1em' }}>LISTENING</div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '24px 20px', display: 'grid', gridTemplateColumns: '280px 1fr', gap: 20 }}>

        {/* Station list */}
        <div>
          <div style={{ fontSize: 8, fontWeight: 800, color: 'rgba(255,255,255,.3)', letterSpacing: '0.2em', marginBottom: 12 }}>STATIONS</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {STATIONS.map(s => {
              const active = s.id === activeStation;
              return (
                <button key={s.id} onClick={() => { setActiveStation(s.id); setProgress(0); setTrackIdx(0); }} style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '12px 14px',
                  background: active ? `${s.accent}18` : 'rgba(255,255,255,0.02)',
                  border: `1px solid ${active ? s.accent + '55' : 'rgba(255,255,255,0.06)'}`,
                  borderRadius: 10, cursor: 'pointer', textAlign: 'left', color: '#fff', width: '100%',
                  transition: 'all 0.18s ease',
                }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: `${s.accent}22`, border: `1.5px solid ${s.accent}55`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>
                    {s.emoji}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 11, fontWeight: 800, color: active ? '#fff' : 'rgba(255,255,255,.7)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.name}</div>
                    <div style={{ fontSize: 8, color: active ? s.accent : 'rgba(255,255,255,.3)', marginTop: 1 }}>{s.genre} · +{s.xpPerMin} XP/min</div>
                  </div>
                  {active && (
                    <div style={{ width: 7, height: 7, borderRadius: '50%', background: s.accent, flexShrink: 0 }} />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Player area */}
        <div>
          {/* Now playing */}
          <div style={{
            background: `linear-gradient(135deg, ${station.accent}12, rgba(10,6,20,.9))`,
            border: `1px solid ${station.accent}33`,
            borderRadius: 16, padding: 28, marginBottom: 16,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 20 }}>
              <div style={{
                width: 80, height: 80, borderRadius: 12,
                background: `${station.accent}22`, border: `2px solid ${station.accent}55`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 40,
                animation: playing ? 'radioSpin 12s linear infinite' : 'none',
              }}>
                {station.emoji}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 8, fontWeight: 800, color: station.accent, letterSpacing: '0.2em', marginBottom: 4 }}>NOW PLAYING</div>
                <div style={{ fontSize: 18, fontWeight: 900, color: '#fff', marginBottom: 2 }}>{track.title}</div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,.5)' }}>{track.artist}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: station.accent, background: `${station.accent}18`, border: `1px solid ${station.accent}33`, borderRadius: 20, padding: '3px 10px', letterSpacing: '0.08em' }}>
                  {station.genre.toUpperCase()}
                </div>
                <div style={{ fontSize: 9, color: 'rgba(255,255,255,.3)', marginTop: 6 }}>{station.tagline}</div>
              </div>
            </div>

            <style>{`
              @keyframes radioSpin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
            `}</style>

            {/* Progress */}
            <div style={{ marginBottom: 14 }}>
              <div style={{ height: 4, background: 'rgba(255,255,255,.1)', borderRadius: 2, cursor: 'pointer', marginBottom: 4 }}>
                <div style={{ height: '100%', width: `${progress}%`, background: station.accent, borderRadius: 2, transition: 'width 0.5s ease' }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 8, color: 'rgba(255,255,255,.3)' }}>
                <span>LIVE STREAM</span>
                <span>+{station.xpPerMin} XP/MIN WHILE LISTENING</span>
              </div>
            </div>

            {/* Controls */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <button onClick={() => setTrackIdx(i => Math.max(0, i - 1))} style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,.4)', fontSize: 18, cursor: 'pointer' }}>⏮</button>
              <button onClick={() => setPlaying(p => !p)} style={{
                width: 52, height: 52, borderRadius: '50%',
                background: playing ? station.accent : 'rgba(255,255,255,.1)',
                border: 'none', color: playing ? '#050510' : '#fff',
                fontSize: 20, cursor: 'pointer', fontWeight: 900,
                boxShadow: playing ? `0 0 24px ${station.accent}66` : 'none',
                transition: 'all 0.2s ease',
              }}>
                {playing ? '⏸' : '▶'}
              </button>
              <button onClick={() => setTrackIdx(i => i + 1)} style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,.4)', fontSize: 18, cursor: 'pointer' }}>⏭</button>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: 12, flex: 1 }}>
                <span style={{ fontSize: 14 }}>🔊</span>
                <input type="range" min="0" max="100" value={volume} onChange={e => setVolume(Number(e.target.value))} style={{ flex: 1, accentColor: station.accent }} />
                <span style={{ fontSize: 10, color: 'rgba(255,255,255,.3)', width: 28 }}>{volume}%</span>
              </div>
            </div>
          </div>

          {/* Track queue */}
          <div style={{ background: 'rgba(255,255,255,.02)', border: '1px solid rgba(255,255,255,.07)', borderRadius: 12, padding: '16px 18px', marginBottom: 16 }}>
            <div style={{ fontSize: 8, fontWeight: 800, color: 'rgba(255,255,255,.3)', letterSpacing: '0.2em', marginBottom: 12 }}>UP NEXT</div>
            {TRACK_QUEUE.map((t, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,.05)',
                opacity: i < trackIdx % TRACK_QUEUE.length ? 0.35 : 1,
              }}>
                <span style={{ fontSize: 12, color: i === trackIdx % TRACK_QUEUE.length ? station.accent : 'rgba(255,255,255,.3)', width: 16, textAlign: 'center' }}>
                  {i === trackIdx % TRACK_QUEUE.length ? '▶' : i + 1}
                </span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#fff' }}>{t.title}</div>
                  <div style={{ fontSize: 9, color: 'rgba(255,255,255,.4)' }}>{t.artist}</div>
                </div>
                <span style={{ fontSize: 9, color: 'rgba(255,255,255,.3)' }}>{t.dur}</span>
              </div>
            ))}
          </div>

          {/* XP rewards */}
          <div style={{ background: 'rgba(255,215,0,.04)', border: '1px solid rgba(255,215,0,.15)', borderRadius: 12, padding: '16px 18px' }}>
            <div style={{ fontSize: 8, fontWeight: 800, color: '#FFD700', letterSpacing: '0.2em', marginBottom: 12 }}>🌟 STREAM & WIN REWARDS</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(160px,1fr))', gap: 8 }}>
              {[
                { label: 'Watch 30 min',          xp: 150,  done: xpEarned >= 150 },
                { label: 'Tip an Artist',         xp: 200,  done: false            },
                { label: 'Vote in Battle',        xp: 100,  done: false            },
                { label: 'Listen 1 Hour',         xp: 360,  done: xpEarned >= 360  },
                { label: 'Subscribe to Fan Club', xp: 500,  done: false            },
                { label: 'Attend Live Show',      xp: 350,  done: false            },
              ].map(r => (
                <div key={r.label} style={{
                  padding: '10px 12px',
                  background: r.done ? 'rgba(0,255,136,.08)' : 'rgba(255,215,0,.04)',
                  border: `1px solid ${r.done ? 'rgba(0,255,136,.3)' : 'rgba(255,215,0,.15)'}`,
                  borderRadius: 8, display: 'flex', alignItems: 'center', gap: 8,
                }}>
                  <span style={{ fontSize: 14 }}>{r.done ? '✅' : '⭕'}</span>
                  <div>
                    <div style={{ fontSize: 9, fontWeight: 700, color: r.done ? '#00FF88' : '#fff' }}>{r.label}</div>
                    <div style={{ fontSize: 9, color: '#FFD700', fontWeight: 800 }}>+{r.xp} XP</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Nav links */}
          <div style={{ display: 'flex', gap: 12, marginTop: 20, flexWrap: 'wrap' }}>
            {[
              { href: '/stream-win',  label: '🌟 Stream & Win', color: '#FF2DAA' },
              { href: '/battles',     label: '⚔️ Battles',      color: '#FF2DAA' },
              { href: '/cypher',      label: '🎤 Cypher',       color: '#00FFFF' },
              { href: '/playlist',    label: '🎵 Playlists',    color: '#AA2DFF' },
              { href: '/magazine',    label: '📰 Magazine',     color: '#FFD700' },
            ].map(l => (
              <Link key={l.href} href={l.href} style={{ fontSize: 9, fontWeight: 800, color: l.color, border: `1px solid ${l.color}44`, borderRadius: 6, padding: '5px 12px', textDecoration: 'none', letterSpacing: '0.08em' }}>
                {l.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
