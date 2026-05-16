/**
 * ADMIN MOTION REGISTRY
 * Defines per-panel motion rules for every admin/operator surface.
 * Admin motion must NEVER block clicks or hide action states.
 */

export type AdminMotionEffect =
  | "signal-lock-in"
  | "scanline-overlay"
  | "preview-fade"
  | "event-slide"
  | "warning-pulse"
  | "critical-flash"
  | "summon-burst"
  | "mc-scan-sweep"
  | "heartbeat"
  | "approval-glow"
  | "security-sweep"
  | "analytics-counter"
  | "button-glow"
  | "section-lock-highlight"
  | "confirm-pulse";

export interface AdminPanelMotion {
  panel: string;
  effects: AdminMotionEffect[];
  looping: AdminMotionEffect[];     // effects that run continuously
  interactive: AdminMotionEffect[];  // effects fired by user action
  allowGlitch: boolean;
}

const ADMIN_MOTION_MAP: Record<string, AdminPanelMotion> = {
  admin: {
    panel: "Admin Hub",
    effects: ["signal-lock-in", "scanline-overlay", "section-lock-highlight", "button-glow"],
    looping: ["scanline-overlay"],
    interactive: ["signal-lock-in", "section-lock-highlight", "button-glow", "confirm-pulse"],
    allowGlitch: true,
  },
  "admin/live-feed": {
    panel: "Live Feed Explorer",
    effects: ["event-slide", "warning-pulse", "critical-flash"],
    looping: [],
    interactive: [],
    allowGlitch: false,
  },
  "admin/chain-command": {
    panel: "Chain Command",
    effects: ["signal-lock-in", "confirm-pulse", "button-glow"],
    looping: [],
    interactive: ["signal-lock-in", "confirm-pulse", "button-glow"],
    allowGlitch: true,
  },
  "admin/route-health": {
    panel: "Route Health",
    effects: ["event-slide", "warning-pulse", "analytics-counter"],
    looping: ["heartbeat"],
    interactive: ["confirm-pulse"],
    allowGlitch: false,
  },
  "admin/security": {
    panel: "Security Sentinel Wall",
    effects: ["security-sweep", "critical-flash", "warning-pulse"],
    looping: ["security-sweep"],
    interactive: ["critical-flash"],
    allowGlitch: false,
  },
  "admin/observatory": {
    panel: "World Center Monitor",
    effects: ["heartbeat", "analytics-counter", "event-slide"],
    looping: ["heartbeat"],
    interactive: ["summon-burst"],
    allowGlitch: false,
  },
  overseer: {
    panel: "Overseer Deck",
    effects: ["signal-lock-in", "scanline-overlay", "summon-burst", "heartbeat"],
    looping: ["heartbeat", "scanline-overlay"],
    interactive: ["summon-burst", "signal-lock-in", "approval-glow"],
    allowGlitch: true,
  },
  "mc-master-control": {
    panel: "MC Master Control",
    effects: ["mc-scan-sweep", "summon-burst", "confirm-pulse", "button-glow"],
    looping: ["mc-scan-sweep"],
    interactive: ["summon-burst", "confirm-pulse"],
    allowGlitch: false,
  },
  "big-ace": {
    panel: "Big Ace Console",
    effects: ["summon-burst", "approval-glow", "heartbeat", "button-glow"],
    looping: ["heartbeat"],
    interactive: ["summon-burst", "approval-glow"],
    allowGlitch: true,
  },
  "admin/sponsors": {
    panel: "Sponsor Admin",
    effects: ["preview-fade", "button-glow", "confirm-pulse"],
    looping: [],
    interactive: ["preview-fade", "confirm-pulse"],
    allowGlitch: false,
  },
  "admin/advertisers": {
    panel: "Advertiser Admin",
    effects: ["preview-fade", "button-glow"],
    looping: [],
    interactive: ["preview-fade"],
    allowGlitch: false,
  },
  default: {
    panel: "Unknown Panel",
    effects: ["button-glow"],
    looping: [],
    interactive: ["button-glow"],
    allowGlitch: false,
  },
};

export function getAdminPanelMotion(key: string): AdminPanelMotion {
  return ADMIN_MOTION_MAP[key] ?? ADMIN_MOTION_MAP.default;
}

export function adminAllowsEffect(key: string, effect: AdminMotionEffect): boolean {
  return getAdminPanelMotion(key).effects.includes(effect);
}
