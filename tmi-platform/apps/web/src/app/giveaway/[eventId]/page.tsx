"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  getGiveaway,
  getTimeRemaining,
  SEED_GIVEAWAYS,
  enterGiveaway,
  formatPrizeValue,
  RECENT_WINNERS,
  type Giveaway,
} from "@/lib/giveaway/GiveawayEngine";

const TIER_CONFIG = {
  open:    { label: "OPEN",    color: "#00FFFF" },
  member:  { label: "MEMBER",  color: "#FF2DAA" },
  diamond: { label: "DIAMOND", color: "#AA2DFF" },
};

const HOW_IT_WORKS = [
  { step: "1", title: "Create an Account", desc: "Sign up free — all roles can enter open giveaways." },
  { step: "2", title: "Click Enter Now",   desc: "One entry per account, per giveaway. No purchase needed." },
  { step: "3", title: "Wait for the Draw", desc: "Winners are randomly selected after the deadline." },
  { step: "4", title: "Get Notified",      desc: "Winners receive an in-app alert and email with prize instructions." },
];

export default function GiveawayDetailPage({ params }: { params: { eventId: string } }) {
  const giveaway: Giveaway | undefined =
    getGiveaway(params.eventId) ?? SEED_GIVEAWAYS[0];

  const [entered,  setEntered]  = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [success,  setSuccess]  = useState(false);
  const [errMsg,   setErrMsg]   = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState("");
  const [count,    setCount]    = useState(giveaway?.totalEntries ?? 0);

  useEffect(() => {
    if (!giveaway) return;
    const update = () => setTimeLeft(getTimeRemaining(giveaway.entryDeadline));
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [giveaway]);

  if (!giveaway) {
    return (
      <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 16 }}>
        <div style={{ fontSize: 40 }}>🎁</div>
        <div style={{ fontSize: 14, color: "rgba(255,255,255,0.4)" }}>Giveaway not found</div>
        <Link href="/store/giveaways" style={{ padding: "10px 24px", background: "#00FFFF", color: "#050510", borderRadius: 8, textDecoration: "none", fontWeight: 800, fontSize: 11, letterSpacing: "0.12em" }}>
          ALL GIVEAWAYS
        </Link>
      </main>
    );
  }

  const tier = TIER_CONFIG[giveaway.tier];
  const isActive = giveaway.status === "active";
  const isEnded  = giveaway.status === "ended" || giveaway.status === "announced";

  async function handleEnter() {
    if (entered || loading || !isActive) return;
    setLoading(true);
    setErrMsg(null);
    await new Promise(r => setTimeout(r, 700));
    const result = enterGiveaway("demo-user", giveaway!.id, "organic");
    setLoading(false);
    if (result.success) {
      setEntered(true);
      setSuccess(true);
      setCount(c => c + 1);
      setTimeout(() => setSuccess(false), 4500);
    } else {
      setErrMsg(result.error ?? "Could not enter.");
    }
  }

  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", paddingBottom: 100 }}>

      {/* Nav */}
      <div style={{ maxWidth: 700, margin: "0 auto", padding: "24px 20px 0", display: "flex", gap: 16, alignItems: "center" }}>
        <Link href="/store/giveaways" style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.15em", color: "rgba(255,255,255,0.3)", textDecoration: "none" }}>
          ← ALL GIVEAWAYS
        </Link>
      </div>

      {/* Header */}
      <header style={{ maxWidth: 700, margin: "0 auto", padding: "28px 20px 32px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>

        {/* Status row */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
          {isActive && (
            <motion.span
              animate={{ scale: [1, 1.35, 1] }}
              transition={{ duration: 1.3, repeat: Infinity }}
              style={{ width: 8, height: 8, borderRadius: "50%", background: "#00FF88", display: "inline-block", flexShrink: 0 }} />
          )}
          <span style={{ fontSize: 8, fontWeight: 800, letterSpacing: "0.25em", color: isActive ? "#00FF88" : "rgba(255,255,255,0.3)" }}>
            {isActive ? "LIVE NOW" : isEnded ? "ENDED" : "DRAWING"}
          </span>
          <span style={{ fontSize: 8, fontWeight: 800, letterSpacing: "0.2em", padding: "3px 10px", borderRadius: 20, background: tier.color + "18", color: tier.color, border: "1px solid " + tier.color + "40" }}>
            {tier.label} TIER
          </span>
          {giveaway.sponsorName && (
            <span style={{ fontSize: 8, color: "rgba(255,255,255,0.25)", marginLeft: "auto" }}>
              Sponsored by {giveaway.sponsorName}
            </span>
          )}
        </div>

        <h1 style={{ fontSize: "clamp(1.5rem,4vw,2.2rem)", fontWeight: 900, lineHeight: 1.15, marginBottom: 10 }}>
          {giveaway.title}
        </h1>
        <p style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", lineHeight: 1.6, marginBottom: 24 }}>
          {giveaway.prize}
        </p>

        {/* Stats row */}
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          {isActive && (
            <div style={{ background: "rgba(0,255,136,0.07)", border: "1px solid rgba(0,255,136,0.2)", borderRadius: 10, padding: "10px 18px", minWidth: 110 }}>
              <div style={{ fontSize: 8, color: "#00FF88", fontWeight: 800, letterSpacing: "0.15em", marginBottom: 3 }}>TIME LEFT</div>
              <div style={{ fontSize: 17, fontWeight: 900, color: "#00FF88" }}>{timeLeft}</div>
            </div>
          )}
          <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, padding: "10px 18px" }}>
            <div style={{ fontSize: 8, color: "rgba(255,255,255,0.4)", fontWeight: 800, letterSpacing: "0.15em", marginBottom: 3 }}>ENTRIES</div>
            <motion.div
              key={count}
              initial={{ scale: 1.25, color: "#00FFFF" }}
              animate={{ scale: 1, color: "#ffffff" }}
              transition={{ duration: 0.4 }}
              style={{ fontSize: 17, fontWeight: 900 }}>
              {count.toLocaleString()}
            </motion.div>
          </div>
          <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, padding: "10px 18px" }}>
            <div style={{ fontSize: 8, color: "rgba(255,255,255,0.4)", fontWeight: 800, letterSpacing: "0.15em", marginBottom: 3 }}>PRIZE VALUE</div>
            <div style={{ fontSize: 17, fontWeight: 900, color: "#FFD700" }}>{formatPrizeValue(giveaway.prizeValueCents)}</div>
          </div>
        </div>
      </header>

      <div style={{ maxWidth: 700, margin: "0 auto", padding: "36px 20px" }}>

        {/* Prize details */}
        <section aria-label="Prize details" style={{ marginBottom: 36 }}>
          <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.28em", color: "rgba(255,255,255,0.3)", marginBottom: 14 }}>THE PRIZE</div>
          <div style={{ background: "rgba(255,215,0,0.05)", border: "1px solid rgba(255,215,0,0.18)", borderRadius: 12, padding: "22px 20px", display: "flex", gap: 16, alignItems: "flex-start" }}>
            <span style={{ fontSize: 40, flexShrink: 0 }}>🏆</span>
            <div>
              <div style={{ fontSize: 16, fontWeight: 800, color: "#FFD700", marginBottom: 6 }}>{giveaway.prize}</div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>Provided by {giveaway.sponsorName} · Estimated value {formatPrizeValue(giveaway.prizeValueCents)}</div>
            </div>
          </div>
        </section>

        {/* Entry CTA */}
        <section aria-label="Enter giveaway" style={{ marginBottom: 48 }}>
          <AnimatePresence mode="wait">
            {success ? (
              <motion.div key="success"
                initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                style={{ textAlign: "center", padding: "36px 20px", background: "rgba(0,255,136,0.06)", border: "1px solid rgba(0,255,136,0.22)", borderRadius: 14 }}>
                <div style={{ fontSize: 44, marginBottom: 14 }}>🎉</div>
                <div style={{ fontSize: 18, fontWeight: 900, color: "#00FF88", marginBottom: 8 }}>You&apos;re in!</div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.45)" }}>Good luck — winners announced after the deadline closes.</div>
              </motion.div>
            ) : (
              <motion.div key="cta" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                {entered ? (
                  <div style={{ textAlign: "center", padding: "28px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,0.5)" }}>Entry confirmed ✓</div>
                  </div>
                ) : isActive ? (
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", marginBottom: 20 }}>
                      Free to enter · One entry per account
                      {giveaway.tier !== "open" && " · " + giveaway.tier.charAt(0).toUpperCase() + giveaway.tier.slice(1) + " members only"}
                    </div>
                    {errMsg && (
                      <div style={{ fontSize: 11, color: "#FF5555", marginBottom: 14, padding: "8px 16px", background: "rgba(255,85,85,0.08)", borderRadius: 8, border: "1px solid rgba(255,85,85,0.2)" }}>
                        {errMsg}
                      </div>
                    )}
                    <motion.button
                      whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                      onClick={handleEnter}
                      disabled={loading}
                      aria-label="Enter giveaway"
                      style={{ padding: "15px 44px", fontSize: 12, fontWeight: 800, letterSpacing: "0.16em", color: "#050510", background: "linear-gradient(135deg,#00FFFF,#00FF88)", border: "none", borderRadius: 10, cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1 }}>
                      {loading ? "ENTERING..." : "ENTER NOW — FREE"}
                    </motion.button>
                  </div>
                ) : isEnded ? (
                  <div style={{ textAlign: "center", padding: "28px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 12 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,0.3)" }}>This giveaway has ended</div>
                    {giveaway.winnerId && (
                      <div style={{ fontSize: 12, color: "#FFD700", marginTop: 10 }}>
                        Winner: {giveaway.winnerName ?? giveaway.winnerId}
                      </div>
                    )}
                  </div>
                ) : (
                  <div style={{ textAlign: "center", padding: "28px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 12 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,0.3)" }}>Drawing in progress...</div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        {/* How it works */}
        <section aria-label="How it works" style={{ marginBottom: 52 }}>
          <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.28em", color: "rgba(255,255,255,0.3)", marginBottom: 20 }}>HOW IT WORKS</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(150px,1fr))", gap: 12 }}>
            {HOW_IT_WORKS.map(item => (
              <div key={item.step} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 10, padding: "16px 14px" }}>
                <div style={{ fontSize: 22, fontWeight: 900, color: "#00FFFF", marginBottom: 8, lineHeight: 1 }}>{item.step}</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#fff", marginBottom: 4 }}>{item.title}</div>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.45)", lineHeight: 1.5 }}>{item.desc}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Recent winners */}
        <section aria-label="Recent winners" style={{ marginBottom: 40 }}>
          <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.28em", color: "rgba(255,255,255,0.3)", marginBottom: 16 }}>RECENT WINNERS</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {RECENT_WINNERS.map((w, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.07 }}
                style={{ display: "flex", alignItems: "center", gap: 14, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 10, padding: "14px 16px" }}>
                <span style={{ fontSize: 22, flexShrink: 0 }}>🏆</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#FFD700" }}>{w.winnerName}</div>
                  <div style={{ fontSize: 10, color: "rgba(255,255,255,0.5)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{w.prize}</div>
                </div>
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <div style={{ fontSize: 9, color: "rgba(255,255,255,0.3)" }}>{w.sponsorName}</div>
                  <div style={{ fontSize: 9, color: "rgba(255,255,255,0.2)", marginTop: 2 }}>
                    {Math.floor((Date.now() - w.announcedAt) / (1000 * 60 * 60 * 24))}d ago
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* More giveaways */}
        <Link href="/store/giveaways"
          style={{ display: "block", padding: "16px 20px", background: "rgba(0,255,255,0.05)", border: "1px solid rgba(0,255,255,0.18)", borderRadius: 10, textDecoration: "none", color: "#00FFFF", fontSize: 13, fontWeight: 700, textAlign: "center" }}>
          Browse All Active Giveaways →
        </Link>
      </div>
    </main>
  );
}
