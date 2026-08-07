"use client";

/**
 * /legal/government-requests — intake only.
 * Does NOT grant database access. Creates a disclosure case that is blocked until human approval.
 */

import { useState, type CSSProperties, type FormEvent } from "react";
import Link from "next/link";

const CATEGORIES = [
  "ACCOUNT",
  "AUTH",
  "LIVE",
  "COMM",
  "MEDIA",
  "COMPETITION",
  "COMMERCE",
  "AUDIT",
] as const;

export default function GovernmentRequestsIntakePage() {
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<string[]>(["ACCOUNT", "AUDIT"]);

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setResult(null);
    const fd = new FormData(e.currentTarget);
    try {
      const r = await fetch("/api/legal/government-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requesterLabel: String(fd.get("requesterLabel") ?? ""),
          requesterEmail: String(fd.get("requesterEmail") ?? ""),
          jurisdictionCode: String(fd.get("jurisdictionCode") ?? "GLOBAL-DEFAULT"),
          legalBasisSummary: String(fd.get("legalBasisSummary") ?? ""),
          requestedCategories: selected,
          emergency: fd.get("emergency") === "on",
        }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error ?? `HTTP ${r.status}`);
      setResult(
        `Request received. Case ${data.caseId} created. Status: ${data.status}. ` +
          `Authority: ${data.authorityState}. Package draft prepared and blocked until human/counsel approval. ` +
          `This intake does not grant database access.`,
      );
      e.currentTarget.reset();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Submission failed");
    } finally {
      setSubmitting(false);
    }
  };

  const toggle = (cat: string) => {
    setSelected((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat],
    );
  };

  return (
    <main style={{ background: "#050510", minHeight: "100vh", padding: "48px 24px", color: "#fff" }}>
      <div style={{ maxWidth: 640, margin: "0 auto" }}>
        <div style={{ fontSize: 11, letterSpacing: "0.18em", color: "#FFD700", fontWeight: 900 }}>
          LEGAL REQUEST GATEWAY · INTAKE ONLY
        </div>
        <h1 style={{ fontSize: 28, fontWeight: 900, margin: "8px 0" }}>Government & Legal Requests</h1>
        <p style={{ fontSize: 14, color: "rgba(255,255,255,0.55)", lineHeight: 1.55, marginBottom: 24 }}>
          Submit a legally scoped disclosure request for authenticated review. This form creates a
          case for Defensible Compliance & Accountability — it does not open platform databases,
          and no records are released without human/counsel approval. Not legal advice.
        </p>

        <form onSubmit={onSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <Field label="Requesting authority / agency" name="requesterLabel" required />
          <Field label="Official contact email" name="requesterEmail" type="email" required />
          <label style={labelStyle}>
            Jurisdiction code
            <select name="jurisdictionCode" defaultValue="US-FED" style={inputStyle}>
              <option value="US-FED">US-FED</option>
              <option value="US-CA">US-CA</option>
              <option value="EU-GDPR">EU-GDPR</option>
              <option value="GLOBAL-DEFAULT">GLOBAL-DEFAULT</option>
            </select>
          </label>
          <label style={labelStyle}>
            Legal basis summary
            <textarea
              name="legalBasisSummary"
              required
              rows={4}
              placeholder="Describe the process / legal basis (no classified content)."
              style={{ ...inputStyle, resize: "vertical" }}
            />
          </label>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 8 }}>Requested data categories</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {CATEGORIES.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => toggle(c)}
                  style={{
                    fontSize: 10,
                    fontWeight: 800,
                    padding: "6px 10px",
                    borderRadius: 999,
                    border: `1px solid ${selected.includes(c) ? "#00FFFF" : "rgba(255,255,255,0.2)"}`,
                    background: selected.includes(c) ? "rgba(0,255,255,0.12)" : "transparent",
                    color: selected.includes(c) ? "#00FFFF" : "rgba(255,255,255,0.6)",
                    cursor: "pointer",
                  }}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
          <label style={{ fontSize: 12, color: "rgba(255,255,255,0.65)", display: "flex", gap: 8, alignItems: "center" }}>
            <input type="checkbox" name="emergency" />
            Mark as emergency priority review (still requires human approval)
          </label>
          <button
            type="submit"
            disabled={submitting || selected.length === 0}
            style={{
              fontSize: 12,
              fontWeight: 900,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              padding: "12px 16px",
              borderRadius: 10,
              border: "1px solid rgba(255,215,0,0.5)",
              background: "rgba(255,215,0,0.12)",
              color: "#FFD700",
              cursor: submitting ? "wait" : "pointer",
            }}
          >
            {submitting ? "Submitting…" : "Submit request"}
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
          <Link href="/legal/privacy" style={{ color: "#00FF88", fontSize: 13 }}>
            Privacy rights
          </Link>
        </div>
      </div>
    </main>
  );
}

function Field({
  label,
  name,
  type = "text",
  required,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <label style={labelStyle}>
      {label}
      <input name={name} type={type} required={required} style={inputStyle} />
    </label>
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
