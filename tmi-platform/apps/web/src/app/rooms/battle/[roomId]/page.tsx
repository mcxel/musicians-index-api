import Link from "next/link";

export default function BattleRoomByIdPage({ params }: { params: { roomId: string } }) {
  const battleId = params.roomId.startsWith("battle-") ? params.roomId.replace("battle-", "") : params.roomId;

  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", padding: "28px 22px 80px", display: "grid", gap: 14 }}>
      <h1 style={{ margin: 0, fontSize: "clamp(1.4rem, 4vw, 2.2rem)", color: "#ff6b35" }}>Battle Room</h1>
      <p style={{ color: "rgba(255,255,255,0.75)", maxWidth: 700 }}>
        Room route: {params.roomId}. Voting, fan reactions, and replay publication route back to battle details.
      </p>
      <Link href={`/battles/${battleId}`} style={{ width: "fit-content", textDecoration: "none", color: "#ffd700", border: "1px solid rgba(255,215,0,0.4)", borderRadius: 6, padding: "8px 12px" }}>
        Open Battle Detail
      </Link>
    </main>
  );
}
