/**
 * PlatformCapabilityMatrix — honest ✅/⚠️/❌ table for key capabilities.
 * Based on repo reality, not aspirational marketing.
 */

export type CapabilityCell = "✅" | "⚠️" | "❌";

export type CapabilityDimension =
  | "framework"
  | "runtime"
  | "ui"
  | "api"
  | "registry"
  | "telemetry"
  | "certified";

export interface PlatformCapabilityRow {
  id: string;
  capability: string;
  framework: CapabilityCell;
  runtime: CapabilityCell;
  ui: CapabilityCell;
  api: CapabilityCell;
  registry: CapabilityCell;
  telemetry: CapabilityCell;
  certified: CapabilityCell;
  notes?: string;
  frameworkId?: string;
}

/**
 * Legend:
 * ✅ present and used
 * ⚠️ partial / scaffold / mixed
 * ❌ missing or deferred
 */
export const PLATFORM_CAPABILITY_MATRIX: PlatformCapabilityRow[] = [
  {
    id: "beat-locker",
    capability: "BeatLocker",
    framework: "✅",
    runtime: "✅",
    ui: "✅",
    api: "⚠️",
    registry: "✅",
    telemetry: "⚠️",
    certified: "✅",
    frameworkId: "beat-locker",
    notes: "Inventory + exclusivity real; admin /admin/beat-locker wired.",
  },
  {
    id: "presentation",
    capability: "Presentation",
    framework: "✅",
    runtime: "⚠️",
    ui: "✅",
    api: "❌",
    registry: "✅",
    telemetry: "✅",
    certified: "⚠️",
    frameworkId: "presentation",
    notes: "Directors + admin preview real; Phase52* adoption files are Level-1 harnesses only — not production E2E certified.",
  },
  {
    id: "curtain-control",
    capability: "Performer Curtain Control",
    framework: "✅",
    runtime: "⚠️",
    ui: "✅",
    api: "❌",
    registry: "⚠️",
    telemetry: "⚠️",
    certified: "⚠️",
    frameworkId: "presentation",
    notes: "CurtainRuntimeManager + PerformerCurtainControlPanel on /hub/performer stage_tools + /live/go. Overlay/ad-rail only; no 3D .glb; Rule-12 getAdSlotForZone.",
  },
  {
    id: "messaging",
    capability: "Messaging",
    framework: "⚠️",
    runtime: "⚠️",
    ui: "✅",
    api: "⚠️",
    registry: "⚠️",
    telemetry: "❌",
    certified: "⚠️",
    frameworkId: "messaging",
    notes: "Drawer + canister UI; backend depth varies.",
  },
  {
    id: "playlist-cast",
    capability: "Playlist cast",
    framework: "✅",
    runtime: "✅",
    ui: "✅",
    api: "⚠️",
    registry: "✅",
    telemetry: "⚠️",
    certified: "✅",
    frameworkId: "media",
    notes: "PlaylistMonitorCast → CanonicalDualMonitorStack.",
  },
  {
    id: "fan-lobby",
    capability: "Fan Lobby",
    framework: "⚠️",
    runtime: "⚠️",
    ui: "✅",
    api: "⚠️",
    registry: "⚠️",
    telemetry: "⚠️",
    certified: "⚠️",
    frameworkId: "fan-lobby",
    notes: "Multiple seat systems still converging (Rule 21).",
  },
  {
    id: "submission",
    capability: "Universal Submissions",
    framework: "✅",
    runtime: "✅",
    ui: "✅",
    api: "✅",
    registry: "✅",
    telemetry: "⚠️",
    certified: "✅",
    frameworkId: "submission",
  },
  {
    id: "scores-ranking",
    capability: "Scores / Ranking",
    framework: "✅",
    runtime: "✅",
    ui: "✅",
    api: "⚠️",
    registry: "✅",
    telemetry: "⚠️",
    certified: "✅",
    frameworkId: "scores-ranking",
  },
  {
    id: "broadcast",
    capability: "Broadcast Director",
    framework: "✅",
    runtime: "✅",
    ui: "⚠️",
    api: "❌",
    registry: "⚠️",
    telemetry: "⚠️",
    certified: "✅",
    frameworkId: "broadcast",
  },
  {
    id: "competition",
    capability: "Competition Runtime",
    framework: "✅",
    runtime: "⚠️",
    ui: "⚠️",
    api: "⚠️",
    registry: "⚠️",
    telemetry: "⚠️",
    certified: "⚠️",
    frameworkId: "competition",
  },
  {
    id: "identity",
    capability: "Identity / Roles",
    framework: "✅",
    runtime: "✅",
    ui: "✅",
    api: "✅",
    registry: "✅",
    telemetry: "⚠️",
    certified: "✅",
    frameworkId: "identity",
  },
  {
    id: "workspace",
    capability: "Workspace Shell",
    framework: "✅",
    runtime: "✅",
    ui: "✅",
    api: "❌",
    registry: "✅",
    telemetry: "⚠️",
    certified: "✅",
    frameworkId: "workspace",
  },
  {
    id: "commerce",
    capability: "Commerce / Marketplace",
    framework: "⚠️",
    runtime: "⚠️",
    ui: "⚠️",
    api: "⚠️",
    registry: "⚠️",
    telemetry: "❌",
    certified: "❌",
    frameworkId: "commerce-marketplace",
    notes: "Stripe partial; full financial automation deferred.",
  },
  {
    id: "ai-assistants",
    capability: "AI Assistants",
    framework: "⚠️",
    runtime: "❌",
    ui: "⚠️",
    api: "❌",
    registry: "❌",
    telemetry: "❌",
    certified: "❌",
    frameworkId: "ai-assistants",
    notes: "Stub consoles only — AI city deferred.",
  },
  {
    id: "platform-core",
    capability: "Platform Core registries",
    framework: "✅",
    runtime: "⚠️",
    ui: "✅",
    api: "❌",
    registry: "✅",
    telemetry: "⚠️",
    certified: "⚠️",
    frameworkId: "platform-core",
    notes: "lib/platform + lib/mainframe + /admin/platform-core UI real; Intelligence Deck surfaces health card + deep link. Thin MainframeCoordinator — not an autonomous god-runtime.",
  },
  {
    id: "observatory",
    capability: "Overseer Observatory Intelligence",
    framework: "✅",
    runtime: "⚠️",
    ui: "✅",
    api: "⚠️",
    registry: "✅",
    telemetry: "✅",
    certified: "⚠️",
    frameworkId: "platform-core",
    notes: "Phase 1 Living OS Control Desk mounts below Live Channel Ticker (rail + period filter + primary workspace swap). Overview/Presentation/Rooms/System Health reuse ObservatoryIntelligencePanel + PresentationTelemetry + ObservatoryDeck + PlatformCorePanel. BotSummonDeck stays ops rail and Bots panel (BOT_ACCOUNT_REGISTRY). ScamDefenseCenter stays Intelligence Deck. Health lights gray when no telemetry. No Flight Deck shell refactor / no parallel Observatory.",
  },
  {
    id: "dual-monitor",
    capability: "Canonical Dual Monitor Stack",
    framework: "✅",
    runtime: "✅",
    ui: "✅",
    api: "❌",
    registry: "✅",
    telemetry: "⚠️",
    certified: "✅",
    notes: "CanonicalDualMonitorStack + MonitorAnchorZones.",
  },
  {
    id: "lobby-wall",
    capability: "Lobby Wall / Live Stations",
    framework: "✅",
    runtime: "✅",
    ui: "✅",
    api: "✅",
    registry: "✅",
    telemetry: "⚠️",
    certified: "⚠️",
    frameworkId: "broadcast",
    notes:
      "Phase 5.3A: LiveSurfaceCard projects GlobalLiveSessionRegistry via GET /api/live/go → /live/lobby-wall + LiveLobbyWallGrid (LobbyEntryFlow). Honest empty when no sessions. Heat/prize/sponsor tile signals deferred.",
  },
  {
    id: "live-discovery",
    capability: "Live Discovery Overlay / Home Lobby Walls",
    framework: "✅",
    runtime: "✅",
    ui: "✅",
    api: "✅",
    registry: "✅",
    telemetry: "⚠️",
    certified: "⚠️",
    frameworkId: "broadcast",
    notes:
      "DiscoveryBus + DiscoveryPublisher sync from /api/live/go; LobbyDiscoveryCard → LiveSurfaceCardView; HomeLiveLobbyWall + GlobalLiveDiscoveryOverlay join via LobbyEntryFlow. Light discoveryScore from isLive/audience/freshness only — no fake momentum.",
  },
];

export function listCapabilityMatrix(): PlatformCapabilityRow[] {
  return [...PLATFORM_CAPABILITY_MATRIX];
}

export function getCapabilityRow(id: string): PlatformCapabilityRow | undefined {
  return PLATFORM_CAPABILITY_MATRIX.find((r) => r.id === id);
}

export const PlatformCapabilityMatrix = {
  list: listCapabilityMatrix,
  get: getCapabilityRow,
  dimensions: [
    "framework",
    "runtime",
    "ui",
    "api",
    "registry",
    "telemetry",
    "certified",
  ] as CapabilityDimension[],
};

export default PlatformCapabilityMatrix;
