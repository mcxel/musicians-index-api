"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import type { Metadata } from "next";
import MagazineCrownOrbit from "@/components/magazine/MagazineCrownOrbit";
import CrownMagazineFeature from "@/components/magazine/CrownMagazineFeature";
import { getCrownRankRuntime } from "@/lib/home/CrownRankRuntime";
import { getWinnerEntityRuntime } from "@/lib/home/WinnerEntityRuntime";

// Battle state seed — in production this would come from a live API
// For now: if we're in the first 5 days of the week, voting is LIVE
function getCrownBattleStatus(): "live" | "resolved" | "upcoming" {
  const day = new Date().getDay(); // 0=Sun … 6=Sat
  if (day >= 1 && day <= 5) return "live";   // Mon–Fri: active voting
  if (day === 6) return "resolved";           // Sat: winner revealed
  return "upcoming";                          // Sun: next round loading
}

function CrownComingSoon() {
  return (
    <section style={{ minHeight: "100vh", background: "#050510", color: "#fff", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 24px", fontFamily: "'Inter', sans-serif", textAlign: "center" }}>
      <motion.div animate={{ filter: ["drop-shadow(0 0 12px #FFD700)", "drop-shadow(0 0 28px #FFD700)", "drop-shadow(0 0 12px #FFD700)"] }} transition={{ duration: 2.4, repeat: Infinity }}>
        <div style={{ fontSize: 80, marginBottom: 24 }}>👑</div>
      </motion.div>
      <div style={{ fontSize: 9, letterSpacing: "0.4em", color: "#FFD700", fontWeight: 800, marginBottom: 12 }}>NEXT CROWN SEASON</div>
      <h1 style={{ fontSize: "clamp(28px, 6vw, 56px)", fontWeight: 900, margin: "0 0 16px", letterSpacing: "-0.02em" }}>Champion Loading…</h1>
      <p style={{ fontSize: 14, color: "rgba(255,255,255,0.4)", maxWidth: 420, lineHeight: 1.7, marginBottom: 32 }}>
        Voting opens Monday. Submit your performance, gather your crowd, and claim the crown.
      </p>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
        <Link href="/battles" style={{ padding: "13px 28px", background: "linear-gradient(90deg, #FFD700, #FF9500)", color: "#050510", fontWeight: 900, fontSize: 12, borderRadius: 9, textDecoration: "none", letterSpacing: "0.08em" }}>
          ENTER BATTLE
        </Link>
        <Link href="/rankings/crown" style={{ padding: "13px 22px", background: "rgba(255,215,0,0.08)", border: "1px solid rgba(255,215,0,0.3)", color: "#FFD700", fontWeight: 800, fontSize: 12, borderRadius: 9, textDecoration: "none" }}>
          CROWN RANKINGS
        </Link>
      </div>
    </section>
  );
}

export default function MagazineCrownPage() {
  const status = getCrownBattleStatus();
  const contenders = useMemo(() => getCrownRankRuntime(5), []);
  const winner = useMemo(() => getWinnerEntityRuntime(), []);

  // RESOLVED — show the magazine feature
  if (status === "resolved" && winner) {
    const topEntry = contenders[0];
    if (topEntry) {
      return <CrownMagazineFeature winner={topEntry} weekLabel="THIS WEEK'S CHAMPION" totalVotes={winner.liveScore} />;
    }
  }

  // LIVE — show live orbit voting
  if (status === "live" && contenders.length > 0) {
    const orbitContenders = contenders.map((c, i) => ({
      id: c.artistId,
      name: c.name,
      votes: c.score,
      isCrownHolder: i === 0,
      orbitRadius: [80, 100, 115, 130, 95][i] ?? 110,
      orbitSpeed:  [18,  24,  30,  20,  28][i] ?? 25,
      href: c.route,
    }));

    const totalVotes = contenders.reduce((sum, c) => sum + c.score, 0);
    const closesIn = "4d 12h"; // would be dynamic in production

    return (
      <section style={{ minHeight: "100vh", background: "#050510", color: "#fff", fontFamily: "'Inter', sans-serif" }}>
        {/* Header */}
        <div style={{ padding: "40px 24px 0", textAlign: "center" }}>
          <div style={{ fontSize: 9, letterSpacing: "0.4em", color: "#FFD700", fontWeight: 800, marginBottom: 10 }}>👑 LIVE CROWN VOTING</div>
          <h1 style={{ fontSize: "clamp(28px, 6vw, 52px)", fontWeight: 900, margin: "0 0 10px", letterSpacing: "-0.02em" }}>Who Wears the Crown?</h1>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", maxWidth: 480, margin: "0 auto 32px" }}>
            Voting is live. The artist with the highest crowd score this week claims the crown.
          </p>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 16px", background: "rgba(255,45,170,0.1)", border: "1px solid rgba(255,45,170,0.3)", borderRadius: 20 }}>
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#FF2DAA", boxShadow: "0 0 8px #FF2DAA", flexShrink: 0 }} />
            <span style={{ fontSize: 9, fontWeight: 800, color: "#FF2DAA", letterSpacing: "0.12em" }}>VOTING CLOSES IN {closesIn}</span>
          </div>
        </div>

        {/* Orbit widget */}
        <div style={{ display: "flex", justifyContent: "center", padding: "24px 0 32px" }}>
          <MagazineCrownOrbit
            contenders={orbitContenders}
            totalVotes={totalVotes}
            votingClosesIn={closesIn}
          />
        </div>

        {/* Leaderboard strip */}
        <div style={{ maxWidth: 680, margin: "0 auto", padding: "0 24px 60px" }}>
          <div style={{ fontSize: 9, letterSpacing: "0.3em", color: "rgba(255,255,255,0.3)", fontWeight: 800, marginBottom: 14 }}>CURRENT STANDINGS</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {contenders.map((c, i) => {
              const pct = totalVotes > 0 ? Math.round((c.score / totalVotes) * 100) : 0;
              const isLeader = i === 0;
              return (
                <Link key={c.artistId} href={c.route} style={{ textDecoration: "none" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", background: isLeader ? "rgba(255,215,0,0.06)" : "rgba(255,255,255,0.02)", border: `1px solid ${isLeader ? "rgba(255,215,0,0.25)" : "rgba(255,255,255,0.06)"}`, borderRadius: 10 }}>
                    <span style={{ fontSize: 14, fontWeight: 900, color: isLeader ? "#FFD700" : "rgba(255,255,255,0.3)", minWidth: 24 }}>#{i + 1}</span>
                    <span style={{ flex: 1, fontSize: 13, fontWeight: 700, color: isLeader ? "#fff" : "rgba(255,255,255,0.7)" }}>{c.name}</span>
                    <span style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", marginRight: 8 }}>{c.genre}</span>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 120 }}>
                      <div style={{ flex: 1, height: 3, background: "rgba(255,255,255,0.06)", borderRadius: 2, overflow: "hidden" }}>
                        <div style={{ width: `${pct}%`, height: "100%", background: isLeader ? "linear-gradient(90deg,#FFD700,#FF9500)" : "rgba(255,255,255,0.2)", borderRadius: 2 }} />
                      </div>
                      <span style={{ fontSize: 10, fontWeight: 800, color: isLeader ? "#FFD700" : "rgba(255,255,255,0.4)", minWidth: 32, textAlign: "right" }}>{pct}%</span>
                    </div>
                    {isLeader && <span style={{ fontSize: 14 }}>👑</span>}
                  </div>
                </Link>
              );
            })}
          </div>
          <div style={{ marginTop: 20, display: "flex", gap: 10 }}>
            <Link href="/rankings/crown" style={{ fontSize: 10, fontWeight: 700, color: "#FFD700", border: "1px solid rgba(255,215,0,0.25)", borderRadius: 7, padding: "9px 18px", textDecoration: "none" }}>
              FULL RANKINGS
            </Link>
            <Link href="/battles" style={{ fontSize: 10, fontWeight: 700, color: "#FF2DAA", border: "1px solid rgba(255,45,170,0.2)", borderRadius: 7, padding: "9px 18px", textDecoration: "none" }}>
              ENTER BATTLE
            </Link>
          </div>
        </div>
      </section>
    );
  }

  // UPCOMING / NO DATA
  return <CrownComingSoon />;
}
