"use client";

import { ImageSlotWrapper } from '@/components/visual-enforcement/ImageSlotWrapper';

import Link from "next/link";
import { useEffect, useState } from "react";
import { readMagazinePosition, type MagazinePosition } from "@/components/magazine/MagazinePositionStorage";
import { MAGAZINE_ISSUE_1 } from "@/lib/magazine/magazineIssueData";
import WorldTrendingBelt from "@/components/home/WorldTrendingBelt";

const ARTICLE_PREVIEW_IMAGES = [
  "/tmi-curated/mag-20.jpg",
  "/tmi-curated/mag-28.jpg",
  "/tmi-curated/mag-35.jpg",
  "/tmi-curated/mag-42.jpg",
  "/tmi-curated/mag-50.jpg",
  "/tmi-curated/mag-58.jpg",
  "/tmi-curated/mag-66.jpg",
  "/tmi-curated/mag-74.jpg",
  "/tmi-curated/mag-82.jpg",
  "/tmi-curated/mag-20.jpg",
];

const LOBBY_STORIES = [
  {
    title: "CROWN WATCH",
    deck: "Live rank movement across battle rooms and cypher ladders.",
    route: "/articles/news/tmi-season-1-standings-week-16",
    color: "#00FFFF",
  },
  {
    title: "ARTIST SPOTLIGHT",
    deck: "Ray Journey and Nova Cipher lead this week's editorial cover push.",
    route: "/articles/artist/ray-journey-builds-his-empire",
    color: "#FF2DAA",
  },
  {
    title: "SPONSOR RAIL",
    deck: "SoundWave Audio and BeatMarket activate the issue's ad inventory.",
    route: "/articles/sponsor/soundwave-audio-presents-the-beat-vault",
    color: "#FFD700",
  },
  {
    title: "POLL OF THE WEEK",
    deck: "Vote on the next headline face for the cover remix spread.",
    route: "/games/polls",
    color: "#AA2DFF",
  },
];

function CoverCollage() {
  return (
    <div
      style={{
        border: "1px solid rgba(255,255,255,0.16)",
        borderRadius: 16,
        background:
          "linear-gradient(125deg, rgba(0,255,255,0.24) 0%, rgba(255,45,170,0.2) 36%, rgba(255,215,0,0.24) 70%, rgba(170,45,255,0.24) 100%)",
        padding: 14,
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1.6fr 1fr",
          gap: 12,
        }}
      >
        <div style={{ display: "grid", gap: 10 }}>
          <div style={{ position: "relative", borderRadius: 12, overflow: "hidden", border: "2px solid rgba(0,255,255,0.5)" }}>
            <ImageSlotWrapper imageId="img-75tqoo" roomId="runtime-surface" priority="normal" className="w-full h-full object-cover" altText="Content image" containerStyle={{ width: '100%', height: '100%' }} />
            <div
              style={{
                position: "absolute",
                left: 10,
                bottom: 10,
                background: "rgba(5,5,16,0.75)",
                border: "1px solid rgba(255,215,0,0.6)",
                padding: "6px 10px",
                borderRadius: 8,
                fontSize: 11,
                fontWeight: 900,
                letterSpacing: "0.08em",
              }}
            >
              ISSUE OF THE WEEK
            </div>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
              gap: 8,
            }}
          >
            {[
              "/tmi-curated/mag-42.jpg",
              "/tmi-curated/mag-58.jpg",
              "/tmi-curated/mag-66.jpg",
            ].map((src, index) => (
              <div key={src} style={{ borderRadius: 10, overflow: "hidden", border: "1px solid rgba(255,255,255,0.28)" }}>
                <ImageSlotWrapper imageId="img-m4jouh" roomId="runtime-surface" priority="normal" className="w-full h-full object-cover" altText="Content image" containerStyle={{ width: '100%', height: '100%' }} />
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: "grid", gap: 10 }}>
          <Link
            href="/magazine/issue/current"
            style={{
              textDecoration: "none",
              color: "#050510",
              borderRadius: 12,
              padding: "12px 10px",
              background: "#FFD700",
              fontWeight: 900,
              fontSize: 12,
              textAlign: "center",
              letterSpacing: "0.12em",
            }}
          >
            READ ISSUE
          </Link>
          <Link
            href="/artists/ray-journey"
            style={{
              textDecoration: "none",
              color: "#fff",
              borderRadius: 12,
              border: "1px solid rgba(255,45,170,0.6)",
              padding: 10,
              background: "rgba(255,45,170,0.2)",
              fontSize: 11,
              fontWeight: 800,
            }}
          >
            TOP ARTIST: RAY JOURNEY
          </Link>
          <Link
            href="/battles/b1"
            style={{
              textDecoration: "none",
              color: "#fff",
              borderRadius: 12,
              border: "1px solid rgba(0,255,255,0.6)",
              padding: 10,
              background: "rgba(0,255,255,0.17)",
              fontSize: 11,
              fontWeight: 800,
            }}
          >
            LIVE CROWN BATTLE
          </Link>
          <Link
            href="/marketplace"
            style={{
              textDecoration: "none",
              color: "#fff",
              borderRadius: 12,
              border: "1px solid rgba(170,45,255,0.6)",
              padding: 10,
              background: "rgba(170,45,255,0.2)",
              fontSize: 11,
              fontWeight: 800,
            }}
          >
            MARKETPLACE DROP
          </Link>
          <Link
            href="/magazine/archive"
            style={{
              textDecoration: "none",
              color: "#fff",
              borderRadius: 12,
              border: "1px solid rgba(255,255,255,0.35)",
              padding: 10,
              background: "rgba(5,5,16,0.62)",
              fontSize: 11,
              fontWeight: 700,
              textAlign: "center",
            }}
          >
            OPEN ARCHIVE
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function MagazineLandingLobby() {
  const [resume, setResume] = useState<MagazinePosition | null>(null);

  useEffect(() => {
    setResume(readMagazinePosition());
  }, []);

  const preview = MAGAZINE_ISSUE_1;

  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "72px clamp(12px, 4vw, 36px) 28px",
        background:
          "radial-gradient(circle at 10% 10%, rgba(0,255,255,0.18), transparent 42%), radial-gradient(circle at 92% 20%, rgba(255,45,170,0.2), transparent 44%), radial-gradient(circle at 75% 85%, rgba(255,215,0,0.18), transparent 38%), linear-gradient(170deg, #04020d, #0b0620)",
        color: "#fff",
        display: "grid",
        gap: 14,
      }}
    >
      <header
        style={{
          border: "1px solid rgba(255,255,255,0.16)",
          borderRadius: 18,
          padding: "16px clamp(12px, 3vw, 28px)",
          background:
            "linear-gradient(120deg, rgba(0,255,255,0.16), rgba(170,45,255,0.16), rgba(255,45,170,0.16), rgba(255,215,0,0.16))",
          display: "grid",
          gap: 8,
        }}
      >
        <div style={{ fontSize: 10, letterSpacing: "0.4em", fontWeight: 800, color: "#00FFFF" }}>MAGAZINE LOBBY</div>
        <h1 style={{ margin: 0, fontSize: "clamp(26px, 4vw, 46px)", lineHeight: 1.02, fontWeight: 900 }}>
          THE MUSICIAN'S INDEX
        </h1>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <Link
            href="/magazine/issue/current"
            style={{
              textDecoration: "none",
              color: "#050510",
              background: "#00FFFF",
              borderRadius: 10,
              padding: "8px 14px",
              fontWeight: 900,
              fontSize: 11,
              letterSpacing: "0.11em",
            }}
          >
            ENTER MAGAZINE
          </Link>
          {resume && (
            <Link
              href={resume.lastIssue === "current" ? "/magazine/issue/current" : `/magazine/issue/${resume.lastIssue}`}
              style={{
                textDecoration: "none",
                color: "#fff",
                background: "rgba(255,45,170,0.22)",
                border: "1px solid rgba(255,45,170,0.5)",
                borderRadius: 10,
                padding: "8px 14px",
                fontWeight: 800,
                fontSize: 11,
              }}
            >
              RESUME ISSUE · SPREAD {resume.lastSpread + 1}
            </Link>
          )}
          <Link
            href="/home/1"
            style={{
              textDecoration: "none",
              color: "#fff",
              background: "rgba(255,255,255,0.08)",
              border: "1px solid rgba(255,255,255,0.3)",
              borderRadius: 10,
              padding: "8px 14px",
              fontWeight: 700,
              fontSize: 11,
            }}
          >
            BACK TO HOME 1 HERO
          </Link>
        </div>
      </header>

      <CoverCollage />

      <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 10 }}>
        {LOBBY_STORIES.map((tile) => (
          <Link
            key={tile.title}
            href={tile.route}
            style={{
              textDecoration: "none",
              color: "#fff",
              borderRadius: 12,
              padding: 12,
              border: `1px solid ${tile.color}80`,
              background: `linear-gradient(150deg, ${tile.color}26, rgba(5,5,16,0.9))`,
              display: "grid",
              gap: 6,
            }}
          >
            <span style={{ fontSize: 10, letterSpacing: "0.16em", color: tile.color, fontWeight: 900 }}>{tile.title}</span>
            <span style={{ fontSize: 12, lineHeight: 1.4 }}>{tile.deck}</span>
            <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.1em" }}>OPEN TILE →</span>
          </Link>
        ))}
      </section>

      <section
        style={{
          borderRadius: 14,
          border: "1px solid rgba(255,255,255,0.18)",
          background: "rgba(5,5,16,0.66)",
          padding: 12,
          display: "grid",
          gap: 10,
        }}
      >
        <div style={{ fontSize: 10, letterSpacing: "0.3em", color: "#FFD700", fontWeight: 800 }}>TRENDING STORIES</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 10 }}>
          {preview.map((item, idx) => (
            <Link
              key={item.slug}
              href={`/magazine/article/${item.slug}`}
              style={{
                textDecoration: "none",
                color: "#fff",
                borderRadius: 10,
                overflow: "hidden",
                border: "1px solid rgba(255,255,255,0.2)",
                background: "rgba(255,255,255,0.03)",
              }}
            >
              <ImageSlotWrapper imageId="img-0e7t5p" roomId="runtime-surface" priority="normal" className="w-full h-full object-cover" altText="Content image" containerStyle={{ width: '100%', height: '100%' }} />
              <div style={{ padding: 9, display: "grid", gap: 4 }}>
                <span style={{ fontSize: 10, color: item.heroColor, letterSpacing: "0.14em", fontWeight: 900 }}>{item.category.toUpperCase()}</span>
                <span style={{ fontSize: 12, fontWeight: 800, lineHeight: 1.3 }}>{item.title}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Global music culture belt */}
      <WorldTrendingBelt />
    </main>
  );
}
