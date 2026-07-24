export type VenueMode =
  | "arena"
  | "battle"
  | "cypher"
  | "lobby"
  | "stage"
  | "gameshow"
  | "backstage"
  | "producer";

export interface VenueAsset {
  mode: VenueMode;
  backgroundLoop: string;
  seatingLayout: "circle" | "rows" | "surrounding" | "theatre" | "pods" | "none";
  defaultLighting: {
    primaryColorHex: string;
    secondaryColorHex: string;
    intensity: number;
    strobe: boolean;
  };
  features: string[];
}

export interface Host {
  slug: string;
  name: string;
  portraitUrl: string;
  assignedVenues: VenueMode[];
  introScript: string;
  aiPersona: string;
  status: "idle" | "announcing" | "cooldown";
}

export const VENUE_ASSET_REGISTRY: Record<VenueMode, VenueAsset> = {
  arena: {
    mode: "arena",
    backgroundLoop: "/assets/venues/world-dance-party.mp4",
    seatingLayout: "circle",
    defaultLighting: { primaryColorHex: "#FF2DAA", secondaryColorHex: "#00FFFF", intensity: 0.8, strobe: false },
    features: ["DJ Monitor", "Crowd Loop", "Lighting Rig", "Dance Floor Grid"],
  },
  battle: {
    mode: "battle",
    backgroundLoop: "/assets/venues/battle-arena.mp4",
    seatingLayout: "rows",
    defaultLighting: { primaryColorHex: "#FF4400", secondaryColorHex: "#FF2DAA", intensity: 0.95, strobe: false },
    features: ["Sponsor Panels", "Monitor Layout", "Spotlights", "Combat Ring"],
  },
  cypher: {
    mode: "cypher",
    backgroundLoop: "/assets/venues/cypher-arena.mp4",
    seatingLayout: "surrounding",
    defaultLighting: { primaryColorHex: "#00FFFF", secondaryColorHex: "#AA2DFF", intensity: 0.75, strobe: false },
    features: ["Panel Skin", "Media Wall", "Laser Strips", "Vibe Indicator"],
  },
  lobby: {
    mode: "lobby",
    backgroundLoop: "/assets/venues/world-dance-party.mp4",
    seatingLayout: "circle",
    defaultLighting: { primaryColorHex: "#FFD700", secondaryColorHex: "#FF2DAA", intensity: 0.7, strobe: false },
    features: ["Leaderboard Panel", "Global Chat", "Social Ring"],
  },
  stage: {
    mode: "stage",
    backgroundLoop: "/assets/venues/monday-stage.mp4",
    seatingLayout: "theatre",
    defaultLighting: { primaryColorHex: "#FF2DAA", secondaryColorHex: "#FFD700", intensity: 0.8, strobe: false },
    features: ["Red Velvet Curtains", "Dynamic Backlight", "Microphone Stand"],
  },
  gameshow: {
    mode: "gameshow",
    backgroundLoop: "/assets/venues/deal-or-feud.mp4",
    seatingLayout: "pods",
    defaultLighting: { primaryColorHex: "#FFD700", secondaryColorHex: "#00FFFF", intensity: 0.9, strobe: false },
    features: ["Display Walls", "Player Pods", "Sponsor Board", "Buzzer HUD"],
  },
  backstage: {
    mode: "backstage",
    backgroundLoop: "/assets/venues/monday-stage.mp4",
    seatingLayout: "none",
    defaultLighting: { primaryColorHex: "#4ade80", secondaryColorHex: "#00FFFF", intensity: 0.6, strobe: false },
    features: ["Mirror Vanity", "Green Room Sofas", "Security Door"],
  },
  producer: {
    mode: "producer",
    backgroundLoop: "/assets/venues/cypher-arena.mp4",
    seatingLayout: "none",
    defaultLighting: { primaryColorHex: "#AA2DFF", secondaryColorHex: "#00FFFF", intensity: 0.6, strobe: false },
    features: ["Mixing Board", "Studio Monitors", "DAW Visualization"],
  },
};

export const HOST_REGISTRY: Record<string, Host> = {
  "julius": {
    slug: "julius",
    name: "Julius",
    portraitUrl: "/assets/hosts/julius.webp",
    assignedVenues: ["battle", "cypher"],
    introScript: "Welcome to the Arena! Step up, tune in, and drop your best bars.",
    aiPersona: "Analytical, strict hip-hop battle judge who values flow and delivery.",
    status: "idle",
  },
  "big-ace": {
    slug: "big-ace",
    name: "Big Ace",
    portraitUrl: "/assets/hosts/big-ace.png",
    assignedVenues: ["gameshow"],
    introScript: "Big Ace is in the house! Are you ready to deal, feud, and win big?",
    aiPersona: "High-energy, charismatic game show host who loves crowd excitement.",
    status: "idle",
  },
  "michael-charlie": {
    slug: "michael-charlie",
    name: "Michael Charlie",
    portraitUrl: "/assets/hosts/michael-charlie.png",
    assignedVenues: ["stage"],
    introScript: "Good evening. Welcome to Monday Night Stage. Let the performance begin.",
    aiPersona: "Sophisticated master of ceremonies, refined and elegant in speech.",
    status: "idle",
  },
  "record-ralph": {
    slug: "record-ralph",
    name: "DJ Record Ralph",
    portraitUrl: "/assets/hosts/record-ralph.webp",
    assignedVenues: ["arena"],
    introScript: "Vibe check! DJ Record Ralph spinning live. Let me see those hands in the air!",
    aiPersona: "Passionate club DJ and hype man who thrives on dance floor rhythms.",
    status: "idle",
  },
  "tiana": {
    slug: "tiana",
    name: "Tiana",
    portraitUrl: "/assets/hosts/tiana.webp",
    assignedVenues: ["stage", "backstage"],
    introScript: "Hey performers! Keep the energy high, and give the crowd everything you've got!",
    aiPersona: "Warm, encouraging backstage host focused on performer support.",
    status: "idle",
  },
};
