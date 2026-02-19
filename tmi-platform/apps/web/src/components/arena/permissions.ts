/**
 * PROMPT #3B: Permission System
 * Free tier gating + delegate messaging for artist team members
 * Server-side enforcement for chat replies and moderation
 */

export type UserTier = 'FREE' | 'PAID' | 'VIP' | 'SPONSOR';
export type UserRole = 'AUDIENCE' | 'ARTIST' | 'ARTIST_TEAM' | 'MOD' | 'ADMIN';
export type DelegateScope = 'CHAT_REPLY' | 'MODERATION' | 'ROOM_CONFIG';

export interface DelegateGrant {
  id: string;
  artistUserId: string;
  delegateUserId: string;
  expiresAt: number; // Timestamp (ms)
  scopes: DelegateScope[];
  grantedAt: number;
  grantedBy: string; // Admin or artist userId
}

export interface UserPermissions {
  userId: string;
  tier: UserTier;
  role: UserRole;
  delegateGrants: DelegateGrant[]; // Active grants
}

/**
 * Check if user can send public messages
 * FREE tier: Yes (public only)
 * PAID+: Yes (all types)
 */
export function canSendMessage(tier: UserTier): boolean {
  return true; // All tiers can send public messages
}

/**
 * Check if user can reply to threads or DMs
 * FREE tier: No (unless delegate)
 * PAID+: Yes
 * Artist delegates: Yes (if granted)
 */
export function canReply(userId: string, tier: UserTier, role: UserRole, delegateGrants: DelegateGrant[]): boolean {
  // PAID+ users can always reply
  if (tier !== 'FREE') return true;

  // Admins/mods can always reply
  if (role === 'ADMIN' || role === 'MOD') return true;

  // Check delegate grants (artist team members)
  const now = Date.now();
  const activeGrants = delegateGrants.filter((g) => g.delegateUserId === userId && g.expiresAt > now && g.scopes.includes('CHAT_REPLY'));
  return activeGrants.length > 0;
}

/**
 * Check if user can perform moderation actions
 * Artist + delegates with MODERATION scope
 */
export function canModerate(userId: string, role: UserRole, delegateGrants: DelegateGrant[]): boolean {
  if (role === 'ADMIN' || role === 'MOD') return true;
  if (role === 'ARTIST') return true;

  const now = Date.now();
  const activeGrants = delegateGrants.filter((g) => g.delegateUserId === userId && g.expiresAt > now && g.scopes.includes('MODERATION'));
  return activeGrants.length > 0;
}

/**
 * Grant delegate permissions
 * Artist/admin can grant chat reply/moderation to team members
 */
export function grantDelegatePermission(
  artistUserId: string,
  delegateUserId: string,
  scopes: DelegateScope[],
  durationMs: number,
  grantedBy: string
): DelegateGrant {
  return {
    id: `delegate-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    artistUserId,
    delegateUserId,
    expiresAt: Date.now() + durationMs,
    scopes,
    grantedAt: Date.now(),
    grantedBy,
  };
}

/**
 * Revoke delegate permission
 */
export function revokeDelegatePermission(grantId: string, grants: DelegateGrant[]): DelegateGrant[] {
  return grants.filter((g) => g.id !== grantId);
}

/**
 * Get active delegate grants for a user
 */
export function getActiveDelegateGrants(userId: string, grants: DelegateGrant[]): DelegateGrant[] {
  const now = Date.now();
  return grants.filter((g) => g.delegateUserId === userId && g.expiresAt > now);
}

/**
 * Check if delegate grant is expired
 */
export function isDelegateGrantExpired(grant: DelegateGrant): boolean {
  return Date.now() > grant.expiresAt;
}

/**
 * Cleanup expired grants
 */
export function cleanupExpiredGrants(grants: DelegateGrant[]): DelegateGrant[] {
  const now = Date.now();
  return grants.filter((g) => g.expiresAt > now);
}

/**
 * Get user permission summary (for UI display)
 */
export function getUserPermissionSummary(permissions: UserPermissions): {
  canSendPublic: boolean;
  canReply: boolean;
  canModerate: boolean;
  isDelegateActive: boolean;
  delegateScopes: DelegateScope[];
} {
  const activeGrants = getActiveDelegateGrants(permissions.userId, permissions.delegateGrants);
  const allScopes = new Set<DelegateScope>();
  activeGrants.forEach((g) => g.scopes.forEach((s) => allScopes.add(s)));

  return {
    canSendPublic: canSendMessage(permissions.tier),
    canReply: canReply(permissions.userId, permissions.tier, permissions.role, permissions.delegateGrants),
    canModerate: canModerate(permissions.userId, permissions.role, permissions.delegateGrants),
    isDelegateActive: activeGrants.length > 0,
    delegateScopes: Array.from(allScopes),
  };
}

/**
 * Server-side permission enforcement
 * Call this in socket handlers before allowing actions
 */
export class PermissionValidator {
  private grants: Map<string, DelegateGrant[]> = new Map(); // roomId -> grants

  /**
   * Add delegate grant to room
   */
  addGrant(roomId: string, grant: DelegateGrant): void {
    const roomGrants = this.grants.get(roomId) || [];
    roomGrants.push(grant);
    this.grants.set(roomId, roomGrants);
  }

  /**
   * Remove delegate grant from room
   */
  removeGrant(roomId: string, grantId: string): void {
    const roomGrants = this.grants.get(roomId) || [];
    this.grants.set(
      roomId,
      roomGrants.filter((g) => g.id !== grantId)
    );
  }

  /**
   * Get all grants for a room
   */
  getGrants(roomId: string): DelegateGrant[] {
    const grants = this.grants.get(roomId) || [];
    return cleanupExpiredGrants(grants); // Auto-cleanup expired
  }

  /**
   * Validate if user can reply in room
   */
  canUserReply(roomId: string, userId: string, tier: UserTier, role: UserRole): boolean {
    const grants = this.getGrants(roomId);
    return canReply(userId, tier, role, grants);
  }

  /**
   * Validate if user can moderate in room
   */
  canUserModerate(roomId: string, userId: string, role: UserRole): boolean {
    const grants = this.getGrants(roomId);
    return canModerate(userId, role, grants);
  }

  /**
   * Cleanup expired grants across all rooms
   */
  cleanupAllExpired(): void {
    this.grants.forEach((grants, roomId) => {
      this.grants.set(roomId, cleanupExpiredGrants(grants));
    });
  }
}

/**
 * Global permission validator instance (for server-side use)
 */
export const globalPermissionValidator = new PermissionValidator();
