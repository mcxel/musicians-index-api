// Campaign registry — a campaign page ties together: multiple artists + a sponsor + ticket sales.
// Example: /campaigns/summer-tour-2026

export interface CampaignArtist {
  name: string;
  role: string;
  slug?: string;
  emoji: string;
  accentColor: string;
}

export interface CampaignSponsor {
  name: string;
  emoji: string;
  ctaLabel: string;
  ctaHref: string;
  color: string;
}

export interface CampaignConfig {
  slug: string;
  title: string;
  subtitle: string;
  heroColor: string;
  accentColor: string;
  startDate: string;
  endDate: string;
  status: 'upcoming' | 'live' | 'ended';
  location: string;
  ticketHref: string;
  ticketPrice: string;
  artists: CampaignArtist[];
  sponsors: CampaignSponsor[];
  description: string[];
  prizePool?: string;
  eventType: 'concert' | 'battle-tour' | 'cypher-event' | 'release-party';
  emoji: string;
}

export const CAMPAIGNS: CampaignConfig[] = [
  {
    slug: 'summer-tour-2026',
    title: 'TMI SUMMER TOUR 2026',
    subtitle: 'The biggest live music moment of the year — all on The Musician\'s Index.',
    heroColor: '#FF6B00',
    accentColor: '#FFD700',
    startDate: '2026-07-01',
    endDate: '2026-08-31',
    status: 'upcoming',
    location: 'Nationwide + Online',
    ticketHref: '/venues/sell',
    ticketPrice: 'From $15',
    eventType: 'concert',
    emoji: '🌞',
    prizePool: '$25,000',
    description: [
      'The TMI Summer Tour is the platform\'s first nationwide event series — a live, multi-city movement that puts rising artists on real stages while broadcasting to the entire TMI community.',
      'Each stop features 5 artists selected through the Cypher Arena rankings. Fans vote in real time. Winners earn ranking points, cash prizes, and editorial coverage in TMI Magazine.',
      'Whether you\'re attending in person or watching live from your feed, every performance counts toward Season 1 standings.',
    ],
    artists: [
      { name: 'Nova Cipher',  role: 'Headliner',   emoji: '⚡', accentColor: '#FFD700', slug: 'nova-cipher'   },
      { name: 'Zion Freq',   role: 'Co-Headliner', emoji: '🌊', accentColor: '#00FFFF', slug: 'zion-freq'    },
      { name: 'Astra Nova',  role: 'Special Guest', emoji: '🔮', accentColor: '#AA2DFF', slug: 'astra-nova'   },
      { name: 'Ray Journey', role: 'Opening Act',  emoji: '🎤', accentColor: '#FF2DAA', slug: 'ray-journey'  },
    ],
    sponsors: [
      { name: 'SoundWave Audio', emoji: '🎛️', ctaLabel: 'WIN GEAR',   ctaHref: '/sponsored/soundwave-audio', color: '#AA2DFF' },
      { name: 'BeatMarket',      emoji: '💰', ctaLabel: '$2.5K/WEEK', ctaHref: '/sponsored/beatmarket',      color: '#00FFFF' },
    ],
  },
  {
    slug: 'season-1-grand-finale',
    title: 'SEASON 1 GRAND FINALE',
    subtitle: 'One champion. One night. The entire TMI community watching.',
    heroColor: '#1a0a2e',
    accentColor: '#FFD700',
    startDate: '2026-09-15',
    endDate: '2026-09-15',
    status: 'upcoming',
    location: 'TMI Arena — Online',
    ticketHref: '/venues/sell',
    ticketPrice: 'Free to Watch · VIP from $25',
    eventType: 'battle-tour',
    emoji: '🏆',
    prizePool: '$50,000',
    description: [
      'The Season 1 Grand Finale is the final event of The Musician\'s Index\'s inaugural season. Every point earned across battles, cyphers, and Stream & Win sessions throughout the year comes down to this night.',
      'The top 8 artists on the Season 1 leaderboard compete in a single-elimination bracket, each round decided by live fan votes.',
      'The Season 1 Champion receives: $50,000 prize pool, a 30-day homepage broadcast slot, TMI Magazine Issue 2 cover story, and official Season 1 Champion title.',
    ],
    artists: [
      { name: 'TBD — Top 8',  role: 'Season Leaders',   emoji: '🏆', accentColor: '#FFD700' },
      { name: 'Bebo',          role: 'Host',             emoji: '🤖', accentColor: '#00FFFF', slug: 'bebo' },
      { name: 'Julius',        role: 'Co-Host',          emoji: '🐾', accentColor: '#FFD700', slug: 'julius' },
    ],
    sponsors: [
      { name: 'TMI Official', emoji: '🏆', ctaLabel: 'JOIN SEASON 1', ctaHref: '/sponsored/tmi-official', color: '#FFD700' },
    ],
  },
  {
    slug: 'cypher-open-june',
    title: 'OPEN CYPHER — JUNE',
    subtitle: 'Any artist. Any genre. Open gates.',
    heroColor: '#0d001a',
    accentColor: '#AA2DFF',
    startDate: '2026-06-01',
    endDate: '2026-06-30',
    status: 'live',
    location: 'TMI Cypher Arena — Online',
    ticketHref: '/battles/challenge/create',
    ticketPrice: 'Free Entry',
    eventType: 'cypher-event',
    emoji: '⚔️',
    description: [
      'The June Open Cypher is TMI\'s monthly open-format competition. No invites required — any registered artist can enter, perform, and compete for ranking points and prize slots.',
      'Every session is broadcast live to the platform. Fan reactions, votes, and tips are counted in real time.',
      'Top 3 finishers each week receive ranking bonuses and editorial coverage.',
    ],
    artists: [
      { name: 'Open to All', role: 'Any Registered Artist', emoji: '🎤', accentColor: '#AA2DFF' },
    ],
    sponsors: [
      { name: 'BeatMarket', emoji: '💰', ctaLabel: '$2,500 WEEKLY', ctaHref: '/sponsored/beatmarket', color: '#00FFFF' },
    ],
  },
];

export function getCampaignBySlug(slug: string): CampaignConfig | undefined {
  return CAMPAIGNS.find(c => c.slug === slug);
}
