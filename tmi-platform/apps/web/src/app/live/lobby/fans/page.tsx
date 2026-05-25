import FanLobbyWall from "@/components/lobby/FanLobbyWall";
import LiveLobbyDrawer from "@/components/lobby/LiveLobbyDrawer";

export const metadata = { title: "Fan Lobby · TMI", description: "Discover fans and build your crew." };

export default function FanLobbyPage() {
  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", padding: "40px 24px" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <a href="/live/lobby" style={{ fontSize: 9, color: "#00FFFF", textDecoration: "none", letterSpacing: "0.12em", display: "block", marginBottom: 20 }}>
          ← BACK TO LOBBY
        </a>
        <h1 style={{ margin: "0 0 6px", fontSize: "clamp(1.4rem,3vw,2rem)", fontWeight: 900 }}>
          Fan Discovery Lobby
        </h1>
        <p style={{ margin: "0 0 28px", color: "rgba(255,255,255,0.5)", fontSize: 13 }}>
          Meet other fans, find your crew, and get invited into rooms together.
        </p>
        <FanLobbyWall />
      </div>
      <LiveLobbyDrawer />
    </main>
  );
}
