import { Controller, Get, Post, Body } from '@nestjs/common';
import { CypherService } from './cypher.service';

@Controller('cypher')
export class CypherController {
  constructor(private readonly cypherService: CypherService) {}

  @Get('active')
  async getActiveCyphers() {
    return this.cypherService.getActiveCyphers();
  }

  @Post('start')
  async startCypher(@Body() body: { roomId: string; hostId: string; theme?: string }) {
    return this.cypherService.startCypher(body);
  }
}
