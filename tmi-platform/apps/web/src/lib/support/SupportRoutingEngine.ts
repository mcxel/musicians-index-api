import type { SupportTicket } from '@/lib/support/SupportTicketEngine';

export interface SupportRoutingDecision {
  ticketId: string;
  team: string;
  escalationRequired: boolean;
  nextAction: string;
}

export class SupportRoutingEngine {
  static routeTicket(ticket: SupportTicket): SupportRoutingDecision {
    const escalationRequired = ticket.priority === 'critical' || ticket.status === 'escalated';
    const nextAction = escalationRequired
      ? 'Escalate to admin support command center.'
      : `Assign to ${ticket.assignedTeam} queue.`;

    return {
      ticketId: ticket.id,
      team: ticket.assignedTeam,
      escalationRequired,
      nextAction,
    };
  }
}

export default SupportRoutingEngine;
