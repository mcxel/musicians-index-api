/**
 * TMI Host & Entity Registry
 * Defines 360 avatars, their roles, behaviors, and dialogue pack assignments.
 * Shows are locked: Tiara = Monday Night Stage + Yearly Contest
 *                   Michael Gregory = Battle of the Bands (primary)
 */

export type HostDef = {
  id: string;
  name: string;
  role: string;
  avatarClass: "human" | "mascot" | "robot";
  personalityCore: string;
  voiceProfile: string;
  avatarAsset: string;
  primaryShows: string[];
  backupShows: string[];
  dialoguePackRefs: string[];
  activeStatus: "active" | "standby" | "development";
  fallbackPriority: number; // lower = called first when primary unavailable
};

/** Show → host assignment contract (single source of truth) */
export const showHostMap: Record<string, { primary: string; backup: string }> = {
  "monday-night-stage":   { primary: "tiara",            backup: "gregory-marcel" },
  "yearly-contest":        { primary: "tiara",            backup: "ray-journey" },
  "battle-of-the-bands":  { primary: "michael-gregory",  backup: "tiara" },
  "monthly-idol":          { primary: "ray-journey",      backup: "tiara" },
  "world-dance-party":     { primary: "finny-maxwell",    backup: "record-ralph" },
  "cypher-arena":          { primary: "gregory-marcel",   backup: "michael-gregory" },
  "name-that-tune":        { primary: "finny-maxwell",    backup: "ray-journey" },
  "deal-or-feud":          { primary: "ray-journey",      backup: "gregory-marcel" },
  "circles-squares":       { primary: "finny-maxwell",    backup: "tiara" },
  "dirty-dozens":          { primary: "gregory-marcel",   backup: "michael-gregory" },
  "crown-reveal":          { primary: "tiara",            backup: "ray-journey" },
  "sponsor-giveaway-drop": { primary: "julius-meerkat",   backup: "tiara" },
  "watch-party":           { primary: "record-ralph",     backup: "finny-maxwell" },
};

export const hostRegistry: Record<string, HostDef> = {
  "tiara": {
    id: "tiara",
    name: "Tiara",
    role: "Monday Night Stage Host / Yearly Contest Host",
    avatarClass: "human",
    personalityCore: "Commanding, warm, magnetic stage presence — crowd connector",
    voiceProfile: "powerful-r&b-cadence",
    avatarAsset: "/tmi-curated/host-2.png",
    primaryShows: ["monday-night-stage", "yearly-contest", "crown-reveal"],
    backupShows: ["monthly-idol", "battle-of-the-bands", "cypher-arena"],
    dialoguePackRefs: ["monday-open", "crown-handoff", "crowd-warmup", "contest-finals", "winner-announcement"],
    activeStatus: "active",
    fallbackPriority: 1,
  },
  "michael-gregory": {
    id: "michael-gregory",
    name: "Michael Gregory",
    role: "Battle of the Bands Host",
    avatarClass: "human",
    personalityCore: "Authoritative, high-energy, rock-and-roll gravitas",
    voiceProfile: "deep-broadcast-tenor",
    avatarAsset: "/tmi-curated/host-3.png",
    primaryShows: ["battle-of-the-bands"],
    backupShows: ["yearly-contest", "cypher-arena", "dirty-dozens"],
    dialoguePackRefs: ["bands-intro", "round-callout", "winner-reveal", "emergency-fill"],
    activeStatus: "active",
    fallbackPriority: 2,
  },
  "gregory-marcel": {
    id: "gregory-marcel",
    name: "Gregory Marcel",
    role: "Monday Stage Host / Cypher Host",
    avatarClass: "human",
    personalityCore: "Slick, polished, charismatic",
    voiceProfile: "smooth-alabama-cadence",
    avatarAsset: "/tmi-curated/host-main.png",
    primaryShows: ["cypher-arena", "dirty-dozens"],
    backupShows: ["monday-night-stage", "deal-or-feud"],
    dialoguePackRefs: ["monday-intro", "crowd-rescue", "robot-trigger", "cypher-open"],
    activeStatus: "active",
    fallbackPriority: 3,
  },
  "ray-journey": {
    id: "ray-journey",
    name: "Ray Journey",
    role: "Grand Contest / Monthly Idol Host",
    avatarClass: "human",
    personalityCore: "Professional, elevated, dramatic",
    voiceProfile: "upbeat-announcer",
    avatarAsset: "/tmi-curated/host-4.png",
    primaryShows: ["monthly-idol", "deal-or-feud"],
    backupShows: ["yearly-contest", "circles-squares"],
    dialoguePackRefs: ["contestant-intro", "prize-reveal", "finals-transition", "idol-judging"],
    activeStatus: "active",
    fallbackPriority: 4,
  },
  "finny-maxwell": {
    id: "finny-maxwell",
    name: "Finny Maxwell",
    role: "World Dance Party / Game Show Host",
    avatarClass: "human",
    personalityCore: "Hype, playful, crowd-driven energy",
    voiceProfile: "high-energy-dj-cadence",
    avatarAsset: "/tmi-curated/host-main.png",
    primaryShows: ["world-dance-party", "name-that-tune", "circles-squares"],
    backupShows: ["monthly-idol", "sponsor-giveaway-drop"],
    dialoguePackRefs: ["dance-open", "tune-reveal", "squares-callout", "hype-fill"],
    activeStatus: "active",
    fallbackPriority: 5,
  },
  "record-ralph": {
    id: "record-ralph",
    name: "Record Ralph",
    role: "DJ / Watch Party Host",
    avatarClass: "robot",
    personalityCore: "Smooth AI DJ with personality — cool and technical",
    voiceProfile: "synthesized-cool-cadence",
    avatarAsset: "/tmi-curated/host-2.png",
    primaryShows: ["watch-party", "world-dance-party"],
    backupShows: ["name-that-tune", "sponsor-giveaway-drop"],
    dialoguePackRefs: ["dj-set-intro", "party-drop", "watch-party-open", "outro-mix"],
    activeStatus: "active",
    fallbackPriority: 6,
  },
  "julius-meerkat": {
    id: "julius-meerkat",
    name: "Julius",
    role: "Magic Interaction Utility / Giveaway Host",
    avatarClass: "mascot",
    personalityCore: "Clever, mischievous, stylish",
    voiceProfile: "cheeky-chime",
    avatarAsset: "/tmi-curated/julius.png",
    primaryShows: ["sponsor-giveaway-drop"],
    backupShows: ["name-that-tune", "poll-events"],
    dialoguePackRefs: ["poll-reveal", "trivia-prompt", "reward-popout", "giveaway-open", "surprise-drop"],
    activeStatus: "active",
    fallbackPriority: 7,
  },
};

export function getHostForShow(showId: string): HostDef | undefined {
  const assignment = showHostMap[showId];
  if (!assignment) return undefined;
  return hostRegistry[assignment.primary];
}

export function getBackupHostForShow(showId: string): HostDef | undefined {
  const assignment = showHostMap[showId];
  if (!assignment) return undefined;
  return hostRegistry[assignment.backup];
}