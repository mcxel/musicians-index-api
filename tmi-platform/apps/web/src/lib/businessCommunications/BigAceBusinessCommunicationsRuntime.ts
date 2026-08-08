import { bigAceCommandAuthorityEngine } from "@/lib/big-ace/BigAceCommandAuthorityEngine";
import { bigAceSponsorEnvelope } from "./AuthorityEnvelope";
import businessCommunicationCommandBus from "./BusinessCommunicationCommandBus";
import { listBusinessCommsAudit, summarizeAuditSince } from "./BusinessCommunicationAuditLog";
import { listWorkQueue } from "./BusinessMessageTriage";
import { commitmentCountsByStatus, listCommitments } from "./CommitmentTrackerStore";
import { getMailboxConfigSnapshot } from "./MailboxConfig";
import { listRelationships, relationshipCount } from "./RelationshipMemoryStore";
import { getProposals } from "@/lib/commerce/RevenueBusinessEngine";
import type { BusinessCommsCommandType, BusinessCommsPriority } from "./types";

export type BigAceBusinessDirective =
  | { action: "triage_inbox"; messages?: Array<{ from: string; subject: string; body: string }> }
  | {
      action: "process_sponsor_inquiry";
      from: string;
      subject: string;
      body: string;
      contactName?: string;
      organization?: string;
      preferredZone?: string;
      sendDraft?: boolean;
    }
  | { action: "work_queue"; priority?: BusinessCommsPriority; limit?: number };

export type BigAceBusinessActivitySummary = {
  mailbox: ReturnType<typeof getMailboxConfigSnapshot>;
  queueCount: number;
  relationshipCount: number;
  openCommitments: number;
  pendingHumanApprovals: number;
  sponsorProposalsPending: number;
  auditLast24h: ReturnType<typeof summarizeAuditSince>;
  recentAudit: ReturnType<typeof listBusinessCommsAudit>;
  honestState: "empty" | "real";
  detail: string;
  commitmentBreakdown: ReturnType<typeof commitmentCountsByStatus>;
};

function commandTypeForDirective(directive: BigAceBusinessDirective): BusinessCommsCommandType {
  switch (directive.action) {
    case "triage_inbox":
      return "TRIAGE_INBOX";
    case "process_sponsor_inquiry":
      return "PROCESS_SPONSOR_INQUIRY";
    default:
      return "TRIAGE_INBOX";
  }
}

export async function executeBigAceBusinessDirective(
  operatorId: string,
  directive: BigAceBusinessDirective,
): Promise<{ ok: boolean; error?: string; data?: Record<string, unknown> }> {
  bigAceCommandAuthorityEngine.issueCommand("BernoutGlobal", "sync", "business-comms", {
    directive: directive.action,
    operatorId,
  });

  if (directive.action === "work_queue") {
    return {
      ok: true,
      data: {
        queue: listWorkQueue({
          priority: directive.priority,
          limit: directive.limit ?? 25,
        }),
      },
    };
  }

  const envelope = bigAceSponsorEnvelope(operatorId);
  const type = commandTypeForDirective(directive);

  const payload: Record<string, unknown> =
    directive.action === "process_sponsor_inquiry"
      ? { ...directive }
      : { messages: directive.messages ?? [] };

  return businessCommunicationCommandBus.dispatch({
    commandId: `bac-${Date.now()}`,
    type,
    envelope,
    payload,
    issuedAt: Date.now(),
  });
}

export function getBigAceBusinessActivitySummary(): BigAceBusinessActivitySummary {
  const mailbox = getMailboxConfigSnapshot();
  const queueCount = listWorkQueue().length;
  const relCount = relationshipCount();
  const commitments = listCommitments({ limit: 200 });
  const openCommitments = commitments.filter(
    (c) => c.status === "open" || c.status === "in_progress" || c.status === "awaiting_human",
  ).length;
  const pendingHumanApprovals = listRelationships({ stage: "pending_human_approval" }).length;
  const sponsorProposalsPending = getProposals("PROPOSAL").filter((p) => p.kind === "sponsor_lead").length;
  const since = Date.now() - 1000 * 60 * 60 * 24;
  const auditLast24h = summarizeAuditSince(since);
  const recentAudit = listBusinessCommsAudit(15);

  const hasReal =
    queueCount > 0 ||
    relCount > 0 ||
    openCommitments > 0 ||
    sponsorProposalsPending > 0 ||
    auditLast24h.total > 0;

  let detail = "No business communications activity yet.";
  if (!mailbox.inboundConfigured && !mailbox.outboundConfigured) {
    detail =
      "Mailbox credentials not configured — configure Hostinger IMAP/SMTP or Resend in env. Activity below is from in-session triage only.";
  } else if (hasReal) {
    detail = "Counts reflect real in-memory business comms state for this runtime (not fabricated pipeline dollars).";
  }

  return {
    mailbox,
    queueCount,
    relationshipCount: relCount,
    openCommitments,
    pendingHumanApprovals,
    sponsorProposalsPending,
    auditLast24h,
    recentAudit,
    honestState: hasReal ? "real" : "empty",
    detail,
    commitmentBreakdown: commitmentCountsByStatus(),
  };
}
