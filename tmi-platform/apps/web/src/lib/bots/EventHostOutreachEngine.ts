/**
 * EventHostOutreachEngine
 * Targeted outreach lead and CRM helpers for event host acquisition.
 */

import { buildFollowUpScript, type TicketSellerTargetType } from "./BotOutreachMessageEngine";

export type TicketSellerLeadState =
  | "discovered"
  | "contacted"
  | "interested"
  | "signup-started"
  | "onboarded"
  | "first-event-created"
  | "ticket-sales-active"
  | "follow-up-needed";

export type EventSellerLead = {
  leadId: string;
  orgName: string;
  targetType: TicketSellerTargetType;
  city?: string;
  region?: string;
  website?: string;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  state: TicketSellerLeadState;
  source: "bot-discovery" | "referral" | "import";
  assignedBotId?: string;
  createdAtMs: number;
  updatedAtMs: number;
};

export type OutreachTask = {
  taskId: string;
  leadId: string;
  kind: "first-contact" | "follow-up" | "demo" | "onboarding-help";
  dueAtMs: number;
  status: "open" | "done";
  scriptLines: string[];
};

const leads: EventSellerLead[] = [];
const tasks: OutreachTask[] = [];
let leadCounter = 0;
let taskCounter = 0;

export function createEventSellerLead(input: {
  orgName: string;
  targetType: TicketSellerTargetType;
  source?: "bot-discovery" | "referral" | "import";
  city?: string;
  region?: string;
  website?: string;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  assignedBotId?: string;
}): EventSellerLead {
  const now = Date.now();
  const lead: EventSellerLead = {
    leadId: `seller-lead-${++leadCounter}`,
    orgName: input.orgName,
    targetType: input.targetType,
    city: input.city,
    region: input.region,
    website: input.website,
    contactName: input.contactName,
    contactEmail: input.contactEmail,
    contactPhone: input.contactPhone,
    state: "discovered",
    source: input.source ?? "bot-discovery",
    assignedBotId: input.assignedBotId,
    createdAtMs: now,
    updatedAtMs: now,
  };

  leads.unshift(lead);
  return lead;
}

export function updateLeadState(leadId: string, state: TicketSellerLeadState): EventSellerLead {
  const lead = leads.find((item) => item.leadId === leadId);
  if (!lead) throw new Error(`Lead ${leadId} not found`);
  lead.state = state;
  lead.updatedAtMs = Date.now();
  return lead;
}

export function createOutreachTask(input: {
  leadId: string;
  kind: "first-contact" | "follow-up" | "demo" | "onboarding-help";
  dueAtMs: number;
}): OutreachTask {
  const lead = leads.find((item) => item.leadId === input.leadId);
  if (!lead) throw new Error(`Lead ${input.leadId} not found`);

  const task: OutreachTask = {
    taskId: `outreach-task-${++taskCounter}`,
    leadId: input.leadId,
    kind: input.kind,
    dueAtMs: input.dueAtMs,
    status: "open",
    scriptLines: buildFollowUpScript(lead.targetType),
  };

  tasks.unshift(task);
  return task;
}

export function completeOutreachTask(taskId: string): OutreachTask {
  const task = tasks.find((item) => item.taskId === taskId);
  if (!task) throw new Error(`Task ${taskId} not found`);
  task.status = "done";
  return task;
}

export function listEventSellerLeads(filters?: {
  targetType?: TicketSellerTargetType;
  state?: TicketSellerLeadState;
}): EventSellerLead[] {
  return leads.filter((lead) => {
    if (filters?.targetType && lead.targetType !== filters.targetType) return false;
    if (filters?.state && lead.state !== filters.state) return false;
    return true;
  });
}

export function listOutreachTasks(leadId?: string): OutreachTask[] {
  if (!leadId) return [...tasks];
  return tasks.filter((task) => task.leadId === leadId);
}
