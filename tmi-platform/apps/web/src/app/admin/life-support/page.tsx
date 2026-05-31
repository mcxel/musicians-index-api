"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

type StatusLevel = "pending" | "green" | "yellow" | "red";

interface CheckResult {
  ok: boolean;
  latencyMs?: number;
  detail: string;
}

interface HealthPayload {
  status: "green" | "red";
  timestamp: string;
  checks: {
    db:     CheckResult;
    stripe: CheckResult;
    resend: CheckResult;
    daily:  CheckResult;
  };
  env: Record<string, boolean>;
}

interface Gate {
  id: string;
  label: string;
  icon: string;
  status: StatusLevel;
  detail: string;
  latencyMs?: number;
  subChecks?: { label: string; ok: boolean }[];
}

const PULSE_GREEN  = "#00FF7F";
const PULSE_RED    = "#E63000";
const PULSE_YELLOW = "#FFD700";
const PULSE_GRAY   = "#4b5563";

function statusColor(s: StatusLevel) {
  if (s === "green")  return PULSE_GREEN;
  if (s === "red")    return PULSE_RED;
  if (s === "yellow") return PULSE_YELLOW;
  return PULSE_GRAY;
}

function GateCard({ gate }: { gate: Gate }) {
  const color = statusColor(gate.status);
  const isPending = gate.status === "pending";
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        background: "rgba(5,5,18,0.9)",
        border: `1px solid ${color}44`,
        borderRadius: 12,
        padding: "14px 18px",
        display: "flex", flexDirection: "column", gap: 8,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <motion.div
          animate={isPending ? { opacity: [0.4, 1, 0.4] } : { opacity: 1 }}
          transition={isPending ? { repeat: Infinity, duration: 1.2 } : {}}
          style={{
            width: 12, height: 12, borderRadius: "50%",
            background: color,
            boxShadow: gate.status !== "pending" ? `0 0 8px ${color}99` : "none",
          }}
        />
        <span style={{ fontSize: 18 }}>{gate.icon}</span>
        <span style={{ fontSize: 12, fontWeight: 900, color, letterSpacing: "0.12em" }}>{gate.label}</span>
        {gate.latencyMs !== undefined && (
          <span style={{ marginLeft: "auto", fontSize: 10, color: "rgba(255,255,255,0.35)" }}>
            {gate.latencyMs}ms
          </span>
        )}
        <span style={{
          marginLeft: gate.latencyMs !== undefined ? 0 : "auto",
          fontSize: 9, fontWeight: 800, letterSpacing: "0.1em",
          padding: "2px 8px", borderRadius: 10,
          background: `${color}18`, border: `1px solid ${color}44`,
          color,
        }}>
          {gate.status.toUpperCase()}
        </span>
      </div>
      <div style={{ fontSize: 10, color: "rgba(255,255,255,0.45)", paddingLeft: 22 }}>
        {gate.detail}
      </div>
      {gate.subChecks && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 4, paddingLeft: 22 }}>
          {gate.subChecks.map(sc => (
            <span key={sc.label} style={{
              fontSize: 9, padding: "2px 7px", borderRadius: 8,
              background: sc.ok ? "rgba(0,255,127,0.08)" : "rgba(230,48,0,0.1)",
              border: `1px solid ${sc.ok ? "rgba(0,255,127,0.25)" : "rgba(230,48,0,0.3)"}`,
              color: sc.ok ? PULSE_GREEN : PULSE_RED,
            }}>{sc.ok ? "✓" : "✗"} {sc.label}</span>
          ))}
        </div>
      )}
    </motion.div>
  );
}

function buildGates(data: HealthPayload | null, sessionOk: boolean | null): Gate[] {
  return [
    {
      id: "auth",
      label: "AUTH / SESSION",
      icon: "🔐",
      status: sessionOk === null ? "pending" : sessionOk ? "green" : "red",
      detail: sessionOk === null ? "Checking session endpoint…" : sessionOk ? "/api/auth/session reachable, cookies valid" : "Session endpoint failed or returned unauthenticated",
    },
    {
      id: "db",
      label: "DATABASE",
      icon: "🗄️",
      status: !data ? "pending" : data.checks.db.ok ? "green" : "red",
      detail: data ? data.checks.db.detail : "Connecting to Neon PostgreSQL…",
      latencyMs: data?.checks.db.latencyMs,
    },
    {
      id: "stripe",
      label: "STRIPE",
      icon: "💳",
      status: !data ? "pending" : data.checks.stripe.ok ? "green" : "red",
      detail: data ? data.checks.stripe.detail : "Checking Stripe balance endpoint…",
    },
    {
      id: "email",
      label: "EMAIL (RESEND)",
      icon: "📧",
      status: !data ? "pending" : data.checks.resend.ok ? "green" : "yellow",
      detail: data ? data.checks.resend.detail : "Checking Resend API key…",
    },
    {
      id: "video",
      label: "VIDEO (DAILY)",
      icon: "🎥",
      status: !data ? "pending" : data.checks.daily.ok ? "green" : "yellow",
      detail: data ? data.checks.daily.detail : "Checking Daily.co API key…",
    },
    {
      id: "env",
      label: "ENV KEYS",
      icon: "🔑",
      status: !data ? "pending" : Object.values(data.env).every(Boolean) ? "green" : "yellow",
      detail: data ? `${Object.values(data.env).filter(Boolean).length}/${Object.values(data.env).length} env vars set` : "Scanning env vars…",
      subChecks: data ? Object.entries(data.env).map(([k, v]) => ({ label: k, ok: v })) : undefined,
    },
  ];
}

export default function LifeSupportPage() {
  const [health, setHealth]       = useState<HealthPayload | null>(null);
  const [sessionOk, setSessionOk] = useState<boolean | null>(null);
  const [loading, setLoading]     = useState(false);
  const [lastRun, setLastRun]     = useState<string | null>(null);
  const [error, setError]         = useState<string | null>(null);

  const runChecks = useCallback(async () => {
    setLoading(true);
    setError(null);

    // Check session
    try {
      const sr = await fetch("/api/auth/session", { credentials: "include" });
      const sd = await sr.json() as { authenticated: boolean };
      setSessionOk(sd.authenticated === true);
    } catch {
      setSessionOk(false);
    }

    // Check health (requires ADMIN_API_KEY)
    try {
      const hr = await fetch("/api/admin/health", {
        headers: { "x-admin-key": "tmi-phase1-launch-2026" },
      });
      if (hr.ok) {
        const hd = await hr.json() as HealthPayload;
        setHealth(hd);
      } else {
        setError(`Health check returned ${hr.status}`);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Health check failed");
    }

    setLastRun(new Date().toLocaleTimeString());
    setLoading(false);
  }, []);

  useEffect(() => { runChecks(); }, [runChecks]);

  const gates = buildGates(health, sessionOk);
  const allGreen = gates.every(g => g.status === "green");
  const hasRed   = gates.some(g => g.status === "red");
  const overallColor = allGreen ? PULSE_GREEN : hasRed ? PULSE_RED : PULSE_YELLOW;
  const overallLabel = allGreen ? "ALL SYSTEMS GO" : hasRed ? "ISSUES DETECTED" : "PARTIAL";

  return (
    <div style={{
      minHeight: "100vh",
      background: "#020209",
      color: "#e2e8f0",
      fontFamily: "'Exo 2', 'Orbitron', monospace",
      padding: "24px 20px",
    }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 24 }}>
        <a href="/admin" style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", textDecoration: "none", letterSpacing: "0.12em" }}>← ADMIN</a>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 16, fontWeight: 900, letterSpacing: "0.12em", color: "#00FFFF" }}>P0 LIFE SUPPORT</div>
          <div style={{ fontSize: 9, color: "rgba(255,255,255,0.35)", letterSpacing: "0.1em", marginTop: 2 }}>SYSTEM TRUTH MACHINE — AUTH · DB · STRIPE · EMAIL · VIDEO</div>
        </div>
        {/* Overall status */}
        <div style={{
          padding: "8px 16px", borderRadius: 8,
          background: `${overallColor}15`,
          border: `1px solid ${overallColor}44`,
          display: "flex", alignItems: "center", gap: 8,
        }}>
          <motion.div
            animate={!allGreen && !hasRed ? { opacity: [1, 0.3, 1] } : { opacity: 1 }}
            transition={{ repeat: Infinity, duration: 1.2 }}
            style={{ width: 10, height: 10, borderRadius: "50%", background: overallColor, boxShadow: `0 0 8px ${overallColor}` }}
          />
          <span style={{ fontSize: 11, fontWeight: 900, color: overallColor, letterSpacing: "0.12em" }}>{loading ? "SCANNING…" : overallLabel}</span>
        </div>
        <button onClick={runChecks} disabled={loading} style={{
          padding: "8px 16px", borderRadius: 8, fontSize: 10, fontWeight: 800,
          background: "rgba(0,255,255,0.12)", border: "1px solid rgba(0,255,255,0.35)",
          color: "#00FFFF", cursor: loading ? "default" : "pointer", letterSpacing: "0.08em",
          opacity: loading ? 0.5 : 1,
        }}>
          {loading ? "SCANNING…" : "↺ RE-RUN"}
        </button>
      </div>

      {lastRun && (
        <div style={{ fontSize: 9, color: "rgba(255,255,255,0.25)", marginBottom: 16, letterSpacing: "0.1em" }}>
          Last scan: {lastRun} · {health?.timestamp ? new Date(health.timestamp).toLocaleString() : "–"}
        </div>
      )}

      {error && (
        <div style={{
          marginBottom: 16, padding: "10px 14px", borderRadius: 8,
          background: "rgba(230,48,0,0.1)", border: "1px solid rgba(230,48,0,0.3)",
          fontSize: 11, color: PULSE_RED,
        }}>⚠ {error}</div>
      )}

      {/* Gate grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 12 }}>
        <AnimatePresence>
          {gates.map(g => <GateCard key={g.id} gate={g} />)}
        </AnimatePresence>
      </div>

      {/* Raw JSON dump (collapsed) */}
      {health && (
        <details style={{ marginTop: 24 }}>
          <summary style={{ cursor: "pointer", fontSize: 10, color: "rgba(255,255,255,0.3)", letterSpacing: "0.1em" }}>RAW HEALTH PAYLOAD</summary>
          <pre style={{
            marginTop: 8, padding: 14, borderRadius: 8,
            background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)",
            fontSize: 10, color: "rgba(255,255,255,0.5)", overflow: "auto", maxHeight: 300,
          }}>{JSON.stringify(health, null, 2)}</pre>
        </details>
      )}

      {/* Quick links */}
      <div style={{ marginTop: 24, display: "flex", gap: 8, flexWrap: "wrap" }}>
        {[
          { label: "AUTH →", href: "/api/auth/session" },
          { label: "REGISTER →", href: "/auth" },
          { label: "ADMIN →", href: "/admin" },
          { label: "THEATER →", href: "/fan/theater" },
          { label: "STUDIO →", href: "/performer/studio" },
          { label: "STRIPE →", href: "/admin/billing" },
        ].map(l => (
          <a key={l.href} href={l.href} style={{
            padding: "6px 12px", borderRadius: 6, fontSize: 9, fontWeight: 800,
            background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)",
            color: "rgba(255,255,255,0.4)", textDecoration: "none", letterSpacing: "0.08em",
          }}>{l.label}</a>
        ))}
      </div>
    </div>
  );
}
