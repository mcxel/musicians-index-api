"use client";

/**
 * CrownCenterFeature.tsx
 * Layer 4 — Main crown artist: Center dominant feature.
 * Motion portrait, crown glow, vote ring, winner badge.
 * Routes to artist profile on click.
 * 
 * GOVERNED: All portraits routed through PerformerPortraitWrapper
 */

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { PerformerPortraitWrapper } from "@/components/visual-enforcement";

interface CrownArtist {
  id: string;
  name: string;
  score: string;
  genre: string;
  images?: [string, string, string];
  votePercent?: number;
}

interface Props {
  artist: CrownArtist;
  accentColor?: string;
  facePulseKey?: number;
  rankShiftPulse?: boolean;
  roomId?: string;
}

export default function CrownCenterFeature({ artist, accentColor = "#FFD700", facePulseKey = 0, rankShiftPulse = false, roomId = "home-1" }: Props) {
  const [voteRingPct, setVoteRingPct] = useState(artist.votePercent ?? 78);

  // Animate vote ring percentage climbing
  useEffect(() => {
    const t = setInterval(() => {
      setVoteRingPct((p) => {
        const next = p + (Math.random() > 0.5 ? 0.4 : -0.2);
        return Math.min(99.9, Math.max(60, next));
      });
    }, 2200);
    return () => clearInterval(t);
  }, []);

  const circumference = 2 * Math.PI * 52; // r=52
  const offset = circumference - (voteRingPct / 100) * circumference;

  return (
    <Link
      href={`/profile/${artist.id}`}
      style={{ textDecoration: "none", color: "inherit", display: "block" }}
    >
      <motion.div
        animate={{
          boxShadow: [
            `0 0 30px ${accentColor}40, 0 0 80px ${accentColor}20`,
            `0 0 50px ${accentColor}70, 0 0 120px ${accentColor}35`,
            `0 0 30px ${accentColor}40, 0 0 80px ${accentColor}20`,
          ],
        }}
        transition={{ duration: 2.4, repeat: Infinity }}
        style={{
          position: "relative",
          width: 220,
          borderRadius: 18,
          border: `2px solid ${accentColor}88`,
          overflow: "hidden",
          background: "rgba(10,8,2,0.92)",
          cursor: "pointer",
        }}
      >
        <motion.div
          key={facePulseKey}
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.22, 0] }}
          transition={{ duration: 1.2 }}
          style={{
            position: "absolute",
            inset: -28,
            zIndex: 3,
            pointerEvents: "none",
            background: `radial-gradient(circle, ${accentColor}66 0%, transparent 64%)`,
          }}
        />

        <motion.div
          animate={{ opacity: [0.3, 0.75, 0.3], scale: [1, 1.06, 1] }}
          transition={{ duration: 2.6, repeat: Infinity }}
          style={{
            position: "absolute",
            top: 10,
            right: 10,
            zIndex: 5,
            pointerEvents: "none",
            color: "#FF2DAA",
            fontSize: 8,
            fontWeight: 900,
            letterSpacing: "0.09em",
            textTransform: "uppercase",
            textShadow: "0 0 10px rgba(255,45,170,0.9)",
          }}
        >
          LIVE
        </motion.div>

        {rankShiftPulse && (
          <motion.div
            animate={{ opacity: [0, 0.9, 0], x: [-14, 8, 16] }}
            transition={{ duration: 1 }}
            style={{
              position: "absolute",
              top: 82,
              left: -12,
              zIndex: 6,
              pointerEvents: "none",
              color: "#00FF88",
              fontSize: 8,
              fontWeight: 900,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
            }}
          >
            RANK SHIFT {"->"}
          </motion.div>
        )}

        {/* Governed performer portrait (replaces image carousel) */}
        <div style={{ position: "relative", height: 200 }}>
          <PerformerPortraitWrapper
            performerId={artist.id}
            roomId={roomId}
            displayName={artist.name}
            kind="artist"
            containerStyle={{
              width: "100%",
              height: "100%",
            }}
            className="w-full h-full object-cover"
          />

          {/* Crown overlay */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: 40,
              background: `linear-gradient(180deg, ${accentColor}40, transparent)`,
              display: "flex",
              justifyContent: "center",
              paddingTop: 6,
              zIndex: 2,
            }}
          >
            <span style={{ fontSize: 18 }}>👑</span>
          </div>

          {/* Vote ring SVG */}
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: 120,
              height: 120,
              pointerEvents: "none",
              zIndex: 2,
              opacity: 0.7,
            }}
          >
            <svg width={120} height={120} viewBox="0 0 120 120">
              <circle cx={60} cy={60} r={52} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={3} />
              <circle
                cx={60} cy={60} r={52}
                fill="none"
                stroke={accentColor}
                strokeWidth={3}
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                strokeLinecap="round"
                transform="rotate(-90 60 60)"
                style={{ transition: "stroke-dashoffset 1.5s ease" }}
              />
              <text
                x={60} y={66}
                textAnchor="middle"
                fill={accentColor}
                fontSize={13}
                fontWeight={800}
                fontFamily="Orbitron, monospace"
              >
                {voteRingPct.toFixed(0)}%
              </text>
            </svg>
          </div>

          {/* Bottom gradient overlay */}
          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              height: 70,
              background: "linear-gradient(0deg, rgba(10,8,2,0.95), transparent)",
              zIndex: 2,
            }}
          />
        </div>

        {/* Info panel */}
        <div
          style={{
            padding: "10px 14px 14px",
            display: "grid",
            gap: 6,
            background: `linear-gradient(180deg, rgba(10,8,2,0.98), rgba(20,14,4,0.98))`,
          }}
        >
          {/* Rank badge */}
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span
              style={{
                background: `linear-gradient(135deg, ${accentColor}, ${accentColor}cc)`,
                color: "#000",
                fontSize: 9,
                fontWeight: 900,
                letterSpacing: "0.14em",
                padding: "3px 8px",
                borderRadius: 4,
              }}
            >
              #1 CROWN WINNER
            </span>
            <motion.span
              animate={{ opacity: [1, 0.4, 1] }}
              transition={{ duration: 1.4, repeat: Infinity }}
              style={{ fontSize: 8, color: "#FF2DAA", fontWeight: 700 }}
            >
              ● VOTING LIVE
            </motion.span>
          </div>

          {/* Name */}
          <div
            style={{
              fontSize: 22,
              fontWeight: 900,
              fontFamily: "var(--font-tmi-bebas, 'Bebas Neue', Impact, sans-serif)",
              letterSpacing: "0.06em",
              lineHeight: 1,
              color: "#fff",
            }}
          >
            {artist.name}
          </div>

          {/* Score + genre */}
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <span style={{ fontSize: 11, color: accentColor, fontWeight: 700 }}>
              {artist.score}
            </span>
            <span style={{ fontSize: 9, opacity: 0.5 }}>·</span>
            <span
              style={{
                fontSize: 9,
                fontWeight: 700,
                color: accentColor,
                opacity: 0.8,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
              }}
            >
              {artist.genre}
            </span>
          </div>

          {/* Actions */}
          <div style={{ display: "flex", gap: 6, marginTop: 2 }}>
            <div
              style={{
                flex: 1,
                background: `linear-gradient(135deg, ${accentColor}, ${accentColor}bb)`,
                color: "#000",
                fontSize: 9,
                fontWeight: 900,
                letterSpacing: "0.1em",
                borderRadius: 5,
                padding: "6px 0",
                textAlign: "center",
              }}
            >
              VOTE
            </div>
            <div
              style={{
                flex: 1,
                background: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.15)",
                color: "#fff",
                fontSize: 9,
                fontWeight: 700,
                letterSpacing: "0.08em",
                borderRadius: 5,
                padding: "6px 0",
                textAlign: "center",
              }}
            >
              PROFILE
            </div>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
