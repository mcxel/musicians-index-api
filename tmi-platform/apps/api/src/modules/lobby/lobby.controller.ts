import { Controller, Get, Post, Patch, Delete, Body, Param, Request, UseGuards } from '@nestjs/common';
import { LobbyService } from './lobby.service';
import { AuthGuard } from '../auth/guards/auth.guard';

@Controller('lobby')
@UseGuards(AuthGuard)
export class LobbyController {
  constructor(private readonly lobbyService: LobbyService) {}

  @Get('me')
  getMyLobby(@Request() req: any) {
    return this.lobbyService.getOrCreateLobby(req.user.id);
  }

  @Patch('me')
  updateMyLobby(@Request() req: any, @Body() body: { tier?: string; theme?: string; level?: number }) {
    return this.lobbyService.updateLobby(req.user.id, body);
  }

  @Post('me/items')
  addDisplayItem(@Request() req: any, @Body() body: { type: string; assetId: string; position?: object }) {
    return this.lobbyService.addDisplayItem(req.user.id, body);
  }

  @Delete('me/items/:itemId')
  removeDisplayItem(@Request() req: any, @Param('itemId') itemId: string) {
    return this.lobbyService.removeDisplayItem(req.user.id, itemId);
  }

  @Get('themes')
  getThemes() {
    return this.lobbyService.getThemes();
  }
}
