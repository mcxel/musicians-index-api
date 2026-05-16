"use client";

type LobbyCountdownRailProps = {
  countdownSeconds: number;
  onStartTick: () => void;
};

export default function LobbyCountdownRail({ countdownSeconds, onStartTick }: LobbyCountdownRailProps) {
  const minutes = Math.floor(countdownSeconds / 60);
  const seconds = countdownSeconds % 60;

  return (
    <section style={{ borderRadius: 14, border: "1px solid #583e7d", background: "#1a1029", padding: 14 }}>
      <h3 style={{ color: "#efe4ff", marginTop: 0 }}>Lobby Countdown Rail</h3>
      <p style={{ color: "#d8c7ef", fontSize: 20, margin: "0 0 8px" }}>
        {minutes}:{seconds.toString().padStart(2, "0")}
      </p>
      <button onClick={onStartTick} style={{ borderRadius: 8, border: "1px solid #f1d37f", background: "#5a4518", color: "#ffe9ac", padding: "7px 10px", cursor: "pointer" }}>
        Start Countdown Tick
      </button>
    </section>
  );
}
