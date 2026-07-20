"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

/**
 * This page used to show a hardcoded INTEGRATIONS array with status:
 * "CONNECTED" baked into source for Stripe/Supabase/Resend regardless of
 * whether those keys were actually set or valid — a Rule 20 violation (a
 * status board that doesn't check anything is worse than no status board,
 * because it looks authoritative). It now fetches the real, already-built
 * /api/system/runtime-check diagnostic (auth'd via the admin's own session
 * cookie — no new secret needed) and renders whatever it actually reports.
 */

type CheckStatus = "ok" | "warn" | "fail";
interface Check {
  name: string;
  status: CheckStatus;
  value?: string | number | boolean;
  note?: string;
}
interface RuntimeCheckResponse {
  overall: CheckStatus;
  summary: { ok: number; warn: number; fail: number };
  checks: Check[];
  timestamp: string;
  mode: string;
}

const STATUS_COLOR: Record<CheckStatus, string> = {
  ok: "#00FF88",
  warn: "#FFD700",
  fail: "#FF2DAA",
};
const STATUS_LABEL: Record<CheckStatus, string> = {
  ok: "CONNECTED",
  warn: "NOT CONFIGURED",
  fail: "FAILING",
};

// Integrations the runtime-check endpoint doesn't cover — env-presence isn't
// checkable from the client without exposing secrets, so these stay honestly
// unverified here rather than guessing. Cross-reference /admin/observatory
// or Vercel env directly to confirm.
const UNCHECKED_INTEGRATIONS = [
  { name: "Mux", purpose: "Video streaming infrastructure", icon: "📹" },
  { name: "Agora", purpose: "Real-time audio/video for rooms", icon: "🎙️" },
  { name: "Cloudinary", purpose: "Media uploads and image optimization", icon: "🖼️" },
  { name: "Pusher", purpose: "WebSocket fallback for real-time events", icon: "⚡" },
];

export default function AdminIntegrationsPage() {
  const [data, setData] = useState<RuntimeCheckResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    fetch("/api/system/runtime-check", { credentials: "include", cache: "no-store" })
      .then((r) => {
        if (!r.ok) throw new Error(r.status === 403 ? "Admin/staff session required to view real status" : `HTTP ${r.status}`);
        return r.json();
      })
      .then((d: RuntimeCheckResponse) => { if (active) setData(d); })
      .catch((e: Error) => { if (active) setError(e.message); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const connected = data?.checks.filter((c) => c.status === "ok").length ?? 0;
  const total = (data?.checks.length ?? 0) + UNCHECKED_INTEGRATIONS.length;

  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", paddingBottom: 80 }}>
      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "32px 24px" }}>
        <Link href="/admin" style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.15em", color: "rgba(255,255,255,0.3)", textDecoration: "none" }}>← ADMIN</Link>
        <h1 style={{ fontSize: 24, fontWeight: 900, marginTop: 20, marginBottom: 4 }}>Integrations</h1>
        <p style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginBottom: 8 }}>
          Live status from /api/system/runtime-check — real env checks, not a static list.
        </p>
        {data && (
          <p style={{ fontSize: 9, color: "rgba(255,255,255,0.25)", marginBottom: 32 }}>
            Last checked: {new Date(data.timestamp).toLocaleString()} · Mode: {data.mode}
          </p>
        )}

        {loading && (
          <div style={{ padding: "24px 0", color: "rgba(255,255,255,0.4)", fontSize: 12 }}>Loading real status…</div>
        )}

        {!loading && error && (
          <div style={{ background: "rgba(255,45,170,0.06)", border: "1px solid rgba(255,45,170,0.25)", borderRadius: 12, padding: "18px 22px", color: "#FF8FBE", fontSize: 12, marginBottom: 24 }}>
            Unable to load real status: {error}
            {error.includes("session") && (
              <div style={{ marginTop: 6, color: "rgba(255,255,255,0.4)", fontSize: 11 }}>
                You need to be signed in as ADMIN or STAFF to see live diagnostics — this page will never show
                fabricated "CONNECTED" status when it can't actually check.
              </div>
            )}
          </div>
        )}

        {!loading && data && (
          <>
            <div style={{ display: "flex", gap: 20, marginBottom: 36, flexWrap: "wrap" }}>
              <div style={{ background: "rgba(0,255,136,0.05)", border: "1px solid rgba(0,255,136,0.2)", borderRadius: 12, padding: "16px 24px" }}>
                <div style={{ fontSize: 22, fontWeight: 900, color: "#00FF88" }}>{connected}</div>
                <div style={{ fontSize: 9, color: "rgba(255,255,255,0.35)", letterSpacing: "0.1em", fontWeight: 700 }}>CONNECTED</div>
              </div>
              <div style={{ background: "rgba(255,215,0,0.05)", border: "1px solid rgba(255,215,0,0.2)", borderRadius: 12, padding: "16px 24px" }}>
                <div style={{ fontSize: 22, fontWeight: 900, color: "#FFD700" }}>{total - connected}</div>
                <div style={{ fontSize: 9, color: "rgba(255,255,255,0.35)", letterSpacing: "0.1em", fontWeight: 700 }}>NOT CONFIRMED</div>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {data.checks.map((check) => (
                <div key={check.name} style={{ display: "flex", gap: 16, alignItems: "center", background: "rgba(255,255,255,0.02)", border: `1px solid ${STATUS_COLOR[check.status]}14`, borderRadius: 12, padding: "18px 22px", flexWrap: "wrap" }}>
                  <span style={{ width: 10, height: 10, borderRadius: "50%", background: STATUS_COLOR[check.status], boxShadow: `0 0 8px ${STATUS_COLOR[check.status]}99`, flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 140 }}>
                    <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 3 }}>{check.name}</div>
                    {check.note && <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)" }}>{check.note}</div>}
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    {check.value !== undefined && (
                      <div style={{ fontSize: 8, color: "rgba(255,255,255,0.25)", marginBottom: 4, letterSpacing: "0.08em" }}>{String(check.value)}</div>
                    )}
                    <span style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.12em", color: STATUS_COLOR[check.status] }}>
                      {STATUS_LABEL[check.status]}
                    </span>
                  </div>
                </div>
              ))}

              {UNCHECKED_INTEGRATIONS.map((integration) => (
                <div key={integration.name} style={{ display: "flex", gap: 16, alignItems: "center", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: "18px 22px", flexWrap: "wrap", opacity: 0.6 }}>
                  <span style={{ fontSize: 22, flexShrink: 0 }}>{integration.icon}</span>
                  <div style={{ flex: 1, minWidth: 140 }}>
                    <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 3 }}>{integration.name}</div>
                    <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)" }}>{integration.purpose}</div>
                  </div>
                  <span style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.12em", color: "rgba(255,255,255,0.35)" }}>
                    NOT CHECKED
                  </span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </main>
  );
}
