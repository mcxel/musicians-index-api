/**
 * YoPho canvas route guards — prevents fan ↔ performer redirect ping-pong.
 * Canonical YoPho: Universal Workspace on hub (?drawer=yopho). Legacy /fan|performer/canvas
 * redirect once via middleware + page.tsx (never client cross-hop).
 */

export type YoPhoCanvasSurface = "fan_portrait" | "performer_living";

const PERFORMER_LIVING_ROLES = new Set(["PERFORMER", "BAND", "ARTIST"]);

/** Prisma/session aliases that use the Fan portrait canvas (Rule 26). */
const FAN_PORTRAIT_ALIASES = new Set(["FAN", "USER", "MEMBER"]);

export function normalizeSessionRole(role: string | undefined | null): string {
  return (role ?? "USER").trim().toUpperCase();
}

/** Role used for YoPho surface routing (aliases collapsed). */
export function normalizeYoPhoCanvasRole(role: string | undefined | null): string {
  const r = normalizeSessionRole(role);
  if (FAN_PORTRAIT_ALIASES.has(r)) return "FAN";
  if (r === "ARTIST") return "PERFORMER";
  return r;
}

export function yoPhoSurfaceForRole(role: string): YoPhoCanvasSurface | null {
  const r = normalizeYoPhoCanvasRole(role);
  if (r === "FAN") return "fan_portrait";
  if (PERFORMER_LIVING_ROLES.has(r) || r === "PERFORMER") return "performer_living";
  return null;
}

/** All YoPho entry points resolve to in-hub workspace (never full-page canvas hop). */
export function yoPhoCanvasPathForRole(role: string): string {
  return yoPhoHubDeepLink(role);
}

/** In-hub YoPho (drawer + universal workspace) — no full-page canvas hop. */
export function yoPhoHubDeepLink(role: string): string {
  const r = normalizeYoPhoCanvasRole(role);
  if (PERFORMER_LIVING_ROLES.has(r) || r === "PERFORMER") {
    return "/hub/performer?drawer=yopho";
  }
  return "/hub/fan?drawer=yopho";
}

export type YoPhoCanvasRoute = "/fan/canvas" | "/performer/canvas";

/** Full-page canvas is retired — never client redirect from gate. */
export function yoPhoCanvasRedirectTarget(
  _currentPath: YoPhoCanvasRoute,
  _role: string,
): string | null {
  return null;
}

export function canAccessFanPortraitCanvas(role: string): boolean {
  const r = normalizeSessionRole(role);
  if (FAN_PORTRAIT_ALIASES.has(r)) return true;
  if (r === "ADMIN" || r === "STAFF") return true;
  return false;
}

export function canAccessPerformerLivingCanvas(role: string): boolean {
  return PERFORMER_LIVING_ROLES.has(normalizeYoPhoCanvasRole(role));
}

const SESSION_GUARD_PREFIX = "tmi_yopho_canvas_guard:";

/** Prevents A→B→A replace loops within a tab session. */
export function shouldApplyYoPhoCanvasRedirect(from: YoPhoCanvasRoute, to: string): boolean {
  if (typeof window === "undefined") return true;
  const key = `${SESSION_GUARD_PREFIX}${from}`;
  const prev = sessionStorage.getItem(key);
  if (prev === to) return false;
  sessionStorage.setItem(key, to);
  return true;
}

export function clearYoPhoCanvasRedirectGuard(from: YoPhoCanvasRoute): void {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(`${SESSION_GUARD_PREFIX}${from}`);
}
