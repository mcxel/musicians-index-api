/**
 * CulturalChallengeEngine
 * 
 * The Event Brain of TMI. Generates match-ups, rivalries, generations, styles, 
 * instruments, and eras across all performer categories.
 * 
 * Plugs into existing systems: ProducerSupplyEngine, CompetitionMusicEngine, 
 * ArenaEventShell, and Billboard Live Walls.
 */

import { competitionMusicEngine } from './CompetitionMusicEngine';
import { producerSupplyEngine } from './ProducerSupplyEngine';

export interface ChallengeManifest {
  id: string;
  category: string; // Music, DJs, Producers, Comedy, Dance, Magic, Spoken Word
  axis: string;     // The Cultural Axis (e.g., Legends vs Next Wave)
  title: string;
  playlistRequirements: string[];
  scoringRules: string[];
  scheduleWindow: string; // ISO Dates or "Tonight 8PM"
}

const CULTURAL_AXES = [
  // Instrument Wars
  'Drummer vs Drummer',
  'Guitar vs Guitar',
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
  // Genre Wars
  'Country vs Country',
  'Rock vs Rock',
  'Jazz vs Jazz',
  'Comedy vs Comedy',
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

  public getUpcomingSchedule(): ChallengeManifest[] {
    return [
      this.generateMatchup('DJs', 'Vinyl vs Digital'),
      this.generateMatchup('Rap', 'Legends vs Next Wave'),
      this.generateMatchup('Rock', 'Classic vs Modern'),
      this.generateMatchup('Drummers', 'Acoustic vs Electric')
    ];
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