"use client";

import { useState, useCallback } from "react";

interface Gate {
  id: string;
  label: string;
  description: string;
  check: () => Promise<{ pass: boolean; detail: string }>;
}

const BASE = typeof window !== "undefined" ? window.location.origin : "";

const GATES: Gate[] = [
  {
    id: "signup",
    label: "Signup page loads",
    description: "GET /signup returns 200",
    check: async () => {
      try {
        const r = await fetch(`${BASE}/signup`, { method: "HEAD" });
        return { pass: r.ok, detail: `HTTP ${r.status}` };
      } catch (e) { return { pass: false, detail: String(e) }; }
    },
  },
  {
    id: "login",
    label: "Login page loads",
    description: "GET /login returns 200",
    check: async () => {
      try {
        const r = await fetch(`${BASE}/login`, { method: "HEAD" });
        return { pass: r.ok, detail: `HTTP ${r.status}` };
      } catch (e) { return { pass: false, detail: String(e) }; }
    },
  },
  {
    id: "home1",
    label: "Homepage 1 loads",
    description: "GET /home/1 returns 200",
    check: async () => {
      try {
        const r = await fetch(`${BASE}/home/1`, { method: "HEAD" });
        return { pass: r.ok, detail: `HTTP ${r.status}` };
      } catch (e) { return { pass: false, detail: String(e) }; }
    },
  },
  {
    id: "api-session",
    label: "Auth session API",
    description: "GET /api/auth/session returns 200 or 401 (not 500)",
    check: async () => {
      try {
        const r = await fetch(`${BASE}/api/auth/session`);
        const pass = r.status !== 500 && r.status !== 502 && r.status !== 503;
        return { pass, detail: `HTTP ${r.status}` };
      } catch (e) { return { pass: false, detail: String(e) }; }
    },
  },
  {
    id: "stripe-products",
    label: "Stripe products API",
    description: "GET /api/stripe/products returns 200",
    check: async () => {
      try {
        const r = await fetch(`${BASE}/api/stripe/products`);
        return { pass: r.ok, detail: `HTTP ${r.status}` };
      } catch (e) { return { pass: false, detail: String(e) }; }
    },
  },
  {
    id: "season-pass",
    label: "Season pass page loads",
    description: "GET /season-pass returns 200",
    check: async () => {
      try {
        const r = await fetch(`${BASE}/season-pass`, { method: "HEAD" });
        return { pass: r.ok, detail: `HTTP ${r.status}` };
      } catch (e) { return { pass: false, detail: String(e) }; }
    },
  },
  {
    id: "payment-success",
    label: "Payment success page loads",
    description: "GET /payment-success returns 200",
    check: async () => {
      try {
        const r = await fetch(`${BASE}/payment-success`, { method: "HEAD" });
        return { pass: r.ok, detail: `HTTP ${r.status}` };
      } catch (e) { return { pass: false, detail: String(e) }; }
    },
  },
  {
    id: "admin",
    label: "Admin root accessible",
    description: "GET /admin returns 200 or 307 (not 500)",
    check: async () => {
      try {
        const r = await fetch(`${BASE}/admin`, { method: "HEAD", redirect: "manual" });
        const pass = r.status < 500;
        return { pass, detail: `HTTP ${r.status}` };
      } catch (e) { return { pass: false, detail: String(e) }; }
    },
  },
  {
    id: "stripe-audit",
    label: "Stripe audit page loads",
    description: "GET /admin/stripe-audit returns 200",
    check: async () => {
      try {
        const r = await fetch(`${BASE}/admin/stripe-audit`, { method: "HEAD" });
        return { pass: r.ok, detail: `HTTP ${r.status}` };
      } catch (e) { return { pass: false, detail: String(e) }; }
    },
  },
  {
    id: "onboarding-performer",
    label: "Performer onboarding loads",
    description: "GET /onboarding/performer returns 200",
    check: async () => {
      try {
        const r = await fetch(`${BASE}/onboarding/performer`, { method: "HEAD" });
        return { pass: r.ok, detail: `HTTP ${r.status}` };
      } catch (e) { return { pass: false, detail: String(e) }; }
    },
  },
  {
    id: "onboarding-fan",
    label: "Fan onboarding loads",
    description: "GET /onboarding/fan returns 200",
    check: async () => {
      try {
        const r = await fetch(`${BASE}/onboarding/fan`, { method: "HEAD" });
        return { pass: r.ok, detail: `HTTP ${r.status}` };
      } catch (e) { return { pass: false, detail: String(e) }; }
    },
  },
  {
    id: "live-lobby",
    label: "Live lobby loads",
    description: "GET /live/lobby returns 200",
    check: async () => {
      try {
        const r = await fetch(`${BASE}/live/lobby`, { method: "HEAD" });
        return { pass: r.ok, detail: `HTTP ${r.status}` };
      } catch (e) { return { pass: false, detail: String(e) }; }
    },
  },
];

type GateStatus = "idle" | "checking" | "pass" | "fail";

interface GateResult {
  status: GateStatus;
  detail?: string;
}

export default function LaunchGatesPage() {
  const [results, setResults] = useState<Record<string, GateResult>>({});
  const [running, setRunning] = useState(false);

  const runGate = useCallback(async (gate: Gate) => {
    setResults(prev => ({ ...prev, [gate.id]: { status: "checking" } }));
    const { pass, detail } = await gate.check();
    setResults(prev => ({ ...prev, [gate.id]: { status: pass ? "pass" : "fail", detail } }));
  }, []);

  const runAll = useCallback(async () => {
    setRunning(true);
    for (const gate of GATES) {
      await runGate(gate);
    }
    setRunning(false);
  }, [runGate]);

  const passed = Object.values(results).filter(r => r.status === "pass").length;
  const failed = Object.values(results).filter(r => r.status === "fail").length;
  const checked = passed + failed;
  const allGreen = checked === GATES.length && failed === 0;

  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", fontFamily: "'Inter',sans-serif", padding: "32px clamp(16px,4vw,48px) 80px" }}>

      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 8, letterSpacing: "0.3em", color: "#00C8FF", fontWeight: 900, marginBottom: 8, textTransform: "uppercase" }}>
          ADMIN · PROOF GATES
        </div>
        <h1 style={{ fontFamily: "'Bebas Neue','Impact',sans-serif", fontSize: "clamp(28px,5vw,48px)", letterSpacing: "0.04em", margin: "0 0 8px", color: allGreen ? "#00C896" : "#00C8FF" }}>
          {allGreen ? "✓ ALL SYSTEMS LAUNCH-READY" : "LAUNCH ACCEPTANCE CHECKS"}
        </h1>
        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", maxWidth: 560 }}>
          Live HTTP checks against every critical launch path. Run these before inviting users or enabling payments.
          All checks run from this browser — results reflect what real users experience.
        </p>
      </div>

      {/* Summary bar */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))", gap: 10, marginBottom: 24 }}>
        {[
          { label: "Total Gates",   value: GATES.length, color: "#00C8FF" },
          { label: "Passed",        value: passed,        color: "#00C896" },
          { label: "Failed",        value: failed,        color: "#FF2DAA" },
          { label: "Not Checked",   value: GATES.length - checked, color: "rgba(255,255,255,0.3)" },
        ].map(s => (
          <div key={s.label} style={{ border: `1px solid ${s.color}22`, background: `${s.color}06`, padding: "12px 14px" }}>
            <div style={{ fontFamily: "'Bebas Neue','Impact',sans-serif", fontSize: 24, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 8, color: "rgba(255,255,255,0.4)", letterSpacing: "0.14em", textTransform: "uppercase", marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Run All button */}
      <div style={{ marginBottom: 24 }}>
        <button
          onClick={() => void runAll()}
          disabled={running}
          style={{ padding: "12px 28px", fontSize: 10, fontWeight: 900, letterSpacing: "0.2em", background: running ? "rgba(0,200,255,0.1)" : "rgba(0,200,255,0.15)", color: "#00C8FF", border: "1px solid rgba(0,200,255,0.4)", cursor: running ? "not-allowed" : "pointer", textTransform: "uppercase" }}
        >
          {running ? "RUNNING CHECKS..." : "RUN ALL CHECKS"}
        </button>
      </div>

      {/* Gate rows */}
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {GATES.map(gate => {
          const r = results[gate.id];
          const statusColor = r?.status === "pass" ? "#00C896" : r?.status === "fail" ? "#FF2DAA" : r?.status === "checking" ? "#00C8FF" : "rgba(255,255,255,0.12)";
          const statusLabel = r?.status === "pass" ? "✓ PASS" : r?.status === "fail" ? "✗ FAIL" : r?.status === "checking" ? "..." : "—";

          return (
            <div key={gate.id} style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 16px", border: `1px solid ${statusColor}`, background: `${statusColor}06` }}>

              <div style={{ width: 48, fontSize: 9, fontWeight: 900, letterSpacing: "0.1em", color: statusColor, flexShrink: 0 }}>
                {statusLabel}
              </div>

              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#fff", marginBottom: 2 }}>{gate.label}</div>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)" }}>{gate.description}</div>
                {r?.detail && (
                  <div style={{ fontSize: 9, color: statusColor, marginTop: 3 }}>{r.detail}</div>
                )}
              </div>

              <button
                onClick={() => void runGate(gate)}
                disabled={r?.status === "checking"}
                style={{ padding: "6px 14px", fontSize: 9, fontWeight: 900, letterSpacing: "0.12em", background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.5)", border: "1px solid rgba(255,255,255,0.1)", cursor: r?.status === "checking" ? "not-allowed" : "pointer", textTransform: "uppercase", flexShrink: 0 }}
              >
                {r?.status === "checking" ? "..." : "CHECK"}
              </button>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div style={{ marginTop: 28, padding: "16px 20px", border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.02)", fontSize: 11, color: "rgba(255,255,255,0.4)", lineHeight: 1.7 }}>
        <strong style={{ color: "rgba(255,255,255,0.6)" }}>How to read results:</strong><br />
        <span style={{ color: "#00C896" }}>✓ PASS</span> — page is reachable and returning a non-error HTTP status.<br />
        <span style={{ color: "#FF2DAA" }}>✗ FAIL</span> — page returned 5xx, timed out, or threw a network error. Check Vercel logs.<br />
        <span style={{ color: "#FFD700" }}>Note:</span> HEAD requests may return 405 on some Next.js routes — if so, check via GET manually.
      </div>
    </main>
  );
}
