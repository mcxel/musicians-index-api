"use client";

/**
 * /legal/privacy — privacy rights intake (PrivacyRequestEngine).
 */

import { useState, type CSSProperties, type FormEvent } from "react";
import Link from "next/link";

const TYPES = ["ACCESS", "DELETE", "CORRECT", "EXPORT", "OPT_OUT"] as const;

export default function PrivacyRightsPage() {
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setResult(null);
    const fd = new FormData(e.currentTarget);
    try {
      const r = await fetch("/api/legal/privacy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requesterEmail: String(fd.get("requesterEmail") ?? ""),
          requestType: String(fd.get("requestType") ?? "ACCESS"),
          notes: String(fd.get("notes") ?? ""),
        }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error ?? `HTTP ${r.status}`);
      setResult(
        `Privacy request received (${data.requestId}). Case ${data.caseId} opened for human review. ` +
          `This is not an automated deletion/export. Not legal advice.`,
      );
      e.currentTarget.reset();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Submission failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main style={{ background: "#050510", minHeight: "100vh", padding: "48px 24px", color: "#fff" }}>
      <div style={{ maxWidth: 640, margin: "0 auto" }}>
        <div style={{ fontSize: 11, letterSpacing: "0.18em", color: "#00FF88", fontWeight: 900 }}>
          PRIVACY RIGHTS CENTER
        </div>
        <h1 style={{ fontSize: 28, fontWeight: 900, margin: "8px 0" }}>Privacy Rights Requests</h1>
        <p style={{ fontSize: 14, color: "rgba(255,255,255,0.55)", lineHeight: 1.55, marginBottom: 24 }}>
          Submit an access, correction, export, opt-out, or deletion request. Requests are logged to
          the Legal Audit Ledger and reviewed by humans. Separate from government disclosure intake.
          Not legal advice.
        </p>

        <form onSubmit={onSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <label style={labelStyle}>
            Email
            <input name="requesterEmail" type="email" required style={inputStyle} />
          </label>
          <label style={labelStyle}>
            Request type
            <select name="requestType" defaultValue="ACCESS" style={inputStyle}>
              {TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </label>
          <label style={labelStyle}>
            Notes
            <textarea name="notes" rows={4} style={{ ...inputStyle, resize: "vertical" }} />
          </label>
          <button
            type="submit"
            disabled={submitting}
            style={{
              fontSize: 12,
              fontWeight: 900,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              padding: "12px 16px",
              borderRadius: 10,
              border: "1px solid rgba(0,255,136,0.5)",
              background: "rgba(0,255,136,0.1)",
              color: "#00FF88",
              cursor: submitting ? "wait" : "pointer",
            }}
          >
            {submitting ? "Submitting…" : "Submit privacy request"}
          </button>
        </form>

        {result ? (
          <div style={{ marginTop: 16, padding: 14, borderRadius: 10, border: "1px solid rgba(0,255,136,0.35)", color: "#00FF88", fontSize: 13, lineHeight: 1.5 }}>
            {result}
          </div>
        ) : null}
        {error ? (
          <div style={{ marginTop: 16, padding: 14, borderRadius: 10, border: "1px solid rgba(255,68,68,0.35)", color: "#FF8A8A", fontSize: 13 }}>
            {error}
          </div>
        ) : null}

        <div style={{ marginTop: 28, borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: 16 }}>
          <Link href="/legal" style={{ color: "#00FFFF", fontSize: 13 }}>
            ← Legal Center
          </Link>
          {" · "}
          <Link href="/legal/government-requests" style={{ color: "#FFD700", fontSize: 13 }}>
            Government requests
          </Link>
        </div>
      </div>
    </main>
  );
}

const labelStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 6,
  fontSize: 12,
  fontWeight: 700,
  color: "rgba(255,255,255,0.75)",
};

const inputStyle: CSSProperties = {
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.15)",
  borderRadius: 8,
  padding: "10px 12px",
  color: "#fff",
  fontSize: 14,
};
