"use client";

export default function HomeRouteError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <main className="min-h-screen bg-black text-zinc-100 flex items-center justify-center p-6">
      <div className="max-w-xl rounded-xl border border-fuchsia-400/40 bg-zinc-950/85 p-5">
        <p className="text-[11px] font-black uppercase tracking-[0.16em] text-fuchsia-300">Home Route Error</p>
        <h1 className="mt-2 text-xl font-black uppercase">Homepage Runtime Failed</h1>
        <p className="mt-3 text-sm text-zinc-300">{error?.message || "Unknown error"}</p>
        <button
          type="button"
          onClick={reset}
          className="mt-4 rounded border border-fuchsia-300/45 px-3 py-2 text-[11px] font-black uppercase tracking-[0.12em] text-fuchsia-100 hover:border-fuchsia-100"
        >
          Retry Home Render
        </button>
      </div>
    </main>
  );
}
