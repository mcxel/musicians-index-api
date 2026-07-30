/**
 * Perception Pipeline — Audio-reactive perception pipeline for avatars.
 */

export interface PerceptionFrame {
  audioVolume: number;
  pitchHz?: number;
  isSpeaking: boolean;
  beatOnset: boolean;
}

class PerceptionPipelineSingleton {
  startAudioAnalysis(): void {
    // Start audio stream processing
  }

  stopAudioAnalysis(): void {
    // Stop audio stream processing
  }
}

export const perceptionPipeline = new PerceptionPipelineSingleton();
