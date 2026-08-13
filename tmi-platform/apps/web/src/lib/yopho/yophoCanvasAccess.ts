/**

 * YoPho canvas route guards — stable full-page studio on /fan/canvas and /performer/canvas.

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



/** Canonical full-page canvas URL for the user's YoPho role. */

export function yoPhoCanvasPathForRole(role: string): string {

  const r = normalizeYoPhoCanvasRole(role);

  if (PERFORMER_LIVING_ROLES.has(r) || r === "PERFORMER") {

    return "/performer/canvas";

  }

  return "/fan/canvas";

}



/** In-hub YoPho (drawer + universal workspace) — optional; canvas URL stays full studio. */

export function yoPhoHubDeepLink(role: string): string {

  const r = normalizeYoPhoCanvasRole(role);

  if (PERFORMER_LIVING_ROLES.has(r) || r === "PERFORMER") {

    return "/hub/performer?drawer=yopho";

  }

  return "/hub/fan?drawer=yopho";

}



export type YoPhoCanvasRoute = "/fan/canvas" | "/performer/canvas";



/** Full-page canvas routes never client-hop; stay mounted on this URL. */

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

  const r = normalizeYoPhoCanvasRole(role);

  if (PERFORMER_LIVING_ROLES.has(r) || r === "PERFORMER") return true;

  if (r === "ADMIN" || r === "STAFF") return true;

  return false;

}



const SESSION_GUARD_PREFIX = "tmi_yopho_canvas_guard:";



/** Legacy — kept for sessionStorage cleanup; redirects are disabled. */

export function shouldApplyYoPhoCanvasRedirect(from: YoPhoCanvasRoute, to: string): boolean {

  if (typeof window === "undefined") return false;

  const key = `${SESSION_GUARD_PREFIX}${from}`;

  const prev = sessionStorage.getItem(key);

  if (prev === to) return false;

  sessionStorage.setItem(key, to);

  return false;

}



export function clearYoPhoCanvasRedirectGuard(from: YoPhoCanvasRoute): void {

  if (typeof window === "undefined") return;

  sessionStorage.removeItem(`${SESSION_GUARD_PREFIX}${from}`);

}

