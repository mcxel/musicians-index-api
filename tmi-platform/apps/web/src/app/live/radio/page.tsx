'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

const PLAYLIST = [
  { id: 1, title: 'Night Protocol',     artist: 'Wavetek',       genre: 'Trap',    bpm: 145, duration: '3:24', streams: 8420,  xpPerFull: 20 },
  { id: 2, title: 'Pressure Wave',      artist: 'Astra Nova',    genre: 'Hip-Hop', bpm: 92,  duration: '4:10', streams: 5110,  xpPerFull: 15 },
  { id: 3, title: 'Lagos Heat',         artist: 'Lagos Burst',   genre: 'Afrobeat',bpm: 112, duration: '3:58', streams: 12400, xpPerFull: 25 },
  { id: 4, title: 'Crown Season',       artist: 'Bar God',       genre: 'Rap',     bpm: 88,  duration: '2:56', streams: 9800,  xpPerFull: 20 },
  { id: 5, title: 'Electric Sunrise',   artist: 'Nova Cipher',   genre: 'EDM',     bpm: 128, duration: '5:12', streams: 6700,  xpPerFull: 30 },
  { id: 6, title: 'Storm Season',       artist: 'Flex King',     genre: 'Drill',   bpm: 148, duration: '3:05', streams: 4200,  xpPerFull: 15 },
  { id: 7, title: 'Frequency',          artist: 'Prism Vex',     genre: 'Trap',    bpm: 140, duration: '3:48', streams: 7300,  xpPerFull: 20 },
  { id: 8, title: 'Global Tone',        artist: 'Zion Freq',     genre: 'Reggae',  bpm: 76,  duration: '4:32', streams: 3100,  xpPerFull: 15 },
];

const STATIONS = [
  { id: 'tmr-main',    name: 'TMI Main Radio',   desc: 'All genres · curated 24/7',  color: '#00FFFF', listeners: 3120 },
  { id: 'tmr-battle',  name: 'Battle Beats',     desc: 'Trap · Drill · Rap',          color: '#FF2DAA', listeners: 1840 },
  { id: 'tmr-afro',    name: 'Afrobeats World',  desc: 'Afrobeat · Amapiano · Naija', color: '#FFD700', listeners: 2410 },
  { id: 'tmr-chill',   name: 'Chill Sessions',   desc: 'Lo-fi · Ambient · Soul',      color: '#00FF88', listeners: 980  },
  { id: 'tmr-edm',     name: 'EDM Arena',        desc: 'House · EDM · Electronic',    color: '#AA2DFF', listeners: 1560 },
];

export default function StreamAndWinRadioPage() {
  const [currentTrack, setCurrentTrack] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [totalXp, setTotalXp] = useState(0);
  const [selectedStation, setSelectedStation] = useState(0);
  const [listeners, setListeners] = useState(STATIONS.map(s => s.listeners));
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const track = PLAYLIST[currentTrack]!;

  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            // Track completed — earn XP
            setTotalXp(xp => xp + track.xpPerFull);
            const next = (currentTrack + 1) % PLAYLIST.length;
            setCurrentTrack(next);
            return 0;
          }
          return prev + (100 / (3 * 60)); // advance ~1s per 100ms interval
        });
      }, 100);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isPlaying, currentTrack, track.xpPerFull]);

  // Tick listener counts
  useEffect(() => {
    const id = setInterval(() => {
      setListeners(prev => prev.map(v => Math.max(100, v + Math.floor((Math.random() - 0.4) * 50))));
    }, 5000);
    return () => clearInterval(id);
  }, []);

  const skip = () => {
    setCurrentTrack(i => (i + 1) % PLAYLIST.length);
    setProgress(0);
  };

  const prev = () => {
    setCurrentTrack(i => (i - 1 + PLAYLIST.length) % PLAYLIST.length);
    setProgress(0);
  };

  return (
    <main style={{ minHeight: '100vh', background: '#050510', color: '#fff', fontFamily: "'Inter', sans-serif", paddingBottom: 80 }}>
      <style>{`@keyframes eq-bar{0%,100%{height:4px}50%{height:16px}} .eq-bar{animation:eq-bar 0.6s ease-in-out infinite}`}</style>

      {/* Header */}
      <div style={{ background: 'rgba(0,0,0,0.85)', borderBottom: '1px solid rgba(0,255,255,0.25)', padding: '12px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 50 }}>
        <div>
          <div style={{ fontSize: 9, letterSpacing: '0.35em', color: '#00FFFF', fontWeight: 800 }}>STREAM & WIN RADIO</div>
          <div style={{ fontSize: 14, fontWeight: 900, marginTop: 1 }}>🎧 TMI Live Radio Network</div>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {totalXp > 0 && (
            <div style={{ background: 'rgba(0,255,136,0.1)', border: '1px solid #00FF88', color: '#00FF88', padding: '5px 14px', borderRadius: 20, fontWeight: 900, fontSize: 11 }}>
              ⭐ +{totalXp} XP earned
            </div>
          )}
          <Link href="/home/1" style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.1)', padding: '5px 12px', borderRadius: 6, textDecoration: 'none' }}>← HOME</Link>
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px', display: 'grid', gridTemplateColumns: '1fr 320px', gap: 24 }}>
        <div>

          {/* Now playing */}
          <div style={{ background: 'linear-gradient(135deg,rgba(0,255,255,0.08),rgba(5,5,16,0.98))', border: '2px solid rgba(0,255,255,0.3)', borderRadius: 16, padding: '28px', marginBottom: 20, position: 'relative', overflow: 'hidden' }}>
            {/* EQ animation */}
            {isPlaying && (
              <div style={{ position: 'absolute', top: 20, right: 20, display: 'flex', gap: 3, alignItems: 'flex-end', height: 20 }}>
                {[0.2, 0.5, 0.8, 0.4, 0.9, 0.3, 0.7, 0.6].map((delay, i) => (
                  <div key={i} className="eq-bar" style={{ width: 3, background: '#00FFFF', borderRadius: 2, animationDelay: `${delay}s` }} />
                ))}
              </div>
            )}

            <div style={{ fontSize: 9, color: '#00FFFF', fontWeight: 800, letterSpacing: '0.2em', marginBottom: 8 }}>NOW PLAYING</div>
            <div style={{ fontSize: 26, fontWeight: 900, marginBottom: 4 }}>{track.title}</div>
            <div style={{ display: 'flex', gap: 16, marginBottom: 20, fontSize: 12 }}>
              <span style={{ color: '#FF2DAA', fontWeight: 700 }}>{track.artist}</span>
              <span style={{ color: 'rgba(255,255,255,0.4)' }}>{track.genre}</span>
              <span style={{ color: 'rgba(255,255,255,0.4)' }}>{track.bpm} BPM</span>
              <span style={{ color: 'rgba(255,255,255,0.4)' }}>{track.duration}</span>
            </div>

            {/* Progress bar */}
            <div style={{ height: 6, background: 'rgba(255,255,255,0.1)', borderRadius: 3, marginBottom: 8, cursor: 'pointer' }}>
              <div style={{ width: `${progress}%`, height: '100%', background: 'linear-gradient(90deg,#00FFFF,#00FF88)', borderRadius: 3, transition: 'width 0.1s linear' }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'rgba(255,255,255,0.35)', marginBottom: 20 }}>
              <span>{Math.floor(progress * 1.8 / 100)}:{String(Math.floor((progress * 180 / 100) % 60)).padStart(2, '0')}</span>
              <span style={{ color: '#00FF88', fontWeight: 700 }}>🎁 +{track.xpPerFull} XP on full listen</span>
              <span>{track.duration}</span>
            </div>

            {/* Controls */}
            <div style={{ display: 'flex', gap: 14, alignItems: 'center', justifyContent: 'center' }}>
              <button onClick={prev} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', width: 40, height: 40, borderRadius: '50%', fontSize: 16, cursor: 'pointer' }}>⏮</button>
              <button onClick={() => setIsPlaying(p => !p)} style={{ background: '#00FFFF', border: 'none', color: '#000', width: 56, height: 56, borderRadius: '50%', fontSize: 22, cursor: 'pointer', fontWeight: 900 }}>
                {isPlaying ? '⏸' : '▶'}
              </button>
              <button onClick={skip} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', width: 40, height: 40, borderRadius: '50%', fontSize: 16, cursor: 'pointer' }}>⏭</button>
            </div>
          </div>

          {/* Playlist */}
          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: 20 }}>
            <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)', fontWeight: 800, letterSpacing: '0.2em', marginBottom: 14 }}>PLAYLIST — STREAM & WIN</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {PLAYLIST.map((t, i) => (
                <button key={t.id} onClick={() => { setCurrentTrack(i); setProgress(0); setIsPlaying(true); }} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', background: i === currentTrack ? 'rgba(0,255,255,0.08)' : 'rgba(0,0,0,0.3)', border: `1px solid ${i === currentTrack ? 'rgba(0,255,255,0.3)' : 'rgba(255,255,255,0.05)'}`, borderRadius: 8, cursor: 'pointer', textAlign: 'left' as const }}>
                  <span style={{ width: 20, fontSize: 11, color: i === currentTrack ? '#00FFFF' : 'rgba(255,255,255,0.3)', fontWeight: 700 }}>{i === currentTrack && isPlaying ? '▶' : i + 1}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: i === currentTrack ? 900 : 600, color: i === currentTrack ? '#fff' : 'rgba(255,255,255,0.7)' }}>{t.title}</div>
                    <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>{t.artist} · {t.genre}</div>
                  </div>
                  <div style={{ textAlign: 'right' as const, fontSize: 10 }}>
                    <div style={{ color: '#00FF88', fontWeight: 700 }}>+{t.xpPerFull} XP</div>
                    <div style={{ color: 'rgba(255,255,255,0.3)' }}>{t.duration}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Rail — Stations */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: 16 }}>
            <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)', fontWeight: 800, letterSpacing: '0.2em', marginBottom: 12 }}>LIVE STATIONS</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {STATIONS.map((s, i) => (
                <button key={s.id} onClick={() => setSelectedStation(i)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', background: selectedStation === i ? `${s.color}10` : 'rgba(0,0,0,0.3)', border: `1px solid ${selectedStation === i ? `${s.color}40` : 'rgba(255,255,255,0.06)'}`, borderRadius: 9, cursor: 'pointer', textAlign: 'left' as const }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: s.color, boxShadow: `0 0 6px ${s.color}`, flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, fontWeight: 800, color: selectedStation === i ? s.color : '#fff' }}>{s.name}</div>
                    <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)' }}>{s.desc}</div>
                  </div>
                  <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.35)' }}>{listeners[i]?.toLocaleString()}</div>
                </button>
              ))}
            </div>
          </div>

          {/* XP Progress */}
          <div style={{ background: 'rgba(0,255,136,0.03)', border: '1px solid rgba(0,255,136,0.2)', borderRadius: 12, padding: 16 }}>
            <div style={{ fontSize: 11, color: '#00FF88', fontWeight: 900, marginBottom: 10 }}>🎁 STREAM & WIN</div>
            <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', lineHeight: 1.6, marginBottom: 14 }}>
              Listen to full tracks to earn XP. XP counts toward your fan ranking and unlocks exclusive rewards.
            </p>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 8 }}>
              <span style={{ color: 'rgba(255,255,255,0.5)' }}>Session XP</span>
              <span style={{ color: '#00FF88', fontWeight: 900 }}>+{totalXp} XP</span>
            </div>
            {[
              { label: 'Full Track Listen', xp: '+10–30 XP', done: totalXp > 0 },
              { label: 'Share Playlist',    xp: '+15 XP',    done: false },
              { label: '5 Tracks in a Row', xp: '+50 XP',    done: false },
            ].map(r => (
              <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: 11, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <span style={{ color: r.done ? '#00FF88' : 'rgba(255,255,255,0.5)' }}>{r.done ? '✓ ' : ''}{r.label}</span>
                <span style={{ color: '#00FF88', fontWeight: 700 }}>{r.xp}</span>
              </div>
            ))}
          </div>

          {/* Submit your track */}
          <div style={{ background: 'rgba(170,45,255,0.04)', border: '1px solid rgba(170,45,255,0.2)', borderRadius: 12, padding: 16 }}>
            <div style={{ fontSize: 11, color: '#AA2DFF', fontWeight: 900, marginBottom: 8 }}>🎵 ADD YOUR TRACK</div>
            <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', lineHeight: 1.6, marginBottom: 12 }}>
              Performers can submit 2 songs for free to the Stream & Win playlist.
            </p>
            <Link href="/beats/submit" style={{ display: 'block', background: '#AA2DFF', color: '#fff', padding: '10px', borderRadius: 6, fontWeight: 900, fontSize: 11, textDecoration: 'none', textAlign: 'center' }}>
              SUBMIT A TRACK
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
