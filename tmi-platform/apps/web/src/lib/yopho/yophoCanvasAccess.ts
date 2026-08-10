/**
 * YoPho canvas route guards — prevents fan ↔ performer redirect ping-pong.
 */

export type YoPhoCanvasSurface = "fan_portrait" | "performer_living";

const PERFORMER_LIVING_ROLES = new Set(["PERFORMER", "BAND", "ARTIST"]);

export function normalizeSessionRole(role: string | undefined | null): string {
  return (role ?? "USER").trim().toUpperCase();
}

export function yoPhoSurfaceForRole(role: string): YoPhoCanvasSurface | null {
  const r = normalizeSessionRole(role);
  if (r === "FAN") return "fan_portrait";
  if (PERFORMER_LIVING_ROLES.has(r)) return "performer_living";
  return null;
}

export function yoPhoCanvasPathForRole(role: string): string | null {
  const surface = yoPhoSurfaceForRole(role);
  if (surface === "fan_portrait") return "/fan/canvas";
  if (surface === "performer_living") return "/performer/canvas";
  return null;
}

export function canAccessFanPortraitCanvas(role: string): boolean {
  return normalizeSessionRole(role) === "FAN";
}

export function canAccessPerformerLivingCanvas(role: string): boolean {
  return PERFORMER_LIVING_ROLES.has(normalizeSessionRole(role));
}
