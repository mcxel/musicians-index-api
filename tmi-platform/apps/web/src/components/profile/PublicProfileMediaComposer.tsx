"use client";

/**
 * PublicProfileMediaComposer
 * Shared mixed-media renderer for performer and fan public pages.
 * Renders certified blocks in declared order; editor/drag-reorder is a future pass.
 * Images: focal-point + zoom stored as metadata; originals never cropped.
 * Animations respect prefers-reduced-motion.
 */

import { useRef, type CSSProperties } from "react";
import Link from "next/link";

// ─── Block types ────────────────────────────────────────────────────────────

export type MediaBlockType =
  | "IMAGE"
  | "GALLERY"
  | "COLLAGE"
  | "VIDEO"
  | "SNIP"
  | "YOPHO"
  | "PLAYLIST"
  | "TRACK"
  | "MAGAZINE"
  | "EVENT"
  | "MEMORY"
  | "LIVE_PREVIEW"
  | "VENUE_PREVIEW"
  | "AVATAR_3D"
  | "MERCH";

export type GalleryLayout =
  | "1-UP"
  | "2-UP"
  | "3-UP_FEATURE"
  | "4-GRID"
  | "5-MOSAIC"
  | "6-MASONRY";

export type LayoutPrimitive =
  | "FULL_HERO"       // full-width, tall
  | "TWO_COLUMN"      // 50 / 50
  | "THREE_CARD"      // 33 / 33 / 33
  | "FEATURED_LARGE_SMALL" // 60 + 20 + 20
  | "SPLIT_TEXT"      // image left, text right
  | "FULL_BLEED"      // 100 vw, no padding
  | "DEFAULT";        // single col, padded

export interface MediaBlockImage {
  url: string;
  alt?: string;
  caption?: string;
  /** focal point 0–1; default 0.5 */
  focalX?: number;
  focalY?: number;
  /** zoom multiplier 1–3; default 1 */
  zoom?: number;
  fit?: "cover" | "contain" | "fill";
  shape?: "rect" | "rounded" | "circle";
  animated?: boolean;
}

export interface MediaBlock {
  id: string;
  type: MediaBlockType;
  layout?: LayoutPrimitive;
  title?: string;
  subtitle?: string;
  href?: string;
  accentColor?: string;
  hidden?: boolean;
  featured?: boolean;

  // IMAGE / GALLERY / COLLAGE
  images?: MediaBlockImage[];
  galleryLayout?: GalleryLayout;

  // VIDEO / SNIP
  videoUrl?: string;

  // TRACK
  trackTitle?: string;
  trackArtist?: string;
  trackDurationSec?: number;
  trackAudioUrl?: string;
  trackCoverUrl?: string;
  trackStreamingLinks?: Partial<Record<"spotify" | "appleMusic" | "youtube" | "soundcloud" | "audiomack" | "bandcamp", string>>;

  // MERCH
  merch?: Array<{ name: string; price: string; imageUrl?: string; purchaseUrl: string }>;

  // LIVE_PREVIEW / VENUE_PREVIEW
  isLive?: boolean;
  liveRoomRoute?: string;
  viewerCount?: number;

  // EVENT
  eventDate?: string;
  eventVenue?: string;

  // YOPHO
  yophoCardUrl?: string;
  yophoCreateHref?: string;
}

export interface PublicProfileMediaComposerProps {
  blocks: MediaBlock[];
  accentColor?: string;
  role?: "performer" | "fan";
  ownerSlug?: string;
  ownerName?: string;
}

// ─── Utilities ───────────────────────────────────────────────────────────────

function focalObjectPosition(img: MediaBlockImage): string {
  const x = Math.round((img.focalX ?? 0.5) * 100);
  const y = Math.round((img.focalY ?? 0.5) * 100);
  return `${x}% ${y}%`;
}

function shapeRadius(shape: MediaBlockImage["shape"]): string {
  if (shape === "circle") return "50%";
  if (shape === "rounded") return "12px";
  return "0";
}

function formatDuration(sec?: number): string {
  if (!sec) return "";
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

// ─── Shared styles ───────────────────────────────────────────────────────────

const BLOCK_GAP = 20;

function blockWrap(style?: CSSProperties): CSSProperties {
  return {
    borderRadius: 16,
    overflow: "hidden",
    position: "relative",
    ...style,
  };
}

function blockLabel(color: string): CSSProperties {
  return {
    fontSize: 8,
    fontWeight: 900,
    letterSpacing: "0.18em",
    color,
    marginBottom: 10,
    display: "flex",
    alignItems: "center",
    gap: 6,
  };
}

function LabelBar({ text, color }: { text: string; color: string }) {
  return (
    <div style={blockLabel(color)}>
      <span style={{ width: 2, height: 12, background: color, borderRadius: 2, display: "inline-block" }} />
      {text}
    </div>
  );
}

function EmptySlot({ message, cta, href, color }: { message: string; cta?: string; href?: string; color: string }) {
  return (
    <div
      style={{
        padding: "24px 20px",
        borderRadius: 14,
        border: `1px dashed ${color}33`,
        background: `${color}05`,
        textAlign: "center",
      }}
    >
      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginBottom: cta ? 10 : 0 }}>{message}</div>
      {cta && href && (
        <Link
          href={href}
          style={{ fontSize: 9, fontWeight: 800, color, textDecoration: "none", letterSpacing: "0.1em" }}
        >
          {cta} →
        </Link>
      )}
    </div>
  );
}

// ─── Image renderer (with focal point) ──────────────────────────────────────

function BlockImg({
  img,
  height = 260,
  style,
}: {
  img: MediaBlockImage;
  height?: number | string;
  style?: CSSProperties;
}) {
  const zoom = img.zoom ?? 1;
  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height,
        overflow: "hidden",
        borderRadius: shapeRadius(img.shape ?? "rounded"),
        ...style,
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={img.url}
        alt={img.alt ?? ""}
        style={{
          width: "100%",
          height: "100%",
          objectFit: img.fit ?? "cover",
          objectPosition: focalObjectPosition(img),
          transform: zoom !== 1 ? `scale(${zoom})` : undefined,
          transformOrigin: `${focalObjectPosition(img)}`,
          display: "block",
        }}
      />
      {img.caption && (
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            padding: "6px 10px",
            fontSize: 10,
            color: "rgba(255,255,255,0.7)",
            background: "linear-gradient(transparent, rgba(0,0,0,0.65))",
          }}
        >
          {img.caption}
        </div>
      )}
    </div>
  );
}

// ─── Gallery layout renderer ─────────────────────────────────────────────────

function GalleryRenderer({
  images,
  layout,
  height = 220,
}: {
  images: MediaBlockImage[];
  layout: GalleryLayout;
  height?: number;
}) {
  const imgs = images.slice(0, 6);
  if (!imgs.length) return null;

  if (layout === "1-UP" || imgs.length === 1) {
    return <BlockImg img={imgs[0]} height={height} />;
  }

  if (layout === "2-UP" || imgs.length === 2) {
    return (
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
        {imgs.slice(0, 2).map((im) => (
          <BlockImg key={im.url} img={im} height={height} />
        ))}
      </div>
    );
  }

  if (layout === "3-UP_FEATURE") {
    return (
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gridTemplateRows: `${height / 2}px ${height / 2}px`, gap: 6 }}>
        <div style={{ gridRow: "1 / 3" }}>
          {imgs[0] && <BlockImg img={imgs[0]} height={height} />}
        </div>
        {imgs[1] && <BlockImg img={imgs[1]} height={height / 2} />}
        {imgs[2] && <BlockImg img={imgs[2]} height={height / 2} />}
      </div>
    );
  }

  if (layout === "4-GRID") {
    return (
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
        {imgs.slice(0, 4).map((im) => (
          <BlockImg key={im.url} img={im} height={height / 2} />
        ))}
      </div>
    );
  }

  if (layout === "5-MOSAIC") {
    return (
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gridTemplateRows: `${height / 2}px ${height / 2}px`, gap: 6 }}>
        <div style={{ gridRow: "1 / 3" }}>
          {imgs[0] && <BlockImg img={imgs[0]} height={height} />}
        </div>
        {imgs.slice(1, 5).map((im) => (
          <BlockImg key={im.url} img={im} height={height / 2} />
        ))}
      </div>
    );
  }

  // 6-MASONRY — CSS columns fallback
  return (
    <div style={{ columns: 2, gap: 6 }}>
      {imgs.map((im) => (
        <div key={im.url} style={{ breakInside: "avoid", marginBottom: 6 }}>
          <BlockImg img={im} height={height * 0.6} />
        </div>
      ))}
    </div>
  );
}

// ─── Block renderers ─────────────────────────────────────────────────────────

function ImageBlock({ block, ac }: { block: MediaBlock; ac: string }) {
  const imgs = block.images ?? [];
  if (!imgs.length) {
    return <EmptySlot message="No image uploaded." color={ac} />;
  }
  const layout = block.layout === "TWO_COLUMN" ? "2-UP" : block.galleryLayout ?? "1-UP";
  const height = block.layout === "FULL_HERO" ? 400 : 260;
  return <GalleryRenderer images={imgs} layout={layout as GalleryLayout} height={height} />;
}

function GalleryBlock({ block, ac }: { block: MediaBlock; ac: string }) {
  const imgs = block.images ?? [];
  if (!imgs.length) {
    return <EmptySlot message="No photos yet." color={ac} />;
  }
  return <GalleryRenderer images={imgs} layout={block.galleryLayout ?? "4-GRID"} height={220} />;
}

function VideoBlock({ block, ac }: { block: MediaBlock; ac: string }) {
  if (!block.videoUrl) {
    return <EmptySlot message="No video uploaded yet." color={ac} />;
  }
  return (
    <div style={{ borderRadius: 14, overflow: "hidden", background: "#000" }}>
      {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
      <video
        src={block.videoUrl}
        style={{ width: "100%", maxHeight: 420, display: "block" }}
        controls
        loop={block.layout === "FULL_HERO"}
        muted={block.layout === "FULL_HERO"}
        playsInline
      />
    </div>
  );
}

function TrackBlock({ block, ac }: { block: MediaBlock; ac: string }) {
  const hasContent = block.trackTitle;
  if (!hasContent) {
    return <EmptySlot message="No track uploaded yet." color={ac} />;
  }
  const links = block.trackStreamingLinks ?? {};
  const STREAMING_LABELS: Record<string, string> = {
    spotify: "Spotify",
    appleMusic: "Apple Music",
    youtube: "YouTube",
    soundcloud: "SoundCloud",
    audiomack: "Audiomack",
    bandcamp: "Bandcamp",
  };
  return (
    <div
      style={{
        display: "flex",
        gap: 16,
        alignItems: "center",
        padding: "16px",
        borderRadius: 14,
        background: `${ac}08`,
        border: `1px solid ${ac}22`,
      }}
    >
      {block.trackCoverUrl ? (
        <div style={{ width: 72, height: 72, flexShrink: 0, borderRadius: 10, overflow: "hidden" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={block.trackCoverUrl} alt={block.trackTitle ?? ""} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        </div>
      ) : (
        <div
          style={{
            width: 72,
            height: 72,
            flexShrink: 0,
            borderRadius: 10,
            background: `${ac}18`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 28,
          }}
        >
          🎵
        </div>
      )}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 900, fontSize: 15, color: "#fff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          {block.trackTitle}
        </div>
        {block.trackArtist && (
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", marginTop: 2 }}>{block.trackArtist}</div>
        )}
        {block.trackDurationSec && (
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", marginTop: 2 }}>{formatDuration(block.trackDurationSec)}</div>
        )}
        {Object.keys(links).length > 0 && (
          <div style={{ display: "flex", gap: 6, marginTop: 8, flexWrap: "wrap" }}>
            {(Object.entries(links) as [string, string | undefined][])
              .filter(([, url]) => !!url)
              .map(([platform, url]) => (
                <a
                  key={platform}
                  href={url as string}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    fontSize: 9,
                    fontWeight: 800,
                    padding: "3px 8px",
                    borderRadius: 5,
                    background: `${ac}18`,
                    border: `1px solid ${ac}33`,
                    color: ac,
                    textDecoration: "none",
                    letterSpacing: "0.05em",
                  }}
                >
                  {STREAMING_LABELS[platform] ?? platform}
                </a>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}

function MerchBlock({ block, ac }: { block: MediaBlock; ac: string }) {
  const items = block.merch ?? [];
  if (!items.length) {
    return <EmptySlot message="No merch available." color={ac} />;
  }
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 12 }}>
      {items.map((item) => (
        <a
          key={item.name}
          href={item.purchaseUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{ textDecoration: "none", display: "block" }}
        >
          <div
            style={{
              borderRadius: 12,
              overflow: "hidden",
              border: `1px solid ${ac}22`,
              background: `${ac}06`,
              transition: "border-color 0.15s",
            }}
          >
            {item.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={item.imageUrl} alt={item.name} style={{ width: "100%", aspectRatio: "1", objectFit: "cover", display: "block" }} />
            ) : (
              <div style={{ width: "100%", aspectRatio: "1", background: `${ac}12`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28 }}>👕</div>
            )}
            <div style={{ padding: "8px 10px" }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: "#fff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.name}</div>
              <div style={{ fontSize: 10, color: ac, fontWeight: 700, marginTop: 2 }}>{item.price}</div>
            </div>
          </div>
        </a>
      ))}
    </div>
  );
}

function LivePreviewBlock({ block, ac }: { block: MediaBlock; ac: string }) {
  if (!block.isLive || !block.liveRoomRoute) {
    return <EmptySlot message="Not currently live." color={ac} />;
  }
  return (
    <Link href={block.liveRoomRoute} style={{ textDecoration: "none", display: "block" }}>
      <div
        style={{
          borderRadius: 14,
          overflow: "hidden",
          border: `1.5px solid #E63000`,
          background: "linear-gradient(135deg, #1a0000, #0a0010)",
          padding: "20px",
          display: "flex",
          alignItems: "center",
          gap: 16,
        }}
      >
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: "50%",
            background: "#E63000",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 20,
            flexShrink: 0,
            animation: "pulse 1.5s ease-in-out infinite",
          }}
        >
          📡
        </div>
        <div>
          <div style={{ fontSize: 10, fontWeight: 900, letterSpacing: "0.15em", color: "#E63000" }}>🔴 LIVE NOW</div>
          <div style={{ fontSize: 14, fontWeight: 800, color: "#fff", marginTop: 2 }}>{block.title ?? "Live Session"}</div>
          {block.viewerCount != null && (
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.45)", marginTop: 2 }}>{block.viewerCount.toLocaleString()} watching</div>
          )}
        </div>
        <div style={{ marginLeft: "auto", fontSize: 10, fontWeight: 900, color: "#E63000", letterSpacing: "0.1em" }}>JOIN →</div>
      </div>
    </Link>
  );
}

function YophoBlock({ block, ac }: { block: MediaBlock; ac: string }) {
  if (!block.yophoCardUrl) {
    const createHref = block.yophoCreateHref ?? "/yopho";
    return <EmptySlot message="No YoPho card yet." cta="CREATE YOPHO CARD" href={createHref} color={ac} />;
  }
  return (
    <div style={{ borderRadius: 14, overflow: "hidden", border: `1px solid ${ac}33`, background: `${ac}06` }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={block.yophoCardUrl} alt="YoPho Card" style={{ width: "100%", display: "block" }} />
      {block.href && (
        <div style={{ padding: "10px 14px" }}>
          <Link href={block.href} style={{ fontSize: 9, fontWeight: 800, color: ac, textDecoration: "none", letterSpacing: "0.1em" }}>
            VIEW FULL YOPHO →
          </Link>
        </div>
      )}
    </div>
  );
}

function MagazineBlock({ block, ac }: { block: MediaBlock; ac: string }) {
  const href = block.href ?? "/magazine";
  return (
    <Link href={href} style={{ textDecoration: "none", display: "block" }}>
      <div
        style={{
          borderRadius: 14,
          overflow: "hidden",
          border: `1px solid ${ac}22`,
          background: "linear-gradient(135deg, rgba(255,215,0,0.04), rgba(170,45,255,0.04))",
          display: "flex",
          gap: 16,
          alignItems: "center",
          padding: 16,
        }}
      >
        {block.images?.[0] ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={block.images[0].url}
            alt={block.title ?? ""}
            style={{ width: 72, height: 72, objectFit: "cover", borderRadius: 8, flexShrink: 0 }}
          />
        ) : (
          <div style={{ width: 72, height: 72, borderRadius: 8, background: "#FFD70018", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, flexShrink: 0 }}>
            📰
          </div>
        )}
        <div>
          <div style={{ fontSize: 8, fontWeight: 900, letterSpacing: "0.18em", color: "#FFD700", marginBottom: 4 }}>MAGAZINE FEATURE</div>
          <div style={{ fontSize: 14, fontWeight: 800, color: "#fff" }}>{block.title ?? "Read the Feature"}</div>
          {block.subtitle && (
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", marginTop: 2 }}>{block.subtitle}</div>
          )}
          <div style={{ fontSize: 9, color: "#FFD700", fontWeight: 700, marginTop: 6, letterSpacing: "0.08em" }}>READ NOW →</div>
        </div>
      </div>
    </Link>
  );
}

function EventBlock({ block, ac }: { block: MediaBlock; ac: string }) {
  const href = block.href ?? "/events";
  return (
    <Link href={href} style={{ textDecoration: "none", display: "block" }}>
      <div
        style={{
          borderRadius: 14,
          border: `1px solid ${ac}33`,
          background: `${ac}06`,
          overflow: "hidden",
        }}
      >
        {block.images?.[0] && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={block.images[0].url}
            alt={block.title ?? ""}
            style={{ width: "100%", height: 180, objectFit: "cover", display: "block" }}
          />
        )}
        <div style={{ padding: "12px 16px" }}>
          {block.eventDate && (
            <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.14em", color: ac, marginBottom: 4 }}>
              {new Date(block.eventDate).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
            </div>
          )}
          <div style={{ fontSize: 14, fontWeight: 800, color: "#fff" }}>{block.title ?? "Upcoming Event"}</div>
          {block.eventVenue && (
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", marginTop: 2 }}>{block.eventVenue}</div>
          )}
          <div style={{ fontSize: 9, color: ac, fontWeight: 700, marginTop: 8, letterSpacing: "0.08em" }}>VIEW EVENT →</div>
        </div>
      </div>
    </Link>
  );
}

function MemoryBlock({ block, ac }: { block: MediaBlock; ac: string }) {
  const imgs = block.images ?? [];
  const href = block.href ?? "/memory";
  if (!imgs.length) {
    return <EmptySlot message="No Memory Wall clips yet." cta="VISIT MEMORY WALL" href={href} color={ac} />;
  }
  return (
    <div>
      <GalleryRenderer images={imgs} layout="4-GRID" height={120} />
      <Link href={href} style={{ display: "block", marginTop: 8, fontSize: 9, fontWeight: 800, color: ac, textDecoration: "none", letterSpacing: "0.1em" }}>
        VIEW ALL MEMORIES →
      </Link>
    </div>
  );
}

function PlaylistBlock({ block, ac }: { block: MediaBlock; ac: string }) {
  const href = block.href ?? "/playlists";
  return (
    <Link href={href} style={{ textDecoration: "none", display: "block" }}>
      <div
        style={{
          borderRadius: 14,
          border: `1px solid ${ac}22`,
          background: `${ac}06`,
          padding: "16px",
          display: "flex",
          alignItems: "center",
          gap: 14,
        }}
      >
        {block.images?.[0] ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={block.images[0].url} alt="" style={{ width: 56, height: 56, objectFit: "cover", borderRadius: 8, flexShrink: 0 }} />
        ) : (
          <div style={{ width: 56, height: 56, borderRadius: 8, background: `${ac}18`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, flexShrink: 0 }}>
            🎧
          </div>
        )}
        <div>
          <div style={{ fontSize: 8, fontWeight: 900, letterSpacing: "0.14em", color: ac, marginBottom: 3 }}>PLAYLIST</div>
          <div style={{ fontSize: 14, fontWeight: 800, color: "#fff" }}>{block.title ?? "My Playlist"}</div>
          {block.subtitle && <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>{block.subtitle}</div>}
          <div style={{ fontSize: 9, color: ac, fontWeight: 700, marginTop: 6, letterSpacing: "0.08em" }}>OPEN PLAYLIST →</div>
        </div>
      </div>
    </Link>
  );
}

function SnipBlock({ block, ac }: { block: MediaBlock; ac: string }) {
  if (!block.videoUrl) {
    return <EmptySlot message="No Snip clips yet." color={ac} />;
  }
  return (
    <div style={{ borderRadius: 14, overflow: "hidden", background: "#000" }}>
      {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
      <video
        src={block.videoUrl}
        style={{ width: "100%", maxHeight: 360, display: "block" }}
        controls
        playsInline
      />
    </div>
  );
}

function Avatar3DBlock({ block, ac }: { block: MediaBlock; ac: string }) {
  // Per Rule 18: full 3D avatar pipeline is multi-specialist work, not a stub.
  // Honest placeholder until AvatarRuntime is built.
  return (
    <EmptySlot
      message="3D avatar showcase coming soon — requires AvatarRuntime build."
      color={ac}
    />
  );
}

function VenuePreviewBlock({ block, ac }: { block: MediaBlock; ac: string }) {
  const href = block.liveRoomRoute ?? block.href ?? "/rooms";
  if (block.images?.[0]) {
    return (
      <Link href={href} style={{ textDecoration: "none", display: "block" }}>
        <BlockImg img={block.images[0]} height={200} />
      </Link>
    );
  }
  return <EmptySlot message="No venue preview available." color={ac} />;
}

// ─── Block router ─────────────────────────────────────────────────────────────

function BlockRenderer({ block, ac }: { block: MediaBlock; ac: string }) {
  const color = block.accentColor ?? ac;
  switch (block.type) {
    case "IMAGE":
      return <ImageBlock block={block} ac={color} />;
    case "GALLERY":
    case "COLLAGE":
      return <GalleryBlock block={block} ac={color} />;
    case "VIDEO":
      return <VideoBlock block={block} ac={color} />;
    case "SNIP":
      return <SnipBlock block={block} ac={color} />;
    case "TRACK":
      return <TrackBlock block={block} ac={color} />;
    case "MERCH":
      return <MerchBlock block={block} ac={color} />;
    case "LIVE_PREVIEW":
      return <LivePreviewBlock block={block} ac={color} />;
    case "YOPHO":
      return <YophoBlock block={block} ac={color} />;
    case "MAGAZINE":
      return <MagazineBlock block={block} ac={color} />;
    case "EVENT":
      return <EventBlock block={block} ac={color} />;
    case "MEMORY":
      return <MemoryBlock block={block} ac={color} />;
    case "PLAYLIST":
      return <PlaylistBlock block={block} ac={color} />;
    case "AVATAR_3D":
      return <Avatar3DBlock block={block} ac={color} />;
    case "VENUE_PREVIEW":
      return <VenuePreviewBlock block={block} ac={color} />;
    default:
      return null;
  }
}

// ─── Layout wrapper ───────────────────────────────────────────────────────────

function BlockWithLayout({
  block,
  nextBlock,
  ac,
}: {
  block: MediaBlock;
  nextBlock?: MediaBlock;
  ac: string;
}) {
  const layout = block.layout ?? "DEFAULT";

  // TWO_COLUMN: pair this block with the next block side by side
  if (layout === "TWO_COLUMN" && nextBlock) {
    // consumed by the parent iterator — rendered in paired loop
    return null;
  }

  if (layout === "FULL_HERO" || layout === "FULL_BLEED") {
    return (
      <div style={blockWrap({ marginLeft: -24, marginRight: -24, borderRadius: 0 })}>
        {block.title && (
          <div style={{ padding: "0 24px 10px" }}>
            <LabelBar text={block.title} color={block.accentColor ?? ac} />
          </div>
        )}
        <BlockRenderer block={block} ac={ac} />
      </div>
    );
  }

  return (
    <div>
      {block.title && <LabelBar text={block.title} color={block.accentColor ?? ac} />}
      <BlockRenderer block={block} ac={ac} />
    </div>
  );
}

// ─── Main composer ────────────────────────────────────────────────────────────

export default function PublicProfileMediaComposer({
  blocks,
  accentColor = "#00FFFF",
  role = "fan",
}: PublicProfileMediaComposerProps) {
  const visible = blocks.filter((b) => !b.hidden);
  if (!visible.length) return null;

  const rendered: React.ReactNode[] = [];
  let i = 0;

  while (i < visible.length) {
    const block = visible[i];
    const next = visible[i + 1];

    // TWO_COLUMN: pair consecutive blocks with matching layout
    if (block.layout === "TWO_COLUMN" && next?.layout === "TWO_COLUMN") {
      rendered.push(
        <div key={`pair-${block.id}`} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: BLOCK_GAP }}>
          <div>
            {block.title && <LabelBar text={block.title} color={block.accentColor ?? accentColor} />}
            <BlockRenderer block={block} ac={accentColor} />
          </div>
          <div>
            {next.title && <LabelBar text={next.title} color={next.accentColor ?? accentColor} />}
            <BlockRenderer block={next} ac={accentColor} />
          </div>
        </div>
      );
      i += 2;
      continue;
    }

    // THREE_CARD: three consecutive blocks
    const third = visible[i + 2];
    if (
      block.layout === "THREE_CARD" &&
      next?.layout === "THREE_CARD" &&
      third?.layout === "THREE_CARD"
    ) {
      rendered.push(
        <div key={`trio-${block.id}`} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: BLOCK_GAP }}>
          {[block, next, third].map((b) => (
            <div key={b.id}>
              {b.title && <LabelBar text={b.title} color={b.accentColor ?? accentColor} />}
              <BlockRenderer block={b} ac={accentColor} />
            </div>
          ))}
        </div>
      );
      i += 3;
      continue;
    }

    // Default: single block full width
    rendered.push(
      <BlockWithLayout key={block.id} block={block} nextBlock={next} ac={accentColor} />
    );
    i++;
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: BLOCK_GAP,
      }}
    >
      {rendered}
    </div>
  );
}
