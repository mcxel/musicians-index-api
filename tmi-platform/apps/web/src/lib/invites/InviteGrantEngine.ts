import { InviteAuthorityEngine, type InviteRecord } from "@/lib/invites/InviteAuthorityEngine";
import { InviteEmailEngine } from "@/lib/email/InviteEmailEngine";
import { GiftMembershipEngine, type GiftAccountRole, type GiftTier, type GiftSource } from "@/lib/subscriptions/GiftMembershipEngine";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://tmiplatform.com";

export interface InviteGrantResult {
  invite: InviteRecord;
  giftId: string;
  inviteLink: string;
}

export interface InviteAcceptResult {
  accepted: boolean;
  reason?: string;
  accountId?: string;
  invite?: InviteRecord;
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export class InviteGrantEngine {
  static grantAndSendInvite(input: {
    recipientEmail: string;
    inviterId: string;
    role: GiftAccountRole;
    tier: GiftTier;
    source: GiftSource;
    familyInvite?: boolean;
    friendInvite?: boolean;
  }): InviteGrantResult {
    const { invite, token } = InviteAuthorityEngine.createInvite({
      recipientEmail: input.recipientEmail,
      inviterId: input.inviterId,
      role: input.role,
      tier: input.tier,
      source: input.source,
      familyInvite: input.familyInvite,
      friendInvite: input.friendInvite,
    });

    const grant = GiftMembershipEngine.grantMembership({
      recipientEmail: input.recipientEmail,
      role: input.role,
      tier: input.tier,
      source: input.source,
      inviteId: invite.inviteId,
      grantedByAdminId: input.inviterId,
    });

    const inviteLink = `${BASE_URL}/invite/${token}`;
    InviteEmailEngine.sendInviteEmail({
      to: input.recipientEmail,
      inviteLink,
      role: input.role,
      tier: input.tier,
      source: input.source,
      inviterName: input.inviterId,
    });

    return { invite, giftId: grant.giftId, inviteLink };
  }

  static acceptInviteToken(token: string, acceptingEmail?: string): InviteAcceptResult {
    const lookup = InviteAuthorityEngine.getInviteByToken(token);
    if (!lookup.invite) {
      return { accepted: false, reason: lookup.reason ?? "invalid" };
    }

    const invite = lookup.invite;
    if (invite.status !== "pending" && invite.status !== "expired") {
      return { accepted: false, reason: `invite-${invite.status}` };
    }

    const email = normalizeEmail(acceptingEmail ?? invite.recipientEmail);
    const grant = GiftMembershipEngine.findPendingGrantByInviteId(invite.inviteId);
    if (!grant) {
      return { accepted: false, reason: "gift-grant-missing" };
    }

    const activated = GiftMembershipEngine.activateGiftMembership({
      giftId: grant.giftId,
      email,
    });

    const acceptedInvite = InviteAuthorityEngine.acceptInvite(invite.inviteId, activated.accountId);
    InviteAuthorityEngine.consumeToken(token);

    return {
      accepted: true,
      accountId: activated.accountId,
      invite: acceptedInvite,
    };
  }

  static listPendingAndAccepted(): { pending: InviteRecord[]; accepted: InviteRecord[] } {
    return {
      pending: InviteAuthorityEngine.listPendingInvites(),
      accepted: InviteAuthorityEngine.listAcceptedInvites(),
    };
  }

  static listGiftedAccounts() {
    return GiftMembershipEngine.listGiftedAccounts();
  }

  static revokeGiftedMembership(input: { giftId?: string; accountId?: string; reason: string }): boolean {
    return GiftMembershipEngine.revokeGiftMembership(input);
  }

  static upgradeGiftedMembership(accountId: string, tier: GiftTier) {
    return GiftMembershipEngine.upgradeGiftMembership(accountId, tier);
  }
}

export default InviteGrantEngine;
