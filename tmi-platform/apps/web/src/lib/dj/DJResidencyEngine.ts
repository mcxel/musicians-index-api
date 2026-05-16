/**
 * DJ Residency Engine — Daily rotation system for resident DJs.
 * Assigns session type, camera mode, and challenge based on day-of-week.
 */

export type DJSessionType =
  | 'foundation'       // Mon: deep crates, smooth transitions, wide shots
  | 'mid-week-heat'    // Wed: requests, scratching, hand-cam priority
  | 'prime-time-battle'// Fri: Versus 2026 prompts, guest DJ splits
  | 'experimental'     // Sat: remix challenges, genre blending
  | 'crowd-sync'       // Sun: fan-request driven, open format
  | 'standard';        // Default for unmapped days

export type DJCameraPreset =
  | 'cinematic-wide'   // Foundation — smooth wide stage
  | 'hand-cam'         // Mid-week — close on hands/mixer
  | 'split-guest'      // Prime-time — 50/50 vs guest DJ
  | 'crowd-panorama'   // Crowd sync — panning crowd shots
  | 'standard-stage';  // Default

export interface DJDailyChallenge {
  sessionType: DJSessionType;
  challengeText: string;
  cameraPreset: DJCameraPreset;
  themeTag: string; // drives visual skin + ignition particle color
  bonusXPMultiplier: number;
}

export interface DJResidencyState {
  djId: string;
  todaysSession: DJDailyChallenge;
  sessionStartAt: number;
  fanRequestCount: number;
  streakDays: number;
  totalResidentSessions: number;
}

// ─── Daily session map ────────────────────────────────────────────────────────

const SESSION_MAP: Record<number, DJDailyChallenge> = {
  0: { // Sunday
    sessionType: 'crowd-sync',
    challengeText: 'Let the fans drive: play 5 fan-request shards in a row.',
    cameraPreset: 'crowd-panorama',
    themeTag: 'sunday-vibes',
    bonusXPMultiplier: 1.2,
  },
  1: { // Monday
    sessionType: 'foundation',
    challengeText: "Open with your deepest crate cut — set Monday's tone.",
    cameraPreset: 'cinematic-wide',
    themeTag: 'foundation-deep',
    bonusXPMultiplier: 1.0,
  },
  2: { // Tuesday
    sessionType: 'standard',
    challengeText: 'Keep the floor moving — no track longer than 4 minutes.',
    cameraPreset: 'standard-stage',
    themeTag: 'tuesday-build',
    bonusXPMultiplier: 1.0,
  },
  3: { // Wednesday
    sessionType: 'mid-week-heat',
    challengeText: 'Scratch session: hit 3 technical cuts before the hour mark.',
    cameraPreset: 'hand-cam',
    themeTag: 'midweek-scratch',
    bonusXPMultiplier: 1.4,
  },
  4: { // Thursday
    sessionType: 'standard',
    challengeText: 'Build toward the weekend: 10% BPM increase across your set.',
    cameraPreset: 'standard-stage',
    themeTag: 'thursday-climb',
    bonusXPMultiplier: 1.1,
  },
  5: { // Friday
    sessionType: 'prime-time-battle',
    challengeText: 'Invite a guest DJ. Run a split-screen vs. set for 20 min.',
    cameraPreset: 'split-guest',
    themeTag: 'friday-prime',
    bonusXPMultiplier: 1.8,
  },
  6: { // Saturday
    sessionType: 'experimental',
    challengeText: 'Remix challenge: blend 2 genres that have never met.',
    cameraPreset: 'crowd-panorama',
    themeTag: 'saturday-experiment',
    bonusXPMultiplier: 1.6,
  },
};

export function getTodaysSession(): DJDailyChallenge {
  const day = new Date().getDay();
  return SESSION_MAP[day] ?? SESSION_MAP[2]!; // fallback to Tuesday/standard
}

export class DJResidencyEngine {
  private state: DJResidencyState;

  constructor(djId: string) {
    this.state = {
      djId,
      todaysSession: getTodaysSession(),
      sessionStartAt: Date.now(),
      fanRequestCount: 0,
      streakDays: 0,
      totalResidentSessions: 0,
    };
  }

  getState(): Readonly<DJResidencyState> {
    return this.state;
  }

  /** Called when fan submits a track request */
  recordFanRequest(): void {
    this.state = { ...this.state, fanRequestCount: this.state.fanRequestCount + 1 };
  }

  /** Call at session end to update streaks */
  closeSession(): { xpAwarded: number; bonusApplied: boolean } {
    const base = 500;
    const multiplier = this.state.todaysSession.bonusXPMultiplier;
    const xpAwarded = Math.round(base * multiplier);
    const bonusApplied = multiplier > 1.0;

    this.state = {
      ...this.state,
      streakDays: this.state.streakDays + 1,
      totalResidentSessions: this.state.totalResidentSessions + 1,
      fanRequestCount: 0,
      todaysSession: getTodaysSession(),
      sessionStartAt: Date.now(),
    };

    return { xpAwarded, bonusApplied };
  }

  /** Resolve which camera preset should be active */
  getCameraPreset(): DJCameraPreset {
    return this.state.todaysSession.cameraPreset;
  }

  /** True when the hand-cam should be prioritized (scratch day + active scratching) */
  isHandCamDay(): boolean {
    return this.state.todaysSession.sessionType === 'mid-week-heat';
  }
}
