/**
 * TmiReleaseMigrationAuthority.ts
 *
 * TMI — AUTOMATIC RELEASE MIGRATION / GAME-STYLE UPDATE LAW
 * The Musician's Index | BerntoutGlobal LLC
 *
 * The permanent TMI rule is:
 * "A RETURNING USER MUST AUTOMATICALLY CONVERGE TO THE CURRENT TMI RELEASE."
 * "No TMI customer should ever need instructions to clear their browser cache to receive the current supported TMI experience."
 *
 * Target experience:
 * USER OPENS TMI
 * → lightweight release/version check
 * → compare CLIENT RELEASE with SERVER RELEASE
 *
 * IF CURRENT:
 * → continue normally
 *
 * IF OBSOLETE:
 * → protect any critical active operation (live broadcast, WebRTC, checkout, scan, active typing)
 * → retire obsolete TMI application caches (tmi-shell-*, old SW caches)
 * → migrate/remove ONLY incompatible versioned UI/client state
 * → activate current application shell
 * → reload exactly once
 * → if release policy requires reauthentication:
 *      expire/invalidate the appropriate TMI web session through the canonical auth authority
 *      → show LOGIN
 *      → successful login
 *      → CURRENT UI
 * → otherwise restore current session into CURRENT UI
 *
 * NO MANUAL CACHE CLEARING.
 */

export interface TmiReleaseManifest {
  /** Canonical release tag (e.g. "R42") */
  releaseId: string;
  /** Floor release supported without mandatory migration (e.g. "R42") */
  minimumSupportedClientRelease: string;
  /** Active UI layout schema version */
  uiSchemaVersion: number;
  /** Active CacheStorage schema version (maps to tmi-shell-v6) */
  cacheSchemaVersion: number;
  /**
   * Policy flag: when true, designated major release invalidates the web session
   * via canonicalLogout and prompts sign-in directly into the new UI.
   * Configurable per release; NOT permanently forced true for every minor deployment.
   */
  requiresReauthentication: boolean;
  /** ISO publication timestamp */
  publishedAt: string;
  /** Notes / release scope */
  notes?: string;
}

/**
 * CANONICAL SERVER RELEASE MANIFEST
 * Default baseline for current major mobile UI transition.
 */
export const CANONICAL_RELEASE_MANIFEST: TmiReleaseManifest = {
  releaseId: process.env.NEXT_PUBLIC_TMI_RELEASE_ID ?? "R42",
  minimumSupportedClientRelease: process.env.NEXT_PUBLIC_TMI_MIN_CLIENT_RELEASE ?? "R42",
  uiSchemaVersion: 2,
  cacheSchemaVersion: 6,
  requiresReauthentication: process.env.NEXT_PUBLIC_TMI_REQUIRE_REAUTH !== "false",
  publishedAt: "2026-09-20T18:00:00.000Z",
  notes: "TMI Major Mobile UI Overhaul & Physical Release Convergence",
};

/** Parse release tag number (e.g. 'R42' -> 42, 'R37' -> 37, 'v6' -> 6) */
export function parseReleaseNumber(tag: string | null | undefined): number {
  if (!tag) return 0;
  const match = tag.match(/\d+/);
  return match ? parseInt(match[0], 10) : 0;
}

/**
 * Compare two release tags.
 * Returns:
 *   < 0 if a is older than b
 *   = 0 if a equals b
 *   > 0 if a is newer than b
 */
export function compareReleases(a: string | null | undefined, b: string | null | undefined): number {
  const numA = parseReleaseNumber(a);
  const numB = parseReleaseNumber(b);
  if (numA !== numB) return numA - numB;
  return String(a ?? "").localeCompare(String(b ?? ""));
}

/**
 * Evaluates whether a client release satisfies the minimum supported server release.
 */
export function isReleaseSupported(
  clientRelease: string | null | undefined,
  manifest: TmiReleaseManifest = CANONICAL_RELEASE_MANIFEST,
): boolean {
  if (!clientRelease || clientRelease === "unknown") return false;
  return compareReleases(clientRelease, manifest.minimumSupportedClientRelease) >= 0;
}

/**
 * Critical session protection:
 * Never abruptly force an update/re-login in the middle of:
 * - Go Live / WebRTC performance
 * - Payment / checkout
 * - Ticket scanning
 * - Active text composition / message typing
 */
export function isSafeToPerformMigration(): boolean {
  if (typeof document === "undefined") return false;

  // 1. Check for active WebRTC / live performance
  const isLive =
    document.querySelector('[data-tmi-live-stream-active="true"]') !== null ||
    document.querySelector('[data-stage-deck="work"]') !== null ||
    document.querySelector('[data-webrtc-call-active="true"]') !== null;
  if (isLive) return false;

  // 2. Check for active payment / checkout modal
  const isCheckout =
    document.querySelector('[data-stripe-checkout-active="true"]') !== null ||
    document.querySelector('[data-checkout-modal="open"]') !== null;
  if (isCheckout) return false;

  // 3. Check for active ticket scanning
  const isScanner = document.querySelector('[data-ticket-scanner-active="true"]') !== null;
  if (isScanner) return false;

  // 4. Check for active text composition with content
  const activeEl = document.activeElement;
  if (activeEl instanceof HTMLTextAreaElement || activeEl instanceof HTMLInputElement) {
    if (activeEl.value && activeEl.value.trim().length > 3) {
      return false;
    }
  }

  return true;
}

/**
 * Retires ONLY obsolete TMI application caches:
 * - Obsolete CacheStorage entries (tmi-shell-* that don't match currentCacheSchemaVersion)
 * - Incompatible persisted layout/drawer schemas from localStorage
 * Strictly preserves:
 * - Profile data, purchases, entitlements, messages, creator content, wallet/account data
 */
export async function retireObsoleteTmiCaches(currentCacheSchemaVersion: number): Promise<number> {
  let purgedCount = 0;

  // 1. CacheStorage retirement
  if (typeof window !== "undefined" && "caches" in window) {
    try {
      const keys = await caches.keys();
      const currentShellName = `tmi-shell-v${currentCacheSchemaVersion}`;
      const legacyKeys = keys.filter(
        (k) => (k.startsWith("tmi-shell-") || k.startsWith("tmi-")) && k !== currentShellName,
      );
      if (legacyKeys.length > 0) {
        await Promise.all(legacyKeys.map((k) => caches.delete(k)));
        purgedCount += legacyKeys.length;
        console.info(`[TmiReleaseMigrationAuthority] Retired ${legacyKeys.length} obsolete CacheStorage entries`);
      }
    } catch {
      // Ignore CacheStorage failure in private browsing modes
    }
  }

  // 2. LocalStorage incompatible UI layout schema cleanup (strictly non-account data)
  if (typeof window !== "undefined" && window.localStorage) {
    try {
      const obsoleteKeys = [
        "tmi_legacy_layout",
        "tmi_nav_collapsed_state",
        "tmi_overseer_drawer_v1",
      ];
      for (const key of obsoleteKeys) {
        window.localStorage.removeItem(key);
      }
    } catch {
      // Ignore quota/access errors
    }
  }

  return purgedCount;
}

export type MigrationResult =
  | { status: "compatible"; releaseId: string }
  | { status: "deferred"; reason: "critical_operation_active" }
  | { status: "already_migrated"; releaseId: string }
  | { status: "reauthenticated"; releaseId: string }
  | { status: "reloaded"; releaseId: string };

/**
 * Executes automatic client release migration if client is obsolete.
 * Persists transition state to guarantee migration occurs precisely ONCE (no reload loops).
 */
export async function executeReleaseMigration(
  serverManifest: TmiReleaseManifest = CANONICAL_RELEASE_MANIFEST,
): Promise<MigrationResult> {
  if (typeof window === "undefined") {
    return { status: "compatible", releaseId: serverManifest.releaseId };
  }

  const clientRelease =
    window.localStorage.getItem("tmi_client_release") ??
    document.body.getAttribute("data-tmi-release") ??
    "R0";

  // If already compatible, do nothing
  if (isReleaseSupported(clientRelease, serverManifest)) {
    return { status: "compatible", releaseId: clientRelease };
  }

  // Reload loop guard: verify migration hasn't already executed for this release
  const reloadGuardKey = `tmi_release_migrated_${serverManifest.releaseId}`;
  if (sessionStorage.getItem(reloadGuardKey) === "1") {
    return { status: "already_migrated", releaseId: serverManifest.releaseId };
  }

  // Check critical operation safety
  if (!isSafeToPerformMigration()) {
    console.warn("[TmiReleaseMigrationAuthority] Obsolete client detected but update DEFERRED: critical operation active.");
    try {
      window.localStorage.setItem("tmi_update_pending", serverManifest.releaseId);
    } catch {}
    return { status: "deferred", reason: "critical_operation_active" };
  }

  // Set transition token to prevent reload loops
  try {
    sessionStorage.setItem(reloadGuardKey, "1");
  } catch {}

  console.info(`[TmiReleaseMigrationAuthority] Obsolete release (${clientRelease} < ${serverManifest.minimumSupportedClientRelease}). Converging to ${serverManifest.releaseId}...`);

  // 1. Retire obsolete caches
  await retireObsoleteTmiCaches(serverManifest.cacheSchemaVersion);

  // 2. Stamp new release in client storage
  try {
    window.localStorage.setItem("tmi_client_release", serverManifest.releaseId);
    window.localStorage.setItem("tmi_last_migrated_release", serverManifest.releaseId);
    window.localStorage.setItem("tmi_ui_schema_version", String(serverManifest.uiSchemaVersion));
    window.localStorage.setItem("tmi_cache_schema_version", String(serverManifest.cacheSchemaVersion));
    window.localStorage.removeItem("tmi_update_pending");
  } catch {}

  // 3. Handle reauthentication vs safe refresh
  if (serverManifest.requiresReauthentication) {
    console.info("[TmiReleaseMigrationAuthority] Major release policy requires reauthentication. Invalidating session via canonical auth authority...");
    const { canonicalLogout } = await import("@/lib/auth/canonicalLogout");
    await canonicalLogout(`/auth?reason=release_upgrade&updated=1&release=${encodeURIComponent(serverManifest.releaseId)}`);
    return { status: "reauthenticated", releaseId: serverManifest.releaseId };
  } else {
    console.info("[TmiReleaseMigrationAuthority] Minor release convergence. Performing single safe reload...");
    window.location.reload();
    return { status: "reloaded", releaseId: serverManifest.releaseId };
  }
}
