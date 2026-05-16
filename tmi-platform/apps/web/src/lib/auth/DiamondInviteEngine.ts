import { UnifiedIdentityBridge } from '@/lib/profile/UnifiedIdentityBridge';

export interface InvitePayload {
  token: string;
  email: string;
  /** Additional email aliases for the same account (e.g. founders with two emails) */
  emailAliases?: string[];
  assignedRole: 'performer' | 'fan' | 'promoter';
  /** Diamond producer flag — enables NFT minting and unlimited beat uploads */
  isDiamondProducer?: boolean;
  /** Founder flag — grants elevated platform privileges, is_founder marker */
  isFounder?: boolean;
  /** Trial duration in days (undefined = lifetime) */
  trialDays?: number;
  status: 'active' | 'redeemed' | 'revoked';
}

/**
 * TMI Diamond Invite Engine
 * Role: Frictionless VIP onboarding and automatic economy seeding.
 */
export class DiamondInviteEngine {
  // Soft-launch founder registry — lifetime diamond accounts
  private static activeInvites = new Map<string, InvitePayload>([
    ['VIP-JPS-2026', { token: 'VIP-JPS-2026', email: 'jaypaul@example.com', assignedRole: 'performer', status: 'active' }],
    ['VIP-ACE-2026', { token: 'VIP-ACE-2026', email: 'bigace@example.com', assignedRole: 'performer', status: 'active' }],

    // Kreach — Platform beat producer (lifetime diamond producer)
    ['VIP-KREACH-2026', {
      token: 'VIP-KREACH-2026',
      email: 'kreach@themusiciansindex.com',
      assignedRole: 'performer',
      isDiamondProducer: true,
      status: 'active',
    }],

    // KG — Platform beat producer (lifetime diamond producer)
    ['VIP-KG-2026', {
      token: 'VIP-KG-2026',
      email: 'kg@themusiciansindex.com',
      assignedRole: 'performer',
      isDiamondProducer: true,
      status: 'active',
    }],

    // Savage Guns — Beat maker (90-day diamond trial)
    ['VIP-SAVAGE-2026', {
      token: 'VIP-SAVAGE-2026',
      email: 'savageguns@themusiciansindex.com',
      assignedRole: 'performer',
      isDiamondProducer: false,
      trialDays: 90,
      status: 'active',
    }],

    // Jason Smith — Founder, multi-email (lifetime diamond, performer + fan + promoter)
    ['VIP-JASON-2026', {
      token: 'VIP-JASON-2026',
      email: 'sharingmyblessing1978@gmail.com',
      emailAliases: ['blackstargoldpr@gmail.com'],
      assignedRole: 'promoter',
      isFounder: true,
      status: 'active',
    }],
  ]);

  static getInvite(token: string): InvitePayload | undefined {
    return this.activeInvites.get(token);
  }

  static registerInvite(token: string, email: string, role: 'performer' | 'fan' | 'promoter' = 'performer'): void {
    this.activeInvites.set(token, { token, email, assignedRole: role, status: 'active' });
    console.log(`[DIAMOND_INVITE] Registered new invite token: ${token} for ${email}`);
  }

  static async validateAndRedeem(token: string, masterAccountId: string): Promise<boolean> {
    console.log(`[DIAMOND_INVITE] Validating secure token: ${token}`);
    
    const invite = this.activeInvites.get(token);
    
    if (!invite || invite.status !== 'active') {
      console.warn(`[DIAMOND_INVITE] Token invalid or already redeemed: ${token}`);
      return false; // Fallback safety: degrades to standard free flow
    }

    // 1. Mark as redeemed
    invite.status = 'redeemed';
    this.activeInvites.set(token, invite);

    // 2. Assign Role & Seed the Wallet via existing Unified Identity Bridge
    const bridgeRole: 'performer' | 'fan' =
      invite.assignedRole === 'fan' ? 'fan' : 'performer';
    UnifiedIdentityBridge.switchRole(masterAccountId, bridgeRole);
    UnifiedIdentityBridge.updateSharedWallet(masterAccountId, 5000, 'diamond-founder-seed'); // 5000 points = $50 tipping power

    console.log(`[DIAMOND_INVITE] Success. Account ${masterAccountId} upgraded to DIAMOND. Wallet seeded.`);
    return true;
  }
}