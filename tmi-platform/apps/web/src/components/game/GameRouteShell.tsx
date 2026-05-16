"use client";

import Link from "next/link";
import { emitSystemEvent } from "@/lib/systemEventBus";

type GameRouteShellProps = {
  gameId: string;
};

export default function GameRouteShell({ gameId }: GameRouteShellProps) {
  return (
    <main style={{ minHeight: "100vh", background: "#020617", color: "#e2e8f0", padding: 20 }}>
      <div style={{ maxWidth: 940, margin: "0 auto", display: "grid", gap: 12 }}>
        <Link href="/home/4" style={{ color: "#93c5fd", textDecoration: "none" }}>← Back to Game Home</Link>
        <h1 style={{ margin: 0 }}>Game Route · {gameId}</h1>
        <p style={{ margin: 0, color: "#cbd5e1" }}>Game route shell is live with lobby/reward integration chain.</p>
        <section style={{ border: "1px solid rgba(56,189,248,0.35)", borderRadius: 12, background: "rgba(15,23,42,0.72)", padding: 12 }}>
          <div style={{ display: "grid", gap: 8 }}>
            <Link href="/lobbies/live-world" onClick={() => emitSystemEvent({ type: "pipeline.lobby.open", actor: "Game Route", sectionId: `game-${gameId}-lobby`, route: "/lobbies/live-world", message: `Game ${gameId} -> lobby` })} style={linkStyle}>Connect Lobby</Link>
            <Link href="/home/13" onClick={() => emitSystemEvent({ type: "homepage.artifact.route", actor: "Game Route", sectionId: `game-${gameId}-rewards`, route: "/home/13", message: `Game ${gameId} -> rewards` })} style={linkStyle}>Open Rewards</Link>
            <Link href="/billboards/game-night" onClick={() => emitSystemEvent({ type: "pipeline.billboard.open", actor: "Game Route", sectionId: `game-${gameId}-billboard`, route: "/billboards/game-night", message: `Game ${gameId} -> billboard` })} style={linkStyle}>Open Billboard</Link>
          </div>
        </section>
      </div>
    </main>
  );
}

const linkStyle: React.CSSProperties = {
  border: "1px solid rgba(45,212,191,0.35)",
  borderRadius: 8,
  background: "rgba(13,148,136,0.15)",
  color: "#ccfbf1",
  textDecoration: "none",
  fontSize: 12,
  padding: "8px 9px",
};
