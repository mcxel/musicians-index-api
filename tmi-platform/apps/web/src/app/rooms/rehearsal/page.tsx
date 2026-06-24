import Link from "next/link";
import UniversalVenueRenderer from "@/components/live/UniversalVenueRenderer";
import RehearsalRoomShell from "@/components/venue/RehearsalRoomShell";

export const metadata = {
  title: "Rehearsal Room | TMI",
  description: "Private rehearsal and practice space — playlist, video calls, collaboration, memories.",
};

export default function RehearsalPage() {
  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", paddingBottom: 80 }}>
      <nav
        style={{
          background: "rgba(0,0,0,0.85)",
          borderBottom: "1px solid rgba(255,255,255,0.07)",
          padding: "12px 24px",
          display: "flex",
          gap: 16,
          alignItems: "center",
          backdropFilter: "blur(12px)",
          position: "sticky",
          top: 0,
          zIndex: 50,
        }}
      >
        <Link
          href="/live/rooms"
          style={{ color: "#00FFFF", textDecoration: "none", fontSize: 11, fontWeight: 700 }}
        >
          ← Lobby
        </Link>
        <span style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>›</span>
        <span
          style={{
            fontSize: 11,
            fontWeight: 900,
            color: "#fff",
            letterSpacing: "0.06em",
          }}
        >
          REHEARSAL ROOM
        </span>
        <div style={{ marginLeft: "auto", fontSize: 9, color: "rgba(0,255,136,0.6)" }}>
          🎸 Private · No live stream · No audience
        </div>
      </nav>

      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "24px 20px",
          display: "grid",
          gap: 20,
        }}
      >
        {/* Venue shell — Lounge Stage (venue index 2) */}
        <div
          style={{
            borderRadius: 16,
            overflow: "hidden",
            border: "1px solid rgba(0,255,136,0.12)",
            background: "#050510",
          }}
        >
          <div
            style={{
              padding: "8px 14px",
              background: "rgba(0,0,0,0.6)",
              borderBottom: "1px solid rgba(255,255,255,0.06)",
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: "#00FF88",
                display: "inline-block",
              }}
            />
            <span
              style={{
                fontSize: 9,
                fontWeight: 900,
                color: "#00FF88",
                letterSpacing: "0.18em",
              }}
            >
              REHEARSAL — LOUNGE STAGE
            </span>
            <span
              style={{
                marginLeft: "auto",
                fontSize: 9,
                color: "rgba(255,255,255,0.35)",
              }}
            >
              Practice and prepare — no live stream
            </span>
          </div>
          <UniversalVenueRenderer roomId="rehearsal" mode="performer" venueIndex={2} />
        </div>

        {/* Canisters: Playlist, Video Calls, Messaging, Memory Wall */}
        <RehearsalRoomShell />
      </div>
    </main>
  );
}
