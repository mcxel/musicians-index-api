import PerformerLobbyWall from "@/components/lobby/PerformerLobbyWall";
import LiveLobbyDrawer from "@/components/lobby/LiveLobbyDrawer";

export const metadata = { title: "Performer Lobby · TMI", description: "Find collaborators and build your set." };

export default function PerformerLobbyPage() {
  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", padding: "40px 24px" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <a href="/live/lobby" style={{ fontSize: 9, color: "#FF2DAA", textDecoration: "none", letterSpacing: "0.12em", display: "block", marginBottom: 20 }}>
          ← BACK TO LOBBY
        </a>
        <h1 style={{ margin: "0 0 6px", fontSize: "clamp(1.4rem,3vw,2rem)", fontWeight: 900 }}>
          Performer Connect Lobby
        </h1>
        <p style={{ margin: "0 0 28px", color: "rgba(255,255,255,0.5)", fontSize: 13 }}>
          Link up with other performers. Set up cyphers, battles, or collab sets before going live.
        </p>
        <PerformerLobbyWall />
      </div>
      <LiveLobbyDrawer />
    </main>
  );
}
