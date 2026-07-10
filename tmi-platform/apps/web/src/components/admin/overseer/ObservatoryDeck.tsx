"use client";

import { useEffect, useMemo, useState } from "react";

import { Canister, DeckButton, DeckChip, MetricCard } from "@/components/admin/overseer/AdminDesignSystem";

type LiveRoomStatus = "LIVE" | "WAITING" | "ALERT" | "ENDING";

type LiveRoom = {
  id: string;
  label: string;
  kind: "Battle" | "Cypher" | "Challenge";
  status: LiveRoomStatus;
  stability: number;
  feedSecure: boolean;
  members: number;
};

type LiveSession = {
  roomId: string;
  title?: string;
  category?: string;
  viewerCount: number;
};

const ROOM_SEED: LiveRoom[] = [
  { id: "room-cypher-r4", label: "Cypher: Battle-R4", kind: "Cypher", status: "LIVE", stability: 99, feedSecure: true, members: 184 },
  { id: "room-battle-a12", label: "Battle: A12 Finals", kind: "Battle", status: "LIVE", stability: 96, feedSecure: true, members: 243 },
  { id: "room-challenge-9", label: "Challenge: South Bracket", kind: "Challenge", status: "ALERT", stability: 82, feedSecure: false, members: 71 },
];

function statusColor(status: LiveRoomStatus): string {
  if (status === "ALERT") return "#fb7185";
  if (status === "ENDING") return "#f59e0b";
  if (status === "WAITING") return "#a1a1aa";
  return "#00ff88";
}

export default function ObservatoryDeck() {
  const [rooms, setRooms] = useState<LiveRoom[]>(ROOM_SEED);
  const [sessionCounts, setSessionCounts] = useState<{
    totalRooms: number;
    humanRooms: number;
    botRooms: number;
    goldRooms: number;
    activeChallenges: number;
  } | null>(null);

  useEffect(() => {
    let active = true;

    const pollSessions = async () => {
      try {
        const res = await fetch("/api/live/go", { cache: "no-store" });
        if (!res.ok) return;
        const data = (await res.json()) as { sessions?: LiveSession[] };
        if (!active) return;

        const sessions = data.sessions ?? [];
        const totalRooms = sessions.length;
        const botRooms = sessions.filter((session) => {
          const tag = `${session.category ?? ""} ${session.title ?? ""}`.toLowerCase();
          return tag.includes("bot");
        }).length;
        const humanRooms = Math.max(0, totalRooms - botRooms);
        const goldRooms = sessions.filter((session) => {
          const tag = `${session.category ?? ""} ${session.title ?? ""}`.toLowerCase();
          return tag.includes("gold") || tag.includes("diamond") || tag.includes("platinum");
        }).length;
        const activeChallenges = sessions.filter((session) => {
          const tag = `${session.category ?? ""} ${session.title ?? ""}`.toLowerCase();
          return tag.includes("battle") || tag.includes("cypher") || tag.includes("challenge");
        }).length;

        setSessionCounts({
          totalRooms,
          humanRooms,
          botRooms,
          goldRooms,
          activeChallenges,
        });
      } catch {
        // Keep existing UI state if telemetry fetch fails.
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

  const stats = useMemo(() => {
    const active = sessionCounts?.activeChallenges ?? rooms.filter((room) => room.status === "LIVE").length;
    const botRooms = sessionCounts?.botRooms ?? 45;
    const humanRooms = sessionCounts?.humanRooms ?? 82;
    const goldRooms = sessionCounts?.goldRooms ?? 15;
    const totalRooms = sessionCounts?.totalRooms ?? botRooms + humanRooms + goldRooms;
    const avgStability = rooms.length
      ? Number((rooms.reduce((sum, room) => sum + room.stability, 0) / rooms.length).toFixed(1))
      : 0;

    return {
      totalRooms,
      stability: avgStability,
      botRooms,
      humanRooms,
      goldRooms,
      activeChallenges: active,
      complianceAlerts: rooms.filter((room) => !room.feedSecure).length,
    };
  }, [rooms]);

  const killRoom = (id: string) => {
    setRooms((current) =>
      current.map((room) =>
        room.id === id ? { ...room, status: "ENDING", stability: Math.max(60, room.stability - 12) } : room,
      ),
    );
  };

  return (
    <Canister title="Observatory Deck" status="live" rightLabel="mission control">
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 8, marginBottom: 8 }}>
        <MetricCard title="Total Rooms" value={stats.totalRooms} trend={2} tone="cyan" />
        <MetricCard title="Stability" value={`${stats.stability}%`} trend={0.1} tone={stats.stability >= 95 ? "green" : "amber"} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 6, marginBottom: 8 }}>
        <DeckChip label="Bot Rooms" value={String(stats.botRooms)} />
        <DeckChip label="Human Rooms" value={String(stats.humanRooms)} />
        <DeckChip label="Gold Rooms" value={String(stats.goldRooms)} />
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
          Active Activity Feed
        </div>
        <div style={{ color: "rgba(255,216,143,0.72)", fontSize: 9, fontWeight: 800 }}>
          {stats.activeChallenges} live
        </div>
      </div>

      <div style={{ display: "grid", gap: 6, marginBottom: 8 }}>
        {rooms.map((room) => (
          <div
            key={room.id}
            style={{
              borderRadius: 8,
              border: "1px solid rgba(241,181,66,0.22)",
              background: "linear-gradient(180deg, rgba(25,12,14,0.8), rgba(15,7,10,0.86))",
              padding: "7px 8px",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", gap: 8, alignItems: "center" }}>
              <div>
                <div style={{ color: "#ffe8b5", fontSize: 10, fontWeight: 800 }}>{room.label}</div>
                <div style={{ marginTop: 2, color: "rgba(255,216,143,0.72)", fontSize: 8 }}>
                  {room.kind} · {room.members} members · Stability {room.stability}%
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span
                  style={{
                    borderRadius: 999,
                    border: `1px solid ${statusColor(room.status)}55`,
                    background: `${statusColor(room.status)}20`,
                    color: statusColor(room.status),
                    fontSize: 8,
                    fontWeight: 900,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    padding: "2px 6px",
                  }}
                >
                  {room.status}
                </span>
                <DeckButton onClick={() => killRoom(room.id)} active={room.status === "ENDING"}>
                  {room.status === "ENDING" ? "Ending" : "Kill"}
                </DeckButton>
              </div>
            </div>
            <div style={{ marginTop: 5, display: "flex", justifyContent: "space-between", color: room.feedSecure ? "#22c55e" : "#fb7185", fontSize: 8, fontWeight: 800 }}>
              <span>{room.feedSecure ? "Feed Secure" : "Compliance Alert"}</span>
              <span>{room.feedSecure ? "Legal: OK" : "Legal: Action Needed"}</span>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr auto", alignItems: "center", gap: 8 }}>
        <div style={{ color: "rgba(255,216,143,0.7)", fontSize: 8 }}>
          Global kill remains intentionally unavailable in this panel. Room-level interventions only.
        </div>
        <span
          style={{
            borderRadius: 999,
            border: "1px solid rgba(251,113,133,0.5)",
            background: "rgba(251,113,133,0.14)",
            color: "#fb7185",
            fontSize: 8,
            fontWeight: 900,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            padding: "3px 8px",
          }}
        >
          No Global Kill
        </span>
      </div>
    </Canister>
  );
}
