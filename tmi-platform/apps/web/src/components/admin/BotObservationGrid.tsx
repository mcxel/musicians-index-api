"use client";

/**
 * Admin Bot Live Observer — POV switcher over real soft-launch / duty / activation bots.
 * Rule 20: real telemetry only; never fake a camera feed.
 */

import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import Link from "next/link";
import LobbyPreviewWindow from "@/components/lobby/LobbyPreviewWindow";
import { buildLobbyPreviewTile } from "@/lib/lobby/LobbyPreviewRuntime";
import { useLobbyPreviewBind } from "@/lib/lobby/useLobbyPreviewBind";
import type { BotObserveRow } from "@/app/api/admin/bots/observe/route";

type LoadState = "loading" | "ready" | "error";

type ObservePayload = {
  ok?: boolean;
  bots?: BotObserveRow[];
  softLaunch?: { namedCount: number; dutyBotsActive: number };
  health?: { total: number; active: number; healthy: number };
  recentOps?: Array<{ id: string; botId: string; detail: string; timestamp: number; roomId?: string }>;
};

function statusColor(status: string): string {
  const s = status.toLowerCase();
  if (s.includes("on-duty") || s === "active" || s === "healthy") return "#00FF88";
  if (s.includes("critical") || s.includes("offline") || s.includes("suspended")) return "#FF4444";
  if (s.includes("idle") || s.includes("paused") || s.includes("degraded")) return "#FFD700";
  return "#00FFFF";
}

function BotPovPreview({ bot }: { bot: BotObserveRow }) {
  const roomId = bot.currentRoom ?? "";
  const live = Boolean(bot.currentRoom && bot.roomLive);
  const { mediaStream, bindStatus } = useLobbyPreviewBind(roomId, {
    subscribed: live,
    focused: live,
    isLive: live,
  });

  if (!bot.currentRoom) {
    return (
      <div style={povEmpty}>
        <div style={{ fontSize: 11, fontWeight: 800, color: "#FFD700", letterSpacing: "0.12em" }}>NO ROOM BOUND</div>
        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", marginTop: 8, lineHeight: 1.5 }}>
          This bot is not in a live room. Surface: {bot.surface ?? "none"} · Task: {bot.currentTask ?? "none"}
        </p>
        {bot.lastAction && (
          <p style={{ fontSize: 11, color: "rgba(255,255,255,0.55)", marginTop: 10 }}>Last action: {bot.lastAction}</p>
        )}
      </div>
    );
  }

  if (!bot.roomLive) {
    return (
      <div style={povEmpty}>
        <div style={{ fontSize: 11, fontWeight: 800, color: "#00FFFF", letterSpacing: "0.12em" }}>LOCATION</div>
        <p style={{ fontSize: 14, fontWeight: 800, marginTop: 8 }}>{bot.currentRoom}</p>
        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", marginTop: 8, lineHeight: 1.5 }}>
          Room is not in GlobalLiveSessionRegistry — no live camera to show (honest empty).
        </p>
        <Link href={`/live/rooms/${bot.currentRoom}`} style={{ display: "inline-block", marginTop: 12, color: "#00FFFF", fontSize: 11, fontWeight: 700 }}>
          Open room route →
        </Link>
      </div>
    );
  }

  const preview = buildLobbyPreviewTile({
    roomId: bot.currentRoom,
    kind: "live",
    isLive: true,
    hasActivePerformer: Boolean(mediaStream),
  });

  return (
    <div style={{ display: "grid", gap: 10 }}>
      <div style={{ fontSize: 10, color: "rgba(255,255,255,0.45)", letterSpacing: "0.12em" }}>
        POV · {bot.currentRoom} · bind {bindStatus}
      </div>
      <div style={{ borderRadius: 12, overflow: "hidden", border: "1px solid rgba(0,255,255,0.25)", minHeight: 220 }}>
        <LobbyPreviewWindow
          preview={preview}
          accent="#00FFFF"
          performerInitial={bot.name.slice(0, 1).toUpperCase()}
          mediaStream={mediaStream}
          previewUrl={bot.roomPreviewUrl}
        />
      </div>
      <Link href={`/live/rooms/${bot.currentRoom}`} style={{ color: "#00FFFF", fontSize: 11, fontWeight: 700 }}>
        Enter room as admin →
      </Link>
    </div>
  );
}

export default function BotObservationGrid() {
  const [state, setState] = useState<LoadState>("loading");
  const [bots, setBots] = useState<BotObserveRow[]>([]);
  const [meta, setMeta] = useState<ObservePayload["softLaunch"]>();
  const [health, setHealth] = useState<ObservePayload["health"]>();
  const [ops, setOps] = useState<NonNullable<ObservePayload["recentOps"]>>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "duty" | "live-room">("all");

  const forbiddenRef = useRef(false);

  const load = useCallback(async () => {
    if (forbiddenRef.current) return;
    try {
      const r = await fetch("/api/admin/bots/observe", { credentials: "include", cache: "no-store" });
      if (r.status === 403) {
        forbiddenRef.current = true;
        setState("error");
        return;
      }
      if (!r.ok) throw new Error(String(r.status));
      const data = (await r.json()) as ObservePayload;
      const list = Array.isArray(data.bots) ? data.bots : [];
      setBots(list);
      setMeta(data.softLaunch);
      setHealth(data.health);
      setOps(Array.isArray(data.recentOps) ? data.recentOps : []);
      setSelectedId((prev) => prev ?? list[0]?.id ?? null);
      setState("ready");
    } catch {
      setState("error");
    }
  }, []);

  useEffect(() => {
    void load();
    const id = setInterval(() => {
      if (!forbiddenRef.current) void load();
    }, 8_000);
    return () => clearInterval(id);
  }, [load]);

  const visible = useMemo(() => {
    if (filter === "duty") return bots.filter((b) => b.source === "duty" || b.id.includes("bot-"));
    if (filter === "live-room") return bots.filter((b) => Boolean(b.currentRoom));
    return bots;
  }, [bots, filter]);

  const selected = bots.find((b) => b.id === selectedId) ?? visible[0] ?? null;

  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", padding: 18 }}>
      <div style={{ maxWidth: 1400, margin: "0 auto", display: "grid", gap: 14 }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", alignItems: "flex-end" }}>
          <div>
            <div style={{ fontSize: 10, letterSpacing: "0.28em", color: "#FF2DAA", textTransform: "uppercase", fontWeight: 800 }}>
              Bot Live Observer
            </div>
            <h1 style={{ margin: "6px 0 0", fontSize: 28 }}>See through their eyes</h1>
            <p style={{ margin: "8px 0 0", fontSize: 12, color: "rgba(255,255,255,0.45)", maxWidth: 560 }}>
              Soft-launch + duty + activation roster. Select a bot for POV context — live preview only when a real room session exists.
            </p>
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <Link href="/admin/bots" style={navLink}>Bots Hub →</Link>
            <Link href="/admin/overseer" style={navLink}>Overseer →</Link>
            <button type="button" onClick={() => void load()} style={{ ...navLink, cursor: "pointer", background: "transparent" }}>
              Refresh
            </button>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))", gap: 8 }}>
          {[
            { label: "Roster", value: state === "ready" ? String(bots.length) : "—" },
            { label: "Named active", value: health ? String(health.active) : "—" },
            { label: "Duty active", value: meta ? String(meta.dutyBotsActive) : "—" },
            { label: "Healthy", value: health ? String(health.healthy) : "—" },
          ].map((m) => (
            <div key={m.label} style={{ border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, padding: "10px 12px", background: "rgba(0,0,0,0.35)" }}>
              <div style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", letterSpacing: "0.12em" }}>{m.label.toUpperCase()}</div>
              <div style={{ fontSize: 18, fontWeight: 900, marginTop: 4 }}>{m.value}</div>
            </div>
          ))}
        </div>

        <div style={{ display: "flex", gap: 6 }}>
          {(["all", "duty", "live-room"] as const).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              style={{
                padding: "6px 12px",
                borderRadius: 8,
                border: `1px solid ${filter === f ? "#00FFFF" : "rgba(255,255,255,0.15)"}`,
                background: filter === f ? "rgba(0,255,255,0.12)" : "transparent",
                color: filter === f ? "#00FFFF" : "rgba(255,255,255,0.5)",
                fontSize: 10,
                fontWeight: 800,
                letterSpacing: "0.1em",
                cursor: "pointer",
                textTransform: "uppercase",
              }}
            >
              {f}
            </button>
          ))}
        </div>

        {state === "loading" && <p style={{ color: "rgba(255,255,255,0.4)" }}>Loading bot telemetry…</p>}
        {state === "error" && <p style={{ color: "#ff9b9b" }}>Unable to load bot observe feed. Confirm admin session.</p>}

        {state === "ready" && (
          <div style={{ display: "grid", gridTemplateColumns: "minmax(280px,360px) 1fr", gap: 14, alignItems: "start" }}>
            <div style={{ display: "grid", gap: 8, maxHeight: "70vh", overflowY: "auto" }}>
              {visible.length === 0 ? (
                <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", padding: 16 }}>No bots match this filter.</p>
              ) : (
                visible.map((bot) => {
                  const active = selected?.id === bot.id;
                  const color = statusColor(bot.status);
                  return (
                    <button
                      key={bot.id}
                      type="button"
                      onClick={() => setSelectedId(bot.id)}
                      style={{
                        textAlign: "left",
                        border: `1px solid ${active ? color : "rgba(255,255,255,0.12)"}`,
                        borderRadius: 12,
                        background: active ? `${color}14` : "rgba(0,0,0,0.32)",
                        padding: 12,
                        cursor: "pointer",
                        color: "#fff",
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                        <div style={{ fontSize: 13, fontWeight: 800 }}>{bot.name}</div>
                        <span style={{ fontSize: 9, fontWeight: 800, color, textTransform: "uppercase" }}>{bot.status}</span>
                      </div>
                      <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", marginTop: 4 }}>
                        {bot.id} · {bot.source}
                        {bot.labeledAsBot ? " · BOT" : ""}
                      </div>
                      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.55)", marginTop: 6 }}>
                        {bot.currentRoom ? `Room ${bot.currentRoom}` : bot.surface ? `Surface ${bot.surface}` : "No room"}
                        {bot.roomLive ? " · LIVE" : ""}
                      </div>
                    </button>
                  );
                })
              )}
            </div>

            <div style={{ border: "1px solid rgba(0,255,255,0.25)", borderRadius: 14, background: "rgba(0,0,0,0.4)", padding: 16, minHeight: 360 }}>
              {!selected ? (
                <p style={{ color: "rgba(255,255,255,0.4)" }}>Select a bot to observe.</p>
              ) : (
                <div style={{ display: "grid", gap: 14 }}>
                  <div>
                    <div style={{ fontSize: 10, letterSpacing: "0.2em", color: "#00FFFF", fontWeight: 800 }}>POV SWITCHER</div>
                    <h2 style={{ margin: "6px 0 0", fontSize: 22 }}>{selected.name}</h2>
                    <p style={{ margin: "6px 0 0", fontSize: 12, color: "rgba(255,255,255,0.45)" }}>
                      Status {selected.status}
                      {selected.health ? ` · ${selected.health}` : ""}
                      {selected.currentTask ? ` · ${selected.currentTask}` : ""}
                    </p>
                  </div>
                  <BotPovPreview bot={selected} />
                  <div>
                    <div style={{ fontSize: 9, letterSpacing: "0.15em", color: "rgba(255,255,255,0.35)", marginBottom: 8 }}>RECENT OPS (PLATFORM)</div>
                    {ops.length === 0 ? (
                      <p style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>No operations logged yet.</p>
                    ) : (
                      <div style={{ display: "grid", gap: 6, maxHeight: 180, overflowY: "auto" }}>
                        {ops.slice(0, 12).map((op) => (
                          <div key={op.id} style={{ fontSize: 10, color: "rgba(255,255,255,0.55)", borderBottom: "1px solid rgba(255,255,255,0.06)", paddingBottom: 6 }}>
                            <span style={{ color: "#AA2DFF" }}>{op.botId}</span> · {op.detail}
                            {op.roomId ? ` · ${op.roomId}` : ""}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

const navLink: CSSProperties = {
  fontSize: 11,
  fontWeight: 700,
  color: "#00FFFF",
  textDecoration: "none",
  border: "1px solid rgba(0,255,255,0.3)",
  borderRadius: 8,
  padding: "7px 12px",
};

const povEmpty: CSSProperties = {
  border: "1px dashed rgba(255,255,255,0.18)",
  borderRadius: 12,
  padding: 20,
  background: "rgba(255,255,255,0.03)",
  minHeight: 180,
};
