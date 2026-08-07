/**
 * Status reports from the Revenue Businessman (+ team) for Observatory
 * activity + voice panels. Append-only; Rule 20 honest empty when idle.
 */

import { botReportToAdmin } from "@/lib/bots/permanentBotOperationsEngine";
import { checkStripeHealth, type StripeHealthReport } from "@/lib/commerce/StripeHealthDuty";

export type BusinessmanReport = {
  id: string;
  at: number;
  botId: string;
  botLabel: string;
  headline: string;
  body: string;
  voiceText: string;
  kind: "status" | "stripe" | "deal" | "checkpoint" | "delegate";
  meta?: Record<string, string | number | boolean>;
};

const REPORTS: BusinessmanReport[] = [];
const MAX = 80;
let counter = 0;

export const REVENUE_TEAM_BOT_IDS = [
  "revenue-business-bot-001",
  "ad-filler-bot-001",
  "sponsor-prospect-bot-001",
  "payout-watcher-bot-001",
  "stripe-health-bot-001",
  "opportunity-scout-bot-001",
] as const;

export type RevenueTeamBotId = (typeof REVENUE_TEAM_BOT_IDS)[number];

export function postBusinessmanReport(input: {
  botId?: string;
  botLabel?: string;
  headline: string;
  body: string;
  voiceText?: string;
  kind?: BusinessmanReport["kind"];
  meta?: BusinessmanReport["meta"];
  notifyAdmin?: boolean;
}): BusinessmanReport {
  const botId = input.botId ?? "revenue-business-bot-001";
  const botLabel = input.botLabel ?? "[BOT] RevenueBusiness";
  const report: BusinessmanReport = {
    id: `RBR-${Date.now()}-${String(++counter).padStart(4, "0")}`,
    at: Date.now(),
    botId,
    botLabel,
    headline: input.headline,
    body: input.body,
    voiceText:
      input.voiceText?.trim() ||
      `${input.headline}. ${input.body}`.slice(0, 500) ||
      "No revenue business activity to report.",
    kind: input.kind ?? "status",
    meta: input.meta,
  };
  REPORTS.unshift(report);
  if (REPORTS.length > MAX) REPORTS.length = MAX;

  if (input.notifyAdmin !== false) {
    botReportToAdmin(botId, `${report.headline} — ${report.body}`.slice(0, 400), [
      "admin",
      "big-ace",
      "mc",
    ]);
  }
  return report;
}

export function getBusinessmanReports(limit = 20, botId?: string): BusinessmanReport[] {
  const list = botId ? REPORTS.filter((r) => r.botId === botId) : REPORTS;
  return list.slice(0, limit);
}

export function getLatestBusinessmanReport(botId?: string): BusinessmanReport | null {
  return getBusinessmanReports(1, botId)[0] ?? null;
}

export function buildVoiceReadout(botId?: string): string {
  const latest = getLatestBusinessmanReport(botId);
  if (!latest) return "No revenue businessman report yet. Idle — nothing to say.";
  return latest.voiceText;
}

export function buildTeamActivityLines(botId: string): string[] {
  const mine = getBusinessmanReports(6, botId);
  if (mine.length === 0) {
    return [
      "Revenue team: no status reports yet (honest empty).",
      "Awaiting OBSERVE tick or Stripe health check.",
    ];
  }
  return mine.map((r) => {
    const age = Date.now() - r.at;
    const ago =
      age < 60_000 ? "just now" : age < 3_600_000 ? `${Math.floor(age / 60_000)}m ago` : `${Math.floor(age / 3_600_000)}h ago`;
    return `${ago}: ${r.headline} — ${r.body.slice(0, 120)}`;
  });
}

export function reportStripeHealth(stripe?: StripeHealthReport): BusinessmanReport {
  const health = stripe ?? checkStripeHealth();
  return postBusinessmanReport({
    botId: "stripe-health-bot-001",
    botLabel: "[BOT] StripeHealth",
    kind: "stripe",
    headline: `Stripe ${health.status}`,
    body: health.summaryLines.join(" · "),
    voiceText: health.voiceText,
    meta: {
      status: health.status,
      mode: health.stripeMode,
      repairs: health.repairRecommendations.length,
    },
  });
}

export function reportObserveSummary(input: {
  phase: string;
  openDeals: number;
  closedWon: number;
  prospects: number;
  checkpointPass: number;
  checkpointFail: number;
  ticksObserved: number;
  stripe: StripeHealthReport;
}): BusinessmanReport {
  reportStripeHealth(input.stripe);

  const body = [
    `Reward phase ${input.phase}`,
    `Deals open ${input.openDeals} / closed-won ${input.closedWon}`,
    `Prospects ${input.prospects}`,
    `Checkpoints PASS ${input.checkpointPass} / non-pass ${input.checkpointFail}`,
    `Stripe ${input.stripe.status}`,
    `Ticks ${input.ticksObserved}`,
  ].join(" · ");

  // Team delegation notes (same safe protocols)
  postBusinessmanReport({
    botId: "ad-filler-bot-001",
    botLabel: "[BOT] AdFiller",
    kind: "delegate",
    headline: "Ad fill scan",
    body: "Scanning empty zones for Rule 12 Advertise CTA fills.",
    voiceText: "Ad filler bot scanning empty ad zones.",
    notifyAdmin: false,
  });
  postBusinessmanReport({
    botId: "payout-watcher-bot-001",
    botLabel: "[BOT] PayoutWatcher",
    kind: "delegate",
    headline: "Payout health watch",
    body: "Monitoring Instant Payout queue and Connect blockers.",
    voiceText: "Payout watcher checking cleared funds and Connect status.",
    notifyAdmin: false,
  });
  postBusinessmanReport({
    botId: "opportunity-scout-bot-001",
    botLabel: "[BOT] OpportunityScout",
    kind: "delegate",
    headline: "Opportunity scout",
    body: "Surfacing points/season-pass/beat interest prompts — never buy rank.",
    voiceText: "Opportunity scout reviewing high-margin digital surfaces.",
    notifyAdmin: false,
  });

  return postBusinessmanReport({
    botId: "revenue-business-bot-001",
    botLabel: "[BOT] RevenueBusiness",
    kind: "status",
    headline: "Businessman observe complete",
    body,
    voiceText: `Revenue businessman reporting. ${body}. ${
      input.checkpointFail > 0 ? "Some checkpoints need human attention." : "Checkpoints look clear."
    }`,
    meta: { openDeals: input.openDeals, prospects: input.prospects },
  });
}

export function reportDealTransition(input: {
  dealId: string;
  title: string;
  state: string;
  zone: string;
  valueMin: number;
  valueMax: number;
  note: string;
}): BusinessmanReport {
  return postBusinessmanReport({
    botId: "sponsor-prospect-bot-001",
    botLabel: "[BOT] SponsorProspect",
    kind: "deal",
    headline: `Deal ${input.state}: ${input.title}`,
    body: `${input.note} · zone ${input.zone} · $${input.valueMin}–$${input.valueMax}`,
    voiceText: `Deal update. ${input.title} is now ${input.state.replace(/_/g, " ")}. ${input.note}`,
    meta: { dealId: input.dealId, state: input.state },
  });
}
