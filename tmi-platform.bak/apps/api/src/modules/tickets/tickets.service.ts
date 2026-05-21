import { ForbiddenException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { createHash, createHmac, randomBytes, timingSafeEqual } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';

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

  constructor(private readonly prisma: PrismaService) {
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
    if (token.startsWith('v1.')) return this.verifySignedQrToken(token);

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
    if (token.startsWith('v1.')) return this.checkInBySignedQrToken(token);

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

  private toMyTicketView(ticket: {
    id: string;
    status: string;
    issuedAt: Date;
    checkedInAt: Date | null;
    createdAt: Date;
    event: { id: string; title: string; startsAt: Date; venueName: string | null; venueCity: string | null };
    ticketType: { id: string; name: string; priceCents: number; currency: string };
  }) {
    // This QR payload is wallet-facing and not yet a secure rotating gate token.
    const qrPayload = `tmi-ticket:${ticket.id}`;

    return {
      id: ticket.id,
      status: ticket.status,
      issuedAt: ticket.issuedAt,
      checkedInAt: ticket.checkedInAt,
      createdAt: ticket.createdAt,
      event: ticket.event,
      ticketType: ticket.ticketType,
      qrPayload,
    };
  }

  async listMyTickets(
    userId: string,
    opts?: { status?: string; eventId?: string; limit?: number; cursor?: string },
  ) {
    const limit = Math.max(1, Math.min(100, opts?.limit ?? 20));

    const items = await this.prisma.ticket.findMany({
      where: {
        ownerUserId: userId,
        ...(opts?.status ? { status: opts.status as any } : {}),
        ...(opts?.eventId ? { eventId: opts.eventId } : {}),
        ...(opts?.cursor ? { id: { lt: opts.cursor } } : {}),
      },
      orderBy: { createdAt: 'desc' },
      take: limit + 1,
      include: {
        event: {
          select: {
            id: true,
            title: true,
            startsAt: true,
            venueName: true,
            venueCity: true,
          },
        },
        ticketType: {
          select: {
            id: true,
            name: true,
            priceCents: true,
            currency: true,
          },
        },
      },
    });

    const hasMore = items.length > limit;
    const data = hasMore ? items.slice(0, limit) : items;
    return {
      items: data.map((ticket) => this.toMyTicketView(ticket)),
      nextCursor: hasMore ? data[data.length - 1].id : null,
    };
  }

  async getMyTicket(userId: string, id: string) {
    const ticket = await this.prisma.ticket.findFirst({
      where: { id, ownerUserId: userId },
      include: {
        event: {
          select: {
            id: true,
            title: true,
            startsAt: true,
            venueName: true,
            venueCity: true,
          },
        },
        ticketType: {
          select: {
            id: true,
            name: true,
            priceCents: true,
            currency: true,
          },
        },
      },
    });

    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }

    return this.toMyTicketView(ticket);
  }

  private qrSecret(): string {
    return process.env.TICKET_QR_SECRET?.trim() || 'dev-qr-secret-CHANGE-IN-PROD';
  }

  async generateQrToken(userId: string, ticketId: string) {
    if (!this.dev) {
      const ticket = await this.getMyTicket(userId, ticketId);
      if (ticket.status !== 'ACTIVE') {
        throw new ForbiddenException('Ticket is not active');
      }
    }

    const nonce = randomBytes(8).toString('hex');
    const exp = Math.floor(Date.now() / 1000) + 5 * 60; // 5-minute window
    const message = `v1.${ticketId}.${nonce}.${exp}`;
    const hmac = createHmac('sha256', this.qrSecret()).update(message).digest('hex').slice(0, 32);
    return {
      token: `${message}.${hmac}`,
      expiresAt: new Date(exp * 1000).toISOString(),
    };
  }

  private async verifySignedQrToken(token: string) {
    const parts = token.split('.');
    if (parts.length !== 5 || parts[0] !== 'v1') {
      return { ok: false, valid: false, reason: 'INVALID_FORMAT' as const };
    }
    const [, ticketId, nonce, expStr, providedHmac] = parts;
    const exp = parseInt(expStr, 10);
    if (isNaN(exp) || Math.floor(Date.now() / 1000) > exp) {
      return { ok: false, valid: false, reason: 'EXPIRED' as const };
    }

    const message = `v1.${ticketId}.${nonce}.${expStr}`;
    const expectedHmac = createHmac('sha256', this.qrSecret()).update(message).digest('hex').slice(0, 32);
    const providedBuf = Buffer.from(providedHmac, 'hex');
    const expectedBuf = Buffer.from(expectedHmac, 'hex');
    if (providedBuf.length !== expectedBuf.length || !timingSafeEqual(providedBuf, expectedBuf)) {
      return { ok: false, valid: false, reason: 'INVALID_SIGNATURE' as const };
    }

    if (this.dev) {
      return {
        ok: true,
        valid: true,
        ticket: {
          id: ticketId,
          status: 'ACTIVE',
          event: { id: 'dev-event-1', title: 'Dev Event', startsAt: new Date().toISOString(), venueName: 'Dev Venue' },
          ticketType: { id: 'dev-type-1', name: 'DEV' },
        },
      };
    }

    const ticket = await this.prisma.ticket.findFirst({
      where: { id: ticketId, status: 'ACTIVE' },
      include: {
        event: { select: { id: true, title: true, startsAt: true, venueName: true } },
        ticketType: { select: { id: true, name: true } },
      },
    });
    if (!ticket) {
      return { ok: false, valid: false, reason: 'NOT_FOUND' as const };
    }
    return {
      ok: true,
      valid: true,
      ticket: {
        id: ticket.id,
        status: ticket.status,
        event: ticket.event,
        ticketType: ticket.ticketType,
      },
    };
  }

  private async checkInBySignedQrToken(token: string) {
    const verifyResult = await this.verifySignedQrToken(token);
    if (!verifyResult.valid) {
      return { ok: false, reason: verifyResult.reason };
    }
    const ticketId = verifyResult.ticket!.id;

    if (this.dev) {
      return { ok: true, already: false, ticketId };
    }

    const existing = await this.prisma.ticket.findFirst({
      where: { id: ticketId },
      select: { status: true, checkedInAt: true },
    });
    if (!existing) return { ok: false, reason: 'NOT_FOUND' as const };
    if (existing.checkedInAt) return { ok: true, already: true };
    if (existing.status !== 'ACTIVE') return { ok: false, reason: 'NOT_ACTIVE' as const };

    await this.prisma.ticket.update({
      where: { id: ticketId },
      data: { status: 'USED', checkedInAt: new Date() },
    });
    return { ok: true, already: false, ticketId };
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
