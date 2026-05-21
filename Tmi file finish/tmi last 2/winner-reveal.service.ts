/**
 * winner-reveal-config.entity.ts
 * Repo: apps/api/src/modules/contest/entities/winner-reveal-config.entity.ts
 * Action: CREATE | Wave: D4
 */
export class WinnerRevealConfigEntity {
  id: string;
  contestEntryId?: string;   // null = default for season
  seasonId?: string;

  // Winner count rules
  revealMode: 'single' | 'small_game' | 'big_contest';
  minWinnersToShow: number;   // 1
  maxWinnersToShow: number;   // 1–10
  featuredWinnerRank: number; // 1 = 1st place

  // Timing
  groupHoldSeconds: number;   // 2–5

  // Audio / voice
  allowVoiceChatter: boolean;
  audioMode: 'chaotic' | 'balanced' | 'broadcast_safe';
  maxSimultaneousMics: number;

  // Camera
  cameraPresetPool: string[];  // JSON array of preset IDs (from reveal.presets.ts)
  transitionWeights: Record<string, number>; // JSON object
  weightingEnabled: boolean;
  seasonLocked: boolean;

  // Control
  hostControlled: boolean;
  fallbackSingleWinnerMode: boolean;

  // Audit
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;  // admin userId
  lastResetBy?: string;
}

// ═══════════════════════════════════════════════════════════════════════════

/**
 * update-reveal-config.dto.ts
 * Repo: apps/api/src/modules/contest/dto/update-reveal-config.dto.ts
 * Action: CREATE | Wave: D3
 */
export class UpdateRevealConfigDto {
  revealMode?: 'single' | 'small_game' | 'big_contest';
  minWinnersToShow?: number;
  maxWinnersToShow?: number;
  featuredWinnerRank?: number;
  groupHoldSeconds?: number;
  allowVoiceChatter?: boolean;
  audioMode?: 'chaotic' | 'balanced' | 'broadcast_safe';
  maxSimultaneousMics?: number;
  cameraPresetPool?: string[];
  transitionWeights?: Record<string, number>;
  weightingEnabled?: boolean;
  seasonLocked?: boolean;
  hostControlled?: boolean;
  fallbackSingleWinnerMode?: boolean;
}

// ═══════════════════════════════════════════════════════════════════════════

/**
 * winner-reveal.service.ts
 * Repo: apps/api/src/modules/contest/services/winner-reveal.service.ts
 * Action: CREATE | Wave: D5
 * Wiring: Inject PrismaService, EventEmitter2
 */
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import type { UpdateRevealConfigDto } from '../dto/update-reveal-config.dto';

// Default config matching client-side defaults
const REVEAL_DEFAULTS: Partial<WinnerRevealConfigEntity> = {
  revealMode: 'single',
  minWinnersToShow: 1,
  maxWinnersToShow: 1,
  featuredWinnerRank: 1,
  groupHoldSeconds: 3,
  allowVoiceChatter: false,
  audioMode: 'balanced',
  maxSimultaneousMics: 3,
  cameraPresetPool: ['hero_zoom', 'group_celebration', 'podium_pan', 'winner_isolation'],
  transitionWeights: { fade_gold: 70, cut_sharp: 50, push_dramatic: 80, dissolve_soft: 40 },
  weightingEnabled: true,
  seasonLocked: false,
  hostControlled: false,
  fallbackSingleWinnerMode: true,
};

@Injectable()
export class WinnerRevealService {
  // constructor(private readonly prisma: PrismaService, private readonly eventEmitter: EventEmitter2) {}

  async getRevealConfig(seasonId: string): Promise<WinnerRevealConfigEntity> {
    // TODO: return this.prisma.winnerRevealConfig.findFirst({ where: { seasonId } }) ?? REVEAL_DEFAULTS;
    return { ...REVEAL_DEFAULTS, id: 'default', seasonId, createdAt: new Date(), updatedAt: new Date(), createdBy: 'system' } as WinnerRevealConfigEntity;
  }

  async updateRevealConfig(
    seasonId: string,
    dto: UpdateRevealConfigDto,
    adminId: string,
  ): Promise<WinnerRevealConfigEntity> {
    // Validate winner count rules
    if (dto.maxWinnersToShow !== undefined) {
      if (dto.maxWinnersToShow < 1 || dto.maxWinnersToShow > 10) {
        throw new BadRequestException('maxWinnersToShow must be between 1 and 10');
      }
    }

    if (dto.cameraPresetPool !== undefined && dto.cameraPresetPool.length === 0) {
      throw new BadRequestException('cameraPresetPool cannot be empty — fallback mode requires at least one preset');
    }

    // TODO:
    // const updated = await this.prisma.winnerRevealConfig.upsert({
    //   where: { seasonId },
    //   create: { ...REVEAL_DEFAULTS, ...dto, seasonId, createdBy: adminId },
    //   update: { ...dto, updatedAt: new Date() },
    // });
    // this.eventEmitter.emit('reveal.config.updated', { seasonId, dto, adminId, timestamp: Date.now() });

    return { ...REVEAL_DEFAULTS, ...dto, id: 'updated', seasonId, createdAt: new Date(), updatedAt: new Date(), createdBy: adminId } as WinnerRevealConfigEntity;
  }

  async resetRevealConfig(seasonId: string, adminId: string): Promise<WinnerRevealConfigEntity> {
    // TODO: reset to REVEAL_DEFAULTS and log the reset
    // this.eventEmitter.emit('reveal.config.reset', { seasonId, adminId, timestamp: Date.now() });
    return { ...REVEAL_DEFAULTS, id: 'reset', seasonId, createdAt: new Date(), updatedAt: new Date(), createdBy: adminId, lastResetBy: adminId } as WinnerRevealConfigEntity;
  }

  // ─── Adaptive transition weight update ─────────────────────────────────────
  // GUARDRAIL: only updates weights, never creates new presets
  async updateTransitionWeight(
    seasonId: string,
    transitionId: string,
    newWeight: number,
    adminId: string,
  ): Promise<void> {
    if (newWeight < 0 || newWeight > 100) {
      throw new BadRequestException('Transition weight must be 0–100');
    }

    const config = await this.getRevealConfig(seasonId);
    if (!Object.keys(config.transitionWeights ?? {}).includes(transitionId)) {
      throw new BadRequestException(`Transition "${transitionId}" is not in the approved pool. Only approved transitions may be weighted.`);
    }

    if (config.seasonLocked) {
      throw new BadRequestException('Cannot change transition weights during a season-locked reveal');
    }

    // TODO: update weight in DB and log change
    // this.eventEmitter.emit('reveal.transition.reweighted', { seasonId, transitionId, newWeight, adminId, timestamp: Date.now() });
  }

  // ─── Analytics tracking ─────────────────────────────────────────────────────
  async trackRevealAnalytics(data: {
    seasonId: string;
    entryId?: string;
    transitionUsed: string;
    cameraPresetUsed: string;
    winnerCount: number;
    revealMode: string;
    watchCompletionRate?: number;   // 0–1
    replayCount?: number;
    adminRating?: 1 | 2 | 3 | 4 | 5;
    audienceFavoriteTag?: string;
  }): Promise<void> {
    // TODO: this.prisma.revealAnalytics.create({ data });
    // this.eventEmitter.emit('reveal.analytics.tracked', data);
  }
}
