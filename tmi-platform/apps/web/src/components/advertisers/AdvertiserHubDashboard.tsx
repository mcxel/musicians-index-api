import Link from "next/link";
import { buildAdvertiserHubIntelligence } from "@/lib/advertisers/AdvertiserHubIntelligenceEngine";
import { listArticleAdCampaigns } from "@/lib/articles/ArticleAdvertisingEngine";
import { listArticleAdPlacements } from "@/lib/articles/ArticleAdPlacementEngine";

type AdvertiserHubDashboardProps = {
  advertiserId?: string;
};

function currency(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

export function AdvertiserHubDashboard({ advertiserId = "advertiser-demo-1" }: AdvertiserHubDashboardProps) {
  const intelligence = buildAdvertiserHubIntelligence({
    advertiserId,
    campaignMetrics: [
      {
        campaignId: "cmp-article-1",
        advertiserId,
        campaignName: "Magazine Header Burst",
        status: "active",
        spendCents: 280000,
        impressions: 90000,
        clicks: 3150,
        conversions: 420,
        attributedRevenueCents: 612000,
      },
      {
        campaignId: "cmp-article-2",
        advertiserId,
        campaignName: "Mid-Scroll Product Push",
        status: "active",
        spendCents: 190000,
        impressions: 64000,
        clicks: 1880,
        conversions: 202,
        attributedRevenueCents: 344000,
      },
    ],
    audienceSignals: [
      {
        segment: "music-fans",
        impressions: 120000,
        clicks: 4900,
        conversions: 580,
        avgOrderValueCents: 5900,
      },
      {
        segment: "live-event-buyers",
        impressions: 86000,
        clicks: 2600,
        conversions: 360,
        avgOrderValueCents: 7100,
      },
      {
        segment: "high-intent-shoppers",
        impressions: 32000,
        clicks: 1450,
        conversions: 220,
        avgOrderValueCents: 8900,
      },
    ],
  });

  const activeAdCampaigns = intelligence.campaignInsights.filter((campaign) => campaign.status === "active");
  const trackedCampaigns = listArticleAdCampaigns({ advertiserId });
  const articleAdPlacements = listArticleAdPlacements({ activeOnly: true });

  const totalClicks = intelligence.campaignInsights.reduce((sum, item) => sum + item.clicks, 0);
  const totalImpressions = intelligence.campaignInsights.reduce((sum, item) => sum + item.impressions, 0);
  const totalConversions = intelligence.campaignInsights.reduce((sum, item) => sum + item.conversions, 0);
  const ctr = totalImpressions > 0 ? totalClicks / totalImpressions : 0;

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <section className="mx-auto max-w-6xl space-y-8 px-6 py-10">
        <header className="rounded-2xl border border-fuchsia-400/40 bg-gradient-to-r from-slate-900 via-slate-900 to-fuchsia-950 p-6">
          <p className="text-xs uppercase tracking-[0.25em] text-fuchsia-300">Advertiser Hub</p>
          <h1 className="mt-2 text-3xl font-semibold">Article Advertising Intelligence</h1>
          <p className="mt-1 text-sm text-slate-300">Advertiser ID: {advertiserId}</p>
        </header>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <article className="rounded-xl border border-slate-800 bg-slate-900 p-4">
            <h2 className="text-sm uppercase tracking-wide text-slate-400">Active Ad Campaigns</h2>
            <p className="mt-2 text-3xl font-semibold">{activeAdCampaigns.length}</p>
          </article>
          <article className="rounded-xl border border-slate-800 bg-slate-900 p-4">
            <h2 className="text-sm uppercase tracking-wide text-slate-400">Article Ad Placements</h2>
            <p className="mt-2 text-3xl font-semibold">{articleAdPlacements.length}</p>
          </article>
          <article className="rounded-xl border border-slate-800 bg-slate-900 p-4">
            <h2 className="text-sm uppercase tracking-wide text-slate-400">CTR</h2>
            <p className="mt-2 text-3xl font-semibold">{(ctr * 100).toFixed(2)}%</p>
          </article>
          <article className="rounded-xl border border-slate-800 bg-slate-900 p-4">
            <h2 className="text-sm uppercase tracking-wide text-slate-400">Conversions</h2>
            <p className="mt-2 text-3xl font-semibold">{totalConversions}</p>
          </article>
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          <article className="rounded-xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="text-lg font-semibold">ROAS</h2>
            <p className="mt-2 text-3xl font-semibold text-emerald-300">
              {intelligence.portfolioSummary.overallRoas.toFixed(2)}x
            </p>
            <p className="mt-2 text-sm text-slate-300">
              Spend: {currency(intelligence.portfolioSummary.totalSpendCents)} | Revenue: {currency(intelligence.portfolioSummary.totalRevenueCents)}
            </p>
          </article>

          <article className="rounded-xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="text-lg font-semibold">Campaign Analytics Route</h2>
            <p className="mt-2 break-all text-sm text-slate-300">{intelligence.routes.campaignAnalyticsRoute}</p>
            <div className="mt-4">
              <Link
                href={intelligence.routes.campaignAnalyticsRoute}
                className="rounded-lg border border-slate-600 px-4 py-2 font-semibold text-slate-100 transition hover:border-fuchsia-300"
              >
                Open Campaign Analytics
              </Link>
            </div>
          </article>
        </section>

        <section className="rounded-xl border border-slate-800 bg-slate-900 p-6">
          <h2 className="text-lg font-semibold">Audience Segment Insights</h2>
          <div className="mt-4 space-y-3">
            {intelligence.audienceInsights.slice(0, 5).map((segment) => (
              <div key={segment.segment} className="rounded-lg border border-slate-800 bg-slate-950 p-3">
                <p className="font-semibold">{segment.segment}</p>
                <p className="text-sm text-slate-300">
                  CTR {(segment.ctr * 100).toFixed(2)}% | Conversions {segment.conversions} | Weighted Score {segment.weightedEngagementScore}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-xl border border-slate-800 bg-slate-900 p-6">
          <h2 className="text-lg font-semibold">Create Article Ad</h2>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              href="/advertiser/campaigns"
              className="rounded-lg bg-fuchsia-400 px-4 py-2 font-semibold text-slate-950 transition hover:bg-fuchsia-300"
            >
              Create Article Ad
            </Link>
            <span className="rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-300">
              Campaigns in in-memory store: {trackedCampaigns.length}
            </span>
          </div>
        </section>
      </section>
    </main>
  );
}
