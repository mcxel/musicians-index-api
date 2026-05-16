/**
 * DeviceCapabilityRegistry
 * Source-of-truth for every device class TMI supports.
 * Website is the canonical host. Apps are surfaces.
 */

// ─── Device Classes ──────────────────────────────────────────────────────────

export type DeviceClass =
  | "phone"
  | "tablet"
  | "desktop"
  | "smart-tv"
  | "venue-screen"
  | "kiosk"
  | "controller"
  | "remote"
  | "webview"
  | "mobile-app"
  | "desktop-app";

export const ALL_DEVICE_CLASSES: DeviceClass[] = [
  "phone", "tablet", "desktop", "smart-tv", "venue-screen",
  "kiosk", "controller", "remote", "webview", "mobile-app", "desktop-app",
];

// ─── Input Modalities ────────────────────────────────────────────────────────

export type InputModality =
  | "touch"
  | "mouse"
  | "keyboard"
  | "gamepad"
  | "tv-remote"
  | "dpad"
  | "voice"
  | "stylus";

// ─── Hardware Capabilities ───────────────────────────────────────────────────

export type HardwareCapability =
  | "camera"
  | "microphone"
  | "speaker"
  | "accelerometer"
  | "gps"
  | "haptics"
  | "nfc"
  | "bluetooth"
  | "file-system"
  | "push-notifications"
  | "picture-in-picture"
  | "fullscreen"
  | "clipboard"
  | "share-api";

// ─── Surface Capabilities ────────────────────────────────────────────────────

export type SurfaceCapability =
  | "live-stream"
  | "video-call"
  | "chat"
  | "qr-scan"
  | "deep-link"
  | "offline-mode"
  | "background-sync"
  | "split-view"
  | "picture-in-picture"
  | "kiosk-mode"
  | "venue-display";

// ─── Device Profile ──────────────────────────────────────────────────────────

export interface DeviceProfile {
  deviceClass: DeviceClass;
  inputModalities: InputModality[];
  hardwareCapabilities: HardwareCapability[];
  surfaceCapabilities: SurfaceCapability[];
  /** Minimum screen width in CSS px for this class */
  minViewportWidth: number;
  /** Maximum screen width in CSS px for this class (0 = no upper bound) */
  maxViewportWidth: number;
  /** Whether this device can act as a primary account surface */
  isPrimary: boolean;
  /** Whether this device supports guardian/consent flows */
  supportsGuardianFlow: boolean;
  /** Human-readable label */
  label: string;
}

// ─── Capability Map ───────────────────────────────────────────────────────────

const CAPABILITY_MAP: Record<DeviceClass, DeviceProfile> = {
  "phone": {
    deviceClass: "phone",
    label: "Phone",
    inputModalities: ["touch", "voice"],
    hardwareCapabilities: ["camera", "microphone", "speaker", "accelerometer", "gps", "haptics", "nfc", "bluetooth", "push-notifications", "share-api", "clipboard"],
    surfaceCapabilities: ["live-stream", "video-call", "chat", "qr-scan", "deep-link", "offline-mode", "background-sync"],
    minViewportWidth: 0,
    maxViewportWidth: 767,
    isPrimary: true,
    supportsGuardianFlow: true,
  },
  "tablet": {
    deviceClass: "tablet",
    label: "Tablet",
    inputModalities: ["touch", "stylus", "keyboard"],
    hardwareCapabilities: ["camera", "microphone", "speaker", "accelerometer", "bluetooth", "push-notifications", "share-api", "clipboard", "picture-in-picture"],
    surfaceCapabilities: ["live-stream", "video-call", "chat", "qr-scan", "deep-link", "offline-mode", "background-sync", "split-view", "picture-in-picture"],
    minViewportWidth: 768,
    maxViewportWidth: 1023,
    isPrimary: true,
    supportsGuardianFlow: true,
  },
  "desktop": {
    deviceClass: "desktop",
    label: "Desktop",
    inputModalities: ["mouse", "keyboard", "touch"],
    hardwareCapabilities: ["camera", "microphone", "speaker", "file-system", "clipboard", "picture-in-picture", "fullscreen", "share-api"],
    surfaceCapabilities: ["live-stream", "video-call", "chat", "deep-link", "offline-mode", "background-sync", "split-view", "picture-in-picture"],
    minViewportWidth: 1024,
    maxViewportWidth: 0,
    isPrimary: true,
    supportsGuardianFlow: true,
  },
  "smart-tv": {
    deviceClass: "smart-tv",
    label: "Smart TV",
    inputModalities: ["tv-remote", "dpad", "voice"],
    hardwareCapabilities: ["speaker", "microphone", "fullscreen", "picture-in-picture"],
    surfaceCapabilities: ["live-stream", "chat", "picture-in-picture"],
    minViewportWidth: 1280,
    maxViewportWidth: 0,
    isPrimary: false,
    supportsGuardianFlow: false,
  },
  "venue-screen": {
    deviceClass: "venue-screen",
    label: "Venue Screen",
    inputModalities: ["touch", "dpad"],
    hardwareCapabilities: ["speaker", "fullscreen"],
    surfaceCapabilities: ["live-stream", "chat", "venue-display", "kiosk-mode"],
    minViewportWidth: 1920,
    maxViewportWidth: 0,
    isPrimary: false,
    supportsGuardianFlow: false,
  },
  "kiosk": {
    deviceClass: "kiosk",
    label: "Kiosk",
    inputModalities: ["touch"],
    hardwareCapabilities: ["camera", "speaker", "nfc", "bluetooth", "fullscreen"],
    surfaceCapabilities: ["chat", "qr-scan", "kiosk-mode", "venue-display"],
    minViewportWidth: 768,
    maxViewportWidth: 0,
    isPrimary: false,
    supportsGuardianFlow: false,
  },
  "controller": {
    deviceClass: "controller",
    label: "Game Controller",
    inputModalities: ["gamepad", "dpad"],
    hardwareCapabilities: ["haptics", "bluetooth"],
    surfaceCapabilities: ["deep-link"],
    minViewportWidth: 0,
    maxViewportWidth: 0,
    isPrimary: false,
    supportsGuardianFlow: false,
  },
  "remote": {
    deviceClass: "remote",
    label: "Remote",
    inputModalities: ["tv-remote", "dpad"],
    hardwareCapabilities: ["bluetooth"],
    surfaceCapabilities: ["deep-link"],
    minViewportWidth: 0,
    maxViewportWidth: 0,
    isPrimary: false,
    supportsGuardianFlow: false,
  },
  "webview": {
    deviceClass: "webview",
    label: "Embedded WebView",
    inputModalities: ["touch", "mouse"],
    hardwareCapabilities: ["camera", "microphone", "speaker", "clipboard"],
    surfaceCapabilities: ["live-stream", "chat", "deep-link"],
    minViewportWidth: 0,
    maxViewportWidth: 0,
    isPrimary: false,
    supportsGuardianFlow: true,
  },
  "mobile-app": {
    deviceClass: "mobile-app",
    label: "Mobile App",
    inputModalities: ["touch", "voice"],
    hardwareCapabilities: ["camera", "microphone", "speaker", "accelerometer", "gps", "haptics", "nfc", "bluetooth", "push-notifications", "share-api", "clipboard", "file-system"],
    surfaceCapabilities: ["live-stream", "video-call", "chat", "qr-scan", "deep-link", "offline-mode", "background-sync", "picture-in-picture"],
    minViewportWidth: 0,
    maxViewportWidth: 767,
    isPrimary: true,
    supportsGuardianFlow: true,
  },
  "desktop-app": {
    deviceClass: "desktop-app",
    label: "Desktop App",
    inputModalities: ["mouse", "keyboard", "touch"],
    hardwareCapabilities: ["camera", "microphone", "speaker", "file-system", "clipboard", "picture-in-picture", "fullscreen", "share-api"],
    surfaceCapabilities: ["live-stream", "video-call", "chat", "deep-link", "offline-mode", "background-sync", "split-view", "picture-in-picture"],
    minViewportWidth: 1024,
    maxViewportWidth: 0,
    isPrimary: true,
    supportsGuardianFlow: true,
  },
};

// ─── Registry Class ───────────────────────────────────────────────────────────

export class DeviceCapabilityRegistry {
  private static _instance: DeviceCapabilityRegistry | null = null;
  private _detected: DeviceClass | null = null;

  static getInstance(): DeviceCapabilityRegistry {
    if (!DeviceCapabilityRegistry._instance) {
      DeviceCapabilityRegistry._instance = new DeviceCapabilityRegistry();
    }
    return DeviceCapabilityRegistry._instance;
  }

  getProfile(deviceClass: DeviceClass): DeviceProfile {
    return CAPABILITY_MAP[deviceClass];
  }

  getAllProfiles(): DeviceProfile[] {
    return ALL_DEVICE_CLASSES.map((c) => CAPABILITY_MAP[c]);
  }

  hasInputModality(deviceClass: DeviceClass, modality: InputModality): boolean {
    return CAPABILITY_MAP[deviceClass].inputModalities.includes(modality);
  }

  hasHardwareCapability(deviceClass: DeviceClass, cap: HardwareCapability): boolean {
    return CAPABILITY_MAP[deviceClass].hardwareCapabilities.includes(cap);
  }

  hasSurfaceCapability(deviceClass: DeviceClass, cap: SurfaceCapability): boolean {
    return CAPABILITY_MAP[deviceClass].surfaceCapabilities.includes(cap);
  }

  isPrimaryDevice(deviceClass: DeviceClass): boolean {
    return CAPABILITY_MAP[deviceClass].isPrimary;
  }

  supportsGuardianFlow(deviceClass: DeviceClass): boolean {
    return CAPABILITY_MAP[deviceClass].supportsGuardianFlow;
  }

  /**
   * Detects the most likely device class from the browser environment.
   * Returns "desktop" as the safe default when detection is ambiguous.
   */
  detectDeviceClass(): DeviceClass {
    if (this._detected) return this._detected;
    if (typeof window === "undefined") return "desktop";

    const ua = navigator.userAgent.toLowerCase();
    const w  = window.innerWidth;

    // TV/kiosk heuristics first (before viewport checks)
    if (ua.includes("smart-tv") || ua.includes("smarttv") || ua.includes("tizen") || ua.includes("webos")) {
      this._detected = "smart-tv";
      return this._detected;
    }
    if (ua.includes("kiosk")) {
      this._detected = "kiosk";
      return this._detected;
    }

    // Touch + viewport size
    const hasTouch = navigator.maxTouchPoints > 0;
    const isMobile = /android|iphone|ipod/.test(ua);
    const isTablet = /ipad/.test(ua) || (hasTouch && /android/.test(ua) && w >= 768);

    if (isMobile && !isTablet) {
      this._detected = "phone";
      return this._detected;
    }
    if (isTablet) {
      this._detected = "tablet";
      return this._detected;
    }

    // Gamepad API
    if ("getGamepads" in navigator) {
      const gamepads = navigator.getGamepads();
      if (gamepads.length > 0 && gamepads[0] !== null) {
        this._detected = "controller";
        return this._detected;
      }
    }

    this._detected = "desktop";
    return this._detected;
  }

  /** Force-override the detected class (used by app shells passing their own context) */
  setDetectedClass(deviceClass: DeviceClass): void {
    this._detected = deviceClass;
  }
}

export const deviceRegistry = DeviceCapabilityRegistry.getInstance();
