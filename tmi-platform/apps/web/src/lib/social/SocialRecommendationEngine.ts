export type RecommendationType = 'friend' | 'room' | 'artist' | 'group';

export interface RecommendationItem {
  id: string;
  type: RecommendationType;
  score: number;
  title: string;
  reason: string;
}

const USER_SIGNALS = new Map<string, {
  likedGenres: string[];
  joinedRooms: string[];
  followedArtists: string[];
  groups: string[];
}>();

export class SocialRecommendationEngine {
  static updateSignals(userId: string, signals: Partial<{
    likedGenres: string[];
    joinedRooms: string[];
    followedArtists: string[];
    groups: string[];
  }>): void {
    const current = USER_SIGNALS.get(userId) || {
      likedGenres: [],
      joinedRooms: [],
      followedArtists: [],
      groups: [],
    };

    USER_SIGNALS.set(userId, {
      likedGenres: signals.likedGenres || current.likedGenres,
      joinedRooms: signals.joinedRooms || current.joinedRooms,
      followedArtists: signals.followedArtists || current.followedArtists,
      groups: signals.groups || current.groups,
    });
  }

  static recommend(userId: string, limit: number = 20): RecommendationItem[] {
    const s = USER_SIGNALS.get(userId) || {
      likedGenres: ['hip-hop'],
      joinedRooms: [],
      followedArtists: [],
      groups: [],
    };

    const items: RecommendationItem[] = [
      ...s.followedArtists.slice(0, 5).map((artist, i) => ({
        id: `artist:${artist}`,
        type: 'artist' as const,
        score: 90 - i,
        title: artist,
        reason: 'You already follow related performers',
      })),
      ...s.joinedRooms.slice(0, 5).map((room, i) => ({
        id: `room:${room}`,
        type: 'room' as const,
        score: 84 - i,
        title: room,
        reason: 'Rooms similar to your recent activity',
      })),
      ...s.groups.slice(0, 5).map((group, i) => ({
        id: `group:${group}`,
        type: 'group' as const,
        score: 78 - i,
        title: group,
        reason: 'Groups aligned with your memory and chat patterns',
      })),
      ...s.likedGenres.slice(0, 5).map((genre, i) => ({
        id: `friend:${genre}:${i}`,
        type: 'friend' as const,
        score: 72 - i,
        title: `${genre} fan #${i + 1}`,
        reason: 'Potential friend based on shared genre affinity',
      })),
    ];

    return items.sort((a, b) => b.score - a.score).slice(0, limit);
  }
}

export default SocialRecommendationEngine;
