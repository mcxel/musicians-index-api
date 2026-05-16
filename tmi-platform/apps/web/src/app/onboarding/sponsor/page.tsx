"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const SPONSOR_TIERS = [
  {
    id: "local",
    label: "LOCAL",
    color: "#4ade80",
    glow: "rgba(74,222,128,0.5)",
    price: "From $99/mo",
    description: "Sponsor artists in your city",
    perks: ["City-level visibility", "Artist livestream overlays", "Social shoutouts"],
  },
  {
    id: "rising",
    label: "RISING",
    color: "#60a5fa",
    glow: "rgba(96,165,250,0.5)",
    price: "From $299/mo",
    description: "Support up-and-coming artists",
    perks: ["Regional reach", "Logo on stage content", "Community visibility"],
  },
  {
    id: "featured",
    label: "FEATURED",
    color: "#FFD700",
    glow: "rgba(255,215,0,0.6)",
    price: "From $699/mo",
    description: "Featured sponsor placement",
    perks: ["Platform-wide banner", "Curated artist matching", "Priority placement"],
  },
  {
    id: "global",
    label: "GLOBAL",
    color: "#FF2DAA",
    glow: "rgba(255,45,170,0.6)",
    price: "From $1,499/mo",
    description: "Global brand presence",
    perks: ["Global reach across all markets", "Exclusive title sponsorships", "Dedicated account manager"],
  },
];

const INDUSTRIES = ["Music & Entertainment", "Fashion & Apparel", "Food & Beverage", "Technology", "Health & Wellness", "Sports", "Finance", "Other"];

export default function OnboardingSponsorPage() {
  const router = useRouter();
  const [company,   setCompany]   = useState("");
  const [brand,     setBrand]     = useState("");
  const [email,     setEmail]     = useState("");
  const [password,  setPassword]  = useState("");
  const [industry,  setIndustry]  = useState("");
  const [tier,      setTier]      = useState("local");
  const [busy,      setBusy]      = useState(false);
  const [error,     setError]     = useState("");

  const activeTier = SPONSOR_TIERS.find((t) => t.id === tier) ?? SPONSOR_TIERS[0]!;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/onboarding/role", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ role: "SPONSOR", company, brand, industry, tier }),
      });
      if (res.ok) {
        router.replace("/dashboard/sponsor");
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
      background: "radial-gradient(ellipse at 20% 15%, #1a0800 0%, #0a0012 40%, #07020e 100%)",
      color: "#fff",
      fontFamily: "'Inter', system-ui, sans-serif",
      overflowX: "hidden",
    }}>
      <div aria-hidden style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }}>
        <div style={{ position: "absolute", top: "8%", left: "8%", width: 360, height: 360, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,140,0,0.14) 0%, transparent 70%)" }} />
        <div style={{ position: "absolute", bottom: "15%", right: "10%", width: 280, height: 280, borderRadius: "50%", background: `radial-gradient(circle, ${activeTier.glow.replace("0.6", "0.1")} 0%, transparent 70%)`, transition: "background 500ms ease" }} />
      </div>

      <div style={{ position: "relative", zIndex: 1, maxWidth: 1100, margin: "0 auto", padding: "40px 24px", display: "grid", gridTemplateColumns: "minmax(0,1fr) minmax(0,460px)", gap: 40, alignItems: "start", minHeight: "100vh" }}>

        {/* LEFT */}
        <div style={{ paddingTop: 40 }}>
          <p style={{ fontSize: 11, letterSpacing: "0.22em", color: "#FFD700", textTransform: "uppercase", marginBottom: 16, fontWeight: 700 }}>The Musician&apos;s Index</p>
          <h1 style={{ fontSize: "clamp(32px,4.5vw,52px)", fontWeight: 900, lineHeight: 1.1, margin: "0 0 20px", textTransform: "uppercase", color: "#FFD700", textShadow: "0 0 40px rgba(255,215,0,0.5)" }}>
            Sponsor Artists.<br />Not Just Ads.
          </h1>
          <p style={{ fontSize: 15, color: "rgba(255,255,255,0.6)", maxWidth: 380, lineHeight: 1.65, marginBottom: 32 }}>
            Support real talent in your community. Artists promote your brand on stage, in streams, and across the platform.
          </p>

          {/* Venue mock with YOUR LOGO */}
          <div style={{ position: "relative", background: "rgba(255,140,0,0.06)", border: "1px solid rgba(255,140,0,0.2)", borderRadius: 16, padding: 24, marginBottom: 28, maxWidth: 420 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 16 }}>
              {["YOUR LOGO", "YOUR LOGO", "YOUR LOGO"].map((l, i) => (
                <div key={i} style={{ padding: "8px 6px", borderRadius: 6, background: "rgba(255,215,0,0.1)", border: "1px dashed rgba(255,215,0,0.3)", textAlign: "center", fontSize: 9, fontWeight: 800, letterSpacing: "0.1em", color: "#FFD700" }}>{l}</div>
              ))}
            </div>
            <div style={{ textAlign: "center", padding: "20px 0", background: "rgba(255,100,0,0.08)", borderRadius: 10, marginBottom: 12 }}>
              <div style={{ fontSize: 28 }}>🎤</div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", marginTop: 6 }}>Artist on stage — your logo everywhere</div>
            </div>
            <div style={{ padding: "8px 12px", borderRadius: 6, background: "rgba(255,215,0,0.08)", border: "1px solid rgba(255,215,0,0.2)", textAlign: "center", fontSize: 9, fontWeight: 800, letterSpacing: "0.1em", color: "#FFD700" }}>YOUR LOGO</div>
          </div>

          {/* Benefit callouts */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {[
              { icon: "🎤", title: "Sponsor Artists Directly", bullets: ["Choose artists to support", "Fund their growth and exposure"] },
              { icon: "🌍", title: "Local + Global Reach",     bullets: ["Sponsor artists in your city", "Or sponsor globally"] },
            ].map((b) => (
              <div key={b.title} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                <span style={{ fontSize: 20, marginTop: 2 }}>{b.icon}</span>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: "#FFD700", marginBottom: 4 }}>{b.title}</div>
                  {b.bullets.map((bl) => <div key={bl} style={{ fontSize: 12, color: "rgba(255,255,255,0.55)", marginBottom: 2 }}>✓ {bl}</div>)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT — Form */}
        <div style={{ position: "relative", paddingTop: 40 }}>
          <TheaterDots position="top" color={activeTier.color} />
          <TheaterDots position="bottom" color={activeTier.color} />
          <TheaterDots position="left" color={activeTier.color} />
          <TheaterDots position="right" color={activeTier.color} />

          <div style={{
            background: "rgba(12,6,28,0.95)",
            border: `2px solid ${activeTier.color}55`,
            borderRadius: 16,
            padding: "32px 28px",
            backdropFilter: "blur(12px)",
            boxShadow: `0 0 60px ${activeTier.glow.replace("0.6", "0.15")}, inset 0 0 40px rgba(255,80,0,0.04)`,
            transition: "border-color 400ms ease, box-shadow 400ms ease",
          }}>
            <h2 style={{ fontSize: 20, fontWeight: 900, letterSpacing: "0.1em", textTransform: "uppercase", color: "#FFD700", margin: "0 0 4px", textAlign: "center" }}>Sponsor Sign Up</h2>
            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", textAlign: "center", marginBottom: 24 }}>Sponsor artists directly and get promoted everywhere they go.</p>

            <form onSubmit={(e) => void handleSubmit(e)} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <SignupInput icon="🏢" placeholder="Company Name" value={company} onChange={setCompany} accentColor={activeTier.color} />
              <SignupInput icon="✨" placeholder="Brand Name (optional)" value={brand} onChange={setBrand} accentColor={activeTier.color} />
              <SignupInput icon="✉️" placeholder="Email" type="email" value={email} onChange={setEmail} accentColor={activeTier.color} />
              <SignupInput icon="🔒" placeholder="Password" type="password" value={password} onChange={setPassword} accentColor={activeTier.color} />

              {/* Industry dropdown */}
              <div style={{ position: "relative" }}>
                <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", fontSize: 14, zIndex: 1 }}>🏭</span>
                <select value={industry} onChange={(e) => setIndustry(e.target.value)} style={{ width: "100%", padding: "11px 14px 11px 36px", background: "rgba(255,255,255,0.05)", border: `1px solid ${activeTier.color}40`, borderRadius: 8, color: industry ? "#fff" : "rgba(255,255,255,0.4)", fontSize: 14, outline: "none", appearance: "none", boxSizing: "border-box" }}>
                  <option value="" disabled>Industry</option>
                  {INDUSTRIES.map((ind) => <option key={ind} value={ind} style={{ background: "#0c061c" }}>{ind}</option>)}
                </select>
              </div>

              {/* Tier tabs */}
              <div>
                <p style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginBottom: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" }}>Sponsorship Tier</p>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 6 }}>
                  {SPONSOR_TIERS.map((t) => (
                    <button key={t.id} type="button" onClick={() => setTier(t.id)} style={{
                      padding: "10px 4px",
                      borderRadius: 8,
                      border: `2px solid ${tier === t.id ? t.color : "rgba(255,255,255,0.1)"}`,
                      background: tier === t.id ? `${t.color}18` : "rgba(255,255,255,0.03)",
                      color: tier === t.id ? t.color : "rgba(255,255,255,0.45)",
                      cursor: "pointer", fontSize: 10, fontWeight: 900,
                      letterSpacing: "0.1em", textTransform: "uppercase",
                      transition: "all 200ms ease",
                      boxShadow: tier === t.id ? `0 0 16px ${t.glow}` : "none",
                    }}>
                      {t.label}
                    </button>
                  ))}
                </div>

                {/* Active tier details */}
                <div style={{ marginTop: 12, padding: "12px 14px", borderRadius: 10, background: `${activeTier.color}0d`, border: `1px solid ${activeTier.color}30` }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                    <span style={{ fontSize: 12, fontWeight: 800, color: activeTier.color }}>{activeTier.label} TIER</span>
                    <span style={{ fontSize: 11, color: "rgba(255,255,255,0.5)" }}>{activeTier.price}</span>
                  </div>
                  <p style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", margin: "0 0 8px" }}>{activeTier.description}</p>
                  {activeTier.perks.map((p) => (
                    <div key={p} style={{ fontSize: 11, color: "rgba(255,255,255,0.65)", marginBottom: 3 }}>✓ {p}</div>
                  ))}
                </div>
              </div>

              {error && <p style={{ fontSize: 13, color: "#f87171", margin: 0 }}>{error}</p>}

              <button type="submit" disabled={busy} style={{
                marginTop: 4, padding: "14px",
                background: busy ? `${activeTier.color}22` : `linear-gradient(135deg, ${activeTier.color}, ${activeTier.color}bb)`,
                border: "none", borderRadius: 10,
                color: activeTier.id === "featured" ? "#000" : "#fff",
                fontSize: 14, fontWeight: 900, letterSpacing: "0.15em", textTransform: "uppercase",
                cursor: busy ? "not-allowed" : "pointer",
                boxShadow: busy ? "none" : `0 0 24px ${activeTier.glow}`,
                transition: "all 300ms ease",
              }}>
                {busy ? "Setting up…" : "Start Sponsoring Artists"}
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
        background: "rgba(255,255,255,0.05)", border: `1px solid ${accentColor}35`,
        borderRadius: 8, color: "#fff", fontSize: 14, outline: "none", boxSizing: "border-box",
        transition: "border-color 300ms ease",
      }} />
    </div>
  );
}

function TheaterDots({ position, color = "#FFD700" }: { position: "top" | "bottom" | "left" | "right"; color?: string }) {
  const isH = position === "top" || position === "bottom";
  const count = isH ? 14 : 10;
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
        <div key={i} style={{ width: 8, height: 8, borderRadius: "50%", background: i % 2 === 0 ? color : "#ff8c00", boxShadow: `0 0 8px ${i % 2 === 0 ? color : "#ff8c00"}`, transition: "background 400ms ease" }} />
      ))}
    </div>
  );
}
