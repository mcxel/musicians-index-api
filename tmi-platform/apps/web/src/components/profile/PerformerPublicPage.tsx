"use client";

import { useState } from "react";
import Link from "next/link";
import { getTierColor, type PerformerIdentity } from "@/lib/performers/PerformerRegistry";
import MotionPosterPlayer from "@/components/media/MotionPosterPlayer";
import ArtistIdShareStrip from "@/components/identity/ArtistIdShareStrip";
import DiscoveryRail from "@/components/discovery/DiscoveryRail";
import PublicProfileMediaComposer, { type MediaBlock } from "@/components/profile/PublicProfileMediaComposer";

export interface PerformerPublicPageProps {
  performer: PerformerIdentity;
}

const TABS = ["FEATURED", "ABOUT", "MUSIC", "EVENTS", "MAGAZINE", "MERCH"] as const;
type Tab = typeof TABS[number];

function derivePerformerBlocks(p: PerformerIdentity, ac: string): MediaBlock[] {
  const blocks: MediaBlock[] = [];

  if (p.isLive) {
    blocks.push({
      id: "live",
      type: "LIVE_PREVIEW",
      isLive: true,
      liveRoomRoute: p.liveRoomRoute,
      title: `${p.name}'s Live Session`,
      viewerCount: p.audienceCount,
      featured: true,
    });
  }

  if (p.introVideoUrl) {
    blocks.push({ id: "intro-video", type: "VIDEO", videoUrl: p.introVideoUrl, title: "VIDEO" });
  }

  const galleryImages = [
    p.profileImageUrl ? { url: p.profileImageUrl, alt: p.name } : null,
    p.coverImageUrl && p.coverImageUrl !== p.profileImageUrl
      ? { url: p.coverImageUrl, alt: `${p.name} cover` }
      : null,
    p.motionPosterUrl && p.motionPosterUrl !== p.profileImageUrl
      ? { url: p.motionPosterUrl, alt: `${p.name} motion poster` }
      : null,
  ].filter((x): x is { url: string; alt: string } => x !== null);

  if (galleryImages.length > 1) {
    blocks.push({
      id: "gallery",
      type: "GALLERY",
      images: galleryImages,
      galleryLayout: galleryImages.length === 2 ? "2-UP" : "3-UP_FEATURE",
      title: "PHOTOS",
    });
  } else if (galleryImages.length === 1 && !p.introVideoUrl) {
    blocks.push({ id: "hero-image", type: "IMAGE", images: galleryImages, title: "PHOTO" });
  }

  const firstSong = p.songs?.[0];
  if (firstSong) {
    blocks.push({
      id: "featured-track",
      type: "TRACK",
      trackTitle: firstSong.title,
      trackArtist: p.name,
      trackDurationSec: firstSong.durationSec,
      trackAudioUrl: firstSong.audioUrl,
      trackCoverUrl: firstSong.coverUrl,
      trackStreamingLinks: firstSong.streamingLinks as MediaBlock["trackStreamingLinks"],
      title: "FEATURED TRACK",
    });
  }

  blocks.push({
    id: "magazine",
    type: "MAGAZINE",
    title: "MAGAZINE FEATURE",
    href: `/magazine?performer=${encodeURIComponent(p.slug)}`,
    accentColor: "#FFD700",
  });

  if ((p.merch?.length ?? 0) > 0) {
    blocks.push({
      id: "merch",
      type: "MERCH",
      merch: p.merch!.map((m) => ({
        name: m.name,
        price: `$${m.price}`,
        imageUrl: m.imageUrl,
        purchaseUrl: m.purchaseUrl,
      })),
      title: "MERCH & SERVICES",
      accentColor: "#AA2DFF",
    });
  }

  return blocks;
}

function SectionLabel({ label, color }: { label: string; color: string }) {
  return (
    <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.2em", color, marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
      <span style={{ width: 3, height: 14, background: color, borderRadius: 2, display: "inline-block" }} />
      {label}
    </div>
  );
}

function ctaStyle(color: string, filled = false): React.CSSProperties {
  const isRgba = color.startsWith("rgba");
  return {
    display: "inline-block",
    padding: "9px 18px",
    borderRadius: 8,
    fontSize: 10,
    fontWeight: 900,
    letterSpacing: "0.08em",
    textDecoration: "none",
    cursor: "pointer",
    background: filled ? color : `${isRgba ? "rgba(255,255,255,0.07)" : `${color}14`}`,
    border: `1px solid ${isRgba ? "rgba(255,255,255,0.2)" : `${color}55`}`,
    color: filled ? "#050510" : (isRgba ? "rgba(255,255,255,0.6)" : color),
  };
}

/** Public performer page — reads PerformerRegistry; no duplicate profile system. */
export default function PerformerPublicPage({ performer: p }: PerformerPublicPageProps) {
  const [tab, setTab] = useState<Tab>("FEATURED");
  const ac = getTierColor(p.tier);

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "linear-gradient(160deg, #0a0614, #050310)",
        color: "#fff",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {/* Breadcrumb nav */}
      <div
        style={{
          padding: "12px 20px",
          display: "flex",
          gap: 8,
          alignItems: "center",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          fontSize: 9,
          fontWeight: 700,
          letterSpacing: "0.12em",
        }}
      >
        <Link href="/explore" style={{ color: "rgba(255,255,255,0.35)", textDecoration: "none" }}>← EXPLORE</Link>
        <span style={{ color: "rgba(255,255,255,0.2)" }}>/</span>
        <span style={{ color: ac }}>{p.name}</span>
      </div>

      {/* Hero stage — full-width MotionPoster with identity overlay */}
      <div style={{ position: "relative", height: "clamp(340px, 52vw, 560px)", overflow: "hidden" }}>
        <MotionPosterPlayer
          isLive={p.isLive}
          liveRoomRoute={p.liveRoomRoute}
          introVideoUrl={p.introVideoUrl}
          motionPosterUrl={p.motionPosterUrl}
          staticImageUrl={p.profileImageUrl}
          alt={p.name}
          audienceCount={p.audienceCount}
          showLiveOverlay
          style={{ position: "absolute", inset: 0 }}
          height="100%"
          width="100%"
        />
        {/* Scrim so text is readable */}
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, transparent 25%, rgba(5,3,16,0.92) 100%)" }} />

        {/* Identity + actions floating at the bottom */}
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "24px 28px" }}>
          <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 8, flexWrap: "wrap" }}>
            {p.isLive && (
              <span style={{ background: "#E63000", color: "#fff", fontSize: 8, fontWeight: 900, padding: "3px 10px", letterSpacing: "0.12em", borderRadius: 4 }}>
                🔴 LIVE NOW · {p.audienceCount.toLocaleString()} WATCHING
              </span>
            )}
            <span style={{ background: `${ac}20`, border: `1px solid ${ac}55`, color: ac, fontSize: 8, fontWeight: 900, padding: "3px 10px", letterSpacing: "0.1em", borderRadius: 4 }}>
              {p.tier.toUpperCase()}
            </span>
            <span style={{ fontSize: 8, color: "rgba(255,255,255,0.5)", fontWeight: 700, letterSpacing: "0.1em" }}>
              #{p.rank} · {p.category.toUpperCase()}
            </span>
          </div>

          <h1 style={{ margin: "0 0 4px", fontSize: "clamp(28px, 5vw, 56px)", fontWeight: 900, lineHeight: 1, letterSpacing: "-0.01em" }}>
            {p.name}
          </h1>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.55)", marginBottom: 18 }}>
            {p.city}, {p.countryName} {p.flag} · {p.fanCount.toLocaleString()} fans
          </div>

          {/* Action bar */}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {p.isLive ? (
              <Link href={p.liveRoomRoute} style={ctaStyle("#E63000", true)}>🔴 WATCH LIVE</Link>
            ) : null}
            <Link href={`/messages/new?recipientSlug=${encodeURIComponent(p.slug)}&name=${encodeURIComponent(p.name)}`} style={ctaStyle(ac)}>
              MESSAGE
            </Link>
            <Link href={`/tips?to=${encodeURIComponent(p.slug)}`} style={ctaStyle("#FFD700")}>TIP</Link>
            <Link href={`/booking?performer=${encodeURIComponent(p.slug)}`} style={ctaStyle("#00FF88")}>BOOK</Link>
            <Link href={`/yopho/card/${encodeURIComponent(p.slug)}`} style={ctaStyle("#00FFFF")}>YOPHO</Link>
          </div>
        </div>
      </div>

      {/* Section tab bar */}
      <div style={{ borderBottom: "1px solid rgba(255,255,255,0.08)", padding: "0 20px", display: "flex", gap: 0, overflowX: "auto" }}>
        {TABS.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            style={{
              padding: "14px 20px",
              background: "none",
              border: "none",
              borderBottom: tab === t ? `2px solid ${ac}` : "2px solid transparent",
              color: tab === t ? ac : "rgba(255,255,255,0.4)",
              fontSize: 10,
              fontWeight: 900,
              cursor: "pointer",
              letterSpacing: "0.1em",
              whiteSpace: "nowrap",
              fontFamily: "inherit",
            }}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "28px 20px 96px" }}>

        {/* ── FEATURED (media composer) ── */}
        {tab === "FEATURED" && (
          <PublicProfileMediaComposer
            blocks={derivePerformerBlocks(p, ac)}
            accentColor={ac}
            role="performer"
            ownerSlug={p.slug}
            ownerName={p.name}
          />
        )}

        {/* ── ABOUT ── */}
        {tab === "ABOUT" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr clamp(220px, 30%, 320px)", gap: 24, alignItems: "start" }}>
            <div>
              <SectionLabel label="ABOUT" color={ac} />
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.75)", lineHeight: 1.75, margin: "0 0 28px", maxWidth: 560 }}>
                {p.bio ?? "No bio yet."}
              </p>

              {(p.songs?.length ?? 0) > 0 ? (
                <>
                  <SectionLabel label="FEATURED TRACKS" color={ac} />
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {p.songs!.slice(0, 5).map((s, i) => {
                      const playHref = s.audioUrl ?? s.streamingLinks?.spotify ?? s.streamingLinks?.youtube;
                      return (
                        <div
                          key={s.title}
                          style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 10 }}
                        >
                          <span style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.25)", minWidth: 22, textAlign: "right" }}>{i + 1}</span>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 12, fontWeight: 800, color: "#fff" }}>{s.title}</div>
                            {s.streams != null && (
                              <div style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", marginTop: 2 }}>{s.streams.toLocaleString()} streams</div>
                            )}
                          </div>
                          {playHref ? (
                            <Link href={playHref} style={{ fontSize: 9, fontWeight: 900, color: ac, textDecoration: "none", padding: "5px 12px", border: `1px solid ${ac}44`, borderRadius: 6 }}>
                              ▶ PLAY
                            </Link>
                          ) : null}
                        </div>
                      );
                    })}
                  </div>
                </>
              ) : (
                <p style={{ fontSize: 11, color: "rgba(255,255,255,0.25)", fontStyle: "italic" }}>No catalog uploaded yet.</p>
              )}
            </div>

            {/* Sidebar */}
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ padding: "18px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14 }}>
                <SectionLabel label="STATS" color={ac} />
                {[
                  { label: "Rank", value: `#${p.rank}`, color: "#FFD700" },
                  { label: "XP", value: p.xp.toLocaleString(), color: ac },
                  { label: "Fans", value: p.fanCount.toLocaleString(), color: "#FF2DAA" },
                  { label: "Likes", value: p.likes.toLocaleString(), color: "#00FF88" },
                ].map((stat) => (
                  <div key={stat.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "7px 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                    <span style={{ fontSize: 10, color: "rgba(255,255,255,0.4)" }}>{stat.label}</span>
                    <span style={{ fontSize: 11, fontWeight: 900, color: stat.color }}>{stat.value}</span>
                  </div>
                ))}
              </div>

              <div style={{ padding: "18px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14 }}>
                <SectionLabel label="BOOKING" color="#00FF88" />
                <p style={{ fontSize: 11, color: "rgba(255,255,255,0.55)", lineHeight: 1.5, margin: "0 0 12px" }}>
                  Available for shows, features, and collaborations.
                </p>
                <Link href={`/booking?performer=${encodeURIComponent(p.slug)}`} style={{ ...ctaStyle("#00FF88", true), display: "block", textAlign: "center" }}>
                  BOOK THIS ARTIST
                </Link>
              </div>

              <ArtistIdShareStrip userId={p.slug} displayName={p.name} role="performer" artistSlug={p.slug} />
            </div>
          </div>
        )}

        {/* ── MUSIC ── */}
        {tab === "MUSIC" && (
          <div>
            <SectionLabel label="MUSIC & MEDIA" color={ac} />
            {(p.songs?.length ?? 0) > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {p.songs!.map((s, i) => {
                  const links = s.streamingLinks ?? {};
                  const playHref = s.audioUrl ?? links.spotify ?? links.youtube ?? links.soundcloud;
                  return (
                    <div
                      key={s.title}
                      style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 16px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 12 }}
                    >
                      <span style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.2)", minWidth: 26, textAlign: "right" }}>{i + 1}</span>
                      {s.coverUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={s.coverUrl} alt={s.title} style={{ width: 42, height: 42, borderRadius: 6, objectFit: "cover", flexShrink: 0 }} />
                      ) : (
                        <div style={{ width: 42, height: 42, borderRadius: 6, background: `${ac}22`, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>🎵</div>
                      )}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 800, color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.title}</div>
                        {s.streams != null && (
                          <div style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", marginTop: 2 }}>{s.streams.toLocaleString()} streams</div>
                        )}
                      </div>
                      <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                        {playHref ? (
                          <Link href={playHref} style={ctaStyle(ac)}>▶ PLAY</Link>
                        ) : null}
                        {links.spotify ? <Link href={links.spotify} style={{ fontSize: 9, color: "#1DB954", fontWeight: 800, textDecoration: "none" }}>SPOTIFY</Link> : null}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>No music uploaded yet.</p>
            )}
          </div>
        )}

        {/* ── EVENTS ── */}
        {tab === "EVENTS" && (
          <div>
            <SectionLabel label="LIVE & UPCOMING" color={ac} />
            {p.isLive ? (
              <Link
                href={p.liveRoomRoute}
                style={{ display: "flex", gap: 16, padding: "18px 20px", background: "rgba(230,48,0,0.1)", border: "2px solid rgba(230,48,0,0.4)", borderRadius: 14, textDecoration: "none", marginBottom: 20 }}
              >
                <span style={{ fontSize: 32, flexShrink: 0 }}>🔴</span>
                <div>
                  <div style={{ fontSize: 9, fontWeight: 900, color: "#E63000", letterSpacing: "0.14em" }}>LIVE RIGHT NOW</div>
                  <div style={{ fontSize: 16, fontWeight: 900, color: "#fff", marginTop: 4 }}>Join {p.name}'s live room</div>
                  <div style={{ fontSize: 10, color: "rgba(255,255,255,0.5)", marginTop: 4 }}>
                    {p.audienceCount.toLocaleString()} watching · Started {p.timeLive}
                  </div>
                </div>
              </Link>
            ) : null}
            <p style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>
              {p.isLive ? "Other upcoming events:" : "No upcoming events scheduled."}{" "}
              Follow {p.name} to get notified of their next live session.
            </p>
            <div style={{ marginTop: 20 }}>
              <DiscoveryRail type="liveRooms" limit={6} accentColor={ac} enableLiveStatus />
            </div>
          </div>
        )}

        {/* ── MAGAZINE ── */}
        {tab === "MAGAZINE" && (
          <div>
            <SectionLabel label="FEATURED IN THE MUSICIANS INDEX" color="#FFD700" />
            <DiscoveryRail type="articles" tags={[p.category]} limit={6} accentColor="#FFD700" />
            <div style={{ marginTop: 20, paddingTop: 20, borderTop: "1px solid rgba(255,255,255,0.07)", textAlign: "center" }}>
              <Link
                href={`/magazine?performer=${encodeURIComponent(p.slug)}`}
                style={{ fontSize: 11, fontWeight: 800, color: "#FFD700", textDecoration: "none", letterSpacing: "0.12em" }}
              >
                SEE ALL FEATURES IN THE MAGAZINE →
              </Link>
            </div>
          </div>
        )}

        {/* ── MERCH ── */}
        {tab === "MERCH" && (
          <div>
            <SectionLabel label="MERCH & SERVICES" color="#AA2DFF" />
            {(p.merch?.length ?? 0) > 0 ? (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 14 }}>
                {p.merch!.map((m) => (
                  <a
                    key={m.name}
                    href={m.purchaseUrl}
                    target="_blank"
                    rel="noreferrer"
                    style={{ display: "block", padding: "16px", background: "rgba(170,45,255,0.08)", border: "1px solid rgba(170,45,255,0.3)", borderRadius: 12, textDecoration: "none" }}
                  >
                    {m.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={m.imageUrl} alt={m.name} style={{ width: "100%", height: 140, objectFit: "cover", borderRadius: 8, marginBottom: 10 }} />
                    ) : (
                      <div style={{ width: "100%", height: 80, borderRadius: 8, background: "rgba(170,45,255,0.15)", marginBottom: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32 }}>🛍️</div>
                    )}
                    <div style={{ fontSize: 13, fontWeight: 800, color: "#fff" }}>{m.name}</div>
                    <div style={{ fontSize: 13, fontWeight: 900, color: "#AA2DFF", marginTop: 4 }}>${m.price}</div>
                    <div style={{ fontSize: 9, fontWeight: 800, color: "#AA2DFF", marginTop: 8, letterSpacing: "0.1em" }}>BUY NOW →</div>
                  </a>
                ))}
              </div>
            ) : (
              <p style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>No merch available yet.</p>
            )}
          </div>
        )}

        {/* Discovery rails — always shown */}
        <div style={{ marginTop: 40 }}>
          <DiscoveryRail type="performers" exclude={p.slug} limit={6} accentColor={ac} label="MORE PERFORMERS" />
        </div>
      </div>
    </main>
  );
}
