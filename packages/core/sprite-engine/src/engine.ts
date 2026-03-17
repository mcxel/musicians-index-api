// Sprite Engine - Minimal Engine
import type { Sprite, SpritePack, SpriteInstance } from './types';

export class SpriteEngine {
  private packs = new Map<string, SpritePack>();
  private instances = new Map<string, SpriteInstance>();

  registerPack(pack: SpritePack): void {
    this.packs.set(pack.id, pack);
  }

  createInstance(spriteId: string, instanceId: string): void {
    this.instances.set(instanceId, {
      spriteId,
      x: 0,
      y: 0,
      scale: 1,
      rotation: 0,
      visible: true
    });
  }

  getInstance(instanceId: string): SpriteInstance | undefined {
    return this.instances.get(instanceId);
  }

  destroyInstance(instanceId: string): void {
    this.instances.delete(instanceId);
  }
}

export default SpriteEngine;
