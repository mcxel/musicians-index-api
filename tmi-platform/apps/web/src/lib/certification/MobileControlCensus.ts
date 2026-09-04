/**
 * Mobile Control Census — P0 cannibalization inventory (2026-08-27).
 * Source file + handler + ON/OFF state + disposition per control.
 */

export type ControlDisposition = "KEEP" | "REHOME" | "REMOVE";

export interface MobileControlEntry {
  control: string;
  sourceFile: string;
  handler: string;
  onOff: string;
  action: ControlDisposition;
  note?: string;
}

export const MOBILE_CONTROL_CENSUS: MobileControlEntry[] = [
  { control: "MONITORS", sourceFile: "components/commandCenter/CommandCenterShell.tsx", handler: "toggleStageMonitors", onOff: "ON when monitorCount>0", action: "KEEP" },
  { control: "MIC ON", sourceFile: "components/commandCenter/CommandCenterSessionControlStrip.tsx", handler: "toggleHubMicPreview", onOff: "toggle", action: "KEEP", note: "trace intents — do not merge" },
  { control: "CAM ON", sourceFile: "components/commandCenter/CommandCenterSessionControlStrip.tsx", handler: "toggleHubCameraPreview", onOff: "toggle", action: "KEEP", note: "trace intents — do not merge" },
  { control: "CAMERA", sourceFile: "components/commandCenter/CommandCenterSessionControlStrip.tsx", handler: "setIsCameraOpen(true)", onOff: "momentary", action: "KEEP" },
  { control: "HAND", sourceFile: "components/venue-hud/TMIInteractiveVenueHud.tsx", handler: "venue reaction rail", onOff: "venue-only", action: "REHOME", note: "Venue HUD only — not outer shell" },
  { control: "EMOTES", sourceFile: "components/venue-hud/TMIInteractiveVenueHud.tsx", handler: "venue emote wheel", onOff: "venue-only", action: "REHOME", note: "Venue HUD only — not outer shell" },
  { control: "CLAP", sourceFile: "components/venue-hud/TMIInteractiveVenueHud.tsx", handler: "audience reaction", onOff: "venue-only", action: "REHOME", note: "Venue HUD only — not outer shell" },
  { control: "STAGE", sourceFile: "components/commandCenter/CommandCenterMediaStack.tsx", handler: "HubMonitorVenuePlayer", onOff: "when hubLiveRoomId", action: "KEEP" },
  { control: "HOME", sourceFile: "components/system/TMIGlobalNav.tsx", handler: "router.push(dashboardHref)", onOff: "route", action: "REMOVE", note: "superseded on hub — TMIGlobalNav unmounts on /hub" },
  { control: "DISCOVER", sourceFile: "components/system/TMIGlobalNav.tsx", handler: "liveDiscoveryOverlayStore.open", onOff: "overlay", action: "REMOVE", note: "GPS/live-destinations owns discovery on hub" },
  { control: "LIVE NOW", sourceFile: "components/system/TMIGlobalNav.tsx", handler: "liveDiscoveryOverlayStore.open", onOff: "overlay", action: "REMOVE", note: "superseded by CommandCenter GPS" },
  { control: "LOBBY", sourceFile: "components/commandCenter/MobileQuickPanelBar.tsx", handler: "togglePanel('lobbies')", onOff: "toggle", action: "KEEP", note: "discovery quick panel — moved from session strip" },
  { control: "MESSAGES", sourceFile: "components/commandCenter/CommandCenterTopNav.tsx", handler: "openCanonicalWorkspaceQuick('messaging')", onOff: "drawer", action: "KEEP" },
  { control: "NOTIFICATIONS", sourceFile: "components/navigation/AccountCommandMenu.tsx", handler: "setSubScreen('notifications')", onOff: "menu panel", action: "REHOME", note: "removed from TMIGlobalNav outer shell" },
  { control: "AVATAR", sourceFile: "components/commandCenter/MobileQuickPanelBar.tsx", handler: "togglePanel('avatar')", onOff: "toggle", action: "KEEP", note: "Fan-only RoleGate" },
  { control: "INV", sourceFile: "components/commandCenter/PersistentMediaInteractionDock.tsx", handler: "presentCanonicalWorkspace('inventory')", onOff: "drawer", action: "KEEP", note: "desktop dock; Fan-only" },
  { control: "SHARE SCREEN", sourceFile: "components/commandCenter/CommandCenterMediaStack.tsx", handler: "cycleSharePress", onOff: "toggle", action: "KEEP" },
  { control: "RECORD", sourceFile: "components/commandCenter/PersistentMediaInteractionDock.tsx", handler: "setIsCameraOpen(true)", onOff: "momentary", action: "KEEP" },
  { control: "SHARE", sourceFile: "components/commandCenter/PersistentMediaInteractionDock.tsx", handler: "presentCanonicalWorkspace('share-studio')", onOff: "drawer", action: "KEEP" },
  { control: "AUTO", sourceFile: "components/commandCenter/MobileQuickPanelBar.tsx", handler: "display-only", onOff: "always ON label", action: "KEEP", note: "stream quality indicator" },
  { control: "ONLINE", sourceFile: "components/commandCenter/PersistentMediaInteractionDock.tsx", handler: "navigator.onLine", onOff: "reflective", action: "KEEP" },
  { control: "MAGAZINE", sourceFile: "components/commandCenter/MobileQuickPanelBar.tsx", handler: "router.push('/magazine/issue/current')", onOff: "route", action: "KEEP" },
  { control: "YOPHO", sourceFile: "components/commandCenter/CommandCenterMediaStack.tsx", handler: "openCanonicalWorkspaceQuick('yopho')", onOff: "drawer", action: "KEEP" },
  { control: "PLAYLIST", sourceFile: "components/commandCenter/MobileQuickPanelBar.tsx", handler: "openCanonicalWorkspaceQuick('playlist')", onOff: "drawer", action: "KEEP" },
  { control: "STREAM & WIN", sourceFile: "components/commandCenter/MobileQuickPanelBar.tsx", handler: "startStreamWin / exitStreamWin", onOff: "toggle", action: "REHOME", note: "promoted to session strip primary row" },
  { control: "GO LIVE", sourceFile: "components/commandCenter/CommandCenterSessionControlStrip.tsx", handler: "presentInstantGoLiveInPlace", onOff: "toggle live/end", action: "KEEP" },
  { control: "INTERMISSION", sourceFile: "components/commandCenter/PerformanceRailControls.tsx", handler: "requestIntermission / resumeFromIntermission", onOff: "toggle", action: "KEEP", note: "performer media stack only" },
];

export const MOBILE_CONTROLS_REMOVED = [
  "TMIGlobalNav HOME (hub unmount)",
  "TMIGlobalNav DISCOVER (hub unmount)",
  "TMIGlobalNav LIVE NOW (hub unmount)",
  "TMIGlobalNav LOBBY (hub unmount)",
  "TMIGlobalNav standalone NOTIFICATIONS button",
  "TMIGlobalNav standalone MESSAGES button",
  "TMIGlobalNav standalone Profile + Logout buttons",
  "mobileCommandCenterCapabilities emotes action id",
  "LaunchDock on /hub routes (already gated)",
  "NavigationRail on /hub routes (already gated)",
  "WorkspaceControlDock vertical nav rail (home/explore/live_now/messages)",
  "PerformerCreatorControlCluster on CommandCenterShell outer shell",
  "GoLiveStudio on /live/go (redirect to hub golive)",
];
