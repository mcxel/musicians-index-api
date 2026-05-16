export type ControlDirection = "up" | "down" | "left" | "right" | "center";

export type ControlType =
  | "button"
  | "chevron"
  | "slider"
  | "knob"
  | "tab"
  | "drag"
  | "canvas"
  | "fullscreen"
  | "audio"
  | "video"
  | "color-switch"
  | "skin-switch"
  | "background-switch"
  | "monitor";

export interface ControlRegistration {
  id: string;
  type: ControlType;
  route: string;
  fallbackRoute: string;
  dataTestId: string;
  ariaLabel: string;
  supportsDirections?: ControlDirection[];
  hasBackForwardChain: boolean;
  reducedMotionSafe: boolean;
  motionState: "idle" | "active" | "transition";
  observableEvent: string;
}

const CONTROL_REGISTRY: ControlRegistration[] = [
  {
    id: "sponsor-open-fullscreen",
    type: "fullscreen",
    route: "/sponsors/[slug]",
    fallbackRoute: "/sponsors",
    dataTestId: "open-fullscreen",
    ariaLabel: "Open sponsor fullscreen",
    hasBackForwardChain: true,
    reducedMotionSafe: true,
    motionState: "transition",
    observableEvent: "homepage.artifact.preview",
  },
  {
    id: "lobby-billboard-chevron",
    type: "chevron",
    route: "/lobbies/[id]",
    fallbackRoute: "/home/3",
    dataTestId: "lobby-billboard-crown-weekly",
    ariaLabel: "Open lobby billboard",
    supportsDirections: ["right"],
    hasBackForwardChain: true,
    reducedMotionSafe: true,
    motionState: "active",
    observableEvent: "pipeline.billboard.open",
  },
  {
    id: "billboard-ad-target",
    type: "button",
    route: "/billboards/[id]",
    fallbackRoute: "/home/5",
    dataTestId: "open-ad-target",
    ariaLabel: "Open billboard ad target",
    hasBackForwardChain: true,
    reducedMotionSafe: true,
    motionState: "active",
    observableEvent: "homepage.artifact.route",
  },
  {
    id: "billboard-hover-preview",
    type: "monitor",
    route: "/billboards/[id]",
    fallbackRoute: "/home/5",
    dataTestId: "billboard-hover-preview",
    ariaLabel: "Billboard hover preview",
    hasBackForwardChain: true,
    reducedMotionSafe: true,
    motionState: "active",
    observableEvent: "admin.monitor.preview",
  },
  {
    id: "magazine-next",
    type: "chevron",
    route: "/magazine/[issue]",
    fallbackRoute: "/home/2",
    dataTestId: "magazine-next",
    ariaLabel: "Go to next magazine page",
    supportsDirections: ["right"],
    hasBackForwardChain: true,
    reducedMotionSafe: true,
    motionState: "transition",
    observableEvent: "homepage.artifact.route",
  },
];

export function listControls(): ControlRegistration[] {
  return [...CONTROL_REGISTRY];
}

export function getControl(id: string): ControlRegistration | undefined {
  return CONTROL_REGISTRY.find((row) => row.id === id);
}

export function findControlByTestId(dataTestId: string): ControlRegistration | undefined {
  return CONTROL_REGISTRY.find((row) => row.dataTestId === dataTestId);
}

export function validateControlRegistry(): string[] {
  const failures: string[] = [];
  const seen = new Set<string>();

  for (const control of CONTROL_REGISTRY) {
    if (seen.has(control.id)) failures.push(`Duplicate control id: ${control.id}`);
    seen.add(control.id);

    if (!control.route.startsWith("/")) failures.push(`${control.id}: route must start with /`);
    if (!control.fallbackRoute.startsWith("/")) failures.push(`${control.id}: fallbackRoute must start with /`);
    if (!control.dataTestId) failures.push(`${control.id}: missing dataTestId`);
    if (!control.ariaLabel) failures.push(`${control.id}: missing ariaLabel`);
    if (!control.observableEvent) failures.push(`${control.id}: missing observableEvent`);
  }

  return failures;
}
