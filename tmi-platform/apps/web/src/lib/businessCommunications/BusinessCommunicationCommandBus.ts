import { envelopeAllowsAction } from "./AuthorityEnvelope";
import { recordBusinessCommsAudit } from "./BusinessCommunicationAuditLog";
import { listWorkQueue, triageRawMessage, enqueueTriagedMessage } from "./BusinessMessageTriage";
import { processSponsorInquiry } from "./lanes/SponsorAcquisitionLane";
import { pollInboxIntoTriage } from "./BusinessMailIngest";
import { getMailboxConfigSnapshot, getAdminMailboxAddress } from "./MailboxConfig";
import type {
  AuthorityEnvelope,
  BusinessCommsCommand,
  BusinessCommsCommandType,
  BusinessMessage,
} from "./types";

export type BusinessCommsDispatchResult = {
  ok: boolean;
  error?: string;
  data?: Record<string, unknown>;
};

type CommandHandler = (
  envelope: AuthorityEnvelope,
  payload: Record<string, unknown>,
) => Promise<BusinessCommsDispatchResult>;

const handlers: Record<BusinessCommsCommandType, CommandHandler> = {
  TRIAGE_INBOX: async (envelope, payload) => {
    if (!envelopeAllowsAction(envelope, "TRIAGE")) {
      return { ok: false, error: "authority_denied_triage" };
    }
    const mailbox = String(
      payload.mailboxIdentity ?? envelope.mailboxScope[0] ?? getAdminMailboxAddress(),
    );
    const messages = Array.isArray(payload.messages)
      ? (payload.messages as Array<{ from: string; subject: string; body: string }>)
      : [];

    if (messages.length === 0) {
      const mail = getMailboxConfigSnapshot();
      if (mail.inboundConfigured) {
        const poll = await pollInboxIntoTriage({ limit: 25 });
        if (!poll.ok) {
          return {
            ok: false,
            error: poll.error,
            data: {
              triaged: 0,
              queueSize: listWorkQueue().length,
              mailboxState: mail.state,
              configured: poll.configured,
            },
          };
        }
        return {
          ok: true,
          data: {
            triaged: poll.triaged,
            polled: poll.polled,
            skippedDuplicates: poll.skippedDuplicates,
            queueSize: listWorkQueue().length,
            mailboxState: mail.state,
            note: "Inbox polled via Hostinger IMAP into triage queue.",
          },
        };
      }
      return {
        ok: true,
        data: {
          triaged: 0,
          queueSize: listWorkQueue().length,
          mailboxState: mail.state,
          note: "No inbound messages supplied and IMAP not configured.",
        },
      };
    }

    const triaged: BusinessMessage[] = [];
    for (const raw of messages) {
      const msg = triageRawMessage({
        mailboxIdentity: mailbox,
        from: raw.from,
        subject: raw.subject,
        body: raw.body,
      });
      enqueueTriagedMessage(msg);
      triaged.push(msg);
      recordBusinessCommsAudit({
        mailboxIdentity: mailbox,
        operatorId: envelope.operatorId,
        agentId: envelope.agentId,
        envelopeId: envelope.envelopeId,
        action: "TRIAGE",
        threadId: msg.threadId,
        messageId: msg.id,
        detail: msg.subject,
        authorityOk: true,
      });
    }

    return {
      ok: true,
      data: { triaged: triaged.length, queue: triaged },
    };
  },

  DRAFT_REPLY: async () => ({
    ok: false,
    error: "draft_reply_use_lane_handlers",
  }),

  SEND_WITHIN_ENVELOPE: async () => ({
    ok: false,
    error: "send_use_lane_handlers",
  }),

  TRACK_COMMITMENT: async (envelope, payload) => {
    if (!envelopeAllowsAction(envelope, "COMMITMENT_UPDATE")) {
      return { ok: false, error: "authority_denied_commitment" };
    }
    recordBusinessCommsAudit({
      mailboxIdentity: envelope.mailboxScope[0] ?? "unknown",
      operatorId: envelope.operatorId,
      agentId: envelope.agentId,
      envelopeId: envelope.envelopeId,
      action: "COMMITMENT_UPDATE",
      dealId: typeof payload.commitmentId === "string" ? payload.commitmentId : undefined,
      detail: String(payload.detail ?? "commitment_touch"),
      authorityOk: true,
    });
    return { ok: true, data: { recorded: true } };
  },

  PROCESS_SPONSOR_INQUIRY: async (envelope, payload) => {
    const result = await processSponsorInquiry(
      envelope,
      {
        from: String(payload.from ?? ""),
        contactName: typeof payload.contactName === "string" ? payload.contactName : undefined,
        organization: typeof payload.organization === "string" ? payload.organization : undefined,
        subject: String(payload.subject ?? "Sponsorship inquiry"),
        body: String(payload.body ?? ""),
        preferredZone: typeof payload.preferredZone === "string" ? payload.preferredZone : undefined,
      },
      { sendDraft: payload.sendDraft === true },
    );
    if (!result.ok) {
      return { ok: false, error: result.error, data: { ...result } as unknown as Record<string, unknown> };
    }
    return { ok: true, data: result as unknown as Record<string, unknown> };
  },
};

export const businessCommunicationCommandBus = {
  async dispatch(command: BusinessCommsCommand): Promise<BusinessCommsDispatchResult> {
    const handler = handlers[command.type];
    if (!handler) {
      return { ok: false, error: "unknown_command" };
    }
    try {
      return await handler(command.envelope, command.payload);
    } catch (err) {
      return { ok: false, error: String(err) };
    }
  },

  listQueue(filter?: Parameters<typeof listWorkQueue>[0]) {
    return listWorkQueue(filter);
  },
};

export default businessCommunicationCommandBus;
