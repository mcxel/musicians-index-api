import { Controller, Get, Query, Req } from '@nestjs/common';
import type { Request } from 'express';
import { FeedService } from './feed.service';

const SESSION_COOKIE = 'phase11_session';

@Controller('feed')
export class FeedController {
  constructor(private readonly feedService: FeedService) {}

  @Get()
  getFeed(
    @Req() req: Request,
    @Query('limit') limit = '20',
    @Query('cursor') cursor?: string,
  ) {
    return this.feedService.getFeed(req.cookies?.[SESSION_COOKIE], parseInt(limit, 10) || 20, cursor);
  }
}
