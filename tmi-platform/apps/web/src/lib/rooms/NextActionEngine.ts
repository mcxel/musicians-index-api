/**
 * NextActionEngine
 * Suggests what a user should do next based on what they just did.
 * Context-aware nudges that keep users exploring the platform.
 */

export type PlatformContext =
  | 'watched-battle' | 'read-article' | 'finished-cypher' | 'bought-beat'
  | 'voted' | 'joined-live' | 'left-live' | 'signed-up' | 'viewed-profile'
  | 'sponsored-artist' | 'placed-ad' | 'won-contest' | 'submitted-challenge';

export type NextAction = {
  id: string;
  title: string;
  description: string;
  ctaLabel: string;
  ctaHref: string;
  priority: number;
  xpHint?: number;
};

const ACTION_MAP: Record<PlatformContext, NextAction[]> = {
  'watched-battle': [
    { id: 'enter-battle', title: 'Think you can do better?', description: 'Enter the next battle. Submissions are open.', ctaLabel: 'Enter a Battle', ctaHref: '/battles/create', priority: 1, xpHint: 50 },
    { id: 'submit-challenge', title: 'Submit Your Track', description: 'Drop your track in an async challenge. No live needed.', ctaLabel: 'Submit Track', ctaHref: '/challenges/submit', priority: 2, xpHint: 25 },
  ],
  'read-article': [
    { id: 'join-live', title: 'See Them Live', description: 'This artist is performing live right now.', ctaLabel: 'Join Live Room', ctaHref: '/live/lobby-wall', priority: 1 },
    { id: 'enter-cypher', title: 'Join the Cipher', description: 'All styles welcome. Come in and flow.', ctaLabel: 'Join Cipher', ctaHref: '/cypher/lobby-wall', priority: 2, xpHint: 15 },
  ],
  'finished-cypher': [
    { id: 'collab', title: 'Keep the Energy Going', description: 'Start a cipher of your own or collaborate on a track.', ctaLabel: 'Start Cipher', ctaHref: '/cypher/create', priority: 1, xpHint: 100 },
    { id: 'battle', title: 'Turn It Into a Battle', description: 'Challenge someone from the cipher.', ctaLabel: 'Challenge Them', ctaHref: '/battles', priority: 2 },
  ],
  'bought-beat': [
    { id: 'submit-challenge', title: 'Use That Beat', description: 'Submit it to a challenge while it\'s fresh.', ctaLabel: 'Enter Challenge', ctaHref: '/challenges', priority: 1, xpHint: 50 },
    { id: 'go-live', title: 'Perform It Live', description: 'Open a live room and show what you did with it.', ctaLabel: 'Go Live', ctaHref: '/cypher/live', priority: 2 },
  ],
  'voted': [
    { id: 'watch-battle', title: 'More Battles Live', description: 'Your vote matters — there are more battles happening right now.', ctaLabel: 'Watch More', ctaHref: '/battles/lobby-wall', priority: 1 },
    { id: 'upgrade-fan', title: 'Get a Vote Multiplier', description: 'Pro fans get 1.2× vote power. Gold fans get 2×.', ctaLabel: 'See Fan Tiers', ctaHref: '/subscribe', priority: 2 },
  ],
  'joined-live': [
    { id: 'tip', title: 'Send a Tip', description: 'Show love and unlock more from this artist.', ctaLabel: 'Send Tip', ctaHref: '/account', priority: 1 },
    { id: 'sponsor', title: 'Become a Sponsor', description: 'Put your logo in their orbit for $25/mo.', ctaLabel: 'Sponsor Them', ctaHref: '/onboarding/sponsor', priority: 2 },
  ],
  'left-live': [
    { id: 'random-room', title: 'Try Another Room', description: 'Hit random and find your vibe.', ctaLabel: 'Random Room', ctaHref: '/live/lobby-wall', priority: 1 },
    { id: 'challenges', title: 'Enter a Challenge Instead', description: 'No live pressure — submit async.', ctaLabel: 'Browse Challenges', ctaHref: '/challenges', priority: 2 },
  ],
  'signed-up': [
    { id: 'complete-profile', title: 'Complete Your Profile', description: 'Add a photo and bio so people can find you.', ctaLabel: 'Set Up Profile', ctaHref: '/account', priority: 1, xpHint: 50 },
    { id: 'explore-home', title: 'See What\'s Live', description: 'Browse the magazine and jump into live rooms.', ctaLabel: 'Go to Home', ctaHref: '/home/1', priority: 2, xpHint: 10 },
  ],
  'viewed-profile': [
    { id: 'follow', title: 'Follow This Artist', description: 'Get notified when they go live.', ctaLabel: 'Follow', ctaHref: '/account', priority: 1 },
    { id: 'sponsor', title: 'Support Them as a Sponsor', description: 'Your logo in their orbit, funding their prizes.', ctaLabel: 'Become Sponsor', ctaHref: '/onboarding/sponsor', priority: 2 },
  ],
  'sponsored-artist': [
    { id: 'more-sponsors', title: 'Sponsor More Artists', description: 'Expand your reach across more performers.', ctaLabel: 'Find Artists', ctaHref: '/artists/dashboard', priority: 1 },
    { id: 'upgrade-sponsor', title: 'Upgrade Your Tier', description: 'Bigger sponsors get bigger prize pool credit.', ctaLabel: 'See Sponsor Tiers', ctaHref: '/subscribe', priority: 2 },
  ],
  'placed-ad': [
    { id: 'analytics', title: 'Check Your Ad Performance', description: 'See impressions, clicks, and reach.', ctaLabel: 'View Analytics', ctaHref: '/advertiser/analytics', priority: 1 },
    { id: 'more-placements', title: 'Add More Placements', description: 'Cover more of the platform at $0.99/day.', ctaLabel: 'More Placements', ctaHref: '/advertiser/placements', priority: 2 },
  ],
  'won-contest': [
    { id: 'claim', title: 'Claim Your Prize', description: 'Your winnings are waiting.', ctaLabel: 'Claim Prize', ctaHref: '/prizes', priority: 1 },
    { id: 'next-contest', title: 'Enter the Next One', description: 'Keep the streak going. New contests open weekly.', ctaLabel: 'See Contests', ctaHref: '/challenges', priority: 2 },
  ],
  'submitted-challenge': [
    { id: 'vote', title: 'Vote on Other Entries', description: 'Voting opens your own entry to more votes.', ctaLabel: 'Vote Now', ctaHref: '/battles', priority: 1, xpHint: 25 },
    { id: 'share', title: 'Share Your Entry', description: 'Get your supporters to vote for you.', ctaLabel: 'Share Entry', ctaHref: '/account', priority: 2 },
  ],
};

export function getNextActions(context: PlatformContext, limit = 2): NextAction[] {
  const actions = ACTION_MAP[context] ?? [];
  return actions.slice(0, limit);
}

export function getAllContexts(): PlatformContext[] {
  return Object.keys(ACTION_MAP) as PlatformContext[];
}
