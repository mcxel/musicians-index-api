"use client";

import { useEffect, useMemo, useState } from "react";
import type { CSSProperties } from "react";

import {
  DEFAULT_MATRIX_ASSIGNMENTS,
  getMediaSource,
  MEDIA_SOURCE_REGISTRY,
  type MediaSourceDefinition,
} from "./MediaSourceRegistry";

type LayoutMode = "single" | "dual" | "triple" | "quad" | "pip";
type BoardroomMode = "boardroom" | "default";

const LAYOUT_LABELS: Record<LayoutMode, string> = {
  single: "Single",
  dual: "Duo 1v1",
  triple: "Triple",
  quad: "Quad",
  pip: "PiP",
};

const SOURCE_SLOT_LABELS = ["Main", "Slot 2", "Slot 3", "Slot 4"];
const ROSE_FALLBACK_URL =
  process.env.NEXT_PUBLIC_DEFAULT_MONITOR_VIDEO?.trim() ||
  process.env.NEXT_PUBLIC_OBSERVATORY_ROSE_VIDEO_URL?.trim() ||
  "";

interface LiveSessionSummary {
  previewUrl?: string | null;
  thumbnailUrl?: string | null;
}

function getViewportCount(mode: LayoutMode) {
  switch (mode) {
    case "single":
      return 1;
    case "dual":
      return 2;
    case "triple":
      return 3;
    case "quad":
      return 4;
    case "pip":
      return 2;
    default:
      return 4;
  }
}

function getGridTemplate(mode: LayoutMode) {
  switch (mode) {
    case "single":
      return "1fr / 1fr";
    case "dual":
      return "1fr / 1fr 1fr";
    case "triple":
      return "1fr 1fr / 1fr 1fr";
    case "quad":
      return "1fr 1fr / 1fr 1fr";
    case "pip":
      return "1fr / 1fr";
    default:
      return "1fr 1fr / 1fr 1fr";
  }
}

function sourceTheme(source: MediaSourceDefinition) {
  if (source.kind === "boardroom") return "radial-gradient(circle at 25% 25%, rgba(255,215,0,0.16), rgba(16,10,26,0.96) 58%)";
  if (source.kind === "camera") return "radial-gradient(circle at 25% 25%, rgba(0,255,255,0.16), rgba(16,10,26,0.96) 58%)";
  if (source.kind === "performer" || source.kind === "venue") return "radial-gradient(circle at 25% 25%, rgba(255,45,170,0.16), rgba(16,10,26,0.96) 58%)";
  if (source.kind === "security") return "radial-gradient(circle at 25% 25%, rgba(255,68,68,0.18), rgba(16,10,26,0.96) 58%)";
  if (source.kind === "analytics") return "radial-gradient(circle at 25% 25%, rgba(255,215,0,0.18), rgba(16,10,26,0.96) 58%)";
  return "radial-gradient(circle at 25% 25%, rgba(140,249,255,0.16), rgba(16,10,26,0.96) 58%)";
}

export default function MediaMatrixEngine() {
  const [layout, setLayout] = useState<LayoutMode>("quad");
  const [mode, setMode] = useState<BoardroomMode>("default");
  const [selectedSourceId, setSelectedSourceId] = useState<string>(DEFAULT_MATRIX_ASSIGNMENTS[0]);
  const [swapAnchor, setSwapAnchor] = useState<number | null>(null);
  const [assignments, setAssignments] = useState<string[]>(DEFAULT_MATRIX_ASSIGNMENTS);
  const [liveCount, setLiveCount] = useState(0);
  const [livePreviewUrl, setLivePreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function pollLiveSessions() {
      try {
        const res = await fetch("/api/live/go", { cache: "no-store" });
        if (!res.ok) return;
        const data = (await res.json()) as { sessions?: LiveSessionSummary[]; count?: number };
        if (!mounted) return;
        const sessions = data.sessions ?? [];
        setLiveCount(data.count ?? sessions.length);
        const firstPlayable = sessions.find((s) => (s.previewUrl && s.previewUrl.trim().length > 0) || (s.thumbnailUrl && s.thumbnailUrl.trim().length > 0));
        setLivePreviewUrl(firstPlayable?.previewUrl?.trim() || firstPlayable?.thumbnailUrl?.trim() || null);
      } catch {
        if (!mounted) return;
        setLiveCount(0);
        setLivePreviewUrl(null);
      }
    }

    void pollLiveSessions();
    const id = setInterval(() => {
      void pollLiveSessions();
    }, 8000);

    return () => {
      mounted = false;
      clearInterval(id);
    };
  }, []);

  const viewportCount = getViewportCount(layout);
  const viewportAssignments = useMemo(
    () => assignments.slice(0, viewportCount),
    [assignments, viewportCount],
  );

  const activeViewports = useMemo(
    () => Array.from({ length: viewportCount }, (_, index) => getMediaSource(viewportAssignments[index] ?? DEFAULT_MATRIX_ASSIGNMENTS[index] ?? MEDIA_SOURCE_REGISTRY[0].id)),
    [viewportAssignments, viewportCount],
  );

  const assignSelectedSource = (index: number) => {
    setAssignments((current) => {
      const next = [...current];
      next[index] = selectedSourceId;
      return next;
    });
  };

  const assignSourceToAll = (sourceId: string) => {
    setAssignments((current) => Array.from({ length: Math.max(current.length, viewportCount) }, () => sourceId));
  };

  const swapViewports = (firstIndex: number, secondIndex: number) => {
    if (firstIndex === secondIndex) {
      setSwapAnchor(null);
      return;
    }
    setAssignments((current) => {
      const next = [...current];
      const first = next[firstIndex];
      next[firstIndex] = next[secondIndex] ?? first;
      next[secondIndex] = first;
      return next;
    });
    setSwapAnchor(null);
  };

  const clearViewport = (index: number) => {
    setAssignments((current) => {
      const next = [...current];
      next[index] = DEFAULT_MATRIX_ASSIGNMENTS[index] ?? DEFAULT_MATRIX_ASSIGNMENTS[0];
      return next;
    });
  };

  const restoreDefaults = () => {
    setLayout("quad");
    setMode("default");
    setSelectedSourceId(DEFAULT_MATRIX_ASSIGNMENTS[0]);
    setSwapAnchor(null);
    setAssignments(DEFAULT_MATRIX_ASSIGNMENTS);
  };

  const launchBoardroomMode = () => {
    setMode("boardroom");
    setLayout("single");
    setSelectedSourceId("boardroom");
    setAssignments(["boardroom", "bigace-camera", "venue", "security"]);
  };

  const cardStyle: CSSProperties = {
    borderRadius: 10,
    border: "1px solid rgba(255,215,0,0.35)",
    background: "linear-gradient(170deg, rgba(16,10,26,0.95), rgba(8,5,14,0.97))",
    boxShadow: "inset 0 0 0 1px rgba(255,215,0,0.12)",
    display: "flex",
    flexDirection: "column",
    minHeight: 98,
    overflow: "hidden",
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8, height: "100%", minHeight: 0 }}>
      <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: 8, alignItems: "start" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {(["single", "dual", "triple", "quad", "pip"] as const).map((modeName) => {
              const active = layout === modeName;
              return (
                <button
                  key={modeName}
                  type="button"
                  onClick={() => setLayout(modeName)}
                  style={{
                    border: active ? "1px solid rgba(255,215,0,0.75)" : "1px solid rgba(255,255,255,0.18)",
                    borderRadius: 999,
                    background: active ? "rgba(255,215,0,0.2)" : "rgba(255,255,255,0.06)",
                    color: active ? "#FFD700" : "rgba(255,255,255,0.78)",
                    padding: "3px 8px",
                    fontSize: 10,
                    fontWeight: 800,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    cursor: "pointer",
                  }}
                >
                  {LAYOUT_LABELS[modeName]}
                </button>
              );
            })}
            <button
              type="button"
              onClick={launchBoardroomMode}
              style={{
                border: mode === "boardroom" ? "1px solid rgba(0,255,255,0.8)" : "1px solid rgba(0,255,255,0.28)",
                borderRadius: 999,
                background: mode === "boardroom" ? "rgba(0,255,255,0.15)" : "rgba(0,255,255,0.06)",
                color: mode === "boardroom" ? "#7CF7FF" : "rgba(255,255,255,0.8)",
                padding: "3px 8px",
                fontSize: 10,
                fontWeight: 800,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                cursor: "pointer",
              }}
            >
              Boardroom Mode
            </button>
            <button
              type="button"
              onClick={restoreDefaults}
              style={{
                border: "1px solid rgba(255,255,255,0.18)",
                borderRadius: 999,
                background: "rgba(255,255,255,0.06)",
                color: "rgba(255,255,255,0.8)",
                padding: "3px 8px",
                fontSize: 10,
                fontWeight: 800,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                cursor: "pointer",
              }}
            >
              Restore Defaults
            </button>
          </div>
          <div style={{ color: "rgba(0,255,255,0.85)", fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" }}>
            {mode === "boardroom" ? "Boardroom window set" : `${viewportCount} active viewports`} · assign source, swap slots, clear, or restore.
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 6 }}>
          <button type="button" onClick={() => assignSourceToAll(selectedSourceId)} style={actionButtonStyle}>
            Route to all viewports
          </button>
          <button type="button" onClick={() => setLayout("single")} style={actionButtonStyle}>
            Focus main monitor
          </button>
          <button type="button" onClick={() => setLayout("quad")} style={actionButtonStyle}>
            Restore quad wall
          </button>
          <button type="button" onClick={() => setSwapAnchor(null)} style={actionButtonStyle}>
            Clear swap selection
          </button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.1fr 1.3fr", gap: 8, minHeight: 0 }}>
        <div
          style={{
            borderRadius: 10,
            border: "1px solid rgba(255,215,0,0.25)",
            background: "linear-gradient(180deg, rgba(15,8,24,0.94), rgba(8,4,13,0.98))",
            padding: 10,
            display: "flex",
            flexDirection: "column",
            gap: 8,
            minHeight: 0,
          }}
        >
          <div style={{ color: "#FFD700", fontSize: 10, fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase" }}>
            Source Registry
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6, overflow: "auto", maxHeight: 240 }}>
            {MEDIA_SOURCE_REGISTRY.map((source) => {
              const active = selectedSourceId === source.id;
              return (
                <button
                  key={source.id}
                  type="button"
                  onClick={() => setSelectedSourceId(source.id)}
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 8,
                    borderRadius: 8,
                    border: active ? `1px solid ${source.accent}` : "1px solid rgba(255,255,255,0.14)",
                    background: active ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.03)",
                    color: "rgba(255,255,255,0.92)",
                    padding: "8px 10px",
                    textAlign: "left",
                    cursor: "pointer",
                    overflow: "hidden",
                  }}
                >
                    <span
                      aria-hidden
                      style={{
                        width: 54,
                        height: 42,
                        borderRadius: 7,
                        flexShrink: 0,
                        border: `1px solid ${source.accent}44`,
                        background: `linear-gradient(145deg, ${source.accent}33, rgba(8,4,13,0.92))`,
                        boxShadow: `inset 0 0 24px ${source.accent}20`,
                      }}
                    />
                  <span style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.05em", textTransform: "uppercase" }}>{source.label}</span>
                    <span style={{ color: "rgba(255,255,255,0.56)", fontSize: 9, lineHeight: 1.35 }}>{source.detail}</span>
                  </span>
                  <span style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 3 }}>
                    <span style={{ color: source.status === "LIVE" ? "#00FF88" : "#FFD700", fontSize: 9, fontWeight: 900, letterSpacing: "0.08em" }}>{source.status}</span>
                    <span style={{ color: source.accent, fontSize: 9, fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase" }}>{source.kind}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div
          style={{
            borderRadius: 10,
            border: "1px solid rgba(255,215,0,0.25)",
            background: "linear-gradient(180deg, rgba(15,8,24,0.94), rgba(8,4,13,0.98))",
            padding: 10,
            minHeight: 0,
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <div style={{ color: "#FFD700", fontSize: 10, fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase" }}>
              Viewport Assignment
            </div>
            <div style={{ color: "rgba(255,255,255,0.6)", fontSize: 9, letterSpacing: "0.08em", textTransform: "uppercase" }}>
              Click viewport, then assign or swap
            </div>
          </div>

          <div style={{
            flex: 1,
            minHeight: 210,
            maxHeight: 360,
            overflow: "auto",
            display: "grid",
            gridTemplate: getGridTemplate(layout),
            gap: 8,
          }}>
            {activeViewports.map((source, idx) => {
              const isTripleLast = layout === "triple" && idx === 2;
              const isAnchor = swapAnchor === idx;

              return (
                <div
                  key={`${source.id}-${idx}`}
                  style={{
                    ...cardStyle,
                    ...(isTripleLast ? { gridColumn: "1 / span 2" } : {}),
                    outline: isAnchor ? "2px solid rgba(0,255,255,0.6)" : "none",
                    cursor: "pointer",
                  }}
                  onClick={() => {
                    if (swapAnchor === null) {
                      setSwapAnchor(idx);
                      return;
                    }
                    swapViewports(swapAnchor, idx);
                  }}
                >
                  <ViewportHeader source={source} index={idx + 1} slotLabel={SOURCE_SLOT_LABELS[idx] ?? `Slot ${idx + 1}`} />
                  <ViewportBody source={source} liveCount={liveCount} livePreviewUrl={livePreviewUrl} />
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 6, padding: 8, borderTop: "1px solid rgba(255,215,0,0.15)" }}>
                    <button type="button" onClick={(event) => { event.stopPropagation(); assignSelectedSource(idx); }} style={miniButtonStyle}>Attach</button>
                    <button type="button" onClick={(event) => { event.stopPropagation(); clearViewport(idx); }} style={miniButtonStyle}>Clear</button>
                    <button type="button" onClick={(event) => { event.stopPropagation(); setSwapAnchor(idx); }} style={miniButtonStyle}>{isAnchor ? "Selected" : "Swap"}</button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function ViewportHeader({ source, index, slotLabel }: { source: MediaSourceDefinition; index: number; slotLabel: string }) {
  return (
    <div
      style={{
        padding: "6px 8px",
        borderBottom: "1px solid rgba(255,215,0,0.2)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 6,
        background: "linear-gradient(to right, rgba(255,215,0,0.15), rgba(0,255,255,0.08))",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 2, minWidth: 0 }}>
        <span style={{ color: "#FFD790", fontSize: 10, fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          {slotLabel} · V{index}
        </span>
        <span style={{ color: "rgba(255,255,255,0.6)", fontSize: 8, letterSpacing: "0.08em", textTransform: "uppercase" }}>{source.label}</span>
      </div>
      <span
        style={{
          color: source.status === "LIVE" ? "#00FF88" : "rgba(255,255,255,0.75)",
          fontSize: 9,
          fontWeight: 800,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
        }}
      >
        {source.status}
      </span>
    </div>
  );
}

function ViewportBody({ source, liveCount, livePreviewUrl }: { source: MediaSourceDefinition; liveCount: number; livePreviewUrl: string | null }) {
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 10, gap: 10, background: sourceTheme(source) }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: "50%", background: `linear-gradient(180deg, ${source.accent}, rgba(255,255,255,0.05))`, display: "flex", alignItems: "center", justifyContent: "center", color: "#160a03", fontSize: 11, fontWeight: 900 }}>
            {source.label.slice(0, 1)}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <div style={{ color: "rgba(255,255,255,0.95)", fontSize: 11, fontWeight: 800, letterSpacing: "0.05em", textTransform: "uppercase" }}>
              {source.label}
            </div>
            <div style={{ color: "rgba(255,255,255,0.65)", fontSize: 9, lineHeight: 1.35 }}>{source.detail}</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: source.status === "LIVE" ? "#00FF88" : "#FFD700", boxShadow: "0 0 10px rgba(0,255,136,0.35)" }} />
          <span style={{ color: source.accent, fontSize: 9, fontWeight: 900, letterSpacing: "0.08em", textTransform: "uppercase" }}>{source.kind}</span>
        </div>
      </div>

      <MediaRenderer source={source} liveCount={liveCount} livePreviewUrl={livePreviewUrl} />

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, color: "rgba(255,255,255,0.7)", fontSize: 9, letterSpacing: "0.08em", textTransform: "uppercase" }}>
        <span>Mic • Camera • Snapshot • Record</span>
        <span>{source.status}</span>
      </div>
    </div>
  );
}

function MediaRenderer({ source, liveCount, livePreviewUrl }: { source: MediaSourceDefinition; liveCount: number; livePreviewUrl: string | null }) {
  if (source.kind === "analytics") {
    return (
      <div style={{ height: 118, borderRadius: 8, border: "1px solid rgba(255,215,0,0.18)", background: "linear-gradient(180deg, rgba(255,215,0,0.08), rgba(255,215,0,0.02))", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, padding: 10 }}>
        {[40, 68, 52, 84, 62, 92].map((height, index) => (
          <span key={index} style={{ width: 14, height: `${height}%`, alignSelf: "end", borderRadius: 4, background: `linear-gradient(180deg, ${source.accent}, rgba(255,255,255,0.06))` }} />
        ))}
      </div>
    );
  }

  if (source.kind === "boardroom" || source.kind === "camera") {
    return (
      <MonitorViewport
        source={source}
        label={source.kind === "boardroom" ? "Boardroom cam" : "Executive camera"}
        meta="Mic live · Camera active"
        liveCount={liveCount}
        livePreviewUrl={livePreviewUrl}
      />
    );
  }

  if (source.kind === "security") {
    return (
      <div style={{ display: "grid", gridTemplateColumns: "1.25fr 0.95fr", gap: 8, minHeight: 118 }}>
        <MonitorViewport source={source} label="Sentinel cam" meta="Alert rotation · camera grid" liveCount={liveCount} livePreviewUrl={livePreviewUrl} />
        <div style={{ borderRadius: 8, border: "1px solid rgba(255,68,68,0.18)", background: "linear-gradient(180deg, rgba(255,68,68,0.1), rgba(10,4,8,0.3))", padding: 10, display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 8 }}>
          <MiniCard label="Alerts" value="3" accent="#FF8A8A" />
          <MiniCard label="Cameras" value="8" accent="#FF8A8A" />
          <MiniCard label="Threats" value="0" accent="#FF8A8A" />
          <MiniCard label="Queue" value="2" accent="#FF8A8A" />
        </div>
      </div>
    );
  }

  return <MonitorViewport source={source} label={source.label} meta={source.detail} liveCount={liveCount} livePreviewUrl={livePreviewUrl} />;
}

function MonitorViewport({ source, label, meta, liveCount, livePreviewUrl }: { source: MediaSourceDefinition; label: string; meta: string; liveCount: number; livePreviewUrl: string | null }) {
  const hasLiveSignal = source.status === "LIVE" && liveCount > 0;
  const resolvedSrc = hasLiveSignal ? (livePreviewUrl || ROSE_FALLBACK_URL) : ROSE_FALLBACK_URL;
  const showVideo = resolvedSrc.length > 0;
  const stateLabel = hasLiveSignal ? "LIVE" : showVideo ? "STANDBY" : "OFFLINE";
  return (
    <div style={{ minHeight: 118, borderRadius: 8, border: `1px solid ${source.accent}33`, overflow: "hidden", background: "#04060b", display: "flex", flexDirection: "column" }}>
      <div style={{ position: "relative", minHeight: 98 }}>
        {showVideo ? (
          <video
            src={resolvedSrc}
            autoPlay
            muted
            loop
            playsInline
            style={{ width: "100%", height: "100%", objectFit: "cover", filter: source.kind === "security" ? "saturate(0) contrast(1.15)" : source.kind === "battle" ? "saturate(1.2) contrast(1.05)" : "saturate(0.95)", transition: "opacity 380ms ease" }}
          />
        ) : (
          <div
            style={{
              width: "100%",
              height: "100%",
              minHeight: 98,
              display: "grid",
              placeItems: "center",
              background: "radial-gradient(circle at center, rgba(16,20,28,0.92), #030405)",
              color: "rgba(255,255,255,0.78)",
              letterSpacing: "0.12em",
              fontSize: 9,
              fontWeight: 800,
              textTransform: "uppercase",
            }}
          >
            NO SIGNAL · WAITING FOR FEED
          </div>
        )}
        <div style={{ position: "absolute", inset: 0, background: `linear-gradient(180deg, ${source.accent}18, transparent 35%, rgba(0,0,0,0.35) 100%)` }} />
        <div style={{ position: "absolute", inset: 0, backgroundImage: "repeating-linear-gradient(0deg, rgba(255,255,255,0.035) 0px, rgba(255,255,255,0.035) 1px, transparent 1px, transparent 4px)", opacity: 0.35, pointerEvents: "none" }} />
        <div style={{ position: "absolute", top: 8, left: 8, display: "flex", alignItems: "center", gap: 6, padding: "3px 7px", borderRadius: 999, background: "rgba(0,0,0,0.62)", border: `1px solid ${source.status === "LIVE" ? "rgba(0,255,136,0.35)" : "rgba(255,215,0,0.35)"}` }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: hasLiveSignal ? "#00FF88" : showVideo ? "#FFD700" : "#9ca3af", boxShadow: `0 0 8px ${hasLiveSignal ? "#00FF88" : showVideo ? "#FFD700" : "#9ca3af"}` }} />
          <span style={{ color: "#fff", fontSize: 8, fontWeight: 900, letterSpacing: "0.14em", textTransform: "uppercase" }}>{stateLabel}</span>
        </div>
        <div style={{ position: "absolute", top: 8, right: 8, color: "rgba(255,255,255,0.75)", fontSize: 8, fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase", padding: "3px 6px", borderRadius: 999, background: "rgba(0,0,0,0.55)" }}>
          {source.kind}
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "end", justifyContent: "space-between", gap: 10, padding: "8px 10px", borderTop: `1px solid ${source.accent}2f`, background: "rgba(2,4,8,0.86)" }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ color: "#fff", fontSize: 11, fontWeight: 900, letterSpacing: "0.05em", textTransform: "uppercase", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{label}</div>
          <div style={{ color: "rgba(255,255,255,0.72)", fontSize: 9, lineHeight: 1.35, maxWidth: 220, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {hasLiveSignal ? `${meta} · live source` : showVideo ? `${meta} · rose standby` : `${meta} · offline standby`}
          </div>
        </div>
        <div style={{ color: source.accent, fontSize: 8, fontWeight: 900, letterSpacing: "0.14em", textTransform: "uppercase", padding: "4px 6px", borderRadius: 6, background: "rgba(0,0,0,0.55)", border: `1px solid ${source.accent}44` }}>
          Monitor
        </div>
      </div>
    </div>
  );
}

function MiniCard({ label, value, accent }: { label: string; value: string; accent: string }) {
  return (
    <div style={{ borderRadius: 8, border: `1px solid ${accent}2a`, background: "rgba(255,255,255,0.04)", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", minHeight: 46 }}>
      <span style={{ color: "rgba(255,255,255,0.62)", fontSize: 8, fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase" }}>{label}</span>
      <span style={{ color: accent, fontSize: 13, fontWeight: 900 }}>{value}</span>
    </div>
  );
}

const actionButtonStyle: CSSProperties = {
  borderRadius: 8,
  border: "1px solid rgba(255,215,0,0.22)",
  background: "linear-gradient(180deg, rgba(255,215,0,0.12), rgba(255,255,255,0.03))",
  color: "#FFD88F",
  padding: "7px 8px",
  fontSize: 10,
  fontWeight: 800,
  letterSpacing: "0.06em",
  textTransform: "uppercase",
  cursor: "pointer",
};

const miniButtonStyle: CSSProperties = {
  ...actionButtonStyle,
  minHeight: 32,
  minWidth: 64,
  padding: "4px 8px",
  fontSize: 10,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};
