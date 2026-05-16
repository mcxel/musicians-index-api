export type TmiVenueProp = {
  id: string;
  type: "screen" | "speaker" | "holo" | "banner";
  x: number;
  y: number;
  z: number;
  enabled: boolean;
};

export type TmiVenuePropRuntime = {
  venueId: string;
  props: TmiVenueProp[];
};

export function getVenuePropRuntime(venueId: string): TmiVenuePropRuntime {
  return {
    venueId,
    props: [
      { id: `${venueId}-prop-screen-main`, type: "screen", x: 0, y: 4, z: -10, enabled: true },
      { id: `${venueId}-prop-speaker-left`, type: "speaker", x: -8, y: 3, z: -8, enabled: true },
      { id: `${venueId}-prop-speaker-right`, type: "speaker", x: 8, y: 3, z: -8, enabled: true },
      { id: `${venueId}-prop-holo-center`, type: "holo", x: 0, y: 2, z: -2, enabled: true },
      { id: `${venueId}-prop-banner-sponsor`, type: "banner", x: 0, y: 5, z: -12, enabled: false },
    ],
  };
}
