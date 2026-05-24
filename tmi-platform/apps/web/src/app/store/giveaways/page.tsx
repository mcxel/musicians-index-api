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

function Countdown({ deadline }: { deadline: number }) {
  const [display, setDisplay] = useState(() => formatCountdown(getDeadlineMs(deadline)));
  useEffect(() => {
    const id = setInterval(() => setDisplay(formatCountdown(getDeadlineMs(deadline))), 1000);
    return () => clearInterval(id);
  }, [deadline]);
  return <span>{display}</span>;
}

function GiveawayCard({
  g,
  entered,
  onEnter,
}: {
  g: Giveaway;
  entered: boolean;
  onEnter: (id: string) => void;
}) {
  const tc = TIER_COLOR[g.tier] ?? "#00FFFF";

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, boxShadow: `0 16px 48px ${tc}20` }}
      transition={{ duration: 0.22 }}
      style={{
        background: tc + "07",
        border: "1px solid " + tc + "25",
        borderRadius: 18,
        padding: "24px 20px",
        display: "flex",
        flexDirection: "column",
        gap: 14,
        position: "relative",
        overflow: "hidden",
      }}>

      {/* Tier badge */}
      <div style={{ position: "absolute", top: 16, right: 16, fontSize: 9, fontWeight: 800, letterSpacing: "0.2em", padding: "3px 10px", borderRadius: 20, background: tc + "1a", color: tc, border: "1px solid " + tc + "45" }}>
        {g.tier.toUpperCase()}
      </div>

      {/* Sponsor logo area */}
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 36, height: 36, borderRadius: 8, background: tc + "15", border: "1px solid " + tc + "30", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>
          🎁
        </div>
        <div>
          <div style={{ fontSize: 9, color: "rgba(255,255,255,0.35)", fontWeight: 700, letterSpacing: "0.12em" }}>SPONSORED BY</div>
          <div style={{ fontSize: 12, fontWeight: 800, color: tc }}>{g.sponsorName}</div>
        </div>
      </div>

      {/* Title + prize */}
      <div style={{ paddingRight: 70 }}>
        <div style={{ fontSize: 17, fontWeight: 900, color: "#fff", lineHeight: 1.2, marginBottom: 6 }}>{g.title}</div>
        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.55)", lineHeight: 1.5 }}>{g.prize}</div>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 14 }}>
        <div>
          <div style={{ fontSize: 8, color: "#FFD700", fontWeight: 800, letterSpacing: "0.12em", marginBottom: 3 }}>VALUE</div>
          <div style={{ fontSize: 14, fontWeight: 900, color: "#FFD700" }}>{formatPrizeValue(g.prizeValueCents)}</div>
        </div>
        <div>
          <div style={{ fontSize: 8, color: "rgba(255,255,255,0.35)", fontWeight: 800, letterSpacing: "0.12em", marginBottom: 3 }}>ENTRIES</div>
          <motion.div
            key={g.totalEntries}
            initial={{ color: "#00FFFF", scale: 1.15 }}
            animate={{ color: "#ffffff", scale: 1 }}
            transition={{ duration: 0.4 }}
            style={{ fontSize: 14, fontWeight: 900 }}>
            {g.totalEntries.toLocaleString()}
          </motion.div>
        </div>
        <div>
          <div style={{ fontSize: 8, color: "#00FF88", fontWeight: 800, letterSpacing: "0.12em", marginBottom: 3 }}>CLOSES</div>
          <div style={{ fontSize: 13, fontWeight: 800, color: "#00FF88" }}>
            <Countdown deadline={g.entryDeadline} />
          </div>
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: "flex", gap: 8 }}>
        {entered ? (
          <div style={{ flex: 1, textAlign: "center", padding: "11px", fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.4)", background: "rgba(255,255,255,0.04)", borderRadius: 9, border: "1px solid rgba(255,255,255,0.08)" }}>
            Entered ✓
          </div>
        ) : (
          <motion.button
            whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            onClick={() => onEnter(g.id)}
            style={{ flex: 1, padding: "11px", fontSize: 12, fontWeight: 800, letterSpacing: "0.1em", color: "#050510", background: "linear-gradient(135deg," + tc + ",#00FF88)", border: "none", borderRadius: 9, cursor: "pointer" }}>
            ENTER NOW
          </motion.button>
        )}
        <Link href={"/giveaway/" + g.id}
          style={{ padding: "11px 18px", fontSize: 11, fontWeight: 700, color: tc, background: tc + "0f", border: "1px solid " + tc + "30", borderRadius: 9, textDecoration: "none", whiteSpace: "nowrap" }}>
          Details
        </Link>
      </div>
    </motion.article>
  );
}

export default function StoreGiveawaysPage() {
  const [enteredIds, setEnteredIds] = useState<Set<string>>(new Set());
  const [modalId,    setModalId]    = useState<string | null>(null);
  const [modalDone,  setModalDone]  = useState(false);
  const [filter,     setFilter]     = useState<"all" | "open" | "member" | "diamond">("all");

  const all    = SEED_GIVEAWAYS.filter(g => g.status === "active");
  const shown  = filter === "all" ? all : all.filter(g => g.tier === filter);

  function handleEnter(id: string) {
    setModalId(id);
    setModalDone(false);
  }

  function confirmEnter() {
    if (!modalId) return;
    enterGiveaway("demo-user", modalId, "organic");
    setEnteredIds(prev => new Set([...prev, modalId!]));
    setModalDone(true);
    setTimeout(() => setModalId(null), 2400);
  }

  const modalGiveaway = modalId ? SEED_GIVEAWAYS.find(g => g.id === modalId) : null;

  return (
    <main style={{ minHeight: "100vh", background: "radial-gradient(circle at 50% 0%, rgba(0,255,255,0.07), transparent 50%), #050510", color: "#fff", paddingBottom: 100 }}>

      {/* Entry modal */}
      <AnimatePresence>
        {modalId && (
          <motion.div key="overlay"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => !modalDone && setModalId(null)}
            style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.72)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
            <motion.div
              initial={{ scale: 0.88, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.88, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              style={{ background: "#080818", border: "1px solid rgba(0,255,255,0.22)", borderRadius: 18, padding: "36px 28px", maxWidth: 420, width: "100%", textAlign: "center" }}>
              {modalDone ? (
                <>
                  <motion.div initial={{ scale: 0.5 }} animate={{ scale: 1 }} style={{ fontSize: 56, marginBottom: 18 }}>🎉</motion.div>
                  <div style={{ fontSize: 20, fontWeight: 900, color: "#00FF88", marginBottom: 10 }}>You&apos;re in!</div>
                  <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", lineHeight: 1.6 }}>Entry confirmed. Winners are announced after the deadline.</div>
                </>
              ) : modalGiveaway ? (
                <>
                  <div style={{ fontSize: 36, marginBottom: 16 }}>🎁</div>
                  <div style={{ fontSize: 16, fontWeight: 900, color: "#fff", marginBottom: 8 }}>{modalGiveaway.title}</div>
                  <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", marginBottom: 6, lineHeight: 1.5 }}>{modalGiveaway.prize}</div>
                  <div style={{ fontSize: 15, fontWeight: 800, color: "#FFD700", marginBottom: 28 }}>
                    {formatPrizeValue(modalGiveaway.prizeValueCents)} value
                  </div>
                  <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", marginBottom: 20 }}>
                    Free entry · One per account · No purchase necessary
                  </div>
                  <div style={{ display: "flex", gap: 10 }}>
                    <button onClick={() => setModalId(null)} style={{ flex: 1, padding: "12px", fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.5)", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 9, cursor: "pointer" }}>
                      Cancel
                    </button>
                    <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={confirmEnter} style={{ flex: 2, padding: "12px", fontSize: 13, fontWeight: 800, letterSpacing: "0.1em", color: "#050510", background: "linear-gradient(135deg,#00FFFF,#00FF88)", border: "none", borderRadius: 9, cursor: "pointer" }}>
                      CONFIRM ENTRY
                    </motion.button>
                  </div>
                </>
              ) : null}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <header style={{ maxWidth: 1000, margin: "0 auto", padding: "48px 24px 32px" }}>
        <Link href="/store" style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.28em", color: "rgba(255,255,255,0.22)", textDecoration: "none" }}>← TMI STORE</Link>
        <div style={{ marginTop: 20 }}>
          <div style={{ fontSize: 9, letterSpacing: "0.4em", color: "#00FFFF", fontWeight: 800, marginBottom: 12 }}>GIVEAWAYS</div>
          <h1 style={{ fontSize: "clamp(1.8rem,4vw,2.8rem)", fontWeight: 900, margin: "0 0 12px", lineHeight: 1.1 }}>
            Sponsor Giveaways
          </h1>
          <p style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", maxWidth: 520, lineHeight: 1.7, margin: "0 0 28px" }}>
            Enter for free. Sponsors drop gear, cash, passes, and exclusive prizes daily. One entry per account.
          </p>

          {/* Tier filters */}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {(["all", "open", "member", "diamond"] as const).map(t => (
              <button key={t} onClick={() => setFilter(t)} style={{ padding: "7px 18px", fontSize: 10, fontWeight: 800, letterSpacing: "0.14em", borderRadius: 20, border: "1px solid " + (filter === t ? (t === "all" ? "#00FFFF" : TIER_COLOR[t]) : "rgba(255,255,255,0.12)"), background: filter === t ? (t === "all" ? "rgba(0,255,255,0.12)" : TIER_COLOR[t] + "18") : "transparent", color: filter === t ? (t === "all" ? "#00FFFF" : TIER_COLOR[t]) : "rgba(255,255,255,0.4)", cursor: "pointer", textTransform: "uppercase" }}>
                {t === "all" ? "All Tiers" : t}
              </button>
            ))}
            <Link href="/sponsors/new" style={{ padding: "7px 18px", fontSize: 10, fontWeight: 800, letterSpacing: "0.14em", borderRadius: 20, border: "1px solid rgba(255,45,170,0.35)", color: "#FF2DAA", textDecoration: "none", marginLeft: "auto" }}>
              + Sponsor a Giveaway
            </Link>
          </div>
        </div>
      </header>

      {/* Giveaway grid */}
      <section style={{ maxWidth: 1000, margin: "0 auto", padding: "0 24px 52px" }}>
        {shown.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 20px", color: "rgba(255,255,255,0.3)", fontSize: 14 }}>
            No active giveaways in this tier right now.
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))", gap: 16 }}>
            {shown.map((g, i) => (
              <motion.div key={g.id} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
                <GiveawayCard g={g} entered={enteredIds.has(g.id)} onEnter={handleEnter} />
              </motion.div>
            ))}
          </div>
        )}
      </section>

      {/* Recent winners strip */}
      <section style={{ maxWidth: 700, margin: "0 auto", padding: "0 24px 52px" }}>
        <div style={{ fontSize: 9, letterSpacing: "0.35em", color: "rgba(255,255,255,0.28)", fontWeight: 800, marginBottom: 14 }}>RECENT WINNERS</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {RECENT_WINNERS.map((w, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 14, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 10, padding: "12px 16px" }}>
              <span style={{ fontSize: 20 }}>🏆</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: "#FFD700" }}>{w.winnerName}</span>
                <span style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", marginLeft: 8 }}>{w.prize}</span>
              </div>
              <div style={{ fontSize: 9, color: "rgba(255,255,255,0.25)", flexShrink: 0, textAlign: "right" }}>
                <div>{w.sponsorName}</div>
                <div>{Math.floor((Date.now() - w.announcedAt) / 86400000)}d ago</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Bottom CTAs */}
      <section style={{ maxWidth: 700, margin: "0 auto", padding: "0 24px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <Link href="/store/prizes" style={{ display: "block", padding: "16px", background: "rgba(255,215,0,0.06)", border: "1px solid rgba(255,215,0,0.22)", borderRadius: 12, textDecoration: "none", color: "#FFD700", fontWeight: 700, fontSize: 13, textAlign: "center" }}>
            Prize Catalog →
          </Link>
          <Link href="/giveaway" style={{ display: "block", padding: "16px", background: "rgba(0,255,255,0.05)", border: "1px solid rgba(0,255,255,0.2)", borderRadius: 12, textDecoration: "none", color: "#00FFFF", fontWeight: 700, fontSize: 13, textAlign: "center" }}>
            Giveaway Hub →
          </Link>
        </div>
      </section>
    </main>
  );
}
