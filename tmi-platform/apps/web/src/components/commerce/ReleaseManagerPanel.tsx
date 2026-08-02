"use client";

/**
 * ReleaseManagerPanel — Commerce Center Release Manager.
 * Filters: Draft / Scheduled / Publishing / Live / Featured / Archived
 * Launch Wizard checklist + per-step status from last workflow run.
 */

import { useCallback, useEffect, useMemo, useState, type CSSProperties } from "react";
import {
  archiveReleaseDraft,
  createReleaseDraft,
  filterReleasesByStatus,
  listReleaseDrafts,
  upsertReleaseDraft,
  type LaunchWizardItemId,
  type ReleaseDraft,
  type ReleaseLifecycleStatus,
} from "@/lib/livingOs/releaseDraftStore";
import { runReleaseNewWork } from "@/lib/livingOs/releaseNewWorkOrchestrator";
import {
  getWorkflowRun,
  type WorkflowRunRecord,
  type WorkflowStepResult,
} from "@/lib/livingOs/workflowRunStore";

export interface ReleaseManagerPanelProps {
  performerId: string;
  accentColor?: string;
}

const FILTERS: Array<ReleaseLifecycleStatus | "All"> = [
  "All",
  "Draft",
  "Scheduled",
  "Publishing",
  "Live",
  "Featured",
  "Archived",
];

export default function ReleaseManagerPanel({
  performerId,
  accentColor = "#FFD700",
}: ReleaseManagerPanelProps) {
  const ac = accentColor;
  const [filter, setFilter] = useState<ReleaseLifecycleStatus | "All">("All");
  const [drafts, setDrafts] = useState<ReleaseDraft[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [lastRun, setLastRun] = useState<WorkflowRunRecord | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(() => {
    const list = listReleaseDrafts(performerId);
    setDrafts(list);
    if (selectedId) {
      const still = list.find((d) => d.releaseId === selectedId);
      if (!still) setSelectedId(list[0]?.releaseId ?? null);
      else if (still.lastRunId) setLastRun(getWorkflowRun(still.lastRunId));
    } else if (list[0]) {
      setSelectedId(list[0].releaseId);
      if (list[0].lastRunId) setLastRun(getWorkflowRun(list[0].lastRunId));
    }
  }, [performerId, selectedId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const filtered = useMemo(
    () => filterReleasesByStatus(drafts, filter),
    [drafts, filter],
  );

  const selected = drafts.find((d) => d.releaseId === selectedId) ?? null;

  const select = (id: string) => {
    setSelectedId(id);
    setError(null);
    const d = drafts.find((x) => x.releaseId === id);
    setLastRun(d?.lastRunId ? getWorkflowRun(d.lastRunId) : null);
  };

  const patchSelected = (patch: Partial<ReleaseDraft>) => {
    if (!selected) return;
    const next = upsertReleaseDraft({ ...selected, ...patch });
    setDrafts(listReleaseDrafts(performerId));
    setSelectedId(next.releaseId);
  };

  const toggleWizard = (id: LaunchWizardItemId, field: "optedIn" | "checked") => {
    if (!selected) return;
    patchSelected({
      wizard: selected.wizard.map((w) =>
        w.id === id ? { ...w, [field]: !w[field] } : w,
      ),
    });
  };

  const onCreate = () => {
    const d = createReleaseDraft(performerId, { title: "New Release" });
    setDrafts(listReleaseDrafts(performerId));
    setSelectedId(d.releaseId);
    setLastRun(null);
    setError(null);
  };

  const onLaunch = async () => {
    if (!selected) return;
    setBusy(true);
    setError(null);
    try {
      // Persist current form fields before run
      upsertReleaseDraft(selected);
      const run = await runReleaseNewWork({
        performerId,
        releaseId: selected.releaseId,
      });
      setLastRun(run);
      setDrafts(listReleaseDrafts(performerId));
      if (run.status === "Failed") {
        setError(run.errorSummary ?? "Workflow finished with failures.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 8, alignItems: "flex-start" }}>
        <div>
          <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.14em", color: ac }}>
            RELEASE MANAGER
          </div>
          <p style={{ margin: "4px 0 0", fontSize: 11, color: "rgba(255,255,255,0.4)", lineHeight: 1.4 }}>
            Launch Wizard → RELEASE_NEW_WORK automation. Drafts persist locally until a DB path exists.
          </p>
        </div>
        <button type="button" onClick={onCreate} style={ctaBtn(ac)}>
          + New draft
        </button>
      </div>

      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {FILTERS.map((f) => {
          const active = filter === f;
          return (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              style={{
                fontSize: 8,
                fontWeight: 900,
                letterSpacing: "0.06em",
                padding: "5px 9px",
                borderRadius: 6,
                cursor: "pointer",
                fontFamily: "inherit",
                border: active ? `1px solid ${ac}` : "1px solid rgba(255,255,255,0.12)",
                background: active ? `${ac}22` : "transparent",
                color: active ? ac : "rgba(255,255,255,0.45)",
              }}
            >
              {f.toUpperCase()}
            </button>
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <div
          style={{
            padding: 14,
            borderRadius: 10,
            border: `1px solid ${ac}33`,
            background: "rgba(0,0,0,0.28)",
            fontSize: 12,
            color: "rgba(255,255,255,0.4)",
          }}
        >
          No releases in this filter. Create a draft to start the Launch Wizard.
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "minmax(140px, 0.9fr) 1.4fr", gap: 10 }}>
          <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 6 }}>
            {filtered.map((d) => {
              const active = d.releaseId === selectedId;
              return (
                <li key={d.releaseId}>
                  <button
                    type="button"
                    onClick={() => select(d.releaseId)}
                    style={{
                      width: "100%",
                      textAlign: "left",
                      padding: "8px 10px",
                      borderRadius: 8,
                      border: active ? `1px solid ${ac}` : "1px solid rgba(255,255,255,0.1)",
                      background: active ? `${ac}18` : "rgba(0,0,0,0.22)",
                      color: "#fff",
                      cursor: "pointer",
                      fontFamily: "inherit",
                    }}
                  >
                    <div style={{ fontSize: 12, fontWeight: 800 }}>{d.title}</div>
                    <div style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>
                      {d.status}
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>

          {selected ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <label style={labelStyle}>
                Title
                <input
                  value={selected.title}
                  onChange={(e) => patchSelected({ title: e.target.value })}
                  style={inputStyle}
                />
              </label>
              <label style={labelStyle}>
                Audio URL
                <input
                  value={selected.audioUrl ?? ""}
                  onChange={(e) => {
                    const audioUrl = e.target.value;
                    const wizard = selected.wizard.map((w) =>
                      w.id === "upload_audio"
                        ? { ...w, checked: Boolean(audioUrl.trim()) }
                        : w,
                    );
                    patchSelected({ audioUrl, wizard });
                  }}
                  placeholder="https://… (audio file or locker URL)"
                  style={inputStyle}
                />
              </label>
              <label style={labelStyle}>
                Cover URL
                <input
                  value={selected.coverUrl ?? ""}
                  onChange={(e) => {
                    const coverUrl = e.target.value;
                    const wizard = selected.wizard.map((w) =>
                      w.id === "cover" ? { ...w, checked: Boolean(coverUrl.trim()) } : w,
                    );
                    patchSelected({ coverUrl, wizard });
                  }}
                  placeholder="https://… cover art"
                  style={inputStyle}
                />
              </label>
              <label style={labelStyle}>
                Product / Buy URL
                <input
                  value={selected.productBuyUrl ?? ""}
                  onChange={(e) => patchSelected({ productBuyUrl: e.target.value })}
                  placeholder="https://… store checkout"
                  style={inputStyle}
                />
              </label>

              <div>
                <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.12em", color: ac, marginBottom: 6 }}>
                  LAUNCH WIZARD
                </div>
                <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 4 }}>
                  {selected.wizard.map((w) => {
                    const stepStatus = wizardStepStatus(w.id, lastRun);
                    return (
                      <li
                        key={w.id}
                        style={{
                          display: "grid",
                          gridTemplateColumns: "auto auto 1fr auto",
                          gap: 8,
                          alignItems: "center",
                          padding: "6px 8px",
                          borderRadius: 6,
                          background: "rgba(0,0,0,0.22)",
                          border: "1px solid rgba(255,255,255,0.08)",
                          fontSize: 11,
                          color: "rgba(255,255,255,0.75)",
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={w.checked}
                          onChange={() => toggleWizard(w.id, "checked")}
                          title="Checklist"
                        />
                        <input
                          type="checkbox"
                          checked={w.optedIn}
                          onChange={() => toggleWizard(w.id, "optedIn")}
                          title="Opt into automation step"
                        />
                        <span>
                          {w.label}
                          <span style={{ display: "block", fontSize: 8, color: "rgba(255,255,255,0.3)" }}>
                            check = prep · second = opt-in
                          </span>
                        </span>
                        <span style={{ fontSize: 9, fontWeight: 800, color: statusColor(stepStatus) }}>
                          {stepStatus}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </div>

              {lastRun ? (
                <div
                  style={{
                    padding: 10,
                    borderRadius: 8,
                    border: "1px solid rgba(0,255,255,0.25)",
                    background: "rgba(0,255,255,0.06)",
                  }}
                >
                  <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.1em", color: "#00FFFF" }}>
                    LAST RUN · {lastRun.status.toUpperCase()}
                  </div>
                  <div style={{ marginTop: 6, display: "flex", flexDirection: "column", gap: 3 }}>
                    {lastRun.steps.map((s) => (
                      <StepRow key={s.stepId} step={s} />
                    ))}
                  </div>
                </div>
              ) : null}

              {error ? (
                <div style={{ fontSize: 11, color: "#FF4D6D", lineHeight: 1.4 }}>{error}</div>
              ) : null}

              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                <button
                  type="button"
                  disabled={busy || selected.status === "Archived"}
                  onClick={onLaunch}
                  style={{
                    ...ctaBtn(ac),
                    opacity: busy || selected.status === "Archived" ? 0.5 : 1,
                  }}
                >
                  {busy ? "Publishing…" : "Launch RELEASE_NEW_WORK"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    archiveReleaseDraft(performerId, selected.releaseId);
                    refresh();
                  }}
                  style={ctaBtn("rgba(255,255,255,0.45)")}
                >
                  Archive
                </button>
                <button
                  type="button"
                  onClick={() =>
                    patchSelected({
                      status: "Scheduled",
                      scheduledAt: new Date().toISOString(),
                    })
                  }
                  style={ctaBtn("#00FFFF")}
                >
                  Mark Scheduled
                </button>
                {selected.status === "Live" ? (
                  <button
                    type="button"
                    onClick={() => patchSelected({ status: "Featured" })}
                    style={ctaBtn("#FF2DAA")}
                  >
                    Feature
                  </button>
                ) : null}
              </div>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}

function StepRow({ step }: { step: WorkflowStepResult }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "18px 1fr auto",
        gap: 6,
        fontSize: 10,
        color: "rgba(255,255,255,0.55)",
      }}
    >
      <span>{glyph(step.status)}</span>
      <span>
        {step.label}
        {step.message ? (
          <span style={{ display: "block", color: "rgba(255,255,255,0.32)", marginTop: 1 }}>
            {step.message}
          </span>
        ) : null}
      </span>
      <span style={{ fontWeight: 800, color: statusColor(step.status) }}>{step.status}</span>
    </div>
  );
}

function wizardStepStatus(id: LaunchWizardItemId, run: WorkflowRunRecord | null): string {
  if (!run) return "—";
  const map: Partial<Record<LaunchWizardItemId, string>> = {
    upload_audio: "validate_assets",
    cover: "validate_assets",
    yopho_edition: "yopho",
    magazine: "magazine",
    listening_party: "listening_party",
    beat_listing: "create_commerce_product",
    store: "store_update",
    notify: "notify_followers",
    publish: run.status === "Completed" ? "COMPLETED" : run.status.toUpperCase(),
  };
  if (id === "publish") return map.publish ?? "—";
  const stepId = map[id];
  if (!stepId) return "—";
  const step = run.steps.find((s) => s.stepId === stepId);
  return step?.status ?? "—";
}

function glyph(status: string): string {
  if (status === "COMPLETED") return "✓";
  if (status === "FAILED") return "✗";
  if (status === "SKIPPED") return "–";
  if (status === "QUEUED" || status === "RETRYING") return "…";
  if (status === "RUNNING") return "▸";
  return "○";
}

function statusColor(status: string): string {
  if (status === "COMPLETED") return "#39FF14";
  if (status === "FAILED") return "#FF4D6D";
  if (status === "QUEUED" || status === "RETRYING") return "#FFD700";
  if (status === "SKIPPED") return "rgba(255,255,255,0.35)";
  if (status === "RUNNING") return "#00FFFF";
  return "rgba(255,255,255,0.4)";
}

const labelStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 4,
  fontSize: 9,
  fontWeight: 800,
  letterSpacing: "0.08em",
  color: "rgba(255,255,255,0.45)",
};

const inputStyle: CSSProperties = {
  padding: "8px 10px",
  borderRadius: 8,
  border: "1px solid rgba(255,255,255,0.14)",
  background: "rgba(0,0,0,0.35)",
  color: "#fff",
  fontSize: 12,
  fontFamily: "inherit",
  fontWeight: 500,
  letterSpacing: "normal",
};

function ctaBtn(color: string): CSSProperties {
  return {
    display: "inline-block",
    padding: "8px 12px",
    borderRadius: 8,
    border: `1px solid ${color}66`,
    background: `${color}18`,
    color,
    fontWeight: 800,
    fontSize: 11,
    cursor: "pointer",
    fontFamily: "inherit",
  };
}
