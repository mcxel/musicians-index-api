/**
 * TMI Game Runtime Constitution — master architecture lock (2026-08-23).
 *
 * CONSOLIDATE BEFORE CREATE: this module POINTS at existing implementations.
 * Do not spawn 60 engine files. Statuses are honest — WIRED | PARTIAL | OPEN | DEFERRED.
 *
 * Quality target: measurable budgets/SLOs (100% × 10 aspiration).
 * NEVER promise literal zero lag, guaranteed 60 FPS everywhere, or 100% reliability.
 *
 * Physical cert / production GLB / progressive stadium fill remain OPEN — not PASS.
 */

/** Core law — platform identity under pressure. */
export const GAME_RUNTIME_CORE_LAW =
  "TMI IS NOT A WEBSITE WITH GAME FEATURES. TMI IS A REAL-TIME SOCIAL ENTERTAINMENT WORLD DELIVERED THROUGH THE WEB." as const;

/** Operational chain — every live surface must map onto this flow. */
export const GAME_RUNTIME_OPERATIONAL_CHAIN = [
  "INPUT",
  "COMMAND_BUS",
  "POLICY_ENTITLEMENT_SAFETY",
  "AUTHORITATIVE_STATE",
  "ROOM_MEDIA_WORLD_EXECUTION",
  "LOCAL_PRESENTATION",
  "NETWORK_SYNC",
  "OBSERVABILITY",
  "AUTO_RECOVERY",
  "PERSISTENCE_EVENT_LEDGER",
  "LEARNING_OPTIMIZATION",
] as const;

export type GameRuntimeChainStage = (typeof GAME_RUNTIME_OPERATIONAL_CHAIN)[number];

/** Priority hierarchy when the client is under load (drop from the bottom first). */
export const GAME_RUNTIME_PRIORITY = {
  P0_LIVE_MEDIA: 0,
  P1_INPUT_ROOM_STATE: 1,
  P2_GAME_STATE: 2,
  P3_UI: 3,
  P4_COSMETICS: 4,
  P5_ANALYTICS_PREFETCH: 5,
} as const;

export type GameRuntimePriorityClass = keyof typeof GAME_RUNTIME_PRIORITY;

/**
 * Device quality tiers — presentation cost only; never authoritative room truth.
 * Maps onto Adaptive World Runtime device/experience tiers via DeviceQualityGovernor.
 */
export type DeviceQualityTier = "LIGHT" | "STANDARD" | "ULTRA";

/**
 * Degraded mode ladder — step down under sustained budget miss.
 * Never fabricate viewers or fake live while degrading (Rule 20).
 */
export const DEGRADED_MODE_LADDER = [
  "ULTRA_3D",
  "STANDARD_3D",
  "LIGHTWEIGHT",
  "VIDEO_ONLY",
  "AUDIO_ONLY",
] as const;

export type DegradedMode = (typeof DEGRADED_MODE_LADDER)[number];

/**
 * Measurable performance budgets (SLO targets — not hard guarantees).
 * Misses trigger degradation / recovery; they do not invent fake success.
 */
export const GAME_RUNTIME_PERFORMANCE_BUDGETS = {
  /** Preferred steady-state frame interval when ULTRA is active. */
  targetFrameMsUltra: 16.7,
  /** Acceptable steady-state on STANDARD (phones / mid devices). */
  targetFrameMsStandard: 22,
  /** Floor for LIGHT — prefer continuity over polish. */
  targetFrameMsLight: 33,
  /** Sustained average above this → consider tier downgrade. */
  stressFrameMsThreshold: 36,
  /** Live media (P0) first-frame budget after GO LIVE bind. */
  liveMediaFirstFrameMsP50: 1200,
  liveMediaFirstFrameMsP95: 3500,
  /** Input → optimistic local echo (reversible actions only). */
  reversibleInputEchoMsP95: 100,
  /** Authoritative ack for payments / ownership / safety-critical. */
  authoritativeAckMsP95: 2500,
  /** Room handoff: old room teardown + new room bind. */
  roomHandoffMsP95: 4000,
  /** Max concurrent WebRTC subscribe tiles on LIVE lobby wall (LIGHT). */
  maxLobbyWallDailyBindsLight: 1,
  maxLobbyWallDailyBindsStandard: 2,
  maxLobbyWallDailyBindsUltra: 4,
  /** Long-session: cap retained frame budget samples. */
  frameBudgetSampleCap: 90,
  /**
   * Spatial: engine unit ↔ display feet until MEASURED_GLB.
   * WorldScenePlan.spatialMap is coordinate authority; tools show sq ft.
   */
  engineUnitToDisplayFt: 1,
} as const;

export type GameRuntimeSystemStatus = "WIRED" | "PARTIAL" | "OPEN" | "DEFERRED";

export type GameRuntimeSystemId =
  | 1
  | 2
  | 3
  | 4
  | 5
  | 6
  | 7
  | 8
  | 9
  | 10
  | 11
  | 12
  | 13
  | 14
  | 15
  | 16
  | 17
  | 18
  | 19
  | 20
  | 21
  | 22
  | 23
  | 24
  | 25
  | 26
  | 27
  | 28
  | 29
  | 30
  | 31
  | 32
  | 33
  | 34
  | 35
  | 36
  | 37
  | 38
  | 39
  | 40
  | 41
  | 42
  | 43
  | 44
  | 45
  | 46
  | 47
  | 48
  | 49
  | 50
  | 51
  | 52
  | 53
  | 54
  | 55
  | 56
  | 57
  | 58
  | 59
  | 60;

export interface GameRuntimeSystemEntry {
  id: GameRuntimeSystemId;
  name: string;
  status: GameRuntimeSystemStatus;
  /** Canonical path(s) when an implementation exists — relative to apps/web/src. */
  canonicalPaths: readonly string[];
  notes: string;
}

/**
 * Registry of the 60 constitution systems.
 * Prefer extending these paths in place over creating parallel engines.
 */
export const GAME_RUNTIME_SYSTEM_REGISTRY: readonly GameRuntimeSystemEntry[] = [
  {
    id: 1,
    name: "Canonical World Coordinate Runtime",
    status: "WIRED",
    canonicalPaths: [
      "lib/world/WorldScenePlan.ts",
      "lib/world/WorldGeneratorRegistry.ts",
    ],
    notes:
      "spatialMap is authority. Values are engine units; tools display ft/sq ft at 1:1 until MEASURED_GLB.",
  },
  {
    id: 2,
    name: "Spatial Partition Engine",
    status: "PARTIAL",
    canonicalPaths: [
      "lib/world/WorldScenePlan.ts",
      "lib/world/WorldGeneratorRegistry.ts",
    ],
    notes: "Zone rects on spatialMap exist; spatial hash / broadphase OPEN.",
  },
  {
    id: 3,
    name: "Full-Sphere Render Director",
    status: "PARTIAL",
    canonicalPaths: [
      "lib/world/WorldScenePlan.ts",
      "lib/engines/runtime/AvatarLODGovernor.ts",
      "lib/avatar/AvatarLODEngine.ts",
    ],
    notes: "viewMode + LOD metadata/hooks; physical LOD pipeline OPEN (post GLB).",
  },
  {
    id: 4,
    name: "Device Quality Governor",
    status: "WIRED",
    canonicalPaths: [
      "lib/runtime/DeviceQualityGovernor.ts",
      "lib/adaptiveWorldRuntime/DeviceCapabilityProfiler.ts",
    ],
    notes: "LIGHT|STANDARD|ULTRA over AWR device/experience tiers; feeds LOD policy hint.",
  },
  {
    id: 5,
    name: "Performance Budget System",
    status: "PARTIAL",
    canonicalPaths: [
      "lib/runtime/GameRuntimeConstitution.ts",
      "lib/adaptiveWorldRuntime/PerformanceGovernor.ts",
      "lib/cinematic/PerformanceBudgetGovernor.ts",
    ],
    notes: "Budgets locked here; AWR measures frame ms — not a hard FPS guarantee.",
  },
  {
    id: 6,
    name: "Predictive Room Streaming",
    status: "OPEN",
    canonicalPaths: [],
    notes: "No predictive room prefetch runtime yet.",
  },
  {
    id: 7,
    name: "Asset Manifest Runtime",
    status: "PARTIAL",
    canonicalPaths: [
      "lib/media/MediaAssetEngine.ts",
      "lib/media/MediaRegistry.ts",
      "lib/build/tmiSectionAssetMap.ts",
    ],
    notes: "Asset registries exist; unified room manifest runtime OPEN.",
  },
  {
    id: 8,
    name: "One Canonical Media Bus",
    status: "WIRED",
    canonicalPaths: [
      "lib/media/canonicalMediaPlayerRuntime.ts",
      "lib/personal-media/PersonalMediaRouter.ts",
    ],
    notes:
      "CANONICAL = canonicalMediaPlayerRuntime (+ PersonalMediaRouter for monitor assign). Go Live binds roomId.",
  },
  {
    id: 9,
    name: "Dynamic Media Frame Director",
    status: "WIRED",
    canonicalPaths: [
      "lib/media/canonicalMediaPlayerRuntime.ts",
      "components/monitors/CanonicalDualMonitorStack.tsx",
    ],
    notes: "Frame layout / park / swap without WebRTC restart.",
  },
  {
    id: 10,
    name: "Adaptive WebRTC Runtime",
    status: "PARTIAL",
    canonicalPaths: [
      "lib/adaptiveWorldRuntime/WebRTCSubscriptionGovernor.ts",
      "lib/media/WebRTCBroadcastEngine.ts",
      "hooks/useStageWebRTC.ts",
    ],
    notes: "Subscribe/quality governance real; full adaptive bitrate / publisher simulcast gap honest.",
  },
  {
    id: 11,
    name: "Media Continuity Ledger",
    status: "PARTIAL",
    canonicalPaths: [
      "lib/media/canonicalMediaPlayerRuntime.ts",
      "lib/media/media-observability-store.ts",
      "lib/live/liveDevicePersistence.ts",
    ],
    notes: "Session continuity via roomId + device persistence; formal ledger OPEN.",
  },
  {
    id: 12,
    name: "Single Active Audio Authority",
    status: "WIRED",
    canonicalPaths: ["lib/media/canonicalMediaPlayerRuntime.ts"],
    notes: "primaryAudioFrame — exactly one unmuted audio frame for the viewer.",
  },
  {
    id: 13,
    name: "Quick Panel Runtime",
    status: "WIRED",
    canonicalPaths: [
      "lib/hud/mobileQuickPanelRuntime.ts",
      "lib/hud/compactQuickPanelStore.ts",
      "components/workspace/universal/CanonicalQuickPanelContent.tsx",
    ],
    notes: "Multiple hosts; treat mobileQuickPanelRuntime + compact store as presentation surface.",
  },
  {
    id: 14,
    name: "Interaction Command Bus",
    status: "WIRED",
    canonicalPaths: [
      "lib/runtime/InteractionCommandBus.ts",
      "lib/venue-hud/TMIExperienceHudRuntime.ts",
      "lib/personal-media/PersonalMediaCommandBus.ts",
    ],
    notes: "Thin typed dispatcher + HudCommandBus + PersonalMediaCommandBus — gradual adopt.",
  },
  {
    id: 15,
    name: "1-Action UX Law",
    status: "PARTIAL",
    canonicalPaths: ["lib/dock/presentInstantGoLiveInPlace.ts"],
    notes:
      "Optimistic only for reversible; payments/ownership/safety wait for server authority.",
  },
  {
    id: 16,
    name: "State Machine Everywhere",
    status: "PARTIAL",
    canonicalPaths: [
      "lib/world/worldScenePlanStore.ts",
      "lib/broadcast/globalLiveSessionStore.ts",
    ],
    notes: "Key live paths use stores/machines; not universal yet.",
  },
  {
    id: 17,
    name: "Offline/Degraded Mode",
    status: "PARTIAL",
    canonicalPaths: [
      "lib/devices/OfflineReconnectQueue.ts",
      "lib/adaptiveWorldRuntime/IdleFallbackGovernor.ts",
      "lib/runtime/DeviceQualityGovernor.ts",
    ],
    notes: "Degraded ladder locked; full offline world mode OPEN.",
  },
  {
    id: 18,
    name: "Error Recovery Directory",
    status: "PARTIAL",
    canonicalPaths: [
      "lib/runtime/RuntimeRecoveryEngine.ts",
      "lib/runtime/FeedRecoveryEngine.ts",
      "lib/socket/SocketRecoveryEngine.ts",
    ],
    notes: "Recovery engines exist; single directory UX surface PARTIAL.",
  },
  {
    id: 19,
    name: "Circuit Breakers",
    status: "PARTIAL",
    canonicalPaths: [
      "lib/ops/SystemResilienceHQ.ts",
      "lib/runtime/RuntimeSurvivabilityOrchestrator.ts",
      "components/operator/KillSwitchPanel.tsx",
    ],
    notes: "Resilience + kill switches; formal per-service circuit breaker registry OPEN.",
  },
  {
    id: 20,
    name: "Worker/Off-Main-Thread Runtime",
    status: "PARTIAL",
    canonicalPaths: ["lib/ai-visuals/VisualWorkerHealthEngine.ts"],
    notes: "Worker health exists; general off-main game worker runtime OPEN.",
  },
  {
    id: 21,
    name: "Frame Scheduler",
    status: "WIRED",
    canonicalPaths: ["lib/adaptiveWorldRuntime/FrameBudgetScheduler.ts"],
    notes: "Real rAF delta samples — no fabricated FPS.",
  },
  {
    id: 22,
    name: "Long-Session Memory Discipline",
    status: "PARTIAL",
    canonicalPaths: ["lib/adaptiveWorldRuntime/FrameBudgetScheduler.ts"],
    notes: "Sample cap enforced; broader leak/GC discipline OPEN.",
  },
  {
    id: 23,
    name: "Resource Ownership Registry",
    status: "PARTIAL",
    canonicalPaths: ["lib/commerce/OwnershipRuntime.ts"],
    notes: "Commerce ownership; GPU/media resource ownership registry OPEN.",
  },
  {
    id: 24,
    name: "Hot/Cold Asset Cache",
    status: "OPEN",
    canonicalPaths: [],
    notes: "No unified hot/cold cache runtime yet.",
  },
  {
    id: 25,
    name: "Room Handoff Runtime",
    status: "PARTIAL",
    canonicalPaths: [
      "lib/live/LiveDestinationRouter.ts",
      "lib/dock/presentInstantGoLiveInPlace.ts",
    ],
    notes: "Routing + in-place GO LIVE; formal handoff state machine OPEN.",
  },
  {
    id: 26,
    name: "Deterministic Room Registry",
    status: "WIRED",
    canonicalPaths: [
      "lib/broadcast/globalLiveSessionStore.ts",
      "lib/world/worldScenePlanStore.ts",
    ],
    notes: "Live session + scene plan keyed by roomId.",
  },
  {
    id: 27,
    name: "Interaction Zones",
    status: "PARTIAL",
    canonicalPaths: ["lib/world/WorldScenePlan.ts"],
    notes: "SpatialZoneFt kinds exist; click/hover zone runtime OPEN.",
  },
  {
    id: 28,
    name: "Seat Runtime",
    status: "WIRED",
    canonicalPaths: [
      "lib/live/audienceRuntimeEngine.ts",
      "lib/runtime/specification/venue/SeatAssignmentEngine.ts",
    ],
    notes: "Canonical audience/seat path; SeatingMeshEngine capabilities partially inherited.",
  },
  {
    id: 29,
    name: "Video-Panel Physics Runtime",
    status: "PARTIAL",
    canonicalPaths: [
      "lib/venue-hud/SpatialVideoPresenceDirector.ts",
      "hooks/useVideoPresenceLocomotion.ts",
    ],
    notes: "Presence locomotion exists; full panel physics OPEN.",
  },
  {
    id: 30,
    name: "Camera Director",
    status: "PARTIAL",
    canonicalPaths: [
      "lib/live/BroadcastDirectorEngine.ts",
      "lib/presentation/directors/BroadcastDirector.ts",
    ],
    notes: "Shot profiles wired as metadata; physical cert cuts still OPEN.",
  },
  {
    id: 31,
    name: "Input Abstraction Layer",
    status: "OPEN",
    canonicalPaths: [],
    notes: "No unified pointer/gamepad/touch abstraction yet.",
  },
  {
    id: 32,
    name: "Gesture Runtime",
    status: "OPEN",
    canonicalPaths: [],
    notes: "No platform gesture runtime yet.",
  },
  {
    id: 33,
    name: "Haptic Hooks",
    status: "OPEN",
    canonicalPaths: [],
    notes: "Hooks not wired; Capacitor available for future.",
  },
  {
    id: 34,
    name: "Animation Budget Director",
    status: "PARTIAL",
    canonicalPaths: [
      "lib/cinematic/PerformanceBudgetGovernor.ts",
      "lib/adaptiveWorldRuntime/QualityAdaptationEngine.ts",
    ],
    notes: "Cinematic + AWR quality adaptation; unified animation budget director OPEN.",
  },
  {
    id: 35,
    name: "Search Runtime Repair",
    status: "PARTIAL",
    canonicalPaths: ["lib/seo/SearchConsoleAuthorityEngine.ts"],
    notes: "SEO authority exists; in-app search repair OPEN.",
  },
  {
    id: 36,
    name: "Preload-Next Media",
    status: "OPEN",
    canonicalPaths: [],
    notes: "No preload-next media director yet.",
  },
  {
    id: 37,
    name: "Media Eligibility Engine",
    status: "PARTIAL",
    canonicalPaths: [
      "lib/adaptiveWorldRuntime/IdleFallbackGovernor.ts",
      "lib/subscriptions/assertCreateRoomEntitlement.ts",
    ],
    notes: "Eligibility fragments exist; unified media eligibility engine OPEN.",
  },
  {
    id: 38,
    name: "Anti-Repetition Director",
    status: "PARTIAL",
    canonicalPaths: ["lib/content-rotation/ContentRotationAuthorityEngine.ts"],
    notes: "Content rotation authority; dedicated anti-repetition for discovery OPEN.",
  },
  {
    id: 39,
    name: "Fair Discovery Allocation",
    status: "PARTIAL",
    canonicalPaths: ["lib/content/ContentFreshness.ts"],
    notes: "Freshness sort exists; fair allocation quotas OPEN.",
  },
  {
    id: 40,
    name: "Replay/Incident Trace",
    status: "PARTIAL",
    canonicalPaths: [
      "lib/runtime/specification/media/ReplayEngine.ts",
      "lib/support/SupportDiagnosticsEngine.ts",
    ],
    notes: "Replay + diagnostics partial; unified incident trace OPEN.",
  },
  {
    id: 41,
    name: "Observatory Performance Command Center",
    status: "PARTIAL",
    canonicalPaths: [
      "lib/adaptiveWorldRuntime/RuntimeTelemetry.ts",
      "components/admin/OverseerFlightDeck.tsx",
      "lib/ops/SystemResilienceHQ.ts",
    ],
    notes: "Telemetry + flight deck exist; dedicated perf command center OPEN.",
  },
  {
    id: 42,
    name: "Automatic Health Scoring",
    status: "PARTIAL",
    canonicalPaths: [
      "lib/ops/SystemResilienceHQ.ts",
      "lib/video-quality/StreamHealthEngine.ts",
    ],
    notes: "System + stream health scores; auto-action loop OPEN.",
  },
  {
    id: 43,
    name: "Performance Regression Gates in CI",
    status: "OPEN",
    canonicalPaths: [],
    notes: "No CI perf regression gate wired yet.",
  },
  {
    id: 44,
    name: "Synthetic Lab Tests",
    status: "PARTIAL",
    canonicalPaths: ["lib/engines/runtime/ChaosRuntimeTester.ts"],
    notes: "Lab/chaos tester exists; synthetic lab suite not production users (Rule 20).",
  },
  {
    id: 45,
    name: "Soak Testing",
    status: "OPEN",
    canonicalPaths: [],
    notes: "No soak harness yet.",
  },
  {
    id: 46,
    name: "Chaos Testing",
    status: "PARTIAL",
    canonicalPaths: [
      "lib/engines/runtime/ChaosRuntimeTester.ts",
      "lib/showmanship/ChaosGridEngine.ts",
    ],
    notes: "Chaos engines exist; formal chaos certification suite OPEN.",
  },
  {
    id: 47,
    name: "Phone Reality Certification",
    status: "OPEN",
    canonicalPaths: ["lib/world/WorldScenePlan.ts"],
    notes: "PHYSICAL CERT OPEN — do not claim PASS (World Director gate).",
  },
  {
    id: 48,
    name: "Persistence Checkpoints",
    status: "PARTIAL",
    canonicalPaths: [
      "lib/live/liveDevicePersistence.ts",
      "lib/runtime/window/WindowPersistence.ts",
    ],
    notes: "Device + window persistence; room-state checkpoints OPEN.",
  },
  {
    id: 49,
    name: "Versioned Runtime Contracts",
    status: "PARTIAL",
    canonicalPaths: [
      "lib/adaptiveWorldRuntime/qualityContracts/LIVE_LOBBY_WALL.ts",
      "lib/venues/VenuePlatformContract.ts",
    ],
    notes: "Quality + venue contracts exist; full versioned game-runtime contract pack OPEN.",
  },
  {
    id: 50,
    name: "Feature Flags / Kill Switches",
    status: "WIRED",
    canonicalPaths: [
      "config/feature.flags.ts",
      "lib/flags/tmiFeatureFlags.ts",
      "components/operator/KillSwitchPanel.tsx",
    ],
    notes: "Flags + operator kill switch surfaces exist.",
  },
  {
    id: 51,
    name: "Progressive Rollout",
    status: "OPEN",
    canonicalPaths: [],
    notes: "No progressive rollout percentage runtime yet.",
  },
  {
    id: 52,
    name: "Canonical Entitlement Resolver",
    status: "WIRED",
    canonicalPaths: [
      "lib/subscriptions/SubscriptionEntitlementEngine.ts",
      "lib/auth/resolveAuthoritativeTier.ts",
      "lib/subscriptions/assertCreateRoomEntitlement.ts",
    ],
    notes: "resolveEntitlement + authoritative tier — server checks for valuable actions.",
  },
  {
    id: 53,
    name: "Server Authority for Valuable State",
    status: "PARTIAL",
    canonicalPaths: [
      "app/api/live/go/route.ts",
      "app/api/stripe/webhook/route.ts",
      "lib/commerce/OwnershipRuntime.ts",
    ],
    notes: "Payments/ownership/live mint server-side; not every game state yet.",
  },
  {
    id: 54,
    name: "Idempotency Everywhere Valuable",
    status: "PARTIAL",
    canonicalPaths: [
      "app/api/stripe/webhook/route.ts",
      "lib/tips/tipFulfillment.ts",
      "lib/payments/GatewayDispatcher.ts",
    ],
    notes: "Webhook/fulfillment paths; not universal.",
  },
  {
    id: 55,
    name: "Event Ledger",
    status: "PARTIAL",
    canonicalPaths: [
      "lib/runtime/RuntimeEventBus.ts",
      "lib/store/FlexStoreLedger.ts",
    ],
    notes: "Runtime event bus + store ledger; durable game event ledger OPEN.",
  },
  {
    id: 56,
    name: "Backpressure",
    status: "PARTIAL",
    canonicalPaths: [
      "lib/adaptiveWorldRuntime/WebRTCSubscriptionGovernor.ts",
      "lib/adaptiveWorldRuntime/IdleFallbackGovernor.ts",
    ],
    notes: "Subscribe/idle demotion acts as soft backpressure; formal queues OPEN.",
  },
  {
    id: 57,
    name: "Priority Classes",
    status: "WIRED",
    canonicalPaths: ["lib/runtime/GameRuntimeConstitution.ts"],
    notes: "P0–P5 locked in constitution; consumers adopt gradually.",
  },
  {
    id: 58,
    name: "Fast First Frame",
    status: "PARTIAL",
    canonicalPaths: [
      "lib/dock/presentInstantGoLiveInPlace.ts",
      "lib/adaptiveWorldRuntime/IdleFallbackGovernor.ts",
    ],
    notes: "T+0 camera + idle fallback; P50/P95 budgets locked — not yet CI-gated.",
  },
  {
    id: 59,
    name: "Placeholder Law",
    status: "PARTIAL",
    canonicalPaths: [
      "lib/world/WorldScenePlan.ts",
      "lib/ai-visuals/VisualRecoveryCoordinator.ts",
    ],
    notes: "Honest OPEN/empty states on World Director; universal placeholder law enforcement OPEN.",
  },
  {
    id: 60,
    name: "Recovery-First UX",
    status: "PARTIAL",
    canonicalPaths: [
      "lib/runtime/RuntimeRecoveryEngine.ts",
      "components/routing/ReconnectButton.tsx",
      "components/mobile/OfflineStateBanner.tsx",
    ],
    notes: "Reconnect + recovery surfaces exist; recovery-first default across all rooms OPEN.",
  },
] as const;

export function getGameRuntimeSystem(id: GameRuntimeSystemId): GameRuntimeSystemEntry {
  const entry = GAME_RUNTIME_SYSTEM_REGISTRY.find((s) => s.id === id);
  if (!entry) {
    throw new Error(`GameRuntimeConstitution: unknown system id ${id}`);
  }
  return entry;
}

export function summarizeGameRuntimeStatuses(): Record<GameRuntimeSystemStatus, number> {
  const out: Record<GameRuntimeSystemStatus, number> = {
    WIRED: 0,
    PARTIAL: 0,
    OPEN: 0,
    DEFERRED: 0,
  };
  for (const s of GAME_RUNTIME_SYSTEM_REGISTRY) {
    out[s.status] += 1;
  }
  return out;
}

/** Honest gaps that keep 100%×10 incomplete — never claim closed without physical proof. */
export const GAME_RUNTIME_HUNDRED_X10_GAPS = [
  "Phone / dual-device physical certification OPEN (World Director gate)",
  "Production GLB + navmesh / collision OPEN",
  "Physical LOD downgrade pipeline OPEN (metadata only today)",
  "Progressive stadium fill OPEN — GO LIVE stays empty-first / real-only",
  "CI performance regression gates OPEN",
  "Predictive room streaming + hot/cold asset cache OPEN",
  "Input abstraction / gesture / haptic OPEN",
  "Progressive rollout percentages OPEN",
  "No literal zero-lag or guaranteed-60-FPS claim — budgets are SLOs only",
] as const;

export const GAME_RUNTIME_CONSTITUTION_VERSION = "1.0.0-2026-08-23" as const;
