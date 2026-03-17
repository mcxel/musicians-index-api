// Lip Sync Engine - Core Engine
import type { LipSyncClip, LipSyncInstance } from './types';

export class LipSyncEngine {
  private clips: Map<string, LipSyncClip> = new Map();
  private instances: Map<string, LipSyncInstance> = new Map();

  loadClip(clip: LipSyncClip): void {
    this.clips.set(clip.id, clip);
  }

  getClip(id: string): LipSyncClip | undefined {
    return this.clips.get(id);
  }

  createInstance(clipId: string, avatarId: string): LipSyncInstance | null {
    const clip = this.clips.get(clipId);
    if (!clip) return null;
    
    const instance: LipSyncInstance = {
      clipId,
      avatarId,
      currentTime: 0,
      isPlaying: false,
    };
    this.instances.set(`${clipId}-${avatarId}`, instance);
    return instance;
  }

  play(instanceId: string): void {
    const instance = this.instances.get(instanceId);
    if (instance) {
      instance.isPlaying = true;
    }
  }

  pause(instanceId: string): void {
    const instance = this.instances.get(instanceId);
    if (instance) {
      instance.isPlaying = false;
    }
  }

  stop(instanceId: string): void {
    const instance = this.instances.get(instanceId);
    if (instance) {
      instance.isPlaying = false;
      instance.currentTime = 0;
    }
  }
}
