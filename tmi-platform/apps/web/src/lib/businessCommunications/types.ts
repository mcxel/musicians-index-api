/**
 * Business Communications & Deal Execution — canonical types (locked foundation).
 * Agents operate through authority envelopes on the Command Bus — never raw mailbox passwords.
 */

export type BusinessCommsPriority = "P0" | "P1" | "P2" | "P3" | "P4";

export type BusinessCommsLane =
  | "sponsor_acquisition"
  | "advertiser_sales"
  | "booking"
  | "performer_relations"
  | "magazine_pr"
  | "renewal"
  | "collections"
  | "relationship_intelligence";

export type BusinessCommsAgentId =
  | "big-ace"
  | "sponsor-acquisition"
  | "advertiser-sales"
  | "booking-desk"
  | "performer-relations"
  | "magazine-pr"
  | "renewal"
  | "collections"
  | "relationship-intelligence";

export type BusinessCommsAction =
  | "READ"
  | "TRIAGE"
  | "DRAFT"
  | "SEND"
  | "DEAL_FOLLOW_UP"
  | "COMMITMENT_UPDATE";

/** Actions that always require a human operator — never autonomous. */
export type ForbiddenAutonomousAction =
  | "refund"
  | "bank_transfer"
  | "legal_commitment"
  | "pricing_floor_override"
  | "unsubscribe_override"
  | "privacy_override";

export interface FinancialAuthorityLimit {
  /** Minimum list/package price agents may quote (USD). Below → blocked. */
  pricingFloorUsd: number;
  /** Quotes above this require human approval before send. */
  humanApprovalAboveUsd: number;
  /** Max discount from list price agents may offer without human (USD). */
  maxAutonomousDiscountUsd: number;
  /** Hard cap on any single deal envelope (USD). */
  maxDealValueUsd: number;
}

export interface AuthorityEnvelope {
  envelopeId: string;
  agentId: BusinessCommsAgentId;
  operatorId: string;
  mailboxScope: string[];
  authorityScope: BusinessCommsAction[];
  dealScope: BusinessCommsLane[];
  financialLimit: FinancialAuthorityLimit;
  forbiddenAutonomous: ForbiddenAutonomousAction[];
  /** Approved outreach strategy ids — learning may recommend among these only (Rule 22). */
  approvedStrategyIds: string[];
  issuedAt: number;
  expiresAt?: number;
}

export type BusinessMessageDirection = "inbound" | "outbound" | "internal";

export type BusinessMessageIntent =
  | "sponsor_inquiry"
  | "advertiser_inquiry"
  | "booking_inquiry"
  | "billing_issue"
  | "support_request"
  | "legal_notice"
  | "renewal"
  | "collections"
  | "unknown";

export interface BusinessMessage {
  id: string;
  threadId: string;
  mailboxIdentity: string;
  direction: BusinessMessageDirection;
  from: string;
  to: string[];
  subject: string;
  bodyPreview: string;
  receivedAt: number;
  intent: BusinessMessageIntent;
  priority: BusinessCommsPriority;
  lane: BusinessCommsLane;
  triageNotes: string[];
  relationshipId?: string;
  dealId?: string;
  requiresHuman: boolean;
}

export type RelationshipStage =
  | "lead"
  | "qualified"
  | "proposal_sent"
  | "negotiating"
  | "pending_human_approval"
  | "agreement"
  | "fulfillment"
  | "closed_won"
  | "closed_lost"
  | "dormant";

/** Structured deal memory — not unrestricted model context. */
export interface RelationshipMemoryRecord {
  id: string;
  lane: BusinessCommsLane;
  contactEmail: string;
  contactName?: string;
  organization?: string;
  stage: RelationshipStage;
  lastTouchAt: number;
  createdAt: number;
  notes: string[];
  linkedProposalIds: string[];
  linkedThreadIds: string[];
  metadata: Record<string, string | number | boolean | null>;
}

export type CommitmentStatus =
  | "open"
  | "in_progress"
  | "blocked"
  | "awaiting_human"
  | "completed"
  | "failed"
  | "cancelled";

export interface CommitmentEvidence {
  kind: "email_sent" | "proposal_created" | "human_approval" | "stripe_checkout" | "note";
  refId: string;
  at: number;
  detail: string;
}

export interface CommitmentRecord {
  id: string;
  relationshipId: string;
  title: string;
  status: CommitmentStatus;
  dueAt?: number;
  createdAt: number;
  updatedAt: number;
  evidence: CommitmentEvidence[];
  assignedAgentId: BusinessCommsAgentId;
}

export interface BusinessCommsAuditEntry {
  id: string;
  at: number;
  mailboxIdentity: string;
  operatorId: string;
  agentId: BusinessCommsAgentId;
  envelopeId: string;
  action: BusinessCommsAction;
  threadId?: string;
  messageId?: string;
  dealId?: string;
  detail: string;
  authorityOk: boolean;
}

export type BusinessCommsCommandType =
  | "TRIAGE_INBOX"
  | "DRAFT_REPLY"
  | "SEND_WITHIN_ENVELOPE"
  | "TRACK_COMMITMENT"
  | "PROCESS_SPONSOR_INQUIRY";

export interface BusinessCommsCommandContext {
  agentId: BusinessCommsAgentId;
  mailboxScope: string[];
  authorityScope: BusinessCommsAction[];
  dealScope: BusinessCommsLane[];
  financialLimit: FinancialAuthorityLimit;
  auditContext: {
    operatorId: string;
    sessionEmail?: string;
  };
}

export interface BusinessCommsCommand {
  commandId: string;
  type: BusinessCommsCommandType;
  envelope: AuthorityEnvelope;
  payload: Record<string, unknown>;
  issuedAt: number;
}

export type MailboxConnectionState =
  | "not_configured"
  | "smtp_outbound_only"
  | "imap_inbound_ready"
  | "error";

export type BusinessMailboxVisibility = "private" | "public_alias";

export interface BusinessMailboxIdentity {
  key: "admin" | "support";
  address: string;
  visibility: BusinessMailboxVisibility;
  /** When visibility is public_alias, messages deliver into this inbox. */
  deliversTo?: string;
}

export interface MailboxConfigSnapshot {
  state: MailboxConnectionState;
  inboundConfigured: boolean;
  outboundConfigured: boolean;
  scopedAddresses: string[];
  identities: BusinessMailboxIdentity[];
  detail: string;
}
