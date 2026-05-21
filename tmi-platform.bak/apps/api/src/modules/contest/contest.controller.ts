/**
 * contest.controller.ts
 * TMI Grand Platform Contest — API Controller
 * BerntoutGlobal XXL
 *
 * Repo path: apps/api/src/modules/contest/contest.controller.ts
 * Dependencies: ContestService, JwtAuthGuard, RolesGuard
 * Wiring: Import in contest.module.ts, add ContestModule to app.module.ts
 */

import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ContestService } from './contest.service';
import {
  CreateContestEntryDto,
  InviteSponsorDto,
  CastVoteDto,
  CreateSeasonDto,
  UpdateEntryStatusDto,
  AdminApprovalDto,
} from './contest.dto';
// TODO: Import from your existing auth guards path
// import { JwtAuthGuard } from '../auth/jwt-auth.guard';
// import { RolesGuard } from '../auth/roles.guard';
// import { Roles } from '../auth/roles.decorator';

@Controller('contest')
export class ContestController {
  constructor(private readonly contestService: ContestService) {}

  // ─── Season Endpoints ───────────────────────────────────────────────────────

  /** GET /contest/seasons — list all seasons */
  @Get('seasons')
  async listSeasons() {
    return this.contestService.listSeasons();
  }

  /** GET /contest/seasons/active — get current active season */
  @Get('seasons/active')
  async getActiveSeason() {
    const season = await this.contestService.getActiveSeason();
    if (!season) {
      throw new NotFoundException('No active season');
    }
    return season;
  }

  /** GET /contest/seasons/:id — get specific season */
  @Get('seasons/:id')
  async getSeason(@Param('id') id: string) {
    return this.contestService.getSeasonById(id);
  }

  /** POST /contest/seasons — admin create season */
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles('admin')
  @Post('seasons')
  async createSeason(@Body() dto: CreateSeasonDto) {
    return this.contestService.createSeason(dto);
  }

  // ─── Entry Endpoints ─────────────────────────────────────────────────────────

  /** GET /contest/entries — list all qualified/active entries */
  @Get('entries')
  async listEntries(
    @Query('category') category?: string,
    @Query('status') status?: string,
    @Query('seasonId') seasonId?: string,
    @Query('page') page = '1',
    @Query('limit') limit = '20',
  ) {
    return this.contestService.listEntries({ category, status, seasonId, page: +page, limit: +limit });
  }

  /** GET /contest/entries/:id — single entry with sponsor progress */
  @Get('entries/:id')
  async getEntry(@Param('id') id: string) {
    return this.contestService.getEntryById(id);
  }

  /** GET /contest/entries/artist/:artistId — get entry by artist */
  @Get('entries/artist/:artistId')
  async getEntryByArtist(@Param('artistId') artistId: string) {
    return this.contestService.getEntryByArtist(artistId);
  }

  /** POST /contest/entries — artist submits contest entry */
  // @UseGuards(JwtAuthGuard)
  @Post('entries')
  @HttpCode(HttpStatus.CREATED)
  async createEntry(
    @Body() dto: CreateContestEntryDto,
    // @Request() req: any,
  ) {
    // dto.artistId = req.user.id; // uncomment once auth wired
    return this.contestService.createEntry(dto);
  }

  /** PATCH /contest/entries/:id/status — admin update entry status */
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles('admin')
  @Patch('entries/:id/status')
  async updateEntryStatus(
    @Param('id') id: string,
    @Body() dto: UpdateEntryStatusDto,
  ) {
    return this.contestService.updateEntryStatus(id, dto);
  }

  // ─── Sponsor Endpoints ───────────────────────────────────────────────────────

  /** POST /contest/entries/:id/invite-sponsor — artist invites a sponsor */
  // @UseGuards(JwtAuthGuard)
  @Post('entries/:id/invite-sponsor')
  async inviteSponsor(
    @Param('id') entryId: string,
    @Body() dto: InviteSponsorDto,
  ) {
    return this.contestService.inviteSponsor(entryId, dto);
  }

  /** GET /contest/entries/:id/sponsors — get sponsors for an entry */
  @Get('entries/:id/sponsors')
  async getEntrySponsors(@Param('id') entryId: string) {
    return this.contestService.getEntrySponsors(entryId);
  }

  /** POST /contest/entries/:id/sponsors/:sponsorId/approve — admin approve sponsor */
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles('admin')
  @Post('entries/:id/sponsors/:sponsorId/approve')
  async approveSponsor(
    @Param('id') entryId: string,
    @Param('sponsorId') sponsorId: string,
    @Body() dto: AdminApprovalDto,
  ) {
    return this.contestService.approveSponsorContribution(entryId, sponsorId, dto);
  }

  /** GET /contest/sponsor-leaderboard — sponsors ranked by most artists backed */
  @Get('sponsor-leaderboard')
  async getSponsorLeaderboard(
    @Query('seasonId') seasonId?: string,
    @Query('limit') limit = '20',
  ) {
    return this.contestService.getSponsorLeaderboard(seasonId, +limit);
  }

  /** GET /contest/sponsor-packages — available sponsor packages/tiers */
  @Get('sponsor-packages')
  async getSponsorPackages() {
    return this.contestService.getSponsorPackages();
  }

  // ─── Voting Endpoints ────────────────────────────────────────────────────────

  /** POST /contest/vote — fan casts a vote */
  // @UseGuards(JwtAuthGuard)
  @Post('vote')
  async castVote(
    @Body() dto: CastVoteDto,
    // @Request() req: any,
  ) {
    // dto.voterId = req.user.id;
    return this.contestService.castVote(dto);
  }

  /** GET /contest/leaderboard — contestants ranked by votes */
  @Get('leaderboard')
  async getLeaderboard(
    @Query('seasonId') seasonId?: string,
    @Query('roundId') roundId?: string,
    @Query('category') category?: string,
  ) {
    return this.contestService.getLeaderboard({ seasonId, roundId, category });
  }

  // ─── Rounds Endpoints ───────────────────────────────────────────────────────

  /** GET /contest/rounds — list contest rounds for active season */
  @Get('rounds')
  async listRounds(@Query('seasonId') seasonId?: string) {
    return this.contestService.listRounds(seasonId);
  }

  // ─── Prize Endpoints ─────────────────────────────────────────────────────────

  /** GET /contest/prizes — list prizes for active season */
  @Get('prizes')
  async listPrizes(@Query('seasonId') seasonId?: string) {
    return this.contestService.listPrizes(seasonId);
  }

  // ─── Host / Script Endpoints ─────────────────────────────────────────────────

  /** GET /contest/host/scripts — get Ray Journey script pack */
  @Get('host/scripts')
  async getHostScripts(@Query('type') type?: string) {
    return this.contestService.getHostScripts(type);
  }

  /** POST /contest/host/cue — admin/host triggers a cue live */
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles('admin', 'host')
  @Post('host/cue')
  async triggerHostCue(@Body() body: { scriptId: string; context?: Record<string, unknown> }) {
    return this.contestService.triggerHostCue(body.scriptId, body.context);
  }

  // ─── Analytics Endpoints ─────────────────────────────────────────────────────

  /** GET /contest/analytics — overall contest analytics */
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles('admin')
  @Get('analytics')
  async getAnalytics(
    @Query('seasonId') seasonId?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.contestService.getAnalytics({ seasonId, from, to });
  }

  /** GET /contest/analytics/sponsor/:sponsorId — sponsor ROI analytics */
  // @UseGuards(JwtAuthGuard)
  @Get('analytics/sponsor/:sponsorId')
  async getSponsorAnalytics(
    @Param('sponsorId') sponsorId: string,
    @Query('seasonId') seasonId?: string,
  ) {
    return this.contestService.getSponsorAnalytics(sponsorId, seasonId);
  }

  // ─── Admin Queue Endpoints ───────────────────────────────────────────────────

  /** GET /contest/admin/queue/contestants — unapproved contestant entries */
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles('admin')
  @Get('admin/queue/contestants')
  async getContestantQueue(
    @Query('status') status = 'pending',
    @Request() req?: { headers?: { authorization?: string } },
  ) {
    if (!req?.headers?.authorization) {
      throw new UnauthorizedException('Authentication required');
    }
    return this.contestService.getContestantQueue(status);
  }

  /** GET /contest/admin/queue/sponsors — unapproved sponsor contributions */
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles('admin')
  @Get('admin/queue/sponsors')
  async getSponsorQueue(
    @Query('status') status = 'pending',
    @Request() req?: { headers?: { authorization?: string } },
  ) {
    if (!req?.headers?.authorization) {
      throw new UnauthorizedException('Authentication required');
    }
    return this.contestService.getSponsorQueue(status);
  }

  /** GET /contest/admin/audit — audit log */
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles('admin')
  @Get('admin/audit')
  async getAuditLog(
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('action') action?: string,
  ) {
    return this.contestService.getAuditLog({ from, to, action });
  }
}
