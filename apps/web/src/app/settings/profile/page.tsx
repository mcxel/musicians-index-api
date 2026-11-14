"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import RoleGate from "@/components/auth/RoleGate";
import { SocialBrandIcon, normalizeSnapchatInput } from "@/components/brands/SocialBrandIconRegistry";

export default function SettingsProfilePage() {
  const [form, setForm] = useState({
    displayName: "", bio: "", genre: "",
    instagram: "", twitter: "", snapchat: "", website: "",
    stageName: "", city: "", state: "",
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [snapchatError, setSnapchatError] = useState("");

  useEffect(() => {
    // Pre-fill from session + profile
    fetch("/api/profile/self", { credentials: "include", cache: "no-store" })
      .then(r => r.json())
      .then((d: { ok?: boolean; profile?: { displayName?: string; bio?: string; genres?: string[]; stageName?: string } }) => {
        if (d.ok && d.profile) {
          setForm(prev => ({
            ...prev,
            displayName: d.profile!.displayName ?? "",
            bio:         d.profile!.bio ?? "",
            genre:       (d.profile!.genres ?? []).join(", "),
            stageName:   d.profile!.stageName ?? "",
          }));
        }
      })
      .catch(() => {});

    fetch("/api/profile/role-extension", { credentials: "include", cache: "no-store" })
      .then(r => r.json())
      .then((d: { ok?: boolean; extension?: Record<string, string> }) => {
        if (d.ok && d.extension) {
          setForm(prev => ({
            ...prev,
            instagram: d.extension!.instagram ?? "",
            twitter:   d.extension!.twitter ?? "",
            snapchat:  d.extension!.snapchat ?? "",
            website:   d.extension!.website ?? "",
            city:      d.extension!.city ?? "",
            state:     d.extension!.state ?? "",
          }));
        }
      })
      .catch(() => {});
  }, []);

  const set = (k: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));

  const snapchatPreview = form.snapchat.trim() ? normalizeSnapchatInput(form.snapchat) : null;

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSnapchatError("");

    // Validate/normalize Snapchat before persisting anything — an empty
    // value is allowed (clears it), an invalid one blocks save.
    if (snapchatPreview && !snapchatPreview.ok) {
      setSnapchatError(snapchatPreview.error);
      return;
    }

    setSaving(true);
    setSaved(false);
    try {
      // Save base profile
      await fetch("/api/profile/update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          displayName: form.displayName,
          bio: form.bio,
          website: form.website,
          genres: form.genre ? form.genre.split(",").map(g => g.trim()).filter(Boolean) : [],
          stageName: form.stageName,
        }),
      });
      // Save role-extension fields
      await fetch("/api/profile/role-extension", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          instagram: form.instagram,
          twitter: form.twitter,
          snapchat: form.snapchat,
          website: form.website,
          city: form.city,
          state: form.state,
        }),
      });
      setSaved(true);
    } catch {
      setError("Save failed. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main style={{ minHeight: "100vh", background: "#05060c", color: "#fff", padding: "32px 24px 80px", fontFamily: "'Inter', sans-serif" }}>
      <div style={{ maxWidth: 640, margin: "0 auto" }}>
        <div style={{ marginBottom: 28 }}>
          <Link href="/settings" style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", textDecoration: "none" }}>← Settings</Link>
        </div>
        <div style={{ fontSize: 10, letterSpacing: 5, color: "#00FFFF", fontWeight: 800, marginBottom: 4 }}>SETTINGS</div>
        <h1 style={{ fontSize: "clamp(22px,4vw,36px)", fontWeight: 900, margin: "0 0 32px" }}>Edit Profile</h1>

        <form onSubmit={e => void handleSave(e)} style={{ display: "grid", gap: 14 }}>
          {([
            ["displayName", "Display Name",   "text", "Nova Cipher"],
            ["stageName",   "Stage Name",     "text", "Nova"],
            ["genre",       "Genre(s)",       "text", "Hip-Hop, Cypher, R&B"],
            ["city",        "City",           "text", "Los Angeles"],
            ["state",       "State",          "text", "CA"],
            ["instagram",   "Instagram",      "text", "@yourhandle"],
            ["twitter",     "X / Twitter",   "text", "@yourhandle"],
          ] as [keyof typeof form, string, string, string][]).map(([k, label, type, ph]) => (
            <div key={k}>
              <label style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: 700, marginBottom: 6, display: "block" }}>{label}</label>
              <input type={type} value={form[k]} onChange={set(k)} placeholder={ph}
                style={{ width: "100%", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8, padding: "11px 14px", color: "#fff", fontSize: 13, outline: "none", boxSizing: "border-box" }} />
            </div>
          ))}

          <div>
            <label style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: 700, marginBottom: 6, display: "flex", alignItems: "center", gap: 6 }}>
              <SocialBrandIcon brand="snapchat" size={12} />
              Snapchat
            </label>
            <input
              type="text"
              inputMode="text"
              autoCapitalize="none"
              autoCorrect="off"
              value={form.snapchat}
              onChange={(e) => { setSnapchatError(""); setForm(f => ({ ...f, snapchat: e.target.value })); }}
              placeholder="cool.user or https://www.snapchat.com/add/cool.user"
              style={{ width: "100%", background: "rgba(255,255,255,0.06)", border: `1px solid ${snapchatError ? "rgba(255,45,45,0.4)" : "rgba(255,255,255,0.12)"}`, borderRadius: 8, padding: "11px 14px", color: "#fff", fontSize: 13, outline: "none", boxSizing: "border-box" }}
            />
            {snapchatError ? (
              <div style={{ fontSize: 11, color: "#ff8888", marginTop: 6 }}>{snapchatError}</div>
            ) : snapchatPreview?.ok ? (
              <a
                href={snapchatPreview.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 11, color: "#FFFC00", marginTop: 6, textDecoration: "none" }}
              >
                ↗ {snapchatPreview.url}
              </a>
            ) : null}
          </div>

          <div>
            <label style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: 700, marginBottom: 6, display: "block" }}>Website</label>
            <input type="url" value={form.website} onChange={set("website")} placeholder="https://yoursite.com"
              style={{ width: "100%", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8, padding: "11px 14px", color: "#fff", fontSize: 13, outline: "none", boxSizing: "border-box" }} />
          </div>

          <div>
            <label style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: 700, marginBottom: 6, display: "block" }}>Bio</label>
            <textarea value={form.bio} onChange={set("bio")} placeholder="Tell the world who you are..." rows={4}
              style={{ width: "100%", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8, padding: "11px 14px", color: "#fff", fontSize: 13, outline: "none", resize: "vertical", boxSizing: "border-box" }} />
          </div>

          {error && (
            <div style={{ padding: "10px 14px", background: "rgba(255,45,45,0.1)", border: "1px solid rgba(255,45,45,0.3)", borderRadius: 8, fontSize: 13, color: "#ff8888" }}>
              {error}
            </div>
          )}

          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <button type="submit" disabled={saving}
              style={{ padding: "11px 28px", borderRadius: 8, background: saved ? "rgba(0,255,136,0.2)" : "#00FFFF", color: saved ? "#00FF88" : "#05060c", fontWeight: 800, fontSize: 13, cursor: saving ? "not-allowed" : "pointer", border: saved ? "1px solid rgba(0,255,136,0.4)" : "none", opacity: saving ? 0.7 : 1 }}>
              {saving ? "Saving…" : saved ? "✓ Saved" : "Save Profile"}
            </button>
            {/* Avatar & Inventory is Fan-only (CLAUDE.md Rule 26 Identity Policy, 2026-07-18). */}
            <RoleGate allow={["FAN"]}>
              <Link href="/avatar/studio"
                style={{ padding: "11px 20px", borderRadius: 8, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.7)", fontWeight: 700, fontSize: 13, textDecoration: "none" }}>
                Edit Avatar
              </Link>
            </RoleGate>
          </div>
        </form>
      </div>
    </main>
  );
}
