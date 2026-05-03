"use client";

import Link from "next/link";

export default function BookingsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="min-h-screen bg-zinc-950 p-6 text-white">
      <div className="mx-auto grid max-w-3xl gap-4">
        <header className="rounded-xl border border-rose-400/35 bg-rose-950/20 p-5">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-rose-300">Bookings Error</p>
          <h1 className="mt-1 text-2xl font-black uppercase tracking-tight text-white">Route Recovery Required</h1>
          <p className="mt-2 text-xs text-zinc-300">
            A recoverable route error occurred while loading booking controls.
          </p>
          {error?.message ? (
            <p className="mt-2 rounded border border-rose-300/20 bg-black/30 p-2 text-xs text-rose-200">{error.message}</p>
          ) : null}
        </header>

        <section className="rounded-xl border border-white/10 bg-zinc-900/60 p-4">
          <p className="text-xs uppercase tracking-[0.12em] text-zinc-400">Recovery Actions</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={reset}
              className="rounded border border-cyan-400/35 bg-cyan-400/10 px-3 py-1.5 text-xs font-black uppercase tracking-[0.12em] text-cyan-100"
            >
              Retry Route
            </button>
            <Link
              href="/booking"
              className="rounded border border-fuchsia-400/35 bg-fuchsia-400/10 px-3 py-1.5 text-xs font-black uppercase tracking-[0.12em] text-fuchsia-100"
            >
              Open /booking
            </Link>
            <Link
              href="/hub/venue"
              className="rounded border border-emerald-400/35 bg-emerald-400/10 px-3 py-1.5 text-xs font-black uppercase tracking-[0.12em] text-emerald-100"
            >
              Open Venue Hub
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
