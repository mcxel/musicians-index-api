export default function AdvertiserHubLoading() {
  return (
    <main className="min-h-screen bg-zinc-950 p-6 text-white">
      <div className="mx-auto grid max-w-7xl gap-4">
        <header className="rounded-xl border border-cyan-400/20 bg-zinc-900/60 p-4">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-cyan-300">Advertiser Hub</p>
          <h1 className="mt-1 text-3xl font-black uppercase tracking-tight text-white">Loading Advertiser Controls…</h1>
          <p className="text-xs uppercase tracking-[0.14em] text-zinc-400">Campaigns · Placements · Inventory · Analytics</p>
        </header>
        <div className="grid gap-4">
          {Array.from({ length: 4 }).map((_, idx) => (
            <div key={`advertiser-skel-${idx}`} className="h-24 animate-pulse rounded-xl border border-white/10 bg-zinc-900/40" />
          ))}
        </div>
      </div>
    </main>
  );
}
