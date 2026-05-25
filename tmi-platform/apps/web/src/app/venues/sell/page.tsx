"use client";

import { useState } from "react";
import Link from "next/link";

interface EventDraft {
  title: string;
  venueName: string;
  city: string;
  date: string;
  time: string;
  tierName: string;
  price: string;
  quantity: string;
  description: string;
}

const EMPTY: EventDraft = {
  title: "", venueName: "", city: "", date: "", time: "",
  tierName: "General Admission", price: "", quantity: "", description: "",
};

export default function VenuesSellPage() {
  const [form, setForm] = useState<EventDraft>(EMPTY);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  function set(field: keyof EventDraft, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    // In production: POST to /api/venues/events — saves draft, gates on Stripe Connect status
    await new Promise((r) => setTimeout(r, 800));
    setLoading(false);
    setSubmitted(true);
  }

  const inputStyle: React.CSSProperties = {
    width: "100%", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: 8, padding: "11px 14px", color: "#fff", fontSize: 13, outline: "none", boxSizing: "border-box",
  };
  const labelStyle: React.CSSProperties = {
    fontSize: 9, letterSpacing: "0.25em", color: "rgba(255,255,255,0.4)", fontWeight: 800,
    textTransform: "uppercase", display: "block", marginBottom: 6,
  };

  if (submitted) {
    return (
      <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
        <div style={{ maxWidth: 520, textAlign: "center" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🎟️</div>
          <h1 style={{ fontSize: 28, fontWeight: 900, margin: "0 0 12px" }}>Event Draft Saved!</h1>
          <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 14, lineHeight: 1.7, marginBottom: 24 }}>
            Your event has been saved as a draft. To enable public ticket sales, connect your Stripe payout account.
            <br /><br />
            <strong style={{ color: "#FFD700" }}>Zero TMI platform fees.</strong> Standard payment processing fees may apply.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <a href="/venues/dashboard" style={{ padding: "12px 24px", background: "#FFD700", color: "#050510", borderRadius: 10, fontWeight: 900, fontSize: 11, textDecoration: "none", letterSpacing: "0.1em" }}>
              CONNECT STRIPE →
            </a>
            <Link href="/venues/sell" onClick={() => { setSubmitted(false); setForm(EMPTY); }} style={{ padding: "12px 24px", border: "1px solid rgba(255,255,255,0.2)", color: "#fff", borderRadius: 10, fontWeight: 700, fontSize: 11, textDecoration: "none" }}>
              CREATE ANOTHER
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", paddingBottom: 80 }}>

      {/* Hero strip */}
      <div style={{ background: "linear-gradient(135deg,#050510,#0a0820)", borderBottom: "1px solid rgba(255,215,0,0.15)", padding: "32px 24px 28px" }}>
        <div style={{ maxWidth: 720, margin: "0 auto" }}>
          <div style={{ fontSize: 8, letterSpacing: "0.45em", color: "#FFD700", fontWeight: 800, marginBottom: 10 }}>
            VENUE TICKETING · THE MUSICIAN'S INDEX
          </div>
          <h1 style={{ margin: "0 0 10px", fontSize: "clamp(1.6rem,4vw,2.4rem)", fontWeight: 900, lineHeight: 1.1 }}>
            Sell Tickets. Keep Everything.
          </h1>
          <p style={{ margin: 0, fontSize: 14, color: "rgba(255,255,255,0.55)", lineHeight: 1.7, maxWidth: 480 }}>
            Zero TMI platform fees. Lower ticket prices mean bigger crowds, more energy, and better shows for everyone.
            Standard payment processing fees may apply.
          </p>

          {/* Fee comparison */}
          <div style={{ display: "flex", gap: 12, marginTop: 20, flexWrap: "wrap" }}>
            {[
              { label: "Ticketmaster", fee: "20–30%", color: "#FF6B6B" },
              { label: "Eventbrite", fee: "~8%", color: "#FF9500" },
              { label: "TMI", fee: "0% ✓", color: "#00FF88" },
            ].map((item) => (
              <div key={item.label} style={{ borderRadius: 8, border: `1px solid ${item.color}30`, background: `${item.color}08`, padding: "10px 16px", minWidth: 100 }}>
                <div style={{ fontSize: 9, color: "rgba(255,255,255,0.35)", letterSpacing: "0.15em", marginBottom: 4 }}>{item.label}</div>
                <div style={{ fontSize: 18, fontWeight: 900, color: item.color }}>{item.fee}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Form */}
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "32px 24px" }}>
        <div style={{ fontSize: 9, letterSpacing: "0.35em", color: "#FFD700", fontWeight: 800, marginBottom: 20 }}>CREATE TICKETED EVENT</div>

        <form onSubmit={(e) => void handleSubmit(e)}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
            <div style={{ gridColumn: "1 / -1" }}>
              <label style={labelStyle}>Event Title *</label>
              <input required style={inputStyle} placeholder="e.g. Friday Night Live — Cypher Edition" value={form.title} onChange={(e) => set("title", e.target.value)} />
            </div>
            <div>
              <label style={labelStyle}>Venue Name *</label>
              <input required style={inputStyle} placeholder="The Stage at TMI" value={form.venueName} onChange={(e) => set("venueName", e.target.value)} />
            </div>
            <div>
              <label style={labelStyle}>City / State *</label>
              <input required style={inputStyle} placeholder="Atlanta, GA" value={form.city} onChange={(e) => set("city", e.target.value)} />
            </div>
            <div>
              <label style={labelStyle}>Event Date *</label>
              <input required type="date" style={inputStyle} value={form.date} onChange={(e) => set("date", e.target.value)} />
            </div>
            <div>
              <label style={labelStyle}>Event Time *</label>
              <input required type="time" style={inputStyle} value={form.time} onChange={(e) => set("time", e.target.value)} />
            </div>
          </div>

          {/* Ticket tier */}
          <div style={{ background: "rgba(255,215,0,0.04)", border: "1px solid rgba(255,215,0,0.18)", borderRadius: 12, padding: 20, marginBottom: 16 }}>
            <div style={{ fontSize: 9, letterSpacing: "0.3em", color: "#FFD700", fontWeight: 800, marginBottom: 14 }}>TICKET TIER</div>
            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: 14 }}>
              <div>
                <label style={labelStyle}>Tier Name</label>
                <input style={inputStyle} placeholder="General Admission" value={form.tierName} onChange={(e) => set("tierName", e.target.value)} />
              </div>
              <div>
                <label style={labelStyle}>Price ($) *</label>
                <input required type="number" min="1" step="0.01" style={inputStyle} placeholder="25.00" value={form.price} onChange={(e) => set("price", e.target.value)} />
              </div>
              <div>
                <label style={labelStyle}>Quantity *</label>
                <input required type="number" min="1" style={inputStyle} placeholder="200" value={form.quantity} onChange={(e) => set("quantity", e.target.value)} />
              </div>
            </div>
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={labelStyle}>Description</label>
            <textarea rows={4} style={{ ...inputStyle, resize: "vertical", fontFamily: "inherit" }} placeholder="Tell fans what to expect..." value={form.description} onChange={(e) => set("description", e.target.value)} />
          </div>

          {/* Stripe notice */}
          <div style={{ background: "rgba(0,255,136,0.05)", border: "1px solid rgba(0,255,136,0.2)", borderRadius: 10, padding: "14px 16px", marginBottom: 24, fontSize: 12, color: "rgba(255,255,255,0.5)", lineHeight: 1.6 }}>
            <strong style={{ color: "#00FF88" }}>Payout Setup Required</strong> — To enable public ticket sales, connect your Stripe payout account.
            Event will be saved as a draft until payout is ready. Zero TMI platform fees apply.
            Standard payment processing fees may apply.
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{ padding: "14px 36px", background: loading ? "rgba(255,215,0,0.2)" : "linear-gradient(90deg,#FFD700,#FF9500)", color: loading ? "rgba(255,255,255,0.4)" : "#050510", border: "none", borderRadius: 10, fontWeight: 900, fontSize: 13, cursor: loading ? "not-allowed" : "pointer", letterSpacing: "0.1em", textTransform: "uppercase" }}
          >
            {loading ? "SAVING..." : "🎟️ CREATE TICKETED EVENT →"}
          </button>
        </form>
      </div>
    </main>
  );
}
