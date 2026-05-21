import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

const SESSION_COOKIE_KEY = 'phase11_session';

@Injectable()
export class InvitesService {
  constructor(private readonly prisma: PrismaService) {}

  // ── SESSION RESOLUTION ────────────────────────────────────────────────────

  private async resolveUserId(token: string | undefined): Promise<string> {
    if (!token) throw new UnauthorizedException();
    const session = await this.prisma.session.findUnique({
      where: { sessionToken: token },
      select: { userId: true, expires: true },
    });
    if (!session || session.expires < new Date()) throw new UnauthorizedException();
    return session.userId;
  }

  // ── ROOM INVITES ─────────────────────────────────────────────────────────

  async sendRoomInvite(token: string | undefined, roomId: string, recipientId: string) {
    const senderId = await this.resolveUserId(token);
    if (!roomId || !recipientId || recipientId === senderId) {
      throw new BadRequestException('invalid_params');
    }

    // Verify room exists
    const room = await this.prisma.room.findUnique({ where: { id: roomId } });
    if (!room) throw new NotFoundException('room_not_found');

    // Check for existing pending invite
    const existing = await this.prisma.roomInvite.findFirst({
      where: { roomId, senderId, recipientId, status: 'pending' },
    });
    if (existing) return { success: true, alreadyPending: true, inviteId: existing.id };

    const invite = await this.prisma.roomInvite.create({
      data: { roomId, senderId, recipientId, status: 'pending' },
    });

    return { success: true, inviteId: invite.id };
  }

  async getMyRoomInvites(token: string | undefined) {
    const userId = await this.resolveUserId(token);
    const invites = await this.prisma.roomInvite.findMany({
      where: { recipientId: userId, status: 'pending' },
      include: {
        room: { select: { id: true, name: true, type: true, status: true } },
        sender: { select: { id: true, name: true, image: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    return { invites };
  }

  async acceptRoomInvite(token: string | undefined, inviteId: string) {
    const userId = await this.resolveUserId(token);
    const invite = await this.prisma.roomInvite.findUnique({ where: { id: inviteId } });
    if (!invite) throw new NotFoundException('invite_not_found');
    if (invite.recipientId !== userId) throw new ForbiddenException('not_your_invite');
    if (invite.status !== 'pending') {
      return { success: false, reason: `already_${invite.status}` };
    }

    const updated = await this.prisma.roomInvite.update({
      where: { id: inviteId },
      data: { status: 'accepted', acceptedAt: new Date(), respondedAt: new Date() },
    });

    return { success: true, roomId: updated.roomId };
  }

  async declineRoomInvite(token: string | undefined, inviteId: string) {
    const userId = await this.resolveUserId(token);
    const invite = await this.prisma.roomInvite.findUnique({ where: { id: inviteId } });
    if (!invite) throw new NotFoundException('invite_not_found');
    if (invite.recipientId !== userId) throw new ForbiddenException('not_your_invite');
    if (invite.status !== 'pending') {
      return { success: false, reason: `already_${invite.status}` };
    }

    await this.prisma.roomInvite.update({
      where: { id: inviteId },
      data: { status: 'declined', respondedAt: new Date() },
    });

    return { success: true };
  }

  // ── PARTY INVITES ─────────────────────────────────────────────────────────

  async sendPartyInvite(
    token: string | undefined,
    recipientId: string,
    opts: { partyId?: string; lobbyId?: string; inviteType?: string },
  ) {
    const senderId = await this.resolveUserId(token);
    if (!recipientId || recipientId === senderId) throw new BadRequestException('invalid_target');
    if (!opts.partyId && !opts.lobbyId) throw new BadRequestException('partyId_or_lobbyId_required');

    const existing = await this.prisma.partyInvite.findFirst({
      where: {
        senderId,
        recipientId,
        status: 'pending',
        ...(opts.partyId ? { partyId: opts.partyId } : { lobbyId: opts.lobbyId }),
      },
    });
    if (existing) return { success: true, alreadyPending: true, inviteId: existing.id };

    const invite = await this.prisma.partyInvite.create({
      data: {
        senderId,
        recipientId,
        partyId: opts.partyId,
        lobbyId: opts.lobbyId,
        inviteType: opts.inviteType ?? 'party',
        status: 'pending',
      },
    });

    return { success: true, inviteId: invite.id };
  }

  async getMyPartyInvites(token: string | undefined) {
    const userId = await this.resolveUserId(token);
    const invites = await this.prisma.partyInvite.findMany({
      where: { recipientId: userId, status: 'pending' },
      include: {
        sender: { select: { id: true, name: true, image: true } },
        party: { select: { id: true } },
        lobby: { select: { id: true, tier: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    return { invites };
  }

  async acceptPartyInvite(token: string | undefined, inviteId: string) {
    const userId = await this.resolveUserId(token);
    const invite = await this.prisma.partyInvite.findUnique({ where: { id: inviteId } });
    if (!invite) throw new NotFoundException('invite_not_found');
    if (invite.recipientId !== userId) throw new ForbiddenException('not_your_invite');
    if (invite.status !== 'pending') return { success: false, reason: `already_${invite.status}` };

    const updated = await this.prisma.partyInvite.update({
      where: { id: inviteId },
      data: { status: 'accepted', acceptedAt: new Date(), respondedAt: new Date() },
    });

    return { success: true, partyId: updated.partyId, lobbyId: updated.lobbyId };
  }

  async declinePartyInvite(token: string | undefined, inviteId: string) {
    const userId = await this.resolveUserId(token);
    const invite = await this.prisma.partyInvite.findUnique({ where: { id: inviteId } });
    if (!invite) throw new NotFoundException('invite_not_found');
    if (invite.recipientId !== userId) throw new ForbiddenException('not_your_invite');
    if (invite.status !== 'pending') return { success: false, reason: `already_${invite.status}` };

    await this.prisma.partyInvite.update({
      where: { id: inviteId },
      data: { status: 'declined', respondedAt: new Date() },
    });

    return { success: true };
  }

  // ── ARTIST INVITES ────────────────────────────────────────────────────────

  async sendArtistInvite(
    token: string | undefined,
    recipientId: string,
    opts: { roomId?: string; eventId?: string; message?: string; role?: string; expiresInHours?: number },
  ) {
    const senderId = await this.resolveUserId(token);
    if (!recipientId || recipientId === senderId) throw new BadRequestException('invalid_target');

    const expiresAt = opts.expiresInHours
      ? new Date(Date.now() + opts.expiresInHours * 60 * 60 * 1000)
      : new Date(Date.now() + 72 * 60 * 60 * 1000); // default 72h

    // Check for existing pending invite for same room/event
    const existing = await (this.prisma as any).artistInvite?.findFirst({
      where: {
        senderId,
        recipientId,
        status: 'pending',
        ...(opts.roomId ? { roomId: opts.roomId } : {}),
        ...(opts.eventId ? { eventId: opts.eventId } : {}),
      },
    });
    if (existing) return { success: true, alreadyPending: true, inviteId: existing.id };

    const invite = await (this.prisma as any).artistInvite?.create({
      data: {
        senderId,
        recipientId,
        roomId: opts.roomId,
        eventId: opts.eventId,
        message: opts.message,
        role: opts.role ?? 'performer',
        status: 'pending',
        expiresAt,
      },
    });

    return { success: true, inviteId: invite?.id };
  }

  async getMyArtistInvites(token: string | undefined) {
    const userId = await this.resolveUserId(token);
    const invites = await (this.prisma as any).artistInvite?.findMany({
      where: { recipientId: userId, status: 'pending' },
      include: {
        sender: { select: { id: true, name: true, image: true } },
        room: { select: { id: true, name: true, type: true } },
        event: { select: { id: true, title: true, startsAt: true } },
      },
      orderBy: { createdAt: 'desc' },
    }) ?? [];
    return { invites };
  }

  async acceptArtistInvite(token: string | undefined, inviteId: string) {
    const userId = await this.resolveUserId(token);
    const invite = await (this.prisma as any).artistInvite?.findUnique({ where: { id: inviteId } });
    if (!invite) throw new NotFoundException('invite_not_found');
    if (invite.recipientId !== userId) throw new ForbiddenException('not_your_invite');
    if (invite.status !== 'pending') return { success: false, reason: `already_${invite.status}` };

    // Expire check
    if (invite.expiresAt && invite.expiresAt < new Date()) {
      await (this.prisma as any).artistInvite?.update({
        where: { id: inviteId },
        data: { status: 'expired', respondedAt: new Date() },
      });
      return { success: false, reason: 'invite_expired' };
    }

    const updated = await (this.prisma as any).artistInvite?.update({
      where: { id: inviteId },
      data: { status: 'accepted', acceptedAt: new Date(), respondedAt: new Date() },
    });

    return { success: true, roomId: updated?.roomId, eventId: updated?.eventId, role: updated?.role };
  }

  async declineArtistInvite(token: string | undefined, inviteId: string) {
    const userId = await this.resolveUserId(token);
    const invite = await (this.prisma as any).artistInvite?.findUnique({ where: { id: inviteId } });
    if (!invite) throw new NotFoundException('invite_not_found');
    if (invite.recipientId !== userId) throw new ForbiddenException('not_your_invite');
    if (invite.status !== 'pending') return { success: false, reason: `already_${invite.status}` };

    await (this.prisma as any).artistInvite?.update({
      where: { id: inviteId },
      data: { status: 'declined', respondedAt: new Date() },
    });

    return { success: true };
  }

  // ── COMBINED INBOX ────────────────────────────────────────────────────────

  async getInviteInbox(token: string | undefined) {
    const [roomInvites, partyInvites, artistInvites] = await Promise.all([
      this.getMyRoomInvites(token),
      this.getMyPartyInvites(token),
      this.getMyArtistInvites(token),
    ]);

    const total =
      roomInvites.invites.length + partyInvites.invites.length + artistInvites.invites.length;

    return {
      total,
      room: roomInvites.invites,
      party: partyInvites.invites,
      artist: artistInvites.invites,
    };
  }
}
