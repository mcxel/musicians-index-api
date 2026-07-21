// ─── YoPho Skin Registry & $0.99 Marketplace Engine ────────────────────────
// Defines original platform YoPho Skins, interactive object hotspots,
// audio-reactivity settings, sound ambience loops, and $0.99 entitlement rules.

export interface YoPhoHotspot {
  id: string;
  name: string;
  icon: string;
  xPercent: number; // 0..100 horizontal position in room
  yPercent: number; // 0..100 vertical position in room
  actionType: 'playlist' | 'video' | 'biography' | 'rankings' | 'merch' | 'live' | 'tour';
  description: string;
}

export interface YoPhoSkin {
  id: string;
  name: string;
  category: 'studio' | 'loft' | 'beach' | 'penthouse' | 'dj' | 'gamer' | 'cabin' | 'jazz' | 'comedy' | 'dance';
  priceUsd: number; // 0 for free starter, 0.99 for skins
  isFreeStarter?: boolean;
  tagline: string;
  videoBgUrl: string;
  fallbackImageUrl?: string;
  accentColor: string;
  secondaryColor: string;
  ambientSound: 'vinyl' | 'rain' | 'city' | 'ocean' | 'fire';
  ambientSoundUrl?: string;
  hotspots: YoPhoHotspot[];
  previewThumbnail: string;
}

export const YOPHO_SKIN_CATALOG: YoPhoSkin[] = [
  {
    id: 'urban-loft-starter',
    name: 'Urban Skyline Loft (Free Starter)',
    category: 'loft',
    priceUsd: 0.00,
    isFreeStarter: true,
    tagline: 'Classic skyline loft with sunset window reflection & neon visualizer',
    videoBgUrl: '/yopho/Yoho Canvas base 2.mp4',
    fallbackImageUrl: '/yopho/Yopho base 1.jpg',
    accentColor: '#00E5FF',
    secondaryColor: '#FF2DAA',
    ambientSound: 'city',
    previewThumbnail: '/yopho/Yopho base 1.jpg',
    hotspots: [
      { id: 'monitors', name: 'Studio Monitors', icon: '🎵', xPercent: 22, yPercent: 48, actionType: 'playlist', description: 'Play Featured Tracks & Playlists' },
      { id: 'tv', name: 'Smart TV Screen', icon: '📺', xPercent: 78, yPercent: 32, actionType: 'video', description: 'Watch Music Videos & Live Streams' },
      { id: 'laptop', name: 'Producer Laptop', icon: '💻', xPercent: 50, yPercent: 62, actionType: 'biography', description: 'Read Artist Bio & Press Kit' },
      { id: 'trophies', name: 'Trophy Shelf', icon: '🏆', xPercent: 12, yPercent: 28, actionType: 'rankings', description: 'View Rankings & Achievements' },
      { id: 'merch', name: 'Merch Display', icon: '🛒', xPercent: 88, yPercent: 68, actionType: 'merch', description: 'Shop Vinyl, Merch & Skins' },
      { id: 'door', name: 'Live Stage Door', icon: '🚪', xPercent: 5, yPercent: 55, actionType: 'live', description: 'Step Into Active Live Room' },
      { id: 'window', name: 'Skyline Window', icon: '🪟', xPercent: 50, yPercent: 25, actionType: 'tour', description: 'View Tour Dates & Upcoming Shows' },
    ],
  },
  {
    id: 'recording-studio-vip',
    name: 'VIP Recording Studio ($0.99)',
    category: 'studio',
    priceUsd: 0.99,
    tagline: 'Pro mixing console, animated LED meters & soundproof acoustic walls',
    videoBgUrl: '/yopho/Yoho Canvas base 4.mp4',
    accentColor: '#FFD700',
    secondaryColor: '#FF9500',
    ambientSound: 'vinyl',
    previewThumbnail: '/yopho/Yoho Canvas base 4.mp4',
    hotspots: [
      { id: 'monitors', name: 'Genelec Monitors', icon: '🔊', xPercent: 28, yPercent: 42, actionType: 'playlist', description: 'Listen to Unreleased Master Tracks' },
      { id: 'tv', name: 'Studio Video Wall', icon: '🎬', xPercent: 70, yPercent: 30, actionType: 'video', description: 'Studio Recording Sessions' },
      { id: 'laptop', name: 'DAW Workstation', icon: '💻', xPercent: 48, yPercent: 58, actionType: 'biography', description: 'Artist Credits & Production Notes' },
      { id: 'trophies', name: 'Gold Records', icon: '📀', xPercent: 15, yPercent: 22, actionType: 'rankings', description: 'Certified Platinum Awards' },
      { id: 'merch', name: 'Beat & Sample Store', icon: '🎧', xPercent: 84, yPercent: 62, actionType: 'merch', description: 'Buy Beats & Merch' },
      { id: 'door', name: 'Live Booth Door', icon: '🎙️', xPercent: 8, yPercent: 50, actionType: 'live', description: 'Enter Live Cypher Booth' },
      { id: 'window', name: 'Studio Viewfinder', icon: '🪟', xPercent: 50, yPercent: 20, actionType: 'tour', description: 'Upcoming Studio Sessions & Events' },
    ],
  },
  {
    id: 'beach-house-sunset',
    name: 'Sunset Beach House ($0.99)',
    category: 'beach',
    priceUsd: 0.99,
    tagline: 'Panoramic ocean view, swaying palm trees & warm tropical glow',
    videoBgUrl: '/yopho/Yoho Canvas base 7.mp4',
    accentColor: '#00FF88',
    secondaryColor: '#00E5FF',
    ambientSound: 'ocean',
    previewThumbnail: '/yopho/Yoho Canvas base 7.mp4',
    hotspots: [
      { id: 'monitors', name: 'Acoustic Guitar', icon: '🎸', xPercent: 30, yPercent: 55, actionType: 'playlist', description: 'Acoustic Sunset Playlist' },
      { id: 'tv', name: 'Ocean Projection', icon: '🌊', xPercent: 68, yPercent: 35, actionType: 'video', description: 'Live Beach Concert Stream' },
      { id: 'laptop', name: 'Travel Journal', icon: '📖', xPercent: 52, yPercent: 65, actionType: 'biography', description: 'Bio & Beach Stories' },
      { id: 'trophies', name: 'Surfer Awards', icon: '🏄‍♂️', xPercent: 14, yPercent: 30, actionType: 'rankings', description: 'Top Fan Wall' },
      { id: 'merch', name: 'Beach Shop', icon: '🌴', xPercent: 86, yPercent: 70, actionType: 'merch', description: 'Summer Apparel & Beach Vinyl' },
      { id: 'door', name: 'Pier Entrance', icon: '🚪', xPercent: 6, yPercent: 58, actionType: 'live', description: 'Sunset Live Stage' },
      { id: 'window', name: 'Ocean Horizon', icon: '🌅', xPercent: 50, yPercent: 22, actionType: 'tour', description: 'Summer Festival Tour' },
    ],
  },
  {
    id: 'luxury-penthouse-cyber',
    name: 'Cyber Penthouse ($0.99)',
    category: 'penthouse',
    priceUsd: 0.99,
    tagline: 'High-rise glass penthouse, neon fireplace & holographic sound waves',
    videoBgUrl: '/yopho/Yoho Canvas base 9.mp4',
    accentColor: '#AA2DFF',
    secondaryColor: '#FF2DAA',
    ambientSound: 'rain',
    previewThumbnail: '/yopho/Yoho Canvas base 9.mp4',
    hotspots: [
      { id: 'monitors', name: 'Vinyl Turntable', icon: '💿', xPercent: 25, yPercent: 50, actionType: 'playlist', description: 'Penthouse Chill Mix' },
      { id: 'tv', name: 'Hologram Display', icon: '🔮', xPercent: 75, yPercent: 28, actionType: 'video', description: 'Official Music Videos' },
      { id: 'laptop', name: 'Executive Desk', icon: '🖥️', xPercent: 50, yPercent: 60, actionType: 'biography', description: 'Artist Story & Vision' },
      { id: 'trophies', name: 'Hall of Fame Wall', icon: '🏛️', xPercent: 12, yPercent: 24, actionType: 'rankings', description: 'Billboard Top Chart Stats' },
      { id: 'merch', name: 'Luxury Boutique', icon: '💎', xPercent: 88, yPercent: 64, actionType: 'merch', description: 'Limited Edition Items & Skins' },
      { id: 'door', name: 'VIP Elevator', icon: '🛗', xPercent: 6, yPercent: 52, actionType: 'live', description: 'Join Private VIP Lounge' },
      { id: 'window', name: 'Metropolis Night View', icon: '🏙️', xPercent: 50, yPercent: 22, actionType: 'tour', description: 'World Stadium Tour' },
    ],
  },
  {
    id: 'dj-club-laser-stage',
    name: 'DJ Club Laser Stage ($0.99)',
    category: 'dj',
    priceUsd: 0.99,
    tagline: 'Pulsing laser arrays, crowd visualizer & bass-reactive strobe lights',
    videoBgUrl: '/yopho/Yoho Canvas base 10.mp4',
    accentColor: '#00FFFF',
    secondaryColor: '#FF00FF',
    ambientSound: 'city',
    previewThumbnail: '/yopho/Yoho Canvas base 10.mp4',
    hotspots: [
      { id: 'monitors', name: 'DJ Decks', icon: '🎛️', xPercent: 50, yPercent: 52, actionType: 'playlist', description: 'Live DJ Mixes & House Sets' },
      { id: 'tv', name: 'Laser Wall', icon: '🎆', xPercent: 78, yPercent: 30, actionType: 'video', description: 'Festival Stage Performances' },
      { id: 'laptop', name: 'Mixer Tablet', icon: '📱', xPercent: 35, yPercent: 62, actionType: 'biography', description: 'DJ Profile & Discography' },
      { id: 'trophies', name: 'Club Trophies', icon: '🏆', xPercent: 10, yPercent: 26, actionType: 'rankings', description: 'Global DJ Leaderboard' },
      { id: 'merch', name: 'Merch Booth', icon: '👕', xPercent: 90, yPercent: 68, actionType: 'merch', description: 'Rave Merch & VIP Passes' },
      { id: 'door', name: 'Backstage Pass', icon: '🎟️', xPercent: 6, yPercent: 54, actionType: 'live', description: 'Jump to Main DJ Stage' },
      { id: 'window', name: 'Arena Skylight', icon: '🌌', xPercent: 50, yPercent: 20, actionType: 'tour', description: 'Global Club Tour Dates' },
    ],
  },
  {
    id: 'gamer-streamer-cyber-room',
    name: 'Cyber Gamer Room ($0.99)',
    category: 'gamer',
    priceUsd: 0.99,
    tagline: 'Triple-monitor gaming rig, RGB lighting strips & streaming webcam',
    videoBgUrl: '/yopho/Yoho Canvas base 12.mp4',
    accentColor: '#FF2020',
    secondaryColor: '#00FF88',
    ambientSound: 'rain',
    previewThumbnail: '/yopho/Yoho Canvas base 12.mp4',
    hotspots: [
      { id: 'monitors', name: 'Stream Audio Mixer', icon: '🎙️', xPercent: 30, yPercent: 46, actionType: 'playlist', description: 'Gaming Soundtracks & Beats' },
      { id: 'tv', name: 'Gaming Monitor', icon: '🖥️', xPercent: 50, yPercent: 36, actionType: 'video', description: 'Twitch / YouTube Stream Clips' },
      { id: 'laptop', name: 'Chat Terminal', icon: '💬', xPercent: 70, yPercent: 60, actionType: 'biography', description: 'Streamer Bio & Socials' },
      { id: 'trophies', name: 'Esports Badges', icon: '🥇', xPercent: 12, yPercent: 28, actionType: 'rankings', description: 'Tournament Win Record' },
      { id: 'merch', name: 'Gamer Gear Shelf', icon: '🎮', xPercent: 86, yPercent: 66, actionType: 'merch', description: 'Custom Skins & Merch' },
      { id: 'door', name: 'Stream Room Door', icon: '🚪', xPercent: 8, yPercent: 52, actionType: 'live', description: 'Go Live to Gaming Audience' },
      { id: 'window', name: 'Cyber Window', icon: '🏙️', xPercent: 50, yPercent: 18, actionType: 'tour', description: 'Upcoming Live Streams' },
    ],
  },
  {
    id: 'country-acoustic-cabin',
    name: 'Country Acoustic Cabin ($0.99)',
    category: 'cabin',
    priceUsd: 0.99,
    tagline: 'Rustic fireplace, wooden acoustic guitar, warm candle flame & mountain rain',
    videoBgUrl: '/yopho/Yoho Canvas base 13.mp4',
    accentColor: '#FF9500',
    secondaryColor: '#FFD700',
    ambientSound: 'fire',
    previewThumbnail: '/yopho/Yoho Canvas base 13.mp4',
    hotspots: [
      { id: 'monitors', name: 'Banjo & Fiddle Stand', icon: '🎻', xPercent: 26, yPercent: 52, actionType: 'playlist', description: 'Bluegrass & Country Roots' },
      { id: 'tv', name: 'Fireplace Screen', icon: '🔥', xPercent: 50, yPercent: 42, actionType: 'video', description: 'Campfire Acoustic Sessions' },
      { id: 'laptop', name: 'Songwriting Journal', icon: '📝', xPercent: 72, yPercent: 62, actionType: 'biography', description: 'Lyric Book & Bio' },
      { id: 'trophies', name: 'Country Music Awards', icon: '🤠', xPercent: 14, yPercent: 32, actionType: 'rankings', description: 'Grand Ole Opry Wall' },
      { id: 'merch', name: 'Cabin Merch Chest', icon: '🧰', xPercent: 84, yPercent: 70, actionType: 'merch', description: 'Hats, Shirts & Boots' },
      { id: 'door', name: 'Porch Door', icon: '🚪', xPercent: 6, yPercent: 56, actionType: 'live', description: 'Join Porch Jam Session' },
      { id: 'window', name: 'Mountain Window', icon: '⛰️', xPercent: 50, yPercent: 22, actionType: 'tour', description: 'Americana Tour Dates' },
    ],
  },
  {
    id: 'smokey-jazz-lounge',
    name: 'Smokey Jazz Lounge ($0.99)',
    category: 'jazz',
    priceUsd: 0.99,
    tagline: 'Vintage grand piano, brass saxophone spotlight & dim moody neon',
    videoBgUrl: '/yopho/Yoho Canvas base 16.mp4',
    accentColor: '#9B59B6',
    secondaryColor: '#E63000',
    ambientSound: 'vinyl',
    previewThumbnail: '/yopho/Yoho Canvas base 16.mp4',
    hotspots: [
      { id: 'monitors', name: 'Grand Piano', icon: '🎹', xPercent: 45, yPercent: 50, actionType: 'playlist', description: 'Midnight Jazz & Soul Set' },
      { id: 'tv', name: 'Vintage Projector', icon: '📽️', xPercent: 72, yPercent: 32, actionType: 'video', description: 'Live Jazz Club Recitals' },
      { id: 'laptop', name: 'Jazz Archives', icon: '📜', xPercent: 28, yPercent: 62, actionType: 'biography', description: 'Musician History & Roots' },
      { id: 'trophies', name: 'Grammy Wall', icon: '🎷', xPercent: 12, yPercent: 28, actionType: 'rankings', description: 'Jazz Master Honours' },
      { id: 'merch', name: 'Vinyl Table', icon: '💿', xPercent: 86, yPercent: 66, actionType: 'merch', description: 'Rare Vinyl Records' },
      { id: 'door', name: 'Lounge Entrance', icon: '🚪', xPercent: 6, yPercent: 54, actionType: 'live', description: 'Enter Midnight Lounge' },
      { id: 'window', name: 'Brick Alley Window', icon: '🎷', xPercent: 50, yPercent: 20, actionType: 'tour', description: 'Club Residency Dates' },
    ],
  },
  {
    id: 'comedy-club-spotlight',
    name: 'Comedy Club Spotlight ($0.99)',
    category: 'comedy',
    priceUsd: 0.99,
    tagline: 'Brick wall stage, vintage microphone & laughter crowd atmosphere',
    videoBgUrl: '/yopho/Yoho Canvas base 17.mp4',
    accentColor: '#FFD700',
    secondaryColor: '#E63000',
    ambientSound: 'city',
    previewThumbnail: '/yopho/Yoho Canvas base 17.mp4',
    hotspots: [
      { id: 'monitors', name: 'Stage Mic', icon: '🎙️', xPercent: 50, yPercent: 48, actionType: 'playlist', description: 'Comedy Sets & Standup Audio' },
      { id: 'tv', name: 'Broadcast Monitor', icon: '📺', xPercent: 76, yPercent: 30, actionType: 'video', description: 'Comedy Specials & Roast Battles' },
      { id: 'laptop', name: 'Joke Notebook', icon: '📓', xPercent: 30, yPercent: 60, actionType: 'biography', description: 'Comedian Bio & Podcast' },
      { id: 'trophies', name: 'Roast Belt', icon: '🥊', xPercent: 14, yPercent: 26, actionType: 'rankings', description: 'Dirty Dozens Roast Leaderboard' },
      { id: 'merch', name: 'Comedy Merch Stand', icon: '🧢', xPercent: 88, yPercent: 68, actionType: 'merch', description: 'Hats, Hoodies & Tickets' },
      { id: 'door', name: 'Green Room Door', icon: '🚪', xPercent: 6, yPercent: 52, actionType: 'live', description: 'Step On Stage Live' },
      { id: 'window', name: 'Club Marquee', icon: '🎪', xPercent: 50, yPercent: 18, actionType: 'tour', description: 'Standup Tour Schedule' },
    ],
  },
  {
    id: 'neon-dance-studio',
    name: 'Neon Dance Studio ($0.99)',
    category: 'dance',
    priceUsd: 0.99,
    tagline: 'Full mirror wall, pulsing floor strobe lights & high-energy beat bass',
    videoBgUrl: '/yopho/Yoho Canvas base 21.mp4',
    accentColor: '#FF2DAA',
    secondaryColor: '#00FFFF',
    ambientSound: 'city',
    previewThumbnail: '/yopho/Yoho Canvas base 21.mp4',
    hotspots: [
      { id: 'monitors', name: 'Studio Boombox', icon: '📻', xPercent: 28, yPercent: 52, actionType: 'playlist', description: 'Choreography & Dance Tracks' },
      { id: 'tv', name: 'Mirror Display', icon: '🪞', xPercent: 50, yPercent: 34, actionType: 'video', description: 'Dance Offs & Choreography Videos' },
      { id: 'laptop', name: 'Crew Tablet', icon: '📱', xPercent: 72, yPercent: 62, actionType: 'biography', description: 'Dancer Profile & Crew Bio' },
      { id: 'trophies', name: 'Dance Battle Cup', icon: '🏆', xPercent: 12, yPercent: 28, actionType: 'rankings', description: 'World Dance Party Ranks' },
      { id: 'merch', name: 'Dancewear Rack', icon: '👟', xPercent: 86, yPercent: 66, actionType: 'merch', description: 'Kicks & Custom Skins' },
      { id: 'door', name: 'Arena Stage Gate', icon: '🚪', xPercent: 6, yPercent: 56, actionType: 'live', description: 'Enter World Dance Battle' },
      { id: 'window', name: 'Studio Skyline', icon: '🌃', xPercent: 50, yPercent: 20, actionType: 'tour', description: 'Dance Workshop & Tour Dates' },
    ],
  },
];

// Helper to retrieve unlocked skins from localStorage / DB
export function getUnlockedSkinIds(): string[] {
  if (typeof window === 'undefined') return ['urban-loft-starter'];
  try {
    const saved = localStorage.getItem('tmi_unlocked_yopho_skins');
    if (saved) {
      const parsed = JSON.parse(saved) as string[];
      if (Array.isArray(parsed) && parsed.includes('urban-loft-starter')) {
        return parsed;
      }
    }
  } catch {
    // fallback
  }
  return ['urban-loft-starter'];
}

// Unlock skin by ID
export function unlockSkinById(skinId: string): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const current = getUnlockedSkinIds();
    if (!current.includes(skinId)) {
      const next = [...current, skinId];
      localStorage.setItem('tmi_unlocked_yopho_skins', JSON.stringify(next));
      // Dispatch XP reward
      window.dispatchEvent(
        new CustomEvent('tmi-xp-reward', {
          detail: { amount: 100, action: `Unlocked YoPho Skin: ${skinId}` },
        })
      );
      return true;
    }
  } catch {
    // failure
  }
  return false;
}
