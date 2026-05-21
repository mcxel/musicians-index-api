import { Controller, Get, Post, Put, Param, Body, Request, UseGuards } from '@nestjs/common';
import { AdvertisersService } from './advertisers.service';
import { AuthGuard } from '../auth/guards/auth.guard';

@Controller('advertisers')
export class AdvertisersController {
  constructor(private readonly advertisersService: AdvertisersService) {}

  @Get('health')
  health() {
    return { status: 'ok', module: 'advertisers' };
  }

  // ── Creatives ────────────────────────────────────────────────────────────────

  @Post('creatives')
  @UseGuards(AuthGuard)
  uploadCreative(@Request() req: any, @Body() body: any) {
    return this.advertisersService.uploadCreative({ ...body, advertiserId: body.advertiserId ?? req.user.id });
  }

  @Get('creatives/mine')
  @UseGuards(AuthGuard)
  getMyCreatives(@Request() req: any) {
    return this.advertisersService.getCreativesForAdvertiser(req.user.id);
  }

  @Get('creatives/:id')
  @UseGuards(AuthGuard)
  getCreative(@Param('id') id: string) {
    return this.advertisersService.getCreativeById(id);
  }

  // ── Campaigns ────────────────────────────────────────────────────────────────

  @Post('campaigns')
  @UseGuards(AuthGuard)
  createCampaign(@Request() req: any, @Body() body: any) {
    return this.advertisersService.createCampaign({ ...body, advertiserId: body.advertiserId ?? req.user.id });
  }

  @Get('campaigns/mine')
  @UseGuards(AuthGuard)
  getMyCampaigns(@Request() req: any) {
    return this.advertisersService.getCampaignsForAdvertiser(req.user.id);
  }

  @Get('campaigns/:id')
  @UseGuards(AuthGuard)
  getCampaign(@Param('id') id: string) {
    return this.advertisersService.getCampaignById(id);
  }

  @Put('campaigns/:id/submit')
  @UseGuards(AuthGuard)
  submitForReview(@Param('id') id: string) {
    return this.advertisersService.submitForReview(id);
  }

  @Put('campaigns/:id/pause')
  @UseGuards(AuthGuard)
  pause(@Param('id') id: string) {
    return this.advertisersService.pauseCampaign(id);
  }

  @Get('campaigns/:id/analytics')
  @UseGuards(AuthGuard)
  getAnalytics(@Param('id') id: string) {
    return this.advertisersService.getCampaignAnalytics(id);
  }

  // ── Targeting ────────────────────────────────────────────────────────────────

  @Get('targeting/options')
  getTargetingOptions() {
    return this.advertisersService.getTargetingOptions();
  }

  // ── Impression / click recording ─────────────────────────────────────────────

  @Post('campaigns/:id/impression')
  recordImpression(@Param('id') id: string, @Body() body: { userId?: string; ip?: string; userAgent?: string }) {
    return this.advertisersService.recordImpression(id, body.userId, body.ip, body.userAgent);
  }

  @Post('campaigns/:id/click')
  recordClick(@Param('id') id: string, @Body() body: { userId?: string; ip?: string }) {
    return this.advertisersService.recordClick(id, body.userId, body.ip);
  }

  // ── Payout summary ───────────────────────────────────────────────────────────

  @Get('payout/mine')
  @UseGuards(AuthGuard)
  getMyPayout(@Request() req: any) {
    return this.advertisersService.getAdvertiserPayoutSummary(req.user.id);
  }

  // ── Admin routes ─────────────────────────────────────────────────────────────

  @Get('admin/pending')
  @UseGuards(AuthGuard)
  getPendingReview() {
    return this.advertisersService.getAdminPendingReview();
  }

  @Put('admin/creatives/:id/approve')
  @UseGuards(AuthGuard)
  approveCreative(@Param('id') id: string) {
    return this.advertisersService.approveCreative(id);
  }

  @Put('admin/creatives/:id/reject')
  @UseGuards(AuthGuard)
  rejectCreative(@Param('id') id: string, @Body() body: { reason: string }) {
    return this.advertisersService.rejectCreative(id, body.reason);
  }

  @Put('admin/campaigns/:id/approve')
  @UseGuards(AuthGuard)
  approveCampaign(@Param('id') id: string) {
    return this.advertisersService.approveCampaign(id);
  }

  @Put('admin/campaigns/:id/reject')
  @UseGuards(AuthGuard)
  rejectCampaign(@Param('id') id: string) {
    return this.advertisersService.rejectCampaign(id);
  }

  @Put('admin/campaigns/:id/go-live')
  @UseGuards(AuthGuard)
  goLive(@Param('id') id: string) {
    return this.advertisersService.goLive(id);
  }

  @Get('admin/revenue')
  @UseGuards(AuthGuard)
  getPlatformRevenue() {
    return this.advertisersService.getPlatformAdRevenue();
  }
}
