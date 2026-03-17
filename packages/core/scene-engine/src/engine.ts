// Scene Engine - Minimal Engine
import type { Scene, SceneConfig } from './types';

export class SceneEngine {
  private scenes = new Map<string, Scene>();

  load(config: SceneConfig): Scene {
    const scene: Scene = { id: config.id, config, active: true };
    this.scenes.set(config.id, scene);
    return scene;
  }

  unload(id: string): void {
    this.scenes.delete(id);
  }

  get(id: string): Scene | undefined {
    return this.scenes.get(id);
  }

  getActive(): Scene[] {
    return Array.from(this.scenes.values()).filter(s => s.active);
  }
}

export default SceneEngine;
