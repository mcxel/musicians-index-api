"use client";

import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
  TRUST_SAFETY_REASON_LABELS,
  TRUST_SAFETY_REPORT_REASONS,
  type EvidenceMessage,
  type TrustSafetyReportReason,
  type TrustSafetySurface,
} from "@/lib/trustSafety/types";

export type QuickReportTarget = {
  accusedId?: string | null;
  accusedLabel?: string;
  surface: TrustSafetySurface;
  roomId?: string | null;
  contentSnapshot?: string | null;
  presenceSnapshot?: unknown;
  recentMessages?: EvidenceMessage[];
};

type QuickReportPanelProps = {
  open: boolean;
  onClose: () => void;
  target: QuickReportTarget | null;
  onSubmitted?: (caseId: string) => void;
  /** When true, also call local block callback immediately on submit if Block checked. */
  onBlockLocal?: (accusedId: string) => void;
};

/**
 * Reusable Quick Report Panel — overlay, stays in experience.
 * Screenshot upload uses /api/upload when available; deferred note if it fails.
 */
export default function QuickReportPanel({
  open,
  onClose,
  target,
  onSubmitted,
  onBlockLocal,
}: QuickReportPanelProps) {
  const [mounted, setMounted] = useState(false);
  const [reasons, setReasons] = useState<TrustSafetyReportReason[]>([]);
  const [detail, setDetail] = useState("");
  const [includeMessages, setIncludeMessages] = useState(true);
  const [blockImmediate, setBlockImmediate] = useState(true);
  const [screenshotUrl, setScreenshotUrl] = useState<string | null>(null);
  const [uploadNote, setUploadNote] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [caseId, setCaseId] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) {
      setReasons([]);
      setDetail("");
      setIncludeMessages(true);
      setBlockImmediate(true);
      setScreenshotUrl(null);
      setUploadNote(null);
      setError(null);
      setCaseId(null);
      setSubmitting(false);
    }
  }, [open]);

  const toggleReason = (r: TrustSafetyReportReason) => {
    setReasons((prev) => (prev.includes(r) ? prev.filter((x) => x !== r) : [...prev, r]));
  };

  const onFile = async (file: File | null) => {
    if (!file) return;
    setUploadNote(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("context", "trust-safety");
      const res = await fetch("/api/upload", { method: "POST", body: fd, credentials: "include" });
      if (!res.ok) {
        setUploadNote("Screenshot upload deferred — case can still be filed without it.");
        return;
      }
      const data = (await res.json()) as { url?: string };
      if (data.url) {
        setScreenshotUrl(data.url);
        setUploadNote("Screenshot attached.");
      } else {
        setUploadNote("Screenshot upload deferred — no URL returned.");
      }
    } catch {
      setUploadNote("Screenshot upload deferred — network error. Case can still be filed.");
    }
  };

  const submit = useCallback(async () => {
    if (!target || !reasons.length) {
      setError("Select at least one reason.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/trust-safety/report", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          accusedId: target.accusedId ?? undefined,
          reasons,
          surface: target.surface,
          roomId: target.roomId ?? undefined,
          detail: detail.slice(0, 4000) || undefined,
          blockImmediate,
          includeMessages,
          messages: includeMessages ? target.recentMessages ?? [] : [],
          screenshotUrl: screenshotUrl ?? undefined,
          contentSnapshot: target.contentSnapshot ?? undefined,
          presenceSnapshot: target.presenceSnapshot,
        }),
      });
      const data = (await res.json()) as { ok?: boolean; caseId?: string; error?: string };
      if (!res.ok || !data.caseId) {
        setError(data.error ?? (res.status === 401 ? "Sign in required to report." : "Report failed."));
        return;
      }
      if (blockImmediate && target.accusedId && onBlockLocal) {
        onBlockLocal(target.accusedId);
      }
      setCaseId(data.caseId);
      onSubmitted?.(data.caseId);
    } catch {
      setError("Network error — report not filed.");
    } finally {
      setSubmitting(false);
    }
  }, [target, reasons, detail, blockImmediate, includeMessages, screenshotUrl, onBlockLocal, onSubmitted]);

  if (!mounted || !open || !target) return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Quick Report"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 10050,
        background: "rgba(0,0,0,0.55)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget && !submitting) onClose();
      }}
    >
      <div
        style={{
          width: "min(440px, 100%)",
          maxHeight: "90vh",
          overflow: "auto",
          borderRadius: 14,
          border: "1.5px solid rgba(255,45,170,0.45)",
          background: "linear-gradient(165deg, #12081a 0%, #050510 100%)",
          boxShadow: "0 20px 60px rgba(0,0,0,0.65), 0 0 24px rgba(255,45,170,0.12)",
          padding: 18,
          color: "#fff",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <div>
            <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.18em", color: "#FF2DAA", textTransform: "uppercase" }}>
              Trust & Safety
            </div>
            <div style={{ fontSize: 16, fontWeight: 800 }}>Quick Report</div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            style={{ background: "transparent", border: "none", color: "rgba(255,255,255,0.5)", fontSize: 18, cursor: "pointer" }}
          >
            ×
          </button>
        </div>

        {caseId ? (
          <div style={{ textAlign: "center", padding: "24px 8px" }}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>✓</div>
            <div style={{ fontWeight: 800, fontSize: 15, color: "#00FF88" }}>Report filed</div>
            <div style={{ marginTop: 10, fontSize: 13, color: "rgba(255,255,255,0.75)" }}>
              Case number: <span style={{ color: "#FFD700", fontWeight: 900 }}>{caseId}</span>
            </div>
            <p style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", marginTop: 10, lineHeight: 1.45 }}>
              Evidence preserved. Reporter protections applied where available.
            </p>
            <button
              type="button"
              onClick={onClose}
              style={{
                marginTop: 16,
                padding: "10px 20px",
                borderRadius: 10,
                border: "1.5px solid #00FFFF",
                background: "rgba(0,255,255,0.12)",
                color: "#00FFFF",
                fontWeight: 800,
                cursor: "pointer",
              }}
            >
              Done
            </button>
          </div>
        ) : (
          <>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.55)", marginBottom: 12 }}>
              Reporting: <strong style={{ color: "#fff" }}>{target.accusedLabel ?? target.accusedId ?? "Unknown"}</strong>
              {target.roomId ? (
                <span>
                  {" "}
                  · room <code style={{ color: "#00FFFF" }}>{target.roomId}</code>
                </span>
              ) : null}
            </div>

            <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.1em", color: "#FFD700", marginBottom: 8, textTransform: "uppercase" }}>
              Reasons
            </div>
            <div style={{ display: "grid", gap: 6, marginBottom: 14 }}>
              {TRUST_SAFETY_REPORT_REASONS.map((r) => (
                <label
                  key={r}
                  style={{
                    display: "flex",
                    gap: 8,
                    alignItems: "center",
                    fontSize: 12,
                    cursor: "pointer",
                    padding: "6px 8px",
                    borderRadius: 8,
                    border: `1px solid ${reasons.includes(r) ? "rgba(255,45,170,0.5)" : "rgba(255,255,255,0.08)"}`,
                    background: reasons.includes(r) ? "rgba(255,45,170,0.12)" : "transparent",
                  }}
                >
                  <input type="checkbox" checked={reasons.includes(r)} onChange={() => toggleReason(r)} />
                  {TRUST_SAFETY_REASON_LABELS[r]}
                </label>
              ))}
            </div>

            <label style={{ display: "block", fontSize: 10, fontWeight: 800, color: "rgba(255,255,255,0.45)", marginBottom: 4 }}>
              DETAILS (optional)
            </label>
            <textarea
              value={detail}
              onChange={(e) => setDetail(e.target.value)}
              rows={3}
              placeholder="What happened?"
              style={{
                width: "100%",
                resize: "vertical",
                borderRadius: 8,
                border: "1px solid rgba(255,255,255,0.15)",
                background: "rgba(0,0,0,0.35)",
                color: "#fff",
                padding: 8,
                fontSize: 12,
                marginBottom: 12,
              }}
            />

            <label style={{ display: "flex", gap: 8, alignItems: "center", fontSize: 12, marginBottom: 8, cursor: "pointer" }}>
              <input type="checkbox" checked={includeMessages} onChange={(e) => setIncludeMessages(e.target.checked)} />
              Include recent messages in evidence
              {!target.recentMessages?.length ? (
                <span style={{ color: "rgba(255,255,255,0.35)", fontSize: 10 }}>(none in this surface yet)</span>
              ) : null}
            </label>

            <label style={{ display: "flex", gap: 8, alignItems: "center", fontSize: 12, marginBottom: 12, cursor: "pointer" }}>
              <input type="checkbox" checked={blockImmediate} onChange={(e) => setBlockImmediate(e.target.checked)} />
              Block immediately (hide + DM friction for you)
            </label>

            <label style={{ display: "block", fontSize: 10, fontWeight: 800, color: "rgba(255,255,255,0.45)", marginBottom: 4 }}>
              SCREENSHOT (optional)
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => onFile(e.target.files?.[0] ?? null)}
              style={{ fontSize: 11, marginBottom: 6, color: "rgba(255,255,255,0.6)" }}
            />
            {uploadNote ? (
              <div style={{ fontSize: 10, color: "rgba(0,255,255,0.7)", marginBottom: 10 }}>{uploadNote}</div>
            ) : null}

            {error ? (
              <div style={{ fontSize: 12, color: "#FF8A8A", marginBottom: 10, padding: 8, borderRadius: 8, border: "1px solid rgba(255,68,68,0.35)" }}>
                {error}
              </div>
            ) : null}

            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
              <button
                type="button"
                onClick={onClose}
                disabled={submitting}
                style={{
                  padding: "10px 14px",
                  borderRadius: 10,
                  border: "1px solid rgba(255,255,255,0.2)",
                  background: "transparent",
                  color: "rgba(255,255,255,0.6)",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={submit}
                disabled={submitting || !reasons.length}
                style={{
                  padding: "10px 18px",
                  borderRadius: 10,
                  border: "1.5px solid #FF2DAA",
                  background: submitting ? "rgba(255,45,170,0.2)" : "rgba(255,45,170,0.35)",
                  color: "#fff",
                  fontWeight: 900,
                  cursor: submitting ? "wait" : "pointer",
                }}
              >
                {submitting ? "Filing…" : "Submit Report"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>,
    document.body,
  );
}
