import type { TMIRole } from "@/types/roles";
import type { SpecialAuthorityRole } from "@/lib/auth/RoleAuthorityMatrix";

export type RealityState = "real" | "loading" | "empty" | "error";

export interface UtilityAuditItem {
  id: string;
  kind: "button" | "panel" | "widget" | "card" | "face" | "profile-section" | "rail" | "ranking" | "dashboard-item";
  owner: TMIRole | SpecialAuthorityRole | "shared";
  route?: string;
  actionId?: string;
  dataSource?: string;
  state: RealityState;
}

export const BUILD_DIRECTOR_UTILITY_RULE = {
  name: "Utility Over Decoration",
  requirements: [
    "If a user cannot use it, it should not be visible.",
    "If a button does nothing, remove it.",
    "If a panel has no purpose, remove it.",
    "If an image is not tied to a real account, remove it or convert it into an official bot account.",
    "If a widget is decorative only, give it a purpose or remove it.",
    "No fake engagement, viewers, rankings, followers, sponsors, performers, venues, statistics, or activity.",
  ],
} as const;

export const REALITY_STATES: Readonly<Record<RealityState, string>> = {
  real: "Show real content.",
  loading: "Loading...",
  empty: "Honest empty state with a clear next action.",
  error: "Unable to load content. Retry.",
};

const ALLOWED_FACE_ROLES = new Set<TMIRole | SpecialAuthorityRole>([
  "FAN",
  "PERFORMER",
  "ARTIST",
  "PRODUCER",
  "VENUE",
  "WRITER",
  "PROMOTER",
  "SPONSOR",
  "ADVERTISER",
  "ADMIN",
  "STAFF",
  "EXECUTIVE_AI",
]);

export function isAllowedVisibleFaceRole(role: TMIRole | SpecialAuthorityRole): boolean {
  return ALLOWED_FACE_ROLES.has(role);
}

export function isActionableItem(item: UtilityAuditItem): boolean {
  if (item.state === "loading" || item.state === "error") return true;
  if (item.state === "empty") return Boolean(item.route || item.actionId);
  return Boolean(item.route || item.actionId || item.dataSource);
}

export function validateUtilityItem(item: UtilityAuditItem): { valid: boolean; reason?: string } {
  if (item.kind === "face" && !item.dataSource) {
    return { valid: false, reason: "Faces must be tied to a real account source." };
  }

  if (!isActionableItem(item)) {
    return { valid: false, reason: "Item is decorative with no route/action/data source." };
  }

  return { valid: true };
}

export const UTILITY_AUDIT_QUESTIONS = [
  "What does it do?",
  "Where does it route?",
  "Who owns it?",
  "Is it real?",
  "What happens if clicked?",
  "What happens if empty?",
] as const;
