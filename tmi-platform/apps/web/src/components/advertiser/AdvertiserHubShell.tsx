import { Suspense } from "react";
import AdvertiserCampaignRail from "@/components/advertiser/AdvertiserCampaignRail";
import AdvertiserPlacementRail from "@/components/advertiser/AdvertiserPlacementRail";
import AdvertiserAnalyticsRail from "@/components/advertiser/AdvertiserAnalyticsRail";
import AdvertiserInventoryRail from "@/components/advertiser/AdvertiserInventoryRail";

function RailSkeleton() {
  return <div className="h-24 animate-pulse rounded-xl border border-white/10 bg-zinc-900/40" />;
}

export default function AdvertiserHubShell() {
  return (
    <main className="min-h-screen bg-zinc-950 p-6 text-white">
      <div className="mx-auto grid max-w-7xl gap-4">
        <header className="rounded-xl border border-cyan-400/35 bg-[linear-gradient(135deg,rgba(7,16,26,0.95),rgba(21,8,28,0.9))] p-4">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-cyan-300">Advertiser Hub</p>
          <h1 className="text-3xl font-black uppercase tracking-tight text-white">Ad Placement + Conversion Runtime</h1>
          <p className="text-xs uppercase tracking-[0.14em] text-zinc-400">
            Campaigns · Placements · Inventory · Analytics
          </p>
        </header>

        <div className="grid gap-4">
          <Suspense fallback={<RailSkeleton />}><AdvertiserCampaignRail /></Suspense>
          <Suspense fallback={<RailSkeleton />}><AdvertiserPlacementRail /></Suspense>
          <Suspense fallback={<RailSkeleton />}><AdvertiserInventoryRail /></Suspense>
          <Suspense fallback={<RailSkeleton />}><AdvertiserAnalyticsRail /></Suspense>
        </div>
      </div>
    </main>
  );
}
