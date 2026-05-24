"use client";
import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";

const GENRES = ["Hip-Hop", "Afrobeats", "R&B", "Pop", "EDM", "Trap", "Drill", "Amapiano", "Dancehall", "Gospel", "Jazz", "All Genres"];
const REGIONS = ["Global", "North America", "Africa", "Latin America", "Asia Pacific", "Europe", "Middle East", "Caribbean"];
const AGE_RANGES = ["13–17", "18–24", "25–34", "35–44", "45+", "All Ages"];
const PLACEMENTS = [
  { id: "homepage",   label: "Homepage Banner",     icon: "🏠", cpm: 12,  note: "Above the fold, max visibility" },
  { id: "magazine",   label: "Magazine Sidebar",    icon: "📰", cpm: 8,   note: "Premium readers, high dwell time" },
  { id: "live-rooms", label: "Live Room Overlay",   icon: "🎤", cpm: 15,  note: "Active audience during live events" },
  { id: "feed",       label: "Feed Sponsored Post", icon: "📱", cpm: 6,   note: "Native feel, artist feed" },
  { id: "search",     label: "Search Placement",    icon: "🔍", cpm: 18,  note: "Intent-driven, high conversion" },
];
const DURATIONS = [
  { value: "7",  label: "7 Days"  },
  { value: "14", label: "14 Days" },
  { value: "30", label: "30 Days" },
  { value: "60", label: "60 Days" },
  { value: "90", label: "90 Days" },
];

export default function NewSponsorCampaignPage() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    name: "",
    description: "",
    targetGenres: [] as string[],
    targetRegions: [] as string[],
    targetAges: [] as string[],
    placement: "",
    budget: "",
    duration: "30",
    creativeUrl: "",
    creativeType: "banner",
    objective: "awareness",
  });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const selectedPlacement = PLACEMENTS.find(p => p.id === form.placement);
  const budgetNum = Number(form.budget) || 0;
  const durationDays = Number(form.duration) || 30;
  const cpm = selectedPlacement?.cpm ?? 10;
  const estimatedImpressions = budgetNum > 0 ? Math.floor((budgetNum / cpm) * 1000) : 0;

  function toggleTag(field: "targetGenres" | "targetRegions" | "targetAges", value: string) {
    setForm(prev => {
      const arr = prev[field];
      const next = arr.includes(value) ? arr.filter(v => v !== value) : [...arr, value];
      return { ...prev, [field]: next };
    });
  }

  async function handleLaunch(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    await new Promise(r => setTimeout(r, 1400));
    setSubmitting(false);
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <main style={mainStyle}>
        <div style={{ maxWidth: 600, margin: "0 auto", padding: "80px 24px", textAlign: "center" }}>
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
            <div style={{ fontSize: 56, marginBottom: 20 }}>🚀</div>
            <div style={{ fontSize: 22, fontWeight: 900, color: "#FFD700", marginBottom: 10 }}>Campaign Launched!</div>
            <div style={{ fontSize: 14, color: "rgba(255,255,255,0.6)", maxWidth: 400, margin: "0 auto 30px", lineHeight: 1.7 }}>
              "{form.name}" is now live. Our team will review creative and activate placements within 2 hours.
            </div>
            <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
              <Link href="/sponsor/campaigns" style={{ padding: "12px 22px", background: "rgba(255,215,0,0.12)", border: "1px solid rgba(255,215,0,0.35)", borderRadius: 8, color: "#FFD700", fontWeight: 700, fontSize: 13, textDecoration: "none" }}>View Campaigns</Link>
              <Link href="/sponsor/analytics" style={{ padding: "12px 22px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8, color: "#fff", fontWeight: 700, fontSize: 13, textDecoration: "none" }}>View Analytics</Link>
            </div>
          </motion.div>
        </div>
      </main>
    );
  }

  return (
    <main style={mainStyle}>
      <div style={{ borderBottom: "1px solid rgba(255,215,0,0.1)", padding: "18px 28px", display: "flex", gap: 12, alignItems: "center" }}>
        <Link href="/sponsor/campaigns" style={{ fontSize: 11, color: "rgba(255,215,0,0.7)", textDecoration: "none" }}>← Campaigns</Link>
        <span style={{ color: "rgba(255,255,255,0.15)" }}>·</span>
        <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>Create New Campaign</span>
      </div>

      <div style={{ maxWidth: 800, margin: "0 auto", padding: "40px 24px" }}>
        <div style={{ marginBottom: 32 }}>
          <div style={{ fontSize: 9, fontWeight: 800, color: "#FFD700", letterSpacing: "0.3em", marginBottom: 8 }}>SPONSOR CAMPAIGNS</div>
          <h1 style={{ fontSize: "clamp(22px,4vw,34px)", fontWeight: 900, margin: "0 0 6px" }}>Launch New Campaign</h1>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)" }}>Step {step} of 3</p>
        </div>

        {/* Step indicators */}
        <div style={{ display: "flex", gap: 8, marginBottom: 32 }}>
          {["Campaign Info", "Targeting", "Creative & Budget"].map((label, i) => (
            <div key={label} style={{ flex: 1, padding: "10px 12px", borderRadius: 8, textAlign: "center",
              background: step === i+1 ? "rgba(255,215,0,0.12)" : step > i+1 ? "rgba(0,255,136,0.1)" : "rgba(255,255,255,0.03)",
              border: `1px solid ${step === i+1 ? "rgba(255,215,0,0.4)" : step > i+1 ? "rgba(0,255,136,0.3)" : "rgba(255,255,255,0.08)"}` }}>
              <div style={{ fontSize: 9, fontWeight: 800, color: step === i+1 ? "#FFD700" : step > i+1 ? "#00FF88" : "rgba(255,255,255,0.35)" }}>
                {step > i+1 ? "✓ " : ""}{label}
              </div>
            </div>
          ))}
        </div>

        <form onSubmit={handleLaunch}>
          <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 18, padding: "28px 24px" }}>
            {/* Step 1: Campaign Info */}
            {step === 1 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                  <div>
                    <label style={labelStyle}>Campaign Name *</label>
                    <input required value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                      placeholder="e.g. Summer Heat 2026 Campaign" style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Description</label>
                    <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                      placeholder="What is this campaign promoting? Any key messages or CTAs?" rows={3} style={{ ...inputStyle, resize: "vertical" }} />
                  </div>
                  <div>
                    <label style={labelStyle}>Campaign Objective</label>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      {[
                        { v: "awareness", l: "Brand Awareness" },
                        { v: "traffic", l: "Drive Traffic" },
                        { v: "conversions", l: "Conversions" },
                        { v: "engagement", l: "Engagement" },
                      ].map(opt => (
                        <div key={opt.v} onClick={() => setForm(p => ({ ...p, objective: opt.v }))}
                          style={{ padding: "8px 14px", borderRadius: 8, cursor: "pointer", fontSize: 12, fontWeight: 700,
                            border: `1px solid ${form.objective === opt.v ? "#FFD700" : "rgba(255,255,255,0.12)"}`,
                            background: form.objective === opt.v ? "rgba(255,215,0,0.1)" : "rgba(255,255,255,0.02)",
                            color: form.objective === opt.v ? "#FFD700" : "rgba(255,255,255,0.6)" }}>
                          {opt.l}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label style={labelStyle}>Placement *</label>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {PLACEMENTS.map(p => (
                        <div key={p.id} onClick={() => setForm(prev => ({ ...prev, placement: p.id }))}
                          style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", borderRadius: 10, cursor: "pointer",
                            border: `1px solid ${form.placement === p.id ? "#FFD700" : "rgba(255,255,255,0.08)"}`,
                            background: form.placement === p.id ? "rgba(255,215,0,0.08)" : "rgba(255,255,255,0.02)" }}>
                          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                            <span style={{ fontSize: 18 }}>{p.icon}</span>
                            <div>
                              <div style={{ fontSize: 13, fontWeight: 700 }}>{p.label}</div>
                              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)" }}>{p.note}</div>
                            </div>
                          </div>
                          <div style={{ fontSize: 12, fontWeight: 800, color: "#FFD700" }}>${p.cpm} CPM</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 2: Targeting */}
            {step === 2 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
                  <div>
                    <label style={labelStyle}>TARGET GENRES</label>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      {GENRES.map(g => (
                        <div key={g} onClick={() => toggleTag("targetGenres", g)}
                          style={{ padding: "6px 12px", borderRadius: 6, cursor: "pointer", fontSize: 11, fontWeight: 600,
                            border: `1px solid ${form.targetGenres.includes(g) ? "#FFD700" : "rgba(255,255,255,0.12)"}`,
                            background: form.targetGenres.includes(g) ? "rgba(255,215,0,0.1)" : "rgba(255,255,255,0.02)",
                            color: form.targetGenres.includes(g) ? "#FFD700" : "rgba(255,255,255,0.55)" }}>
                          {g}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label style={labelStyle}>TARGET REGIONS</label>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      {REGIONS.map(r => (
                        <div key={r} onClick={() => toggleTag("targetRegions", r)}
                          style={{ padding: "6px 12px", borderRadius: 6, cursor: "pointer", fontSize: 11, fontWeight: 600,
                            border: `1px solid ${form.targetRegions.includes(r) ? "#00FFFF" : "rgba(255,255,255,0.12)"}`,
                            background: form.targetRegions.includes(r) ? "rgba(0,255,255,0.08)" : "rgba(255,255,255,0.02)",
                            color: form.targetRegions.includes(r) ? "#00FFFF" : "rgba(255,255,255,0.55)" }}>
                          {r}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label style={labelStyle}>AGE RANGE</label>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      {AGE_RANGES.map(a => (
                        <div key={a} onClick={() => toggleTag("targetAges", a)}
                          style={{ padding: "6px 12px", borderRadius: 6, cursor: "pointer", fontSize: 11, fontWeight: 600,
                            border: `1px solid ${form.targetAges.includes(a) ? "#AA2DFF" : "rgba(255,255,255,0.12)"}`,
                            background: form.targetAges.includes(a) ? "rgba(170,45,255,0.1)" : "rgba(255,255,255,0.02)",
                            color: form.targetAges.includes(a) ? "#AA2DFF" : "rgba(255,255,255,0.55)" }}>
                          {a}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 3: Creative & Budget */}
            {step === 3 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                  <div>
                    <label style={labelStyle}>AD CREATIVE TYPE</label>
                    <div style={{ display: "flex", gap: 8 }}>
                      {[{ v: "banner", l: "Banner Image" }, { v: "video", l: "Video Ad" }, { v: "native", l: "Native Text" }].map(opt => (
                        <div key={opt.v} onClick={() => setForm(p => ({ ...p, creativeType: opt.v }))}
                          style={{ flex: 1, padding: "10px", textAlign: "center", borderRadius: 8, cursor: "pointer", fontSize: 12, fontWeight: 700,
                            border: `1px solid ${form.creativeType === opt.v ? "#FF2DAA" : "rgba(255,255,255,0.1)"}`,
                            background: form.creativeType === opt.v ? "rgba(255,45,170,0.08)" : "rgba(255,255,255,0.02)",
                            color: form.creativeType === opt.v ? "#FF2DAA" : "rgba(255,255,255,0.5)" }}>
                          {opt.l}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label style={labelStyle}>AD CREATIVE URL (paste hosted image/video URL)</label>
                    <input value={form.creativeUrl} onChange={e => setForm(p => ({ ...p, creativeUrl: e.target.value }))}
                      placeholder="https://your-creative-url.com/banner.jpg" style={inputStyle} />
                    <div style={{ fontSize: 9, color: "rgba(255,255,255,0.35)", marginTop: 6 }}>Accepted: JPG, PNG, GIF, MP4. Recommended: 1200×628px for banner.</div>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                    <div>
                      <label style={labelStyle}>TOTAL BUDGET (USD) *</label>
                      <div style={{ position: "relative" }}>
                        <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#FFD700", fontWeight: 800 }}>$</span>
                        <input required type="number" min="100" step="50" value={form.budget} onChange={e => setForm(p => ({ ...p, budget: e.target.value }))}
                          placeholder="500" style={{ ...inputStyle, paddingLeft: 26 }} />
                      </div>
                    </div>
                    <div>
                      <label style={labelStyle}>CAMPAIGN DURATION</label>
                      <select value={form.duration} onChange={e => setForm(p => ({ ...p, duration: e.target.value }))} style={inputStyle}>
                        {DURATIONS.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
                      </select>
                    </div>
                  </div>

                  {/* Estimate */}
                  {budgetNum > 0 && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      style={{ background: "rgba(255,215,0,0.06)", border: "1px solid rgba(255,215,0,0.2)", borderRadius: 12, padding: "18px 20px" }}>
                      <div style={{ fontSize: 9, fontWeight: 800, color: "#FFD700", letterSpacing: "0.2em", marginBottom: 12 }}>CAMPAIGN ESTIMATE</div>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
                        {[
                          { label: "Budget",       value: `$${budgetNum.toLocaleString()}` },
                          { label: "Duration",     value: `${durationDays} days` },
                          { label: "Est. Impr.",   value: estimatedImpressions.toLocaleString() },
                          { label: "Daily Budget", value: `$${(budgetNum / durationDays).toFixed(0)}` },
                          { label: "CPM",          value: `$${cpm}` },
                          { label: "Placement",    value: selectedPlacement?.label ?? "—" },
                        ].map(stat => (
                          <div key={stat.label}>
                            <div style={{ fontSize: 8, color: "rgba(255,255,255,0.4)", fontWeight: 700, marginBottom: 3 }}>{stat.label}</div>
                            <div style={{ fontSize: 14, fontWeight: 800, color: "#FFD700" }}>{stat.value}</div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            )}
          </div>

          <div style={{ marginTop: 18, display: "flex", justifyContent: "space-between", gap: 10 }}>
            {step > 1 ? (
              <button type="button" onClick={() => setStep(s => s - 1)}
                style={{ padding: "12px 22px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "rgba(255,255,255,0.5)", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                ← Back
              </button>
            ) : <div />}

            {step < 3 ? (
              <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} type="button"
                onClick={() => setStep(s => s + 1)}
                style={{ padding: "12px 28px", background: "linear-gradient(135deg,#FFD700,#FF9500)", color: "#050510", fontSize: 13, fontWeight: 800, letterSpacing: "0.06em", borderRadius: 8, border: "none", cursor: "pointer" }}>
                Continue →
              </motion.button>
            ) : (
              <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} type="submit" disabled={submitting}
                style={{ padding: "12px 28px", background: submitting ? "rgba(255,215,0,0.4)" : "linear-gradient(135deg,#FFD700,#FF9500)", color: "#050510", fontSize: 13, fontWeight: 800, letterSpacing: "0.06em", borderRadius: 8, border: "none", cursor: submitting ? "not-allowed" : "pointer" }}>
                {submitting ? "Launching..." : "🚀 Launch Campaign"}
              </motion.button>
            )}
          </div>
        </form>
      </div>
    </main>
  );
}

const mainStyle: React.CSSProperties = { minHeight: "100vh", background: "linear-gradient(160deg,#040412,#050318,#040412)", color: "#fff", paddingBottom: 80, fontFamily: "'Inter',sans-serif" };
const labelStyle: React.CSSProperties = { fontSize: 9, fontWeight: 800, color: "rgba(255,255,255,0.5)", letterSpacing: "0.18em", display: "block", marginBottom: 8 };
const inputStyle: React.CSSProperties = { width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8, padding: "10px 12px", color: "#fff", fontSize: 13, outline: "none", boxSizing: "border-box" };
