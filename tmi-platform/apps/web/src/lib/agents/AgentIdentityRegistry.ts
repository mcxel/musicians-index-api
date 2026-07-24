import { AGENT_REGISTRY_SEED, type SeedAgent } from "./AgentRegistrySeed";

export interface AgentIdentity {
  id: string;
  name: string;
  role: "big-ace" | "mc" | "department-lead" | "bot";
  department: string | null;
  reportsToId: string | null;
  directives: { kind: "core" | "operational"; text: string }[];
  objectives: { title: string; description: string }[];
  status: "Active" | "Suspended";
  memoryVaultRef: string;
  skillRegistryRef: string;
  auditStreamRef: string;
}

const AGENT_REGISTRY: Record<string, AgentIdentity> = {};

// Initialize the registry from seed
AGENT_REGISTRY_SEED.forEach((seed) => {
  AGENT_REGISTRY[seed.id] = {
    id: seed.id,
    name: seed.name,
    role: seed.role,
    department: seed.department,
    reportsToId: seed.reportsToId,
    directives: seed.directives,
    objectives: seed.objectives,
    status: "Active",
    memoryVaultRef: `${seed.id}_memory_vault`,
    skillRegistryRef: `${seed.id}_skills_registry`,
    auditStreamRef: `${seed.id}_audit_stream`,
  };
});

export const AgentIdentityRegistry = {
  getAgentIdentity(agentId: string): AgentIdentity | undefined {
    return AGENT_REGISTRY[agentId];
  },

  getAllIdentities(): AgentIdentity[] {
    return Object.values(AGENT_REGISTRY);
  },

  isRegistered(agentId: string): boolean {
    return agentId in AGENT_REGISTRY;
  },
};
