export type TmiVenueEnvironmentRuntime = {
  venueId: string;
  atmosphere: "indoor-neon" | "open-air-night" | "festival-dusk";
  fogLevel: number;
  hazeLevel: number;
  temperatureC: number;
};

export function getVenueEnvironmentRuntime(venueId: string): TmiVenueEnvironmentRuntime {
  return {
    venueId,
    atmosphere: "indoor-neon",
    fogLevel: 0.24,
    hazeLevel: 0.36,
    temperatureC: 22,
  };
}
