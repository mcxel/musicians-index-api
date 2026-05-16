import Link from "next/link";

export default function EmptyEventsPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col items-center justify-center p-8 font-sans">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(168,85,247,0.03)_0%,transparent_70%)] pointer-events-none" />
      <div className="relative z-10 max-w-lg text-center space-y-6">
        <div className="w-20 h-20 mx-auto rounded-full border-2 border-fuchsia-500/40 flex items-center justify-center">
          <span className="text-4xl">🎤</span>
        </div>
        <p className="text-[9px] font-black tracking-[0.5em] uppercase text-fuchsia-400/60">Events</p>
        <h2 className="text-3xl font-black italic uppercase text-white tracking-tighter">No Events Scheduled</h2>
        <p className="text-zinc-400 text-sm">Nothing is booked for this slot right now. Check the live world for active stages or browse upcoming shows.</p>
        <div className="flex flex-wrap gap-3 justify-center pt-2">
          <Link href="/home/3" className="px-6 py-3 bg-fuchsia-500 text-white font-black text-sm uppercase tracking-widest rounded-full hover:bg-fuchsia-400 transition">
            Live World
          </Link>
          <Link href="/home/7" className="px-6 py-3 bg-white/10 border border-white/20 font-bold text-sm uppercase tracking-widest rounded-full hover:border-fuchsia-400/60 hover:text-fuchsia-400 transition">
            Monthly Idol
          </Link>
        </div>
      </div>
    </div>
  );
}
