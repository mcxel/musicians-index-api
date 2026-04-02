import { Controller, Get, Post, Patch, Param, Body, Query, Request, UseGuards } from '@nestjs/common';
import { EventsService } from './events.service';
import { AuthGuard } from '../auth/guards/auth.guard';

@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Get()
  findAll(
    @Query('status') status?: string,
    @Query('artistUserId') artistUserId?: string,
    @Query('venueUserId') venueUserId?: string,
  ) {
    return this.eventsService.findAll({ status, artistUserId, venueUserId });
  }

  @Get('upcoming')
  getUpcoming(@Query('limit') limit?: string) {
    return this.eventsService.getUpcoming(limit ? parseInt(limit) : 20);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.eventsService.findOne(id);
  }

  @Post()
  @UseGuards(AuthGuard)
  create(@Body() body: any, @Request() req: any) {
    return this.eventsService.create({
      ...body,
      startsAt: new Date(body.startsAt),
      endsAt: body.endsAt ? new Date(body.endsAt) : undefined,
      artistUserId: body.artistUserId ?? req.user.id,
    });
  }

  @Patch(':id')
  @UseGuards(AuthGuard)
  update(@Param('id') id: string, @Body() body: any) {
    return this.eventsService.update(id, body);
  }

  @Patch(':id/publish')
  @UseGuards(AuthGuard)
  publish(@Param('id') id: string) {
    return this.eventsService.publish(id);
  }

  @Patch(':id/cancel')
  @UseGuards(AuthGuard)
  cancel(@Param('id') id: string) {
    return this.eventsService.cancel(id);
  }
}
