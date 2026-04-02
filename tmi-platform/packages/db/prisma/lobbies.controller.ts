import { Controller, Get, Post, Body, UseGuards, Request } from '@nestjs/common';
import { LobbiesService } from './lobbies.service';
// import { JwtAuthGuard } from '../auth/jwt-auth.guard'; // Standard auth guard to be wired by Copilot

@Controller('api/lobbies')
// @UseGuards(JwtAuthGuard)
export class LobbiesController {
  constructor(private readonly lobbiesService: LobbiesService) {}

  @Get('my-lobby')
  async getMyLobby(@Request() req) {
    return this.lobbiesService.getLobbyByUser(req.user?.id || "temp-dev-user-id"); 
  }
  
  @Post('upgrade')
  async upgradeLobby(@Request() req, @Body() body: { tier: string }) {
    return this.lobbiesService.upgradeLobbyTier(req.user?.id || "temp-dev-user-id", body.tier as any);
  }
}