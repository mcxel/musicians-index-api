"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { motion } from "framer-motion";
import MagazinePaperTexture from "@/components/magazine/MagazinePaperTexture";

// ── Seed data ─────────────────────────────────────────────────────────────────

const ORBIT_ARTISTS = [
  { rank: 2,  initials: "KR", color: "#00FFFF", label: "Krypt" },
  { rank: 3,  initials: "ZB", color: "#00FF88", label: "Zuri Bloom" },
  { rank: 4,  initials: "NV", color: "#AA2DFF", label: "Neon Vibe" },
  { rank: 5,  initials: "BJ", color: "#FFD700", label: "B.J.M" },
  { rank: 6,  initials: "OL", color: "#FF6B35", label: "Onyx Lyric" },
  { rank: 7,  initials: "RJ", color: "#00FFFF", label: "Ray Journey" },
  { rank: 8,  initials: "KD", color: "#FF2DAA", label: "Kai Drift" },
  { rank: 9,  initials: "VL", color: "#AA2DFF", label: "Velvet Lane" },
  { rank: 10, initials: "CH", color: "#FFD700", label: "Circuit Halo" },
];

const GENRES = ["Hip-Hop", "Afrobeats", "Electronic", "R&B", "Battle Rap", "Drill", "Pop", "Jazz"];

const NAV_ARTIFACTS = [
  { label: "Read Magazine", href: "/home/1-2",        accent: "#00FFFF" },
  { label: "Live World",    href: "/lobbies/live-world", accent: "#FF2DAA" },
  { label: "Play Games",   href: "/cypher",            accent: "#AA2DFF" },
  { label: "Marketplace",  href: "/shop",              accent: "#FFD700" },
  { label: "About Us",     href: "/about",             accent: "rgba(255,255,255,0.55)" },
];

// ── Layer 2: Animated neon underlay ──────────────────────────────────────────

function CoverUnderlay() {
  return (
    <div
      aria-hidden="true"
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 1,
        background: "#04020a",
        overflow: "hidden",
      }}
    >
      {/* Base deep-space gradient */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse 80% 60% at 50% 20%, rgba(0,255,255,0.07) 0%, transparent 70%)," +
            "radial-gradient(ellipse 60% 80% at 20% 80%, rgba(255,45,170,0.07) 0%, transparent 60%)," +
            "radial-gradient(ellipse 50% 50% at 80% 50%, rgba(170,45,255,0.05) 0%, transparent 60%)," +
            "linear-gradient(160deg, #08040f 0%, #020614 50%, #0a0516 100%)",
        }}
      />

      {/* Animated pulse glow — cyan */}
      <motion.div
        animate={{ opacity: [0.12, 0.28, 0.12], scale: [1, 1.08, 1] }}
        transition={{ duration: 4.2, repeat: Infinity, ease: "easeInOut" }}
        style={{
          position: "absolute",
          top: "10%",
          left: "50%",
          width: 340,
          height: 340,
          borderRadius: "50%",
          transform: "translateX(-50%)",
          background: "radial-gradient(circle, rgba(0,255,255,0.18) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      {/* Animated pulse glow — fuchsia */}
      <motion.div
        animate={{ opacity: [0.08, 0.22, 0.08], scale: [1.05, 1, 1.05] }}
        transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut", delay: 1.2 }}
        style={{
          position: "absolute",
          bottom: "15%",
          left: "30%",
          width: 280,
          height: 280,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(255,45,170,0.16) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      {/* Geometric shards — top-right */}
      <div
        style={{
          position: "absolute",
          top: 48,
          right: 24,
          width: 90,
          height: 90,
          opacity: 0.06,
          border: "1px solid #00FFFF",
          transform: "rotate(22deg)",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: 72,
          right: 40,
          width: 56,
          height: 56,
          opacity: 0.05,
          border: "1px solid #FF2DAA",
          transform: "rotate(44deg)",
        }}
      />

      {/* Geometric shards — bottom-left */}
      <div
        style={{
          position: "absolute",
          bottom: 110,
          left: 16,
          width: 70,
          height: 70,
          opacity: 0.05,
          border: "1px solid #AA2DFF",
          transform: "rotate(-18deg)",
        }}
      />

      {/* Scan-line texture */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,255,255,0.012) 3px, rgba(0,255,255,0.012) 4px)",
          pointerEvents: "none",
        }}
      />

      {/* Genre color band — bottom pulse */}
      <motion.div
        animate={{ opacity: [0.04, 0.09, 0.04] }}
        transition={{ duration: 3.8, repeat: Infinity, ease: "easeInOut", delay: 0.7 }}
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: 180,
          background:
            "linear-gradient(0deg, rgba(255,215,0,0.06) 0%, rgba(255,45,170,0.04) 40%, transparent 100%)",
          pointerEvents: "none",
        }}
      />
    </div>
  );
}

// ── Layer 2 top: paper texture + vignette ─────────────────────────────────────

function CoverVignette() {
  return (
    <>
      <MagazinePaperTexture intensity={0.18} tone="neutral" />
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 3,
          pointerEvents: "none",
          borderRadius: 14,
          background:
            "linear-gradient(180deg, rgba(4,2,10,0.65) 0%, rgba(4,2,10,0.04) 30%, rgba(4,2,10,0.18) 60%, rgba(4,2,10,0.94) 100%)",
        }}
      />
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 4,
          pointerEvents: "none",
          borderRadius: 14,
          boxShadow:
            "inset 0 0 60px rgba(0,255,255,0.04), inset 0 0 120px rgba(255,45,170,0.03)",
        }}
      />
    </>
  );
}

// ── Layer 3: Masthead ─────────────────────────────────────────────────────────

function CoverMasthead() {
  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 10,
        padding: "18px 22px 0",
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
      }}
    >
      <div>
        <div
          style={{
            fontSize: 9,
            fontWeight: 900,
            letterSpacing: "0.32em",
            textTransform: "uppercase",
            color: "#00FFFF",
            textShadow: "0 0 12px rgba(0,255,255,0.7)",
            marginBottom: 3,
          }}
        >
          THE MUSICIAN&apos;S INDEX
        </div>
        <div
          style={{
            fontSize: 34,
            fontWeight: 900,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "#fff",
            lineHeight: 1,
            textShadow: "0 2px 24px rgba(0,0,0,0.9)",
          }}
        >
          TMI
        </div>
      </div>

      <motion.div
        animate={{ opacity: [1, 0.55, 1] }}
        transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 5,
          padding: "3px 10px",
          borderRadius: 999,
          border: "1px solid rgba(0,255,255,0.4)",
          background: "rgba(0,255,255,0.09)",
          marginTop: 4,
        }}
      >
        <span
          style={{
            width: 5,
            height: 5,
            borderRadius: "50%",
            background: "#00FFFF",
            boxShadow: "0 0 6px #00FFFF",
            flexShrink: 0,
          }}
        />
        <span
          style={{
            fontSize: 8,
            fontWeight: 900,
            letterSpacing: "0.2em",
            color: "#00FFFF",
            textTransform: "uppercase",
          }}
        >
          ISSUE 01
        </span>
      </motion.div>
    </div>
  );
}

// ── Layer 3: Crown center — #1 artist ─────────────────────────────────────────

function CoverCrownCenter() {
  return (
    <div
      style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        zIndex: 8,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 5,
        pointerEvents: "none",
      }}
    >
      <motion.div
        animate={{
          filter: [
            "drop-shadow(0 0 8px #FFD700)",
            "drop-shadow(0 0 26px #FFD700) drop-shadow(0 0 52px #FFD70055)",
            "drop-shadow(0 0 8px #FFD700)",
          ],
        }}
        transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
        style={{ fontSize: 40, lineHeight: 1 }}
      >
        👑
      </motion.div>

      <div
        style={{
          fontSize: 9,
          fontWeight: 900,
          letterSpacing: "0.24em",
          textTransform: "uppercase",
          color: "#FFD700",
          textShadow: "0 0 12px rgba(255,215,0,0.65)",
        }}
      >
        #1 THIS WEEK
      </div>

      {/* Winner name card */}
      <motion.div
        animate={{ boxShadow: ["0 0 14px rgba(255,45,170,0.35)", "0 0 32px rgba(255,45,170,0.55)", "0 0 14px rgba(255,45,170,0.35)"] }}
        transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
        style={{
          padding: "6px 18px",
          borderRadius: 8,
          border: "1px solid rgba(255,45,170,0.38)",
          background: "rgba(255,45,170,0.08)",
        }}
      >
        <div
          style={{
            fontSize: 16,
            fontWeight: 900,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "#fff",
            textShadow: "0 0 22px rgba(255,45,170,0.55)",
          }}
        >
          WAVETEK
        </div>
      </motion.div>
    </div>
  );
}

// ── Layer 3: Orbit ring — ranks 2–10 ─────────────────────────────────────────

function OrbitRing() {
  const count = ORBIT_ARTISTS.length;
  const r = 118;

  return (
    <div
      aria-hidden="true"
      style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        width: 0,
        height: 0,
        zIndex: 7,
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          position: "absolute",
          width: r * 2,
          height: r * 2,
          borderRadius: "50%",
          border: "1px solid rgba(0,255,255,0.08)",
          transform: `translate(-${r}px, -${r}px)`,
        }}
      />

      {ORBIT_ARTISTS.map((a, i) => {
        const angle = (360 / count) * i - 90;
        const rad   = (angle * Math.PI) / 180;
        const x     = Math.cos(rad) * r;
        const y     = Math.sin(rad) * r;

        return (
          <motion.div
            key={a.rank}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.28 + i * 0.07, duration: 0.38, ease: "easeOut" }}
            style={{
              position: "absolute",
              width: 34,
              height: 34,
              borderRadius: "50%",
              border: `1.5px solid ${a.color}55`,
              background: `${a.color}12`,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              transform: `translate(calc(${x}px - 17px), calc(${y}px - 17px))`,
              boxShadow: `0 0 10px ${a.color}28`,
            }}
          >
            <span style={{ fontSize: 8, fontWeight: 900, color: a.color, letterSpacing: "0.04em" }}>
              {a.initials}
            </span>
            <span style={{ fontSize: 6, fontWeight: 800, color: "rgba(255,255,255,0.3)", letterSpacing: "0.08em" }}>
              #{a.rank}
            </span>
          </motion.div>
        );
      })}
    </div>
  );
}

// ── Layer 3: Genre burst ──────────────────────────────────────────────────────

function GenreBurst() {
  return (
    <div
      aria-hidden="true"
      style={{
        position: "absolute",
        bottom: 138,
        left: 0,
        right: 0,
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "center",
        gap: 5,
        padding: "0 22px",
        zIndex: 9,
        pointerEvents: "none",
      }}
    >
      {GENRES.map((genre, i) => (
        <motion.span
          key={genre}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55 + i * 0.055, duration: 0.32 }}
          style={{
            fontSize: 7,
            fontWeight: 800,
            letterSpacing: "0.13em",
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.48)",
            border: "1px solid rgba(255,255,255,0.09)",
            borderRadius: 999,
            padding: "2px 8px",
            background: "rgba(255,255,255,0.03)",
          }}
        >
          {genre}
        </motion.span>
      ))}
    </div>
  );
}

// ── Layer 4: Nav artifact buttons ─────────────────────────────────────────────

function CoverNavArtifacts() {
  return (
    <div
      style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 10,
        padding: "0 18px 22px",
      }}
    >
      <div
        style={{
          fontSize: 11,
          fontWeight: 900,
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          color: "#FF2DAA",
          textShadow: "0 0 14px rgba(255,45,170,0.6)",
          marginBottom: 8,
        }}
      >
        Battle Season 1 · Crown Duel
      </div>

      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {NAV_ARTIFACTS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            style={{
              flex: item.label === "Read Magazine" ? "1 1 auto" : "0 0 auto",
              textAlign: "center",
              textDecoration: "none",
              padding: "9px 12px",
              borderRadius: 9,
              border: `1px solid ${item.accent}55`,
              color: item.accent,
              fontSize: 9,
              fontWeight: 900,
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              background: `${item.accent === "rgba(255,255,255,0.55)" ? "rgba(255,255,255,0.04)" : item.accent + "0f"}`,
              boxShadow: item.label === "Read Magazine" ? `0 0 18px ${item.accent}22` : undefined,
              whiteSpace: "nowrap",
            }}
          >
            {item.label === "Read Magazine" && "▶ "}
            {item.label}
          </Link>
        ))}
      </div>
    </div>
  );
}

// ── Layer 5: Status overlays ──────────────────────────────────────────────────

function CoverStatusOverlays() {
  return (
    <>
      {/* Voting Live badge — top-left below masthead */}
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.9, duration: 0.38 }}
        style={{
          position: "absolute",
          top: 74,
          left: 22,
          zIndex: 12,
          display: "flex",
          alignItems: "center",
          gap: 5,
          padding: "3px 10px",
          borderRadius: 999,
          border: "1px solid rgba(255,45,170,0.5)",
          background: "rgba(255,45,170,0.1)",
        }}
      >
        <motion.span
          animate={{ opacity: [1, 0.3, 1] }}
          transition={{ duration: 1.1, repeat: Infinity, ease: "easeInOut" }}
          style={{
            width: 5,
            height: 5,
            borderRadius: "50%",
            background: "#FF2DAA",
            boxShadow: "0 0 6px #FF2DAA",
            flexShrink: 0,
          }}
        />
        <span
          style={{
            fontSize: 7,
            fontWeight: 900,
            letterSpacing: "0.18em",
            color: "#FF2DAA",
            textTransform: "uppercase",
          }}
        >
          Voting Live
        </span>
      </motion.div>

      {/* Crown Updating badge */}
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 1.1, duration: 0.38 }}
        style={{
          position: "absolute",
          top: 100,
          left: 22,
          zIndex: 12,
          display: "flex",
          alignItems: "center",
          gap: 5,
          padding: "3px 10px",
          borderRadius: 999,
          border: "1px solid rgba(255,215,0,0.4)",
          background: "rgba(255,215,0,0.07)",
        }}
      >
        <span style={{ fontSize: 8 }}>👑</span>
        <span
          style={{
            fontSize: 7,
            fontWeight: 900,
            letterSpacing: "0.16em",
            color: "#FFD700",
            textTransform: "uppercase",
          }}
        >
          Crown Updating
        </span>
      </motion.div>

      {/* Trending indicator — top-right below issue badge */}
      <motion.div
        initial={{ opacity: 0, x: 10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 1.3, duration: 0.38 }}
        style={{
          position: "absolute",
          top: 74,
          right: 18,
          zIndex: 12,
          display: "flex",
          alignItems: "center",
          gap: 5,
          padding: "3px 10px",
          borderRadius: 999,
          border: "1px solid rgba(170,45,255,0.4)",
          background: "rgba(170,45,255,0.08)",
        }}
      >
        <span
          style={{
            fontSize: 7,
            fontWeight: 900,
            letterSpacing: "0.16em",
            color: "#AA2DFF",
            textTransform: "uppercase",
          }}
        >
          ↑ Trending
        </span>
      </motion.div>

      {/* Genre Battle — center-right */}
      <motion.div
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1.5, duration: 0.38, ease: "easeOut" }}
        style={{
          position: "absolute",
          top: "50%",
          right: 14,
          transform: "translateY(-50%)",
          zIndex: 12,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 3,
          padding: "8px 10px",
          borderRadius: 10,
          border: "1px solid rgba(0,255,136,0.3)",
          background: "rgba(0,255,136,0.06)",
        }}
      >
        <span style={{ fontSize: 7, fontWeight: 900, letterSpacing: "0.18em", color: "#00FF88", textTransform: "uppercase" }}>
          Genre
        </span>
        <span style={{ fontSize: 7, fontWeight: 900, letterSpacing: "0.18em", color: "#00FF88", textTransform: "uppercase" }}>
          Battle
        </span>
        <span style={{ fontSize: 14, lineHeight: 1 }}>⚔️</span>
      </motion.div>
    </>
  );
}

// ── Page-turn flash overlay ───────────────────────────────────────────────────

function PageTurnFlash() {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        zIndex: 30,
        overflow: "hidden",
      }}
    >
      <motion.div
        initial={{ rotateY: 0, opacity: 1 }}
        animate={{ rotateY: -92, opacity: 0.08 }}
        transition={{ duration: 0.54, ease: [0.34, 1, 0.64, 1] }}
        style={{
          position: "absolute",
          inset: 0,
          transformOrigin: "left center",
          background: "linear-gradient(100deg, rgba(245,238,220,0.92), rgba(208,190,160,0.72))",
          borderRadius: 14,
          boxShadow: "0 20px 50px rgba(0,0,0,0.42)",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "radial-gradient(circle at 80% 50%, rgba(0,0,0,0.32), transparent 52%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(120deg, transparent 34%, rgba(255,255,255,0.22) 50%, transparent 68%)",
          }}
        />
      </motion.div>
    </div>
  );
}

// ── Main artifact ─────────────────────────────────────────────────────────────

type HomePageCoverArtifactProps = {
  onRequestOpen?: () => void;
};

export default function HomePageCoverArtifact({ onRequestOpen }: HomePageCoverArtifactProps) {
  const router = useRouter();
  const [openingCover, setOpeningCover] = useState(false);

  const onOpenMagazine = (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    if (onRequestOpen) { onRequestOpen(); return; }
    if (openingCover) return;
    setOpeningCover(true);
    window.setTimeout(() => router.push("/home/1-2"), 540);
  };

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        borderRadius: 14,
      }}
    >
      {/* Layer 2: Animated neon underlay */}
      <CoverUnderlay />

      {/* Layer 2 top: vignette + paper texture */}
      <CoverVignette />

      {/* Layer 3: Live content — masthead */}
      <CoverMasthead />

      {/* Layer 3: Live content — orbit ring */}
      <OrbitRing />

      {/* Layer 3: Live content — crown center #1 winner */}
      <CoverCrownCenter />

      {/* Layer 3: Live content — genre burst tags */}
      <GenreBurst />

      {/* Layer 4: Nav artifact buttons (Read Magazine is the primary open trigger) */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 10,
          padding: "0 18px 22px",
        }}
      >
        <div
          style={{
            fontSize: 11,
            fontWeight: 900,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "#FF2DAA",
            textShadow: "0 0 14px rgba(255,45,170,0.6)",
            marginBottom: 8,
          }}
        >
          Battle Season 1 · Crown Duel
        </div>

        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          <Link
            onClick={onOpenMagazine}
            href="/home/1-2"
            style={{
              flex: "1 1 auto",
              textAlign: "center",
              textDecoration: "none",
              padding: "10px 14px",
              borderRadius: 10,
              border: "1px solid rgba(0,255,255,0.5)",
              color: "#00FFFF",
              fontSize: 10,
              fontWeight: 900,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              background: "rgba(0,255,255,0.09)",
              boxShadow: "0 0 18px rgba(0,255,255,0.15)",
            }}
          >
            ▶ Open Magazine
          </Link>

          {NAV_ARTIFACTS.slice(1).map((item) => (
            <Link
              key={item.href}
              href={item.href}
              style={{
                textDecoration: "none",
                padding: "10px 11px",
                borderRadius: 10,
                border: `1px solid ${item.accent}44`,
                color: item.accent,
                fontSize: 9,
                fontWeight: 900,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                background: `rgba(255,255,255,0.04)`,
                whiteSpace: "nowrap",
              }}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Layer 5: Status overlays */}
      <CoverStatusOverlays />

      {/* Page-turn flash on open */}
      {openingCover && <PageTurnFlash />}
    </div>
  );
}
