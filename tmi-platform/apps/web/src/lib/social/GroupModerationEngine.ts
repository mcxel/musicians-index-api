import { randomUUID } from 'crypto';

export type ModerationActionType = 'mute' | 'kick' | 'ban' | 'report';

export interface ModerationAction {
  id: string;
  groupId: string;
  actorId: string;
  targetUserId: string;
  type: ModerationActionType;
  reason?: string;
  expiresAt?: string;
  createdAt: string;
}

const GROUP_ACTIONS = new Map<string, ModerationAction[]>();
const BANNED = new Map<string, Set<string>>();
const MUTED = new Map<string, Map<string, string>>();

export class GroupModerationEngine {
  static mute(groupId: string, actorId: string, targetUserId: string, minutes: number, reason?: string): ModerationAction {
    const expiresAt = new Date(Date.now() + minutes * 60 * 1000).toISOString();
    const action: ModerationAction = {
      id: randomUUID(),
      groupId,
      actorId,
      targetUserId,
      type: 'mute',
      reason,
      expiresAt,
      createdAt: new Date().toISOString(),
    };

    if (!MUTED.has(groupId)) MUTED.set(groupId, new Map());
    MUTED.get(groupId)!.set(targetUserId, expiresAt);
    this.logAction(action);
    return action;
  }

  static kick(groupId: string, actorId: string, targetUserId: string, reason?: string): ModerationAction {
    const action: ModerationAction = {
      id: randomUUID(),
      groupId,
      actorId,
      targetUserId,
      type: 'kick',
      reason,
      createdAt: new Date().toISOString(),
    };
    this.logAction(action);
    return action;
  }

  static ban(groupId: string, actorId: string, targetUserId: string, reason?: string): ModerationAction {
    const action: ModerationAction = {
      id: randomUUID(),
      groupId,
      actorId,
      targetUserId,
      type: 'ban',
      reason,
      createdAt: new Date().toISOString(),
    };

    if (!BANNED.has(groupId)) BANNED.set(groupId, new Set());
    BANNED.get(groupId)!.add(targetUserId);
    this.logAction(action);
    return action;
  }

  static report(groupId: string, actorId: string, targetUserId: string, reason: string): ModerationAction {
    const action: ModerationAction = {
      id: randomUUID(),
      groupId,
      actorId,
      targetUserId,
      type: 'report',
      reason,
      createdAt: new Date().toISOString(),
    };
    this.logAction(action);
    return action;
  }

  static unban(groupId: string, targetUserId: string): void {
    BANNED.get(groupId)?.delete(targetUserId);
  }

  static isBanned(groupId: string, userId: string): boolean {
    return BANNED.get(groupId)?.has(userId) || false;
  }

  static isMuted(groupId: string, userId: string): boolean {
    const expiresAt = MUTED.get(groupId)?.get(userId);
    if (!expiresAt) return false;
    if (new Date(expiresAt) < new Date()) {
      MUTED.get(groupId)?.delete(userId);
      return false;
    }
    return true;
  }

  static getActions(groupId: string): ModerationAction[] {
    return GROUP_ACTIONS.get(groupId) || [];
  }

  private static logAction(action: ModerationAction): void {
    if (!GROUP_ACTIONS.has(action.groupId)) GROUP_ACTIONS.set(action.groupId, []);
    GROUP_ACTIONS.get(action.groupId)!.push(action);
  }
}

export default GroupModerationEngine;
