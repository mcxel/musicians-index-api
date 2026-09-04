/**
 * VenueToolsLegacyLedger — traced legacy venue-control family (Strangler pass 1).
 * TRACE → HARVEST → IMPLEMENT CANONICAL → REDIRECT → VERIFY → UNMOUNT → DELETE DEAD
 */

export type LegacyHarvestClass =
  | "HARVEST ENGINE"
  | "HARVEST COMMAND"
  | "HARVEST ASSET"
  | "HARVEST CONFIG"
  | "HARVEST UX IDEA"
  | "DUPLICATE"
  | "OBSOLETE"
  | "DEAD"
  | "UNKNOWN";

export interface VenueToolsLegacyEntry {
  legacyId: string;
  file: string;
  componentOrFunction: string;
  routeOrSurface: string;
  mountedBy: string;
  visibleLabel: string;
  handler: string;
  commandOrApi: string;
  stateSource: string;
  runtimeDependency: string;
  assetDependency: string;
  productionReachable: "YES" | "NO";
  classification: LegacyHarvestClass;
  notes?: string;
}

export const VENUE_TOOLS_LEGACY_LEDGER: VenueToolsLegacyEntry[] = [
  {
    legacyId: "LEG-VENUE-001",
    file: "components/hud/panels/VenueControlPanel.tsx",
    componentOrFunction: "VenueControlPanel",
    routeOrSurface: "VENUE TOOLS quick panel inner",
    mountedBy: "VenueToolsQuickPanel → CompactQuickPanelHost (activePanel=venue)",
    visibleLabel: "STAGE LIGHTING / MOOD PRESETS / FX / CAMERA",
    handler: "handleStagePreset / handleMoodPreset / triggerEffect",
    commandOrApi: "StageDirectorEngine + LightingMoodRuntime (direct — migrating to VenueToolsDirector)",
    stateSource: "StageDirectorEngine module state; LightingMoodRuntime Map",
    runtimeDependency: "StageDirectorEngine, LightingMoodRuntime, VenueStateEngine",
    assetDependency: "STAGE_LIGHTING_PRESETS, FanLobbySkinRegistry",
    productionReachable: "YES",
    classification: "HARVEST UX IDEA",
    notes: "Inner surface — canonical content rehomed under VenueToolsDirector",
  },
  {
    legacyId: "LEG-VENUE-002",
    file: "components/live/GoLiveRuntime.tsx",
    componentOrFunction: "CanisterDock / LightingContent / DirectorContent",
    routeOrSurface: "Go Live runtime CONTROL BOOTH dock",
    mountedBy: "GoLiveRuntime bottom CanisterDock",
    visibleLabel: "Lighting · Director",
    handler: "directorSetLighting / local layout state",
    commandOrApi: "StageDirectorEngine.setLightingPreset (direct)",
    stateSource: "GoLiveRuntime local useState",
    runtimeDependency: "StageDirectorEngine, CanisterShell",
    assetDependency: "STAGE_LIGHTING_PRESETS",
    productionReachable: "NO",
    classification: "DUPLICATE",
    notes: "Retired — VENUE TOOLS toggle in control booth",
  },
  {
    legacyId: "LEG-VENUE-003",
    file: "components/live/UniversalVenueRenderer.tsx",
    componentOrFunction: "inline STAGE CURTAIN button row",
    routeOrSurface: "/live/* performer mode",
    mountedBy: "UniversalVenueRenderer performer block",
    visibleLabel: "PREPARE STAGE · START COUNTDOWN · OPEN CURTAIN · CLOSE & END",
    handler: "resetStage / startCountdown / openCurtain / closeCurtainAndEnd",
    commandOrApi: "StageLifecycleEngine",
    stateSource: "StageLifecycleEngine snapshot",
    runtimeDependency: "StageLifecycleEngine",
    assetDependency: "none",
    productionReachable: "NO",
    classification: "DUPLICATE",
    notes: "Unmounted — VenueToolsShellHint + curtain tab in Venue Tools",
  },
  {
    legacyId: "LEG-VENUE-004",
    file: "components/live/ArenaImmersivePanel.tsx",
    componentOrFunction: "Curtain Control Panel block",
    routeOrSurface: "Arena immersive performer mode",
    mountedBy: "ArenaImmersivePanel",
    visibleLabel: "STAGE CURTAIN controls",
    handler: "StageLifecycleEngine curtain fns",
    commandOrApi: "StageLifecycleEngine",
    stateSource: "StageLifecycleEngine",
    runtimeDependency: "StageLifecycleEngine",
    assetDependency: "none",
    productionReachable: "YES",
    classification: "DUPLICATE",
    notes: "Unmounted — redirect to VENUE TOOLS",
  },
  {
    legacyId: "LEG-VENUE-005",
    file: "components/live/VenueImmersiveRoom.tsx",
    componentOrFunction: "STAGE CONTROLS row",
    routeOrSurface: "Venue immersive room performer mode",
    mountedBy: "VenueImmersiveRoom",
    visibleLabel: "PREPARE STAGE · OPEN CURTAIN · CLOSE CURTAIN",
    handler: "startCountdown / openCurtain / closeCurtainAndEnd",
    commandOrApi: "StageLifecycleEngine",
    stateSource: "StageLifecycleEngine",
    runtimeDependency: "StageLifecycleEngine",
    assetDependency: "none",
    productionReachable: "YES",
    classification: "DUPLICATE",
    notes: "Unmounted",
  },
  {
    legacyId: "LEG-VENUE-006",
    file: "components/live/GoLiveStudio.tsx",
    componentOrFunction: "inline curtain buttons + PerformerCurtainControlPanel",
    routeOrSurface: "Go Live studio when isLive",
    mountedBy: "GoLiveStudio",
    visibleLabel: "PREPARE STAGE · OPEN CURTAIN · Intermission presets",
    handler: "StageLifecycleEngine + CurtainRuntimeManager",
    commandOrApi: "executeCurtainTransition / requestIntermission",
    stateSource: "CurtainRuntimeManager + StageLifecycleEngine",
    runtimeDependency: "CurtainRuntimeManager, PresentationDirectorRegistry",
    assetDependency: "getAdSlotForZone curtain-ad-rail",
    productionReachable: "YES",
    classification: "HARVEST ENGINE",
    notes: "PerformerCurtainControlPanel harvested into VenueCurtainDirector",
  },
  {
    legacyId: "LEG-VENUE-007",
    file: "components/performer/PerformerCurtainControlPanel.tsx",
    componentOrFunction: "PerformerCurtainControlPanel",
    routeOrSurface: "Go Live studio / drawer (legacy mount)",
    mountedBy: "GoLiveStudio (was)",
    visibleLabel: "Intermission presets · Extend · Resume",
    handler: "executeCurtainTransition / triggerIntermission",
    commandOrApi: "CurtainRuntimeManager + StageLifecycleEngine",
    stateSource: "CurtainRuntimeManager timers",
    runtimeDependency: "CurtainRuntimeManager, PresentationDirectorRegistry",
    assetDependency: "SponsorRegistry ad rail",
    productionReachable: "NO",
    classification: "HARVEST ENGINE",
    notes: "Logic in VenueCurtainDirector; UI in Venue Tools curtain module",
  },
  {
    legacyId: "LEG-VENUE-008",
    file: "lib/live/StageDirectorEngine.ts",
    componentOrFunction: "StageDirectorEngine",
    routeOrSurface: "platform-wide CSS bridge",
    mountedBy: "VenueToolsDirector, GoLiveRuntime (was), VenueControlPanel",
    visibleLabel: "lighting presets · effects · camera · banner",
    handler: "setLightingPreset / triggerEffect / setCameraAngle",
    commandOrApi: "module emitter + CSS custom properties",
    stateSource: "module-level _state",
    runtimeDependency: "document.documentElement CSS vars",
    assetDependency: "STAGE_LIGHTING_PRESETS",
    productionReachable: "YES",
    classification: "HARVEST ENGINE",
  },
  {
    legacyId: "LEG-VENUE-009",
    file: "lib/venue/LightingMoodRuntime.ts",
    componentOrFunction: "LightingMoodRuntime",
    routeOrSurface: "venue lighting zones",
    mountedBy: "VenueToolsDirector",
    visibleLabel: "MOOD presets · dimmer · auto phase sync",
    handler: "setPreset / setDimmingLevel / syncLightingFromVenue",
    commandOrApi: "VENUE_MOOD_SET / VENUE_DIMMER_SET",
    stateSource: "lightingStates Map per venueId",
    runtimeDependency: "VenueStateEngine, StageEnergyEngine",
    assetDependency: "PRESET_COLORS, PHASE_PRESET_MAP",
    productionReachable: "YES",
    classification: "HARVEST ENGINE",
  },
  {
    legacyId: "LEG-VENUE-010",
    file: "lib/presentation/CurtainRuntimeManager.ts",
    componentOrFunction: "CurtainRuntimeManager",
    routeOrSurface: "curtain + ad rail + presentation directors",
    mountedBy: "VenueCurtainDirector, PerformanceRailControls",
    visibleLabel: "TAKE_BREAK · RESUME_SHOW · intermission types",
    handler: "executeCurtainTransition",
    commandOrApi: "PresentationCommand bus via DirectorRegistry",
    stateSource: "canonicalTimersStore, CurtainRuntimeContext",
    runtimeDependency: "DirectorRegistry, SponsorRegistry",
    assetDependency: "curtain-ad-rail zone",
    productionReachable: "YES",
    classification: "HARVEST ENGINE",
  },
  {
    legacyId: "LEG-VENUE-011",
    file: "lib/live/StageLifecycleEngine.ts",
    componentOrFunction: "StageLifecycleEngine",
    routeOrSurface: "stage curtain state machine",
    mountedBy: "VenueCurtainDirector, PerformanceRailControls, StageCurtain",
    visibleLabel: "INTERMISSION · RESUME · curtain phases",
    handler: "requestIntermission / openCurtain / resumeFromIntermission",
    commandOrApi: "stage snapshot state machine",
    stateSource: "StageSnapshot module state",
    runtimeDependency: "livePrivacyState (mic mute on intermission)",
    assetDependency: "none",
    productionReachable: "YES",
    classification: "HARVEST ENGINE",
  },
  {
    legacyId: "LEG-VENUE-012",
    file: "components/commandCenter/docks/WorkspaceControlDock.tsx",
    componentOrFunction: "WorkspaceControlDock",
    routeOrSurface: "legacy workspace control drawer",
    mountedBy: "UNMOUNTED (prior shell slice)",
    visibleLabel: "role control drawer grid",
    handler: "controls[].onClick props",
    commandOrApi: "caller-supplied",
    stateSource: "parent workspace dock state",
    runtimeDependency: "openCanonicalWorkspaceQuick",
    assetDependency: "none",
    productionReachable: "NO",
    classification: "OBSOLETE",
    notes: "WorkspaceControlDock rail already unmounted per prior shell work",
  },
  {
    legacyId: "LEG-VENUE-013",
    file: "components/venue-hud/VenueControlConsole.tsx",
    componentOrFunction: "VenueControlConsole",
    routeOrSurface: "pre-live go-live glass panel (TMIInteractiveVenueHud)",
    mountedBy: "TMIInteractiveVenueHud when hudState === PRE_LIVE",
    visibleLabel: "GO LIVE · experience mode · mic/camera · quality",
    handler: "onGoLive / onExperienceModeChange / onToggleMic / onToggleCamera",
    commandOrApi: "parent callbacks + HudCommandBus (mic/camera)",
    stateSource: "parent props (local pre-live console state)",
    runtimeDependency: "Go Live bootstrap — NOT VenueToolsDirector",
    assetDependency: "none",
    productionReachable: "YES",
    classification: "HARVEST UX IDEA",
    notes:
      "KEEP — pre-live broadcast setup only (mode/mic/cam/quality/GO LIVE). No lighting/curtain/mood mutation. Not a competing VENUE TOOLS surface. Classified 2026-08-28: ACTIVE for go-live bootstrap; redirect venue mutation to VENUE TOOLS.",
  },
  {
    legacyId: "LEG-VENUE-014",
    file: "lib/venue/tmiVenueLightingEngine.ts",
    componentOrFunction: "getVenueLightingRuntime",
    routeOrSurface: "3D venue rig data",
    mountedBy: "tmiVenueRuntimeEngine (engine layer)",
    visibleLabel: "showtime / warmup / ambient rigs",
    handler: "getVenueLightingRuntime",
    commandOrApi: "venueId → rig array",
    stateSource: "static seed per venueId",
    runtimeDependency: "tmiVenueRuntimeEngine",
    assetDependency: "light rig IDs",
    productionReachable: "YES",
    classification: "HARVEST CONFIG",
  },
  {
    legacyId: "LEG-VENUE-015",
    file: "lib/venue/VenueEnvironmentRegistry.ts",
    componentOrFunction: "VenueEnvironmentRegistry",
    routeOrSurface: "environment package profiles",
    mountedBy: "VenueToolsDirector (environment module)",
    visibleLabel: "lightingPreset per venue class",
    handler: "getVenueEnvironment / list profiles",
    commandOrApi: "VENUE_ENVIRONMENT_SET",
    stateSource: "REGISTRY Record",
    runtimeDependency: "environment package capabilities",
    assetDependency: "skinId, props, adZones",
    productionReachable: "YES",
    classification: "HARVEST CONFIG",
  },
  {
    legacyId: "LEG-VENUE-016",
    file: "components/live/CurtainCanister.tsx",
    componentOrFunction: "CurtainCanister",
    routeOrSurface: "/live/rooms/[id] ControlCanisterCluster curtain slot",
    mountedBy: "UNMOUNTED — was ControlCanisterCluster type=curtain",
    visibleLabel: "STAGE CURTAIN DROP/RISE + style picker",
    handler: "local handleCurtainAction (drop/rise) + CURTAIN_STYLES picker",
    commandOrApi: "local useState only — never called StageLifecycleEngine / VenueToolsDirector",
    stateSource: "local useState (isolated, non-authoritative)",
    runtimeDependency: "none (orphan local UI)",
    assetDependency: "CURTAIN_STYLES config (theater/fog/smoke/lights/digital)",
    productionReachable: "NO",
    classification: "DUPLICATE",
    notes:
      "Unmounted 2026-08-28 — DROP/RISE duplicated curtain mutation authority. Slot now VenueToolsShellHint → VENUE TOOLS. Style picker (CURTAIN_STYLES) is harvest candidate for DECOR/CURTAIN later; file retained, not deleted.",
  },
  {
    legacyId: "LEG-VENUE-017",
    file: "components/commandCenter/PerformanceRailControls.tsx",
    componentOrFunction: "PerformanceRailControls",
    routeOrSurface: "CommandCenterMediaStack utility row",
    mountedBy: "CommandCenterMediaStack (performer)",
    visibleLabel: "INTERMISSION · RESUME",
    handler: "requestIntermission / resumeFromIntermission",
    commandOrApi: "StageLifecycleEngine + CurtainRuntimeManager ad opportunity",
    stateSource: "StageLifecycleEngine",
    runtimeDependency: "StageLifecycleEngine, livePrivacyState",
    assetDependency: "curtain-ad-rail",
    productionReachable: "YES",
    classification: "HARVEST COMMAND",
    notes:
      "INTERMISSION/RESUME only. VenueToolsToggleButton removed 2026-08-28 — VENUE TOOLS lives on CommandCenterMediaStack (one per surface).",
  },
  {
    legacyId: "LEG-VENUE-018",
    file: "components/environment/VenueLighting.tsx",
    componentOrFunction: "VenueLighting",
    routeOrSurface: "environment visual layer",
    mountedBy: "RoomEnvironmentLayer / venue shells",
    visibleLabel: "render-only lighting pass",
    handler: "consumes lighting state",
    commandOrApi: "read-only render",
    stateSource: "LightingMoodRuntime subscription",
    runtimeDependency: "LightingMoodRuntime",
    assetDependency: "none",
    productionReachable: "YES",
    classification: "HARVEST ENGINE",
  },
];

export function getLegacyVenueEntries(filter?: {
  productionReachable?: "YES" | "NO";
  classification?: LegacyHarvestClass;
}): VenueToolsLegacyEntry[] {
  return VENUE_TOOLS_LEGACY_LEDGER.filter((e) => {
    if (filter?.productionReachable && e.productionReachable !== filter.productionReachable) return false;
    if (filter?.classification && e.classification !== filter.classification) return false;
    return true;
  });
}

export function getLegacyEntryById(legacyId: string): VenueToolsLegacyEntry | undefined {
  return VENUE_TOOLS_LEGACY_LEDGER.find((e) => e.legacyId === legacyId);
}

export const LEGACY_VENUE_LEDGER_COUNT = VENUE_TOOLS_LEGACY_LEDGER.length;
