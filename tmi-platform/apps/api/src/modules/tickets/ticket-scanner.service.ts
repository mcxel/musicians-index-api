import { Injectable, Logger, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as crypto from 'crypto';

@Injectable()
export class TicketScannerService {
  private readonly logger = new Logger(TicketScannerService.name);

  constructor(private readonly prisma: PrismaService) {}

  async generateTicketQR(ticketId: string, ownerId: string, eventId: string): Promise<string> {
    const payload = `${ticketId}:${ownerId}:${eventId}:${Date.now()}:${process.env.TICKET_SECRET_SALT}`;
    const qrHash = crypto.createHash('sha256').update(payload).digest('hex');

    // tokenHash is the schema field for ticket tokens
    await this.prisma.ticket.update({
      where: { id: ticketId },
      data: { tokenHash: qrHash },
    });

    return qrHash;
  }

  async generatePrintTemplate(ticketId: string) {
    const ticket = await this.prisma.ticket.findUnique({
      where: { id: ticketId },
      include: { ticketType: true, event: true },
    });
    if (!ticket) throw new BadRequestException('Ticket not found');

    return {
      layout: 'STANDARD_TMI_EVENT_TICKET',
      regions: {
        barcodeRegion: ticket.tokenHash,
        qrRegion: `https://themusicianindex.com/verify/${ticket.tokenHash}`,
        brandingRegion: 'DEFAULT_TMI_BRANDING',
        seatRegion: 'GENERAL_ADMISSION',
        eventDetails: {
          issuedAt: ticket.issuedAt,
          eventId: ticket.eventId,
          tier: ticket.ticketType.name,
        },
      },
    };
  }

  async processCheckIn(tokenHash: string, scannerId: string) {
    const ticket = await this.prisma.ticket.findUnique({ where: { tokenHash } });

    if (!ticket) {
      await this.logScan(null, scannerId, false, 'Invalid token hash');
      throw new ForbiddenException('Invalid ticket signature');
    }

    if (ticket.status === 'USED') {
      await this.logScan(ticket.id, scannerId, false, 'Ticket already used');
      throw new ForbiddenException('Ticket has already been scanned');
    }

    if (ticket.status === 'CANCELED' || ticket.status === 'REFUNDED') {
      await this.logScan(ticket.id, scannerId, false, `Ticket status: ${ticket.status}`);
      throw new ForbiddenException(`Ticket is ${ticket.status.toLowerCase()}`);
    }

    // Atomic admit — updateMany with status guard prevents double-scan race
    const result = await this.prisma.ticket.updateMany({
      where: { id: ticket.id, status: 'ACTIVE' },
      data: { status: 'USED', checkedInAt: new Date() },
    });

    if (result.count === 0) {
      throw new ForbiddenException('Ticket was scanned simultaneously at another gate');
    }

    await this.logScan(ticket.id, scannerId, true, 'Admitted');
    this.logger.log(`Ticket ${ticket.id} admitted for owner ${ticket.ownerUserId}`);

    return { success: true, ticketId: ticket.id, message: 'Check-in successful.' };
  }

  private async logScan(ticketId: string | null, scannerUserId: string, isValid: boolean, reason?: string) {
    if (!ticketId) return;
    await this.prisma.ticketScan.create({
      data: { ticketId, scannerUserId, isValid, reason },
    });
  }
}
