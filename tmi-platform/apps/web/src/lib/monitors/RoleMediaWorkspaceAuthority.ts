/**
 * RoleMediaWorkspaceAuthority — role → monitor instance count (16:9 portals).
 *
 * Same canonical player; role decides instance count.
 * Fan / Performer / Writer / Admin: 2 × 16:9
 * Advertiser / Sponsor / Band-business / Promoter / Venue: 1 × 16:9
 *
 * Detach remains elastic; Voltron may compose inside the allowed portal count.
 * Does not remount WebRTC or duplicate audio — layout fabric owns that.
 */

export type MediaWorkspaceRole =
  | "FAN"
  | "PERFORMER"
  | "WRITER"
  | "INTERVIEWER"
  | "ADMIN"
  | "OBSERVATORY"
  | "ADVERTISER"
  | "SPONSOR"
  | "BAND"
  | "GROUP"
  | "PROMOTER"
  | "VENUE"
  | "GUEST";

export type RoleMonitorEntitlement = {
  role: MediaWorkspaceRole;
  /** Canonical 16:9 physical monitor instances in the media workspace. */
  monitorInstanceCount: 1 | 2;
  aspectRatio: "16:9";
  /** Writer Interview Studio: Monitor1 self/camera, Monitor2 guest/reference. */
  writerInterviewDualPortal: boolean;
  /** Business roles get one powerful portal + larger business workspace. */
  businessSinglePortal: boolean;
  /** Detach may still Voltron-compose up to this many logical feeds in ONE window. */
  maxVoltronFeedsInPortal: number;
};

const DUAL: Pick<
  RoleMonitorEntitlement,
  "monitorInstanceCount" | "writerInterviewDualPortal" | "businessSinglePortal" | "maxVoltronFeedsInPortal"
> = {
  monitorInstanceCount: 2,
  writerInterviewDualPortal: false,
  businessSinglePortal: false,
  maxVoltronFeedsInPortal: 8,
};

const SINGLE_BUSINESS: Pick<
  RoleMonitorEntitlement,
  "monitorInstanceCount" | "writerInterviewDualPortal" | "businessSinglePortal" | "maxVoltronFeedsInPortal"
> = {
  monitorInstanceCount: 1,
  writerInterviewDualPortal: false,
  businessSinglePortal: true,
  maxVoltronFeedsInPortal: 8,
};

function normalizeRole(role: string): MediaWorkspaceRole {
  const key = String(role ?? "FAN").trim().toUpperCase();
  if (key === "INTERVIEWER") return "INTERVIEWER";
  if (key === "OBSERVATORY" || key === "OVERSEER") return "OBSERVATORY";
  if (key === "GROUP" || key === "BAND_GROUP") return "BAND";
  const known: MediaWorkspaceRole[] = [
    "FAN",
    "PERFORMER",
    "WRITER",
    "INTERVIEWER",
    "ADMIN",
    "OBSERVATORY",
    "ADVERTISER",
    "SPONSOR",
    "BAND",
    "GROUP",
    "PROMOTER",
    "VENUE",
    "GUEST",
  ];
  if ((known as string[]).includes(key)) return key as MediaWorkspaceRole;
  return "FAN";
}

/**
 * Resolve monitor instance entitlement for a role.
 * Membership tier never changes this count — only role authority does.
 */
export function resolveRoleMediaWorkspace(role: string): RoleMonitorEntitlement {
  const r = normalizeRole(role);
  switch (r) {
    case "WRITER":
    case "INTERVIEWER":
      return {
        role: r,
        aspectRatio: "16:9",
        ...DUAL,
        writerInterviewDualPortal: true,
      };
    case "FAN":
    case "PERFORMER":
    case "ADMIN":
    case "OBSERVATORY":
      return { role: r, aspectRatio: "16:9", ...DUAL };
    case "ADVERTISER":
    case "SPONSOR":
    case "BAND":
    case "GROUP":
    case "PROMOTER":
    case "VENUE":
      return { role: r, aspectRatio: "16:9", ...SINGLE_BUSINESS };
    case "GUEST":
    default:
      return { role: "GUEST", aspectRatio: "16:9", ...DUAL };
  }
}

/** Helper for CanonicalDualMonitorStack.minMonitorCount */
export function resolveMinMonitorCount(role: string): 1 | 2 {
  return resolveRoleMediaWorkspace(role).monitorInstanceCount;
}
