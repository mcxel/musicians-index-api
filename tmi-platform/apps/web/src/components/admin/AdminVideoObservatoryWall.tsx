"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  createPictureInPictureState,
  dragPictureInPictureWindow,
  pinPictureInPictureWindow,
  resizePictureInPictureWindow,
  swapPictureInPictureFocus,
  type PictureInPictureState,
} from "@/lib/video/PictureInPictureEngine";
import {
  getVideoDiagnosticsSnapshot,
  listObservatoryFeeds,
  listPictureInPictureEligibleFeeds,
  type ObservatoryFeed,
} from "@/lib/video/VideoDiagnosticsEngine";

type LayoutMode = "1x1" | "2x2" | "3x3" | "4x4" | "custom";

const LAYOUT_PRESETS: Record<Exclude<LayoutMode, "custom">, { rows: number; columns: number }> = {
  "1x1": { rows: 1, columns: 1 },
  "2x2": { rows: 2, columns: 2 },
  "3x3": { rows: 3, columns: 3 },
  "4x4": { rows: 4, columns: 4 },
};

function statusColor(status: ObservatoryFeed["streamStatus"]): string {
  if (status === "live") return "#00FF88";
  if (status === "buffering") return "#FFD700";
  return "#FF2DAA";
}

export default function AdminVideoObservatoryWall() {
  const diagnostics = useMemo(() => getVideoDiagnosticsSnapshot(), []);
  const feeds = useMemo(() => listObservatoryFeeds(), []);
  const pipEligibleFeeds = useMemo(() => listPictureInPictureEligibleFeeds(), []);

  const [layout, setLayout] = useState<LayoutMode>("3x3");
  const [customRows, setCustomRows] = useState(2);
  const [customColumns, setCustomColumns] = useState(3);
  const [focusFeedId, setFocusFeedId] = useState(feeds[0]?.feedId ?? "");
  const [pipState, setPipState] = useState<PictureInPictureState>(() => createPictureInPictureState(pipEligibleFeeds, pipEligibleFeeds[0]?.feedId));
  const [draggingWindowId, setDraggingWindowId] = useState<string | null>(null);
  const wallRef = useRef<HTMLDivElement | null>(null);

  const layoutConfig = layout === "custom" ? { rows: customRows, columns: customColumns } : LAYOUT_PRESETS[layout];
  const visibleFeedCount = layoutConfig.rows * layoutConfig.columns;
  const visibleFeeds = feeds.slice(0, visibleFeedCount);
  const focusFeed = feeds.find((feed) => feed.feedId === focusFeedId) ?? visibleFeeds[0] ?? null;

  useEffect(() => {
    function handleMove(event: MouseEvent) {
      if (!draggingWindowId || !wallRef.current) return;
      const bounds = wallRef.current.getBoundingClientRect();
      setPipState((state) =>
        dragPictureInPictureWindow(state, draggingWindowId, {
          x: event.clientX - bounds.left - 90,
          y: event.clientY - bounds.top - 40,
        }),
      );
    }

    function handleUp() {
      setDraggingWindowId(null);
    }

    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseup", handleUp);
    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseup", handleUp);
    };
  }, [draggingWindowId]);

  return (
    <main style={{ minHeight: "100vh", background: "radial-gradient(circle at top, rgba(0,255,255,0.08), transparent 28%), #050510", color: "#fff", padding: 18 }}>
      <div style={{ maxWidth: 1600, margin: "0 auto", display: "grid", gap: 14 }}>
        <header style={{ border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: 16, background: "rgba(0,0,0,0.35)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
            <div>
              <div style={{ fontSize: 10, letterSpacing: "0.34em", textTransform: "uppercase", color: "#00FFFF", fontWeight: 800 }}>Admin Video Observatory Wall</div>
              <h1 style={{ margin: "6px 0 0", fontSize: 30 }}>Multi-view monitoring wall with picture-in-picture</h1>
              <p style={{ margin: "8px 0 0", color: "rgba(255,255,255,0.5)", fontSize: 13 }}>Artist, performer, venue, host, battle, cypher, ticketed event, admin camera, and bot simulation monitoring.</p>
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <Link href="/admin/profile-multi-view" style={{ color: "#AA2DFF", textDecoration: "none", fontSize: 11 }}>Profile Multi-View</Link>
              <Link href="/admin/bots/observe" style={{ color: "#FF2DAA", textDecoration: "none", fontSize: 11 }}>Bot Observe</Link>
              <Link href="/admin/venues/observe" style={{ color: "#00FF88", textDecoration: "none", fontSize: 11 }}>Venue Observe</Link>
              <Link href="/admin/events/observe" style={{ color: "#FFD700", textDecoration: "none", fontSize: 11 }}>Event Observe</Link>
            </div>
          </div>
        </header>

        <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 10 }}>
          {[
            ["Feeds", diagnostics.summary.totalFeeds, "#FFFFFF"],
            ["Live", diagnostics.summary.liveFeeds, "#00FF88"],
            ["Dropped Frames", diagnostics.summary.droppedFrames, "#FFD700"],
            ["Disconnects", diagnostics.summary.disconnects, "#FF2DAA"],
            ["Camera Failures", diagnostics.summary.cameraFailures, "#FF9500"],
            ["PiP Failures", diagnostics.summary.pipFailures, "#AA2DFF"],
          ].map(([label, value, tone]) => (
            <div key={label as string} style={{ border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, padding: 14, background: "rgba(0,0,0,0.28)" }}>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.42)" }}>{label as string}</div>
              <div style={{ marginTop: 6, fontSize: 26, fontWeight: 800, color: tone as string }}>{value as number}</div>
            </div>
          ))}
        </section>

        <section style={{ display: "grid", gridTemplateColumns: "1.25fr 0.75fr", gap: 14 }}>
          <div style={{ border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, background: "rgba(0,0,0,0.32)", padding: 14, display: "grid", gap: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
              <div>
                <div style={{ fontSize: 11, letterSpacing: "0.24em", color: "#00FFFF", textTransform: "uppercase", fontWeight: 800 }}>Layout Controls</div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.48)", marginTop: 4 }}>1x1, 2x2, 3x3, 4x4, or a custom wall.</div>
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {(["1x1", "2x2", "3x3", "4x4", "custom"] as LayoutMode[]).map((entry) => (
                  <button
                    key={entry}
                    type="button"
                    onClick={() => setLayout(entry)}
                    style={{
                      padding: "7px 10px",
                      borderRadius: 8,
                      border: `1px solid ${layout === entry ? "#00FFFF55" : "rgba(255,255,255,0.12)"}`,
                      background: layout === entry ? "rgba(0,255,255,0.12)" : "rgba(255,255,255,0.03)",
                      color: layout === entry ? "#00FFFF" : "rgba(255,255,255,0.7)",
                      fontSize: 10,
                      fontWeight: 800,
                      cursor: "pointer",
                    }}
                  >
                    {entry}
                  </button>
                ))}
              </div>
            </div>

            {layout === "custom" && (
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <label style={{ display: "grid", gap: 4, fontSize: 10 }}>
                  <span>Rows</span>
                  <input type="number" min={1} max={4} value={customRows} onChange={(event) => setCustomRows(Number(event.target.value) || 1)} style={{ padding: "6px 8px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.05)", color: "#fff" }} />
                </label>
                <label style={{ display: "grid", gap: 4, fontSize: 10 }}>
                  <span>Columns</span>
                  <input type="number" min={1} max={4} value={customColumns} onChange={(event) => setCustomColumns(Number(event.target.value) || 1)} style={{ padding: "6px 8px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.05)", color: "#fff" }} />
                </label>
              </div>
            )}

            <div ref={wallRef} style={{ position: "relative", borderRadius: 14, border: "1px solid rgba(255,255,255,0.08)", background: "rgba(5,5,20,0.72)", padding: 12, minHeight: 720 }}>
              <div style={{ display: "grid", gridTemplateColumns: `repeat(${layoutConfig.columns}, minmax(0, 1fr))`, gap: 10 }}>
                {visibleFeeds.map((feed) => (
                  <button
                    key={feed.feedId}
                    type="button"
                    onClick={() => setFocusFeedId(feed.feedId)}
                    style={{
                      textAlign: "left",
                      borderRadius: 12,
                      overflow: "hidden",
                      border: `1px solid ${focusFeedId === feed.feedId ? statusColor(feed.streamStatus) + "55" : "rgba(255,255,255,0.08)"}`,
                      background: "rgba(255,255,255,0.03)",
                      cursor: "pointer",
                      padding: 0,
                    }}
                  >
                    <div style={{ aspectRatio: "16/9", backgroundImage: `linear-gradient(180deg, rgba(0,0,0,0.08), rgba(0,0,0,0.45)), url('${feed.previewImage}')`, backgroundSize: "cover", backgroundPosition: "center" }} />
                    <div style={{ padding: 10, display: "grid", gap: 6 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", gap: 8, alignItems: "center" }}>
                        <div style={{ fontSize: 12, fontWeight: 800 }}>{feed.label}</div>
                        <span style={{ fontSize: 9, fontWeight: 800, color: statusColor(feed.streamStatus), textTransform: "uppercase" }}>{feed.streamStatus}</span>
                      </div>
                      <div style={{ fontSize: 9, color: "rgba(255,255,255,0.45)" }}>{feed.cameraLabel} · {feed.category}</div>
                    </div>
                  </button>
                ))}
              </div>

              {focusFeed && (
                <div style={{ position: "absolute", left: 12, right: 12, bottom: 12, borderRadius: 14, border: `1px solid ${statusColor(focusFeed.streamStatus)}44`, background: "rgba(0,0,0,0.56)", padding: 12 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
                    <div>
                      <div style={{ fontSize: 10, color: "rgba(255,255,255,0.42)", textTransform: "uppercase", letterSpacing: "0.14em" }}>Focused Feed</div>
                      <div style={{ fontSize: 18, fontWeight: 800, marginTop: 4 }}>{focusFeed.label}</div>
                    </div>
                    <Link href={focusFeed.route} style={{ color: "#00FFFF", textDecoration: "none", fontSize: 10, fontWeight: 800 }}>Open route →</Link>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8, marginTop: 10 }}>
                    {[
                      ["chat/min", focusFeed.chatVelocity],
                      ["tickets/min", focusFeed.ticketVelocity],
                      ["tips/min", focusFeed.tipsPerMinute],
                      ["votes/min", focusFeed.votesPerMinute],
                    ].map(([label, value]) => (
                      <div key={label as string} style={{ border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, padding: 10, background: "rgba(255,255,255,0.03)" }}>
                        <div style={{ fontSize: 9, color: "rgba(255,255,255,0.42)", textTransform: "uppercase" }}>{label as string}</div>
                        <div style={{ marginTop: 4, fontSize: 16, fontWeight: 800 }}>{value as number}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {pipState.windows.map((window) => {
                const feed = feeds.find((entry) => entry.feedId === window.feedId);
                if (!feed) return null;
                return (
                  <div
                    key={window.windowId}
                    onMouseDown={() => setDraggingWindowId(window.windowId)}
                    style={{
                      position: "absolute",
                      left: window.x,
                      top: window.y,
                      width: window.width,
                      height: window.height,
                      zIndex: window.zIndex,
                      borderRadius: 12,
                      overflow: "hidden",
                      border: `1px solid ${window.pinned ? "#FFD70055" : "rgba(255,255,255,0.16)"}`,
                      boxShadow: "0 10px 20px rgba(0,0,0,0.35)",
                      background: "rgba(0,0,0,0.72)",
                      cursor: draggingWindowId === window.windowId ? "grabbing" : "grab",
                    }}
                  >
                    <div style={{ height: "68%", backgroundImage: `linear-gradient(180deg, rgba(0,0,0,0.08), rgba(0,0,0,0.45)), url('${feed.previewImage}')`, backgroundSize: "cover", backgroundPosition: "center" }} />
                    <div style={{ padding: 8, display: "grid", gap: 6 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", gap: 8, alignItems: "center" }}>
                        <div style={{ fontSize: 10, fontWeight: 800 }}>{window.label}</div>
                        <span style={{ fontSize: 8, fontWeight: 800, color: statusColor(feed.streamStatus) }}>{feed.streamStatus}</span>
                      </div>
                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                        <button type="button" onClick={(event) => { event.stopPropagation(); setPipState((state) => swapPictureInPictureFocus(state, window.feedId, pipEligibleFeeds)); setFocusFeedId(window.feedId); }} style={{ borderRadius: 6, border: "1px solid rgba(0,255,255,0.35)", background: "rgba(0,255,255,0.1)", color: "#00FFFF", fontSize: 8, fontWeight: 800, padding: "4px 6px", cursor: "pointer" }}>Swap</button>
                        <button type="button" onClick={(event) => { event.stopPropagation(); setPipState((state) => pinPictureInPictureWindow(state, window.windowId)); }} style={{ borderRadius: 6, border: "1px solid rgba(255,215,0,0.35)", background: "rgba(255,215,0,0.1)", color: "#FFD700", fontSize: 8, fontWeight: 800, padding: "4px 6px", cursor: "pointer" }}>{window.pinned ? "Unpin" : "Pin"}</button>
                        <button type="button" onClick={(event) => { event.stopPropagation(); setPipState((state) => resizePictureInPictureWindow(state, window.windowId, { width: window.width + 20, height: window.height + 10 })); }} style={{ borderRadius: 6, border: "1px solid rgba(255,255,255,0.22)", background: "rgba(255,255,255,0.08)", color: "#fff", fontSize: 8, fontWeight: 800, padding: "4px 6px", cursor: "pointer" }}>Size +</button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div style={{ display: "grid", gap: 14 }}>
            <div style={{ border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, background: "rgba(0,0,0,0.32)", padding: 14 }}>
              <div style={{ fontSize: 11, letterSpacing: "0.24em", color: "#AA2DFF", textTransform: "uppercase", fontWeight: 800, marginBottom: 10 }}>PiP Control</div>
              <div style={{ display: "grid", gap: 8 }}>
                {pipState.windows.map((window) => (
                  <div key={window.windowId} style={{ border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, padding: 10, background: "rgba(255,255,255,0.03)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                      <div style={{ fontWeight: 700 }}>{window.label}</div>
                      <div style={{ fontSize: 10, color: window.pinned ? "#FFD700" : "rgba(255,255,255,0.48)" }}>{window.pinned ? "pinned" : "floating"}</div>
                    </div>
                    <div style={{ marginTop: 6, fontSize: 10, color: "rgba(255,255,255,0.48)" }}>
                      x {Math.round(window.x)} · y {Math.round(window.y)} · {window.width}x{window.height}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, background: "rgba(0,0,0,0.32)", padding: 14 }}>
              <div style={{ fontSize: 11, letterSpacing: "0.24em", color: "#FF2DAA", textTransform: "uppercase", fontWeight: 800, marginBottom: 10 }}>Diagnostics</div>
              <div style={{ display: "grid", gap: 8 }}>
                {diagnostics.alerts.map((alert) => (
                  <div key={alert.alertId} style={{ border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, padding: 10, background: alert.severity === "critical" ? "rgba(255,45,170,0.08)" : alert.severity === "warning" ? "rgba(255,215,0,0.08)" : "rgba(0,255,255,0.08)" }}>
                    <div style={{ fontSize: 10, fontWeight: 800, textTransform: "uppercase", color: alert.severity === "critical" ? "#FF2DAA" : alert.severity === "warning" ? "#FFD700" : "#00FFFF" }}>{alert.severity}</div>
                    <div style={{ marginTop: 4, fontSize: 11 }}>{alert.message}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}