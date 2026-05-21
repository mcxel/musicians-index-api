// packages/vr-engine/src/WebXRManager.ts
// Main WebXR entry point. Works on ALL headsets via WebXR Device API.
// Meta Quest, PSVR2 (via browser), Apple Vision Pro, SteamVR, PC VR.
// Falls back to 3D desktop mode if XR not available.

export type XRMode =
  | "immersive-vr"     // full headset VR
  | "immersive-ar"     // AR passthrough (Vision Pro, Quest 3)
  | "inline"           // desktop 3D mouse-look mode
  | "gyroscope";       // phone gyroscope mode (mobile)

export type XRDeviceType =
  | "meta-quest"
  | "psvr2"
  | "apple-vision-pro"
  | "steamvr"
  | "openxr-generic"
  | "webxr-inline"
  | "mobile-gyroscope";

export interface XRSessionConfig {
  mode: XRMode;
  device: XRDeviceType;
  hand_tracking: boolean;
  controller_input: boolean;
  spatial_audio: boolean;
  passthrough: boolean;     // AR mode — see real world through headset
  framerate_target: 72 | 90 | 120;
  resolution_scale: 0.5 | 0.75 | 1.0 | 1.5; // performance vs quality
}

// ── DEVICE DETECTION ─────────────────────────────────────
export async function detectXRDevice(): Promise<XRDeviceType | null> {
  if (typeof navigator === "undefined" || !("xr" in navigator)) return null;
  
  const xr = (navigator as any).xr;
  const supported = await xr.isSessionSupported("immersive-vr");
  if (!supported) return "webxr-inline";
  
  const ua = navigator.userAgent;
  if (/OculusBrowser|Quest/i.test(ua)) return "meta-quest";
  if (/PlayStation/i.test(ua)) return "psvr2";
  if (/Vision/i.test(ua)) return "apple-vision-pro";
  return "openxr-generic";
}

// ── XR SESSION LIFECYCLE ─────────────────────────────────
export class WebXRManager {
  private session: any = null;
  private device: XRDeviceType | null = null;
  private sceneManager: any = null;

  async init(): Promise<void> {
    this.device = await detectXRDevice();
    console.log(`[WebXR] Device detected: ${this.device}`);
  }

  async enterVR(sceneId: string): Promise<void> {
    if (!this.device || this.device === "webxr-inline") {
      // Fallback to 3D desktop mode
      this.enterDesktop3D(sceneId);
      return;
    }
    const xr = (navigator as any).xr;
    const config: XRSessionConfig = {
      mode: "immersive-vr",
      device: this.device,
      hand_tracking: true,
      controller_input: true,
      spatial_audio: true,
      passthrough: this.device === "apple-vision-pro" || this.device === "meta-quest",
      framerate_target: this.device === "meta-quest" ? 90 : 72,
      resolution_scale: 1.0,
    };
    this.session = await xr.requestSession("immersive-vr", {
      optionalFeatures: ["hand-tracking", "local-floor", "bounded-floor"],
    });
    await this.sceneManager?.loadScene(sceneId, config);
  }

  enterDesktop3D(sceneId: string): void {
    console.log(`[WebXR] Entering 3D desktop mode for scene: ${sceneId}`);
  }

  async exitVR(): Promise<void> {
    if (this.session) {
      await this.session.end();
      this.session = null;
    }
  }
}
