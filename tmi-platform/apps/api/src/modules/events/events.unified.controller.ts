import { Body, Controller, Get, Param, Post, Query, Request, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/guards/auth.guard';
import { EventsService } from './events.service';

@Controller()
export class EventsUnifiedController {
  constructor(private readonly eventsService: EventsService) {}

  @Get('admin/events')
  getAdminEvents(@Query('status') status?: string) {
    return this.eventsService.findAll({ status });
  }

  @Get('admin/events/momentum')
  getAdminMomentum(@Query('limit') limit?: string) {
    return this.eventsService.getAdminMomentum(limit ? parseInt(limit, 10) : 50);
  }

  @Post('events/create')
  @UseGuards(AuthGuard)
  createEventAlias(
    @Body() body: { title: string; description?: string; startsAt: string; endsAt?: string },
    @Request() req: any,
  ) {
    return this.eventsService.create({
      title: body.title,
      description: body.description,
      startsAt: new Date(body.startsAt),
      endsAt: body.endsAt ? new Date(body.endsAt) : undefined,
      artistUserId: req.authUserId,
    });
  }

  @Get('beats/pool')
  getBeatPoolAlias(@Query('poolType') poolType?: string, @Query('limit') limit?: string) {
    return this.eventsService.getBeatPool((poolType as any) ?? 'PLATFORM_POOL', limit ? parseInt(limit, 10) : 20);
  }

  @Post('beats/select')
  @UseGuards(AuthGuard)
  selectBeatAlias(
    @Body() body: { eventId: string; beatId: string; poolType: string },
    @Request() req: any,
  ) {
    return this.eventsService.selectBeatForEvent({
      eventId: body.eventId,
      beatId: body.beatId,
      poolType: body.poolType as any,
      selectedBy: req.authUserId,
    });
  }

  @Get('beats/live/:eventId')
  getBeatLiveAlias(@Param('eventId') eventId: string) {
    return this.eventsService.getLiveBeat(eventId);
  }

  @Get('stats/events')
  async getEventStats() {
    const now = new Date();
    const [upcoming, activeMini, activeArena] = await Promise.all([
      this.eventsService.getUpcoming(50),
      this.eventsService.findAll({ status: 'PUBLISHED' }),
      this.eventsService.findAll({ status: 'STARTED' }),
    ]);

    return {
      generatedAt: now.toISOString(),
      upcomingCount: upcoming.length,
      publishedCount: activeMini.length,
      liveCount: activeArena.length,
      note: 'Unified Event Framework stats snapshot',
    };
  }

  @Get('admin/event-templates')
  getAdminTemplates() {
    return this.eventsService.getTemplates();
  }

  @Post('mini/cypher')
  @UseGuards(AuthGuard)
  createMiniCypher(@Body() body: { startsAt: string; title?: string; description?: string }, @Request() req: any) {
    return this.eventsService.activateTemplate({
      userId: req.authUserId,
      templateKey: 'cypher.mini',
      startsAt: new Date(body.startsAt),
      title: body.title,
      description: body.description,
    });
  }

  @Post('mini/battle')
  @UseGuards(AuthGuard)
  createMiniBattle(@Body() body: { startsAt: string; title?: string; description?: string }, @Request() req: any) {
    return this.eventsService.activateTemplate({
      userId: req.authUserId,
      templateKey: 'battle.mini',
      startsAt: new Date(body.startsAt),
      title: body.title,
      description: body.description,
    });
  }

  @Post('mini/dirty-dozens')
  @UseGuards(AuthGuard)
  createMiniDirtyDozens(@Body() body: { startsAt: string; title?: string; description?: string }, @Request() req: any) {
    return this.eventsService.activateTemplate({
      userId: req.authUserId,
      templateKey: 'dirty-dozens.mini',
      startsAt: new Date(body.startsAt),
      title: body.title,
      description: body.description,
    });
  }

  @Post('mini/comedy')
  @UseGuards(AuthGuard)
  createMiniComedy(@Body() body: { startsAt: string; title?: string; description?: string }, @Request() req: any) {
    return this.eventsService.activateTemplate({
      userId: req.authUserId,
      templateKey: 'comedy.joke-off-mini',
      startsAt: new Date(body.startsAt),
      title: body.title,
      description: body.description,
    });
  }

  @Post('mini/dance')
  @UseGuards(AuthGuard)
  createMiniDance(@Body() body: { startsAt: string; title?: string; description?: string }, @Request() req: any) {
    return this.eventsService.activateTemplate({
      userId: req.authUserId,
      templateKey: 'dance.mini-off',
      startsAt: new Date(body.startsAt),
      title: body.title,
      description: body.description,
    });
  }

  @Post('arena/cypher')
  @UseGuards(AuthGuard)
  createArenaCypher(@Body() body: { startsAt: string; title?: string; description?: string }, @Request() req: any) {
    return this.eventsService.activateTemplate({
      userId: req.authUserId,
      templateKey: 'cypher.standard',
      startsAt: new Date(body.startsAt),
      title: body.title,
      description: body.description,
    });
  }

  @Post('arena/battle')
  @UseGuards(AuthGuard)
  createArenaBattle(@Body() body: { startsAt: string; title?: string; description?: string }, @Request() req: any) {
    return this.eventsService.activateTemplate({
      userId: req.authUserId,
      templateKey: 'battle.arena',
      startsAt: new Date(body.startsAt),
      title: body.title,
      description: body.description,
    });
  }

  @Post('arena/dirty-dozens')
  @UseGuards(AuthGuard)
  createArenaDirtyDozens(@Body() body: { startsAt: string; title?: string; description?: string }, @Request() req: any) {
    return this.eventsService.activateTemplate({
      userId: req.authUserId,
      templateKey: 'dirty-dozens.tournament',
      startsAt: new Date(body.startsAt),
      title: body.title,
      description: body.description,
    });
  }

  @Post('arena/comedy')
  @UseGuards(AuthGuard)
  createArenaComedy(@Body() body: { startsAt: string; title?: string; description?: string }, @Request() req: any) {
    return this.eventsService.activateTemplate({
      userId: req.authUserId,
      templateKey: 'comedy.night',
      startsAt: new Date(body.startsAt),
      title: body.title,
      description: body.description,
    });
  }

  @Post('arena/dance')
  @UseGuards(AuthGuard)
  createArenaDance(@Body() body: { startsAt: string; title?: string; description?: string }, @Request() req: any) {
    return this.eventsService.activateTemplate({
      userId: req.authUserId,
      templateKey: 'dance.night',
      startsAt: new Date(body.startsAt),
      title: body.title,
      description: body.description,
    });
  }
}
