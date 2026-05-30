"use client";

import { FormEvent, useMemo, useState } from "react";
import PasswordStrengthMeter from "./PasswordStrengthMeter";
import RecoveryStatusCard from "./RecoveryStatusCard";

type Props = {
  token: string;
  email: string;
};

export default function ResetPasswordForm({ token, email }: Props) {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "success" | "error" | "warning">("idle");
  const [message, setMessage] = useState("Set a new secure password to continue.");
  const [loading, setLoading] = useState(false);

  const canSubmit = useMemo(
    () => !loading && newPassword.length >= 10 && confirmPassword.length >= 10,
    [loading, newPassword, confirmPassword]
  );

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, token, newPassword, confirmPassword }),
      });
      const data = await res.json() as { ok: boolean; reason?: string };

      if (!data.ok) {
        setStatus("error");
        switch (data.reason) {
          case "expired_token":   setMessage("This reset token is expired. Request a new link."); break;
          case "used_token":      setMessage("This reset token was already used."); break;
          case "weak_password":   setMessage("Password too weak. Use upper/lowercase, number, and symbol."); break;
          case "password_mismatch": setMessage("Passwords do not match."); break;
          default:                setMessage("Invalid reset token.");
        }
        return;
      }

      setStatus("success");
      setMessage("Password updated. You can now sign in with your new password.");
    } catch {
      setStatus("error");
      setMessage("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} style={{ display: "grid", gap: 12 }}>
      <div style={{ fontSize: 12, color: "rgba(255,255,255,0.7)" }}>Resetting account: {email}</div>

      <label style={{ display: "grid", gap: 6 }}>
        <span style={{ fontSize: 12, color: "rgba(255,255,255,0.84)" }}>New password</span>
        <input
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
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

      <PasswordStrengthMeter password={newPassword} />

      <label style={{ display: "grid", gap: 6 }}>
        <span style={{ fontSize: 12, color: "rgba(255,255,255,0.84)" }}>Confirm password</span>
        <input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
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
          border: "1px solid rgba(0,255,136,0.5)",
          background: "rgba(0,255,136,0.12)",
          color: "#b9ffd9",
          padding: "10px 12px",
          fontWeight: 800,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          cursor: canSubmit ? "pointer" : "not-allowed",
          opacity: canSubmit ? 1 : 0.55,
        }}
      >
        Update password
      </button>

      <RecoveryStatusCard title="Reset Status" status={status} message={message} />
    </form>
  );
}
