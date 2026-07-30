"use client";

import Link from "next/link";
import StageLoader from "@/components/eos/StageLoader";

export default function FanLobbyRoomPage() {
  return (
    <main
      data-testid="room-fan-lobby"
      style={{
        minHeight: "100vh",
        background: "radial-gradient(circle at 50% 0%, rgba(0,255,255,0.10), transparent 55%), #050510",
        color: "#fff",
        paddingBottom: 24,
      }}
    >
      <div style={{
        background: "rgba(0,0,0,0.9)",
        borderBottom: "1px solid rgba(0,255,255,0.2)",
        padding: "10px 24px",
        display: "flex",
        alignItems: "center",
        gap: 12,
      }}>
        <Link href="/explore" style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", textDecoration: "none", letterSpacing: "0.1em" }}>
          ← EXPLORE
        </Link>
        <div style={{ fontSize: 9, letterSpacing: "0.3em", fontWeight: 800, color: "#00FFFF" }}>FAN AVATAR LOBBY</div>
      </div>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "16px 16px 0" }}>
        <StageLoader experienceId="fan-lobby" roomId="fan-lobby" venueId="fan-lobby" role="fan" />
      </div>
    </main>
  );
}
