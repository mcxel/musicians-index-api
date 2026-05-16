export type BotDepartment =
  | "visual"
  | "motion"
  | "tickets"
  | "venues"
  | "articles"
  | "profiles"
  | "events"
  | "sponsors"
  | "ads"
  | "analytics"
  | "support"
  | "diagnostics";

export type ChainRole = "bot" | "supervisor" | "department-lead" | "mc" | "big-ace";

export type ChainNode = {
  role: ChainRole;
  id: string;
  label: string;
};

export type BotWorkforceProfile = {
  botId: string;
  department: BotDepartment;
  supervisorId: string;
  departmentLeadId: string;
  assignedRoute: string;
  assignedEngine: string;
  riskLevel: "low" | "medium" | "high";
  active: boolean;
  updatedAt: number;
};

export type DepartmentSummary = {
  department: BotDepartment;
  totalBots: number;
  failingBots: number;
  completedBots: number;
  missedGoals: number;
  needsReassignment: number;
};

const departmentLeads: Record<BotDepartment, { leadId: string; leadLabel: string }> = {
  visual: { leadId: "lead-visual", leadLabel: "Visual Department Lead" },
  motion: { leadId: "lead-motion", leadLabel: "Motion Department Lead" },
  tickets: { leadId: "lead-tickets", leadLabel: "Ticket Department Lead" },
  venues: { leadId: "lead-venues", leadLabel: "Venue Department Lead" },
  articles: { leadId: "lead-articles", leadLabel: "Article Department Lead" },
  profiles: { leadId: "lead-profiles", leadLabel: "Profile Department Lead" },
  events: { leadId: "lead-events", leadLabel: "Event Department Lead" },
  sponsors: { leadId: "lead-sponsors", leadLabel: "Sponsor Department Lead" },
  ads: { leadId: "lead-ads", leadLabel: "Ads Department Lead" },
  analytics: { leadId: "lead-analytics", leadLabel: "Analytics Department Lead" },
  support: { leadId: "lead-support", leadLabel: "Support Department Lead" },
  diagnostics: { leadId: "lead-diagnostics", leadLabel: "Diagnostics Department Lead" },
};

const workforceMap = new Map<string, BotWorkforceProfile>();

function defaultRouteForDepartment(department: BotDepartment): string {
  switch (department) {
    case "visual":
      return "/admin/visual-command";
    case "motion":
      return "/admin/motion";
    case "tickets":
      return "/admin/tickets";
    case "venues":
      return "/admin/venues";
    case "articles":
      return "/admin/articles";
    case "profiles":
      return "/admin/profile-multi-view";
    case "events":
      return "/admin/events";
    case "sponsors":
      return "/admin/sponsors";
    case "ads":
      return "/admin/advertisers";
    case "analytics":
      return "/admin/analytics";
    case "support":
      return "/admin/support";
    case "diagnostics":
      return "/admin/diagnostics";
  }
}

function defaultEngineForDepartment(department: BotDepartment): string {
  switch (department) {
    case "visual":
      return "AiVisualQueueEngine";
    case "motion":
      return "MotionQueueEngine";
    case "tickets":
      return "TicketEngine";
    case "venues":
      return "VenueSeatRenderer";
    case "articles":
      return "ArticleGenerationEngine";
    case "profiles":
      return "ProfileComposerEngine";
    case "events":
      return "EventLifecycleEngine";
    case "sponsors":
      return "SponsorCampaignEngine";
    case "ads":
      return "AdPlacementEngine";
    case "analytics":
      return "StatsMonitorEngine";
    case "support":
      return "SupportTriageEngine";
    case "diagnostics":
      return "DiagnosticsTraceEngine";
  }
}

function inferDepartmentFromBotId(botId: string): BotDepartment {
  const key = botId.toLowerCase();
  if (key.includes("motion")) return "motion";
  if (key.includes("ticket")) return "tickets";
  if (key.includes("venue")) return "venues";
  if (key.includes("article")) return "articles";
  if (key.includes("profile")) return "profiles";
  if (key.includes("event")) return "events";
  if (key.includes("sponsor")) return "sponsors";
  if (key.includes("ad")) return "ads";
  if (key.includes("analytic")) return "analytics";
  if (key.includes("support")) return "support";
  if (key.includes("diag")) return "diagnostics";
  return "visual";
}

export function assignBotWorkforceProfile(input: {
  botId: string;
  department?: BotDepartment;
  supervisorId?: string;
  assignedRoute?: string;
  assignedEngine?: string;
  riskLevel?: "low" | "medium" | "high";
}): BotWorkforceProfile {
  const department = input.department ?? inferDepartmentFromBotId(input.botId);
  const lead = departmentLeads[department];
  const profile: BotWorkforceProfile = {
    botId: input.botId,
    department,
    supervisorId: input.supervisorId ?? `supervisor-${department}`,
    departmentLeadId: lead.leadId,
    assignedRoute: input.assignedRoute ?? defaultRouteForDepartment(department),
    assignedEngine: input.assignedEngine ?? defaultEngineForDepartment(department),
    riskLevel: input.riskLevel ?? "low",
    active: true,
    updatedAt: Date.now(),
  };
  workforceMap.set(profile.botId, profile);
  return profile;
}

export function ensureBotWorkforceProfile(botId: string): BotWorkforceProfile {
  return workforceMap.get(botId) ?? assignBotWorkforceProfile({ botId });
}

export function listBotWorkforceProfiles(): BotWorkforceProfile[] {
  return [...workforceMap.values()];
}

export function getBotWorkforceProfile(botId: string): BotWorkforceProfile | null {
  return workforceMap.get(botId) ?? null;
}

export function setBotWorkforceRisk(botId: string, riskLevel: "low" | "medium" | "high") {
  const profile = ensureBotWorkforceProfile(botId);
  const next = { ...profile, riskLevel, updatedAt: Date.now() };
  workforceMap.set(botId, next);
  return next;
}

export function listDepartmentSummaries(input?: {
  failingBots?: string[];
  completedBots?: string[];
  missedGoalBots?: string[];
  reassignmentBots?: string[];
}): DepartmentSummary[] {
  const profiles = listBotWorkforceProfiles();
  const failing = new Set(input?.failingBots ?? []);
  const completed = new Set(input?.completedBots ?? []);
  const missed = new Set(input?.missedGoalBots ?? []);
  const reassign = new Set(input?.reassignmentBots ?? []);

  const departments = Object.keys(departmentLeads) as BotDepartment[];
  return departments.map((department) => {
    const bots = profiles.filter((profile) => profile.department === department);
    return {
      department,
      totalBots: bots.length,
      failingBots: bots.filter((profile) => failing.has(profile.botId)).length,
      completedBots: bots.filter((profile) => completed.has(profile.botId)).length,
      missedGoals: bots.filter((profile) => missed.has(profile.botId)).length,
      needsReassignment: bots.filter((profile) => reassign.has(profile.botId)).length,
    };
  });
}

export function getBotCommandChain(botId: string): ChainNode[] {
  const profile = ensureBotWorkforceProfile(botId);
  const lead = departmentLeads[profile.department];
  return [
    { role: "bot", id: botId, label: botId },
    { role: "supervisor", id: profile.supervisorId, label: `Supervisor ${profile.department}` },
    { role: "department-lead", id: lead.leadId, label: lead.leadLabel },
    { role: "mc", id: "mc-michael-charlie", label: "MC Michael Charlie" },
    { role: "big-ace", id: "big-ace", label: "Big Ace Overseer" },
  ];
}

export function ensureSampleWorkforceProfiles() {
  const botIds = [
    "visual-bot-01",
    "motion-bot-01",
    "ticket-bot-01",
    "venue-bot-01",
    "article-bot-01",
    "profile-bot-01",
    "event-bot-01",
    "sponsor-bot-01",
    "ads-bot-01",
    "analytics-bot-01",
    "support-bot-01",
    "diagnostics-bot-01",
  ];
  return botIds.map((botId) => ensureBotWorkforceProfile(botId));
}
