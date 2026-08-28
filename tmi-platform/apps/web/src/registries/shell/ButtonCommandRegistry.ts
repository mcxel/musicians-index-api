/**
 * ButtonCommandRegistry — observable shell button catalog (Rule 20 / NO ORPHAN FUNCTIONALITY).
 * Every canonical shell control: buttonId → commandId → handler → expectedOutcome.
 * Bidirectional trace: traceButtonToOutcome / traceCommandToCallers.
 */

import type { CommandCenterRole } from "@/components/commandCenter/commandCenterRegistry";

export type ShellSurface =
  | "command-center-top-nav"
  | "session-control-strip"
  | "mobile-quick-panel"
  | "persistent-media-dock"
  | "account-command-menu"
  | "gps-panel"
  | "performance-rail"
  | "role-hub-header"
  | "venue-tools-panel"
  | "compact-quick-panel";

export type ShellCommandRole =
  | "fan"
  | "performer"
  | "venue"
  | "sponsor"
  | "advertiser"
  | "promoter"
  | "admin"
  | "all";

export interface ButtonCommandDefinition {
  buttonId: string;
  commandId: string;
  label: string;
  role: ShellCommandRole;
  surface: ShellSurface;
  /** Drawer module id, workspace id, or route path */
  panelOrRoute: string;
  expectedOutcome: string;
  dependencies?: string[];
  /** @deprecated use dependencies */
  healthDependencies?: string[];
  sourceFile: string;
}

export interface ButtonOutcomeTrace {
  buttonId: string;
  commandId: string;
  label: string;
  surface: ShellSurface;
  role: ShellCommandRole;
  panelOrRoute: string;
  expectedOutcome: string;
  dependencies: string[];
  sourceFile: string;
  healthStatus?: string;
}

export interface CommandCallerTrace {
  commandId: string;
  buttons: ButtonCommandDefinition[];
  surfaces: ShellSurface[];
  roles: ShellCommandRole[];
  expectedOutcomes: string[];
  dependencies: string[];
}

export const SHELL_BUTTON_COMMANDS: ButtonCommandDefinition[] = [
  {
    buttonId: "session-strip.mic",
    commandId: "shell.mic",
    label: "MIC",
    role: "all",
    surface: "session-control-strip",
    panelOrRoute: "livePrivacy.micPreview",
    expectedOutcome: "Toggle hub mic preview on/off via livePrivacyState",
    dependencies: ["livePrivacyState"],
    sourceFile: "CommandCenterSessionControlStrip.tsx",
  },
  {
    buttonId: "session-strip.cam",
    commandId: "shell.cam",
    label: "CAM",
    role: "all",
    surface: "session-control-strip",
    panelOrRoute: "livePrivacy.cameraPreview",
    expectedOutcome: "Toggle hub camera preview on/off via livePrivacyState",
    dependencies: ["livePrivacyState"],
    sourceFile: "CommandCenterSessionControlStrip.tsx",
  },
  {
    buttonId: "session-strip.camera",
    commandId: "shell.camera",
    label: "CAMERA",
    role: "all",
    surface: "session-control-strip",
    panelOrRoute: "camera-capture-overlay",
    expectedOutcome: "Open CameraCaptureOverlay device picker",
    sourceFile: "CommandCenterSessionControlStrip.tsx",
  },
  {
    buttonId: "session-strip.snips",
    commandId: "shell.snips",
    label: "SNIPS",
    role: "all",
    surface: "session-control-strip",
    panelOrRoute: "compact-quick-panel:snips",
    expectedOutcome: "Toggle snips overlay panel via compactQuickPanelStore",
    dependencies: ["compactQuickPanelStore"],
    sourceFile: "CommandCenterSessionControlStrip.tsx",
  },
  {
    buttonId: "session-strip.video-shuffle",
    commandId: "shell.video-shuffle",
    label: "VIDEO SHUFFLE",
    role: "all",
    surface: "session-control-strip",
    panelOrRoute: "VideoShuffleModeRuntime",
    expectedOutcome: "Start or exit VideoShuffleModeRuntime",
    dependencies: ["VideoShuffleModeRuntime"],
    sourceFile: "CommandCenterSessionControlStrip.tsx",
  },
  {
    buttonId: "session-strip.stream-win",
    commandId: "shell.stream-win",
    label: "STREAM & WIN",
    role: "all",
    surface: "session-control-strip",
    panelOrRoute: "StreamWinModeRuntime",
    expectedOutcome: "Start or exit StreamWinModeRuntime + open stream-win panel",
    dependencies: ["StreamWinModeRuntime"],
    sourceFile: "CommandCenterSessionControlStrip.tsx",
  },
  {
    buttonId: "session-strip.go-live",
    commandId: "shell.go-live",
    label: "GO LIVE",
    role: "all",
    surface: "session-control-strip",
    panelOrRoute: "presentInstantGoLiveInPlace",
    expectedOutcome: "In-place GO LIVE: camera→Monitor A, venue→Monitor B, publish LiveSession; second tap ends session",
    dependencies: ["liveSession", "DiscoveryPublisher", "executeInstantGoLive", "presentInstantGoLiveInPlace"],
    sourceFile: "CommandCenterSessionControlStrip.tsx",
  },
  {
    buttonId: "mobile.magazine",
    commandId: "shell.magazine",
    label: "MAGAZINE",
    role: "all",
    surface: "mobile-quick-panel",
    panelOrRoute: "/magazine/issue/current",
    expectedOutcome: "Navigate to current magazine issue",
    sourceFile: "MobileQuickPanelBar.tsx",
  },
  {
    buttonId: "mobile.yopho",
    commandId: "shell.yopho",
    label: "YOPHO",
    role: "all",
    surface: "mobile-quick-panel",
    panelOrRoute: "compact-quick-panel:yopho",
    expectedOutcome: "Toggle YoPho composition panel",
    dependencies: ["compactQuickPanelStore"],
    sourceFile: "MobileQuickPanelBar.tsx",
  },
  {
    buttonId: "mobile.playlist",
    commandId: "shell.playlist",
    label: "PLAYLIST",
    role: "all",
    surface: "mobile-quick-panel",
    panelOrRoute: "workspace:playlist",
    expectedOutcome: "Open playlist workspace drawer",
    dependencies: ["openCanonicalWorkspaceQuick"],
    sourceFile: "MobileQuickPanelBar.tsx",
  },
  {
    buttonId: "mobile.lobbies",
    commandId: "shell.lobbies",
    label: "LOBBIES",
    role: "all",
    surface: "mobile-quick-panel",
    panelOrRoute: "compact-quick-panel:lobbies",
    expectedOutcome: "Toggle LOBBIES/DISCOVERY panel with live lobby wall",
    dependencies: ["compactQuickPanelStore"],
    sourceFile: "MobileQuickPanelBar.tsx",
  },
  {
    buttonId: "mobile.avatar",
    commandId: "shell.avatar",
    label: "AVATAR",
    role: "fan",
    surface: "mobile-quick-panel",
    panelOrRoute: "compact-quick-panel:avatar",
    expectedOutcome: "Toggle avatar quick panel (Fan-only, Rule 26)",
    dependencies: ["RoleGate"],
    sourceFile: "MobileQuickPanelBar.tsx",
  },
  {
    buttonId: "mobile.venue-tools",
    commandId: "shell.venue-tools",
    label: "VENUE TOOLS",
    role: "all",
    surface: "mobile-quick-panel",
    panelOrRoute: "compact-quick-panel:venue",
    expectedOutcome: "Open VenueControlPanel via compact quick panel",
    dependencies: ["VenueToolsRegistry", "VenueToolsDirector"],
    sourceFile: "MobileQuickPanelBar.tsx",
  },
  {
    buttonId: "mobile.messages",
    commandId: "shell.messages-quick",
    label: "MESSAGES",
    role: "fan",
    surface: "mobile-quick-panel",
    panelOrRoute: "workspace:messaging",
    expectedOutcome: "Open messaging workspace drawer",
    dependencies: ["openCanonicalWorkspaceQuick"],
    sourceFile: "MobileQuickPanelBar.tsx",
  },
  {
    buttonId: "top-nav.messages",
    commandId: "shell.messages",
    label: "MESSAGES",
    role: "all",
    surface: "command-center-top-nav",
    panelOrRoute: "workspace:messaging",
    expectedOutcome: "Open messaging workspace drawer",
    dependencies: ["openCanonicalWorkspaceQuick"],
    sourceFile: "CommandCenterTopNav.tsx",
  },
  {
    buttonId: "account.notifications",
    commandId: "shell.notifications",
    label: "NOTIFICATIONS",
    role: "all",
    surface: "account-command-menu",
    panelOrRoute: "workspace:notifications",
    expectedOutcome: "Open notifications workspace drawer",
    dependencies: ["NotificationEngine"],
    sourceFile: "AccountCommandMenu.tsx",
  },
  {
    buttonId: "gps.discovery",
    commandId: "shell.discovery",
    label: "LIVE LOBBY WALL",
    role: "all",
    surface: "gps-panel",
    panelOrRoute: "workspace:live-destinations",
    expectedOutcome: "Open live destinations / lobby wall workspace",
    sourceFile: "CommandCenterShell.tsx",
  },
  {
    buttonId: "venue-tools.toggle.default",
    commandId: "shell.venue-tools",
    label: "VENUE TOOLS",
    role: "all",
    surface: "session-control-strip",
    panelOrRoute: "compact-quick-panel:venue",
    expectedOutcome: "Toggle VenueControlPanel overlay without navigation",
    dependencies: ["VenueToolsRegistry", "VenueToolsDirector"],
    sourceFile: "VenueToolsToggleButton.tsx",
  },
  {
    buttonId: "venue-tools.toggle.lounge-hud",
    commandId: "shell.venue-tools.lounge-hud",
    label: "VENUE TOOLS",
    role: "performer",
    surface: "session-control-strip",
    panelOrRoute: "compact-quick-panel:venue",
    expectedOutcome: "Toggle lounge-host venue tools panel",
    dependencies: ["VenueToolsRegistry"],
    sourceFile: "VenueToolsToggleButton.tsx",
  },
  {
    buttonId: "venue-tools.toggle.venue-hud",
    commandId: "shell.venue-tools.venue-hud",
    label: "VENUE TOOLS",
    role: "performer",
    surface: "session-control-strip",
    panelOrRoute: "compact-quick-panel:venue",
    expectedOutcome: "Toggle venue HUD venue tools panel",
    dependencies: ["VenueToolsRegistry"],
    sourceFile: "VenueToolsToggleButton.tsx",
  },
  {
    buttonId: "venue-tools.toggle.media-stack",
    commandId: "shell.venue-tools.media-stack",
    label: "VENUE TOOLS",
    role: "all",
    surface: "session-control-strip",
    panelOrRoute: "compact-quick-panel:venue",
    expectedOutcome: "Toggle venue tools from media stack toolbar",
    dependencies: ["VenueToolsDirector", "LightingMoodRuntime"],
    sourceFile: "VenueToolsToggleButton.tsx",
  },
  {
    buttonId: "performance.intermission",
    commandId: "shell.intermission",
    label: "INTERMISSION",
    role: "performer",
    surface: "performance-rail",
    panelOrRoute: "StageLifecycleEngine",
    expectedOutcome: "Trigger intermission via StageLifecycleEngine",
    dependencies: ["StageLifecycleEngine", "VenueCurtainDirector"],
    sourceFile: "PerformanceRailControls.tsx",
  },
];

export function getShellButtonCommands(role?: CommandCenterRole | ShellCommandRole): ButtonCommandDefinition[] {
  if (!role) return SHELL_BUTTON_COMMANDS;
  return SHELL_BUTTON_COMMANDS.filter((cmd) => cmd.role === "all" || cmd.role === role);
}

export function getShellButtonByCommandId(commandId: string): ButtonCommandDefinition | undefined {
  return SHELL_BUTTON_COMMANDS.find((cmd) => cmd.commandId === commandId);
}

export function getShellButtonByButtonId(buttonId: string): ButtonCommandDefinition | undefined {
  return SHELL_BUTTON_COMMANDS.find((cmd) => cmd.buttonId === buttonId);
}

export function traceButtonToOutcome(buttonId: string): ButtonOutcomeTrace | undefined {
  const def = getShellButtonByButtonId(buttonId);
  if (!def) return undefined;
  const deps = def.dependencies ?? def.healthDependencies ?? [];
  const healthStatus =
    typeof window !== "undefined"
      ? (window as Window & { __TMI_SHELL_BUTTON_HEALTH__?: Record<string, string> }).__TMI_SHELL_BUTTON_HEALTH__?.[
          def.commandId
        ]
      : undefined;
  return {
    buttonId: def.buttonId,
    commandId: def.commandId,
    label: def.label,
    surface: def.surface,
    role: def.role,
    panelOrRoute: def.panelOrRoute,
    expectedOutcome: def.expectedOutcome,
    dependencies: deps,
    sourceFile: def.sourceFile,
    healthStatus,
  };
}

export function traceCommandToCallers(commandId: string): CommandCallerTrace | undefined {
  const buttons = SHELL_BUTTON_COMMANDS.filter((cmd) => cmd.commandId === commandId);
  if (buttons.length === 0) return undefined;
  const surfaces = [...new Set(buttons.map((b) => b.surface))];
  const roles = [...new Set(buttons.map((b) => b.role))];
  const deps = [...new Set(buttons.flatMap((b) => b.dependencies ?? b.healthDependencies ?? []))];
  return {
    commandId,
    buttons,
    surfaces,
    roles,
    expectedOutcomes: [...new Set(buttons.map((b) => b.expectedOutcome))],
    dependencies: deps,
  };
}

export function registerShellButtonHealth(commandId: string, status: "ok" | "degraded" | "missing"): void {
  if (typeof window === "undefined") return;
  const w = window as Window & { __TMI_SHELL_BUTTON_HEALTH__?: Record<string, string> };
  w.__TMI_SHELL_BUTTON_HEALTH__ = { ...w.__TMI_SHELL_BUTTON_HEALTH__, [commandId]: status };
  window.dispatchEvent(
    new CustomEvent("tmi:shell-button-health", { detail: { commandId, status } }),
  );
}

export function getShellButtonHealthCounts(): {
  registered: number;
  withOutcome: number;
  withDependencies: number;
  uniqueCommands: number;
} {
  const uniqueCommands = new Set(SHELL_BUTTON_COMMANDS.map((c) => c.commandId)).size;
  return {
    registered: SHELL_BUTTON_COMMANDS.length,
    withOutcome: SHELL_BUTTON_COMMANDS.filter((c) => Boolean(c.expectedOutcome)).length,
    withDependencies: SHELL_BUTTON_COMMANDS.filter(
      (c) => (c.dependencies ?? c.healthDependencies ?? []).length > 0,
    ).length,
    uniqueCommands,
  };
}
