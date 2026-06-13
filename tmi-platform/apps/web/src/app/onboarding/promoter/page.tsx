"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const PROMOTER_TIERS = [
  {
    id: "indie",
    label: "INDIE",
    color: "#00FF88",
    glow: "rgba(0,255,136,0.5)",
    price: "Free to start",
    description: "Local shows, small venues",
    perks: ["Up to 3 active events", "Ticket sales up to $5k/mo", "TMI ticketing dashboard"],
  },
  {
    id: "rising",
    label: "RISING",
    color: "#00FFFF",
    glow: "rgba(0,255,255,0.5)",
    price: "$49/mo",
    description: "Regional promoter growing fast",
    perks: ["Unlimited events", "Ticket sales up to $25k/mo", "Artist booking tools", "Promo campaign manager"],
  },
  {
    id: "pro",
    label: "PRO",
    color: "#FFD700",
    glow: "rgba(255,215,0,0.6)",
    price: "$149/mo",
    description: "Full promoter operations",
    perks: ["Unlimited events + revenue", "Venue seat map builder", "Batch ticket printing", "Sponsor matchmaking", "Priority support"],
  },
  {
    id: "agency",
    label: "AGENCY",
    color: "#FF2DAA",
    glow: "rgba(255,45,170,0.6)",
    price: "$399/mo",
    description: "Agency — multiple clients & venues",
    perks: ["Multi-client management", "White-label ticketing", "Dedicated account manager", "API access", "Revenue share programs"],
  },
];

const FOCUS_AREAS = [
  "Hip-Hop / Rap", "R&B / Soul", "Dance / EDM", "Latin", "Jazz / Blues",
  "Pop", "Rock / Alternative", "Gospel", "Comedy Shows", "Multi-Genre",
];

export default function OnboardingPromoterPage() {
  const router = useRouter();
  const [company,   setCompany]   = useState("");
  const [name,      setName]      = useState("");
  const [email,     setEmail]     = useState("");
  const [password,  setPassword]  = useState("");
  const [city,      setCity]      = useState("");
  const [focus,     setFocus]     = useState("");
  const [tier,      setTier]      = useState("indie");
  const [busy,      setBusy]      = useState(false);
  const [error,     setError]     = useState("");

  const activeTier = PROMOTER_TIERS.find((t) => t.id === tier) ?? PROMOTER_TIERS[0]!;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/onboarding/role", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ role: "PROMOTER", company, city, focus, tier }),
      });
      if (res.ok) {
        router.replace("/dashboard/promoter");
      } else {
        const d = await res.json().catch(() => ({})) as { message?: string };
        setError(d?.message ?? `Error ${res.status}`);
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", padding: "40px 20px 80px" }}>
      <div style={{ maxWidth: 800, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div style={{ fontSize: 9, letterSpacing: "0.5em", color: "#00FF88", fontWeight: 800, marginBottom: 10 }}>
            THE MUSICIAN'S INDEX
          </div>
          <h1 style={{ margin: "0 0 10px", fontSize: "clamp(1.8rem,4vw,2.8rem)", fontWeight: 900, lineHeight: 1.1 }}>
            Join as a <span style={{ color: "#00FF88" }}>Promoter</span>
          </h1>
          <p style={{ margin: 0, fontSize: 14, color: "rgba(255,255,255,0.5)", maxWidth: 480, marginInline: "auto" }}>
            Book artists, sell tickets, run events. Zero TMI platform fees on ticketing.
            <span style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", display: "block", marginTop: 4 }}>Standard payment processing fees may apply.</span>
          </p>
        </div>

        {/* Tier selector */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(170px,1fr))", gap: 12, marginBottom: 36 }}>
          {PROMOTER_TIERS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTier(t.id)}
              style={{
                background: tier === t.id ? `rgba(${t.id === "indie" ? "0,255,136" : t.id === "rising" ? "0,255,255" : t.id === "pro" ? "255,215,0" : "255,45,170"},0.1)` : "rgba(255,255,255,0.03)",
                border: `1.5px solid ${tier === t.id ? t.color : "rgba(255,255,255,0.1)"}`,
                borderRadius: 12,
                padding: "16px 14px",
                cursor: "pointer",
                textAlign: "left",
                transition: "all 0.2s",
                boxShadow: tier === t.id ? `0 0 20px ${t.glow}` : "none",
              }}
            >
              <div style={{ fontSize: 10, fontWeight: 900, letterSpacing: "0.2em", color: t.color, marginBottom: 4 }}>{t.label}</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#fff", marginBottom: 4 }}>{t.price}</div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", lineHeight: 1.5 }}>{t.description}</div>
              {tier === t.id && (
                <ul style={{ margin: "10px 0 0", padding: "0 0 0 14px", fontSize: 10, color: "rgba(255,255,255,0.6)", lineHeight: 1.8 }}>
                  {t.perks.map((p) => <li key={p}>{p}</li>)}
                </ul>
              )}
            </button>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <div>
              <label style={{ fontSize: 9, letterSpacing: "0.2em", color: "rgba(255,255,255,0.4)", display: "block", marginBottom: 6 }}>YOUR NAME</label>
              <input
                required value={name} onChange={(e) => setName(e.target.value)}
                placeholder="Full name"
                style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8, padding: "10px 14px", color: "#fff", fontSize: 13, boxSizing: "border-box" }}
              />
            </div>
            <div>
              <label style={{ fontSize: 9, letterSpacing: "0.2em", color: "rgba(255,255,255,0.4)", display: "block", marginBottom: 6 }}>COMPANY / BRAND</label>
              <input
                value={company} onChange={(e) => setCompany(e.target.value)}
                placeholder="Promotion company (optional)"
                style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8, padding: "10px 14px", color: "#fff", fontSize: 13, boxSizing: "border-box" }}
              />
            </div>
          </div>

          <div>
            <label style={{ fontSize: 9, letterSpacing: "0.2em", color: "rgba(255,255,255,0.4)", display: "block", marginBottom: 6 }}>EMAIL</label>
            <input
              type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="you@promotionco.com"
              style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8, padding: "10px 14px", color: "#fff", fontSize: 13, boxSizing: "border-box" }}
            />
          </div>

          <div>
            <label style={{ fontSize: 9, letterSpacing: "0.2em", color: "rgba(255,255,255,0.4)", display: "block", marginBottom: 6 }}>PASSWORD</label>
            <input
              type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 8 characters"
              style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8, padding: "10px 14px", color: "#fff", fontSize: 13, boxSizing: "border-box" }}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <div>
              <label style={{ fontSize: 9, letterSpacing: "0.2em", color: "rgba(255,255,255,0.4)", display: "block", marginBottom: 6 }}>CITY / MARKET</label>
              <input
                value={city} onChange={(e) => setCity(e.target.value)}
                placeholder="e.g. Atlanta, GA"
                style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8, padding: "10px 14px", color: "#fff", fontSize: 13, boxSizing: "border-box" }}
              />
            </div>
            <div>
              <label style={{ fontSize: 9, letterSpacing: "0.2em", color: "rgba(255,255,255,0.4)", display: "block", marginBottom: 6 }}>PRIMARY GENRE / FOCUS</label>
              <select
                value={focus} onChange={(e) => setFocus(e.target.value)}
                style={{ width: "100%", background: "#0a0820", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8, padding: "10px 14px", color: focus ? "#fff" : "rgba(255,255,255,0.35)", fontSize: 13, boxSizing: "border-box" }}
              >
                <option value="">Select focus area...</option>
                {FOCUS_AREAS.map((f) => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>
          </div>

          {error && (
            <div style={{ background: "rgba(255,45,170,0.1)", border: "1px solid rgba(255,45,170,0.3)", borderRadius: 8, padding: "10px 14px", fontSize: 12, color: "#FF2DAA" }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={busy}
            style={{
              marginTop: 8,
              padding: "14px 24px",
              background: busy ? "rgba(0,255,136,0.3)" : "linear-gradient(135deg,#00FF88,#00CCAA)",
              border: "none",
              borderRadius: 10,
              color: "#050510",
              fontSize: 13,
              fontWeight: 900,
              letterSpacing: "0.15em",
              cursor: busy ? "not-allowed" : "pointer",
              transition: "opacity 0.2s",
            }}
          >
            {busy ? "CREATING ACCOUNT..." : `JOIN AS ${activeTier.label} PROMOTER →`}
          </button>

          <p style={{ textAlign: "center", fontSize: 11, color: "rgba(255,255,255,0.3)", margin: "4px 0 0" }}>
            Already have an account?{" "}
            <a href="/auth?tab=login" style={{ color: "#00FF88", textDecoration: "none" }}>Sign in</a>
          </p>
        </form>
      </div>
    </main>
  );
}
