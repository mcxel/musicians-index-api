export type TmiDanceFloorZone = {
  id: string;
  label: string;
  capacity: number;
  intensity: number;
};

export type TmiVenueDanceFloorRuntime = {
  venueId: string;
  bpm: number;
  zones: TmiDanceFloorZone[];
};

export function getVenueDanceFloorRuntime(venueId: string): TmiVenueDanceFloorRuntime {
  return {
    venueId,
    bpm: 124,
    zones: [
      { id: `${venueId}-df-main`, label: "Main Floor", capacity: 220, intensity: 0.9 },
      { id: `${venueId}-df-side-a`, label: "Side A", capacity: 80, intensity: 0.7 },
      { id: `${venueId}-df-side-b`, label: "Side B", capacity: 80, intensity: 0.68 },
    ],
  };
}
