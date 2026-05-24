// lib/mail/MailTemplateEngine.ts — 10 TMI email templates (black/neon/gold styling)

export type TemplateId =
  | "welcome"
  | "diamond_upgrade"
  | "challenge_invite"
  | "live_room_alert"
  | "tip_received"
  | "payout_scheduled"
  | "payout_sent"
  | "support_ticket"
  | "weekly_recap"
  | "re_engagement";

export interface TemplateVars {
  userName?: string;
  userEmail?: string;
  amount?: string;
  date?: string;
  reason?: string;
  challengeName?: string;
  challengeUrl?: string;
  roomName?: string;
  roomUrl?: string;
  payoutId?: string;
  ticketId?: string;
  supportMessage?: string;
  approverName?: string;
  recapStats?: { plays: number; tips: number; followers: number };
  ctaUrl?: string;
  ctaLabel?: string;
  unsubscribeUrl?: string;
}

const BRAND_COLORS = {
  bg: "#0a0a0f",
  card: "#12121a",
  cyan: "#00e5ff",
  fuchsia: "#ff00ff",
  gold: "#ffd700",
  purple: "#9b59b6",
  text: "#e0e0e0",
  muted: "#888",
};

function shell(title: string, preheader: string, body: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>${title}</title>
</head>
<body style="margin:0;padding:0;background:${BRAND_COLORS.bg};font-family:'Helvetica Neue',Arial,sans-serif;">
<div style="display:none;max-height:0;overflow:hidden;">${preheader}</div>
<table width="100%" cellpadding="0" cellspacing="0" style="background:${BRAND_COLORS.bg};padding:32px 16px;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:${BRAND_COLORS.card};border-radius:12px;border:1px solid #222;overflow:hidden;">
<tr>
  <td style="background:linear-gradient(135deg,${BRAND_COLORS.bg} 0%,#1a0a2e 100%);padding:24px 32px;text-align:center;border-bottom:1px solid #222;">
    <span style="font-size:22px;font-weight:900;letter-spacing:0.12em;color:${BRAND_COLORS.cyan};text-transform:uppercase;">THE MUSICIAN'S INDEX</span>
  </td>
</tr>
<tr>
  <td style="padding:32px;">
    ${body}
  </td>
</tr>
<tr>
  <td style="padding:16px 32px 24px;text-align:center;border-top:1px solid #222;">
    <p style="margin:0 0 8px;font-size:11px;color:${BRAND_COLORS.muted};">© 2026 BernoutGlobal LLC · The Musician's Index</p>
    <p style="margin:0;font-size:11px;color:${BRAND_COLORS.muted};">
      <a href="{{unsubscribeUrl}}" style="color:${BRAND_COLORS.muted};text-decoration:underline;">Unsubscribe</a>
      &nbsp;·&nbsp;
      <a href="https://themusiciansindex.com/settings/notifications" style="color:${BRAND_COLORS.muted};text-decoration:underline;">Manage preferences</a>
    </p>
  </td>
</tr>
</table>
</td></tr>
</table>
</body>
</html>`;
}

function h1(text: string, color = BRAND_COLORS.cyan): string {
  return `<h1 style="margin:0 0 16px;font-size:26px;font-weight:900;color:${color};letter-spacing:0.04em;">${text}</h1>`;
}

function p(text: string): string {
  return `<p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:${BRAND_COLORS.text};">${text}</p>`;
}

function cta(label: string, url: string, color = BRAND_COLORS.cyan): string {
  return `<p style="margin:24px 0 0;text-align:center;">
    <a href="${url}" style="display:inline-block;padding:14px 32px;background:${color};color:#000;font-weight:900;font-size:14px;letter-spacing:0.1em;text-decoration:none;border-radius:6px;text-transform:uppercase;">${label}</a>
  </p>`;
}

function stat(label: string, value: string | number, color = BRAND_COLORS.gold): string {
  return `<td style="text-align:center;padding:16px;">
    <div style="font-size:28px;font-weight:900;color:${color};">${value}</div>
    <div style="font-size:11px;color:${BRAND_COLORS.muted};text-transform:uppercase;letter-spacing:0.1em;margin-top:4px;">${label}</div>
  </td>`;
}

const TEMPLATES: Record<TemplateId, (v: TemplateVars) => { subject: string; html: string; text: string }> = {
  welcome: (v) => ({
    subject: `Welcome to The Musician's Index, ${v.userName ?? "Artist"}`,
    html: shell(
      "Welcome to TMI",
      "Your music career just got a platform.",
      h1("Welcome to the Index.") +
      p(`Hey ${v.userName ?? "there"} — you're in. TMI is the platform where artists compete, collaborate, and get paid.`) +
      p("Your profile is live. Your audience is waiting. The stage is yours.") +
      cta("Explore TMI", v.ctaUrl ?? "https://themusiciansindex.com/home/1")
    ),
    text: `Welcome to The Musician's Index, ${v.userName}! Your profile is live. Visit: ${v.ctaUrl ?? "https://themusiciansindex.com"}`,
  }),

  diamond_upgrade: (v) => ({
    subject: "You're Diamond — Welcome to the Inner Circle",
    html: shell(
      "Diamond Status Unlocked",
      "8% fees. Priority payouts. Diamond access.",
      h1("You're Diamond.", BRAND_COLORS.gold) +
      p(`${v.userName ?? "Artist"}, your Diamond membership is now active.`) +
      p("You now enjoy: <strong>8% platform fees</strong> (down from 20%), <strong>priority payout processing</strong>, and exclusive Diamond-only rooms and challenges.") +
      cta("Access Diamond Lounge", v.ctaUrl ?? "https://themusiciansindex.com/hub/diamond", BRAND_COLORS.gold)
    ),
    text: `${v.userName}, your Diamond membership is active. 8% fees, priority payouts, exclusive access.`,
  }),

  challenge_invite: (v) => ({
    subject: `Challenge Invite: ${v.challengeName ?? "New Battle"}`,
    html: shell(
      "Challenge Invite",
      "Someone wants to battle you.",
      h1("You've been challenged.", BRAND_COLORS.fuchsia) +
      p(`You've been invited to: <strong style="color:${BRAND_COLORS.fuchsia};">${v.challengeName ?? "New Battle"}</strong>`) +
      p("Accept before the clock runs out. Winner gets the crowd.") +
      cta("Accept the Challenge", v.challengeUrl ?? "https://themusiciansindex.com/arena", BRAND_COLORS.fuchsia)
    ),
    text: `You've been invited to: ${v.challengeName}. Accept at: ${v.challengeUrl}`,
  }),

  live_room_alert: (v) => ({
    subject: `🔴 Live Now: ${v.roomName ?? "A room you follow"}`,
    html: shell(
      "Live Room Alert",
      "Someone you follow just went live.",
      h1("Live right now.", BRAND_COLORS.fuchsia) +
      p(`<strong style="color:${BRAND_COLORS.fuchsia};">${v.roomName ?? "An artist you follow"}</strong> is live on TMI.`) +
      p("Jump in before the performance ends.") +
      cta("Watch Live", v.roomUrl ?? "https://themusiciansindex.com/arena", BRAND_COLORS.fuchsia)
    ),
    text: `${v.roomName} is live on TMI now. Watch at: ${v.roomUrl}`,
  }),

  tip_received: (v) => ({
    subject: `You received a tip: ${v.amount ?? "$0.00"}`,
    html: shell(
      "Tip Received",
      "Someone just tipped you.",
      h1("You got tipped.", BRAND_COLORS.gold) +
      p(`<strong style="color:${BRAND_COLORS.gold};font-size:28px;">${v.amount ?? "$0.00"}</strong>`) +
      p("Your tip has been received and is in the payout queue. Funds will be released after the hold window clears.") +
      cta("View Earnings", v.ctaUrl ?? "https://themusiciansindex.com/hub/performer", BRAND_COLORS.gold)
    ),
    text: `You received a tip of ${v.amount}. View your earnings at: ${v.ctaUrl}`,
  }),

  payout_scheduled: (v) => ({
    subject: `Payout scheduled: ${v.amount ?? "$0.00"} on ${v.date ?? "soon"}`,
    html: shell(
      "Payout Scheduled",
      "Your earnings are on the way.",
      h1("Payout scheduled.") +
      p(`<strong style="color:${BRAND_COLORS.cyan};font-size:24px;">${v.amount ?? "$0.00"}</strong> is scheduled for <strong>${v.date ?? "next payout cycle"}</strong>.`) +
      p(`Payout ID: <code style="color:${BRAND_COLORS.muted};font-size:12px;">${v.payoutId ?? "—"}</code>`) +
      cta("View Payout Status", v.ctaUrl ?? "https://themusiciansindex.com/hub/performer")
    ),
    text: `${v.amount} payout scheduled for ${v.date}. Payout ID: ${v.payoutId}`,
  }),

  payout_sent: (v) => ({
    subject: `Payment sent: ${v.amount ?? "$0.00"}`,
    html: shell(
      "Payment Sent",
      "Money is moving.",
      h1("Payment sent.") +
      p(`<strong style="color:${BRAND_COLORS.gold};font-size:28px;">${v.amount ?? "$0.00"}</strong> has been sent to your connected account.`) +
      p("Allow 1–3 business days for Stripe to deposit to your bank.") +
      p(`Payout ID: <code style="color:${BRAND_COLORS.muted};font-size:12px;">${v.payoutId ?? "—"}</code>`) +
      cta("View Earnings History", v.ctaUrl ?? "https://themusiciansindex.com/hub/performer", BRAND_COLORS.gold)
    ),
    text: `${v.amount} has been sent to your account. Payout ID: ${v.payoutId}`,
  }),

  support_ticket: (v) => ({
    subject: `Support ticket received${v.ticketId ? ` (#${v.ticketId})` : ""}`,
    html: shell(
      "Support Ticket",
      "We got your message.",
      h1("We received your request.") +
      p(`${v.userName ?? "Hi"}, your support message has been received and is being reviewed by our team.`) +
      (v.supportMessage ? `<blockquote style="margin:0 0 16px;padding:12px 16px;background:#1a1a2e;border-left:3px solid ${BRAND_COLORS.purple};color:${BRAND_COLORS.muted};font-style:italic;border-radius:4px;">${v.supportMessage}</blockquote>` : "") +
      p("You'll hear back within 24–48 hours. If urgent, mention it in the message.") +
      cta("View Your Inbox", v.ctaUrl ?? "https://themusiciansindex.com/messages", BRAND_COLORS.purple)
    ),
    text: `Support ticket received. We'll respond within 24–48 hours. Ticket: ${v.ticketId}`,
  }),

  weekly_recap: (v) => ({
    subject: `Your TMI week: ${v.recapStats?.plays ?? 0} plays, ${v.recapStats?.tips ?? 0} tips`,
    html: shell(
      "Weekly Recap",
      "Here's how your week went.",
      h1("Your week on TMI.") +
      `<table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px;"><tr>
        ${stat("Plays", v.recapStats?.plays ?? 0, BRAND_COLORS.cyan)}
        ${stat("Tips", v.recapStats?.tips ?? 0, BRAND_COLORS.gold)}
        ${stat("New Followers", v.recapStats?.followers ?? 0, BRAND_COLORS.fuchsia)}
      </tr></table>` +
      p("Keep building. Your audience grows every week you show up.") +
      cta("View Full Stats", v.ctaUrl ?? "https://themusiciansindex.com/hub/performer")
    ),
    text: `TMI Weekly: ${v.recapStats?.plays} plays, ${v.recapStats?.tips} tips, ${v.recapStats?.followers} new followers.`,
  }),

  re_engagement: (v) => ({
    subject: `${v.userName ?? "Artist"}, you've been quiet — the stage is still yours`,
    html: shell(
      "Come Back",
      "TMI misses your music.",
      h1("The stage is still yours.", BRAND_COLORS.fuchsia) +
      p(`${v.userName ?? "Hey"} — it's been a while since you were active on TMI.`) +
      p("Your profile is still live. Your fans are still watching. Jump back in.") +
      cta(v.ctaLabel ?? "Return to TMI", v.ctaUrl ?? "https://themusiciansindex.com/home/1", BRAND_COLORS.fuchsia)
    ),
    text: `${v.userName}, come back to TMI. Your stage is waiting: ${v.ctaUrl}`,
  }),
};

export function renderTemplate(
  id: TemplateId,
  vars: TemplateVars
): { subject: string; html: string; text: string } {
  const fn = TEMPLATES[id];
  if (!fn) throw new Error(`Unknown template: ${id}`);
  return fn(vars);
}

export function getTemplateIds(): TemplateId[] {
  return Object.keys(TEMPLATES) as TemplateId[];
}
