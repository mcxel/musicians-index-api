"use client";

import { useMemo, useSyncExternalStore } from "react";
import {
  getRuntimeState,
  startRuntimeStore,
  subscribeRuntime,
  type RuntimeNode,
} from "@/lib/systemRuntimeStore";

startRuntimeStore();

function statusColor(status: RuntimeNode["status"]) {
  if (status === "LIVE") return "#22c55e";
  if (status === "IDLE") return "#f59e0b";
  return "#ef4444";
}

function trend(now: number, prev: number): string {
  if (now > prev) return "UP";
  if (now < prev) return "DOWN";
  return "FLAT";
}

export default function AdminRuntimePanel() {
  const state = useSyncExternalStore(subscribeRuntime, getRuntimeState, getRuntimeState);

  const sortedRooms = useMemo(() => {
    return [...state.rooms].sort((a, b) => b.users - a.users);
  }, [state.rooms]);

  const topRooms = sortedRooms.slice(0, 6);
  const totalLive = state.rooms.filter((r) => r.status === "LIVE").length;
  const totalError = state.rooms.filter((r) => r.status === "ERROR").length;

  return (
    <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 14, minHeight: 0 }}>
      <section
        style={{
          border: "1px solid rgba(34,211,238,0.45)",
          borderRadius: 14,
          background: "linear-gradient(180deg, rgba(3,7,24,0.9), rgba(8,14,38,0.88))",
          padding: 12,
          boxShadow: "0 0 28px rgba(34,211,238,0.18)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
          <h2 style={{ margin: 0, fontSize: 13, letterSpacing: "0.18em", color: "#67e8f9" }}>LIVE SYSTEM GRID</h2>
          <span style={{ fontSize: 11, color: "#94a3b8" }}>
            live: {totalLive} · error: {totalError}
          </span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 10 }}>
          {topRooms.map((room) => (
            <a
              key={room.id}
              href={room.route}
              data-clickable="true"
              style={{
                border: "1px solid rgba(168,85,247,0.55)",
                borderRadius: 10,
                textDecoration: "none",
                color: "#e2e8f0",
                background: "linear-gradient(130deg, rgba(76,29,149,0.35), rgba(15,23,42,0.9))",
                padding: 10,
                display: "flex",
                flexDirection: "column",
                gap: 6,
                transition: "transform 0.2s ease, box-shadow 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = "0 0 22px rgba(217,70,239,0.22)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <strong style={{ fontSize: 12 }}>{room.label}</strong>
                <span style={{ fontSize: 10, color: statusColor(room.status), fontWeight: 800 }}>{room.status}</span>
              </div>
              <div style={{ fontSize: 11, color: "#cbd5e1" }}>users: {room.users}</div>
              <div style={{ fontSize: 11, color: "#cbd5e1" }}>event: {room.event}</div>
              <div
                style={{
                  border: "1px dashed rgba(45,212,191,0.55)",
                  borderRadius: 8,
                  padding: 8,
                  fontSize: 10,
                  color: "#99f6e4",
                  minHeight: 44,
                }}
                title={room.preview}
              >
                Hover preview: {room.preview}
              </div>
            </a>
          ))}
        </div>
      </section>

      <aside
        style={{
          border: "1px solid rgba(236,72,153,0.5)",
          borderRadius: 14,
          background: "linear-gradient(180deg, rgba(24,24,45,0.92), rgba(20,8,32,0.95))",
          padding: 12,
          boxShadow: "0 0 20px rgba(236,72,153,0.18)",
        }}
      >
        <h3 style={{ marginTop: 0, marginBottom: 8, fontSize: 12, letterSpacing: "0.16em", color: "#f9a8d4" }}>
          ANALYTICS + STATS
        </h3>

        <div style={{ display: "grid", gap: 8 }}>
          <StatRow label="GLOBAL STATE" value={state.globalState} accent="#67e8f9" />
          <StatRow label="LIVE USERS" value={String(state.users)} accent="#34d399" />
          <StatRow label="ACTIVE ROOMS" value={String(state.rooms.length)} accent="#fbbf24" />
          <StatRow label="BOT STATUS" value={state.botStatus} accent="#f472b6" />
        </div>

        <div style={{ marginTop: 10, borderTop: "1px solid rgba(148,163,184,0.25)", paddingTop: 10 }}>
          <h4 style={{ margin: 0, fontSize: 11, letterSpacing: "0.14em", color: "#a5b4fc" }}>TREND SIGNALS</h4>
          {topRooms.slice(0, 3).map((room, index) => {
            const prior = topRooms[index + 1]?.users ?? room.users;
            return (
              <div key={room.id} style={{ display: "flex", justifyContent: "space-between", fontSize: 11, marginTop: 6 }}>
                <span style={{ color: "#cbd5e1" }}>{room.label}</span>
                <span style={{ color: "#f8fafc" }}>{trend(room.users, prior)}</span>
              </div>
            );
          })}
        </div>
      </aside>
    </div>
  );
}

function StatRow({ label, value, accent }: { label: string; value: string; accent: string }) {
  return (
    <div style={{ border: `1px solid ${accent}66`, borderRadius: 8, padding: "7px 9px", background: `${accent}12` }}>
      <div style={{ fontSize: 10, color: "#94a3b8", letterSpacing: "0.12em" }}>{label}</div>
      <div style={{ fontSize: 13, color: accent, fontWeight: 800 }}>{value}</div>
    </div>
  );
}
