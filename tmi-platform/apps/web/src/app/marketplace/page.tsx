import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Marketplace | TMI",
  description: "The TMI Marketplace — buy and sell beats, samples, session credits, and exclusive TMI drops.",
};

const LISTINGS = [
  { id: "l1", type: "BEAT",       name: "Electric Sky",      seller: "Ray Journey",   price: "$29.99", plays: "24K",  color: "#FFD700", icon: "⚡",  tag: "EXCLUSIVE"  },
  { id: "l2", type: "BEAT",       name: "Lagos Night",       seller: "Zuri Bloom",    price: "$24.99", plays: "18K",  color: "#00FF88", icon: "🌙",  tag: "TRENDING"   },
  { id: "l3", type: "PACK",       name: "Trap Gods Vol. 1",  seller: "TMI Producers", price: "$49.99", plays: null,   color: "#FF2DAA", icon: "🎛️",  tag: "PACK"       },
  { id: "l4", type: "COLLAB",     name: "Studio Session",    seller: "Wavetek",       price: "$199",   plays: null,   color: "#00FFFF", icon: "🎙️",  tag: "BOOKING"    },
  { id: "l5", type: "BEAT",       name: "Cipher Code",       seller: "Krypt",         price: "$19.99", plays: "14K",  color: "#AA2DFF", icon: "🔐",  tag: null         },
  { id: "l6", type: "PACK",       name: "Afro Rhythms",      seller: "TMI Producers", price: "$39.99", plays: null,   color: "#00FF88", icon: "🥁",  tag: "NEW"        },
  { id: "l7", type: "BEAT",       name: "Neon Pulse",        seller: "Neon Vibe",     price: "$34.99", plays: "9.8K", color: "#00FFFF", icon: "💡",  tag: null         },
  { id: "l8", type: "COLLAB",     name: "Feature Verse",     seller: "Lena Sky",      price: "$150",   plays: null,   color: "#FF9500", icon: "🎤",  tag: "LIMITED"    },
];

const TAG_COLOR: Record<string, string> = { EXCLUSIVE: "#FFD700", TRENDING: "#FF2DAA", PACK: "#AA2DFF", BOOKING: "#00FF88", NEW: "#00FFFF", LIMITED: "#FF9500" };
const TYPE_LABEL: Record<string, string> = { BEAT: "Beat", PACK: "Sample Pack", COLLAB: "Collab / Session" };

export default function MarketplacePage() {
  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", paddingBottom: 80 }}>
      <section style={{ textAlign: "center", padding: "56px 24px 40px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ fontSize: 9, letterSpacing: "0.4em", color: "#00FFFF", fontWeight: 800, marginBottom: 10 }}>TMI MARKETPLACE</div>
        <h1 style={{ fontSize: "clamp(1.6rem,4vw,2.8rem)", fontWeight: 900, marginBottom: 12 }}>Marketplace</h1>
        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", maxWidth: 440, margin: "0 auto 24px" }}>
          Buy beats, sample packs, collab sessions, and exclusive drops from verified TMI artists.
        </p>
        <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
          {["ALL", "BEATS", "PACKS", "COLLABS"].map((f, i) => (
            <button key={f} style={{ padding: "7px 16px", fontSize: 9, fontWeight: 700, color: i === 0 ? "#050510" : "rgba(255,255,255,0.5)", background: i === 0 ? "#00FFFF" : "rgba(255,255,255,0.05)", border: `1px solid ${i === 0 ? "#00FFFF" : "rgba(255,255,255,0.1)"}`, borderRadius: 20, cursor: "pointer" }}>{f}</button>
          ))}
        </div>
      </section>

      <section style={{ maxWidth: 900, margin: "0 auto", padding: "40px 24px 0", display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))", gap: 14 }}>
        {LISTINGS.map(item => (
          <div key={item.id} style={{ position: "relative", background: "rgba(255,255,255,0.02)", border: `1px solid ${item.color}20`, borderRadius: 12, padding: "20px 18px" }}>
            {item.tag && (
              <div style={{ position: "absolute", top: -9, right: 14, background: TAG_COLOR[item.tag], color: "#050510", fontSize: 6, fontWeight: 900, letterSpacing: "0.1em", padding: "2px 8px", borderRadius: 10 }}>{item.tag}</div>
            )}
            <div style={{ display: "flex", gap: 12, alignItems: "flex-start", marginBottom: 12 }}>
              <div style={{ width: 44, height: 44, background: `${item.color}15`, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>{item.icon}</div>
              <div>
                <div style={{ fontSize: 7, fontWeight: 700, color: item.color, letterSpacing: "0.08em", marginBottom: 3 }}>{TYPE_LABEL[item.type] || item.type}</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#fff" }}>{item.name}</div>
                <div style={{ fontSize: 8, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>by {item.seller}{item.plays ? ` · ${item.plays} plays` : ""}</div>
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 16, fontWeight: 900, color: item.color }}>{item.price}</span>
              <Link href={`/api/stripe/checkout?product=marketplace_${item.id}&mode=payment`} style={{ fontSize: 8, fontWeight: 800, color: "#050510", background: item.color, borderRadius: 6, padding: "8px 16px", textDecoration: "none" }}>BUY NOW</Link>
            </div>
          </div>
        ))}
      </section>

      <section style={{ textAlign: "center", marginTop: 40, display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
        <Link href="/beats" style={{ display: "inline-block", padding: "11px 26px", fontSize: 9, fontWeight: 800, letterSpacing: "0.12em", color: "#050510", background: "#00FFFF", borderRadius: 7, textDecoration: "none" }}>BEAT MARKETPLACE →</Link>
        <Link href="/artists/dashboard" style={{ display: "inline-block", padding: "11px 26px", fontSize: 9, fontWeight: 800, letterSpacing: "0.12em", color: "#FF2DAA", border: "1px solid #FF2DAA40", borderRadius: 7, textDecoration: "none" }}>SELL YOUR BEATS →</Link>
      </section>
    </main>
  );
}
