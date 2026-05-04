"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { motion } from "framer-motion";
import MagazinePaperTexture from "@/components/magazine/MagazinePaperTexture";

// ── Orbit ring seed data ──────────────────────────────────────────────────────

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

// ── Orbit ring ────────────────────────────────────────────────────────────────

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
      {/* Orbit circle trace */}
      <div
        style={{
          position: "absolute",
          width: r * 2,
          height: r * 2,
          borderRadius: "50%",
          border: "1px solid rgba(0,255,255,0.10)",
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

// ── Genre burst ───────────────────────────────────────────────────────────────

function GenreBurst() {
  return (
    <div
      aria-hidden="true"
      style={{
        position: "absolute",
        bottom: 88,
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

// ── Main artifact ─────────────────────────────────────────────────────────────

type HomePageCoverArtifactProps = {
  onRequestOpen?: () => void;
};

export default function HomePageCoverArtifact({ onRequestOpen }: HomePageCoverArtifactProps) {
  const router  = useRouter();
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
        background: "#04020a",
      }}
    >
      {/* ── Full-bleed cover image ── */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/tmi-curated/home1.jpg"
        alt="The Musician's Index — Issue 01"
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          objectPosition: "center top",
          zIndex: 1,
          borderRadius: 14,
        }}
        draggable={false}
      />

      <MagazinePaperTexture intensity={0.32} tone="neutral" />

      {/* ── Gradient vignette — heavier at top and bottom ── */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 3,
          pointerEvents: "none",
          borderRadius: 14,
          background:
            "linear-gradient(180deg, rgba(4,2,10,0.78) 0%, rgba(4,2,10,0.10) 28%, rgba(4,2,10,0.30) 58%, rgba(4,2,10,0.96) 100%)",
        }}
      />

      {/* ── Cyan/fuchsia neon glow ── */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 4,
          pointerEvents: "none",
          borderRadius: 14,
          boxShadow:
            "inset 0 0 60px rgba(0,255,255,0.06), inset 0 0 120px rgba(255,45,170,0.04)",
        }}
      />

      {/* ── Masthead ── */}
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

      {/* ── Crown center — #1 artist ── */}
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
      </div>

      {/* ── Top 10 orbit ring ── */}
      <OrbitRing />

      {/* ── Genre burst ── */}
      <GenreBurst />

      {/* ── Bottom CTA bar ── */}
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

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <Link
            onClick={onOpenMagazine}
            href="/home/1-2"
            style={{
              flex: 1,
              minWidth: 100,
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
          <Link
            href="/account"
            style={{
              textDecoration: "none",
              padding: "10px 14px",
              borderRadius: 10,
              border: "1px solid rgba(255,255,255,0.18)",
              color: "rgba(255,255,255,0.7)",
              fontSize: 10,
              fontWeight: 900,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              background: "rgba(255,255,255,0.05)",
            }}
          >
            My Account
          </Link>
        </div>
      </div>

      {/* ── Page-turn flash on open ── */}
      {openingCover && (
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
              background:
                "linear-gradient(100deg, rgba(245,238,220,0.92), rgba(208,190,160,0.72))",
              borderRadius: 14,
              boxShadow: "0 20px 50px rgba(0,0,0,0.42)",
            }}
          >
            <div
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "radial-gradient(circle at 80% 50%, rgba(0,0,0,0.32), transparent 52%)",
              }}
            />
            <div
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "linear-gradient(120deg, transparent 34%, rgba(255,255,255,0.22) 50%, transparent 68%)",
              }}
            />
          </motion.div>
        </div>
      )}
    </div>
  );
}
