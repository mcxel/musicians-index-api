'use client';

/**
 * TieredArticleGallery — Magazine spread layout driven by membership tier.
 *
 * FREE      → 1 hero, full width
 * PRO       → hero + 2 mini below
 * RUBY      → hero center, 2 mini left, 2 mini right
 * SILVER    → hero center, 2L + 2R + 1 bottom
 * GOLD      → hero center, 3L + 3R
 * PLATINUM  → hero center, 4L + 4R + video panel below
 * DIAMOND   → full magazine spread with all modules
 *
 * Rule 20: empty gallery slots show an honest upload CTA, never a fake image.
 * Rule 2:  hero follows LIVE VIDEO → MOTION POSTER → STATIC IMAGE priority.
 */

import Link from 'next/link';
import type { GalleryPattern } from '@/lib/magazine/MagazineLayoutEngine';

interface Props {
  pattern: GalleryPattern;
  /** Hero: always present. Follows Rule 2 priority (live > motion > static). */
  heroImage: string;
  /** Optional video for the hero slot (introVideoUrl / motionPosterUrl) */
  heroVideoUrl?: string;
  isLive?: boolean;
  liveRoomRoute?: string;
  /** gallery[i] = URL or null (null = empty/upload slot) */
  gallery: Array<string | null>;
  accentColor: string;
  performerName: string;
  performerSlug: string;
  /** Shown in the upload-CTA if performer is viewing their own article */
  showUploadCta?: boolean;
  /** Only for Platinum+: actual video embed URL */
  videoPanelUrl?: string;
  audienceCount?: number;
  tierLabel?: string;
  tierColor?: string;
}

// ── Shared constants ────────────────────────────────────────────────────────

const GAP    = 6;
const RADIUS = 8;
const MINI_ASPECT = '1 / 1';

// ── Mini image cell ──────────────────────────────────────────────────────────

function MiniCell({
  src,
  alt,
  accentColor,
  uploadHref,
}: {
  src: string | null;
  alt: string;
  accentColor: string;
  uploadHref: string;
}) {
  if (src) {
    return (
      <div
        style={{
          aspectRatio: MINI_ASPECT,
          borderRadius: RADIUS,
          overflow: 'hidden',
          border: `1px solid ${accentColor}22`,
          background: 'rgba(255,255,255,0.03)',
          position: 'relative',
        }}
      >
        <img
          src={src}
          alt={alt}
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        />
        <div style={{
          position: 'absolute', inset: 0,
          background: `linear-gradient(135deg, ${accentColor}08, transparent)`,
          pointerEvents: 'none',
        }} />
      </div>
    );
  }

  // Empty slot — honest upload CTA (Rule 20)
  return (
    <Link
      href={uploadHref}
      style={{
        aspectRatio: MINI_ASPECT,
        borderRadius: RADIUS,
        border: `1.5px dashed ${accentColor}33`,
        background: `${accentColor}06`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 4,
        textDecoration: 'none',
        cursor: 'pointer',
        transition: 'border-color 0.2s',
      }}
    >
      <span style={{ fontSize: 18, opacity: 0.4 }}>📷</span>
      <span style={{ fontSize: 8, color: `${accentColor}66`, fontWeight: 700, letterSpacing: '0.08em', textAlign: 'center', lineHeight: 1.4 }}>
        ADD PHOTO
      </span>
    </Link>
  );
}

// ── Hero cell ────────────────────────────────────────────────────────────────

function HeroCell({
  heroImage,
  heroVideoUrl,
  isLive,
  liveRoomRoute,
  audienceCount,
  performerName,
  accentColor,
  style,
}: {
  heroImage: string;
  heroVideoUrl?: string;
  isLive?: boolean;
  liveRoomRoute?: string;
  audienceCount?: number;
  performerName: string;
  accentColor: string;
  style?: React.CSSProperties;
}) {
  return (
    <div
      style={{
        borderRadius: RADIUS + 2,
        overflow: 'hidden',
        position: 'relative',
        border: `1.5px solid ${accentColor}33`,
        ...style,
      }}
    >
      {/* Rule 2: video first, then static */}
      {heroVideoUrl ? (
        <video
          src={heroVideoUrl}
          autoPlay
          muted
          loop
          playsInline
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        />
      ) : (
        <img
          src={heroImage}
          alt={performerName}
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        />
      )}

      {/* Gradient scrim for readability */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(to bottom, transparent 40%, rgba(5,3,16,0.72) 100%)',
        pointerEvents: 'none',
      }} />

      {/* Live badge */}
      {isLive && liveRoomRoute && (
        <Link
          href={liveRoomRoute}
          style={{
            position: 'absolute', top: 10, left: 10, zIndex: 5,
            background: '#E63000', borderRadius: 6, padding: '4px 10px',
            fontSize: 9, fontWeight: 900, color: '#fff', letterSpacing: '0.07em',
            display: 'flex', alignItems: 'center', gap: 5,
            textDecoration: 'none', boxShadow: '0 0 18px rgba(230,48,0,0.55)',
          }}
        >
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#fff', animation: 'tmi-live-pulse 1.15s infinite' }} />
          LIVE · {(audienceCount ?? 0).toLocaleString()}
        </Link>
      )}

      {/* Accent corner glow */}
      <div style={{
        position: 'absolute', inset: 0,
        background: `radial-gradient(circle at 85% 15%, ${accentColor}18 0%, transparent 55%)`,
        pointerEvents: 'none',
      }} />
    </div>
  );
}

// ── Video panel (Platinum+) ───────────────────────────────────────────────────

function VideoPanel({
  videoUrl,
  liveRoomRoute,
  isLive,
  performerName,
  accentColor,
}: {
  videoUrl?: string;
  liveRoomRoute?: string;
  isLive?: boolean;
  performerName: string;
  accentColor: string;
}) {
  if (isLive && liveRoomRoute) {
    return (
      <div style={{
        borderRadius: RADIUS,
        border: `1.5px solid rgba(230,48,0,0.5)`,
        overflow: 'hidden',
        background: 'rgba(230,48,0,0.06)',
        padding: '14px 16px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div>
          <div style={{ fontSize: 10, fontWeight: 900, color: '#E63000', letterSpacing: '0.1em', marginBottom: 4 }}>🔴 LIVE NOW</div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)' }}>{performerName} is performing live</div>
        </div>
        <Link
          href={liveRoomRoute}
          style={{
            padding: '8px 18px', background: '#E63000', borderRadius: 8,
            fontSize: 10, fontWeight: 900, color: '#fff', textDecoration: 'none',
            letterSpacing: '0.06em', boxShadow: '0 0 16px rgba(230,48,0,0.4)',
          }}
        >
          JOIN LIVE →
        </Link>
      </div>
    );
  }

  if (videoUrl) {
    return (
      <div style={{
        borderRadius: RADIUS, overflow: 'hidden',
        border: `1px solid ${accentColor}22`,
        background: '#000', aspectRatio: '16/9',
        position: 'relative',
      }}>
        <video
          src={videoUrl}
          controls
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        />
      </div>
    );
  }

  // No video yet — honest empty state
  return null;
}

// ── Main component ────────────────────────────────────────────────────────────

export default function TieredArticleGallery({
  pattern,
  heroImage,
  heroVideoUrl,
  isLive,
  liveRoomRoute,
  gallery,
  accentColor,
  performerName,
  performerSlug,
  showUploadCta = false,
  videoPanelUrl,
  audienceCount,
  tierLabel,
  tierColor,
}: Props) {
  const uploadHref = `/dashboard/performer/${performerSlug}/images`;

  const heroProps = {
    heroImage,
    heroVideoUrl,
    isLive,
    liveRoomRoute,
    audienceCount,
    performerName,
    accentColor,
  };

  const miniProps = { accentColor, alt: `${performerName} photo`, uploadHref };

  // ── FREE — single full-width hero ────────────────────────────────────────
  if (pattern === 'hero-only') {
    return (
      <section style={{ marginBottom: 4 }}>
        <HeroCell {...heroProps} style={{ height: 320 }} />
      </section>
    );
  }

  // ── PRO — hero + 2 mini below ────────────────────────────────────────────
  if (pattern === 'hero-2below') {
    return (
      <section style={{ display: 'flex', flexDirection: 'column', gap: GAP }}>
        <HeroCell {...heroProps} style={{ height: 280 }} />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: GAP }}>
          <MiniCell src={gallery[0] ?? null} {...miniProps} />
          <MiniCell src={gallery[1] ?? null} {...miniProps} />
        </div>
      </section>
    );
  }

  // ── RUBY — spread-4: hero center, 2L + 2R ───────────────────────────────
  if (pattern === 'spread-4') {
    return (
      <section
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 2.2fr 1fr',
          gridTemplateRows: '1fr 1fr',
          gap: GAP,
          minHeight: 300,
        }}
      >
        <MiniCell src={gallery[0] ?? null} {...miniProps} />
        <HeroCell
          {...heroProps}
          style={{ gridColumn: '2', gridRow: '1 / span 2' }}
        />
        <MiniCell src={gallery[1] ?? null} {...miniProps} />
        <MiniCell src={gallery[2] ?? null} {...miniProps} />
        <MiniCell src={gallery[3] ?? null} {...miniProps} />
      </section>
    );
  }

  // ── SILVER — spread-5: hero center, 2L + 2R + 1 bottom center ───────────
  if (pattern === 'spread-5') {
    return (
      <section
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 2.2fr 1fr',
          gridTemplateRows: '1fr 1fr auto',
          gap: GAP,
          minHeight: 320,
        }}
      >
        <MiniCell src={gallery[0] ?? null} {...miniProps} />
        <HeroCell
          {...heroProps}
          style={{ gridColumn: '2', gridRow: '1 / span 2' }}
        />
        <MiniCell src={gallery[1] ?? null} {...miniProps} />
        <MiniCell src={gallery[2] ?? null} {...miniProps} />
        <MiniCell src={gallery[3] ?? null} {...miniProps} />
        {/* Row 3: 1 mini centered below hero */}
        <div style={{ gridColumn: '2', gridRow: '3' }}>
          <MiniCell src={gallery[4] ?? null} {...miniProps} />
        </div>
      </section>
    );
  }

  // ── GOLD — spread-6: hero center spanning 3 rows, 3L + 3R ───────────────
  if (pattern === 'spread-6') {
    return (
      <section
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 2.2fr 1fr',
          gridTemplateRows: '1fr 1fr 1fr',
          gap: GAP,
          minHeight: 380,
        }}
      >
        <MiniCell src={gallery[0] ?? null} {...miniProps} />
        <HeroCell
          {...heroProps}
          style={{ gridColumn: '2', gridRow: '1 / span 3' }}
        />
        <MiniCell src={gallery[1] ?? null} {...miniProps} />
        <MiniCell src={gallery[2] ?? null} {...miniProps} />
        <MiniCell src={gallery[3] ?? null} {...miniProps} />
        <MiniCell src={gallery[4] ?? null} {...miniProps} />
        <MiniCell src={gallery[5] ?? null} {...miniProps} />
      </section>
    );
  }

  // ── PLATINUM — spread-8: 4L + 4R + video panel ──────────────────────────
  if (pattern === 'spread-8') {
    return (
      <section style={{ display: 'flex', flexDirection: 'column', gap: GAP }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 2.2fr 1fr',
            gridTemplateRows: '1fr 1fr 1fr 1fr',
            gap: GAP,
            minHeight: 440,
          }}
        >
          <MiniCell src={gallery[0] ?? null} {...miniProps} />
          <HeroCell
            {...heroProps}
            style={{ gridColumn: '2', gridRow: '1 / span 4' }}
          />
          <MiniCell src={gallery[1] ?? null} {...miniProps} />
          <MiniCell src={gallery[2] ?? null} {...miniProps} />
          <MiniCell src={gallery[3] ?? null} {...miniProps} />
          <MiniCell src={gallery[4] ?? null} {...miniProps} />
          <MiniCell src={gallery[5] ?? null} {...miniProps} />
          <MiniCell src={gallery[6] ?? null} {...miniProps} />
          <MiniCell src={gallery[7] ?? null} {...miniProps} />
        </div>

        {/* Video panel */}
        <VideoPanel
          videoUrl={videoPanelUrl}
          liveRoomRoute={liveRoomRoute}
          isLive={isLive}
          performerName={performerName}
          accentColor={accentColor}
        />
      </section>
    );
  }

  // ── DIAMOND — full magazine spread ──────────────────────────────────────
  // (spread-8 grid + video panel + highlights strip + photo strip row)
  return (
    <section style={{ display: 'flex', flexDirection: 'column', gap: GAP + 4 }}>

      {/* Magazine cover badge */}
      {tierLabel && tierColor && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
          <div style={{
            fontSize: 9, fontWeight: 900, letterSpacing: '0.14em',
            color: tierColor, background: `${tierColor}14`,
            border: `1px solid ${tierColor}44`, borderRadius: 999,
            padding: '4px 14px',
          }}>
            {tierLabel}
          </div>
          <div style={{ height: 1, flex: 1, background: `linear-gradient(90deg, ${tierColor}44, transparent)` }} />
        </div>
      )}

      {/* Main spread: hero + 6 minis (3L + 3R) — first block */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 2.4fr 1fr',
          gridTemplateRows: '1fr 1fr 1fr',
          gap: GAP,
          minHeight: 400,
        }}
      >
        <MiniCell src={gallery[0] ?? null} {...miniProps} />
        <HeroCell
          {...heroProps}
          style={{ gridColumn: '2', gridRow: '1 / span 3' }}
        />
        <MiniCell src={gallery[1] ?? null} {...miniProps} />
        <MiniCell src={gallery[2] ?? null} {...miniProps} />
        <MiniCell src={gallery[3] ?? null} {...miniProps} />
        <MiniCell src={gallery[4] ?? null} {...miniProps} />
        <MiniCell src={gallery[5] ?? null} {...miniProps} />
      </div>

      {/* Live video panel */}
      <VideoPanel
        videoUrl={videoPanelUrl}
        liveRoomRoute={liveRoomRoute}
        isLive={isLive}
        performerName={performerName}
        accentColor={accentColor}
      />

      {/* Photo strip — horizontal scrolling gallery (slots 6–11) */}
      {gallery.slice(6, 12).some(Boolean) && (
        <div>
          <div style={{ fontSize: 8, fontWeight: 900, color: `${accentColor}88`, letterSpacing: '0.12em', marginBottom: 6 }}>
            PHOTO GALLERY
          </div>
          <div
            style={{
              display: 'flex', gap: GAP, overflowX: 'auto',
              paddingBottom: 4,
              scrollbarWidth: 'thin',
              scrollbarColor: `${accentColor}44 transparent`,
            }}
          >
            {gallery.slice(6, 12).map((src, i) => (
              <div
                key={i}
                style={{
                  flexShrink: 0, width: 140, height: 140,
                  borderRadius: RADIUS, overflow: 'hidden',
                  border: `1px solid ${accentColor}22`,
                  background: 'rgba(255,255,255,0.03)',
                }}
              >
                {src ? (
                  <img
                    src={src}
                    alt={`${performerName} photo ${i + 7}`}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : showUploadCta ? (
                  <Link
                    href={uploadHref}
                    style={{
                      width: '100%', height: '100%', display: 'flex',
                      flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                      gap: 4, textDecoration: 'none',
                    }}
                  >
                    <span style={{ fontSize: 20, opacity: 0.3 }}>📷</span>
                    <span style={{ fontSize: 7, color: `${accentColor}55`, fontWeight: 700, letterSpacing: '0.08em' }}>ADD PHOTO</span>
                  </Link>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      )}

      <style>{`
        @keyframes tmi-live-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </section>
  );
}
