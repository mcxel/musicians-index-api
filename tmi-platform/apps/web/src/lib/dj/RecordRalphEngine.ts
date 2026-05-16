/**
 * Record Ralph Engine — Resident AI DJ for World Dance Party.
 * Reads crowd heat, selects tracks from the archive vault, scratches on cue.
 */

export type RalphAnimState =
  | 'idle-groove'   // Subtle nod, low energy
  | 'mixing'        // Normal set, working the faders
  | 'scratching'    // High-freq crossfader activity detected
  | 'ignition'      // Heat > 85 — boss mode, standing on booth
  | 'drop-pose'     // Just hit a drop
  | 'crowd-scan';   // Looking out at the crowd, reading the room

export type TrackSource = 'berntout-archive' | 'fan-submission' | 'trending';

export interface RalphTrackEntry {
  id: string;
  title: string;
  artistName: string;
  bpm: number;
  energyLevel: number; // 0–100
  source: TrackSource;
  genreTags: string[];
}

export interface RalphDJState {
  animState: RalphAnimState;
  currentTrack: RalphTrackEntry | null;
  nextTrack: RalphTrackEntry | null;
  crowdHeat: number;
  bpm: number;
  isScratching: boolean;
  lastDropAt: number;
  totalTips: number;
  sponsorQueue: string[];
  lastSponsorAt: number;
}

const SCRATCH_CADENCE_MS = 4500;
const DROP_LOCKOUT_MS = 8000;
const SPONSOR_INTERVAL_MS = 180_000; // 3 min between sponsor shouts

export class RecordRalphEngine {
  private state: RalphDJState;

  constructor(sponsors: string[] = []) {
    this.state = {
      animState: 'idle-groove',
      currentTrack: null,
      nextTrack: null,
      crowdHeat: 0,
      bpm: 128,
      isScratching: false,
      lastDropAt: 0,
      totalTips: 0,
      sponsorQueue: [...sponsors],
      lastSponsorAt: 0,
    };
  }

  getState(): Readonly<RalphDJState> {
    return this.state;
  }

  loadTrack(track: RalphTrackEntry): void {
    this.state = {
      ...this.state,
      nextTrack: track,
    };
  }

  transitionToNextTrack(): void {
    if (!this.state.nextTrack) return;
    this.state = {
      ...this.state,
      currentTrack: this.state.nextTrack,
      nextTrack: null,
      bpm: this.state.nextTrack.bpm,
      animState: 'mixing',
    };
  }

  tickCrowdSignal(heatScore: number, audioFreqHigh: boolean): RalphAnimState {
    const now = Date.now();
    let animState: RalphAnimState;

    if (heatScore >= 85) {
      animState = 'ignition';
    } else if (audioFreqHigh && now - this.state.lastDropAt > SCRATCH_CADENCE_MS) {
      animState = 'scratching';
      this.state = { ...this.state, isScratching: true, lastDropAt: now };
    } else if (heatScore >= 60) {
      animState = 'mixing';
      this.state = { ...this.state, isScratching: false };
    } else if (heatScore >= 30) {
      animState = 'crowd-scan';
      this.state = { ...this.state, isScratching: false };
    } else {
      animState = 'idle-groove';
      this.state = { ...this.state, isScratching: false };
    }

    this.state = { ...this.state, crowdHeat: heatScore, animState };
    return animState;
  }

  fireDrop(): void {
    const now = Date.now();
    if (now - this.state.lastDropAt < DROP_LOCKOUT_MS) return;
    this.state = { ...this.state, animState: 'drop-pose', lastDropAt: now };
  }

  /** Returns a sponsor shoutout string if it's time, otherwise null */
  maybeSponsorShout(): string | null {
    const now = Date.now();
    if (
      this.state.sponsorQueue.length === 0 ||
      now - this.state.lastSponsorAt < SPONSOR_INTERVAL_MS
    ) return null;

    const [sponsor, ...rest] = this.state.sponsorQueue;
    this.state = {
      ...this.state,
      sponsorQueue: [...rest, sponsor!], // rotate to end so it cycles
      lastSponsorAt: now,
    };
    return `Yo — World Dance Party is powered by ${sponsor}! Keep it movin'.`;
  }

  recordTip(amountCents: number): void {
    this.state = { ...this.state, totalTips: this.state.totalTips + amountCents };
  }

  /** Decide if Ralph should change the track based on crowd reaction */
  shouldChangeTract(): boolean {
    const track = this.state.currentTrack;
    if (!track) return true;
    // If heat is tanking and current track energy doesn't match, swap
    return this.state.crowdHeat < 25 && track.energyLevel > 60;
  }
}
