import { pushPointHistory } from '@/lib/economy/PointHistoryEngine';

export interface LinkedIdentity {
  masterAccountId: string;
  fanProfileId: string | null;
  performerProfileId: string | null;
  activeRole: 'fan' | 'performer';
  sharedWalletBalance: number;
}

export class UnifiedIdentityBridge {
  private static identities = new Map<string, LinkedIdentity>();

  static linkAccounts(masterId: string, fanId: string, performerId: string): LinkedIdentity {
    const identity: LinkedIdentity = {
      masterAccountId: masterId,
      fanProfileId: fanId,
      performerProfileId: performerId,
      activeRole: 'fan',
      sharedWalletBalance: 0
    };
    this.identities.set(masterId, identity);
    console.log(`[IDENTITY_BRIDGE] Linked fan ${fanId} and performer ${performerId} under master account ${masterId}`);
    return identity;
  }

  static switchRole(masterId: string, targetRole: 'fan' | 'performer') {
    const identity = this.identities.get(masterId);
    if (!identity) throw new Error("Identity not found");

    identity.activeRole = targetRole;
    console.log(`[IDENTITY_BRIDGE] Master account ${masterId} active role switched to ${targetRole}. Isolated progression active.`);
    return identity;
  }

  static getSharedWallet(masterId: string) {
    return this.identities.get(masterId)?.sharedWalletBalance ?? 0;
  }
  
  static updateSharedWallet(masterId: string, delta: number, reason: string = 'shared-identity-action') {
    const identity = this.identities.get(masterId);
    if (!identity) throw new Error("Identity not found");

    identity.sharedWalletBalance += delta;
    
    // Propagate cleanly to the central economy ledger (prevents duplicate economies)
    if (identity.fanProfileId) {
      pushPointHistory(identity.fanProfileId, delta, reason);
    }
  }
}