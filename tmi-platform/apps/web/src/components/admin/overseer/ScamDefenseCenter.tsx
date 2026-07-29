"use client";

import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import type { TrustSafetyCaseView } from "@/lib/trustSafety/types";
import { MODERATOR_AUTHORITY_LABELS } from "@/lib/trustSafety/types";

type QueueSummary = {
  open: number;
  reviewing: number;
  restricted: number;
  evidencePackages: number;
};

type CasesResponse = {
  ok?: boolean;
  summary?: QueueSummary;
  cases?: TrustSafetyCaseView[];
  error?: string;
  moderatorLevels?: Array<{ id: string; label: string }>;
};

/**
 * ScamDefenseCenter — Observatory Intelligence Deck client of TrustSafetyRuntime.
 * Mount BELOW the Live Channel Ticker only. Investigation panel is a portal overlay
 * so it never squeezes 16:9 Ops monitors.
 */
export default function ScamDefenseCenter() {
  const [summary, setSummary] = useState<QueueSummary | null>(null);
  const [cases, setCases] = useState<TrustSafetyCaseView[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<TrustSafetyCaseView | null>(null);
  const [acting, setActing] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    fetch("/api/trust-safety/cases", { credentials: "include", cache: "no-store" })
      .then(async (r) => {
        const data = (await r.json()) as CasesResponse;
        if (!r.ok) throw new Error(data.error ?? (r.status === 403 ? "Admin/staff session required" : `HTTP ${r.status}`));
        setSummary(data.summary ?? { open: 0, reviewing: 0, restricted: 0, evidencePackages: 0 });
        setCases(data.cases ?? []);
        setError(null);
      })
      .catch((e: Error) => {
        setError(e.message);
        setSummary(null);
        setCases([]);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const runAction = async (caseId: string, action: string) => {
    setActing(true);
    try {
      await fetch(`/api/trust-safety/cases/${encodeURIComponent(caseId)}/action`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      load();
      setSelected(null);
    } finally {
      setActing(false);
    }
  };

  const openCount = summary?.open ?? 0;
  const reviewing = summary?.reviewing ?? 0;
  const evidence = summary?.evidencePackages ?? 0;

  return (
    <div
      data-testid="scam-defense-center"
      data-deck="intelligence"
      style={{
        height: "100%",
        minHeight: 280,
        display: "flex",
        flexDirection: "column",
        gap: 12,
        padding: 4,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
        <div>
          <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.16em", color: "#FF4444", textTransform: "uppercase" }}>
            TrustSafetyRuntime · Client
          </div>
          <div style={{ fontSize: 14, fontWeight: 900, color: "#fff" }}>Scam Defense Center</div>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>
            Intelligence Deck only — does not own detection engines
          </div>
        </div>
        <button
          type="button"
          onClick={load}
          style={{
            fontSize: 10,
            fontWeight: 800,
            padding: "6px 10px",
            borderRadius: 8,
            border: "1px solid rgba(0,255,255,0.35)",
            background: "rgba(0,255,255,0.08)",
            color: "#00FFFF",
            cursor: "pointer",
          }}
        >
          Refresh
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
        <Stat label="Active reports" value={loading ? "…" : String(openCount)} accent="#FF2DAA" />
        <Stat label="In review" value={loading ? "…" : String(reviewing)} accent="#FFD700" />
        <Stat label="Evidence pkgs" value={loading ? "…" : String(evidence)} accent="#00FFFF" />
      </div>

      <div style={{ fontSize: 9, color: "rgba(255,255,255,0.35)", letterSpacing: "0.06em" }}>
        Moderator levels: {Object.values(MODERATOR_AUTHORITY_LABELS).join(" · ")}
      </div>

      {error ? (
        <div style={{ fontSize: 11, color: "#FF8A8A", padding: 10, borderRadius: 8, border: "1px solid rgba(255,68,68,0.3)" }}>
          {error}
        </div>
      ) : null}

      {!loading && !error && cases.length === 0 ? (
        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 10,
            border: "1px dashed rgba(255,255,255,0.15)",
            color: "rgba(255,255,255,0.4)",
            fontSize: 12,
            padding: 20,
            textAlign: "center",
          }}
        >
          No open Trust & Safety cases. Queue is empty — honest empty state.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 6, overflow: "auto", maxHeight: 360 }}>
          {cases.map((c) => (
            <button
              key={c.caseId}
              type="button"
              onClick={() => setSelected(c)}
              style={{
                textAlign: "left",
                padding: "10px 12px",
                borderRadius: 10,
                border: "1px solid rgba(255,45,170,0.25)",
                background: "rgba(255,45,170,0.06)",
                color: "#fff",
                cursor: "pointer",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                <span style={{ fontWeight: 900, color: "#FFD700", fontSize: 12 }}>{c.caseId}</span>
                <span style={{ fontSize: 9, fontWeight: 800, color: "#00FFFF", textTransform: "uppercase" }}>{c.status}</span>
              </div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.65)", marginTop: 4 }}>
                {c.reasons.join(", ") || "—"} · {c.surface}
                {c.roomId ? ` · ${c.roomId}` : ""}
              </div>
              <div style={{ fontSize: 9, color: "rgba(255,255,255,0.35)", marginTop: 4 }}>
                Evidence: {c.evidenceCount} · L{c.enforcementLevel} · {new Date(c.createdAt).toLocaleString()}
              </div>
            </button>
          ))}
        </div>
      )}

      {selected ? (
        <InvestigationPanel
          caseRow={selected}
          acting={acting}
          onClose={() => setSelected(null)}
          onAction={(action) => runAction(selected.caseId, action)}
        />
      ) : null}
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent: string }) {
  return (
    <div
      style={{
        borderRadius: 10,
        border: `1px solid ${accent}44`,
        background: `${accent}10`,
        padding: "10px 12px",
      }}
    >
      <div style={{ fontSize: 9, fontWeight: 800, color: accent, letterSpacing: "0.08em", textTransform: "uppercase" }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 900, color: "#fff", marginTop: 4 }}>{value}</div>
    </div>
  );
}

function InvestigationPanel({
  caseRow,
  acting,
  onClose,
  onAction,
}: {
  caseRow: TrustSafetyCaseView;
  acting: boolean;
  onClose: () => void;
  onAction: (action: string) => void;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Case investigation"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 10060,
        background: "rgba(0,0,0,0.6)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          width: "min(520px, 100%)",
          maxHeight: "85vh",
          overflow: "auto",
          borderRadius: 14,
          border: "2px solid rgba(255,68,68,0.45)",
          background: "linear-gradient(165deg, #1a0a12, #050510)",
          padding: 18,
          color: "#fff",
          boxShadow: "0 24px 80px rgba(0,0,0,0.7)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
          <div>
            <div style={{ fontSize: 9, fontWeight: 900, color: "#FF4444", letterSpacing: "0.14em" }}>INVESTIGATION PANEL</div>
            <div style={{ fontSize: 18, fontWeight: 900, color: "#FFD700" }}>{caseRow.caseId}</div>
          </div>
          <button type="button" onClick={onClose} style={{ background: "transparent", border: "none", color: "rgba(255,255,255,0.5)", fontSize: 20, cursor: "pointer" }}>
            ×
          </button>
        </div>

        <dl style={{ fontSize: 12, lineHeight: 1.6, margin: 0 }}>
          <Row k="Status" v={caseRow.status} />
          <Row k="Reasons" v={caseRow.reasons.join(", ")} />
          <Row k="Surface" v={`${caseRow.surface}${caseRow.roomId ? ` / ${caseRow.roomId}` : ""}`} />
          <Row k="Reporter" v={caseRow.reporterId} />
          <Row k="Accused" v={caseRow.accusedId ?? "—"} />
          <Row k="Evidence" v={`${caseRow.evidenceCount} package(s)`} />
          <Row k="Hash" v={caseRow.contentHash?.slice(0, 16) ?? "—"} />
          <Row k="Detail" v={caseRow.detail ?? "—"} />
          <Row k="Outcome" v={caseRow.outcome ?? "—"} />
        </dl>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 16 }}>
          {(
            [
              ["start_review", "Start review"],
              ["hide_content", "Hide content"],
              ["block_dms", "Block DMs"],
              ["restrict_rejoin", "Restrict rejoin"],
              ["remove_from_room", "Remove + block rejoin"],
              ["resolve", "Resolve"],
              ["escalate", "Escalate"],
              ["close", "Close"],
            ] as const
          ).map(([action, label]) => (
            <button
              key={action}
              type="button"
              disabled={acting}
              onClick={() => onAction(action)}
              style={{
                padding: "8px 12px",
                borderRadius: 8,
                border: "1px solid rgba(255,215,0,0.35)",
                background: "rgba(255,215,0,0.1)",
                color: "#FFD700",
                fontSize: 10,
                fontWeight: 800,
                cursor: acting ? "wait" : "pointer",
              }}
            >
              {label}
            </button>
          ))}
        </div>
        <p style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", marginTop: 12 }}>
          Permanent ban remains human-only via /admin/moderation (ModerationEngine). Overlay portal — Ops 16:9 monitors untouched.
        </p>
      </div>
    </div>,
    document.body,
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "110px 1fr", gap: 8, marginBottom: 4 }}>
      <dt style={{ color: "rgba(255,255,255,0.4)", fontWeight: 700 }}>{k}</dt>
      <dd style={{ margin: 0, wordBreak: "break-word" }}>{v}</dd>
    </div>
  );
}
