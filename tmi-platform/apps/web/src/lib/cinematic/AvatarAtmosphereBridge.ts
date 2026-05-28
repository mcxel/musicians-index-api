/**
 * AvatarAtmosphereBridge
 * Calculates volumetric lighting, fog density, and rim exposure for avatars
 * based on their physical Z-depth (seat row) in the venue.
 * Prevents the "flat sprite" problem by enforcing cinematic depth separation.
 */

export interface AtmosphereProfile {
  fogDensity: number;
  rimExposure: number; // Shoulder edge-light intensity
  ambientBleed: number; // How much the stage color washes over them
  shadowSoftness: number;
  isSilhouette: boolean;
  blurRadius: number; // Depth of field simulation
}

export class AvatarAtmosphereBridge {
  
  /**
   * Calculates the specific shader inputs for an avatar based on their distance from the stage.
   * @param distanceZ - 0 to 100 (0 = front row touching the stage, 100 = back wall)
   * @param globalBrightness - Current stage lighting intensity (0 to 1)
   */
  public static calculateAtmosphere(distanceZ: number, globalBrightness: number = 0.8): AtmosphereProfile {
    // Normalize distance
    const clampedZ = Math.max(0, Math.min(distanceZ, 100));
    
    // Front Row (0 - 20): High rim light, sharp shadows, low fog, high detail
    if (clampedZ <= 20) {
      return {
        fogDensity: 0.05,
        rimExposure: 1.2 * globalBrightness,
        ambientBleed: 0.8,
        shadowSoftness: 0.2,
        isSilhouette: false,
        blurRadius: 0
      };
    }
    
    // Mid Crowd (21 - 60): Increased haze, softer specular, ambient color absorption
    if (clampedZ > 20 && clampedZ <= 60) {
      const depthFactor = (clampedZ - 20) / 40; // 0 to 1 through the mid section
      return {
        fogDensity: 0.2 + (depthFactor * 0.3),
        rimExposure: 0.6 * globalBrightness * (1 - depthFactor * 0.3), // Rim fades slightly
        ambientBleed: 0.5 + (depthFactor * 0.2), // More color bleed from the room haze
        shadowSoftness: 0.5 + (depthFactor * 0.3),
        isSilhouette: false,
        blurRadius: depthFactor * 2 // Slight depth of field kick-in
      };
    }
    
    // Back Row / Balcony (61 - 100): Heavy volumetric absorption, silhouette dominant
    const backFactor = (clampedZ - 60) / 40;
    return {
      fogDensity: 0.6 + (backFactor * 0.35),
      rimExposure: 0.1, // Almost no rim light, fully absorbed by fog
      ambientBleed: 0.9, // Almost completely tinted by the environment color
      shadowSoftness: 1.0,
      isSilhouette: backFactor > 0.5, // Turn to silhouettes in the deep back
      blurRadius: 3 + (backFactor * 4) // Heavy depth of field blur
    };
  }

  /**
   * Applies an animated "Fresnel" rim light pulse when the crowd energy spikes.
   * This creates the illusion of a stage strobe washing over the shoulders of the crowd.
   */
  public static calculateEnergyStrobe(baseExposure: number, beatIntensity: number): number {
    // Only pulse if there's a heavy bass hit or crowd energy spike
    if (beatIntensity > 0.8) {
      return baseExposure * (1 + (beatIntensity * 1.5));
    }
    return baseExposure;
  }
}