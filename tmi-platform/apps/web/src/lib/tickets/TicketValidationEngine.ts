import { evaluateFraudGuard, getTicketById } from "@/lib/tickets/ticketCore";

export async function TicketValidationEngine(ticketId: string) {
  const ticket = await getTicketById(ticketId);
  if (!ticket) {
    return {
      valid: false,
      reason: "ticket_not_found",
      fraudGuard: null,
    };
  }

  const fraudGuard = await evaluateFraudGuard(ticketId);
  if (fraudGuard.status === "flagged") {
    return {
      valid: false,
      reason: "fraud_guard_flagged",
      fraudGuard,
    };
  }

  return {
    valid: !ticket.redeemed,
    reason: ticket.redeemed ? "already_redeemed" : "ok",
    fraudGuard,
  };
}
