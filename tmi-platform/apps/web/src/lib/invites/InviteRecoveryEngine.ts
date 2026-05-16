import { InviteAuthorityEngine, type InviteRecord } from "@/lib/invites/InviteAuthorityEngine";
import { InviteEmailEngine } from "@/lib/email/InviteEmailEngine";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://tmiplatform.com";

export interface InviteRecoveryResult {
  invite: InviteRecord;
  resent: boolean;
  reason?: string;
  inviteLink?: string;
}

export class InviteRecoveryEngine {
  static resendInvite(inviteId: string, actorId: string): InviteRecoveryResult {
    const current = InviteAuthorityEngine.getInviteById(inviteId);
    if (!current) throw new Error(`Invite ${inviteId} not found`);

    if (current.status === "accepted" || current.status === "revoked") {
      return { invite: current, resent: false, reason: `invite-${current.status}` };
    }

    const { invite, token } = InviteAuthorityEngine.reissueInviteToken(inviteId, actorId, "recovery-resend");
    const inviteLink = `${BASE_URL}/invite/${token}`;

    InviteEmailEngine.sendInviteEmail({
      to: invite.recipientEmail,
      inviteLink,
      role: invite.role,
      tier: invite.tier,
      source: invite.source,
      inviterName: actorId,
    });

    return { invite, resent: true, inviteLink };
  }

  static resendLatestInviteForEmail(email: string, actorId: string): InviteRecoveryResult | null {
    const matches = InviteAuthorityEngine.listInvitesForEmail(email);
    if (matches.length === 0) return null;
    const latest = matches[0];
    return this.resendInvite(latest.inviteId, actorId);
  }

  static recoverFromToken(token: string): { invite: InviteRecord | null; needsReissue: boolean; reason?: string } {
    const result = InviteAuthorityEngine.getInviteByToken(token);
    if (result.invite) return { invite: result.invite, needsReissue: false };

    return {
      invite: null,
      needsReissue: result.reason === "expired" || result.reason === "used",
      reason: result.reason,
    };
  }
}

export default InviteRecoveryEngine;
