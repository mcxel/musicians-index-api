export type LiveVisibility = "public" | "private";

export type LiveEventWindow = {
  id: string;
  title: string;
  category: string;
  startsAt: Date;
  endsAt: Date;
  cooldownEndsAt: Date;
  nextRotationAt: Date;
  genrePool: string[];
  activeGenre: string;
  autoRestart: boolean;
  visibility: LiveVisibility;
};

export type EventScheduleType = "weekly-fixed" | "weekly-flex";

export type LiveEventTemplate = {
  id: string;
  title: string;
  category: string;
  visibility: LiveVisibility;
  scheduleType: EventScheduleType;
  weekday: number;
  hour: number;
  minute: number;
  durationMinutes: number;
  cooldownMinutes?: number;
  autoRestart: boolean;
  genrePool: string[];
  flexHours?: number[];
};

export const GLOBAL_GENRE_POOL = [
  "Hip-Hop",
  "R&B",
  "Rock",
  "Country",
  "Pop",
  "Metal",
  "Jazz",
  "Soul",
  "Electronic",
] as const;

const COMMON_GENRES = [...GLOBAL_GENRE_POOL];

export const LIVE_EVENT_REGISTRY: LiveEventTemplate[] = [
  {
    id: "main-cypher",
    title: "Main Cypher",
    category: "cypher",
    visibility: "public",
    scheduleType: "weekly-fixed",
    weekday: 0,
    hour: 17,
    minute: 0,
    durationMinutes: 120,
    autoRestart: true,
    genrePool: COMMON_GENRES,
  },
  {
    id: "monday-night-stage",
    title: "Monday Night Stage",
    category: "stage",
    visibility: "public",
    scheduleType: "weekly-flex",
    weekday: 1,
    hour: 18,
    minute: 0,
    flexHours: [18, 19, 20],
    durationMinutes: 110,
    autoRestart: true,
    genrePool: COMMON_GENRES,
  },
  {
    id: "battle-of-the-bands",
    title: "Battle of the Bands",
    category: "contest",
    visibility: "public",
    scheduleType: "weekly-fixed",
    weekday: 5,
    hour: 20,
    minute: 0,
    durationMinutes: 140,
    autoRestart: true,
    genrePool: COMMON_GENRES,
  },
  {
    id: "weekly-contest",
    title: "Weekly Contest",
    category: "contest",
    visibility: "public",
    scheduleType: "weekly-fixed",
    weekday: 3,
    hour: 19,
    minute: 0,
    durationMinutes: 90,
    autoRestart: true,
    genrePool: COMMON_GENRES,
  },
  {
    id: "beat-drop",
    title: "Beat Drop",
    category: "beat-battle",
    visibility: "public",
    scheduleType: "weekly-fixed",
    weekday: 6,
    hour: 21,
    minute: 0,
    durationMinutes: 55,
    autoRestart: true,
    genrePool: COMMON_GENRES,
  },
  {
    id: "ticket-drop",
    title: "Ticket Drop",
    category: "tickets",
    visibility: "public",
    scheduleType: "weekly-fixed",
    weekday: 4,
    hour: 18,
    minute: 30,
    durationMinutes: 30,
    autoRestart: true,
    genrePool: COMMON_GENRES,
  },
  {
    id: "sponsor-giveaway",
    title: "Sponsor Giveaway",
    category: "giveaway",
    visibility: "public",
    scheduleType: "weekly-fixed",
    weekday: 2,
    hour: 20,
    minute: 0,
    durationMinutes: 40,
    autoRestart: true,
    genrePool: COMMON_GENRES,
  },
  {
    id: "venue-reset",
    title: "Venue Reset",
    category: "venue-reset",
    visibility: "private",
    scheduleType: "weekly-fixed",
    weekday: 0,
    hour: 4,
    minute: 0,
    durationMinutes: 20,
    autoRestart: true,
    genrePool: COMMON_GENRES,
  },
  {
    id: "game-room-reset",
    title: "Game Room Reset",
    category: "room-reset",
    visibility: "private",
    scheduleType: "weekly-fixed",
    weekday: 0,
    hour: 4,
    minute: 30,
    durationMinutes: 20,
    autoRestart: true,
    genrePool: COMMON_GENRES,
  },
];
