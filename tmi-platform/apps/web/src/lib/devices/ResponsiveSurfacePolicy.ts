/**
 * ResponsiveSurfacePolicy
 * Governs what layout mode, feature set, and content density each device
 * surface receives. Teen safety restrictions are preserved across all surfaces.
 */

import type { DeviceClass } from "./DeviceCapabilityRegistry";
import type { SessionRole, TeenRestrictions } from "./DeviceSessionBridge";

// ─── Layout Modes ─────────────────────────────────────────────────────────────

export type LayoutMode =
  | "mobile-portrait"
  | "mobile-landscape"
  | "tablet-portrait"
  | "tablet-landscape"
  | "desktop-standard"
  | "desktop-wide"
  | "tv-lean-back"
  | "venue-display"
  | "kiosk-fullscreen"
  | "webview-embedded"
  | "controller-overlay";

// ─── Content Density ─────────────────────────────────────────────────────────

export type ContentDensity = "minimal" | "compact" | "standard" | "rich";

// ─── Navigation Mode ─────────────────────────────────────────────────────────

export type NavigationMode =
  | "bottom-tab"
  | "side-rail"
  | "side-drawer"
  | "top-bar"
  | "dpad-focus"
  | "remote-focus"
  | "hidden";

// ─── Surface Policy ───────────────────────────────────────────────────────────

export interface SurfacePolicy {
  deviceClass: DeviceClass;
  layoutMode: LayoutMode;
  navigationMode: NavigationMode;
  contentDensity: ContentDensity;
  /** Font scale multiplier (1.0 = base) */
  fontScale: number;
  /** Whether to show the magazine shell chrome */
  showMagazineChrome: boolean;
  /** Whether to show the HUD overlay */
  showHUD: boolean;
  /** Whether to show reaction overlays */
  showReactions: boolean;
  /** Whether chat UI is rendered */
  showChat: boolean;
  /** Whether to use reduced-motion animations */
  reducedMotion: boolean;
  /** Whether this surface shows the main nav */
  showMainNav: boolean;
  /** Max columns in grid layouts */
  maxGridColumns: number;
  /** Whether QR pairing UI is shown */
  showQRPairing: boolean;
}

const SURFACE_POLICIES: Record<DeviceClass, SurfacePolicy> = {
  "phone": {
    deviceClass: "phone",
    layoutMode: "mobile-portrait",
    navigationMode: "bottom-tab",
    contentDensity: "compact",
    fontScale: 1.0,
    showMagazineChrome: false,
    showHUD: true,
    showReactions: true,
    showChat: true,
    reducedMotion: false,
    showMainNav: true,
    maxGridColumns: 2,
    showQRPairing: true,
  },
  "tablet": {
    deviceClass: "tablet",
    layoutMode: "tablet-portrait",
    navigationMode: "side-rail",
    contentDensity: "standard",
    fontScale: 1.05,
    showMagazineChrome: true,
    showHUD: true,
    showReactions: true,
    showChat: true,
    reducedMotion: false,
    showMainNav: true,
    maxGridColumns: 3,
    showQRPairing: true,
  },
  "desktop": {
    deviceClass: "desktop",
    layoutMode: "desktop-standard",
    navigationMode: "top-bar",
    contentDensity: "rich",
    fontScale: 1.0,
    showMagazineChrome: true,
    showHUD: true,
    showReactions: true,
    showChat: true,
    reducedMotion: false,
    showMainNav: true,
    maxGridColumns: 4,
    showQRPairing: true,
  },
  "smart-tv": {
    deviceClass: "smart-tv",
    layoutMode: "tv-lean-back",
    navigationMode: "dpad-focus",
    contentDensity: "minimal",
    fontScale: 1.6,
    showMagazineChrome: false,
    showHUD: false,
    showReactions: false,
    showChat: true,
    reducedMotion: true,
    showMainNav: false,
    maxGridColumns: 4,
    showQRPairing: false,
  },
  "venue-screen": {
    deviceClass: "venue-screen",
    layoutMode: "venue-display",
    navigationMode: "hidden",
    contentDensity: "minimal",
    fontScale: 2.0,
    showMagazineChrome: false,
    showHUD: false,
    showReactions: true,
    showChat: false,
    reducedMotion: false,
    showMainNav: false,
    maxGridColumns: 1,
    showQRPairing: false,
  },
  "kiosk": {
    deviceClass: "kiosk",
    layoutMode: "kiosk-fullscreen",
    navigationMode: "hidden",
    contentDensity: "standard",
    fontScale: 1.3,
    showMagazineChrome: false,
    showHUD: false,
    showReactions: false,
    showChat: false,
    reducedMotion: true,
    showMainNav: false,
    maxGridColumns: 2,
    showQRPairing: true,
  },
  "controller": {
    deviceClass: "controller",
    layoutMode: "controller-overlay",
    navigationMode: "dpad-focus",
    contentDensity: "minimal",
    fontScale: 1.0,
    showMagazineChrome: false,
    showHUD: true,
    showReactions: false,
    showChat: false,
    reducedMotion: true,
    showMainNav: false,
    maxGridColumns: 1,
    showQRPairing: false,
  },
  "remote": {
    deviceClass: "remote",
    layoutMode: "tv-lean-back",
    navigationMode: "remote-focus",
    contentDensity: "minimal",
    fontScale: 1.4,
    showMagazineChrome: false,
    showHUD: false,
    showReactions: false,
    showChat: false,
    reducedMotion: true,
    showMainNav: false,
    maxGridColumns: 1,
    showQRPairing: false,
  },
  "webview": {
    deviceClass: "webview",
    layoutMode: "webview-embedded",
    navigationMode: "hidden",
    contentDensity: "compact",
    fontScale: 1.0,
    showMagazineChrome: false,
    showHUD: false,
    showReactions: false,
    showChat: true,
    reducedMotion: false,
    showMainNav: false,
    maxGridColumns: 2,
    showQRPairing: false,
  },
  "mobile-app": {
    deviceClass: "mobile-app",
    layoutMode: "mobile-portrait",
    navigationMode: "bottom-tab",
    contentDensity: "compact",
    fontScale: 1.0,
    showMagazineChrome: false,
    showHUD: true,
    showReactions: true,
    showChat: true,
    reducedMotion: false,
    showMainNav: true,
    maxGridColumns: 2,
    showQRPairing: true,
  },
  "desktop-app": {
    deviceClass: "desktop-app",
    layoutMode: "desktop-standard",
    navigationMode: "side-rail",
    contentDensity: "rich",
    fontScale: 1.0,
    showMagazineChrome: true,
    showHUD: true,
    showReactions: true,
    showChat: true,
    reducedMotion: false,
    showMainNav: true,
    maxGridColumns: 4,
    showQRPairing: true,
  },
};

// ─── Teen Override ────────────────────────────────────────────────────────────

export interface AppliedSurfacePolicy extends SurfacePolicy {
  /** Overrides applied due to teen restrictions */
  teenOverrides: Partial<SurfacePolicy>;
  /** Overrides applied due to role */
  roleOverrides: Partial<SurfacePolicy>;
}

function applyTeenOverrides(
  policy: SurfacePolicy,
  restrictions: TeenRestrictions,
): Partial<SurfacePolicy> {
  if (!restrictions.active) return {};
  const overrides: Partial<SurfacePolicy> = {};
  if (restrictions.blockVideoRooms) overrides.showHUD = false;
  if (restrictions.blockVoiceRooms && restrictions.blockVideoRooms) overrides.showReactions = false;
  return overrides;
}

function applyRoleOverrides(
  _policy: SurfacePolicy,
  role: SessionRole,
): Partial<SurfacePolicy> {
  if (role === "guest") {
    return { showChat: false, showHUD: false, showReactions: false };
  }
  return {};
}

// ─── Policy Engine ────────────────────────────────────────────────────────────

export class ResponsiveSurfacePolicy {
  private static _instance: ResponsiveSurfacePolicy | null = null;

  static getInstance(): ResponsiveSurfacePolicy {
    if (!ResponsiveSurfacePolicy._instance) {
      ResponsiveSurfacePolicy._instance = new ResponsiveSurfacePolicy();
    }
    return ResponsiveSurfacePolicy._instance;
  }

  getBasePolicy(deviceClass: DeviceClass): SurfacePolicy {
    return SURFACE_POLICIES[deviceClass];
  }

  resolvePolicy(
    deviceClass: DeviceClass,
    role: SessionRole,
    teenRestrictions: TeenRestrictions,
    preferReducedMotion = false,
  ): AppliedSurfacePolicy {
    const base = { ...SURFACE_POLICIES[deviceClass] };
    const teenOverrides = applyTeenOverrides(base, teenRestrictions);
    const roleOverrides = applyRoleOverrides(base, role);

    const merged: SurfacePolicy = {
      ...base,
      ...roleOverrides,
      ...teenOverrides,
      reducedMotion: base.reducedMotion || preferReducedMotion,
    };

    return { ...merged, teenOverrides, roleOverrides };
  }

  /**
   * Detects reduced motion preference from the browser environment.
   */
  detectReducedMotion(): boolean {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  /**
   * Returns the layout mode from the current viewport dimensions.
   */
  detectLayoutMode(deviceClass: DeviceClass): LayoutMode {
    if (typeof window === "undefined") return SURFACE_POLICIES[deviceClass].layoutMode;

    const w = window.innerWidth;
    const h = window.innerHeight;
    const isLandscape = w > h;

    switch (deviceClass) {
      case "phone":
      case "mobile-app":
        return isLandscape ? "mobile-landscape" : "mobile-portrait";
      case "tablet":
        return isLandscape ? "tablet-landscape" : "tablet-portrait";
      case "desktop":
      case "desktop-app":
        return w >= 1440 ? "desktop-wide" : "desktop-standard";
      default:
        return SURFACE_POLICIES[deviceClass].layoutMode;
    }
  }
}

export const responsiveSurfacePolicy = ResponsiveSurfacePolicy.getInstance();
