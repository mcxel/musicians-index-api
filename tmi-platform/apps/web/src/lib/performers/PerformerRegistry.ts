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
    id: 'jah-marlon',
    slug: 'jah-marlon',
    name: 'Jah Marlon',
    profileImageUrl: '/bot-images/Bot image 45.png',
    coverImageUrl: '/tmi-curated/mag-50.jpg',
    bio: 'Roots reggae vocalist bringing full-band fire to every riddim.',
    city: 'Kingston', countryName: 'Jamaica', flag: '🇯🇲',
    category: 'Reggae', tier: 'Silver', rank: 2, xp: 29600, lineupType: 'solo',
    fanCount: 7400, likes: 11100,
    isLive: false, audienceCount: 0, timeLive: '',
    roomId: 'room-jah-marlon',
    achievementIds: ['silver-tier'],
    profileRoute: '/performers/jah-marlon',
    liveRoomRoute: '/live/rooms/room-jah-marlon',
    articleIds: [],
  },
  {
    id: 'gloria-fontaine',
    slug: 'gloria-fontaine',
    name: 'Gloria Fontaine',
    profileImageUrl: '/bot-images/Bot image 50.png',
    coverImageUrl: '/tmi-curated/mag-42.jpg',
    bio: 'Motown-bred soul singer whose voice has filled rooms for four decades.',
    city: 'Detroit, MI', countryName: 'United States', flag: '🇺🇸',
    category: 'Soul', tier: 'Gold', rank: 1, xp: 41200, lineupType: 'solo',
    fanCount: 9100, likes: 13650,
    isLive: false, audienceCount: 0, timeLive: '',
    roomId: 'room-gloria-fontaine',
    achievementIds: ['gold-tier'],
    profileRoute: '/performers/gloria-fontaine',
    liveRoomRoute: '/live/rooms/room-gloria-fontaine',
    articleIds: [],
  },
  {
    id: 'voltage-static',
    slug: 'voltage-static',
    name: 'Voltage Static',
    profileImageUrl: '/bot-images/Bot image 30.png',
    coverImageUrl: '/tmi-curated/mag-35.jpg',
    bio: 'Three-piece indie-rock act built for colorful stage lights and loud choruses.',
    city: 'Houston, TX', countryName: 'United States', flag: '🇺🇸',
    category: 'Rock', tier: 'Gold', rank: 2, xp: 36800, lineupType: 'band',
    fanCount: 7800, likes: 11700,
    isLive: false, audienceCount: 0, timeLive: '',
    roomId: 'room-voltage-static',
    achievementIds: ['gold-tier', 'regional-champion'],
    profileRoute: '/performers/voltage-static',
    liveRoomRoute: '/live/rooms/room-voltage-static',
    articleIds: [],
  },
  {
    id: 'aurelio-vance',
    slug: 'aurelio-vance',
    name: 'Aurelio Vance',
    profileImageUrl: '/bot-images/Bot image 1.png',
    coverImageUrl: '/tmi-curated/mag-58.jpg',
    bio: 'Operatic-crossover tenor bringing theater-trained power to every set.',
    city: 'Milan', countryName: 'Italy', flag: '🇮🇹',
    category: 'Jazz', tier: 'Silver', rank: 4, xp: 24200, lineupType: 'solo',
    fanCount: 5400, likes: 8100,
    isLive: false, audienceCount: 0, timeLive: '',
    roomId: 'room-aurelio-vance',
    achievementIds: ['silver-tier'],
    profileRoute: '/performers/aurelio-vance',
    liveRoomRoute: '/live/rooms/room-aurelio-vance',
    articleIds: [],
  },
  {
    id: 'gospel-glory',
    slug: 'gospel-glory',
    name: 'Gospel Glory Choir',
    profileImageUrl: '/bot-images/Bot image 16.png',
    coverImageUrl: '/tmi-curated/mag-82.jpg',
    bio: 'Twenty-voice choir bringing the fire every Sunday and beyond. Unity in harmony.',
    city: 'Atlanta, GA', countryName: 'United States', flag: '🇺🇸',
    category: 'Gospel', tier: 'Silver', rank: 2, xp: 22800, lineupType: 'group',
    fanCount: 4800, likes: 7200,
    isLive: false, audienceCount: 0, timeLive: '',
    roomId: 'room-gospel-glory',
    achievementIds: ['silver-tier'],
    profileRoute: '/performers/gospel-glory',
    liveRoomRoute: '/live/rooms/room-gospel-glory',
    articleIds: [],
  },
  {
    id: 'michaela-vance',
    slug: 'michaela-vance',
    name: 'Michaela Vance',
    profileImageUrl: '/bot-images/Bot image 40.png',
    coverImageUrl: '/tmi-curated/mag-82.jpg',
    bio: "Lead gospel vocalist whose Sunday-morning power fills any room she steps into.",
    city: 'Atlanta, GA', countryName: 'United States', flag: '🇺🇸',
    category: 'Gospel', tier: 'Silver', rank: 3, xp: 19600, lineupType: 'solo',
    fanCount: 3900, likes: 5800,
    isLive: false, audienceCount: 0, timeLive: '',
    roomId: 'room-michaela-vance',
    achievementIds: ['silver-tier'],
    profileRoute: '/performers/michaela-vance',
    liveRoomRoute: '/live/rooms/room-michaela-vance',
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
    id: 'amberlight-collective', slug: 'amberlight-collective', name: 'The Amberlight Collective',
    profileImageUrl: '/bot-images/Bot image 2.png', coverImageUrl: '/tmi-curated/mag-20.jpg',
    bio: 'Eight-voice a cappella collective turning studio harmonies into festival-ready sets.',
    city: 'Los Angeles, CA', countryName: 'United States', flag: '🇺🇸',
    category: 'Pop', tier: 'Gold', rank: 3, xp: 34200, lineupType: 'group',
    fanCount: 8600, likes: 12400, isLive: false, audienceCount: 0, timeLive: '',
    roomId: 'room-amberlight-collective', achievementIds: ['gold-tier'],
    profileRoute: '/performers/amberlight-collective', liveRoomRoute: '/live/rooms/room-amberlight-collective', articleIds: [],
  },
  {
    id: 'hollow-creek-trio', slug: 'hollow-creek-trio', name: 'The Hollow Creek Trio',
    profileImageUrl: '/bot-images/Bot image 3.png', coverImageUrl: '/tmi-curated/mag-28.jpg',
    bio: 'Banjo, fiddle, and guitar bluegrass trio keeping Appalachian tradition alive.',
    city: 'Asheville, NC', countryName: 'United States', flag: '🇺🇸',
    category: 'Country', tier: 'Silver', rank: 5, xp: 18300, lineupType: 'group',
    fanCount: 3400, likes: 5100, isLive: false, audienceCount: 0, timeLive: '',
    roomId: 'room-hollow-creek-trio', achievementIds: ['silver-tier'],
    profileRoute: '/performers/hollow-creek-trio', liveRoomRoute: '/live/rooms/room-hollow-creek-trio', articleIds: [],
  },
  {
    id: 'radiant-static', slug: 'radiant-static', name: 'Radiant Static',
    profileImageUrl: '/bot-images/Bot image 4.png', coverImageUrl: '/tmi-curated/mag-35.jpg',
    bio: 'Five-piece rock outfit built for packed clubs and festival mainstages.',
    city: 'Denver, CO', countryName: 'United States', flag: '🇺🇸',
    category: 'Rock', tier: 'Silver', rank: 4, xp: 19700, lineupType: 'band',
    fanCount: 3900, likes: 5800, isLive: false, audienceCount: 0, timeLive: '',
    roomId: 'room-radiant-static', achievementIds: ['silver-tier'],
    profileRoute: '/performers/radiant-static', liveRoomRoute: '/live/rooms/room-radiant-static', articleIds: [],
  },
  {
    id: 'marcus-feld', slug: 'marcus-feld', name: 'Marcus Feld',
    profileImageUrl: '/bot-images/Bot image 5.png', coverImageUrl: '/tmi-curated/mag-42.jpg',
    bio: "Saxophonist raised on late-night sets in the Quarter's smokiest rooms.",
    city: 'New Orleans, LA', countryName: 'United States', flag: '🇺🇸',
    category: 'Jazz', tier: 'Gold', rank: 2, xp: 37800, lineupType: 'solo',
    fanCount: 9800, likes: 14200, isLive: false, audienceCount: 0, timeLive: '',
    roomId: 'room-marcus-feld', achievementIds: ['gold-tier'],
    profileRoute: '/performers/marcus-feld', liveRoomRoute: '/live/rooms/room-marcus-feld', articleIds: [],
  },
  {
    id: 'mei-lin-zhao', slug: 'mei-lin-zhao', name: 'Mei Lin Zhao',
    profileImageUrl: '/bot-images/Bot image 6.png', coverImageUrl: '/tmi-curated/mag-50.jpg',
    bio: 'Studio-honed R&B vocalist with a smooth, intimate delivery.',
    city: 'Chicago, IL', countryName: 'United States', flag: '🇺🇸',
    category: 'R&B', tier: 'RUBY', rank: 8, xp: 9400, lineupType: 'solo',
    fanCount: 1400, likes: 2100, isLive: false, audienceCount: 0, timeLive: '',
    roomId: 'room-mei-lin-zhao', achievementIds: ['ruby-tier'],
    profileRoute: '/performers/mei-lin-zhao', liveRoomRoute: '/live/rooms/room-mei-lin-zhao', articleIds: [],
  },
  {
    id: 'anton-reyes', slug: 'anton-reyes', name: 'Anton Reyes',
    profileImageUrl: '/bot-images/Bot image 7.png', coverImageUrl: '/tmi-curated/mag-58.jpg',
    bio: 'Classically trained violinist blurring the line between concert hall and jazz club.',
    city: 'Vienna', countryName: 'Austria', flag: '🇦🇹',
    category: 'Jazz', tier: 'Silver', rank: 4, xp: 20600, lineupType: 'solo',
    fanCount: 4200, likes: 6300, isLive: false, audienceCount: 0, timeLive: '',
    roomId: 'room-anton-reyes', achievementIds: ['silver-tier'],
    profileRoute: '/performers/anton-reyes', liveRoomRoute: '/live/rooms/room-anton-reyes', articleIds: [],
  },
  {
    id: 'ananya-rao', slug: 'ananya-rao', name: 'Ananya Rao',
    profileImageUrl: '/bot-images/Bot image 8.png', coverImageUrl: '/tmi-curated/mag-66.jpg',
    bio: 'Sitar virtuoso reimagining Indian classical tradition for a new generation.',
    city: 'Mumbai', countryName: 'India', flag: '🇮🇳',
    category: 'Indie', tier: 'RUBY', rank: 9, xp: 8100, lineupType: 'solo',
    fanCount: 1100, likes: 1700, isLive: false, audienceCount: 0, timeLive: '',
    roomId: 'room-ananya-rao', achievementIds: ['ruby-tier'],
    profileRoute: '/performers/ananya-rao', liveRoomRoute: '/live/rooms/room-ananya-rao', articleIds: [],
  },
  {
    id: 'hector-villareal', slug: 'hector-villareal', name: 'Hector Villareal',
    profileImageUrl: '/bot-images/Bot image 9.png', coverImageUrl: '/tmi-curated/mag-74.jpg',
    bio: 'Front-porch acoustic storyteller with a warm, weathered voice.',
    city: 'San Antonio, TX', countryName: 'United States', flag: '🇺🇸',
    category: 'Country', tier: 'Gold', rank: 3, xp: 33500, lineupType: 'solo',
    fanCount: 8100, likes: 11900, isLive: false, audienceCount: 0, timeLive: '',
    roomId: 'room-hector-villareal', achievementIds: ['gold-tier'],
    profileRoute: '/performers/hector-villareal', liveRoomRoute: '/live/rooms/room-hector-villareal', articleIds: [],
  },
  {
    id: 'layla-haddad', slug: 'layla-haddad', name: 'Layla Haddad',
    profileImageUrl: '/bot-images/Bot image 10.png', coverImageUrl: '/tmi-curated/mag-82.jpg',
    bio: 'Oud player carrying centuries of Levantine melody into modern rooms.',
    city: 'Beirut', countryName: 'Lebanon', flag: '🇱🇧',
    category: 'Indie', tier: 'Silver', rank: 5, xp: 17200, lineupType: 'solo',
    fanCount: 3100, likes: 4600, isLive: false, audienceCount: 0, timeLive: '',
    roomId: 'room-layla-haddad', achievementIds: ['silver-tier'],
    profileRoute: '/performers/layla-haddad', liveRoomRoute: '/live/rooms/room-layla-haddad', articleIds: [],
  },
  {
    id: 'jun-park', slug: 'jun-park', name: 'Jun Park',
    profileImageUrl: '/bot-images/Bot image 11.png', coverImageUrl: '/tmi-curated/mag-20.jpg',
    bio: 'Club DJ spinning house and techno for late-night crowds.',
    city: 'Seoul', countryName: 'South Korea', flag: '🇰🇷',
    category: 'EDM', tier: 'Gold', rank: 2, xp: 39100, lineupType: 'solo',
    fanCount: 10400, likes: 15300, isLive: false, audienceCount: 0, timeLive: '',
    roomId: 'room-jun-park', achievementIds: ['gold-tier'],
    profileRoute: '/performers/jun-park', liveRoomRoute: '/live/rooms/room-jun-park', articleIds: [],
  },
  {
    id: 'dakota-whitehorse', slug: 'dakota-whitehorse', name: 'Dakota Whitehorse',
    profileImageUrl: '/bot-images/Bot image 12.png', coverImageUrl: '/tmi-curated/mag-28.jpg',
    bio: 'Indigenous artist blending traditional regalia and ceremony into powerful stage presence.',
    city: 'Albuquerque, NM', countryName: 'United States', flag: '🇺🇸',
    category: 'Indie', tier: 'Silver', rank: 6, xp: 15900, lineupType: 'solo',
    fanCount: 2700, likes: 4000, isLive: false, audienceCount: 0, timeLive: '',
    roomId: 'room-dakota-whitehorse', achievementIds: ['silver-tier'],
    profileRoute: '/performers/dakota-whitehorse', liveRoomRoute: '/live/rooms/room-dakota-whitehorse', articleIds: [],
  },
  {
    id: 'renata-voss', slug: 'renata-voss', name: 'Renata Voss',
    profileImageUrl: '/bot-images/Bot image 13.png', coverImageUrl: '/tmi-curated/mag-35.jpg',
    bio: 'Opera-trained soprano crossing into jazz standards and torch songs.',
    city: 'Prague', countryName: 'Czech Republic', flag: '🇨🇿',
    category: 'Jazz', tier: 'RUBY', rank: 7, xp: 10600, lineupType: 'solo',
    fanCount: 1600, likes: 2400, isLive: false, audienceCount: 0, timeLive: '',
    roomId: 'room-renata-voss', achievementIds: ['ruby-tier'],
    profileRoute: '/performers/renata-voss', liveRoomRoute: '/live/rooms/room-renata-voss', articleIds: [],
  },
  {
    id: 'cole-ambrose', slug: 'cole-ambrose', name: 'Cole Ambrose',
    profileImageUrl: '/bot-images/Bot image 14.png', coverImageUrl: '/tmi-curated/mag-42.jpg',
    bio: 'Garage-rock brooder writing riffs between shifts at the shop.',
    city: 'Portland, OR', countryName: 'United States', flag: '🇺🇸',
    category: 'Rock', tier: 'Gold', rank: 3, xp: 32700, lineupType: 'solo',
    fanCount: 7900, likes: 11600, isLive: false, audienceCount: 0, timeLive: '',
    roomId: 'room-cole-ambrose', achievementIds: ['gold-tier'],
    profileRoute: '/performers/cole-ambrose', liveRoomRoute: '/live/rooms/room-cole-ambrose', articleIds: [],
  },
  {
    id: 'ridgeline-pickers', slug: 'ridgeline-pickers', name: 'The Ridgeline Pickers',
    profileImageUrl: '/bot-images/Bot image 17.png', coverImageUrl: '/tmi-curated/mag-58.jpg',
    bio: 'Banjo-and-fiddle bluegrass trio straight off the porch.',
    city: 'Bristol, TN', countryName: 'United States', flag: '🇺🇸',
    category: 'Country', tier: 'RUBY', rank: 8, xp: 9800, lineupType: 'group',
    fanCount: 1500, likes: 2300, isLive: false, audienceCount: 0, timeLive: '',
    roomId: 'room-ridgeline-pickers', achievementIds: ['ruby-tier'],
    profileRoute: '/performers/ridgeline-pickers', liveRoomRoute: '/live/rooms/room-ridgeline-pickers', articleIds: [],
  },
  {
    id: 'solstice-nine', slug: 'solstice-nine', name: 'Solstice Nine',
    profileImageUrl: '/bot-images/Bot image 18.png', coverImageUrl: '/tmi-curated/mag-66.jpg',
    bio: 'Nine-voice pop ensemble stacking harmonies in the studio and on stage.',
    city: 'Nashville, TN', countryName: 'United States', flag: '🇺🇸',
    category: 'Pop', tier: 'Silver', rank: 5, xp: 18900, lineupType: 'group',
    fanCount: 3600, likes: 5400, isLive: false, audienceCount: 0, timeLive: '',
    roomId: 'room-solstice-nine', achievementIds: ['silver-tier'],
    profileRoute: '/performers/solstice-nine', liveRoomRoute: '/live/rooms/room-solstice-nine', articleIds: [],
  },
  {
    id: 'xiu-lan', slug: 'xiu-lan', name: 'Xiu Lan',
    profileImageUrl: '/bot-images/Bot image 19.png', coverImageUrl: '/tmi-curated/mag-74.jpg',
    bio: 'Erhu player merging classical Chinese tradition with modern composition.',
    city: 'Shanghai', countryName: 'China', flag: '🇨🇳',
    category: 'Indie', tier: 'Gold', rank: 3, xp: 31400, lineupType: 'solo',
    fanCount: 7600, likes: 11200, isLive: false, audienceCount: 0, timeLive: '',
    roomId: 'room-xiu-lan', achievementIds: ['gold-tier'],
    profileRoute: '/performers/xiu-lan', liveRoomRoute: '/live/rooms/room-xiu-lan', articleIds: [],
  },
  {
    id: 'concrete-kinfolk', slug: 'concrete-kinfolk', name: 'Concrete Kinfolk',
    profileImageUrl: '/bot-images/Bot image 20.png', coverImageUrl: '/tmi-curated/mag-82.jpg',
    bio: 'Six-deep crew running the block party circuit block by block.',
    city: 'Brooklyn, NY', countryName: 'United States', flag: '🇺🇸',
    category: 'Hip-Hop', tier: 'Platinum', rank: 1, xp: 58200, lineupType: 'group',
    fanCount: 19400, likes: 27600, isLive: false, audienceCount: 0, timeLive: '',
    roomId: 'room-concrete-kinfolk', achievementIds: ['platinum-tier'],
    profileRoute: '/performers/concrete-kinfolk', liveRoomRoute: '/live/rooms/room-concrete-kinfolk', articleIds: [],
  },
  {
    id: 'meera-kapoor', slug: 'meera-kapoor', name: 'Meera Kapoor',
    profileImageUrl: '/bot-images/Bot image 21.png', coverImageUrl: '/tmi-curated/mag-20.jpg',
    bio: 'Opera-trained vocalist bringing classical power to contemporary stages.',
    city: 'Mumbai', countryName: 'India', flag: '🇮🇳',
    category: 'Jazz', tier: 'Silver', rank: 6, xp: 16400, lineupType: 'solo',
    fanCount: 2800, likes: 4100, isLive: false, audienceCount: 0, timeLive: '',
    roomId: 'room-meera-kapoor', achievementIds: ['silver-tier'],
    profileRoute: '/performers/meera-kapoor', liveRoomRoute: '/live/rooms/room-meera-kapoor', articleIds: [],
  },
  {
    id: 'boiler-room-horns', slug: 'boiler-room-horns', name: 'The Boiler Room Horns',
    profileImageUrl: '/bot-images/Bot image 23.png', coverImageUrl: '/tmi-curated/mag-28.jpg',
    bio: 'Sax-and-percussion funk-jazz outfit built for a packed room.',
    city: 'Kansas City, MO', countryName: 'United States', flag: '🇺🇸',
    category: 'Jazz', tier: 'RUBY', rank: 8, xp: 9200, lineupType: 'group',
    fanCount: 1350, likes: 2000, isLive: false, audienceCount: 0, timeLive: '',
    roomId: 'room-boiler-room-horns', achievementIds: ['ruby-tier'],
    profileRoute: '/performers/boiler-room-horns', liveRoomRoute: '/live/rooms/room-boiler-room-horns', articleIds: [],
  },
  {
    id: 'cantor-avraham-levi', slug: 'cantor-avraham-levi', name: 'Cantor Avraham Levi',
    profileImageUrl: '/bot-images/Bot image 24.png', coverImageUrl: '/tmi-curated/mag-35.jpg',
    bio: 'Cantorial vocalist carrying centuries of liturgical tradition into a modern room.',
    city: 'Brooklyn, NY', countryName: 'United States', flag: '🇺🇸',
    category: 'Gospel', tier: 'Silver', rank: 5, xp: 19100, lineupType: 'solo',
    fanCount: 3700, likes: 5500, isLive: false, audienceCount: 0, timeLive: '',
    roomId: 'room-cantor-avraham-levi', achievementIds: ['silver-tier'],
    profileRoute: '/performers/cantor-avraham-levi', liveRoomRoute: '/live/rooms/room-cantor-avraham-levi', articleIds: [],
  },
  {
    id: 'dmitri-kovalenko', slug: 'dmitri-kovalenko', name: 'Dmitri Kovalenko',
    profileImageUrl: '/bot-images/Bot image 25.png', coverImageUrl: '/tmi-curated/mag-42.jpg',
    bio: 'Opera baritone crossing into jazz and torch-song standards.',
    city: 'Kyiv', countryName: 'Ukraine', flag: '🇺🇦',
    category: 'Jazz', tier: 'Gold', rank: 3, xp: 30800, lineupType: 'solo',
    fanCount: 7200, likes: 10600, isLive: false, audienceCount: 0, timeLive: '',
    roomId: 'room-dmitri-kovalenko', achievementIds: ['gold-tier'],
    profileRoute: '/performers/dmitri-kovalenko', liveRoomRoute: '/live/rooms/room-dmitri-kovalenko', articleIds: [],
  },
  {
    id: 'elena-marchetti', slug: 'elena-marchetti', name: 'Elena Marchetti',
    profileImageUrl: '/bot-images/Bot image 26.png', coverImageUrl: '/tmi-curated/mag-50.jpg',
    bio: 'Classically trained violinist reimagining the concert hall as a jazz stage.',
    city: 'Florence', countryName: 'Italy', flag: '🇮🇹',
    category: 'Jazz', tier: 'Silver', rank: 6, xp: 15300, lineupType: 'solo',
    fanCount: 2500, likes: 3700, isLive: false, audienceCount: 0, timeLive: '',
    roomId: 'room-elena-marchetti', achievementIds: ['silver-tier'],
    profileRoute: '/performers/elena-marchetti', liveRoomRoute: '/live/rooms/room-elena-marchetti', articleIds: [],
  },
  {
    id: 'blue-hour-duo', slug: 'blue-hour-duo', name: 'Blue Hour Duo',
    profileImageUrl: '/bot-images/Bot image 27.png', coverImageUrl: '/tmi-curated/mag-58.jpg',
    bio: 'Sax-and-upright-bass duo built for smoky late-night sets.',
    city: 'New Orleans, LA', countryName: 'United States', flag: '🇺🇸',
    category: 'Jazz', tier: 'RUBY', rank: 7, xp: 10100, lineupType: 'duo',
    fanCount: 1550, likes: 2300, isLive: false, audienceCount: 0, timeLive: '',
    roomId: 'room-blue-hour-duo', achievementIds: ['ruby-tier'],
    profileRoute: '/performers/blue-hour-duo', liveRoomRoute: '/live/rooms/room-blue-hour-duo', articleIds: [],
  },
  {
    id: 'timber-line-trio', slug: 'timber-line-trio', name: 'The Timber Line Trio',
    profileImageUrl: '/bot-images/Bot image 28.png', coverImageUrl: '/tmi-curated/mag-66.jpg',
    bio: 'Three-piece bluegrass act built on tight harmonies and faster fingers.',
    city: 'Nashville, TN', countryName: 'United States', flag: '🇺🇸',
    category: 'Country', tier: 'Gold', rank: 3, xp: 33900, lineupType: 'group',
    fanCount: 8300, likes: 12100, isLive: false, audienceCount: 0, timeLive: '',
    roomId: 'room-timber-line-trio', achievementIds: ['gold-tier'],
    profileRoute: '/performers/timber-line-trio', liveRoomRoute: '/live/rooms/room-timber-line-trio', articleIds: [],
  },
  {
    id: 'barnwood-sessions', slug: 'barnwood-sessions', name: 'The Barnwood Sessions',
    profileImageUrl: '/bot-images/Bot image 29.png', coverImageUrl: '/tmi-curated/mag-74.jpg',
    bio: 'Banjo, fiddle, and guitar trio recorded live in a working barn.',
    city: 'Knoxville, TN', countryName: 'United States', flag: '🇺🇸',
    category: 'Country', tier: 'Silver', rank: 5, xp: 17800, lineupType: 'group',
    fanCount: 3200, likes: 4800, isLive: false, audienceCount: 0, timeLive: '',
    roomId: 'room-barnwood-sessions', achievementIds: ['silver-tier'],
    profileRoute: '/performers/barnwood-sessions', liveRoomRoute: '/live/rooms/room-barnwood-sessions', articleIds: [],
  },
  {
    id: 'kenji-osato', slug: 'kenji-osato', name: 'Kenji Osato',
    profileImageUrl: '/bot-images/Bot image 31.png', coverImageUrl: '/tmi-curated/mag-82.jpg',
    bio: 'Bedroom producer turned club-ready electronic artist.',
    city: 'Tokyo', countryName: 'Japan', flag: '🇯🇵',
    category: 'EDM', tier: 'Gold', rank: 3, xp: 29900, lineupType: 'solo',
    fanCount: 7000, likes: 10300, isLive: false, audienceCount: 0, timeLive: '',
    roomId: 'room-kenji-osato', achievementIds: ['gold-tier'],
    profileRoute: '/performers/kenji-osato', liveRoomRoute: '/live/rooms/room-kenji-osato', articleIds: [],
  },
  {
    id: 'fang-wei', slug: 'fang-wei', name: 'Fang Wei',
    profileImageUrl: '/bot-images/Bot image 32.png', coverImageUrl: '/tmi-curated/mag-20.jpg',
    bio: 'Guzheng player bringing centuries-old melody into contemporary composition.',
    city: 'Suzhou', countryName: 'China', flag: '🇨🇳',
    category: 'Indie', tier: 'Silver', rank: 4, xp: 20200, lineupType: 'solo',
    fanCount: 4000, likes: 6000, isLive: false, audienceCount: 0, timeLive: '',
    roomId: 'room-fang-wei', achievementIds: ['silver-tier'],
    profileRoute: '/performers/fang-wei', liveRoomRoute: '/live/rooms/room-fang-wei', articleIds: [],
  },
  {
    id: 'omar-nasser', slug: 'omar-nasser', name: 'Omar Nasser',
    profileImageUrl: '/bot-images/Bot image 33.png', coverImageUrl: '/tmi-curated/mag-28.jpg',
    bio: 'Oud player rooted in Arabic maqam tradition.',
    city: 'Cairo', countryName: 'Egypt', flag: '🇪🇬',
    category: 'Indie', tier: 'RUBY', rank: 8, xp: 9600, lineupType: 'solo',
    fanCount: 1450, likes: 2200, isLive: false, audienceCount: 0, timeLive: '',
    roomId: 'room-omar-nasser', achievementIds: ['ruby-tier'],
    profileRoute: '/performers/omar-nasser', liveRoomRoute: '/live/rooms/room-omar-nasser', articleIds: [],
  },
  {
    id: 'kwesi-osei', slug: 'kwesi-osei', name: 'Kwesi Osei',
    profileImageUrl: '/bot-images/Bot image 34.png', coverImageUrl: '/tmi-curated/mag-35.jpg',
    bio: 'Kora player carrying West African griot tradition into modern rooms.',
    city: 'Kumasi', countryName: 'Ghana', flag: '🇬🇭',
    category: 'Afrobeats', tier: 'Silver', rank: 5, xp: 18600, lineupType: 'solo',
    fanCount: 3500, likes: 5200, isLive: false, audienceCount: 0, timeLive: '',
    roomId: 'room-kwesi-osei', achievementIds: ['silver-tier'],
    profileRoute: '/performers/kwesi-osei', liveRoomRoute: '/live/rooms/room-kwesi-osei', articleIds: [],
  },
  {
    id: 'camila-duarte', slug: 'camila-duarte', name: 'Camila Duarte',
    profileImageUrl: '/bot-images/Bot image 35.png', coverImageUrl: '/tmi-curated/mag-42.jpg',
    bio: 'High-energy conga player turning every set into a call-and-response celebration.',
    city: 'Cali', countryName: 'Colombia', flag: '🇨🇴',
    category: 'Latin', tier: 'Silver', rank: 6, xp: 16100, lineupType: 'solo',
    fanCount: 2600, likes: 3900, isLive: false, audienceCount: 0, timeLive: '',
    roomId: 'room-camila-duarte', achievementIds: ['silver-tier'],
    profileRoute: '/performers/camila-duarte', liveRoomRoute: '/live/rooms/room-camila-duarte', articleIds: [],
  },
  {
    id: 'tha-blockwatch', slug: 'tha-blockwatch', name: 'Tha Blockwatch',
    profileImageUrl: '/bot-images/Bot image 36.png', coverImageUrl: '/tmi-curated/mag-50.jpg',
    bio: 'NY-rooted duo running the underground circuit one alley cypher at a time.',
    city: 'Newark, NJ', countryName: 'United States', flag: '🇺🇸',
    category: 'Hip-Hop', tier: 'Gold', rank: 2, xp: 36400, lineupType: 'duo',
    fanCount: 9200, likes: 13500, isLive: false, audienceCount: 0, timeLive: '',
    roomId: 'room-tha-blockwatch', achievementIds: ['gold-tier'],
    profileRoute: '/performers/tha-blockwatch', liveRoomRoute: '/live/rooms/room-tha-blockwatch', articleIds: [],
  },
  {
    id: 'viktor-anholt', slug: 'viktor-anholt', name: 'Viktor Anholt',
    profileImageUrl: '/bot-images/Bot image 37.png', coverImageUrl: '/tmi-curated/mag-58.jpg',
    bio: 'Opera-trained tenor with a flair for the dramatic.',
    city: 'Stockholm', countryName: 'Sweden', flag: '🇸🇪',
    category: 'Jazz', tier: 'RUBY', rank: 8, xp: 9300, lineupType: 'solo',
    fanCount: 1400, likes: 2100, isLive: false, audienceCount: 0, timeLive: '',
    roomId: 'room-viktor-anholt', achievementIds: ['ruby-tier'],
    profileRoute: '/performers/viktor-anholt', liveRoomRoute: '/live/rooms/room-viktor-anholt', articleIds: [],
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
    id: 'marlon-reese', slug: 'marlon-reese', name: 'Marlon Reese',
    profileImageUrl: '/bot-images/Bot image 39.png', coverImageUrl: '/tmi-curated/mag-74.jpg',
    bio: 'Neo-soul vocalist carrying the Philly sound into a new generation.',
    city: 'Philadelphia, PA', countryName: 'United States', flag: '🇺🇸',
    category: 'Soul', tier: 'Gold', rank: 3, xp: 32100, lineupType: 'solo',
    fanCount: 7700, likes: 11300, isLive: false, audienceCount: 0, timeLive: '',
    roomId: 'room-marlon-reese', achievementIds: ['gold-tier'],
    profileRoute: '/performers/marlon-reese', liveRoomRoute: '/live/rooms/room-marlon-reese', articleIds: [],
  },
  {
    id: 'andre-brooks', slug: 'andre-brooks', name: 'Andre Brooks',
    profileImageUrl: '/bot-images/Bot image 41.png', coverImageUrl: '/tmi-curated/mag-82.jpg',
    bio: 'Warm, joyful soul vocalist who lights up every room he steps into.',
    city: 'Atlanta, GA', countryName: 'United States', flag: '🇺🇸',
    category: 'Soul', tier: 'Silver', rank: 5, xp: 19400, lineupType: 'solo',
    fanCount: 3800, likes: 5600, isLive: false, audienceCount: 0, timeLive: '',
    roomId: 'room-andre-brooks', achievementIds: ['silver-tier'],
    profileRoute: '/performers/andre-brooks', liveRoomRoute: '/live/rooms/room-andre-brooks', articleIds: [],
  },
  {
    id: 'priyanka-sharma', slug: 'priyanka-sharma', name: 'Priyanka Sharma',
    profileImageUrl: '/bot-images/Bot image 42.png', coverImageUrl: '/tmi-curated/mag-20.jpg',
    bio: 'Powerhouse vocalist blending Bollywood tradition with modern stage presence.',
    city: 'Jaipur', countryName: 'India', flag: '🇮🇳',
    category: 'Indie', tier: 'RUBY', rank: 9, xp: 8500, lineupType: 'solo',
    fanCount: 1200, likes: 1800, isLive: false, audienceCount: 0, timeLive: '',
    roomId: 'room-priyanka-sharma', achievementIds: ['ruby-tier'],
    profileRoute: '/performers/priyanka-sharma', liveRoomRoute: '/live/rooms/room-priyanka-sharma', articleIds: [],
  },
  {
    id: 'walter-higgins', slug: 'walter-higgins', name: 'Walter Higgins',
    profileImageUrl: '/bot-images/Bot image 43.png', coverImageUrl: '/tmi-curated/mag-28.jpg',
    bio: 'Southern gospel veteran whose voice has filled churches for forty years.',
    city: 'Nashville, TN', countryName: 'United States', flag: '🇺🇸',
    category: 'Gospel', tier: 'Gold', rank: 2, xp: 38600, lineupType: 'solo',
    fanCount: 9900, likes: 14500, isLive: false, audienceCount: 0, timeLive: '',
    roomId: 'room-walter-higgins', achievementIds: ['gold-tier'],
    profileRoute: '/performers/walter-higgins', liveRoomRoute: '/live/rooms/room-walter-higgins', articleIds: [],
  },
  {
    id: 'yuna-cho', slug: 'yuna-cho', name: 'Yuna Cho',
    profileImageUrl: '/bot-images/Bot image 44.png', coverImageUrl: '/tmi-curated/mag-35.jpg',
    bio: 'Piano balladeer with a hushed, aching voice built for candlelit rooms.',
    city: 'Seoul', countryName: 'South Korea', flag: '🇰🇷',
    category: 'Soul', tier: 'Silver', rank: 4, xp: 21100, lineupType: 'solo',
    fanCount: 4300, likes: 6400, isLive: false, audienceCount: 0, timeLive: '',
    roomId: 'room-yuna-cho', achievementIds: ['silver-tier'],
    profileRoute: '/performers/yuna-cho', liveRoomRoute: '/live/rooms/room-yuna-cho', articleIds: [],
  },
  {
    id: 'kesia-blackwood', slug: 'kesia-blackwood', name: 'Kesia Blackwood',
    profileImageUrl: '/bot-images/Bot image 46.png', coverImageUrl: '/tmi-curated/mag-42.jpg',
    bio: 'Roots reggae vocalist wrapped in red-gold-green, built for a sunset set.',
    city: 'Kingston', countryName: 'Jamaica', flag: '🇯🇲',
    category: 'Reggae', tier: 'Silver', rank: 6, xp: 15600, lineupType: 'solo',
    fanCount: 2400, likes: 3600, isLive: false, audienceCount: 0, timeLive: '',
    roomId: 'room-kesia-blackwood', achievementIds: ['silver-tier'],
    profileRoute: '/performers/kesia-blackwood', liveRoomRoute: '/live/rooms/room-kesia-blackwood', articleIds: [],
  },
  {
    id: 'farid-malik', slug: 'farid-malik', name: 'Farid Malik',
    profileImageUrl: '/bot-images/Bot image 47.png', coverImageUrl: '/tmi-curated/mag-50.jpg',
    bio: 'Richly-dressed singer-songwriter blending Qawwali roots with modern guitar.',
    city: 'Karachi', countryName: 'Pakistan', flag: '🇵🇰',
    category: 'Indie', tier: 'RUBY', rank: 8, xp: 9700, lineupType: 'solo',
    fanCount: 1480, likes: 2200, isLive: false, audienceCount: 0, timeLive: '',
    roomId: 'room-farid-malik', achievementIds: ['ruby-tier'],
    profileRoute: '/performers/farid-malik', liveRoomRoute: '/live/rooms/room-farid-malik', articleIds: [],
  },
  {
    id: 'sage-littlefeather', slug: 'sage-littlefeather', name: 'Sage Littlefeather',
    profileImageUrl: '/bot-images/Bot image 48.png', coverImageUrl: '/tmi-curated/mag-58.jpg',
    bio: 'Indigenous singer-songwriter carrying regalia and tradition onto every stage.',
    city: 'Santa Fe, NM', countryName: 'United States', flag: '🇺🇸',
    category: 'Indie', tier: 'Gold', rank: 3, xp: 30200, lineupType: 'solo',
    fanCount: 7100, likes: 10500, isLive: false, audienceCount: 0, timeLive: '',
    roomId: 'room-sage-littlefeather', achievementIds: ['gold-tier'],
    profileRoute: '/performers/sage-littlefeather', liveRoomRoute: '/live/rooms/room-sage-littlefeather', articleIds: [],
  },
  {
    id: 'zahra-amiri', slug: 'zahra-amiri', name: 'Zahra Amiri',
    profileImageUrl: '/bot-images/Bot image 49.png', coverImageUrl: '/tmi-curated/mag-66.jpg',
    bio: 'Devotional vocalist bringing cathedral-scale reverence to every performance.',
    city: 'Isfahan', countryName: 'Iran', flag: '🇮🇷',
    category: 'Indie', tier: 'Silver', rank: 5, xp: 18400, lineupType: 'solo',
    fanCount: 3450, likes: 5150, isLive: false, audienceCount: 0, timeLive: '',
    roomId: 'room-zahra-amiri', achievementIds: ['silver-tier'],
    profileRoute: '/performers/zahra-amiri', liveRoomRoute: '/live/rooms/room-zahra-amiri', articleIds: [],
  },
  {
    id: 'simone-carter', slug: 'simone-carter', name: 'Simone Carter',
    profileImageUrl: '/bot-images/Bot image 51.png', coverImageUrl: '/tmi-curated/mag-74.jpg',
    bio: 'R&B vocalist with a commanding stage presence and a soaring run.',
    city: 'Atlanta, GA', countryName: 'United States', flag: '🇺🇸',
    category: 'R&B', tier: 'Gold', rank: 3, xp: 29400, lineupType: 'solo',
    fanCount: 6800, likes: 10000, isLive: false, audienceCount: 0, timeLive: '',
    roomId: 'room-simone-carter', achievementIds: ['gold-tier'],
    profileRoute: '/performers/simone-carter', liveRoomRoute: '/live/rooms/room-simone-carter', articleIds: [],
  },
  {
    id: 'destiny-cole', slug: 'destiny-cole', name: 'Destiny Cole',
    profileImageUrl: '/bot-images/Bot image 52.png', coverImageUrl: '/tmi-curated/mag-82.jpg',
    bio: 'Late-night lounge vocalist with a sultry, magnetic delivery.',
    city: 'Houston, TX', countryName: 'United States', flag: '🇺🇸',
    category: 'R&B', tier: 'Silver', rank: 4, xp: 20900, lineupType: 'solo',
    fanCount: 4150, likes: 6200, isLive: false, audienceCount: 0, timeLive: '',
    roomId: 'room-destiny-cole', achievementIds: ['silver-tier'],
    profileRoute: '/performers/destiny-cole', liveRoomRoute: '/live/rooms/room-destiny-cole', articleIds: [],
  },
  {
    id: 'marvin-duke', slug: 'marvin-duke', name: 'Marvin Duke',
    profileImageUrl: '/bot-images/Bot image 53.png', coverImageUrl: '/tmi-curated/mag-20.jpg',
    bio: '70s-inspired funk-soul frontman with velvet suits and a bigger voice.',
    city: 'Detroit, MI', countryName: 'United States', flag: '🇺🇸',
    category: 'Funk', tier: 'Silver', rank: 6, xp: 15100, lineupType: 'solo',
    fanCount: 2350, likes: 3500, isLive: false, audienceCount: 0, timeLive: '',
    roomId: 'room-marvin-duke', achievementIds: ['silver-tier'],
    profileRoute: '/performers/marvin-duke', liveRoomRoute: '/live/rooms/room-marvin-duke', articleIds: [],
  },
  {
    id: 'rosa-delgado', slug: 'rosa-delgado', name: 'Rosa Delgado',
    profileImageUrl: '/bot-images/Bot image 54.png', coverImageUrl: '/tmi-curated/mag-28.jpg',
    bio: 'Flamenco-pop vocalist bringing fire and flowers to every set.',
    city: 'Seville', countryName: 'Spain', flag: '🇪🇸',
    category: 'Latin', tier: 'RUBY', rank: 7, xp: 10800, lineupType: 'solo',
    fanCount: 1650, likes: 2450, isLive: false, audienceCount: 0, timeLive: '',
    roomId: 'room-rosa-delgado', achievementIds: ['ruby-tier'],
    profileRoute: '/performers/rosa-delgado', liveRoomRoute: '/live/rooms/room-rosa-delgado', articleIds: [],
  },
  {
    id: 'jae-won-kim', slug: 'jae-won-kim', name: 'Jae-won Kim',
    profileImageUrl: '/bot-images/Bot image 55.png', coverImageUrl: '/tmi-curated/mag-35.jpg',
    bio: 'K-pop-adjacent solo artist with a moody, neon-lit sound.',
    city: 'Seoul', countryName: 'South Korea', flag: '🇰🇷',
    category: 'Pop', tier: 'Silver', rank: 6, xp: 14600, lineupType: 'solo',
    fanCount: 2150, likes: 3200, isLive: false, audienceCount: 0, timeLive: '',
    roomId: 'room-jae-won-kim', achievementIds: ['silver-tier'],
    profileRoute: '/performers/jae-won-kim', liveRoomRoute: '/live/rooms/room-jae-won-kim', articleIds: [],
  },
  {
    id: 'meera-chandra', slug: 'meera-chandra', name: 'Meera Chandra',
    profileImageUrl: '/bot-images/Bot image 56.png', coverImageUrl: '/tmi-curated/mag-42.jpg',
    bio: 'Fusion vocalist blending Indian tradition with lounge-jazz phrasing.',
    city: 'Mumbai', countryName: 'India', flag: '🇮🇳',
    category: 'Indie', tier: 'Gold', rank: 3, xp: 28900, lineupType: 'solo',
    fanCount: 6500, likes: 9600, isLive: false, audienceCount: 0, timeLive: '',
    roomId: 'room-meera-chandra', achievementIds: ['gold-tier'],
    profileRoute: '/performers/meera-chandra', liveRoomRoute: '/live/rooms/room-meera-chandra', articleIds: [],
  },
  {
    id: 'patricia-simone', slug: 'patricia-simone', name: 'Patricia Simone',
    profileImageUrl: '/bot-images/Bot image 57.png', coverImageUrl: '/tmi-curated/mag-50.jpg',
    bio: 'Decades-deep soul and jazz vocalist with a room-silencing voice.',
    city: 'Chicago, IL', countryName: 'United States', flag: '🇺🇸',
    category: 'Soul', tier: 'Silver', rank: 5, xp: 17500, lineupType: 'solo',
    fanCount: 3150, likes: 4700, isLive: false, audienceCount: 0, timeLive: '',
    roomId: 'room-patricia-simone', achievementIds: ['silver-tier'],
    profileRoute: '/performers/patricia-simone', liveRoomRoute: '/live/rooms/room-patricia-simone', articleIds: [],
  },
  {
    id: 'rafael-costa', slug: 'rafael-costa', name: 'Rafael Costa',
    profileImageUrl: '/bot-images/Bot image 58.png', coverImageUrl: '/tmi-curated/mag-58.jpg',
    bio: 'Candlelit acoustic singer-songwriter rooted in fado and folk tradition.',
    city: 'Lisbon', countryName: 'Portugal', flag: '🇵🇹',
    category: 'Latin', tier: 'Gold', rank: 2, xp: 35700, lineupType: 'solo',
    fanCount: 8900, likes: 13100, isLive: false, audienceCount: 0, timeLive: '',
    roomId: 'room-rafael-costa', achievementIds: ['gold-tier'],
    profileRoute: '/performers/rafael-costa', liveRoomRoute: '/live/rooms/room-rafael-costa', articleIds: [],
  },
  {
    id: 'amara-justice', slug: 'amara-justice', name: 'Amara Justice',
    profileImageUrl: '/bot-images/Bot image 60.png', coverImageUrl: '/tmi-curated/mag-66.jpg',
    bio: 'Tropical-soul vocalist with locs down her back and sunshine in her voice.',
    city: 'Montego Bay', countryName: 'Jamaica', flag: '🇯🇲',
    category: 'Reggae', tier: 'Silver', rank: 6, xp: 16700, lineupType: 'solo',
    fanCount: 2900, likes: 4300, isLive: false, audienceCount: 0, timeLive: '',
    roomId: 'room-amara-justice', achievementIds: ['silver-tier'],
    profileRoute: '/performers/amara-justice', liveRoomRoute: '/live/rooms/room-amara-justice', articleIds: [],
  },
  {
    id: 'sipho-ndlovu', slug: 'sipho-ndlovu', name: 'Sipho Ndlovu',
    profileImageUrl: '/bot-images/Bot image 61.png', coverImageUrl: '/tmi-curated/mag-74.jpg',
    bio: 'Amapiano-adjacent star known for gold jackets and bigger hooks.',
    city: 'Johannesburg', countryName: 'South Africa', flag: '🇿🇦',
    category: 'Afrobeats', tier: 'RUBY', rank: 8, xp: 9900, lineupType: 'solo',
    fanCount: 1520, likes: 2280, isLive: false, audienceCount: 0, timeLive: '',
    roomId: 'room-sipho-ndlovu', achievementIds: ['ruby-tier'],
    profileRoute: '/performers/sipho-ndlovu', liveRoomRoute: '/live/rooms/room-sipho-ndlovu', articleIds: [],
  },
  {
    id: 'nova-sterling', slug: 'nova-sterling', name: 'Nova Sterling',
    profileImageUrl: '/bot-images/Bot image 62.png', coverImageUrl: '/tmi-curated/mag-82.jpg',
    bio: 'Futuristic glam-pop artist built for neon stages and big synth drops.',
    city: 'Los Angeles, CA', countryName: 'United States', flag: '🇺🇸',
    category: 'Electronic', tier: 'Silver', rank: 5, xp: 17100, lineupType: 'solo',
    fanCount: 3000, likes: 4500, isLive: false, audienceCount: 0, timeLive: '',
    roomId: 'room-nova-sterling', achievementIds: ['silver-tier'],
    profileRoute: '/performers/nova-sterling', liveRoomRoute: '/live/rooms/room-nova-sterling', articleIds: [],
  },
  {
    id: 'barbara-steele', slug: 'barbara-steele', name: 'Barbara Steele',
    profileImageUrl: '/bot-images/Bot image 63.png', coverImageUrl: '/tmi-curated/mag-20.jpg',
    bio: 'Classic torch-song vocalist keeping the Great American Songbook alive.',
    city: 'New York, NY', countryName: 'United States', flag: '🇺🇸',
    category: 'Jazz', tier: 'Gold', rank: 3, xp: 31900, lineupType: 'solo',
    fanCount: 7500, likes: 11000, isLive: false, audienceCount: 0, timeLive: '',
    roomId: 'room-barbara-steele', achievementIds: ['gold-tier'],
    profileRoute: '/performers/barbara-steele', liveRoomRoute: '/live/rooms/room-barbara-steele', articleIds: [],
  },
  {
    id: 'nizhoni-begay', slug: 'nizhoni-begay', name: 'Nizhoni Begay',
    profileImageUrl: '/bot-images/Bot image 64.png', coverImageUrl: '/tmi-curated/mag-28.jpg',
    bio: 'Indigenous singer-songwriter at the piano, blending ballads with heritage.',
    city: 'Flagstaff, AZ', countryName: 'United States', flag: '🇺🇸',
    category: 'Indie', tier: 'RUBY', rank: 8, xp: 9450, lineupType: 'solo',
    fanCount: 1420, likes: 2130, isLive: false, audienceCount: 0, timeLive: '',
    roomId: 'room-nizhoni-begay', achievementIds: ['ruby-tier'],
    profileRoute: '/performers/nizhoni-begay', liveRoomRoute: '/live/rooms/room-nizhoni-begay', articleIds: [],
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
