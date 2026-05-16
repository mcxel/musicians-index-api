import Link from "next/link";

export const metadata = { title: "Polls — TMI Games" };

export default function PollsPage() {
  return (
    <main className="min-h-screen bg-black text-zinc-100 px-4 py-10 max-w-2xl mx-auto">
      <div className="mb-4">
        <Link href="/games" className="text-[10px] font-black uppercase tracking-[0.16em] text-violet-300 hover:text-violet-100">
          ← Back to Games
        </Link>
      </div>
      <div className="rounded-xl border border-violet-400/40 bg-black/60 p-6">
        <div className="mb-4 flex items-center gap-3">
          <span className="rounded border border-green-400/60 bg-green-500/15 px-2 py-0.5 text-[9px] font-black uppercase text-green-200">LIVE</span>
          <p className="text-[9px] font-black uppercase tracking-[0.18em] text-violet-300">TMI Games</p>
        </div>
        <h1 className="mb-2 text-2xl font-black uppercase tracking-tight text-white">Polls</h1>
        <p className="mb-4 text-sm text-zinc-300 leading-relaxed">
          Cast your vote on live polls during shows, battles, and cyphers. Your participation earns Crown Points
          and influences real-time leaderboard rankings.
        </p>
        <div className="mb-5 rounded border border-violet-300/25 bg-violet-500/10 px-3 py-2 text-[11px] font-bold text-violet-100">
          +40 pts per active poll · Instant results · Tied to live events
        </div>
        <Link
          href="/votes"
          className="inline-block rounded border border-violet-300/60 bg-violet-500/20 px-5 py-2 text-[11px] font-black uppercase tracking-[0.14em] text-violet-100 hover:bg-violet-500/40"
        >
          Vote Now →
        </Link>
      </div>
    </main>
  );
}
