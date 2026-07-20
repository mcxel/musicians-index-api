"use client";
import { useState } from "react";

export interface ReportButtonProps {
  targetType: "user" | "room" | "content" | "message";
  targetId: string;
  targetName?: string;
  variant?: "icon" | "text";
}

const CATEGORIES: { value: string; label: string }[] = [
  { value: "harassment", label: "Harassment or bullying" },
  { value: "hate_speech", label: "Hate speech" },
  { value: "threats", label: "Threats or violence" },
  { value: "self_harm", label: "Self-harm content" },
  { value: "sexual_content", label: "Sexual content" },
  { value: "spam", label: "Spam" },
  { value: "impersonation", label: "Impersonation" },
  { value: "scam", label: "Scam or fraud" },
  { value: "other", label: "Other" },
];

export default function ReportButton({ targetType, targetId, targetName, variant = "icon" }: ReportButtonProps) {
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState("");
  const [detail, setDetail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    if (!category) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ targetType, targetId, category, detail: detail || undefined }),
      });
      const data = await res.json() as { error?: string };
      if (!res.ok) { setError(data.error ?? "Failed to submit report"); return; }
      setSubmitted(true);
    } finally {
      setSubmitting(false);
    }
  };

  const close = () => { setOpen(false); setSubmitted(false); setCategory(""); setDetail(""); setError(null); };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        title={`Report ${targetName ?? targetType}`}
        style={
          variant === "icon"
            ? { width: 28, height: 28, borderRadius: "50%", border: "1px solid rgba(255,255,255,0.15)", background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.5)", cursor: "pointer", fontSize: 12 }
            : { padding: "5px 12px", borderRadius: 6, border: "1px solid rgba(255,68,68,0.3)", background: "rgba(255,68,68,0.08)", color: "#FF8A8A", cursor: "pointer", fontSize: 10, fontWeight: 800 }
        }
      >
        {variant === "icon" ? "⚑" : "Report"}
      </button>

      {open && (
        <div style={{ position: "fixed", inset: 0, zIndex: 9999, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }} onClick={(e) => { if (e.target === e.currentTarget) close(); }}>
          <div style={{ width: "100%", maxWidth: 380, background: "#0a0a1a", border: "1px solid rgba(255,68,68,0.25)", borderRadius: 14, padding: 20 }}>
            {submitted ? (
              <>
                <div style={{ fontSize: 13, fontWeight: 800, color: "#00FF88", marginBottom: 8 }}>Report submitted</div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", lineHeight: 1.5, marginBottom: 16 }}>
                  Thanks — our team reviews every report. Severe categories trigger an immediate safety hold while we review.
                </div>
                <button onClick={close} style={{ width: "100%", padding: "9px 0", borderRadius: 8, background: "rgba(255,255,255,0.06)", border: "none", color: "#fff", fontSize: 10, fontWeight: 800, cursor: "pointer" }}>CLOSE</button>
              </>
            ) : (
              <>
                <div style={{ fontSize: 13, fontWeight: 800, color: "#fff", marginBottom: 4 }}>Report {targetName ?? targetType}</div>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", marginBottom: 14 }}>What's wrong?</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 12 }}>
                  {CATEGORIES.map((c) => (
                    <label key={c.value} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 11, color: "rgba(255,255,255,0.7)", cursor: "pointer" }}>
                      <input type="radio" name="category" value={c.value} checked={category === c.value} onChange={() => setCategory(c.value)} />
                      {c.label}
                    </label>
                  ))}
                </div>
                <textarea
                  value={detail}
                  onChange={(e) => setDetail(e.target.value)}
                  placeholder="Additional details (optional)"
                  rows={3}
                  style={{ width: "100%", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "#fff", fontSize: 11, padding: 10, resize: "vertical", boxSizing: "border-box", marginBottom: 12 }}
                />
                {error && <div style={{ fontSize: 10, color: "#FF8A8A", marginBottom: 10 }}>{error}</div>}
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={close} style={{ flex: 1, padding: "9px 0", borderRadius: 8, background: "rgba(255,255,255,0.06)", border: "none", color: "rgba(255,255,255,0.6)", fontSize: 10, fontWeight: 800, cursor: "pointer" }}>CANCEL</button>
                  <button onClick={submit} disabled={!category || submitting} style={{ flex: 1, padding: "9px 0", borderRadius: 8, background: category ? "#FF4444" : "rgba(255,255,255,0.06)", border: "none", color: "#fff", fontSize: 10, fontWeight: 800, cursor: category ? "pointer" : "not-allowed" }}>
                    {submitting ? "…" : "SUBMIT"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
