"use client";

/**
 * DiscoverySidePanel — RETIRED (T1 Omni Rolodex).
 *
 * Previously mounted a right-edge vertical "DISCOVERY" floater from root layout.
 * That control obstructed monitors/cameras and violated in-place Command Center
 * navigation. Source unmounted from `app/layout.tsx` — do not remount.
 * Lobby / Live Now / Discover open via CanonicalBottomDrawerHost (`lobby` /
 * `live-destinations` workspaces).
 *
 * Kept as a no-op export so any stale dynamic import fails closed.
 */
export default function DiscoverySidePanel() {
  return null;
}
