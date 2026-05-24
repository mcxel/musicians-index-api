/**
 * LiveBeatLocker — module-level in-memory beat queue.
 * Receives ingested beats and distributes them to live destinations.
 * Module-level singleton so all API routes share the same queue.
 */

export type BeatDestination = 'dance-party' | 'cypher' | 'battles' | 'games' | 'any';
export type BeatStatus = 'queued' | 'playing' | 'played' | 'rejected' | 'marketplace';

export interface LockerBeat {
  id: string;
  creatorId: string;
  title: string;
  genre: string;
  bpm: number;
  energyScore: number;
  destination: BeatDestination;
  status: BeatStatus;
  votes: number;
  plays: number;
  createdAt: number;
}

// Queues keyed by destination
const QUEUES: Record<BeatDestination, LockerBeat[]> = {
  'dance-party': [],
  'cypher':      [],
  'battles':     [],
  'games':       [],
  'any':         [],
};

function genId(): string {
  return `beat_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
}

export function submitBeat(params: {
  creatorId: string;
  title: string;
  genre: string;
  bpm: number;
  energyScore?: number;
  destination: BeatDestination;
}): LockerBeat {
  const beat: LockerBeat = {
    id: genId(),
    creatorId: params.creatorId,
    title: params.title,
    genre: params.genre,
    bpm: params.bpm,
    energyScore: params.energyScore ?? 50,
    destination: params.destination,
    status: 'queued',
    votes: 0,
    plays: 0,
    createdAt: Date.now(),
  };

  const queue = QUEUES[params.destination];
  queue.unshift(beat);
  // Keep max 200 per queue
  if (queue.length > 200) queue.splice(200);
  return beat;
}

export function getTopBeats(destination: BeatDestination, limit = 10): LockerBeat[] {
  const queue = [...(QUEUES[destination] ?? []), ...(QUEUES['any'] ?? [])];
  return queue
    .filter((b) => b.status === 'queued' || b.status === 'playing')
    .sort((a, b) => (b.votes * 2 + b.energyScore) - (a.votes * 2 + a.energyScore))
    .slice(0, limit);
}

export function getAllBeats(destination?: BeatDestination): LockerBeat[] {
  if (destination) return QUEUES[destination] ?? [];
  return Object.values(QUEUES).flat();
}

export function voteForBeat(beatId: string): boolean {
  for (const queue of Object.values(QUEUES)) {
    const beat = queue.find((b) => b.id === beatId);
    if (beat) { beat.votes += 1; return true; }
  }
  return false;
}

export function markBeatStatus(beatId: string, status: BeatStatus): boolean {
  for (const queue of Object.values(QUEUES)) {
    const beat = queue.find((b) => b.id === beatId);
    if (beat) { beat.status = status; return true; }
  }
  return false;
}

export function promoteToMarketplace(beatId: string): boolean {
  return markBeatStatus(beatId, 'marketplace');
}

// Seed a few demo beats so the locker isn't empty at launch
function seedDemoBeats() {
  const demos: Array<Omit<Parameters<typeof submitBeat>[0], 'creatorId'> & { creatorId: string }> = [
    { creatorId: 'demo', title: 'Crown Up — Remix', genre: 'Trap',    bpm: 142, energyScore: 88, destination: 'dance-party' },
    { creatorId: 'demo', title: 'Neon Kingdom',      genre: 'EDM',     bpm: 128, energyScore: 75, destination: 'dance-party' },
    { creatorId: 'demo', title: 'Midnight Cypher',   genre: 'Hip-Hop', bpm: 95,  energyScore: 70, destination: 'cypher' },
    { creatorId: 'demo', title: 'Battle Mode',        genre: 'Trap',    bpm: 145, energyScore: 92, destination: 'battles' },
    { creatorId: 'demo', title: 'Afro Surge',         genre: 'Afrobeat',bpm: 110, energyScore: 82, destination: 'dance-party' },
    { creatorId: 'demo', title: 'World Anthem',       genre: 'Dance',   bpm: 138, energyScore: 78, destination: 'any' },
  ];
  demos.forEach((d) => submitBeat(d));
}

seedDemoBeats();
