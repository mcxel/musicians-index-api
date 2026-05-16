import { getLiveGlobalRooms, discoverGlobalRooms } from "@/lib/global/GlobalRoomDiscoveryEngine";
import { getGlobalDiscoveryFeed, getRecommendedCulturesForUser } from "@/lib/global/CultureDiscoveryEngine";
import { getLiveCountries, getCurrentPeakRegions } from "@/lib/global/GlobalActivityEngine";
import { getWorldTrendingFeed } from "@/lib/global/GlobalFeedEngine";
import { getCountry } from "@/lib/global/GlobalCountryRegistry";

export interface DiscoveryBotRecommendation {
  type: "room" | "country" | "culture" | "genre" | "artist";
  id: string;
  title: string;
  subtitle: string;
  countryCode: string;
  activityScore: number;
  reason: string;
}

export interface DiscoveryBotSession {
  userId: string;
  startedAt: number;
  recommendationsServed: number;
  countriesVisited: string[];
  roomsJoined: string[];
}

const sessions = new Map<string, DiscoveryBotSession>();
const seededRooms = new Set<string>();

export function startDiscoveryBotSession(userId: string): DiscoveryBotSession {
  const existing = sessions.get(userId);
  if (existing) return existing;

  const session: DiscoveryBotSession = {
    userId,
    startedAt: Date.now(),
    recommendationsServed: 0,
    countriesVisited: [],
    roomsJoined: [],
  };
  sessions.set(userId, session);
  return session;
}

export function getGlobalRoomRecommendations(userId: string, limit = 5): DiscoveryBotRecommendation[] {
  const rooms = getLiveGlobalRooms().slice(0, limit);
  const session = sessions.get(userId) ?? startDiscoveryBotSession(userId);

  const recs: DiscoveryBotRecommendation[] = rooms.map(room => ({
    type: "room",
    id: room.roomId,
    title: room.title,
    subtitle: `${room.countryCode} · ${room.genre} · ${room.activeUsers} listeners`,
    countryCode: room.countryCode,
    activityScore: room.activeUsers,
    reason: `Active room in ${room.countryCode} — join the ${room.genre} session`,
  }));

  session.recommendationsServed += recs.length;
  return recs;
}

export function getCountryDiscoveryRecommendations(userId: string, limit = 4): DiscoveryBotRecommendation[] {
  const liveCountries = getLiveCountries().slice(0, limit);
  const session = sessions.get(userId) ?? startDiscoveryBotSession(userId);

  const recs: DiscoveryBotRecommendation[] = liveCountries.map(activity => {
    const countryInfo = getCountry(activity.countryCode);
    return {
      type: "country",
      id: activity.countryCode,
      title: countryInfo?.name ?? activity.country,
      subtitle: `${countryInfo?.primaryGenre ?? "Global"} · ${activity.activeFans} active`,
      countryCode: activity.countryCode,
      activityScore: activity.activeRooms,
      reason: `${activity.countryCode} is live right now — explore the scene`,
    };
  });

  session.recommendationsServed += recs.length;
  return recs;
}

export function getCultureDiscoveryRecommendations(userId: string, limit = 4): DiscoveryBotRecommendation[] {
  const cultures = getRecommendedCulturesForUser(userId).slice(0, limit);
  const session = sessions.get(userId) ?? startDiscoveryBotSession(userId);

  const recs: DiscoveryBotRecommendation[] = cultures.map(c => ({
    type: "culture",
    id: `culture-${c.countryCode}`,
    title: c.featuredArtist,
    subtitle: `${c.countryCode} · ${c.genre} · ${c.language}`,
    countryCode: c.countryCode,
    activityScore: 5,
    reason: c.description,
  }));

  session.recommendationsServed += recs.length;
  return recs;
}

export function seedLowActivityRegions(): string[] {
  const allCountries = ["US", "NG", "GB", "JM", "BR", "KR", "ZA", "GH", "TT", "JP", "FR", "CO", "IN", "CA"];
  const liveSet = new Set(getLiveCountries().map(c => c.countryCode));
  return allCountries.filter(code => !liveSet.has(code));
}

export function seedGlobalRoomsForRegion(countryCode: string): DiscoveryBotRecommendation[] {
  const rooms = discoverGlobalRooms({ country: countryCode }).slice(0, 3);

  const recs: DiscoveryBotRecommendation[] = rooms.map(room => {
    const roomKey = `${countryCode}:${room.roomId}`;
    seededRooms.add(roomKey);
    return {
      type: "room",
      id: room.roomId,
      title: room.title,
      subtitle: `${room.countryCode} · ${room.genre}`,
      countryCode: room.countryCode,
      activityScore: room.activeUsers,
      reason: `Seeded room for low-activity region ${countryCode}`,
    };
  });

  return recs;
}

export function guideUserToActiveRoom(userId: string): DiscoveryBotRecommendation | null {
  const peakRegions = getCurrentPeakRegions();
  if (peakRegions.length === 0) return null;

  const topRegion = peakRegions[0].countryCode;
  const rooms = discoverGlobalRooms({ country: topRegion });
  if (rooms.length === 0) return null;

  const room = rooms[0];
  const session = sessions.get(userId) ?? startDiscoveryBotSession(userId);
  session.roomsJoined.push(room.roomId);

  return {
    type: "room",
    id: room.roomId,
    title: room.title,
    subtitle: `${room.countryCode} — most active right now`,
    countryCode: room.countryCode,
    activityScore: room.activeUsers,
    reason: `Peak activity in ${topRegion} — this is where the music is live`,

  };
}

export function getWorldTrendingRecommendations(limit = 6): DiscoveryBotRecommendation[] {
  const feed = getWorldTrendingFeed();
  return feed.slice(0, limit).map(item => ({
    type: "artist" as const,
    id: item.id,
    title: item.title,
    subtitle: `${item.countryCode} · trending`,
    countryCode: item.countryCode,
    activityScore: 8,
    reason: `Trending globally from ${item.countryCode}`,
  }));
}

export function getDiscoveryBotStats(): { totalSessions: number; totalRecommendations: number; seededRooms: number } {
  let totalRecommendations = 0;
  for (const session of sessions.values()) {
    totalRecommendations += session.recommendationsServed;
  }
  return {
    totalSessions: sessions.size,
    totalRecommendations,
    seededRooms: seededRooms.size,
  };
}

export function getDiscoveryBotSession(userId: string): DiscoveryBotSession | null {
  return sessions.get(userId) ?? null;
}
