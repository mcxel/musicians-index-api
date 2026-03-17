// tmi-platform/apps/api/src/modules/editorial/editorial.controller.ts
import { Controller, Get, HttpCode, Param, Post, UseGuards } from '@nestjs/common';
import { AdminGuard } from '../auth/guards/admin.guard';
import { EditorialService } from './editorial.service';

@Controller('editorial')
export class EditorialController {
  constructor(private readonly editorialService: EditorialService) {}

  @Get('articles/:articleId')
  async getArticle(@Param('articleId') articleId: string) {
    return this.editorialService.getArticleById(articleId);
  }

  @Get('articles/slug/:slug')
  async getArticleBySlug(@Param('slug') slug: string) {
    return this.editorialService.getPublishedArticleBySlug(slug);
  }

  @Post('snapshot-poll/:roundId')
  @UseGuards(AdminGuard)
  @HttpCode(201)
  async snapshotPoll(@Param('roundId') roundId: string) {
    return this.editorialService.createPollSnapshot(roundId);
  }

  @Post('generate-article/:snapshotId')
  @UseGuards(AdminGuard)
  @HttpCode(201)
  async generateArticle(@Param('snapshotId') snapshotId: string) {
    return this.editorialService.generateArticleFromSnapshot(snapshotId);
  }
}
