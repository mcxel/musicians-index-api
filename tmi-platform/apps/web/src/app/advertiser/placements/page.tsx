import AdvertiserPlacementRail from "@/components/advertiser/AdvertiserPlacementRail";

export default function Page() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(170,45,255,0.08),transparent_35%),linear-gradient(180deg,#050510_0%,#090916_100%)] px-6 py-12 text-white">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="rounded-3xl border border-fuchsia-400/20 bg-white/5 p-8 backdrop-blur">
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-fuchsia-300/80">Advertiser Placements</p>
          <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">Allocate inventory across every surface.</h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-white/65">
            Assign homepage, magazine, billboard, and venue inventory without leaving the advertiser stack.
          </p>
        </header>

        <AdvertiserPlacementRail />
      </div>
    </main>
  );
}