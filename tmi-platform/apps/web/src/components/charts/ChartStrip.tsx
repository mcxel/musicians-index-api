"use client";

import { ImageSlotWrapper } from '@/components/visual-enforcement';
// ChartStrip
// Ranked vertical chart strip for Home 2 Discovery Belt
// Shows rank, portrait crop, headline, movement indicator

import { motion } from "framer-motion";
import Link from "next/link";
import type { SpreadRankEntry } from "@/engines/home/SpreadRankAuthorityEngine";

function MovementTag({ movement }: { movement: SpreadRankEntry["movement"] }) {
  const map = {
    rising:  { arrow: "↑", color: "#22c55e" },
    falling: { arrow: "↓", color: "#ef4444" },
    holding: { arrow: "→", color: "#eab308" },
  };
  const { arrow, color } = map[movement];
  return (
    <span style={{ fontSize: 8, fontWeight: 900, color }}>{arrow}</span>
  );
}

type Props = {
  entries: SpreadRankEntry[];
  title: string;
  accentColor?: string;
  limit?: number;
};

export default function ChartStrip({
  entries,
  title,
  accentColor = "#00FFFF",
  limit = 5,
}: Props) {
  const visible = entries.slice(0, limit);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
      {/* Strip header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          marginBottom: 8,
          padding: "4px 8px",
          borderRadius: 6,
          background: `${accentColor}0d`,
          border: `1px solid ${accentColor}22`,
        }}
      >
        <span
          style={{
            fontSize: 7,
            fontWeight: 900,
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            color: accentColor,
          }}
        >
          {title}
        </span>
        <motion.span
          animate={{ opacity: [1, 0.4, 1] }}
          transition={{ duration: 1.4, repeat: Infinity }}
          style={{
            width: 4,
            height: 4,
            borderRadius: "50%",
            background: accentColor,
            boxShadow: `0 0 5px ${accentColor}`,
            marginLeft: "auto",
            flexShrink: 0,
          }}
        />
      </div>

      {/* Rows */}
      {visible.map((entry, i) => (
        <motion.div
          key={entry.id}
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.28, delay: 0.06 * i }}
        >
          <Link
            href={`/artists/${entry.id}`}
            style={{ textDecoration: "none", display: "block" }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "5px 8px",
                borderRadius: 6,
                borderBottom: "1px solid rgba(255,255,255,0.05)",
                background: entry.rank === 1 ? "rgba(255,215,0,0.04)" : "transparent",
                cursor: "pointer",
              }}
            >
              {/* Rank */}
              <div
                style={{
                  width: 18,
                  textAlign: "center",
                  fontSize: entry.rank === 1 ? 11 : 8,
                  fontWeight: 900,
                  color: entry.rank === 1 ? "#FFD700" : "rgba(255,255,255,0.35)",
                  flexShrink: 0,
                }}
              >
                {entry.rank === 1 ? "👑" : `#${entry.rank}`}
              </div>

              {/* Portrait rectangle */}
              {entry.profileImage && (
                <div
                  style={{
                    width: 32,
                    height: 36,
                    borderRadius: 5,
                    overflow: "hidden",
                    flexShrink: 0,
                    border: `1px solid ${accentColor}33`,
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <ImageSlotWrapper imageId="img-ww8im7" roomId="runtime-surface" priority="normal" className="w-full h-full object-cover" altText="Content image" containerStyle={{ width: '100%', height: '100%' }} />
                </div>
              )}

              {/* Name + genre */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    color: entry.rank === 1 ? "#FFD700" : "rgba(255,255,255,0.88)",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {entry.name}
                </div>
                <div
                  style={{
                    fontSize: 7,
                    color: "rgba(255,255,255,0.38)",
                    fontWeight: 600,
                    letterSpacing: "0.06em",
                  }}
                >
                </div>
              </div>

              {/* Movement */}
              <MovementTag movement={entry.movement} />

              {/* Score */}
              <div
                style={{
                  fontSize: 8,
                  fontWeight: 800,
                  color: accentColor,
                  flexShrink: 0,
                  letterSpacing: "0.04em",
                }}
              >
                {entry.score.toLocaleString()}
              </div>
            </div>
          </Link>
        </motion.div>
      ))}
    </div>
  );
}
