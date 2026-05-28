'use client';

import Link from 'next/link';
import TMIUniversalPlayer from '@/components/media/TMIUniversalPlayer';
import PerformerVideoPanel from '@/components/media/PerformerVideoPanel';

export type MediaPanelRole =
  | 'performer'
  | 'artist'
  | 'fan'
  | 'venue'
  | 'sponsor'
  | 'advertiser'
  | 'promoter'
  | 'writer'
  | 'admin'
  | 'staff'
  | string;

export interface UniversalMediaPanelProps {
  slug: string;
  displayName: string;
  role: MediaPanelRole;
  isLive?: boolean;
  liveRoomId?: string;
  liveStreamUrl?: string;
  accentColor?: string;
  /** Explicit fallback video URL or YouTube ID */
  promoVideoUrl?: string;
  promoYoutubeId?: string;
}

// ─── Role-specific accent defaults ───────────────────────────────────────────

const ROLE_ACCENT: Record<string, string> = {
  fan:        '#AA2DFF',
  venue:      '#00FF88',
  sponsor:    '#FFD700',
  advertiser: '#FF6B35',
  promoter:   '#00FFFF',
  writer:     '#FF2DAA',
  admin:      '#00FFFF',
  staff:      '#00FFFF',
};

// ─── Clips seed (deterministic per slug) ─────────────────────────────────────

const EMOJI_MAP: Record<string, string[]> = {
  fan:        ['🎵', '🎧', '🔥', '👑', '🎤'],
  venue:      ['🏟️', '🎭', '🎪', '🔊', '🌟'],
  sponsor:    ['💼', '📢', '🏆', '💰', '⭐'],
  advertiser: ['📣', '🎯', '📊', '💡', '🚀'],
  promoter:   ['🎟️', '📣', '🌍', '🎶', '🔥'],
  writer:     ['✍️', '📰', '🖊️', '📖', '🎙️'],
  admin:      ['🛡️', '⚙️', '📡', '🔍', '📊'],
};

const TAG_MAP: Record<string, string[]> = {
  fan:        ['REACTION', 'HIGHLIGHT', 'LIVE CLIP', 'SAVED'],
  venue:      ['VENUE TOUR', 'LIVE SHOW', 'EVENT RECAP', 'BEHIND STAGE'],
  sponsor:    ['BRAND REEL', 'CAMPAIGN', 'PRODUCT SPOT', 'PARTNERSHIP'],
  advertiser: ['AD CAMPAIGN', 'PRODUCT', 'BRAND VIDEO', 'PROMO'],
  promoter:   ['EVENT PROMO', 'TOUR REEL', 'LINEUP DROP', 'RECAP'],
  writer:     ['INTERVIEW', 'FEATURE', 'EDITORIAL', 'BREAKDOWN'],
  admin:      ['PLATFORM FEED', 'LIVE OPS', 'MONITOR', 'ANALYTICS'],
};

const TAG_COLORS: Record<string, string> = {
  'REACTION':     '#AA2DFF',
  'HIGHLIGHT':    '#FFD700',
  'LIVE CLIP':    '#FF2DAA',
  'SAVED':        '#00FFFF',
  'VENUE TOUR':   '#00FF88',
  'LIVE SHOW':    '#FF2DAA',
  'EVENT RECAP':  '#FFD700',
  'BEHIND STAGE': '#00FFFF',
  'BRAND REEL':   '#FFD700',
  'CAMPAIGN':     '#FF6B35',
  'PRODUCT SPOT': '#00FFFF',
  'PARTNERSHIP':  '#AA2DFF',
  'AD CAMPAIGN':  '#FF6B35',
  'PRODUCT':      '#FFD700',
  'BRAND VIDEO':  '#00FFFF',
  'PROMO':        '#FF2DAA',
  'EVENT PROMO':  '#00FFFF',
  'TOUR REEL':    '#FF2DAA',
  'LINEUP DROP':  '#FFD700',
  'RECAP':        '#00FF88',
  'INTERVIEW':    '#FF2DAA',
  'FEATURE':      '#00FFFF',
  'EDITORIAL':    '#FFD700',
  'BREAKDOWN':    '#AA2DFF',
  'PLATFORM FEED':'#00FFFF',
  'LIVE OPS':     '#FF2DAA',
  'MONITOR':      '#00FF88',
  'ANALYTICS':    '#FFD700',
};

function seedClips(slug: string, role: string, displayName: string) {
  const h = slug.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const emojis = EMOJI_MAP[role] ?? EMOJI_MAP.fan!;
  const tags   = TAG_MAP[role]   ?? TAG_MAP.fan!;
  return [
    { id: `${slug}-m0`, emoji: emojis[h % emojis.length],     tag: tags[h % tags.length],           title: `${displayName} — ${tags[h % tags.length]}`,              views: 1100 + (h % 40000), dur: '1:52' },
    { id: `${slug}-m1`, emoji: emojis[(h+1) % emojis.length], tag: tags[(h+1) % tags.length],       title: `${displayName} — ${tags[(h+1) % tags.length]}`,          views:  800 + (h % 25000),  dur: '2:31' },
    { id: `${slug}-m2`, emoji: emojis[(h+2) % emojis.length], tag: tags[(h+2) % tags.length],       title: `${displayName} — ${tags[(h+2) % tags.length]}`,          views:  400 + (h % 12000),  dur: '3:07' },
    { id: `${slug}-m3`, emoji: emojis[(h+3) % emojis.length], tag: tags[(h+3) % tags.length],       title: `${displayName} — ${tags[(h+3) % tags.length]}`,          views:  200 + (h % 8000),   dur: '4:44' },
  ];
}

// ─── Role-specific section header copy ────────────────────────────────────────

const SECTION_LABELS: Record<string, { header: string; cta?: string; ctaHref?: string }> = {
  fan:        { header: 'Saved Clips & Reactions',    cta: '🎵 Browse Live Rooms',   ctaHref: '/rooms' },
  venue:      { header: 'Venue Media & Live Streams', cta: '📅 Book This Venue',      ctaHref: '/booking' },
  sponsor:    { header: 'Brand Reels & Campaigns',    cta: '💼 Sponsorship Packages', ctaHref: '/sponsors' },
  advertiser: { header: 'Ad Campaigns & Promos',      cta: '📣 Run a Campaign',       ctaHref: '/advertise' },
  promoter:   { header: 'Event Promos & Tour Reels',  cta: '🎟️ View Events',         ctaHref: '/events' },
  writer:     { header: 'Interviews & Editorials',    cta: '📰 Read Articles',        ctaHref: '/magazine' },
  admin:      { header: 'Platform Activity Monitor',  cta: '⚙️ Admin Panel',          ctaHref: '/admin' },
  staff:      { header: 'Platform Activity Monitor',  cta: '⚙️ Admin Panel',          ctaHref: '/admin' },
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function UniversalMediaPanel({
  slug,
  displayName,
  role,
  isLive       = false,
  liveRoomId,
  liveStreamUrl,
  accentColor,
  promoVideoUrl,
  promoYoutubeId,
}: UniversalMediaPanelProps) {
  // Performer and artist → delegate to dedicated component
  if (role === 'performer' || role === 'artist') {
    return (
      <PerformerVideoPanel
        slug={slug}
        displayName={displayName}
        isLive={isLive}
        liveRoomId={liveRoomId}
        liveStreamUrl={liveStreamUrl}
        accentColor={accentColor ?? '#00FFFF'}
        role={role}
      />
    );
  }

  const accent  = accentColor ?? ROLE_ACCENT[role] ?? '#00FFFF';
  const section = SECTION_LABELS[role] ?? { header: 'Media & Videos' };
  const clips   = seedClips(slug, role, displayName);

  const hasPromo = !!(promoVideoUrl || promoYoutubeId);

  return (
    <div style={{ width: '100%', marginTop: 28 }}>

      {/* Section header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
        <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: '0.28em', color: accent, textTransform: 'uppercase' }}>
          {section.header}
        </div>
        <div style={{ height: 1, flex: 1, background: `linear-gradient(90deg,${accent}44,transparent)` }} />
        {section.cta && section.ctaHref && (
          <Link href={section.ctaHref} style={{ fontSize: 8, fontWeight: 900, color: accent, border: `1px solid ${accent}44`, padding: '3px 10px', borderRadius: 6, textDecoration: 'none', letterSpacing: '0.1em' }}>
            {section.cta}
          </Link>
        )}
      </div>

      {/* Live stream panel */}
      {isLive && (
        <div style={{ marginBottom: 18 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: accent, boxShadow: `0 0 8px ${accent}`, display: 'inline-block' }} />
            <span style={{ fontSize: 9, fontWeight: 900, letterSpacing: '0.2em', color: accent, textTransform: 'uppercase' }}>Live Now</span>
            <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.35)', marginLeft: 4 }}>{displayName} is live</span>
          </div>
          <TMIUniversalPlayer
            mode={liveStreamUrl ? 'hls' : liveRoomId ? 'webrtc' : 'avatar'}
            src={liveStreamUrl}
            roomId={liveRoomId}
            avatarEmoji={EMOJI_MAP[role]?.[0] ?? '🎵'}
            avatarName={displayName}
            frameStyle="neon"
            frameColor={accent}
            size="standard"
            title={`${displayName} — LIVE`}
            subtitle="Streaming now"
            showBadge
            controls
            privacy="public"
            autoplay
            muted={false}
            allowFullscreen
            allowPiP
          />
          {liveRoomId && (
            <Link href={`/live/rooms/${liveRoomId}`} style={{ display: 'block', marginTop: 6, padding: '9px 0', textAlign: 'center', background: `linear-gradient(135deg,${accent},${accent}88)`, color: '#050510', fontWeight: 900, fontSize: 10, letterSpacing: '0.1em', textDecoration: 'none', borderRadius: 6 }}>
              📡 JOIN LIVE ROOM
            </Link>
          )}
        </div>
      )}

      {/* Promo / featured video */}
      {hasPromo && !isLive && (
        <div style={{ marginBottom: 18 }}>
          <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: '0.14em', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', marginBottom: 8 }}>
            Featured
          </div>
          <TMIUniversalPlayer
            mode={promoYoutubeId ? 'youtube' : 'vod'}
            youtubeId={promoYoutubeId}
            src={promoVideoUrl}
            avatarEmoji={EMOJI_MAP[role]?.[0] ?? '🎵'}
            avatarName={displayName}
            frameStyle="neon"
            frameColor={accent}
            size="standard"
            title={`${displayName}`}
            showBadge={false}
            controls
            autoplay={false}
            muted
            allowFullscreen
          />
        </div>
      )}

      {/* No-live placeholder (for non-performer roles) */}
      {!isLive && !hasPromo && (
        <div style={{ marginBottom: 14, padding: '12px 16px', background: `${accent}06`, border: `1px solid ${accent}18`, borderRadius: 8, display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 10, fontWeight: 800, color: 'rgba(255,255,255,0.6)', marginBottom: 2 }}>No active stream</div>
            <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)' }}>Check back during scheduled events or live sessions.</div>
          </div>
          <Link href="/live/lobby" style={{ padding: '7px 16px', background: `${accent}18`, border: `1px solid ${accent}44`, color: accent, fontWeight: 900, fontSize: 9, letterSpacing: '0.1em', textDecoration: 'none', borderRadius: 6, flexShrink: 0 }}>
            BROWSE LIVE →
          </Link>
        </div>
      )}

      {/* Media clip grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))', gap: 10 }}>
        {clips.map((clip) => {
          const tagColor = TAG_COLORS[clip.tag] ?? accent;
          return (
            <Link
              key={clip.id}
              href="/live/rooms"
              style={{
                display: 'block',
                borderRadius: 8, overflow: 'hidden',
                border: '1px solid rgba(255,255,255,0.08)',
                background: 'rgba(255,255,255,0.02)',
                textDecoration: 'none',
              }}
            >
              {/* Thumbnail placeholder */}
              <div style={{
                height: 100, display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: `radial-gradient(ellipse at center, ${tagColor}12 0%, transparent 70%)`,
                borderBottom: '1px solid rgba(255,255,255,0.05)',
                fontSize: 36,
              }}>
                {clip.emoji}
              </div>
              <div style={{ padding: '8px 10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 4 }}>
                  <span style={{ fontSize: 7, fontWeight: 900, letterSpacing: '0.08em', color: tagColor, border: `1px solid ${tagColor}44`, padding: '1px 5px', borderRadius: 3 }}>
                    {clip.tag}
                  </span>
                </div>
                <div style={{ fontSize: 10, fontWeight: 800, color: '#fff', lineHeight: 1.3, marginBottom: 3 }}>{clip.title}</div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <span style={{ fontSize: 8, color: 'rgba(255,255,255,0.35)', fontWeight: 700 }}>{clip.views.toLocaleString()} views</span>
                  <span style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', marginLeft: 'auto' }}>{clip.dur}</span>
                </div>
              </div>
            </Link>
          );
        })}

        {/* Upload / go live CTA tile */}
        <Link href="/live/go" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6, border: `1px dashed ${accent}44`, borderRadius: 8, minHeight: 160, textDecoration: 'none' }}>
          <span style={{ fontSize: 24, opacity: 0.4 }}>＋</span>
          <span style={{ fontSize: 9, fontWeight: 800, color: accent, letterSpacing: '0.1em', textTransform: 'uppercase', opacity: 0.6 }}>Add Media</span>
        </Link>
      </div>

    </div>
  );
}
