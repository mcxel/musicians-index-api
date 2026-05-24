// lib/mail/DiamondMailer.ts — Diamond tier upgrade emails + invite flow

import { trigger } from "./MailTriggerEngine";
import { activateDiamondMail } from "./MailPreferenceEngine";

export interface DiamondUpgradePayload {
  userId: string;
  email: string;
  userName: string;
}

export async function sendDiamondWelcome(payload: DiamondUpgradePayload): Promise<void> {
  // Auto-subscribe user to all mail categories on Diamond upgrade
  activateDiamondMail(payload.userId);

  await trigger("DIAMOND_UPGRADED", {
    userId: payload.userId,
    email: payload.email,
    vars: {
      userName: payload.userName,
      ctaUrl: "https://themusiciansindex.com/hub/diamond",
    },
    dedupKey: `diamond_welcome_${payload.userId}`,
  });
}

export async function sendDiamondInvite(params: {
  inviterName: string;
  inviteeEmail: string;
  inviteeUserId: string;
  inviteUrl: string;
}): Promise<void> {
  const { sendMail } = await import("./TMIMailEngine");

  await sendMail({
    to: params.inviteeEmail,
    subject: `${params.inviterName} invited you to TMI Diamond`,
    html: `<!DOCTYPE html><html><body style="background:#0a0a0f;font-family:Arial,sans-serif;padding:32px;">
      <div style="max-width:500px;margin:0 auto;background:#12121a;border-radius:12px;padding:32px;border:1px solid #222;">
        <h2 style="color:#ffd700;margin:0 0 16px;">Diamond Invite</h2>
        <p style="color:#e0e0e0;">${params.inviterName} thinks you belong in TMI Diamond — the inner circle for serious artists.</p>
        <p style="color:#e0e0e0;">8% fees. Priority payouts. Exclusive rooms.</p>
        <p style="text-align:center;margin-top:24px;">
          <a href="${params.inviteUrl}" style="background:#ffd700;color:#000;padding:12px 28px;border-radius:6px;font-weight:900;text-decoration:none;letter-spacing:0.1em;">CLAIM YOUR INVITE</a>
        </p>
      </div>
    </body></html>`,
    text: `${params.inviterName} invited you to TMI Diamond. Claim your invite: ${params.inviteUrl}`,
  });
}
