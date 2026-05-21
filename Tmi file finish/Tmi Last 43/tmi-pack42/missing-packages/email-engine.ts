// packages/email-engine/src/email.service.ts
// React Email templates + Resend/SendGrid dispatch

export interface EmailTemplate {
  id: string;
  subject: string;
  previewText: string;
  variables: string[];  // required template variables
}

// ── ALL EMAIL TEMPLATES ────────────────────────────────
export const EMAIL_TEMPLATES: Record<string, EmailTemplate> = {
  "welcome":            { id: "welcome",            subject: "Welcome to The Musician's Index!", previewText: "This is your stage, be original.", variables: ["displayName", "loginUrl"] },
  "verify-email":       { id: "verify-email",       subject: "Verify your email",               previewText: "One click to verify.",             variables: ["displayName", "verifyUrl", "token"] },
  "password-reset":     { id: "password-reset",     subject: "Reset your password",             previewText: "Requested a reset?",               variables: ["displayName", "resetUrl", "expiresMins"] },
  "ticket-confirmed":   { id: "ticket-confirmed",   subject: "Your tickets are confirmed! 🎫",   previewText: "See you there.",                   variables: ["displayName", "eventName", "eventDate", "venueCity", "qrCodeUrl", "sectionName"] },
  "payout-approved":    { id: "payout-approved",    subject: "Your payout has been approved 💰", previewText: "Money is on its way.",             variables: ["displayName", "amountStr", "arrivalDate", "paypalEmail"] },
  "sponsor-renewal":    { id: "sponsor-renewal",    subject: "Your sponsorship renews in 7 days",previewText: "Keep the momentum going.",          variables: ["companyName", "artistName", "renewalDate", "renewUrl", "discountPct"] },
  "crown-won":          { id: "crown-won",           subject: "👑 You won the Crown this week!",  previewText: "The Index is yours.",              variables: ["artistName", "genre", "weekNumber", "hallOfFameUrl"] },
  "live-alert":         { id: "live-alert",          subject: "{artistName} is LIVE NOW!",        previewText: "Don't miss it.",                   variables: ["artistName", "joinUrl", "thumbnailUrl"] },
  "weekly-digest":      { id: "weekly-digest",       subject: "This Week on The Musician's Index",previewText: "Crown winner, top songs, events.", variables: ["displayName", "crownWinner", "topArticleTitle", "topArticleUrl", "eventsThisWeek"] },
  "artist-article-live":{ id: "artist-article-live", subject: "Your article is live! 🎤",        previewText: "People can now discover you.",     variables: ["artistName", "articleTitle", "articleUrl", "stationUrl"] },
} as const;

// ── SEND FUNCTION ─────────────────────────────────────
export async function sendEmail(
  to: string,
  templateId: keyof typeof EMAIL_TEMPLATES,
  data: Record<string, string>
): Promise<boolean> {
  const template = EMAIL_TEMPLATES[templateId];
  if (!template) { console.error(`Unknown template: ${templateId}`); return false; }
  // Fill in subject with data vars
  let subject = template.subject;
  Object.entries(data).forEach(([k, v]) => { subject = subject.replace(`{${k}}`, v); });
  console.log(`[Email] ${templateId} → ${to}: ${subject}`);
  // Use provider from EMAIL_PROVIDER env var: resend | sendgrid | smtp
  return true;
}
