import type { ComponentType } from "react";

import ChainCommandPanel from "@/components/admin/overseer/ChainCommandPanel";
import FeedExplorer from "@/components/admin/overseer/FeedExplorer";
import SentinelWall from "@/components/admin/overseer/SentinelWall";
import AccountLinker from "@/components/admin/overseer/AccountLinker";
import MagazineAnalytics from "@/components/admin/overseer/MagazineAnalytics";
import UnifiedInbox from "@/components/admin/overseer/UnifiedInbox";
import LiveFeedRouter from "@/components/admin/overseer/LiveFeedRouter";
import BattleLobby from "@/components/admin/overseer/BattleLobby";
import BotSummonDeck from "@/components/admin/BotSummonDeck";
import BigAceFinancePanel from "@/components/admin/BigAceFinancePanel";
import AdminRevenuePanel from "@/components/admin/AdminRevenuePanel";
import StripeObservatoryCard from "@/components/admin/StripeObservatoryCard";
import ObservatoryDeck from "@/components/admin/overseer/ObservatoryDeck";
import MediaMatrixEngine from "./widgets/MediaMatrixEngine";
import {
  ComplianceOverviewPanel,
  ContactSupportPanel,
  LegalDocPanel,
} from "./widgets/LegalCenterWidgets";

import type { WorkspaceWidgetKey } from "./WorkspaceSchema";

type WidgetZone = "left" | "center" | "right" | "bottom";

export type WorkspaceWidgetDefinition = {
  id: WorkspaceWidgetKey;
  title: string;
  defaultZone: WidgetZone;
  permissions?: string[];
  component: ComponentType;
};

function PlaceholderWidget({ title, detail }: { title: string; detail: string }) {
  return (
    <div
      style={{
        height: "100%",
        minHeight: 120,
        borderRadius: 10,
        border: "1px solid rgba(255,215,0,0.25)",
        background: "linear-gradient(160deg, rgba(18,10,24,0.92), rgba(8,4,12,0.96))",
        padding: 12,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
    >
      <div style={{ color: "#FFD700", fontWeight: 800, letterSpacing: "0.08em", fontSize: 11, textTransform: "uppercase" }}>
        {title}
      </div>
      <div style={{ color: "rgba(255,255,255,0.8)", fontSize: 12, lineHeight: 1.45 }}>{detail}</div>
      <div style={{ color: "rgba(0,255,255,0.75)", fontSize: 10, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase" }}>
        Bound to workspace registry
      </div>
    </div>
  );
}

function RevenuePanelWidget() {
  return (
    <AdminRevenuePanel
      selectedId="billing"
      onSelect={(id) => {
        window.location.href = id === "artist-analytics" ? "/admin/artist-analytics" : "/admin/revenue";
      }}
    />
  );
}

export const WORKSPACE_WIDGET_REGISTRY: Record<WorkspaceWidgetKey, WorkspaceWidgetDefinition> = {
  "chain-command": { id: "chain-command", title: "Chain Command", defaultZone: "left", component: ChainCommandPanel },
  "money-billing": { id: "money-billing", title: "Money and Billing", defaultZone: "left", permissions: ["revenue.manage"], component: BigAceFinancePanel },
  "bot-roster": { id: "bot-roster", title: "Bot Roster", defaultZone: "left", permissions: ["automation.manage"], component: BotSummonDeck },
  "media-matrix": { id: "media-matrix", title: "Media Matrix", defaultZone: "center", permissions: ["media.manage"], component: MediaMatrixEngine },
  "unified-inbox": { id: "unified-inbox", title: "Unified Inbox", defaultZone: "left", component: UnifiedInbox },
  "broadcast-monitor": { id: "broadcast-monitor", title: "Broadcast Monitor", defaultZone: "center", component: LiveFeedRouter },
  "battle-lobby": { id: "battle-lobby", title: "Battle Lobby", defaultZone: "center", component: BattleLobby },
  "feed-explorer": { id: "feed-explorer", title: "Feed Explorer", defaultZone: "center", component: FeedExplorer },
  "security-wall": { id: "security-wall", title: "Security Wall", defaultZone: "right", permissions: ["security.manage"], component: SentinelWall },
  "account-linker": { id: "account-linker", title: "Account Linker", defaultZone: "right", component: AccountLinker },
  "stripe-observatory": { id: "stripe-observatory", title: "Stripe Observatory", defaultZone: "right", permissions: ["revenue.manage"], component: StripeObservatoryCard },
  "revenue-panel": { id: "revenue-panel", title: "Revenue Panel", defaultZone: "bottom", permissions: ["revenue.manage"], component: RevenuePanelWidget },
  "magazine-analytics": { id: "magazine-analytics", title: "Magazine Analytics", defaultZone: "bottom", component: MagazineAnalytics },
  "automation-workforce": {
    id: "automation-workforce",
    title: "Automation Workforce",
    defaultZone: "left",
    permissions: ["automation.manage"],
    component: () => <PlaceholderWidget title="Automation Workforce" detail="Queue supervision, bot orchestration, and worker lane controls." />,
  },
  "runtime-health": { id: "runtime-health", title: "Runtime Health", defaultZone: "center", component: ObservatoryDeck },
  "queue-processing": {
    id: "queue-processing",
    title: "Queue Processing",
    defaultZone: "left",
    permissions: ["queue.manage"],
    component: () => <PlaceholderWidget title="Queue Processing" detail="Background job throughput, retry loops, and dead-letter observations." />,
  },
  "deployment-status": {
    id: "deployment-status",
    title: "Deployment Status",
    defaultZone: "right",
    permissions: ["deployment.manage"],
    component: () => <PlaceholderWidget title="Deployment Status" detail="Release gates, deployment state, and environment synchronization." />,
  },
  "media-pipeline": {
    id: "media-pipeline",
    title: "Media Pipeline",
    defaultZone: "right",
    permissions: ["media.manage"],
    component: () => <PlaceholderWidget title="Media Pipeline" detail="Upload ingest, encode status, and stream conversion runtime health." />,
  },
  "music-studio": {
    id: "music-studio",
    title: "Music Studio",
    defaultZone: "left",
    permissions: ["music.manage"],
    component: () => <PlaceholderWidget title="Music Studio" detail="Beat production controls, playlist strategy, and studio orchestration." />,
  },
  "music-submissions": {
    id: "music-submissions",
    title: "Music Submissions",
    defaultZone: "left",
    permissions: ["music.manage"],
    component: () => <PlaceholderWidget title="Music Submissions" detail="Submission queue, approval flow, and publication routing." />,
  },
  "observer-reports": {
    id: "observer-reports",
    title: "Observer Reports",
    defaultZone: "left",
    permissions: ["read.only"],
    component: () => <PlaceholderWidget title="Observer Reports" detail="Read-only insight stream with recommendation and certification context." />,
  },
  "legal-overview": { id: "legal-overview", title: "Legal Overview", defaultZone: "center", component: ComplianceOverviewPanel },
  "legal-doc-disclaimer": { id: "legal-doc-disclaimer", title: "Disclaimer", defaultZone: "left", component: () => <LegalDocPanel id="disclaimer" /> },
  "legal-doc-promoter": { id: "legal-doc-promoter", title: "Promoter Agreement", defaultZone: "left", component: () => <LegalDocPanel id="promoter" /> },
  "legal-doc-ticket": { id: "legal-doc-ticket", title: "Ticket Policy", defaultZone: "right", component: () => <LegalDocPanel id="ticket" /> },
  "legal-doc-terms": { id: "legal-doc-terms", title: "Terms", defaultZone: "bottom", component: () => <LegalDocPanel id="terms" /> },
  "legal-doc-privacy": { id: "legal-doc-privacy", title: "Privacy", defaultZone: "bottom", component: () => <LegalDocPanel id="privacy" /> },
  "legal-doc-dmca": { id: "legal-doc-dmca", title: "DMCA", defaultZone: "right", component: () => <LegalDocPanel id="dmca" /> },
  "legal-doc-community": { id: "legal-doc-community", title: "Community", defaultZone: "center", component: () => <LegalDocPanel id="community" /> },
  "legal-contact": { id: "legal-contact", title: "Legal Contact", defaultZone: "right", component: ContactSupportPanel },
};

export function getWorkspaceWidgetComponent(widget: WorkspaceWidgetKey): ComponentType {
  return WORKSPACE_WIDGET_REGISTRY[widget].component;
}
