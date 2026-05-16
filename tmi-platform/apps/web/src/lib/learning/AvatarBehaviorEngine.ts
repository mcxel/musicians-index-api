import { platformLearningCore } from './PlatformLearningCore';

export interface AvatarBehaviorSignal {
  avatarId: string;
  actions: number;
  movementActions: number;
  socialActions: number;
  engagementScore: number;
}

export class AvatarBehaviorEngine {
  getAvatarSignals(limit = 20): AvatarBehaviorSignal[] {
    const events = platformLearningCore.listEvents(20000);
    const map = new Map<string, AvatarBehaviorSignal>();

    for (const event of events) {
      if (event.type !== 'avatar_action' && event.type !== 'lobby_move' && event.type !== 'friend_invite') {
        continue;
      }

      const avatarId = event.context?.avatarId?.toString() || event.userId || event.targetId || 'unknown-avatar';
      const row =
        map.get(avatarId) ||
        ({ avatarId, actions: 0, movementActions: 0, socialActions: 0, engagementScore: 0 } as AvatarBehaviorSignal);

      row.actions += 1;
      if (event.type === 'lobby_move') row.movementActions += 1;
      if (event.type === 'friend_invite') row.socialActions += 1;
      row.engagementScore = Number((row.actions + row.movementActions * 0.6 + row.socialActions * 1.1).toFixed(2));

      map.set(avatarId, row);
    }

    return [...map.values()].sort((a, b) => b.engagementScore - a.engagementScore).slice(0, limit);
  }
}

export const avatarBehaviorEngine = new AvatarBehaviorEngine();
