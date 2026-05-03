export default function BookingsLoading() {
  return (
    <main className="min-h-screen bg-zinc-950 p-6 text-white">
      <div className="mx-auto grid max-w-6xl gap-4">
        <header className="rounded-xl border border-white/10 bg-zinc-900/60 p-5">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-cyan-300">Bookings</p>
          <h1 className="mt-1 text-3xl font-black uppercase tracking-tight text-white">Loading Booking Surface</h1>
          <p className="mt-2 text-xs uppercase tracking-[0.12em] text-zinc-400">
            Preparing deterministic booking controls…
          </p>
        </header>

        <section className="grid gap-3 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, idx) => (
            <article key={`booking-skeleton-${idx}`} className="rounded-xl border border-white/10 bg-black/40 p-4">
              <div className="h-4 w-40 rounded bg-zinc-800" />
              <div className="mt-3 h-3 w-full rounded bg-zinc-900" />
              <div className="mt-2 h-3 w-10/12 rounded bg-zinc-900" />
              <div className="mt-4 h-7 w-24 rounded border border-zinc-700 bg-zinc-800/60" />
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}
