export type DirectorMode = "world-release" | "versus-2026" | "guest-jam";
export type CameraLayout = "full" | "pip" | "split" | "hidden";

export interface LiveSignals {
  heat: number;
  audioLevelA: number;
  audioLevelB: number;
  voteDelta: number;
  newFanRate: number;
  completionRate: number;
  likeRate: number;
}

export interface MomentumState {
  scoreA: number;
  scoreB: number;
}

export interface DirectorState {
  mode: DirectorMode;
  primaryCameraId: string | null;
  secondaryCameraId: string | null;
  mediaId: string | null;
  layout: CameraLayout;
  isMediaPlaying: boolean;
  activeSpeakerId: string | null;
  votingActive: boolean;
  momentum: MomentumState;
  emotionalHeat: number;
}

export class SmartCameraDirectorEngine {
  private state: DirectorState = {
    mode: "world-release",
    primaryCameraId: "Main-Artist",
    secondaryCameraId: "Opponent-Or-Guest",
    mediaId: null,
    layout: "full",
    isMediaPlaying: false,
    activeSpeakerId: null,
    votingActive: false,
    momentum: { scoreA: 0, scoreB: 0 },
    emotionalHeat: 0,
  };

  private lastSwitchAt: number = 0;
  private listeners = new Set<(state: DirectorState) => void>();

  subscribe(listener: (state: DirectorState) => void) {
    this.listeners.add(listener);
    listener(this.state);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach((l) => l(this.state));
  }

  getState(): DirectorState {
    return { ...this.state };
  }

  setMode(mode: DirectorMode) {
    this.state.mode = mode;
    this.evaluateLayout();
  }

  setParticipants(primaryId: string, secondaryId?: string | null) {
    this.state.primaryCameraId = primaryId;
    this.state.secondaryCameraId = secondaryId || null;
    this.evaluateLayout();
  }

  setMedia(mediaId: string | null, isPlaying: boolean) {
    this.state.mediaId = mediaId;
    this.state.isMediaPlaying = isPlaying;
    this.evaluateLayout();
  }

  setActiveSpeaker(speakerId: string | null) {
    this.state.activeSpeakerId = speakerId;
    this.evaluateLayout();
  }

  toggleVoting(active: boolean) {
    this.state.votingActive = active;
    this.evaluateLayout();
  }

  /**
   * The Director Intelligence Layer (Vibe 1.5)
   * Feeds raw live signals through Momentum and Heat filters to dynamically command the camera.
   */
  decideNextLayout(signals: LiveSignals) {
    const now = Date.now();
    const canSwitch = now - this.lastSwitchAt > 1800; // 1.8s momentum cooldown

    // 1. Momentum Filter (EMA Smoothing to prevent camera jitter)
    const aVoteBoost = Math.max(0, signals.voteDelta);
    const bVoteBoost = Math.max(0, -signals.voteDelta);
    this.state.momentum.scoreA = (this.state.momentum.scoreA * 0.85) + (signals.audioLevelA * 0.10) + (aVoteBoost * 0.05);
    this.state.momentum.scoreB = (this.state.momentum.scoreB * 0.85) + (signals.audioLevelB * 0.10) + (bVoteBoost * 0.05);

    // 2. Emotional Heat Trigger (The Funnel)
    this.state.emotionalHeat = (signals.newFanRate * 1.5) + (signals.likeRate * 1.0) + (signals.completionRate * 0.5);

    // 3. Layout Suggestion (Mode Baseline)
    let nextLayout = this.state.layout;
    let nextPrimary = this.state.primaryCameraId;
    let nextSecondary = this.state.secondaryCameraId;

    if (this.state.mode === "world-release") {
      nextLayout = this.state.isMediaPlaying ? "pip" : "full";
      if (this.state.emotionalHeat > 130) nextLayout = "full"; // Heat lock / Reaction phase
      else if (this.state.emotionalHeat > 88 && this.state.isMediaPlaying) nextLayout = "pip"; // Fan pop burst
    } else if (this.state.mode === "versus-2026") {
      nextLayout = this.state.votingActive ? "split" : "pip";

      // 4. Signal Override (Resolve Dominant Performer)
      const dominant = this.state.momentum.scoreA > this.state.momentum.scoreB + 5 ? "A" :
                       this.state.momentum.scoreB > this.state.momentum.scoreA + 5 ? "B" : "NONE";
      
      if (dominant === "A") {
        nextPrimary = "Main-Artist";
        nextSecondary = "Opponent-Or-Guest";
      } else if (dominant === "B") {
        nextPrimary = "Opponent-Or-Guest";
        nextSecondary = "Main-Artist";
      }

      if (this.state.emotionalHeat > 120) nextLayout = "full"; // Spotlight lock on dominant
      else if (dominant === "NONE" && signals.audioLevelA > 48 && signals.audioLevelB > 48) nextLayout = "split"; // Both hot
    } else if (this.state.mode === "guest-jam") {
      nextLayout = this.state.activeSpeakerId === "both" ? "split" : (this.state.secondaryCameraId ? "pip" : "full");
      if (this.state.emotionalHeat > 130) nextLayout = "full"; // Main focus lock
      else if (this.state.emotionalHeat > 98) nextLayout = "split"; // Both in for collaborative hype
    }

    // Apply verified layout shift
    if (canSwitch && (nextLayout !== this.state.layout || nextPrimary !== this.state.primaryCameraId || nextSecondary !== this.state.secondaryCameraId)) {
      this.state.layout = nextLayout;
      this.state.primaryCameraId = nextPrimary;
      this.state.secondaryCameraId = nextSecondary;
      this.lastSwitchAt = now;
    }
    this.notify();
  }

  private evaluateLayout() {
    if (this.state.mode === "world-release") {
      if (this.state.isMediaPlaying) {
        this.state.layout = "pip"; // media full, artist PiP
      } else {
        this.state.layout = "full"; // artist full
      }
    } else if (this.state.mode === "versus-2026") {
      if (this.state.votingActive) {
        this.state.layout = "split"; // side-by-side during voting
      } else {
        this.state.layout = "pip"; // active performer full, opponent PiP
      }
    } else if (this.state.mode === "guest-jam") {
      if (this.state.activeSpeakerId === "both") {
        this.state.layout = "split"; // equal share
      } else if (this.state.secondaryCameraId) {
        this.state.layout = "pip"; // main focus, guest pip
      } else {
        this.state.layout = "full";
      }
    }
    this.notify();
  }
}

export const directorEngine = new SmartCameraDirectorEngine();