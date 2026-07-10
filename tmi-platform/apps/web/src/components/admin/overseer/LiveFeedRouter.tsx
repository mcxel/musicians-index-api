"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { DeckButton, DeckChip, MonitorViewport } from "@/components/admin/overseer/AdminDesignSystem";

type FeedSource =
  | "Boardroom Live"
  | "Cypher Live"
  | "Battle Ring"
  | "Venue Cam"
  | "Concert Feed"
  | "Security Feed"
  | "Sponsor Feed";

interface FeedItem {
  id: string;
  label: string;
  meta: string;
  ts: string;
}

interface FeedSnapshot {
  source: string;
  status: "LIVE" | "IDLE" | "RECORDING" | "RECONNECTING";
  viewers: number;
  items: FeedItem[];
}

interface LiveSessionSummary {
  previewUrl?: string | null;
  thumbnailUrl?: string | null;
}

const FEEDS: FeedSource[] = [
  "Boardroom Live",
  "Cypher Live",
  "Battle Ring",
  "Venue Cam",
  "Concert Feed",
  "Security Feed",
  "Sponsor Feed",
];

const POLL_INTERVAL_MS = 8000;
const ROSE_FALLBACK_URL =
  process.env.NEXT_PUBLIC_DEFAULT_MONITOR_VIDEO?.trim() ||
  process.env.NEXT_PUBLIC_OBSERVATORY_ROSE_VIDEO_URL?.trim() ||
  "";

export default function LiveFeedRouter() {
  const [active, setActive] = useState<FeedSource>("Boardroom Live");
  const [snapshot, setSnapshot] = useState<FeedSnapshot | null>(null);
  const [reconnecting, setReconnecting] = useState(false);
  const [muted, setMuted] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [bitrateKbps, setBitrateKbps] = useState(1884);
  const [audioLevel, setAudioLevel] = useState(62);
  const [liveCount, setLiveCount] = useState(0);
  const [livePreviewUrl, setLivePreviewUrl] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const monitorRef = useRef<HTMLVideoElement | null>(null);

  const poll = useCallback(async (source: FeedSource) => {
    if (abortRef.current) abortRef.current.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;

    try {
      const res = await fetch(`/api/admin/feeds?source=${encodeURIComponent(source)}`, {
        signal: ctrl.signal,
      });
      if (!res.ok) throw new Error(String(res.status));
      const data = (await res.json()) as FeedSnapshot;
      setSnapshot(data);
      setReconnecting(false);
    } catch (error) {
      if ((error as Error).name !== "AbortError") {
        setReconnecting(true);
      }
    }
  }, []);

  useEffect(() => {
    void poll(active);
    const id = setInterval(() => {
      void poll(active);
      setAudioLevel((prev) => {
        const next = prev + (Math.random() > 0.5 ? 8 : -7);
        return Math.max(10, Math.min(100, next));
      });
      setBitrateKbps((prev) => {
        const next = prev + (Math.random() > 0.5 ? 24 : -20);
        return Math.max(900, Math.min(4200, next));
      });
    }, POLL_INTERVAL_MS);

    return () => {
      clearInterval(id);
      abortRef.current?.abort();
    };
  }, [active, poll]);

  useEffect(() => {
    if (monitorRef.current) {
      monitorRef.current.muted = muted;
    }
  }, [muted]);

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
    }, POLL_INTERVAL_MS);

    return () => {
      mounted = false;
      clearInterval(id);
    };
  }, []);

  const status = reconnecting ? "RECONNECTING" : snapshot?.status ?? "LIVE";
  const viewers = snapshot?.viewers ?? 0;
  const feedItems = snapshot?.items ?? [];

  const signalColor = useMemo(() => {
    if (status === "RECONNECTING") return "#facc15";
    if (status === "RECORDING") return "#fb923c";
    if (status === "IDLE") return "#a1a1aa";
    return "#00ff88";
  }, [status]);

  const hasLiveSignal = (status === "LIVE" || status === "RECORDING") && liveCount > 0;
  const resolvedMediaSrc = hasLiveSignal ? (livePreviewUrl || ROSE_FALLBACK_URL) : ROSE_FALLBACK_URL;
  const showVideo = resolvedMediaSrc.length > 0;
  const stateLabel = hasLiveSignal
    ? "LIVE"
    : status === "IDLE"
      ? "STANDBY"
      : status === "RECONNECTING"
        ? "RECONNECTING"
        : "STANDBY";

  return (
    <section style={{ height: "100%", display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 6 }}>
        <DeckChip label="Status" value={status} />
        <DeckChip label="Viewers" value={viewers > 0 ? viewers.toLocaleString() : "--"} />
        <DeckChip label="Bitrate" value={`${bitrateKbps} kbps`} />
        <DeckChip label="Audio" value={muted ? "Muted" : `${audioLevel}%`} />
      </div>

      <MonitorViewport
        title="TV Screen Router"
        sub={`${active} · Source active`}
        footer={
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            <DeckButton onClick={() => setMuted((prev) => !prev)}>{muted ? "Unmute" : "Mute"}</DeckButton>
            <DeckButton onClick={() => setFullscreen((prev) => !prev)} active={fullscreen}>
              {fullscreen ? "Restore" : "Fullscreen"}
            </DeckButton>
            <DeckButton>Snapshot</DeckButton>
            <DeckButton>Record</DeckButton>
            <DeckButton>Pop Out</DeckButton>
          </div>
        }
      >
        {showVideo ? (
          <video
            ref={monitorRef}
            src={resolvedMediaSrc}
            autoPlay
            muted={muted}
            loop
            playsInline
            style={{
              width: "100%",
              height: fullscreen ? "min(55vh, 480px)" : "100%",
              objectFit: "cover",
              filter: active === "Security Feed" ? "saturate(0) contrast(1.15)" : "saturate(0.95)",
              transition: "opacity 380ms ease",
            }}
          />
        ) : (
          <div
            style={{
              width: "100%",
              height: fullscreen ? "min(55vh, 480px)" : "100%",
              display: "grid",
              placeItems: "center",
              background: "radial-gradient(circle at center, rgba(16,20,28,0.92), #030405)",
              color: "rgba(255,255,255,0.78)",
              letterSpacing: "0.14em",
              fontSize: 11,
              fontWeight: 800,
              textTransform: "uppercase",
            }}
          >
            NO SIGNAL · WAITING FOR FEED
          </div>
        )}

        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(0,0,0,0.2), transparent 30%, rgba(0,0,0,0.55) 100%)" }} />
        <div style={{ position: "absolute", inset: 0, backgroundImage: "repeating-linear-gradient(0deg, rgba(255,255,255,0.03) 0px, rgba(255,255,255,0.03) 1px, transparent 1px, transparent 4px)", opacity: 0.28, pointerEvents: "none" }} />

        <div style={{ position: "absolute", top: 8, left: 8, display: "flex", alignItems: "center", gap: 6, borderRadius: 999, border: `1px solid ${signalColor}66`, background: "rgba(0,0,0,0.62)", padding: "3px 7px" }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: signalColor, boxShadow: `0 0 8px ${signalColor}` }} />
          <span style={{ color: "#fff", fontSize: 8, fontWeight: 900, letterSpacing: "0.12em", textTransform: "uppercase" }}>{stateLabel}</span>
        </div>

        <div style={{ position: "absolute", right: 8, top: 8, borderRadius: 999, border: "1px solid rgba(255,216,143,0.45)", background: "rgba(0,0,0,0.62)", padding: "3px 7px", color: "#ffe9bb", fontSize: 8, fontWeight: 900, letterSpacing: "0.08em", textTransform: "uppercase" }}>
          {viewers > 0 ? `${viewers.toLocaleString()} live` : "No live count"}
        </div>

        <div style={{ position: "absolute", left: 10, right: 10, bottom: 10, display: "grid", gridTemplateColumns: "1fr auto", alignItems: "end", gap: 8 }}>
          <div>
            <div style={{ color: "#fff", fontSize: 12, fontWeight: 900, letterSpacing: "0.04em", textTransform: "uppercase" }}>{active}</div>
            <div style={{ color: "rgba(255,255,255,0.78)", fontSize: 9 }}>
              {hasLiveSignal ? "LIVE SOURCE" : showVideo ? "ROSE STANDBY FEED" : "OFFLINE STANDBY"} · audio level {audioLevel}% · bitrate {bitrateKbps} kbps
            </div>
          </div>
          <div style={{ width: 90, height: 8, borderRadius: 999, background: "rgba(255,255,255,0.15)", overflow: "hidden" }}>
            <div style={{ width: `${audioLevel}%`, height: "100%", borderRadius: 999, background: "linear-gradient(90deg, #22c55e, #facc15, #ef4444)" }} />
          </div>
        </div>
      </MonitorViewport>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 6 }}>
        {FEEDS.map((source) => (
          <DeckButton key={source} onClick={() => setActive(source)} active={source === active}>
            {source.replace(" Feed", "").replace(" Live", "")}
          </DeckButton>
        ))}
      </div>

      {feedItems.length > 0 ? (
        <div style={{ borderRadius: 8, border: "1px solid rgba(241,181,66,0.24)", background: "rgba(20,9,12,0.66)", padding: "7px 8px", display: "grid", gap: 5 }}>
          {feedItems.slice(0, 3).map((item) => (
            <div key={item.id} style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 8 }}>
              <div style={{ color: "#ffe9bb", fontSize: 9 }}>{item.label}</div>
              <div style={{ color: "rgba(255,216,143,0.72)", fontSize: 8, textTransform: "uppercase" }}>{item.meta} · {item.ts}</div>
            </div>
          ))}
        </div>
      ) : null}
    </section>
  );
}
