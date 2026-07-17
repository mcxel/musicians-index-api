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
  {
    id: 'nova-renegade', slug: 'nova-renegade', name: 'Nova Renegade',
    profileImageUrl: '/bot-images/Bot image 2.png', coverImageUrl: '/tmi-curated/mag-20.jpg',
    bio: 'Festival-forged EDM producer turning warehouse sets into full-blown light shows.',
    city: 'Berlin', countryName: 'Germany', flag: '🇩🇪',
    category: 'EDM', tier: 'Gold', rank: 3, xp: 34200, lineupType: 'solo',
    fanCount: 8600, likes: 12400, isLive: false, audienceCount: 0, timeLive: '',
    roomId: 'room-nova-renegade', achievementIds: ['gold-tier'],
    profileRoute: '/performers/nova-renegade', liveRoomRoute: '/live/rooms/room-nova-renegade', articleIds: [],
  },
  {
    id: 'silas-vane', slug: 'silas-vane', name: 'Silas Vane',
    profileImageUrl: '/bot-images/Bot image 3.png', coverImageUrl: '/tmi-curated/mag-28.jpg',
    bio: 'Gravel-voiced rock frontman built for stadium choruses and broken guitar strings.',
    city: 'Austin, TX', countryName: 'United States', flag: '🇺🇸',
    category: 'Rock', tier: 'Silver', rank: 5, xp: 18300, lineupType: 'solo',
    fanCount: 3400, likes: 5100, isLive: false, audienceCount: 0, timeLive: '',
    roomId: 'room-silas-vane', achievementIds: ['silver-tier'],
    profileRoute: '/performers/silas-vane', liveRoomRoute: '/live/rooms/room-silas-vane', articleIds: [],
  },
  {
    id: 'coral-reyes', slug: 'coral-reyes', name: 'Coral Reyes',
    profileImageUrl: '/bot-images/Bot image 4.png', coverImageUrl: '/tmi-curated/mag-35.jpg',
    bio: 'Bright, hook-driven pop vocalist chasing the next radio-ready single.',
    city: 'Los Angeles, CA', countryName: 'United States', flag: '🇺🇸',
    category: 'Pop', tier: 'Silver', rank: 4, xp: 19700, lineupType: 'solo',
    fanCount: 3900, likes: 5800, isLive: false, audienceCount: 0, timeLive: '',
    roomId: 'room-coral-reyes', achievementIds: ['silver-tier'],
    profileRoute: '/performers/coral-reyes', liveRoomRoute: '/live/rooms/room-coral-reyes', articleIds: [],
  },
  {
    id: 'duke-halloway', slug: 'duke-halloway', name: 'Duke Halloway',
    profileImageUrl: '/bot-images/Bot image 5.png', coverImageUrl: '/tmi-curated/mag-42.jpg',
    bio: 'Boot-scuffed country storyteller with a voice built for the back porch and the big stage alike.',
    city: 'Nashville, TN', countryName: 'United States', flag: '🇺🇸',
    category: 'Country', tier: 'Gold', rank: 2, xp: 37800, lineupType: 'solo',
    fanCount: 9800, likes: 14200, isLive: false, audienceCount: 0, timeLive: '',
    roomId: 'room-duke-halloway', achievementIds: ['gold-tier'],
    profileRoute: '/performers/duke-halloway', liveRoomRoute: '/live/rooms/room-duke-halloway', articleIds: [],
  },
  {
    id: 'zephyr-cole', slug: 'zephyr-cole', name: 'Zephyr Cole',
    profileImageUrl: '/bot-images/Bot image 6.png', coverImageUrl: '/tmi-curated/mag-50.jpg',
    bio: 'Sharp-tongued lyricist with a pocket built for battle rap and radio both.',
    city: 'Chicago, IL', countryName: 'United States', flag: '🇺🇸',
    category: 'Hip-Hop', tier: 'Ruby', rank: 8, xp: 9400, lineupType: 'solo',
    fanCount: 1400, likes: 2100, isLive: false, audienceCount: 0, timeLive: '',
    roomId: 'room-zephyr-cole', achievementIds: ['ruby-tier'],
    profileRoute: '/performers/zephyr-cole', liveRoomRoute: '/live/rooms/room-zephyr-cole', articleIds: [],
  },
  {
    id: 'ivy-monroe', slug: 'ivy-monroe', name: 'Ivy Monroe',
    profileImageUrl: '/bot-images/Bot image 7.png', coverImageUrl: '/tmi-curated/mag-58.jpg',
    bio: 'Velvet-toned R&B vocalist turning heartbreak into headline-worthy runs.',
    city: 'Houston, TX', countryName: 'United States', flag: '🇺🇸',
    category: 'R&B', tier: 'Silver', rank: 4, xp: 20600, lineupType: 'solo',
    fanCount: 4200, likes: 6300, isLive: false, audienceCount: 0, timeLive: '',
    roomId: 'room-ivy-monroe', achievementIds: ['silver-tier'],
    profileRoute: '/performers/ivy-monroe', liveRoomRoute: '/live/rooms/room-ivy-monroe', articleIds: [],
  },
  {
    id: 'otis-brakefield', slug: 'otis-brakefield', name: 'Otis Brakefield',
    profileImageUrl: '/bot-images/Bot image 8.png', coverImageUrl: '/tmi-curated/mag-66.jpg',
    bio: 'Slide-guitar bluesman keeping the Delta sound alive one late set at a time.',
    city: 'Memphis, TN', countryName: 'United States', flag: '🇺🇸',
    category: 'Blues', tier: 'Ruby', rank: 9, xp: 8100, lineupType: 'solo',
    fanCount: 1100, likes: 1700, isLive: false, audienceCount: 0, timeLive: '',
    roomId: 'room-otis-brakefield', achievementIds: ['ruby-tier'],
    profileRoute: '/performers/otis-brakefield', liveRoomRoute: '/live/rooms/room-otis-brakefield', articleIds: [],
  },
  {
    id: 'priya-anand', slug: 'priya-anand', name: 'Priya Anand',
    profileImageUrl: '/bot-images/Bot image 9.png', coverImageUrl: '/tmi-curated/mag-74.jpg',
    bio: 'Genre-blending pop artist fusing Bollywood energy with global chart ambition.',
    city: 'Mumbai', countryName: 'India', flag: '🇮🇳',
    category: 'Pop', tier: 'Gold', rank: 3, xp: 33500, lineupType: 'solo',
    fanCount: 8100, likes: 11900, isLive: false, audienceCount: 0, timeLive: '',
    roomId: 'room-priya-anand', achievementIds: ['gold-tier'],
    profileRoute: '/performers/priya-anand', liveRoomRoute: '/live/rooms/room-priya-anand', articleIds: [],
  },
  {
    id: 'tobias-kwan', slug: 'tobias-kwan', name: 'Tobias Kwan',
    profileImageUrl: '/bot-images/Bot image 10.png', coverImageUrl: '/tmi-curated/mag-82.jpg',
    bio: 'Trumpet-first jazz bandleader raised on second-line brass and late-night improv.',
    city: 'New Orleans, LA', countryName: 'United States', flag: '🇺🇸',
    category: 'Jazz', tier: 'Silver', rank: 5, xp: 17200, lineupType: 'solo',
    fanCount: 3100, likes: 4600, isLive: false, audienceCount: 0, timeLive: '',
    roomId: 'room-tobias-kwan', achievementIds: ['silver-tier'],
    profileRoute: '/performers/tobias-kwan', liveRoomRoute: '/live/rooms/room-tobias-kwan', articleIds: [],
  },
  {
    id: 'marisol-vega', slug: 'marisol-vega', name: 'Marisol Vega',
    profileImageUrl: '/bot-images/Bot image 11.png', coverImageUrl: '/tmi-curated/mag-20.jpg',
    bio: 'Reggaeton-pop crossover artist built for packed dance floors and radio rotation.',
    city: 'San Juan', countryName: 'Puerto Rico', flag: '🇵🇷',
    category: 'Latin', tier: 'Gold', rank: 2, xp: 39100, lineupType: 'solo',
    fanCount: 10400, likes: 15300, isLive: false, audienceCount: 0, timeLive: '',
    roomId: 'room-marisol-vega', achievementIds: ['gold-tier'],
    profileRoute: '/performers/marisol-vega', liveRoomRoute: '/live/rooms/room-marisol-vega', articleIds: [],
  },
  {
    id: 'gunnar-frost', slug: 'gunnar-frost', name: 'Gunnar Frost',
    profileImageUrl: '/bot-images/Bot image 12.png', coverImageUrl: '/tmi-curated/mag-28.jpg',
    bio: 'Twin-guitar metal frontman with a scream built for arena mosh pits.',
    city: 'Gothenburg', countryName: 'Sweden', flag: '🇸🇪',
    category: 'Metal', tier: 'Silver', rank: 6, xp: 15900, lineupType: 'solo',
    fanCount: 2700, likes: 4000, isLive: false, audienceCount: 0, timeLive: '',
    roomId: 'room-gunnar-frost', achievementIds: ['silver-tier'],
    profileRoute: '/performers/gunnar-frost', liveRoomRoute: '/live/rooms/room-gunnar-frost', articleIds: [],
  },
  {
    id: 'delphine-roy', slug: 'delphine-roy', name: 'Delphine Roy',
    profileImageUrl: '/bot-images/Bot image 13.png', coverImageUrl: '/tmi-curated/mag-35.jpg',
    bio: 'Classic soul revivalist bringing Motown grit back to modern stages.',
    city: 'Detroit, MI', countryName: 'United States', flag: '🇺🇸',
    category: 'Soul', tier: 'Ruby', rank: 7, xp: 10600, lineupType: 'solo',
    fanCount: 1600, likes: 2400, isLive: false, audienceCount: 0, timeLive: '',
    roomId: 'room-delphine-roy', achievementIds: ['ruby-tier'],
    profileRoute: '/performers/delphine-roy', liveRoomRoute: '/live/rooms/room-delphine-roy', articleIds: [],
  },
  {
    id: 'kwame-osei', slug: 'kwame-osei', name: 'Kwame Osei',
    profileImageUrl: '/bot-images/Bot image 14.png', coverImageUrl: '/tmi-curated/mag-42.jpg',
    bio: 'Afrobeats hitmaker blending highlife horns with modern club production.',
    city: 'Lagos', countryName: 'Nigeria', flag: '🇳🇬',
    category: 'Afrobeats', tier: 'Gold', rank: 3, xp: 32700, lineupType: 'solo',
    fanCount: 7900, likes: 11600, isLive: false, audienceCount: 0, timeLive: '',
    roomId: 'room-kwame-osei', achievementIds: ['gold-tier'],
    profileRoute: '/performers/kwame-osei', liveRoomRoute: '/live/rooms/room-kwame-osei', articleIds: [],
  },
  {
    id: 'rosalind-ash', slug: 'rosalind-ash', name: 'Rosalind Ash',
    profileImageUrl: '/bot-images/Bot image 16.png', coverImageUrl: '/tmi-curated/mag-50.jpg',
    bio: 'Bedroom-pop-turned-indie artist writing hushed hooks for headphone listening.',
    city: 'Portland, OR', countryName: 'United States', flag: '🇺🇸',
    category: 'Indie', tier: 'Silver', rank: 6, xp: 14800, lineupType: 'solo',
    fanCount: 2300, likes: 3400, isLive: false, audienceCount: 0, timeLive: '',
    roomId: 'room-rosalind-ash', achievementIds: ['silver-tier'],
    profileRoute: '/performers/rosalind-ash', liveRoomRoute: '/live/rooms/room-rosalind-ash', articleIds: [],
  },
  {
    id: 'malik-freeman', slug: 'malik-freeman', name: 'Malik Freeman',
    profileImageUrl: '/bot-images/Bot image 17.png', coverImageUrl: '/tmi-curated/mag-58.jpg',
    bio: 'Trap-rooted rapper with a flow built for cypher circles and mixtape runs.',
    city: 'Atlanta, GA', countryName: 'United States', flag: '🇺🇸',
    category: 'Rap', tier: 'Ruby', rank: 8, xp: 9800, lineupType: 'solo',
    fanCount: 1500, likes: 2300, isLive: false, audienceCount: 0, timeLive: '',
    roomId: 'room-malik-freeman', achievementIds: ['ruby-tier'],
    profileRoute: '/performers/malik-freeman', liveRoomRoute: '/live/rooms/room-malik-freeman', articleIds: [],
  },
  {
    id: 'bianca-solis', slug: 'bianca-solis', name: 'Bianca Solis',
    profileImageUrl: '/bot-images/Bot image 18.png', coverImageUrl: '/tmi-curated/mag-66.jpg',
    bio: 'Dancehall vocalist bringing riddim energy to every set she touches.',
    city: 'Kingston', countryName: 'Jamaica', flag: '🇯🇲',
    category: 'Dancehall', tier: 'Silver', rank: 5, xp: 18900, lineupType: 'solo',
    fanCount: 3600, likes: 5400, isLive: false, audienceCount: 0, timeLive: '',
    roomId: 'room-bianca-solis', achievementIds: ['silver-tier'],
    profileRoute: '/performers/bianca-solis', liveRoomRoute: '/live/rooms/room-bianca-solis', articleIds: [],
  },
  {
    id: 'elias-thorne', slug: 'elias-thorne', name: 'Elias Thorne',
    profileImageUrl: '/bot-images/Bot image 19.png', coverImageUrl: '/tmi-curated/mag-74.jpg',
    bio: 'Post-punk revivalist fronting a band built for basement shows and big festivals.',
    city: 'Manchester', countryName: 'United Kingdom', flag: '🇬🇧',
    category: 'Rock', tier: 'Gold', rank: 3, xp: 31400, lineupType: 'band',
    fanCount: 7600, likes: 11200, isLive: false, audienceCount: 0, timeLive: '',
    roomId: 'room-elias-thorne', achievementIds: ['gold-tier'],
    profileRoute: '/performers/elias-thorne', liveRoomRoute: '/live/rooms/room-elias-thorne', articleIds: [],
  },
  {
    id: 'naledi-dube', slug: 'naledi-dube', name: 'Naledi Dube',
    profileImageUrl: '/bot-images/Bot image 20.png', coverImageUrl: '/tmi-curated/mag-82.jpg',
    bio: "Choir-trained gospel vocalist carrying a full congregation's worth of power in one voice.",
    city: 'Johannesburg', countryName: 'South Africa', flag: '🇿🇦',
    category: 'Gospel', tier: 'Platinum', rank: 1, xp: 58200, lineupType: 'solo',
    fanCount: 19400, likes: 27600, isLive: false, audienceCount: 0, timeLive: '',
    roomId: 'room-naledi-dube', achievementIds: ['platinum-tier'],
    profileRoute: '/performers/naledi-dube', liveRoomRoute: '/live/rooms/room-naledi-dube', articleIds: [],
  },
  {
    id: 'cass-ryder', slug: 'cass-ryder', name: 'Cass Ryder',
    profileImageUrl: '/bot-images/Bot image 21.png', coverImageUrl: '/tmi-curated/mag-20.jpg',
    bio: 'Techno producer building hypnotic sets for after-hours warehouse crowds.',
    city: 'Amsterdam', countryName: 'Netherlands', flag: '🇳🇱',
    category: 'Electronic', tier: 'Silver', rank: 6, xp: 16400, lineupType: 'solo',
    fanCount: 2800, likes: 4100, isLive: false, audienceCount: 0, timeLive: '',
    roomId: 'room-cass-ryder', achievementIds: ['silver-tier'],
    profileRoute: '/performers/cass-ryder', liveRoomRoute: '/live/rooms/room-cass-ryder', articleIds: [],
  },
  {
    id: 'juniper-blake', slug: 'juniper-blake', name: 'Juniper Blake',
    profileImageUrl: '/bot-images/Bot image 23.png', coverImageUrl: '/tmi-curated/mag-28.jpg',
    bio: 'Modern country songwriter with a knack for turning small-town stories into anthems.',
    city: 'Tulsa, OK', countryName: 'United States', flag: '🇺🇸',
    category: 'Country', tier: 'Ruby', rank: 8, xp: 9200, lineupType: 'solo',
    fanCount: 1350, likes: 2000, isLive: false, audienceCount: 0, timeLive: '',
    roomId: 'room-juniper-blake', achievementIds: ['ruby-tier'],
    profileRoute: '/performers/juniper-blake', liveRoomRoute: '/live/rooms/room-juniper-blake', articleIds: [],
  },
  {
    id: 'remy-castellan', slug: 'remy-castellan', name: 'Remy Castellan',
    profileImageUrl: '/bot-images/Bot image 24.png', coverImageUrl: '/tmi-curated/mag-35.jpg',
    bio: 'Bass-slapping funk bandleader keeping the groove alive set after set.',
    city: 'New Orleans, LA', countryName: 'United States', flag: '🇺🇸',
    category: 'Funk', tier: 'Silver', rank: 5, xp: 19100, lineupType: 'band',
    fanCount: 3700, likes: 5500, isLive: false, audienceCount: 0, timeLive: '',
    roomId: 'room-remy-castellan', achievementIds: ['silver-tier'],
    profileRoute: '/performers/remy-castellan', liveRoomRoute: '/live/rooms/room-remy-castellan', articleIds: [],
  },
  {
    id: 'adaeze-chukwu', slug: 'adaeze-chukwu', name: 'Adaeze Chukwu',
    profileImageUrl: '/bot-images/Bot image 25.png', coverImageUrl: '/tmi-curated/mag-42.jpg',
    bio: 'Smooth R&B vocalist blending Afro-soul influence with modern production.',
    city: 'Toronto', countryName: 'Canada', flag: '🇨🇦',
    category: 'R&B', tier: 'Gold', rank: 3, xp: 30800, lineupType: 'solo',
    fanCount: 7200, likes: 10600, isLive: false, audienceCount: 0, timeLive: '',
    roomId: 'room-adaeze-chukwu', achievementIds: ['gold-tier'],
    profileRoute: '/performers/adaeze-chukwu', liveRoomRoute: '/live/rooms/room-adaeze-chukwu', articleIds: [],
  },
  {
    id: 'finnegan-cole', slug: 'finnegan-cole', name: 'Finnegan Cole',
    profileImageUrl: '/bot-images/Bot image 26.png', coverImageUrl: '/tmi-curated/mag-50.jpg',
    bio: 'Acoustic-rooted indie songwriter turning pub sessions into festival sets.',
    city: 'Dublin', countryName: 'Ireland', flag: '🇮🇪',
    category: 'Indie', tier: 'Silver', rank: 6, xp: 15300, lineupType: 'solo',
    fanCount: 2500, likes: 3700, isLive: false, audienceCount: 0, timeLive: '',
    roomId: 'room-finnegan-cole', achievementIds: ['silver-tier'],
    profileRoute: '/performers/finnegan-cole', liveRoomRoute: '/live/rooms/room-finnegan-cole', articleIds: [],
  },
  {
    id: 'selena-marchetti', slug: 'selena-marchetti', name: 'Selena Marchetti',
    profileImageUrl: '/bot-images/Bot image 27.png', coverImageUrl: '/tmi-curated/mag-58.jpg',
    bio: 'European pop vocalist with a flair for cinematic choruses.',
    city: 'Rome', countryName: 'Italy', flag: '🇮🇹',
    category: 'Pop', tier: 'Ruby', rank: 7, xp: 10100, lineupType: 'solo',
    fanCount: 1550, likes: 2300, isLive: false, audienceCount: 0, timeLive: '',
    roomId: 'room-selena-marchetti', achievementIds: ['ruby-tier'],
    profileRoute: '/performers/selena-marchetti', liveRoomRoute: '/live/rooms/room-selena-marchetti', articleIds: [],
  },
  {
    id: 'cortez-bellamy', slug: 'cortez-bellamy', name: 'Cortez Bellamy',
    profileImageUrl: '/bot-images/Bot image 28.png', coverImageUrl: '/tmi-curated/mag-66.jpg',
    bio: 'West Coast lyricist with a laid-back flow and razor-sharp pen.',
    city: 'Oakland, CA', countryName: 'United States', flag: '🇺🇸',
    category: 'Hip-Hop', tier: 'Gold', rank: 3, xp: 33900, lineupType: 'solo',
    fanCount: 8300, likes: 12100, isLive: false, audienceCount: 0, timeLive: '',
    roomId: 'room-cortez-bellamy', achievementIds: ['gold-tier'],
    profileRoute: '/performers/cortez-bellamy', liveRoomRoute: '/live/rooms/room-cortez-bellamy', articleIds: [],
  },
  {
    id: 'harlow-quinn', slug: 'harlow-quinn', name: 'Harlow Quinn',
    profileImageUrl: '/bot-images/Bot image 29.png', coverImageUrl: '/tmi-curated/mag-74.jpg',
    bio: 'Stand-up comic turning open mics into sold-out rooms one punchline at a time.',
    city: 'New York, NY', countryName: 'United States', flag: '🇺🇸',
    category: 'Comedy', tier: 'Silver', rank: 5, xp: 17800, lineupType: 'solo',
    fanCount: 3200, likes: 4800, isLive: false, audienceCount: 0, timeLive: '',
    roomId: 'room-harlow-quinn', achievementIds: ['silver-tier'],
    profileRoute: '/performers/harlow-quinn', liveRoomRoute: '/live/rooms/room-harlow-quinn', articleIds: [],
  },
  {
    id: 'django-marsh', slug: 'django-marsh', name: 'Django Marsh',
    profileImageUrl: '/bot-images/Bot image 31.png', coverImageUrl: '/tmi-curated/mag-82.jpg',
    bio: 'Gypsy-jazz guitarist keeping the Django Reinhardt tradition alive on modern stages.',
    city: 'Paris', countryName: 'France', flag: '🇫🇷',
    category: 'Jazz', tier: 'Gold', rank: 3, xp: 29900, lineupType: 'solo',
    fanCount: 7000, likes: 10300, isLive: false, audienceCount: 0, timeLive: '',
    roomId: 'room-django-marsh', achievementIds: ['gold-tier'],
    profileRoute: '/performers/django-marsh', liveRoomRoute: '/live/rooms/room-django-marsh', articleIds: [],
  },
  {
    id: 'yara-haddad', slug: 'yara-haddad', name: 'Yara Haddad',
    profileImageUrl: '/bot-images/Bot image 32.png', coverImageUrl: '/tmi-curated/mag-20.jpg',
    bio: 'Latin-pop crossover vocalist with a bilingual catalog built for the charts.',
    city: 'Miami, FL', countryName: 'United States', flag: '🇺🇸',
    category: 'Latin', tier: 'Silver', rank: 4, xp: 20200, lineupType: 'solo',
    fanCount: 4000, likes: 6000, isLive: false, audienceCount: 0, timeLive: '',
    roomId: 'room-yara-haddad', achievementIds: ['silver-tier'],
    profileRoute: '/performers/yara-haddad', liveRoomRoute: '/live/rooms/room-yara-haddad', articleIds: [],
  },
  {
    id: 'beckett-lowe', slug: 'beckett-lowe', name: 'Beckett Lowe',
    profileImageUrl: '/bot-images/Bot image 33.png', coverImageUrl: '/tmi-curated/mag-28.jpg',
    bio: 'Grunge-inspired rock vocalist with a raw, unpolished stage presence.',
    city: 'Seattle, WA', countryName: 'United States', flag: '🇺🇸',
    category: 'Rock', tier: 'Ruby', rank: 8, xp: 9600, lineupType: 'solo',
    fanCount: 1450, likes: 2200, isLive: false, audienceCount: 0, timeLive: '',
    roomId: 'room-beckett-lowe', achievementIds: ['ruby-tier'],
    profileRoute: '/performers/beckett-lowe', liveRoomRoute: '/live/rooms/room-beckett-lowe', articleIds: [],
  },
  {
    id: 'simone-achebe', slug: 'simone-achebe', name: 'Simone Achebe',
    profileImageUrl: '/bot-images/Bot image 34.png', coverImageUrl: '/tmi-curated/mag-35.jpg',
    bio: 'Afrobeats singer-songwriter blending highlife melodies with modern R&B.',
    city: 'Accra', countryName: 'Ghana', flag: '🇬🇭',
    category: 'Afrobeats', tier: 'Silver', rank: 5, xp: 18600, lineupType: 'solo',
    fanCount: 3500, likes: 5200, isLive: false, audienceCount: 0, timeLive: '',
    roomId: 'room-simone-achebe', achievementIds: ['silver-tier'],
    profileRoute: '/performers/simone-achebe', liveRoomRoute: '/live/rooms/room-simone-achebe', articleIds: [],
  },
  {
    id: 'tallulah-fox', slug: 'tallulah-fox', name: 'Tallulah Fox',
    profileImageUrl: '/bot-images/Bot image 35.png', coverImageUrl: '/tmi-curated/mag-42.jpg',
    bio: 'Alt-country vocalist mixing honky-tonk twang with indie songwriting.',
    city: 'Austin, TX', countryName: 'United States', flag: '🇺🇸',
    category: 'Country', tier: 'Silver', rank: 6, xp: 16100, lineupType: 'solo',
    fanCount: 2600, likes: 3900, isLive: false, audienceCount: 0, timeLive: '',
    roomId: 'room-tallulah-fox', achievementIds: ['silver-tier'],
    profileRoute: '/performers/tallulah-fox', liveRoomRoute: '/live/rooms/room-tallulah-fox', articleIds: [],
  },
  {
    id: 'ezekiel-vance', slug: 'ezekiel-vance', name: 'Ezekiel Vance',
    profileImageUrl: '/bot-images/Bot image 36.png', coverImageUrl: '/tmi-curated/mag-50.jpg',
    bio: 'Gospel choir director turned solo artist with a voice built to fill a sanctuary.',
    city: 'Atlanta, GA', countryName: 'United States', flag: '🇺🇸',
    category: 'Gospel', tier: 'Gold', rank: 2, xp: 36400, lineupType: 'solo',
    fanCount: 9200, likes: 13500, isLive: false, audienceCount: 0, timeLive: '',
    roomId: 'room-ezekiel-vance', achievementIds: ['gold-tier'],
    profileRoute: '/performers/ezekiel-vance', liveRoomRoute: '/live/rooms/room-ezekiel-vance', articleIds: [],
  },
  {
    id: 'mika-sato', slug: 'mika-sato', name: 'Mika Sato',
    profileImageUrl: '/bot-images/Bot image 37.png', coverImageUrl: '/tmi-curated/mag-58.jpg',
    bio: 'J-pop-adjacent EDM producer blending anime-inspired melodies with festival drops.',
    city: 'Tokyo', countryName: 'Japan', flag: '🇯🇵',
    category: 'EDM', tier: 'Ruby', rank: 8, xp: 9300, lineupType: 'solo',
    fanCount: 1400, likes: 2100, isLive: false, audienceCount: 0, timeLive: '',
    roomId: 'room-mika-sato', achievementIds: ['ruby-tier'],
    profileRoute: '/performers/mika-sato', liveRoomRoute: '/live/rooms/room-mika-sato', articleIds: [],
  },
  {
    id: 'rasheed-carter', slug: 'rasheed-carter', name: 'Rasheed Carter',
    profileImageUrl: '/bot-images/Bot image 38.png', coverImageUrl: '/tmi-curated/mag-66.jpg',
    bio: 'Battle-tested rapper with a technical flow built for cypher circles.',
    city: 'Detroit, MI', countryName: 'United States', flag: '🇺🇸',
    category: 'Rap', tier: 'Silver', rank: 5, xp: 18100, lineupType: 'solo',
    fanCount: 3300, likes: 4900, isLive: false, audienceCount: 0, timeLive: '',
    roomId: 'room-rasheed-carter', achievementIds: ['silver-tier'],
    profileRoute: '/performers/rasheed-carter', liveRoomRoute: '/live/rooms/room-rasheed-carter', articleIds: [],
  },
  {
    id: 'odessa-bright', slug: 'odessa-bright', name: 'Odessa Bright',
    profileImageUrl: '/bot-images/Bot image 39.png', coverImageUrl: '/tmi-curated/mag-74.jpg',
    bio: 'Neo-soul vocalist carrying the Philly sound into a new generation.',
    city: 'Philadelphia, PA', countryName: 'United States', flag: '🇺🇸',
    category: 'Soul', tier: 'Gold', rank: 3, xp: 32100, lineupType: 'solo',
    fanCount: 7700, likes: 11300, isLive: false, audienceCount: 0, timeLive: '',
    roomId: 'room-odessa-bright', achievementIds: ['gold-tier'],
    profileRoute: '/performers/odessa-bright', liveRoomRoute: '/live/rooms/room-odessa-bright', articleIds: [],
  },
  {
    id: 'callum-reid', slug: 'callum-reid', name: 'Callum Reid',
    profileImageUrl: '/bot-images/Bot image 41.png', coverImageUrl: '/tmi-curated/mag-82.jpg',
    bio: 'Anthemic rock vocalist fronting a band built for festival main stages.',
    city: 'Glasgow', countryName: 'United Kingdom', flag: '🇬🇧',
    category: 'Rock', tier: 'Silver', rank: 5, xp: 19400, lineupType: 'band',
    fanCount: 3800, likes: 5600, isLive: false, audienceCount: 0, timeLive: '',
    roomId: 'room-callum-reid', achievementIds: ['silver-tier'],
    profileRoute: '/performers/callum-reid', liveRoomRoute: '/live/rooms/room-callum-reid', articleIds: [],
  },
  {
    id: 'ines-duarte', slug: 'ines-duarte', name: 'Ines Duarte',
    profileImageUrl: '/bot-images/Bot image 42.png', coverImageUrl: '/tmi-curated/mag-20.jpg',
    bio: 'Fado-influenced vocalist bringing Portuguese soul to a global stage.',
    city: 'Lisbon', countryName: 'Portugal', flag: '🇵🇹',
    category: 'Latin', tier: 'Ruby', rank: 9, xp: 8500, lineupType: 'solo',
    fanCount: 1200, likes: 1800, isLive: false, audienceCount: 0, timeLive: '',
    roomId: 'room-ines-duarte', achievementIds: ['ruby-tier'],
    profileRoute: '/performers/ines-duarte', liveRoomRoute: '/live/rooms/room-ines-duarte', articleIds: [],
  },
  {
    id: 'trey-whitfield', slug: 'trey-whitfield', name: 'Trey Whitfield',
    profileImageUrl: '/bot-images/Bot image 43.png', coverImageUrl: '/tmi-curated/mag-28.jpg',
    bio: 'Southern rap veteran with a catalog built on grit and gospel-tinged hooks.',
    city: 'Memphis, TN', countryName: 'United States', flag: '🇺🇸',
    category: 'Hip-Hop', tier: 'Gold', rank: 2, xp: 38600, lineupType: 'solo',
    fanCount: 9900, likes: 14500, isLive: false, audienceCount: 0, timeLive: '',
    roomId: 'room-trey-whitfield', achievementIds: ['gold-tier'],
    profileRoute: '/performers/trey-whitfield', liveRoomRoute: '/live/rooms/room-trey-whitfield', articleIds: [],
  },
  {
    id: 'amara-nwosu', slug: 'amara-nwosu', name: 'Amara Nwosu',
    profileImageUrl: '/bot-images/Bot image 44.png', coverImageUrl: '/tmi-curated/mag-35.jpg',
    bio: 'UK R&B vocalist blending Afrobeat rhythm with silky, radio-ready hooks.',
    city: 'London', countryName: 'United Kingdom', flag: '🇬🇧',
    category: 'R&B', tier: 'Silver', rank: 4, xp: 21100, lineupType: 'solo',
    fanCount: 4300, likes: 6400, isLive: false, audienceCount: 0, timeLive: '',
    roomId: 'room-amara-nwosu', achievementIds: ['silver-tier'],
    profileRoute: '/performers/amara-nwosu', liveRoomRoute: '/live/rooms/room-amara-nwosu', articleIds: [],
  },
  {
    id: 'griffin-marsh', slug: 'griffin-marsh', name: 'Griffin Marsh',
    profileImageUrl: '/bot-images/Bot image 46.png', coverImageUrl: '/tmi-curated/mag-42.jpg',
    bio: 'Chicago blues guitarist keeping the electric blues tradition loud and alive.',
    city: 'Chicago, IL', countryName: 'United States', flag: '🇺🇸',
    category: 'Blues', tier: 'Silver', rank: 6, xp: 15600, lineupType: 'solo',
    fanCount: 2400, likes: 3600, isLive: false, audienceCount: 0, timeLive: '',
    roomId: 'room-griffin-marsh', achievementIds: ['silver-tier'],
    profileRoute: '/performers/griffin-marsh', liveRoomRoute: '/live/rooms/room-griffin-marsh', articleIds: [],
  },
  {
    id: 'wren-sorensen', slug: 'wren-sorensen', name: 'Wren Sorensen',
    profileImageUrl: '/bot-images/Bot image 47.png', coverImageUrl: '/tmi-curated/mag-50.jpg',
    bio: 'Scandinavian indie-pop artist with a minimalist, atmospheric sound.',
    city: 'Copenhagen', countryName: 'Denmark', flag: '🇩🇰',
    category: 'Indie', tier: 'Ruby', rank: 8, xp: 9700, lineupType: 'solo',
    fanCount: 1480, likes: 2200, isLive: false, audienceCount: 0, timeLive: '',
    roomId: 'room-wren-sorensen', achievementIds: ['ruby-tier'],
    profileRoute: '/performers/wren-sorensen', liveRoomRoute: '/live/rooms/room-wren-sorensen', articleIds: [],
  },
  {
    id: 'damari-holt', slug: 'damari-holt', name: 'Damari Holt',
    profileImageUrl: '/bot-images/Bot image 48.png', coverImageUrl: '/tmi-curated/mag-58.jpg',
    bio: 'Dancehall DJ-vocalist hybrid built for sound-system culture and big room sets.',
    city: 'Kingston', countryName: 'Jamaica', flag: '🇯🇲',
    category: 'Dancehall', tier: 'Gold', rank: 3, xp: 30200, lineupType: 'solo',
    fanCount: 7100, likes: 10500, isLive: false, audienceCount: 0, timeLive: '',
    roomId: 'room-damari-holt', achievementIds: ['gold-tier'],
    profileRoute: '/performers/damari-holt', liveRoomRoute: '/live/rooms/room-damari-holt', articleIds: [],
  },
  {
    id: 'colette-fontaine', slug: 'colette-fontaine', name: 'Colette Fontaine',
    profileImageUrl: '/bot-images/Bot image 49.png', coverImageUrl: '/tmi-curated/mag-66.jpg',
    bio: 'Bilingual pop artist writing hooks in both French and English.',
    city: 'Montreal', countryName: 'Canada', flag: '🇨🇦',
    category: 'Pop', tier: 'Silver', rank: 5, xp: 18400, lineupType: 'solo',
    fanCount: 3450, likes: 5150, isLive: false, audienceCount: 0, timeLive: '',
    roomId: 'room-colette-fontaine', achievementIds: ['silver-tier'],
    profileRoute: '/performers/colette-fontaine', liveRoomRoute: '/live/rooms/room-colette-fontaine', articleIds: [],
  },
  {
    id: 'tobias-reign', slug: 'tobias-reign', name: 'Tobias Reign',
    profileImageUrl: '/bot-images/Bot image 51.png', coverImageUrl: '/tmi-curated/mag-74.jpg',
    bio: 'Industrial metal vocalist blending machine-driven riffs with operatic range.',
    city: 'Berlin', countryName: 'Germany', flag: '🇩🇪',
    category: 'Metal', tier: 'Gold', rank: 3, xp: 29400, lineupType: 'solo',
    fanCount: 6800, likes: 10000, isLive: false, audienceCount: 0, timeLive: '',
    roomId: 'room-tobias-reign', achievementIds: ['gold-tier'],
    profileRoute: '/performers/tobias-reign', liveRoomRoute: '/live/rooms/room-tobias-reign', articleIds: [],
  },
  {
    id: 'aaliyah-okafor', slug: 'aaliyah-okafor', name: 'Aaliyah Okafor',
    profileImageUrl: '/bot-images/Bot image 52.png', coverImageUrl: '/tmi-curated/mag-82.jpg',
    bio: 'Contemporary gospel artist bridging traditional choir sound with modern production.',
    city: 'Houston, TX', countryName: 'United States', flag: '🇺🇸',
    category: 'Gospel', tier: 'Silver', rank: 4, xp: 20900, lineupType: 'solo',
    fanCount: 4150, likes: 6200, isLive: false, audienceCount: 0, timeLive: '',
    roomId: 'room-aaliyah-okafor', achievementIds: ['silver-tier'],
    profileRoute: '/performers/aaliyah-okafor', liveRoomRoute: '/live/rooms/room-aaliyah-okafor', articleIds: [],
  },
  {
    id: 'enzo-bianchi', slug: 'enzo-bianchi', name: 'Enzo Bianchi',
    profileImageUrl: '/bot-images/Bot image 53.png', coverImageUrl: '/tmi-curated/mag-20.jpg',
    bio: 'Progressive house producer building slow-burn sets for late-night crowds.',
    city: 'Milan', countryName: 'Italy', flag: '🇮🇹',
    category: 'EDM', tier: 'Silver', rank: 6, xp: 15100, lineupType: 'solo',
    fanCount: 2350, likes: 3500, isLive: false, audienceCount: 0, timeLive: '',
    roomId: 'room-enzo-bianchi', achievementIds: ['silver-tier'],
    profileRoute: '/performers/enzo-bianchi', liveRoomRoute: '/live/rooms/room-enzo-bianchi', articleIds: [],
  },
  {
    id: 'nadia-volkov', slug: 'nadia-volkov', name: 'Nadia Volkov',
    profileImageUrl: '/bot-images/Bot image 54.png', coverImageUrl: '/tmi-curated/mag-28.jpg',
    bio: 'Eastern European pop vocalist with a powerhouse range and cinematic delivery.',
    city: 'Moscow', countryName: 'Russia', flag: '🇷🇺',
    category: 'Pop', tier: 'Ruby', rank: 7, xp: 10800, lineupType: 'solo',
    fanCount: 1650, likes: 2450, isLive: false, audienceCount: 0, timeLive: '',
    roomId: 'room-nadia-volkov', achievementIds: ['ruby-tier'],
    profileRoute: '/performers/nadia-volkov', liveRoomRoute: '/live/rooms/room-nadia-volkov', articleIds: [],
  },
  {
    id: 'solomon-briggs', slug: 'solomon-briggs', name: 'Solomon Briggs',
    profileImageUrl: '/bot-images/Bot image 55.png', coverImageUrl: '/tmi-curated/mag-35.jpg',
    bio: 'Saxophonist carrying the Kansas City jazz tradition into modern rooms.',
    city: 'Kansas City, MO', countryName: 'United States', flag: '🇺🇸',
    category: 'Jazz', tier: 'Silver', rank: 6, xp: 14600, lineupType: 'solo',
    fanCount: 2150, likes: 3200, isLive: false, audienceCount: 0, timeLive: '',
    roomId: 'room-solomon-briggs', achievementIds: ['silver-tier'],
    profileRoute: '/performers/solomon-briggs', liveRoomRoute: '/live/rooms/room-solomon-briggs', articleIds: [],
  },
  {
    id: 'camille-laurent', slug: 'camille-laurent', name: 'Camille Laurent',
    profileImageUrl: '/bot-images/Bot image 56.png', coverImageUrl: '/tmi-curated/mag-42.jpg',
    bio: 'Choreographer leading a crew built for viral routines and stage-ready precision.',
    city: 'Paris', countryName: 'France', flag: '🇫🇷',
    category: 'Dance Crews', tier: 'Gold', rank: 3, xp: 28900, lineupType: 'group',
    fanCount: 6500, likes: 9600, isLive: false, audienceCount: 0, timeLive: '',
    roomId: 'room-camille-laurent', achievementIds: ['gold-tier'],
    profileRoute: '/performers/camille-laurent', liveRoomRoute: '/live/rooms/room-camille-laurent', articleIds: [],
  },
  {
    id: 'bodhi-nakamura', slug: 'bodhi-nakamura', name: 'Bodhi Nakamura',
    profileImageUrl: '/bot-images/Bot image 57.png', coverImageUrl: '/tmi-curated/mag-50.jpg',
    bio: 'Street-style dancer with a crew built for battle circuits and live showcases.',
    city: 'Los Angeles, CA', countryName: 'United States', flag: '🇺🇸',
    category: 'Hip Hop Dance', tier: 'Silver', rank: 5, xp: 17500, lineupType: 'group',
    fanCount: 3150, likes: 4700, isLive: false, audienceCount: 0, timeLive: '',
    roomId: 'room-bodhi-nakamura', achievementIds: ['silver-tier'],
    profileRoute: '/performers/bodhi-nakamura', liveRoomRoute: '/live/rooms/room-bodhi-nakamura', articleIds: [],
  },
  {
    id: 'esperanza-diaz', slug: 'esperanza-diaz', name: 'Esperanza Diaz',
    profileImageUrl: '/bot-images/Bot image 58.png', coverImageUrl: '/tmi-curated/mag-58.jpg',
    bio: 'Cumbia-pop crossover artist bringing Colombian rhythm to global playlists.',
    city: 'Bogotá', countryName: 'Colombia', flag: '🇨🇴',
    category: 'Latin', tier: 'Gold', rank: 2, xp: 35700, lineupType: 'solo',
    fanCount: 8900, likes: 13100, isLive: false, audienceCount: 0, timeLive: '',
    roomId: 'room-esperanza-diaz', achievementIds: ['gold-tier'],
    profileRoute: '/performers/esperanza-diaz', liveRoomRoute: '/live/rooms/room-esperanza-diaz', articleIds: [],
  },
  {
    id: 'jericho-vance', slug: 'jericho-vance', name: 'Jericho Vance',
    profileImageUrl: '/bot-images/Bot image 60.png', coverImageUrl: '/tmi-curated/mag-66.jpg',
    bio: 'Southern-rock-leaning frontman with a voice built for road-worn anthems.',
    city: 'Denver, CO', countryName: 'United States', flag: '🇺🇸',
    category: 'Rock', tier: 'Silver', rank: 6, xp: 16700, lineupType: 'solo',
    fanCount: 2900, likes: 4300, isLive: false, audienceCount: 0, timeLive: '',
    roomId: 'room-jericho-vance', achievementIds: ['silver-tier'],
    profileRoute: '/performers/jericho-vance', liveRoomRoute: '/live/rooms/room-jericho-vance', articleIds: [],
  },
  {
    id: 'thandiwe-mokoena', slug: 'thandiwe-mokoena', name: 'Thandiwe Mokoena',
    profileImageUrl: '/bot-images/Bot image 61.png', coverImageUrl: '/tmi-curated/mag-74.jpg',
    bio: 'Amapiano-influenced artist bringing township groove to the main stage.',
    city: 'Cape Town', countryName: 'South Africa', flag: '🇿🇦',
    category: 'Afrobeats', tier: 'Ruby', rank: 8, xp: 9900, lineupType: 'solo',
    fanCount: 1520, likes: 2280, isLive: false, audienceCount: 0, timeLive: '',
    roomId: 'room-thandiwe-mokoena', achievementIds: ['ruby-tier'],
    profileRoute: '/performers/thandiwe-mokoena', liveRoomRoute: '/live/rooms/room-thandiwe-mokoena', articleIds: [],
  },
  {
    id: 'percy-ladue', slug: 'percy-ladue', name: 'Percy Ladue',
    profileImageUrl: '/bot-images/Bot image 62.png', coverImageUrl: '/tmi-curated/mag-82.jpg',
    bio: 'Improv-trained comic turning crowd work into must-see late-night sets.',
    city: 'Los Angeles, CA', countryName: 'United States', flag: '🇺🇸',
    category: 'Comedy', tier: 'Silver', rank: 5, xp: 17100, lineupType: 'solo',
    fanCount: 3000, likes: 4500, isLive: false, audienceCount: 0, timeLive: '',
    roomId: 'room-percy-ladue', achievementIds: ['silver-tier'],
    profileRoute: '/performers/percy-ladue', liveRoomRoute: '/live/rooms/room-percy-ladue', articleIds: [],
  },
  {
    id: 'idris-salaam', slug: 'idris-salaam', name: 'Idris Salaam',
    profileImageUrl: '/bot-images/Bot image 63.png', coverImageUrl: '/tmi-curated/mag-20.jpg',
    bio: 'Conscious rapper blending jazz-inflected beats with sharp, socially-aware verses.',
    city: 'Minneapolis, MN', countryName: 'United States', flag: '🇺🇸',
    category: 'Rap', tier: 'Gold', rank: 3, xp: 31900, lineupType: 'solo',
    fanCount: 7500, likes: 11000, isLive: false, audienceCount: 0, timeLive: '',
    roomId: 'room-idris-salaam', achievementIds: ['gold-tier'],
    profileRoute: '/performers/idris-salaam', liveRoomRoute: '/live/rooms/room-idris-salaam', articleIds: [],
  },
  {
    id: 'wilhelmina-voss', slug: 'wilhelmina-voss', name: 'Wilhelmina Voss',
    profileImageUrl: '/bot-images/Bot image 64.png', coverImageUrl: '/tmi-curated/mag-28.jpg',
    bio: 'Ambient-techno producer building immersive, low-light listening sets.',
    city: 'Berlin', countryName: 'Germany', flag: '🇩🇪',
    category: 'Electronic', tier: 'Ruby', rank: 8, xp: 9450, lineupType: 'solo',
    fanCount: 1420, likes: 2130, isLive: false, audienceCount: 0, timeLive: '',
    roomId: 'room-wilhelmina-voss', achievementIds: ['ruby-tier'],
    profileRoute: '/performers/wilhelmina-voss', liveRoomRoute: '/live/rooms/room-wilhelmina-voss', articleIds: [],
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
