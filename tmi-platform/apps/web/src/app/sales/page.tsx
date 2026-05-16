import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sales | TMI",
  description: "TMI sales overview — sponsor leads, advertiser deals, ticket sales, and beat marketplace performance.",
};

const STATS = [
  { label: "TOTAL REVENUE", value: "$48,240", color: "#00FF88", delta: "+18% this month" },
  { label: "TICKET SALES", value: "$12,800", color: "#FF2DAA", delta: "142 tickets sold" },
  { label: "BEAT SALES", value: "$8,920", color: "#FFD700", delta: "87 licenses sold" },
  { label: "SPONSOR DEALS", value: "$18,000", color: "#00FFFF", delta: "3 active sponsors" },
  { label: "ADVERTISER DEALS", value: "$6,400", color: "#AA2DFF", delta: "5 active campaigns" },
  { label: "NFT SALES", value: "$1,120", color: "#00FFFF", delta: "8 units sold" },
];

const LEADS = [
  { company: "BeatPort USA", type: "SPONSOR", status: "NEGOTIATING", value: "$12,000", contact: "Sarah J." },
  { company: "Fender Guitars", type: "SPONSOR", status: "OUTREACH", value: "$8,000", contact: "Mike R." },
  { company: "Roland", type: "ADVERTISER", status: "SIGNED", value: "$3,200", contact: "Dana L." },
  { company: "Trap Nation", type: "ADVERTISER", status: "REVIEW", value: "$1,500", contact: "Alex M." },
  { company: "Live Nation", type: "VENUE PARTNER", status: "OUTREACH", value: "$25,000", contact: "Taylor K." },
];

const STATUS_COLORS: Record<string, string> = { NEGOTIATING: "#FFD700", OUTREACH: "#00FFFF", SIGNED: "#00FF88", REVIEW: "#AA2DFF", CLOSED: "#FF2DAA" };

export default function SalesPage() {
  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", paddingBottom: 80 }}>
      <section style={{ maxWidth: 1200, margin: "0 auto", padding: "48px 24px 0" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 32, flexWrap: "wrap", gap: 12 }}>
          <div>
            <div style={{ fontSize: 9, letterSpacing: "0.3em", color: "#00FF88", fontWeight: 800, marginBottom: 8 }}>TMI SALES</div>
            <h1 style={{ fontSize: "clamp(1.6rem,4vw,2.4rem)", fontWeight: 900 }}>Sales Overview</h1>
          </div>
          <Link href="/admin/sales" style={{ padding: "9px 18px", fontSize: 9, fontWeight: 800, color: "#00FF88", border: "1px solid rgba(0,255,136,0.3)", borderRadius: 8, textDecoration: "none" }}>ADMIN VIEW</Link>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(180px,1fr))", gap: 12, marginBottom: 48 }}>
          {STATS.map(s => (
            <div key={s.label} style={{ background: "rgba(255,255,255,0.02)", border: `1px solid ${s.color}18`, borderRadius: 12, padding: "18px 16px" }}>
              <div style={{ fontSize: 9, color: s.color, fontWeight: 800, letterSpacing: "0.12em", marginBottom: 8 }}>{s.label}</div>
              <div style={{ fontSize: 24, fontWeight: 900, marginBottom: 6 }}>{s.value}</div>
              <div style={{ fontSize: 9, color: "rgba(255,255,255,0.35)" }}>{s.delta}</div>
            </div>
          ))}
        </div>

        <div style={{ fontSize: 9, letterSpacing: "0.3em", color: "rgba(255,255,255,0.35)", fontWeight: 700, marginBottom: 16 }}>ACTIVE LEADS</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {LEADS.map((lead, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 16, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 12, padding: "16px 20px", flexWrap: "wrap" }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 700 }}>{lead.company}</div>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)" }}>{lead.type} · {lead.contact}</div>
              </div>
              <div style={{ fontSize: 16, fontWeight: 900, color: "#00FF88" }}>{lead.value}</div>
              <span style={{ fontSize: 8, fontWeight: 800, color: STATUS_COLORS[lead.status] ?? "#fff", border: `1px solid ${STATUS_COLORS[lead.status] ?? "#fff"}40`, borderRadius: 4, padding: "3px 8px" }}>
                {lead.status}
              </span>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
