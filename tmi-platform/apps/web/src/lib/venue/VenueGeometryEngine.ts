export type GeometryMode =
  | "U_SHAPED_AMPHITHEATER"
  | "C_SHAPED_OPERA_BALCONY"
  | "RECTANGULAR_CLUB_FLOOR"
  | "ROUND_PROSCENIUM_STAGE";

export interface SeatZone {
  id: string;
  label: string;
  capacity: number;
  tier: "floor" | "balcony" | "vip" | "standing";
  clipPath: string;
}

export interface VenueGeometryProfile {
  id: GeometryMode;
  name: string;
  description: string;
  svgViewBox: string;
  svgAudiencePath: string;
  svgStagePath: string;
  stagePosition: "bottom" | "top" | "center" | "front";
  balconyLevels: number;
  capacityMultiplier: number;
  seatZones: SeatZone[];
  tags: string[];
}

const PROFILES: VenueGeometryProfile[] = [
  {
    id: "U_SHAPED_AMPHITHEATER",
    name: "U-Shaped Amphitheater",
    description: "Audience wraps around three sides of the stage — maximum crowd energy and sightlines.",
    svgViewBox: "0 0 100 80",
    svgAudiencePath: "M10,70 L10,20 Q10,5 25,5 L75,5 Q90,5 90,20 L90,70 L70,70 L70,30 Q70,20 60,20 L40,20 Q30,20 30,30 L30,70 Z",
    svgStagePath: "M35,55 L65,55 L65,72 L35,72 Z",
    stagePosition: "bottom",
    balconyLevels: 0,
    capacityMultiplier: 1.4,
    seatZones: [
      { id: "floor-center", label: "Floor Center", capacity: 120, tier: "floor", clipPath: "polygon(15% 100%, 85% 100%, 85% 40%, 15% 40%)" },
      { id: "left-wing", label: "Left Wing", capacity: 60, tier: "floor", clipPath: "polygon(0% 100%, 20% 100%, 20% 20%, 0% 20%)" },
      { id: "right-wing", label: "Right Wing", capacity: 60, tier: "floor", clipPath: "polygon(80% 100%, 100% 100%, 100% 20%, 80% 20%)" },
      { id: "vip-front", label: "VIP Front", capacity: 30, tier: "vip", clipPath: "polygon(30% 100%, 70% 100%, 70% 80%, 30% 80%)" },
    ],
    tags: ["amphitheater", "concert", "festival", "cypher"],
  },
  {
    id: "C_SHAPED_OPERA_BALCONY",
    name: "C-Shaped Opera Balcony",
    description: "Classical opera layout with curved balcony tiers — elevated rear and side seating.",
    svgViewBox: "0 0 100 80",
    svgAudiencePath: "M15,75 L15,35 Q15,10 30,8 L70,8 Q85,10 85,35 L85,75 L65,75 L65,40 Q65,28 55,26 L45,26 Q35,28 35,40 L35,75 Z",
    svgStagePath: "M30,60 L70,60 L72,75 L28,75 Z",
    stagePosition: "bottom",
    balconyLevels: 2,
    capacityMultiplier: 1.6,
    seatZones: [
      { id: "orchestra", label: "Orchestra", capacity: 80, tier: "floor", clipPath: "polygon(20% 100%, 80% 100%, 75% 55%, 25% 55%)" },
      { id: "balcony-1", label: "Balcony Tier 1", capacity: 100, tier: "balcony", clipPath: "polygon(10% 55%, 90% 55%, 90% 30%, 10% 30%)" },
      { id: "balcony-2", label: "Balcony Tier 2", capacity: 80, tier: "balcony", clipPath: "polygon(12% 30%, 88% 30%, 85% 10%, 15% 10%)" },
      { id: "vip-box-left", label: "VIP Box Left", capacity: 20, tier: "vip", clipPath: "polygon(0% 55%, 15% 55%, 15% 30%, 0% 30%)" },
      { id: "vip-box-right", label: "VIP Box Right", capacity: 20, tier: "vip", clipPath: "polygon(85% 55%, 100% 55%, 100% 30%, 85% 30%)" },
    ],
    tags: ["opera", "theater", "formal", "interview"],
  },
  {
    id: "RECTANGULAR_CLUB_FLOOR",
    name: "Rectangular Club Floor",
    description: "Flat standing floor with stage at one end — max energy, street-level intimacy.",
    svgViewBox: "0 0 100 80",
    svgAudiencePath: "M5,75 L5,20 L95,20 L95,75 Z",
    svgStagePath: "M10,5 L90,5 L90,22 L10,22 Z",
    stagePosition: "top",
    balconyLevels: 0,
    capacityMultiplier: 1.0,
    seatZones: [
      { id: "standing-floor", label: "Standing Floor", capacity: 200, tier: "standing", clipPath: "polygon(5% 100%, 95% 100%, 95% 40%, 5% 40%)" },
      { id: "front-rail", label: "Front Rail", capacity: 40, tier: "vip", clipPath: "polygon(10% 40%, 90% 40%, 90% 55%, 10% 55%)" },
      { id: "bar-zone", label: "Bar / Chill Zone", capacity: 60, tier: "standing", clipPath: "polygon(5% 55%, 95% 55%, 95% 100%, 5% 100%)" },
    ],
    tags: ["club", "bar", "hip-hop", "dj", "listening-party"],
  },
  {
    id: "ROUND_PROSCENIUM_STAGE",
    name: "Round Proscenium Stage",
    description: "Circular thrust stage with 270° audience — performer at center, no bad seats.",
    svgViewBox: "0 0 100 100",
    svgAudiencePath: "M50,5 A45,45 0 1,1 49.9,5 Z M50,28 A22,22 0 1,0 49.9,28 Z",
    svgStagePath: "M50,28 A22,22 0 1,1 49.9,28 Z",
    stagePosition: "center",
    balconyLevels: 1,
    capacityMultiplier: 1.2,
    seatZones: [
      { id: "inner-ring", label: "Inner Ring", capacity: 60, tier: "vip", clipPath: "polygon(50% 50%, 50% 0%, 85% 15%, 100% 50%, 85% 85%, 50% 100%, 15% 85%, 0% 50%, 15% 15%)" },
      { id: "outer-ring", label: "Outer Ring", capacity: 120, tier: "floor", clipPath: "polygon(50% 50%, 50% 0%, 100% 0%, 100% 100%, 0% 100%, 0% 0%, 50% 0%)" },
      { id: "balcony-ring", label: "Balcony Ring", capacity: 80, tier: "balcony", clipPath: "polygon(50% 50%, 50% 5%, 95% 50%, 50% 95%, 5% 50%)" },
    ],
    tags: ["theater-in-the-round", "proscenium", "award-ceremony", "talk-show"],
  },
];

export function listGeometryProfiles(): VenueGeometryProfile[] {
  return PROFILES;
}

export function getGeometryProfile(id: GeometryMode): VenueGeometryProfile | undefined {
  return PROFILES.find(p => p.id === id);
}

export function getProfilesByTag(tag: string): VenueGeometryProfile[] {
  return PROFILES.filter(p => p.tags.includes(tag));
}

export function getDefaultProfile(): VenueGeometryProfile {
  return PROFILES[0];
}
