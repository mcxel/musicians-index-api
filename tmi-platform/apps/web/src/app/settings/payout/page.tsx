"use client";

import { useState } from "react";
import Link from "next/link";

const METHODS = [
  { id: "bank",   label: "Bank Transfer (ACH)",  desc: "2-3 business days",  icon: "🏦" },
  { id: "paypal", label: "PayPal",                desc: "1-2 business days",  icon: "💳" },
  { id: "stripe", label: "Stripe Express",        desc: "Instant to debit",   icon: "⚡" },
];

export default function PayoutSettingsPage() {
  const [selected, setSelected] = useState("stripe");
  const [saved, setSaved] = useState(false);

  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  return (
    <main style={{ minHeight: "100vh", background: "#0a0a0f", color: "#fff", padding: "32px 24px 80px", fontFamily: "'Inter', sans-serif" }}>
      <div style={{ maxWidth: 600, margin: "0 auto" }}>
        <div style={{ marginBottom: 24 }}>
          <Link href="/settings" style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", textDecoration: "none" }}>← Settings</Link>
        </div>

        <div style={{ fontSize: 10, letterSpacing: 5, color: "#00FFFF", fontWeight: 800, marginBottom: 4 }}>EARNINGS</div>
        <h1 style={{ fontSize: "clamp(22px,4vw,34px)", fontWeight: 900, margin: "0 0 28px" }}>Payout Settings</h1>

        <div style={{ background: "rgba(0,255,255,0.05)", border: "1px solid rgba(0,255,255,0.15)", borderRadius: 12, padding: "20px", marginBottom: 28 }}>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginBottom: 4 }}>AVAILABLE BALANCE</div>
          <div style={{ fontSize: 36, fontWeight: 900, color: "#00FFFF" }}>$0.00</div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginTop: 4 }}>Next payout: auto-processed Friday</div>
        </div>

        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 11, letterSpacing: 2, color: "rgba(255,255,255,0.5)", marginBottom: 12 }}>PAYOUT METHOD</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {METHODS.map((m) => (
              <button
                key={m.id}
                onClick={() => setSelected(m.id)}
                style={{
                  display: "flex", alignItems: "center", gap: 14, padding: "14px 16px",
                  background: selected === m.id ? "rgba(0,255,255,0.08)" : "rgba(255,255,255,0.03)",
                  border: `1px solid ${selected === m.id ? "rgba(0,255,255,0.3)" : "rgba(255,255,255,0.08)"}`,
                  borderRadius: 10, cursor: "pointer", textAlign: "left",
                }}
              >
                <span style={{ fontSize: 22 }}>{m.icon}</span>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: selected === m.id ? "#00FFFF" : "#fff" }}>{m.label}</div>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>{m.desc}</div>
                </div>
                {selected === m.id && (
                  <div style={{ marginLeft: "auto", fontSize: 11, color: "#00FFFF", fontWeight: 700 }}>ACTIVE</div>
                )}
              </button>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 11, letterSpacing: 2, color: "rgba(255,255,255,0.5)", marginBottom: 12 }}>MINIMUM PAYOUT THRESHOLD</div>
          <div style={{ display: "flex", gap: 8 }}>
            {["$10", "$25", "$50", "$100"].map((amt) => (
              <button key={amt} style={{
                padding: "8px 16px", borderRadius: 8,
                background: amt === "$25" ? "rgba(0,255,255,0.12)" : "rgba(255,255,255,0.05)",
                border: `1px solid ${amt === "$25" ? "rgba(0,255,255,0.3)" : "rgba(255,255,255,0.1)"}`,
                color: amt === "$25" ? "#00FFFF" : "rgba(255,255,255,0.6)",
                fontSize: 12, fontWeight: 700, cursor: "pointer",
              }}>{amt}</button>
            ))}
          </div>
        </div>

        <button
          onClick={handleSave}
          style={{
            padding: "13px 32px", background: "linear-gradient(90deg,#00FFFF,#AA2DFF)",
            border: "none", borderRadius: 8, color: "#050510", fontWeight: 800,
            fontSize: 13, letterSpacing: 1, cursor: "pointer",
          }}
        >
          {saved ? "SAVED ✓" : "SAVE PAYOUT SETTINGS"}
        </button>
      </div>
    </main>
  );
}
