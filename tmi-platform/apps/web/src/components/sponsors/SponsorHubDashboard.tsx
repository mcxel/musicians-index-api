import Link from "next/link";
import { SponsorHubEngine } from "@/lib/sponsors/SponsorHubEngine";

type SponsorHubDashboardProps = {
  sponsorId?: string;
};

function toPercent(value: number): string {
  return `${Math.round(value * 100)}%`;
}

export function SponsorHubDashboard({ sponsorId = "sponsor-demo-1" }: SponsorHubDashboardProps) {
  const dashboard = SponsorHubEngine.getSponsorHubDashboard(sponsorId);
  const visibility = dashboard.visibilityScore;

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <section className="mx-auto max-w-6xl space-y-8 px-6 py-10">
        <header className="rounded-2xl border border-cyan-400/40 bg-gradient-to-r from-slate-900 via-slate-900 to-cyan-950 p-6">
          <p className="text-xs uppercase tracking-[0.25em] text-cyan-300">Sponsor Hub</p>
          <h1 className="mt-2 text-3xl font-semibold">{dashboard.profile.name}</h1>
          <p className="mt-1 text-sm text-slate-300">Sponsor ID: {dashboard.profile.sponsorId}</p>
          <div className="mt-4 flex flex-wrap gap-3 text-sm">
            <span className="rounded-full border border-fuchsia-400/50 px-3 py-1">Visibility Tier: {visibility?.visibilityTier ?? "starter"}</span>
            <span className="rounded-full border border-amber-300/60 px-3 py-1">ROI/Performance Grade: {dashboard.roiPerformanceGrade}</span>
            <span className="rounded-full border border-cyan-400/50 px-3 py-1">Profile Tier: {dashboard.profile.tier}</span>
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <article className="rounded-xl border border-slate-800 bg-slate-900 p-4">
            <h2 className="text-sm uppercase tracking-wide text-slate-400">Active Sponsored Artists</h2>
            <p className="mt-2 text-3xl font-semibold">{dashboard.activeSponsoredArtists.length}</p>
          </article>
          <article className="rounded-xl border border-slate-800 bg-slate-900 p-4">
            <h2 className="text-sm uppercase tracking-wide text-slate-400">Active Campaigns</h2>
            <p className="mt-2 text-3xl font-semibold">{dashboard.activeCampaigns.length}</p>
          </article>
          <article className="rounded-xl border border-slate-800 bg-slate-900 p-4">
            <h2 className="text-sm uppercase tracking-wide text-slate-400">Promoted Products</h2>
            <p className="mt-2 text-3xl font-semibold">{dashboard.promotedProducts.length}</p>
          </article>
          <article className="rounded-xl border border-slate-800 bg-slate-900 p-4">
            <h2 className="text-sm uppercase tracking-wide text-slate-400">Promoted Events</h2>
            <p className="mt-2 text-3xl font-semibold">{dashboard.promotedEvents.length}</p>
          </article>
        </section>

        <section className="rounded-xl border border-slate-800 bg-slate-900 p-6">
          <h2 className="text-lg font-semibold">Placement Priorities</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <div className="rounded-lg border border-slate-800 bg-slate-950 p-3">
              Homepage Rail Priority: {visibility?.placements.homepageRailPriority ?? 0}
            </div>
            <div className="rounded-lg border border-slate-800 bg-slate-950 p-3">
              Show Outro Priority: {visibility?.placements.showOutroPriority ?? 0}
            </div>
            <div className="rounded-lg border border-slate-800 bg-slate-950 p-3">
              Article Sponsor Priority: {visibility?.placements.articleSponsorPriority ?? 0}
            </div>
            <div className="rounded-lg border border-slate-800 bg-slate-950 p-3">
              Contest Sponsor Priority: {visibility?.placements.contestSponsorPriority ?? 0}
            </div>
            <div className="rounded-lg border border-slate-800 bg-slate-950 p-3">
              Giveaway Priority: {visibility?.placements.giveawayPriority ?? 0}
            </div>
            <div className="rounded-lg border border-slate-800 bg-slate-950 p-3">
              Visibility Weight: {visibility?.visibilityWeight ?? 0}
            </div>
          </div>
          <p className="mt-3 text-xs text-slate-400">
            Placement retention estimate: {toPercent(Math.min((visibility?.sponsorPriorityScore ?? 0) / 2000, 1))}
          </p>
        </section>

        <section className="rounded-xl border border-slate-800 bg-slate-900 p-6">
          <h2 className="text-lg font-semibold">Actions</h2>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              href={dashboard.sponsorReadyArtistsRoute}
              className="rounded-lg bg-cyan-400 px-4 py-2 font-semibold text-slate-950 transition hover:bg-cyan-300"
            >
              Browse Sponsor-Ready Artists
            </Link>
            <Link
              href="/sponsors/campaigns"
              className="rounded-lg border border-slate-600 px-4 py-2 font-semibold text-slate-100 transition hover:border-cyan-300"
            >
              Manage Sponsor Campaigns
            </Link>
          </div>
        </section>
      </section>
    </main>
  );
}
