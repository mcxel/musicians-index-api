/**
 * OrphanAuditLedger — runtime audit ledger for rebuild surfaces (NOT a markdown doc).
 * Records audit results from Command Center / Venue Tools / Go Live rebuild pass.
 */

import {
  registerCommandHealth,
  registerFunctionHealth,
  exportFunctionHealthSnapshot,
} from "./FunctionHealthRegistry";
import { auditOrphanFunctions, type OrphanAuditResult, type OrphanFinding } from "./OrphanDetection";
import { SHELL_BUTTON_COMMANDS } from "./ButtonCommandRegistry";

export const REBUILD_AUDIT_LAST_RUN = "2026-08-28";

export interface RebuildSurfaceAuditEntry {
  id: string;
  surface: string;
  functionId: string;
  commandId?: string;
  classification:
    | "ACTIVE+CANONICAL"
    | "HARVEST+REHOME"
    | "DUPLICATE"
    | "ORPHAN"
    | "DEAD"
    | "TEST-ONLY"
    | "DEV-ONLY"
    | "SYSTEM-ONLY"
    | "UNKNOWN"
    | "OFF"
    | "WIRED"
    | "IMPLEMENTED_NOT_INTEGRATED";
  powerState: "ON" | "OFF" | "DEGRADED" | "IMPLEMENTED_NOT_INTEGRATED";
  action: "wired" | "marked-off" | "rehomed" | "removed" | "remaining-unknown";
  note: string;
  sourceFile: string;
}

let lastAuditResult: OrphanAuditResult | null = null;
let rebuildEntries: RebuildSurfaceAuditEntry[] = [];

function seedRebuildFunctionHealth(): void {
  const seeds: Parameters<typeof registerFunctionHealth>[0][] = [
    {
      functionId: "executeInstantGoLive",
      commandId: "shell.go-live",
      owner: "LiveDestinationRouter",
      sourceFile: "lib/dock/executeInstantGoLive.ts",
      callerCount: 2,
      callerTypes: ["button", "system-trigger"],
      surfaceIds: ["session-control-strip", "command-center-shell"],
      systemTriggerIds: ["presentInstantGoLiveInPlace", "triggerCanonicalGoLive"],
      dependencies: ["LiveDestinationRouter", "DiscoveryPublisher", "launchDockStore"],
      expectedOutcome: "Mint room, optional publish to discovery, defer media to InstantGoLiveStage",
      powerState: "ON",
      detailState: "ACTIVE+CANONICAL",
    },
    {
      functionId: "presentInstantGoLiveInPlace",
      commandId: "shell.go-live",
      owner: "CommandCenterShell",
      sourceFile: "lib/dock/presentInstantGoLiveInPlace.ts",
      callerCount: 3,
      callerTypes: ["button", "event-handler"],
      surfaceIds: ["session-control-strip", "command-center-shell", "performer-quick-strip"],
      systemTriggerIds: ["PENDING_GO_LIVE_KEY"],
      dependencies: ["executeInstantGoLive", "goLiveAdmitGate", "MediaTransitionDirector"],
      expectedOutcome: "Hub in-place GO LIVE without /live/rooms navigation",
      powerState: "ON",
      detailState: "ACTIVE+CANONICAL",
    },
    {
      functionId: "endInstantGoLiveSession",
      owner: "CommandCenterSessionControlStrip",
      sourceFile: "lib/dock/executeInstantGoLive.ts",
      callerCount: 1,
      callerTypes: ["button"],
      surfaceIds: ["session-control-strip"],
      systemTriggerIds: [],
      dependencies: ["DiscoveryPublisher", "unpublishLiveRoom"],
      expectedOutcome: "End live session and unpublish from discovery",
      powerState: "ON",
      detailState: "ACTIVE+CANONICAL",
    },
    {
      functionId: "toggleVenueToolsPanel",
      commandId: "shell.venue-tools",
      owner: "VenueToolsToggleButton",
      sourceFile: "components/hud/VenueToolsToggleButton.tsx",
      callerCount: 3,
      callerTypes: ["button", "panel-opener"],
      surfaceIds: ["session-control-strip", "mobile-quick-panel", "venue-tools-hint"],
      systemTriggerIds: [],
      dependencies: ["compactQuickPanelStore", "VenueToolsRegistry"],
      expectedOutcome: "Open/close VenueControlPanel without navigation",
      powerState: "ON",
      detailState: "ACTIVE+CANONICAL",
    },
    {
      functionId: "runQuickToolAction",
      owner: "MobileQuickPanelBar",
      sourceFile: "lib/commandCenter/quickToolsActions.ts",
      callerCount: 1,
      callerTypes: ["button"],
      surfaceIds: ["mobile-quick-panel"],
      systemTriggerIds: [],
      dependencies: ["compactQuickPanelStore", "openCanonicalWorkspaceQuick"],
      expectedOutcome: "Dispatch mobile quick-panel actions to real workspace/panel targets",
      powerState: "ON",
      detailState: "ACTIVE+CANONICAL",
    },
    {
      functionId: "dispatchVenueToolsCommand",
      owner: "VenueControlPanel",
      sourceFile: "lib/venue/VenueToolsDirector.ts",
      callerCount: 1,
      callerTypes: ["button"],
      surfaceIds: ["venue-tools-panel"],
      systemTriggerIds: [],
      dependencies: ["StageDirectorEngine", "LightingMoodRuntime", "VenueCurtainDirector"],
      expectedOutcome: "Apply venue lighting/mood/stage/curtain command to live room",
      powerState: "ON",
      detailState: "ACTIVE+CANONICAL",
    },
    {
      functionId: "openCanonicalWorkspaceQuick.messaging",
      commandId: "shell.messages",
      owner: "CommandCenterTopNav",
      sourceFile: "lib/workspace/universal/openCanonicalPresentation.ts",
      callerCount: 2,
      callerTypes: ["button", "workspace-opener"],
      surfaceIds: ["command-center-top-nav", "mobile-quick-panel"],
      systemTriggerIds: [],
      dependencies: ["UniversalWorkspaceHost"],
      expectedOutcome: "Open messaging workspace drawer",
      powerState: "ON",
      detailState: "ACTIVE+CANONICAL",
    },
    {
      functionId: "openCanonicalWorkspaceQuick.notifications",
      commandId: "shell.notifications",
      owner: "AccountCommandMenu",
      sourceFile: "lib/workspace/universal/openCanonicalPresentation.ts",
      callerCount: 1,
      callerTypes: ["button", "workspace-opener"],
      surfaceIds: ["account-command-menu"],
      systemTriggerIds: [],
      dependencies: ["NotificationEngine"],
      expectedOutcome: "Open notifications workspace drawer",
      powerState: "ON",
      detailState: "ACTIVE+CANONICAL",
    },
    {
      functionId: "compactQuickPanel.lobbies",
      commandId: "shell.lobbies",
      owner: "CompactQuickPanelHost",
      sourceFile: "components/hud/CompactQuickPanelHost.tsx",
      callerCount: 2,
      callerTypes: ["button", "panel-opener"],
      surfaceIds: ["mobile-quick-panel", "session-control-strip"],
      systemTriggerIds: [],
      dependencies: ["compactQuickPanelStore"],
      expectedOutcome: "Toggle LOBBIES/DISCOVERY panel with live lobby wall",
      powerState: "ON",
      detailState: "ACTIVE+CANONICAL",
    },
    {
      functionId: "buildHomepageStarburst",
      owner: "HomePage01",
      sourceFile: "lib/homepage/tmiHomepageStarburstTransitionEngine.ts",
      callerCount: 0,
      callerTypes: [],
      surfaceIds: ["homepage-artifact"],
      systemTriggerIds: ["homepage-transition"],
      dependencies: ["MediaTransitionDirector"],
      expectedOutcome: "Render homepage starburst ray geometry (visual transition only)",
      powerState: "ON",
      detailState: "SYSTEM-ONLY",
    },
    {
      functionId: "venueToolsModule.MEDIA",
      owner: "VenueToolsRegistry",
      sourceFile: "lib/venue/VenueToolsRegistry.ts",
      callerCount: 0,
      callerTypes: [],
      surfaceIds: [],
      systemTriggerIds: [],
      dependencies: ["BroadcastDirectorEngine"],
      expectedOutcome: "Venue media module — backend exists, no production UI path yet",
      powerState: "IMPLEMENTED_NOT_INTEGRATED",
      detailState: "DEV-ONLY",
    },
    {
      functionId: "legacySeatArrivalTransition",
      owner: "UniversalLobbyEntry",
      sourceFile: "components/live/SeatArrivalTransition.tsx",
      callerCount: 0,
      callerTypes: [],
      surfaceIds: [],
      systemTriggerIds: [],
      dependencies: ["MediaTransitionDirector"],
      expectedOutcome: "LEGACY B audience fixed overlay — unmounted; hub uses GoLiveMediaTransition Monitor B",
      powerState: "OFF",
      detailState: "DEAD",
    },
    {
      functionId: "legacyRoomWarpTransition",
      owner: "live-rooms",
      sourceFile: "components/live/RoomWarpTransition.tsx",
      callerCount: 0,
      callerTypes: [],
      surfaceIds: [],
      systemTriggerIds: [],
      dependencies: ["MediaTransitionDirector"],
      expectedOutcome: "LEGACY B room warp — zero production importers",
      powerState: "OFF",
      detailState: "DEAD",
    },
    {
      functionId: "legacyVenueControlQuickPanel",
      owner: "VenueToolsShellHint",
      sourceFile: "components/hud/panels/VenueControlQuickPanel.tsx",
      callerCount: 0,
      callerTypes: [],
      surfaceIds: [],
      systemTriggerIds: [],
      dependencies: ["VenueControlPanel"],
      expectedOutcome: "Legacy re-export alias — retired from production mount path",
      powerState: "OFF",
      detailState: "HARVEST+REHOME",
    },
  ];

  for (const seed of seeds) {
    registerFunctionHealth(seed);
  }

  for (const cmd of SHELL_BUTTON_COMMANDS) {
    registerCommandHealth(cmd.commandId, {
      owner: cmd.sourceFile,
      sourceFile: cmd.sourceFile,
      callerCount: 1,
      callerTypes: ["button"],
      surfaceIds: [cmd.surface],
      systemTriggerIds: [],
      dependencies: cmd.dependencies ?? cmd.healthDependencies ?? [],
      expectedOutcome: cmd.expectedOutcome,
      powerState: "ON",
      detailState: "ACTIVE+CANONICAL",
    });
  }
}

function seedRebuildAuditEntries(): RebuildSurfaceAuditEntry[] {
  return [
    {
      id: "ccs-go-live",
      surface: "CommandCenterSessionControlStrip",
      functionId: "presentInstantGoLiveInPlace",
      commandId: "shell.go-live",
      classification: "WIRED",
      powerState: "ON",
      action: "wired",
      note: "GO LIVE wired to presentInstantGoLiveInPlace; END LIVE calls endInstantGoLiveSession",
      sourceFile: "CommandCenterSessionControlStrip.tsx",
    },
    {
      id: "ccs-mic-cam",
      surface: "CommandCenterSessionControlStrip",
      functionId: "toggleHubMicPreview",
      commandId: "shell.mic",
      classification: "WIRED",
      powerState: "ON",
      action: "wired",
      note: "MIC/CAM toggles wired to livePrivacyState",
      sourceFile: "CommandCenterSessionControlStrip.tsx",
    },
    {
      id: "mobile-lobbies",
      surface: "MobileQuickPanelBar",
      functionId: "compactQuickPanel.lobbies",
      commandId: "shell.lobbies",
      classification: "WIRED",
      powerState: "ON",
      action: "wired",
      note: "LOBBIES/DISCOVERY toggles compact-quick-panel:lobbies",
      sourceFile: "MobileQuickPanelBar.tsx",
    },
    {
      id: "mobile-messages",
      surface: "MobileQuickPanelBar",
      functionId: "openCanonicalWorkspaceQuick.messaging",
      commandId: "shell.messages-quick",
      classification: "WIRED",
      powerState: "ON",
      action: "rehomed",
      note: "Messages rehomed to canonical workspace:messaging drawer",
      sourceFile: "MobileQuickPanelBar.tsx",
    },
    {
      id: "venue-tools-toggle",
      surface: "VenueToolsToggleButton",
      functionId: "toggleVenueToolsPanel",
      commandId: "shell.venue-tools",
      classification: "WIRED",
      powerState: "ON",
      action: "wired",
      note: "VENUE TOOLS toggle opens VenueControlPanel via compactQuickPanelStore",
      sourceFile: "VenueToolsToggleButton.tsx",
    },
    {
      id: "venue-control-panel",
      surface: "VenueControlPanel",
      functionId: "dispatchVenueToolsCommand",
      classification: "WIRED",
      powerState: "ON",
      action: "wired",
      note: "Venue module buttons dispatch via VenueToolsDirector",
      sourceFile: "VenueControlPanel.tsx",
    },
    {
      id: "venue-media-module",
      surface: "VenueToolsRegistry",
      functionId: "venueToolsModule.MEDIA",
      classification: "IMPLEMENTED_NOT_INTEGRATED",
      powerState: "IMPLEMENTED_NOT_INTEGRATED",
      action: "marked-off",
      note: "MEDIA module enabled:false — honest OFF, not fake button",
      sourceFile: "VenueToolsRegistry.ts",
    },
    {
      id: "legacy-venue-quick-panel",
      surface: "VenueControlQuickPanel",
      functionId: "legacyVenueControlQuickPanel",
      classification: "OFF",
      powerState: "OFF",
      action: "removed",
      note: "Legacy alias retired; canonical path is VenueToolsPanel → VenueControlPanel",
      sourceFile: "VenueControlQuickPanel.tsx",
    },
    {
      id: "starburst-homepage",
      surface: "HomePage01",
      functionId: "buildHomepageStarburst",
      classification: "SYSTEM-ONLY",
      powerState: "ON",
      action: "wired",
      note: "Starburst is homepage visual engine, not a shell button — canonical replacement for legacy starburst controls",
      sourceFile: "tmiHomepageStarburstTransitionEngine.ts",
    },
    {
      id: "audience-starburst-strangler",
      surface: "UniversalLobbyEntry",
      functionId: "legacySeatArrivalTransition",
      classification: "OFF",
      powerState: "OFF",
      action: "removed",
      note: "SeatArrivalTransition unmounted; LEGACY B prod mounts=0; GLOBAL OVERLAY=0; hub GO LIVE remains Monitor-B GoLiveMediaTransition",
      sourceFile: "UniversalLobbyEntry.tsx",
    },
    {
      id: "gps-discovery",
      surface: "CommandCenterShell",
      functionId: "openCanonicalWorkspaceQuick",
      commandId: "shell.discovery",
      classification: "WIRED",
      powerState: "ON",
      action: "wired",
      note: "GPS panel LIVE LOBBY WALL opens workspace:live-destinations",
      sourceFile: "CommandCenterShell.tsx",
    },
  ];
}

/** Bootstrap rebuild surface audit — call once at module init or admin mount. */
export function runRebuildSurfaceAudit(): OrphanAuditResult {
  seedRebuildFunctionHealth();
  rebuildEntries = seedRebuildAuditEntries();
  lastAuditResult = auditOrphanFunctions(SHELL_BUTTON_COMMANDS);
  return lastAuditResult;
}

export function getLastOrphanAuditResult(): OrphanAuditResult | null {
  return lastAuditResult;
}

export function getRebuildAuditEntries(): RebuildSurfaceAuditEntry[] {
  if (rebuildEntries.length === 0) {
    runRebuildSurfaceAudit();
  }
  return rebuildEntries;
}

export function getOrphanAuditSnapshot(): {
  lastRun: string;
  audit: OrphanAuditResult | null;
  rebuildEntries: RebuildSurfaceAuditEntry[];
  functionHealth: ReturnType<typeof exportFunctionHealthSnapshot>;
} {
  if (!lastAuditResult) runRebuildSurfaceAudit();
  return {
    lastRun: REBUILD_AUDIT_LAST_RUN,
    audit: lastAuditResult,
    rebuildEntries: getRebuildAuditEntries(),
    functionHealth: exportFunctionHealthSnapshot(),
  };
}

export function getOrphanFindingsBySurface(surface: string): OrphanFinding[] {
  const audit = lastAuditResult ?? runRebuildSurfaceAudit();
  return audit.findings.filter((f) => f.surfaceId === surface || f.targetId.includes(surface));
}

export function getZeroTargetCounts(): {
  buttonsWithoutCommand: number;
  commandsWithoutCaller: number;
} {
  const audit = lastAuditResult ?? runRebuildSurfaceAudit();
  return {
    buttonsWithoutCommand: audit.counts.buttonsWithoutCommand,
    commandsWithoutCaller: audit.counts.commandsWithoutCaller,
  };
}

runRebuildSurfaceAudit();
