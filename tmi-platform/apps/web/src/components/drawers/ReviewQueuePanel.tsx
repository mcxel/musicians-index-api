"use client";

/**
 * ReviewQueuePanel — Beat Locker reviewer queue.
 *
 * Shows beats awaiting review (CERTIFIED or IN_REVIEW status) as cards.
 * Reviewer can play audio preview, view metadata, and submit a decision
 * (APPROVE / APPROVE_WITH_TAGS / NEEDS_REVISION / HOLD / REJECT) with a reason.
 *
 * Auth: only visible to beat_creator / admin role accounts.
 * Rule 20: no fake queue counts. Displays real DB state via /api/beats/queue.
 * Rule 19: Beat Ecosystem separation — this is review/ops, not the marketplace.
 */

import { useCallback, useEffect, useState } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

type BeatQueueItem = {
  id: string;
  canonicalId: string | null;
  title: string;
  producerId: string;
  producerName: string | null;
  status: string;
  genre: string;
  genreJson: string;
  bpm: number;
  key: string | null;
  audioAssetUrl: string | null;
  durationSeconds: number | null;
  eligiblePoolsJson: string;
  competitionEligible: boolean;
  licenseType: string;
  submittedAt: string | null;
  certifiedAt: string | null;
  royaltySplits: Array<{ recipientName: string; percentage: number; role: string }>;
  certificationResults: Array<{
    passed: boolean;
    loudnessMeasuredLufs: number | null;
    failureReasonsJson: string;
    createdAt: string;
  }>;
  reviewRecords: Array<{
    reviewerId: string;
    decision: string;
    reason: string;
    createdAt: string;
  }>;
};

type Decision = "APPROVE" | "APPROVE_WITH_TAGS" | "NEEDS_REVISION" | "HOLD" | "REJECT";

interface ReviewQueuePanelProps {
  currentUserId?: string;
  accentColor?: string;
}

// ─── Decision config ──────────────────────────────────────────────────────────

const DECISIONS: Array<{ value: Decision; label: string; color: string; hint: string }> = [
  { value: "APPROVE",           label: "APPROVE",       color: "#00FF88", hint: "Beat is good to go → APPROVED" },
  { value: "APPROVE_WITH_TAGS", label: "APPROVE + TAG", color: "#00FFCC", hint: "Approved with editorial tags → APPROVED" },
  { value: "NEEDS_REVISION",    label: "REVISE",         color: "#FFD700", hint: "Return to creator for changes → NEEDS_REVISION" },
  { value: "HOLD",              label: "HOLD",           color: "#FF9933", hint: "Keep in queue for discussion → IN_REVIEW" },
  { value: "REJECT",            label: "REJECT",         color: "#FF4444", hint: "Remove from circulation → ARCHIVED" },
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function ReviewQueuePanel({
  currentUserId,
  accentColor = "#FF6B1A",
}: ReviewQueuePanelProps) {
  const [beats, setBeats] = useState<BeatQueueItem[]>([]);
  const [total, setTotal] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [decision, setDecision] = useState<Decision | null>(null);
  const [reason, setReason] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState("ALL");

  const ac = accentColor;

  const fetchQueue = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const qs = statusFilter !== "ALL" ? `?status=${statusFilter}` : "";
      const res = await fetch(`/api/beats/queue${qs}`);
      if (!res.ok) throw new Error("Failed to load queue");
      const data = await res.json();
      setBeats(data.beats ?? []);
      setTotal(data.total ?? 0);
      setPendingCount(data.pendingCount ?? 0);
    } catch (e) {
      setLoadError(e instanceof Error ? e.message : "Unable to load review queue.");
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => { fetchQueue(); }, [fetchQueue]);

  const submitDecision = useCallback(async (canonicalId: string) => {
    if (!decision || !reason.trim()) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const tags = tagsInput.trim()
        ? tagsInput.split(",").map((t) => t.trim()).filter(Boolean)
        : [];
      const res = await fetch(`/api/beats/canonical/${canonicalId}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ decision, reason: reason.trim(), tagsJson: JSON.stringify(tags) }),
      });
      const json = await res.json();
      if (!res.ok) {
        setSubmitError(json.details ?? json.error ?? "Decision failed. Please retry.");
        return;
      }
      // Remove beat from queue and refresh
      setBeats((prev) => prev.filter((b) => b.canonicalId !== canonicalId));
      setTotal((n) => Math.max(0, n - 1));
      setActiveId(null);
      setDecision(null);
      setReason("");
      setTagsInput("");
    } catch {
      setSubmitError("Network error. Check connection and retry.");
    } finally {
      setSubmitting(false);
    }
  }, [decision, reason, tagsInput]);

  // ── Styles ──────────────────────────────────────────────────────────────────

  const s = {
    root: { display: "flex", flexDirection: "column" as const, background: "#0a0614", minHeight: "100%", color: "#fff" },
    header: { padding: "14px 20px 10px", borderBottom: "1px solid rgba(255,107,26,0.18)" },
    title: { fontSize: 11, fontWeight: 900, letterSpacing: "0.14em", color: ac, margin: 0 },
    badge: (n: number) => ({
      display: "inline-block",
      background: n > 0 ? ac : "rgba(255,255,255,0.1)",
      color: n > 0 ? "#000" : "rgba(255,255,255,0.4)",
      fontSize: 9,
      fontWeight: 900,
      padding: "2px 7px",
      borderRadius: 10,
      marginLeft: 8,
    }),
    filterRow: {
      display: "flex", gap: 6, padding: "10px 20px",
      borderBottom: "1px solid rgba(255,255,255,0.06)",
    },
    filterBtn: (active: boolean) => ({
      fontSize: 9, fontWeight: 800, letterSpacing: "0.08em",
      padding: "4px 10px", borderRadius: 4, cursor: "pointer",
      border: `1px solid ${active ? ac : "rgba(255,255,255,0.12)"}`,
      background: active ? `${ac}20` : "transparent",
      color: active ? ac : "rgba(255,255,255,0.4)",
    }),
    list: { flex: 1, overflowY: "auto" as const, padding: "8px 0" },
    card: (expanded: boolean) => ({
      borderBottom: "1px solid rgba(255,255,255,0.06)",
      background: expanded ? "rgba(255,107,26,0.05)" : "transparent",
    }),
    cardHeader: { padding: "10px 20px", cursor: "pointer", display: "flex", alignItems: "center", gap: 10 },
    statusPill: (st: string) => ({
      fontSize: 8, fontWeight: 900, letterSpacing: "0.1em",
      padding: "2px 7px", borderRadius: 10,
      background: st === "CERTIFIED" ? "rgba(0,255,136,0.15)" : "rgba(255,153,51,0.15)",
      color: st === "CERTIFIED" ? "#00FF88" : "#FF9933",
    }),
    cardBody: { padding: "0 20px 16px" },
    metaGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px 16px", marginBottom: 12 },
    metaLabel: { fontSize: 9, fontWeight: 900, letterSpacing: "0.1em", color: "rgba(255,255,255,0.35)" },
    metaValue: { fontSize: 11, color: "rgba(255,255,255,0.8)", marginTop: 2 },
    input: { width: "100%", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 6, padding: "7px 10px", color: "#fff", fontSize: 12, outline: "none", boxSizing: "border-box" as const },
    decisionRow: { display: "flex", flexWrap: "wrap" as const, gap: 6, marginBottom: 10 },
    decBtn: (selected: boolean, color: string) => ({
      fontSize: 9, fontWeight: 900, letterSpacing: "0.08em",
      padding: "5px 12px", borderRadius: 4, cursor: "pointer",
      border: `1px solid ${selected ? color : "rgba(255,255,255,0.12)"}`,
      background: selected ? `${color}25` : "transparent",
      color: selected ? color : "rgba(255,255,255,0.4)",
    }),
    submitBtn: (disabled: boolean) => ({
      padding: "8px 18px", borderRadius: 6, border: "none", cursor: disabled ? "not-allowed" : "pointer",
      fontSize: 10, fontWeight: 900, letterSpacing: "0.08em",
      background: disabled ? "rgba(255,107,26,0.3)" : ac,
      color: disabled ? "rgba(255,255,255,0.4)" : "#000",
    }),
  };

  const activeBeats = activeId ? beats.filter((b) => b.id === activeId) : [];
  const canDecide = (beat: BeatQueueItem) => beat.producerId !== currentUserId;

  return (
    <div style={s.root}>
      <div style={s.header}>
        <p style={s.title}>
          REVIEW QUEUE
          <span style={s.badge(pendingCount)}>{pendingCount} CERTIFIED</span>
          <span style={s.badge(total)}>
            {total} TOTAL
          </span>
        </p>
      </div>

      {/* Filter bar */}
      <div style={s.filterRow}>
        {["ALL", "CERTIFIED", "IN_REVIEW", "NEEDS_REVISION"].map((f) => (
          <button key={f} style={s.filterBtn(statusFilter === f)} onClick={() => { setStatusFilter(f); setActiveId(null); }}>
            {f.replace("_", " ")}
          </button>
        ))}
        <button style={{ ...s.filterBtn(false), marginLeft: "auto" }} onClick={fetchQueue}>↺ REFRESH</button>
      </div>

      <div style={s.list}>
        {loading && (
          <div style={{ padding: "24px 20px", fontSize: 11, color: "rgba(255,255,255,0.35)", textAlign: "center" }}>
            Loading review queue…
          </div>
        )}
        {loadError && (
          <div style={{ padding: "16px 20px", fontSize: 11, color: "#FF8888" }}>{loadError}</div>
        )}
        {!loading && !loadError && beats.length === 0 && (
          <div style={{ padding: "24px 20px", fontSize: 11, color: "rgba(255,255,255,0.35)", textAlign: "center" }}>
            No beats in queue. Queue is clear.
          </div>
        )}

        {beats.map((beat) => {
          const isOpen = activeId === beat.id;
          const certResult = beat.certificationResults[0];
          const failures = certResult ? JSON.parse(certResult.failureReasonsJson || "[]") : [];
          const pools = JSON.parse(beat.eligiblePoolsJson || "[]") as string[];
          const isSelfSubmit = beat.producerId === currentUserId;

          return (
            <div key={beat.id} style={s.card(isOpen)}>
              <div style={s.cardHeader} onClick={() => setActiveId(isOpen ? null : beat.id)}>
                <span style={s.statusPill(beat.status)}>{beat.status}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 800, color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {beat.title}
                  </div>
                  <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>
                    {beat.producerName ?? beat.producerId} · {beat.canonicalId ?? "—"}
                  </div>
                </div>
                {certResult && (
                  <span style={{ fontSize: 9, fontWeight: 900, color: certResult.passed ? "#00FF88" : "#FF4444" }}>
                    {certResult.passed ? "CERT ✓" : "CERT ✗"}
                  </span>
                )}
                <span style={{ fontSize: 10, color: "rgba(255,255,255,0.3)" }}>{isOpen ? "▲" : "▼"}</span>
              </div>

              {isOpen && (
                <div style={s.cardBody}>
                  {/* Metadata grid */}
                  <div style={s.metaGrid}>
                    <div>
                      <div style={s.metaLabel}>GENRE</div>
                      <div style={s.metaValue}>{beat.genre}</div>
                    </div>
                    <div>
                      <div style={s.metaLabel}>BPM · KEY</div>
                      <div style={s.metaValue}>{beat.bpm} · {beat.key ?? "—"}</div>
                    </div>
                    <div>
                      <div style={s.metaLabel}>LICENSE</div>
                      <div style={s.metaValue}>{beat.licenseType}</div>
                    </div>
                    <div>
                      <div style={s.metaLabel}>COMP. ELIGIBLE</div>
                      <div style={s.metaValue}>{beat.competitionEligible ? "Yes" : "No"}</div>
                    </div>
                  </div>

                  {/* Placement pools */}
                  {pools.length > 0 && (
                    <div style={{ marginBottom: 10 }}>
                      <div style={s.metaLabel}>PLACEMENT POOLS</div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 4 }}>
                        {pools.map((p) => (
                          <span key={p} style={{ fontSize: 9, padding: "2px 8px", borderRadius: 10, background: "rgba(255,107,26,0.15)", color: "#FF9933" }}>
                            {p.replace(/_/g, " ")}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Royalty splits */}
                  {beat.royaltySplits.length > 0 && (
                    <div style={{ marginBottom: 10 }}>
                      <div style={s.metaLabel}>ROYALTY SPLITS</div>
                      {beat.royaltySplits.map((sp, i) => (
                        <div key={i} style={{ fontSize: 10, color: "rgba(255,255,255,0.6)", marginTop: 3 }}>
                          {sp.recipientName} — {sp.percentage}% ({sp.role})
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Cert failures */}
                  {failures.length > 0 && (
                    <div style={{ marginBottom: 10, background: "rgba(255,68,68,0.08)", border: "1px solid rgba(255,68,68,0.2)", borderRadius: 6, padding: "8px 10px" }}>
                      <div style={{ ...s.metaLabel, color: "#FF8888", marginBottom: 4 }}>CERTIFICATION ISSUES</div>
                      {failures.map((f: string, i: number) => (
                        <div key={i} style={{ fontSize: 10, color: "#FF8888" }}>• {f}</div>
                      ))}
                    </div>
                  )}

                  {/* Audio preview */}
                  {beat.audioAssetUrl && (
                    <div style={{ marginBottom: 12 }}>
                      <div style={s.metaLabel}>AUDIO PREVIEW</div>
                      {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
                      <audio
                        controls
                        src={beat.audioAssetUrl}
                        style={{ width: "100%", marginTop: 6, height: 32, borderRadius: 4 }}
                      />
                    </div>
                  )}

                  {/* Self-submit warning */}
                  {isSelfSubmit && (
                    <div style={{ background: "rgba(255,215,0,0.08)", border: "1px solid rgba(255,215,0,0.2)", borderRadius: 6, padding: "8px 10px", marginBottom: 10, fontSize: 10, color: "#FFD700" }}>
                      This is your own submission. Self-approval is not permitted. Assign another reviewer.
                    </div>
                  )}

                  {/* Decision panel */}
                  {!isSelfSubmit && canDecide(beat) && (
                    <>
                      <div style={s.metaLabel}>DECISION</div>
                      <div style={s.decisionRow}>
                        {DECISIONS.map((d) => (
                          <button
                            key={d.value}
                            style={s.decBtn(decision === d.value, d.color)}
                            onClick={() => setDecision(d.value)}
                            title={d.hint}
                          >
                            {d.label}
                          </button>
                        ))}
                      </div>

                      {decision === "APPROVE_WITH_TAGS" && (
                        <div style={{ marginBottom: 8 }}>
                          <div style={s.metaLabel}>TAGS (comma-separated)</div>
                          <input
                            style={s.input}
                            value={tagsInput}
                            onChange={(e) => setTagsInput(e.target.value)}
                            placeholder="e.g. bounce, trap, vocal-ready"
                          />
                        </div>
                      )}

                      <div style={{ marginBottom: 10 }}>
                        <div style={s.metaLabel}>REASON (required, auditable)</div>
                        <textarea
                          style={{ ...s.input, minHeight: 60, resize: "vertical" }}
                          value={reason}
                          onChange={(e) => setReason(e.target.value)}
                          placeholder="Explain your decision..."
                        />
                      </div>

                      {submitError && (
                        <div style={{ fontSize: 10, color: "#FF8888", marginBottom: 8 }}>{submitError}</div>
                      )}

                      <button
                        style={s.submitBtn(!decision || !reason.trim() || submitting)}
                        disabled={!decision || !reason.trim() || submitting}
                        onClick={() => beat.canonicalId && submitDecision(beat.canonicalId)}
                      >
                        {submitting ? "RECORDING…" : "RECORD DECISION →"}
                      </button>
                    </>
                  )}

                  {/* Previous review history */}
                  {beat.reviewRecords.length > 0 && (
                    <div style={{ marginTop: 12, borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 10 }}>
                      <div style={s.metaLabel}>REVIEW HISTORY</div>
                      {beat.reviewRecords.map((r, i) => (
                        <div key={i} style={{ fontSize: 10, color: "rgba(255,255,255,0.5)", marginTop: 4 }}>
                          <span style={{ color: "#FFD700" }}>{r.decision}</span>
                          {" — "}{r.reason}
                          <span style={{ color: "rgba(255,255,255,0.3)" }}>{" · "}{new Date(r.createdAt).toLocaleDateString()}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
