"use client";

import { FormEvent, useMemo, useState } from "react";
import RecoveryStatusCard from "./RecoveryStatusCard";

export default function ForgotPasswordForm() {
  const [email, setEmail]   = useState("");
  const [status, setStatus] = useState<"idle" | "success" | "error" | "warning">("idle");
  const [message, setMessage] = useState("Enter your account email to receive a reset link.");
  const [busy, setBusy]     = useState(false);

  const canSubmit = useMemo(() => email.trim().length > 4 && !busy, [email, busy]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);

    try {
      const res  = await fetch("/api/auth/forgot-password", {
        method:  "POST",
        headers: { "content-type": "application/json" },
        body:    JSON.stringify({ email: email.trim().toLowerCase() }),
      });
      const data = (await res.json()) as { ok: boolean; reason?: string };

      if (!data.ok) {
        if (data.reason === "rate_limited") {
          setStatus("warning");
          setMessage("Too many reset attempts. Please wait before trying again.");
        } else {
          setStatus("error");
          setMessage("Invalid email format. Please enter a valid email.");
        }
      } else {
        setStatus("success");
        setMessage("Reset link sent. Check your email inbox for secure reset instructions.");
      }
    } catch {
      setStatus("error");
      setMessage("Could not send reset link. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} style={{ display: "grid", gap: 12 }}>
      <label style={{ display: "grid", gap: 6 }}>
        <span style={{ fontSize: 12, color: "rgba(255,255,255,0.84)" }}>Account email</span>
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type="email"
          placeholder="you@example.com"
          style={{
            borderRadius: 10,
            border: "1px solid rgba(255,255,255,0.2)",
            background: "rgba(0,0,0,0.45)",
            color: "#fff",
            padding: "10px 12px",
            outline: "none",
          }}
        />
      </label>

      <button
        type="submit"
        disabled={!canSubmit}
        style={{
          borderRadius: 10,
          border: "1px solid rgba(0,255,255,0.45)",
          background: "rgba(0,255,255,0.12)",
          color: "#bafcff",
          padding: "10px 12px",
          fontWeight: 800,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          cursor: canSubmit ? "pointer" : "not-allowed",
          opacity: canSubmit ? 1 : 0.55,
        }}
      >
        {busy ? "Sending…" : "Send reset link"}
      </button>

      <RecoveryStatusCard title="Recovery Status" status={status} message={message} />
    </form>
  );
}
