import Link from "next/link";

export default function HomeFinalPage() {
  return (
    <main className="mx-auto w-full max-w-[1450px] px-3 py-4 text-zinc-100">
      <section className="rounded-xl border border-violet-300/45 bg-gradient-to-b from-violet-500/12 via-cyan-500/10 to-black/80 p-4 md:p-5">
        <header className="mb-4 rounded-xl border border-violet-300/35 bg-black/45 p-3">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-violet-200">Home Final · Closure Spread</p>
          <h1 className="text-xl font-black uppercase tracking-tight">Magazine Closure + Re-entry</h1>
          <p className="text-[10px] uppercase tracking-[0.14em] text-zinc-300">Final closure surface for the homepage ladder before re-entry to the cover issue.</p>
        </header>

        <div className="grid gap-3 md:grid-cols-3">
          <article className="rounded-xl border border-violet-300/30 bg-black/55 p-3">
            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-violet-100">Season Closed</p>
            <p className="mt-1 text-xs uppercase tracking-[0.08em] text-zinc-200">Rewards, claims, and rankings are sealed for the current issue.</p>
          </article>
          <article className="rounded-xl border border-violet-300/30 bg-black/55 p-3">
            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-violet-100">Archive Pivot</p>
            <p className="mt-1 text-xs uppercase tracking-[0.08em] text-zinc-200">Readers can jump to archive, winners, or back into a new issue cycle.</p>
          </article>
          <article className="rounded-xl border border-violet-300/30 bg-black/55 p-3">
            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-violet-100">Re-entry Loop</p>
            <p className="mt-1 text-xs uppercase tracking-[0.08em] text-zinc-200">Return users to the public magazine cover without hub leakage.</p>
          </article>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <Link href="/home/5" className="rounded border border-zinc-500/50 px-3 py-1 text-xs font-bold uppercase hover:border-zinc-300">◀ back to home 5</Link>
          <Link href="/home/1" className="rounded border border-violet-300/40 px-3 py-1 text-xs font-bold uppercase hover:border-violet-100">return to cover ▶</Link>
        </div>
      </section>
    </main>
  );
}
