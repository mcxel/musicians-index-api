"use client";
import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

type PlacementType = {
  id: string;
  name: string;
  surface: string;
  icon: string;
  color: string;
  description: string;
  format: string;
  audience: string;
  cpm: number;
  minBudget: number;
  impressionsPerDay: number;
  example: string;
};

const PLACEMENTS: PlacementType[] = [
  {
    id: "homepage-hero",
    name: "Homepage Hero Banner",
    surface: "Homepage",
    icon: "🏠",
    color: "#00FFFF",
    description: "Full-width banner at the top of the TMI homepage. Highest visibility placement on the platform.",
    format: "1200×628px image or 15s video",
    audience: "All TMI visitors — ~85K daily",
    cpm: 18,
    minBudget: 500,
    impressionsPerDay: 85000,
    example: "Brand announcement, album drop, event promo",
  },
  {
    id: "magazine-sidebar",
    name: "Magazine Sidebar",
    surface: "Magazine",
    icon: "📰",
    color: "#AA2DFF",
    description: "Premium sidebar placement in the TMI Magazine. Readers have high dwell time — average 4 minutes per session.",
    format: "300×600px or 300×250px image",
    audience: "Music enthusiasts, industry readers",
    cpm: 12,
    minBudget: 300,
    impressionsPerDay: 42000,
    example: "Music gear, streaming services, events",
  },
  {
    id: "live-overlay",
    name: "Live Room Overlay",
    surface: "Live Rooms",
    icon: "🎤",
    color: "#FF2DAA",
    description: "Overlay ad displayed during live events. Extremely high engagement — viewers are actively watching.",
    format: "640×120px banner or 10s pre-roll",
    audience: "Active live event audience",
    cpm: 22,
    minBudget: 400,
    impressionsPerDay: 30000,
    example: "Concert merch, live experiences, brand drops",
  },
  {
    id: "feed-sponsored",
    name: "Feed Sponsored Post",
    surface: "Artist Feed",
    icon: "📱",
    color: "#FFD700",
    description: "Native-looking sponsored post in the artist/fan feed. Blends naturally into content for maximum CTR.",
    format: "1:1 square image + 150 char caption",
    audience: "Fans & artists browsing feed",
    cpm: 8,
    minBudget: 200,
    impressionsPerDay: 65000,
    example: "New release, brand collab, music app",
  },
  {
    id: "search-placement",
    name: "Search Result Placement",
    surface: "Search",
    icon: "🔍",
    color: "#00FF88",
    description: "Sponsored results when users search for artists, beats, or events. High purchase intent traffic.",
    format: "Text + thumbnail image",
    audience: "Intent-driven searchers",
    cpm: 25,
    minBudget: 600,
    impressionsPerDay: 18000,
    example: "Beat packs, software, music courses",
  },
  {
    id: "emote-banner",
    name: "Emote Pack Sponsorship",
    surface: "Lobbies & Rooms",
    icon: "✨",
    color: "#FF9500",
    description: "Sponsor a branded emote pack used by fans in live rooms and lobbies. Viral organic reach.",
    format: "Branded emoji set (8 emotes)",
    audience: "All active fans and lobby users",
    cpm: 5,
    minBudget: 250,
    impressionsPerDay: 95000,
    example: "Brand characters, event-specific emotes",
  },
];

export default function AdvertiserBuyPage() {
  const [selected, setSelected] = useState<PlacementType | null>(null);
  const [budget, setBudget] = useState("500");
  const [creativeUrl, setCreativeUrl] = useState("");
  const [creativeType, setCreativeType] = useState("image");
  const [startDate, setStartDate] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const budgetNum = Number(budget) || 0;
  const cpm = selected?.cpm ?? 10;
  const estimatedImpressions = budgetNum > 0 ? Math.floor((budgetNum / cpm) * 1000) : 0;
  const estimatedDays = selected && budgetNum > 0 ? Math.floor(budgetNum / (selected.impressionsPerDay * cpm / 1000)) : 0;

  async function handleBuy(e: React.FormEvent) {
    e.preventDefault();
    if (!selected) return;
    setSubmitting(true);
    const params = new URLSearchParams({
      priceId: `price_ad_${selected.id.replace(/-/g, '_')}`,
      mode: 'payment',
      amount: String(budgetNum * 100),
      productName: selected.name,
    });
    window.location.href = `/api/stripe/checkout?${params.toString()}`;
  }

  if (success && selected) {
    return (
      <main style={mainStyle}>
        <div style={{ maxWidth: 600, margin: "0 auto", padding: "80px 24px", textAlign: "center" }}>
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
            <div style={{ fontSize: 56, marginBottom: 20 }}>✅</div>
            <div style={{ fontSize: 22, fontWeight: 900, color: "#00FF88", marginBottom: 10 }}>Placement Purchased!</div>
            <div style={{ fontSize: 14, color: "rgba(255,255,255,0.6)", maxWidth: 420, margin: "0 auto 8px", lineHeight: 1.7 }}>
              Your {selected.name} placement is pending creative review. It will go live within 4 hours of approval.
            </div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginBottom: 28 }}>
              Budget: ${budgetNum.toLocaleString()} · Est. {estimatedImpressions.toLocaleString()} impressions
            </div>
            <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
              <Link href="/advertiser/campaigns" style={btnStyle("#00FFFF")}>View Campaigns</Link>
              <Link href="/advertiser/analytics" style={btnStyle("rgba(255,255,255,0.4)")}>Analytics</Link>
            </div>
          </motion.div>
        </div>
      </main>
    );
  }

  return (
    <main style={mainStyle}>
      <div style={{ borderBottom: "1px solid rgba(170,45,255,0.12)", padding: "18px 28px", display: "flex", gap: 12, alignItems: "center" }}>
        <Link href="/advertiser/placements" style={{ fontSize: 11, color: "rgba(170,45,255,0.7)", textDecoration: "none" }}>← Placements</Link>
        <span style={{ color: "rgba(255,255,255,0.15)" }}>·</span>
        <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>Buy Ad Placement</span>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "40px 24px" }}>
        <div style={{ marginBottom: 32 }}>
          <div style={{ fontSize: 9, fontWeight: 800, color: "#AA2DFF", letterSpacing: "0.3em", marginBottom: 8 }}>ADVERTISER</div>
          <h1 style={{ fontSize: "clamp(22px,4vw,34px)", fontWeight: 900, margin: "0 0 6px" }}>Buy Ad Placement</h1>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)" }}>Choose a surface, set your budget, upload creative, and go live.</p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 28, alignItems: "start" }}>
          {/* Placement Grid */}
          <div>
            <div style={{ fontSize: 9, fontWeight: 800, color: "rgba(255,255,255,0.4)", letterSpacing: "0.2em", marginBottom: 14 }}>SELECT PLACEMENT</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 12 }}>
              {PLACEMENTS.map(p => (
                <motion.div key={p.id}
                  whileHover={{ y: -2, boxShadow: `0 8px 30px ${p.color}18` }}
                  onClick={() => setSelected(p)}
                  style={{ borderRadius: 14, border: `1px solid ${selected?.id === p.id ? p.color : p.color + "25"}`,
                    background: selected?.id === p.id ? p.color + "0e" : "rgba(255,255,255,0.02)",
                    padding: "18px 16px", cursor: "pointer", transition: "all 200ms" }}>
                  <div style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 10 }}>
                    <span style={{ fontSize: 24 }}>{p.icon}</span>
                    <div>
                      <div style={{ fontSize: 9, fontWeight: 800, color: p.color, letterSpacing: "0.14em", marginBottom: 3 }}>{p.surface}</div>
                      <div style={{ fontSize: 13, fontWeight: 800 }}>{p.name}</div>
                    </div>
                  </div>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", lineHeight: 1.5, marginBottom: 10 }}>{p.description}</div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 9, color: "rgba(255,255,255,0.35)" }}>{p.format}</span>
                    <span style={{ fontSize: 13, fontWeight: 800, color: "#FFD700" }}>${p.cpm} CPM</span>
                  </div>
                  {selected?.id === p.id && (
                    <div style={{ marginTop: 8, padding: "5px 10px", background: p.color + "18", borderRadius: 6, fontSize: 10, fontWeight: 700, color: p.color, textAlign: "center" }}>SELECTED ✓</div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>

          {/* Checkout Panel */}
          <div style={{ position: "sticky", top: 24 }}>
            <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 18, padding: "24px 20px" }}>
              <div style={{ fontSize: 9, fontWeight: 800, color: selected?.color ?? "#AA2DFF", letterSpacing: "0.2em", marginBottom: 16 }}>
                {selected ? selected.name.toUpperCase() : "SELECT A PLACEMENT"}
              </div>

              <AnimatePresence>
                {selected && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
                    <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", marginBottom: 14, lineHeight: 1.6 }}>
                      <div>👥 {selected.audience}</div>
                      <div>📐 {selected.format}</div>
                      <div>💡 {selected.example}</div>
                    </div>
                    <div style={{ borderTop: "1px solid rgba(255,255,255,0.07)", paddingTop: 14, marginBottom: 14 }} />
                  </motion.div>
                )}
              </AnimatePresence>

              <form onSubmit={handleBuy}>
                <div style={{ marginBottom: 14 }}>
                  <label style={labelStyle}>BUDGET (USD) *</label>
                  <div style={{ position: "relative" }}>
                    <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#FFD700", fontWeight: 800 }}>$</span>
                    <input required type="number" min={selected?.minBudget ?? 200} step="50"
                      value={budget} onChange={e => setBudget(e.target.value)}
                      style={{ ...inputStyle, paddingLeft: 26 }} />
                  </div>
                  {selected && <div style={{ fontSize: 9, color: "rgba(255,255,255,0.35)", marginTop: 4 }}>Min. ${selected.minBudget.toLocaleString()}</div>}
                </div>

                <div style={{ marginBottom: 14 }}>
                  <label style={labelStyle}>CREATIVE TYPE</label>
                  <div style={{ display: "flex", gap: 6 }}>
                    {["image","video"].map(t => (
                      <div key={t} onClick={() => setCreativeType(t)}
                        style={{ flex: 1, padding: "8px", textAlign: "center", borderRadius: 6, cursor: "pointer", fontSize: 11, fontWeight: 700,
                          border: `1px solid ${creativeType === t ? "#AA2DFF" : "rgba(255,255,255,0.1)"}`,
                          background: creativeType === t ? "rgba(170,45,255,0.1)" : "transparent",
                          color: creativeType === t ? "#AA2DFF" : "rgba(255,255,255,0.45)" }}>
                        {t.charAt(0).toUpperCase() + t.slice(1)}
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ marginBottom: 14 }}>
                  <label style={labelStyle}>CREATIVE URL *</label>
                  <input required value={creativeUrl} onChange={e => setCreativeUrl(e.target.value)}
                    placeholder="https://cdn.example.com/ad.jpg" style={inputStyle} />
                </div>

                <div style={{ marginBottom: 18 }}>
                  <label style={labelStyle}>START DATE</label>
                  <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} style={inputStyle} />
                </div>

                {/* Estimate */}
                {budgetNum > 0 && selected && (
                  <div style={{ background: "rgba(255,215,0,0.05)", border: "1px solid rgba(255,215,0,0.15)", borderRadius: 10, padding: "14px 16px", marginBottom: 16 }}>
                    <div style={{ fontSize: 9, color: "#FFD700", fontWeight: 800, letterSpacing: "0.15em", marginBottom: 8 }}>ESTIMATE</div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                      <span style={{ fontSize: 11, color: "rgba(255,255,255,0.5)" }}>Est. impressions</span>
                      <span style={{ fontSize: 12, fontWeight: 700 }}>{estimatedImpressions.toLocaleString()}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ fontSize: 11, color: "rgba(255,255,255,0.5)" }}>Est. duration</span>
                      <span style={{ fontSize: 12, fontWeight: 700 }}>{estimatedDays} days</span>
                    </div>
                  </div>
                )}

                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} type="submit"
                  disabled={!selected || submitting}
                  style={{ width: "100%", padding: "13px", background: !selected || submitting ? "rgba(170,45,255,0.3)" : "linear-gradient(135deg,#AA2DFF,#FF2DAA)", border: "none", borderRadius: 10, color: "#fff", fontSize: 13, fontWeight: 800, letterSpacing: "0.06em", cursor: !selected || submitting ? "not-allowed" : "pointer" }}>
                  {submitting ? "Processing..." : `Buy Placement${budgetNum > 0 ? ` · $${budgetNum.toLocaleString()}` : ""}`}
                </motion.button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

const mainStyle: React.CSSProperties = { minHeight: "100vh", background: "linear-gradient(160deg,#040412,#050318,#040412)", color: "#fff", paddingBottom: 80, fontFamily: "'Inter',sans-serif" };
const labelStyle: React.CSSProperties = { fontSize: 9, fontWeight: 800, color: "rgba(255,255,255,0.5)", letterSpacing: "0.18em", display: "block", marginBottom: 6 };
const inputStyle: React.CSSProperties = { width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8, padding: "10px 12px", color: "#fff", fontSize: 13, outline: "none", boxSizing: "border-box" };
function btnStyle(color: string): React.CSSProperties {
  return { padding: "10px 18px", border: `1px solid ${color}40`, borderRadius: 8, color, fontWeight: 700, fontSize: 12, textDecoration: "none", background: color + "10" };
}
