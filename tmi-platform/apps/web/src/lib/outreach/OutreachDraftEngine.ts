/**
 * OutreachDraftEngine
 * Generates invite posts, sponsor pitches, venue pitches, and performer invites.
 * ALL drafts are queued for owner approval — nothing auto-posts.
 */

export type OutreachType =
  | 'social-post-general'
  | 'social-post-performer'
  | 'social-post-fan'
  | 'sponsor-pitch'
  | 'venue-pitch'
  | 'performer-invite'
  | 'advertiser-pitch'
  | 'writer-invite';

export type OutreachDraft = {
  id: string;
  type: OutreachType;
  channel: string;
  subject?: string;
  body: string;
  callToAction: string;
  url: string;
  status: 'queued' | 'approved' | 'sent' | 'rejected';
  createdAt: number;
};

const PLATFORM_URL = 'https://themusiciansindex.com';
const SIGNUP_URL = `${PLATFORM_URL}/auth/signup`;

const DRAFTS: OutreachDraft[] = [
  // ─── Social Posts ──────────────────────────────────────────────────────────
  {
    id: 'social-general-1',
    type: 'social-post-general',
    channel: 'Twitter / X',
    body: `🎵 The Musician's Index is LIVE.\n\nLive battles. Real prize pools. Brady Bunch lobby walls.\nArtists, fans, sponsors, venues — all in one place.\n\nFree to join. Start earning today.\n${SIGNUP_URL}`,
    callToAction: 'Join Free',
    url: SIGNUP_URL,
    status: 'queued',
    createdAt: Date.now(),
  },
  {
    id: 'social-performer-1',
    type: 'social-post-performer',
    channel: 'Twitter / X + Instagram',
    body: `Performers 🎤 — TMI is open.\n\nGo live. Enter battles. Win prize pools.\nSponsors put their logos in YOUR orbit.\n\nStart free. No live equipment needed.\n${SIGNUP_URL}\n\n#MusicPlatform #LivePerformance #IndieArtist`,
    callToAction: 'Join as Performer',
    url: `${SIGNUP_URL}?role=performer`,
    status: 'queued',
    createdAt: Date.now(),
  },
  {
    id: 'social-fan-1',
    type: 'social-post-fan',
    channel: 'Twitter / X + TikTok',
    body: `You can vote in live music battles and win prizes just for watching.\n\nThe Musician's Index — free fan accounts open now.\n${SIGNUP_URL}\n\n#LiveMusic #MusicBattle #FreeApp`,
    callToAction: 'Join as Fan',
    url: `${SIGNUP_URL}?role=fan`,
    status: 'queued',
    createdAt: Date.now(),
  },
  {
    id: 'reddit-hiphop-1',
    type: 'social-post-performer',
    channel: 'Reddit r/hiphopheads',
    subject: 'New live music battle platform — free to join, real prize pools',
    body: `Hey r/hiphopheads — I built a live battle platform called The Musician's Index.\n\nArtists battle live. Fans vote. Winners take real prize pools funded by sponsors.\n\nBattles, ciphers, challenges, monthly idol competitions, Monday Night Stage.\nFree accounts open. Would love to hear what you think.\n${SIGNUP_URL}`,
    callToAction: 'Check It Out',
    url: PLATFORM_URL,
    status: 'queued',
    createdAt: Date.now(),
  },
  {
    id: 'discord-music-1',
    type: 'social-post-general',
    channel: 'Discord (music servers)',
    body: `🎵 The Musician's Index just launched.\n\nLive battles • Ciphers • Artist vs Artist challenges\nPrize pools funded by sponsors • Fan voting • Brady Bunch lobby walls\n\nFree to sign up: ${SIGNUP_URL}\n\nLooking for artists, fans, sponsors, and venues to fill the first wave.`,
    callToAction: 'Join Free',
    url: SIGNUP_URL,
    status: 'queued',
    createdAt: Date.now(),
  },

  // ─── Sponsor Pitches ───────────────────────────────────────────────────────
  {
    id: 'sponsor-pitch-local-1',
    type: 'sponsor-pitch',
    channel: 'Email / DM',
    subject: `Sponsor a live music artist on The Musician's Index — starting at $25/mo`,
    body: `Hi,\n\nI'm reaching out because The Musician's Index is a live music competition platform where artists battle, perform, and compete for prize pools in front of live audiences.\n\nAs a sponsor, your brand:\n• Gets featured in the artist's "orbit" — your logo spins around them on stage\n• Is credited in their prize pool\n• Gets ad placement starting at $0.99/day\n• Receives a proof-of-promotion report monthly\n\nLocal sponsor entry: $25/mo\nGroup sponsor entry: $50/mo\n\nWe're launching now with the first wave of artists and fans. Perfect time to get in early.\n\nLearn more: ${PLATFORM_URL}/onboarding/sponsor`,
    callToAction: 'Become a Sponsor',
    url: `${PLATFORM_URL}/onboarding/sponsor`,
    status: 'queued',
    createdAt: Date.now(),
  },

  // ─── Venue Pitches ─────────────────────────────────────────────────────────
  {
    id: 'venue-pitch-1',
    type: 'venue-pitch',
    channel: 'Email / DM',
    subject: `List your venue on The Musician's Index — free ticketing + digital audience`,
    body: `Hi,\n\nThe Musician's Index is a live music platform where fans watch and vote on artists performing in real time.\n\nWe're looking to partner with venues to:\n• List your events and sell tickets through our platform\n• Stream live performances to our digital audience\n• Feature Monday Night Stage from your location\n• Print venue-branded tickets on demand\n\nVenue listing is free. We take a small commission on ticket sales only.\n\nInterested? Set up your venue profile here: ${PLATFORM_URL}/onboarding/venue`,
    callToAction: 'List Your Venue',
    url: `${PLATFORM_URL}/onboarding/venue`,
    status: 'queued',
    createdAt: Date.now(),
  },

  // ─── Performer Invites ─────────────────────────────────────────────────────
  {
    id: 'performer-invite-1',
    type: 'performer-invite',
    channel: 'DM (Instagram / Twitter)',
    body: `Hey! I wanted to personally invite you to The Musician's Index.\n\nYou'd be a perfect fit — we have live battles, cipher sessions, and monthly idol competitions. Artists earn from tips, sponsor patronage, beat sales, and prize pools.\n\nFree to start. Your first live room could have real fans watching and voting tonight.\n\nSign up here: ${SIGNUP_URL}?role=performer`,
    callToAction: 'Join as Performer',
    url: `${SIGNUP_URL}?role=performer`,
    status: 'queued',
    createdAt: Date.now(),
  },

  // ─── Advertiser Pitch ──────────────────────────────────────────────────────
  {
    id: 'advertiser-pitch-1',
    type: 'advertiser-pitch',
    channel: 'Email',
    subject: `Advertise on The Musician's Index — reach music fans from $0.99/day`,
    body: `Hi,\n\nThe Musician's Index is a live music competition platform with fans watching battles, ciphers, and live performances in real time.\n\nAd placements available:\n• Profile page ads: $0.99/day\n• Live room overlays: $4.99/day\n• Homepage feature: $9.99/day\n• Magazine spread: $19.99/day\n\nAll placements are targeted to music fans, artists, and venue-goers.\n\nBook your placement: ${PLATFORM_URL}/advertiser/placements`,
    callToAction: 'Book Ad Placement',
    url: `${PLATFORM_URL}/advertiser/placements`,
    status: 'queued',
    createdAt: Date.now(),
  },

  // ─── Writer/Reporter Invite ────────────────────────────────────────────────
  {
    id: 'writer-invite-1',
    type: 'writer-invite',
    channel: 'Email / DM',
    subject: `Write for The Musician's Index — get paid per verified article`,
    body: `Hi,\n\nThe Musician's Index is a live music platform with an editorial magazine covering artists, battles, and industry news.\n\nWe're looking for writers and reporters to:\n• Cover live events and battles\n• Interview artists\n• Write genre pieces and recaps\n\nPayout is based on verified performance: reads, read time, and quality score. The better the article, the more you earn.\n\nApply here: ${PLATFORM_URL}/onboarding/artist`,
    callToAction: 'Apply to Write',
    url: `${PLATFORM_URL}/onboarding/artist`,
    status: 'queued',
    createdAt: Date.now(),
  },
];

export function getAllDrafts(): OutreachDraft[] {
  return DRAFTS;
}

export function getDraftsByType(type: OutreachType): OutreachDraft[] {
  return DRAFTS.filter((d) => d.type === type);
}

export function getDraftsByStatus(status: OutreachDraft['status']): OutreachDraft[] {
  return DRAFTS.filter((d) => d.status === status);
}

export function getQueuedDrafts(): OutreachDraft[] {
  return getDraftsByStatus('queued');
}

export function getRevenueFastestPaths(): string[] {
  return [
    '1. Post social-general-1 on Twitter/X — takes 30 seconds',
    '2. DM performer-invite-1 to 5 artists you know personally',
    '3. Send sponsor-pitch-local-1 to any local business near you',
    '4. Post reddit-hiphop-1 on r/hiphopheads or r/makinghiphop',
    '5. Share in any music Discord server you\'re already in',
  ];
}
