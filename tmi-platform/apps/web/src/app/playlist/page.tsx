'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import MediaPlayer, { MediaTrack } from '@/components/media/MediaPlayer';

interface Skin {
  id: string; name: string; emoji: string; accent: string; bg: string; gradient: string; description: string;
}

const SKINS: Skin[] = [
  { id: 'submarine',   name: 'Submarine',      emoji: '🌊', accent: '#00B4D8', bg: '#001F3F', gradient: 'linear-gradient(135deg,#001F3F,#023E6B)',  description: 'Deep sea sonar vibes'     },
  { id: 'neon-club',   name: 'Neon Club',      emoji: '🕺', accent: '#FF2DAA', bg: '#0D0014', gradient: 'linear-gradient(135deg,#0D0014,#200028)',  description: 'Underground rave energy'  },
  { id: 'radio',       name: 'Radio Station',  emoji: '📻', accent: '#FFD700', bg: '#1A1000', gradient: 'linear-gradient(135deg,#1A1000,#2D1A00)',  description: 'Classic AM/FM broadcast'  },
  { id: 'cypher',      name: 'Cypher Arena',   emoji: '🎤', accent: '#FF6B35', bg: '#0F0A00', gradient: 'linear-gradient(135deg,#0F0A00,#2A1200)',  description: 'Live battle cypher mode'  },
  { id: 'velvet',      name: 'Velvet Theater', emoji: '🎭', accent: '#9B59FF', bg: '#0D0020', gradient: 'linear-gradient(135deg,#0D0020,#1A003A)',  description: 'Cinematic velvet curtain' },
  { id: 'dj-booth',    name: 'DJ Booth',       emoji: '🎧', accent: '#00FFFF', bg: '#050510', gradient: 'linear-gradient(135deg,#050510,#0A0A24)',  description: 'Pro mixer setup'          },
  { id: 'concert',     name: 'Concert Stage',  emoji: '🎸', accent: '#39FF14', bg: '#050F00', gradient: 'linear-gradient(135deg,#050F00,#0A1A00)',  description: 'Stadium rock energy'      },
  { id: 'magazine',    name: 'Magazine',       emoji: '📰', accent: '#FFB800', bg: '#140B00', gradient: 'linear-gradient(135deg,#140B00,#221200)',  description: 'TMI editorial spread'     },
  { id: 'world-dance', name: 'World Dance',    emoji: '🌍', accent: '#00FF88', bg: '#001A0D', gradient: 'linear-gradient(135deg,#001A0D,#002D1A)',  description: 'Global rhythm fusion'     },
  { id: 'game-show',   name: 'Game Show',      emoji: '🎰', accent: '#FF3C00', bg: '#1A0000', gradient: 'linear-gradient(135deg,#1A0000,#2D0000)',  description: 'High stakes showtime'     },
];

interface PlaylistEntry extends MediaTrack {
  genre?: string;
  streams?: number;
  likes?: number;
  shares?: number;
  xp?: number;
  rank?: number;
  embedUrl?: string;
  isUserAdded?: boolean;
}

const STATIC_TRACKS: PlaylistEntry[] = [
  { id: 's1', title: 'Crown Season',    artist: 'Big Ace',       cover: '🎤', duration: 204, genre: 'Hip-Hop', streams: 12400, likes: 217, shares: 41,  xp: 12511, rank: 7  },
  { id: 's2', title: 'Neon Frequency',  artist: 'DJ Blend',      cover: '🎧', duration: 242, genre: 'EDM',     streams: 8700,  likes: 134, shares: 28,  xp: 8901,  rank: 14 },
  { id: 's3', title: 'Flame Protocol',  artist: 'Lani Flame',    cover: '🔥', duration: 227, genre: 'R&B',     streams: 9100,  likes: 188, shares: 35,  xp: 9302,  rank: 11 },
  { id: 's4', title: 'Gospel Keys',     artist: 'Blessed Voice', cover: '🙏', duration: 312, genre: 'Gospel',  streams: 6300,  likes: 94,  shares: 19,  xp: 6441,  rank: 22 },
  { id: 's5', title: 'Midnight Orbit',  artist: 'Global Vibes',  cover: '🎷', duration: 368, genre: 'Jazz',    streams: 4200,  likes: 71,  shares: 12,  xp: 4291,  rank: 31 },
  { id: 's6', title: 'Pop Signal',      artist: 'Poptronica',    cover: '🎀', duration: 178, genre: 'Pop',     streams: 11200, likes: 203, shares: 38,  xp: 11451, rank: 9  },
  { id: 's7', title: 'Street Doctrine', artist: 'Bobby Stanley', cover: '🎙️', duration: 211, genre: 'Rap',    streams: 7800,  likes: 156, shares: 29,  xp: 7981,  rank: 16 },
  { id: 's8', title: 'Soul Ignition',   artist: 'Darkwave Diva', cover: '🌑', duration: 263, genre: 'Soul',    streams: 5900,  likes: 102, shares: 21,  xp: 6032,  rank: 24 },
];

function detectDirectSrc(url: string): string | undefined {
  if (/\.(mp3|wav|flac|aac|mp4|mov|webm|ogg)(\?|$)/i.test(url)) return url;
  return undefined;
}

function detectEmbed(url: string): { embedUrl: string; cover: string; source: string } | undefined {
  const yt = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([A-Za-z0-9_-]+)/);
  if (yt) return { embedUrl: `https://www.youtube.com/embed/${yt[1]}?autoplay=1`, cover: '📺', source: 'YouTube' };
  if (url.includes('soundcloud.com')) return { embedUrl: `https://w.soundcloud.com/player/?url=${encodeURIComponent(url)}&auto_play=true&color=%2300FFFF`, cover: '🟠', source: 'SoundCloud' };
  const sp = url.match(/spotify\.com\/(track|album|playlist)\/([A-Za-z0-9]+)/);
  if (sp) return { embedUrl: `https://open.spotify.com/embed/${sp[1]}/${sp[2]}`, cover: '💚', source: 'Spotify' };
  if (url.includes('bandcamp.com')) return { embedUrl: url, cover: '🎸', source: 'Bandcamp' };
  return undefined;
}

function fmt(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function PlaylistPage() {
  const [activeSkin, setActiveSkin] = useState<string>('neon-club');
  const [userTracks, setUserTracks] = useState<PlaylistEntry[]>([]);
  const [urlInput, setUrlInput] = useState('');
  const [urlError, setUrlError] = useState('');
  const [addingUrl, setAddingUrl] = useState(false);
  const [startIdx, setStartIdx] = useState(0);
  const [playerKey, setPlayerKey] = useState(0);
  const [currentTrackId, setCurrentTrackId] = useState<string>(STATIC_TRACKS[0]?.id ?? '');
  const [activeEmbed, setActiveEmbed] = useState<{ url: string; title: string } | null>(null);
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());

  // Stream & Win live counters
  const [liveElapsed, setLiveElapsed] = useState(0);
  const [sessionStreams, setSessionStreams] = useState(0);
  const [sessionXP, setSessionXP] = useState(0);
  const [sessionShares, setSessionShares] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const streamTickRef = useRef<number | null>(null);

  const skin = SKINS.find(s => s.id === activeSkin) ?? SKINS[1]!;
  const audioTracks: PlaylistEntry[] = [...STATIC_TRACKS, ...userTracks.filter(t => !!t.src)];
  const currentTrack = audioTracks.find(t => t.id === currentTrackId) ?? audioTracks[0];

  // Persist user tracks
  useEffect(() => {
    try {
      const saved = localStorage.getItem('tmi_user_playlist');
      if (saved) setUserTracks(JSON.parse(saved));
    } catch {}
  }, []);
  useEffect(() => {
    localStorage.setItem('tmi_user_playlist', JSON.stringify(userTracks));
  }, [userTracks]);

  // Persist liked IDs
  useEffect(() => {
    try {
      const saved = localStorage.getItem('tmi_liked_tracks');
      if (saved) setLikedIds(new Set(JSON.parse(saved)));
    } catch {}
  }, []);
  const saveLikes = useCallback((ids: Set<string>) => {
    localStorage.setItem('tmi_liked_tracks', JSON.stringify([...ids]));
  }, []);

  // Stream & Win ticker: +1 stream on track start, +1 XP per 5s while playing
  useEffect(() => {
    if (isPlaying) {
      if (!streamTickRef.current) {
        setSessionStreams(n => n + 1);
      }
      streamTickRef.current = window.setInterval(() => {
        setLiveElapsed(e => e + 1);
        setSessionXP(x => x + 1);
      }, 5000);
    } else {
      if (streamTickRef.current) { clearInterval(streamTickRef.current); streamTickRef.current = null; }
    }
    return () => { if (streamTickRef.current) { clearInterval(streamTickRef.current); streamTickRef.current = null; } };
  }, [isPlaying]);

  // Reset elapsed when track changes
  useEffect(() => { setLiveElapsed(0); }, [currentTrackId]);

  function handleTrackChange(t: MediaTrack) {
    setCurrentTrackId(t.id);
    setSessionStreams(n => n + 1);
    setLiveElapsed(0);
  }

  function handleTrackClick(idx: number) {
    setStartIdx(idx);
    setPlayerKey(k => k + 1);
    setCurrentTrackId(audioTracks[idx]?.id ?? '');
    setActiveEmbed(null);
    setIsPlaying(true);
  }

  function removeUserTrack(id: string) {
    setUserTracks(prev => prev.filter(t => t.id !== id));
  }

  function toggleLike(id: string) {
    setLikedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      saveLikes(next);
      return next;
    });
  }

  function handleShare(track: PlaylistEntry) {
    const url = `${window.location.origin}/playlist?track=${encodeURIComponent(track.id)}`;
    navigator.clipboard?.writeText(url).catch(() => {});
    setSessionShares(s => s + 1);
  }

  async function handleAddUrl() {
    const url = urlInput.trim();
    if (!url) return;
    setAddingUrl(true);
    setUrlError('');
    try {
      const src = detectDirectSrc(url);
      const embed = !src ? detectEmbed(url) : undefined;
      if (!src && !embed) {
        setUrlError('Not recognized. Paste a direct MP3/WAV/MP4 link, YouTube, Spotify, or SoundCloud URL.');
        return;
      }
      const id = `url-${Date.now()}`;
      const hostname = (() => { try { return new URL(url).hostname.replace('www.', ''); } catch { return 'external'; } })();

      if (embed) {
        setActiveEmbed({ url: embed.embedUrl, title: hostname });
        const entry: PlaylistEntry = { id, title: url.slice(0, 50), artist: embed.source, cover: embed.cover, embedUrl: embed.embedUrl, isUserAdded: true };
        setUserTracks(prev => [...prev, entry]);
      } else if (src) {
        const entry: PlaylistEntry = { id, title: hostname + ' / Track ' + (userTracks.length + 1), artist: 'Added via URL', src, cover: '🎵', duration: 0, isUserAdded: true };
        setUserTracks(prev => [...prev, entry]);
        const newIdx = audioTracks.length;
        setStartIdx(newIdx);
        setPlayerKey(k => k + 1);
        setCurrentTrackId(id);
        setIsPlaying(true);
      }
      setUrlInput('');
    } catch {
      setUrlError('Invalid URL.');
    } finally {
      setAddingUrl(false);
    }
  }

  const trackStreams = (currentTrack?.streams ?? 0) + sessionStreams;
  const trackXP     = (currentTrack?.xp     ?? 0) + sessionXP;
  const trackShares = (currentTrack?.shares  ?? 0) + sessionShares;
  const trackDur    = currentTrack?.duration ?? 0;

  return (
    <main style={{ minHeight: '100vh', background: skin.bg, color: '#fff', paddingBottom: 80, transition: 'background 0.5s ease' }}>

      {/* Header */}
      <div style={{ padding: '20px 24px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link href="/" style={{ fontSize: 9, fontWeight: 800, color: 'rgba(255,255,255,.3)', textDecoration: 'none', letterSpacing: '0.15em' }}>← HOME</Link>
        <div style={{ fontSize: 9, fontWeight: 900, color: skin.accent, letterSpacing: '0.25em' }}>TMI PLAYLIST ENGINE</div>
        <Link href="/magazine" style={{ fontSize: 9, fontWeight: 800, color: 'rgba(255,255,255,.3)', textDecoration: 'none', letterSpacing: '0.15em' }}>MAGAZINE →</Link>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '24px 20px' }}>

        {/* Skin selector */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 8, fontWeight: 800, color: 'rgba(255,255,255,.35)', letterSpacing: '0.2em', marginBottom: 12 }}>CHOOSE PLAYLIST SKIN</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))', gap: 8 }}>
            {SKINS.map(s => (
              <button key={s.id} onClick={() => setActiveSkin(s.id)} style={{
                padding: '10px 8px',
                background: activeSkin === s.id ? `${s.accent}22` : 'rgba(255,255,255,0.03)',
                border: `1.5px solid ${activeSkin === s.id ? s.accent : 'rgba(255,255,255,0.08)'}`,
                borderRadius: 10, cursor: 'pointer', color: '#fff', transition: 'all 0.2s ease',
                boxShadow: activeSkin === s.id ? `0 0 16px ${s.accent}44` : 'none',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
              }}>
                <div style={{ fontSize: 20 }}>{s.emoji}</div>
                <div style={{ fontSize: 8, fontWeight: 900, color: activeSkin === s.id ? s.accent : 'rgba(255,255,255,.5)', letterSpacing: '0.04em', textAlign: 'center' }}>{s.name}</div>
              </button>
            ))}
          </div>
        </div>

        {/* URL / Upload ingestion */}
        <div style={{ marginBottom: 24, padding: '16px 20px', background: 'rgba(255,255,255,0.02)', border: `1px solid ${skin.accent}22`, borderRadius: 12 }}>
          <div style={{ fontSize: 8, fontWeight: 900, color: skin.accent, letterSpacing: '0.18em', marginBottom: 10 }}>➕ ADD TO PLAYLIST</div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            <input
              type="url"
              value={urlInput}
              onChange={e => { setUrlInput(e.target.value); setUrlError(''); }}
              onKeyDown={e => e.key === 'Enter' && handleAddUrl()}
              placeholder="Paste MP3, YouTube, Spotify, SoundCloud, or Bandcamp URL…"
              style={{ flex: 1, minWidth: 240, padding: '9px 14px', background: 'rgba(255,255,255,0.04)', border: `1px solid ${skin.accent}33`, borderRadius: 8, color: '#fff', fontSize: 11, outline: 'none' }}
            />
            <button
              onClick={handleAddUrl}
              disabled={addingUrl || !urlInput.trim()}
              style={{ padding: '9px 18px', borderRadius: 8, border: 'none', background: skin.accent, color: '#050510', fontSize: 11, fontWeight: 800, cursor: 'pointer', opacity: addingUrl || !urlInput.trim() ? 0.5 : 1 }}
            >
              {addingUrl ? '…' : 'ADD'}
            </button>
            <label style={{ padding: '9px 14px', borderRadius: 8, cursor: 'pointer', background: 'rgba(255,255,255,0.05)', border: `1px solid ${skin.accent}22`, fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.5)' }}>
              📁 UPLOAD
              <input type="file" accept=".mp3,.wav,.flac,.aac,.mp4,.mov,.webm,.ogg" style={{ display: 'none' }}
                onChange={e => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const src = URL.createObjectURL(file);
                  const entry: PlaylistEntry = { id: `upload-${Date.now()}`, title: file.name.replace(/\.[^.]+$/, ''), artist: 'Local Upload', src, cover: '📁', isUserAdded: true };
                  setUserTracks(prev => [...prev, entry]);
                  const newIdx = audioTracks.length;
                  setStartIdx(newIdx);
                  setPlayerKey(k => k + 1);
                  setCurrentTrackId(entry.id);
                  setIsPlaying(true);
                  e.target.value = '';
                }}
              />
            </label>
          </div>
          {urlError && <div style={{ fontSize: 9, color: '#FF2DAA', marginTop: 8 }}>{urlError}</div>}
        </div>

        {/* Embed preview */}
        {activeEmbed && (
          <div style={{ marginBottom: 20, borderRadius: 12, overflow: 'hidden', border: `1px solid ${skin.accent}33` }}>
            <div style={{ padding: '10px 16px', background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 9, color: skin.accent, fontWeight: 800 }}>▶ EMBEDDED PLAYER</span>
              <button onClick={() => setActiveEmbed(null)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontSize: 14 }}>✕</button>
            </div>
            <iframe
              src={activeEmbed.url}
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
              loading="lazy"
              style={{ width: '100%', height: 152, border: 'none', display: 'block', background: '#000' }}
            />
          </div>
        )}

        {/* Main layout */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 20, alignItems: 'start' }}>

          {/* Left: Track list */}
          <div>
            <div style={{ fontSize: 8, fontWeight: 800, color: 'rgba(255,255,255,.35)', letterSpacing: '0.2em', marginBottom: 12 }}>
              {skin.emoji} {skin.name.toUpperCase()} — TRACKS
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {audioTracks.map((track, i) => {
                const isCurrent = track.id === currentTrackId;
                const isLiked   = likedIds.has(track.id);
                return (
                  <div
                    key={track.id}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 14,
                      padding: '12px 16px',
                      background: isCurrent ? `${skin.accent}18` : 'rgba(255,255,255,0.02)',
                      border: `1px solid ${isCurrent ? skin.accent + '55' : 'rgba(255,255,255,0.06)'}`,
                      borderRadius: 10, color: '#fff',
                      transition: 'all 0.18s ease',
                      boxShadow: isCurrent ? `0 0 18px ${skin.accent}22` : 'none',
                    }}
                  >
                    <button
                      onClick={() => handleTrackClick(i)}
                      style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 14, flex: 1, minWidth: 0, color: '#fff', textAlign: 'left' }}
                    >
                      <div style={{
                        width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                        background: isCurrent ? skin.accent : 'rgba(255,255,255,0.06)',
                        border: `1.5px solid ${isCurrent ? skin.accent : 'rgba(255,255,255,0.12)'}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: isCurrent ? 12 : 10,
                        color: isCurrent ? '#050510' : 'rgba(255,255,255,0.4)', fontWeight: 900,
                      }}>
                        {isCurrent ? '▶' : i + 1}
                      </div>
                      <span style={{ fontSize: 22, flexShrink: 0 }}>{track.cover ?? '🎵'}</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 12, fontWeight: 800, color: isCurrent ? '#fff' : 'rgba(255,255,255,0.8)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {track.title}
                        </div>
                        <div style={{ fontSize: 9, color: isCurrent ? skin.accent : 'rgba(255,255,255,0.35)', marginTop: 2 }}>
                          {track.artist}{track.genre ? ` · ${track.genre}` : ''}
                        </div>
                      </div>
                    </button>

                    {/* Stream & Win stats per track */}
                    <div style={{ textAlign: 'right', flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 3 }}>
                      {track.streams != null && (
                        <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.3)', fontWeight: 700 }}>
                          {(isCurrent ? trackStreams : track.streams).toLocaleString()} streams
                        </div>
                      )}
                      {track.xp != null && (
                        <div style={{ fontSize: 8, color: skin.accent, fontWeight: 800 }}>
                          +{(isCurrent ? trackXP : track.xp).toLocaleString()} XP
                        </div>
                      )}
                      {track.rank != null && (
                        <div style={{ fontSize: 8, color: '#FFD700', fontWeight: 900 }}>#{track.rank}</div>
                      )}
                      {track.duration ? (
                        <div style={{ fontSize: 8, color: 'rgba(255,255,255,.2)' }}>{fmt(track.duration)}</div>
                      ) : null}
                    </div>

                    {/* Like + Share + Remove */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flexShrink: 0 }}>
                      <button
                        onClick={() => toggleLike(track.id)}
                        title={isLiked ? 'Unlike' : 'Like'}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, color: isLiked ? '#FF2DAA' : 'rgba(255,255,255,0.2)', padding: 0, lineHeight: 1 }}
                      >❤️</button>
                      <button
                        onClick={() => handleShare(track)}
                        title="Share"
                        style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 11, color: 'rgba(255,255,255,0.2)', padding: 0, lineHeight: 1 }}
                      >📤</button>
                      {track.isUserAdded && (
                        <button
                          onClick={() => removeUserTrack(track.id)}
                          title="Remove"
                          style={{ background: 'none', border: 'none', color: 'rgba(255,45,170,0.4)', fontSize: 10, cursor: 'pointer', padding: 0, lineHeight: 1 }}
                        >✕</button>
                      )}
                    </div>
                  </div>
                );
              })}
              {audioTracks.length === 0 && (
                <div style={{ padding: '24px 16px', textAlign: 'center', color: 'rgba(255,255,255,0.2)', fontSize: 11 }}>
                  Add tracks above to start your playlist
                </div>
              )}
            </div>
          </div>

          {/* Right: Player stage */}
          <div style={{
            background: skin.gradient,
            border: `1px solid ${skin.accent}33`,
            borderRadius: 16, padding: 24,
            boxShadow: `0 0 40px ${skin.accent}22`,
            position: 'sticky', top: 24,
          }}>
            <div style={{ fontSize: 8, fontWeight: 900, color: skin.accent, letterSpacing: '0.2em', marginBottom: 8, textAlign: 'center' }}>
              {skin.emoji} {skin.name.toUpperCase()} MODE
            </div>
            <div style={{ fontSize: 8, color: 'rgba(255,255,255,.3)', textAlign: 'center', marginBottom: 16, letterSpacing: '0.06em' }}>
              {skin.description}
            </div>

            {/* Album art stage */}
            <div style={{
              width: '100%', aspectRatio: '1/1',
              background: `${skin.accent}15`, borderRadius: 12,
              border: `1px solid ${skin.accent}33`,
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              marginBottom: 16, position: 'relative', overflow: 'hidden',
            }}>
              <div style={{ position: 'absolute', inset: '10%', borderRadius: '50%', border: `1px solid ${skin.accent}22`, animation: 'playlistPulse 2s ease-in-out infinite' }} />
              <style>{`
                @keyframes playlistPulse { 0%,100%{transform:scale(1);opacity:.4} 50%{transform:scale(1.05);opacity:.8} }
                @keyframes playlistSpin  { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
              `}</style>
              <div style={{ fontSize: 64, animation: isPlaying ? 'playlistSpin 8s linear infinite' : 'none' }}>
                {currentTrack?.cover ?? skin.emoji}
              </div>
              <div style={{ fontSize: 13, fontWeight: 900, color: '#fff', marginTop: 10, textAlign: 'center', padding: '0 16px', overflow: 'hidden', textOverflow: 'ellipsis', width: '100%', whiteSpace: 'nowrap' }}>
                {currentTrack?.title ?? '—'}
              </div>
              <div style={{ fontSize: 10, color: skin.accent, fontWeight: 700, marginTop: 3 }}>
                {currentTrack?.artist ?? '—'}
              </div>
            </div>

            {/* Stream & Win digital display */}
            <div style={{
              background: 'rgba(0,0,0,0.5)',
              border: `1px solid ${skin.accent}33`,
              borderRadius: 10, padding: '12px 16px',
              marginBottom: 14,
              fontFamily: 'monospace',
            }}>
              <div style={{ fontSize: 8, fontWeight: 900, color: skin.accent, letterSpacing: '0.18em', marginBottom: 8 }}>
                {isPlaying ? '▶ NOW PLAYING' : '⏸ PAUSED'}
              </div>
              <div style={{ fontSize: 18, fontWeight: 900, color: '#fff', marginBottom: 6, letterSpacing: '0.05em' }}>
                {fmt(liveElapsed)} / {trackDur ? fmt(trackDur) : '--:--'}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 12px' }}>
                <div>
                  <div style={{ fontSize: 7, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.1em' }}>STREAMS</div>
                  <div style={{ fontSize: 13, fontWeight: 900, color: '#fff' }}>{trackStreams.toLocaleString()}</div>
                </div>
                <div>
                  <div style={{ fontSize: 7, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.1em' }}>XP EARNED</div>
                  <div style={{ fontSize: 13, fontWeight: 900, color: skin.accent }}>{trackXP.toLocaleString()}</div>
                </div>
                <div>
                  <div style={{ fontSize: 7, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.1em' }}>SHARES</div>
                  <div style={{ fontSize: 13, fontWeight: 900, color: '#FFD700' }}>{trackShares.toLocaleString()}</div>
                </div>
                <div>
                  <div style={{ fontSize: 7, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.1em' }}>RANK</div>
                  <div style={{ fontSize: 13, fontWeight: 900, color: '#FFD700' }}>
                    {currentTrack?.rank != null ? `#${currentTrack.rank}` : '—'}
                  </div>
                </div>
              </div>
              {sessionXP > 0 && (
                <div style={{ marginTop: 8, fontSize: 9, color: skin.accent, fontWeight: 800, textAlign: 'center', letterSpacing: '0.08em' }}>
                  +{sessionXP} TMI POINTS EARNED THIS SESSION
                </div>
              )}
            </div>

            {/* MediaPlayer — real audio controls */}
            {audioTracks.length > 0 && (
              <MediaPlayer
                key={playerKey}
                tracks={audioTracks}
                accentColor={skin.accent}
                compact={false}
                startIndex={startIdx}
                autoPlay={isPlaying}
                onTrackChange={t => {
                  handleTrackChange(t);
                  setIsPlaying(true);
                }}
              />
            )}

            {/* Action buttons */}
            <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
              <Link
                href={`/profile/performer/${(currentTrack?.artist ?? '').toLowerCase().replace(/\s+/g, '-')}`}
                style={{
                  flex: 1, textAlign: 'center', padding: '9px 0',
                  background: `${skin.accent}22`, border: `1px solid ${skin.accent}44`,
                  borderRadius: 8, fontSize: 9, fontWeight: 800, color: skin.accent,
                  textDecoration: 'none', letterSpacing: '0.06em',
                }}
              >
                VIEW ARTIST
              </Link>
              <button
                onClick={() => currentTrack && handleShare(currentTrack)}
                style={{
                  flex: 1, padding: '9px 0',
                  background: 'rgba(255,45,170,0.1)', border: '1px solid rgba(255,45,170,0.3)',
                  borderRadius: 8, fontSize: 9, fontWeight: 800, color: '#FF2DAA',
                  cursor: 'pointer', letterSpacing: '0.06em',
                }}
              >
                📤 SHARE
              </button>
            </div>
          </div>
        </div>

        {/* Footer links */}
        <div style={{ marginTop: 32, paddingTop: 20, borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          {[
            { label: '← Back to Home', href: '/' },
            { label: '⚔️ Battle Arena', href: '/battles' },
            { label: '🎤 Cypher', href: '/cypher' },
            { label: '🎵 Challenges', href: '/challenges' },
            { label: '📰 Magazine', href: '/magazine' },
          ].map(l => (
            <Link key={l.href} href={l.href} style={{
              fontSize: 9, fontWeight: 800, color: 'rgba(255,255,255,.3)',
              textDecoration: 'none', letterSpacing: '0.12em',
              padding: '4px 10px', borderRadius: 4, border: '1px solid rgba(255,255,255,.06)',
            }}>{l.label}</Link>
          ))}
        </div>
      </div>
    </main>
  );
}
