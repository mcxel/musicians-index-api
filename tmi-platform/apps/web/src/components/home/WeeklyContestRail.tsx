"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { CATEGORY_LABELS, CATEGORY_ICONS, type CompetitionCategory } from "@/lib/competition/ChampionshipYearlyEngine";

// Weekly contests — all disciplines, fan-voted, belt/trophy awarded

const WEEKLY_CONTESTS: Array<{
  id: string;
  category: CompetitionCategory;
  prize: string;
  prizeLabel: string;
  href: string;
  accent: string;
  hoursLeft: number;
  entrants: number;
  status: "open" | "voting" | "ended";
}> = [
  { id: "wc-1", category: "battle-of-the-band", prize: "$500",  prizeLabel: "Cash + Belt", href: "/challenges/battle-of-the-band", accent: "#FF6B35", hoursLeft: 42, entrants: 18, status: "open" },
  { id: "wc-2", category: "rapper",             prize: "$300",  prizeLabel: "Cash + Belt", href: "/challenges/rapper",             accent: "#FF2DAA", hoursLeft: 18, entrants: 34, status: "voting" },
  { id: "wc-3", category: "comedian",           prize: "$250",  prizeLabel: "Trophy",      href: "/challenges/comedian",           accent: "#AA2DFF", hoursLeft: 67, entrants: 12, status: "open" },
  { id: "wc-4", category: "dancer",             prize: "$200",  prizeLabel: "Belt",        href: "/challenges/dancer",             accent: "#00FFFF", hoursLeft: 31, entrants: 27, status: "voting" },
  { id: "wc-5", category: "singer",             prize: "$400",  prizeLabel: "Cash + Belt", href: "/challenges/singer",             accent: "#FFD700", hoursLeft: 54, entrants: 41, status: "open" },
  { id: "wc-6", category: "dj",                prize: "$150",  prizeLabel: "Belt",        href: "/challenges/dj",                 accent: "#00FF88", hoursLeft: 9,  entrants: 8,  status: "voting" },
];

function statusColor(s: "open" | "voting" | "ended"): string {
  if (s === "open") return "#00FF88";
  if (s === "voting") return "#FFD700";
  return "rgba(255,255,255,0.3)";
}

function statusLabel(s: "open" | "voting" | "ended"): string {
  if (s === "open") return "ENTER NOW";
  if (s === "voting") return "VOTE LIVE";
  return "ENDED";
}

export default function WeeklyContestRail() {
  return (
    <section style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px 36px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
        <div>
          <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.3em", color: "#FFD700", textTransform: "uppercase", marginBottom: 4 }}>
            Weekly Championships
          </div>
          <div style={{ fontSize: "clamp(16px,2.5vw,24px)", fontWeight: 900, color: "#fff", fontFamily: "var(--font-tmi-bebas,'Bebas Neue',Impact,sans-serif)", letterSpacing: "0.04em" }}>
            ENTER · COMPETE · WIN THE BELT
          </div>
        </div>
        <Link href="/challenges" style={{ textDecoration: "none", fontSize: 8, fontWeight: 800, color: "rgba(255,255,255,0.4)", letterSpacing: "0.1em" }}>
          ALL CONTESTS →
        </Link>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 12 }}>
        {WEEKLY_CONTESTS.map((c, i) => (
          <motion.div
            key={c.id}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05, duration: 0.35 }}
          >
            <Link href={c.href} style={{ textDecoration: "none" }}>
              <motion.div
                whileHover={{ scale: 1.03, boxShadow: `0 0 24px ${c.accent}44` }}
                style={{
                  borderRadius: 12,
                  border: `1px solid ${c.accent}44`,
                  background: `linear-gradient(145deg, ${c.accent}14, rgba(5,5,16,0.96))`,
                  padding: "16px 18px",
                  cursor: "pointer",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                {/* Status pulse */}
                {c.status !== "ended" && (
                  <motion.div
                    animate={{ opacity: [1, 0.3, 1] }}
                    transition={{ duration: 1.4, repeat: Infinity }}
                    style={{
                      position: "absolute", top: 12, right: 12,
                      width: 6, height: 6, borderRadius: "50%",
                      background: statusColor(c.status),
                      boxShadow: `0 0 8px ${statusColor(c.status)}`,
                    }}
                  />
                )}

                <div style={{ fontSize: 22, marginBottom: 8 }}>
                  {CATEGORY_ICONS[c.category]}
                </div>
                <div style={{ fontSize: 12, fontWeight: 900, color: "#fff", marginBottom: 2, letterSpacing: "0.02em" }}>
                  {CATEGORY_LABELS[c.category]}
                </div>
                <div style={{ fontSize: 9, color: "rgba(255,255,255,0.45)", marginBottom: 12, letterSpacing: "0.08em" }}>
                  {c.entrants} ENTRANTS · {c.hoursLeft}h LEFT
                </div>

                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 900, color: c.accent }}>{c.prize}</div>
                    <div style={{ fontSize: 8, color: "rgba(255,255,255,0.4)", letterSpacing: "0.08em" }}>{c.prizeLabel}</div>
                  </div>
                  <div style={{
                    fontSize: 8, fontWeight: 900, letterSpacing: "0.12em",
                    background: statusColor(c.status),
                    color: c.status === "voting" ? "#050510" : "#fff",
                    borderRadius: 6, padding: "4px 10px",
                    textTransform: "uppercase",
                  }}>
                    {statusLabel(c.status)}
                  </div>
                </div>
              </motion.div>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
