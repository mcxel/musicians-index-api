"use client";

import React from "react";
import Link from "next/link";
import { EDITORIAL_CUT_REGISTRY, getCutShapeStyle, type EditorialCutShape } from "@/lib/magazine/EditorialCutRegistry";
import type { EditorialTemplateId } from "@/lib/magazine/MagazineLayoutRuntime";
import type { RandomPageSubtype } from "@/lib/magazine/MagazineIssueContract";
import { magazineReaderUrl } from "@/lib/magazine/MagazineReaderRoutes";
import { ImageSlotWrapper } from "@/components/visual-enforcement";

export interface EditorialSpreadProps {
  templateId: EditorialTemplateId;
  title: string;
  subtitle?: string;
  author?: string;
  accentColor?: string;
  category?: string;
  heroImage?: string;
  secondaryImages?: string[];
  bodyParagraphs?: string[];
  pullQuote?: string;
  ratings?: { track: string; score: number }[];
  audioUrl?: string;
  videoUrl?: string;
  cutShape?: EditorialCutShape;
  randomSubtype?: RandomPageSubtype;
  communityStories?: { id: string; author: string; avatar?: string; text: string; styleTag?: string }[];
  yophoImages?: { id: string; url: string; title: string; tag?: string }[];
}

export function NativeEditorialBadge({ label, color = "#FFD700", icon = "✦" }: { label: string; color?: string; icon?: string }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        fontSize: 9,
        fontWeight: 900,
        letterSpacing: "0.14em",
        textTransform: "uppercase",
        color: "#050510",
        background: color,
        padding: "3px 9px",
        borderRadius: 3,
        boxShadow: `0 2px 8px ${color}55`,
      }}
    >
      <span>{icon}</span>
      <span>{label}</span>
    </span>
  );
}

export function NativeEditorialAction({ label, href, color = "#00FFFF", icon = "▶" }: { label: string; href: string; color?: string; icon?: string }) {
  return (
    <Link
      href={href}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "8px 16px",
        fontSize: 10,
        fontWeight: 900,
        letterSpacing: "0.12em",
        textTransform: "uppercase",
        color: "#fff",
        background: `linear-gradient(135deg, ${color}44, rgba(5,5,16,0.9))`,
        border: `1px solid ${color}`,
        borderRadius: 4,
        textDecoration: "none",
        boxShadow: `0 4px 14px ${color}33`,
        transition: "transform 0.2s ease, boxShadow 0.2s ease",
      }}
    >
      <span>{icon}</span>
      <span>{label}</span>
    </Link>
  );
}

/**
 * Main Editorial Spread Engine — Renders 19 Canonical Magazine Template Families
 */
export default function MagazineEditorialSpreadEngine({
  templateId,
  title,
  subtitle,
  author,
  accentColor = "#FFD700",
  category = "FEATURE",
  heroImage = "/tmi-curated/mag-20.jpg",
  secondaryImages = ["/tmi-curated/mag-28.jpg", "/tmi-curated/mag-35.jpg"],
  bodyParagraphs = [
    "In an era dominated by algorithmic streams, TMI Magazine returns to the authoritative weight of true editorial craft.",
    "Spatial audio, polyrhythmic soundscapes, and community culture converge inside this digital printing press.",
  ],
  pullQuote = "Music is no longer just consumed — it is lived and inhabited.",
  ratings = [
    { track: "01. Neon Frequency", score: 9.8 },
    { track: "02. Velvet Cypher", score: 9.6 },
    { track: "03. Spatial Horizon", score: 9.9 },
  ],
  cutShape = "RECTANGLE",
  randomSubtype,
  communityStories = [
    { id: "1", author: "Marcus V.", text: "The live 3D room acoustics completely changed how our band previews new tracks.", styleTag: "YEARBOOK" },
    { id: "2", author: "Elena R.", text: "First time seeing polyrhythmic afro-fusion topped the platform charts!", styleTag: "POLAROID" },
    { id: "3", author: "KAI_PROD", text: "YoPho studio stamps let us verify our sample drops in real time.", styleTag: "CORKBOARD" },
    { id: "4", author: "Zuri B.", text: "Shoutout to everyone who entered the midnight Cypher arena last Friday.", styleTag: "NEWSPAPER" },
  ],
  yophoImages = [
    { id: "y1", url: "/tmi-curated/mag-42.jpg", title: "Midnight Session", tag: "PRODUCE" },
    { id: "y2", url: "/tmi-curated/mag-50.jpg", title: "Vocal Recording", tag: "LIVE" },
    { id: "y3", url: "/tmi-curated/mag-58.jpg", title: "Stage Lighting", tag: "VENUE" },
    { id: "y4", url: "/tmi-curated/mag-66.jpg", title: "Vinyl Pressing", tag: "MERCH" },
  ],
}: EditorialSpreadProps) {
  const shapeStyle = getCutShapeStyle(cutShape, accentColor);

  // 1. Heritage Editorial (Classic Ebony-style serif profile)
  if (templateId === "HERITAGE_EDITORIAL" || templateId === "LONGFORM_EDITORIAL") {
    return (
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20, color: "#eae3d2", fontFamily: "'Georgia', serif" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <NativeEditorialBadge label={category} color={accentColor} />
          <h1 style={{ fontSize: "clamp(24px, 4vw, 38px)", fontWeight: 900, lineHeight: 1.1, color: accentColor, margin: 0 }}>{title}</h1>
          {subtitle && <p style={{ fontSize: 13, fontStyle: "italic", opacity: 0.85, margin: 0 }}>{subtitle}</p>}
          {author && <span style={{ fontSize: 10, letterSpacing: "0.15em", textTransform: "uppercase", opacity: 0.6 }}>BY {author}</span>}
          <div style={{ position: "relative", width: "100%", height: 220, overflow: "hidden", ...shapeStyle }}>
            <ImageSlotWrapper imageId="hero-heritage" roomId="magazine-spread" className="w-full h-full object-cover" altText={title} />
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ borderLeft: `3px solid ${accentColor}`, paddingLeft: 14, fontSize: 14, fontStyle: "italic", color: accentColor, fontWeight: "bold" }}>
            &ldquo;{pullQuote}&rdquo;
          </div>
          {bodyParagraphs.map((p, idx) => (
            <p key={idx} style={{ fontSize: 12, lineHeight: 1.7, margin: 0 }}>
              {idx === 0 ? <span style={{ fontSize: 28, float: "left", lineHeight: 1, paddingRight: 6, color: accentColor, fontWeight: 900 }}>{p[0]}</span> : null}
              {idx === 0 ? p.slice(1) : p}
            </p>
          ))}
          <div style={{ marginTop: "auto", display: "flex", gap: 10, flexWrap: "wrap" }}>
            <NativeEditorialAction label="Listen to Audio Feature" href="/live" color={accentColor} icon="🎵" />
            <NativeEditorialAction label="View Artist Profile" href="/artists/ray-journey" color="#00FFFF" icon="👤" />
          </div>
        </div>
      </div>
    );
  }

  // 2. Entertainment Feature (Family Matters style dark celebrity profile)
  if (templateId === "ENTERTAINMENT_FEATURE" || templateId === "BIOGRAPHY_SPONSOR_RAIL") {
    return (
      <div style={{ display: "grid", gap: 16, color: "#fff", background: "#08040c", padding: 18, borderRadius: 10, border: `1px solid ${accentColor}44` }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: `1px solid ${accentColor}33`, paddingBottom: 10 }}>
          <NativeEditorialBadge label={category} color={accentColor} />
          <span style={{ fontSize: 9, letterSpacing: "0.2em", color: "rgba(255,255,255,0.5)" }}>SPECIAL FEATURE</span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <h2 style={{ fontSize: "clamp(26px, 4.5vw, 42px)", fontWeight: 900, textTransform: "uppercase", color: "#fff", lineHeight: 1, margin: 0 }}>{title}</h2>
            <p style={{ fontSize: 12, color: accentColor, fontWeight: 700 }}>{subtitle}</p>
            <div style={{ position: "relative", width: "100%", height: 200, borderRadius: 8, overflow: "hidden", border: `2px solid ${accentColor}` }}>
              <ImageSlotWrapper imageId="hero-entertainment" roomId="magazine-spread" className="w-full h-full object-cover" altText={title} />
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ background: `${accentColor}15`, borderLeft: `4px solid ${accentColor}`, padding: 12, borderRadius: "0 6px 6px 0" }}>
              <p style={{ margin: 0, fontSize: 12, fontWeight: 800, color: accentColor }}>&ldquo;{pullQuote}&rdquo;</p>
            </div>
            {bodyParagraphs.map((p, idx) => (
              <p key={idx} style={{ fontSize: 11.5, lineHeight: 1.6, color: "rgba(255,255,255,0.85)", margin: 0 }}>{p}</p>
            ))}
          </div>
        </div>
        {templateId === "BIOGRAPHY_SPONSOR_RAIL" && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 10, paddingTop: 10, borderTop: "1px dashed rgba(255,255,255,0.2)" }}>
            <div style={{ background: "rgba(255,215,0,0.08)", border: "1px solid rgba(255,215,0,0.3)", padding: 10, borderRadius: 6 }}>
              <span style={{ fontSize: 8, color: "#FFD700", fontWeight: 900 }}>SPONSOR // AUDIOPRO</span>
              <p style={{ fontSize: 10, margin: "4px 0", color: "#fff" }}>High-fidelity spatial monitors for performers.</p>
            </div>
            <div style={{ background: "rgba(0,255,255,0.08)", border: "1px solid rgba(0,255,255,0.3)", padding: 10, borderRadius: 6 }}>
              <span style={{ fontSize: 8, color: "#00FFFF", fontWeight: 900 }}>ADSENSE SLOT</span>
              <p style={{ fontSize: 10, margin: "4px 0", color: "#fff" }}>Programmatic banner inventory block.</p>
            </div>
          </div>
        )}
      </div>
    );
  }

  // 3. Retro Pop / Artist Scorecard
  if (templateId === "RETRO_POP" || templateId === "ARTIST_SCORECARD" || templateId === "ARTIST_ALMANAC") {
    return (
      <div style={{ display: "grid", gap: 14, color: "#fff", background: "linear-gradient(135deg, #1f0426, #090112)", padding: 16, borderRadius: 10, border: "2px solid #FF2DAA" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ background: "#FF2DAA", color: "#fff", padding: "4px 10px", fontWeight: 900, fontSize: 10, letterSpacing: "0.15em", borderRadius: 3 }}>
            RANK #3 OVERALL
          </span>
          <span style={{ fontSize: 10, color: "#00FFFF", fontWeight: 800 }}>RETRO POP EDITION</span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14 }}>
          <div style={{ position: "relative", minHeight: 220, overflow: "hidden", ...shapeStyle }}>
            <ImageSlotWrapper imageId="retro-pop-hero" roomId="magazine-spread" className="w-full h-full object-cover" altText={title} />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <h2 style={{ fontSize: 24, fontWeight: 900, textTransform: "uppercase", color: "#00FFFF", textShadow: "2px 2px #FF2DAA", margin: 0 }}>{title}</h2>
            <p style={{ fontSize: 11, lineHeight: 1.5, color: "rgba(255,255,255,0.9)", margin: 0 }}>{subtitle}</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 6 }}>
              <div style={{ background: "rgba(0,255,255,0.1)", padding: 8, borderRadius: 4, border: "1px solid #00FFFF" }}>
                <span style={{ fontSize: 8, color: "#00FFFF", display: "block" }}>LIVE STREAMS</span>
                <strong style={{ fontSize: 14, color: "#fff" }}>142.8K</strong>
              </div>
              <div style={{ background: "rgba(255,45,170,0.1)", padding: 8, borderRadius: 4, border: "1px solid #FF2DAA" }}>
                <span style={{ fontSize: 8, color: "#FF2DAA", display: "block" }}>FAN VOTES</span>
                <strong style={{ fontSize: 14, color: "#fff" }}>98.4%</strong>
              </div>
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
              <NativeEditorialAction label="WATCH CYPHER" href="/live" color="#00FFFF" icon="🎬" />
              <NativeEditorialAction label="BUY MERCH" href="/marketplace" color="#FF2DAA" icon="👕" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 4. Community Stories (Mini-story spreads with 4-8 people per page)
  if (templateId === "COMMUNITY_STORIES") {
    return (
      <div style={{ display: "grid", gap: 14, color: "#fff", background: "#0c0a14", padding: 18, borderRadius: 10, border: "1px solid rgba(0,255,255,0.3)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(255,255,255,0.15)", paddingBottom: 8 }}>
          <NativeEditorialBadge label="COMMUNITY VOICE" color="#00FF88" icon="💬" />
          <span style={{ fontSize: 9, color: "rgba(255,255,255,0.5)" }}>WEEKLY READER SUBMISSIONS</span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 }}>
          {communityStories.map((story) => (
            <div
              key={story.id}
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.12)",
                borderRadius: 8,
                padding: 12,
                display: "flex",
                flexDirection: "column",
                gap: 8,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 10, fontWeight: 900, color: "#00FF88" }}>@{story.author}</span>
                {story.styleTag && (
                  <span style={{ fontSize: 7, padding: "1px 5px", background: "rgba(255,255,255,0.1)", borderRadius: 3, color: "#FFD700" }}>
                    {story.styleTag}
                  </span>
                )}
              </div>
              <p style={{ fontSize: 11, lineHeight: 1.5, color: "rgba(255,255,255,0.85)", margin: 0 }}>&ldquo;{story.text}&rdquo;</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // 5. YoPho Mosaic (Fan & Performer versions: tight, staggered, polaroid, clean gallery)
  if (templateId === "EDITORIAL_MOSAIC" || randomSubtype === "FAN_YOPHO_MOSAIC" || randomSubtype === "PERFORMER_YOPHO_MOSAIC") {
    return (
      <div style={{ display: "grid", gap: 14, color: "#fff", background: "#07070f", padding: 16, borderRadius: 10, border: "1px solid #FFD700" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <NativeEditorialBadge label={randomSubtype === "PERFORMER_YOPHO_MOSAIC" ? "PERFORMER YOPHO MOSAIC" : "FAN YOPHO MOSAIC"} color="#FFD700" icon="📷" />
          <span style={{ fontSize: 9, color: "rgba(255,255,255,0.5)" }}>CANONICAL PHOTO GALLERY</span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 10 }}>
          {yophoImages.map((img) => (
            <div key={img.id} style={{ display: "flex", flexDirection: "column", gap: 4, background: "rgba(255,255,255,0.05)", padding: 6, borderRadius: 6 }}>
              <div style={{ position: "relative", width: "100%", aspectRatio: "1/1", borderRadius: 4, overflow: "hidden" }}>
                <ImageSlotWrapper imageId={img.id} roomId="magazine-spread" className="w-full h-full object-cover" altText={img.title} />
              </div>
              <span style={{ fontSize: 9, fontWeight: 800, color: "#fff" }}>{img.title}</span>
              {img.tag && <span style={{ fontSize: 7, color: "#FFD700" }}>{img.tag}</span>}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // 6. Album Review & Ratings
  if (templateId === "ALBUM_REVIEW") {
    return (
      <div style={{ display: "grid", gap: 14, color: "#fff", background: "#0c0814", padding: 18, borderRadius: 10, border: "1px solid #AA2DFF" }}>
        <NativeEditorialBadge label="ALBUM REVIEWS" color="#AA2DFF" icon="💿" />
        <h2 style={{ fontSize: 24, fontWeight: 900, color: "#AA2DFF", margin: 0 }}>{title}</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14 }}>
          <div style={{ position: "relative", minHeight: 180, borderRadius: 8, overflow: "hidden" }}>
            <ImageSlotWrapper imageId="album-review-hero" roomId="magazine-spread" className="w-full h-full object-cover" altText={title} />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <span style={{ fontSize: 10, fontWeight: 800, color: "rgba(255,255,255,0.7)" }}>TRACK BREAKDOWN</span>
            {ratings.map((r, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: 4 }}>
                <span style={{ fontSize: 11, color: "#fff" }}>{r.track}</span>
                <span style={{ fontSize: 11, fontWeight: 900, color: "#AA2DFF" }}>{r.score}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Fallback: Modular Editorial Spread
  return (
    <div style={{ display: "grid", gap: 14, color: "#fff", padding: 16, background: "rgba(5,5,16,0.85)", borderRadius: 10, border: `1px solid ${accentColor}44` }}>
      <NativeEditorialBadge label={category} color={accentColor} />
      <h2 style={{ fontSize: 22, fontWeight: 900, color: accentColor, margin: 0 }}>{title}</h2>
      {subtitle && <p style={{ fontSize: 11, color: "rgba(255,255,255,0.8)", margin: 0 }}>{subtitle}</p>}
      <div style={{ position: "relative", width: "100%", height: 180, borderRadius: 8, overflow: "hidden", ...shapeStyle }}>
        <ImageSlotWrapper imageId="default-editorial-hero" roomId="magazine-spread" className="w-full h-full object-cover" altText={title} />
      </div>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <NativeEditorialAction label="EXPLORE ISSUE" href={magazineReaderUrl()} color={accentColor} icon="📖" />
      </div>
    </div>
  );
}
