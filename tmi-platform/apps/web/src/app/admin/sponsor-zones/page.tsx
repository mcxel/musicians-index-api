"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

// Admin UI for managing active sponsor zones (Rule 12 — ad slot fallback chain).
// Changes persist to .tmi-data/sponsor-zones.json via /api/admin/sponsor-zones.

interface ActiveSponsorDisplay {
  sponsorId: string;
  name: string;
  tagline: string;
  logoUrl?: string;
  accentColor: string;
  ctaLabel: string;
  ctaHref: string;
}

const AVAILABLE_ZONES = [
  "home-1-homepageBanner",
  "home-1-homepageMid",
  "home-2-homepageBanner",
  "home-3-liveLobbyBanner",
  "magazine-magazineLeaderboard",
  "performer-hub",
  "room-roomLeaderboard",
  "dashboard-dashboardBanner",
  "hub-performer",
  "hub-fan",
  "hub-venue",
];

const BLANK_FORM = {
  zone: "",
  sponsorId: "",
  name: "",
  tagline: "",
  logoUrl: "",
  accentColor: "#00FFFF",
  ctaLabel: "LEARN MORE",
  ctaHref: "",
};

export default function SponsorZonesPage() {
  const [zones, setZones] = useState<Record<string, ActiveSponsorDisplay> | null>(null);
  const [saving, setSaving] = useState(false);
  const [removing, setRemoving] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [form, setForm] = useState(BLANK_FORM);
  const [showForm, setShowForm] = useState(false);

  async function loadZones() {
    try {
      const r = await fetch("/api/admin/sponsor-zones", { credentials: "include" });
      const d = await r.json() as { zones?: Record<string, ActiveSponsorDisplay> };
      setZones(d.zones ?? {});
    } catch {
      setZones({});
      setError("Unable to load sponsor zones.");
    }
  }

  useEffect(() => { loadZones(); }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (saving) return;
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const r = await fetch("/api/admin/sponsor-zones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          zone: form.zone,
          sponsorId: form.sponsorId,
          name: form.name,
          tagline: form.tagline,
          logoUrl: form.logoUrl || undefined,
          accentColor: form.accentColor,
          ctaLabel: form.ctaLabel,
          ctaHref: form.ctaHref,
        }),
      });
      const d = await r.json() as { ok?: boolean; error?: string };
      if (!r.ok || !d.ok) { setError(d.error ?? "Save failed."); setSaving(false); return; }
      setSuccess(`Zone "${form.zone}" activated for ${form.name}.`);
      setForm(BLANK_FORM);
      setShowForm(false);
      await loadZones();
    } catch { setError("Network error. Please retry."); }
    setSaving(false);
  }

  async function handleRemove(zone: string) {
    if (!confirm(`Remove sponsor from zone "${zone}"?`)) return;
    setRemoving(zone);
    setError(null);
    try {
      const r = await fetch("/api/admin/sponsor-zones", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ zone }),
      });
      const d = await r.json() as { ok?: boolean; error?: string };
      if (!r.ok || !d.ok) { setError(d.error ?? "Remove failed."); }
      else { setSuccess(`Zone "${zone}" cleared.`); await loadZones(); }
    } catch { setError("Network error."); }
    setRemoving(null);
  }

  const activeCount = zones ? Object.keys(zones).length : 0;

  return (
    <main style={{ minHeight: "100vh", background: "#05060c", color: "#fff", padding: "32px 24px 80px", fontFamily: "'Inter', sans-serif" }}>
      <div style={{ maxWidth: 960, margin: "0 auto" }}>

        <div style={{ marginBottom: 28 }}>
          <Link href="/admin" style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", textDecoration: "none" }}>← Admin</Link>
        </div>

        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 28, gap: 16, flexWrap: "wrap" }}>
          <div>
            <div style={{ fontSize: 10, letterSpacing: 5, color: "#FFD700", fontWeight: 800, marginBottom: 4 }}>ADMIN · SPONSOR ZONES</div>
            <h1 style={{ fontSize: "clamp(22px,4vw,36px)", fontWeight: 900, margin: 0 }}>Ad Zone Manager</h1>
            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", marginTop: 4 }}>
              {activeCount} active zone{activeCount !== 1 ? "s" : ""}. Changes persist across server restarts.
            </p>
          </div>
          <button
            onClick={() => { setShowForm((s) => !s); setError(null); setSuccess(null); }}
            style={{ padding: "10px 20px", borderRadius: 8, background: "#FFD700", color: "#05060c", fontSize: 12, fontWeight: 800, border: "none", cursor: "pointer" }}
          >
            {showForm ? "CANCEL" : "+ ACTIVATE ZONE"}
          </button>
        </div>

        {success && <div style={{ marginBottom: 16, padding: "10px 14px", background: "rgba(0,255,136,0.08)", border: "1px solid rgba(0,255,136,0.25)", borderRadius: 8, fontSize: 12, color: "#00FF88" }}>{success}</div>}
        {error && <div style={{ marginBottom: 16, padding: "10px 14px", background: "rgba(255,107,107,0.08)", border: "1px solid rgba(255,107,107,0.25)", borderRadius: 8, fontSize: 12, color: "#FF6B6B" }}>{error}</div>}

        {/* Add Zone Form */}
        {showForm && (
          <form onSubmit={handleSave} style={{ background: "rgba(255,215,0,0.04)", border: "1px solid rgba(255,215,0,0.2)", borderRadius: 14, padding: "24px", marginBottom: 28 }}>
            <div style={{ fontSize: 10, letterSpacing: "0.2em", color: "#FFD700", fontWeight: 800, marginBottom: 16 }}>ACTIVATE NEW ZONE</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <label style={labelStyle}>
                Zone Key *
                <input
                  required
                  list="zone-suggestions"
                  placeholder="e.g. home-1-homepageBanner"
                  value={form.zone}
                  onChange={(e) => setForm((f) => ({ ...f, zone: e.target.value }))}
                  style={inputStyle}
                />
                <datalist id="zone-suggestions">
                  {AVAILABLE_ZONES.map((z) => <option key={z} value={z} />)}
                </datalist>
              </label>
              <label style={labelStyle}>
                Sponsor ID *
                <input required placeholder="sp-beatlab" value={form.sponsorId} onChange={(e) => setForm((f) => ({ ...f, sponsorId: e.target.value }))} style={inputStyle} />
              </label>
              <label style={labelStyle}>
                Sponsor Name *
                <input required placeholder="BeatLab Studios" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} style={inputStyle} />
              </label>
              <label style={labelStyle}>
                Tagline *
                <input required placeholder="Professional beats for professionals" value={form.tagline} onChange={(e) => setForm((f) => ({ ...f, tagline: e.target.value }))} style={inputStyle} />
              </label>
              <label style={labelStyle}>
                Logo URL (optional)
                <input placeholder="https://…" value={form.logoUrl} onChange={(e) => setForm((f) => ({ ...f, logoUrl: e.target.value }))} style={inputStyle} />
              </label>
              <label style={labelStyle}>
                Accent Color *
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <input type="color" value={form.accentColor} onChange={(e) => setForm((f) => ({ ...f, accentColor: e.target.value }))} style={{ height: 36, width: 48, borderRadius: 6, border: "none", cursor: "pointer", background: "none" }} />
                  <input value={form.accentColor} onChange={(e) => setForm((f) => ({ ...f, accentColor: e.target.value }))} style={{ ...inputStyle, flex: 1 }} />
                </div>
              </label>
              <label style={labelStyle}>
                CTA Label *
                <input required placeholder="GET BEATS" value={form.ctaLabel} onChange={(e) => setForm((f) => ({ ...f, ctaLabel: e.target.value }))} style={inputStyle} />
              </label>
              <label style={labelStyle}>
                CTA Link *
                <input required placeholder="/sponsors/beatlab" value={form.ctaHref} onChange={(e) => setForm((f) => ({ ...f, ctaHref: e.target.value }))} style={inputStyle} />
              </label>
            </div>
            <button
              type="submit"
              disabled={saving}
              style={{ marginTop: 20, padding: "11px 24px", background: saving ? "rgba(255,255,255,0.1)" : "#FFD700", color: "#05060c", fontWeight: 800, fontSize: 12, borderRadius: 8, border: "none", cursor: saving ? "not-allowed" : "pointer" }}
            >
              {saving ? "Saving…" : "ACTIVATE ZONE"}
            </button>
          </form>
        )}

        {/* Active Zones */}
        {zones === null && <div style={{ fontSize: 13, color: "rgba(255,255,255,0.35)", padding: "32px 0", textAlign: "center" }}>Loading zones…</div>}

        {zones !== null && Object.keys(zones).length === 0 && (
          <div style={{ textAlign: "center", padding: "48px 0" }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>📭</div>
            <div style={{ fontSize: 15, fontWeight: 800, color: "rgba(255,255,255,0.5)", marginBottom: 6 }}>No active sponsor zones</div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.3)" }}>
              All ad slots are currently showing platform promos or ad network fill.
              Click <strong>+ ACTIVATE ZONE</strong> to add a paying sponsor.
            </div>
          </div>
        )}

        {zones !== null && Object.keys(zones).length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {Object.entries(zones).map(([zone, sponsor]) => (
              <div key={zone} style={{ background: "rgba(255,255,255,0.02)", border: `1px solid ${sponsor.accentColor}22`, borderRadius: 12, padding: "16px 20px", display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
                <div style={{ flex: 1, minWidth: 200 }}>
                  <div style={{ fontSize: 9, color: sponsor.accentColor, fontWeight: 800, letterSpacing: "0.15em", marginBottom: 4 }}>{zone}</div>
                  <div style={{ fontSize: 15, fontWeight: 900 }}>{sponsor.name}</div>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", marginTop: 2 }}>{sponsor.tagline}</div>
                </div>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <span style={{ fontSize: 10, padding: "3px 10px", background: `${sponsor.accentColor}18`, border: `1px solid ${sponsor.accentColor}40`, borderRadius: 6, color: sponsor.accentColor, fontWeight: 800 }}>
                    {sponsor.ctaLabel}
                  </span>
                  <span style={{ fontSize: 10, color: "rgba(255,255,255,0.3)" }}>{sponsor.ctaHref}</span>
                </div>
                <button
                  onClick={() => handleRemove(zone)}
                  disabled={removing === zone}
                  style={{ padding: "7px 14px", background: "rgba(255,107,107,0.08)", border: "1px solid rgba(255,107,107,0.25)", color: "#FF6B6B", fontSize: 10, fontWeight: 800, borderRadius: 6, cursor: removing === zone ? "not-allowed" : "pointer", letterSpacing: "0.08em" }}
                >
                  {removing === zone ? "…" : "REMOVE"}
                </button>
              </div>
            ))}
          </div>
        )}

        <div style={{ marginTop: 32, fontSize: 11, color: "rgba(255,255,255,0.25)", borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 16 }}>
          Changes persist to <code style={{ color: "rgba(255,255,255,0.4)" }}>.tmi-data/sponsor-zones.json</code>.
          Zones feed into the <Link href="/admin/sponsors" style={{ color: "rgba(255,215,0,0.5)", textDecoration: "none" }}>Rule 12 fallback chain</Link> — empty zones fall back to platform promos → ad network → "Advertise Here" CTA.
        </div>
      </div>
    </main>
  );
}

const labelStyle: React.CSSProperties = {
  display: "flex", flexDirection: "column", gap: 4, fontSize: 10, color: "rgba(255,255,255,0.45)", fontWeight: 700, letterSpacing: "0.08em",
};

const inputStyle: React.CSSProperties = {
  background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 7, color: "#fff", fontSize: 13, padding: "8px 12px", outline: "none", width: "100%",
};
