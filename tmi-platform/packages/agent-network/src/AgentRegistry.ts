// packages/agent-network/src/AgentRegistry.ts
// BernoutGlobal Agent Network — hierarchy: Marcel → Big Ace → Michael Charlie → TMI systems

export type AgentRole = 'GLOBAL_ASSISTANT' | 'CONDUCTOR' | 'HOST' | 'MODERATOR' | 'SCOUT';
export type AgentHealth = 'ONLINE' | 'DEGRADED' | 'OFFLINE';
export type BusinessId =
  | 'bernoutglobal'
  | 'tmi'
  | 'thunderworld'
  | 'robo-mechanics'
  | string;

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

const PERMISSIONS: AgentPermissions = {
  canSpend: false,
  canDelete: false,
  canMassEmail: false,
  canDraft: true,
  canReport: true,
  canModerate: true,
};

const SEED_AGENTS: AgentEntity[] = [
  {
    id: 'big-ace',
    name: 'Big Ace',
    role: 'GLOBAL_ASSISTANT',
    health: 'ONLINE',
    organization: 'BernoutGlobal',
    reportsTo: 'Marcel',
    currentAssignment: 'bernoutglobal',
    previousAssignments: [],
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
    voiceProfile: {
      tone: 'high-energy',
      style: 'california',
      cadence: 'conversational',
      personality: 'encouraging',
    },
  },
  {
    id: 'michael-charlie',
    name: 'Michael Charlie',
    role: 'CONDUCTOR',
    health: 'ONLINE',
    organization: 'BernoutGlobal',
    reportsTo: 'big-ace',
    currentAssignment: 'tmi',
    previousAssignments: [],
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
    voiceProfile: {
      tone: 'professional',
      style: 'broadcast',
      cadence: 'measured',
      personality: 'focused',
    },
  },
];

const _registry = new Map<string, AgentEntity>(
  SEED_AGENTS.map((a) => [
    a.id,
    {
      ...a,
      checkpoints: a.checkpoints.map((c) => ({ ...c })),
      previousAssignments: [...a.previousAssignments],
    },
  ])
);

export const AgentRegistry = {
  getAll(): AgentEntity[] {
    return Array.from(_registry.values());
  },

  get(id: string): AgentEntity | undefined {
    return _registry.get(id);
  },

  getByAssignment(businessId: BusinessId): AgentEntity[] {
    return Array.from(_registry.values()).filter((a) => a.currentAssignment === businessId);
  },

  setCheckpoint(agentId: string, label: string, passed: boolean): void {
    const agent = _registry.get(agentId);
    if (!agent) return;
    const cp = agent.checkpoints.find((c) => c.label === label);
    if (cp) cp.passed = passed;
  },

  reassign(agentId: string, businessId: BusinessId): void {
    const agent = _registry.get(agentId);
    if (!agent) return;
    if (agent.currentAssignment && agent.currentAssignment !== businessId) {
      agent.previousAssignments.push(agent.currentAssignment);
    }
    agent.currentAssignment = businessId;
  },
};
