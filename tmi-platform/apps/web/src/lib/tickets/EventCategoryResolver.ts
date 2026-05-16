/**
 * EventCategoryResolver
 * Universal event category resolution for ticketing metadata and ticket design hints.
 */

export type BaseEventCategory =
  | "concert"
  | "cypher"
  | "battle"
  | "festival"
  | "showcase"
  | "comedy"
  | "theater"
  | "conference"
  | "church-community"
  | "sports"
  | "boxing"
  | "mma"
  | "wrestling"
  | "tournament"
  | "dance-battle"
  | "game-tournament"
  | "school-event"
  | "private-event"
  | "custom";

export type EventCategory = BaseEventCategory | string;

export type EventCategoryProfile = {
  category: EventCategory;
  label: string;
  defaultTicketTheme:
    | "music-neon"
    | "sports-impact"
    | "conference-clean"
    | "community-warm"
    | "classic-stage"
    | "custom";
  requiresCompetitorNames: boolean;
  requiresTeamNames: boolean;
  supportsSeatMap: boolean;
  supportsSponsorStrip: boolean;
};

const KNOWN_PROFILES: Record<BaseEventCategory, EventCategoryProfile> = {
  concert: {
    category: "concert",
    label: "Concert",
    defaultTicketTheme: "music-neon",
    requiresCompetitorNames: false,
    requiresTeamNames: false,
    supportsSeatMap: true,
    supportsSponsorStrip: true,
  },
  cypher: {
    category: "cypher",
    label: "Cypher",
    defaultTicketTheme: "music-neon",
    requiresCompetitorNames: false,
    requiresTeamNames: false,
    supportsSeatMap: false,
    supportsSponsorStrip: true,
  },
  battle: {
    category: "battle",
    label: "Battle",
    defaultTicketTheme: "music-neon",
    requiresCompetitorNames: true,
    requiresTeamNames: false,
    supportsSeatMap: true,
    supportsSponsorStrip: true,
  },
  festival: {
    category: "festival",
    label: "Festival",
    defaultTicketTheme: "music-neon",
    requiresCompetitorNames: false,
    requiresTeamNames: false,
    supportsSeatMap: true,
    supportsSponsorStrip: true,
  },
  showcase: {
    category: "showcase",
    label: "Showcase",
    defaultTicketTheme: "classic-stage",
    requiresCompetitorNames: false,
    requiresTeamNames: false,
    supportsSeatMap: true,
    supportsSponsorStrip: true,
  },
  comedy: {
    category: "comedy",
    label: "Comedy Show",
    defaultTicketTheme: "classic-stage",
    requiresCompetitorNames: false,
    requiresTeamNames: false,
    supportsSeatMap: true,
    supportsSponsorStrip: true,
  },
  theater: {
    category: "theater",
    label: "Theater",
    defaultTicketTheme: "classic-stage",
    requiresCompetitorNames: false,
    requiresTeamNames: false,
    supportsSeatMap: true,
    supportsSponsorStrip: true,
  },
  conference: {
    category: "conference",
    label: "Conference",
    defaultTicketTheme: "conference-clean",
    requiresCompetitorNames: false,
    requiresTeamNames: false,
    supportsSeatMap: true,
    supportsSponsorStrip: true,
  },
  "church-community": {
    category: "church-community",
    label: "Church / Community Event",
    defaultTicketTheme: "community-warm",
    requiresCompetitorNames: false,
    requiresTeamNames: false,
    supportsSeatMap: true,
    supportsSponsorStrip: true,
  },
  sports: {
    category: "sports",
    label: "Sports Event",
    defaultTicketTheme: "sports-impact",
    requiresCompetitorNames: false,
    requiresTeamNames: true,
    supportsSeatMap: true,
    supportsSponsorStrip: true,
  },
  boxing: {
    category: "boxing",
    label: "Boxing",
    defaultTicketTheme: "sports-impact",
    requiresCompetitorNames: true,
    requiresTeamNames: false,
    supportsSeatMap: true,
    supportsSponsorStrip: true,
  },
  mma: {
    category: "mma",
    label: "MMA / UFC-style Fight",
    defaultTicketTheme: "sports-impact",
    requiresCompetitorNames: true,
    requiresTeamNames: false,
    supportsSeatMap: true,
    supportsSponsorStrip: true,
  },
  wrestling: {
    category: "wrestling",
    label: "Wrestling",
    defaultTicketTheme: "sports-impact",
    requiresCompetitorNames: true,
    requiresTeamNames: false,
    supportsSeatMap: true,
    supportsSponsorStrip: true,
  },
  tournament: {
    category: "tournament",
    label: "Tournament",
    defaultTicketTheme: "sports-impact",
    requiresCompetitorNames: false,
    requiresTeamNames: true,
    supportsSeatMap: true,
    supportsSponsorStrip: true,
  },
  "dance-battle": {
    category: "dance-battle",
    label: "Dance Battle",
    defaultTicketTheme: "music-neon",
    requiresCompetitorNames: true,
    requiresTeamNames: false,
    supportsSeatMap: true,
    supportsSponsorStrip: true,
  },
  "game-tournament": {
    category: "game-tournament",
    label: "Game Tournament",
    defaultTicketTheme: "sports-impact",
    requiresCompetitorNames: false,
    requiresTeamNames: true,
    supportsSeatMap: true,
    supportsSponsorStrip: true,
  },
  "school-event": {
    category: "school-event",
    label: "School Event",
    defaultTicketTheme: "community-warm",
    requiresCompetitorNames: false,
    requiresTeamNames: false,
    supportsSeatMap: true,
    supportsSponsorStrip: true,
  },
  "private-event": {
    category: "private-event",
    label: "Private Event",
    defaultTicketTheme: "classic-stage",
    requiresCompetitorNames: false,
    requiresTeamNames: false,
    supportsSeatMap: true,
    supportsSponsorStrip: true,
  },
  custom: {
    category: "custom",
    label: "Custom Event",
    defaultTicketTheme: "custom",
    requiresCompetitorNames: false,
    requiresTeamNames: false,
    supportsSeatMap: true,
    supportsSponsorStrip: true,
  },
};

const CATEGORY_ALIASES: Record<string, BaseEventCategory> = {
  concerts: "concert",
  cyphers: "cypher",
  battles: "battle",
  festivals: "festival",
  showcases: "showcase",
  "comedy-show": "comedy",
  "comedy-shows": "comedy",
  conferences: "conference",
  "church-events": "church-community",
  "community-events": "church-community",
  "school-events": "school-event",
  "private-events": "private-event",
  "mma-ufc-style-fights": "mma",
  "ufc-style-fights": "mma",
  "boxing-fights": "boxing",
  tournaments: "tournament",
};

export function resolveEventCategory(input: string): EventCategoryProfile {
  const normalized = input.trim().toLowerCase();
  const mappedRaw = normalized
    .replace(/\s+/g, "-")
    .replace(/&/g, "and");

  const mapped = CATEGORY_ALIASES[mappedRaw] ?? mappedRaw;

  const known = KNOWN_PROFILES[mapped as BaseEventCategory];
  if (known) return known;

  return {
    category: "custom",
    label: input.trim() || "Custom Event",
    defaultTicketTheme: "custom",
    requiresCompetitorNames: false,
    requiresTeamNames: false,
    supportsSeatMap: true,
    supportsSponsorStrip: true,
  };
}

export function listSupportedEventCategories(): EventCategoryProfile[] {
  return Object.values(KNOWN_PROFILES);
}
