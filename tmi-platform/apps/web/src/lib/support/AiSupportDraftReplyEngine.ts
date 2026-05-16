import type { SupportCategory } from '@/lib/support/AiSupportClassificationEngine';
import type { SupportPriority } from '@/lib/support/AiSupportPriorityEngine';

export interface AiSupportDraft {
  subject: string;
  body: string;
  requiresHumanApproval: boolean;
}

export class AiSupportDraftReplyEngine {
  static draft(input: {
    category: SupportCategory;
    priority: SupportPriority;
    customerName?: string;
    ticketId: string;
  }): AiSupportDraft {
    const name = input.customerName ?? 'there';
    return {
      subject: `Support Update: ${input.ticketId}`,
      body: [
        `Hi ${name},`,
        '',
        `We reviewed your ${input.category} request and marked it as ${input.priority} priority.`,
        'A support specialist will follow up with next steps shortly.',
        '',
        "- The Musician's Index Support",
      ].join('\n'),
      requiresHumanApproval: true,
    };
  }
}

export default AiSupportDraftReplyEngine;
