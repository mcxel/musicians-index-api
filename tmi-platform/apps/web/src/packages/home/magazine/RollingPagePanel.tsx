import Link from "next/link";

type RollingItem = {
  rank: number;
  artist: string;
  slug: string;
  movement: "up" | "down" | "hold";
};

const fallbackTop10: RollingItem[] = [
  { rank: 1, artist: "Ray Journey", slug: "ray-journey", movement: "up" },
  { rank: 2, artist: "Nova Pulse", slug: "nova-pulse", movement: "hold" },
  { rank: 3, artist: "Juno Arc", slug: "juno-arc", movement: "up" },
  { rank: 4, artist: "Kato Drift", slug: "kato-drift", movement: "down" },
  { rank: 5, artist: "Mina Volt", slug: "mina-volt", movement: "up" },
];

export default function RollingPagePanel() {
  return (
    <section className="mag-rolling-panel" aria-label="Top 10 Rolling Page">
      <header className="mag-rolling-panel__header">
        <span>TOP 10 LIVE</span>
        <Link href="/home/ranking">Full Ranking</Link>
      </header>
      <div className="mag-rolling-panel__rail">
        {fallbackTop10.map((item) => (
          <Link key={`${item.rank}-${item.slug}`} href={`/artist/${item.slug}`} className="mag-rolling-row">
            <strong className="mag-rolling-rank">#{item.rank}</strong>
            <span className="mag-rolling-name">{item.artist}</span>
            <span className={`mag-rolling-move mag-rolling-move--${item.movement}`}>{item.movement}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
