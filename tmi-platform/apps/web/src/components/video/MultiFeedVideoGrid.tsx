"use client";

import { useEffect, useState, useCallback } from "react";
import { initDocking, dockFeed, undockFeed, setDockMode, focusFeed, subscribeToDocking, type DockingState, type DockMode } from "@/lib/video/LiveWindowDockingEngine";
import { initPiP, openPiP, closePiP, swapMainWithPiP, subscribeToPiP, type PiPState, type PiPPosition } from "@/lib/video/PiPTransitionEngine";
import { initLatencyBalancer, reportFeedLatency, subscribeToLatencyBalancer, type LatencyBalancerState } from "@/lib/video/FeedLatencyBalancer";
import { initFeedBitrate, reportNetworkConditions, lockBitrateProfile, subscribeToFeedBitrate, type FeedBitrateState, type BitrateProfile } from "@/lib/video/AdaptiveBitrateRuntime";

export interface VideoFeed {
  feedId: string;
  label: string;
  streamUrl?: string;
  thumbnailUrl?: string;
  isLive?: boolean;
  viewerCount?: number;
}

interface MultiFeedVideoGridProps {
  sessionId: string;
  feeds: VideoFeed[];
  initialMode?: DockMode;
  showControls?: boolean;
}

const DOCK_MODES: DockMode[] = ["grid", "side-dock", "theater", "fullscreen"];
const BITRATE_OPTIONS: BitrateProfile[] = ["4k", "1080p", "720p", "480p", "360p"];
const PIP_POSITIONS: PiPPosition[] = ["top-left", "top-right", "bottom-left", "bottom-right"];

export default function MultiFeedVideoGrid({ sessionId, feeds, initialMode = "grid", showControls = true }: MultiFeedVideoGridProps) {
  const [docking, setDocking] = useState<DockingState | null>(null);
  const [pip, setPip] = useState<PiPState | null>(null);
  const [latency, setLatency] = useState<LatencyBalancerState | null>(null);
  const [bitrates, setBitrates] = useState<Record<string, FeedBitrateState>>({});

  useEffect(() => {
    initDocking(sessionId, initialMode);
    initPiP(sessionId, feeds[0]?.feedId ?? "");
    initLatencyBalancer(sessionId, feeds.map(f => f.feedId));
    feeds.forEach(f => initFeedBitrate(f.feedId));

    // Dock all feeds into default slots
    const slotMap = ["primary", "secondary", "tertiary", "sidebar-top", "sidebar-bottom"] as const;
    feeds.slice(0, 5).forEach((feed, i) => {
      dockFeed(sessionId, feed.feedId, slotMap[i] ?? "overlay", feed.label);
    });

    const unsubs = [
      subscribeToDocking(sessionId, setDocking),
      subscribeToPiP(sessionId, setPip),
      subscribeToLatencyBalancer(sessionId, setLatency),
    ];

    const bitrateUnsubs = feeds.map(f =>
      subscribeToFeedBitrate(f.feedId, (state) => {
        setBitrates(prev => ({ ...prev, [f.feedId]: state }));
      })
    );

    // Simulate latency reports
    const latencyInterval = setInterval(() => {
      feeds.forEach(f => {
        reportFeedLatency(sessionId, f.feedId, Math.round(100 + Math.random() * 400));
      });
    }, 3000);

    // Simulate network conditions
    const networkInterval = setInterval(() => {
      feeds.forEach(f => {
        reportNetworkConditions(f.feedId, Math.round(2000 + Math.random() * 8000), Math.round(40 + Math.random() * 60));
      });
    }, 5000);

    return () => {
      unsubs.forEach(u => u());
      bitrateUnsubs.forEach(u => u());
      clearInterval(latencyInterval);
      clearInterval(networkInterval);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]);

  const handleModeSwitch = useCallback((mode: DockMode) => setDockMode(sessionId, mode), [sessionId]);
  const handleFocus = useCallback((feedId: string) => focusFeed(sessionId, feedId), [sessionId]);
  const handleUndock = useCallback((feedId: string) => undockFeed(sessionId, feedId), [sessionId]);
  const handleOpenPiP = useCallback((feedId: string, pos: PiPPosition) => openPiP(sessionId, feedId, pos), [sessionId]);
  const handleClosePiP = useCallback((feedId: string) => closePiP(sessionId, feedId), [sessionId]);
  const handleSwapPiP = useCallback((feedId: string) => swapMainWithPiP(sessionId, feedId), [sessionId]);
  const handleBitratelock = useCallback((feedId: string, profile: BitrateProfile) => lockBitrateProfile(feedId, profile), []);

  const primaryWindow = docking?.windows.find(w => w.slot === "primary");
  const sideWindows = docking?.windows.filter(w => w.slot !== "primary") ?? [];

  return (
    <div style={{ background: "#07071a", border: "1px solid #1e1e3a", borderRadius: 16, overflow: "hidden", fontFamily: "'Inter', sans-serif", color: "#e2e8f0" }}>
      {/* Toolbar */}
      {showControls && (
        <div style={{ display: "flex", gap: 8, padding: "10px 16px", background: "#0f0f1a", borderBottom: "1px solid #1e1e3a", alignItems: "center", flexWrap: "wrap" }}>
          <span style={{ fontSize: 11, color: "#64748b", fontWeight: 700, letterSpacing: 1 }}>LAYOUT</span>
          {DOCK_MODES.map(mode => (
            <button key={mode} onClick={() => handleModeSwitch(mode)} style={{
              padding: "4px 10px", borderRadius: 6, fontSize: 11, fontWeight: 600, cursor: "pointer", border: "none",
              background: docking?.dockMode === mode ? "#06b6d4" : "#1e1e3a",
              color: docking?.dockMode === mode ? "#0f0f1a" : "#94a3b8",
            }}>{mode}</button>
          ))}
          <span style={{ marginLeft: "auto", fontSize: 10, color: "#475569" }}>
            {latency?.preferredFeedId ? `Preferred: ${latency.preferredFeedId}` : ""}
          </span>
        </div>
      )}

      {/* Main grid */}
      <div style={{ display: "flex", height: 480, position: "relative" }}>
        {/* Primary feed */}
        <div style={{ flex: docking?.dockMode === "theater" ? 4 : docking?.dockMode === "grid" ? 2 : 3, background: "#0a0a1a", position: "relative", cursor: "pointer" }}
          onClick={() => primaryWindow && handleFocus(primaryWindow.feedId)}>
          {primaryWindow ? (
            <FeedCell feed={feeds.find(f => f.feedId === primaryWindow.feedId)!} bitrate={bitrates[primaryWindow.feedId]} focused={docking?.focusedFeedId === primaryWindow.feedId} large />
          ) : (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "#475569" }}>No primary feed</div>
          )}
        </div>

        {/* Side feeds */}
        {docking?.dockMode !== "fullscreen" && sideWindows.length > 0 && (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", borderLeft: "1px solid #1e1e3a" }}>
            {sideWindows.map(w => {
              const feed = feeds.find(f => f.feedId === w.feedId);
              if (!feed) return null;
              return (
                <div key={w.feedId} style={{ flex: 1, borderBottom: "1px solid #1e1e3a", position: "relative", cursor: "pointer" }}
                  onClick={() => handleFocus(w.feedId)}>
                  <FeedCell feed={feed} bitrate={bitrates[w.feedId]} focused={docking?.focusedFeedId === w.feedId} />
                  <div style={{ position: "absolute", top: 4, right: 4, display: "flex", gap: 4 }}>
                    <button onClick={e => { e.stopPropagation(); handleSwapPiP(w.feedId); }} style={miniBtn}>Swap</button>
                    <button onClick={e => { e.stopPropagation(); handleOpenPiP(w.feedId, "bottom-right"); }} style={miniBtn}>PiP</button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* PiP overlay windows */}
        {pip?.pipWindows.map(pipW => {
          const feed = feeds.find(f => f.feedId === pipW.feedId);
          if (!feed) return null;
          const posStyle: React.CSSProperties = {
            position: "absolute",
            width: "22%", height: "22%",
            ...(pipW.position === "top-left"     ? { top: 8, left: 8 }     : {}),
            ...(pipW.position === "top-right"    ? { top: 8, right: 8 }    : {}),
            ...(pipW.position === "bottom-left"  ? { bottom: 8, left: 8 }  : {}),
            ...(pipW.position === "bottom-right" ? { bottom: 8, right: 8 } : {}),
            border: "1px solid #06b6d4",
            borderRadius: 8,
            overflow: "hidden",
            zIndex: pipW.zIndex,
            cursor: "pointer",
          };
          return (
            <div key={pipW.feedId} style={posStyle}>
              <FeedCell feed={feed} bitrate={bitrates[pipW.feedId]} compact />
              <button onClick={() => handleClosePiP(pipW.feedId)} style={{ position: "absolute", top: 2, right: 2, ...miniBtn, padding: "1px 5px" }}>✕</button>
            </div>
          );
        })}
      </div>

      {/* Feed list / controls */}
      {showControls && (
        <div style={{ padding: "10px 16px", background: "#0f0f1a", borderTop: "1px solid #1e1e3a", display: "flex", gap: 8, overflowX: "auto" }}>
          {feeds.map(feed => (
            <div key={feed.feedId} style={{ flexShrink: 0, background: "#1a1a2e", borderRadius: 8, padding: "8px 10px", minWidth: 140 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#e2e8f0", marginBottom: 4 }}>{feed.label}</div>
              {feed.isLive && <div style={{ fontSize: 9, color: "#ef4444", fontWeight: 700, letterSpacing: 1 }}>LIVE · {feed.viewerCount?.toLocaleString()}</div>}
              <div style={{ fontSize: 10, color: "#64748b" }}>{bitrates[feed.feedId]?.currentProfile ?? "—"} · {latency?.feeds.find(f => f.feedId === feed.feedId)?.latencyMs ?? 0}ms</div>
              <div style={{ display: "flex", gap: 4, marginTop: 6 }}>
                {BITRATE_OPTIONS.slice(0, 3).map(p => (
                  <button key={p} onClick={() => handleBitratelock(feed.feedId, p)} style={{ ...miniBtn, background: bitrates[feed.feedId]?.currentProfile === p ? "#06b6d4" : "#0f0f1a", color: bitrates[feed.feedId]?.currentProfile === p ? "#0f0f1a" : "#94a3b8" }}>{p}</button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const miniBtn: React.CSSProperties = {
  fontSize: 9, padding: "2px 6px", background: "#1e1e3a", border: "1px solid #334155",
  borderRadius: 4, color: "#94a3b8", cursor: "pointer",
};

function FeedCell({ feed, bitrate, focused, large, compact }: { feed: VideoFeed; bitrate?: FeedBitrateState; focused?: boolean; large?: boolean; compact?: boolean }) {
  if (!feed) return null;
  return (
    <div style={{ width: "100%", height: "100%", background: focused ? "#0a1628" : "#060612", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", position: "relative" }}>
      {feed.isLive && !compact && (
        <div style={{ position: "absolute", top: 8, left: 8, background: "#ef4444", borderRadius: 4, padding: "2px 6px", fontSize: 9, fontWeight: 700, color: "#fff", letterSpacing: 1 }}>LIVE</div>
      )}
      {focused && !compact && (
        <div style={{ position: "absolute", top: 8, right: 8, background: "#06b6d4", borderRadius: 4, padding: "2px 6px", fontSize: 9, fontWeight: 700, color: "#0f0f1a", letterSpacing: 1 }}>FOCUSED</div>
      )}
      <div style={{ fontSize: compact ? 16 : large ? 32 : 22, marginBottom: compact ? 2 : 8 }}>📺</div>
      <div style={{ fontSize: compact ? 9 : 12, fontWeight: 600, color: "#94a3b8", textAlign: "center", padding: "0 8px" }}>{feed.label}</div>
      {bitrate && !compact && (
        <div style={{ fontSize: 10, color: "#475569", marginTop: 4 }}>{bitrate.currentProfile}</div>
      )}
      {feed.viewerCount && !compact && (
        <div style={{ fontSize: 10, color: "#64748b" }}>{feed.viewerCount.toLocaleString()} viewers</div>
      )}
    </div>
  );
}
