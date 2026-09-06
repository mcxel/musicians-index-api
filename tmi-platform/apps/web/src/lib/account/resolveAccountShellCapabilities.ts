/**
 * resolveAccountShellCapabilities
 *
 * Pure UI-capability projection for the Universal Account dropdown.
 * Does NOT re-implement role-switch or companion authorization — those stay
 * in resolveRoleSwitchAuthorization / resolveCompanionProvisioningDecision
 * and are enforced server-side. This helper only answers "what should the
 * shell show based on ownedRoles already returned by the identity API?"
 */

export interface AccountShellCapabilities {
  /** Show Fan↔Performer switch controls (both roles genuinely owned). */
  canSwitchFanPerformer: boolean;
  /** Missing companion profile to offer, if any. */
  companionOfferTarget: "FAN" | "PERFORMER" | null;
  /** Normalized active mode label for display (never a second fabricated name). */
  activeModeLabel: "FAN" | "PERFORMER" | "ADMIN" | string;
  /** True if the user holds admin/staff authority. */
  isAdmin: boolean;
}

export function resolveAccountShellCapabilities(input: {
  ownedRoles: string[];
  activeRole: string;
}): AccountShellCapabilities {
  const owned = new Set(input.ownedRoles.map((r) => r.toUpperCase()));
  const hasFan = owned.has("FAN") || owned.has("MEMBER") || owned.has("USER");
  const hasPerformer =
    owned.has("PERFORMER") || owned.has("ARTIST") || owned.has("BAND");
  const active = input.activeRole.toUpperCase();
  const isAdmin =
    owned.has("ADMIN") ||
    owned.has("STAFF") ||
    owned.has("SUPERADMIN") ||
    active === "ADMIN" ||
    active === "STAFF" ||
    active === "SUPERADMIN";

  let activeModeLabel: string = active;
  if (active === "FAN" || active === "MEMBER" || active === "USER") {
    activeModeLabel = "FAN";
  } else if (active === "PERFORMER" || active === "ARTIST" || active === "BAND") {
    activeModeLabel = "PERFORMER";
  } else if (active === "ADMIN" || active === "STAFF" || active === "SUPERADMIN") {
    activeModeLabel = "ADMIN";
  }

  let companionOfferTarget: "FAN" | "PERFORMER" | null = null;
  if (hasFan && !hasPerformer) companionOfferTarget = "PERFORMER";
  else if (hasPerformer && !hasFan) companionOfferTarget = "FAN";

  return {
    canSwitchFanPerformer: hasFan && hasPerformer,
    companionOfferTarget,
    activeModeLabel,
    isAdmin,
  };
}

/** Canonical account hub destination resolver (ACCOUNT-ROUTE-01). */
export function resolveAccountHubDestination(role: string): string {
  const r = (role ?? "").toUpperCase();
  if (r === "PERFORMER" || r === "ARTIST" || r === "BAND" || r === "PRODUCER") return "/hub/performer";
  if (r === "ADMIN" || r === "STAFF" || r === "SUPERADMIN") return "/admin";
  return "/hub/fan";
}

/** Required dropdown destinations for HEADER certification (real routes only). */
export const UNIVERSAL_ACCOUNT_MENU_ITEMS = [
  { id: "active-profile", label: "Active Profile" },
  { id: "switch-role", label: "Fan↔Performer switch" },
  { id: "add-companion", label: "Add companion" },
  { id: "view-profile", label: "View Profile", href: "self-public" },
  { id: "notifications", label: "Notifications", href: "/notifications" },
  { id: "settings-privacy", label: "Settings & Privacy", href: "/settings?section=privacy" },
  { id: "subscription-billing", label: "Subscription & Billing", href: "/settings/billing" },
  { id: "help-support", label: "Help & Support", href: "/help" },
  { id: "logout", label: "Logout" },
] as const;
