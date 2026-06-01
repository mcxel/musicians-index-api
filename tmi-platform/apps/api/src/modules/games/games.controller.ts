import { Controller, Get, Post, Body } from '@nestjs/common';
import { GamesService } from './games.service';

@Controller('games')
export class GamesController {
  constructor(private readonly gamesService: GamesService) {}

  @Get('active')
  async getActiveGames() {
    return this.gamesService.getActiveGames();
  }

  @Post('start')
  async startGame(@Body() body: { roomId: string; gameType: string }) {
    return this.gamesService.startGame(body.roomId, body.gameType);
  }
}
