import { Body, Controller, Get, HttpCode, Param, Post, Req } from '@nestjs/common';
import type { Request } from 'express';
import { InvitesService } from './invites.service';

const SESSION_COOKIE = 'phase11_session';

@Controller('invites')
export class InvitesController {
  constructor(private readonly invitesService: InvitesService) {}

  // ── INBOX (all pending invites) ───────────────────────────
  @Get('inbox')
  getInbox(@Req() req: Request) {
    return this.invitesService.getInviteInbox(req.cookies?.[SESSION_COOKIE]);
  }

  // ── ROOM INVITES ──────────────────────────────────────────
  @Get('room')
  getMyRoomInvites(@Req() req: Request) {
    return this.invitesService.getMyRoomInvites(req.cookies?.[SESSION_COOKIE]);
  }

  @Post('room')
  @HttpCode(200)
  sendRoomInvite(@Req() req: Request, @Body() body: { roomId: string; recipientId: string }) {
    return this.invitesService.sendRoomInvite(req.cookies?.[SESSION_COOKIE], body.roomId, body.recipientId);
  }

  @Post('room/:id/accept')
  @HttpCode(200)
  acceptRoomInvite(@Req() req: Request, @Param('id') id: string) {
    return this.invitesService.acceptRoomInvite(req.cookies?.[SESSION_COOKIE], id);
  }

  @Post('room/:id/decline')
  @HttpCode(200)
  declineRoomInvite(@Req() req: Request, @Param('id') id: string) {
    return this.invitesService.declineRoomInvite(req.cookies?.[SESSION_COOKIE], id);
  }

  // ── PARTY INVITES ─────────────────────────────────────────
  @Get('party')
  getMyPartyInvites(@Req() req: Request) {
    return this.invitesService.getMyPartyInvites(req.cookies?.[SESSION_COOKIE]);
  }

  @Post('party')
  @HttpCode(200)
  sendPartyInvite(
    @Req() req: Request,
    @Body() body: { recipientId: string; partyId?: string; lobbyId?: string; inviteType?: string },
  ) {
    return this.invitesService.sendPartyInvite(req.cookies?.[SESSION_COOKIE], body.recipientId, {
      partyId: body.partyId,
      lobbyId: body.lobbyId,
      inviteType: body.inviteType,
    });
  }

  @Post('party/:id/accept')
  @HttpCode(200)
  acceptPartyInvite(@Req() req: Request, @Param('id') id: string) {
    return this.invitesService.acceptPartyInvite(req.cookies?.[SESSION_COOKIE], id);
  }

  @Post('party/:id/decline')
  @HttpCode(200)
  declinePartyInvite(@Req() req: Request, @Param('id') id: string) {
    return this.invitesService.declinePartyInvite(req.cookies?.[SESSION_COOKIE], id);
  }

  // ── ARTIST INVITES ────────────────────────────────────────
  @Get('artist')
  getMyArtistInvites(@Req() req: Request) {
    return this.invitesService.getMyArtistInvites(req.cookies?.[SESSION_COOKIE]);
  }

  @Post('artist')
  @HttpCode(200)
  sendArtistInvite(
    @Req() req: Request,
    @Body()
    body: {
      recipientId: string;
      roomId?: string;
      eventId?: string;
      message?: string;
      role?: string;
      expiresInHours?: number;
    },
  ) {
    return this.invitesService.sendArtistInvite(req.cookies?.[SESSION_COOKIE], body.recipientId, {
      roomId: body.roomId,
      eventId: body.eventId,
      message: body.message,
      role: body.role,
      expiresInHours: body.expiresInHours,
    });
  }

  @Post('artist/:id/accept')
  @HttpCode(200)
  acceptArtistInvite(@Req() req: Request, @Param('id') id: string) {
    return this.invitesService.acceptArtistInvite(req.cookies?.[SESSION_COOKIE], id);
  }

  @Post('artist/:id/decline')
  @HttpCode(200)
  declineArtistInvite(@Req() req: Request, @Param('id') id: string) {
    return this.invitesService.declineArtistInvite(req.cookies?.[SESSION_COOKIE], id);
  }
}
