// Avatar Engine - Core Engine
import { Avatar, AvatarInstance } from './types';

export class AvatarEngine {
  private avatars: Map<string, Avatar> = new Map();
  private instances: Map<string, AvatarInstance> = new Map();

  createAvatar(avatar: Avatar): void {
    this.avatars.set(avatar.id, avatar);
  }

  getAvatar(id: string): Avatar | undefined {
    return this.avatars.get(id);
  }

  spawnInstance(instance: AvatarInstance): void {
    this.instances.set(instance.avatarId, instance);
  }

  getInstance(avatarId: string): AvatarInstance | undefined {
    return this.instances.get(avatarId);
  }

  updatePosition(avatarId: string, position: { x: number; y: number; z: number }): void {
    const instance = this.instances.get(avatarId);
    if (instance) {
      instance.position = position;
    }
  }
}

export const avatarEngine = new AvatarEngine();
