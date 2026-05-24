// lib/mail/MailTriggerEngine.ts — Event-based trigger dispatch

import { sendMail } from "./TMIMailEngine";
import { renderTemplate, TemplateId, TemplateVars } from "./MailTemplateEngine";
import { canReceive, getPreferences, MailCategory } from "./MailPreferenceEngine";
import { checkRateLimit, checkDedup, recordSent } from "./MailRateLimiter";

export type MailEvent =
  | "USER_REGISTERED"
  | "DIAMOND_UPGRADED"
  | "CHALLENGE_INVITED"
  | "LIVE_ROOM_STARTED"
  | "TIP_RECEIVED"
  | "PAYOUT_SCHEDULED"
  | "PAYOUT_SENT"
  | "PAYOUT_FAILED"
  | "SUPPORT_TICKET_OPENED"
  | "SUPPORT_TICKET_RESOLVED"
  | "WEEKLY_RECAP"
  | "RE_ENGAGEMENT";

interface TriggerContext {
  userId: string;
  email: string;
  vars: TemplateVars;
  dedupKey?: string;
}

interface TriggerResult {
  event: MailEvent;
  userId: string;
  sent: boolean;
  reason?: string;
  messageId?: string;
}

// Map event → (templateId, category)
const EVENT_MAP: Record<MailEvent, { template: TemplateId; category: MailCategory }> = {
  USER_REGISTERED:       { template: "welcome",          category: "system" },
  DIAMOND_UPGRADED:      { template: "diamond_upgrade",  category: "system" },
  CHALLENGE_INVITED:     { template: "challenge_invite", category: "engagement" },
  LIVE_ROOM_STARTED:     { template: "live_room_alert",  category: "engagement" },
  TIP_RECEIVED:          { template: "tip_received",     category: "revenue" },
  PAYOUT_SCHEDULED:      { template: "payout_scheduled", category: "revenue" },
  PAYOUT_SENT:           { template: "payout_sent",      category: "revenue" },
  PAYOUT_FAILED:         { template: "payout_sent",      category: "revenue" }, // reuses template with different vars
  SUPPORT_TICKET_OPENED: { template: "support_ticket",   category: "system" },
  SUPPORT_TICKET_RESOLVED: { template: "support_ticket", category: "system" },
  WEEKLY_RECAP:          { template: "weekly_recap",     category: "growth" },
  RE_ENGAGEMENT:         { template: "re_engagement",    category: "growth" },
};

const dispatchLog: Array<TriggerResult & { firedAt: number }> = [];

export async function trigger(event: MailEvent, ctx: TriggerContext): Promise<TriggerResult> {
  const mapping = EVENT_MAP[event];
  const { category } = mapping;
  const result: TriggerResult = { event, userId: ctx.userId, sent: false };

  // Preference check
  if (!canReceive(ctx.userId, category)) {
    result.reason = `User opted out of ${category} emails`;
    dispatchLog.push({ ...result, firedAt: Date.now() });
    return result;
  }

  // Rate limit check
  const rateCheck = checkRateLimit(ctx.userId, category);
  if (!rateCheck.allowed) {
    result.reason = rateCheck.reason;
    dispatchLog.push({ ...result, firedAt: Date.now() });
    return result;
  }

  // Dedup check
  if (ctx.dedupKey) {
    const dedupCheck = checkDedup(ctx.dedupKey);
    if (!dedupCheck.allowed) {
      result.reason = "Duplicate suppressed (30min window)";
      dispatchLog.push({ ...result, firedAt: Date.now() });
      return result;
    }
  }

  // Render and send
  const rendered = renderTemplate(mapping.template, ctx.vars);
  const prefs = getPreferences(ctx.userId, ctx.email);
  const mailResult = await sendMail({
    to: prefs.email || ctx.email,
    subject: rendered.subject,
    html: rendered.html,
    text: rendered.text,
  });

  if (mailResult.success) {
    recordSent(ctx.userId, category, ctx.dedupKey);
    result.sent = true;
    result.messageId = mailResult.messageId;
  } else {
    result.reason = mailResult.error ?? "Send failed";
  }

  dispatchLog.push({ ...result, firedAt: Date.now() });
  return result;
}

export function getDispatchLog(limit = 100): typeof dispatchLog {
  return dispatchLog.slice(-limit);
}

export function getDispatchStats(): { total: number; sent: number; suppressed: number; failed: number } {
  const total = dispatchLog.length;
  const sent = dispatchLog.filter(e => e.sent).length;
  const suppressed = dispatchLog.filter(e => !e.sent && e.reason?.includes("opted") || e.reason?.includes("Duplicate") || e.reason?.includes("Rate")).length;
  const failed = total - sent - suppressed;
  return { total, sent, suppressed, failed };
}
