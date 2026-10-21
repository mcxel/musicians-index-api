/**
 * Hub viewport authority.
 * UNKNOWN is the server and hydration snapshot only.
 * The client snapshot is DESKTOP or MOBILE from the layout viewport.
 * Neither branch is mounted while the state is UNKNOWN.
 */

export type HubViewportState = "unknown" | "desktop" | "mobile";

export const HUB_VIEWPORT_NARROW_MAX_PX = 900;

export function resolveHubViewportState(matchesNarrow: boolean | null): HubViewportState {
  if (matchesNarrow == null) return "unknown";
  return matchesNarrow ? "mobile" : "desktop";
}

export function readHubViewport(): HubViewportState {
  return resolveHubViewportState(window.matchMedia(`(max-width: ${HUB_VIEWPORT_NARROW_MAX_PX}px)`).matches);
}

export function serverHubViewport(): HubViewportState {
  return "unknown";
}

export function subscribeHubViewport(onChange: () => void): () => void {
  const mql = window.matchMedia(`(max-width: ${HUB_VIEWPORT_NARROW_MAX_PX}px)`);
  const observer = new ResizeObserver(onChange);
  mql.addEventListener("change", onChange);
  window.addEventListener("resize", onChange);
  observer.observe(document.documentElement);
  return () => {
    mql.removeEventListener("change", onChange);
    window.removeEventListener("resize", onChange);
    observer.disconnect();
  };
}
