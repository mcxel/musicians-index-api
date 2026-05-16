export type DepartmentId =
  | "outreach" | "content" | "audience" | "revenue" | "moderation"
  | "maintenance" | "analytics" | "venue" | "matchmaking" | "onboarding";

export interface BotDepartment {
  departmentId: DepartmentId;
  name: string;
  purpose: string;
  headBotId: string;
  memberBotIds: string[];
  revenueTarget: number;
  activeTaskCount: number;
  status: "active" | "idle" | "overloaded" | "paused";
}

const registry = new Map<DepartmentId, BotDepartment>([
  ["outreach",     { departmentId: "outreach",     name: "Outreach",     purpose: "Artist & venue recruitment",      headBotId: "bigace",    memberBotIds: [], revenueTarget: 5000,  activeTaskCount: 0, status: "active" }],
  ["content",      { departmentId: "content",      name: "Content",      purpose: "Articles, editorial, magazine",   headBotId: "scribe-01", memberBotIds: [], revenueTarget: 2000,  activeTaskCount: 0, status: "active" }],
  ["audience",     { departmentId: "audience",     name: "Audience",     purpose: "Fan simulation & crowd heat",     headBotId: "crowd-01",  memberBotIds: [], revenueTarget: 1000,  activeTaskCount: 0, status: "active" }],
  ["revenue",      { departmentId: "revenue",      name: "Revenue",      purpose: "Monetization & conversion ops",   headBotId: "rev-01",    memberBotIds: [], revenueTarget: 10000, activeTaskCount: 0, status: "active" }],
  ["moderation",   { departmentId: "moderation",   name: "Moderation",   purpose: "Content & room safety",           headBotId: "mod-01",    memberBotIds: [], revenueTarget: 0,     activeTaskCount: 0, status: "active" }],
  ["maintenance",  { departmentId: "maintenance",  name: "Maintenance",  purpose: "Platform health & uptime",        headBotId: "maint-01",  memberBotIds: [], revenueTarget: 0,     activeTaskCount: 0, status: "active" }],
  ["analytics",    { departmentId: "analytics",    name: "Analytics",    purpose: "Data pipeline & reporting",       headBotId: "ana-01",    memberBotIds: [], revenueTarget: 0,     activeTaskCount: 0, status: "active" }],
  ["venue",        { departmentId: "venue",        name: "Venue",        purpose: "Venue ops, seating, room mgmt",   headBotId: "venue-01",  memberBotIds: [], revenueTarget: 3000,  activeTaskCount: 0, status: "active" }],
  ["matchmaking",  { departmentId: "matchmaking",  name: "Matchmaking",  purpose: "Battle pairing & scheduling",     headBotId: "match-01",  memberBotIds: [], revenueTarget: 500,   activeTaskCount: 0, status: "active" }],
  ["onboarding",   { departmentId: "onboarding",   name: "Onboarding",   purpose: "New user activation & routing",   headBotId: "onboard-01",memberBotIds: [], revenueTarget: 2000,  activeTaskCount: 0, status: "active" }],
]);

export function getDepartment(id: DepartmentId): BotDepartment | null {
  return registry.get(id) ?? null;
}

export function listDepartments(): BotDepartment[] {
  return [...registry.values()];
}

export function assignBotToDepartment(departmentId: DepartmentId, botId: string): boolean {
  const dept = registry.get(departmentId);
  if (!dept) return false;
  if (!dept.memberBotIds.includes(botId)) dept.memberBotIds.push(botId);
  return true;
}

export function removeBotFromDepartment(departmentId: DepartmentId, botId: string): void {
  const dept = registry.get(departmentId);
  if (dept) dept.memberBotIds = dept.memberBotIds.filter((id) => id !== botId);
}

export function incrementTaskCount(departmentId: DepartmentId, delta = 1): void {
  const dept = registry.get(departmentId);
  if (dept) {
    dept.activeTaskCount = Math.max(0, dept.activeTaskCount + delta);
    dept.status = dept.activeTaskCount > 20 ? "overloaded" : dept.activeTaskCount > 0 ? "active" : "idle";
  }
}

export function setDepartmentStatus(departmentId: DepartmentId, status: BotDepartment["status"]): void {
  const dept = registry.get(departmentId);
  if (dept) dept.status = status;
}

export function getDepartmentByBot(botId: string): BotDepartment | null {
  for (const dept of registry.values()) {
    if (dept.memberBotIds.includes(botId) || dept.headBotId === botId) return dept;
  }
  return null;
}
