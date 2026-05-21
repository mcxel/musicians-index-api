import Link from "next/link";
import SponsorPlacementRail from "@/components/sponsor/SponsorPlacementRail";
import { Suspense } from "react";

function Skeleton() {
  return <div className="h-24 animate-pulse rounded-xl border border-white/10 bg-zinc-900/40" />;
}

export default function SponsorPlacementsPage() {
  return (
    <main className="min-h-screen bg-zinc-950 p-6 text-white">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6">
          <Link href="/hub/sponsor" className="text-xs text-zinc-500 hover:text-white no-underline">← Sponsor Hub</Link>
        </div>
        <div className="mb-2 text-[10px] font-black uppercase tracking-[0.3em] text-fuchsia-300">
          Active Placements
        </div>
        <h1 className="mb-6 text-3xl font-black uppercase tracking-tight text-white">
          Placement Manager
        </h1>
        <Suspense fallback={<Skeleton />}>
          <SponsorPlacementRail />
        </Suspense>
        <div className="mt-6 flex gap-3 flex-wrap">
          <Link href="/sponsor/campaigns" className="px-5 py-3 rounded-lg bg-fuchsia-600 text-white font-bold text-sm no-underline">
            View Campaigns
          </Link>
          <Link href="/hub/sponsor" className="px-5 py-3 rounded-lg bg-zinc-800 text-zinc-300 font-bold text-sm no-underline border border-zinc-700">
            Back to Hub
          </Link>
        </div>
      </div>
    </main>
  );
}
