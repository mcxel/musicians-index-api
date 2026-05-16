/**
 * Phase 1 Onboarding Email — Batch 1 invite template.
 * Used for the first 10-20 controlled invites.
 * Register once, call renderPhase1Invite() to build each message.
 * Actual dispatch goes through EmailQueueEngine / your email provider.
 */

export interface Phase1InviteParams {
  recipientName: string;
  recipientEmail: string;
  /** Personalized entry link — should route to /rooms/world-dance-party */
  entryUrl: string;
  /** Optional personal note from Marcel */
  personalNote?: string;
}

export interface Phase1InviteMessage {
  to: string;
  subject: string;
  html: string;
  text: string;
  templateKey: "phase1-invite-v1";
}

const SUBJECT = "You're invited to TMI — the room is live right now";

function buildHtml(params: Phase1InviteParams): string {
  const note = params.personalNote
    ? `<p style="color:#00FFFF;font-style:italic;border-left:3px solid #00FFFF;padding-left:12px;margin:20px 0">${params.personalNote}</p>`
    : "";

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#050510;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;color:#ffffff">
  <div style="max-width:600px;margin:0 auto;padding:40px 24px">

    <!-- Header -->
    <div style="text-align:center;margin-bottom:32px">
      <div style="font-size:11px;letter-spacing:6px;color:#FF2DAA;font-weight:800;margin-bottom:8px">THE MUSICIAN'S INDEX</div>
      <div style="font-size:28px;font-weight:900;letter-spacing:2px">TMI</div>
    </div>

    <!-- Hero -->
    <div style="background:rgba(255,45,170,0.06);border:1px solid rgba(255,45,170,0.2);border-radius:16px;padding:32px;text-align:center;margin-bottom:24px">
      <div style="font-size:32px;margin-bottom:16px">🎤</div>
      <h1 style="font-size:22px;font-weight:900;margin:0 0 12px;line-height:1.3">
        ${params.recipientName ? `${params.recipientName}, you` : "You"}'re invited.
      </h1>
      <p style="font-size:13px;color:rgba(255,255,255,0.6);margin:0 0 24px;line-height:1.6">
        The World Dance Party is live right now.<br>
        Record Ralph is on the decks. The crowd is in here.<br>
        Come see what this is.
      </p>
      <a href="${params.entryUrl}"
        style="display:inline-block;padding:14px 36px;background:#FF2DAA;color:#ffffff;text-decoration:none;font-weight:800;font-size:12px;letter-spacing:3px;border-radius:30px">
        ENTER THE ROOM →
      </a>
    </div>

    ${note}

    <!-- What to expect -->
    <div style="margin-bottom:24px">
      <div style="font-size:9px;letter-spacing:4px;color:rgba(255,255,255,0.35);font-weight:800;margin-bottom:14px">WHAT YOU'LL FIND</div>
      <div style="display:flex;flex-direction:column;gap:10px">
        ${[
          ["🎧", "Record Ralph live on the decks — rotating sets, daily challenges"],
          ["🪑", "A seat in the arena — yours to hold"],
          ["🏆", "Artist battles, cyphers, and the Billboard rankings"],
          ["💰", "Sponsor and advertiser tools if you're here to grow"],
        ].map(([icon, text]) => `
        <div style="display:flex;align-items:flex-start;gap:12px;padding:12px;background:rgba(255,255,255,0.02);border-radius:8px;border:1px solid rgba(255,255,255,0.06)">
          <span style="font-size:18px;flex-shrink:0">${icon}</span>
          <span style="font-size:12px;color:rgba(255,255,255,0.7);line-height:1.5">${text}</span>
        </div>`).join("")}
      </div>
    </div>

    <!-- CTA repeat -->
    <div style="text-align:center;margin-bottom:32px">
      <a href="${params.entryUrl}"
        style="display:inline-block;padding:12px 32px;background:rgba(255,45,170,0.1);color:#FF2DAA;text-decoration:none;font-weight:800;font-size:11px;letter-spacing:3px;border-radius:30px;border:1px solid rgba(255,45,170,0.3)">
        JOIN NOW — IT'S FREE TO START
      </a>
    </div>

    <!-- Footer -->
    <div style="border-top:1px solid rgba(255,255,255,0.06);padding-top:20px;text-align:center">
      <div style="font-size:9px;color:rgba(255,255,255,0.2);line-height:1.8">
        TMI · The Musician's Index · BerntoutGlobal LLC<br>
        You received this because you're part of the first wave.<br>
        <a href="#" style="color:rgba(255,255,255,0.2);text-decoration:none">Unsubscribe</a>
      </div>
    </div>

  </div>
</body>
</html>`;
}

function buildText(params: Phase1InviteParams): string {
  return `${params.recipientName ? `${params.recipientName}, you` : "You"}'re invited to TMI.

The World Dance Party is live right now.
Record Ralph is on the decks.

Enter here: ${params.entryUrl}

What you'll find:
- Record Ralph live on the decks with daily challenges
- Your own seat in the arena
- Artist battles, cyphers, and Billboard rankings
- Sponsor and advertiser tools if you're growing a brand

${params.personalNote ? `\n"${params.personalNote}"\n` : ""}

Join at: ${params.entryUrl}

---
TMI · The Musician's Index · BerntoutGlobal LLC
`;
}

/**
 * Render a ready-to-send Phase 1 invite for one recipient.
 * Pass the result to your email provider (EmailQueueEngine / Resend / SendGrid).
 */
export function renderPhase1Invite(params: Phase1InviteParams): Phase1InviteMessage {
  return {
    to: params.recipientEmail,
    subject: SUBJECT,
    html: buildHtml(params),
    text: buildText(params),
    templateKey: "phase1-invite-v1",
  };
}

/**
 * Build a batch of invite messages.
 * Cap enforced at 20 — the Phase 1 controlled limit.
 */
export function buildPhase1Batch(
  recipients: Phase1InviteParams[],
  entryUrl: string,
): Phase1InviteMessage[] {
  const capped = recipients.slice(0, 20);
  return capped.map((r) =>
    renderPhase1Invite({ ...r, entryUrl: r.entryUrl || entryUrl }),
  );
}
