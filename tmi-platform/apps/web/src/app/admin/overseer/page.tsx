import LiveFeedMonitor from "@/components/admin/LiveFeedMonitor";
import RevenueMonitor from "@/components/admin/RevenueMonitor";
import BotSummonDeck from "@/components/admin/BotSummonDeck";
import ThreatWall from "@/components/admin/ThreatWall";
import ChainCommandPanel from "@/components/admin/ChainCommandPanel";
import AccountLinkerPanel from "@/components/admin/AccountLinkerPanel";
import UnifiedInboxPanel from "@/components/admin/UnifiedInboxPanel";
import ArtistAnalyticsPanel from "@/components/admin/ArtistAnalyticsPanel";
import MagazineAnalyticsPanel from "@/components/admin/MagazineAnalyticsPanel";
import SecuritySentinelWall from "@/components/admin/SecuritySentinelWall";
import OverseerDock from "@/components/admin/overseer/OverseerDock";

export const metadata = {
  title: "Overseer Deck v4 — BernoutGlobal Command Center",
};

export default function AdminOverseerPage() {
  return (
    <div className="relative flex min-h-screen flex-col bg-[#06060e] text-zinc-100 pb-14">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 border-b border-amber-400/20 bg-black/90 backdrop-blur-sm">
        <div className="mx-auto flex max-w-[1800px] items-center justify-between gap-4 px-4 py-2.5">
          <div className="flex items-center gap-3">
            <span className="rounded border border-amber-400/50 bg-amber-500/10 px-2 py-0.5 text-[10px] font-black uppercase tracking-[0.18em] text-amber-300">
              OVERSEER v4
            </span>
            <span className="hidden text-[10px] uppercase tracking-[0.1em] text-zinc-500 sm:block">
              BernoutGlobal · Command Center
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-green-400" />
              <span className="text-[9px] font-black uppercase text-green-300">Systems Live</span>
            </span>
            <span className="text-[9px] uppercase text-zinc-500">
              {new Date().toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
            </span>
          </div>
        </div>
      </header>

      {/* ── Main grid ──────────────────────────────────────────────────────── */}
      <main className="mx-auto flex w-full max-w-[1800px] flex-1 flex-col gap-3 p-3">

        {/* Row 1 — Chain Command | Live Feed Monitor | Threat Wall */}
        <div className="grid gap-3 lg:grid-cols-[300px_1fr_320px]">
          <div id="chain-command"     className="min-h-[380px]"><ChainCommandPanel /></div>
          <div id="live-feed-monitor" className="min-h-[380px]"><LiveFeedMonitor /></div>
          <div id="threat-wall"       className="min-h-[380px]"><ThreatWall /></div>
        </div>

        {/* Row 2 — Revenue Monitor | Bot Summon Deck */}
        <div className="grid gap-3 lg:grid-cols-[1fr_360px]">
          <div id="revenue-monitor"  className="min-h-[300px]"><RevenueMonitor /></div>
          <div id="bot-summon-deck"  className="min-h-[300px]"><BotSummonDeck /></div>
        </div>

        {/* Row 3 — Account Linker | Unified Inbox */}
        <div className="grid gap-3 lg:grid-cols-[340px_1fr]">
          <div id="account-linker"   className="min-h-[320px]"><AccountLinkerPanel /></div>
          <div id="unified-inbox"    className="min-h-[320px]"><UnifiedInboxPanel /></div>
        </div>

        {/* Row 4 — Artist Analytics | Magazine Analytics | Security Sentinel */}
        <div className="grid gap-3 lg:grid-cols-[1fr_1fr_360px]">
          <div id="artist-analytics"   className="min-h-[360px]"><ArtistAnalyticsPanel /></div>
          <div id="magazine-analytics" className="min-h-[360px]"><MagazineAnalyticsPanel /></div>
          <div id="security-sentinel"  className="min-h-[360px]"><SecuritySentinelWall /></div>
        </div>

      </main>

      {/* ── Overseer Dock ──────────────────────────────────────────────────── */}
      <OverseerDock operatorName="Big Ace" operatorRole="Platform Director" systemHealth={98} />
    </div>
  );
}
