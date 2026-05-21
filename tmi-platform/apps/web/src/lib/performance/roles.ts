export type CreatorRole =
  | "ARTIST"
  | "RAPPER"
  | "SINGER"
  | "DJ"
  | "PRODUCER"
  | "COMEDIAN"
  | "DANCER"
  | "HOST"
  | "BAND"
  | "ACTOR"
  | "CREATOR"
  | "PERFORMER";

export type UniversalTag =
  | "ENERGY"
  | "STAGE_PRESENCE"
  | "CROWD_ENGAGEMENT"
  | "CONFIDENCE"
  | "CREATIVITY"
  | "VISUAL_PERFORMANCE";

export type RoleTag =
  // Artist/Rapper/Singer
  | "FLOW" | "LYRICS" | "VOICE" | "HOOK" | "DELIVERY" | "EMOTION" | "ORIGINALITY"
  // Producer
  | "BEAT_ORIGINALITY" | "BOUNCE" | "SOUND_DESIGN" | "MIX_QUALITY" | "ARRANGEMENT" | "COMMERCIAL_POTENTIAL"
  // DJ
  | "TRANSITIONS" | "TRACK_SELECTION" | "TIMING" | "CROWD_CONTROL" | "MIXING" | "SET_ORIGINALITY"
  // Comedian
  | "JOKE_QUALITY" | "COMEDIC_TIMING" | "COMEDIC_DELIVERY" | "CROWD_REACTION" | "STAGE_CONFIDENCE"
  // Dancer
  | "MOVEMENT" | "RHYTHM" | "CHOREOGRAPHY" | "CAMERA_PRESENCE" | "STAGE_USAGE";

export type AllTag = UniversalTag | RoleTag;

export interface RoleTagConfig {
  role: CreatorRole;
  label: string;
  icon: string;
  universalTags: UniversalTag[];
  roleTags: RoleTag[];
}

export const ROLE_CONFIGS: Record<CreatorRole, RoleTagConfig> = {
  ARTIST: {
    role: "ARTIST", label: "Artist", icon: "🎤",
    universalTags: ["ENERGY", "STAGE_PRESENCE", "CROWD_ENGAGEMENT", "CONFIDENCE", "CREATIVITY"],
    roleTags: ["FLOW", "LYRICS", "VOICE", "HOOK", "DELIVERY", "EMOTION", "ORIGINALITY"],
  },
  RAPPER: {
    role: "RAPPER", label: "Rapper", icon: "🎵",
    universalTags: ["ENERGY", "CONFIDENCE", "CROWD_ENGAGEMENT", "CREATIVITY"],
    roleTags: ["FLOW", "LYRICS", "DELIVERY", "HOOK", "ORIGINALITY", "EMOTION"],
  },
  SINGER: {
    role: "SINGER", label: "Singer", icon: "🎶",
    universalTags: ["ENERGY", "STAGE_PRESENCE", "CROWD_ENGAGEMENT", "CONFIDENCE"],
    roleTags: ["VOICE", "HOOK", "DELIVERY", "EMOTION", "ORIGINALITY"],
  },
  DJ: {
    role: "DJ", label: "DJ", icon: "🎧",
    universalTags: ["ENERGY", "CROWD_ENGAGEMENT", "CREATIVITY", "CONFIDENCE"],
    roleTags: ["TRANSITIONS", "TRACK_SELECTION", "TIMING", "CROWD_CONTROL", "MIXING", "SET_ORIGINALITY"],
  },
  PRODUCER: {
    role: "PRODUCER", label: "Producer", icon: "🎛️",
    universalTags: ["CREATIVITY", "ENERGY"],
    roleTags: ["BEAT_ORIGINALITY", "BOUNCE", "SOUND_DESIGN", "MIX_QUALITY", "ARRANGEMENT", "COMMERCIAL_POTENTIAL"],
  },
  COMEDIAN: {
    role: "COMEDIAN", label: "Comedian", icon: "😂",
    universalTags: ["ENERGY", "STAGE_PRESENCE", "CROWD_ENGAGEMENT", "CONFIDENCE"],
    roleTags: ["JOKE_QUALITY", "COMEDIC_TIMING", "COMEDIC_DELIVERY", "CROWD_REACTION", "STAGE_CONFIDENCE"],
  },
  DANCER: {
    role: "DANCER", label: "Dancer", icon: "💃",
    universalTags: ["ENERGY", "STAGE_PRESENCE", "VISUAL_PERFORMANCE", "CONFIDENCE", "CREATIVITY"],
    roleTags: ["MOVEMENT", "RHYTHM", "CHOREOGRAPHY", "CAMERA_PRESENCE", "STAGE_USAGE"],
  },
  HOST: {
    role: "HOST", label: "Host", icon: "🎙️",
    universalTags: ["ENERGY", "CROWD_ENGAGEMENT", "CONFIDENCE", "CREATIVITY"],
    roleTags: ["DELIVERY", "CROWD_REACTION", "COMEDIC_TIMING", "STAGE_CONFIDENCE"],
  },
  BAND: {
    role: "BAND", label: "Band", icon: "🎸",
    universalTags: ["ENERGY", "STAGE_PRESENCE", "CROWD_ENGAGEMENT", "CREATIVITY"],
    roleTags: ["ARRANGEMENT", "ORIGINALITY", "HOOK", "MIXING", "EMOTION"],
  },
  ACTOR: {
    role: "ACTOR", label: "Actor", icon: "🎭",
    universalTags: ["ENERGY", "STAGE_PRESENCE", "CONFIDENCE", "CREATIVITY", "VISUAL_PERFORMANCE"],
    roleTags: ["DELIVERY", "EMOTION", "STAGE_CONFIDENCE", "CROWD_REACTION"],
  },
  CREATOR: {
    role: "CREATOR", label: "Creator", icon: "📱",
    universalTags: ["ENERGY", "CREATIVITY", "CROWD_ENGAGEMENT", "CONFIDENCE"],
    roleTags: ["ORIGINALITY", "DELIVERY", "COMMERCIAL_POTENTIAL"],
  },
  PERFORMER: {
    role: "PERFORMER", label: "Performer", icon: "⭐",
    universalTags: ["ENERGY", "STAGE_PRESENCE", "CROWD_ENGAGEMENT", "CONFIDENCE", "CREATIVITY", "VISUAL_PERFORMANCE"],
    roleTags: ["DELIVERY", "ORIGINALITY", "EMOTION", "STAGE_CONFIDENCE"],
  },
};

export function getRoleConfig(role: CreatorRole): RoleTagConfig {
  return ROLE_CONFIGS[role] ?? ROLE_CONFIGS.PERFORMER;
}

export const TAG_LABELS: Record<AllTag, string> = {
  ENERGY:              "Energy",
  STAGE_PRESENCE:      "Stage Presence",
  CROWD_ENGAGEMENT:    "Crowd Engagement",
  CONFIDENCE:          "Confidence",
  CREATIVITY:          "Creativity",
  VISUAL_PERFORMANCE:  "Visual Performance",
  FLOW:                "Flow",
  LYRICS:              "Lyrics",
  VOICE:               "Voice",
  HOOK:                "Hook",
  DELIVERY:            "Delivery",
  EMOTION:             "Emotion",
  ORIGINALITY:         "Originality",
  BEAT_ORIGINALITY:    "Beat Originality",
  BOUNCE:              "Bounce",
  SOUND_DESIGN:        "Sound Design",
  MIX_QUALITY:         "Mix Quality",
  ARRANGEMENT:         "Arrangement",
  COMMERCIAL_POTENTIAL:"Commercial Potential",
  TRANSITIONS:         "Transitions",
  TRACK_SELECTION:     "Track Selection",
  TIMING:              "Timing",
  CROWD_CONTROL:       "Crowd Control",
  MIXING:              "Mixing",
  SET_ORIGINALITY:     "Set Originality",
  JOKE_QUALITY:        "Joke Quality",
  COMEDIC_TIMING:      "Timing",
  COMEDIC_DELIVERY:    "Delivery",
  CROWD_REACTION:      "Crowd Reaction",
  STAGE_CONFIDENCE:    "Stage Confidence",
  MOVEMENT:            "Movement",
  RHYTHM:              "Rhythm",
  CHOREOGRAPHY:        "Choreography",
  CAMERA_PRESENCE:     "Camera Presence",
  STAGE_USAGE:         "Stage Usage",
};
