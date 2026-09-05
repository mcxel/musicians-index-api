/**
 * LegacyVenueReachabilityDetector — emits LEGACY-VENUE-001..004 when old panels mount in production.
 * Follows componentCapabilityRegistry observability pattern.
 */

export type LegacyVenueErrorCode =
  | "LEGACY-VENUE-001"
  | "LEGACY-VENUE-002"
  | "LEGACY-VENUE-003"
  | "LEGACY-VENUE-004";

export interface LegacyVenueMountEvent {
  code: LegacyVenueErrorCode;
  legacyComponentId: string;
  sourceFile: string;
  route?: string;
  mountedAt: string;
}

const ERROR_DESCRIPTIONS: Record<LegacyVenueErrorCode, string> = {
  "LEGACY-VENUE-001": "Legacy standalone lighting panel mounted outside VENUE TOOLS",
  "LEGACY-VENUE-002": "Legacy standalone stage/curtain panel mounted outside VENUE TOOLS",
  "LEGACY-VENUE-003": "Legacy standalone mood/scene panel mounted outside VENUE TOOLS",
  "LEGACY-VENUE-004": "Legacy venue control menu family mounted (WorkspaceControlDock / control booth)",
};

const mountLog: LegacyVenueMountEvent[] = [];

export function describeLegacyVenueError(code: LegacyVenueErrorCode): string {
  return ERROR_DESCRIPTIONS[code];
}

export function reportLegacyVenueMount(
  code: LegacyVenueErrorCode,
  legacyComponentId: string,
  sourceFile: string,
  route?: string,
): LegacyVenueMountEvent {
  const event: LegacyVenueMountEvent = {
    code,
    legacyComponentId,
    sourceFile,
    route: route ?? (typeof window !== "undefined" ? window.location.pathname : undefined),
    mountedAt: new Date().toISOString(),
  };
  mountLog.push(event);
  if (mountLog.length > 100) mountLog.shift();

  if (typeof window !== "undefined") {
    const w = window as Window & { __TMI_LEGACY_VENUE_MOUNTS__?: LegacyVenueMountEvent[] };
    w.__TMI_LEGACY_VENUE_MOUNTS__ = [...mountLog];
    window.dispatchEvent(
      new CustomEvent("tmi:legacy-venue-mount", {
        detail: { ...event, message: ERROR_DESCRIPTIONS[code] },
      }),
    );
  }

  if (process.env.NODE_ENV === "development") {
    console.warn(`[${code}] ${ERROR_DESCRIPTIONS[code]}`, event);
  }

  return event;
}

export function getLegacyVenueMountLog(): readonly LegacyVenueMountEvent[] {
  return mountLog;
}

export function countActiveLegacyProductionMounts(): number {
  return mountLog.length;
}

/** Map legacy component families to error codes for guard hook */
export function legacyCodeForComponent(componentId: string): LegacyVenueErrorCode {
  const id = componentId.toLowerCase();
  if (id.includes("light") || id.includes("lighting")) return "LEGACY-VENUE-001";
  if (id.includes("curtain") || id.includes("stage-control") || id.includes("stage_control")) {
    return "LEGACY-VENUE-002";
  }
  if (id.includes("mood") || id.includes("scene")) return "LEGACY-VENUE-003";
  return "LEGACY-VENUE-004";
}
