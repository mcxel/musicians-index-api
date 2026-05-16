import TransactionalEmailEngine from '@/lib/email/TransactionalEmailEngine';

export interface SupportReplyDraft {
  id: string;
  ticketId: string;
  to: string;
  subject: string;
  body: string;
  createdBy: string;
  approvedBy?: string;
  approvedAt?: number;
  sentAt?: number;
  isTransactionalSafe: boolean;
}

const drafts: SupportReplyDraft[] = [];

function nextDraftId(): string {
  return `reply-draft-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export class SupportReplyEngine {
  static createDraft(input: {
    ticketId: string;
    to: string;
    subject: string;
    body: string;
    createdBy: string;
    isTransactionalSafe?: boolean;
  }): SupportReplyDraft {
    const draft: SupportReplyDraft = {
      id: nextDraftId(),
      ticketId: input.ticketId,
      to: input.to.trim().toLowerCase(),
      subject: input.subject,
      body: input.body,
      createdBy: input.createdBy,
      isTransactionalSafe: input.isTransactionalSafe ?? false,
    };

    drafts.unshift(draft);
    if (drafts.length > 3000) drafts.pop();
    return draft;
  }

  static approveDraft(draftId: string, approver: string): SupportReplyDraft | null {
    const draft = drafts.find((item) => item.id === draftId);
    if (!draft) return null;
    draft.approvedBy = approver;
    draft.approvedAt = Date.now();
    return draft;
  }

  static sendDraft(draftId: string): SupportReplyDraft | null {
    const draft = drafts.find((item) => item.id === draftId);
    if (!draft) return null;

    if (!draft.isTransactionalSafe && !draft.approvedAt) {
      return null;
    }

    TransactionalEmailEngine.sendSupportReply({
      userId: `support-${draft.ticketId}`,
      to: draft.to,
      ticketId: draft.ticketId,
      replyText: draft.body,
    });

    draft.sentAt = Date.now();
    return draft;
  }

  static listDrafts(): SupportReplyDraft[] {
    return [...drafts];
  }
}

export default SupportReplyEngine;
