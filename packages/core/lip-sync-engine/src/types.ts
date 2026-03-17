// Lip Sync Engine - Types
export interface LipSyncClip {
  id: string;
  audioUrl: string;
  duration: number;
  phonemes: PhonemeTime[];
}

export interface PhonemeTime {
  phoneme: string;
  startTime: number;
  endTime: number;
}

export interface LipSyncInstance {
  clipId: string;
  avatarId: string;
  currentTime: number;
  isPlaying: boolean;
}
