import { Controller, Get, Post, Delete, Param, Request, UseGuards } from '@nestjs/common';
import { PartyService } from './party.service';
import { AuthGuard } from '../auth/guards/auth.guard';

@Controller('party')
@UseGuards(AuthGuard)
export class PartyController {
  constructor(private readonly partyService: PartyService) {}

  @Post()
  createParty(@Request() req: any) {
    return this.partyService.createParty(req.user.id);
  }

  @Get('me')
  getMyParty(@Request() req: any) {
    return this.partyService.getMyParty(req.user.id);
  }

  @Get(':id')
  getParty(@Param('id') id: string) {
    return this.partyService.getParty(id);
  }

  @Post(':id/join')
  joinParty(@Param('id') id: string, @Request() req: any) {
    return this.partyService.joinParty(id, req.user.id);
  }

  @Delete(':id/leave')
  leaveParty(@Param('id') id: string, @Request() req: any) {
    return this.partyService.leaveParty(id, req.user.id);
  }

  @Delete(':id/disband')
  disbandParty(@Param('id') id: string, @Request() req: any) {
    return this.partyService.disbandParty(id, req.user.id);
  }
}
