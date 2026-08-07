"use client";

/**
 * In-slot section catalog for Overseer surround panels.
 * Cycles inside existing containers — no route changes / no leaving Overseer.
 * Center dual media monitors stay primary (not wrapped).
 */

import ObservatoryLiveSwitcher from "@/components/admin/overseer/ObservatoryLiveSwitcher";
import type { OverseerSectionOption } from "@/components/admin/overseer/OverseerSectionSwitcher";
import UnifiedInbox from "@/components/admin/overseer/UnifiedInbox";
import SentinelWall from "@/components/admin/overseer/SentinelWall";
import ObservatoryDeck from "@/components/admin/overseer/ObservatoryDeck";
import FeedExplorer from "@/components/admin/overseer/FeedExplorer";
import ThreatPulseRail from "@/components/admin/ThreatPulseRail";
import LiveFeedMonitor from "@/components/admin/LiveFeedMonitor";
import MagazineAnalyticsPanel from "@/components/admin/MagazineAnalyticsPanel";
import BotSummonDeck from "@/components/admin/BotSummonDeck";
import StripeObservatoryCard from "@/components/admin/StripeObservatoryCard";
import AccountLinker from "@/components/admin/overseer/AccountLinker";
import ChainCommandPanel from "@/components/admin/overseer/ChainCommandPanel";
import BigAceFinancePanel from "@/components/admin/BigAceFinancePanel";
import RevenueBusinessmanPanel from "@/components/admin/RevenueBusinessmanPanel";
import BotActivitySwitcherPanel from "@/components/admin/overseer/BotActivitySwitcherPanel";

/** Extra sections every surround slot can rotate into (plus the panel's default). */
export function buildSurroundSectionOptions(): OverseerSectionOption[] {
  return [
    {
      id: "bot-activity",
      label: "Bot Activity / NPC Journal",
      accent: "#FFD700",
      render: () => <BotActivitySwitcherPanel compact />,
    },
    {
      id: "live-roster",
      label: "Public-Live Picker",
      accent: "#FF2DAA",
      render: () => <ObservatoryLiveSwitcher mode="roster" compact embedded />,
    },
    {
      id: "live-pov",
      label: "Bot/Human POV",
      accent: "#00FFFF",
      render: () => <ObservatoryLiveSwitcher mode="pov" compact embedded />,
    },
    {
      id: "live-activity",
      label: "Activity Readout",
      accent: "#FFD700",
      render: () => <ObservatoryLiveSwitcher mode="activity" compact embedded />,
    },
    {
      id: "live-voice",
      label: "Voice / Status",
      accent: "#00FF88",
      render: () => <ObservatoryLiveSwitcher mode="voice" compact embedded />,
    },
    {
      id: "live-dual",
      label: "POV + Activity Dual",
      accent: "#00FFFF",
      render: () => <ObservatoryLiveSwitcher mode="dual" compact embedded />,
    },
    {
      id: "live-switcher-full",
      label: "Full Live Switcher",
      accent: "#FF2DAA",
      render: () => <ObservatoryLiveSwitcher mode="full" compact embedded />,
    },
    {
      id: "bot-summon",
      label: "Bot Roster & Summon",
      accent: "#FF2DAA",
      render: () => <BotSummonDeck />,
    },
    {
      id: "live-feed",
      label: "Live Feed Monitor",
      accent: "#00FFFF",
      render: () => <LiveFeedMonitor />,
    },
    {
      id: "feed-explorer",
      label: "Feed Explorer",
      accent: "#00FFFF",
      render: () => <FeedExplorer />,
    },
    {
      id: "runtime-health",
      label: "Runtime Health",
      accent: "#00FF88",
      render: () => <ObservatoryDeck />,
    },
    {
      id: "threat-pulse",
      label: "Threat Pulse",
      accent: "#FF4444",
      render: () => (
        <div style={{ padding: 8 }}>
          <ThreatPulseRail />
        </div>
      ),
    },
    {
      id: "sentinel",
      label: "Security Sentinel",
      accent: "#FF4444",
      render: () => <SentinelWall />,
    },
    {
      id: "inbox",
      label: "Unified Inbox",
      accent: "#00FFFF",
      render: () => <UnifiedInbox />,
    },
    {
      id: "magazine-inventory",
      label: "Magazine Inventory",
      accent: "#FF2DAA",
      render: () => <MagazineAnalyticsPanel />,
    },
    {
      id: "chain-command",
      label: "Chain Command",
      accent: "#AA2DFF",
      render: () => <ChainCommandPanel />,
    },
    {
      id: "money-billing",
      label: "Money & Billing",
      accent: "#FFD700",
      render: () => <BigAceFinancePanel />,
    },
    {
      id: "revenue-businessman",
      label: "Revenue Businessman",
      accent: "#FFD700",
      render: () => <RevenueBusinessmanPanel />,
    },
    {
      id: "account-linker",
      label: "Account Linker",
      accent: "#AA2DFF",
      render: () => <AccountLinker />,
    },
    {
      id: "stripe",
      label: "Stripe Observatory",
      accent: "#00FFFF",
      render: () => <StripeObservatoryCard />,
    },
  ];
}
