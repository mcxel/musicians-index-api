"use client";

import Link from "next/link";

export default function ArtistBookingsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="min-h-screen bg-zinc-950 p-6 text-white">
      <div className="mx-auto max-w-3xl rounded-xl border border-rose-400/35 bg-rose-950/15 p-5">
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-rose-300">Artist Bookings Error</p>
        <h1 className="mt-1 text-2xl font-black uppercase tracking-tight text-white">Route Recovery Required</h1>
        <p className="mt-2 text-xs text-zinc-300">A recoverable error occurred while loading artist bookings.</p>
        {error?.message && (
          <p className="mt-2 rounded border border-rose-300/20 bg-black/30 p-2 text-xs text-rose-200">{error.message}</p>
        )}
        <div className="mt-4 flex flex-wrap gap-2">
          <button type="button" onClick={reset} className="rounded border border-cyan-400/35 bg-cyan-400/10 px-3 py-1.5 text-xs font-black uppercase tracking-[0.12em] text-cyan-100">
            Retry
          </button>
          <Link href="/booking" className="rounded border border-zinc-500/40 bg-zinc-800/40 px-3 py-1.5 text-xs font-black uppercase tracking-[0.12em] text-zinc-300">
            Booking Hub
          </Link>
        </div>
      </div>
    </main>
  );
}
