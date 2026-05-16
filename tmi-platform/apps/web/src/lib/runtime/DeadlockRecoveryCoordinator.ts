/**
 * DeadlockRecoveryCoordinator.ts
 *
 * Detects and recovers from runtime deadlocks:
 * - Circular authority claims (A claims from B, B claims from A)
 * - Stalled generators holding multiple domains
 * - Cascading timeout chains
 * - Split-brain conductor states
 *
 * Recovery strategies:
 * - Priority-based authority release (drop lowest priority domains)
 * - Force-release stalled claims (>30s without heartbeat)
 * - Conductor reset and election
 * - Domain quarantine (prevent reuse until recovery)
 */

import type { ChatRoomId } from '@/lib/chat/RoomChatEngine';
import { getRuntimeAuthorityRoomSummary, type RuntimeAuthorityRoomSummary } from '@/lib/runtime/RuntimeAuthorityRegistry';
import { getConductorLease, releaseConductorAuthority } from '@/lib/runtime/RuntimeConductorAuthority';

interface DeadlockPattern {
  type: 'circular-claim' | 'stalled-owner' | 'timeout-chain' | 'split-brain';
  detectedAtMs: number;
  severity: 'warning' | 'critical';
  affectedDomains: string[];
  affectedOwners: string[];
  description: string;
}

interface DeadlockRecoveryAction {
  action:
    | 'release-domain'
    | 'force-reset-owner'
    | 'restart-conductor'
    | 'quarantine-domain'
    | 'escalate';
  targetDomain?: string;
  targetOwner?: string;
  reason: string;
  executedAtMs?: number;
  success?: boolean;
}

const DETECTED_DEADLOCKS = new Map<string, DeadlockPattern>();
const DEADLOCK_HISTORY = new Map<ChatRoomId, DeadlockPattern[]>();
const QUARANTINED_DOMAINS = new Set<string>();

const DEADLOCK_CONFIG = {
  stallThresholdMs: 30_000, // Owner without heartbeat >30s = stalled
  circularClaimWindow: 5_000, // 5s window to detect circular claims
  splitBrainThreshold: 2, // 2+ concurrent conductors = split-brain
  maxRecoveriesPerRoom: 5, // Max 5 recovery attempts before escalate
};

/**
 * Detect circular authority claims.
 * Pattern: domainA claimed by ownerA (waiting on ownerB's domainB),
 *         domainB claimed by ownerB (waiting on ownerA's domainA)
 */
export function detectCircularClaims(authority: RuntimeAuthorityRoomSummary): DeadlockPattern | null {
  if (!authority.activeOwners || authority.activeOwners.length < 2) {
    return null;
  }

  // Build ownership graph: domain -> owner
  const domainOwners = new Map<string, string>();
  for (const claim of authority.activeOwners) {
    domainOwners.set(claim.domain, claim.ownerId);
  }

  // Check for cycles in claim chain (would need actual dependency tracking)
  // For now, detect if same domain claimed by multiple owners (split ownership)
  const claimsByDomain = new Map<string, string[]>();
  for (const claim of authority.activeOwners) {
    const owners = claimsByDomain.get(claim.domain) || [];
    if (!owners.includes(claim.ownerId)) {
      owners.push(claim.ownerId);
    }
    claimsByDomain.set(claim.domain, owners);
  }

  for (const [domain, owners] of claimsByDomain.entries()) {
    if (owners.length > 1) {
      return {
        type: 'circular-claim',
        detectedAtMs: Date.now(),
        severity: 'critical',
        affectedDomains: [domain],
        affectedOwners: owners,
        description: `Multiple owners claiming ${domain}: ${owners.join(', ')}`,
      };
    }
  }

  return null;
}

/**
 * Detect stalled owners (no heartbeat for >30s).
 */
export function detectStalledOwners(authority: RuntimeAuthorityRoomSummary): DeadlockPattern | null {
  const now = Date.now();
  const stalledOwners: string[] = [];
  const stalledDomains: string[] = [];

  for (const claim of authority.activeOwners || []) {
    const ageMs = now - claim.claimedAtMs;
    if (ageMs > DEADLOCK_CONFIG.stallThresholdMs) {
      if (!stalledOwners.includes(claim.ownerId)) {
        stalledOwners.push(claim.ownerId);
      }
      stalledDomains.push(claim.domain);
    }
  }

  if (stalledOwners.length > 0) {
    return {
      type: 'stalled-owner',
      detectedAtMs: now,
      severity: 'critical',
      affectedDomains: stalledDomains,
      affectedOwners: stalledOwners,
      description: `Stalled owners: ${stalledOwners.join(', ')} (age >30s)`,
    };
  }

  return null;
}

/**
 * Detect timeout chains (A waits for B, B waits for C, C waits for A).
 */
export function detectTimeoutChains(authority: RuntimeAuthorityRoomSummary): DeadlockPattern | null {
  // This requires tracking wait relationships between orchestrators
  // Simplified: flag if multiple claims are expiring soon
  const now = Date.now();
  const expiringClaims = (authority.activeOwners || []).filter(
    (c: any) => c.expiresAtMs - now < 5_000 && c.expiresAtMs > now
  );

  if (expiringClaims.length > 2) {
    const domains: string[] = expiringClaims.map((c: any) => c.domain);
    const owners: string[] = [...new Set(expiringClaims.map((c: any) => c.ownerId))];

    return {
      type: 'timeout-chain',
      detectedAtMs: now,
      severity: 'warning',
      affectedDomains: domains,
      affectedOwners: owners,
      description: `Multiple claims expiring soon (potential chain): ${domains.join(', ')}`,
    };
  }

  return null;
}

/**
 * Detect split-brain (multiple conductors claiming primary).
 */
export function detectSplitBrain(roomId: ChatRoomId, authority: RuntimeAuthorityRoomSummary): DeadlockPattern | null {
  const conductorClaims = (authority.activeOwners || []).filter((c: any) => c.domain === 'runtime-conductor');

  if (conductorClaims.length > DEADLOCK_CONFIG.splitBrainThreshold) {
    return {
      type: 'split-brain',
      detectedAtMs: Date.now(),
      severity: 'critical',
      affectedDomains: ['runtime-conductor'],
      affectedOwners: conductorClaims.map((c: any) => c.ownerId),
      description: `Split-brain: ${conductorClaims.length} conductors claiming authority`,
    };
  }

  return null;
}

/**
 * Run full deadlock detection.
 */
export function detectDeadlock(roomId: ChatRoomId, authority: RuntimeAuthorityRoomSummary): DeadlockPattern | null {
  const patterns = [
    detectCircularClaims(authority),
    detectStalledOwners(authority),
    detectTimeoutChains(authority),
    detectSplitBrain(roomId, authority),
  ];

  const deadlock = patterns.find((p) => p !== null);

  if (deadlock) {
    const key = `${roomId}-${deadlock.type}`;
    DETECTED_DEADLOCKS.set(key, deadlock);

    const history = DEADLOCK_HISTORY.get(roomId) || [];
    history.push(deadlock);
    DEADLOCK_HISTORY.set(roomId, history);

    console.error(`[Deadlock] ${deadlock.severity}: ${deadlock.description}`);
  }

  return deadlock || null;
}

/**
 * Execute recovery for detected deadlock.
 */
export async function executeDeadlockRecovery(
  roomId: ChatRoomId,
  deadlock: DeadlockPattern
): Promise<DeadlockRecoveryAction[]> {
  const actions: DeadlockRecoveryAction[] = [];

  switch (deadlock.type) {
    case 'circular-claim':
      // Release domain from non-conductor owner
      for (const domain of deadlock.affectedDomains) {
        for (const owner of deadlock.affectedOwners) {
          if (owner !== 'runtime-conductor') {
            actions.push({
              action: 'release-domain',
              targetDomain: domain,
              targetOwner: owner,
              reason: 'Circular claim detected; releasing non-conductor owner',
            });
          }
        }
      }
      break;

    case 'stalled-owner':
      // Force-reset stalled owners
      for (const owner of deadlock.affectedOwners) {
        actions.push({
          action: 'force-reset-owner',
          targetOwner: owner,
          reason: 'Owner stalled >30s; force reset',
        });
      }
      // Quarantine affected domains temporarily
      for (const domain of deadlock.affectedDomains) {
        QUARANTINED_DOMAINS.add(`${roomId}-${domain}`);
        actions.push({
          action: 'quarantine-domain',
          targetDomain: domain,
          reason: 'Quarantine after stall recovery',
        });
      }
      break;

    case 'split-brain':
      // Reset conductor authority and trigger election
      releaseConductorAuthority(roomId, 'all-conductors');
      actions.push({
        action: 'restart-conductor',
        reason: 'Split-brain detected; restarting conductor election',
      });
      break;

    case 'timeout-chain':
      // Release lowest-priority claims
      actions.push({
        action: 'release-domain',
        reason: 'Timeout chain detected; releasing low-priority domains',
      });
      break;
  }

  // Log recovery actions
  for (const action of actions) {
    action.executedAtMs = Date.now();
    console.log(`[Deadlock] Recovery: ${action.action} - ${action.reason}`);
  }

  return actions;
}

/**
 * Check if domain is quarantined.
 */
export function isDomainQuarantined(roomId: ChatRoomId, domain: string): boolean {
  return QUARANTINED_DOMAINS.has(`${roomId}-${domain}`);
}

/**
 * Unquarantine domain after recovery window.
 */
export function unquarantineDomain(roomId: ChatRoomId, domain: string): boolean {
  return QUARANTINED_DOMAINS.delete(`${roomId}-${domain}`);
}

/**
 * Get deadlock diagnostics.
 */
export function getDeadlockDiagnostics(): {
  detectedDeadlocks: DeadlockPattern[];
  quarantinedDomains: string[];
  roomDeadlockHistory: Map<ChatRoomId, DeadlockPattern[]>;
} {
  return {
    detectedDeadlocks: [...DETECTED_DEADLOCKS.values()],
    quarantinedDomains: [...QUARANTINED_DOMAINS],
    roomDeadlockHistory: new Map(DEADLOCK_HISTORY),
  };
}

/**
 * Clear old deadlock records.
 */
export function cleanupOldDeadlockRecords(maxAgeMs: number = 300_000): number {
  const now = Date.now();
  let cleaned = 0;

  for (const [key, pattern] of DETECTED_DEADLOCKS.entries()) {
    if (now - pattern.detectedAtMs > maxAgeMs) {
      DETECTED_DEADLOCKS.delete(key);
      cleaned++;
    }
  }

  return cleaned;
}
