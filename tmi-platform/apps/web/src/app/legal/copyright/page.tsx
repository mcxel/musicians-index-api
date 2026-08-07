"use client";

/**
 * /legal/copyright — Quick Claim + copyright complaint / takedown intake.
 * Wires to RightsComplianceEngine + Legal Audit Ledger.
 * Not legal advice. Does not auto-remove content or transfer ownership.
 */

import { useState, type CSSProperties, type FormEvent } from "react";
import Link from "next/link";
import QuickClaimButton from "@/components/legal/QuickClaimButton";

export default function CopyrightComplaintPage() {
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [claimAssetId, setClaimAssetId] = useState("");

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
        <h1 style={{ fontSize: 28, fontWeight: 900, margin: "8px 0" }}>Copyright &amp; Rights</h1>
        <p style={{ fontSize: 14, color: "rgba(255,255,255,0.55)", lineHeight: 1.55, marginBottom: 24 }}>
          File a Quick Claim (CLAIM MY WORK) or a copyright complaint. Claims preserve evidence and
          open VERIFIED / REVIEW / DISPUTED outcomes — they never instantly transfer ownership or
          delete content. &quot;I own it&quot; alone never clears UFC/NBC/TV third-party. Not legal advice.
        </p>

        <section
          style={{
            marginBottom: 28,
            padding: 16,
            borderRadius: 12,
            border: "1px solid rgba(255,107,26,0.35)",
            background: "rgba(255,107,26,0.06)",
            display: "flex",
            flexDirection: "column",
            gap: 12,
          }}
        >
          <div style={{ fontSize: 12, fontWeight: 900, letterSpacing: "0.12em", color: "#FF6B1A" }}>
            QUICK CLAIM · CLAIM MY WORK
          </div>
          <p style={{ margin: 0, fontSize: 12, color: "rgba(255,255,255,0.5)", lineHeight: 1.45 }}>
            Enter an asset id (song / video / beat / media). Filing issues a RIGHTS-CLAIM-######## id,
            preserves evidence, and never seizes or deletes content.
          </p>
          <label style={labelStyle}>
            Asset ID
            <input
              value={claimAssetId}
              onChange={(e) => setClaimAssetId(e.target.value)}
              placeholder="e.g. beat-001"
              style={inputStyle}
            />
          </label>
          {claimAssetId.trim() ? (
            <QuickClaimButton assetId={claimAssetId.trim()} assetKind="MEDIA" />
          ) : (
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>
              Enter an asset id to enable CLAIM MY WORK.
            </div>
          )}
        </section>

        <h2 style={{ fontSize: 18, fontWeight: 900, margin: "0 0 12px" }}>Copyright Complaint</h2>
        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", lineHeight: 1.5, marginBottom: 16 }}>
          Formal complaint intake for review. Audited case + preservation scaffolding — not automatic
          takedown without process.
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
