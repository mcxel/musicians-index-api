"use client";

import { useState } from "react";

type Deal = {
  id: string;
  title: string;
  type: "venue-package" | "event-exclusive" | "series" | "naming-rights";
  value: number;
  status: "active" | "pending" | "expired" | "negotiating";
  venue: string;
  startDate: string;
  endDate: string;
  impressions: number;
};

const SEED_DEALS: Deal[] = [
  { id: "deal-001", title: "Crown Stage Naming Rights — Spring Series", type: "naming-rights", value: 25000, status: "active", venue: "Crown Stage", startDate: "2026-03-01", endDate: "2026-06-30", impressions: 148000 },
  { id: "deal-002", title: "Electric Blue Exclusive — Summer Pack", type: "event-exclusive", value: 8500, status: "active", venue: "Electric Blue", startDate: "2026-05-01", endDate: "2026-08-31", impressions: 62000 },
  { id: "deal-003", title: "Pulse Arena — 3-Event Series Bundle", type: "series", value: 15000, status: "negotiating", venue: "Pulse Arena", startDate: "2026-06-01", endDate: "2026-09-01", impressions: 94000 },
  { id: "deal-004", title: "Velvet Lounge — VIP Suite Package", type: "venue-package", value: 4200, status: "pending", venue: "Velvet Lounge", startDate: "2026-07-15", endDate: "2026-07-15", impressions: 18000 },
];

const STATUS_COLORS: Record<Deal["status"], string> = {
  active: "#22c55e",
  pending: "#fcd34d",
  negotiating: "#00FFFF",
  expired: "#64748b",
};

const TYPE_LABELS: Record<Deal["type"], string> = {
  "naming-rights": "NAMING RIGHTS",
  "event-exclusive": "EVENT EXCLUSIVE",
  series: "SERIES BUNDLE",
  "venue-package": "VENUE PACKAGE",
};

export default function DealsRail({ sponsorSlug }: { sponsorSlug: string }) {
  const [deals, setDeals] = useState<Deal[]>(SEED_DEALS);
  const [showForm, setShowForm] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newVenue, setNewVenue] = useState("");
  const [newValue, setNewValue] = useState("5000");

  const totalValue = deals.filter(d => d.status === "active").reduce((s, d) => s + d.value, 0);
  const totalImpressions = deals.reduce((s, d) => s + d.impressions, 0);

  function attachSponsorToVenue(venue: string) {
    if (!newTitle.trim() || !venue.trim()) return;
    const deal: Deal = {
      id: `deal-${Date.now()}`,
      title: newTitle.trim(),
      type: "venue-package",
      value: parseInt(newValue) || 5000,
      status: "pending",
      venue,
      startDate: new Date().toISOString().slice(0, 10),
      endDate: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
      impressions: 0,
    };
    setDeals(prev => [deal, ...prev]);
    setNewTitle("");
    setNewVenue("");
    setNewValue("5000");
    setShowForm(false);
  }

  function acceptDeal(id: string) {
    setDeals(prev => prev.map(d => d.id === id ? { ...d, status: "active" } : d));
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
        {[
          { label: "ACTIVE DEALS", value: deals.filter(d => d.status === "active").length, color: "#22c55e" },
          { label: "ACTIVE VALUE", value: `$${totalValue.toLocaleString()}`, color: "#fcd34d" },
          { label: "TOTAL REACH", value: totalImpressions.toLocaleString(), color: "#00FFFF" },
        ].map(m => (
          <div key={m.label} style={{ background: "rgba(255,255,255,0.04)", border: `1px solid ${m.color}33`, borderRadius: 8, padding: "10px 14px" }}>
            <div style={{ color: "#64748b", fontSize: 9, letterSpacing: "0.14em", marginBottom: 4 }}>{m.label}</div>
            <div style={{ color: m.color, fontSize: 18, fontWeight: 700 }}>{m.value}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ color: "#94a3b8", fontSize: 11, letterSpacing: "0.1em" }}>SPONSOR: {sponsorSlug.toUpperCase()}</span>
        <button onClick={() => setShowForm(v => !v)} style={{ background: "rgba(0,255,255,0.12)", border: "1px solid rgba(0,255,255,0.4)", borderRadius: 6, color: "#00FFFF", fontSize: 10, padding: "5px 14px", cursor: "pointer", fontWeight: 700 }}>
          {showForm ? "CANCEL" : "+ NEW DEAL"}
        </button>
      </div>

      {showForm && (
        <div style={{ background: "rgba(0,255,255,0.06)", border: "1px solid rgba(0,255,255,0.3)", borderRadius: 10, padding: 14, display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{ color: "#00FFFF", fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", marginBottom: 4 }}>ATTACH SPONSOR TO VENUE</div>
          <input value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="Deal title" style={{ background: "rgba(255,255,255,0.07)", border: "1px solid #334155", borderRadius: 5, color: "#e2e8f0", padding: "6px 10px", fontSize: 12, outline: "none" }} />
          <input value={newVenue} onChange={e => setNewVenue(e.target.value)} placeholder="Venue name" style={{ background: "rgba(255,255,255,0.07)", border: "1px solid #334155", borderRadius: 5, color: "#e2e8f0", padding: "6px 10px", fontSize: 12, outline: "none" }} />
          <input value={newValue} onChange={e => setNewValue(e.target.value)} placeholder="Deal value ($)" type="number" style={{ background: "rgba(255,255,255,0.07)", border: "1px solid #334155", borderRadius: 5, color: "#e2e8f0", padding: "6px 10px", fontSize: 12, outline: "none" }} />
          <button onClick={() => attachSponsorToVenue(newVenue)} style={{ background: "rgba(0,255,255,0.2)", border: "1px solid #00FFFF", borderRadius: 6, color: "#00FFFF", fontSize: 11, padding: "7px 0", cursor: "pointer", fontWeight: 700 }}>
            ATTACH TO VENUE
          </button>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {deals.map(deal => (
          <div key={deal.id} style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${STATUS_COLORS[deal.status]}33`, borderRadius: 10, padding: "12px 14px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
              <div>
                <div style={{ color: "#e2e8f0", fontSize: 12, fontWeight: 600 }}>{deal.title}</div>
                <div style={{ color: "#64748b", fontSize: 10, marginTop: 2 }}>{deal.venue} · {TYPE_LABELS[deal.type]}</div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
                <span style={{ background: `${STATUS_COLORS[deal.status]}22`, border: `1px solid ${STATUS_COLORS[deal.status]}55`, borderRadius: 4, color: STATUS_COLORS[deal.status], fontSize: 9, padding: "2px 7px", fontWeight: 700 }}>
                  {deal.status.toUpperCase()}
                </span>
                <span style={{ color: "#fcd34d", fontSize: 13, fontWeight: 700 }}>${deal.value.toLocaleString()}</span>
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ color: "#475569", fontSize: 10 }}>{deal.startDate} → {deal.endDate} · {deal.impressions.toLocaleString()} impressions</span>
              {deal.status === "negotiating" || deal.status === "pending" ? (
                <button onClick={() => acceptDeal(deal.id)} style={{ background: "rgba(34,197,94,0.15)", border: "1px solid rgba(34,197,94,0.4)", borderRadius: 5, color: "#22c55e", fontSize: 9, padding: "3px 10px", cursor: "pointer", fontWeight: 700 }}>
                  ACCEPT
                </button>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
