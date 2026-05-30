"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

const VENUE_TYPES = ["Club / Bar", "Concert Hall", "Recording Studio", "Outdoor Amphitheater", "Arena", "Community Center", "Private Event Space", "Other"];
const SERVICES = ["Live Streaming", "Ticketing", "Artist Booking", "Sponsorship Slots", "VIP Lounge", "Sound / AV Rental", "Catering / Bar", "Recording Services"];

const ACCENT = "#FF6B35";

export default function OnboardingVenuePage() {
  const router = useRouter();
  const [form, setForm] = useState({
    venueName: "",
    venueType: "",
    capacity: "",
    city: "",
    state: "",
    contactEmail: "",
    website: "",
    bio: "",
    services: [] as string[],
  });
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  function toggle(service: string) {
    setForm(f => ({
      ...f,
      services: f.services.includes(service)
        ? f.services.filter(s => s !== service)
        : [...f.services, service],
    }));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await fetch("/api/profile/venue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(form),
      });
    } catch { /* non-fatal */ }
    setSaving(false);
    setDone(true);
    setTimeout(() => router.push("/dashboard/venue"), 1400);
  }

  if (done) return (
    <main style={{ minHeight: "100vh", background: "#0a0a0f", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 52, marginBottom: 16 }}>🏟️</div>
        <div style={{ fontSize: 24, fontWeight: 900, color: ACCENT, letterSpacing: 2 }}>VENUE PROFILE LIVE</div>
        <div style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", marginTop: 8 }}>Redirecting to your dashboard...</div>
      </div>
    </main>
  );

  const inp: React.CSSProperties = {
    width: "100%", padding: "11px 13px", fontSize: 13,
    background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 6, color: "#fff", outline: "none", boxSizing: "border-box",
    fontFamily: "'Inter',sans-serif",
  };

  return (
    <main style={{ minHeight: "100vh", background: "#0a0a0f", color: "#fff", fontFamily: "'Inter',sans-serif", padding: "40px clamp(16px,4vw,48px) 80px" }}>
      <div style={{ maxWidth: 640, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ fontSize: 9, letterSpacing: "0.35em", color: ACCENT, fontWeight: 800, marginBottom: 6 }}>VENUE ONBOARDING</div>
          <h1 style={{ margin: 0, fontSize: 28, fontWeight: 900, letterSpacing: 2 }}>Set Up Your Venue</h1>
          <p style={{ margin: "8px 0 0", fontSize: 13, color: "rgba(255,255,255,0.45)", lineHeight: 1.6 }}>
            Get your venue listed, activate booking requests, and start selling tickets to your events.
          </p>
        </div>

        <form onSubmit={handleSave}>
          {/* Venue name + type */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
            <div>
              <label style={{ display: "block", fontSize: 8, letterSpacing: "0.15em", color: "rgba(255,255,255,0.38)", marginBottom: 5, fontWeight: 700 }}>VENUE NAME *</label>
              <input required style={inp} placeholder="The Velvet Room" value={form.venueName}
                onChange={e => setForm(f => ({ ...f, venueName: e.target.value }))} />
            </div>
            <div>
              <label style={{ display: "block", fontSize: 8, letterSpacing: "0.15em", color: "rgba(255,255,255,0.38)", marginBottom: 5, fontWeight: 700 }}>VENUE TYPE</label>
              <select style={{ ...inp, cursor: "pointer" }} value={form.venueType}
                onChange={e => setForm(f => ({ ...f, venueType: e.target.value }))}>
                <option value="">Select type...</option>
                {VENUE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>

          {/* Capacity + city + state */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1.6fr 1fr", gap: 12, marginBottom: 12 }}>
            <div>
              <label style={{ display: "block", fontSize: 8, letterSpacing: "0.15em", color: "rgba(255,255,255,0.38)", marginBottom: 5, fontWeight: 700 }}>CAPACITY</label>
              <input type="number" style={inp} placeholder="500" value={form.capacity}
                onChange={e => setForm(f => ({ ...f, capacity: e.target.value }))} />
            </div>
            <div>
              <label style={{ display: "block", fontSize: 8, letterSpacing: "0.15em", color: "rgba(255,255,255,0.38)", marginBottom: 5, fontWeight: 700 }}>CITY *</label>
              <input required style={inp} placeholder="Atlanta" value={form.city}
                onChange={e => setForm(f => ({ ...f, city: e.target.value }))} />
            </div>
            <div>
              <label style={{ display: "block", fontSize: 8, letterSpacing: "0.15em", color: "rgba(255,255,255,0.38)", marginBottom: 5, fontWeight: 700 }}>STATE</label>
              <input style={inp} placeholder="GA" maxLength={2} value={form.state}
                onChange={e => setForm(f => ({ ...f, state: e.target.value.toUpperCase() }))} />
            </div>
          </div>

          {/* Contact + website */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
            <div>
              <label style={{ display: "block", fontSize: 8, letterSpacing: "0.15em", color: "rgba(255,255,255,0.38)", marginBottom: 5, fontWeight: 700 }}>BOOKING EMAIL *</label>
              <input required type="email" style={inp} placeholder="book@yourvenue.com" value={form.contactEmail}
                onChange={e => setForm(f => ({ ...f, contactEmail: e.target.value }))} />
            </div>
            <div>
              <label style={{ display: "block", fontSize: 8, letterSpacing: "0.15em", color: "rgba(255,255,255,0.38)", marginBottom: 5, fontWeight: 700 }}>WEBSITE</label>
              <input style={inp} placeholder="https://yourvenue.com" value={form.website}
                onChange={e => setForm(f => ({ ...f, website: e.target.value }))} />
            </div>
          </div>

          {/* Bio */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: "block", fontSize: 8, letterSpacing: "0.15em", color: "rgba(255,255,255,0.38)", marginBottom: 5, fontWeight: 700 }}>VENUE BIO</label>
            <textarea rows={3} style={{ ...inp, resize: "vertical" }} placeholder="Tell artists and fans what makes your venue special..."
              value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))} />
          </div>

          {/* Services */}
          <div style={{ marginBottom: 28 }}>
            <label style={{ display: "block", fontSize: 8, letterSpacing: "0.15em", color: "rgba(255,255,255,0.38)", marginBottom: 10, fontWeight: 700 }}>SERVICES OFFERED</label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {SERVICES.map(s => {
                const on = form.services.includes(s);
                return (
                  <button key={s} type="button" onClick={() => toggle(s)} style={{
                    padding: "7px 14px", fontSize: 10, fontWeight: 700, borderRadius: 20, cursor: "pointer",
                    border: `1px solid ${on ? ACCENT : "rgba(255,255,255,0.15)"}`,
                    background: on ? `${ACCENT}20` : "rgba(255,255,255,0.03)",
                    color: on ? ACCENT : "rgba(255,255,255,0.5)",
                    transition: "all 0.15s",
                  }}>
                    {s}
                  </button>
                );
              })}
            </div>
          </div>

          <button type="submit" disabled={saving} style={{
            width: "100%", padding: "14px", fontSize: 12, fontWeight: 900, letterSpacing: "0.15em",
            textTransform: "uppercase", border: "none", borderRadius: 8, cursor: saving ? "not-allowed" : "pointer",
            background: saving ? "rgba(255,107,53,0.4)" : `linear-gradient(135deg, ${ACCENT}, #ff9500)`,
            color: "#050510",
          }}>
            {saving ? "SAVING..." : "🏟️ LAUNCH VENUE PROFILE"}
          </button>
        </form>
      </div>
    </main>
  );
}
