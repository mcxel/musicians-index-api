"use client";

import Link from "next/link";

export default function BookingContractsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="min-h-screen bg-[#07040a] px-6 py-10 text-white">
      <div className="mx-auto max-w-4xl rounded-3xl border border-rose-400/30 bg-rose-950/15 p-6">
        <p className="text-xs uppercase tracking-[0.18em] text-rose-300">Booking Contracts Error</p>
        <h1 className="mt-2 text-2xl font-black tracking-[0.04em]">Route Recovery Required</h1>
        <p className="mt-3 text-sm text-slate-300">A recoverable error occurred while loading booking contracts.</p>
        {error?.message && (
          <p className="mt-3 rounded-xl border border-rose-300/20 bg-black/30 p-3 text-xs text-rose-200">{error.message}</p>
        )}
        <div className="mt-6 flex flex-wrap gap-3 text-xs uppercase tracking-[0.15em]">
          <button type="button" onClick={reset} className="rounded-full border border-amber-400/35 bg-amber-400/10 px-3 py-2 text-amber-100">
            Retry
          </button>
          <Link href="/booking" className="rounded-full border border-white/20 px-3 py-2">Booking Hub</Link>
        </div>
      </div>
    </main>
  );
}
