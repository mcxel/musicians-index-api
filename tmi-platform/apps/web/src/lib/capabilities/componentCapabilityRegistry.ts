export type MotionState = "idle" | "pulse" | "flicker" | "dragging" | "transition";

export type ControlCapability =
  | "button"
  | "chevron"
  | "slider"
  | "knob"
  | "tab"
  | "drag-card"
  | "movable-canvas"
  | "monitor-preview"
  | "fullscreen"
  | "audio-video"
  | "color-switch"
  | "skin-switch"
  | "background-switch"
  | "prize-control"
  | "reward-control"
  | "sponsor-control"
  | "profile-monitor";

export interface ComponentCapability {
  id: string;
  type: "page" | "component" | "widget" | "card" | "canvas" | "hud" | "monitor" | "feed";
  componentPath: string;
  route: string;
  fallbackRoute: string;
  dataTestId: string;
  ariaLabel: string;
  sourceRef?: string;
  capability: string;
  action: string;
  dataSource: string;
  controls: ControlCapability[];
  motionState: MotionState;
  reducedMotionSafe: boolean;
  adminObservabilityEvent: string;
  backForwardChain: string[];
  proofStatus: "mapped" | "wired" | "verified";
}

const REGISTRY: ComponentCapability[] = [
  {
    id: "sponsor-hub",
    type: "page",
    componentPath: "src/components/sponsor/SponsorHub.tsx",
    route: "/sponsors/[slug]",
    fallbackRoute: "/sponsors",
    dataTestId: "sponsor-hub",
    ariaLabel: "Sponsor hub page",
    capability: "Sponsor campaign control and route chaining",
    action: "Open preview, fullscreen, CTA and chain links",
    dataSource: "sponsorCampaignFeed",
    controls: ["button", "fullscreen", "monitor-preview", "sponsor-control"],
    motionState: "flicker",
    reducedMotionSafe: true,
    adminObservabilityEvent: "pipeline.sponsor.open",
    backForwardChain: ["/home/5", "/sponsors/[slug]", "/lobbies/live-world", "/billboards/crown-weekly"],
    proofStatus: "verified",
  },
  {
    id: "lobby-wall",
    type: "page",
    componentPath: "src/components/lobby/LobbyWall.tsx",
    route: "/lobbies/[id]",
    fallbackRoute: "/home/3",
    dataTestId: "lobby-wall",
    ariaLabel: "Lobby wall page",
    capability: "Lobby chain control with presence and feed ticker",
    action: "Route to billboards and games",
    dataSource: "lobbyStateFeed",
    controls: ["button", "profile-monitor", "monitor-preview"],
    motionState: "pulse",
    reducedMotionSafe: true,
    adminObservabilityEvent: "pipeline.lobby.open",
    backForwardChain: ["/home/3", "/lobbies/[id]", "/billboards/[id]", "/games/[id]"],
    proofStatus: "verified",
  },
  {
    id: "billboard-rotator",
    type: "page",
    componentPath: "src/components/billboard/BillboardRotator.tsx",
    route: "/billboards/[id]",
    fallbackRoute: "/home/5",
    dataTestId: "billboard-rotator",
    ariaLabel: "Billboard rotator page",
    capability: "Rotating ad control with hover preview and route chain",
    action: "Open ad target and linked game",
    dataSource: "billboardAdRotationFeed",
    controls: ["button", "monitor-preview", "sponsor-control", "fullscreen"],
    motionState: "transition",
    reducedMotionSafe: true,
    adminObservabilityEvent: "pipeline.billboard.open",
    backForwardChain: ["/home/5", "/billboards/[id]", "/games/name-that-tune"],
    proofStatus: "verified",
  },
  {
    id: "admin-hub-shell",
    type: "hud",
    componentPath: "src/components/admin/AdminHubShell.tsx",
    route: "/admin",
    fallbackRoute: "/home/1",
    dataTestId: "admin-hub-shell",
    ariaLabel: "Administration hub shell",
    capability: "Overseer monitor routing and event observability",
    action: "Select monitor section and open target route",
    dataSource: "systemEventBus",
    controls: ["button", "tab", "monitor-preview", "chevron"],
    motionState: "pulse",
    reducedMotionSafe: true,
    adminObservabilityEvent: "admin.monitor.select",
    backForwardChain: ["/home/1", "/admin", "/admin?monitor=live-feed"],
    proofStatus: "verified",
  },
  {
    id: "magazine-shell",
    type: "canvas",
    componentPath: "src/components/magazine/MagazineShell.tsx",
    route: "/magazine/[issue]",
    fallbackRoute: "/home/2",
    dataTestId: "magazine-shell",
    ariaLabel: "Magazine shell",
    capability: "Issue rendering, page turn, and sponsor spread controls",
    action: "Navigate pages and route from article links",
    dataSource: "editorialIssueFeed",
    controls: ["button", "chevron", "tab", "background-switch"],
    motionState: "transition",
    reducedMotionSafe: true,
    adminObservabilityEvent: "homepage.artifact.route",
    backForwardChain: ["/home/2", "/magazine/[issue]", "/articles/latest"],
    proofStatus: "wired",
  },
];

export function listComponentCapabilities(): ComponentCapability[] {
  return [...REGISTRY];
}

export function getComponentCapability(id: string): ComponentCapability | undefined {
  return REGISTRY.find((item) => item.id === id);
}

export function routeCoverageMap(): Record<string, string[]> {
  return REGISTRY.reduce<Record<string, string[]>>((acc, item) => {
    if (!acc[item.route]) acc[item.route] = [];
    acc[item.route].push(item.id);
    return acc;
  }, {});
}

export function validateCapabilityRegistry(): string[] {
  const issues: string[] = [];
  const seen = new Set<string>();

  for (const row of REGISTRY) {
    if (seen.has(row.id)) {
      issues.push(`Duplicate capability id: ${row.id}`);
    }
    seen.add(row.id);

    if (!row.route.startsWith("/")) issues.push(`${row.id}: route must start with /`);
    if (!row.fallbackRoute.startsWith("/")) issues.push(`${row.id}: fallbackRoute must start with /`);
    if (!row.dataTestId) issues.push(`${row.id}: missing dataTestId`);
    if (!row.ariaLabel) issues.push(`${row.id}: missing ariaLabel`);
    if (!row.adminObservabilityEvent) issues.push(`${row.id}: missing adminObservabilityEvent`);
    if (!row.controls.length) issues.push(`${row.id}: missing controls`);
  }

  return issues;
}
