"use client";

/**
 * ModerationCaseDesk — Overseer REPORTS queue + Case Desk foundation.
 * Wires ModerationEngine (/api/admin/moderation) + TrustSafetyRuntime (/api/trust-safety/cases).
 * Dispositions: ALLOW · WARNING · HOLD · REMOVE · ESCALATE · LEGAL HOLD (retention).
 * EXPORT = OFF. Hybrid automation; reports ≠ proof; high-impact needs human.
 * Mount on Intelligence Deck only (below Live Channel Ticker) — do not resize Ops monitors.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import {
  formatAppendNote,
  getDispositionCommand,
  listDispositionCommands,
  POLICY_TAG_CATALOG,
  type CaseDisposition,
} from "@/lib/moderation/CaseDispositionEngine";
import { evaluateMessagingSafety } from "@/lib/moderation/MessagingSafetyScaffold";

type ReportRow = {
  id: string;
  reporterId: string;
  targetType: string;
  targetId: string;
  category: string;
  detail: string | null;
  status: string;
  severity: string;
  createdAt: string;
};

type TrustCase = {
  caseId: string;
  reporterId: string;
  accusedId: string | null;
  reasons: string[];
  surface: string;
  roomId: string | null;
  status: string;
  enforcementLevel: number;
  outcome: string | null;
  detail: string | null;
  evidenceCount: number;
  createdAt: string;
};

type QueueItem =
  | { kind: "report"; report: ReportRow; caseId: string }
  | { kind: "trust"; trust: TrustCase; caseId: string };

const SEV: Record<string, string> = {
  p1: "#FF4444",
  p2: "#FF9500",
  p3: "#FFD700",
  p4: "rgba(255,255,255,0.45)",
};

function reportCaseId(reportId: string): string {
  return `RPT-${reportId.slice(0, 8).toUpperCase()}`;
}

export default function ModerationCaseDesk() {
  const [items, setItems] = useState<QueueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<QueueItem | null>(null);
  const [acting, setActing] = useState(false);
  const [noteDraft, setNoteDraft] = useState("");
  const [policyTags, setPolicyTags] = useState<string[]>([]);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const forbiddenRef = useRef(false);

  const load = useCallback((opts?: { force?: boolean }) => {
    if (forbiddenRef.current && !opts?.force) return;
    setLoading(true);
    Promise.all([
      fetch("/api/admin/moderation", { credentials: "include", cache: "no-store" }),
      fetch("/api/trust-safety/cases", { credentials: "include", cache: "no-store" }),
    ])
      .then(async ([modRes, tsRes]) => {
        if (modRes.status === 403 || tsRes.status === 403) {
          forbiddenRef.current = true;
          setError("Admin/staff session required for Moderation Case Desk.");
          setItems([]);
          return;
        }
        const mod = modRes.ok
          ? ((await modRes.json()) as { pendingReports?: ReportRow[] })
          : { pendingReports: [] };
        const ts = tsRes.ok
          ? ((await tsRes.json()) as { cases?: TrustCase[]; error?: string })
          : { cases: [] };
        if (!modRes.ok && !tsRes.ok) {
          throw new Error(ts.error ?? `HTTP ${modRes.status}/${tsRes.status}`);
        }
        forbiddenRef.current = false;
        const reports = (mod.pendingReports ?? []).map(
          (r): QueueItem => ({ kind: "report", report: r, caseId: reportCaseId(r.id) }),
        );
        const trusts = (ts.cases ?? []).map(
          (c): QueueItem => ({ kind: "trust", trust: c, caseId: c.caseId }),
        );
        setItems([...trusts, ...reports]);
        setError(null);
      })
      .catch((e: Error) => {
        setError(e.message);
        setItems([]);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const toggleTag = (tag: string) => {
    setPolicyTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));
  };

  const runDisposition = async (disposition: CaseDisposition) => {
    if (!selected) return;
    const cmd = getDispositionCommand(disposition);
    if (!cmd.enabled) {
      setStatusMsg(`OFF — ${cmd.disabledReason}`);
      return;
    }
    setActing(true);
    setStatusMsg(null);
    const noteLine = formatAppendNote({
      actor: "case-desk",
      disposition,
      policyTags,
      body: noteDraft || cmd.noteTemplate,
    });

    try {
      if (disposition === "LEGAL_HOLD") {
        if (selected.kind === "trust") {
          await fetch(`/api/trust-safety/cases/${encodeURIComponent(selected.caseId)}/action`, {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "start_review", note: noteLine }),
          });
        }
        setStatusMsg("LEGAL HOLD recorded (retention only). No punitive action.");
        setNoteDraft("");
        load({ force: true });
        return;
      }

      if (selected.kind === "trust" && cmd.trustAction) {
        const res = await fetch(`/api/trust-safety/cases/${encodeURIComponent(selected.caseId)}/action`, {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: cmd.trustAction, note: noteLine }),
        });
        if (!res.ok) {
          const d = (await res.json().catch(() => ({}))) as { error?: string };
          throw new Error(d.error ?? `HTTP ${res.status}`);
        }
      }

      if (selected.kind === "report" && cmd.moderationAction) {
        const r = selected.report;
        if (r.targetType !== "user") {
          setStatusMsg(
            `REMOVE/HOLD on non-user target — content path only. Target type: ${r.targetType}. Mark reviewed via escalate note.`,
          );
        } else {
          const res = await fetch("/api/admin/moderation", {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              targetUserId: r.targetId,
              actionType: cmd.moderationAction,
              reason: noteLine,
              reportId: r.id,
            }),
          });
          if (!res.ok) {
            const d = (await res.json().catch(() => ({}))) as { error?: string };
            throw new Error(d.error ?? `HTTP ${res.status}`);
          }
        }
      }

      if (disposition === "ESCALATE" && selected.kind === "report" && !cmd.moderationAction) {
        setStatusMsg(
          "ESCALATE — open /admin/moderation for suspend/ban. Permanent ban is human-only.",
        );
      } else {
        setStatusMsg(`${disposition} applied · ${selected.caseId}`);
      }
      setNoteDraft("");
      setSelected(null);
      load({ force: true });
    } catch (e) {
      setStatusMsg(e instanceof Error ? e.message : "Disposition failed");
    } finally {
      setActing(false);
    }
  };

  const selectedDetail =
    selected?.kind === "report"
      ? selected.report.detail
      : selected?.kind === "trust"
        ? selected.trust.detail
        : null;
  const messagingProbe = selectedDetail ? evaluateMessagingSafety(selectedDetail) : null;

  return (
    <div
      data-testid="moderation-case-desk"
      data-deck="intelligence"
      style={{
        height: "100%",
        minHeight: 320,
        display: "flex",
        flexDirection: "column",
        gap: 10,
        padding: 4,
        color: "#fff",
        fontFamily: "inherit",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
        <div>
          <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.16em", color: "#FF9500", textTransform: "uppercase" }}>
            ModerationEngine · TrustSafetyRuntime
          </div>
          <div style={{ fontSize: 14, fontWeight: 900 }}>Moderation Case Desk</div>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>
            REPORTS → caseId · hybrid automation · reports ≠ proof
          </div>
        </div>
        <button
          type="button"
          onClick={() => load({ force: true })}
          style={{
            fontSize: 10,
            fontWeight: 800,
            padding: "6px 10px",
            borderRadius: 8,
            border: "1px solid rgba(255,149,0,0.4)",
            background: "rgba(255,149,0,0.1)",
            color: "#FF9500",
            cursor: "pointer",
          }}
        >
          Refresh
        </button>
      </div>

      {error ? (
        <div style={{ fontSize: 11, color: "#FF8A8A", padding: 10, borderRadius: 8, border: "1px solid rgba(255,68,68,0.3)" }}>
          {error}
        </div>
      ) : null}
      {statusMsg ? (
        <div style={{ fontSize: 11, color: "#FFD700", padding: "6px 10px", borderRadius: 8, background: "rgba(255,215,0,0.08)" }}>
          {statusMsg}
        </div>
      ) : null}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.1fr", gap: 10, minHeight: 0, flex: 1 }}>
        {/* REPORTS queue */}
        <div
          style={{
            borderRadius: 10,
            border: "1px solid rgba(255,255,255,0.1)",
            background: "rgba(0,0,0,0.25)",
            display: "flex",
            flexDirection: "column",
            minHeight: 200,
            overflow: "hidden",
          }}
        >
          <div style={{ padding: "8px 10px", fontSize: 9, fontWeight: 900, letterSpacing: "0.12em", color: "#00FFFF", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
            REPORTS QUEUE · {loading ? "…" : items.length}
          </div>
          <div style={{ overflow: "auto", flex: 1, maxHeight: 360 }}>
            {!loading && items.length === 0 ? (
              <div style={{ padding: 20, textAlign: "center", color: "rgba(255,255,255,0.35)", fontSize: 12 }}>
                No pending reports or open cases.
              </div>
            ) : null}
            {items.map((item) => (
              <button
                key={`${item.kind}-${item.caseId}`}
                type="button"
                onClick={() => {
                  setSelected(item);
                  setPolicyTags(
                    item.kind === "trust"
                      ? item.trust.reasons.map((r) => `policy:${r}`)
                      : [`policy:${item.report.category}`],
                  );
                  setNoteDraft("");
                  setStatusMsg(null);
                }}
                style={{
                  display: "block",
                  width: "100%",
                  textAlign: "left",
                  padding: "10px 12px",
                  border: "none",
                  borderBottom: "1px solid rgba(255,255,255,0.06)",
                  background:
                    selected?.caseId === item.caseId ? "rgba(255,149,0,0.12)" : "transparent",
                  color: "#fff",
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                  <span style={{ fontWeight: 900, fontSize: 11, color: "#FFD700" }}>{item.caseId}</span>
                  <span style={{ fontSize: 8, fontWeight: 800, color: item.kind === "trust" ? "#00FFFF" : "#FF2DAA" }}>
                    {item.kind === "trust" ? "TRUST" : "REPORT"}
                  </span>
                </div>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.55)", marginTop: 4 }}>
                  {item.kind === "trust"
                    ? `${item.trust.reasons.join(", ") || "—"} · ${item.trust.surface}`
                    : `${item.report.category} · ${item.report.targetType}`}
                </div>
                {item.kind === "report" ? (
                  <div style={{ fontSize: 9, color: SEV[item.report.severity] ?? "#fff", marginTop: 2 }}>
                    {item.report.severity.toUpperCase()}
                  </div>
                ) : (
                  <div style={{ fontSize: 9, color: "rgba(255,255,255,0.35)", marginTop: 2 }}>
                    L{item.trust.enforcementLevel} · {item.trust.status}
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Case desk */}
        <div
          style={{
            borderRadius: 10,
            border: "1px solid rgba(255,149,0,0.25)",
            background: "linear-gradient(160deg, rgba(24,12,8,0.9), rgba(8,4,12,0.95))",
            padding: 12,
            display: "flex",
            flexDirection: "column",
            gap: 8,
            minHeight: 200,
          }}
        >
          <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.12em", color: "#FF9500" }}>CASE DESK</div>
          {!selected ? (
            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(255,255,255,0.35)", fontSize: 12 }}>
              Select a report / case
            </div>
          ) : (
            <>
              <div style={{ fontSize: 16, fontWeight: 900, color: "#FFD700" }}>{selected.caseId}</div>
              {selected.kind === "report" ? (
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.65)", lineHeight: 1.45 }}>
                  Report {selected.report.id.slice(0, 10)}… → caseId {selected.caseId}
                  <br />
                  Target: {selected.report.targetType}/{selected.report.targetId}
                  <br />
                  {selected.report.detail ?? "No detail"}
                </div>
              ) : (
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.65)", lineHeight: 1.45 }}>
                  Trust case · {selected.trust.status} · evidence {selected.trust.evidenceCount}
                  <br />
                  Accused: {selected.trust.accusedId ?? "—"}
                  <br />
                  Outcome (append-only):
                  <pre style={{ whiteSpace: "pre-wrap", fontSize: 10, color: "rgba(255,255,255,0.45)", margin: "4px 0 0" }}>
                    {selected.trust.outcome ?? "—"}
                  </pre>
                </div>
              )}

              {messagingProbe ? (
                <div style={{ fontSize: 10, color: messagingProbe.flags.length ? "#FF8A8A" : "rgba(255,255,255,0.4)" }}>
                  Messaging safety: {messagingProbe.note}
                </div>
              ) : null}

              <div style={{ fontSize: 8, fontWeight: 800, letterSpacing: "0.1em", color: "rgba(255,255,255,0.4)" }}>
                POLICY TAGS
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                {POLICY_TAG_CATALOG.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    style={{
                      fontSize: 8,
                      fontWeight: 800,
                      padding: "3px 7px",
                      borderRadius: 6,
                      border: `1px solid ${policyTags.includes(tag) ? "#00FFFF" : "rgba(255,255,255,0.15)"}`,
                      background: policyTags.includes(tag) ? "rgba(0,255,255,0.12)" : "transparent",
                      color: policyTags.includes(tag) ? "#00FFFF" : "rgba(255,255,255,0.45)",
                      cursor: "pointer",
                      fontFamily: "inherit",
                    }}
                  >
                    {tag.replace("policy:", "")}
                  </button>
                ))}
              </div>

              <textarea
                value={noteDraft}
                onChange={(e) => setNoteDraft(e.target.value)}
                placeholder="Append-only note…"
                rows={2}
                style={{
                  width: "100%",
                  boxSizing: "border-box",
                  borderRadius: 8,
                  border: "1px solid rgba(255,255,255,0.15)",
                  background: "rgba(0,0,0,0.35)",
                  color: "#fff",
                  fontSize: 11,
                  padding: 8,
                  resize: "vertical",
                  fontFamily: "inherit",
                }}
              />

              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {listDispositionCommands().map((cmd) => (
                  <button
                    key={cmd.disposition}
                    type="button"
                    disabled={acting || (!cmd.enabled && cmd.disposition !== "EXPORT")}
                    title={!cmd.enabled ? cmd.disabledReason : undefined}
                    onClick={() => void runDisposition(cmd.disposition)}
                    style={{
                      padding: "7px 10px",
                      borderRadius: 8,
                      border: `1px solid ${cmd.enabled ? "rgba(255,215,0,0.4)" : "rgba(255,255,255,0.12)"}`,
                      background: cmd.enabled ? "rgba(255,215,0,0.1)" : "rgba(255,255,255,0.04)",
                      color: cmd.enabled ? "#FFD700" : "rgba(255,255,255,0.3)",
                      fontSize: 9,
                      fontWeight: 900,
                      letterSpacing: "0.06em",
                      cursor: !cmd.enabled || acting ? "not-allowed" : "pointer",
                      fontFamily: "inherit",
                      opacity: acting ? 0.6 : 1,
                    }}
                  >
                    {cmd.disposition}
                    {!cmd.enabled ? " · OFF" : ""}
                  </button>
                ))}
              </div>
              <div style={{ fontSize: 9, color: "rgba(255,255,255,0.35)", lineHeight: 1.4 }}>
                LEGAL HOLD = retention only · EXPORT OFF · ban remains human-only via ModerationEngine
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
