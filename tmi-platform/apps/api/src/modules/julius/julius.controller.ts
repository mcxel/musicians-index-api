import { Controller, Get, Post, Param, Body, Request, UseGuards } from '@nestjs/common';
import { JuliusService } from './julius.service';
import { AuthGuard } from '../auth/guards/auth.guard';

@Controller('julius')
@UseGuards(AuthGuard)
export class JuliusController {
  constructor(private readonly juliusService: JuliusService) {}

  @Get('variants')
  getAllVariants() {
    return this.juliusService.getAllVariants();
  }

  @Get('variants/:id')
  getVariant(@Param('id') id: string) {
    return this.juliusService.getVariant(id);
  }

  @Get('effects')
  getAllEffects() {
    return this.juliusService.getAllEffects();
  }

  @Get('me/unlocks')
  getMyUnlocks(@Request() req: any) {
    return this.juliusService.getMyUnlocks(req.user.id);
  }

  @Post('variants/:id/unlock')
  unlockVariant(
    @Param('id') id: string,
    @Request() req: any,
    @Body() body: { source?: string },
  ) {
    return this.juliusService.unlockVariant(req.user.id, id, body.source);
  }
}
