"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  SEED_GIVEAWAYS,
  RECENT_WINNERS,
  enterGiveaway,
  formatPrizeValue,
  formatCountdown,
  getDeadlineMs,
  type Giveaway,
} from "@/lib/giveaway/giveawayEngine";

const TIER_COLOR: Record<string, string> = {
  open:    "#00FFFF",
  member:  "#FF2DAA",
  diamond: "#AA2DFF",
};

const HOW_IT_WORKS = [
  { icon: "🆓", title: "Always Free",      desc: "No purchase necessary. Every open giveaway is free to enter for all registered members." },
  { icon: "🎲", title: "Random Draw",      desc: "Winners are selected by cryptographic random draw after the entry deadline closes." },
  { icon: "🏆", title: "Instant Notice",   desc: "Winners receive an in-app notification and email with prize claim instructions." },
  { icon: "💎", title: "Tier Benefits",    desc: "Diamond & Member tier giveaways have smaller entry pools — better odds for subscribers." },
];

function useCountdown(deadlineMs: number) {
  const [display, setDisplay] = useState(() => formatCountdown(getDeadlineMs(deadlineMs)));
  useEffect(() => {
    const id = setInterval(() => setDisplay(formatCountdown(getDeadlineMs(deadlineMs))), 1000);
    return () => clearInterval(id);
  }, [deadlineMs]);
  return display;
}

function GiveawayCard({ g, onEnter, entered }: { g: Giveaway; onEnter: (id: string) => void; entered: boolean }) {
  const countdown = useCountdown(g.entryDeadline);
  const tc = TIER_COLOR[g.tier] ?? "#00FFFF";

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -3, boxShadow: `0 12px 40px ${tc}22` }}
      transition={{ duration: 0.25 }}
      style={{ background: tc + "08", border: "1px solid " + tc + "28", borderRadius: 16, padding: "22px 20px", display: "flex", flexDirection: "column", gap: 12, position: "relative", overflow: "hidden" }}>

      {/* Tier badge */}
      <div style={{ position: "absolute", top: 14, right: 14, fontSize: 9, fontWeight: 800, letterSpacing: "0.18em", padding: "3px 10px", borderRadius: 20, background: tc + "20", color: tc, border: "1px solid " + tc + "40" }}>
        {g.tier.toUpperCase()}
      </div>

      {/* Sponsor */}
      <div style={{ fontSize: 9, color: "rgba(255,255,255,0.35)", letterSpacing: "0.12em", fontWeight: 700 }}>
        {g.sponsorName}
      </div>

      {/* Title */}
      <div style={{ fontSize: 16, fontWeight: 800, color: "#fff", lineHeight: 1.25, paddingRight: 60 }}>
        {g.title}
      </div>

      {/* Prize */}
      <div style={{ fontSize: 12, color: "rgba(255,255,255,0.55)", lineHeight: 1.5 }}>
        {g.prize}
      </div>

      {/* Stats row */}
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 12 }}>
        <div>
          <div style={{ fontSize: 8, color: tc, fontWeight: 800, letterSpacing: "0.15em", marginBottom: 2 }}>VALUE</div>
          <div style={{ fontSize: 15, fontWeight: 900, color: "#FFD700" }}>{formatPrizeValue(g.prizeValueCents)}</div>
        </div>
        <div>
          <div style={{ fontSize: 8, color: "rgba(255,255,255,0.4)", fontWeight: 800, letterSpacing: "0.15em", marginBottom: 2 }}>ENTRIES</div>
          <div style={{ fontSize: 15, fontWeight: 900 }}>{g.totalEntries.toLocaleString()}</div>
        </div>
        <div style={{ marginLeft: "auto" }}>
          <div style={{ fontSize: 8, color: "rgba(255,255,255,0.4)", fontWeight: 800, letterSpacing: "0.15em", marginBottom: 2 }}>CLOSES IN</div>
          <div style={{ fontSize: 14, fontWeight: 900, color: "#00FF88" }}>{countdown}</div>
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: "flex", gap: 8 }}>
        {entered ? (
          <div style={{ flex: 1, textAlign: "center", padding: "10px", fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.4)", background: "rgba(255,255,255,0.04)", borderRadius: 8, border: "1px solid rgba(255,255,255,0.08)" }}>
            Entered ✓
          </div>
        ) : (
          <motion.button
            whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            onClick={() => onEnter(g.id)}
            style={{ flex: 1, padding: "10px", fontSize: 11, fontWeight: 800, letterSpacing: "0.1em", color: "#050510", background: "linear-gradient(135deg," + tc + ",#00FF88)", border: "none", borderRadius: 8, cursor: "pointer" }}>
            ENTER NOW
          </motion.button>
        )}
        <Link href={"/giveaway/" + g.id}
          style={{ padding: "10px 16px", fontSize: 11, fontWeight: 700, color: tc, background: tc + "10", border: "1px solid " + tc + "30", borderRadius: 8, textDecoration: "none" }}>
          Details →
        </Link>
      </div>
    </motion.div>
  );
}

export default function GiveawayPage() {
  const [enteredIds, setEnteredIds] = useState<Set<string>>(new Set());
  const [modalId,    setModalId]    = useState<string | null>(null);
  const [modalDone,  setModalDone]  = useState(false);

  const active = SEED_GIVEAWAYS.filter(g => g.status === "active");

  function handleEnter(id: string) {
    setModalId(id);
    setModalDone(false);
  }

  function confirmEnter() {
    if (!modalId) return;
    enterGiveaway("demo-user", modalId, "organic");
    setEnteredIds(prev => new Set([...prev, modalId!]));
    setModalDone(true);
    setTimeout(() => setModalId(null), 2200);
  }

  const modalGiveaway = modalId ? SEED_GIVEAWAYS.find(g => g.id === modalId) : null;

  return (
    <main style={{ minHeight: "100vh", background: "radial-gradient(circle at 50% -10%, rgba(0,255,255,0.08), transparent 50%), #050510", color: "#fff", paddingBottom: 100 }}>

      {/* Entry confirmation modal */}
      <AnimatePresence>
        {modalId && (
          <motion.div key="overlay"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => !modalDone && setModalId(null)}
            style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              style={{ background: "#0a0a1a", border: "1px solid rgba(0,255,255,0.2)", borderRadius: 16, padding: "32px 28px", maxWidth: 400, width: "100%", textAlign: "center" }}>
              {modalDone ? (
                <>
                  <div style={{ fontSize: 48, marginBottom: 16 }}>🎉</div>
                  <div style={{ fontSize: 18, fontWeight: 900, color: "#00FF88", marginBottom: 8 }}>You&apos;re in!</div>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }}>Good luck — winners announced after the deadline.</div>
                </>
              ) : (
                <>
                  <div style={{ fontSize: 32, marginBottom: 14 }}>🎁</div>
                  <div style={{ fontSize: 15, fontWeight: 800, color: "#fff", marginBottom: 8 }}>{modalGiveaway?.title}</div>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", marginBottom: 6 }}>{modalGiveaway?.prize}</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#FFD700", marginBottom: 24 }}>{modalGiveaway ? formatPrizeValue(modalGiveaway.prizeValueCents) : ""} value</div>
                  <div style={{ display: "flex", gap: 10 }}>
                    <button onClick={() => setModalId(null)} style={{ flex: 1, padding: "11px", fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.5)", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8, cursor: "pointer" }}>
                      Cancel
                    </button>
                    <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={confirmEnter} style={{ flex: 2, padding: "11px", fontSize: 12, fontWeight: 800, letterSpacing: "0.1em", color: "#050510", background: "linear-gradient(135deg,#00FFFF,#00FF88)", border: "none", borderRadius: 8, cursor: "pointer" }}>
                      CONFIRM ENTRY
                    </motion.button>
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero */}
      <section style={{ maxWidth: 860, margin: "0 auto", padding: "52px 24px 36px", textAlign: "center" }}>
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <Link href="/store" style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.3em", color: "rgba(255,255,255,0.25)", textDecoration: "none", display: "block", marginBottom: 20 }}>← TMI STORE</Link>
          <div style={{ fontSize: 9, letterSpacing: "0.4em", color: "#00FFFF", fontWeight: 800, marginBottom: 14 }}>TMI · GIVEAWAYS</div>
          <h1 style={{ fontSize: "clamp(2rem,5vw,3rem)", fontWeight: 900, margin: "0 0 14px", lineHeight: 1.1 }}>
            Win Big.<br />
            <span style={{ color: "#FFD700" }}>Enter Free.</span>
          </h1>
          <p style={{ fontSize: 15, color: "rgba(255,255,255,0.5)", maxWidth: 480, margin: "0 auto 0", lineHeight: 1.7 }}>
            Sponsors drop prizes daily — gear, cash, season passes, and more. One click to enter.
          </p>
        </motion.div>
      </section>

      {/* Active giveaways grid */}
      <section style={{ maxWidth: 1000, margin: "0 auto", padding: "0 24px 52px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, flexWrap: "wrap", gap: 8 }}>
          <div style={{ fontSize: 9, letterSpacing: "0.3em", color: "#00FFFF", fontWeight: 800 }}>
            ACTIVE NOW · {active.length} GIVEAWAY{active.length !== 1 ? "S" : ""}
          </div>
          <Link href="/sponsors/new" style={{ fontSize: 11, color: "#FF2DAA", textDecoration: "none", fontWeight: 700, padding: "7px 16px", border: "1px solid rgba(255,45,170,0.3)", borderRadius: 20 }}>
            + Sponsor a Giveaway
          </Link>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))", gap: 16 }}>
          {active.map(g => (
            <GiveawayCard
              key={g.id}
              g={g}
              onEnter={handleEnter}
              entered={enteredIds.has(g.id)}
            />
          ))}
        </div>
        {active.length === 0 && (
          <div style={{ textAlign: "center", padding: "60px 20px", color: "rgba(255,255,255,0.3)", fontSize: 14 }}>
            No active giveaways right now — check back soon.
          </div>
        )}
      </section>

      {/* How it works */}
      <section style={{ maxWidth: 860, margin: "0 auto", padding: "0 24px 52px" }}>
        <div style={{ fontSize: 9, letterSpacing: "0.35em", color: "rgba(255,255,255,0.3)", fontWeight: 800, marginBottom: 20, textAlign: "center" }}>HOW IT WORKS</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(180px,1fr))", gap: 12 }}>
          {HOW_IT_WORKS.map(item => (
            <div key={item.title} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, padding: "20px 16px", textAlign: "center" }}>
              <div style={{ fontSize: 30, marginBottom: 12 }}>{item.icon}</div>
              <div style={{ fontSize: 13, fontWeight: 800, color: "#fff", marginBottom: 6 }}>{item.title}</div>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", lineHeight: 1.6 }}>{item.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Recent winners */}
      <section style={{ maxWidth: 700, margin: "0 auto", padding: "0 24px 52px" }}>
        <div style={{ fontSize: 9, letterSpacing: "0.35em", color: "rgba(255,255,255,0.3)", fontWeight: 800, marginBottom: 16 }}>RECENT WINNERS</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {RECENT_WINNERS.map((w, i) => (
            <motion.div key={i}
              initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}
              style={{ display: "flex", alignItems: "center", gap: 14, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 10, padding: "14px 16px" }}>
              <span style={{ fontSize: 22, flexShrink: 0 }}>🏆</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#FFD700" }}>{w.winnerName}</div>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.5)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{w.prize}</div>
              </div>
              <div style={{ textAlign: "right", flexShrink: 0 }}>
                <div style={{ fontSize: 9, color: "rgba(255,255,255,0.35)" }}>{w.sponsorName}</div>
                <div style={{ fontSize: 9, color: "rgba(255,255,255,0.2)", marginTop: 2 }}>
                  {Math.floor((Date.now() - w.announcedAt) / (1000 * 60 * 60 * 24))}d ago
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Chain links */}
      <section style={{ maxWidth: 700, margin: "0 auto", padding: "0 24px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          {[
            { href: "/store/prizes",    label: "Prize Catalog →",    color: "#FFD700" },
            { href: "/sponsors/new",    label: "Sponsor a Prize →",  color: "#FF2DAA" },
            { href: "/rewards",         label: "Rewards →",          color: "#AA2DFF" },
            { href: "/achievements",    label: "Achievements →",     color: "#00FFFF" },
          ].map(l => (
            <Link key={l.href} href={l.href} style={{ border: "1px solid " + l.color + "30", borderRadius: 10, background: l.color + "08", color: l.color, textDecoration: "none", padding: "12px 14px", fontSize: 13, display: "block", fontWeight: 700 }}>
              {l.label}
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
