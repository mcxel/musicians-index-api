"use client";

import { useState } from "react";

type ChainStep = {
  label: string;
  key: "faceScan" | "avatar" | "ticket" | "seat";
  color: string;
};

const STEPS: ChainStep[] = [
  { label: "FACE SCAN", key: "faceScan", color: "#00FFFF" },
  { label: "AVATAR", key: "avatar", color: "#c4b5fd" },
  { label: "TICKET", key: "ticket", color: "#FFD700" },
  { label: "SEAT", key: "seat", color: "#22c55e" },
];

type ChainResult = {
  valid: boolean;
  reason: string;
  chain: { faceScan: boolean; avatar: boolean; ticket: boolean; seat: boolean };
};

export default function VenueEntryChainPanel({ slug }: { slug: string }) {
  const [ticketId, setTicketId] = useState("");
  const [userId, setUserId] = useState("demo-user");
  const [gate, setGate] = useState("GATE-A");
  const [status, setStatus] = useState("");
  const [result, setResult] = useState<ChainResult | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleValidate() {
    if (!ticketId.trim()) return;
    setLoading(true);
    setStatus("Scanning identity chain...");
    setResult(null);
    try {
      const res = await fetch("/api/tickets/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticketId: ticketId.trim(), userId, gate }),
      });
      const payload = await res.json();
      if (res.ok) {
        setResult(payload);
        setStatus(payload.valid ? "ENTRY GRANTED" : `ENTRY DENIED — ${payload.reason ?? "chain_invalid"}`);
      } else {
        setStatus(payload?.error ?? "validation_failed");
      }
    } catch {
      setStatus("network_error");
    } finally {
      setLoading(false);
    }
  }

  const granted = result?.valid === true;
  const denied = result?.valid === false;

  return (
    <section
      style={{
        border: granted ? "1px solid rgba(34,197,94,0.5)" : denied ? "1px solid rgba(239,68,68,0.45)" : "1px solid rgba(0,255,255,0.25)",
        borderRadius: 14,
        background: "linear-gradient(160deg, rgba(0,8,20,0.98), #090712)",
        padding: 16,
        display: "flex",
        flexDirection: "column",
        gap: 12,
      }}
    >
      <div style={{ color: "#00FFFF", fontSize: 11, fontWeight: 800, letterSpacing: "0.18em" }}>
        VENUE ENTRY CHAIN · {slug.toUpperCase()}
      </div>
      <div style={{ color: "#475569", fontSize: 9, letterSpacing: "0.1em" }}>
        FACE SCAN → AVATAR → TICKET → SEAT · IDENTITY VALIDATION
      </div>

      {/* Input fields */}
      <div style={{ display: "grid", gap: 8 }}>
        {([
          ["TICKET ID", ticketId, setTicketId],
          ["USER ID", userId, setUserId],
          ["GATE", gate, setGate],
        ] as [string, string, (v: string) => void][]).map(([label, val, setter]) => (
          <div key={label}>
            <div style={{ color: "#334155", fontSize: 8, letterSpacing: "0.1em", marginBottom: 3 }}>{label}</div>
            <input
              type="text"
              value={val}
              onChange={(e) => setter(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleValidate()}
              style={{ width: "100%", boxSizing: "border-box", background: "rgba(255,255,255,0.05)", border: "1px solid #1e293b", borderRadius: 7, color: "#e2e8f0", fontSize: 11, padding: "7px 10px" }}
            />
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={handleValidate}
        disabled={loading || !ticketId.trim()}
        style={{ borderRadius: 8, border: "1px solid rgba(0,255,255,0.4)", background: "rgba(0,255,255,0.12)", color: "#00FFFF", fontSize: 11, fontWeight: 800, letterSpacing: "0.14em", padding: "10px 0", cursor: loading ? "not-allowed" : "pointer", opacity: loading || !ticketId.trim() ? 0.5 : 1 }}
      >
        {loading ? "SCANNING..." : "VALIDATE ENTRY"}
      </button>

      {/* Chain visualizer */}
      {result && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 6 }}>
          {STEPS.map((step, i) => {
            const pass = result.chain[step.key];
            return (
              <div key={step.key} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: "50%",
                    border: `2px solid ${pass ? step.color : "rgba(239,68,68,0.5)"}`,
                    background: pass ? `${step.color}18` : "rgba(239,68,68,0.08)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 16,
                  }}
                >
                  {pass ? "✓" : "✗"}
                </div>
                <div style={{ color: pass ? step.color : "#f87171", fontSize: 8, fontWeight: 700, letterSpacing: "0.08em", textAlign: "center" }}>
                  {step.label}
                </div>
                {i < STEPS.length - 1 && (
                  <div style={{ position: "absolute", display: "none" }} aria-hidden />
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Status */}
      {status && (
        <div
          style={{
            borderRadius: 8,
            border: `1px solid ${granted ? "rgba(34,197,94,0.4)" : denied ? "rgba(239,68,68,0.4)" : "rgba(100,116,139,0.3)"}`,
            background: granted ? "rgba(34,197,94,0.1)" : denied ? "rgba(239,68,68,0.08)" : "transparent",
            color: granted ? "#22c55e" : denied ? "#f87171" : "#94a3b8",
            fontSize: 11,
            fontWeight: 800,
            padding: "10px 12px",
            letterSpacing: "0.1em",
            textAlign: "center",
          }}
        >
          {status}
        </div>
      )}
    </section>
  );
}
