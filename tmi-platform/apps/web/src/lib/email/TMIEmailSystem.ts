/**
 * TMIEmailSystem.ts
 * Transactional email system for The Musician's Index.
 * Uses Resend (resend.com) — env: RESEND_API_KEY
 * From: support@themusiciansindex.com (env: EMAIL_FROM)
 */

import { createHmac } from "crypto";
import { checkEmailRateLimit } from "./emailRateLimiter";
import { isUnsubscribed } from "./unsubscribeStore";

/* ─── Types ─────────────────────────────────────────────────────────────── */
export type EmailType =
  | "welcome_artist" | "welcome_fan" | "welcome_venue" | "welcome_diamond" | "welcome_admin"
  | "verify_email" | "password_reset"
  | "invite" | "profile_reminder"
  | "battle_invite" | "contest_win" | "contest_loss"
  | "ticket_confirmation" | "nft_receipt" | "beat_receipt"
  | "tip_received" | "new_follower" | "room_went_live"
  | "security_alert" | "new_login"
  | "subscription_start" | "subscription_renew" | "subscription_cancel" | "subscription_upgrade"
  | "sponsor_confirmation"
  | "weekly_digest" | "magazine_drop"
  | "payout_queued" | "payout_approved";

interface EmailPayload {
  to: string;
  type: EmailType;
  data: Record<string, unknown>;
}

interface SendResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

/* ─── Disposable email blocker ───────────────────────────────────────────── */
const BLOCKED_DOMAINS = new Set([
  "mailinator.com","guerrillamail.com","10minutemail.com","throwam.com",
  "yopmail.com","sharklasers.com","guerrillamailblock.com","grr.la",
  "spam4.me","trashmail.com","fakemail.net","mailnull.com","maildrop.cc",
  "spamgourmet.com","dispostable.com","mailnesia.com",
  "spaml.de","wegwerfmail.de","trashmail.me","spamspot.com","ezztt.com",
  "discard.email","spamfree24.org","emailondeck.com","tempinbox.com",
  "getairmail.com","filzmail.com","mailexpire.com","spamherelots.com",
  "tempemail.co","tempmail.com","temp-mail.org","throwaway.email",
]);

export function isDisposableEmail(email: string): boolean {
  const domain = email.split("@")[1]?.toLowerCase();
  return domain ? BLOCKED_DOMAINS.has(domain) : false;
}

/* ─── HMAC unsubscribe token ─────────────────────────────────────────────── */
function generateUnsubToken(email: string): string {
  const secret = process.env.NEXTAUTH_SECRET ?? "fallback-secret";
  return createHmac("sha256", secret).update(email).digest("hex").slice(0, 16);
}

function unsubUrl(email: string): string {
  const token = generateUnsubToken(email);
  const base = process.env.NEXTAUTH_URL ?? "https://themusiciansindex.com";
  return `${base}/unsubscribe?email=${encodeURIComponent(email)}&token=${token}`;
}

const BASE_URL = process.env.NEXTAUTH_URL ?? "https://themusiciansindex.com";

/* ─── HTML helpers ─────────────────────────────────────────────────────────── */
function btn(label: string, href: string, color = "#06b6d4"): string {
  return `<table cellpadding="0" cellspacing="0" style="margin-top:20px;"><tr><td><a href="${href}" style="display:inline-block;padding:14px 32px;background:${color};color:#000000;font-weight:900;font-size:11px;text-decoration:none;border-radius:10px;letter-spacing:0.15em;text-transform:uppercase;box-shadow:0 0 20px ${color}66;">${label} &rarr;</a></td></tr></table>`;
}

function h1(text: string, color = "#ffffff"): string {
  return `<h1 style="margin:0 0 14px;font-size:24px;font-weight:900;color:${color};line-height:1.15;letter-spacing:-0.01em;">${text}</h1>`;
}

function p(text: string): string {
  return `<p style="margin:0 0 14px;font-size:13px;color:rgba(255,255,255,0.65);line-height:1.7;">${text}</p>`;
}

function badge(text: string, color: string): string {
  return `<span style="display:inline-block;padding:4px 10px;background:${color}20;color:${color};font-size:9px;font-weight:900;border-radius:6px;letter-spacing:0.2em;text-transform:uppercase;border:1px solid ${color}40;">${text}</span><br/><br/>`;
}

function labelChip(text: string, color: string): string {
  return `<div style="display:inline-block;font-size:7px;font-weight:900;letter-spacing:0.4em;color:${color};border:1px solid ${color}55;border-radius:4px;padding:4px 10px;text-transform:uppercase;margin-bottom:14px;">${text}</div><br/>`;
}

function statBlock(rows: Array<[string, string]>, borderColor = "#00FFFF"): string {
  return `<table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid ${borderColor}28;border-radius:12px;overflow:hidden;margin:16px 0;">
    ${rows.map(([label, value], i) => `<tr style="background:${i % 2 === 0 ? "rgba(255,255,255,0.02)" : "transparent"};">
      <td style="padding:10px 16px;font-size:10px;color:rgba(255,255,255,0.4);letter-spacing:0.1em;text-transform:uppercase;width:130px;">${label}</td>
      <td style="padding:10px 16px;font-size:13px;color:#ffffff;font-weight:700;">${value}</td>
    </tr>`).join("")}
  </table>`;
}

/* ─── Magazine-style base wrapper ─────────────────────────────────────────── */
function baseHtml(content: string, email: string, accentColor = "#06b6d4"): string {
  const year = new Date().getFullYear();
  const monthYear = new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" }).toUpperCase();
  const unsub = unsubUrl(email);

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>The Musician's Index</title>
</head>
<body style="margin:0;padding:0;background:#050510;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#050510;">
<tr><td align="center" style="padding:28px 16px;">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#0a0818;border-radius:16px;border:1px solid rgba(255,255,255,0.07);overflow:hidden;">

<!-- MASTHEAD -->
<tr><td style="background:linear-gradient(135deg,#04030f 0%,#0d0928 100%);padding:24px 32px 20px;">
<table width="100%" cellpadding="0" cellspacing="0"><tr>
<td valign="middle">
<p style="margin:0;font-size:7px;letter-spacing:0.55em;color:rgba(255,255,255,0.2);text-transform:uppercase;font-weight:700;">BerntoutGlobal LLC</p>
<p style="margin:5px 0 0;font-size:26px;font-weight:900;letter-spacing:0.05em;color:#ffffff;text-shadow:2px 2px 0 #FF2DAA,-2px -2px 0 #00FFFF;text-transform:uppercase;line-height:1;">THE MUSICIAN'S INDEX</p>
<p style="margin:6px 0 0;font-size:8px;letter-spacing:0.3em;color:${accentColor};text-transform:uppercase;font-weight:700;">DIGITAL EDITION &nbsp;&middot;&nbsp; ${monthYear}</p>
</td>
<td align="right" valign="middle">
<div style="width:48px;height:48px;border-radius:50%;background:${accentColor}18;border:1.5px solid ${accentColor}55;text-align:center;line-height:48px;font-size:22px;">🎤</div>
</td>
</tr></table>
</td></tr>

<!-- RAINBOW ACCENT STRIP -->
<tr><td style="padding:0;line-height:0;font-size:0;"><div style="height:3px;background:linear-gradient(90deg,#00FFFF,#FF2DAA,#FFD700,#AA2DFF,#00FFFF);"></div></td></tr>

<!-- CONTENT -->
<tr><td style="padding:32px;">${content}</td></tr>

<!-- BOTTOM DIVIDER -->
<tr><td style="padding:0 32px;line-height:0;font-size:0;"><div style="height:1px;background:linear-gradient(90deg,transparent,${accentColor}30,transparent);"></div></td></tr>

<!-- FOOTER -->
<tr><td style="padding:18px 32px 22px;background:rgba(0,0,0,0.4);">
<p style="margin:0;font-size:9px;color:rgba(255,255,255,0.18);line-height:1.8;">
&copy; ${year} BerntoutGlobal LLC &nbsp;&middot;&nbsp; The Musician's Index<br/>
<a href="https://themusiciansindex.com" style="color:${accentColor};text-decoration:none;">themusiciansindex.com</a>
&nbsp;&middot;&nbsp;
<a href="${unsub}" style="color:rgba(255,255,255,0.25);text-decoration:none;">Unsubscribe</a>
&nbsp;&middot;&nbsp;
<a href="${BASE_URL}/settings/notifications" style="color:rgba(255,255,255,0.25);text-decoration:none;">Manage Preferences</a>
</p>
</td></tr>

</table>
</td></tr>
</table>
</body>
</html>`;
}

/* ─── Email templates ─────────────────────────────────────────────────────── */
const TEMPLATES: Record<string, (data: Record<string, unknown>, email: string) => { subject: string; html: string }> = {

  welcome_artist: (d, email) => ({
    subject: "Welcome to The Musician's Index — Your Stage Is Ready 🎤",
    html: baseHtml(`
      ${labelChip("ARTIST ACCOUNT ACTIVATED", "#a855f7")}
      ${h1(`Welcome, ${d.name}! 🎤`)}
      ${p("Your artist account on The Musician's Index is live. You're part of the most competitive and creative live music platform on the internet.")}
      ${p("Here's what you can do right now:")}
      <ul style="color:rgba(255,255,255,0.6);font-size:12px;line-height:2.2;padding-left:18px;">
        <li>Go live in your own room — no waiting list</li>
        <li>Enter battles and cyphers to earn XP and credits</li>
        <li>Upload beats to the Beat Locker and earn 85%</li>
        <li>List your music as NFTs</li>
        <li>Book live shows and manage fans</li>
      </ul>
      ${btn("Enter Your Hub", `${BASE_URL}/artist/${String(d.slug ?? "profile")}`, "#a855f7")}
    `, email, "#a855f7"),
  }),

  welcome_fan: (d, email) => ({
    subject: "You're In — The Musician's Index is Live 🔥",
    html: baseHtml(`
      ${labelChip("FAN ACCOUNT ACTIVE", "#06b6d4")}
      ${h1(`Hey ${d.name}! You're officially in.`)}
      ${p("The Musician's Index is the live stage where real music happens — battles, cyphers, challenges, concerts, and more. Follow your favorite performers, tip live, and earn your own XP just by showing up.")}
      ${p("Every event is a moment. Every moment is a memory. Start collecting yours.")}
      ${btn("Explore Now", `${BASE_URL}/home/5`, "#06b6d4")}
    `, email, "#06b6d4"),
  }),

  welcome_venue: (d, email) => ({
    subject: "TMI Venue Partnership Confirmed 🏟️",
    html: baseHtml(`
      ${labelChip("VENUE PARTNER ACTIVATED", "#00FF88")}
      ${h1(`Welcome, ${d.venueName}! 🏟️`)}
      ${p("Your venue is now connected to The Musician's Index. You can list events, sell tickets with zero TMI platform fees, manage seating, and track real-time attendance.")}
      ${p("Standard payment processing fees may apply. You keep everything else.")}
      ${btn("Venue Dashboard", `${BASE_URL}/venues/${String(d.venueSlug ?? "dashboard")}/dashboard`, "#00FF88")}
    `, email, "#00FF88"),
  }),

  welcome_diamond: (d, email) => ({
    subject: "💎 Diamond VIP Activated — Welcome to the Inner Circle",
    html: baseHtml(`
      ${labelChip("DIAMOND VIP", "#38bdf8")}
      ${h1(`${d.name}, you're in the inner circle. 💎`)}
      ${p("Diamond membership is TMI's top tier. You now have access to every premium feature on the platform — no limits, no waiting lists.")}
      <table width="100%" cellpadding="0" cellspacing="0" style="background:rgba(56,189,248,0.08);border:1px solid rgba(56,189,248,0.3);border-radius:14px;padding:0;margin:16px 0;overflow:hidden;">
        <tr><td style="padding:16px 20px;">
          <p style="margin:0 0 12px;font-size:8px;font-weight:900;letter-spacing:0.3em;color:rgba(255,255,255,0.3);text-transform:uppercase;">YOUR DIAMOND BENEFITS</p>
          ${[
            ["🎤", "Unlimited live room hours"],
            ["⚔️", "Priority battle matchmaking"],
            ["💰", "Lowest platform fee — 5%"],
            ["🌟", "Diamond badge on all content"],
            ["📖", "TMI Magazine digital archive access"],
            ["🎯", "Early access to all events"],
          ].map(([icon, text]) => `<p style="margin:0 0 8px;font-size:12px;color:rgba(255,255,255,0.75);">${icon}&nbsp; ${text}</p>`).join("")}
        </td></tr>
      </table>
      ${btn("Enter Your Diamond Hub", `${BASE_URL}/profile`, "#38bdf8")}
    `, email, "#38bdf8"),
  }),

  welcome_admin: (d, email) => ({
    subject: "🔐 Admin Access Activated — TMI Control Panel",
    html: baseHtml(`
      ${labelChip("ADMIN", "#FF2DAA")}
      ${h1(`${d.name}, you're an admin. 🔐`)}
      ${p("You now have full access to the TMI control panel, revenue analytics, user management, and platform settings.")}
      <table width="100%" cellpadding="0" cellspacing="0" style="background:rgba(255,45,170,0.08);border:1px solid rgba(255,45,170,0.3);border-radius:14px;padding:0;margin:16px 0;overflow:hidden;">
        <tr><td style="padding:16px 20px;">
          <p style="margin:0 0 12px;font-size:8px;font-weight:900;letter-spacing:0.3em;color:rgba(255,255,255,0.3);text-transform:uppercase;">ADMIN TOOLS</p>
          ${[
            ["📊", "Revenue dashboard & payouts"],
            ["👥", "User management & roles"],
            ["📧", "Email campaign blasts"],
            ["⚙️", "Platform settings & config"],
            ["🤖", "Bot telemetry & health"],
            ["🔍", "Admin audit logs"],
          ].map(([icon, text]) => `<p style="margin:0 0 8px;font-size:12px;color:rgba(255,255,255,0.75);">${icon}&nbsp; ${text}</p>`).join("")}
        </td></tr>
      </table>
      ${btn("Go to Admin Panel", `${BASE_URL}/admin`, "#FF2DAA")}
    `, email, "#FF2DAA"),
  }),

  invite: (d, email) => ({
    subject: `${d.inviterName ?? "Someone you know"} invited you to The Musician's Index 🎤`,
    html: baseHtml(`
      ${labelChip("PERSONAL INVITE", "#FF2DAA")}
      ${h1("You've been invited to the stage. 🎤")}
      ${p(`<strong style="color:#fff;">${d.inviterName ?? "A friend"}</strong> personally invited you to The Musician's Index — the live platform where real music battles, cyphers, and concerts happen every day.`)}
      ${p("Artists earn XP, credits, and real money. Fans get front row seats. Everyone has a role.")}
      <table width="100%" cellpadding="0" cellspacing="0" style="background:rgba(255,45,170,0.08);border:1px solid rgba(255,45,170,0.25);border-radius:12px;margin:16px 0;overflow:hidden;">
        <tr><td style="padding:18px 20px;">
          <p style="margin:0;font-size:11px;font-weight:900;color:#FF2DAA;letter-spacing:0.12em;text-transform:uppercase;">YOUR INVITE CODE</p>
          <p style="margin:8px 0 0;font-size:24px;font-weight:900;color:#fff;letter-spacing:0.2em;font-family:monospace;">${d.inviteCode ?? "TMI-LIVE"}</p>
        </td></tr>
      </table>
      ${btn("Accept Invite", String(d.inviteLink ?? `${BASE_URL}/signup`), "#FF2DAA")}
      ${p('<span style="font-size:10px;color:rgba(255,255,255,0.25);">This invite expires in 7 days. New members only.</span>')}
    `, email, "#FF2DAA"),
  }),

  profile_reminder: (d, email) => ({
    subject: `${d.name}, your stage is still waiting 🎤`,
    html: baseHtml(`
      ${labelChip("WE MISS YOU", "#FFD700")}
      ${h1(`${d.name}, the crowd is asking about you.`)}
      ${p("It's been a while since you've been on TMI. While you were gone, the platform kept moving — new battles started, new artists went viral, new prizes were awarded.")}
      ${d.statXP ? `<table width="100%" cellpadding="0" cellspacing="0" style="background:rgba(255,215,0,0.07);border:1px solid rgba(255,215,0,0.22);border-radius:10px;overflow:hidden;margin:16px 0;">
        <tr><td style="padding:16px 20px;">
          <p style="margin:0;font-size:9px;letter-spacing:0.2em;color:rgba(255,255,255,0.4);text-transform:uppercase;">YOUR STANDING</p>
          <p style="margin:8px 0 0;font-size:28px;font-weight:900;color:#FFD700;">${d.statXP} XP</p>
          <p style="margin:4px 0 0;font-size:11px;color:rgba(255,255,255,0.5);">Still in ${d.statRank ?? "Top 1000"} &nbsp;·&nbsp; Don't let it slip</p>
        </td></tr>
      </table>` : ""}
      ${p("Log in today to claim your daily XP, check your earnings, and jump into a cypher.")}
      ${btn("Return to TMI", `${BASE_URL}/home/1`, "#FFD700")}
    `, email, "#FFD700"),
  }),

  sponsor_confirmation: (d, email) => ({
    subject: `🤝 TMI Sponsor Account Activated — ${d.sponsorName}`,
    html: baseHtml(`
      ${labelChip("SPONSOR CONFIRMED", "#FFD700")}
      ${h1(`Welcome, ${d.sponsorName}! Your sponsorship is live. 🤝`)}
      ${p("Your TMI sponsor account has been activated. You now have direct access to our performer network and an audience of dedicated music fans.")}
      ${statBlock([
        ["Package", String(d.packageName ?? "Standard Sponsor")],
        ["Monthly Budget", `$${d.monthlyBudget ?? "500"}`],
        ["Active Until", String(d.activeUntil ?? "Ongoing")],
        ["Rep Contact", String(d.repEmail ?? "sponsors@themusiciansindex.com")],
      ], "#FFD700")}
      ${btn("Open Sponsor Dashboard", `${BASE_URL}/sponsors/dashboard`, "#FFD700")}
      ${p('<span style="font-size:10px;color:rgba(255,255,255,0.25);">Questions? Reply to this email or reach your account rep directly.</span>')}
    `, email, "#FFD700"),
  }),

  verify_email: (d, email) => ({
    subject: "Verify your TMI email address",
    html: baseHtml(`
      ${h1("Verify Your Email")}
      ${p("Click the button below to verify your email address. This link expires in 24 hours.")}
      ${btn("Verify Email", `${BASE_URL}/auth/verify?token=${d.token}`)}
      ${p('<span style="font-size:11px;color:rgba(255,255,255,0.3);">If you didn\'t sign up, ignore this email.</span>')}
    `, email),
  }),

  password_reset: (d, email) => ({
    subject: "TMI Password Reset Request",
    html: baseHtml(`
      ${h1("Reset Your Password")}
      ${p("Someone (hopefully you) requested a password reset for this TMI account.")}
      ${p("This link expires in 20 minutes and can only be used once.")}
      ${btn("Reset Password", String(d.link ?? `${BASE_URL}/auth/reset-password/${d.token}`), "#ef4444")}
      ${p('<span style="font-size:11px;color:rgba(255,255,255,0.3);">If you didn\'t request this, your account is safe — ignore this email.</span>')}
    `, email),
  }),

  security_alert: (d, email) => ({
    subject: "⚠️ TMI Security Alert — New Login Detected",
    html: baseHtml(`
      ${badge("Security Alert", "#ef4444")}
      ${h1("New Login to Your Account")}
      ${p("A new sign-in was detected on your TMI account.")}
      ${statBlock([
        ["Location", String(d.location ?? "Unknown")],
        ["Time", String(d.time ?? new Date().toUTCString())],
        ["Device", String(d.device ?? "Unknown")],
      ], "#ef4444")}
      ${p("If this wasn't you, reset your password immediately.")}
      ${btn("Secure My Account", `${BASE_URL}/auth/reset`, "#ef4444")}
    `, email, "#ef4444"),
  }),

  new_login: (d, email) => ({
    subject: "New login to your TMI account",
    html: baseHtml(`
      ${badge("Login Notice", "#fbbf24")}
      ${h1("New Login Detected")}
      ${statBlock([
        ["Location", String(d.location ?? "Unknown")],
        ["Time", String(d.time ?? new Date().toUTCString())],
        ["Device", String(d.device ?? "Unknown")],
      ], "#fbbf24")}
      ${btn("Review Activity", `${BASE_URL}/settings/security`, "#fbbf24")}
    `, email, "#fbbf24"),
  }),

  battle_invite: (d, email) => ({
    subject: `⚔️ ${d.challenger} challenged you to a battle on TMI`,
    html: baseHtml(`
      ${badge("Battle Invite", "#ef4444")}
      ${h1(`${d.challenger} wants to battle you! ⚔️`)}
      ${statBlock([
        ["Genre", String(d.genre ?? "Open")],
        ["Format", String(d.format ?? "Standard")],
        ["Prize", String(d.prize ?? "Bragging rights")],
      ], "#ef4444")}
      ${p("Accept within 24 hours or the challenge expires.")}
      ${btn("Accept Battle", `${BASE_URL}/battles/invite/${d.inviteId}`, "#ef4444")}
    `, email, "#ef4444"),
  }),

  contest_win: (d, email) => ({
    subject: `🏆 You won the ${d.contestName} contest on TMI!`,
    html: baseHtml(`
      ${badge("Winner!", "#fbbf24")}
      ${h1(`Congratulations, ${d.name}! 🏆`)}
      ${p(`You placed ${d.placement} in the <strong style="color:#fff;">${d.contestName}</strong> contest.`)}
      ${p(`Your prize: <strong style="color:#fbbf24;">${d.prizeDescription}</strong>`)}
      ${p("Prizes are delivered within 3–5 business days. Payouts over $100 require Big Ace approval.")}
      ${btn("View Results", `${BASE_URL}/contests/${d.contestId}`, "#fbbf24")}
    `, email, "#fbbf24"),
  }),

  contest_loss: (d, email) => ({
    subject: `TMI Contest Update — ${d.contestName}`,
    html: baseHtml(`
      ${h1(`The results are in, ${d.name}.`)}
      ${p(`You competed in <strong style="color:#fff;">${d.contestName}</strong>. The competition was fierce — keep working and enter again.`)}
      ${p("Your XP from this contest has been added to your profile.")}
      ${btn("Enter Next Contest", `${BASE_URL}/battles`, "#00FFFF")}
    `, email),
  }),

  ticket_confirmation: (d, email) => ({
    subject: `🎟️ Your TMI Ticket — ${d.eventName}`,
    html: baseHtml(`
      ${badge("Ticket Confirmed", "#22c55e")}
      ${h1(String(d.eventName))}
      ${statBlock([
        ["Date", String(d.date)],
        ["Venue", String(d.venue)],
        ["Seat", String(d.seat)],
        ["Confirmation", String(d.confirmationCode)],
      ], "#22c55e")}
      ${p("Your ticket QR code is attached to this email. Present it at the door or show it on your phone.")}
      <table cellpadding="0" cellspacing="0" style="margin:0 0 16px;"><tr><td style="background:rgba(0,255,255,0.06);border:1px solid rgba(0,255,255,0.2);border-radius:8px;padding:10px 16px;font-size:11px;color:rgba(255,255,255,0.5);">Zero TMI platform fees &nbsp;&middot;&nbsp; Standard payment processing fees may apply</td></tr></table>
      ${btn("View Ticket", `${BASE_URL}/tickets/${d.ticketId}`, "#22c55e")}
    `, email, "#22c55e"),
  }),

  nft_receipt: (d, email) => ({
    subject: `◈ NFT Purchased — ${d.tokenName}`,
    html: baseHtml(`
      ${badge("NFT Confirmed", "#38bdf8")}
      ${h1(`You own ${d.tokenName} ◈`)}
      ${statBlock([
        ["Token ID", String(d.tokenId)],
        ["Creator", String(d.creatorName)],
        ["Edition", String(d.edition)],
        ["Paid", `$${d.priceUsd} (${d.priceCredits} credits)`],
      ], "#38bdf8")}
      ${btn("View in Collection", `${BASE_URL}/profile/nfts`, "#38bdf8")}
    `, email, "#38bdf8"),
  }),

  beat_receipt: (d, email) => ({
    subject: `🎵 Beat Purchased — "${d.beatTitle}"`,
    html: baseHtml(`
      ${h1(`"${d.beatTitle}" is yours 🎵`)}
      ${statBlock([
        ["Producer", String(d.producerName)],
        ["BPM", String(d.bpm)],
        ["Key", String(d.key)],
        ["License", String(d.license)],
        ["Paid", `$${d.priceUsd}`],
      ], "#a855f7")}
      ${p("Your beat file is ready for download from your Beat Library.")}
      ${btn("Download Beat", `${BASE_URL}/profile/beats/${d.beatId}`, "#a855f7")}
    `, email, "#a855f7"),
  }),

  tip_received: (d, email) => ({
    subject: `💰 ${d.fanName} tipped you $${d.amount}`,
    html: baseHtml(`
      ${h1("You received a tip! 💰")}
      ${p(`<strong style="color:#fbbf24;">${d.fanName}</strong> sent you <strong style="color:#22c55e;">$${d.amount}</strong> while you were live in <strong style="color:#fff;">${d.roomName}</strong>.`)}
      ${d.message ? p(`They said: <em style="color:rgba(255,255,255,0.5);">"${d.message}"</em>`) : ""}
      ${btn("View Earnings", `${BASE_URL}/artist/earnings`)}
    `, email, "#fbbf24"),
  }),

  new_follower: (d, email) => ({
    subject: `${d.followerName} is now following you on TMI`,
    html: baseHtml(`
      ${h1(`New follower! 👥`)}
      ${p(`<strong style="color:#fff;">${d.followerName}</strong> started following you on The Musician's Index.`)}
      ${btn("View Their Profile", `${BASE_URL}/profile/${d.followerSlug}`)}
    `, email),
  }),

  room_went_live: (d, email) => ({
    subject: `🔴 ${d.hostName} is live now on TMI`,
    html: baseHtml(`
      ${badge("LIVE NOW", "#ef4444")}
      ${h1(`${d.hostName} just went live 🔴`)}
      ${p(`<strong style="color:#fff;">${d.hostName}</strong> opened a live room: <em>${d.roomName}</em>. ${d.viewerCount ? `${d.viewerCount} people are already watching.` : ""}`)}
      ${btn("Join Live Room", `${BASE_URL}/live/rooms/${d.roomSlug}`, "#ef4444")}
    `, email, "#ef4444"),
  }),

  subscription_start: (d, email) => ({
    subject: `✅ TMI ${d.plan} Subscription Active`,
    html: baseHtml(`
      ${badge(String(d.plan), d.plan === "diamond" ? "#38bdf8" : d.plan === "gold" ? "#fbbf24" : "#94a3b8")}
      ${h1(`Your ${d.plan} plan is live! ✅`)}
      ${statBlock([
        ["Plan", String(d.plan)],
        ["Monthly Billing", `$${d.priceMonthly}`],
        ["Next Renewal", String(d.renewalDate)],
      ])}
      ${p("You now have access to all features included with your tier.")}
      ${btn("Explore Your Plan", `${BASE_URL}/settings/billing`)}
    `, email),
  }),

  subscription_renew: (d, email) => ({
    subject: `✅ TMI Subscription Renewed — ${d.plan}`,
    html: baseHtml(`
      ${h1(`Subscription renewed ✅`)}
      ${p(`Your <strong style="color:#fff;">${d.plan}</strong> plan has been renewed. Next billing: <strong style="color:#00FFFF;">${d.nextRenewalDate}</strong>.`)}
      ${btn("Manage Subscription", `${BASE_URL}/settings/billing`)}
    `, email),
  }),

  subscription_cancel: (d, email) => ({
    subject: "TMI Subscription Cancelled",
    html: baseHtml(`
      ${h1("Subscription Cancelled")}
      ${p(`Your TMI subscription has been cancelled. You'll retain access until <strong style="color:#fff;">${d.accessUntil}</strong>.`)}
      ${p("We're sorry to see you go. Come back anytime — your account stays active.")}
      ${btn("Reactivate", `${BASE_URL}/settings/billing`)}
    `, email),
  }),

  subscription_upgrade: (d, email) => ({
    subject: `🚀 Upgraded to TMI ${d.newPlan}`,
    html: baseHtml(`
      ${h1(`You upgraded to ${d.newPlan} 🚀`)}
      ${p(`Your account has been upgraded from <strong style="color:#fff;">${d.oldPlan}</strong> to <strong style="color:#00FFFF;">${d.newPlan}</strong>. All new features are active immediately.`)}
      ${btn("See What's New", `${BASE_URL}/settings/billing`)}
    `, email, "#00FFFF"),
  }),

  weekly_digest: (d, email) => ({
    subject: `📊 Your TMI Weekly — ${d.weekEnding}`,
    html: baseHtml(`
      ${labelChip("WEEKLY DIGEST", "#00FFFF")}
      ${h1("Your Week on TMI")}
      <table width="100%" cellpadding="4" cellspacing="0" style="margin-bottom:16px;">
        ${(d.stats as Array<{ label: string; value: string; color: string }>).map((s) => `
          <tr><td style="background:rgba(255,255,255,0.03);border-radius:8px;padding:14px 16px;text-align:center;border:1px solid rgba(255,255,255,0.06);">
            <p style="margin:0;font-size:22px;font-weight:900;color:${s.color};">${s.value}</p>
            <p style="margin:4px 0 0;font-size:8px;color:rgba(255,255,255,0.3);text-transform:uppercase;letter-spacing:0.15em;">${s.label}</p>
          </td></tr>
        `).join("")}
      </table>
      ${btn("Full Analytics", `${BASE_URL}/analytics`)}
    `, email),
  }),

  magazine_drop: (d, email) => ({
    subject: `📖 TMI Magazine — ${d.issueName} Is Live`,
    html: baseHtml(`
      ${badge("New Issue", "#ec4899")}
      ${h1(String(d.issueName))}
      ${p(`This month: ${d.teaser}`)}
      ${p(`${d.articleCount} articles &nbsp;&middot;&nbsp; ${d.featuredArtist} on the cover`)}
      ${btn("Read Now", `${BASE_URL}/magazine`, "#ec4899")}
    `, email, "#ec4899"),
  }),

  payout_queued: (d, email) => ({
    subject: "💸 Payout Queued — Awaiting Big Ace Approval",
    html: baseHtml(`
      ${h1("Payout Request Queued 💸")}
      ${statBlock([
        ["Amount", `$${d.amount}`],
        ["Reason", String(d.reason)],
        ["Status", "Awaiting approval"],
      ], "#22c55e")}
      ${p("Per platform policy, all cash payouts over $10 require approval from Big Ace before processing. Typical approval time: 24–72 hours.")}
    `, email, "#22c55e"),
  }),

  payout_approved: (d, email) => ({
    subject: "✅ Payout Approved — Sending Now",
    html: baseHtml(`
      ${badge("Payout Approved", "#22c55e")}
      ${h1("Your payout is on the way! ✅")}
      ${statBlock([
        ["Amount", `$${d.amount}`],
        ["Method", String(d.method ?? "Bank transfer")],
        ["ETA", String(d.eta ?? "3–5 business days")],
      ], "#22c55e")}
      ${btn("View Earnings", `${BASE_URL}/artist/earnings`, "#22c55e")}
    `, email, "#22c55e"),
  }),
};

/* ─── Email category classification ─────────────────────────────────────── */
const TRANSACTIONAL_TYPES = new Set<EmailType>([
  "verify_email", "password_reset", "security_alert", "new_login",
  "ticket_confirmation", "nft_receipt", "beat_receipt", "tip_received",
  "subscription_start", "subscription_renew", "subscription_cancel", "subscription_upgrade",
  "payout_queued", "payout_approved", "contest_win", "contest_loss",
  "battle_invite", "welcome_diamond", "welcome_admin", "sponsor_confirmation",
]);

function emailCategoryFor(type: EmailType): "transactional" | "marketing" | "newsletter" {
  if (TRANSACTIONAL_TYPES.has(type)) return "transactional";
  if (type === "weekly_digest" || type === "magazine_drop") return "newsletter";
  return "marketing";
}

/* ─── Email sender ─────────────────────────────────────────────────────────── */
export async function sendEmail({ to, type, data }: EmailPayload): Promise<SendResult> {
  const templateFn = TEMPLATES[type];
  if (!templateFn) return { success: false, error: `Unknown email type: ${type}` };

  if (isDisposableEmail(to)) {
    return { success: false, error: "Disposable email address blocked" };
  }

  const category = emailCategoryFor(type);

  if (category !== "transactional" && isUnsubscribed(to, category)) {
    return { success: false, error: `Recipient unsubscribed from ${category}` };
  }

  const rateCheck = checkEmailRateLimit(to);
  if (!rateCheck.allowed) {
    return { success: false, error: `Rate limited: ${rateCheck.reason}. Retry in ${Math.ceil((rateCheck.retryAfterMs ?? 60000) / 1000)}s` };
  }

  const { subject, html } = templateFn(data, to);
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return { success: false, error: "RESEND_API_KEY not configured" };

  try {
    const resp = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: process.env.EMAIL_FROM ?? "support@themusiciansindex.com",
        to,
        subject,
        html,
      }),
    });
    const result = await resp.json() as { id?: string; message?: string };
    if (!resp.ok) return { success: false, error: result.message ?? "Resend error" };
    return { success: true, messageId: result.id };
  } catch (err) {
    return { success: false, error: String(err) };
  }
}

/* ─── Rate limiter (in-memory — move to Redis in production) ──────────────── */
const resetAttempts = new Map<string, { count: number; windowStart: number }>();

export function checkPasswordResetRateLimit(email: string): boolean {
  const now = Date.now();
  const record = resetAttempts.get(email);
  const windowMs = 60 * 60 * 1000;

  if (!record || now - record.windowStart > windowMs) {
    resetAttempts.set(email, { count: 1, windowStart: now });
    return true;
  }
  if (record.count >= 5) return false;
  record.count++;
  return true;
}
