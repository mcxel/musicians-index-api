"use client";

import { useState } from "react";
import Link from "next/link";
import RecoveryStatusCard from "@/components/auth/RecoveryStatusCard";
import { consumeSessionRecovery, createSessionRecovery, getSessionRecovery } from "@/lib/auth/SessionRecoveryEngine";

export default function SessionRecoveryPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("Check existing recovery or create a new recovery session.");
  const [status, setStatus] = useState<"idle" | "success" | "error" | "warning">("idle");

  const normalized = email.trim().toLowerCase();

  return (
    <main style={{ minHeight: "100vh", background: "linear-gradient(180deg,#04050c,#090b18)", color: "#fff", padding: "40px 20px" }}>
      <div style={{ maxWidth: 620, margin: "0 auto", display: "grid", gap: 16 }}>
        <h1 style={{ margin: 0, fontSize: 30, fontWeight: 900 }}>Session Recovery</h1>
        <p style={{ margin: 0, color: "rgba(255,255,255,0.74)" }}>
          Restore access after token/session loss without widening auth scope.
        </p>

        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          style={{
            borderRadius: 10,
            border: "1px solid rgba(255,255,255,0.2)",
            background: "rgba(0,0,0,0.45)",
            color: "#fff",
            padding: "10px 12px",
          }}
        />

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button
            onClick={() => {
              if (!normalized) {
                setStatus("error");
                setMessage("Email is required.");
                return;
              }
              const existing = getSessionRecovery(normalized);
              if (!existing) {
                setStatus("warning");
                setMessage("No active recovery session found.");
                return;
              }
              setStatus("success");
              setMessage(`Recovery session active until ${new Date(existing.expiresAt).toLocaleString()}.`);
            }}
            style={{
              borderRadius: 10,
              border: "1px solid rgba(56,189,248,0.5)",
              background: "rgba(56,189,248,0.12)",
              color: "#bae6fd",
              padding: "10px 12px",
              fontWeight: 800,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              cursor: "pointer",
            }}
          >
            Check session
          </button>

          <button
            onClick={() => {
              if (!normalized) {
                setStatus("error");
                setMessage("Email is required.");
                return;
              }
              const rec = createSessionRecovery({ email: normalized, reason: "manual_recovery" });
              setStatus("success");
              setMessage(`Recovery issued. Expires ${new Date(rec.expiresAt).toLocaleString()}.`);
            }}
            style={{
              borderRadius: 10,
              border: "1px solid rgba(0,255,255,0.5)",
              background: "rgba(0,255,255,0.12)",
              color: "#bafcff",
              padding: "10px 12px",
              fontWeight: 800,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              cursor: "pointer",
            }}
          >
            Create recovery
          </button>

          <button
            onClick={() => {
              if (!normalized) {
                setStatus("error");
                setMessage("Email is required.");
                return;
              }
              const rec = consumeSessionRecovery(normalized);
              if (!rec) {
                setStatus("warning");
                setMessage("No recoverable session found.");
                return;
              }
              setStatus("success");
              setMessage("Recovery session consumed. Continue to sign in.");
            }}
            style={{
              borderRadius: 10,
              border: "1px solid rgba(34,197,94,0.5)",
              background: "rgba(34,197,94,0.12)",
              color: "#bbf7d0",
              padding: "10px 12px",
              fontWeight: 800,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              cursor: "pointer",
            }}
          >
            Consume recovery
          </button>
        </div>

        <RecoveryStatusCard title="Session Recovery Status" status={status} message={message} />

        <Link href="/auth" style={{ color: "#93c5fd", fontSize: 13 }}>
          ← Back to auth
        </Link>
      </div>
    </main>
  );
}
