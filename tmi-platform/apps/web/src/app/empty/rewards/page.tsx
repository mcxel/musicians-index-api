import Link from "next/link";

export default function EmptyRewardsPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col items-center justify-center p-8 font-sans">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(250,204,21,0.03)_0%,transparent_70%)] pointer-events-none" />
      <div className="relative z-10 max-w-lg text-center space-y-6">
        <div className="w-20 h-20 mx-auto rounded-full border-2 border-yellow-500/40 flex items-center justify-center">
          <span className="text-4xl">🏆</span>
        </div>
        <p className="text-[9px] font-black tracking-[0.5em] uppercase text-yellow-400/60">Rewards</p>
        <h2 className="text-3xl font-black italic uppercase text-white tracking-tighter">No Rewards Available</h2>
        <p className="text-zinc-400 text-sm">You've claimed everything — or the next drop hasn't started yet. Watch the countdown on Home 14 for upcoming drops.</p>
        <div className="flex flex-wrap gap-3 justify-center pt-2">
          <Link href="/home/13" className="px-6 py-3 bg-yellow-500 text-black font-black text-sm uppercase tracking-widest rounded-full hover:bg-yellow-400 transition">
            Rewards Store
          </Link>
          <Link href="/home/14" className="px-6 py-3 bg-white/10 border border-white/20 font-bold text-sm uppercase tracking-widest rounded-full hover:border-yellow-400/60 hover:text-yellow-400 transition">
            Sponsor Drops
          </Link>
        </div>
      </div>
    </div>
  );
}
