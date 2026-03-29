import { Injectable, Logger } from '@nestjs/common';
import { createHash } from 'crypto';

type TicketRecord = {
  id: string;
  eventId: string;
  ticketTypeId: string;
  status: 'ACTIVE' | 'CANCELED' | 'REFUND_PENDING' | 'REFUNDED' | 'USED';
  tokenHash: string;
  issuedAt: string;
  checkedInAt?: string | null;
};

@Injectable()
export class TicketsService {
  private readonly logger = new Logger(TicketsService.name);
  private dev = process.env.DEV_TICKETS === 'true';

  // simple in-memory store used when DEV_TICKETS=true
  private tickets = new Map<string, TicketRecord>();
  private purchaseAttempts = new Map<string, { count: number; windowStart: number }>();

  constructor() {
    if (this.dev) {
      // seed a sample ticket for quick local testing
      const sampleToken = 'dev-sample-token-123';
      const h = this.hashToken(sampleToken);
      this.tickets.set(h, {
        id: 'dev-ticket-1',
        eventId: 'dev-event-1',
        ticketTypeId: 'dev-type-1',
        status: 'ACTIVE',
        tokenHash: h,
        issuedAt: new Date().toISOString(),
      });
      this.logger.log('DEV_TICKETS enabled — seeded sample ticket token: dev-sample-token-123');
    }
  }

  private hashToken(token: string) {
    return createHash('sha256').update(token).digest('hex');
  }

  async verify(token: string) {
    const tokenHash = this.hashToken(token);

    if (this.dev) {
      const t = this.tickets.get(tokenHash);
      if (!t) return { valid: false, reason: 'NOT_FOUND' as const };
      if (t.status !== 'ACTIVE') return { valid: false, reason: 'NOT_ACTIVE' as const };
      if (t.checkedInAt) return { valid: false, reason: 'ALREADY_USED' as const };

      return {
        valid: true,
        ticket: {
          id: t.id,
          status: t.status,
          event: { id: t.eventId, title: 'Dev Event', startsAt: new Date().toISOString(), venueName: 'Dev Venue' },
          ticketType: { id: t.ticketTypeId, name: 'DEV' },
        },
      };
    }

    // Production path should call Prisma / database; return a clear not-implemented response for now
    return { valid: false, reason: 'NOT_IMPLEMENTED' };
  }

  async checkIn(token: string) {
    const tokenHash = this.hashToken(token);

    if (this.dev) {
      const t = this.tickets.get(tokenHash);
      if (!t) return { ok: false, reason: 'NOT_FOUND' as const };
      if (t.status !== 'ACTIVE') return { ok: false, reason: 'NOT_ACTIVE' as const };
      if (t.checkedInAt) return { ok: true, already: true };

      t.checkedInAt = new Date().toISOString();
      t.status = 'USED';
      this.tickets.set(tokenHash, t);
      return { ok: true, already: false, ticketId: t.id };
    }

    return { ok: false, reason: 'NOT_IMPLEMENTED' };
  }

  async purchaseCheck(userId: string, eventId: string, quantity: number, turnstileToken: string) {
    if (!eventId || quantity <= 0) {
      return { error: 'bot_detected' as const };
    }

    if (!turnstileToken || turnstileToken.trim().length < 5) {
      return { error: 'bot_detected' as const };
    }

    const maxTickets = 8;
    if (quantity > maxTickets) {
      return { error: 'limit_exceeded' as const, max: maxTickets, current: quantity };
    }

    const key = `${userId}:${eventId}`;
    const now = Date.now();
    const windowMs = 60_000;
    const record = this.purchaseAttempts.get(key);
    if (!record || now - record.windowStart > windowMs) {
      this.purchaseAttempts.set(key, { count: 1, windowStart: now });
    } else {
      record.count += 1;
      this.purchaseAttempts.set(key, record);
      if (record.count > 5) {
        return { error: 'velocity_exceeded' as const };
      }
    }

    const reservationToken = `res_${createHash('sha256')
      .update(`${userId}:${eventId}:${quantity}:${now}`)
      .digest('hex')
      .slice(0, 24)}`;
    return {
      allowed: true,
      reservationToken,
      expiresAt: new Date(now + 5 * 60 * 1000).toISOString(),
    };
  }

  // dev-only helper to mint a ticket token (stores hashed token)
  async devMint(token: string) {
    if (!this.dev) throw new Error('devMint only available when DEV_TICKETS=true');
    const h = this.hashToken(token);
    const rec: TicketRecord = {
      id: `dev-${Math.random().toString(36).slice(2, 9)}`,
      eventId: 'dev-event-1',
      ticketTypeId: 'dev-type-1',
      status: 'ACTIVE',
      tokenHash: h,
      issuedAt: new Date().toISOString(),
    };
    this.tickets.set(h, rec);
    return { token, tokenHash: h, ticketId: rec.id };
  }
}
