"use client";

/**
 * ObservatoryDeck — Runtime Health widget for Overseer workspaces.
 * Rule 20: room/runtime status from GlobalLiveSessionRegistry via /api/live/go only.
 * Honest empty / error / loading — never seeded fake rooms or fallback vanity counts.
 */

import { useEffect, useState } from "react";
import Link from "next/link";

import { Canister, DeckChip, MetricCard } from "@/components/admin/overseer/AdminDesignSystem";

type LiveSessionRow = {
  roomId?: string;
  title?: string;
  category?: string;
  displayName?: string;
  stageState?: string;
  streamHealth?: string;
  viewerCount?: number;
};

type LoadState = "loading" | "live" | "empty" | "error";

function healthTone(health?: string): string {
  if (health === "excellent" || health === "good") return "#00ff88";
  if (health === "degraded") return "#f59e0b";
  if (health === "critical") return "#fb7185";
  return "rgba(255,216,143,0.72)";
}

export default function ObservatoryDeck() {
  const [sessions, setSessions] = useState<LiveSessionRow[]>([]);
  const [status, setStatus] = useState<LoadState>("loading");

  useEffect(() => {
    let active = true;

    const pollSessions = async () => {
      try {
        const res = await fetch("/api/live/go", { cache: "no-store" });
        if (!res.ok) {
          if (active) {
            setSessions([]);
            setStatus("error");
          }
          return;
        }
        const data = (await res.json()) as { sessions?: LiveSessionRow[] };
        if (!active) return;

        const next = data.sessions ?? [];
        setSessions(next);
        setStatus(next.length > 0 ? "live" : "empty");
      } catch {
        if (active) {
          setSessions([]);
          setStatus("error");
        }
      }
    };

    void pollSessions();
    const id = setInterval(() => {
      void pollSessions();
    }, 10000);

    return () => {
      active = false;
      clearInterval(id);
    };
  }, []);

  const categoryCount = (needle: string) =>
    sessions.filter((s) => (s.category ?? "").toLowerCase() === needle).length;

  const battleRooms = categoryCount("battle");
  const cypherRooms = categoryCount("cypher");
  const challengeRooms = categoryCount("challenge");
  const otherRooms = Math.max(0, sessions.length - battleRooms - cypherRooms - challengeRooms);

  return (
    <Canister title="Observatory Deck" status="live" rightLabel="global live registry">
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 8, marginBottom: 8 }}>
        <MetricCard
          title="Active Sessions"
          value={status === "loading" ? "…" : status === "error" ? "—" : sessions.length}
          tone="cyan"
        />
        <MetricCard
          title="Source"
          value="Registry"
          tone={status === "live" ? "green" : status === "error" ? "amber" : "amber"}
        />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 6, marginBottom: 8 }}>
        <DeckChip label="Battle" value={status === "live" ? String(battleRooms) : "0"} />
        <DeckChip label="Cypher" value={status === "live" ? String(cypherRooms) : "0"} />
        <DeckChip label="Challenge" value={status === "live" ? String(challengeRooms) : "0"} />
        <DeckChip label="Other" value={status === "live" ? String(otherRooms) : "0"} />
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr auto",
          alignItems: "center",
          gap: 6,
          marginBottom: 6,
          borderBottom: "1px solid rgba(241,181,66,0.28)",
          paddingBottom: 4,
        }}
      >
        <div style={{ color: "#f4d07f", fontSize: 9, textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 800 }}>
          Live Activity Feed
        </div>
        <div style={{ color: "rgba(255,216,143,0.72)", fontSize: 9, fontWeight: 800 }}>
          {status === "loading" ? "loading…" : status === "error" ? "unavailable" : `${sessions.length} live`}
        </div>
      </div>

      <div style={{ display: "grid", gap: 6, marginBottom: 8, minHeight: 72 }}>
        {status === "loading" && (
          <div style={{ color: "rgba(255,216,143,0.7)", fontSize: 10 }}>Loading live sessions…</div>
        )}
        {status === "error" && (
          <div style={{ color: "#fb7185", fontSize: 10 }}>
            Unable to load GlobalLiveSessionRegistry. Retry shortly.
          </div>
        )}
        {status === "empty" && (
          <div style={{ color: "rgba(255,216,143,0.7)", fontSize: 10 }}>
            No active rooms. Sessions appear here when creators go live.
          </div>
        )}
        {status === "live" &&
          sessions.slice(0, 12).map((session, index) => (
            <div
              key={session.roomId ?? `${session.title ?? "room"}-${index}`}
              style={{
                borderRadius: 8,
                border: "1px solid rgba(241,181,66,0.22)",
                background: "linear-gradient(180deg, rgba(25,12,14,0.8), rgba(15,7,10,0.86))",
                padding: "7px 8px",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", gap: 8, alignItems: "center" }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ color: "#ffe8b5", fontSize: 10, fontWeight: 800 }}>
                    {session.title || session.displayName || session.roomId || "Live Room"}
                  </div>
                  <div style={{ marginTop: 2, color: "rgba(255,216,143,0.72)", fontSize: 8 }}>
                    {(session.category ?? "live").toUpperCase()}
                    {session.stageState ? ` · ${session.stageState}` : ""}
                    {typeof session.viewerCount === "number" ? ` · ${session.viewerCount} viewers` : ""}
                  </div>
                </div>
                <span
                  style={{
                    borderRadius: 999,
                    border: `1px solid ${healthTone(session.streamHealth)}55`,
                    background: `${healthTone(session.streamHealth)}20`,
                    color: healthTone(session.streamHealth),
                    fontSize: 8,
                    fontWeight: 900,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    padding: "2px 6px",
                    flexShrink: 0,
                  }}
                >
                  {session.streamHealth ?? session.stageState ?? "LIVE"}
                </span>
              </div>
            </div>
          ))}
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
        <div style={{ color: "rgba(255,216,143,0.7)", fontSize: 8 }}>
          Counts from GlobalLiveSessionRegistry only — no seeded rooms.
        </div>
        <Link
          href="/admin/overseer#intelligence-deck"
          style={{
            borderRadius: 999,
            border: "1px solid rgba(0,255,255,0.4)",
            background: "rgba(0,255,255,0.1)",
            color: "#8CF9FF",
            fontSize: 8,
            fontWeight: 900,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            padding: "3px 8px",
            textDecoration: "none",
          }}
        >
          Intelligence Deck
        </Link>
      </div>
    </Canister>
  );
}
