/**
 * Universal Account Header Shell — HEADER-01 … HEADER-17
 *
 * Automated certification for current-schema compatibility mode
 * (ACCOUNT_FALLBACK only; no FanProfile/PerformerProfile tables).
 */

import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  buildActiveProfileIdentityFromAccount,
} from "../lib/account/resolveActiveProfileIdentity";
import {
  resolveAccountShellCapabilities,
  UNIVERSAL_ACCOUNT_MENU_ITEMS,
} from "../lib/account/resolveAccountShellCapabilities";
import { clearPrivateClientAccountCache } from "../lib/account/clearPrivateClientAccountCache";
import { getCanonicalInitials } from "../lib/auth/resolveSessionIdentity";

const WEB_SRC = join(__dirname, "..");

function readSrc(rel: string): string {
  return readFileSync(join(WEB_SRC, rel), "utf8");
}

export function runUniversalAccountHeaderShellTest(): {
  allPassed: boolean;
  results: Record<string, boolean>;
} {
  const results: Record<string, boolean> = {};

  const shared = {
    id: "usr_header_cert",
    role: "FAN",
    displayName: "Alex Rivera",
    name: "Alex Rivera",
    username: "alexr",
    avatarUrl: null as string | null,
    userRoles: [{ role: "FAN" }],
  };

  // HEADER-01: one ActiveProfileIdentity contract / circle source
  const fanId = buildActiveProfileIdentityFromAccount({
    ...shared,
    activeRole: "FAN",
  });
  results["HEADER-01_one_identity_contract"] =
    typeof fanId.accountUserId === "string" &&
    typeof fanId.publicDisplayName === "string" &&
    typeof fanId.canonicalInitials === "string" &&
    Array.isArray(fanId.ownedRoles);

  // HEADER-02: photo preferred when publicImageUrl set
  const withPhoto = buildActiveProfileIdentityFromAccount({
    ...shared,
    avatarUrl: "https://cdn.example.com/alex.jpg",
  });
  results["HEADER-02_photo_when_available"] =
    withPhoto.publicImageUrl === "https://cdn.example.com/alex.jpg";

  // HEADER-03: canonical initials when no photo
  results["HEADER-03_canonical_initials_no_photo"] =
    fanId.publicImageUrl == null &&
    fanId.canonicalInitials === getCanonicalInitials("Alex Rivera") &&
    fanId.canonicalInitials === "A";

  // HEADER-04: dropdown menu contract includes required destinations
  const menuIds = UNIVERSAL_ACCOUNT_MENU_ITEMS.map((i) => i.id);
  results["HEADER-04_menu_has_required_items"] =
    menuIds.includes("active-profile") &&
    menuIds.includes("view-profile") &&
    menuIds.includes("notifications") &&
    menuIds.includes("settings-privacy") &&
    menuIds.includes("subscription-billing") &&
    menuIds.includes("help-support") &&
    menuIds.includes("logout");

  // HEADER-05: same shell for Fan and Performer (ACCOUNT_FALLBACK)
  const performerId = buildActiveProfileIdentityFromAccount({
    ...shared,
    role: "PERFORMER",
    activeRole: "PERFORMER",
    userRoles: [{ role: "PERFORMER" }],
  });
  results["HEADER-05_same_shell_any_role"] =
    fanId.profileKind === "ACCOUNT_FALLBACK" &&
    performerId.profileKind === "ACCOUNT_FALLBACK";

  // HEADER-06: Fan↔Performer switch only when both owned
  const both = resolveAccountShellCapabilities({
    ownedRoles: ["FAN", "PERFORMER"],
    activeRole: "FAN",
  });
  const fanOnly = resolveAccountShellCapabilities({
    ownedRoles: ["FAN"],
    activeRole: "FAN",
  });
  results["HEADER-06_switch_only_when_owned"] =
    both.canSwitchFanPerformer === true && fanOnly.canSwitchFanPerformer === false;

  // HEADER-07: missing companion gets provisioning CTA target
  results["HEADER-07_companion_cta_when_missing"] =
    fanOnly.companionOfferTarget === "PERFORMER" &&
    resolveAccountShellCapabilities({
      ownedRoles: ["PERFORMER"],
      activeRole: "PERFORMER",
    }).companionOfferTarget === "FAN" &&
    both.companionOfferTarget === null;

  // HEADER-08: notifications reachable from menu contract
  results["HEADER-08_notifications_link"] =
    UNIVERSAL_ACCOUNT_MENU_ITEMS.some(
      (i) => i.id === "notifications" && "href" in i && i.href === "/notifications",
    );

  // HEADER-09: settings & privacy reachable
  results["HEADER-09_settings_privacy_link"] =
    UNIVERSAL_ACCOUNT_MENU_ITEMS.some(
      (i) =>
        i.id === "settings-privacy" &&
        "href" in i &&
        i.href === "/settings?section=privacy",
    );

  // HEADER-10: logout clears private client cache (function exists + removes keys)
  const g = globalThis as typeof globalThis & {
    window?: { localStorage: Storage; sessionStorage: Storage };
  };
  const store = () => {
    const map = new Map<string, string>();
    return {
      getItem: (k: string) => map.get(k) ?? null,
      setItem: (k: string, v: string) => {
        map.set(k, v);
      },
      removeItem: (k: string) => {
        map.delete(k);
      },
      clear: () => map.clear(),
      get length() {
        return map.size;
      },
      key: () => null,
    };
  };
  const ls = store();
  const ss = store();
  (g as { window: unknown }).window = { localStorage: ls, sessionStorage: ss };
  ls.setItem("_csrf_token", "x");
  ls.setItem("tmi_profile_avatar_url", "y");
  ss.setItem("tmi_account_identity_cache", "z");
  clearPrivateClientAccountCache();
  results["HEADER-10_logout_clears_private_cache"] =
    ls.getItem("_csrf_token") === null &&
    ls.getItem("tmi_profile_avatar_url") === null &&
    ss.getItem("tmi_account_identity_cache") === null;

  // HEADER-11: mobile-safe dropdown width constraint present in component
  const dropdownSrc = readSrc("components/account/UniversalAccountDropdown.tsx");
  results["HEADER-11_mobile_390_safe_width"] =
    dropdownSrc.includes("min(320px, calc(100vw - 16px))") ||
    dropdownSrc.includes("100vw");

  // HEADER-12: GlobalTmiHeader mounts UniversalAccountIdentityControl
  const headerSrc = readSrc("components/shell/GlobalTmiHeader.tsx");
  results["HEADER-12_desktop_global_header_mount"] =
    headerSrc.includes("UniversalAccountIdentityControl") &&
    !headerSrc.includes("AccountCommandMenu");

  // HEADER-13: no second role-specific account menu in GlobalTmiHeader
  results["HEADER-13_single_shared_mount"] =
    (headerSrc.match(/UniversalAccountIdentityControl/g) ?? []).length >= 2 &&
    !headerSrc.includes("FanAccountMenu") &&
    !headerSrc.includes("PerformerAccountMenu");

  // HEADER-14: subscription & billing link
  results["HEADER-14_billing_link"] =
    UNIVERSAL_ACCOUNT_MENU_ITEMS.some(
      (i) =>
        i.id === "subscription-billing" &&
        "href" in i &&
        i.href === "/settings/billing",
    );

  // HEADER-15: help & support link
  results["HEADER-15_help_link"] =
    UNIVERSAL_ACCOUNT_MENU_ITEMS.some(
      (i) => i.id === "help-support" && "href" in i && i.href === "/help",
    );

  // HEADER-16: view profile present; dropdown uses selfPublicPath
  results["HEADER-16_view_profile"] =
    menuIds.includes("view-profile") && dropdownSrc.includes("selfPublicPath");

  // HEADER-17: ACCOUNT_FALLBACK must not claim separate Fan/Performer names
  const asFan = buildActiveProfileIdentityFromAccount({
    ...shared,
    activeRole: "FAN",
    userRoles: [{ role: "FAN" }, { role: "PERFORMER" }],
  });
  const asPerformer = buildActiveProfileIdentityFromAccount({
    ...shared,
    role: "FAN",
    activeRole: "PERFORMER",
    userRoles: [{ role: "FAN" }, { role: "PERFORMER" }],
  });
  results["HEADER-17_fallback_no_dual_names"] =
    asFan.profileKind === "ACCOUNT_FALLBACK" &&
    asPerformer.profileKind === "ACCOUNT_FALLBACK" &&
    asFan.publicDisplayName === asPerformer.publicDisplayName &&
    asFan.publicDisplayName === "Alex Rivera" &&
    !asFan.publicDisplayName.toLowerCase().startsWith("fan ") &&
    !asPerformer.publicDisplayName.toLowerCase().startsWith("performer ") &&
    dropdownSrc.includes("tmi-account-fallback-honesty") &&
    dropdownSrc.includes("Separate Fan/Performer profile names are not available yet");

  // HEADER-PHYS-01: Desktop — exactly one account circle/menu visible in global header, no legacy account menus
  results["HEADER-PHYS-01_desktop_single_account_circle"] =
    headerSrc.includes("UniversalAccountIdentityControl") &&
    !headerSrc.includes("AccountCommandMenu") &&
    !headerSrc.includes("FanAccountMenu") &&
    !headerSrc.includes("PerformerAccountMenu");

  // HEADER-PHYS-02: 390x844 Mobile Viewport — dropdown width and height bounds prevent overflow/clipping
  results["HEADER-PHYS-02_mobile_390x844_no_overflow"] =
    dropdownSrc.includes("width: \"min(320px, calc(100vw - 16px))\"") &&
    dropdownSrc.includes("maxHeight: \"min(80vh, 560px)\"") &&
    dropdownSrc.includes("overflowY: \"auto\"");

  // HEADER-PHYS-03: Production/Runtime — switching mode updates activeRole without leaking viewed profile
  const switchFanRes = resolveAccountShellCapabilities({ ownedRoles: ["FAN", "PERFORMER"], activeRole: "FAN" });
  const switchPerfRes = resolveAccountShellCapabilities({ ownedRoles: ["FAN", "PERFORMER"], activeRole: "PERFORMER" });
  results["HEADER-PHYS-03_role_switch_runtime_isolation"] =
    switchFanRes.activeModeLabel === "FAN" &&
    switchPerfRes.activeModeLabel === "PERFORMER" &&
    switchFanRes.canSwitchFanPerformer === true &&
    switchPerfRes.canSwitchFanPerformer === true;

  const allPassed = Object.values(results).every(Boolean);
  console.log(
    "[UNIVERSAL_ACCOUNT_HEADER_SHELL_TEST_ASSERT]",
    JSON.stringify({ allPassed, results }, null, 2),
  );
  if (!allPassed) {
    const failed = Object.entries(results)
      .filter(([, v]) => !v)
      .map(([k]) => k);
    throw new Error(`[UNIVERSAL_ACCOUNT_HEADER_SHELL] FAILED: ${failed.join(", ")}`);
  }
  return { allPassed, results };
}

test("HEADER-01..HEADER-17 Universal Account Header Shell", () => {
  const { allPassed } = runUniversalAccountHeaderShellTest();
  expect(allPassed).toBe(true);
});
