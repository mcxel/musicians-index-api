import { Suspense } from "react";
import SponsorCampaignRail from "@/components/sponsor/SponsorCampaignRail";
import SponsorPlacementRail from "@/components/sponsor/SponsorPlacementRail";
import SponsorPrizeRail from "@/components/sponsor/SponsorPrizeRail";
import SponsorAnalyticsRail from "@/components/sponsor/SponsorAnalyticsRail";
import SponsorContractsRail from "@/components/sponsor/SponsorContractsRail";

function RailSkeleton() {
  return <div className="h-24 animate-pulse rounded-xl border border-white/10 bg-zinc-900/40" />;
}

export default function SponsorHubShell() {
  return (
    <main className="min-h-screen bg-zinc-950 p-6 text-white">
      <div className="mx-auto grid max-w-7xl gap-4">
        <header className="rounded-xl border border-fuchsia-400/35 bg-[linear-gradient(135deg,rgba(18,8,25,0.95),rgba(8,15,26,0.9))] p-4">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-fuchsia-300">Sponsor Hub</p>
          <h1 className="text-3xl font-black uppercase tracking-tight text-white">Economic Runtime: Sponsor Control</h1>
          <p className="text-xs uppercase tracking-[0.14em] text-zinc-400">
            Campaigns · Placements · Prizes · Analytics · Contracts
          </p>
        </header>

        <div className="grid gap-4">
          <Suspense fallback={<RailSkeleton />}><SponsorCampaignRail /></Suspense>
          <Suspense fallback={<RailSkeleton />}><SponsorPlacementRail /></Suspense>
          <Suspense fallback={<RailSkeleton />}><SponsorPrizeRail /></Suspense>
          <Suspense fallback={<RailSkeleton />}><SponsorAnalyticsRail /></Suspense>
          <Suspense fallback={<RailSkeleton />}><SponsorContractsRail /></Suspense>
        </div>
      </div>
    </main>
  );
}
