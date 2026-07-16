/**
 * PerformerRegistry — single source of truth for performer identity on TMI.
 *
 * Every surface (Home 1 orbital wheel, Home 1-2 billboard wall + portrait cards,
 * Home 3 live rooms, Home 5 battle entries, rankings, profile pages, articles)
 * should read from this file. One performer = one identity everywhere.
 */

// ── Identity shape ────────────────────────────────────────────────────────────

export type PerformerTier = 'FREE' | 'PRO' | 'RUBY' | 'Silver' | 'Gold' | 'Platinum' | 'Diamond';
export type PerformerCategory =
  | 'Hip-Hop' | 'R&B' | 'Pop' | 'EDM' | 'Gospel' | 'Rap' | 'Soul' | 'Funk'
  | 'Jazz' | 'Blues' | 'Rock' | 'Metal' | 'Latin' | 'Reggae' | 'Afrobeats'
  | 'Dancehall' | 'Country' | 'Indie' | 'Electronic' | 'Dance Crews'
  | 'Comedy' | 'Venues' | 'Sponsors' | 'Hip Hop Dance';

export interface PerformerSong {
  title: string;
  durationSec: number;
  audioUrl?: string;
  coverUrl?: string;
  streams?: number;
}

export interface PerformerMerchItem {
  name: string;
  price: number;
  imageUrl?: string;
  purchaseUrl: string;
}

export interface PerformerIdentity {
  /** Stable unique key — used as URL segment, room ID prefix, and lookup key */
  id: string;
  slug: string;
  name: string;

  /** Images — all originate from Dashboard Upload → PerformerRegistry → everywhere */
  profileImageUrl: string;
  coverImageUrl: string;

  /**
   * Motion Poster Pipeline (Rule 2):
   * Priority order when rendering: introVideoUrl → motionPosterUrl → profileImageUrl
   * 2-3 second animated intro (NBA/NFL/UFC style). Optional until artist uploads.
   */
  introVideoUrl?: string;
  motionPosterUrl?: string;

  /** Bio — single source, shows on profile + article + discovery cards */
  bio?: string;

  /** Catalog — uploaded via dashboard, surfaces on profile + article + playlist */
  songs?: PerformerSong[];

  /** Merch — links to external store or TMI merch engine */
  merch?: PerformerMerchItem[];

  /** Location */
  city: string;
  countryName: string;
  flag: string;

  /** Platform identity */
  category: PerformerCategory;
  tier: PerformerTier;

  /**
   * Lineup shape — drives which silhouette placeholder renders when no real
   * photo has been uploaded yet (Home 1 orbit, discovery cards). Undefined
   * for non-performer entries (venues, sponsors, events) in this registry.
   */
  lineupType?: 'solo' | 'duo' | 'band' | 'group';

  /**
   * Rank is XP-driven (Rule 4). Never set manually.
   * Use computeRanks() or derive from XP sort position.
   * Stored here for read performance but must match XP ordering.
   */
  rank: number;
  xp: number;

  /** Social metrics */
  fanCount: number;
  likes: number;

  /** Live state (Rule 3): if isLive, all pages must surface live panel over static image */
  isLive: boolean;
  audienceCount: number;
  timeLive: string;
  roomId: string;

  /** Achievement IDs — resolved by AchievementRegistry */
  achievementIds: string[];

  /** Navigation targets */
  profileRoute: string;
  liveRoomRoute: string;
  articleIds: string[];

  /**
   * Crown rotation (Rule 5): track when this performer first reached rank 1.
   * After 2 months, admin opens the rotation window.
   */
  crownSince?: string; // ISO date string

  /**
   * Account owner (Phase A-2 authorization).
   * Nullable: existing performers may not have claimed ownership yet.
   * Missing ownership means: public Yopho allowed, management controls denied.
   * Used by: /profile/performer/[slug] permission guard, API mutations.
   */
  ownerId?: string | null;
}

// ── Registry data ─────────────────────────────────────────────────────────────

export const PERFORMER_REGISTRY: PerformerIdentity[] = [
  {
    id: 'wavetek',
    slug: 'wavetek',
    name: 'Wavetek',
    profileImageUrl: '/artists/artist-01.png',
    coverImageUrl: '/tmi-curated/mag-20.jpg',
    city: 'Atlanta, GA', countryName: 'United States', flag: '🇺🇸',
    category: 'Hip-Hop', tier: 'Diamond', rank: 1, xp: 98400, lineupType: 'solo',
    fanCount: 28410, likes: 41200,
    isLive: false, audienceCount: 2841, timeLive: '47m',
    roomId: 'room-wavetek',
    achievementIds: ['crown-holder', 'diamond-tier', 'top-100'],
    profileRoute: '/performers/wavetek',
    liveRoomRoute: '/live/rooms/room-wavetek',
    articleIds: ['wavetek-spotlight', 'wavetek-interview-01'],
  },
  {
    id: 'astra-nova',
    slug: 'astra-nova',
    name: 'Astra Nova',
    profileImageUrl: '/artists/artist-02.png',
    coverImageUrl: '/tmi-curated/mag-28.jpg',
    city: 'London, UK', countryName: 'United Kingdom', flag: '🇬🇧',
    category: 'R&B', tier: 'Platinum', rank: 2, xp: 74200, lineupType: 'solo',
    fanCount: 12040, likes: 18300,
    isLive: false, audienceCount: 1204, timeLive: '31m',
    roomId: 'room-astra-nova',
    achievementIds: ['platinum-tier', 'top-100'],
    profileRoute: '/performers/astra-nova',
    liveRoomRoute: '/live/rooms/room-astra-nova',
    articleIds: ['astra-nova-spotlight'],
  },
  {
    id: 'dj-kraze',
    slug: 'dj-kraze',
    name: 'DJ Kraze',
    profileImageUrl: '/artists/artist-03.png',
    coverImageUrl: '/tmi-curated/mag-35.jpg',
    city: 'Los Angeles', countryName: 'United States', flag: '🇺🇸',
    category: 'EDM', tier: 'Diamond', rank: 1, xp: 102000, lineupType: 'solo',
    fanCount: 32000, likes: 47100,
    isLive: false, audienceCount: 3200, timeLive: '1h 12m',
    roomId: 'room-dj-kraze',
    achievementIds: ['diamond-tier', 'dj-champion', 'top-100'],
    profileRoute: '/performers/dj-kraze',
    liveRoomRoute: '/live/rooms/room-dj-kraze',
    articleIds: ['dj-kraze-spotlight'],
  },
  {
    id: 'bar-god',
    slug: 'bar-god',
    name: 'Bar God vs Nova',
    profileImageUrl: '/artists/artist-04.png',
    coverImageUrl: '/tmi-curated/mag-42.jpg',
    city: 'Chicago, IL', countryName: 'United States', flag: '🇺🇸',
    category: 'Rap', tier: 'Gold', rank: 3, xp: 51800, lineupType: 'duo',
    fanCount: 18400, likes: 27600,
    isLive: false, audienceCount: 1840, timeLive: '28m',
    roomId: 'room-bar-god',
    achievementIds: ['gold-tier', 'battle-finalist'],
    profileRoute: '/performers/bar-god',
    liveRoomRoute: '/live/rooms/room-bar-god',
    articleIds: [],
  },
  {
    id: 'lagos-burst',
    slug: 'lagos-burst',
    name: 'Lagos Burst vs Verse',
    profileImageUrl: '/artists/artist-05.jpg',
    coverImageUrl: '/tmi-curated/mag-50.jpg',
    city: 'Lagos, NG', countryName: 'Nigeria', flag: '🇳🇬',
    category: 'Afrobeats', tier: 'Silver', rank: 1, xp: 28400, lineupType: 'duo',
    fanCount: 9400, likes: 14100,
    isLive: false, audienceCount: 940, timeLive: '19m',
    roomId: 'room-lagos-burst',
    achievementIds: ['silver-tier', 'regional-champion'],
    profileRoute: '/performers/lagos-burst',
    liveRoomRoute: '/live/rooms/room-lagos-burst',
    articleIds: ['afrobeats-rising'],
  },
  {
    id: 'nova-cipher',
    slug: 'nova-cipher',
    name: 'Nova Cipher',
    profileImageUrl: '/artists/artist-06.jpg',
    coverImageUrl: '/tmi-curated/mag-58.jpg',
    city: 'Atlanta, GA', countryName: 'United States', flag: '🇺🇸',
    category: 'Hip-Hop', tier: 'Gold', rank: 2, xp: 44600, lineupType: 'solo',
    fanCount: 6200, likes: 9300,
    isLive: false, audienceCount: 620, timeLive: '22m',
    roomId: 'room-nova-cipher',
    achievementIds: ['gold-tier'],
    profileRoute: '/performers/nova-cipher',
    liveRoomRoute: '/live/rooms/room-nova-cipher',
    articleIds: ['nova-cipher-feature'],
  },
  {
    id: 'avatar-heavy',
    slug: 'avatar-heavy',
    name: 'Avatar Heavy',
    profileImageUrl: '/artists/artist-07.jpg',
    coverImageUrl: '/tmi-curated/mag-66.jpg',
    city: 'Tokyo, JP', countryName: 'Japan', flag: '🇯🇵',
    category: 'Dance Crews', tier: 'RUBY', rank: 5, xp: 8400, lineupType: 'group',
    fanCount: 880, likes: 1320,
    isLive: false, audienceCount: 88, timeLive: '8m',
    roomId: 'room-avatar-heavy',
    achievementIds: ['ruby-tier'],
    profileRoute: '/performers/avatar-heavy',
    liveRoomRoute: '/live/rooms/room-avatar-heavy',
    articleIds: [],
  },
  {
    id: 'arena-prime',
    slug: 'arena-prime',
    name: 'Arena Prime',
    profileImageUrl: '/tmi-curated/venue-10.jpg',
    coverImageUrl: '/tmi-curated/mag-74.jpg',
    city: 'New York, NY', countryName: 'United States', flag: '🇺🇸',
    category: 'Venues', tier: 'Diamond', rank: 1, xp: 210000,
    fanCount: 82000, likes: 124000,
    isLive: false, audienceCount: 8200, timeLive: '2h 5m',
    roomId: 'room-arena-prime',
    achievementIds: ['diamond-tier', 'venue-of-the-year'],
    profileRoute: '/venues/arena-prime',
    liveRoomRoute: '/live/rooms/room-arena-prime',
    articleIds: [],
  },
  {
    id: 'monthly-idol',
    slug: 'monthly-idol',
    name: 'Monthly Idol Finals',
    profileImageUrl: '/tmi-curated/gameshow-31.jpg',
    coverImageUrl: '/tmi-curated/mag-82.jpg',
    city: 'Global', countryName: 'Global', flag: '🌐',
    category: 'Gospel', tier: 'Diamond', rank: 1, xp: 180000,
    fanCount: 54000, likes: 81000,
    isLive: false, audienceCount: 5400, timeLive: 'Live Event',
    roomId: 'room-monthly-idol',
    achievementIds: ['diamond-tier', 'event-premiere'],
    profileRoute: '/events/monthly-idol',
    liveRoomRoute: '/live/rooms/room-monthly-idol',
    articleIds: ['monthly-idol-preview', 'monthly-idol-recap'],
  },
  {
    id: 'vip-diamond',
    slug: 'vip-diamond',
    name: 'VIP Diamond Lounge',
    profileImageUrl: '/tmi-curated/venue-14.jpg',
    coverImageUrl: '/tmi-curated/mag-20.jpg',
    city: 'Beverly Hills', countryName: 'United States', flag: '🇺🇸',
    category: 'Venues', tier: 'Diamond', rank: 2, xp: 94000,
    fanCount: 3400, likes: 5100,
    isLive: false, audienceCount: 340, timeLive: 'Exclusive',
    roomId: 'room-vip-diamond',
    achievementIds: ['diamond-tier'],
    profileRoute: '/venues/vip-diamond',
    liveRoomRoute: '/live/rooms/room-vip-diamond',
    articleIds: [],
  },
  {
    id: 'beats-tmx',
    slug: 'beats-tmx',
    name: 'Beats By TMX',
    profileImageUrl: '/tmi-curated/profile-admin.jpg',
    coverImageUrl: '/tmi-curated/mag-28.jpg',
    city: 'Atlanta, GA', countryName: 'United States', flag: '🇺🇸',
    category: 'Sponsors', tier: 'Gold', rank: 1, xp: 62000,
    fanCount: 12000, likes: 18000,
    isLive: false, audienceCount: 1200, timeLive: 'Sponsored',
    roomId: 'room-beats-tmx',
    achievementIds: ['gold-tier', 'sponsor-active'],
    profileRoute: '/sponsors/beats-tmx',
    liveRoomRoute: '/live/rooms/room-beats-tmx',
    articleIds: [],
  },
  {
    id: 'flex-king',
    slug: 'flex-king',
    name: 'Flex King Dance',
    profileImageUrl: '/tmi-curated/gameshow-35.jpg',
    coverImageUrl: '/tmi-curated/mag-35.jpg',
    city: 'Toronto, CA', countryName: 'Canada', flag: '🇨🇦',
    category: 'Hip Hop Dance', tier: 'Silver', rank: 3, xp: 31200, lineupType: 'group',
    fanCount: 6700, likes: 10050,
    isLive: false, audienceCount: 670, timeLive: '35m',
    roomId: 'room-flex-king',
    achievementIds: ['silver-tier'],
    profileRoute: '/performers/flex-king',
    liveRoomRoute: '/live/rooms/room-flex-king',
    articleIds: [],
  },
  {
    // Magazine Issue 1 performer — "Lyric Stone's Debut Album: Track by Track"
    id: 'lyric-stone',
    slug: 'lyric-stone',
    name: 'Lyric Stone',
    profileImageUrl: '/artists/artist-08.jpg',
    coverImageUrl: '/tmi-curated/mag-35.jpg',
    bio: 'R&B/Soul artist and pianist based in Atlanta. Her debut album "Obsidian Water" is a 12-track journey through heartbreak, healing, and hard-won joy.',
    city: 'Atlanta, GA', countryName: 'United States', flag: '🇺🇸',
    category: 'R&B', tier: 'Gold', rank: 4, xp: 44200, lineupType: 'solo',
    fanCount: 9800, likes: 14700,
    isLive: false, audienceCount: 980, timeLive: '26m',
    roomId: 'room-lyric-stone',
    achievementIds: ['gold-tier'],
    profileRoute: '/performers/lyric-stone',
    liveRoomRoute: '/live/rooms/room-lyric-stone',
    articleIds: ['lyric-stone-debut-album'],
  },
  {
    // Magazine Issue 1 performer — "Zuri Bloom Is the Future of Afrobeats"
    id: 'zuri-bloom',
    slug: 'zuri-bloom',
    name: 'Zuri Bloom',
    profileImageUrl: '/artists/artist-09.jpg',
    coverImageUrl: '/tmi-curated/mag-50.jpg',
    bio: '24-year-old Afrobeats/Amapiano/Pop artist bridging Lagos and Los Angeles. Her grandmother sang Yoruba lullabies that live in every note she writes.',
    city: 'Los Angeles, CA', countryName: 'United States', flag: '🇺🇸',
    category: 'Afrobeats', tier: 'Silver', rank: 2, xp: 26800, lineupType: 'solo',
    fanCount: 7200, likes: 10800,
    isLive: false, audienceCount: 720, timeLive: '18m',
    roomId: 'room-zuri-bloom',
    achievementIds: ['silver-tier', 'rising-artist'],
    profileRoute: '/performers/zuri-bloom',
    liveRoomRoute: '/live/rooms/room-zuri-bloom',
    articleIds: ['zuri-bloom-afrobeats-future'],
  },
  {
    // Magazine Issue 1 performer — "Krypt: No Label, No Limit"
    id: 'krypt',
    slug: 'krypt',
    name: 'Krypt',
    profileImageUrl: '/artists/artist-10.jpg',
    coverImageUrl: '/tmi-curated/mag-58.jpg',
    bio: 'Drill rapper who turned down three major label deals to own 100% of his masters. Earns $22,000/month from the platform before a single show.',
    city: 'Chicago, IL', countryName: 'United States', flag: '🇺🇸',
    category: 'Hip-Hop', tier: 'Gold', rank: 5, xp: 42600, lineupType: 'solo',
    fanCount: 11200, likes: 16800,
    isLive: false, audienceCount: 1120, timeLive: '31m',
    roomId: 'room-krypt',
    achievementIds: ['gold-tier', 'independent-artist'],
    profileRoute: '/performers/krypt',
    liveRoomRoute: '/live/rooms/room-krypt',
    articleIds: ['krypt-no-label-no-limit'],
  },
  {
    id: 'steel-echo',
    slug: 'steel-echo',
    name: 'Steel Echo',
    profileImageUrl: '/bot-images/Bot image 15.png',
    coverImageUrl: '/tmi-curated/mag-66.jpg',
    bio: 'Rock/Metal band from Detroit. Four members, one vision — riffs that rattle arenas.',
    city: 'Detroit, MI', countryName: 'United States', flag: '🇺🇸',
    category: 'Rock', tier: 'Gold', rank: 1, xp: 38400, lineupType: 'band',
    fanCount: 8200, likes: 12300,
    isLive: false, audienceCount: 820, timeLive: '22m',
    roomId: 'room-steel-echo',
    achievementIds: ['gold-tier', 'battle-finalist'],
    profileRoute: '/performers/steel-echo',
    liveRoomRoute: '/live/rooms/room-steel-echo',
    articleIds: [],
  },
  {
    id: 'dj-solar',
    slug: 'dj-solar',
    name: 'DJ Solar',
    profileImageUrl: '/bot-images/Bot image 45.png',
    coverImageUrl: '/tmi-curated/mag-50.jpg',
    bio: 'House and Afro-tech DJ spinning from Lagos to London. Every set is a journey.',
    city: 'Lagos, NG', countryName: 'Nigeria', flag: '🇳🇬',
    category: 'EDM', tier: 'Silver', rank: 2, xp: 29600, lineupType: 'solo',
    fanCount: 7400, likes: 11100,
    isLive: false, audienceCount: 740, timeLive: '40m',
    roomId: 'room-dj-solar',
    achievementIds: ['silver-tier', 'dj-champion'],
    profileRoute: '/performers/dj-solar',
    liveRoomRoute: '/live/rooms/room-dj-solar',
    articleIds: [],
  },
  {
    id: 'laughtrack-mike',
    slug: 'laughtrack-mike',
    name: 'LaughTrack Mike',
    profileImageUrl: '/bot-images/Bot image 50.png',
    coverImageUrl: '/tmi-curated/mag-42.jpg',
    bio: 'Stand-up comedian and comedian-battle champion. His crowd work is legendary.',
    city: 'New York, NY', countryName: 'United States', flag: '🇺🇸',
    category: 'Comedy', tier: 'Gold', rank: 1, xp: 41200, lineupType: 'solo',
    fanCount: 9100, likes: 13650,
    isLive: false, audienceCount: 910, timeLive: '18m',
    roomId: 'room-laughtrack-mike',
    achievementIds: ['gold-tier', 'comedy-champion'],
    profileRoute: '/performers/laughtrack-mike',
    liveRoomRoute: '/live/rooms/room-laughtrack-mike',
    articleIds: [],
  },
  {
    id: 'rize-crew',
    slug: 'rize-crew',
    name: 'Rize Crew',
    profileImageUrl: '/bot-images/Bot image 30.png',
    coverImageUrl: '/tmi-curated/mag-35.jpg',
    bio: 'Seven-member dance crew blending B-boy, waacking, and Afrobeats into one show.',
    city: 'Houston, TX', countryName: 'United States', flag: '🇺🇸',
    category: 'Dance Crews', tier: 'Gold', rank: 2, xp: 36800, lineupType: 'group',
    fanCount: 7800, likes: 11700,
    isLive: false, audienceCount: 780, timeLive: '32m',
    roomId: 'room-rize-crew',
    achievementIds: ['gold-tier', 'regional-champion'],
    profileRoute: '/performers/rize-crew',
    liveRoomRoute: '/live/rooms/room-rize-crew',
    articleIds: [],
  },
  {
    id: 'verse-flux',
    slug: 'verse-flux',
    name: 'Verse & Flux',
    profileImageUrl: '/bot-images/Bot image 1.png',
    coverImageUrl: '/tmi-curated/mag-58.jpg',
    bio: 'Hip-hop duo known for synchronized bars and layered flows. Direct from the Bronx.',
    city: 'Bronx, NY', countryName: 'United States', flag: '🇺🇸',
    category: 'Hip-Hop', tier: 'Silver', rank: 4, xp: 24200, lineupType: 'duo',
    fanCount: 5400, likes: 8100,
    isLive: false, audienceCount: 540, timeLive: '15m',
    roomId: 'room-verse-flux',
    achievementIds: ['silver-tier'],
    profileRoute: '/performers/verse-flux',
    liveRoomRoute: '/live/rooms/room-verse-flux',
    articleIds: [],
  },
  {
    id: 'gospel-glory',
    slug: 'gospel-glory',
    name: 'Gospel Glory Choir',
    profileImageUrl: '/bot-images/Bot image 40.png',
    coverImageUrl: '/tmi-curated/mag-82.jpg',
    bio: 'Twenty-voice choir bringing the fire every Sunday and beyond. Unity in harmony.',
    city: 'Atlanta, GA', countryName: 'United States', flag: '🇺🇸',
    category: 'Gospel', tier: 'Silver', rank: 2, xp: 22800, lineupType: 'group',
    fanCount: 4800, likes: 7200,
    isLive: false, audienceCount: 480, timeLive: '45m',
    roomId: 'room-gospel-glory',
    achievementIds: ['silver-tier'],
    profileRoute: '/performers/gospel-glory',
    liveRoomRoute: '/live/rooms/room-gospel-glory',
    articleIds: [],
  },
  {
    // BernoutGlobal house artist — referenced platform-wide in PlaylistEngine.ts /
    // PlaylistArtifactEngine.ts / artifactEngine.ts as a mandatory-rotation core
    // catalog artist, but was missing from the registry itself (Rule 1/8 gap).
    id: 'big-kazhdog',
    slug: 'big-kazhdog',
    name: 'Big Kazhdog',
    profileImageUrl: '/images/tmi-placeholder.jpg',
    coverImageUrl: '/tmi-curated/mag-20.jpg',
    city: 'Atlanta, GA', countryName: 'United States', flag: '🇺🇸',
    category: 'Hip-Hop', tier: 'Diamond', rank: 10, xp: 0, lineupType: 'solo',
    songs: [
      { title: 'Big Dog Energy', durationSec: 0 },
      { title: "I'm So Handsome", durationSec: 210 },
      { title: 'Top Dog Chronicles', durationSec: 0 },
    ],
    fanCount: 0, likes: 0,
    isLive: false, audienceCount: 0, timeLive: '',
    roomId: 'room-big-kazhdog',
    achievementIds: ['diamond-tier'],
    profileRoute: '/performers/big-kazhdog',
    liveRoomRoute: '/live/rooms/room-big-kazhdog',
    articleIds: [],
  },
  {
    id: 'marcus-diggler',
    slug: 'marcus-diggler',
    name: 'Marcus Diggler',
    profileImageUrl: '/bot-images/Bot image 22.png',
    coverImageUrl: '/tmi-curated/mag-35.jpg',
    bio: 'Percussionist bringing conga and bongo fire to every set — Latin rhythm built for a packed room.',
    city: 'Miami, FL', countryName: 'United States', flag: '🇺🇸',
    category: 'Latin', tier: 'Silver', rank: 3, xp: 21400, lineupType: 'solo',
    fanCount: 4600, likes: 6900,
    isLive: false, audienceCount: 460, timeLive: '20m',
    roomId: 'room-marcus-diggler',
    achievementIds: ['silver-tier'],
    profileRoute: '/performers/marcus-diggler',
    liveRoomRoute: '/live/rooms/room-marcus-diggler',
    articleIds: [],
  },
];

// ── Lookup helpers ────────────────────────────────────────────────────────────

const _byId = new Map(PERFORMER_REGISTRY.map((p) => [p.id, p]));
const _bySlug = new Map(PERFORMER_REGISTRY.map((p) => [p.slug, p]));

export function getPerformerById(id: string): PerformerIdentity | null {
  return _byId.get(id) ?? null;
}

export function getPerformerBySlug(slug: string): PerformerIdentity | null {
  return _bySlug.get(slug) ?? null;
}

export function getTopPerformers(n = 12): PerformerIdentity[] {
  return [...PERFORMER_REGISTRY].sort((a, b) => b.xp - a.xp).slice(0, n);
}

export function getLivePerformers(): PerformerIdentity[] {
  return PERFORMER_REGISTRY.filter((p) => p.isLive).sort((a, b) => b.audienceCount - a.audienceCount);
}

export function getPerformersByCategory(category: PerformerCategory): PerformerIdentity[] {
  return PERFORMER_REGISTRY.filter((p) => p.category === category);
}

export function getCrownHolder(): PerformerIdentity {
  return PERFORMER_REGISTRY.reduce((best, p) => (p.xp > best.xp ? p : best), PERFORMER_REGISTRY[0]!);
}

// ── Genre adapter (for Home 1 orbital + rankings) ─────────────────────────────

export interface GenrePerformer {
  slug: string;
  name: string;
  emoji: string;
  rank: number;
  score: number;   // mapped from xp
  genre: string;
  fanCount: number;
  profileImageUrl: string;
}

const GENRE_EMOJI: Partial<Record<PerformerCategory, string>> = {
  'Hip-Hop': '🎤', 'R&B': '💜', 'Rap': '🎙️', 'EDM': '🎧',
  'Pop': '🌟', 'Gospel': '🙏', 'Jazz': '🎷', 'Soul': '🕯️',
  'Afrobeats': '🥁', 'Dance Crews': '💃', 'Hip Hop Dance': '💃',
  'Funk': '🎸', 'Blues': '🎵', 'Rock': '🎸', 'Latin': '🎺',
};

const GENRE_TO_CATEGORIES: Record<string, PerformerCategory[]> = {
  'Hip-Hop': ['Hip-Hop'],
  'R&B':     ['R&B'],
  'Rap':     ['Rap'],
  'EDM':     ['EDM', 'Electronic'],
  'Gospel':  ['Gospel'],
  'Jazz':    ['Jazz'],
  'Soul':    ['Soul', 'Funk'],
  'Pop':     ['Pop'],
};

// Returns registry performers adapted for the Home 1 orbital Performer shape.
// Falls back to an empty array for genres with no registry entries.
export function getGenrePerformers(genre: string, n = 10): GenrePerformer[] {
  const cats = GENRE_TO_CATEGORIES[genre] ?? [];
  if (cats.length === 0) return [];
  return PERFORMER_REGISTRY
    .filter((p) => (cats as PerformerCategory[]).includes(p.category))
    .sort((a, b) => b.xp - a.xp)
    .slice(0, n)
    .map((p) => ({
      slug: p.slug,
      name: p.name,
      emoji: GENRE_EMOJI[p.category] ?? '🎵',
      rank: p.rank,
      score: p.xp,
      genre: p.category,
      fanCount: p.fanCount,
      profileImageUrl: p.profileImageUrl,
    }));
}

// Returns lower-tier performers for the Free Promotion panel on Home 1.
export function getFeaturedFreePerformers(n = 2): GenrePerformer[] {
  return PERFORMER_REGISTRY
    .filter((p) => ['FREE', 'PRO', 'Silver', 'RUBY'].includes(p.tier))
    .sort((a, b) => b.fanCount - a.fanCount)
    .slice(0, n)
    .map((p) => ({
      slug: p.slug,
      name: p.name,
      emoji: GENRE_EMOJI[p.category] ?? '🎵',
      rank: p.rank,
      score: p.xp,
      genre: p.category,
      fanCount: p.fanCount,
      profileImageUrl: p.profileImageUrl,
    }));
}

/**
 * computeRanks — Rule 4 (XP-driven rankings, never manual).
 * Returns a new array sorted by XP descending with rank field set to position.
 * Call this instead of reading .rank directly when you need accurate live ranking.
 */
export function computeRanks(): PerformerIdentity[] {
  return [...PERFORMER_REGISTRY]
    .sort((a, b) => b.xp - a.xp)
    .map((p, i) => ({ ...p, rank: i + 1 }));
}

/**
 * getCrownRotationStatus — Rule 5 (Crown rotation after 2 months).
 * Returns whether the current crown holder has exceeded their 2-month window.
 */
export function getCrownRotationStatus(): { holder: PerformerIdentity; daysHeld: number; rotationDue: boolean } | null {
  const crown = getCrownHolder();
  if (!crown.crownSince) return null;
  const held = Math.floor((Date.now() - new Date(crown.crownSince).getTime()) / (1000 * 60 * 60 * 24));
  return { holder: crown, daysHeld: held, rotationDue: held >= 60 };
}

// Tier → accent color (used for promotion panel badges)
export function getTierColor(tier: PerformerTier): string {
  const map: Record<PerformerTier, string> = {
    Diamond: '#00E5FF', Platinum: '#E5E4E2', Gold: '#FFD700',
    Silver: '#C0C0C0', RUBY: '#FF2DAA', PRO: '#AA2DFF', FREE: '#00FF88',
  };
  return map[tier] ?? '#00FF88';
}
