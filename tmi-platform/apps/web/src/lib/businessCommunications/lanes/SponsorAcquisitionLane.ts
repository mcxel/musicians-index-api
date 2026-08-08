import { SponsorSlotRegistry } from "@/lib/commerce/SponsorRegistry";
import { createProposal } from "@/lib/commerce/RevenueBusinessEngine";
import { EmailProviderEngine } from "@/lib/email/EmailProviderEngine";
import {
  envelopeAllowsAction,
  validateQuoteWithinEnvelope,
} from "../AuthorityEnvelope";
import { recordBusinessCommsAudit } from "../BusinessCommunicationAuditLog";
import {
  attachRelationshipToMessage,
  enqueueTriagedMessage,
  triageRawMessage,
} from "../BusinessMessageTriage";
import {
  appendCommitmentEvidence,
  createCommitment,
  setCommitmentStatus,
} from "../CommitmentTrackerStore";
import { getMailboxConfigSnapshot } from "../MailboxConfig";
import {
  linkProposalToRelationship,
  setRelationshipStage,
  upsertRelationshipFromLead,
} from "../RelationshipMemoryStore";
import type { AuthorityEnvelope, BusinessMessage } from "../types";

export type SponsorInquiryInput = {
  from: string;
  contactName?: string;
  organization?: string;
  subject: string;
  body: string;
  preferredZone?: string;
};

export type SponsorInquiryResult = {
  ok: boolean;
  message?: BusinessMessage;
  relationshipId?: string;
  commitmentId?: string;
  proposalId?: string;
  draftSubject?: string;
  draftBody?: string;
  requiresHumanApproval: boolean;
  sendResult?: { success: boolean; devMode?: boolean; error?: string };
  error?: string;
};

function pickZone(preferred?: string): { zone: string; priceUsd: number } | null {
  const slots = [
    { zone: "home-1-homepageBanner", priceUsd: 500 },
    { zone: "home-1-homepageMid", priceUsd: 750 },
    { zone: "magazine-magazineLeaderboard", priceUsd: 350 },
    { zone: "performer-hub", priceUsd: 150 },
  ];
  if (preferred) {
    const match = slots.find((s) => s.zone === preferred || preferred.includes(s.zone));
    if (match) return match;
  }
  return slots.find((s) => s.priceUsd >= 150) ?? null;
}

export async function processSponsorInquiry(
  envelope: AuthorityEnvelope,
  input: SponsorInquiryInput,
  options?: { sendDraft?: boolean },
): Promise<SponsorInquiryResult> {
  if (!envelopeAllowsAction(envelope, "TRIAGE")) {
    return { ok: false, requiresHumanApproval: true, error: "envelope_missing_triage" };
  }

  const mailbox = envelope.mailboxScope[0] ?? "sponsors@themusiciansindex.com";
  const message = triageRawMessage({
    mailboxIdentity: mailbox,
    from: input.from,
    subject: input.subject,
    body: input.body,
  });

  if (message.intent !== "sponsor_inquiry") {
    message.triageNotes.push("lane_override_sponsor_processing");
    message.lane = "sponsor_acquisition";
  }

  enqueueTriagedMessage(message);

  recordBusinessCommsAudit({
    mailboxIdentity: mailbox,
    operatorId: envelope.operatorId,
    agentId: envelope.agentId,
    envelopeId: envelope.envelopeId,
    action: "TRIAGE",
    threadId: message.threadId,
    messageId: message.id,
    detail: `Triage sponsor thread ${message.threadId}`,
    authorityOk: true,
  });

  const relationship = upsertRelationshipFromLead({
    lane: "sponsor_acquisition",
    contactEmail: input.from,
    contactName: input.contactName,
    organization: input.organization,
    stage: "qualified",
    note: `Inbound: ${input.subject}`,
  });
  attachRelationshipToMessage(message.id, relationship.id);

  const slotPick = pickZone(input.preferredZone);
  if (!slotPick) {
    return {
      ok: false,
      requiresHumanApproval: true,
      message,
      relationshipId: relationship.id,
      error: "no_sponsor_slot_catalog",
    };
  }

  // Align quote with registry list price when available
  let quotedUsd = slotPick.priceUsd;
  try {
    const available = await SponsorSlotRegistry.getAvailableSlots();
    const reg = available.find((s) => s.zone === slotPick.zone);
    if (reg) quotedUsd = reg.priceUsd;
  } catch {
    // keep slotPick fallback
  }

  const quoteCheck = validateQuoteWithinEnvelope(envelope, quotedUsd);
  if (!quoteCheck.ok) {
    setRelationshipStage(relationship.id, "pending_human_approval");
    return {
      ok: false,
      requiresHumanApproval: true,
      message,
      relationshipId: relationship.id,
      error: quoteCheck.reason,
    };
  }

  const proposal = createProposal({
    kind: "sponsor_lead",
    title: `Sponsor package — ${slotPick.zone}`,
    rationale: `Auto-ingested from business comms thread ${message.threadId}. Quote $${quotedUsd} (registry-aligned).`,
    zone: slotPick.zone,
    valueBandUsd: { min: quotedUsd, max: quotedUsd },
    category: "sponsor_acquisition",
    lowRiskAutoApply: false,
    payload: {
      sponsorName: input.organization ?? input.contactName ?? input.from,
      contactEmail: input.from,
      packagePriceUsd: quotedUsd,
      threadId: message.threadId,
      messageId: message.id,
    },
    actor: envelope.operatorId,
    monetizationMeta: {
      classification: "sponsor_lead",
      feePath: "ad_zone_package",
      legalHold: false,
    },
  });

  linkProposalToRelationship(relationship.id, proposal.id);

  const commitment = createCommitment({
    relationshipId: relationship.id,
    title: "Send sponsor proposal draft",
    assignedAgentId: envelope.agentId,
  });

  const draftSubject = `TMI Sponsorship — ${slotPick.zone.replace(/-/g, " ")}`;
  const draftBody = [
    `Hi ${input.contactName ?? "there"},`,
    "",
    `Thanks for reaching out about sponsorship on The Musician's Index.`,
    "",
    `Based on your note, we'd start with zone "${slotPick.zone}" at $${quotedUsd} USD (list rate from our current catalog).`,
    `This includes placement per our standard sponsor package (${envelope.approvedStrategyIds[0]}).`,
    "",
    quoteCheck.requiresHuman
      ? "This package is above our automated send threshold — a TMI operator will confirm final terms before anything is signed or invoiced."
      : "Reply to confirm interest and we'll send checkout / contract next steps.",
    "",
    "— TMI Sponsorship Desk (via Big Ace Business Communications)",
  ].join("\n");

  appendCommitmentEvidence(commitment.id, {
    kind: "proposal_created",
    refId: proposal.id,
    detail: `Proposal ${proposal.id} created at $${quotedUsd}`,
  });

  let sendResult: SponsorInquiryResult["sendResult"];
  const requiresHumanApproval = quoteCheck.requiresHuman || proposal.validationErrors.length > 0;

  if (requiresHumanApproval) {
    setRelationshipStage(relationship.id, "pending_human_approval");
    setCommitmentStatus(commitment.id, "awaiting_human");
    appendCommitmentEvidence(commitment.id, {
      kind: "note",
      refId: proposal.id,
      detail: "Awaiting human approval before outbound send",
    });
  } else if (options?.sendDraft && envelopeAllowsAction(envelope, "SEND")) {
    const mail = getMailboxConfigSnapshot();
    if (!mail.outboundConfigured) {
      setCommitmentStatus(commitment.id, "blocked");
      sendResult = { success: false, error: "outbound_not_configured" };
    } else {
      const sent = await EmailProviderEngine.sendAsync({
        to: input.from,
        subject: draftSubject,
        html: draftBody.replace(/\n/g, "<br/>"),
        text: draftBody,
        tags: ["sponsor-acquisition", "business-comms"],
        replyTo: mailbox,
      });
      sendResult = {
        success: sent.success,
        devMode: sent.devMode,
        error: sent.error,
      };
      if (sent.success) {
        setRelationshipStage(relationship.id, "proposal_sent");
        setCommitmentStatus(commitment.id, "completed");
        appendCommitmentEvidence(commitment.id, {
          kind: "email_sent",
          refId: sent.externalId,
          detail: `Proposal draft sent via ${sent.provider}`,
        });
        recordBusinessCommsAudit({
          mailboxIdentity: mailbox,
          operatorId: envelope.operatorId,
          agentId: envelope.agentId,
          envelopeId: envelope.envelopeId,
          action: "SEND",
          threadId: message.threadId,
          messageId: message.id,
          dealId: relationship.id,
          detail: `Sent sponsor draft to ${input.from}`,
          authorityOk: true,
        });
      } else {
        setCommitmentStatus(commitment.id, "failed");
      }
    }
  } else {
    setRelationshipStage(relationship.id, "negotiating");
    setCommitmentStatus(commitment.id, "in_progress");
  }

  recordBusinessCommsAudit({
    mailboxIdentity: mailbox,
    operatorId: envelope.operatorId,
    agentId: envelope.agentId,
    envelopeId: envelope.envelopeId,
    action: "DEAL_FOLLOW_UP",
    threadId: message.threadId,
    dealId: relationship.id,
    detail: `Sponsor inquiry processed; proposal=${proposal.id}`,
    authorityOk: true,
  });

  return {
    ok: true,
    message,
    relationshipId: relationship.id,
    commitmentId: commitment.id,
    proposalId: proposal.id,
    draftSubject,
    draftBody,
    requiresHumanApproval,
    sendResult,
  };
}
