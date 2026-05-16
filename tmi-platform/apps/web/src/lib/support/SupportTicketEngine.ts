import AiSupportClassificationEngine, {
  type SupportCategory,
} from '@/lib/support/AiSupportClassificationEngine';
import AiSupportPriorityEngine, {
  type SupportPriority,
} from '@/lib/support/AiSupportPriorityEngine';

export type SupportStatus = 'open' | 'pending' | 'resolved' | 'escalated';

export interface SupportTicket {
  id: string;
  requesterEmail: string;
  requesterName?: string;
  subject: string;
  message: string;
  category: SupportCategory;
  priority: SupportPriority;
  score: number;
  status: SupportStatus;
  assignedTeam: string;
  createdAt: number;
  updatedAt: number;
}

const tickets: SupportTicket[] = [];

function normalize(email: string): string {
  return email.trim().toLowerCase();
}

function nextTicketId(): string {
  return `support-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function teamForCategory(category: SupportCategory): string {
  if (category === 'billing' || category === 'refund') return 'billing';
  if (category === 'tickets') return 'ticketing';
  if (category === 'login' || category === 'technical') return 'account-tech';
  if (category === 'reports' || category === 'appeals') return 'safety';
  if (category === 'promo') return 'promotions';
  return 'general-support';
}

export class SupportTicketEngine {
  static createTicket(input: {
    requesterEmail: string;
    requesterName?: string;
    subject: string;
    message: string;
    hasPaymentFailure?: boolean;
    hasSecurityRisk?: boolean;
  }): SupportTicket {
    const category = AiSupportClassificationEngine.classify({
      subject: input.subject,
      message: input.message,
    });

    const priorityResult = AiSupportPriorityEngine.score({
      category,
      message: input.message,
      hasPaymentFailure: input.hasPaymentFailure,
      hasSecurityRisk: input.hasSecurityRisk,
    });

    const ticket: SupportTicket = {
      id: nextTicketId(),
      requesterEmail: normalize(input.requesterEmail),
      requesterName: input.requesterName,
      subject: input.subject,
      message: input.message,
      category,
      priority: priorityResult.priority,
      score: priorityResult.score,
      status: priorityResult.priority === 'critical' ? 'escalated' : 'open',
      assignedTeam: teamForCategory(category),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    tickets.unshift(ticket);
    if (tickets.length > 4000) tickets.pop();
    return ticket;
  }

  static updateStatus(ticketId: string, status: SupportStatus): SupportTicket | null {
    const ticket = tickets.find((item) => item.id === ticketId);
    if (!ticket) return null;
    ticket.status = status;
    ticket.updatedAt = Date.now();
    return ticket;
  }

  static listTickets(): SupportTicket[] {
    return [...tickets];
  }

  static getTicket(ticketId: string): SupportTicket | null {
    return tickets.find((item) => item.id === ticketId) ?? null;
  }

  static getBacklogSummary(): {
    total: number;
    open: number;
    pending: number;
    resolved: number;
    escalated: number;
  } {
    const summary = {
      total: tickets.length,
      open: 0,
      pending: 0,
      resolved: 0,
      escalated: 0,
    };

    tickets.forEach((ticket) => {
      summary[ticket.status] += 1;
    });

    return summary;
  }
}

export default SupportTicketEngine;
