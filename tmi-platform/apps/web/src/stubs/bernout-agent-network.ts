// Stub for @bernout/agent-network
// TypeScript resolves from here. Webpack replaces with packages/agent-network/src/index.ts at build.

export type AgentRole = 'GLOBAL_ASSISTANT' | 'CONDUCTOR' | 'HOST' | 'MODERATOR' | 'SCOUT';
export type AgentHealth = 'ONLINE' | 'DEGRADED' | 'OFFLINE';
export type BusinessId =
  | 'bernoutglobal'
  | 'tmi'
  | 'thunderworld'
  | 'robo-mechanics'
  | string;
export type BusinessStatus = 'LIVE' | 'BETA' | 'PLANNING' | 'OFFLINE';

export interface AgentCheckpoint {
  label: string;
  passed: boolean;
}

export interface AgentPermissions {
  canSpend: false;
  canDelete: false;
  canMassEmail: false;
  canDraft: true;
  canReport: true;
  canModerate: true;
}

export interface VoiceProfile {
  tone: string;
  style: string;
  cadence: string;
  personality: string;
}

export interface AgentEntity {
  id: string;
  name: string;
  role: AgentRole;
  health: AgentHealth;
  organization: 'BernoutGlobal';
  reportsTo: string | null;
  currentAssignment: BusinessId | null;
  previousAssignments: BusinessId[];
  memoryFile: string;
  currentGoal: string;
  checkpoints: AgentCheckpoint[];
  tasks: string[];
  permissions: AgentPermissions;
  voiceProfile: VoiceProfile;
}

export interface BusinessEntity {
  id: string;
  name: string;
  status: BusinessStatus;
  url?: string;
  description: string;
}

const PERMISSIONS: AgentPermissions = {
  canSpend: false, canDelete: false, canMassEmail: false,
  canDraft: true, canReport: true, canModerate: true,
};

const _agents: AgentEntity[] = [
  {
    id: 'big-ace', name: 'Big Ace', role: 'GLOBAL_ASSISTANT',
    health: 'ONLINE', organization: 'BernoutGlobal',
    reportsTo: 'Marcel',
    currentAssignment: 'bernoutglobal', previousAssignments: [],
    memoryFile: 'agent-memory/big-ace.json',
    currentGoal: 'Oversee all BernoutGlobal ventures and support Marcel',
    checkpoints: [
      { label: 'Video Panel Visible',  passed: true  },
      { label: 'Memory Read/Write',    passed: false },
      { label: 'Chat Replies',         passed: false },
      { label: 'Health Status Live',   passed: true  },
      { label: 'Command Routing',      passed: false },
    ],
    tasks: [
      'Monitor all BernoutGlobal businesses',
      'Track revenue, signups, rooms, bots, and Stripe',
      'Receive and route directives from Marcel',
      'Delegate operational tasks to Michael Charlie',
      'Recommend business moves and flag blockers',
      'Compile cross-business reports',
    ],
    permissions: PERMISSIONS,
    voiceProfile: { tone: 'high-energy', style: 'california', cadence: 'conversational', personality: 'encouraging' },
  },
  {
    id: 'michael-charlie', name: 'Michael Charlie', role: 'CONDUCTOR',
    health: 'ONLINE', organization: 'BernoutGlobal',
    reportsTo: 'big-ace',
    currentAssignment: 'tmi', previousAssignments: [],
    memoryFile: 'agent-memory/michael-charlie.json',
    currentGoal: 'Controlled Revenue Launch — TMI',
    checkpoints: [
      { label: 'Home 1 Stability',          passed: true  },
      { label: 'Stripe Verification',       passed: false },
      { label: 'Database Persistence',      passed: false },
      { label: 'Michael Charlie Active',    passed: true  },
      { label: 'Big Ace Visible & Talking', passed: false },
    ],
    tasks: [
      'Monitor homepage, rooms, lobbies, and live sessions',
      'Track audience seating and bot activity',
      'Monitor payments, sponsor slots, and admin health',
      'Maintain launch goals, checkpoints, and task log',
      'Escalate blockers to Big Ace immediately',
      'Report TMI launch status',
    ],
    permissions: PERMISSIONS,
    voiceProfile: { tone: 'professional', style: 'broadcast', cadence: 'measured', personality: 'focused' },
  },
];

const _reg = new Map<string, AgentEntity>(_agents.map((a) => [a.id, a]));

export const AgentRegistry = {
  getAll: (): AgentEntity[] => Array.from(_reg.values()),
  get: (id: string): AgentEntity | undefined => _reg.get(id),
  getByAssignment: (b: BusinessId): AgentEntity[] => Array.from(_reg.values()).filter((a) => a.currentAssignment === b),
  setCheckpoint: (agentId: string, label: string, passed: boolean): void => {
    const cp = _reg.get(agentId)?.checkpoints.find((c) => c.label === label);
    if (cp) cp.passed = passed;
  },
  reassign: (agentId: string, businessId: BusinessId): void => {
    const a = _reg.get(agentId);
    if (!a) return;
    if (a.currentAssignment && a.currentAssignment !== businessId) a.previousAssignments.push(a.currentAssignment);
    a.currentAssignment = businessId;
  },
};

const _businesses: BusinessEntity[] = [
  { id: 'bernoutglobal', name: 'BernoutGlobal LLC',        status: 'LIVE',     url: 'bernoutglobal.com',          description: 'Parent company' },
  { id: 'tmi',           name: "The Musician's Index",     status: 'BETA',     url: 'themusiciansindex.com',      description: 'Music performance platform' },
  { id: 'thunderworld',  name: 'Thunder World',            status: 'PLANNING', description: 'Entertainment platform' },
  { id: 'robo-mechanics',name: 'Robo Mechanics',           status: 'PLANNING', description: 'Robotics platform' },
];

export const BusinessRegistry = {
  getAll: (): BusinessEntity[] => _businesses,
  get: (id: string): BusinessEntity | undefined => _businesses.find((b) => b.id === id),
  getByStatus: (s: BusinessStatus): BusinessEntity[] => _businesses.filter((b) => b.status === s),
};
