// ─── Marcel's Monday Night Stage Signature Television Engine ────────────────
// Weekly TV broadcast event open to ALL entertaining talent (musicians, comedians,
// magicians, beatboxers, impressionists, ventriloquists, unique acts).
// Features Crowd Energy Meters, Cartoon Tomato splats, Bebo's Stage Hook sequence,
// Weekly Trophy Progression, and the TMI Grand Showcase Hall of Fame.

export type VarietyTalentCategory =
  | 'SINGING_MUSIC'
  | 'STANDUP_COMEDY'
  | 'STAGE_MAGIC'
  | 'BEATBOX_RHYTHM'
  | 'VENTRILOQUISM'
  | 'IMPRESSIONIST'
  | 'DANCE_CHOREOGRAPHY'
  | 'UNIQUE_TALENT';

export interface MondayStagePerformer {
  id: string;
  name: string;
  slug: string;
  avatarUrl: string;
  talentCategory: VarietyTalentCategory;
  actTitle: string;
  audienceVotes: number;
  judgeScore: number; // 0..100
  trophyCount: number; // Total Monday Trophies collected
  isEliminated: boolean;
  isBeboHooked?: boolean;
}

export type CrowdReactionType = 'CHEER' | 'LAUGH' | 'LOVE' | 'HYPE' | 'BOO' | 'TOMATO';

export interface CrowdEnergyState {
  crowdEnergyPercent: number; // 0..100%
  booMeterPercent: number;     // 0..100%
  activeTomatoes: { id: string; x: number; y: number }[];
  beboHookTriggered: boolean;
}

export interface MondayStageMatchup {
  round: 1 | 2 | 3;
  performerA: MondayStagePerformer;
  performerB: MondayStagePerformer;
  winnerId?: string;
  status: 'UPCOMING' | 'LIVE_PERFORMING' | 'VOTING_OPEN' | 'COMPLETED';
}

export interface MondayStageEpisode {
  episodeId: string;
  title: string;
  dateString: string;
  isLiveNow: boolean;
  matchups: MondayStageMatchup[];
  currentMatchupIndex: number;
  audiencePrizePool: string;
  performerPrizePool: string;
  hallOfFameQualifiedCount: number;
}

export function getCanonicalMondayStageEpisode(): MondayStageEpisode {
  const perf1: MondayStagePerformer = { id: 'p1', name: 'JayPaul Supreme', slug: 'jaypaul-supreme', avatarUrl: '/bot-images/Bot image 1.png', talentCategory: 'SINGING_MUSIC', actTitle: 'Crown Ambition & Vocal Symphony', audienceVotes: 1420, judgeScore: 94, trophyCount: 4, isEliminated: false };
  const perf2: MondayStagePerformer = { id: 'p2', name: 'Marco Marvel', slug: 'marco-marvel', avatarUrl: '/bot-images/Bot image 2.png', talentCategory: 'STAGE_MAGIC', actTitle: 'Levitating Vinyl & Mind Illusion', audienceVotes: 1180, judgeScore: 91, trophyCount: 2, isEliminated: false };
  const perf3: MondayStagePerformer = { id: 'p3', name: 'Comedian Dave', slug: 'comedian-dave', avatarUrl: '/bot-images/Bot image 3.png', talentCategory: 'STANDUP_COMEDY', actTitle: 'Live Crowd Roast & City Stories', audienceVotes: 980, judgeScore: 88, trophyCount: 3, isEliminated: false };
  const perf4: MondayStagePerformer = { id: 'p4', name: 'Beatbox K-Nova', slug: 'beatbox-knova', avatarUrl: '/bot-images/Bot image 4.png', talentCategory: 'BEATBOX_RHYTHM', actTitle: 'Multi-Voice Electronic Beatbox', audienceVotes: 1350, judgeScore: 95, trophyCount: 5, isEliminated: false };

  return {
    episodeId: `mns_ep_${Date.now()}`,
    title: "Marcel's Monday Night Stage · Live Broadcast Episode 42",
    dateString: 'Monday 8:00 PM EST',
    isLiveNow: true,
    currentMatchupIndex: 0,
    audiencePrizePool: '10,000 XP + VIP Season Pass & Viewer Trophy',
    performerPrizePool: '$500 Cash Prize + Monday Night Trophy + Grand Showcase Qualification',
    hallOfFameQualifiedCount: 12,
    matchups: [
      {
        round: 1,
        performerA: perf1,
        performerB: perf2,
        status: 'LIVE_PERFORMING',
      },
      {
        round: 1,
        performerA: perf3,
        performerB: perf4,
        status: 'UPCOMING',
      },
    ],
  };
}

/**
 * Handles live crowd energy updates, cartoon tomatoes, and Bebo hook triggers
 */
export function applyCrowdReaction(
  currentState: CrowdEnergyState,
  type: CrowdReactionType
): CrowdEnergyState {
  let newEnergy = currentState.crowdEnergyPercent;
  let newBoo = currentState.booMeterPercent;
  const newTomatoes = [...currentState.activeTomatoes];

  switch (type) {
    case 'CHEER':
      newEnergy = Math.min(100, newEnergy + 5);
      break;
    case 'LAUGH':
      newEnergy = Math.min(100, newEnergy + 5);
      break;
    case 'LOVE':
      newEnergy = Math.min(100, newEnergy + 8);
      break;
    case 'HYPE':
      newEnergy = Math.min(100, newEnergy + 10);
      break;
    case 'BOO':
      newBoo = Math.min(100, newBoo + 10);
      break;
    case 'TOMATO':
      newBoo = Math.min(100, newBoo + 15);
      // Spawn random cartoon tomato splat coordinates
      newTomatoes.push({
        id: `tomato_${Date.now()}_${Math.random()}`,
        x: Math.floor(20 + Math.random() * 60),
        y: Math.floor(20 + Math.random() * 50),
      });
      break;
  }

  // Trigger Bebo's Stage Hook if Boo Meter reaches 75%+
  const beboTriggered = newBoo >= 75 || currentState.beboHookTriggered;

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('tmi-xp-reward', { detail: { amount: 15, reason: `Sent ${type} in Monday Night Stage` } }));
  }

  return {
    crowdEnergyPercent: newEnergy,
    booMeterPercent: newBoo,
    activeTomatoes: newTomatoes.slice(-8), // Keep last 8 splats
    beboHookTriggered: beboTriggered,
  };
}

/**
 * Checks if a performer qualifies for the TMI Grand Showcase Hall of Fame (3+ Trophies)
 */
export function qualifiesForGrandShowcase(trophyCount: number): boolean {
  return trophyCount >= 3;
}
