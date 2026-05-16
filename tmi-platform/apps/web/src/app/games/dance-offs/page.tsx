import Link from "next/link";

export const metadata = { title: "Dance-Offs — TMI Games" };

export default function DanceOffsPage() {
  return (
    <main className="min-h-screen bg-black text-zinc-100 px-4 py-10 max-w-2xl mx-auto">
      <div className="mb-4">
        <Link href="/games" className="text-[10px] font-black uppercase tracking-[0.16em] text-cyan-300 hover:text-cyan-100">
          ← Back to Games
        </Link>
      </div>
      <div className="rounded-xl border border-cyan-400/40 bg-black/60 p-6">
        <div className="mb-4 flex items-center gap-3">
          <span className="rounded border border-cyan-400/60 bg-cyan-500/15 px-2 py-0.5 text-[9px] font-black uppercase text-cyan-200">QUEUE OPEN</span>
          <p className="text-[9px] font-black uppercase tracking-[0.18em] text-cyan-300">TMI Games</p>
        </div>
        <h1 className="mb-2 text-2xl font-black uppercase tracking-tight text-white">Dance-Offs</h1>
        <p className="mb-4 text-sm text-zinc-300 leading-relaxed">
          Solo and crew dance battles judged live by TMI crowd and panel.
          Freestyle rounds, genre-specific challenges, and championship brackets with prize ladders.
        </p>
        <div className="mb-5 rounded border border-cyan-300/25 bg-cyan-500/10 px-3 py-2 text-[11px] font-bold text-cyan-100">
          +100 pts per win · Live judging panel · Queue now open
        </div>
        <Link
          href="/lobby"
          className="inline-block rounded border border-cyan-300/60 bg-cyan-500/20 px-5 py-2 text-[11px] font-black uppercase tracking-[0.14em] text-cyan-100 hover:bg-cyan-500/40"
        >
          Join Queue →
        </Link>
      </div>
    </main>
  );
}
