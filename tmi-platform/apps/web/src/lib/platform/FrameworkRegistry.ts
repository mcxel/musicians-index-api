/**
 * FrameworkRegistry — manifests for frameworks that already exist or are DRAFT homes.
 * Honest certificationStatus only. No fake CERTIFIED entries.
 */

import type { CertificationStatus } from "@/lib/mainframe/types";

export interface FrameworkManifest {
  id: string;
  version: string;
  owner: string;
  capabilities: string[];
  dependencies: string[];
  eventsConsumed: string[];
  eventsEmitted: string[];
  permissionsRequired: string[];
  dataSources: string[];
  healthChecks: string[];
  rollbackStrategy: string;
  certificationStatus?: CertificationStatus;
  /** Source path for assembly directors */
  sourcePath?: string;
  notes?: string;
}

const MANIFESTS: FrameworkManifest[] = [
  {
    id: "workspace",
    version: "1.0.0",
    owner: "TMI Workspace Shell",
    capabilities: ["workspace-layouts", "widget-slots", "command-center-stack"],
    dependencies: [],
    eventsConsumed: ["WORKSPACE_ACTIVATED", "WORKSPACE_LOADED", "LAYOUT_CHANGED"],
    eventsEmitted: ["WORKSPACE_SAVED", "LAYOUT_CHANGED"],
    permissionsRequired: ["workspace.read", "workspace.write"],
    dataSources: ["WorkspaceConfigs", "WorkspaceWidgetRegistry"],
    healthChecks: ["workspace-widget-registry"],
    rollbackStrategy: "revert-to-default-workspace-config",
    certificationStatus: "CERTIFIED",
    sourcePath: "apps/web/src/components/admin/overseer/workspace/",
  },
  {
    id: "presentation",
    version: "5.1.0",
    owner: "Presentation Framework",
    capabilities: [
      "show-packages",
      "monitor-anchor-zones",
      "layer-stack",
      "semantic-events",
      "director-scaffold",
    ],
    dependencies: ["broadcast", "media"],
    eventsConsumed: [
      "BATTLE_START",
      "BATTLE_INTRO",
      "VS_REVEAL",
      "PERFORMER_TURN",
      "VOTING_OPEN",
      "WINNER_DECLARED",
      "CYPHER_START",
      "CHALLENGE_START",
    ],
    eventsEmitted: [
      "tmi:presentation:show_package",
      "tmi:presentation:placement_intent",
      "tmi:presentation:telemetry",
    ],
    permissionsRequired: ["presentation.preview", "presentation.live"],
    dataSources: [
      "ShowPackageDirector",
      "PresentationPackageRegistry",
      "MonitorAnchorZones",
    ],
    healthChecks: ["show-package-snapshot", "presentation-state-machine"],
    rollbackStrategy: "ShowPackageDirector.reset + idle state",
    certificationStatus: "TESTING",
    sourcePath: "apps/web/src/lib/presentation/",
    notes:
      "Foundation CERTIFIED at 60e4b561; Phase 5.1 directors are scaffold/TESTING.",
  },
  {
    id: "submission",
    version: "1.0.0",
    owner: "Universal Submissions",
    capabilities: ["song-submit", "beat-submit", "review-queue", "status-chain"],
    dependencies: ["identity", "media"],
    eventsConsumed: [],
    eventsEmitted: ["submission.received", "submission.status_changed"],
    permissionsRequired: ["submission.create", "submission.review"],
    dataSources: ["SubmissionEngine", "AdminSubmissionPanel"],
    healthChecks: ["submission-api"],
    rollbackStrategy: "leave-submission-in-prior-status",
    certificationStatus: "CERTIFIED",
    sourcePath: "apps/web/src/lib/submissions/",
  },
  {
    id: "beat-locker",
    version: "1.0.0",
    owner: "Beat Systems",
    capabilities: [
      "beat-inventory",
      "exclusivity-check",
      "marketplace-lease",
      "competition-vault-gate",
    ],
    dependencies: ["submission", "commerce"],
    eventsConsumed: [],
    eventsEmitted: [],
    permissionsRequired: ["beat.read", "beat.manage"],
    dataSources: [
      "BeatInventoryEngine",
      "BeatStoreCommerceEngine",
      "CompetitionMusicEngine",
    ],
    healthChecks: ["isBeatExclusivelySold"],
    rollbackStrategy: "inventory-snapshot-revert",
    certificationStatus: "CERTIFIED",
    sourcePath: "apps/web/src/lib/beats/",
    notes: "Three engines intentionally separated (Rule 19).",
  },
  {
    id: "scores-ranking",
    version: "1.0.0",
    owner: "Ranking Engine",
    capabilities: ["compute-ranks", "crown-rotation", "scores-canister"],
    dependencies: ["identity"],
    eventsConsumed: [],
    eventsEmitted: ["ranking.updated"],
    permissionsRequired: ["ranking.read"],
    dataSources: ["PerformerRegistry.computeRanks", "ScoresCanister"],
    healthChecks: ["computeRanks"],
    rollbackStrategy: "recompute-from-registry",
    certificationStatus: "CERTIFIED",
    sourcePath: "apps/web/src/lib/performers/PerformerRegistry.ts",
  },
  {
    id: "media",
    version: "1.0.0",
    owner: "Media Engine",
    capabilities: ["playlist", "playlist-cast", "media-locker", "monitor-cast"],
    dependencies: [],
    eventsConsumed: [],
    eventsEmitted: ["media.play", "media.pause", "media.queue_change"],
    permissionsRequired: ["media.read", "media.cast"],
    dataSources: ["PlaylistMonitorCast", "PlaylistArtifactEngine"],
    healthChecks: ["playlist-cast"],
    rollbackStrategy: "clear-cast-target",
    certificationStatus: "CERTIFIED",
    sourcePath: "apps/web/src/lib/playlists/",
  },
  {
    id: "broadcast",
    version: "2.0.0",
    owner: "Broadcast Engine",
    capabilities: [
      "broadcast-director-profiles",
      "overlay-runtime",
      "control-runtime",
      "experience-bridge",
    ],
    dependencies: ["media"],
    eventsConsumed: ["EXPERIENCE_STARTED", "ROUND_CHANGED"],
    eventsEmitted: ["CAMERA_CHANGED", "overlay.displayed"],
    permissionsRequired: ["broadcast.direct"],
    dataSources: ["BroadcastDirectorEngine", "BroadcastOverlayRuntime"],
    healthChecks: ["broadcast-shot-select"],
    rollbackStrategy: "fallback-stage-view",
    certificationStatus: "CERTIFIED",
    sourcePath: "apps/web/src/lib/live/BroadcastDirectorEngine.ts",
  },
  {
    id: "competition",
    version: "1.0.0",
    owner: "Competition Runtime",
    capabilities: [
      "battle-state",
      "cypher-runtime",
      "challenge-runtime",
      "format-rules",
    ],
    dependencies: ["broadcast", "presentation", "scores-ranking"],
    eventsConsumed: [],
    eventsEmitted: ["BATTLE_START", "VS_REVEAL", "WINNER_DECLARED"],
    permissionsRequired: ["competition.operate"],
    dataSources: [
      "CompetitionRuntime",
      "BattleFormatRulesEngine",
      "BattleBroadcastStateMachine",
    ],
    healthChecks: ["competition-runtime"],
    rollbackStrategy: "abort-round-to-idle",
    certificationStatus: "TESTING",
    sourcePath: "apps/web/src/lib/competition/",
  },
  {
    id: "identity",
    version: "1.0.0",
    owner: "Auth / Role Provisioning",
    capabilities: [
      "session",
      "role-gate",
      "role-provisioning",
      "performer-registry",
    ],
    dependencies: [],
    eventsConsumed: [],
    eventsEmitted: ["USER_REGISTERED", "USER_ROLE_ASSIGNED"],
    permissionsRequired: ["identity.read"],
    dataSources: ["PerformerRegistry", "RoleGate", "/api/auth/session"],
    healthChecks: ["auth-session"],
    rollbackStrategy: "session-invalidate",
    certificationStatus: "CERTIFIED",
    sourcePath: "apps/web/src/lib/auth/",
  },
  {
    id: "ai-assistants",
    version: "0.1.0",
    owner: "Executive Assistants (stubs)",
    capabilities: ["big-ace-console", "michael-charlie-console"],
    dependencies: [],
    eventsConsumed: [],
    eventsEmitted: [],
    permissionsRequired: ["admin.ai.ask"],
    dataSources: ["BigAceCommandCenter", "AdminConcierge"],
    healthChecks: [],
    rollbackStrategy: "disable-assistant-panel",
    certificationStatus: "DRAFT",
    sourcePath: "apps/web/src/components/admin/",
    notes: "UI shells exist; full AI city / automation deferred.",
  },
  {
    id: "commerce-marketplace",
    version: "0.4.0",
    owner: "Commerce / Stripe",
    capabilities: [
      "stripe-checkout",
      "sponsor-slots",
      "ad-fallback-chain",
      "tips",
    ],
    dependencies: ["identity"],
    eventsConsumed: [],
    eventsEmitted: [],
    permissionsRequired: ["commerce.checkout"],
    dataSources: ["SponsorRegistry.getAdSlotForZone", "stripe/client"],
    healthChecks: ["stripe-client"],
    rollbackStrategy: "cancel-checkout-session",
    certificationStatus: "DRAFT",
    sourcePath: "apps/web/src/lib/stripe/",
    notes: "Partial wiring — not full financial automation.",
  },
  {
    id: "messaging",
    version: "1.0.0",
    owner: "Messaging Canister / Drawer",
    capabilities: ["dm", "group-threads", "messaging-drawer"],
    dependencies: ["identity"],
    eventsConsumed: [],
    eventsEmitted: [],
    permissionsRequired: ["messaging.read", "messaging.send"],
    dataSources: ["MessagingCanister"],
    healthChecks: [],
    rollbackStrategy: "close-drawer",
    certificationStatus: "TESTING",
    sourcePath: "apps/web/src/components/canisters/",
  },
  {
    id: "fan-lobby",
    version: "1.0.0",
    owner: "Lobby Runtime",
    capabilities: ["public-lobby", "private-lobby", "lobby-wall", "seat-claim"],
    dependencies: ["identity", "broadcast"],
    eventsConsumed: ["AUDIENCE_UPDATED"],
    eventsEmitted: [],
    permissionsRequired: ["lobby.join"],
    dataSources: ["LobbySeatEngine", "audienceRuntimeEngine"],
    healthChecks: ["seat-claim"],
    rollbackStrategy: "release-seat",
    certificationStatus: "TESTING",
    sourcePath: "apps/web/src/lib/lobby/",
  },
  {
    id: "platform-core",
    version: "1.0.0",
    owner: "Platform Core",
    capabilities: [
      "framework-registry",
      "algorithm-registry",
      "event-schema-registry",
      "capability-matrix",
      "mainframe-route",
    ],
    dependencies: [],
    eventsConsumed: [],
    eventsEmitted: ["mainframe.route"],
    permissionsRequired: ["admin.platform.read"],
    dataSources: [
      "FrameworkRegistry",
      "AlgorithmRegistry",
      "EventSchemaRegistry",
      "PlatformCapabilityMatrix",
    ],
    healthChecks: ["framework-manifest-count"],
    rollbackStrategy: "noop-read-only",
    certificationStatus: "TESTING",
    sourcePath: "apps/web/src/lib/platform/",
    notes: "Contracts + registries registered now; incremental runtime only.",
  },
];

const BY_ID = new Map(MANIFESTS.map((m) => [m.id, m]));

export function listFrameworkManifests(): FrameworkManifest[] {
  return [...MANIFESTS];
}

export function getFrameworkManifest(id: string): FrameworkManifest | undefined {
  return BY_ID.get(id);
}

export function listFrameworksByStatus(
  status: CertificationStatus
): FrameworkManifest[] {
  return MANIFESTS.filter((m) => m.certificationStatus === status);
}

export const FrameworkRegistry = {
  list: listFrameworkManifests,
  get: getFrameworkManifest,
  byStatus: listFrameworksByStatus,
};

export default FrameworkRegistry;
