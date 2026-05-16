import Link from "next/link";

export const metadata = { title: "Joke-Offs — TMI Games" };

export default function JokeOffsPage() {
  return (
    <main className="min-h-screen bg-black text-zinc-100 px-4 py-10 max-w-2xl mx-auto">
      <div className="mb-4">
        <Link href="/games" className="text-[10px] font-black uppercase tracking-[0.16em] text-amber-300 hover:text-amber-100">
          ← Back to Games
        </Link>
      </div>
      <div className="rounded-xl border border-amber-400/40 bg-black/60 p-6">
        <div className="mb-4 flex items-center gap-3">
          <span className="rounded border border-green-400/60 bg-green-500/15 px-2 py-0.5 text-[9px] font-black uppercase text-green-200">LIVE</span>
          <p className="text-[9px] font-black uppercase tracking-[0.18em] text-amber-300">TMI Games</p>
        </div>
        <h1 className="mb-2 text-2xl font-black uppercase tracking-tight text-white">Joke-Offs</h1>
        <p className="mb-4 text-sm text-zinc-300 leading-relaxed">
          Head-to-head comedic showdowns on the TMI stage. Two contestants, timed rounds, live audience score.
          Punchlines, callbacks, and crowd energy determine the winner.
        </p>
        <div className="mb-5 rounded border border-amber-300/25 bg-amber-500/10 px-3 py-2 text-[11px] font-bold text-amber-100">
          +80 pts per win · Crowd vote scoring · Queue entry open
        </div>
        <Link
          href="/lobby"
          className="inline-block rounded border border-amber-300/60 bg-amber-500/20 px-5 py-2 text-[11px] font-black uppercase tracking-[0.14em] text-amber-100 hover:bg-amber-500/40"
        >
          Enter Now →
        </Link>
      </div>
    </main>
  );
}
