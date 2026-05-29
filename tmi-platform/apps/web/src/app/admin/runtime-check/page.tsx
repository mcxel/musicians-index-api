"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

type CheckStatus = "ok" | "warn" | "fail";

interface Check {
  name: string;
  status: CheckStatus;
  value?: string | number | boolean;
  note?: string;
}

interface RuntimeCheckResult {
  overall: CheckStatus;
  summary: { ok: number; warn: number; fail: number };
  checks: Check[];
  timestamp: string;
  mode: "production" | "soft-launch";
}

const STATUS_COLORS: Record<CheckStatus, string> = {
  ok:   "#00FF88",
  warn: "#FFD700",
  fail: "#FF4444",
};

const STATUS_ICONS: Record<CheckStatus, string> = {
  ok:   "✅",
  warn: "⚠️",
  fail: "❌",
};

export default function AdminRuntimeCheckPage() {
  const [result, setResult] = useState<RuntimeCheckResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runCheck = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/system/runtime-check");
      if (!res.ok) {
        const data = await res.json().catch(() => ({})) as { error?: string };
        setError(data.error ?? `HTTP ${res.status}`);
        return;
      }
      const data = await res.json() as RuntimeCheckResult;
      setResult(data);
    } catch {
      setError("Network error — could not reach /api/system/runtime-check");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void runCheck(); }, [runCheck]);

  const overallColor = result ? STATUS_COLORS[result.overall] : "#888";

  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", padding: "32px 24px 80px" }}>
      <div style={{ maxWidth: 900, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <Link href="/admin" style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.14em", color: "rgba(255,255,255,0.3)", textDecoration: "none" }}>← ADMIN</Link>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 12, flexWrap: "wrap", gap: 12 }}>
            <div>
              <div style={{ fontSize: 8, letterSpacing: "0.4em", color: "#00FF88", fontWeight: 800, marginBottom: 6 }}>SYSTEM</div>
              <h1 style={{ margin: 0, fontSize: 22, fontWeight: 900 }}>Runtime Check</h1>
            </div>
            <button
              onClick={() => void runCheck()}
              disabled={loading}
              style={{ padding: "10px 22px", fontSize: 10, fontWeight: 800, color: "#00FF88", border: "1px solid rgba(0,255,136,0.4)", borderRadius: 8, background: "rgba(0,255,136,0.08)", cursor: "pointer", letterSpacing: "0.12em" }}
            >
              {loading ? "RUNNING..." : "↻ RUN CHECK"}
            </button>
          </div>
          {result && (
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", marginTop: 8 }}>
              Last run: {new Date(result.timestamp).toLocaleTimeString()} · Mode: <span style={{ color: result.mode === "production" ? "#00FF88" : "#FFD700", fontWeight: 700 }}>{result.mode.toUpperCase()}</span>
            </div>
          )}
        </div>

        {error && (
          <div style={{ background: "rgba(255,68,68,0.08)", border: "1px solid rgba(255,68,68,0.3)", borderRadius: 10, padding: "14px 18px", marginBottom: 24, color: "#FF4444", fontSize: 13 }}>
            {error}
          </div>
        )}

        {loading && !result && (
          <div style={{ textAlign: "center", padding: "64px 24px", color: "rgba(255,255,255,0.3)" }}>
            <div style={{ fontSize: 40, marginBottom: 16 }}>⏳</div>
            <p style={{ fontSize: 13, margin: 0 }}>Running system checks…</p>
          </div>
        )}

        {result && (
          <>
            {/* Overall status banner */}
            <div style={{
              background: `${overallColor}10`,
              border: `2px solid ${overallColor}44`,
              borderRadius: 12, padding: "20px 24px", marginBottom: 28,
              display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap",
            }}>
              <div style={{ fontSize: 40 }}>{STATUS_ICONS[result.overall]}</div>
              <div>
                <div style={{ fontSize: 18, fontWeight: 900, color: overallColor }}>
                  {result.overall === "ok" ? "ALL SYSTEMS GO" : result.overall === "warn" ? "READY — REVIEW WARNINGS" : "ACTION REQUIRED"}
                </div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", marginTop: 4 }}>
                  {result.summary.ok} passed · {result.summary.warn} warnings · {result.summary.fail} failures
                </div>
              </div>
              <div style={{ marginLeft: "auto", display: "flex", gap: 16, textAlign: "center" }}>
                {(["ok", "warn", "fail"] as CheckStatus[]).map(s => (
                  <div key={s}>
                    <div style={{ fontSize: 28, fontWeight: 900, color: STATUS_COLORS[s], lineHeight: 1 }}>{result.summary[s]}</div>
                    <div style={{ fontSize: 9, color: "rgba(255,255,255,0.35)", letterSpacing: "0.1em", marginTop: 3 }}>{s.toUpperCase()}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Check list */}
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {result.checks.map((check, i) => {
                const color = STATUS_COLORS[check.status];
                return (
                  <div
                    key={i}
                    style={{
                      background: `${color}06`,
                      border: `1px solid ${color}22`,
                      borderRadius: 8, padding: "12px 16px",
                      display: "flex", alignItems: "center", gap: 12,
                    }}
                  >
                    <span style={{ fontSize: 16, flexShrink: 0 }}>{STATUS_ICONS[check.status]}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: "#fff" }}>{check.name}</div>
                      {check.note && (
                        <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>{check.note}</div>
                      )}
                    </div>
                    {check.value !== undefined && (
                      <div style={{ fontSize: 11, fontWeight: 700, color, flexShrink: 0, fontFamily: "monospace" }}>
                        {String(check.value)}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Action guide */}
            {(result.summary.fail > 0 || result.summary.warn > 2) && (
              <div style={{ marginTop: 32, background: "rgba(255,215,0,0.05)", border: "1px solid rgba(255,215,0,0.15)", borderRadius: 12, padding: "20px 24px" }}>
                <div style={{ fontSize: 9, letterSpacing: "0.3em", color: "#FFD700", fontWeight: 800, marginBottom: 12 }}>PRODUCTION CHECKLIST</div>
                <div style={{ display: "grid", gap: 8 }}>
                  {result.checks.filter(c => c.status !== "ok").map((c, i) => (
                    <div key={i} style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", display: "flex", gap: 8 }}>
                      <span style={{ color: STATUS_COLORS[c.status], flexShrink: 0 }}>{STATUS_ICONS[c.status]}</span>
                      <span><strong style={{ color: "#fff" }}>{c.name}</strong>{c.note ? ` — ${c.note}` : ""}</span>
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: 16, padding: "12px 16px", background: "rgba(0,0,0,0.3)", borderRadius: 8, fontSize: 11, color: "rgba(255,255,255,0.45)", lineHeight: 1.7 }}>
                  Set missing values in <strong style={{ color: "#FFD700" }}>Vercel → Project Settings → Environment Variables</strong>, then redeploy.
                  The platform runs in soft-launch mode without these — payments and email work in test mode only.
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}
