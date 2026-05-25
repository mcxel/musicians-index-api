'use client';

import { useState } from 'react';
import Link from 'next/link';
import TMIUniversalPlayer from '@/components/media/TMIUniversalPlayer';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface VideoClip {
  id:             string;
  title:          string;
  youtubeId?:     string;   // YouTube video ID — renders real embed
  src?:           string;   // direct MP4/WebM/HLS URL
  thumbnailEmoji?: string;
  views?:         number;
  date?:          string;
  duration?:      string;
  tag?:           'BATTLE' | 'CYPHER' | 'FREESTYLE' | 'LIVE' | 'STUDIO' | 'EVENT';
}

export interface PerformerVideoPanelProps {
  slug:           string;
  displayName:    string;
  isLive?:        boolean;
  liveRoomId?:    string;   // Daily.co room ID when live
  liveStreamUrl?: string;   // HLS manifest URL when available
  accentColor?:   string;
  role?:          'artist' | 'performer';
  clips?:         VideoClip[];  // custom clips; omit to use seeded fallbacks
}

// ─── Deterministic clip seeder (used until performer uploads real content) ────

const CLIP_TAGS: VideoClip['tag'][] = ['BATTLE', 'CYPHER', 'FREESTYLE', 'LIVE', 'STUDIO'];
const CLIP_EMOJIS = ['🎤', '🎧', '🥊', '🎵', '🎸', '🎹', '🎷', '🎺'];
const CLIP_DURATIONS = ['1:47', '2:14', '3:38', '4:02', '1:55', '5:11', '2:58'];

function seedClips(slug: string, displayName: string): VideoClip[] {
  const h = slug.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  return [
    {
      id:             `${slug}-clip-0`,
      title:          `${displayName} — Battle Highlight`,
      thumbnailEmoji: CLIP_EMOJIS[h % CLIP_EMOJIS.length],
      views:          1200 + (h % 48000),
      date:           '3 days ago',
      duration:       CLIP_DURATIONS[h % CLIP_DURATIONS.length],
      tag:            'BATTLE',
    },
    {
      id:             `${slug}-clip-1`,
      title:          `${displayName} — Cypher Session`,
      thumbnailEmoji: CLIP_EMOJIS[(h + 2) % CLIP_EMOJIS.length],
      views:          800 + ((h * 3) % 30000),
      date:           '1 week ago',
      duration:       CLIP_DURATIONS[(h + 2) % CLIP_DURATIONS.length],
      tag:            'CYPHER',
    },
    {
      id:             `${slug}-clip-2`,
      title:          `${displayName} — Freestyle`,
      thumbnailEmoji: CLIP_EMOJIS[(h + 4) % CLIP_EMOJIS.length],
      views:          400 + ((h * 7) % 15000),
      date:           '2 weeks ago',
      duration:       CLIP_DURATIONS[(h + 4) % CLIP_DURATIONS.length],
      tag:            'FREESTYLE',
    },
    {
      id:             `${slug}-clip-3`,
      title:          `${displayName} — Studio Session`,
      thumbnailEmoji: CLIP_EMOJIS[(h + 6) % CLIP_EMOJIS.length],
      views:          200 + ((h * 11) % 10000),
      date:           '3 weeks ago',
      duration:       CLIP_DURATIONS[(h + 6) % CLIP_DURATIONS.length],
      tag:            'STUDIO',
    },
  ];
}

const TAG_COLORS: Record<string, string> = {
  BATTLE:    '#FF2DAA',
  CYPHER:    '#AA2DFF',
  FREESTYLE: '#00FFFF',
  LIVE:      '#00FF88',
  STUDIO:    '#FFD700',
  EVENT:     '#FF6B35',
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function PerformerVideoPanel({
  slug,
  displayName,
  isLive       = false,
  liveRoomId,
  liveStreamUrl,
  accentColor  = '#00FFFF',
  role         = 'performer',
  clips,
}: PerformerVideoPanelProps) {
  const videoClips = clips ?? seedClips(slug, displayName);
  const [activeClip, setActiveClip] = useState<string | null>(null);

  return (
    <div style={{ width: '100%', marginTop: 28 }}>

      {/* ── Section header ──────────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
        <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: '0.28em', color: accentColor, textTransform: 'uppercase' }}>
          Video &amp; Media
        </div>
        <div style={{ height: 1, flex: 1, background: `linear-gradient(90deg,${accentColor}44,transparent)` }} />
        <Link href="/go-live" style={{ fontSize: 8, fontWeight: 900, color: '#FF2DAA', border: '1px solid rgba(255,45,170,0.4)', padding: '3px 10px', borderRadius: 0, textDecoration: 'none', letterSpacing: '0.1em', clipPath: 'polygon(4px 0,100% 0,calc(100% - 4px) 100%,0 100%)' }}>
          🔴 GO LIVE
        </Link>
        <Link href={`/media/upload?for=${slug}`} style={{ fontSize: 8, fontWeight: 900, color: 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.15)', padding: '3px 10px', borderRadius: 0, textDecoration: 'none', letterSpacing: '0.1em', clipPath: 'polygon(4px 0,100% 0,calc(100% - 4px) 100%,0 100%)' }}>
          ↑ UPLOAD
        </Link>
      </div>

      {/* ── Live stream panel (shown when performer is live) ─────────── */}
      {isLive && (
        <div style={{ marginBottom: 18 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#FF2DAA', boxShadow: '0 0 8px #FF2DAA', display: 'inline-block' }} />
            <span style={{ fontSize: 9, fontWeight: 900, letterSpacing: '0.2em', color: '#FF2DAA', textTransform: 'uppercase' }}>Live Now</span>
            <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.35)', marginLeft: 4 }}>{displayName} is streaming</span>
          </div>
          <TMIUniversalPlayer
            mode={liveStreamUrl ? 'hls' : liveRoomId ? 'webrtc' : 'avatar'}
            src={liveStreamUrl}
            roomId={liveRoomId}
            avatarEmoji="🎤"
            avatarName={displayName}
            frameStyle="neon"
            frameColor="#FF2DAA"
            frameColor2="#AA2DFF"
            size="standard"
            title={`${displayName} — LIVE`}
            subtitle="Broadcasting now"
            showBadge
            controls
            privacy="public"
            autoplay
            muted={false}
            allowFullscreen
            allowPiP
          />
          <div style={{ marginTop: 6, display: 'flex', gap: 8 }}>
            <Link href={liveRoomId ? `/video/rooms/${liveRoomId}` : '/live/rooms'} style={{ flex: 1, padding: '9px 0', textAlign: 'center', background: `linear-gradient(135deg,${accentColor},${accentColor}88)`, color: '#050510', fontWeight: 900, fontSize: 10, letterSpacing: '0.1em', textDecoration: 'none', borderRadius: 0, clipPath: 'polygon(5px 0,100% 0,calc(100% - 5px) 100%,0 100%)' }}>
              📡 JOIN LIVE ROOM
            </Link>
            <Link href="/battles" style={{ padding: '9px 18px', background: 'rgba(255,45,170,0.12)', border: '1px solid rgba(255,45,170,0.35)', color: '#FF2DAA', fontWeight: 900, fontSize: 10, letterSpacing: '0.1em', textDecoration: 'none', borderRadius: 0, clipPath: 'polygon(5px 0,100% 0,calc(100% - 5px) 100%,0 100%)' }}>
              ⚔️ BATTLE
            </Link>
          </div>
        </div>
      )}

      {/* ── Not live — "Start Broadcasting" CTA ─────────────────────── */}
      {!isLive && (
        <div style={{ marginBottom: 14, padding: '10px 14px', background: 'rgba(255,45,170,0.04)', border: '1px solid rgba(255,45,170,0.15)', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 10, fontWeight: 800, color: 'rgba(255,255,255,0.6)', marginBottom: 2 }}>Start a live session</div>
            <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)' }}>Go live in one click — camera, screen share, or OBS</div>
          </div>
          <Link href="/go-live" style={{ padding: '7px 16px', background: 'rgba(255,45,170,0.2)', border: '1px solid rgba(255,45,170,0.45)', color: '#FF2DAA', fontWeight: 900, fontSize: 9, letterSpacing: '0.1em', textDecoration: 'none', borderRadius: 0, clipPath: 'polygon(4px 0,100% 0,calc(100% - 4px) 100%,0 100%)', flexShrink: 0 }}>
            GO LIVE →
          </Link>
        </div>
      )}

      {/* ── Past performances / VOD grid ─────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 10 }}>
        {videoClips.map((clip) => {
          const isActive = activeClip === clip.id;
          const tagColor = TAG_COLORS[clip.tag ?? 'LIVE'] ?? accentColor;
          return (
            <div key={clip.id}
              style={{ borderRadius: 0, overflow: 'hidden', border: `1px solid ${isActive ? accentColor + '66' : 'rgba(255,255,255,0.08)'}`, background: isActive ? `${accentColor}06` : 'rgba(255,255,255,0.02)', cursor: 'pointer', transition: 'border-color 0.2s', clipPath: 'polygon(0 0,calc(100% - 8px) 0,100% 8px,100% 100%,8px 100%,0 calc(100% - 8px))' }}
              onClick={() => setActiveClip(isActive ? null : clip.id)}
            >
              <TMIUniversalPlayer
                mode={
                  isActive && clip.youtubeId ? 'youtube' :
                  isActive && clip.src       ? 'vod'     :
                  'avatar'
                }
                youtubeId={isActive ? clip.youtubeId : undefined}
                src={isActive ? clip.src : undefined}
                avatarEmoji={clip.thumbnailEmoji ?? '🎵'}
                avatarName={clip.title}
                frameStyle="raw"
                frameColor={tagColor}
                size="card"
                title={isActive ? clip.title : undefined}
                showBadge={false}
                controls={isActive}
                autoplay={isActive}
                muted={isActive}
              />
              <div style={{ padding: '8px 10px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 5, marginBottom: 4 }}>
                  {clip.tag && (
                    <span style={{ fontSize: 7, fontWeight: 900, letterSpacing: '0.1em', color: tagColor, border: `1px solid ${tagColor}44`, padding: '1px 5px', flexShrink: 0 }}>
                      {clip.tag}
                    </span>
                  )}
                </div>
                <div style={{ fontSize: 10, fontWeight: 800, color: '#fff', lineHeight: 1.3, marginBottom: 3 }}>
                  {clip.title}
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  {clip.views !== undefined && (
                    <span style={{ fontSize: 8, color: 'rgba(255,255,255,0.35)', fontWeight: 700 }}>
                      {clip.views.toLocaleString()} views
                    </span>
                  )}
                  {clip.duration && (
                    <span style={{ fontSize: 8, color: 'rgba(255,255,255,0.25)', marginLeft: 'auto' }}>
                      {clip.duration}
                    </span>
                  )}
                </div>
                {clip.date && (
                  <div style={{ fontSize: 7, color: 'rgba(255,255,255,0.2)', marginTop: 2 }}>{clip.date}</div>
                )}
              </div>
            </div>
          );
        })}

        {/* Add video CTA tile */}
        <Link href={`/media/upload?for=${slug}`} style={{ textDecoration: 'none' }}>
          <div style={{ border: '1px dashed rgba(255,255,255,0.12)', borderRadius: 0, minHeight: 160, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6, cursor: 'pointer', transition: 'border-color 0.2s', clipPath: 'polygon(0 0,calc(100% - 8px) 0,100% 8px,100% 100%,8px 100%,0 calc(100% - 8px))' }}>
            <span style={{ fontSize: 24, opacity: 0.3 }}>＋</span>
            <span style={{ fontSize: 9, fontWeight: 800, color: 'rgba(255,255,255,0.25)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Add Video</span>
            <span style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)', textAlign: 'center', maxWidth: 120 }}>YouTube, MP4, or live stream link</span>
          </div>
        </Link>

      </div>

      {/* ── Share strip ──────────────────────────────────────────────── */}
      <div style={{ marginTop: 10, display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
        <span style={{ fontSize: 8, fontWeight: 700, letterSpacing: '0.14em', color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase' }}>Share profile:</span>
        {[
          { label: 'Copy Link',  href: '#', emoji: '🔗' },
          { label: 'Twitter/X',  href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(`Check out ${displayName} on The Musicians Index`)}&url=${encodeURIComponent(`https://themusiciansindex.com/profile/${role}/${slug}`)}`, emoji: '𝕏' },
          { label: 'Instagram',  href: '#', emoji: '📸' },
        ].map((s) => (
          <a key={s.label} href={s.href} target={s.href !== '#' ? '_blank' : undefined} rel="noopener noreferrer"
            style={{ fontSize: 8, fontWeight: 800, color: 'rgba(255,255,255,0.35)', border: '1px solid rgba(255,255,255,0.1)', padding: '3px 9px', borderRadius: 0, textDecoration: 'none', letterSpacing: '0.08em', clipPath: 'polygon(3px 0,100% 0,calc(100% - 3px) 100%,0 100%)', display: 'flex', alignItems: 'center', gap: 4 }}>
            <span>{s.emoji}</span> {s.label}
          </a>
        ))}
        <Link href={`/live/rooms?performer=${slug}`} style={{ marginLeft: 'auto', fontSize: 8, fontWeight: 900, color: accentColor, border: `1px solid ${accentColor}33`, padding: '3px 10px', borderRadius: 0, textDecoration: 'none', letterSpacing: '0.1em', clipPath: 'polygon(3px 0,100% 0,calc(100% - 3px) 100%,0 100%)' }}>
          VIEW ALL STREAMS →
        </Link>
      </div>

    </div>
  );
}
