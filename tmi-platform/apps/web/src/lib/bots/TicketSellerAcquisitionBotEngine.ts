/**
 * TicketSellerAcquisitionBotEngine
 * Master orchestration engine for ticket seller acquisition bots.
 * Bots do not spam; they produce lead lists, outreach scripts, follow-up tasks, and CRM records.
 */

import { buildOutreachMessagePack, type TicketSellerTargetType } from "./BotOutreachMessageEngine";
import {
  createEventSellerLead,
  createOutreachTask,
  listEventSellerLeads,
  listOutreachTasks,
  updateLeadState,
  type EventSellerLead,
  type TicketSellerLeadState,
} from "./EventHostOutreachEngine";

export type TicketSellerAcquisitionBot = {
  botId: string;
  botName: string;
  territory: string;
  active: boolean;
  targets: TicketSellerTargetType[];
};

export type TicketSellerLeadRouteSet = {
  eventHostSignupRoute: string;
  venueSignupRoute: string;
  promoterSignupRoute: string;
  ticketCreationRoute: string;
  eventPromotionRoute: string;
  supportContactRoute: string;
};

const bots: TicketSellerAcquisitionBot[] = [];
let botCounter = 0;

const DEFAULT_ROUTES: TicketSellerLeadRouteSet = {
  eventHostSignupRoute: "/event-hosts/signup",
  venueSignupRoute: "/venues/signup",
  promoterSignupRoute: "/promoters/signup",
  ticketCreationRoute: "/events/new",
  eventPromotionRoute: "/events/promote",
  supportContactRoute: "/events/support/contact",
};

export function registerTicketSellerBot(input: {
  botName: string;
  territory: string;
  targets: TicketSellerTargetType[];
}): TicketSellerAcquisitionBot {
  const bot: TicketSellerAcquisitionBot = {
    botId: `ticket-seller-bot-${++botCounter}`,
    botName: input.botName,
    territory: input.territory,
    active: true,
    targets: input.targets,
  };
  bots.unshift(bot);
  return bot;
}

export function listTicketSellerBots(): TicketSellerAcquisitionBot[] {
  return [...bots];
}

export function generateLeadFromBot(input: {
  botId: string;
  orgName: string;
  targetType: TicketSellerTargetType;
  city?: string;
  region?: string;
  website?: string;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
}): EventSellerLead {
  const bot = bots.find((item) => item.botId === input.botId);
  if (!bot) throw new Error(`Bot ${input.botId} not found`);
  if (!bot.active) throw new Error(`Bot ${input.botId} is not active`);

  const lead = createEventSellerLead({
    orgName: input.orgName,
    targetType: input.targetType,
    city: input.city,
    region: input.region,
    website: input.website,
    contactName: input.contactName,
    contactEmail: input.contactEmail,
    contactPhone: input.contactPhone,
    assignedBotId: input.botId,
  });

  createOutreachTask({
    leadId: lead.leadId,
    kind: "first-contact",
    dueAtMs: Date.now() + 60 * 60 * 1000,
  });

  return lead;
}

export function buildLeadOutreachBundle(leadId: string): {
  lead: EventSellerLead;
  messages: string[];
  routes: TicketSellerLeadRouteSet;
} {
  const lead = listEventSellerLeads().find((item) => item.leadId === leadId);
  if (!lead) throw new Error(`Lead ${leadId} not found`);

  const pack = buildOutreachMessagePack(lead.targetType);
  const messages = [
    pack.shortIntro,
    pack.primaryPitch,
    ...pack.valueBullets,
    pack.callToAction,
  ];

  return {
    lead,
    messages,
    routes: DEFAULT_ROUTES,
  };
}

export function setLeadState(leadId: string, state: TicketSellerLeadState): EventSellerLead {
  return updateLeadState(leadId, state);
}

export function queueFollowUpTask(leadId: string): void {
  createOutreachTask({
    leadId,
    kind: "follow-up",
    dueAtMs: Date.now() + 24 * 60 * 60 * 1000,
  });
}

export function getAcquisitionCRMState(): {
  leadsByState: Record<TicketSellerLeadState, number>;
  openTasks: number;
} {
  const states: TicketSellerLeadState[] = [
    "discovered",
    "contacted",
    "interested",
    "signup-started",
    "onboarded",
    "first-event-created",
    "ticket-sales-active",
    "follow-up-needed",
  ];

  const leads = listEventSellerLeads();
  const tasks = listOutreachTasks();

  const leadsByState = states.reduce((acc, state) => {
    acc[state] = leads.filter((lead) => lead.state === state).length;
    return acc;
  }, {} as Record<TicketSellerLeadState, number>);

  return {
    leadsByState,
    openTasks: tasks.filter((task) => task.status === "open").length,
  };
}
