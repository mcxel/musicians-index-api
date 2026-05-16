import Link from "next/link";

export default function Home45BridgePage() {
  return (
    <main className="mx-auto w-full max-w-[1450px] px-3 py-4 text-zinc-100">
      <section className="rounded-xl border border-amber-300/45 bg-gradient-to-b from-amber-500/12 via-rose-500/10 to-black/80 p-4 md:p-5">
        <header className="mb-4 rounded-xl border border-amber-300/35 bg-black/45 p-3">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-200">Home 4-5 · Bridge Spread</p>
          <h1 className="text-xl font-black uppercase tracking-tight">Event Ladder to Ranking Finale</h1>
          <p className="text-[10px] uppercase tracking-[0.14em] text-zinc-300">Transition bridge from Home 4 event stack to Home 5 ranking wrap.</p>
        </header>

        <div className="grid gap-3 md:grid-cols-3">
          <article className="rounded-xl border border-amber-300/30 bg-black/55 p-3">
            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-amber-100">Show Queue Lock</p>
            <p className="mt-1 text-xs uppercase tracking-[0.08em] text-zinc-200">Freeze final show order before ranking reveal.</p>
          </article>
          <article className="rounded-xl border border-amber-300/30 bg-black/55 p-3">
            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-amber-100">Prize Transfer</p>
            <p className="mt-1 text-xs uppercase tracking-[0.08em] text-zinc-200">Move sponsor and prize state into Home 5 ledger.</p>
          </article>
          <article className="rounded-xl border border-amber-300/30 bg-black/55 p-3">
            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-amber-100">Host Rotation Seal</p>
            <p className="mt-1 text-xs uppercase tracking-[0.08em] text-zinc-200">Close handoff ring before leaderboard handoff.</p>
          </article>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <Link href="/home/4" className="rounded border border-zinc-500/50 px-3 py-1 text-xs font-bold uppercase hover:border-zinc-300">◀ back to home 4</Link>
          <Link href="/home/5" className="rounded border border-amber-300/40 px-3 py-1 text-xs font-bold uppercase hover:border-amber-100">continue to home 5 ▶</Link>
        </div>
      </section>
    </main>
  );
}
