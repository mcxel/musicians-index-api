// Animation Engine - Minimal Engine
import type { Animation, AnimationConfig } from './types';

export class AnimationEngine {
  private animations = new Map<string, Animation>();

  play(config: AnimationConfig): Animation {
    const anim: Animation = { id: config.id, config, playing: true };
    this.animations.set(config.id, anim);
    return anim;
  }

  stop(id: string): void {
    const anim = this.animations.get(id);
    if (anim) anim.playing = false;
  }

  get(id: string): Animation | undefined {
    return this.animations.get(id);
  }

  getPlaying(): Animation[] {
    return Array.from(this.animations.values()).filter(a => a.playing);
  }
}

export default AnimationEngine;
