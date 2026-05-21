import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import type { Request } from 'express';
import { PrismaService } from '../modules/prisma/prisma.service';
import { requireSessionUser } from './guard-utils';

@Injectable()
export class TicketOwnerGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const user = await requireSessionUser(this.prisma, request);

    const ticketId = (request.params?.ticketId || request.params?.id || request.body?.ticketId) as string | undefined;
    if (!ticketId) {
      throw new ForbiddenException('ticketId is required');
    }

    const ticket = await this.prisma.ticket.findUnique({
      where: { id: ticketId },
      select: { ownerUserId: true },
    });

    if (!ticket) {
      throw new ForbiddenException('Ticket not found');
    }

    if (ticket.ownerUserId !== user.id) {
      throw new ForbiddenException('Ticket owner required');
    }

    return true;
  }
}
