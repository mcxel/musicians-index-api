"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { getGiveaway, getTimeRemaining, type Giveaway } from "@/lib/giveaway/giveawayEngine";
import { SEED_GIVEAWAYS } from "@/lib/giveaway/giveawayEngine";

const STATUS_CONFIG = {
  active:    { label: "LIVE NOW",  color: "#00FF88", pulse: true  },
  upcoming:  { label: "UPCOMING",  color: "#FFD700", pulse: false },
  ended:     { label: "ENDED",     color: "#666",    pulse: false },
  cancelled: { label: "CANCELLED", color: "#FF5555", pulse: false },
};

export default function GiveawayPage({ params }: { params: { eventId: string } }) {
  const giveaway: Giveaway | undefined = getGiveaway(params.eventId)
    ?? SEED_GIVEAWAYS[0]; // fallback to first seed giveaway

  const [entered, setEntered]   = useState(false);
  const [loading, setLoading]   = useState(false);
  const [success, setSuccess]   = useState(false);
  const [timeLeft, setTimeLeft] = useState("");
  const [count, setCount]       = useState(giveaway?.entryCount ?? 0);

  useEffect(() => {
    if (!giveaway) return;
    const update = () => setTimeLeft(getTimeRemaining(giveaway.endAt));
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [giveaway]);

  if (!giveaway) {
    return (
      <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 16 }}>
        <div style={{ fontSize: 40 }}>🎁</div>
        <div style={{ fontSize: 14, color: "rgba(255,255,255,0.4)" }}>Giveaway not found</div>
        <Link href="/home/1" style={{ padding: "10px 24px", background: "#00FFFF", color: "#050510", borderRadius: 8, textDecoration: "none", fontWeight: 800, fontSize: 10, letterSpacing: "0.12em" }}>
          BACK TO HOME
        </Link>
      </main>
    );
  }

  const cfg = STATUS_CONFIG[giveaway.status];

  async function handleEnter() {
    if (entered || loading || !giveaway || giveaway.status !== "active") return;
    setLoading(true);
    await new Promise(r => setTimeout(r, 800));
    setEntered(true);
    setSuccess(true);
    setCount(c => c + 1);
    setLoading(false);
    setTimeout(() => setSuccess(false), 4000);
  }

  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", paddingBottom: 80 }}>

      {/* Back */}
      <div style={{ maxWidth: 680, margin: "0 auto", padding: "24px 20px 0" }}>
        <Link href="/home/1" style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.15em", color: "rgba(255,255,255,0.3)", textDecoration: "none" }}>
          ← BACK
        </Link>
      </div>

      {/* Header */}
      <header style={{ maxWidth: 680, margin: "0 auto", padding: "28px 20px 32px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
          <motion.span
            animate={cfg.pulse ? { scale: [1, 1.3, 1] } : {}}
            transition={{ duration: 1.2, repeat: cfg.pulse ? Infinity : 0 }}
            style={{ width: 8, height: 8, borderRadius: "50%", background: cfg.color, display: "inline-block" }} />
          <span style={{ fontSize: 8, fontWeight: 800, letterSpacing: "0.25em", color: cfg.color }}>{cfg.label}</span>
          {giveaway.sponsorName && (
            <span style={{ fontSize: 8, color: "rgba(255,255,255,0.25)", marginLeft: "auto" }}>
              Sponsored by {giveaway.sponsorName}
            </span>
          )}
        </div>

        <h1 style={{ fontSize: "clamp(1.4rem,4vw,2rem)", fontWeight: 900, lineHeight: 1.2, marginBottom: 10 }}>
          {giveaway.title}
        </h1>
        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", lineHeight: 1.5, marginBottom: 20 }}>
          {giveaway.description}
        </p>

        {/* Timer + count */}
        <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
          {giveaway.status === "active" && (
            <div style={{ background: "rgba(0,255,136,0.08)", border: "1px solid rgba(0,255,136,0.2)", borderRadius: 8, padding: "10px 16px" }}>
              <div style={{ fontSize: 8, color: "#00FF88", fontWeight: 800, letterSpacing: "0.15em", marginBottom: 2 }}>TIME LEFT</div>
              <div style={{ fontSize: 16, fontWeight: 900, color: "#00FF88" }}>{timeLeft}</div>
            </div>
          )}
          <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, padding: "10px 16px" }}>
            <div style={{ fontSize: 8, color: "rgba(255,255,255,0.4)", fontWeight: 800, letterSpacing: "0.15em", marginBottom: 2 }}>ENTRIES</div>
            <div style={{ fontSize: 16, fontWeight: 900 }}>{count.toLocaleString()}</div>
          </div>
          {giveaway.maxEntries && (
            <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, padding: "10px 16px" }}>
              <div style={{ fontSize: 8, color: "rgba(255,255,255,0.4)", fontWeight: 800, letterSpacing: "0.15em", marginBottom: 2 }}>MAX</div>
              <div style={{ fontSize: 16, fontWeight: 900 }}>{giveaway.maxEntries.toLocaleString()}</div>
            </div>
          )}
        </div>
      </header>

      <div style={{ maxWidth: 680, margin: "0 auto", padding: "32px 20px" }}>

        {/* Prizes */}
        <section aria-label="Prizes" style={{ marginBottom: 32 }}>
          <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.25em", color: "rgba(255,255,255,0.4)", marginBottom: 16 }}>
            PRIZES
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {giveaway.prizes.map((prize, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 14, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 10, padding: "14px 18px" }}>
                <span style={{ fontSize: 28, flexShrink: 0 }}>{prize.icon}</span>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#fff" }}>{prize.label}</div>
                  {prize.value && <div style={{ fontSize: 10, color: "#00FF88" }}>{prize.value}</div>}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section aria-label="Enter giveaway">
          <AnimatePresence mode="wait">
            {success ? (
              <motion.div key="success"
                initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                style={{ textAlign: "center", padding: "32px 20px", background: "rgba(0,255,136,0.06)", border: "1px solid rgba(0,255,136,0.2)", borderRadius: 12 }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>🎉</div>
                <div style={{ fontSize: 16, fontWeight: 900, color: "#00FF88", marginBottom: 6 }}>You're in!</div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>Good luck — winners announced after the event.</div>
              </motion.div>
            ) : (
              <motion.div key="cta" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                {entered ? (
                  <div style={{ textAlign: "center", padding: "24px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.5)" }}>You've already entered this giveaway ✓</div>
                  </div>
                ) : giveaway.status === "active" ? (
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", marginBottom: 16 }}>
                      {giveaway.freeToEnter ? "Free to enter — one entry per account" : "Entry required"}
                      {giveaway.requiresAuth && " • Must be logged in"}
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                      onClick={handleEnter}
                      disabled={loading}
                      aria-label="Enter giveaway"
                      style={{ padding: "14px 40px", fontSize: 11, fontWeight: 800, letterSpacing: "0.15em", color: "#050510", background: "linear-gradient(135deg,#00FF88,#00AABB)", border: "none", borderRadius: 8, cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1 }}>
                      {loading ? "ENTERING..." : "ENTER NOW — IT'S FREE"}
                    </motion.button>
                  </div>
                ) : (
                  <div style={{ textAlign: "center", padding: "24px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 12 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.3)" }}>
                      {giveaway.status === "upcoming" ? "This giveaway hasn't started yet" : "This giveaway has ended"}
                    </div>
                    {giveaway.status === "upcoming" && (
                      <div style={{ fontSize: 10, color: "#FFD700", marginTop: 8 }}>Starts {new Date(giveaway.startAt).toLocaleString()}</div>
                    )}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        {/* Other giveaways */}
        <section aria-label="More giveaways" style={{ marginTop: 48 }}>
          <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.25em", color: "rgba(255,255,255,0.3)", marginBottom: 16 }}>
            MORE GIVEAWAYS
          </div>
          <Link href="/giveaway"
            style={{ display: "block", padding: "14px 20px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 10, textDecoration: "none", color: "rgba(255,255,255,0.6)", fontSize: 12, fontWeight: 700 }}>
            Browse All Active Giveaways →
          </Link>
        </section>
      </div>
    </main>
  );
}
