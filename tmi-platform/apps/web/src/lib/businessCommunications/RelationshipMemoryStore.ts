import type { RelationshipMemoryRecord, RelationshipStage } from "./types";

const store = new Map<string, RelationshipMemoryRecord>();

function nextId(): string {
  return `rel-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function upsertRelationshipFromLead(input: {
  lane: RelationshipMemoryRecord["lane"];
  contactEmail: string;
  contactName?: string;
  organization?: string;
  stage?: RelationshipStage;
  note?: string;
}): RelationshipMemoryRecord {
  const email = input.contactEmail.trim().toLowerCase();
  const existing = [...store.values()].find((r) => r.contactEmail === email && r.lane === input.lane);
  const now = Date.now();

  if (existing) {
    existing.lastTouchAt = now;
    if (input.contactName) existing.contactName = input.contactName;
    if (input.organization) existing.organization = input.organization;
    if (input.stage) existing.stage = input.stage;
    if (input.note) existing.notes.unshift(input.note);
    return existing;
  }

  const record: RelationshipMemoryRecord = {
    id: nextId(),
    lane: input.lane,
    contactEmail: email,
    contactName: input.contactName,
    organization: input.organization,
    stage: input.stage ?? "lead",
    lastTouchAt: now,
    createdAt: now,
    notes: input.note ? [input.note] : [],
    linkedProposalIds: [],
    linkedThreadIds: [],
    metadata: {},
  };
  store.set(record.id, record);
  return record;
}

export function getRelationship(id: string): RelationshipMemoryRecord | undefined {
  return store.get(id);
}

export function linkProposalToRelationship(relationshipId: string, proposalId: string): void {
  const row = store.get(relationshipId);
  if (!row) return;
  if (!row.linkedProposalIds.includes(proposalId)) {
    row.linkedProposalIds.unshift(proposalId);
  }
  row.lastTouchAt = Date.now();
}

export function setRelationshipStage(relationshipId: string, stage: RelationshipStage): void {
  const row = store.get(relationshipId);
  if (!row) return;
  row.stage = stage;
  row.lastTouchAt = Date.now();
}

export function listRelationships(filter?: {
  lane?: RelationshipMemoryRecord["lane"];
  stage?: RelationshipStage;
  limit?: number;
}): RelationshipMemoryRecord[] {
  let rows = [...store.values()].sort((a, b) => b.lastTouchAt - a.lastTouchAt);
  if (filter?.lane) rows = rows.filter((r) => r.lane === filter.lane);
  if (filter?.stage) rows = rows.filter((r) => r.stage === filter.stage);
  return rows.slice(0, filter?.limit ?? 100);
}

export function relationshipCount(): number {
  return store.size;
}
