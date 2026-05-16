import { randomUUID } from 'crypto';

export type RefundStatus = 'requested' | 'approved' | 'rejected' | 'processed';

export interface TicketRefund {
  id: string;
  ticketId: string;
  ownerId: string;
  reason: string;
  amountUSD: number;
  status: RefundStatus;
  requestedAt: string;
  processedAt?: string;
  receiptId?: string;
}

const REFUNDS = new Map<string, TicketRefund>();

export class TicketRefundEngine {
  static requestRefund(ticketId: string, ownerId: string, reason: string, amountUSD: number): TicketRefund {
    const refund: TicketRefund = {
      id: randomUUID(),
      ticketId,
      ownerId,
      reason,
      amountUSD,
      status: 'requested',
      requestedAt: new Date().toISOString(),
    };
    REFUNDS.set(refund.id, refund);
    return refund;
  }

  static approve(refundId: string): TicketRefund | null {
    const refund = REFUNDS.get(refundId);
    if (!refund) return null;
    refund.status = 'approved';
    return refund;
  }

  static reject(refundId: string): TicketRefund | null {
    const refund = REFUNDS.get(refundId);
    if (!refund) return null;
    refund.status = 'rejected';
    return refund;
  }

  static process(refundId: string): TicketRefund | null {
    const refund = REFUNDS.get(refundId);
    if (!refund) return null;
    if (refund.status !== 'approved') return null;
    refund.status = 'processed';
    refund.processedAt = new Date().toISOString();
    refund.receiptId = `RFD-${refund.id.slice(0, 8).toUpperCase()}`;
    return refund;
  }

  static getRefund(refundId: string): TicketRefund | null {
    return REFUNDS.get(refundId) || null;
  }

  static getForOwner(ownerId: string): TicketRefund[] {
    return Array.from(REFUNDS.values()).filter((r) => r.ownerId === ownerId);
  }
}

export default TicketRefundEngine;
