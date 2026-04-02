/**
 * contest.service.ts
 * TMI Grand Platform Contest — Business Logic Service
 * BerntoutGlobal XXL
 *
 * Repo path: apps/api/src/modules/contest/contest.service.ts
 * Dependencies: PrismaService, EventEmitter2 (for analytics events)
 * Wiring: Inject PrismaService from your shared prisma module
 */

import { Injectable, BadRequestException, NotFoundException, ConflictException, ForbiddenException } from '@nestjs/common';
// import { PrismaService } from '../prisma/prisma.service';
// import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  CreateContestEntryDto,
  InviteSponsorDto,
  CastVoteDto,
  CreateSeasonDto,
  UpdateEntryStatusDto,
  AdminApprovalDto,
} from './contest.dto';

const LOCAL_SPONSORS_REQUIRED = 10;
const MAJOR_SPONSORS_REQUIRED = 10;
const TOTAL_SPONSORS_REQUIRED = 20;

const SPONSOR_PACKAGES = [
  { id: 'local-bronze', label: 'Local Bronze', price: 50, type: 'local', tier: 'bronze' },
  { id: 'local-silver', label: 'Local Silver', price: 100, type: 'local', tier: 'silver' },
  { id: 'local-gold', label: 'Local Gold', price: 250, type: 'local', tier: 'gold' },
  { id: 'major-bronze', label: 'Major Bronze', price: 1000, type: 'major', tier: 'bronze' },
  { id: 'major-silver', label: 'Major Silver', price: 5000, type: 'major', tier: 'silver' },
  { id: 'major-gold', label: 'Major Gold', price: 10000, type: 'major', tier: 'gold' },
  { id: 'title', label: 'Title Sponsor', price: 25000, type: 'major', tier: 'title' },
];

@Injectable()
export class ContestService {
  constructor(
    // private readonly prisma: PrismaService,
    // private readonly eventEmitter: EventEmitter2,
  ) {}

  // ─── Season Methods ──────────────────────────────────────────────────────────

  private getDefaultSeasonStartDate(): Date {
    const now = new Date();
    const august8 = new Date(now.getFullYear(), 7, 8, 0, 0, 0, 0);
    if (now >= august8) {
      return august8;
    }
    return august8;
  }

  async listSeasons() {
    // TODO: return this.prisma.contestSeason.findMany({ orderBy: { createdAt: 'desc' } });
    return [];
  }

  async getActiveSeason() {
    return this.prisma.contestSeason.findFirst({
      where: { status: 'active' },
      include: {
        rounds: { orderBy: { createdAt: 'asc' }, take: 5 },
        prizes: { orderBy: { rank: 'asc' } },
      },
    });
  }

  async getSeasonById(id: string) {
    return this.prisma.contestSeason.findUnique({ where: { id }, include: { rounds: true } });
  }

  async createSeason(dto: CreateSeasonDto) {
    // Validate only one active season at a time
    // const existingActive = await this.getActiveSeason();
    // if (existingActive) throw new ConflictException('An active season already exists');
    const seasonStartDate = dto.seasonStartDate ?? this.getDefaultSeasonStartDate();

    // TODO: return this.prisma.contestSeason.create({ data: { ...dto, startDate: seasonStartDate } });
    return { id: 'new-season', ...dto, seasonStartDate, startDate: seasonStartDate };
  }

  // ─── Entry Methods ───────────────────────────────────────────────────────────

  async listEntries(params: {
    category?: string;
    status?: string;
    seasonId?: string;
    page: number;
    limit: number;
  }) {
    const { category, status, seasonId, page, limit } = params;
    // TODO:
    // return this.prisma.contestEntry.findMany({
    //   where: {
    //     ...(category && { category }),
    //     ...(status && { status }),
    //     ...(seasonId && { seasonId }),
    //   },
    //   include: {
    //     artist: { select: { id: true, name: true, avatar: true } },
    //     _count: { select: { sponsorContributions: true, votes: true } },
    //   },
    //   skip: (page - 1) * limit,
    //   take: limit,
    //   orderBy: { createdAt: 'desc' },
    // });
    return { data: [], total: 0, page, limit };
  }

  async getEntryById(id: string) {
    // TODO:
    // const entry = await this.prisma.contestEntry.findUnique({
    //   where: { id },
    //   include: {
    //     sponsorContributions: {
    //       include: { sponsor: true },
    //       where: { status: 'verified' },
    //     },
    //     votes: true,
    //     round: true,
    //   },
    // });
    // if (!entry) throw new NotFoundException(`Contest entry ${id} not found`);
    // return entry;
    return null;
  }

  async getEntryByArtist(artistId: string) {
    // TODO:
    // return this.prisma.contestEntry.findFirst({
    //   where: { artistId, season: { status: 'active' } },
    //   include: { sponsorContributions: { where: { status: 'verified' } } },
    // });
    return null;
  }

  async createEntry(dto: CreateContestEntryDto) {
    // Check artist not already entered in active season
    const existing = await this.getEntryByArtist(dto.artistId);
    if (existing) {
      throw new ConflictException('Artist already has an entry in the active contest season');
    }

    const activeSeason = await this.getActiveSeason();
    if (!activeSeason) {
      throw new BadRequestException('No active contest season at this time');
    }

    const season = activeSeason as { startDate?: Date; seasonStartDate?: Date };
    const effectiveStartDate = season.startDate ?? season.seasonStartDate ?? this.getDefaultSeasonStartDate();
    if (new Date() < effectiveStartDate) {
      throw new ForbiddenException('Contest not open yet');
    }

    // TODO:
    // return this.prisma.contestEntry.create({
    //   data: {
    //     artistId: dto.artistId,
    //     seasonId: activeSeason.id,
    //     category: dto.category,
    //     status: 'pending',
    //   },
    // });

    // Emit analytics event
    // this.eventEmitter.emit('contest.entry.created', { artistId: dto.artistId, seasonId: activeSeason.id });

    return { id: 'new-entry', artistId: dto.artistId, status: 'pending', seasonStartDate: effectiveStartDate };
  }

  async updateEntryStatus(id: string, dto: UpdateEntryStatusDto) {
    // TODO: return this.prisma.contestEntry.update({ where: { id }, data: { status: dto.status } });
    return { id, ...dto };
  }

  // ─── Sponsor Methods ─────────────────────────────────────────────────────────

  async inviteSponsor(entryId: string, dto: InviteSponsorDto) {
    const entry = await this.getEntryById(entryId);
    // if (!entry) throw new NotFoundException('Contest entry not found');

    // Check sponsor not already invited/confirmed for this entry
    // TODO: duplicate check

    const pkg = SPONSOR_PACKAGES.find((p) => p.id === dto.packageId);
    if (!pkg) throw new BadRequestException('Invalid sponsor package');

    // TODO:
    // return this.prisma.sponsorContribution.create({
    //   data: {
    //     entryId,
    //     sponsorId: dto.sponsorId,
    //     packageId: dto.packageId,
    //     packageType: pkg.type,
    //     amount: pkg.price,
    //     message: dto.message,
    //     status: 'invited',
    //   },
    // });

    // this.eventEmitter.emit('contest.sponsor.invited', { entryId, sponsorId: dto.sponsorId });

    return { status: 'invited', entryId, sponsorId: dto.sponsorId, package: pkg };
  }

  async getEntrySponsors(entryId: string) {
    // TODO:
    // return this.prisma.sponsorContribution.findMany({
    //   where: { entryId },
    //   include: { sponsor: { select: { id: true, name: true, logo: true, type: true } } },
    //   orderBy: { createdAt: 'desc' },
    // });
    return [];
  }

  async approveSponsorContribution(entryId: string, sponsorId: string, dto: AdminApprovalDto) {
    // TODO:
    // const contribution = await this.prisma.sponsorContribution.findFirst({
    //   where: { entryId, sponsorId },
    // });
    // if (!contribution) throw new NotFoundException('Contribution not found');

    // await this.prisma.sponsorContribution.update({
    //   where: { id: contribution.id },
    //   data: { status: dto.approved ? 'verified' : 'rejected', adminNote: dto.note },
    // });

    // Check if now fully qualified
    await this.checkQualificationStatus(entryId);
    return { approved: dto.approved };
  }

  async checkQualificationStatus(entryId: string) {
    // TODO:
    // const sponsors = await this.prisma.sponsorContribution.findMany({
    //   where: { entryId, status: 'verified' },
    // });
    // const localCount = sponsors.filter(s => s.packageType === 'local').length;
    // const majorCount = sponsors.filter(s => s.packageType === 'major').length;
    // const isQualified = localCount >= LOCAL_SPONSORS_REQUIRED && majorCount >= MAJOR_SPONSORS_REQUIRED;

    // if (isQualified) {
    //   await this.prisma.contestEntry.update({
    //     where: { id: entryId },
    //     data: { status: 'qualified' },
    //   });
    //   this.eventEmitter.emit('contest.entry.qualified', { entryId });
    // }
    return false;
  }

  async getSponsorLeaderboard(seasonId?: string, limit = 20) {
    // TODO: aggregate sponsorContributions by sponsorId, count distinct entryIds
    return [];
  }

  async getSponsorPackages() {
    return SPONSOR_PACKAGES;
  }

  // ─── Voting Methods ──────────────────────────────────────────────────────────

  async castVote(dto: CastVoteDto) {
    // Check for duplicate vote in round
    // TODO: prisma check

    // Check round is open for voting
    // TODO: round status check

    // TODO:
    // return this.prisma.contestVote.create({
    //   data: {
    //     entryId: dto.entryId,
    //     voterId: dto.voterId,
    //     roundId: dto.roundId,
    //   },
    // });
    return { voted: true };
  }

  async getLeaderboard(params: { seasonId?: string; roundId?: string; category?: string }) {
    // TODO: aggregate votes by entryId, sort descending
    return [];
  }

  // ─── Round Methods ───────────────────────────────────────────────────────────

  async listRounds(seasonId?: string) {
    // TODO:
    // return this.prisma.contestRound.findMany({
    //   where: { ...(seasonId && { seasonId }) },
    //   orderBy: { startDate: 'asc' },
    // });
    return [];
  }

  // ─── Prize Methods ───────────────────────────────────────────────────────────

  async listPrizes(seasonId?: string) {
    // TODO:
    // return this.prisma.contestPrize.findMany({
    //   where: { ...(seasonId && { seasonId }) },
    // });
    return [];
  }

  // ─── Host Script Methods ─────────────────────────────────────────────────────

  async getHostScripts(type?: string) {
    // TODO:
    // return this.prisma.rayJourneyScript.findMany({
    //   where: { ...(type && { type }) },
    //   orderBy: { order: 'asc' },
    // });

    // Default scripts (replace with DB)
    const scripts = [
      { id: '1', type: 'contestant_intro', text: 'Ladies and gentlemen — welcome to the BerntoutGlobal Grand Platform Contest! Let\'s give it up for our next contestant!', emotion: 'announcing' },
      { id: '2', type: 'sponsor_shoutout', text: 'Tonight\'s performance is brought to you by our incredible sponsors!', emotion: 'sponsor' },
      { id: '3', type: 'prize_reveal', text: 'And now… the moment you\'ve ALL been waiting for. Let\'s reveal tonight\'s grand prize!', emotion: 'revealing' },
      { id: '4', type: 'crowd_hype', text: 'I need EVERYONE to make some noise right now!', emotion: 'crowd' },
      { id: '5', type: 'winner_announce', text: 'The votes are in. The crowd has spoken. And your winner is…', emotion: 'excited' },
    ];

    return type ? scripts.filter((s) => s.type === type) : scripts;
  }

  async triggerHostCue(scriptId: string, context?: Record<string, unknown>) {
    const scripts = await this.getHostScripts();
    const script = scripts.find((s) => s.id === scriptId);
    if (!script) throw new NotFoundException('Script not found');

    // TODO: emit WebSocket event to live host panel
    // this.eventEmitter.emit('host.cue.triggered', { script, context });

    // Replace template variables in script text
    let text = script.text;
    if (context) {
      Object.entries(context).forEach(([key, val]) => {
        text = text.replace(new RegExp(`{{${key}}}`, 'g'), String(val));
      });
    }

    return { triggered: true, script: { ...script, text } };
  }

  // ─── Analytics Methods ───────────────────────────────────────────────────────

  async getAnalytics(params: { seasonId?: string; from?: string; to?: string }) {
    // TODO: aggregate contest analytics
    return {
      totalEntries: 0,
      qualifiedEntries: 0,
      totalSponsors: 0,
      sponsorRevenue: 0,
      totalVotes: 0,
      qualificationFunnelRate: 0,
    };
  }

  async getSponsorAnalytics(sponsorId: string, seasonId?: string) {
    // TODO: sponsor-specific ROI + exposure analytics
    return {
      sponsorId,
      artistsSponsored: 0,
      totalInvested: 0,
      profileViews: 0,
      stageMentions: 0,
      overlayImpressions: 0,
      estimatedReach: 0,
    };
  }

  // ─── Admin Queue Methods ─────────────────────────────────────────────────────

  async getContestantQueue(status = 'pending') {
    // TODO: return this.prisma.contestEntry.findMany({ where: { status }, include: { artist: true } });
    return [];
  }

  async getSponsorQueue(status = 'pending') {
    // TODO: return this.prisma.sponsorContribution.findMany({ where: { status }, include: { sponsor: true, entry: true } });
    return [];
  }

  async getAuditLog(params: { from?: string; to?: string; action?: string }) {
    // TODO: query audit log table
    return [];
  }
}
