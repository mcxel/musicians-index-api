"use client";

import Link from "next/link";
import { computeRanks, getTierColor } from "@/lib/performers/PerformerRegistry";
import MotionPosterPlayer from "@/components/media/MotionPosterPlayer";

// Rule 3: Rankings are XP-driven, never manual — computeRanks() is the single source of truth
const TOP_10 = computeRanks().slice(0, 10);

const BADGE: Record<number, string> = { 1: "👑", 2: "🥈", 3: "🥉" };

export default function RankingsWidget() {
  return (
    <div style={{ color: "#fff" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div style={{ fontSize: 9, letterSpacing: "0.22em", color: "#FFD700", fontWeight: 800 }}>THIS WEEK&apos;S CROWN ORBIT</div>
        <Link href="/rankings" style={{ fontSize: 8, color: "rgba(255,255,255,0.35)", letterSpacing: "0.1em", textDecoration: "none", fontWeight: 700 }}>
          FULL TABLE →
        </Link>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {TOP_10.map((p) => {
          const accent = getTierColor(p.tier);
          const isTop3 = p.rank <= 3;
          return (
            <Link
              key={p.slug}
              href={p.profileRoute}
              style={{ textDecoration: "none", color: "#fff" }}
            >
              <div style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "9px 12px", borderRadius: 10,
                background: isTop3 ? `${accent}12` : "rgba(255,255,255,0.03)",
                border: `1px solid ${isTop3 ? accent + "33" : "rgba(255,255,255,0.07)"}`,
                transition: "background 120ms",
              }}>
                {/* Rank badge */}
                <div style={{ width: 26, textAlign: "center", fontSize: isTop3 ? 16 : 10, fontWeight: 900, color: accent, flexShrink: 0 }}>
                  {BADGE[p.rank] ?? p.rank}
                </div>

                {/* Rule 2: Top 3 get motion poster avatar — ranks 4-10 get static image */}
                {isTop3 ? (
                  <MotionPosterPlayer
                    isLive={p.isLive}
                    liveRoomRoute={p.liveRoomRoute}
                    introVideoUrl={p.introVideoUrl}
                    motionPosterUrl={p.motionPosterUrl}
                    staticImageUrl={p.profileImageUrl}
                    alt={p.name}
                    audienceCount={p.audienceCount}
                    showLiveOverlay={false}
                    replayOnHover
                    style={{ width: 36, height: 36, borderRadius: "50%", border: `1.5px solid ${accent}`, flexShrink: 0 }}
                  />
                ) : (
                  <img
                    src={p.profileImageUrl}
                    alt={p.name}
                    style={{ width: 30, height: 30, borderRadius: "50%", objectFit: "cover", border: `1px solid ${accent}44`, flexShrink: 0 }}
                  />
                )}

                {/* Name + genre */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ fontSize: 12, fontWeight: 800, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.name}</span>
                    {p.isLive && (
                      <span style={{ fontSize: 7, fontWeight: 900, color: "#FF2020", letterSpacing: "0.12em", background: "rgba(255,32,32,0.12)", border: "1px solid rgba(255,32,32,0.3)", borderRadius: 3, padding: "1px 5px", flexShrink: 0 }}>
                        LIVE
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", marginTop: 1 }}>{p.category}</div>
                </div>

                {/* XP */}
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <div style={{ fontSize: 10, fontWeight: 800, color: accent }}>{p.xp.toLocaleString()}</div>
                  <div style={{ fontSize: 8, color: "rgba(255,255,255,0.3)", letterSpacing: "0.08em" }}>XP</div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      <div style={{ marginTop: 16, display: "flex", gap: 8 }}>
        <Link href="/rankings" style={{ flex: 1, padding: "10px 0", textAlign: "center", background: "rgba(255,215,0,0.1)", border: "1px solid rgba(255,215,0,0.3)", borderRadius: 8, color: "#FFD700", fontSize: 10, fontWeight: 800, textDecoration: "none", letterSpacing: "0.08em" }}>
          FULL RANKINGS
        </Link>
        <Link href="/vote" style={{ flex: 1, padding: "10px 0", textAlign: "center", background: "rgba(0,255,255,0.08)", border: "1px solid rgba(0,255,255,0.25)", borderRadius: 8, color: "#00FFFF", fontSize: 10, fontWeight: 800, textDecoration: "none", letterSpacing: "0.08em" }}>
          VOTE NOW
        </Link>
      </div>
    </div>
  );
}
