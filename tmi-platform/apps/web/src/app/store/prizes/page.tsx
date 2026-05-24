"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { RECENT_WINNERS } from "@/lib/giveaway/giveawayEngine";

type PrizeType = "Cash" | "Equipment" | "NFT" | "Season Pass" | "Ticket Bundle" | "Merch";
type Sponsor   = "All" | "BeatGear Co" | "Prime Wave" | "FreshThreads NYC" | "Neon Vibe Records" | "AudioForge Labs";

interface PrizeCatalogItem {
  id: string;
  name: string;
  description: string;
  type: PrizeType;
  sponsor: Exclude<Sponsor, "All">;
  valueCents: number;
  icon: string;
  available: boolean;
}

const PRIZE_CATALOG: PrizeCatalogItem[] = [
  { id: "pr-001", name: "$500 Sponsor Cash Drop",        description: "Direct cash award via Stripe. No strings attached.",             type: "Cash",          sponsor: "Prime Wave",          valueCents: 50000,  icon: "💵", available: true  },
  { id: "pr-002", name: "$250 Studio Session Credit",    description: "Redeemable for studio time at partner studios.",                 type: "Cash",          sponsor: "AudioForge Labs",     valueCents: 25000,  icon: "🎙️", available: true  },
  { id: "pr-003", name: "Focusrite Scarlett Interface",  description: "2i2 4th Gen USB audio interface. Industry standard.",            type: "Equipment",     sponsor: "BeatGear Co",         valueCents: 17999,  icon: "🎚️", available: true  },
  { id: "pr-004", name: "Sony MDR-7506 Headphones",      description: "Professional studio monitoring headphones.",                     type: "Equipment",     sponsor: "BeatGear Co",         valueCents: 9999,   icon: "🎧", available: true  },
  { id: "pr-005", name: "Roland TR-8S Drum Machine",     description: "Iconic hardware drum machine with sample import.",               type: "Equipment",     sponsor: "BeatGear Co",         valueCents: 49900,  icon: "🥁", available: false },
  { id: "pr-006", name: "TMI Founder NFT — Gold",        description: "Limited-edition genesis NFT. Unlocks exclusive perks forever.", type: "NFT",           sponsor: "Prime Wave",          valueCents: 29900,  icon: "🖼️", available: true  },
  { id: "pr-007", name: "Artist Canvas NFT Drop",        description: "1-of-1 custom art NFT by TMI resident artists.",                type: "NFT",           sponsor: "Neon Vibe Records",   valueCents: 14900,  icon: "🎨", available: true  },
  { id: "pr-008", name: "VIP Season Pass",               description: "Full season access. All events, all rooms, priority entry.",    type: "Season Pass",   sponsor: "Prime Wave",          valueCents: 39900,  icon: "🎟️", available: true  },
  { id: "pr-009", name: "Diamond Season Pass Bundle",    description: "VIP pass + Diamond fan club for 6 months.",                     type: "Season Pass",   sponsor: "Prime Wave",          valueCents: 74900,  icon: "💎", available: true  },
  { id: "pr-010", name: "3-Event Ticket Bundle",         description: "3 tickets to any upcoming TMI live events.",                    type: "Ticket Bundle", sponsor: "Neon Vibe Records",   valueCents: 8997,   icon: "🎫", available: true  },
  { id: "pr-011", name: "TMI Hoodie + Tee + Cap",        description: "Official TMI merch bundle. All sizes available.",               type: "Merch",         sponsor: "FreshThreads NYC",    valueCents: 12500,  icon: "👕", available: true  },
  { id: "pr-012", name: "Exclusive Drop Capsule",        description: "Limited capsule: hoodie, shorts, tee, poster. Signed.",        type: "Merch",         sponsor: "FreshThreads NYC",    valueCents: 22000,  icon: "📦", available: true  },
];

const PRIZE_TYPES: PrizeType[]   = ["Cash", "Equipment", "NFT", "Season Pass", "Ticket Bundle", "Merch"];
const SPONSORS:    Sponsor[]     = ["All", "BeatGear Co", "Prime Wave", "FreshThreads NYC", "Neon Vibe Records", "AudioForge Labs"];

const TYPE_CONFIG: Record<PrizeType, { color: string; icon: string }> = {
  "Cash":          { color: "#00FF88", icon: "💵" },
  "Equipment":     { color: "#00FFFF", icon: "🎚️" },
  "NFT":           { color: "#AA2DFF", icon: "🖼️" },
  "Season Pass":   { color: "#FFD700", icon: "🎟️" },
  "Ticket Bundle": { color: "#FF2DAA", icon: "🎫" },
  "Merch":         { color: "#FF8800", icon: "👕" },
};

function formatVal(cents: number): string {
  return "$" + (cents / 100).toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

export default function StorePrizesPage() {
  const [typeFilter,    setTypeFilter]    = useState<PrizeType | "All">("All");
  const [sponsorFilter, setSponsorFilter] = useState<Sponsor>("All");

  const shown = PRIZE_CATALOG.filter(p => {
    if (typeFilter !== "All"   && p.type    !== typeFilter)    return false;
    if (sponsorFilter !== "All" && p.sponsor !== sponsorFilter) return false;
    return true;
  });

  return (
    <main style={{ minHeight: "100vh", background: "radial-gradient(circle at 50% 0%, rgba(255,215,0,0.06), transparent 45%), #050510", color: "#fff", paddingBottom: 100 }}>

      {/* Header */}
      <header style={{ maxWidth: 1040, margin: "0 auto", padding: "48px 24px 32px" }}>
        <Link href="/store" style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.28em", color: "rgba(255,255,255,0.22)", textDecoration: "none" }}>← TMI STORE</Link>
        <div style={{ marginTop: 20 }}>
          <div style={{ fontSize: 9, letterSpacing: "0.4em", color: "#FFD700", fontWeight: 800, marginBottom: 12 }}>PRIZES</div>
          <h1 style={{ fontSize: "clamp(1.8rem,4vw,2.8rem)", fontWeight: 900, margin: "0 0 12px", lineHeight: 1.1 }}>
            Prize Catalog
          </h1>
          <p style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", maxWidth: 520, lineHeight: 1.7, margin: "0 0 24px" }}>
            Everything you can WIN or AWARD on TMI. Browse by type or sponsor. Want to add a prize? Sponsor one.
          </p>

          {/* Sponsor a prize CTA */}
          <Link href="/sponsors/new"
            style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "10px 24px", background: "linear-gradient(135deg,#FF2DAA,#AA2DFF)", color: "#fff", borderRadius: 24, fontWeight: 800, fontSize: 12, letterSpacing: "0.08em", textDecoration: "none", marginBottom: 28 }}>
            🏆 Sponsor a Prize
          </Link>
        </div>

        {/* Filters */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {/* Type filters */}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button key="all-types" onClick={() => setTypeFilter("All")} style={{ padding: "6px 16px", fontSize: 10, fontWeight: 800, letterSpacing: "0.14em", borderRadius: 20, border: "1px solid " + (typeFilter === "All" ? "#FFD700" : "rgba(255,255,255,0.12)"), background: typeFilter === "All" ? "rgba(255,215,0,0.12)" : "transparent", color: typeFilter === "All" ? "#FFD700" : "rgba(255,255,255,0.4)", cursor: "pointer" }}>
              ALL TYPES
            </button>
            {PRIZE_TYPES.map(t => {
              const cfg = TYPE_CONFIG[t];
              const active = typeFilter === t;
              return (
                <button key={t} onClick={() => setTypeFilter(t)} style={{ padding: "6px 16px", fontSize: 10, fontWeight: 800, letterSpacing: "0.12em", borderRadius: 20, border: "1px solid " + (active ? cfg.color : "rgba(255,255,255,0.1)"), background: active ? cfg.color + "18" : "transparent", color: active ? cfg.color : "rgba(255,255,255,0.38)", cursor: "pointer" }}>
                  {cfg.icon} {t.toUpperCase()}
                </button>
              );
            })}
          </div>

          {/* Sponsor filter */}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {SPONSORS.map(s => {
              const active = sponsorFilter === s;
              return (
                <button key={s} onClick={() => setSponsorFilter(s)} style={{ padding: "5px 14px", fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", borderRadius: 16, border: "1px solid " + (active ? "#FF2DAA" : "rgba(255,255,255,0.09)"), background: active ? "rgba(255,45,170,0.12)" : "transparent", color: active ? "#FF2DAA" : "rgba(255,255,255,0.3)", cursor: "pointer" }}>
                  {s}
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* Prize grid */}
      <section style={{ maxWidth: 1040, margin: "0 auto", padding: "0 24px 52px" }}>
        <div style={{ fontSize: 9, color: "rgba(255,255,255,0.25)", letterSpacing: "0.2em", fontWeight: 700, marginBottom: 16 }}>
          {shown.length} PRIZE{shown.length !== 1 ? "S" : ""} FOUND
        </div>
        {shown.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 20px", color: "rgba(255,255,255,0.3)", fontSize: 14 }}>
            No prizes match those filters.
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 14 }}>
            {shown.map((prize, i) => {
              const cfg = TYPE_CONFIG[prize.type];
              return (
                <motion.div key={prize.id}
                  initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                  style={{ background: cfg.color + "07", border: "1px solid " + cfg.color + "22", borderRadius: 14, padding: "20px 18px", display: "flex", flexDirection: "column", gap: 10, opacity: prize.available ? 1 : 0.55 }}>

                  {/* Top row */}
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                    <span style={{ fontSize: 32 }}>{prize.icon}</span>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
                      <span style={{ fontSize: 8, fontWeight: 800, letterSpacing: "0.16em", padding: "2px 8px", borderRadius: 12, background: cfg.color + "18", color: cfg.color, border: "1px solid " + cfg.color + "38" }}>
                        {prize.type.toUpperCase()}
                      </span>
                      {!prize.available && (
                        <span style={{ fontSize: 8, fontWeight: 800, letterSpacing: "0.1em", padding: "2px 8px", borderRadius: 12, background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.3)" }}>
                          AWARDED
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Title + desc */}
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 800, color: "#fff", marginBottom: 5, lineHeight: 1.25 }}>{prize.name}</div>
                    <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", lineHeight: 1.5 }}>{prize.description}</div>
                  </div>

                  {/* Value + sponsor */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 10 }}>
                    <div style={{ fontSize: 18, fontWeight: 900, color: "#FFD700" }}>{formatVal(prize.valueCents)}</div>
                    <div style={{ fontSize: 9, color: "rgba(255,255,255,0.35)", fontWeight: 700 }}>{prize.sponsor}</div>
                  </div>

                  {/* CTA */}
                  {prize.available && (
                    <Link href="/store/giveaways"
                      style={{ display: "block", padding: "9px", textAlign: "center", fontSize: 11, fontWeight: 800, letterSpacing: "0.1em", color: cfg.color, background: cfg.color + "10", border: "1px solid " + cfg.color + "28", borderRadius: 8, textDecoration: "none" }}>
                      Enter to Win →
                    </Link>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </section>

      {/* Recent winners */}
      <section style={{ maxWidth: 700, margin: "0 auto", padding: "0 24px 52px" }}>
        <div style={{ fontSize: 9, letterSpacing: "0.35em", color: "rgba(255,255,255,0.28)", fontWeight: 800, marginBottom: 16 }}>RECENT WINNERS</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {RECENT_WINNERS.map((w, i) => (
            <motion.div key={i}
              initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.07 }}
              style={{ display: "flex", alignItems: "center", gap: 14, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 10, padding: "13px 16px" }}>
              <span style={{ fontSize: 20 }}>🏆</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#FFD700" }}>{w.winnerName}</div>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.45)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{w.prize}</div>
              </div>
              <div style={{ textAlign: "right", flexShrink: 0 }}>
                <div style={{ fontSize: 9, color: "rgba(255,255,255,0.3)" }}>{w.sponsorName}</div>
                <div style={{ fontSize: 9, color: "rgba(255,255,255,0.2)", marginTop: 2 }}>
                  {Math.floor((Date.now() - w.announcedAt) / 86400000)}d ago
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Bottom nav */}
      <section style={{ maxWidth: 700, margin: "0 auto", padding: "0 24px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <Link href="/store/giveaways" style={{ display: "block", padding: "16px", background: "rgba(0,255,255,0.05)", border: "1px solid rgba(0,255,255,0.2)", borderRadius: 12, textDecoration: "none", color: "#00FFFF", fontWeight: 700, fontSize: 13, textAlign: "center" }}>
            Active Giveaways →
          </Link>
          <Link href="/sponsors/new" style={{ display: "block", padding: "16px", background: "rgba(255,45,170,0.06)", border: "1px solid rgba(255,45,170,0.22)", borderRadius: 12, textDecoration: "none", color: "#FF2DAA", fontWeight: 700, fontSize: 13, textAlign: "center" }}>
            Sponsor a Prize →
          </Link>
        </div>
      </section>
    </main>
  );
}
