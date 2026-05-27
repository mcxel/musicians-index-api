'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import ViralShareButton from '@/components/share/ViralShareButton';

// ── Types ─────────────────────────────────────────────────────────────────────
type MediaKind = 'song' | 'video' | 'live' | 'podcast';

interface PlaylistEntry {
  id: string;
  kind: MediaKind;
  url: string;
  title: string;
  artist?: string;
  platform: string;
  addedAt: string;
  duration?: string;
}

// ── Skin system ───────────────────────────────────────────────────────────────
type SkinId = 'deep-space' | 'neon-cyber' | 'magazine' | 'arena' | 'midnight-gold';

interface Skin {
  id: SkinId;
  label: string;
  emoji: string;
  bg: string;
  bgCard: string;
  bgCardHover: string;
  accent: string;
  accentSoft: string;
  secondary: string;
  text: string;
  textMuted: string;
  border: string;
  headerFont: string;
  gradient: string;
  activeLine: string;
}

const SKINS: Skin[] = [
  {
    id: 'deep-space', label: 'DEEP SPACE', emoji: '🌌',
    bg: '#050510', bgCard: 'rgba(10,8,32,0.95)', bgCardHover: 'rgba(20,16,50,0.95)',
    accent: '#FFD700', accentSoft: 'rgba(255,215,0,0.12)', secondary: '#00FFFF',
    text: '#ffffff', textMuted: 'rgba(255,255,255,0.45)',
    border: 'rgba(255,215,0,0.18)',
    headerFont: "'Bebas Neue','Impact',sans-serif",
    gradient: 'linear-gradient(135deg,rgba(255,215,0,0.15),rgba(170,45,255,0.08))',
    activeLine: '#FFD700',
  },
  {
    id: 'neon-cyber', label: 'NEON CYBER', emoji: '⚡',
    bg: '#000814', bgCard: 'rgba(0,12,28,0.96)', bgCardHover: 'rgba(0,20,40,0.96)',
    accent: '#00FFFF', accentSoft: 'rgba(0,255,255,0.1)', secondary: '#FF2DAA',
    text: '#ffffff', textMuted: 'rgba(0,255,255,0.5)',
    border: 'rgba(0,255,255,0.2)',
    headerFont: "'Bebas Neue','Impact',sans-serif",
    gradient: 'linear-gradient(135deg,rgba(0,255,255,0.12),rgba(255,45,170,0.1))',
    activeLine: '#00FFFF',
  },
  {
    id: 'magazine', label: 'MAGAZINE', emoji: '📰',
    bg: '#080808', bgCard: 'rgba(18,18,18,0.97)', bgCardHover: 'rgba(28,28,28,0.97)',
    accent: '#ffffff', accentSoft: 'rgba(255,255,255,0.07)', secondary: '#FF2DAA',
    text: '#ffffff', textMuted: 'rgba(255,255,255,0.4)',
    border: 'rgba(255,255,255,0.1)',
    headerFont: "'Georgia','Times New Roman',serif",
    gradient: 'linear-gradient(135deg,rgba(255,255,255,0.05),rgba(255,45,170,0.06))',
    activeLine: '#FF2DAA',
  },
  {
    id: 'arena', label: 'ARENA', emoji: '🔥',
    bg: '#0d0100', bgCard: 'rgba(22,4,0,0.97)', bgCardHover: 'rgba(35,6,0,0.97)',
    accent: '#FF3300', accentSoft: 'rgba(255,51,0,0.12)', secondary: '#FFD700',
    text: '#ffffff', textMuted: 'rgba(255,120,60,0.6)',
    border: 'rgba(255,51,0,0.22)',
    headerFont: "'Bebas Neue','Impact',sans-serif",
    gradient: 'linear-gradient(135deg,rgba(255,51,0,0.15),rgba(255,215,0,0.06))',
    activeLine: '#FF3300',
  },
  {
    id: 'midnight-gold', label: 'MIDNIGHT GOLD', emoji: '👑',
    bg: '#030208', bgCard: 'rgba(8,5,18,0.97)', bgCardHover: 'rgba(14,10,28,0.97)',
    accent: '#DAA520', accentSoft: 'rgba(218,165,32,0.1)', secondary: '#AA2DFF',
    text: '#f5e6c8', textMuted: 'rgba(218,165,32,0.5)',
    border: 'rgba(218,165,32,0.18)',
    headerFont: "'Bebas Neue','Impact',sans-serif",
    gradient: 'linear-gradient(135deg,rgba(218,165,32,0.12),rgba(170,45,255,0.08))',
    activeLine: '#DAA520',
  },
];

// ── Platform helpers ───────────────────────────────────────────────────────────
function detectPlatform(url: string): string {
  if (url.includes('youtube') || url.includes('youtu.be')) return 'YouTube';
  if (url.includes('spotify'))    return 'Spotify';
  if (url.includes('soundcloud')) return 'SoundCloud';
  if (url.includes('tiktok'))     return 'TikTok';
  if (url.includes('instagram'))  return 'Instagram';
  if (url.includes('apple'))      return 'Apple Music';
  if (url.includes('twitch'))     return 'Twitch';
  if (url.includes('bandcamp'))   return 'Bandcamp';
  return 'Link';
}

const PLATFORM_COLOR: Record<string, string> = {
  YouTube: '#FF0000', Spotify: '#1DB954', SoundCloud: '#FF5500',
  TikTok: '#00F2EA', Instagram: '#E1306C', 'Apple Music': '#FC3C44',
  Twitch: '#9146FF', Bandcamp: '#1DA0C3', Link: '#00C8FF',
};
const PLATFORM_EMOJI: Record<string, string> = {
  YouTube: '▶️', Spotify: '🎵', SoundCloud: '🔊',
  TikTok: '📱', Instagram: '📸', 'Apple Music': '🎶',
  Twitch: '🎮', Bandcamp: '🎸', Link: '🔗',
};

function getEmbedUrl(url: string, platform: string): string | null {
  try {
    if (platform === 'YouTube') {
      const m = url.match(/(?:v=|youtu\.be\/)([^&?/]+)/);
      if (m) return `https://www.youtube.com/embed/${m[1]}`;
    }
    if (platform === 'Spotify') {
      const m = url.match(/spotify\.com\/(track|album|playlist)\/([^?]+)/);
      if (m) return `https://open.spotify.com/embed/${m[1]}/${m[2]}`;
    }
    if (platform === 'SoundCloud') {
      return `https://w.soundcloud.com/player/?url=${encodeURIComponent(url)}&color=%23FF5500&auto_play=false&hide_related=true&show_comments=false&show_teaser=false`;
    }
  } catch { /* no-op */ }
  return null;
}

const KIND_LABELS: Record<MediaKind, string> = {
  song: '🎵 SONG', video: '📹 VIDEO', live: '🔴 LIVE', podcast: '🎙 CAST',
};
const KIND_COLORS: Record<MediaKind, string> = {
  song: '#AA2DFF', video: '#FF2DAA', live: '#CC2200', podcast: '#00FFCC',
};

const DEMO_ENTRIES: PlaylistEntry[] = [
  { id: 'demo-1', kind: 'song', url: 'https://open.spotify.com/track/example', title: 'Add your first song', artist: 'Artist Name', platform: 'Spotify', addedAt: new Date().toISOString(), duration: '3:42' },
  { id: 'demo-2', kind: 'video', url: 'https://youtube.com/watch?v=dQw4w9WgXcQ', title: 'Add your video here', artist: 'Channel Name', platform: 'YouTube', addedAt: new Date().toISOString(), duration: '4:15' },
];

// ── Main component ─────────────────────────────────────────────────────────────
export default function ProfilePlaylist({
  writerId,
  editable = false,
  limit = 20,
  initialEntries,
  initialTitle = 'MY PLAYLIST',
  initialSkin = 'deep-space',
}: {
  writerId: string;
  editable?: boolean;
  limit?: number;
  initialEntries?: PlaylistEntry[];
  initialTitle?: string;
  initialSkin?: SkinId;
}) {
  const STORAGE_KEY = `tmi_playlist_${writerId}`;

  const [entries, setEntries] = useState<PlaylistEntry[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) return JSON.parse(saved) as PlaylistEntry[];
      } catch { /* ignore */ }
    }
    return initialEntries ?? DEMO_ENTRIES;
  });
  const [activeSkinId,   setActiveSkinId]   = useState<SkinId>(initialSkin);
  const [nowPlayingId,   setNowPlayingId]   = useState<string | null>(null);
  const [expandedId,     setExpandedId]     = useState<string | null>(null);
  const [filter,         setFilter]         = useState<MediaKind | 'all'>('all');
  const [adding,         setAdding]         = useState(false);
  const [showSkins,      setShowSkins]      = useState(false);
  const [playlistTitle,  setPlaylistTitle]  = useState(initialTitle);
  const [editingTitle,   setEditingTitle]   = useState(false);
  const [newUrl,         setNewUrl]         = useState('');
  const [newTitle,       setNewTitle]       = useState('');
  const [newArtist,      setNewArtist]      = useState('');
  const [newDuration,    setNewDuration]    = useState('');
  const [newKind,        setNewKind]        = useState<MediaKind>('song');
  const [dragOverId,     setDragOverId]     = useState<string | null>(null);
  const dragSrcId = useRef<string | null>(null);

  // Persist entries to localStorage whenever they change (owner's saves survive refresh)
  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(entries)); } catch { /* ignore */ }
  }, [entries, STORAGE_KEY]);

  const skin = SKINS.find(s => s.id === activeSkinId) ?? SKINS[0];
  const visible = (filter === 'all' ? entries : entries.filter(e => e.kind === filter)).slice(0, limit);

  // ── Drag-to-reorder ────────────────────────────────────────────────────────
  const handleDragStart = useCallback((id: string) => { dragSrcId.current = id; }, []);
  const handleDragOver  = useCallback((e: React.DragEvent, id: string) => {
    e.preventDefault();
    setDragOverId(id);
  }, []);
  const handleDrop = useCallback((targetId: string) => {
    setDragOverId(null);
    const src = dragSrcId.current;
    if (!src || src === targetId) return;
    setEntries(prev => {
      const arr = [...prev];
      const si = arr.findIndex(e => e.id === src);
      const ti = arr.findIndex(e => e.id === targetId);
      if (si < 0 || ti < 0) return prev;
      const [item] = arr.splice(si, 1);
      arr.splice(ti, 0, item);
      return arr;
    });
    dragSrcId.current = null;
  }, []);

  // ── Add track ──────────────────────────────────────────────────────────────
  function handleAdd() {
    if (!newUrl.trim()) return;
    const platform = detectPlatform(newUrl);
    const entry: PlaylistEntry = {
      id: `${writerId}-${Date.now()}`,
      kind: newKind,
      url: newUrl.trim(),
      title: newTitle.trim() || `My ${newKind}`,
      artist: newArtist.trim() || undefined,
      platform,
      duration: newDuration.trim() || undefined,
      addedAt: new Date().toISOString(),
    };
    setEntries(prev => [entry, ...prev]);
    setNewUrl(''); setNewTitle(''); setNewArtist(''); setNewDuration('');
    setAdding(false);
  }

  function moveTrack(id: string, dir: -1 | 1) {
    setEntries(prev => {
      const arr = [...prev];
      const i = arr.findIndex(e => e.id === id);
      const j = i + dir;
      if (j < 0 || j >= arr.length) return prev;
      [arr[i], arr[j]] = [arr[j], arr[i]];
      return arr;
    });
  }

  // ── Skin selector ──────────────────────────────────────────────────────────
  const SkinSelector = () => (
    <div style={{ position: 'relative' }}>
      <button
        type="button"
        onClick={() => setShowSkins(v => !v)}
        title="Change skin"
        style={{
          background: skin.accentSoft, border: `1px solid ${skin.border}`,
          color: skin.accent, padding: '5px 10px', fontSize: 9, fontWeight: 900,
          letterSpacing: '0.12em', cursor: 'pointer', fontFamily: skin.headerFont,
          display: 'flex', alignItems: 'center', gap: 5,
        }}
      >
        {skin.emoji} SKIN
      </button>
      {showSkins && (
        <div style={{
          position: 'absolute', top: '110%', right: 0, zIndex: 50,
          background: '#050510', border: `1px solid ${skin.border}`,
          boxShadow: `0 8px 32px rgba(0,0,0,0.8)`, minWidth: 180,
        }}>
          {SKINS.map(s => (
            <button
              key={s.id}
              type="button"
              onClick={() => { setActiveSkinId(s.id); setShowSkins(false); }}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                width: '100%', background: s.id === activeSkinId ? s.accentSoft : 'transparent',
                border: 'none', borderBottom: `1px solid rgba(255,255,255,0.05)`,
                color: s.id === activeSkinId ? s.accent : 'rgba(255,255,255,0.7)',
                padding: '10px 14px', fontSize: 10, fontWeight: 900,
                letterSpacing: '0.1em', cursor: 'pointer', textAlign: 'left',
              }}
            >
              <span style={{ fontSize: 16 }}>{s.emoji}</span>
              <span>{s.label}</span>
              {s.id === activeSkinId && (
                <span style={{ marginLeft: 'auto', fontSize: 8, color: s.accent }}>✓ ACTIVE</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );

  // ── Track row ──────────────────────────────────────────────────────────────
  const TrackRow = ({ entry, index }: { entry: PlaylistEntry; index: number }) => {
    const pColor   = PLATFORM_COLOR[entry.platform] ?? '#00C8FF';
    const pEmoji   = PLATFORM_EMOJI[entry.platform] ?? '🔗';
    const isNow    = nowPlayingId === entry.id;
    const isExpand = expandedId === entry.id;
    const isDragOver = dragOverId === entry.id;
    const embedUrl = getEmbedUrl(entry.url, entry.platform);

    return (
      <div
        draggable={editable}
        onDragStart={() => handleDragStart(entry.id)}
        onDragOver={e => handleDragOver(e, entry.id)}
        onDrop={() => handleDrop(entry.id)}
        onDragEnd={() => setDragOverId(null)}
        style={{
          background: isNow ? skin.bgCardHover : skin.bgCard,
          border: `1px solid ${isDragOver ? skin.accent : isNow ? skin.activeLine : skin.border}`,
          borderLeft: `3px solid ${isNow ? skin.activeLine : 'transparent'}`,
          marginBottom: 6,
          transition: 'border-color 0.15s, background 0.15s',
          opacity: isDragOver ? 0.7 : 1,
          cursor: editable ? 'grab' : 'default',
          position: 'relative', overflow: 'hidden',
        }}
      >
        {/* Glow strip on active */}
        {isNow && (
          <div style={{
            position: 'absolute', left: 0, top: 0, bottom: 0, width: 3,
            background: skin.activeLine,
            boxShadow: `0 0 12px ${skin.activeLine}88`,
          }} />
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px' }}>
          {/* Drag handle / number */}
          <div style={{
            minWidth: 22, textAlign: 'center', color: isNow ? skin.accent : skin.textMuted,
            fontSize: isNow ? 14 : 9, fontWeight: 900, flexShrink: 0,
          }}>
            {isNow ? (
              <NowPlayingDots color={skin.activeLine} />
            ) : (
              String(index + 1).padStart(2, '0')
            )}
          </div>

          {/* Platform badge */}
          <div style={{
            width: 34, height: 34,
            background: `${pColor}18`, border: `1px solid ${pColor}44`,
            display: 'grid', placeItems: 'center', fontSize: 16, flexShrink: 0,
            boxShadow: isNow ? `0 0 10px ${pColor}44` : 'none',
          }}>
            {pEmoji}
          </div>

          {/* Info */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontSize: 12, fontWeight: 900, color: isNow ? skin.accent : skin.text,
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              fontFamily: skin.id === 'magazine' ? skin.headerFont : 'inherit',
            }}>
              {entry.title}
            </div>
            <div style={{ display: 'flex', gap: 6, marginTop: 3, flexWrap: 'wrap', alignItems: 'center' }}>
              {entry.artist && (
                <span style={{ fontSize: 9, color: skin.textMuted, fontWeight: 600 }}>
                  {entry.artist}
                </span>
              )}
              <span style={{
                fontSize: 7, fontWeight: 900, letterSpacing: '0.12em',
                color: pColor, textTransform: 'uppercase',
              }}>
                {entry.platform}
              </span>
              <span style={{
                fontSize: 7, fontWeight: 900, letterSpacing: '0.1em',
                color: KIND_COLORS[entry.kind], textTransform: 'uppercase',
              }}>
                {KIND_LABELS[entry.kind]}
              </span>
              {entry.duration && (
                <span style={{ fontSize: 8, color: skin.textMuted }}>{entry.duration}</span>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: 5, flexShrink: 0, alignItems: 'center' }}>
            {/* Expand embed */}
            {embedUrl && (
              <button
                type="button"
                onClick={() => setExpandedId(isExpand ? null : entry.id)}
                title="Preview"
                style={{
                  background: isExpand ? skin.accentSoft : 'transparent',
                  border: `1px solid ${skin.border}`,
                  color: isExpand ? skin.accent : skin.textMuted,
                  width: 26, height: 26, fontSize: 10, cursor: 'pointer',
                  display: 'grid', placeItems: 'center',
                }}
              >
                {isExpand ? '▲' : '◉'}
              </button>
            )}

            {/* Play / visit */}
            <a
              href={entry.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setNowPlayingId(entry.id)}
              style={{
                background: isNow ? skin.activeLine : pColor,
                color: '#050510', border: 'none',
                padding: '5px 10px', fontSize: 8, fontWeight: 900,
                letterSpacing: '0.1em', textTransform: 'uppercase',
                textDecoration: 'none', display: 'inline-block',
                boxShadow: isNow ? `0 0 14px ${skin.activeLine}66` : 'none',
                transition: 'box-shadow 0.2s',
              }}
            >
              {isNow ? '▶ NOW' : '▶ PLAY'}
            </a>

            {/* Reorder arrows (editable) */}
            {editable && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <button type="button" onClick={() => moveTrack(entry.id, -1)}
                  style={{ background: 'transparent', border: `1px solid ${skin.border}`, color: skin.textMuted, width: 20, height: 14, fontSize: 7, cursor: 'pointer', lineHeight: 1 }}>
                  ▲
                </button>
                <button type="button" onClick={() => moveTrack(entry.id, 1)}
                  style={{ background: 'transparent', border: `1px solid ${skin.border}`, color: skin.textMuted, width: 20, height: 14, fontSize: 7, cursor: 'pointer', lineHeight: 1 }}>
                  ▼
                </button>
              </div>
            )}

            {/* Remove */}
            {editable && (
              <button
                type="button"
                onClick={() => setEntries(prev => prev.filter(e => e.id !== entry.id))}
                style={{
                  background: 'transparent', border: `1px solid rgba(255,255,255,0.12)`,
                  color: 'rgba(255,255,255,0.3)', width: 26, height: 26,
                  fontSize: 11, cursor: 'pointer', display: 'grid', placeItems: 'center',
                }}
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Inline embed panel */}
        {isExpand && embedUrl && (
          <div style={{
            borderTop: `1px solid ${skin.border}`,
            background: 'rgba(0,0,0,0.5)',
          }}>
            <iframe
              src={embedUrl}
              width="100%"
              height={entry.platform === 'Spotify' ? 80 : entry.platform === 'SoundCloud' ? 120 : 200}
              frameBorder="0"
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
              loading="lazy"
              style={{ display: 'block' }}
            />
          </div>
        )}
      </div>
    );
  };

  // ── Add form ───────────────────────────────────────────────────────────────
  const AddForm = () => {
    const detectedPlatform = newUrl ? detectPlatform(newUrl) : null;
    return (
      <div style={{
        border: `2px solid ${skin.accent}44`,
        background: skin.accentSoft,
        padding: 16, marginBottom: 14,
      }}>
        <div style={{
          fontSize: 9, fontWeight: 900, letterSpacing: '0.14em',
          color: skin.accent, marginBottom: 12, textTransform: 'uppercase',
          fontFamily: skin.headerFont,
        }}>
          + ADD A TRACK
        </div>

        {/* Kind selector */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 10, flexWrap: 'wrap' }}>
          {(['song', 'video', 'live', 'podcast'] as MediaKind[]).map(k => (
            <button
              key={k} type="button" onClick={() => setNewKind(k)}
              style={{
                background: newKind === k ? KIND_COLORS[k] : 'transparent',
                border: `1px solid ${KIND_COLORS[k]}`,
                color: newKind === k ? '#fff' : KIND_COLORS[k],
                padding: '4px 12px', fontSize: 8, fontWeight: 900,
                letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer',
              }}
            >
              {KIND_LABELS[k]}
            </button>
          ))}
        </div>

        {/* URL row with platform badge */}
        <div style={{ position: 'relative', marginBottom: 8 }}>
          <input
            type="url"
            placeholder="Paste link — YouTube, Spotify, SoundCloud, TikTok, or any URL..."
            value={newUrl}
            onChange={e => setNewUrl(e.target.value)}
            style={{
              width: '100%', background: 'rgba(255,255,255,0.06)',
              border: `1px solid ${detectedPlatform ? PLATFORM_COLOR[detectedPlatform] + '88' : 'rgba(255,255,255,0.18)'}`,
              color: '#fff', padding: '8px 12px', fontSize: 11,
              fontFamily: "'Inter',sans-serif", boxSizing: 'border-box',
              paddingRight: detectedPlatform ? 90 : 12,
            }}
          />
          {detectedPlatform && (
            <div style={{
              position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)',
              background: `${PLATFORM_COLOR[detectedPlatform]}22`,
              border: `1px solid ${PLATFORM_COLOR[detectedPlatform]}66`,
              color: PLATFORM_COLOR[detectedPlatform],
              fontSize: 8, fontWeight: 900, letterSpacing: '0.1em', padding: '2px 7px',
            }}>
              {PLATFORM_EMOJI[detectedPlatform]} {detectedPlatform.toUpperCase()}
            </div>
          )}
        </div>

        {/* Title + Artist row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 8 }}>
          <input
            type="text" placeholder="Track title (optional)"
            value={newTitle} onChange={e => setNewTitle(e.target.value)}
            style={{
              background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.14)',
              color: '#fff', padding: '7px 10px', fontSize: 11,
              fontFamily: "'Inter',sans-serif",
            }}
          />
          <input
            type="text" placeholder="Artist name (optional)"
            value={newArtist} onChange={e => setNewArtist(e.target.value)}
            style={{
              background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.14)',
              color: '#fff', padding: '7px 10px', fontSize: 11,
              fontFamily: "'Inter',sans-serif",
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <input
            type="text" placeholder="Duration e.g. 3:45"
            value={newDuration} onChange={e => setNewDuration(e.target.value)}
            style={{
              background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.14)',
              color: '#fff', padding: '7px 10px', fontSize: 11, width: 110,
              fontFamily: "'Inter',sans-serif",
            }}
          />
          <button
            type="button" onClick={handleAdd}
            style={{
              background: skin.accent, color: '#050510', border: 'none',
              padding: '8px 24px', fontWeight: 900, fontSize: 9,
              letterSpacing: '0.14em', textTransform: 'uppercase', cursor: 'pointer',
              boxShadow: `0 0 14px ${skin.accent}44`, fontFamily: skin.headerFont,
            }}
          >
            ADD TO PLAYLIST →
          </button>
          <button
            type="button" onClick={() => setAdding(false)}
            style={{
              background: 'transparent', border: `1px solid ${skin.border}`,
              color: skin.textMuted, padding: '8px 14px', fontSize: 9,
              cursor: 'pointer', letterSpacing: '0.1em',
            }}
          >
            CANCEL
          </button>
        </div>
      </div>
    );
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div
      style={{
        fontFamily: "'Inter',sans-serif",
        background: skin.bg,
        padding: 20,
        position: 'relative',
      }}
      onClick={() => showSkins && setShowSkins(false)}
    >
      <style>{`
        @keyframes tmiPlDots {
          0%,80%,100%{opacity:0.2;transform:scaleY(0.6)}
          40%{opacity:1;transform:scaleY(1.2)}
        }
      `}</style>

      {/* Header gradient bar */}
      <div style={{
        background: skin.gradient,
        border: `1px solid ${skin.border}`,
        borderBottom: `3px solid ${skin.accent}`,
        padding: '16px 18px', marginBottom: 16,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>

          {/* Title (editable) */}
          <div style={{ flex: 1, minWidth: 160 }}>
            {editingTitle && editable ? (
              <input
                autoFocus
                value={playlistTitle}
                onChange={e => setPlaylistTitle(e.target.value.toUpperCase())}
                onBlur={() => setEditingTitle(false)}
                onKeyDown={e => e.key === 'Enter' && setEditingTitle(false)}
                style={{
                  background: 'transparent',
                  border: `none`, borderBottom: `2px solid ${skin.accent}`,
                  color: skin.accent, fontSize: 22,
                  fontFamily: skin.headerFont, fontWeight: 900,
                  letterSpacing: '0.04em', width: '100%',
                  outline: 'none',
                }}
              />
            ) : (
              <div
                style={{
                  fontFamily: skin.headerFont, fontSize: 22, color: skin.accent,
                  letterSpacing: '0.04em', fontWeight: 900,
                  cursor: editable ? 'text' : 'default',
                  display: 'flex', alignItems: 'center', gap: 8,
                }}
                onClick={() => editable && setEditingTitle(true)}
              >
                🎵 {playlistTitle}
                {editable && <span style={{ fontSize: 9, color: skin.textMuted, fontWeight: 400 }}>✏</span>}
              </div>
            )}
            <div style={{ fontSize: 8, color: skin.textMuted, letterSpacing: '0.15em', marginTop: 4 }}>
              {entries.length} TRACK{entries.length !== 1 ? 'S' : ''}
            </div>
          </div>

          {/* Skin switcher */}
          <SkinSelector />

          {/* Share */}
          <ViralShareButton
            playlistId={`${writerId}-playlist`}
            curatorId={writerId}
            playlistTitle={playlistTitle}
            sharePath={`/writers/${encodeURIComponent(writerId)}`}
          />

          {/* Add button */}
          {editable && (
            <button
              type="button"
              onClick={() => setAdding(v => !v)}
              style={{
                background: adding ? 'transparent' : skin.accent,
                color: adding ? skin.textMuted : '#050510',
                border: `1px solid ${adding ? skin.border : skin.accent}`,
                padding: '6px 14px', fontWeight: 900, fontSize: 9,
                letterSpacing: '0.12em', textTransform: 'uppercase', cursor: 'pointer',
                fontFamily: skin.headerFont,
              }}
            >
              {adding ? '✕ CANCEL' : '+ ADD TRACK'}
            </button>
          )}
        </div>
      </div>

      {/* Filter pills */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 14, flexWrap: 'wrap' }}>
        {(['all', 'song', 'video', 'live', 'podcast'] as const).map(k => {
          const isActive = filter === k;
          const col = k === 'all' ? skin.secondary : KIND_COLORS[k];
          return (
            <button key={k} type="button" onClick={() => setFilter(k)}
              style={{
                background: isActive ? col : 'transparent',
                border: `1px solid ${col}66`,
                color: isActive ? '#050510' : col,
                padding: '4px 12px', fontSize: 8, fontWeight: 900,
                letterSpacing: '0.12em', textTransform: 'uppercase', cursor: 'pointer',
              }}
            >
              {k === 'all' ? 'ALL TRACKS' : KIND_LABELS[k]}
            </button>
          );
        })}
        {nowPlayingId && (
          <button type="button" onClick={() => setNowPlayingId(null)}
            style={{
              background: 'transparent', border: `1px solid ${skin.activeLine}66`,
              color: skin.activeLine, padding: '4px 12px', fontSize: 8, fontWeight: 900,
              letterSpacing: '0.12em', textTransform: 'uppercase', cursor: 'pointer',
              marginLeft: 'auto',
            }}
          >
            ■ CLEAR NOW PLAYING
          </button>
        )}
      </div>

      {/* Add form */}
      {adding && editable && <AddForm />}

      {/* Track list */}
      <div>
        {visible.length === 0 && (
          <div style={{
            textAlign: 'center', padding: '40px 16px',
            color: skin.textMuted, fontSize: 12,
            border: `1px dashed ${skin.border}`,
          }}>
            <div style={{ fontSize: 32, marginBottom: 10 }}>🎵</div>
            No tracks{filter !== 'all' ? ` matching "${filter}"` : ''}.
            {editable && filter === 'all' ? ' Click + ADD TRACK to start.' : ''}
          </div>
        )}
        {visible.map((entry, i) => (
          <TrackRow key={entry.id} entry={entry} index={i} />
        ))}
      </div>

      {/* Show more */}
      {entries.length > limit && (
        <div style={{
          textAlign: 'center', marginTop: 12,
          fontSize: 9, color: skin.textMuted,
          letterSpacing: '0.12em', textTransform: 'uppercase',
          padding: '8px',
          border: `1px dashed ${skin.border}`,
        }}>
          + {entries.length - limit} MORE TRACKS
        </div>
      )}

      {/* Skin label watermark */}
      <div style={{
        textAlign: 'right', marginTop: 10,
        fontSize: 7, color: skin.textMuted,
        letterSpacing: '0.2em', textTransform: 'uppercase',
      }}>
        {skin.emoji} {skin.label} SKIN
      </div>
    </div>
  );
}

// ── Now-playing animated dots ──────────────────────────────────────────────────
function NowPlayingDots({ color }: { color: string }) {
  return (
    <div style={{ display: 'flex', gap: 2, alignItems: 'flex-end', height: 14, justifyContent: 'center' }}>
      {[0, 1, 2].map(i => (
        <div
          key={i}
          style={{
            width: 3, height: 12, background: color, borderRadius: 1,
            animation: `tmiPlDots 1s ${i * 0.15}s ease-in-out infinite`,
          }}
        />
      ))}
    </div>
  );
}
