import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PartyService {
  constructor(private readonly prisma: PrismaService) {}

  async createParty(leaderId: string) {
    return this.prisma.party.create({
      data: {
        leaderId,
        members: {
          create: { userId: leaderId },
        },
      },
      include: { members: { include: { user: { select: { id: true, name: true } } } } },
    });
  }

  async getParty(partyId: string) {
    const party = await this.prisma.party.findUnique({
      where: { id: partyId },
      include: { members: { include: { user: { select: { id: true, name: true } } } } },
    });
    if (!party) throw new NotFoundException('Party not found');
    return party;
  }

  async getMyParty(userId: string) {
    const membership = await this.prisma.partyMember.findFirst({
      where: { userId },
      include: {
        party: {
          include: { members: { include: { user: { select: { id: true, name: true } } } } },
        },
      },
    });
    return membership?.party ?? null;
  }

  async joinParty(partyId: string, userId: string) {
    const party = await this.prisma.party.findUnique({ where: { id: partyId } });
    if (!party) throw new NotFoundException('Party not found');

    const existing = await this.prisma.partyMember.findFirst({ where: { partyId, userId } });
    if (existing) return this.getParty(partyId);

    await this.prisma.partyMember.create({ data: { partyId, userId } });
    return this.getParty(partyId);
  }

  async leaveParty(partyId: string, userId: string) {
    const party = await this.prisma.party.findUnique({
      where: { id: partyId },
      include: { members: true },
    });
    if (!party) throw new NotFoundException('Party not found');

    await this.prisma.partyMember.deleteMany({ where: { partyId, userId } });

    // If leader left and others remain, promote next member
    if (party.leaderId === userId) {
      const remaining = party.members.filter((m) => m.userId !== userId);
      if (remaining.length > 0) {
        await this.prisma.party.update({
          where: { id: partyId },
          data: { leaderId: remaining[0].userId },
        });
      } else {
        // Dissolve empty party
        await this.prisma.party.delete({ where: { id: partyId } });
        return { dissolved: true };
      }
    }

    return { left: true };
  }

  async disbandParty(partyId: string, userId: string) {
    const party = await this.prisma.party.findUnique({ where: { id: partyId } });
    if (!party) throw new NotFoundException('Party not found');
    if (party.leaderId !== userId) throw new ForbiddenException('Only the leader can disband the party');

    await this.prisma.partyMember.deleteMany({ where: { partyId } });
    await this.prisma.party.delete({ where: { id: partyId } });
    return { disbanded: true };
  }
}
