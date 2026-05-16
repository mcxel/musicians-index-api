"use client";

type LobbyScreenProps = {
  roomName: string;
  headline: string;
};

export default function LobbyScreen({ roomName, headline }: LobbyScreenProps) {
  return (
    <section
      style={{
        borderRadius: 14,
        border: "1px solid #60468b",
        background: "linear-gradient(145deg, #2a1a42, #171024)",
        padding: 14,
      }}
    >
      <h3 style={{ color: "#efe4ff", marginTop: 0 }}>Lobby Screen</h3>
      <div style={{ color: "#d4c1ed", fontSize: 12 }}>Room: {roomName}</div>
      <div style={{ color: "#fff0b7", marginTop: 8, fontSize: 14, fontWeight: 700 }}>{headline}</div>
    </section>
  );
}
