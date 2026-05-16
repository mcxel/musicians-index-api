"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const CAMPAIGN_TYPES = [
  { id: "video",    label: "Video Ads",       emoji: "🎬" },
  { id: "banner",   label: "Banner Ads",      emoji: "🖼️" },
  { id: "rooms",    label: "Sponsored Rooms",  emoji: "🏛️" },
  { id: "streams",  label: "Sponsored Streams",emoji: "📡" },
];

const FEATURES = [
  { icon: "📊", label: "Real-Time Analytics" },
  { icon: "🎯", label: "Audience Targeting"  },
  { icon: "📍", label: "Ad Placement Control" },
  { icon: "💰", label: "ROI Tracking"         },
  { icon: "🧪", label: "A/B Testing"          },
];

const DURATIONS = ["7 days", "14 days", "30 days", "60 days", "90 days", "Custom"];

export default function OnboardingAdvertiserPage() {
  const router = useRouter();
  const [company,      setCompany]      = useState("");
  const [email,        setEmail]        = useState("");
  const [password,     setPassword]     = useState("");
  const [campaignType, setCampaignType] = useState("video");
  const [budget,       setBudget]       = useState("");
  const [duration,     setDuration]     = useState("");
  const [audience,     setAudience]     = useState("");
  const [busy,         setBusy]         = useState(false);
  const [error,        setError]        = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/onboarding/role", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ role: "ADVERTISER", company, campaignType, budget, duration }),
      });
      if (res.ok) {
        router.replace("/dashboard/advertiser");
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
    <main style={{
      minHeight: "100vh",
      background: "radial-gradient(ellipse at 20% 10%, #001a2a 0%, #050012 40%, #07020e 100%)",
      color: "#fff",
      fontFamily: "'Inter', system-ui, sans-serif",
      overflowX: "hidden",
    }}>
      <div aria-hidden style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }}>
        <div style={{ position: "absolute", top: "5%", left: "5%", width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, rgba(0,180,255,0.12) 0%, transparent 70%)" }} />
        <div style={{ position: "absolute", bottom: "10%", right: "5%", width: 300, height: 300, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,140,0,0.1) 0%, transparent 70%)" }} />
      </div>

      <div style={{ position: "relative", zIndex: 1, maxWidth: 1100, margin: "0 auto", padding: "40px 24px", display: "grid", gridTemplateColumns: "minmax(0,1fr) minmax(0,460px)", gap: 40, alignItems: "center", minHeight: "100vh" }}>

        {/* LEFT */}
        <div>
          <p style={{ fontSize: 11, letterSpacing: "0.22em", color: "#00BFFF", textTransform: "uppercase", marginBottom: 16, fontWeight: 700 }}>The Musician&apos;s Index</p>
          <h1 style={{ fontSize: "clamp(32px,4.5vw,52px)", fontWeight: 900, lineHeight: 1.1, margin: "0 0 20px", textTransform: "uppercase", color: "#FFD700", textShadow: "0 0 40px rgba(255,215,0,0.4)" }}>
            Reach Millions<br />in Real Time.
          </h1>
          <p style={{ fontSize: 15, color: "rgba(255,255,255,0.6)", maxWidth: 380, lineHeight: 1.65, marginBottom: 32 }}>
            Target the right audience instantly. Track performance as it happens. Scale your campaigns globally.
          </p>

          {/* Stats */}
          <div style={{ display: "flex", gap: 20, marginBottom: 32, flexWrap: "wrap" }}>
            {[{ label: "+127,882", sub: "Views today" }, { label: "4.79M", sub: "Weekly reach" }].map((s) => (
              <div key={s.label} style={{ padding: "14px 20px", borderRadius: 12, background: "rgba(0,191,255,0.08)", border: "1px solid rgba(0,191,255,0.2)" }}>
                <div style={{ fontSize: 22, fontWeight: 900, color: "#00BFFF" }}>{s.label}</div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", marginTop: 2 }}>{s.sub}</div>
              </div>
            ))}
          </div>

          {/* Feature list */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {FEATURES.map((f) => (
              <div key={f.label} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 14, color: "rgba(255,255,255,0.7)" }}>
                <span>{f.icon}</span> {f.label}
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT — Form */}
        <div style={{ position: "relative" }}>
          <TheaterDots position="top" color="#00BFFF" />
          <TheaterDots position="bottom" color="#00BFFF" />
          <TheaterDots position="left" color="#00BFFF" />
          <TheaterDots position="right" color="#00BFFF" />

          <div style={{
            background: "rgba(8,12,30,0.95)",
            border: "2px solid rgba(0,191,255,0.3)",
            borderRadius: 16,
            padding: "32px 28px",
            backdropFilter: "blur(12px)",
            boxShadow: "0 0 60px rgba(0,140,255,0.18), inset 0 0 40px rgba(0,80,255,0.06)",
          }}>
            <h2 style={{ fontSize: 20, fontWeight: 900, letterSpacing: "0.1em", textTransform: "uppercase", color: "#FFD700", margin: "0 0 4px", textAlign: "center" }}>Advertiser Sign Up</h2>
            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", textAlign: "center", marginBottom: 24 }}>Create your account and launch impact campaigns!</p>

            <form onSubmit={(e) => void handleSubmit(e)} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <SignupInput icon="🏢" placeholder="Company Name" value={company} onChange={setCompany} accentColor="#00BFFF" />
              <SignupInput icon="✉️" placeholder="Email" type="email" value={email} onChange={setEmail} accentColor="#00BFFF" />
              <SignupInput icon="🔒" placeholder="Password" type="password" value={password} onChange={setPassword} accentColor="#00BFFF" />

              {/* Campaign Type */}
              <div>
                <p style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", marginBottom: 10, fontWeight: 600 }}>Campaign Type:</p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  {CAMPAIGN_TYPES.map((ct) => (
                    <button key={ct.id} type="button" onClick={() => setCampaignType(ct.id)} style={{
                      display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
                      padding: "10px 8px", borderRadius: 8,
                      border: `1px solid ${campaignType === ct.id ? "#00BFFF" : "rgba(255,255,255,0.1)"}`,
                      background: campaignType === ct.id ? "rgba(0,191,255,0.12)" : "rgba(255,255,255,0.03)",
                      color: campaignType === ct.id ? "#00BFFF" : "rgba(255,255,255,0.5)",
                      cursor: "pointer", fontSize: 11, fontWeight: 700, transition: "all 150ms ease",
                    }}>
                      <span style={{ fontSize: 18 }}>{ct.emoji}</span>
                      {ct.label}
                    </button>
                  ))}
                </div>
              </div>

              <SignupInput icon="💵" placeholder="Daily Budget (e.g. $50)" value={budget} onChange={setBudget} accentColor="#00BFFF" />

              {/* Duration dropdown */}
              <div style={{ position: "relative" }}>
                <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", fontSize: 14, zIndex: 1 }}>📅</span>
                <select value={duration} onChange={(e) => setDuration(e.target.value)} style={{ width: "100%", padding: "11px 14px 11px 36px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(0,191,255,0.25)", borderRadius: 8, color: duration ? "#fff" : "rgba(255,255,255,0.4)", fontSize: 14, outline: "none", appearance: "none", boxSizing: "border-box" }}>
                  <option value="" disabled>Campaign Duration</option>
                  {DURATIONS.map((d) => <option key={d} value={d} style={{ background: "#080c1e" }}>{d}</option>)}
                </select>
              </div>

              {/* Target Audience */}
              <SignupInput icon="🎯" placeholder="Optional: Target Audience" value={audience} onChange={setAudience} accentColor="#00BFFF" />

              {error && <p style={{ fontSize: 13, color: "#f87171", margin: 0 }}>{error}</p>}

              <button type="submit" disabled={busy} style={{
                marginTop: 4, padding: "14px",
                background: busy ? "rgba(0,191,255,0.15)" : "linear-gradient(135deg, #00BFFF, #0080ff)",
                border: "none", borderRadius: 10, color: "#fff",
                fontSize: 14, fontWeight: 900, letterSpacing: "0.15em", textTransform: "uppercase",
                cursor: busy ? "not-allowed" : "pointer",
                boxShadow: busy ? "none" : "0 0 24px rgba(0,191,255,0.4)",
              }}>
                {busy ? "Setting up…" : "Launch Campaign"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}

function SignupInput({ icon, placeholder, value, onChange, type = "text", accentColor = "#FFD700" }: {
  icon: string; placeholder: string; value: string;
  onChange: (v: string) => void; type?: string; accentColor?: string;
}) {
  return (
    <div style={{ position: "relative" }}>
      <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", fontSize: 14 }}>{icon}</span>
      <input type={type} placeholder={placeholder} value={value} onChange={(e) => onChange(e.target.value)} style={{
        width: "100%", padding: "11px 14px 11px 36px",
        background: "rgba(255,255,255,0.05)", border: `1px solid ${accentColor}40`,
        borderRadius: 8, color: "#fff", fontSize: 14, outline: "none", boxSizing: "border-box",
      }} />
    </div>
  );
}

function TheaterDots({ position, color = "#FFD700" }: { position: "top" | "bottom" | "left" | "right"; color?: string }) {
  const isH = position === "top" || position === "bottom";
  const count = isH ? 14 : 10;
  const alt = color === "#FFD700" ? "#ff8c00" : "#0040ff";
  return (
    <div aria-hidden style={{
      position: "absolute",
      ...(position === "top"    ? { top: -10, left: "50%", transform: "translateX(-50%)", flexDirection: "row" as const } : {}),
      ...(position === "bottom" ? { bottom: -10, left: "50%", transform: "translateX(-50%)", flexDirection: "row" as const } : {}),
      ...(position === "left"   ? { left: -10, top: "50%", transform: "translateY(-50%)", flexDirection: "column" as const } : {}),
      ...(position === "right"  ? { right: -10, top: "50%", transform: "translateY(-50%)", flexDirection: "column" as const } : {}),
      display: "flex", gap: isH ? "18px" : "14px", zIndex: 2, pointerEvents: "none",
    }}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} style={{ width: 8, height: 8, borderRadius: "50%", background: i % 2 === 0 ? color : alt, boxShadow: `0 0 8px ${i % 2 === 0 ? color : alt}` }} />
      ))}
    </div>
  );
}
