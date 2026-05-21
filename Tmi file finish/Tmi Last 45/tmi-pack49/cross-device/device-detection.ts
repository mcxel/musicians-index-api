// packages/cross-device/src/device-detection.ts
// Detects device type for route decisions, feature flags, and UI modes.

export type DeviceType = "DESKTOP" | "MOBILE" | "TABLET" | "TV" | "KIOSK" | "SCANNER" | "VR" | "AR" | "CONSOLE";

export interface DeviceProfile {
  type: DeviceType;
  hasTouch: boolean;
  hasVR: boolean;
  hasGamepad: boolean;
  isTVMode: boolean;
  isKioskMode: boolean;
  screenWidth: number;
  screenHeight: number;
  pixelRatio: number;
  preferReducedMotion: boolean;
  preferDarkMode: boolean;
  canAutoplay: boolean;
}

export function detectDevice(): DeviceType {
  if (typeof window === "undefined") return "DESKTOP";
  const ua = navigator.userAgent;
  if (/OculusBrowser|Quest|VR/i.test(ua)) return "VR";
  if (/PlayStation/i.test(ua)) return "CONSOLE";
  if (/SmartTV|AppleTV|Roku|SMART-TV|BRAVIA|WebOS|Tizen/i.test(ua)) return "TV";
  if (/Tablet|iPad/i.test(ua)) return "TABLET";
  if (/Android|iPhone|Mobile/i.test(ua)) return "MOBILE";
  if (window.innerWidth >= 1920 && !("ontouchstart" in window)) return "DESKTOP";
  return "DESKTOP";
}

// TV-specific navigation (DPAD focus management)
export const TV_NAV_CONFIG = {
  focusableSelector: "[data-tv-focusable]",
  upKey:    38, // Arrow Up
  downKey:  40, // Arrow Down
  leftKey:  37, // Arrow Left
  rightKey: 39, // Arrow Right
  selectKey: 13, // Enter
  backKey:  8,  // Backspace = back on Fire TV
} as const;

// Routes to disable for each device type
export const DISABLED_ROUTES: Record<string, string[]> = {
  TV:      ["/vr/*", "/scanner/*", "/kiosk/*", "/avatar-lab"],
  KIOSK:   ["/dashboard/*", "/messages", "/friends", "/settings"],
  SCANNER: ["/", "/editorial", "/lobby", "/stadium"],
  VR:      ["/scanner/*", "/kiosk/*"],
};

// Feature availability by device
export const DEVICE_FEATURES = {
  DESKTOP: { vr:"webxr-inline", audio:"full", touch:false, spatial:false },
  MOBILE:  { vr:"gyroscope",    audio:"ambient-only", touch:true, spatial:false },
  TV:      { vr:"none",         audio:"full", touch:false, spatial:true },
  VR:      { vr:"immersive",    audio:"spatial", touch:false, spatial:true },
  TABLET:  { vr:"gyroscope",    audio:"full", touch:true, spatial:false },
} as const;
