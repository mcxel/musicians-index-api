import Link from "next/link";

const CARDS = [
  { title: "Main Preview Lobby", href: "/lobbies" },
  { title: "Lobby Wall", href: "/lobbies" },
  { title: "Join Random Room", href: "/lobbies/random" },
  { title: "Live Game Lobby", href: "/lobbies" },
];

export default function LiveLobbyWall() {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(2,minmax(0,1fr))", gap: 10 }}>
      {CARDS.map((card, index) => (
        <Link key={card.title} href={card.href} style={{ textDecoration: "none" }}>
          <article
            style={{
              borderRadius: 12,
              border: "1px solid rgba(255,45,170,0.34)",
              background: "linear-gradient(180deg, rgba(31,9,29,0.9), rgba(9,7,15,0.96))",
              minHeight: 86,
              padding: 10,
              display: "grid",
              alignContent: "space-between",
              animation: `lobbyPulse${index % 2} 2.1s ease-in-out infinite`,
            }}
          >
            <div style={{ fontSize: 10, color: "#ffd8f4", fontWeight: 800 }}>{card.title}</div>
            <div style={{ fontSize: 8, color: "#ff69be", fontWeight: 900, letterSpacing: "0.12em", textTransform: "uppercase" }}>Live</div>
          </article>
        </Link>
      ))}
      <style>{`
        @keyframes lobbyPulse0 { 0%,100% { box-shadow: 0 0 0 rgba(255,45,170,0); } 50% { box-shadow: 0 0 14px rgba(255,45,170,0.28); } }
        @keyframes lobbyPulse1 { 0%,100% { box-shadow: 0 0 0 rgba(0,255,255,0); } 50% { box-shadow: 0 0 14px rgba(0,255,255,0.24); } }
      `}</style>
    </div>
  );
}
