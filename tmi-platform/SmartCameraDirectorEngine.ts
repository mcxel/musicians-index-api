export type DirectorMode = "world-release" | "versus-2026" | "guest-jam";
export type CameraLayout = "full" | "pip" | "split" | "hidden";

export interface DirectorState {
  mode: DirectorMode;
  primaryCameraId: string | null;
  secondaryCameraId: string | null;
  mediaId: string | null;
  layout: CameraLayout;
  isMediaPlaying: boolean;
  activeSpeakerId: string | null;
  votingActive: boolean;
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
  };

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
    } else if (this.state.mode === "dj-residency" || this.state.mode === "comedy-room") {
      this.state.layout = "full";
    } else if (this.state.mode === "dance-battle") {
      this.state.layout = this.state.votingActive ? "split" : "full";
    } else if (this.state.mode === "choir-ensemble") {
      this.state.layout = this.state.activeSpeakerId ? "pip" : "mosaic";
    } else if (this.state.mode === "theater-play") {
      this.state.layout = this.state.activeSpeakerId ? "pip" : "scene-wide";
    }
    this.notify();
  }
}

export const directorEngine = new SmartCameraDirectorEngine();