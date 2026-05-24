"use client";

import { useEffect, useRef, useState } from "react";

interface DirectorPreviewMonitorProps {
  audienceFeedUrl?: string;     // actual audience feed src (iframe / img)
  localVideoRef?: React.RefObject<HTMLVideoElement | null>;
  viewerCount?: number;
  isLive?: boolean;
}

let cssInjected = false;
const MONITOR_CSS = `
@keyframes monitorBeat {
  0%,100% { box-shadow: 0 0 0 0 rgba(0,229,255,0); }
  50%      { box-shadow: 0 0 0 4px rgba(0,229,255,0.2); }
}
`;

export default function DirectorPreviewMonitor({
  audienceFeedUrl,
  localVideoRef,
  viewerCount = 0,
  isLive = false,
}: DirectorPreviewMonitorProps) {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState(0.25);
  const [dragging, setDragging] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const dragOffset = useRef({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!cssInjected && typeof document !== "undefined") {
      cssInjected = true;
      const s = document.createElement("style");
      s.textContent = MONITOR_CSS;
      document.head.appendChild(s);
    }
    // Initial position: bottom-right
    if (typeof window !== "undefined") {
      setPos({ x: window.innerWidth - 216, y: window.innerHeight - 148 });
    }
  }, []);

  function onMouseDown(e: React.MouseEvent) {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    dragOffset.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    setDragging(true);
  }

  useEffect(() => {
    if (!dragging) return;
    function onMove(e: MouseEvent) {
      setPos({ x: e.clientX - dragOffset.current.x, y: e.clientY - dragOffset.current.y });
    }
    function onUp() { setDragging(false); }
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => { window.removeEventListener("mousemove", onMove); window.removeEventListener("mouseup", onUp); };
  }, [dragging]);

  const W = expanded ? 320 : 180;
  const H = expanded ? 200 : 110;

  return (
    <div
      ref={containerRef}
      style={{
        position: "fixed",
        left: pos.x,
        top: pos.y,
        width: W,
        height: H,
        zIndex: 9100,
        opacity,
        borderRadius: 10,
        overflow: "hidden",
        background: "#050510",
        border: `1px solid ${isLive ? "rgba(255,45,45,0.5)" : "rgba(0,229,255,0.25)"}`,
        boxShadow: isLive ? "0 0 20px rgba(255,45,45,0.15)" : "none",
        cursor: dragging ? "grabbing" : "grab",
        transition: "opacity 0.3s, width 0.3s, height 0.3s, box-shadow 0.3s",
        animation: isLive ? "monitorBeat 2s ease-in-out infinite" : undefined,
        userSelect: "none",
      }}
      onMouseDown={onMouseDown}
      onMouseEnter={() => setOpacity(1)}
      onMouseLeave={() => setOpacity(0.25)}
    >
      {/* Audience view */}
      <div style={{ width: "100%", height: "calc(100% - 28px)", position: "relative", overflow: "hidden" }}>
        {audienceFeedUrl ? (
          <iframe
            src={audienceFeedUrl}
            style={{ width: "100%", height: "100%", border: "none", pointerEvents: "none" }}
            title="Audience preview"
          />
        ) : localVideoRef?.current ? (
          <video
            ref={localVideoRef as React.RefObject<HTMLVideoElement>}
            muted
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          <div style={{
            width: "100%", height: "100%",
            display: "flex", alignItems: "center", justifyContent: "center",
            flexDirection: "column", gap: 4,
          }}>
            <div style={{ fontSize: 18 }}>👁</div>
            <div style={{ color: "rgba(0,229,255,0.5)", fontSize: 9, fontWeight: 800, letterSpacing: "0.15em" }}>
              AUDIENCE VIEW
            </div>
          </div>
        )}

        {/* Live badge */}
        {isLive && (
          <div style={{
            position: "absolute", top: 5, left: 6,
            background: "rgba(220,30,30,0.9)", borderRadius: 4,
            padding: "1px 6px", fontSize: 8, fontWeight: 900,
            color: "#fff", letterSpacing: "0.15em",
            display: "flex", alignItems: "center", gap: 4,
          }}>
            <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#fff", display: "inline-block", animation: "pulse 1s infinite" }} />
            LIVE
          </div>
        )}

        {/* Viewer count */}
        <div style={{
          position: "absolute", top: 5, right: 6,
          background: "rgba(0,0,0,0.6)", borderRadius: 4,
          padding: "1px 6px", fontSize: 8, color: "rgba(0,229,255,0.8)", fontWeight: 800,
        }}>
          👁 {viewerCount.toLocaleString()}
        </div>
      </div>

      {/* Bottom bar */}
      <div style={{
        height: 28, background: "rgba(0,0,0,0.8)",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 8px",
      }}>
        <span style={{ fontSize: 8, color: "rgba(255,255,255,0.35)", fontWeight: 800, letterSpacing: "0.15em" }}>
          DIRECTOR VIEW
        </span>
        <button
          onClick={(e) => { e.stopPropagation(); setExpanded(x => !x); }}
          onMouseDown={e => e.stopPropagation()}
          style={{
            background: "none", border: "1px solid rgba(255,255,255,0.15)",
            borderRadius: 3, color: "rgba(255,255,255,0.4)",
            fontSize: 9, padding: "1px 6px", cursor: "pointer",
          }}
        >
          {expanded ? "⊟" : "⊞"}
        </button>
      </div>
    </div>
  );
}
