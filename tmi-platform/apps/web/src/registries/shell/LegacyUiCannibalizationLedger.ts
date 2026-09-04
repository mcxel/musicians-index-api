/**
 * LegacyUiCannibalizationLedger — shell presentation hunt (UI-first).
 * TRACE → REHOME INTO CANONICAL UI → UNMOUNT DUPLICATE → KEEP ENGINES.
 * Venue-specific mutation family: also see lib/venue/VenueToolsLegacyLedger.ts.
 * Last hunt: 2026-08-28.
 */

export type LegacyUiClass =
  | "HARVEST"
  | "REHOME INTO CANONICAL UI"
  | "DUPLICATE"
  | "OBSOLETE"
  | "DEAD"
  | "UNKNOWN";

export type CanonicalUiTarget =
  | "Fan shell"
  | "Performer shell"
  | "Venue Tools"
  | "Venue HUD"
  | "Media Player"
  | "Account header"
  | "Discovery"
  | "RETIRE";

export interface LegacyUiLedgerEntry {
  legacyId: string;
  file: string;
  what: string;
  mountedBy: string;
  routes: string;
  classification: LegacyUiClass;
  productionReachable: "YES" | "NO";
  canonicalTarget: CanonicalUiTarget;
  notes?: string;
}

export const LEGACY_UI_CANNIBALIZATION_LEDGER: LegacyUiLedgerEntry[] = [
  {
    legacyId: "LEG-SHELL-001",
    file: "components/shell/MasterControlDock.tsx",
    what: "Legacy bottom MasterControlDock board",
    mountedBy: "UNMOUNTED — DockRegistry comment; no JSX mounts",
    routes: "/hub/* (was)",
    classification: "OBSOLETE",
    productionReachable: "NO",
    canonicalTarget: "RETIRE",
    notes: "PersistentMediaInteractionDock + session strip own HQ chrome",
  },
  {
    legacyId: "LEG-SHELL-002",
    file: "components/commandCenter/docks/WorkspaceControlDock.tsx",
    what: "Legacy workspace control dock + nav rail grid",
    mountedBy: "FanControlDock / PerformerControlDock / AdminControlDock only",
    routes: "none on /hub (role docks not imported by shell)",
    classification: "OBSOLETE",
    productionReachable: "NO",
    canonicalTarget: "RETIRE",
    notes: "DockRegistry navItemIds=[] for fan/performer; keep file for admin harvest",
  },
  {
    legacyId: "LEG-SHELL-003",
    file: "components/commandCenter/docks/FanControlDock.tsx",
    what: "Fan-specific WorkspaceControlDock wrapper",
    mountedBy: "NO production importer outside docks/",
    routes: "/hub/fan (not mounted)",
    classification: "DEAD",
    productionReachable: "NO",
    canonicalTarget: "Fan shell",
    notes: "CommandCenterShell is canonical Fan chrome",
  },
  {
    legacyId: "LEG-SHELL-004",
    file: "components/commandCenter/docks/PerformerControlDock.tsx",
    what: "Performer-specific WorkspaceControlDock wrapper",
    mountedBy: "NO production importer outside docks/",
    routes: "/hub/performer (not mounted)",
    classification: "DEAD",
    productionReachable: "NO",
    canonicalTarget: "Performer shell",
  },
  {
    legacyId: "LEG-SHELL-005",
    file: "components/commandCenter/PerformerCreatorControlCluster.tsx",
    what: "Outer performer creator control cluster",
    mountedBy: "UNMOUNTED from CommandCenterShell (prior shell slice)",
    routes: "/hub/performer",
    classification: "OBSOLETE",
    productionReachable: "NO",
    canonicalTarget: "Performer shell",
    notes: "Session strip + experience strip + media stack replace this",
  },
  {
    legacyId: "LEG-SHELL-006",
    file: "components/system/TMIGlobalNav.tsx",
    what: "Global bottom nav (Home/Discover/Live/Lobby/Messages)",
    mountedBy: "UNMOUNTED from app/layout.tsx",
    routes: "was non-hub; production mounts = 0",
    classification: "DEAD",
    productionReachable: "NO",
    canonicalTarget: "RETIRE",
    notes: "Legacy HOME/DISCOVER/LIVE NOW/LOBBY board removed; file kept stripped for archaeology",
  },
  {
    legacyId: "LEG-SHELL-007",
    file: "components/nav/NavigationRail.tsx",
    what: "TMI-OS left-edge console navigation rail",
    mountedBy: "UNMOUNTED from app/layout.tsx — component returns null",
    routes: "was global; production mounts = 0",
    classification: "DEAD",
    productionReachable: "NO",
    canonicalTarget: "RETIRE",
    notes: "HOME/DISCOVER/LIVE/LOBBY/MESSAGES live in TopNav + AccountCommandMenu + quick panel",
  },
  {
    legacyId: "LEG-SHELL-007b",
    file: "components/commandCenter/CommandCenterShell.tsx",
    what: "Desktop in-flow L/R side rails (railBtn panel grid + OperationsSidebar)",
    mountedBy: "UNMOUNTED — CanonicalCommandCenterFrame single-column",
    routes: "/hub/fan · /hub/performer",
    classification: "OBSOLETE",
    productionReachable: "NO",
    canonicalTarget: "RETIRE",
    notes: "Capabilities rehomed to session strip, quick tools, bottom workspace drawers",
  },
  {
    legacyId: "LEG-SHELL-008",
    file: "components/live/StarfieldWarpEntry.tsx",
    what: "VERSION A global body starburst overlay",
    mountedBy: "UNMOUNTED — zero production importers",
    routes: "hub GO LIVE (was)",
    classification: "DEAD",
    productionReachable: "NO",
    canonicalTarget: "Media Player",
    notes: "Canonical: GoLiveMediaTransition on Monitor B only",
  },
  {
    legacyId: "LEG-SHELL-009",
    file: "components/live/SeatArrivalTransition.tsx",
    what: "LEGACY B audience fixed viewport starburst",
    mountedBy: "UNMOUNTED from UniversalLobbyEntry 2026-08-28",
    routes: "/live/* lobby entry",
    classification: "DEAD",
    productionReachable: "NO",
    canonicalTarget: "Media Player",
    notes: "GLOBAL OVERLAY = 0; settle is in-flow absolute only",
  },
  {
    legacyId: "LEG-SHELL-010",
    file: "components/live/RoomWarpTransition.tsx",
    what: "LEGACY B /live/rooms warp overlay",
    mountedBy: "UNMOUNTED — zero production importers",
    routes: "/live/rooms/[id]",
    classification: "DEAD",
    productionReachable: "NO",
    canonicalTarget: "Media Player",
  },
  {
    legacyId: "LEG-SHELL-011",
    file: "components/live/CurtainCanister.tsx",
    what: "Standalone curtain DROP/RISE canister",
    mountedBy: "UNMOUNTED from ControlCanisterCluster",
    routes: "/live/rooms/[id]",
    classification: "DUPLICATE",
    productionReachable: "NO",
    canonicalTarget: "Venue Tools",
    notes: "See LEG-VENUE-016 in VenueToolsLegacyLedger",
  },
  {
    legacyId: "LEG-SHELL-012",
    file: "components/venue-hud/VenueControlConsole.tsx",
    what: "Pre-live glass GO LIVE console (mode/mic/cam/quality)",
    mountedBy: "TMIInteractiveVenueHud when PRE_LIVE",
    routes: "Venue HUD live surfaces",
    classification: "HARVEST",
    productionReachable: "YES",
    canonicalTarget: "Venue HUD",
    notes: "KEEP — not competing VENUE TOOLS; no lighting/curtain mutation",
  },
  {
    legacyId: "LEG-SHELL-013",
    file: "components/performer/PerformerCurtainControlPanel.tsx",
    what: "Hub drawer curtain mutation panel",
    mountedBy: "CommandCenterDrawer activePanel=stage_tools (WAS)",
    routes: "/hub/performer drawer",
    classification: "DUPLICATE",
    productionReachable: "NO",
    canonicalTarget: "Venue Tools",
    notes: "Replaced with VenueToolsShellHint 2026-08-28",
  },
  {
    legacyId: "LEG-SHELL-014",
    file: "components/commandCenter/PerformerExperienceQuickStrip.tsx",
    what: "Second row with duplicate 🔴 GO LIVE + Mini launches",
    mountedBy: "CommandCenterShell (performer)",
    routes: "/hub/performer",
    classification: "HARVEST",
    productionReachable: "YES",
    canonicalTarget: "Performer shell",
    notes: "GO LIVE removed from strip — Mini Concert/Battle/Cypher only; primary GO LIVE = session strip",
  },
  {
    legacyId: "LEG-SHELL-015",
    file: "components/commandCenter/CanonicalQuickToolsStrip.tsx + mobileCommandCenterCapabilities",
    what: "Desktop quick tools also listing VENUE TOOLS while media-stack has toggle",
    mountedBy: "PersistentMediaInteractionDock (desktop)",
    routes: "/hub/fan · /hub/performer",
    classification: "DUPLICATE",
    productionReachable: "NO",
    canonicalTarget: "Venue Tools",
    notes: "Desktop filters venue-tools out of quick strip 2026-08-28; mobile bar keeps it (media toolbar hidden ≤900px)",
  },
  {
    legacyId: "LEG-SHELL-016",
    file: "components/commandCenter/CommandCenterMediaStack.tsx",
    what: "Monitor utility row — ONE VENUE TOOLS + CAST + ID",
    mountedBy: "CommandCenterShell media region",
    routes: "/hub/* desktop",
    classification: "HARVEST",
    productionReachable: "YES",
    canonicalTarget: "Performer shell",
    notes: "Canonical hub VENUE TOOLS entry (desktop); suppressed on compactHubLayout",
  },
  {
    legacyId: "LEG-SHELL-017",
    file: "components/hud/VenueToolsToggleButton.tsx → VenueToolsQuickPanel",
    what: "Canonical VENUE TOOLS open/close toggle → floating glass panel",
    mountedBy: "Media stack (desktop), MobileQuickPanelBar (mobile), Venue HUD, Lounge HUD",
    routes: "hub / live HUD / lounge (one per surface)",
    classification: "HARVEST",
    productionReachable: "YES",
    canonicalTarget: "Venue Tools",
    notes: "Panel wires VenueControlPanel → VenueToolsDirector / StageDirectorEngine / LightingMoodRuntime",
  },
  {
    legacyId: "LEG-SHELL-018",
    file: "components/commandCenter/CommandCenterSessionControlStrip.tsx",
    what: "Primary MIC/CAM/CAMERA/SNIPS/SHUFFLE/STREAM&WIN/GO LIVE",
    mountedBy: "CommandCenterShell",
    routes: "/hub/fan · /hub/performer",
    classification: "HARVEST",
    productionReachable: "YES",
    canonicalTarget: "Performer shell",
    notes: "Single session strip — no second MIC/CAM/GO LIVE row",
  },
  {
    legacyId: "LEG-SHELL-019",
    file: "components/navigation/AccountCommandMenu.tsx + CommandCenterTopNav.tsx",
    what: "Messages + notifications in account header",
    mountedBy: "CommandCenterTopNav / AccountCommandMenu",
    routes: "/hub/*",
    classification: "HARVEST",
    productionReachable: "YES",
    canonicalTarget: "Account header",
    notes: "Removed from dock nav rail and outer TMIGlobalNav",
  },
  {
    legacyId: "LEG-SHELL-020",
    file: "lib/commandCenter/dockOverlayEmotes.ts + play-widget/EmoteCarousel",
    what: "HAND/EMOTES/CLAP outer shell affordances",
    mountedBy: "Not on CommandCenterShell outer chrome",
    routes: "Venue HUD / audience only",
    classification: "REHOME INTO CANONICAL UI",
    productionReachable: "NO",
    canonicalTarget: "Venue HUD",
    notes: "Must not appear on hub outer shell",
  },
  {
    legacyId: "LEG-SHELL-021",
    file: "app/go-live/page.tsx · former /go-live / /live/go-live hrefs",
    what: "Legacy Go Live studio routes / off-hub links",
    mountedBy: "app/go-live redirects → /hub/performer?golive=1; production hrefs retargeted 2026-08-28",
    routes: "/go-live (redirect only), /hub/performer?golive=1",
    classification: "REHOME INTO CANONICAL UI",
    productionReachable: "NO",
    canonicalTarget: "Media Player",
    notes: "Canonical: presentInstantGoLiveInPlace on Command Center; /go-live page remains redirect shim",
  },
  {
    legacyId: "LEG-SHELL-022",
    file: "MagazinePageFlipRuntime / MagazineAssemblyDirector runPageTurn",
    what: "Magazine page-turn (NOT home hub shell page-turn)",
    mountedBy: "MagazineShell / MagazinePageFlipRuntime — magazine routes only",
    routes: "/magazine · magazine shells",
    classification: "HARVEST",
    productionReachable: "YES",
    canonicalTarget: "Discovery",
    notes: "Home hub shells: no runPageTurn/MagazinePageFlipRuntime mounts. Magazine page-turn PRESERVED. HomePageCover PageTurnFlash is magazine-cover artifact (closed shell), not hub chrome.",
  },
  {
    legacyId: "LEG-SHELL-023",
    file: "components/live/ControlCanisterCluster.tsx lighting+curtain chips",
    what: "Was dual VENUE TOOLS entry (💡 Lighting + 🎭 Curtain)",
    mountedBy: "/live/rooms/[id] performer",
    routes: "/live/rooms/[id]",
    classification: "DUPLICATE",
    productionReachable: "NO",
    canonicalTarget: "Venue Tools",
    notes: "Now single lighting=VENUE TOOLS chip + event-owner only",
  },
  {
    legacyId: "LEG-SHELL-024",
    file: "components/commandCenter/PerformanceRailControls.tsx",
    what: "Had VenueToolsToggleButton beside INTERMISSION",
    mountedBy: "Not mounted on CommandCenterMediaStack currently",
    routes: "/hub/performer (potential)",
    classification: "DUPLICATE",
    productionReachable: "NO",
    canonicalTarget: "Venue Tools",
    notes: "VenueToolsToggle removed 2026-08-28 — INTERMISSION/RESUME only",
  },
];

export const LEGACY_UI_LEDGER_LAST_RUN = "2026-08-28";

export function listLegacyUiByReachable(reachable: "YES" | "NO"): LegacyUiLedgerEntry[] {
  return LEGACY_UI_CANNIBALIZATION_LEDGER.filter((e) => e.productionReachable === reachable);
}

export function listCompetingLegacyUiStacks(): LegacyUiLedgerEntry[] {
  return LEGACY_UI_CANNIBALIZATION_LEDGER.filter(
    (e) =>
      e.productionReachable === "YES" &&
      (e.classification === "DUPLICATE" || e.classification === "OBSOLETE"),
  );
}

export function getLegacyUiZeroTargetCounts(): {
  total: number;
  reachableYes: number;
  competingStacks: number;
  deadOrObsoleteUnmounted: number;
} {
  const all = LEGACY_UI_CANNIBALIZATION_LEDGER;
  return {
    total: all.length,
    reachableYes: all.filter((e) => e.productionReachable === "YES").length,
    competingStacks: listCompetingLegacyUiStacks().length,
    deadOrObsoleteUnmounted: all.filter(
      (e) =>
        e.productionReachable === "NO" &&
        (e.classification === "DEAD" || e.classification === "OBSOLETE" || e.classification === "DUPLICATE"),
    ).length,
  };
}
