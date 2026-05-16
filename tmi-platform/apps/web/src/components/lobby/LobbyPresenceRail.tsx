"use client";

import type { LobbyPresence } from "@/lib/lobby/lobbyPresenceEngine";

type LobbyPresenceRailProps = {
  presence: LobbyPresence;
};

export default function LobbyPresenceRail({ presence }: LobbyPresenceRailProps) {
  return (
    <section style={{ borderRadius: 14, border: "1px solid #583e7d", background: "#1a1029", padding: 14 }}>
      <h3 style={{ color: "#efe4ff", marginTop: 0 }}>Lobby Presence Rail</h3>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 8, fontSize: 12, color: "#dccaf3" }}>
        <div>Active: {presence.activeUsers}</div>
        <div>VIP: {presence.vipUsers}</div>
        <div>Bots: {presence.bots}</div>
        <div>Reactions/min: {presence.reactionsPerMinute}</div>
        <div>Tips/min: {presence.tipsPerMinute}</div>
      </div>
    </section>
  );
}
