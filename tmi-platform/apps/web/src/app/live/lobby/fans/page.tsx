import FanLobbyWall from "@/components/lobby/FanLobbyWall";
import Link from "next/link";

export const metadata = { title: "Fan Lobby · TMI", description: "Discover fans and build your crew." };

export default function FanLobbyPage() {
  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", padding: "40px 24px" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <Link href="/live/rooms" style={{ fontSize: 9, color: "#00FFFF", textDecoration: "none", letterSpacing: "0.12em", display: "block", marginBottom: 20 }}>
          ← BACK TO LOBBY
        </Link>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, flexWrap: "wrap", marginBottom: 6 }}>
          <div>
            <h1 style={{ margin: "0 0 6px", fontSize: "clamp(1.4rem,3vw,2rem)", fontWeight: 900 }}>
              Fan Discovery Lobby
            </h1>
            <p style={{ margin: 0, color: "rgba(255,255,255,0.5)", fontSize: 13 }}>
              Meet other fans, find your crew, and get invited into rooms together.
            </p>
          </div>
          <Link
            href="/rooms/fan-lobby"
            style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              borderRadius: 10, border: "1px solid rgba(0,255,255,0.5)",
              background: "rgba(0,255,255,0.12)", color: "#00FFFF",
              padding: "10px 16px", fontSize: 11, fontWeight: 900,
              letterSpacing: "0.08em", textDecoration: "none", whiteSpace: "nowrap",
            }}
          >
            🎉 ENTER FAN LOBBY
          </Link>
        </div>
        <div style={{ marginBottom: 28 }} />
        <FanLobbyWall />
      </div>
    </main>
  );
}
