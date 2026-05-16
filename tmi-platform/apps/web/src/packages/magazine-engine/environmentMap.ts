/**
 * TMI Environment Map
 * Defines the 6 truths for every room/arena inside the platform.
 */

export type EnvironmentDef = {
  id: string;
  type: "nightclub" | "bar" | "living-room" | "hole-in-the-wall" | "amphitheater" | "festival" | "stage";
  capacity: number;
  seatMap: string;
  compatibleEvents: string[];
  hostSupport: boolean;
  mood: "hype" | "chill" | "suspense" | "celebration" | "neon";
};

export const environmentMap: Record<string, EnvironmentDef> = {
  "cypher-arena": {
    id: "cypher-arena",
    type: "stage",
    capacity: 500,
    seatMap: "ring-stadium",
    compatibleEvents: ["cypher", "rap-battle", "freestyle"],
    hostSupport: true,
    mood: "hype",
  },
  "monthly-idol-main": {
    id: "monthly-idol-main",
    type: "amphitheater",
    capacity: 10000,
    seatMap: "stadium-bowl",
    compatibleEvents: ["idol-performance", "finals"],
    hostSupport: true,
    mood: "suspense",
  },
  "world-dance-floor": {
    id: "world-dance-floor",
    type: "festival",
    capacity: 2500,
    seatMap: "standing-only",
    compatibleEvents: ["dj-set", "dance-battle"],
    hostSupport: true,
    mood: "neon",
  }
};

export function getEnvironment(id: string): EnvironmentDef {
  return environmentMap[id];
}