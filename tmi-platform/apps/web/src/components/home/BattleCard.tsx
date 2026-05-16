"use client";

import { motion } from "framer-motion";
import Link from "next/link";

type BattleArtist = {
  name: string;
  role: string;
  accentColor: string;
};

type BattleReward = {
  label: string;
  value: string;
  color: string;
};

type BattleCardProps = {
  artist1: BattleArtist;
  artist2: BattleArtist;
  battleType: string;
  genre: string;
  instrumentBadge?: string;
  rewards: BattleReward[];
  endsInMinutes?: number;
  href: string;
};

function initials(name: string): string {
  return name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
}

export default function BattleCard({
  artist1, artist2, battleType, genre, instrumentBadge, rewards, endsInMinutes, href,
}: BattleCardProps) {
  return (
    <Link href={href} style={{ textDecoration: "none", display: "block" }}>
      <div style={{
        borderRadius: 14, overflow: "hidden",
        border: "1.5px solid rgba(204,0,0,0.30)",
        background: "linear-gradient(135deg, rgba(170,45,255,0.08), rgba(204,0,0,0.07))",
      }}>
        {/* Header strip */}
        <div style={{
          padding: "6px 12px",
          background: "rgba(0,0,0,0.55)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 4,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
            <span style={{ fontSize: 6, fontWeight: 900, letterSpacing: "0.24em", color: "#CC0000", textTransform: "uppercase" }}>
              {battleType}
            </span>
            <span style={{
              padding: "1px 7px", borderRadius: 999,
              border: "1px solid rgba(170,45,255,0.4)", background: "rgba(170,45,255,0.12)",
              fontSize: 6, fontWeight: 900, letterSpacing: "0.18em", color: "#AA2DFF", textTransform: "uppercase",
            }}>
              {instrumentBadge ?? genre}
            </span>
          </div>
          {endsInMinutes !== undefined && (
            <span style={{ fontSize: 6, fontWeight: 900, color: "rgba(255,255,255,0.35)", letterSpacing: "0.12em" }}>
              Ends <span style={{ color: "#CC0000" }}>{endsInMinutes}m</span>
            </span>
          )}
        </div>

        {/* Portrait vs Portrait */}
        <div style={{ display: "flex", alignItems: "stretch" }}>
          {/* Artist 1 */}
          <div style={{
            flex: 1, padding: "16px 10px",
            background: `radial-gradient(circle at 60% 50%, ${artist1.accentColor}18, transparent 70%)`,
            display: "flex", flexDirection: "column", alignItems: "center", gap: 7,
          }}>
            <div style={{
              width: 56, height: 56, borderRadius: "50%",
              background: `radial-gradient(circle at 38% 36%, ${artist1.accentColor}55, ${artist1.accentColor}18)`,
              border: `2px solid ${artist1.accentColor}66`,
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: `0 0 20px ${artist1.accentColor}44`,
            }}>
              <span style={{ fontSize: 16, fontWeight: 900, color: artist1.accentColor }}>{initials(artist1.name)}</span>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 11, fontWeight: 900, color: "#fff", letterSpacing: "0.04em" }}>{artist1.name}</div>
              <div style={{ fontSize: 6, fontWeight: 800, letterSpacing: "0.16em", color: artist1.accentColor, textTransform: "uppercase", marginTop: 2 }}>{artist1.role}</div>
            </div>
          </div>

          {/* VS divider */}
          <div style={{
            width: 34, display: "flex", alignItems: "center", justifyContent: "center",
            background: "rgba(0,0,0,0.35)",
            borderLeft: "1px solid rgba(255,255,255,0.05)",
            borderRight: "1px solid rgba(255,255,255,0.05)",
          }}>
            <motion.div
              animate={{ scale: [0.86, 1.14, 0.86], opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
              style={{ fontSize: 12, fontWeight: 900, color: "#fff", letterSpacing: "0.06em" }}
            >
              VS
            </motion.div>
          </div>

          {/* Artist 2 */}
          <div style={{
            flex: 1, padding: "16px 10px",
            background: `radial-gradient(circle at 40% 50%, ${artist2.accentColor}18, transparent 70%)`,
            display: "flex", flexDirection: "column", alignItems: "center", gap: 7,
          }}>
            <div style={{
              width: 56, height: 56, borderRadius: "50%",
              background: `radial-gradient(circle at 38% 36%, ${artist2.accentColor}55, ${artist2.accentColor}18)`,
              border: `2px solid ${artist2.accentColor}66`,
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: `0 0 20px ${artist2.accentColor}44`,
            }}>
              <span style={{ fontSize: 16, fontWeight: 900, color: artist2.accentColor }}>{initials(artist2.name)}</span>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 11, fontWeight: 900, color: "#fff", letterSpacing: "0.04em" }}>{artist2.name}</div>
              <div style={{ fontSize: 6, fontWeight: 800, letterSpacing: "0.16em", color: artist2.accentColor, textTransform: "uppercase", marginTop: 2 }}>{artist2.role}</div>
            </div>
          </div>
        </div>

        {/* Rewards strip */}
        <div style={{
          padding: "7px 12px",
          borderTop: "1px solid rgba(255,255,255,0.06)",
          background: "rgba(0,0,0,0.45)",
          display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap",
        }}>
          <span style={{ fontSize: 6, fontWeight: 900, letterSpacing: "0.18em", color: "rgba(255,255,255,0.3)", textTransform: "uppercase", flexShrink: 0 }}>
            Winner earns:
          </span>
          {rewards.map((r) => (
            <span
              key={r.label}
              style={{
                padding: "2px 7px", borderRadius: 999,
                border: `1px solid ${r.color}44`, background: `${r.color}10`,
                fontSize: 7, fontWeight: 900, letterSpacing: "0.1em", color: r.color,
              }}
            >
              {r.value} {r.label}
            </span>
          ))}
        </div>
      </div>
    </Link>
  );
}
