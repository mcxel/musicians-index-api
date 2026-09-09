"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import PageShell from "@/components/layout/PageShell";
import HUDFrame from "@/components/hud/HUDFrame";
import FooterHUD from "@/components/hud/FooterHUD";
import Link from "next/link";
import { useRouter } from "next/navigation";

const TABS = ["PRIZES", "WINNERS", "AUDIENCE DROPS", "CLAIMS", "SPONSOR ITEMS", "BUNDLES"] as const;
type Tab = typeof TABS[number];

const PRIZE_POOL = [
  { name: "Monthly Idol Champion Feature", value: "XP + Billboard / Magazine feature", sponsor: "Platform", icon: "🏆", tier: "WINNER" },
  { name: "Cypher Champion Pack", value: "Beats + Sample Pack (when entitled)", sponsor: "Beat Bots", icon: "⚔️", tier: "WINNER" },
  { name: "Dirty Dozens Champion", value: "XP + crown badge (cash when funded)", sponsor: "Platform", icon: "😤", tier: "WINNER" },
  { name: "Runner-Up Recognition", value: "Profile feature + digital pack", sponsor: "Platform", icon: "🥈", tier: "RUNNER_UP" },
  { name: "Audience Engagement Drop", value: "Platform credits / cosmetics", sponsor: "Platform", icon: "🎰", tier: "AUDIENCE" },
  { name: "Participation Pack", value: "XP + seasonal cosmetics", sponsor: "Platform", icon: "⚡", tier: "CONSOLATION" },
];

const TIER_COLORS: Record<string, string> = {
  WINNER: "#FFD700",
  RUNNER_UP: "#C0C0C0",
  AUDIENCE: "#00FFFF",
  CONSOLATION: "#AA2DFF",
};

/** Honest empty — no fabricated past winners on public surfaces (Rule 20). */
const WINNERS_DATA: Array<{
  name: string;
  prize: string;
  date: string;
  role: string;
  rank: number;
  icon: string;
}> = [];

const AUDIENCE_DROPS = [
  { id: "drop_1", name: "Platform Credits Drop", desc: "Opens when a real sponsored drop is funded", ends: "TBA", entries: 0, icon: "🎰", color: "#00FFFF" },
  { id: "drop_2", name: "Exclusive Emote Pack", desc: "Unlocks from real season inventory", ends: "TBA", entries: 0, icon: "🎭", color: "#AA2DFF" },
  { id: "drop_3", name: "Artist Shoutout Pass", desc: "Requires a live artist session", ends: "TBA", entries: 0, icon: "📢", color: "#FF2DAA" },
  { id: "drop_4", name: "VIP Room Access", desc: "Granted from real entitlements only", ends: "TBA", entries: 0, icon: "🔑", color: "#FFD700" },
];

const SPONSOR_ITEMS = [
  { id: "sp_1", sponsor: "Open for sponsors", item: "Gear / mic kits", value: "Sponsor-funded", category: "GEAR", icon: "🎙️", color: "#FFD700" },
  { id: "sp_2", sponsor: "Open for sponsors", item: "Apparel drops", value: "Sponsor-funded", category: "CLOTHING", icon: "🧥", color: "#AA2DFF" },
  { id: "sp_3", sponsor: "TMI Platform", item: "XP + cosmetics (Launch Mode)", value: "Active", category: "PLATFORM", icon: "🌐", color: "#00FFFF" },
  { id: "sp_4", sponsor: "Open for sponsors", item: "Sample packs", value: "Sponsor-funded", category: "MUSIC", icon: "🎵", color: "#FF2DAA" },
  { id: "sp_5", sponsor: "TMI Platform", item: "Season early access badge", value: "When seasons launch", category: "PLATFORM", icon: "🏅", color: "#00FF88" },
];

const BUNDLES = [
  { id: "bnd_1", name: "Starter Artist Bundle", items: ["250 Credits", "2 Beat Upload Slots", "Artist Badge"], price: "$9.99", color: "#AA2DFF", icon: "🎤" },
  { id: "bnd_2", name: "Creator Power Bundle", items: ["1,000 Credits", "5 Beat Upload Slots", "Sample Pack", "Priority Queue"], price: "$24.99", color: "#FFD700", icon: "🚀" },
  { id: "bnd_3", name: "VIP Season Bundle", items: ["10,000 Credits", "Unlimited Uploads", "VIP Badge", "Direct Booking", "30% Tip Boost"], price: "$99.99", color: "#FF2DAA", icon: "💎" },
  { id: "bnd_4", name: "Fan Engagement Pack", items: ["500 Credits", "Exclusive Fan Emotes", "3 Giveaway Entries"], price: "$4.99", color: "#00FFFF", icon: "🎰" },
];

export default function RewardsPage() {
  const [tab, setTab] = useState<Tab>("PRIZES");
  const router = useRouter();

  return (
    <PageShell>
      <HUDFrame>
        <div style={{ minHeight: "100vh", background: "#050510", color: "#fff", paddingBottom: 80 }}>

          {/* Header */}
          <div style={{ padding: "40px 32px 0", borderBottom: "1px solid rgba(255,215,0,0.15)" }}>
            <div style={{ fontSize: 9, letterSpacing: 5, color: "#FFD700", fontWeight: 800, marginBottom: 6 }}>REWARD ENGINE</div>
            <div style={{ display: "flex", alignItems: "flex-end", gap: 20, marginBottom: 28 }}>
              <div>
                <h1 style={{ fontSize: "clamp(32px,5vw,52px)", fontWeight: 900, letterSpacing: 4, margin: 0, lineHeight: 1 }}>
                  REWARDS
                </h1>
                <p style={{ margin: "8px 0 0", color: "rgba(255,255,255,0.5)", fontSize: 13 }}>
                  Launch Mode rewards are XP, badges, features, and cosmetics. Cash and large prize pools unlock only when Cash Prize Mode is funded — never invented as payable today.
                </p>
              </div>
              <div style={{ marginLeft: "auto" }}>
                <Link href="/rewards/claims" style={{
                  display: "inline-block", padding: "10px 22px", borderRadius: 8,
                  background: "linear-gradient(135deg, #FFD700, #FF9500)",
                  color: "#050510", fontWeight: 800, fontSize: 11, letterSpacing: 2,
                  textDecoration: "none",
                }}>CHECK CLAIMS</Link>
              </div>
            </div>

            {/* Stats */}
            <div style={{ display: "flex", gap: 32, paddingBottom: 20 }}>
              {[
                { label: "ACTIVE PRIZE TYPES", val: String(PRIZE_POOL.length), col: "#FFD700" },
                { label: "PENDING CLAIMS", val: "0", col: "#FF2DAA" },
                { label: "FUNDED DROPS", val: "0", col: "#00FFFF" },
                { label: "YOUR POINTS", val: "0", col: "#AA2DFF" },
              ].map(s => (
                <div key={s.label}>
                  <div style={{ fontSize: 20, fontWeight: 900, color: s.col }}>{s.val}</div>
                  <div style={{ fontSize: 8, letterSpacing: 3, color: "rgba(255,255,255,0.4)" }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Tabs */}
          <div style={{ display: "flex", gap: 0, padding: "0 32px", borderBottom: "1px solid rgba(255,215,0,0.1)", overflowX: "auto" }}>
            {TABS.map(t => (
              <button key={t} onClick={() => setTab(t)} style={{
                padding: "14px 18px", border: "none", cursor: "pointer", background: "transparent",
                borderBottom: tab === t ? "2px solid #FFD700" : "2px solid transparent",
                color: tab === t ? "#FFD700" : "#666",
                fontSize: 9, fontWeight: 800, letterSpacing: 2, whiteSpace: "nowrap",
              }}>{t}</button>
            ))}
          </div>

          {/* Content */}
          <div style={{ padding: "28px 32px" }}>
            <AnimatePresence mode="wait">
              {tab === "PRIZES" && (
                <motion.div key="prizes" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
                    {PRIZE_POOL.map(prize => (
                      <div key={prize.name} style={{
                        background: `${TIER_COLORS[prize.tier] || "#888"}08`,
                        border: `1px solid ${TIER_COLORS[prize.tier] || "#888"}25`,
                        borderRadius: 12, padding: 20,
                      }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                          <div style={{ fontSize: 32 }}>{prize.icon}</div>
                          <div style={{
                            padding: "2px 8px", borderRadius: 10,
                            background: `${TIER_COLORS[prize.tier]}15`,
                            fontSize: 7, fontWeight: 900, letterSpacing: 2,
                            color: TIER_COLORS[prize.tier],
                          }}>{prize.tier}</div>
                        </div>
                        <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 4 }}>{prize.name}</div>
                        <div style={{ fontSize: 16, fontWeight: 900, color: TIER_COLORS[prize.tier], marginBottom: 4 }}>{prize.value}</div>
                        <div style={{ fontSize: 9, color: "#888" }}>Sponsored by {prize.sponsor}</div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {tab === "WINNERS" && (
                <motion.div key="winners" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                  {WINNERS_DATA.length === 0 ? (
                    <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", margin: 0 }}>
                      No certified winners yet. Results appear here only after real contests finalize — we do not invent past winners.
                    </p>
                  ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {WINNERS_DATA.map((w, i) => (
                      <div key={i} style={{ display: "flex", alignItems: "center", gap: 16, background: "rgba(255,215,0,0.04)", border: "1px solid rgba(255,215,0,0.12)", borderRadius: 12, padding: "16px 20px" }}>
                        <div style={{ fontSize: 28 }}>{w.icon}</div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 13, fontWeight: 800, color: "#fff", marginBottom: 2 }}>{w.name}</div>
                          <div style={{ fontSize: 11, color: "#FFD700", marginBottom: 4 }}>{w.prize}</div>
                          <div style={{ fontSize: 9, color: "rgba(255,255,255,0.3)" }}>{w.date}</div>
                        </div>
                        <div style={{ padding: "4px 10px", borderRadius: 8, background: "rgba(255,215,0,0.1)", color: "#FFD700", fontSize: 9, fontWeight: 900 }}>RANK #{w.rank}</div>
                      </div>
                    ))}
                  </div>
                  )}
                </motion.div>
              )}

              {tab === "AUDIENCE DROPS" && (
                <motion.div key="drops" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
                    {AUDIENCE_DROPS.map(drop => (
                      <div key={drop.id} style={{ background: `${drop.color}08`, border: `1px solid ${drop.color}25`, borderRadius: 12, padding: 20 }}>
                        <div style={{ fontSize: 32, marginBottom: 10 }}>{drop.icon}</div>
                        <div style={{ fontSize: 14, fontWeight: 800, color: "#fff", marginBottom: 4 }}>{drop.name}</div>
                        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", marginBottom: 12 }}>{drop.desc}</div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                          <div style={{ fontSize: 9, color: "rgba(255,255,255,0.35)" }}>Ends {drop.ends}</div>
                          <div style={{ fontSize: 9, color: drop.color, fontWeight: 700 }}>{drop.entries.toLocaleString()} entries</div>
                        </div>
                        <button onClick={() => router.push('/rewards/claims')} style={{ width: "100%", background: drop.color, color: "#050510", fontWeight: 900, fontSize: 10, letterSpacing: 1, padding: "9px", borderRadius: 6, border: "none", cursor: "pointer" }}>ENTER DROP</button>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {tab === "CLAIMS" && (
                <motion.div key="claims" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                  <div style={{ textAlign: "center", padding: "32px 0 16px" }}>
                    <div style={{ fontSize: 40, marginBottom: 12 }}>🎟️</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "#fff", marginBottom: 8 }}>Check Your Prize Claims</div>
                    <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginBottom: 24 }}>View pending rewards, claim prizes, and track your deliveries.</div>
                    <Link href="/rewards/claims" style={{ display: "inline-block", padding: "12px 28px", background: "linear-gradient(135deg, #FFD700, #FF9500)", color: "#050510", fontWeight: 900, fontSize: 11, letterSpacing: 2, borderRadius: 8, textDecoration: "none" }}>OPEN CLAIMS CENTER</Link>
                  </div>
                </motion.div>
              )}

              {tab === "SPONSOR ITEMS" && (
                <motion.div key="sponsor" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 16 }}>
                    {SPONSOR_ITEMS.map(item => (
                      <div key={item.id} style={{ background: `${item.color}08`, border: `1px solid ${item.color}25`, borderRadius: 12, padding: 20 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                          <div style={{ fontSize: 28 }}>{item.icon}</div>
                          <div style={{ padding: "2px 8px", borderRadius: 6, background: `${item.color}15`, color: item.color, fontSize: 7, fontWeight: 900, letterSpacing: 2 }}>{item.category}</div>
                        </div>
                        <div style={{ fontSize: 13, fontWeight: 800, color: "#fff", marginBottom: 4 }}>{item.item}</div>
                        <div style={{ fontSize: 16, fontWeight: 900, color: item.color, marginBottom: 4 }}>{item.value}</div>
                        <div style={{ fontSize: 9, color: "rgba(255,255,255,0.35)", marginBottom: 14 }}>by {item.sponsor}</div>
                        <button onClick={() => router.push('/rewards/claims')} style={{ width: "100%", background: "transparent", border: `1px solid ${item.color}`, color: item.color, fontWeight: 900, fontSize: 10, letterSpacing: 1, padding: "9px", borderRadius: 6, cursor: "pointer" }}>CLAIM ITEM</button>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {tab === "BUNDLES" && (
                <motion.div key="bundles" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 16 }}>
                    {BUNDLES.map(bundle => (
                      <div key={bundle.id} style={{ background: `${bundle.color}08`, border: `1px solid ${bundle.color}30`, borderRadius: 14, padding: 24 }}>
                        <div style={{ fontSize: 28, marginBottom: 10 }}>{bundle.icon}</div>
                        <div style={{ fontSize: 14, fontWeight: 900, color: bundle.color, marginBottom: 8 }}>{bundle.name}</div>
                        <ul style={{ listStyle: "none", padding: 0, margin: "0 0 16px", display: "flex", flexDirection: "column", gap: 6 }}>
                          {bundle.items.map(it => (
                            <li key={it} style={{ fontSize: 10, color: "rgba(255,255,255,0.6)", display: "flex", gap: 6 }}>
                              <span style={{ color: bundle.color }}>✓</span>{it}
                            </li>
                          ))}
                        </ul>
                        <div style={{ fontSize: 20, fontWeight: 900, color: "#fff", marginBottom: 14 }}>{bundle.price}</div>
                        <Link href={`/api/stripe/checkout?priceId=price_bundle_${bundle.id}&mode=payment`} style={{ display: "block", textAlign: "center", padding: "10px", background: bundle.color, color: "#050510", fontWeight: 900, fontSize: 10, letterSpacing: 1, borderRadius: 6, textDecoration: "none" }}>GET BUNDLE</Link>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>
        <FooterHUD />
      </HUDFrame>
    </PageShell>
  );
}
