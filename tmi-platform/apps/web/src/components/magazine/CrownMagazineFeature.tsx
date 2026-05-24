"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import type { CrownRankRuntimeEntry } from "@/lib/home/CrownRankRuntime";

interface Props {
  winner: CrownRankRuntimeEntry;
  weekLabel?: string;
  totalVotes?: number;
}

const MOVEMENT_ICON: Record<string, string> = { rising: "↑", falling: "↓", holding: "→" };
const MOVEMENT_COLOR: Record<string, string> = { rising: "#00FF88", falling: "#FF2DAA", holding: "#FFD700" };

export default function CrownMagazineFeature({ winner, weekLabel = "THIS WEEK", totalVotes }: Props) {
  const votes = totalVotes ?? winner.score;
  const pct = Math.min(100, Math.round((winner.score / 10000) * 100));

  return (
    <section style={{ background: "#050510", minHeight: "100vh", color: "#fff", fontFamily: "'Inter', sans-serif", paddingBottom: 80 }}>

      {/* Hero — gold crown backdrop */}
      <div style={{ position: "relative", overflow: "hidden", background: "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(255,215,0,0.18) 0%, transparent 70%), linear-gradient(180deg, #0c0a02 0%, #050510 100%)", padding: "56px 24px 48px", textAlign: "center" }}>

        {/* Animated gold ring behind crown */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 320, height: 320, borderRadius: "50%", border: "1px solid rgba(255,215,0,0.12)", pointerEvents: "none" }}
        />
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 240, height: 240, borderRadius: "50%", border: "1px dashed rgba(255,215,0,0.08)", pointerEvents: "none" }}
        />

        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div style={{ fontSize: 9, letterSpacing: "0.45em", color: "#FFD700", fontWeight: 800, marginBottom: 12 }}>
            👑 TMI CROWN CHAMPION — {weekLabel}
          </div>

          {/* Crown glyph */}
          <motion.div
            animate={{ filter: ["drop-shadow(0 0 12px #FFD700)", "drop-shadow(0 0 28px #FFD700)", "drop-shadow(0 0 12px #FFD700)"] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
            style={{ fontSize: 72, marginBottom: 16 }}
          >
            👑
          </motion.div>

          <h1 style={{ fontSize: "clamp(36px, 8vw, 80px)", fontWeight: 900, letterSpacing: "-0.02em", margin: "0 0 8px", background: "linear-gradient(135deg, #FFD700, #FFF8DC)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            {winner.name}
          </h1>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", fontWeight: 600 }}>{winner.genre}</span>
            <span style={{ fontSize: 9, color: "#555" }}>·</span>
            <span style={{ fontSize: 11, color: winner.flagEmoji ? "#fff" : "transparent" }}>{winner.flagEmoji}</span>
            <span style={{ fontSize: 9, color: "#555" }}>·</span>
            <span style={{ fontSize: 11, fontWeight: 800, color: MOVEMENT_COLOR[winner.movement] }}>
              {MOVEMENT_ICON[winner.movement]} RANK #{winner.rank}
            </span>
          </div>

          {/* Crowd score bar */}
          <div style={{ maxWidth: 360, margin: "0 auto 24px", textAlign: "left" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <span style={{ fontSize: 9, color: "rgba(255,255,255,0.35)", fontWeight: 700, letterSpacing: "0.1em" }}>CROWD SCORE</span>
              <span style={{ fontSize: 9, color: "#FFD700", fontWeight: 900 }}>{pct}%</span>
            </div>
            <div style={{ height: 4, background: "rgba(255,255,255,0.06)", borderRadius: 2, overflow: "hidden" }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 }}
                style={{ height: "100%", background: "linear-gradient(90deg, #FFD700, #FF9500)", borderRadius: 2 }}
              />
            </div>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", marginTop: 6, textAlign: "right" }}>
              {votes.toLocaleString()} votes
            </div>
          </div>

          {/* CTAs */}
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <Link href={winner.route} style={{ padding: "13px 28px", background: "linear-gradient(90deg, #FFD700, #FF9500)", color: "#050510", fontWeight: 900, fontSize: 12, borderRadius: 9, textDecoration: "none", letterSpacing: "0.08em" }}>
              VIEW PROFILE
            </Link>
            <Link href={winner.voteRoute} style={{ padding: "13px 22px", background: "rgba(255,215,0,0.1)", border: "1px solid rgba(255,215,0,0.35)", color: "#FFD700", fontWeight: 800, fontSize: 12, borderRadius: 9, textDecoration: "none" }}>
              VOTE THIS WEEK
            </Link>
            <Link href={winner.articleRoute} style={{ padding: "13px 22px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.6)", fontWeight: 700, fontSize: 12, borderRadius: 9, textDecoration: "none" }}>
              READ FEATURE
            </Link>
          </div>
        </motion.div>
      </div>

      {/* Stats strip */}
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "0 24px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 10, margin: "32px 0" }}>
          {[
            { label: "Crown Rank",    value: `#${winner.rank}`,                         color: "#FFD700" },
            { label: "Votes",         value: votes.toLocaleString(),                     color: "#FF2DAA" },
            { label: "Genre",         value: winner.genre,                               color: "#00FFFF" },
            { label: "Momentum",      value: winner.movement.toUpperCase(),               color: MOVEMENT_COLOR[winner.movement] },
          ].map((s) => (
            <div key={s.label} style={{ background: `${s.color}08`, border: `1px solid ${s.color}25`, borderRadius: 10, padding: "16px 18px", textAlign: "center" }}>
              <div style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", letterSpacing: "0.12em", marginBottom: 6 }}>{s.label}</div>
              <div style={{ fontSize: 20, fontWeight: 900, color: s.color }}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* Story blurb */}
        <div style={{ background: "rgba(255,215,0,0.04)", border: "1px solid rgba(255,215,0,0.15)", borderRadius: 14, padding: "28px 32px", marginBottom: 32 }}>
          <div style={{ fontSize: 9, letterSpacing: "0.3em", color: "#FFD700", fontWeight: 800, marginBottom: 12 }}>THIS WEEK'S STORY</div>
          <p style={{ fontSize: 14, lineHeight: 1.8, color: "rgba(255,255,255,0.7)", margin: 0 }}>
            {winner.name} has dominated the crown rankings this season, pulling ahead with a surge in vote velocity and cross-genre discovery. Their {winner.genre} sound has resonated across every live room — from the Battle Zone to the Main Stage. Fans have spoken: this is the sound of the week.
          </p>
          <Link href={winner.articleRoute} style={{ display: "inline-block", marginTop: 18, fontSize: 10, fontWeight: 800, color: "#FFD700", letterSpacing: "0.1em", textDecoration: "none", borderBottom: "1px solid rgba(255,215,0,0.3)", paddingBottom: 2 }}>
            READ FULL FEATURE ARTICLE →
          </Link>
        </div>

        {/* Nav */}
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <Link href="/magazine/crown" style={{ fontSize: 10, fontWeight: 700, color: "#00FFFF", border: "1px solid rgba(0,255,255,0.2)", borderRadius: 7, padding: "9px 18px", textDecoration: "none" }}>
            CROWN RANKINGS
          </Link>
          <Link href="/magazine" style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.4)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 7, padding: "9px 18px", textDecoration: "none" }}>
            MAGAZINE HOME
          </Link>
          <Link href="/battles" style={{ fontSize: 10, fontWeight: 700, color: "#FF2DAA", border: "1px solid rgba(255,45,170,0.2)", borderRadius: 7, padding: "9px 18px", textDecoration: "none" }}>
            LIVE BATTLES
          </Link>
        </div>
      </div>
    </section>
  );
}
