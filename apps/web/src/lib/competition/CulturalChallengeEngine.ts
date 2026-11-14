/**
 * CulturalChallengeEngine
 *
 * The Event Brain of TMI. Generates match-ups, rivalries, generations, styles,
 * instruments, and eras across all performer categories.
 *
 * Plugs into existing systems: ProducerSupplyEngine, CompetitionMusicEngine,
 * ArenaEventShell, Billboard Live Walls, and TripleEventBroadcastEngine.
 */

import { competitionMusicEngine } from './CompetitionMusicEngine';
import { producerSupplyEngine } from './ProducerSupplyEngine';
import {
  tripleEventBroadcastEngine,
  type TripletEventItem,
  type BroadcastCycleState,
} from './TripleEventBroadcastEngine';

export interface ChallengeManifest {
  id: string;
  category: string; // Music, DJs, Producers, Comedy, Dance, Magic, Spoken Word, Instrumental
  axis: string;     // The Cultural Axis (e.g., Legends vs Next Wave)
  title: string;
  playlistRequirements: string[];
  scoringRules: string[];
  scheduleWindow: string; // ISO Dates or "Tonight 8PM"
  tripletSlot?: "A" | "B" | "C";
  roomId?: string;
  joinRoute?: string;
  isAcapella?: boolean;
}

const CULTURAL_AXES = [
  // Instrument Wars
  'Drummer vs Drummer',
  'Guitar vs Guitar',
  'Bass vs Bass',
  'Trumpet vs Trumpet',
  'DJ vs DJ',
  'Producer vs Producer',
  // Era Wars
  '70s vs 80s',
  '80s vs 90s',
  '90s vs 2000s',
  'Old School vs New School',
  // Regional Wars
  'East vs West',
  'North vs South',
  'Local vs Global',
  // Style Wars
  'Boom Bap vs Trap',
  'Traditional vs Experimental',
  'Acoustic vs Electric',
  'Analog vs Digital',
  // Genre Wars & Specialties
  'Country Freestyle',
  'Scat Jazz Battle',
  'Country vs Country',
  'Rock vs Rock',
  'Jazz vs Jazz',
  'Comedy vs Comedy',
  'Joke-Off',
  'Legends vs Next Wave'
];

class CulturalChallengeEngineImpl {
  
  public generateMatchup(category: string, axis?: string): ChallengeManifest {
    const selectedAxis = axis || CULTURAL_AXES[Math.floor(Math.random() * CULTURAL_AXES.length)]!;
    
    return {
      id: `cc-${Date.now()}`,
      category,
      axis: selectedAxis,
      title: `${category}: ${selectedAxis}`,
      playlistRequirements: [`${category} Theme Pack`, `${selectedAxis} Specific Tracks`],
      scoringRules: ['Audience Voting', 'Vibe Score', 'Technical Multiplier'],
      scheduleWindow: 'Tomorrow 8PM ET'
    };
  }

  /**
   * Authoritative Triplet Cycle: delegates directly to TripleEventBroadcastEngine
   * to emit the server-authoritative 15:00 tri-card pool [A, B, C].
   */
  public generateCurrentTriplet(now: number = Date.now()): BroadcastCycleState {
    return tripleEventBroadcastEngine.getCurrentCycle(now);
  }

  /**
   * Retrieves upcoming schedule backed by the authoritative 15-minute triplet pool.
   */
  public getUpcomingSchedule(now: number = Date.now()): ChallengeManifest[] {
    const cycle = tripleEventBroadcastEngine.getCurrentCycle(now);
    return cycle.triplet.map((item: TripletEventItem) => ({
      id: item.id,
      category: item.category,
      axis: item.axis,
      title: item.title,
      playlistRequirements: [`${item.genre} Soundpack`, `${item.axis} Rules`],
      scoringRules: ['Audience Voting', 'Rubric Score', 'Technical Execution'],
      scheduleWindow: `Cycle ${cycle.cycleId} (Expires in ${Math.round(cycle.timeRemainingMs / 1000)}s)`,
      tripletSlot: item.slot,
      roomId: item.roomId,
      joinRoute: item.joinRoute,
      isAcapella: item.isAcapella,
    }));
  }

  public getMediaRequirements(matchup: ChallengeManifest): string[] {
    return matchup.playlistRequirements;
  }

  public bindToCompetitionMusicEngine(matchup: ChallengeManifest): void {
    // Will assign the generated playlist needs into the active ArenaEventShell room
  }

  public publishToBillboard(matchup: ChallengeManifest): void {
    // Wires directly to Home 1-2 Billboard Wall schedules
  }

  public createProducerMission(matchup: ChallengeManifest): void {
    producerSupplyEngine.generateMissionFromEvent(matchup);
  }
}

export const culturalChallengeEngine = new CulturalChallengeEngineImpl();
export { CULTURAL_AXES };
