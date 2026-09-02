/**
 * PresentationCapabilityResolver — between Showrunner intent and world capabilities.
 * Premium enhances presentation; never pay-to-function.
 */

export type DeviceTier = "LOW" | "MEDIUM" | "HIGH";

export type WorldCapabilityFlags = Readonly<{
  jumbotronFourFaces: boolean;
  jumbotronRings: boolean;
  kineticPanels: boolean;
  volumetrics: boolean;
  avatarAudience: boolean;
  deviceTier: DeviceTier;
  reducedMotion: boolean;
  /** Membership may enhance visuals — must never gate core Challenge function. */
  premiumEnhancementsUnlocked: boolean;
}>;

export type ShowrunnerIntent = Readonly<{
  wantFourFaceJumbotron: boolean;
  wantKineticPanels: boolean;
  wantVolumetrics: boolean;
  wantAvatarAudience: boolean;
  wantRings: boolean;
  introPackage: "FULL" | "FAST" | "RECONNECT" | "REDUCED_MOTION" | "LOW_DEVICE";
}>;

export type ResolvedPresentationCapability = Readonly<{
  jumbotronFacesActive: boolean;
  jumbotronRingsActive: boolean;
  kineticPanelsActive: boolean;
  volumetricsActive: boolean;
  avatarAudienceActive: boolean;
  pacingMode: ShowrunnerIntent["introPackage"];
  /** True when premium only adds polish — core path still functions without it. */
  premiumIsEnhancementOnly: true;
  degradedReasons: readonly string[];
}>;

export function resolvePresentationCapabilities(
  intent: ShowrunnerIntent,
  world: WorldCapabilityFlags
): ResolvedPresentationCapability {
  const degraded: string[] = [];

  const pacingMode: ShowrunnerIntent["introPackage"] = world.reducedMotion
    ? "REDUCED_MOTION"
    : world.deviceTier === "LOW"
      ? "LOW_DEVICE"
      : intent.introPackage;

  if (world.reducedMotion && intent.introPackage === "FULL") {
    degraded.push("reduced_motion_forces_REDUCED_MOTION");
  }
  if (world.deviceTier === "LOW" && intent.introPackage === "FULL") {
    degraded.push("low_device_forces_LOW_DEVICE");
  }

  const jumbotronFacesActive =
    intent.wantFourFaceJumbotron && world.jumbotronFourFaces;
  if (intent.wantFourFaceJumbotron && !world.jumbotronFourFaces) {
    degraded.push("jumbotron_four_faces_unavailable");
  }

  const jumbotronRingsActive = intent.wantRings && world.jumbotronRings;
  const kineticPanelsActive =
    intent.wantKineticPanels &&
    world.kineticPanels &&
    world.deviceTier !== "LOW";
  if (intent.wantKineticPanels && world.deviceTier === "LOW") {
    degraded.push("kinetic_panels_skipped_low_device");
  }

  // Volumetrics are premium enhancement — core Challenge still works without them.
  const volumetricsActive =
    intent.wantVolumetrics &&
    world.volumetrics &&
    world.premiumEnhancementsUnlocked &&
    world.deviceTier === "HIGH" &&
    !world.reducedMotion;
  if (intent.wantVolumetrics && !volumetricsActive) {
    degraded.push("volumetrics_enhancement_only_skipped");
  }

  const avatarAudienceActive =
    intent.wantAvatarAudience && world.avatarAudience;

  return Object.freeze({
    jumbotronFacesActive,
    jumbotronRingsActive,
    kineticPanelsActive,
    volumetricsActive,
    avatarAudienceActive,
    pacingMode,
    premiumIsEnhancementOnly: true as const,
    degradedReasons: Object.freeze([...degraded]),
  });
}
