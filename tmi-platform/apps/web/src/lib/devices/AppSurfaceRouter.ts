/**
 * AppSurfaceRouter
 * Shared route manifest: maps the 754-route web app to every device surface.
 * Generates deep links, QR payloads, and per-surface route availability.
 * Does NOT modify route architecture — read-only mapping layer.
 */

import type { DeviceClass, SurfaceCapability } from "./DeviceCapabilityRegistry";
import type { SessionRole } from "./DeviceSessionBridge";

// ─── Route Categories ─────────────────────────────────────────────────────────

export type RouteCategory =
  | "home"
  | "lobby"
  | "show"
  | "avatar"
  | "profile"
  | "events"
  | "tickets"
  | "venue"
  | "artist"
  | "beats"
  | "battles"
  | "admin"
  | "auth"
  | "magazine"
  | "rooms"
  | "live"
  | "games"
  | "economy"
  | "notifications"
  | "safety"
  | "public";

// ─── Route Manifest Entry ────────────────────────────────────────────────────

export interface RouteManifestEntry {
  /** Canonical path as used in apps/web/src/app */
  path: string;
  category: RouteCategory;
  /** Minimum roles that can access this route */
  allowedRoles: SessionRole[];
  /** Which device surfaces can render this route */
  allowedDevices: DeviceClass[];
  /** Surface capabilities required to render this route usefully */
  requiredCapabilities: SurfaceCapability[];
  /** Whether this route is linkable via QR or deep link */
  deepLinkable: boolean;
  /** Whether minors can access (false = hard-block at surface router) */
  teenSafe: boolean;
  /** Whether this route requires auth */
  requiresAuth: boolean;
}

// ─── All-Device Shorthand ────────────────────────────────────────────────────

const ALL: DeviceClass[] = [
  "phone", "tablet", "desktop", "smart-tv", "venue-screen",
  "kiosk", "controller", "remote", "webview", "mobile-app", "desktop-app",
];
const SCREEN_DEVICES: DeviceClass[] = [
  "phone", "tablet", "desktop", "smart-tv", "venue-screen", "kiosk", "webview", "mobile-app", "desktop-app",
];
const HANDHELD: DeviceClass[] = ["phone", "tablet", "mobile-app", "desktop-app", "desktop", "webview"];
const ALL_ROLES: SessionRole[] = ["fan", "fan_teen", "performer", "performer_teen", "venue", "artist", "host", "admin", "guest"];
const AUTH_ROLES: SessionRole[] = ["fan", "fan_teen", "performer", "performer_teen", "venue", "artist", "host", "admin"];
const ADMIN_ROLES: SessionRole[] = ["admin"];

// ─── Route Manifest ───────────────────────────────────────────────────────────

export const ROUTE_MANIFEST: RouteManifestEntry[] = [
  // ── Public / Auth ──────────────────────────────────────────────────────────
  { path: "/",                      category: "home",    allowedRoles: ALL_ROLES,  allowedDevices: ALL,           requiredCapabilities: [],              deepLinkable: true,  teenSafe: true,  requiresAuth: false },
  { path: "/home/1",                category: "home",    allowedRoles: ALL_ROLES,  allowedDevices: SCREEN_DEVICES, requiredCapabilities: [],             deepLinkable: true,  teenSafe: true,  requiresAuth: false },
  { path: "/home/1-2",              category: "home",    allowedRoles: ALL_ROLES,  allowedDevices: SCREEN_DEVICES, requiredCapabilities: [],             deepLinkable: true,  teenSafe: true,  requiresAuth: false },
  { path: "/home/2",                category: "home",    allowedRoles: ALL_ROLES,  allowedDevices: SCREEN_DEVICES, requiredCapabilities: [],             deepLinkable: true,  teenSafe: true,  requiresAuth: false },
  { path: "/auth",                  category: "auth",    allowedRoles: ALL_ROLES,  allowedDevices: HANDHELD,      requiredCapabilities: [],              deepLinkable: true,  teenSafe: true,  requiresAuth: false },
  { path: "/login",                 category: "auth",    allowedRoles: ALL_ROLES,  allowedDevices: HANDHELD,      requiredCapabilities: [],              deepLinkable: true,  teenSafe: true,  requiresAuth: false },
  { path: "/signup",                category: "auth",    allowedRoles: ALL_ROLES,  allowedDevices: HANDHELD,      requiredCapabilities: [],              deepLinkable: true,  teenSafe: true,  requiresAuth: false },
  { path: "/signup/teen",           category: "auth",    allowedRoles: ALL_ROLES,  allowedDevices: HANDHELD,      requiredCapabilities: [],              deepLinkable: true,  teenSafe: true,  requiresAuth: false },
  { path: "/account-recovery",      category: "auth",    allowedRoles: ALL_ROLES,  allowedDevices: HANDHELD,      requiredCapabilities: [],              deepLinkable: true,  teenSafe: true,  requiresAuth: false },
  // ── Lobby ─────────────────────────────────────────────────────────────────
  { path: "/lobbies",               category: "lobby",   allowedRoles: AUTH_ROLES, allowedDevices: SCREEN_DEVICES, requiredCapabilities: ["chat"],       deepLinkable: true,  teenSafe: true,  requiresAuth: true },
  { path: "/lobby",                 category: "lobby",   allowedRoles: AUTH_ROLES, allowedDevices: SCREEN_DEVICES, requiredCapabilities: ["chat"],       deepLinkable: true,  teenSafe: true,  requiresAuth: true },
  // ── Shows ─────────────────────────────────────────────────────────────────
  { path: "/shows",                 category: "show",    allowedRoles: ALL_ROLES,  allowedDevices: SCREEN_DEVICES, requiredCapabilities: [],             deepLinkable: true,  teenSafe: true,  requiresAuth: false },
  { path: "/shows/monthly-idol",    category: "show",    allowedRoles: ALL_ROLES,  allowedDevices: SCREEN_DEVICES, requiredCapabilities: ["live-stream"], deepLinkable: true,  teenSafe: true,  requiresAuth: false },
  { path: "/shows/monday-night-stage", category: "show", allowedRoles: ALL_ROLES, allowedDevices: SCREEN_DEVICES, requiredCapabilities: ["live-stream"], deepLinkable: true,  teenSafe: true,  requiresAuth: false },
  // ── Avatar ────────────────────────────────────────────────────────────────
  { path: "/avatar",                category: "avatar",  allowedRoles: AUTH_ROLES, allowedDevices: HANDHELD,      requiredCapabilities: [],              deepLinkable: true,  teenSafe: true,  requiresAuth: true },
  { path: "/avatar/build",          category: "avatar",  allowedRoles: AUTH_ROLES, allowedDevices: HANDHELD,      requiredCapabilities: [],              deepLinkable: true,  teenSafe: true,  requiresAuth: true },
  // ── Live ─────────────────────────────────────────────────────────────────
  { path: "/live",                  category: "live",    allowedRoles: ALL_ROLES,  allowedDevices: SCREEN_DEVICES, requiredCapabilities: ["live-stream"], deepLinkable: true,  teenSafe: true,  requiresAuth: false },
  // ── Rooms ─────────────────────────────────────────────────────────────────
  { path: "/rooms",                 category: "rooms",   allowedRoles: AUTH_ROLES, allowedDevices: SCREEN_DEVICES, requiredCapabilities: ["chat", "video-call"], deepLinkable: true, teenSafe: true, requiresAuth: true },
  // ── Events ────────────────────────────────────────────────────────────────
  { path: "/events",                category: "events",  allowedRoles: ALL_ROLES,  allowedDevices: ALL,           requiredCapabilities: [],              deepLinkable: true,  teenSafe: true,  requiresAuth: false },
  // ── Tickets ───────────────────────────────────────────────────────────────
  { path: "/tickets",               category: "tickets", allowedRoles: AUTH_ROLES, allowedDevices: HANDHELD,      requiredCapabilities: [],              deepLinkable: true,  teenSafe: true,  requiresAuth: true },
  // ── Artists / Venues ──────────────────────────────────────────────────────
  { path: "/artists",               category: "artist",  allowedRoles: ALL_ROLES,  allowedDevices: ALL,           requiredCapabilities: [],              deepLinkable: true,  teenSafe: true,  requiresAuth: false },
  { path: "/venues",                category: "venue",   allowedRoles: ALL_ROLES,  allowedDevices: ALL,           requiredCapabilities: [],              deepLinkable: true,  teenSafe: true,  requiresAuth: false },
  // ── Battles / Beats / Games ────────────────────────────────────────────────
  { path: "/battles",               category: "battles", allowedRoles: ALL_ROLES,  allowedDevices: SCREEN_DEVICES, requiredCapabilities: [],             deepLinkable: true,  teenSafe: true,  requiresAuth: false },
  { path: "/beats/marketplace",     category: "beats",   allowedRoles: ALL_ROLES,  allowedDevices: HANDHELD,      requiredCapabilities: [],              deepLinkable: true,  teenSafe: true,  requiresAuth: false },
  { path: "/cypher",                category: "battles", allowedRoles: AUTH_ROLES, allowedDevices: SCREEN_DEVICES, requiredCapabilities: ["video-call"], deepLinkable: true,  teenSafe: true,  requiresAuth: true },
  // ── Admin ─────────────────────────────────────────────────────────────────
  { path: "/admin",                 category: "admin",   allowedRoles: ADMIN_ROLES, allowedDevices: ["desktop", "tablet", "desktop-app"], requiredCapabilities: [], deepLinkable: false, teenSafe: false, requiresAuth: true },
  { path: "/admin/route-health",    category: "admin",   allowedRoles: ADMIN_ROLES, allowedDevices: ["desktop", "tablet", "desktop-app"], requiredCapabilities: [], deepLinkable: false, teenSafe: false, requiresAuth: true },
  { path: "/admin/minor-safety",    category: "safety",  allowedRoles: ADMIN_ROLES, allowedDevices: ["desktop", "tablet", "desktop-app"], requiredCapabilities: [], deepLinkable: false, teenSafe: false, requiresAuth: true },
  // ── Magazine ──────────────────────────────────────────────────────────────
  { path: "/magazine",              category: "magazine", allowedRoles: ALL_ROLES, allowedDevices: SCREEN_DEVICES, requiredCapabilities: [],             deepLinkable: true,  teenSafe: true,  requiresAuth: false },
  // ── Economy ───────────────────────────────────────────────────────────────
  { path: "/wallet",                category: "economy",  allowedRoles: AUTH_ROLES, allowedDevices: HANDHELD,     requiredCapabilities: [],              deepLinkable: true,  teenSafe: true,  requiresAuth: true },
  { path: "/dashboard",             category: "profile",  allowedRoles: AUTH_ROLES, allowedDevices: HANDHELD,     requiredCapabilities: [],              deepLinkable: true,  teenSafe: true,  requiresAuth: true },
  { path: "/parents",               category: "safety",   allowedRoles: ALL_ROLES,  allowedDevices: HANDHELD,    requiredCapabilities: [],              deepLinkable: true,  teenSafe: true,  requiresAuth: false },
];

// ─── Router Class ─────────────────────────────────────────────────────────────

export class AppSurfaceRouter {
  private static _instance: AppSurfaceRouter | null = null;
  /** Base URL of the canonical website. Apps deep-link here. */
  private _baseUrl: string;

  constructor(baseUrl = "https://tmi.themusiciansindex.com") {
    this._baseUrl = baseUrl;
  }

  static getInstance(): AppSurfaceRouter {
    if (!AppSurfaceRouter._instance) {
      AppSurfaceRouter._instance = new AppSurfaceRouter();
    }
    return AppSurfaceRouter._instance;
  }

  // ── Route lookup ──────────────────────────────────────────────────────────

  getEntry(path: string): RouteManifestEntry | null {
    return ROUTE_MANIFEST.find((r) => r.path === path) ?? null;
  }

  routesForDevice(deviceClass: DeviceClass): RouteManifestEntry[] {
    return ROUTE_MANIFEST.filter((r) => r.allowedDevices.includes(deviceClass));
  }

  routesForRole(role: SessionRole): RouteManifestEntry[] {
    return ROUTE_MANIFEST.filter((r) => r.allowedRoles.includes(role));
  }

  teenSafeRoutes(): RouteManifestEntry[] {
    return ROUTE_MANIFEST.filter((r) => r.teenSafe);
  }

  canAccess(
    path: string,
    deviceClass: DeviceClass,
    role: SessionRole,
    isMinor: boolean,
  ): { allowed: boolean; reason: string } {
    const entry = this.getEntry(path);
    if (!entry) return { allowed: false, reason: "route not in manifest" };

    if (!entry.allowedDevices.includes(deviceClass)) {
      return { allowed: false, reason: `route not available on ${deviceClass}` };
    }
    if (!entry.allowedRoles.includes(role)) {
      return { allowed: false, reason: `role '${role}' not permitted on this route` };
    }
    if (isMinor && !entry.teenSafe) {
      return { allowed: false, reason: "route not available for teen accounts" };
    }

    return { allowed: true, reason: "access granted" };
  }

  // ── Deep links ────────────────────────────────────────────────────────────

  buildDeepLink(
    path: string,
    params?: Record<string, string>,
    deviceId?: string,
  ): string | null {
    const entry = this.getEntry(path);
    if (!entry || !entry.deepLinkable) return null;

    const url = new URL(this._baseUrl + path);
    if (params) {
      for (const [k, v] of Object.entries(params)) {
        url.searchParams.set(k, v);
      }
    }
    if (deviceId) url.searchParams.set("device", deviceId);
    return url.toString();
  }

  // ── QR Payload ────────────────────────────────────────────────────────────

  buildQRPayload(
    path: string,
    pairingToken: string,
    deviceClass: DeviceClass,
  ): QRPayload | null {
    const deepLink = this.buildDeepLink(path, { pair: pairingToken, surface: deviceClass });
    if (!deepLink) return null;

    return {
      url: deepLink,
      pairingToken,
      deviceClass,
      path,
      generatedAt: Date.now(),
      expiresAt: Date.now() + 5 * 60 * 1000, // 5 minutes
    };
  }

  setBaseUrl(url: string): void {
    this._baseUrl = url;
  }

  getBaseUrl(): string {
    return this._baseUrl;
  }
}

export interface QRPayload {
  url: string;
  pairingToken: string;
  deviceClass: DeviceClass;
  path: string;
  generatedAt: number;
  expiresAt: number;
}

export const appSurfaceRouter = AppSurfaceRouter.getInstance();
