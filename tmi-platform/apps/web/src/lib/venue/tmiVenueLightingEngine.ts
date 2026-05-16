export type TmiVenueLightRig = {
  id: string;
  color: string;
  intensity: number;
  angle: number;
  moving: boolean;
};

export type TmiVenueLightingRuntime = {
  venueId: string;
  preset: "showtime" | "warmup" | "ambient";
  rigs: TmiVenueLightRig[];
};

export function getVenueLightingRuntime(venueId: string): TmiVenueLightingRuntime {
  return {
    venueId,
    preset: "showtime",
    rigs: [
      { id: `${venueId}-light-front-left`, color: "#22d3ee", intensity: 0.88, angle: 25, moving: true },
      { id: `${venueId}-light-front-right`, color: "#f472b6", intensity: 0.86, angle: -25, moving: true },
      { id: `${venueId}-light-overhead`, color: "#a78bfa", intensity: 0.72, angle: 90, moving: false },
    ],
  };
}
