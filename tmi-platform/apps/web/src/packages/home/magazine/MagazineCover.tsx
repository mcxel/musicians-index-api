import Link from "next/link";

export default function MagazineCover() {
  return (
    <section className="mag-cover" aria-label="Magazine Cover">
      <header className="mag-cover__banner">VOTING LIVE • CROWN UPDATING IN REAL-TIME</header>
      <div className="mag-cover__core">
        <div className="mag-cover__title-wrap">
          <p className="mag-cover__issue">ISSUE 88 • WEEKLY CYPHERS</p>
          <h1 className="mag-cover__title">Who took the Musicians Index crown this week?</h1>
        </div>
        <div className="mag-cover__centerpiece">
          <Link href="/artist/ray-journey" className="mag-cover__winner-link">
            CROWN WINNER → RAY JOURNEY
          </Link>
        </div>
      </div>
      <div className="mag-cover__callouts">
        <Link href="/artist/nova-pulse">#2 NOVA PULSE</Link>
        <Link href="/artist/juno-arc">#3 JUNO ARC</Link>
        <Link href="/artist/kato-drift">#4 KATO DRIFT</Link>
      </div>
    </section>
  );
}
