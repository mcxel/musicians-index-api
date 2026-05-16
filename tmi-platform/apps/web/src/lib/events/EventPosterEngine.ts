// Event Poster Engine
// Generates typed poster payloads for: venue, artist, contest, battle, cypher
// Consumed by EventPosterCard, Home 3, and any event listing surface

export type PosterType = "venue" | "artist" | "contest" | "battle" | "cypher";

export type EventPosterPayload = {
  id: string;
  type: PosterType;
  title: string;
  subtitle: string;
  date: string;
  venue: string;
  genre: string;
  accent: string;
  prizeAmount?: string;
  ticketHref: string;
  detailHref: string;
  artist1?: string;
  artist2?: string;
  isLive: boolean;
  countdownMinutes: number;
  sponsorId?: string;
};

// Static seed — swap for API call when events service is live
const POSTER_SEED: EventPosterPayload[] = [
  {
    id: "monday-night-stage",
    type: "venue",
    title: "Monday Night Stage",
    subtitle: "Hosted by Marcel Dickens",
    date: "Every Monday · 8PM",
    venue: "TMI Arena · Houston, TX",
    genre: "All Genres",
    accent: "#FF2DAA",
    ticketHref: "/events/monday-night-stage",
    detailHref: "/events/monday-night-stage",
    isLive: false,
    countdownMinutes: 0,
  },
  {
    id: "crown-duel-night",
    type: "battle",
    title: "Crown Duel Night",
    subtitle: "Season 1 · Battle Rap Showdown",
    date: "Sat 10 May · 9PM",
    venue: "TMI Arena",
    genre: "Battle Rap",
    accent: "#AA2DFF",
    prizeAmount: "$12,500",
    ticketHref: "/events/crown-duel",
    detailHref: "/events/crown-duel",
    artist1: "KOVA",
    artist2: "Kase Duro",
    isLive: false,
    countdownMinutes: 47,
  },
  {
    id: "genre-drop-show",
    type: "artist",
    title: "Genre Drop Show",
    subtitle: "New releases · Live reveals",
    date: "Fri 9 May · 7PM",
    venue: "Live World",
    genre: "Afrobeats",
    accent: "#FFD700",
    ticketHref: "/events/genre-drop",
    detailHref: "/events/genre-drop",
    isLive: false,
    countdownMinutes: 112,
  },
  {
    id: "open-cypher-season-1",
    type: "cypher",
    title: "Open Cypher Season 1",
    subtitle: "All genres welcome · Host: KOVA",
    date: "Fri 9 May · 7PM",
    venue: "Cypher Room A",
    genre: "Open Genre",
    accent: "#00FF88",
    prizeAmount: "$2,000",
    ticketHref: "/cypher",
    detailHref: "/cypher",
    isLive: true,
    countdownMinutes: 0,
  },
  {
    id: "weekly-champion-contest",
    type: "contest",
    title: "Weekly Champion Contest",
    subtitle: "Submit your best verse · Fan vote decides",
    date: "Ends Sun 11 May",
    venue: "TMI Platform",
    genre: "Hip Hop",
    accent: "#FF6B35",
    prizeAmount: "$10,000",
    ticketHref: "/cypher",
    detailHref: "/cypher",
    isLive: false,
    countdownMinutes: 1440,
  },
  {
    id: "producer-cypher-night",
    type: "cypher",
    title: "Producer Cypher Night",
    subtitle: "Beat battles · Producer showcase",
    date: "Thu 8 May · 8PM",
    venue: "Cypher Room B",
    genre: "Electronic",
    accent: "#c4b5fd",
    prizeAmount: "$1,500",
    ticketHref: "/cypher",
    detailHref: "/cypher",
    isLive: false,
    countdownMinutes: 200,
  },
];

export function getAllEventPosters(): EventPosterPayload[] {
  return POSTER_SEED;
}

export function getEventPostersByType(type: PosterType): EventPosterPayload[] {
  return POSTER_SEED.filter((e) => e.type === type);
}

export function getLiveEventPosters(): EventPosterPayload[] {
  return POSTER_SEED.filter((e) => e.isLive);
}

export function getUpcomingEventPosters(limit = 3): EventPosterPayload[] {
  return POSTER_SEED
    .filter((e) => !e.isLive)
    .sort((a, b) => a.countdownMinutes - b.countdownMinutes)
    .slice(0, limit);
}

export function getFeaturedEventPoster(): EventPosterPayload {
  const live = getLiveEventPosters();
  return live[0] ?? POSTER_SEED[0];
}

export function getEventPosterById(id: string): EventPosterPayload | undefined {
  return POSTER_SEED.find((e) => e.id === id);
}

export function getBattlePosters(): EventPosterPayload[] {
  return getEventPostersByType("battle");
}

export function getCypherPosters(): EventPosterPayload[] {
  return getEventPostersByType("cypher");
}
