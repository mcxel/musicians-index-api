// ─── TMI Live Automated Competition Engine & 15-Minute Room Shuffler ──────────
// Powers the automated 15-minute competition room rotation, multi-round fan pool stealing,
// dynamic room duplication, and defendable title belt engine across all categories.

export type CompetitionType =
  | 'BATTLE'          // 1v1 Song / Rap Battle
  | 'CHALLENGE'       // Style & Theme Challenge
  | 'CYPHER'          // Open Microphone Cypher Arena
  | 'JOKE_OFF'        // Comedy & Roast Battle
  | 'DANCE_OFF'       // Choreography & Dance Battle
  | 'MAGIC_SHOWCASE'  // Magic & Illusion Showcase
  | 'DRUM_SOLO'       // Percussion & Drum Fill Battle
  | 'GUITAR_SOLO';    // Guitar Solo Shred Challenge

export type CompetitionGenre =
  | 'R_AND_B' | 'HIP_HOP' | 'RAP' | 'GOSPEL' | 'COUNTRY' | 'POP' | 'ROCK' | 'BLUES'
  | 'BOOM_BAP' | 'TRAP' | 'WEST_COAST' | 'EAST_COAST' | 'DRILL' | 'FREESTYLE'
  | 'COMEDY_ROAST' | 'DAD_JOKES' | 'ONE_LINERS' | 'BREAKDANCE' | 'SALSA' | 'MAGIC'
  | 'DRUMS' | 'GUITAR';

export interface RoomInstance {
  roomId: string;
  roomName: string;
  type: CompetitionType;
  genre: CompetitionGenre;
  prompt: string;
  performerCount: number;
  maxPerformers: number;
  crowdCount: number;
  startsInSeconds: number;
  entryRewardXp: number; // +50 XP
  winnerRewardXp: number; // +100 XP
  trophyPoints: number;
  isDuplicated: boolean; // Auto-spawned tandem room if parent occupied
  parentRoomId?: string;
}

export interface FanChallengeState {
  matchId: string;
  artistA: { id: string; name: string; initialFanPool: number; currentFanPool: number };
  artistB: { id: string; name: string; initialFanPool: number; currentFanPool: number };
  activeNeutralFanPool: number;
  currentRound: 1 | 2 | 3 | 4 | 5;
  roundTheme: string;
}

export interface TitleBelt {
  id: string;
  name: string; // e.g., "Country Champion Belt"
  category: CompetitionGenre;
  currentHolderId: string;
  currentHolderName: string;
  defensesCount: number;
  isTitleMatch: boolean;
}

// ─── CANONICAL 15-MINUTE SHUFFLER SCHEDULE ENGINE ────────────────────────────
export const BASE_ROOM_TEMPLATES: Omit<RoomInstance, 'roomId' | 'startsInSeconds' | 'performerCount' | 'crowdCount' | 'isDuplicated'>[] = [
  {
    roomName: '🎤 R&B Vocal Battle Arena',
    type: 'BATTLE',
    genre: 'R_AND_B',
    prompt: 'Best R&B Love Song & Vocal Range',
    maxPerformers: 2,
    entryRewardXp: 50,
    winnerRewardXp: 100,
    trophyPoints: 25,
  },
  {
    roomName: '🎵 90s Style Throwback Challenge',
    type: 'CHALLENGE',
    genre: 'BOOM_BAP',
    prompt: 'Best Golden Era 90s Golden Beat / Vocal',
    maxPerformers: 4,
    entryRewardXp: 50,
    winnerRewardXp: 100,
    trophyPoints: 30,
  },
  {
    roomName: '🎙️ Underground Cypher Pit',
    type: 'CYPHER',
    genre: 'FREESTYLE',
    prompt: '16 Bars Pure Freestyle & Flow',
    maxPerformers: 8,
    entryRewardXp: 50,
    winnerRewardXp: 100,
    trophyPoints: 20,
  },
  {
    roomName: '😂 Roast Battle & Joke-Off Lounge',
    type: 'JOKE_OFF',
    genre: 'COMEDY_ROAST',
    prompt: 'Best Clean Roast & One-Liners',
    maxPerformers: 2,
    entryRewardXp: 50,
    winnerRewardXp: 100,
    trophyPoints: 25,
  },
  {
    roomName: '💃 World Dance-Off Floor',
    type: 'DANCE_OFF',
    genre: 'BREAKDANCE',
    prompt: 'Top Choreography Solo or Crew Battle',
    maxPerformers: 4,
    entryRewardXp: 50,
    winnerRewardXp: 100,
    trophyPoints: 30,
  },
  {
    roomName: '🎩 Illusion & Magic Stage',
    type: 'MAGIC_SHOWCASE',
    genre: 'MAGIC',
    prompt: 'Mind-Bending Card & Sleight of Hand Illusion',
    maxPerformers: 2,
    entryRewardXp: 50,
    winnerRewardXp: 100,
    trophyPoints: 25,
  },
  {
    roomName: '🥁 Gospel & Funk Drum Solo Challenge',
    type: 'DRUM_SOLO',
    genre: 'DRUMS',
    prompt: 'Fastest 30-Second Gospel Chop Drum Fill',
    maxPerformers: 2,
    entryRewardXp: 50,
    winnerRewardXp: 100,
    trophyPoints: 25,
  },
  {
    roomName: '🎸 Blues & Metal Guitar Solo Shred',
    type: 'GUITAR_SOLO',
    genre: 'GUITAR',
    prompt: 'Expressive Blues / Metal Shred Solo',
    maxPerformers: 2,
    entryRewardXp: 50,
    winnerRewardXp: 100,
    trophyPoints: 25,
  },
];

/**
 * Gets the current 15-minute active shuffled rooms.
 * Automatically spawns duplicate tandem rooms if capacity is full.
 */
export function getActiveShuffledRooms(): RoomInstance[] {
  const now = new Date();
  const minuteSegment = Math.floor(now.getMinutes() / 15);
  const cycleIndex = minuteSegment % BASE_ROOM_TEMPLATES.length;

  const shuffled: RoomInstance[] = BASE_ROOM_TEMPLATES.map((tmpl, idx) => {
    const isPrimary = idx === cycleIndex;
    return {
      ...tmpl,
      roomId: `room_auto_${idx}_${minuteSegment}`,
      startsInSeconds: isPrimary ? Math.floor(60 + Math.random() * 240) : Math.floor(300 + Math.random() * 600),
      performerCount: Math.floor(1 + Math.random() * tmpl.maxPerformers),
      crowdCount: Math.floor(45 + Math.random() * 300),
      isDuplicated: false,
    };
  });

  // Dynamic Room Tandem Scaling:
  // If any room is at max performers, auto-spawn tandem copy (Room_Beta)
  const expanded: RoomInstance[] = [];
  for (const r of shuffled) {
    expanded.push(r);
    if (r.performerCount >= r.maxPerformers) {
      expanded.push({
        ...r,
        roomId: `${r.roomId}_beta`,
        roomName: `${r.roomName} (Overflow Stage Beta)`,
        performerCount: 0,
        crowdCount: Math.floor(10 + Math.random() * 50),
        isDuplicated: true,
        parentRoomId: r.roomId,
      });
    }
  }

  return expanded;
}

/**
 * Tactical Fan Stealing Calculation
 * Shift audience members between Artist A and Artist B based on round performance
 */
export function calculateFanPoolShift(
  currentState: FanChallengeState,
  winningArtist: 'A' | 'B',
  votesShiftCount: number
): FanChallengeState {
  const shift = Math.min(votesShiftCount, 50);

  if (winningArtist === 'A') {
    return {
      ...currentState,
      artistA: { ...currentState.artistA, currentFanPool: currentState.artistA.currentFanPool + shift },
      artistB: { ...currentState.artistB, currentFanPool: Math.max(0, currentState.artistB.currentFanPool - shift) },
      currentRound: Math.min(5, currentState.currentRound + 1) as any,
    };
  } else {
    return {
      ...currentState,
      artistB: { ...currentState.artistB, currentFanPool: currentState.artistB.currentFanPool + shift },
      artistA: { ...currentState.artistA, currentFanPool: Math.max(0, currentState.artistA.currentFanPool - shift) },
      currentRound: Math.min(5, currentState.currentRound + 1) as any,
    };
  }
}
