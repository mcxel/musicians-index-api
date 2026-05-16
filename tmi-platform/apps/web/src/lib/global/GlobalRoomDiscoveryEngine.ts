import { getLiveCountries } from "./GlobalActivityEngine";
import { getFlagEmoji } from "./FlagDisplayEngine";

export interface GlobalRoom {
  roomId: string;
  title: string;
  country: string;
  countryCode: string;
  flag: string;
  genre: string;
  language: string;
  captionAvailable: boolean;
  translationAvailable: boolean;
  activeUsers: number;
  isLive: boolean;
  route: string;
  accentColor: string;
}

export interface RoomFilter {
  country?: string;
  language?: string;
  genre?: string;
  captionRequired?: boolean;
  liveOnly?: boolean;
}

const GENRE_BY_COUNTRY: Record<string, string> = {
  US: "Hip-Hop", NG: "Afrobeats", GB: "Grime", JM: "Dancehall",
  BR: "Funk",    KR: "K-Hip-Hop", ZA: "Amapiano", GH: "Highlife",
  TT: "Soca",    JP: "J-Hip-Hop", FR: "French Rap", CO: "Reggaeton",
  IN: "Desi Hip-Hop", CA: "Hip-Hop",
};

const LANG_BY_COUNTRY: Record<string, string> = {
  US: "en", NG: "en/yo", GB: "en", JM: "patois",
  BR: "pt", KR: "ko",   ZA: "en/zu", GH: "en",
  TT: "en", JP: "ja",   FR: "fr",    CO: "es",
  IN: "hi", CA: "en",
};

const ACCENT_BY_COUNTRY: Record<string, string> = {
  US: "#00FFFF", NG: "#00FF88", GB: "#FF2DAA", JM: "#FFD700",
  BR: "#00FF88", KR: "#FF6B9D", ZA: "#FF9500", GH: "#FFD700",
  TT: "#FF2DAA", JP: "#AA2DFF", FR: "#00FFFF", CO: "#00FF88",
  IN: "#FFB347", CA: "#FF2DAA",
};

function buildRoomsFromActivity(): GlobalRoom[] {
  const countries = getLiveCountries();
  const rooms: GlobalRoom[] = [];
  for (const c of countries) {
    for (let i = 0; i < Math.min(c.activeRooms, 3); i++) {
      rooms.push({
        roomId: `${c.countryCode}-room-${i + 1}`,
        title: `${c.city} ${GENRE_BY_COUNTRY[c.countryCode] ?? "Music"} Room ${i + 1}`,
        country: c.country,
        countryCode: c.countryCode,
        flag: getFlagEmoji(c.countryCode),
        genre: GENRE_BY_COUNTRY[c.countryCode] ?? "Music",
        language: LANG_BY_COUNTRY[c.countryCode] ?? "en",
        captionAvailable: ["US", "NG", "GB", "JM", "BR", "KR", "JP", "FR", "IN", "CA"].includes(c.countryCode),
        translationAvailable: true,
        activeUsers: Math.max(5, Math.floor(c.activeFans / (c.activeRooms || 1))),
        isLive: c.activityLevel !== "empty" && c.activityLevel !== "low",
        route: `/live/rooms/${c.countryCode.toLowerCase()}-room-${i + 1}`,
        accentColor: ACCENT_BY_COUNTRY[c.countryCode] ?? "#00FFFF",
      });
    }
  }
  return rooms;
}

export function discoverGlobalRooms(filter?: RoomFilter): GlobalRoom[] {
  let rooms = buildRoomsFromActivity();
  if (!filter) return rooms;
  if (filter.country) rooms = rooms.filter(r => r.countryCode === filter.country?.toUpperCase());
  if (filter.language) rooms = rooms.filter(r => r.language.includes(filter.language!));
  if (filter.genre) rooms = rooms.filter(r => r.genre.toLowerCase().includes(filter.genre!.toLowerCase()));
  if (filter.captionRequired) rooms = rooms.filter(r => r.captionAvailable);
  if (filter.liveOnly) rooms = rooms.filter(r => r.isLive);
  return rooms;
}

export function getLiveGlobalRooms(): GlobalRoom[] {
  return discoverGlobalRooms({ liveOnly: true });
}

export function getRoomsByCountry(countryCode: string): GlobalRoom[] {
  return discoverGlobalRooms({ country: countryCode });
}

export function getFeaturedRooms(limit = 6): GlobalRoom[] {
  return getLiveGlobalRooms().slice(0, limit);
}
