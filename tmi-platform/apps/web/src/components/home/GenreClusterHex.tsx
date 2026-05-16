import Link from "next/link";

const GENRES = ["Hip-Hop", "Afrobeats", "R&B", "Electronic", "Trap", "Soul"];

export default function GenreClusterHex() {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0,1fr))", gap: 10 }}>
      {GENRES.map((genre, index) => (
        <Link key={genre} href="/charts" style={{ textDecoration: "none" }}>
          <div
            style={{
              clipPath: "polygon(25% 6%, 75% 6%, 100% 50%, 75% 94%, 25% 94%, 0% 50%)",
              border: "1px solid rgba(0,255,255,0.44)",
              background: `radial-gradient(circle at 40% 30%, rgba(0,255,255,0.28), rgba(170,45,255,0.16))`,
              color: "#d8fbff",
              fontSize: 10,
              fontWeight: 800,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              padding: "24px 6px",
              textAlign: "center",
              animation: `genrePop${index % 3} 2.3s ease-in-out infinite`,
            }}
          >
            {genre}
          </div>
        </Link>
      ))}
      <style>{`
        @keyframes genrePop0 { 0%,100% { transform: scale(1) rotate(0deg); } 50% { transform: scale(1.03) rotate(1deg); } }
        @keyframes genrePop1 { 0%,100% { transform: scale(1) rotate(0deg); } 50% { transform: scale(1.04) rotate(-1deg); } }
        @keyframes genrePop2 { 0%,100% { transform: scale(1) rotate(0deg); } 50% { transform: scale(1.02) rotate(1deg); } }
      `}</style>
    </div>
  );
}
