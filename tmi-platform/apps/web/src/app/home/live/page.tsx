import MediaMonitor from '@/components/video/MediaMonitor';
import Link from 'next/link';

export default function HomeLivePage() {
  return (
    <div className="min-h-screen bg-[#050510] text-white font-sans flex flex-col">
      {/* Header - The Studio Control Bar */}
      <header className="p-4 border-b border-white/10 flex justify-between items-center bg-black/50">
        <div className="flex items-center gap-3">
          <span className="w-3 h-3 rounded-full bg-red-500 animate-pulse shadow-[0_0_10px_#ef4444]" />
          <h1 className="font-bold tracking-widest text-[#D4AF37] uppercase text-sm md:text-base">
            Broadcast Studio <span className="text-white/50 text-xs ml-2">v1.0</span>
          </h1>
        </div>
        <Link href="/home/1" className="text-xs font-bold text-[#00FFFF] hover:text-white transition-colors border border-[#00FFFF]/30 px-4 py-2 rounded">
          EXIT STUDIO
        </Link>
      </header>

      {/* Main Stage - The Room Environment */}
      <main className="flex-1 p-4 md:p-8 flex flex-col lg:flex-row gap-6">
        {/* Primary Broadcast Monitor - Where WebRTC Lives */}
        <section className="flex-1 relative rounded-xl overflow-hidden border border-white/5 bg-black shadow-2xl min-h-[50vh]">
          <MediaMonitor mode="self-view" isActive={true} />
        </section>

        {/* Environment Widgets Placeholder (Preparing for Sprint 2) */}
        <aside className="w-full lg:w-96 flex flex-col gap-4">
          <div className="bg-[#0a0f19]/80 border border-[#D4AF37]/30 rounded-lg p-4 h-64 flex flex-col">
            <h3 className="text-[#D4AF37] font-bold text-xs uppercase mb-2">Audience Radar (Standby)</h3>
            <div className="flex-1 flex items-center justify-center text-white/30 text-xs text-center border border-white/5 rounded bg-black/20">Awaiting Socket Connection...</div>
          </div>
          <div className="bg-[#0a0f19]/80 border border-[#00FFFF]/30 rounded-lg p-4 flex-1 flex flex-col">
            <h3 className="text-[#00FFFF] font-bold text-xs uppercase mb-2">Revenue Monitor (Standby)</h3>
            <div className="flex-1 flex items-center justify-center text-white/30 text-xs text-center border border-white/5 rounded bg-black/20">Awaiting Stripe Connection...</div>
          </div>
        </aside>
      </main>
    </div>
  );
}
