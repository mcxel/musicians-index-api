"use client";

export default function RootError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <main className="min-h-screen bg-black text-zinc-100 flex items-center justify-center p-6">
      <div className="max-w-xl rounded-xl border border-red-400/40 bg-zinc-950/80 p-5">
        <p className="text-[11px] font-black uppercase tracking-[0.16em] text-red-300">Runtime Error</p>
        <h1 className="mt-2 text-xl font-black uppercase">Something Broke In The Route Tree</h1>
        <p className="mt-3 text-sm text-zinc-300">{error?.message || "Unknown error"}</p>
        <button
          type="button"
          onClick={reset}
          className="mt-4 rounded border border-red-300/50 px-3 py-2 text-[11px] font-black uppercase tracking-[0.12em] text-red-100 hover:border-red-100"
        >
          Retry Render
        </button>
      </div>
    </main>
  );
}
