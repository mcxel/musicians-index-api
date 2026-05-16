import { DEFAULT_BLOCKERS, summarizeBlockers } from "@/lib/ops/tmiBlockerRegistry";

export default function TmiBlockerBoard() {
  const counts = summarizeBlockers(DEFAULT_BLOCKERS);

  return (
    <section className="rounded-2xl border border-amber-300/35 bg-black/45 p-4 text-zinc-100">
      <header className="mb-3">
        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-amber-100">Ops</p>
        <h2 className="text-lg font-black uppercase">Blocker Board</h2>
      </header>
      <div className="mb-3 grid gap-2 sm:grid-cols-3">
        <div className="rounded border border-amber-300/30 bg-amber-500/10 p-2 text-xs uppercase">warning: {counts.warning}</div>
        <div className="rounded border border-rose-300/30 bg-rose-500/10 p-2 text-xs uppercase">error: {counts.error}</div>
        <div className="rounded border border-fuchsia-300/30 bg-fuchsia-500/10 p-2 text-xs uppercase">critical: {counts.critical}</div>
      </div>
      <ul className="space-y-2">
        {DEFAULT_BLOCKERS.map((blocker) => (
          <li key={blocker.id} className="rounded border border-zinc-600/40 bg-zinc-900/60 p-3">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-black uppercase">{blocker.title}</p>
              <span className="text-[10px] uppercase tracking-[0.14em] text-zinc-300">{blocker.severity}</span>
            </div>
            <p className="mt-1 text-xs text-zinc-300">{blocker.details}</p>
            <p className="mt-1 text-[10px] uppercase tracking-[0.14em] text-zinc-400">{blocker.area} · {blocker.status}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
