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
    notes: "lib/platform + lib/mainframe + /admin/platform-core UI real; thin MainframeCoordinator — not an autonomous god-runtime.",
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
