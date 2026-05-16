import { avatarBehaviorEngine } from './AvatarBehaviorEngine';
import { battleInterestEngine } from './BattleInterestEngine';
import { botIntelligenceGrowthEngine } from './BotIntelligenceGrowthEngine';
import { contentInterestEngine } from './ContentInterestEngine';
import { emoteLearningEngine } from './EmoteLearningEngine';
import { experienceOptimizationEngine } from './ExperienceOptimizationEngine';
import { lobbyBehaviorEngine } from './LobbyBehaviorEngine';
import { rewardResponseEngine } from './RewardResponseEngine';
import { ticketDemandEngine } from './TicketDemandEngine';

export interface AvatarRuntimeAdaptation {
  confidence: number;
  adaptiveScoreMultiplier: number;
  timingScale: number;
  emoteProbability: number;
  cameraAwareness: number;
  battleStanceBoost: number;
  fallbackRotation: number;
}

export interface LobbyRuntimeAdaptation {
  confidence: number;
  crowdDensityTarget: number;
  reactionPacingMs: number;
  engagementTimingMs: number;
  lightingIntensity: number;
  eventPacingMs: number;
  cameraCutRate: number;
  excitementCurve: 'calm' | 'rising' | 'volatile';
}

export interface EditorialRuntimeAdaptation {
  confidence: number;
  articleSurfaceBias: number;
  genreRotationBias: number;
  homepageHeroBias: number;
  sequenceBias: number;
  sponsorPlacementWeight: number;
  battleRecapPriority: number;
}

export interface CommerceRuntimeAdaptation {
  confidence: number;
  ticketPricingMultiplier: number;
  venueDemandIndicator: number;
  rewardTimingMs: number;
  giveawayTimingMs: number;
  sponsorVisibilityPacingMs: number;
  conversionSurfacePriority: number;
}

export interface BotRuntimeAdaptation {
  confidence: number;
  botTaskPriorityBoost: number;
  moderationTimingMs: number;
  editorialFocusBoost: number;
  sponsorActivationPacingMs: number;
  roomFillBias: number;
  cameraDirectorBias: number;
}

export function getAvatarRuntimeAdaptation(avatarId: string): AvatarRuntimeAdaptation {
  const avatarSignal = avatarBehaviorEngine.getAvatarSignals(200).find((row) => row.avatarId === avatarId);
  const emoteSignal = emoteLearningEngine.getTopEmotes(20)[0];
  const battleSignal = battleInterestEngine.getBattleSignals(20)[0];

  const confidence = avatarSignal ? 0.84 : 0.58;
  const adaptiveScoreMultiplier = avatarSignal ? 1 + Math.min(0.8, avatarSignal.engagementScore / 200) : 1;
  const emoteProbability = emoteSignal ? Math.min(1, Math.max(0.2, emoteSignal.responseScore / 100)) : 0.5;
  const battleStanceBoost = battleSignal ? Math.min(1, battleSignal.hypeScore / 100) : 0.3;

  return {
    confidence,
    adaptiveScoreMultiplier,
    timingScale: avatarSignal ? Math.max(0.7, 1 - avatarSignal.socialActions / 200) : 1,
    emoteProbability,
    cameraAwareness: avatarSignal ? Math.min(1, 0.3 + avatarSignal.movementActions / 120) : 0.5,
    battleStanceBoost,
    fallbackRotation: avatarSignal ? Math.min(0.9, avatarSignal.actions / 160) : 0.4,
  };
}

export function getLobbyRuntimeAdaptation(roomId: string): LobbyRuntimeAdaptation {
  const lobbySignal = lobbyBehaviorEngine
    .getLobbySignals(200)
    .find((row) => row.lobbyId === roomId || row.lobbyId === `room:${roomId}`) || lobbyBehaviorEngine.getLobbySignals(1)[0];

  const confidence = lobbySignal ? 0.82 : 0.55;
  const retention = lobbySignal?.retentionScore ?? 50;

  return {
    confidence,
    crowdDensityTarget: Math.min(0.95, Math.max(0.35, retention / 100)),
    reactionPacingMs: Math.round(1300 - Math.min(800, retention * 6)),
    engagementTimingMs: Math.round(2400 - Math.min(1400, retention * 10)),
    lightingIntensity: Math.min(1, Math.max(0.25, retention / 100)),
    eventPacingMs: Math.round(5000 - Math.min(3000, retention * 18)),
    cameraCutRate: Number(Math.min(1, Math.max(0.2, retention / 100)).toFixed(2)),
    excitementCurve: retention > 70 ? 'rising' : retention < 35 ? 'calm' : 'volatile',
  };
}

export function getEditorialRuntimeAdaptation(surfaceKey: string): EditorialRuntimeAdaptation {
  const topContent = contentInterestEngine.getTopContent(30);
  const best = topContent[0];
  const battleRecapHit = topContent.find((row) => row.contentId.includes('event-recap'));

  const confidence = best ? 0.81 : 0.52;
  const score = best?.score ?? 10;

  return {
    confidence,
    articleSurfaceBias: Number(Math.min(1.4, 0.8 + score / 100).toFixed(2)),
    genreRotationBias: Number(Math.min(1.2, 0.7 + topContent.length / 80).toFixed(2)),
    homepageHeroBias: Number(Math.min(1.3, 0.75 + (best?.shares ?? 0) / 40).toFixed(2)),
    sequenceBias: Number(Math.min(1.25, 0.8 + (best?.reads ?? 0) / 100).toFixed(2)),
    sponsorPlacementWeight: Number(Math.min(1.35, 0.75 + (best?.conversions ?? 0) / 50).toFixed(2)),
    battleRecapPriority: Number((battleRecapHit ? Math.min(1.5, 0.9 + battleRecapHit.score / 80) : 0.9).toFixed(2)),
  };
}

export function getCommerceRuntimeAdaptation(route: string): CommerceRuntimeAdaptation {
  const demandSignal = ticketDemandEngine.getDemandSignals(100).find((row) => row.route === route) || ticketDemandEngine.getDemandSignals(1)[0];
  const rewardSignal = rewardResponseEngine.getRewardResponse(1)[0];
  const directive = experienceOptimizationEngine
    .generateDirectives()
    .find((row) => row.area === 'conversion' || row.area === 'retention');

  const confidence = demandSignal ? 0.8 : 0.5;
  const demandScore = demandSignal?.demandScore ?? 10;

  return {
    confidence,
    ticketPricingMultiplier: Number(Math.min(1.4, Math.max(0.75, 0.9 + demandScore / 200)).toFixed(2)),
    venueDemandIndicator: Number(Math.min(100, Math.max(0, demandScore * 2)).toFixed(2)),
    rewardTimingMs: Math.round(2200 - Math.min(1200, (rewardSignal?.upliftScore ?? 0) * 15)),
    giveawayTimingMs: Math.round(3800 - Math.min(1800, (rewardSignal?.claims ?? 0) * 25)),
    sponsorVisibilityPacingMs: directive?.priority === 'p0' ? 2400 : 3600,
    conversionSurfacePriority: directive?.priority === 'p0' ? 0.95 : 0.72,
  };
}

export function getBotRuntimeAdaptation(): BotRuntimeAdaptation {
  const prompt = botIntelligenceGrowthEngine.getPromptEffectiveness(1)[0];
  const directives = experienceOptimizationEngine.generateDirectives();
  const conversionDirective = directives.find((row) => row.area === 'conversion');

  const confidence = prompt ? 0.79 : 0.5;

  return {
    confidence,
    botTaskPriorityBoost: prompt ? Number((1 + prompt.successRate / 200).toFixed(2)) : 1,
    moderationTimingMs: prompt && prompt.successRate < 45 ? 1800 : 3200,
    editorialFocusBoost: conversionDirective ? 1.2 : 1,
    sponsorActivationPacingMs: conversionDirective?.priority === 'p0' ? 2200 : 4200,
    roomFillBias: prompt && prompt.successRate >= 65 ? 0.9 : 0.65,
    cameraDirectorBias: prompt ? Number(Math.min(1, 0.35 + prompt.successRate / 100).toFixed(2)) : 0.5,
  };
}
