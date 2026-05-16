import { directMotion } from '@/lib/ai-motion/MotionDirectorEngine';
import { lockIdentity, type IdentitySubjectType } from '@/lib/ai-visuals/IdentityLockEngine';
import {
  getArtistTerritory,
  getArtistTerritoryRanking,
  recordTerritoryRanking,
  registerArtistTerritory,
  verifyArtistTerritory,
} from '@/lib/artists/ArtistTerritoryEngine';
import { runWorkforceScheduler } from '@/lib/automation/WorkforceSchedulerEngine';
import { createAvatarLikeness, type AvatarRenderVariant } from '@/lib/avatars/AvatarLikenessEngine';
import {
  createBillboard,
  listBillboardsOnRoute,
  placeBillboardOnRoute,
  updateBillboardRankings,
} from '@/lib/billboards/BillboardChartEngine';
import {
  createCountryChart,
  getTopArtistsInCountryChart,
  listActiveCountryCharts,
  recordCountryChartXPEvent,
  updateCountryChartRankings,
} from '@/lib/charts/CountryChartEngine';
import {
  createGlobalChart,
  getActiveGlobalChart,
  getGlobalTopArtists,
  recordGlobalXPContribution,
  updateGlobalChartRankings,
} from '@/lib/charts/GlobalChartEngine';
import {
  createPersonalLobby,
  getLobbyStats,
  listLobbiesByEntity,
  recordLobbyVisit,
} from '@/lib/lobbies/PersonalLobbyEngine';
import {
  addMemoryToWall,
  getMemoryWallStats,
  initializeMemoryWall,
  listMemoriesForEntity,
} from '@/lib/profiles/MemoryWallEngine';
import {
  configureRotation,
  getActiveAssetForSlot,
  listAssetsForSlot,
  registerProfileAsset,
} from '@/lib/profiles/ProfileAssetRotationEngine';
import { recordParticipationActivity } from '@/lib/xp/AudienceParticipationXPEngine';
import { unlockFanAchievement } from '@/lib/xp/FanAchievementEngine';
import { getAttendanceStats, recordFanAttendance } from '@/lib/xp/FanAttendanceEngine';
import {
  approvePointRedemption,
  fulfillPointRedemption,
  getRedemptionStats as getFanPointRedemptionStats,
  requestPointRedemption,
} from '@/lib/xp/FanPointRedemptionEngine';
import { addPointsToWallet, getFanPointsWallet } from '@/lib/xp/FanPointsWalletEngine';
import { createRewardItem, purchaseRewardItem } from '@/lib/xp/FanRewardStoreEngine';
import { recordFanStreakActivity } from '@/lib/xp/FanStreakEngine';
import { evaluateFanTicketEligibility } from '@/lib/xp/FanTicketEligibilityEngine';
import { getAchievementRegistry, unlockAchievement } from '@/lib/xp/LiveReleaseAchievementEngine';
import { calculateRetentionBonus } from '@/lib/xp/LiveRetentionXPBonusEngine';
import { getSessionSummary, recordSessionSnapshot } from '@/lib/xp/LiveSessionTrackingEngine';
import { getStreakBonusXP, recordLiveSessionForStreak } from '@/lib/xp/LiveStreakEngine';
import { createPremiere, getPremiere, recordPremiereEngagement } from '@/lib/xp/PremiereXPEngine';
import {
  calculateProgressionLevel,
  getRankingProgression,
  recordRankingPosition,
} from '@/lib/xp/RankingXPPositionEngine';
import {
  check24HourMilestone,
  createRelease,
  getRelease,
  recordReleaseEngagement,
  releaseWentLive,
} from '@/lib/xp/ReleaseXPEngine';
import {
  createTicketCurrencyMode,
  getTicketAvailability,
  recordTicketSale,
} from '@/lib/xp/TicketCurrencyModeEngine';
import {
  createWorldConcert,
  getWorldConcert,
  recordConcertMetrics,
} from '@/lib/xp/WorldConcertXPEngine';
import { getUserXP, grantXP } from '@/lib/xp/xpEngine';
import {
  approveRedemption,
  getRedemptionStats as getXPTicketRedemptionStats,
  issueTicketFromRedemption,
  markTicketUsed,
  requestXPTicketRedemption,
} from '@/lib/xp/XPTicketRedemptionEngine';

type RuntimeEntityType = 'artist' | 'performer' | 'fan' | 'venue' | 'sponsor' | 'advertiser';

type SubjectIdentityType = Extract<IdentitySubjectType, 'artist' | 'performer' | 'fan'>;

const profileRuntimeInitialized = new Set<string>();
const homeRuntimeInitialized = new Set<string>();
let schedulerInitialized = false;

const DEFAULT_COUNTRY = {
  code: 'US',
  name: 'United States',
  language: 'en',
  timezone: 'America/New_York',
};

function toIdentityType(entityType: RuntimeEntityType): SubjectIdentityType | null {
  if (entityType === 'artist') return 'artist';
  if (entityType === 'performer') return 'performer';
  if (entityType === 'fan') return 'fan';
  return null;
}

function ensureIdentityLock(entityType: RuntimeEntityType, slug: string): void {
  const identityType = toIdentityType(entityType);
  if (!identityType) return;

  const identity = lockIdentity({
    subjectType: identityType,
    subjectId: slug,
    canonicalFaceId: `${slug}-canonical-face`,
    styleId: `${slug}-canon-style`,
    wardrobeSetId: `${slug}-default-wardrobe`,
    motionProfileId: `${slug}-motion-profile`,
  });

  const variants: AvatarRenderVariant[] = ['profile-avatar', 'room-avatar', 'motion-portrait'];
  let hasDrift = false;

  variants.forEach((variant) => {
    const likeness = createAvatarLikeness({
      subjectType: identityType,
      subjectId: slug,
      sourceImageRef: `/generated/${slug}/source-portrait.png`,
      variant,
      generatedFaceId: identity.canonicalFaceId,
      generatedStyleId: identity.styleId,
      generatedWardrobeSetId: identity.wardrobeSetId,
    });

    if (
      likeness.consistency.driftLevel === 'moderate' ||
      likeness.consistency.driftLevel === 'severe'
    ) {
      hasDrift = true;
    }
  });

  if (hasDrift) {
    variants.forEach((variant) => {
      createAvatarLikeness({
        subjectType: identityType,
        subjectId: slug,
        sourceImageRef: `/generated/${slug}/source-portrait.png`,
        variant,
        generatedFaceId: identity.canonicalFaceId,
        generatedStyleId: identity.styleId,
        generatedWardrobeSetId: identity.wardrobeSetId,
      });
    });
  }
}

function ensureProfileAssets(entityType: RuntimeEntityType, slug: string): void {
  if (entityType === 'sponsor' || entityType === 'advertiser') return;

  const rotationEntityType =
    entityType === 'artist' ||
    entityType === 'performer' ||
    entityType === 'fan' ||
    entityType === 'venue'
      ? entityType
      : 'fan';

  const profileAssets = listAssetsForSlot(slug, 'profile-image');
  if (profileAssets.length === 0) {
    registerProfileAsset({
      entityId: slug,
      entityType: rotationEntityType,
      slotName: 'profile-image',
      assetUrl: `/generated/${slug}/profile-image-01.png`,
    });
    registerProfileAsset({
      entityId: slug,
      entityType: rotationEntityType,
      slotName: 'profile-image',
      assetUrl: `/generated/${slug}/profile-image-02.png`,
    });
  }

  const bannerAssets = listAssetsForSlot(slug, 'banner');
  if (bannerAssets.length === 0) {
    registerProfileAsset({
      entityId: slug,
      entityType: rotationEntityType,
      slotName: 'banner',
      assetUrl: `/generated/${slug}/banner-01.png`,
    });
  }

  if (!getActiveAssetForSlot(slug, 'profile-image')) {
    configureRotation({
      entityId: slug,
      entityType: rotationEntityType,
      rotationMode: 'by-visit',
      rotationIntervalMs: 6 * 60 * 60 * 1000,
      minEngagementToRotate: 2,
      maxAssetsPerSlot: 8,
    });
  }
}

function ensureMemoryAndLobby(
  entityType: RuntimeEntityType,
  slug: string,
  displayName: string
): void {
  if (entityType === 'sponsor' || entityType === 'advertiser') return;

  const wallEntityType =
    entityType === 'artist' ||
    entityType === 'performer' ||
    entityType === 'fan' ||
    entityType === 'venue'
      ? entityType
      : 'fan';

  initializeMemoryWall({
    entityId: slug,
    entityType: wallEntityType,
    maxItems: 350,
    autoArchiveAfterDays: 365 * 5,
    allowPublicSharing: true,
  });

  if (listMemoriesForEntity(slug, wallEntityType).length === 0) {
    addMemoryToWall({
      entityId: slug,
      entityType: wallEntityType,
      contentType: 'achievement',
      contentUrl: `/generated/${slug}/memory-01.png`,
      title: `${displayName} joined the TMI economy`,
      description: 'Economic runtime successfully wired to this route.',
      source: 'system-captured',
      tags: ['economy', 'integration', 'runtime'],
      isPublic: true,
    });
  }

  const existingLobbies = listLobbiesByEntity(slug, wallEntityType);
  if (existingLobbies.length === 0) {
    const lobbyType =
      wallEntityType === 'artist'
        ? 'artist-hub'
        : wallEntityType === 'performer'
        ? 'performer-hub'
        : wallEntityType === 'fan'
        ? 'fan-hub'
        : 'venue-lobby';

    const lobbyId = createPersonalLobby({
      entityId: slug,
      entityType: wallEntityType,
      lobbyName: `${displayName} Lobby`,
      lobbyType,
      skinTheme: 'neon-atmosphere',
      capacity: 60,
      isPublic: true,
    });
    recordLobbyVisit(lobbyId);
  }
}

function ensureArtistProgression(artistId: string, displayName: string): void {
  if (!getArtistTerritory(artistId)) {
    registerArtistTerritory({
      artistId,
      displayName,
      countryCode: DEFAULT_COUNTRY.code,
      countryName: DEFAULT_COUNTRY.name,
      timezone: DEFAULT_COUNTRY.timezone,
      primaryLanguage: DEFAULT_COUNTRY.language,
      genres: ['hip-hop', 'trap'],
      city: 'New York',
      region: 'North America',
    });
    verifyArtistTerritory(artistId);
  }

  const activeCountryCharts = listActiveCountryCharts();
  let usChartId = activeCountryCharts.find(
    (chart) => chart.countryCode === DEFAULT_COUNTRY.code
  )?.chartId;
  if (!usChartId) {
    usChartId = createCountryChart({
      countryCode: DEFAULT_COUNTRY.code,
      countryName: DEFAULT_COUNTRY.name,
    });
  }

  recordCountryChartXPEvent({
    artistId,
    countryCode: DEFAULT_COUNTRY.code,
    xpType: 'performance',
    xpAmount: 150,
    sourceId: `runtime-performance-${artistId}`,
  });
  recordCountryChartXPEvent({
    artistId,
    countryCode: DEFAULT_COUNTRY.code,
    xpType: 'votes',
    xpAmount: 90,
    sourceId: `runtime-votes-${artistId}`,
  });
  recordCountryChartXPEvent({
    artistId,
    countryCode: DEFAULT_COUNTRY.code,
    xpType: 'shares',
    xpAmount: 40,
    sourceId: `runtime-shares-${artistId}`,
  });

  updateCountryChartRankings(usChartId);

  const countryTop = getTopArtistsInCountryChart(DEFAULT_COUNTRY.code, 10);
  let globalChart = getActiveGlobalChart();
  if (!globalChart) {
    createGlobalChart();
    globalChart = getActiveGlobalChart();
  }

  countryTop.forEach((entry) => {
    recordGlobalXPContribution({
      artistId: entry.artistId,
      countryCode: DEFAULT_COUNTRY.code,
      countryRank: entry.rank,
      contributionXP: entry.totalXP,
    });
  });

  if (globalChart?.chartId) {
    updateGlobalChartRankings(globalChart.chartId);
  }

  const globalTop = getGlobalTopArtists(100);
  const currentCountryRank = countryTop.find((entry) => entry.artistId === artistId)?.rank ?? 1;
  const currentGlobalRank = globalTop.find((entry) => entry.artistId === artistId)?.globalRank;

  const totalXP = countryTop.find((entry) => entry.artistId === artistId)?.totalXP ?? 280;
  recordRankingPosition({
    artistId,
    displayName,
    countryCode: DEFAULT_COUNTRY.code,
    countryRank: currentCountryRank,
    globalRank: currentGlobalRank,
    totalXP,
  });
  calculateProgressionLevel(artistId);

  recordTerritoryRanking({
    artistId,
    displayName,
    countryCode: DEFAULT_COUNTRY.code,
    countryRank: currentCountryRank,
    countryTotalXP: totalXP,
    globalRank: currentGlobalRank,
    globalTotalXP: totalXP,
    movementDirection: 'up',
    movementDays: 7,
  });
}

function ensureHomeBillboards(routePath: string): { globalCount: number; countryCount: number } {
  const existing = listBillboardsOnRoute(routePath);
  const hasGlobal = existing.some((item) => item.billboardType === 'global');
  const hasCountry = existing.some((item) => item.billboardType === 'country');

  let globalCount = 0;
  let countryCount = 0;

  if (!hasGlobal) {
    const chart = getActiveGlobalChart() ?? (createGlobalChart(), getActiveGlobalChart());
    if (chart) {
      const billboardId = createBillboard({
        billboardType: 'global',
        displayName: 'Global Top 10 Orbit',
        routePath,
        chartSource: chart.chartId,
        maxRankingsDisplay: 10,
        refreshIntervalMs: 10 * 60 * 1000,
      });

      const rankings = getGlobalTopArtists(10).map((entry) => ({
        rank: entry.globalRank,
        artistId: entry.artistId,
        displayName: entry.displayName || entry.artistId,
        xpOrScore: entry.totalGlobalXP,
        trendIcon: entry.movementSincePeriod,
      }));

      updateBillboardRankings(billboardId, rankings);
      placeBillboardOnRoute({
        billboardId,
        route: routePath,
        slotPosition: 'top-orbit',
        displayOrder: 1,
      });
      globalCount = rankings.length;
    }
  } else {
    globalCount =
      existing.find((item) => item.billboardType === 'global')?.currentRankings.length ?? 0;
  }

  if (!hasCountry) {
    const usChart = listActiveCountryCharts().find(
      (chart) => chart.countryCode === DEFAULT_COUNTRY.code
    );
    if (usChart) {
      const billboardId = createBillboard({
        billboardType: 'country',
        displayName: 'Country Pride Board',
        routePath,
        chartSource: usChart.chartId,
        maxRankingsDisplay: 10,
        refreshIntervalMs: 10 * 60 * 1000,
      });

      const rankings = getTopArtistsInCountryChart(DEFAULT_COUNTRY.code, 10).map((entry) => ({
        rank: entry.rank,
        artistId: entry.artistId,
        displayName: entry.displayName || entry.artistId,
        xpOrScore: entry.totalXP,
        trendIcon: entry.movementSincePeriod,
        flagOrBadge: DEFAULT_COUNTRY.code,
      }));

      updateBillboardRankings(billboardId, rankings);
      placeBillboardOnRoute({
        billboardId,
        route: routePath,
        slotPosition: 'country-board',
        displayOrder: 2,
      });
      countryCount = rankings.length;
    }
  } else {
    countryCount =
      existing.find((item) => item.billboardType === 'country')?.currentRankings.length ?? 0;
  }

  return { globalCount, countryCount };
}

function ensureHomeMotion(routePath: string): string[] {
  const suffix = routePath.replace(/\//g, '-');
  return [
    directMotion({
      directiveId: `home${suffix}-hero-2s`,
      surface: 'top-10-orbit',
      durationKey: '2s',
      emphasis: 'intro',
    }).directiveId,
    directMotion({
      directiveId: `home${suffix}-hero-4s`,
      surface: 'billboard',
      durationKey: '4s',
      emphasis: 'performance',
    }).directiveId,
    directMotion({
      directiveId: `home${suffix}-hero-6s`,
      surface: 'venue-display',
      durationKey: '6s',
      emphasis: 'performance',
    }).directiveId,
    directMotion({
      directiveId: `home${suffix}-hero-7s`,
      surface: 'host-intro',
      durationKey: '7s',
      emphasis: 'reaction',
    }).directiveId,
  ];
}

export function ensureProfileEconomyRuntime(input: {
  slug: string;
  entityType: RuntimeEntityType;
  displayName: string;
  routePath: string;
}): {
  runtimeKey: string;
  memoryCount: number;
  lobbyVisits: number;
  progressionLevel?: string;
} {
  const runtimeKey = `${input.entityType}:${input.slug}`;

  if (!profileRuntimeInitialized.has(runtimeKey)) {
    ensureIdentityLock(input.entityType, input.slug);
    ensureProfileAssets(input.entityType, input.slug);
    ensureMemoryAndLobby(input.entityType, input.slug, input.displayName);

    if (input.entityType === 'artist' || input.entityType === 'performer') {
      ensureArtistProgression(input.slug, input.displayName);
    }

    profileRuntimeInitialized.add(runtimeKey);
  }

  const wallEntityType =
    input.entityType === 'artist' ||
    input.entityType === 'performer' ||
    input.entityType === 'fan' ||
    input.entityType === 'venue'
      ? input.entityType
      : 'fan';
  const wallStats = getMemoryWallStats(input.slug, wallEntityType);
  const lobby = listLobbiesByEntity(input.slug, wallEntityType)[0];
  const lobbyStats = lobby ? getLobbyStats(lobby.lobbyId) : null;

  const progression =
    input.entityType === 'artist' || input.entityType === 'performer'
      ? getRankingProgression(input.slug)
      : null;

  return {
    runtimeKey,
    memoryCount: wallStats.totalMemories,
    lobbyVisits: lobbyStats?.visits ?? 0,
    progressionLevel: progression?.currentLevel,
  };
}

export function ensureHomeEconomyRuntime(routePath: string): {
  routePath: string;
  top10GlobalCount: number;
  top10CountryCount: number;
  motionDirectiveCount: number;
} {
  if (!homeRuntimeInitialized.has(routePath)) {
    const artists = [
      { id: 'onyx-lyric', name: 'Onyx Lyric' },
      { id: 'big-a', name: 'Big A' },
      { id: 'kira-bloom', name: 'Kira Bloom' },
      { id: 'ray-journey', name: 'Ray Journey' },
    ];

    artists.forEach((artist) => {
      ensureArtistProgression(artist.id, artist.name);
    });

    ensureHomeBillboards(routePath);
    ensureHomeMotion(routePath);
    homeRuntimeInitialized.add(routePath);
  }

  const boards = listBillboardsOnRoute(routePath);
  const global =
    boards.find((item) => item.billboardType === 'global')?.currentRankings.length ?? 0;
  const country =
    boards.find((item) => item.billboardType === 'country')?.currentRankings.length ?? 0;

  return {
    routePath,
    top10GlobalCount: global,
    top10CountryCount: country,
    motionDirectiveCount: 4,
  };
}

export function ensureWorkforceSchedulerRuntime() {
  if (!schedulerInitialized) {
    runWorkforceScheduler({
      schedulerId: 'global-economy-runtime',
      daily: {
        cycleId: 'daily-economy-cycle',
        directivesLoaded: 8,
        objectivesLoaded: 6,
        goalsCreated: 5,
        tasksCreated: 12,
        workersAssigned: 9,
        checkpointsTracked: 7,
        achievementsUnlocked: 4,
      },
      weekly: {
        cycleId: 'weekly-economy-cycle',
        campaignsRefreshed: 6,
        weakAssetsImproved: 8,
        topAssetsUpgraded: 4,
        workerStabilityScore: 88,
      },
      monthly: {
        cycleId: 'monthly-economy-cycle',
        magazineIssuesProduced: 2,
        sponsorSpreadsRefreshed: 5,
        venueSystemsRefreshed: 6,
        strategicImprovements: 4,
      },
      yearly: {
        cycleId: 'yearly-economy-cycle',
        architectureEvolutions: 3,
        standardsUpgraded: 4,
        departmentsRebalanced: 2,
        launchReadinessScore: 92,
      },
      mc: {
        cycleId: 'mc-oversight-cycle',
        approvalsGreen: 14,
        approvalsYellow: 3,
        approvalsRed: 1,
        escalationsRaised: 1,
        correctiveActionsIssued: 2,
      },
      bigAce: {
        cycleId: 'big-ace-command-cycle',
        strategicApprovals: 8,
        criticalOverrides: 1,
        continuityActions: 5,
        blockersResolved: 6,
      },
    });
    schedulerInitialized = true;
  }
}

export function getTerritoryRuntimeSnapshot(artistId: string) {
  return {
    territory: getArtistTerritory(artistId),
    ranking: getArtistTerritoryRanking(artistId),
  };
}

export function runEconomyCriticalPathSimulation(input?: {
  artistId?: string;
  fanId?: string;
  routePath?: string;
}): {
  identityLocked: boolean;
  homeRuntimeActive: boolean;
  events: {
    artistLive: boolean;
    fanAttendance: boolean;
    ticketRedemption: boolean;
    premiere: boolean;
    release: boolean;
    battleVote: boolean;
    tip: boolean;
    xpGain: boolean;
  };
  snapshots: {
    artistXP: number;
    fanXP: number;
    fanPoints: number;
    sessionSummary: ReturnType<typeof getSessionSummary>;
    xpTicketStats: ReturnType<typeof getXPTicketRedemptionStats>;
    fanPointRedemptionStats: ReturnType<typeof getFanPointRedemptionStats>;
  };
} {
  const artistId = input?.artistId ?? 'sim-artist-alpha';
  const fanId = input?.fanId ?? 'sim-fan-beta';
  const routePath = input?.routePath ?? '/home/1';

  const artistRuntime = ensureProfileEconomyRuntime({
    slug: artistId,
    entityType: 'artist',
    displayName: 'Simulation Artist',
    routePath: `/artists/${artistId}`,
  });
  ensureProfileEconomyRuntime({
    slug: fanId,
    entityType: 'fan',
    displayName: 'Simulation Fan',
    routePath: `/fan/${fanId}`,
  });
  const homeRuntime = ensureHomeEconomyRuntime(routePath);

  const sessionId = `sim-session-${artistId}`;
  recordSessionSnapshot({
    sessionId,
    entityId: artistId,
    entityType: 'artist',
    startedAt: Date.now(),
    durationMs: 42 * 60 * 1000,
    currentAudienceCount: 64,
    totalJoins: 128,
    averageRetention: 0.81,
    xpEarned: 260,
    status: 'ended',
  });
  const retention = calculateRetentionBonus({
    sessionId,
    initialAudienceCount: 128,
    audienceCountAt3min: 110,
    audienceCountAt5min: 100,
    audienceCountAt10min: 88,
    averageWatchTimeSeconds: 520,
  });
  recordLiveSessionForStreak({ entityId: artistId, sessionDate: Date.now() });

  const concertId = createWorldConcert({ artistId, title: 'Sim World Concert' });
  recordConcertMetrics({
    concertId,
    globalAttendance: 640,
    countriesRepresented: 22,
    totalTicketsSold: 230,
  });

  const premiereId = createPremiere({
    artistId,
    premiereType: 'single',
    title: 'Sim Premiere',
    chartContribution: 'global',
  });
  recordPremiereEngagement(premiereId, 'view');
  recordPremiereEngagement(premiereId, 'share');
  recordPremiereEngagement(premiereId, 'tip');

  const releaseId = createRelease({
    artistId,
    releaseType: 'song',
    title: 'Sim Release',
  });
  releaseWentLive(releaseId);
  for (let index = 0; index < 110; index += 1) {
    recordReleaseEngagement(releaseId, 'view');
  }
  recordReleaseEngagement(releaseId, 'share');
  recordReleaseEngagement(releaseId, 'tip');
  recordReleaseEngagement(releaseId, 'conversion');
  check24HourMilestone(releaseId);

  const attendance = recordFanAttendance({
    fanId,
    eventId: concertId,
    eventType: 'concert',
    durationMinutes: 38,
    artistIds: [artistId],
    venue: 'sim-venue-01',
  });
  recordParticipationActivity({ fanId, activityType: 'watch-concert', entityId: concertId });
  recordParticipationActivity({ fanId, activityType: 'watch-premiere', entityId: premiereId });

  const battleVoteXP = grantXP({
    userId: fanId,
    source: 'vote_cast',
    amount: 0,
    meta: { mode: 'battle-vote' },
  });
  recordParticipationActivity({
    fanId,
    activityType: 'vote',
    entityId: `battle-${artistId}`,
  });

  const tipXP = grantXP({
    userId: fanId,
    source: 'tip_sent',
    amount: 0,
    meta: { artistId },
  });
  recordParticipationActivity({ fanId, activityType: 'tip-artist', entityId: artistId });

  const eligibility = evaluateFanTicketEligibility({
    fanId,
    xpBalance: getUserXP(fanId),
    fraudScore: 12,
    accountAgeSeconds: 45 * 24 * 60 * 60,
    totalAttendances: getAttendanceStats(fanId)?.totalEventsAttended ?? 1,
    totalXPSpent: 120,
    isVerified: true,
  });

  const ticketModeId = createTicketCurrencyMode({
    eventId: concertId,
    eventName: 'Sim World Concert',
    ticketType: 'general',
    cashPrice: 35,
    xpPrice: 400,
    mode: 'hybrid',
    hybridRatio: 0.5,
    totalTicketsAvailable: 2000,
    eventDate: Date.now() + 3 * 24 * 60 * 60 * 1000,
  });
  recordTicketSale(ticketModeId, 'xp');

  const redemptionId = requestXPTicketRedemption({
    fanId,
    eventId: concertId,
    eventName: 'Sim World Concert',
    xpAmount: 400,
  });
  approveRedemption(redemptionId);
  const issuedTicketCode = issueTicketFromRedemption(redemptionId);
  markTicketUsed(redemptionId);

  addPointsToWallet(fanId, 220);
  const rewardId = createRewardItem({
    itemType: 'emote',
    name: 'Sim Crowd Hype',
    description: 'Simulation-only unlock to validate reward spend path.',
    xpCost: 120,
    rarity: 'rare',
  });
  const rewardPurchase = purchaseRewardItem(fanId, rewardId);
  const pointRedemptionId = requestPointRedemption({
    fanId,
    rewardId: 'sim-profile-frame',
    rewardName: 'Simulation Profile Frame',
    pointsCost: 80,
  });
  approvePointRedemption(pointRedemptionId);
  const fulfillmentCode = fulfillPointRedemption(pointRedemptionId);

  recordFanStreakActivity({ fanId, streakType: 'daily-visits', activityDate: Date.now() });
  unlockFanAchievement(fanId, 'first-event');
  unlockFanAchievement(fanId, 'first-vote');
  unlockFanAchievement(fanId, 'first-tip');
  unlockAchievement(artistId, 'first-live');
  unlockAchievement(artistId, 'first-premiere');

  const artistXP =
    (getWorldConcert(concertId)?.xpEarned ?? 0) +
    (getPremiere(premiereId)?.xpEarned ?? 0) +
    (getRelease(releaseId)?.xpEarned ?? 0) +
    retention.bonusXP +
    getStreakBonusXP(artistId) +
    (getAchievementRegistry(artistId)?.totalXPFromAchievements ?? 0);

  return {
    identityLocked: artistRuntime.runtimeKey.length > 0,
    homeRuntimeActive: homeRuntime.motionDirectiveCount > 0,
    events: {
      artistLive: Boolean(getWorldConcert(concertId)?.endedAt),
      fanAttendance: attendance.durationMinutes > 0,
      ticketRedemption:
        eligibility.canBuyXPTickets &&
        Boolean(issuedTicketCode) &&
        getTicketAvailability(ticketModeId)?.totalSold === 1,
      premiere: Boolean(getPremiere(premiereId)?.premieredAt || getPremiere(premiereId)),
      release: Boolean(getRelease(releaseId)?.releasedAt),
      battleVote: battleVoteXP > 0,
      tip: tipXP > 0,
      xpGain: artistXP > 0,
    },
    snapshots: {
      artistXP,
      fanXP: getUserXP(fanId),
      fanPoints: getFanPointsWallet(fanId).pointsBalance,
      sessionSummary: getSessionSummary(),
      xpTicketStats: getXPTicketRedemptionStats(),
      fanPointRedemptionStats: getFanPointRedemptionStats(),
    },
  };
}
