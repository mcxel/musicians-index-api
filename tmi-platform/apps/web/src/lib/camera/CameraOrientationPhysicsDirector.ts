/**
 * CameraOrientationPhysicsDirector.ts — Dynamic Mobile Camera Orientation & Mirroring Authority
 *
 * Laws:
 * - "Selfie mirroring is a presentation choice. Orientation is physical truth."
 * - FRONT CAMERA PREVIEW: may be mirrored for natural self-view (scaleX(-1) in upright portrait/landscape).
 * - REAR CAMERA: NEVER receives selfie mirroring (must remain true-to-world, no backwards text).
 * - REMOTE / PUBLISHED OUTPUT: follows broadcast policy, never inherits self-preview mirroring.
 * - SENSOR & DEVICE COHERENCE:
 *    Orientation recalculates dynamically on portrait, landscape-left (90°), landscape-right (270°),
 *    camera switch (front ⇄ rear), and resize without restarting WebRTC streams or renegotiating sessions.
 * - MULTI-MONITOR INVARIANCE:
 *    Placement changes (RIGHT, BOTTOM, PIP, FOCUS, FULLSCREEN) do not mutate camera orientation transforms.
 */

export type CameraFacingMode = "user" | "environment";

export type DeviceOrientationMode =
  | "portrait-primary"
  | "portrait-secondary"
  | "landscape-primary"
  | "landscape-secondary";

export interface CameraTransformResult {
  transform: string;
  isMirrored: boolean;
  orientationAngle: number;
  facingMode: CameraFacingMode;
  objectFit: "cover" | "contain";
  cssProperties: React.CSSProperties;
}

export interface CameraOrientationPhysicsInput {
  facingMode: CameraFacingMode;
  screenAngle?: number;
  orientationType?: string;
  isSelfPreview?: boolean;
  videoWidth?: number;
  videoHeight?: number;
}

/**
 * Resolve device orientation angle and type from browser environment.
 */
export function resolveDeviceScreenAngle(): { angle: number; type: DeviceOrientationMode } {
  if (typeof window === "undefined") {
    return { angle: 0, type: "portrait-primary" };
  }

  const screenOrientation = window.screen?.orientation;
  if (screenOrientation) {
    const angle = screenOrientation.angle ?? 0;
    const rawType = screenOrientation.type ?? "portrait-primary";
    let type: DeviceOrientationMode = "portrait-primary";
    if (rawType.includes("landscape-primary")) type = "landscape-primary";
    else if (rawType.includes("landscape-secondary")) type = "landscape-secondary";
    else if (rawType.includes("portrait-secondary")) type = "portrait-secondary";
    return { angle, type };
  }

  // Fallback for legacy iOS Safari window.orientation
  const windowOrientation = (window as unknown as { orientation?: number }).orientation;
  const angle = typeof windowOrientation === "number" ? (windowOrientation >= 0 ? windowOrientation : windowOrientation + 360) : 0;
  const isLandscape = typeof window.innerWidth === "number" && typeof window.innerHeight === "number"
    ? window.innerWidth > window.innerHeight
    : angle === 90 || angle === 270;

  let type: DeviceOrientationMode = "portrait-primary";
  if (angle === 90) type = "landscape-primary";
  else if (angle === 270) type = "landscape-secondary";
  else if (angle === 180) type = "portrait-secondary";
  else if (isLandscape) type = "landscape-primary";

  return { angle, type };
}

/**
 * Pure transform calculator for camera preview surfaces.
 * Enforces front mirror vs rear natural truth across all rotation angles.
 */
export function calculateCameraPreviewPhysics(
  input: CameraOrientationPhysicsInput,
): CameraTransformResult {
  const {
    facingMode,
    screenAngle = 0,
    isSelfPreview = true,
    videoWidth = 0,
    videoHeight = 0,
  } = input;

  const isFront = facingMode === "user";

  // Rear camera: NEVER mirror. Truth-to-world orientation.
  if (!isFront) {
    return {
      transform: "none",
      isMirrored: false,
      orientationAngle: screenAngle,
      facingMode,
      objectFit: "cover",
      cssProperties: {
        transform: "none",
        objectFit: "cover",
        transition: "transform 0.2s cubic-bezier(0.2, 0.9, 0.3, 1)",
      },
    };
  }

  // Remote view of front camera: NO selfie mirror by default.
  if (!isSelfPreview) {
    return {
      transform: "none",
      isMirrored: false,
      orientationAngle: screenAngle,
      facingMode,
      objectFit: "cover",
      cssProperties: {
        transform: "none",
        objectFit: "cover",
        transition: "transform 0.2s cubic-bezier(0.2, 0.9, 0.3, 1)",
      },
    };
  }

  // Front camera Self-Preview:
  // Must mirror naturally across device rotation so user's left hand moves left in preview.
  // In standard browser HTML5 video elements, when device rotates to landscape:
  // - If screenAngle is 0 (portrait upright): scaleX(-1)
  // - If screenAngle is 90 (landscape-left): natural horizontal mirror is scaleX(-1)
  // - If screenAngle is 270 (landscape-right): natural horizontal mirror is scaleX(-1)
  // - If screenAngle is 180 (portrait-inverted): scaleX(-1)
  // CRITICAL: We NEVER apply rotate(90deg) or rotate(270deg) to the video element unless
  // the raw camera track is unrotated while the viewport is portrait (detected via video aspect ratio mismatch).
  
  const isVideoLandscape = videoWidth > 0 && videoHeight > 0 ? videoWidth > videoHeight : false;
  const isScreenLandscape = screenAngle === 90 || screenAngle === 270;

  // Sensor vs screen correction:
  // If sensor stream is landscape (typical native camera hardware) while screen is in portrait (angle 0),
  // modern mobile browsers automatically handle orientation in the native video decoder.
  // The only transform needed on self-preview is pure horizontal mirroring:
  const transform = "scaleX(-1)";

  return {
    transform,
    isMirrored: true,
    orientationAngle: screenAngle,
    facingMode,
    objectFit: "cover",
    cssProperties: {
      transform,
      objectFit: "cover",
      transition: "transform 0.2s cubic-bezier(0.2, 0.9, 0.3, 1)",
    },
  };
}
