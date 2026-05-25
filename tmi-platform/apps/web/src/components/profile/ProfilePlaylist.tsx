'use client';

import { useState } from 'react';

type MediaKind = 'song' | 'video' | 'live';

interface PlaylistEntry {
  id: string;
  kind: MediaKind;
  url: string;
  title: string;
  platform: string;
  addedAt: string;
}

function detectPlatform(url: string): string {
  if (url.includes('youtube') || url.includes('youtu.be')) return 'YouTube';
  if (url.includes('spotify'))    return 'Spotify';
  if (url.includes('soundcloud')) return 'SoundCloud';
  if (url.includes('tiktok'))     return 'TikTok';
  if (url.includes('instagram'))  return 'Instagram';
  if (url.includes('apple'))      return 'Apple Music';
  return 'Link';
}

function platformColor(platform: string): string {
  const map: Record<string, string> = {
    YouTube: '#FF0000', Spotify: '#1DB954', SoundCloud: '#FF5500',
    TikTok: '#00F2EA', Instagram: '#E1306C', 'Apple Music': '#FC3C44', Link: '#00C8FF',
  };
  return map[platform] ?? '#00C8FF';
}

function platformEmoji(platform: string): string {
  const map: Record<string, string> = {
    YouTube: '▶️', Spotify: '🎵', SoundCloud: '🔊',
    TikTok: '📱', Instagram: '📸', 'Apple Music': '🎶', Link: '🔗',
  };
  return map[platform] ?? '🔗';
}

const KIND_LABELS: Record<MediaKind, string> = { song: '🎵 SONG', video: '📹 VIDEO', live: '🔴 LIVE' };
const KIND_COLORS: Record<MediaKind, string> = { song: '#AA2DFF', video: '#FF2DAA', live: '#CC2200' };

const DEMO_ENTRIES: PlaylistEntry[] = [
  { id: 'demo-1', kind: 'song',  url: 'https://open.spotify.com/track/example', title: 'Add your song here', platform: 'Spotify',    addedAt: new Date().toISOString() },
  { id: 'demo-2', kind: 'video', url: 'https://youtube.com/watch?v=example',   title: 'Add your video here', platform: 'YouTube',    addedAt: new Date().toISOString() },
];

export default function ProfilePlaylist({
  writerId,
  editable = false,
  limit = 12,
}: {
  writerId: string;
  editable?: boolean;
  limit?: number;
}) {
  const [entries, setEntries] = useState<PlaylistEntry[]>(DEMO_ENTRIES);
  const [newUrl,   setNewUrl]   = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [newKind,  setNewKind]  = useState<MediaKind>('song');
  const [adding,   setAdding]   = useState(false);
  const [filter,   setFilter]   = useState<MediaKind | 'all'>('all');

  const visible = (filter === 'all' ? entries : entries.filter(e => e.kind === filter)).slice(0, limit);

  function handleAdd() {
    if (!newUrl.trim()) return;
    const platform = detectPlatform(newUrl);
    const entry: PlaylistEntry = {
      id: `${writerId}-${Date.now()}`,
      kind: newKind,
      url: newUrl.trim(),
      title: newTitle.trim() || `My ${newKind}`,
      platform,
      addedAt: new Date().toISOString(),
    };
    setEntries(prev => [entry, ...prev]);
    setNewUrl('');
    setNewTitle('');
    setAdding(false);
  }

  function handleRemove(id: string) {
    setEntries(prev => prev.filter(e => e.id !== id));
  }

  return (
    <div style={{ fontFamily: "'Inter',sans-serif" }}>
      <style>{`
        @keyframes tmiPlPulse { 0%,100%{opacity:1}50%{opacity:0.6} }
      `}</style>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14, flexWrap: 'wrap' }}>
        <div style={{ fontFamily: "'Bebas Neue','Impact',sans-serif", fontSize: 22, color: '#FFD700', letterSpacing: '0.04em' }}>
          🎵 MY PLAYLIST
        </div>
        <div style={{ flex: 1, height: 2, background: 'linear-gradient(90deg,#FFD700,transparent)' }} />
        {editable && (
          <button
            type="button"
            onClick={() => setAdding(v => !v)}
            style={{
              background: '#FFD700', color: '#050510', border: 'none',
              padding: '6px 14px', fontWeight: 900, fontSize: 9,
              letterSpacing: '0.12em', textTransform: 'uppercase', cursor: 'pointer',
            }}
          >
            {adding ? '✕ CANCEL' : '+ ADD LINK'}
          </button>
        )}
      </div>

      {/* Filter pills */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
        {(['all', 'song', 'video', 'live'] as const).map(k => (
          <button
            key={k}
            type="button"
            onClick={() => setFilter(k)}
            style={{
              background: filter === k ? (k === 'all' ? '#00C8FF' : KIND_COLORS[k]) : 'transparent',
              border: `1px solid ${k === 'all' ? '#00C8FF' : KIND_COLORS[k]}66`,
              color: filter === k ? '#050510' : 'rgba(255,255,255,0.7)',
              padding: '4px 12px', fontSize: 8, fontWeight: 900,
              letterSpacing: '0.14em', textTransform: 'uppercase', cursor: 'pointer',
            }}
          >
            {k === 'all' ? 'ALL' : KIND_LABELS[k]}
          </button>
        ))}
      </div>

      {/* Add form */}
      {adding && editable && (
        <div style={{
          border: '2px solid #FFD70066',
          background: 'rgba(255,215,0,0.05)',
          padding: 16, marginBottom: 14,
        }}>
          <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: '0.14em', color: '#FFD700', marginBottom: 10, textTransform: 'uppercase' }}>
            ADD A TRACK OR VIDEO
          </div>
          <div style={{ display: 'flex', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
            {(['song', 'video', 'live'] as MediaKind[]).map(k => (
              <button
                key={k}
                type="button"
                onClick={() => setNewKind(k)}
                style={{
                  background: newKind === k ? KIND_COLORS[k] : 'transparent',
                  border: `1px solid ${KIND_COLORS[k]}`,
                  color: newKind === k ? '#fff' : KIND_COLORS[k],
                  padding: '4px 12px', fontSize: 8, fontWeight: 900,
                  letterSpacing: '0.12em', textTransform: 'uppercase', cursor: 'pointer',
                }}
              >
                {KIND_LABELS[k]}
              </button>
            ))}
          </div>
          <input
            type="url"
            placeholder="Paste YouTube, Spotify, SoundCloud, TikTok or any link..."
            value={newUrl}
            onChange={e => setNewUrl(e.target.value)}
            style={{
              width: '100%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.18)',
              color: '#fff', padding: '8px 12px', fontSize: 11, fontFamily: "'Inter',sans-serif",
              marginBottom: 8, boxSizing: 'border-box',
            }}
          />
          <input
            type="text"
            placeholder="Title (optional)"
            value={newTitle}
            onChange={e => setNewTitle(e.target.value)}
            style={{
              width: '100%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.18)',
              color: '#fff', padding: '8px 12px', fontSize: 11, fontFamily: "'Inter',sans-serif",
              marginBottom: 10, boxSizing: 'border-box',
            }}
          />
          <button
            type="button"
            onClick={handleAdd}
            style={{
              background: '#FF2DAA', color: '#fff', border: 'none',
              padding: '8px 24px', fontWeight: 900, fontSize: 9,
              letterSpacing: '0.14em', textTransform: 'uppercase', cursor: 'pointer',
              boxShadow: '0 0 14px rgba(255,45,170,0.5)',
            }}
          >
            ADD TO PLAYLIST →
          </button>
        </div>
      )}

      {/* Playlist entries */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {visible.length === 0 && (
          <div style={{ textAlign: 'center', padding: '32px 16px', color: 'rgba(255,255,255,0.3)', fontSize: 11 }}>
            No tracks yet.{editable ? ' Add your first link above.' : ''}
          </div>
        )}
        {visible.map((entry, i) => {
          const pColor = platformColor(entry.platform);
          const pEmoji = platformEmoji(entry.platform);
          return (
            <div
              key={entry.id}
              style={{
                display: 'flex', alignItems: 'center', gap: 12,
                border: `1px solid ${pColor}22`,
                background: `linear-gradient(90deg, ${pColor}0a, rgba(5,5,16,0.9))`,
                padding: '10px 14px',
                position: 'relative', overflow: 'hidden',
              }}
            >
              {/* Track number */}
              <div style={{ fontSize: 9, fontWeight: 900, color: 'rgba(255,255,255,0.25)', minWidth: 18, textAlign: 'right' }}>
                {String(i + 1).padStart(2, '0')}
              </div>

              {/* Platform icon */}
              <div style={{
                width: 32, height: 32, background: `${pColor}18`,
                border: `1px solid ${pColor}44`,
                display: 'grid', placeItems: 'center', fontSize: 14, flexShrink: 0,
              }}>
                {pEmoji}
              </div>

              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 11, fontWeight: 900, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {entry.title}
                </div>
                <div style={{ fontSize: 8, color: pColor, letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 700, marginTop: 2 }}>
                  {entry.platform} · {KIND_LABELS[entry.kind]}
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                <a
                  href={entry.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    background: pColor, color: '#050510', border: 'none',
                    padding: '5px 10px', fontSize: 8, fontWeight: 900,
                    letterSpacing: '0.1em', textTransform: 'uppercase',
                    textDecoration: 'none', display: 'inline-block',
                  }}
                >
                  PLAY →
                </a>
                {editable && (
                  <button
                    type="button"
                    onClick={() => handleRemove(entry.id)}
                    style={{
                      background: 'transparent', border: '1px solid rgba(255,255,255,0.2)',
                      color: 'rgba(255,255,255,0.4)', padding: '5px 8px',
                      fontSize: 10, cursor: 'pointer',
                    }}
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {entries.length > limit && (
        <div style={{ textAlign: 'center', marginTop: 12, fontSize: 9, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
          + {entries.length - limit} MORE TRACKS
        </div>
      )}
    </div>
  );
}
