"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import MagazineShell, { type MagazinePage } from "@/components/magazine/MagazineShell";
import { MAGAZINE_ISSUE_1, type MagazineArticle } from "@/lib/magazine/magazineIssueData";
import { PERFORMER_REGISTRY, type PerformerIdentity } from "@/lib/performers/PerformerRegistry";

// Categories styling mapping
const CATEGORY_LABEL: Record<string, string> = {
  feature:   "FEATURE SPOTLIGHT",
  interview: "EXCLUSIVE INTERVIEW",
  review:    "ALBUM REVIEW",
  news:      "HOT NEWS",
  editorial: "EDITORIAL PERSPECTIVE",
};

const CATEGORY_COLOR: Record<string, string> = {
  feature:   "#FF2DAA",
  interview: "#00FFFF",
  review:    "#AA2DFF",
  news:      "#FFD700",
  editorial: "#00FF88",
};

// ─── 1. ARTIST SPOTLIGHT PAGE ───
function ArtistSpotlightPage({ performer, rank }: { performer: PerformerIdentity; rank: number }) {
  const [following, setFollowing] = useState(false);
  const [saved, setSaved] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  function triggerSave() {
    setSaved(true);
    setToast("📌 Saved to Memory Wall! Added to 'Magazine Spotlights' collection.");
    if (typeof window !== "undefined") {
      const audio = new Audio("/sounds/ui/ui-positive-bell.mp3");
      audio.play().catch(() => {});
    }
    setTimeout(() => setToast(null), 3000);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14, height: "100%", position: "relative" }}>
      {toast && (
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, background: "rgba(0, 255, 136, 0.95)", color: "#050510", padding: "8px 12px", borderRadius: 8, fontSize: 10, fontWeight: 900, textAlign: "center", zIndex: 100, boxShadow: "0 4px 14px rgba(0,255,136,0.4)" }}>
          {toast}
        </div>
      )}

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <span style={{ fontSize: 7, fontWeight: 900, letterSpacing: "0.14em", color: "#FFD700", background: "rgba(255,215,0,0.1)", border: "1px solid rgba(255,215,0,0.24)", borderRadius: 3, padding: "2px 6px" }}>
            RANK #{rank} · ARTIST SPOTLIGHT
          </span>
          <h2 className="tmi-mag-title" style={{ fontSize: "clamp(18px, 3vw, 24px)", fontWeight: 900, margin: "6px 0 2px", color: "#fff" }}>
            {performer.name}
          </h2>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          <button
            onClick={() => setFollowing(!following)}
            style={{
              padding: "4px 10px", fontSize: 8, fontWeight: 800, borderRadius: 6,
              background: following ? "rgba(255,255,255,0.08)" : "#00FFFF",
              border: `1px solid ${following ? "rgba(255,255,255,0.2)" : "#00FFFF"}`,
              color: following ? "#fff" : "#050510",
              cursor: "pointer",
            }}
          >
            {following ? "✓ FOLLOWING" : "+ FOLLOW"}
          </button>
          <button
            onClick={triggerSave}
            style={{
              padding: "4px 8px", fontSize: 8, fontWeight: 800, borderRadius: 6,
              background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.15)",
              color: saved ? "#FFD700" : "#fff", cursor: "pointer",
            }}
            title="Save to Memory Wall"
          >
            {saved ? "⭐ SAVED" : "⭐ SAVE"}
          </button>
        </div>
      </div>

      {/* Polaroid & Info Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1.8fr", gap: 14, flex: 1, alignItems: "center" }}>
        {/* Polaroid frame */}
        <div style={{
          background: "#fff",
          padding: "8px 8px 24px",
          boxShadow: "0 10px 24px rgba(0,0,0,0.6), 2px 2px 0px rgba(0,255,255,0.2)",
          transform: "rotate(-2deg)",
          borderRadius: 2,
        }}>
          <div style={{ position: "relative", width: "100%", aspectRatio: "1/1", background: "#111", overflow: "hidden" }}>
            <Image
              src={performer.profileImageUrl || "/images/tmi-placeholder.jpg"}
              alt={performer.name}
              fill
              sizes="150px"
              style={{ objectFit: "cover" }}
            />
          </div>
          <div style={{ fontFamily: "serif", fontSize: 8, color: "#111", textAlign: "center", marginTop: 8, fontWeight: "bold" }}>
            {performer.name} · {performer.city}
          </div>
        </div>

        {/* Bio & Player Stats */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.1em" }}>
            Platform Stats &amp; XP Info
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <div style={{ flex: 1, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 6, padding: "6px 8px" }}>
              <div style={{ fontSize: 7, color: "rgba(255,255,255,0.35)" }}>FANS</div>
              <div style={{ fontSize: 12, fontWeight: 900, color: "#FF2DAA" }}>{performer.fanCount.toLocaleString()}</div>
            </div>
            <div style={{ flex: 1, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 6, padding: "6px 8px" }}>
              <div style={{ fontSize: 7, color: "rgba(255,255,255,0.35)" }}>XP POINTS</div>
              <div style={{ fontSize: 12, fontWeight: 900, color: "#00FF88" }}>{performer.xp.toLocaleString()}</div>
            </div>
          </div>

          <p className="tmi-mag-paragraph" style={{ margin: 0, fontSize: 10, lineHeight: 1.5, color: "rgba(255,255,255,0.7)" }}>
            {performer.bio || `${performer.name} is a breakout ${performer.category} performer from ${performer.city}, climbing the global rankings on TMI.`}
          </p>

          {/* Waveform graphic */}
          <div style={{ height: 24, display: "flex", alignItems: "flex-end", gap: 2, background: "rgba(0,0,0,0.3)", borderRadius: 4, padding: "4px 8px", border: "1px solid rgba(255,255,255,0.06)" }}>
            {[10, 24, 42, 18, 30, 52, 28, 40, 15, 32, 48, 22, 35, 60, 25, 12, 28].map((val, idx) => (
              <div
                key={idx}
                style={{
                  flex: 1,
                  height: `${val}%`,
                  background: `linear-gradient(to top, #FF2DAA, #00FFFF)`,
                  borderRadius: 1,
                }}
              />
            ))}
          </div>

          <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
            <Link
              href={performer.liveRoomRoute || `/live/rooms/room-${performer.id}`}
              style={{ flex: 1, textDecoration: "none", textAlign: "center", padding: "8px", fontSize: 9, fontWeight: 800, background: "linear-gradient(135deg, #FF2DAA, #AA2DFF)", color: "#fff", borderRadius: 6, boxShadow: "0 2px 10px rgba(255,45,170,0.2)" }}
            >
              🎤 JOIN LIVE ROOM
            </Link>
            <Link
              href={performer.profileRoute || `/performers/${performer.id}`}
              style={{ flex: 1, textDecoration: "none", textAlign: "center", padding: "8px", fontSize: 9, fontWeight: 800, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.15)", color: "#fff", borderRadius: 6 }}
            >
              👤 VIEW PROFILE
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── 2. ARTICLE PAGE ───
function ArticlePage({ article }: { article: MagazineArticle }) {
  const color = CATEGORY_COLOR[article.category] ?? "#00FFFF";
  const [saved, setSaved] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  function triggerSave() {
    setSaved(true);
    setToast("📌 Saved to Memory Wall! Added to 'Editorial & News' collection.");
    if (typeof window !== "undefined") {
      const audio = new Audio("/sounds/ui/ui-positive-bell.mp3");
      audio.play().catch(() => {});
    }
    setTimeout(() => setToast(null), 3000);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14, height: "100%", position: "relative" }}>
      {toast && (
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, background: "rgba(0, 255, 136, 0.95)", color: "#050510", padding: "8px 12px", borderRadius: 8, fontSize: 10, fontWeight: 900, textAlign: "center", zIndex: 100 }}>
          {toast}
        </div>
      )}

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
          <span style={{ fontSize: 36, lineHeight: 1, flexShrink: 0 }}>{article.icon}</span>
          <div>
            <span style={{ fontSize: 7, fontWeight: 900, letterSpacing: "0.14em", color, background: `${color}15`, border: `1px solid ${color}30`, borderRadius: 3, padding: "2px 6px" }}>
              {CATEGORY_LABEL[article.category]}
            </span>
            <div style={{ fontSize: 8, color: "rgba(255,255,255,0.3)", marginTop: 5 }}>
              {article.author} — {article.publishedAt}
            </div>
          </div>
        </div>
        <button
          onClick={triggerSave}
          style={{
            padding: "4px 8px", fontSize: 8, fontWeight: 800, borderRadius: 6,
            background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.15)",
            color: saved ? "#FFD700" : "#fff", cursor: "pointer",
          }}
        >
          {saved ? "★ SAVED TO WALL" : "★ SAVE TO WALL"}
        </button>
      </div>

      <h2 className="tmi-mag-title" style={{ fontSize: "clamp(14px, 2.5vw, 18px)", fontWeight: 900, lineHeight: 1.2, margin: 0, color: "#fff" }}>
        {article.title}
      </h2>

      <p className="tmi-mag-paragraph" style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", lineHeight: 1.5, margin: 0 }}>
        {article.subtitle}
      </p>

      <div className="tmi-mag-cols" style={{ display: "flex", flexDirection: "column", gap: 10, flex: 1 }}>
        {article.blocks.slice(0, 4).map((block, i) => {
          if (block.type === "heading") {
            return (
              <h3 key={i} className="tmi-mag-title" style={{ fontSize: 12, fontWeight: 800, color, margin: "6px 0 2px", lineHeight: 1.3 }}>
                {block.text}
              </h3>
            );
          }
          if (block.type === "pullquote") {
            return (
              <blockquote key={i} className="tmi-mag-pullquote" style={{
                borderLeft: `3px solid ${color}`,
                paddingLeft: 12,
                margin: 0,
                fontStyle: "italic",
                fontSize: 12,
                color: "rgba(255,255,255,0.7)",
                lineHeight: 1.5,
              }}>
                {block.text}
              </blockquote>
            );
          }
          const isFirstPara = i === 0;
          return (
            <p key={i} className={`tmi-mag-paragraph ${isFirstPara ? "tmi-mag-dropcap" : ""}`} style={{ fontSize: 11, color: "rgba(255,255,255,0.55)", lineHeight: 1.65, margin: 0 }}>
              {block.text}
            </p>
          );
        })}
      </div>

      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
        <Link
          href={`/magazine/article/${article.slug}`}
          style={{
            alignSelf: "flex-start",
            fontSize: 8, fontWeight: 800, letterSpacing: "0.12em",
            color, border: `1px solid ${color}40`,
            borderRadius: 6, padding: "6px 14px",
            textDecoration: "none",
          }}
        >
          READ FULL ARTICLE →
        </Link>
        {article.performerSlug && (
          <Link
            href={`/performers/${article.performerSlug}`}
            style={{ fontSize: 8, fontWeight: 800, color: "rgba(255,255,255,0.6)", textDecoration: "underline" }}
          >
            Visit Artist Page
          </Link>
        )}
      </div>
    </div>
  );
}

// ─── 3. RANDOM GAMES & TRIVIA PAGE ───
function GamePage() {
  const [selectedOpt, setSelectedOpt] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const [saved, setSaved] = useState(false);

  const choices = [
    "Wavetek (Houston, TX)",
    "DJ Kraze (Los Angeles, CA)",
    "Astra Nova (London, UK)",
    "Bar God (Chicago, IL)",
  ];

  function triggerChoice(idx: number) {
    if (answered) return;
    setSelectedOpt(idx);
    setAnswered(true);
    if (typeof window !== "undefined") {
      const audio = new Audio("/sounds/ui/ui-positive-bell.mp3");
      audio.play().catch(() => {});
    }
  }

  return (
    <div style={{
      display: "flex", flexDirection: "column", gap: 14, height: "100%",
      background: "radial-gradient(ellipse at 50% 50%, rgba(0, 255, 255, 0.08), transparent)",
      padding: "8px 0",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 8, fontWeight: 900, color: "#00FFFF", border: "1px solid rgba(0,255,255,0.3)", borderRadius: 4, padding: "2px 7px" }}>
          🎮 INTERACTIVE TRIVIA GAME
        </span>
        <button
          onClick={() => setSaved(!saved)}
          style={{
            padding: "4px 8px", fontSize: 8, fontWeight: 800, borderRadius: 6,
            background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.15)",
            color: saved ? "#FFD700" : "#fff", cursor: "pointer",
          }}
        >
          {saved ? "⭐ SAVED" : "⭐ SAVE"}
        </button>
      </div>

      <div>
        <h3 className="tmi-mag-title" style={{ fontSize: 16, color: "#fff", margin: "0 0 6px" }}>
          Trivia Beat Challenge
        </h3>
        <p className="tmi-mag-paragraph" style={{ fontSize: 10, color: "rgba(255,255,255,0.5)", margin: 0 }}>
          Answer correctly to earn +10 extra points instantly in your wallet!
        </p>
      </div>

      <div style={{ background: "rgba(0,0,0,0.3)", border: "1px solid rgba(0,255,255,0.15)", borderRadius: 10, padding: 12 }}>
        <div style={{ fontSize: 11, fontWeight: 800, color: "#00FFFF", marginBottom: 10 }}>
          QUESTION: Which performer holds the highest XP rank in the index as of this issue?
        </div>

        <div style={{ display: "grid", gap: 8 }}>
          {choices.map((choice, idx) => {
            const isCorrect = idx === 1;
            const isSelected = selectedOpt === idx;
            let bg = "rgba(255,255,255,0.02)";
            let border = "1px solid rgba(255,255,255,0.1)";
            let labelColor = "#fff";

            if (answered) {
              if (isCorrect) {
                bg = "rgba(0, 255, 136, 0.12)";
                border = "1px solid #00FF88";
                labelColor = "#00FF88";
              } else if (isSelected) {
                bg = "rgba(230, 48, 0, 0.12)";
                border = "1px solid #E63000";
                labelColor = "#E63000";
              }
            }

            return (
              <button
                key={idx}
                onClick={() => triggerChoice(idx)}
                disabled={answered}
                style={{
                  width: "100%", padding: "10px 12px", borderRadius: 8,
                  background: bg, border, color: labelColor,
                  fontSize: 10, fontWeight: 700, cursor: answered ? "default" : "pointer",
                  textAlign: "left", transition: "all 0.2s",
                }}
              >
                {choice} {answered && isCorrect && " ✓ (Correct +10 pts!)"} {answered && isSelected && !isCorrect && " ✗ (Incorrect)"}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── 4. RANDOM SPONSOR SHOWCASE / BILLBOARD PAGE ───
function SponsorAdPage({ index }: { index: number }) {
  const [playing, setPlaying] = useState(false);
  const [certified, setCertified] = useState(true);

  // Sponsored assets
  const sponsored = [
    {
      title: "PRIMEWAVE AUDIO PRO CONSOLE",
      tagline: "Uncompromised 4K sound quality for stream broadcasting.",
      color: "#00FFFF",
      cta: "VISIT PRIMEWAVE",
    },
    {
      title: "BEATLINK BEATS SYNC MASTER",
      tagline: "License beats instantly with creator royalty integration.",
      color: "#FFD700",
      cta: "BROWSE BEATLINK",
    },
  ][index % 2];

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
      height: "100%",
      background: "radial-gradient(circle at 10% 20%, #111 0%, #050510 90%)",
      border: `1px solid ${sponsored.color}22`,
      padding: "8px 0",
    }}>
      {/* Certification banner */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#00FF88", boxShadow: "0 0 8px #00FF88" }} />
          <span style={{ fontSize: 7, fontWeight: 800, color: "rgba(255,255,255,0.4)", letterSpacing: "0.1em" }}>
            ADSENSE VIDEO CERTIFIED · ACTIVE
          </span>
        </div>
        <span style={{ fontSize: 7, fontWeight: 900, color: sponsored.color, background: `${sponsored.color}15`, border: `1px solid ${sponsored.color}35`, borderRadius: 3, padding: "2px 6px" }}>
          PREMIUM SPONSOR
        </span>
      </div>

      <div style={{ margin: "10px 0" }}>
        <h3 style={{ fontFamily: "'Arial Black', sans-serif", fontSize: "clamp(12px, 2.5vw, 15px)", fontWeight: 900, color: "#fff", letterSpacing: "0.02em", margin: "0 0 4px" }}>
          {sponsored.title}
        </h3>
        <p style={{ fontSize: 9, color: "rgba(255,255,255,0.5)", margin: 0 }}>
          {sponsored.tagline}
        </p>
      </div>

      {/* Video Ad container */}
      <div
        onClick={() => setPlaying(!playing)}
        style={{
          flex: 1,
          borderRadius: 8,
          background: "linear-gradient(135deg, #181824, #0d0d12)",
          border: `1.5px solid ${sponsored.color}33`,
          position: "relative",
          overflow: "hidden",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {playing ? (
          <video
            autoPlay
            loop
            muted
            playsInline
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
            src="https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4"
          />
        ) : (
          <div style={{ textAlign: "center" }}>
            <span style={{ fontSize: 28, display: "block", marginBottom: 6 }}>▶</span>
            <span style={{ fontSize: 8, color: "rgba(255,255,255,0.5)", letterSpacing: "0.1em", fontWeight: 800 }}>
              TAP TO PLAY COMMERCIAL DEMO
            </span>
          </div>
        )}
      </div>

      <div style={{ display: "flex", gap: 10, alignItems: "center", marginTop: 8 }}>
        <Link
          href="/sponsors"
          style={{ flex: 1, textDecoration: "none", textAlign: "center", padding: "8px", fontSize: 9, fontWeight: 800, background: sponsored.color, color: "#050510", borderRadius: 6 }}
        >
          {sponsored.cta} →
        </Link>
        <button
          onClick={() => setCertified(!certified)}
          style={{ fontSize: 8, background: "none", border: "none", color: "rgba(255,255,255,0.3)", cursor: "pointer", textDecoration: "underline" }}
        >
          {certified ? "Cert Stats" : "Verified OK"}
        </button>
      </div>
    </div>
  );
}

// ─── 5. FANS SPOTLIGHT PAGE (Scrapbook Quirky Question layout) ───
interface FanInfo {
  name: string;
  location: string;
  genres: string;
  artists: string;
  tier: string;
  avatarUrl: string;
  question: string;
  answer: string;
}

const FEATURED_FANS: FanInfo[] = [
  {
    name: "Marie D.",
    location: "Paris, France",
    genres: "EDM, Pop",
    artists: "Astra Nova, DJ Kraze",
    tier: "Diamond Member",
    avatarUrl: "/bot-images/Bot image 1.png",
    question: "What song changed your life?",
    answer: "Daft Punk's 'One More Time' in 2007! It completely rewired my brain for electronic music.",
  },
  {
    name: "Marcus K.",
    location: "Chicago, IL",
    genres: "Hip-Hop, Rap",
    artists: "Bar God, Wavetek",
    tier: "Pro Member",
    avatarUrl: "/bot-images/Bot image 2.png",
    question: "Who is your dream collaboration?",
    answer: "Wavetek producing a dark trap beat for Astra Nova, with DJ Kraze scratching on the mix!",
  },
  {
    name: "Yuki S.",
    location: "Tokyo, Japan",
    genres: "R&B, Soul",
    artists: "Lyric Stone",
    tier: "Silver Member",
    avatarUrl: "/bot-images/Bot image 3.png",
    question: "First concert experience?",
    answer: "A tiny jazz club in Shibuya during the Blue Hour event series. The saxophone soloist blew me away.",
  },
];

function FanSpotlightPage() {
  const [saved, setSaved] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  function triggerSave() {
    setSaved(true);
    setToast("📌 Curated Fan Highlights added to your Memory Wall!");
    if (typeof window !== "undefined") {
      const audio = new Audio("/sounds/ui/ui-positive-bell.mp3");
      audio.play().catch(() => {});
    }
    setTimeout(() => setToast(null), 3000);
  }

  return (
    <div style={{
      display: "flex", flexDirection: "column", gap: 12, height: "100%", position: "relative",
      background: "radial-gradient(ellipse at 15% 15%, rgba(255, 45, 170, 0.08), transparent)",
    }}>
      {toast && (
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, background: "rgba(0, 255, 136, 0.95)", color: "#050510", padding: "8px 12px", borderRadius: 8, fontSize: 10, fontWeight: 900, textAlign: "center", zIndex: 100 }}>
          {toast}
        </div>
      )}

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 7, fontWeight: 900, color: "#FF2DAA", border: "1px solid rgba(255,45,170,0.3)", borderRadius: 4, padding: "2px 7px" }}>
          👥 FACES OF TMI · FANS SPOTLIGHT
        </span>
        <button
          onClick={triggerSave}
          style={{
            padding: "4px 8px", fontSize: 8, fontWeight: 800, borderRadius: 6,
            background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.15)",
            color: saved ? "#FFD700" : "#fff", cursor: "pointer",
          }}
        >
          {saved ? "★ SAVED" : "★ SAVE"}
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, flex: 1, alignItems: "stretch" }}>
        {FEATURED_FANS.map((fan, idx) => (
          <div key={idx} style={{
            background: "rgba(255,255,255,0.02)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 12,
            padding: 10,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
            position: "relative",
            boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
          }}>
            {/* Sticker sticker head pin */}
            <div style={{ position: "absolute", top: -6, width: 8, height: 8, borderRadius: "50%", background: "#FF2DAA", border: "2px solid #fff" }} />

            {/* Avatar Circle with colorful sticker border */}
            <div style={{
              width: 48, height: 48, borderRadius: "50%", overflow: "hidden", position: "relative",
              border: `2px solid ${idx === 0 ? "#00FFFF" : idx === 1 ? "#FF2DAA" : "#FFD700"}`,
              marginBottom: 8,
              boxShadow: "0 0 10px rgba(0,0,0,0.5)",
            }}>
              <Image src={fan.avatarUrl} alt={fan.name} fill sizes="48px" style={{ objectFit: "cover" }} />
            </div>

            <div style={{ fontSize: 10, fontWeight: 900, color: "#fff" }}>{fan.name}</div>
            <div style={{ fontSize: 7, color: "rgba(255,255,255,0.4)", marginBottom: 4 }}>{fan.location}</div>

            <div style={{
              fontSize: 6, fontWeight: 900, color: "#050510",
              background: idx === 0 ? "#00FFFF" : idx === 1 ? "#FF2DAA" : "#FFD700",
              borderRadius: 4, padding: "1px 5px", marginBottom: 6,
            }}>
              {fan.tier}
            </div>

            <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", width: "100%" }}>
              {/* Question & Answer speech bubble style */}
              <div style={{
                background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.06)",
                borderRadius: 6, padding: 6, fontSize: 8, color: "rgba(255,255,255,0.82)",
                lineHeight: 1.3, textAlign: "left",
              }}>
                <div style={{ color: "#FF2DAA", fontWeight: 800, fontSize: 7, marginBottom: 2 }}>
                  Q: {fan.question}
                </div>
                <div>&ldquo;{fan.answer}&rdquo;</div>
              </div>
            </div>

            <div style={{ fontSize: 7, color: "rgba(255,255,255,0.3)", marginTop: 6, borderTop: "1px solid rgba(255,255,255,0.04)", width: "100%", paddingTop: 4 }}>
              Fave: {fan.artists}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── 6. CONCERT PHOTOS & RECAPS GALLERY ───
function ConcertPhotosPage() {
  const [liked, setLiked] = useState(false);

  return (
    <div style={{
      display: "flex", flexDirection: "column", gap: 12, height: "100%",
      background: "radial-gradient(ellipse at 80% 80%, rgba(170, 45, 255, 0.08), transparent)",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 7, fontWeight: 900, color: "#AA2DFF", border: "1px solid rgba(170,45,255,0.3)", borderRadius: 4, padding: "2px 7px" }}>
          📸 CONCERT GALLERY · MONDAY STAGE
        </span>
        <button
          onClick={() => setLiked(!liked)}
          style={{
            padding: "4px 10px", fontSize: 8, fontWeight: 800, borderRadius: 6,
            background: liked ? "#FF2DAA" : "rgba(255,255,255,0.05)",
            border: `1px solid ${liked ? "#FF2DAA" : "rgba(255,255,255,0.15)"}`,
            color: "#fff", cursor: "pointer",
          }}
        >
          {liked ? "♥ LIKED" : "♥ LIKE"}
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: 14, flex: 1, alignItems: "center" }}>
        {/* Scrapbook layered Polaroid cards */}
        <div style={{ position: "relative", height: 180, width: "100%" }}>
          {/* Card 1: Crowd */}
          <div style={{
            position: "absolute", left: 0, top: 10, width: 110, background: "#fff",
            padding: "6px 6px 16px", borderRadius: 2, transform: "rotate(-6deg)",
            boxShadow: "0 6px 14px rgba(0,0,0,0.5)", zIndex: 10,
          }}>
            {/* Sticky tape visual effect */}
            <div style={{ position: "absolute", top: -8, left: 30, width: 34, height: 12, background: "rgba(255,215,0,0.35)", transform: "rotate(4deg)" }} />
            <div style={{ position: "relative", width: "100%", height: 74, background: "#222" }}>
              <div style={{ width: "100%", height: "100%", background: "linear-gradient(135deg, #1f083a, #aa2dff)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>🔥</div>
            </div>
            <div style={{ fontSize: 6, color: "#111", fontWeight: "bold", textAlign: "center", marginTop: 4 }}>
              Monday Night Cypher Crowd
            </div>
          </div>

          {/* Card 2: Performer live */}
          <div style={{
            position: "absolute", right: 0, top: 24, width: 100, background: "#fff",
            padding: "6px 6px 16px", borderRadius: 2, transform: "rotate(5deg)",
            boxShadow: "0 6px 14px rgba(0,0,0,0.5)", zIndex: 12,
          }}>
            <div style={{ position: "absolute", top: -8, right: 24, width: 34, height: 12, background: "rgba(255,215,0,0.35)", transform: "rotate(-5deg)" }} />
            <div style={{ position: "relative", width: "100%", height: 70, background: "#222" }}>
              <div style={{ width: "100%", height: "100%", background: "linear-gradient(135deg, #021a22, #00ffff)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>🎤</div>
            </div>
            <div style={{ fontSize: 6, color: "#111", fontWeight: "bold", textAlign: "center", marginTop: 4 }}>
              Wavetek Live at Arena
            </div>
          </div>
        </div>

        {/* Live Recap Details */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{ fontSize: 8, letterSpacing: "0.08em", color: "#AA2DFF", fontWeight: 800 }}>
            LIVE RECAP STATISTICS
          </div>
          <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 8, padding: "8px 10px" }}>
            <div style={{ fontSize: 7, color: "rgba(255,255,255,0.4)" }}>AUDIENCE SIZE</div>
            <div style={{ fontSize: 14, fontWeight: 900, color: "#fff", letterSpacing: "0.02em" }}>18,410 Members</div>
            <div style={{ fontSize: 7, color: "#00FF88", marginTop: 2 }}>✓ High Attendance Record</div>
          </div>

          <p className="tmi-mag-paragraph" style={{ margin: 0, fontSize: 9.5, lineHeight: 1.4, color: "rgba(255,255,255,0.6)" }}>
            The Arena reached maximum capacity within 8 minutes of go-live. Fans from over 22 countries tuned in to support.
          </p>

          <Link href="/events" style={{ textDecoration: "none", textAlign: "center", padding: "8px", fontSize: 9, fontWeight: 800, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.15)", color: "#AA2DFF", borderRadius: 6 }}>
            📅 BROWSE UPCOMING SHOWS
          </Link>
        </div>
      </div>
    </div>
  );
}

// ─── 7. COVER PAGE ───
function CoverPage({ issue }: { issue: string }) {
  const featured = MAGAZINE_ISSUE_1.slice(0, 3);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20, padding: "8px 0", height: "100%" }}>
      <div style={{ textAlign: "center", padding: "20px 0 16px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ fontSize: 7, letterSpacing: "0.5em", color: "#FF2DAA", fontWeight: 800, marginBottom: 10 }}>
          BERNTOUTGLOBAL XXL PRESENTS
        </div>
        <h1 style={{ fontSize: "clamp(22px, 4vw, 36px)", fontWeight: 900, letterSpacing: -1, lineHeight: 1, margin: "0 0 6px" }}>
          THE MUSICIAN&apos;S<br />INDEX
        </h1>
        <div style={{ fontSize: 9, letterSpacing: "0.25em", color: "rgba(255,255,255,0.4)", marginBottom: 14 }}>
          ISSUE {issue} — APRIL 2026
        </div>
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          background: "linear-gradient(135deg, rgba(255,45,170,0.15), rgba(170,45,255,0.15))",
          border: "1px solid rgba(255,45,170,0.3)", borderRadius: 8, padding: "8px 18px",
        }}>
          <span style={{ fontSize: 18 }}>👑</span>
          <span style={{ fontSize: 12, fontWeight: 900, color: "#fff", letterSpacing: "0.08em" }}>CROWN SEASON</span>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10, flex: 1 }}>
        <div style={{ fontSize: 7, letterSpacing: "0.2em", color: "rgba(255,255,255,0.3)", fontWeight: 800 }}>
          IN THIS ISSUE
        </div>
        {featured.map((a, i) => (
          <div key={a.slug} style={{
            display: "flex", gap: 10, alignItems: "center",
            padding: "10px 12px",
            background: "rgba(255,255,255,0.02)",
            border: "1px solid rgba(255,255,255,0.05)", borderRadius: 8,
          }}>
            <span style={{ fontSize: 20, flexShrink: 0 }}>{a.icon}</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#fff", lineHeight: 1.2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{a.title}</div>
              <div style={{ fontSize: 8, color: "rgba(255,255,255,0.3)", marginTop: 3 }}>{a.author}</div>
            </div>
            <span style={{ fontSize: 9, fontWeight: 900, color: "rgba(255,255,255,0.2)", flexShrink: 0 }}>p.{i + 3}</span>
          </div>
        ))}
      </div>

      <div style={{ textAlign: "center", paddingTop: 12, borderTop: "1px solid rgba(255,255,255,0.05)", display: "flex", flexDirection: "column", gap: 6 }}>
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 6, justifyContent: "center",
          background: "rgba(0,255,136,0.08)", border: "1px solid rgba(0,255,136,0.2)",
          borderRadius: 20, padding: "5px 14px",
        }}>
          <span style={{ fontSize: 12 }}>⭐</span>
          <span style={{ fontSize: 8, fontWeight: 900, color: "#00FF88", letterSpacing: "0.06em" }}>
            +20 XP per page you read · use points in the store &amp; contests
          </span>
        </div>
        <div style={{ fontSize: 8, color: "rgba(255,255,255,0.2)", letterSpacing: "0.15em" }}>
          USE ARROW KEYS OR SWIPE TO TURN PAGES
        </div>
      </div>
    </div>
  );
}

// ─── 8. TABLE OF CONTENTS ───
function TocPage() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ fontSize: 7, letterSpacing: "0.3em", color: "#00FFFF", fontWeight: 800, marginBottom: 4 }}>CONTENTS</div>
      <h2 style={{ fontSize: 20, fontWeight: 900, margin: 0, lineHeight: 1 }}>Issue 1<br /><span style={{ fontSize: 11, fontWeight: 500, color: "rgba(255,255,255,0.4)" }}>April 2026</span></h2>
      <div style={{ display: "flex", flexDirection: "column", gap: 3, marginTop: 4 }}>
        {MAGAZINE_ISSUE_1.map((a, i) => {
          const color = CATEGORY_COLOR[a.category] ?? "#00FFFF";
          return (
            <div key={a.slug} style={{
              display: "flex", gap: 10, alignItems: "center",
              padding: "7px 0", borderBottom: "1px solid rgba(255,255,255,0.04)",
            }}>
              <span style={{ fontSize: 9, fontWeight: 900, color: "rgba(255,255,255,0.2)", minWidth: 18 }}>{String(i + 1).padStart(2, "0")}</span>
              <span style={{ fontSize: 11, color: "#fff", flex: 1, lineHeight: 1.3 }}>{a.title}</span>
              <span style={{ fontSize: 7, fontWeight: 700, color, background: `${color}12`, border: `1px solid ${color}25`, borderRadius: 3, padding: "1px 5px", flexShrink: 0 }}>
                {CATEGORY_LABEL[a.category]}
              </span>
              <span style={{ fontSize: 9, color: "rgba(255,255,255,0.2)", flexShrink: 0 }}>p.{i + 3}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── 9. BACK COVER ───
function BackCover() {
  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      gap: 20, textAlign: "center", padding: "20px 16px", height: "100%",
    }}>
      <div>
        <div style={{ fontSize: 7, letterSpacing: "0.5em", color: "#FF2DAA", fontWeight: 800, marginBottom: 10 }}>BERNTOUTGLOBAL XXL</div>
        <h2 style={{ fontSize: 28, fontWeight: 900, margin: "0 0 6px", letterSpacing: -1 }}>THE MUSICIAN&apos;S<br />INDEX</h2>
        <div style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", letterSpacing: "0.2em" }}>NEXT ISSUE — MAY 2026</div>
      </div>
      <div style={{ fontSize: 48 }}>🔲</div>
      <div style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", letterSpacing: "0.12em" }}>SCAN TO SUBSCRIBE</div>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center" }}>
        <Link href="/magazine" style={{ fontSize: 9, fontWeight: 700, color: "#00FFFF", border: "1px solid rgba(0,255,255,0.3)", borderRadius: 6, padding: "7px 16px", textDecoration: "none" }}>
          ALL ISSUES
        </Link>
        <Link href="/home/1" style={{ fontSize: 9, fontWeight: 700, color: "#FF2DAA", border: "1px solid rgba(255,45,170,0.3)", borderRadius: 6, padding: "7px 16px", textDecoration: "none" }}>
          PLATFORM HOME
        </Link>
      </div>
    </div>
  );
}

// ─── DYNAMIC LOOPING SEQUENCE ENGINE ───
// Sequence: Cover -> TOC -> [Performer -> News -> Random Page (Quiz/Ad/Fans/Photos)] -> Back Cover
function buildPages(issue: string): MagazinePage[] {
  const articles = MAGAZINE_ISSUE_1;
  const sortedPerformers = [...PERFORMER_REGISTRY].sort((a, b) => b.xp - a.xp);

  const pages: MagazinePage[] = [
    // 0 — Cover
    {
      id: "cover",
      title: "Cover",
      type: "cover",
      content: <CoverPage issue={issue} />,
    },
    // 1 — TOC
    {
      id: "toc",
      title: "Contents",
      type: "editorial",
      content: <TocPage />,
    },
  ];

  // Sequence loops (Generate structured content spreads)
  const maxLoops = 6;
  for (let i = 0; i < maxLoops; i++) {
    const performer = sortedPerformers[i % sortedPerformers.length]!;
    const article = articles[i % articles.length]!;

    // 1. Performer Spotlight
    pages.push({
      id: `performer-${performer.id}-${i}`,
      title: performer.name,
      type: "article",
      content: <ArtistSpotlightPage performer={performer} rank={i + 1} />,
      audioText: `${performer.name}. From ${performer.city}. Ranked number ${i + 1} in the index. Category ${performer.category}. Fans: ${performer.fanCount.toLocaleString()}. ${performer.bio || ""}`,
    });

    // 2. News Article Page
    pages.push({
      id: `article-${article.slug}-${i}`,
      title: article.title,
      type: article.category === "interview" ? "interview" : "article",
      content: <ArticlePage article={article} />,
      audioText: `${article.title}. Written by ${article.author}. ${article.subtitle}. ${article.blocks.filter(b => b.type === "paragraph" || b.type === "pullquote").map(b => b.text).join(". ")}`,
    });

    // 3. Random Discovery Page (Game / Ad / Fans Spotlight / Concert Photos)
    const discoveryType = i % 4;
    if (discoveryType === 0) {
      pages.push({
        id: `game-${i}`,
        title: "Trivia Beat Challenge",
        type: "chart",
        content: <GamePage />,
        audioText: "Trivia Beat Challenge. Answer correctly to earn +10 extra points instantly in your wallet.",
      });
    } else if (discoveryType === 1) {
      pages.push({
        id: `sponsor-${i}`,
        title: "Premium Sponsor Showcase",
        type: "sponsor",
        content: <SponsorAdPage index={i} />,
        audioText: `Premium Sponsor Showcase. Powered by TMI AdSense Video. tap to play commercial video.`,
      });
    } else if (discoveryType === 2) {
      pages.push({
        id: `fans-${i}`,
        title: "Faces of TMI Spotlight",
        type: "interview",
        content: <FanSpotlightPage />,
        audioText: "Faces of T.M.I Spotlight. Meet our top community members answering our Question of the Issue.",
      });
    } else {
      pages.push({
        id: `photos-${i}`,
        title: "Monday Stage Concert Recap",
        type: "chart",
        content: <ConcertPhotosPage />,
        audioText: "Monday Stage Concert Recap. Take a look at recent crowd highlights and backstage images.",
      });
    }
  }

  // Back cover
  pages.push({
    id: "back-cover",
    title: "Back Cover",
    type: "cover",
    content: <BackCover />,
  });

  return pages;
}

export default function MagazineIssuePage({ params }: { params: { issue: string } }) {
  const pages = buildPages(params.issue);
  return <MagazineShell pages={pages} issue={params.issue} issueTitle="The Musician's Index" />;
}
