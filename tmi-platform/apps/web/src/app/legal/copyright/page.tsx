"use client";

/**
 * /legal/copyright — copyright complaint / takedown intake (scaffolding).
 * Wires to Legal Audit Ledger. Not legal advice. Does not auto-remove content.
 */

import { useState, type CSSProperties, type FormEvent } from "react";
import Link from "next/link";

export default function CopyrightComplaintPage() {
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
      const r = await fetch("/api/legal/copyright", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          claimantName: String(fd.get("claimantName") ?? ""),
          claimantEmail: String(fd.get("claimantEmail") ?? ""),
          workDescription: String(fd.get("workDescription") ?? ""),
          infringingUrlOrRoom: String(fd.get("infringingUrlOrRoom") ?? ""),
          goodFaithStatement: fd.get("goodFaith") === "on",
          perjuryStatement: fd.get("perjury") === "on",
          notes: String(fd.get("notes") ?? ""),
        }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error ?? `HTTP ${r.status}`);
      setResult(
        `Complaint ${data.complaintId} received (case ${data.caseId}). Status: ${data.status}. ` +
          `Human verification and preservation follow — content is not auto-removed. Not legal advice.`,
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
        <div style={{ fontSize: 11, letterSpacing: "0.18em", color: "#FF6B1A", fontWeight: 900 }}>
          COPYRIGHT & IP · INTAKE
        </div>
        <h1 style={{ fontSize: 28, fontWeight: 900, margin: "8px 0" }}>Copyright Complaint</h1>
        <p style={{ fontSize: 14, color: "rgba(255,255,255,0.55)", lineHeight: 1.55, marginBottom: 24 }}>
          Submit a copyright complaint for review. This intake creates an audited case and starts
          claimant verification / preservation scaffolding. It does not grant automatic takedown
          without process. &quot;No Copyright Intended&quot; is not a license. Not legal advice.
        </p>

        <form onSubmit={onSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <label style={labelStyle}>
            Claimant name
            <input name="claimantName" required style={inputStyle} />
          </label>
          <label style={labelStyle}>
            Claimant email
            <input name="claimantEmail" type="email" required style={inputStyle} />
          </label>
          <label style={labelStyle}>
            Copyrighted work description
            <textarea name="workDescription" required rows={3} style={{ ...inputStyle, resize: "vertical" }} />
          </label>
          <label style={labelStyle}>
            Infringing URL or room identifier
            <input name="infringingUrlOrRoom" required style={inputStyle} />
          </label>
          <label style={labelStyle}>
            Notes
            <textarea name="notes" rows={3} style={{ ...inputStyle, resize: "vertical" }} />
          </label>
          <label style={{ fontSize: 12, color: "rgba(255,255,255,0.65)", display: "flex", gap: 8 }}>
            <input type="checkbox" name="goodFaith" required />
            Good-faith belief that the use is unauthorized
          </label>
          <label style={{ fontSize: 12, color: "rgba(255,255,255,0.65)", display: "flex", gap: 8 }}>
            <input type="checkbox" name="perjury" required />
            Statement under penalty of perjury that the information is accurate
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
              border: "1px solid rgba(255,107,26,0.5)",
              background: "rgba(255,107,26,0.12)",
              color: "#FF6B1A",
              cursor: submitting ? "wait" : "pointer",
            }}
          >
            {submitting ? "Submitting…" : "Submit complaint"}
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
          <Link href="/dmca" style={{ color: "#FFD700", fontSize: 13 }}>
            DMCA policy
          </Link>
          {" · "}
          <Link href="/admin/legal" style={{ color: "#FF6B1A", fontSize: 13 }}>
            Legal Command (admin)
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
