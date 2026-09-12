"use client";

/**
 * Settings & Privacy — account-level controls (current schema).
 * Wired to GET/POST /api/settings/privacy (UserSettings.profileVisibility).
 * Default PUBLIC. PRIVATE != camera off / end live.
 * Does not claim independent Fan/Performer privacy tables exist yet.
 */

import { useEffect, useState } from "react";
import Link from "next/link";

type PrivacyState = {
  profileVisibility: "public" | "private";
  publicPageEnabled: boolean;
  showOnlineStatus: boolean;
  allowDirectMessages: string;
};

const DEFAULT_PRIVACY: PrivacyState = {
  profileVisibility: "public",
  publicPageEnabled: true,
  showOnlineStatus: true,
  allowDirectMessages: "followers",
};

export default function SettingsPrivacyPage() {
  const [privacy, setPrivacy] = useState<PrivacyState>(DEFAULT_PRIVACY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    fetch("/api/settings/privacy", { credentials: "include", cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((d: { privacy?: Partial<PrivacyState> } | null) => {
        if (!active || !d?.privacy) return;
        setPrivacy({
          profileVisibility: d.privacy.profileVisibility === "private" ? "private" : "public",
          publicPageEnabled: d.privacy.publicPageEnabled !== false,
          showOnlineStatus: d.privacy.showOnlineStatus !== false,
          allowDirectMessages: d.privacy.allowDirectMessages ?? "followers",
        });
      })
      .catch(() => {})
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  async function saveSettings() {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/settings/privacy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ privacy }),
      });
      if (!res.ok) {
        setError("Unable to save. Try again.");
        return;
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      setError("Unable to save. Try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main
      data-testid="tmi-settings-privacy"
      style={{
        minHeight: "100vh",
        background: "#05060c",
        color: "#fff",
        padding: "32px 24px 80px",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <div style={{ maxWidth: 640, margin: "0 auto" }}>
        <div style={{ marginBottom: 28 }}>
          <Link href="/settings" style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", textDecoration: "none" }}>
            ← Settings
          </Link>
        </div>
        <div style={{ fontSize: 10, letterSpacing: 5, color: "#00FFFF", fontWeight: 800, marginBottom: 4 }}>SETTINGS</div>
        <h1 style={{ fontSize: "clamp(22px,4vw,36px)", fontWeight: 900, margin: "0 0 12px" }}>Privacy</h1>
        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", lineHeight: 1.5, marginBottom: 24 }}>
          Defaults to Public. Private restricts public discovery identity — it does not turn off your camera, mute your
          mic, or end a live session. Account-level only until dedicated Fan/Performer profile tables exist.
        </p>

        {loading ? (
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>Loading privacy settings…</div>
        ) : (
          <div style={{ display: "grid", gap: 12 }}>
            <div
              style={{
                background: "rgba(255,255,255,0.02)",
                border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: 10,
                padding: "16px 20px",
              }}
            >
              <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 8 }}>Profile visibility</div>
              <select
                data-testid="tmi-privacy-visibility"
                value={privacy.profileVisibility}
                onChange={(e) =>
                  setPrivacy((p) => ({
                    ...p,
                    profileVisibility: e.target.value === "private" ? "private" : "public",
                  }))
                }
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: 8,
                  background: "#0a0b14",
                  color: "#fff",
                  border: "1px solid rgba(255,255,255,0.15)",
                }}
              >
                <option value="public">Public — anyone can view</option>
                <option value="private">Private — restricted public identity</option>
              </select>
            </div>

            <div
              style={{
                background: "rgba(255,255,255,0.02)",
                border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: 10,
                padding: "16px 20px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 16,
              }}
            >
              <div>
                <div style={{ fontWeight: 700, fontSize: 13 }}>Show public profile page</div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 3 }}>
                  Off hides the public profile page from normal browsing (server-authoritative).
                </div>
              </div>
              <button
                type="button"
                data-testid="tmi-privacy-public-page"
                aria-pressed={privacy.publicPageEnabled}
                onClick={() => setPrivacy((p) => ({ ...p, publicPageEnabled: !p.publicPageEnabled }))}
                style={{
                  flexShrink: 0,
                  width: 46,
                  height: 24,
                  borderRadius: 12,
                  background: privacy.publicPageEnabled ? "#00FFFF" : "rgba(255,255,255,0.1)",
                  border: "none",
                  cursor: "pointer",
                  position: "relative",
                }}
              >
                <span
                  style={{
                    position: "absolute",
                    top: 3,
                    left: privacy.publicPageEnabled ? 25 : 3,
                    width: 18,
                    height: 18,
                    borderRadius: "50%",
                    background: privacy.publicPageEnabled ? "#05060c" : "rgba(255,255,255,0.5)",
                  }}
                />
              </button>
            </div>
          </div>
        )}

        <div style={{ marginTop: 24, display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
          <button
            type="button"
            data-testid="tmi-privacy-save"
            disabled={loading || saving}
            onClick={() => void saveSettings()}
            style={{
              padding: "11px 28px",
              borderRadius: 8,
              background: "#00FFFF",
              color: "#05060c",
              fontWeight: 800,
              fontSize: 13,
              cursor: loading || saving ? "default" : "pointer",
              border: "none",
              opacity: loading || saving ? 0.6 : 1,
            }}
          >
            {saving ? "Saving…" : "Save"}
          </button>
          {saved && <span style={{ fontSize: 12, color: "#22c55e" }}>Saved</span>}
          {error && <span style={{ fontSize: 12, color: "#FF2DAA" }}>{error}</span>}
          <Link href="/privacy" style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", textDecoration: "none" }}>
            Privacy Policy
          </Link>
        </div>
      </div>
    </main>
  );
}
