export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getAllUsers, getUserByEmail } from '@/lib/auth/UserStore';
import { getAdminStats } from '@/lib/admin/AdminStatsEngine';
import { getAllSessions } from '@/lib/broadcast/GlobalLiveSessionRegistry';
import { getObservatorySnapshot } from '@/lib/admin/AdminObservatoryChat';
import { ACTIVE_SPONSOR_ZONES } from '@/lib/commerce/SponsorRegistry';
import { listAllTickets } from '@/lib/tickets/ticketCore';
import { getPresenceBreakdown, getPresenceCount } from '@/lib/rooms/RoomSessionBridge';
import prisma from '@/lib/prisma';
import { getMediaObservabilitySummary } from '@/lib/media/media-observability-store';
import { getRecentEvents, getSummary } from '@/lib/stripe/stripe-telemetry-store';
import { getRecentStageEvents, getStageEventSummary } from '@/lib/live/stageTelemetryStore';
import { getRuntimeRegistryHealthSnapshot, getRuntimeRegistrySummary, listSystemDependencyGraph } from '@/lib/runtime/RuntimeRegistry';
import { getVenueRealitySummary } from '@/lib/venue/VenueRealityCertificationEngine';
import { getRealityCertificationSummary } from '@/lib/reality/RealityCertificationEngine';
import { getFeedRegistrySummary } from '@/lib/broadcast/FeedRegistry';
import { getDirectorPlan } from '@/lib/broadcast/BroadcastDirectorEngine';
import { listBroadcastPanelStates } from '@/lib/broadcast/PanelRegistry';
import { MediaProcessingEngine } from '@/lib/media/MediaProcessingEngine';
import { getExecutiveAgentRuntimeSnapshot } from '@/lib/ops/ExecutiveAgentRuntime';
import { getUniversalAnalyticsSnapshot } from '@/lib/analytics/UniversalAnalyticsLayer';

function getUserFromRequest(req: NextRequest) {
  const email = req.cookies.get('tmi_user_email')?.value ?? '';
  if (!email) return null;
  return getUserByEmail(email);
}

export async function GET(req: NextRequest) {
  const user = getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const now = Date.now();
  const dayStart = new Date();
  dayStart.setHours(0, 0, 0, 0);
  const weekStartMs = now - (7 * 24 * 60 * 60 * 1000);
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  const [adminStats, observatorySnapshot] = await Promise.all([
    getAdminStats(),
    Promise.resolve(getObservatorySnapshot()),
  ]);

  const liveSessions = getAllSessions();
  const liveRooms = new Set(liveSessions.map((session) => session.roomId)).size;
  const ticketCount = (await listAllTickets()).length;
  const sponsorCount = Object.keys(ACTIVE_SPONSOR_ZONES).length;
  const presence = getPresenceBreakdown();
  const users = getAllUsers(5000);

  const fanTierCounts = {
    pro: users.filter((u) => u.role === 'fan' && u.tier === 'PRO').length,
    silver: users.filter((u) => u.role === 'fan' && u.tier === 'SILVER').length,
    gold: users.filter((u) => u.role === 'fan' && u.tier === 'GOLD').length,
    platinum: users.filter((u) => u.role === 'fan' && u.tier === 'PLATINUM').length,
    diamond: users.filter((u) => u.role === 'fan' && u.tier === 'DIAMOND').length,
  };

  const performerTierCounts = {
    pro: users.filter((u) => (u.role === 'performer' || u.role === 'artist') && u.tier === 'PRO').length,
    silver: users.filter((u) => (u.role === 'performer' || u.role === 'artist') && u.tier === 'SILVER').length,
    gold: users.filter((u) => (u.role === 'performer' || u.role === 'artist') && u.tier === 'GOLD').length,
    platinum: users.filter((u) => (u.role === 'performer' || u.role === 'artist') && u.tier === 'PLATINUM').length,
    diamond: users.filter((u) => (u.role === 'performer' || u.role === 'artist') && u.tier === 'DIAMOND').length,
  };

  const categoryCount = (category: string): number => liveSessions.filter((s) => s.category === category).length;
  const radioRoomsActive = liveSessions.filter((s) => {
    const text = `${s.title} ${s.roomId} ${s.category}`.toLowerCase();
    return text.includes('radio');
  }).length;
  const playlistRoomsActive = liveSessions.filter((s) => {
    const text = `${s.title} ${s.roomId} ${s.category}`.toLowerCase();
    return text.includes('playlist');
  }).length;

  const mediaSummary = getMediaObservabilitySummary(dayStart.getTime());
  const [songsUploadedToday, videosUploadedToday] = await Promise.all([
    prisma.song.count({ where: { createdAt: { gte: dayStart } } }).catch(() => 0),
    prisma.video.count({ where: { createdAt: { gte: dayStart } } }).catch(() => 0),
  ]);
  const queueStats = MediaProcessingEngine.getQueueStats();

  const stripeEvents = getRecentEvents(500);
  const revenueFromEvents = (fromTs: number): number => {
    return stripeEvents.reduce((sum, event) => {
      if (event.ts < fromTs) return sum;
      const amountCents = Number(event.meta?.amountCents ?? 0);
      const amount = Number.isFinite(amountCents) ? amountCents / 100 : 0;
      return sum + amount;
    }, 0);
  };

  const eventTypeCount = (...types: string[]): number => {
    const allowed = new Set(types);
    return stripeEvents.filter((event) => allowed.has(String(event.meta?.eventType ?? event.meta?.type ?? ''))).length;
  };

  const stripeSummary = getSummary();
  const stripeFailures =
    (stripeSummary.byCategory.verification ?? 0) +
    (stripeSummary.byCategory.malformed ?? 0) +
    (stripeSummary.byCategory.upstream ?? 0) +
    (stripeSummary.byCategory.timeout ?? 0);
  const stripeSuccess = stripeSummary.byCategory.success ?? 0;
  const stripeHealth = stripeFailures > 0 ? 'DEGRADED' : stripeSuccess > 0 ? 'HEALTHY' : 'NO_WEBHOOK_EVENTS';

  const missingPreview = liveSessions.filter((s) => !s.previewUrl).length;
  const missingThumbnail = liveSessions.filter((s) => !s.thumbnailUrl).length;
  const missingStreams = liveSessions.filter((s) => !s.audioOk || s.bitrateKbps <= 0 || s.streamHealth === 'critical').length;
  const stageEvents = getRecentStageEvents(20);
  const stageSummary = getStageEventSummary();
  const runtimeSummary = getRuntimeRegistrySummary();
  const venueRealitySummary = getVenueRealitySummary();
  const realitySummary = getRealityCertificationSummary();
  const feedSummary = getFeedRegistrySummary();
  const directorPlan = getDirectorPlan();
  const panels = listBroadcastPanelStates();
  const executiveRuntime = getExecutiveAgentRuntimeSnapshot();
  const universalAnalytics = getUniversalAnalyticsSnapshot();

  const runtimeHealth = getRuntimeRegistryHealthSnapshot({
    dependencySignals: {
      'stripe-webhook-ingest': stripeHealth === 'HEALTHY' ? 'healthy' : 'degraded',
      'webrtc-session-layer': missingStreams > 0 ? 'warning' : 'healthy',
      'audience-scene': stageSummary.activeRooms > 0 ? 'healthy' : 'warning',
      'media-pipeline': (mediaSummary.failedTranscodes > 0 || mediaSummary.failedUploads > 0) ? 'warning' : 'healthy',
      'observatory-summary-api': 'healthy',
      'venue-renderer': venueRealitySummary.averageOverall >= 90 ? 'healthy' : 'warning',
      'avatar-rig-registry': realitySummary.byModule.avatar.average >= 85 ? 'healthy' : 'warning',
      'avatar-motion-engine': realitySummary.byModule.animation.average >= 85 ? 'healthy' : 'warning',
      'avatar-wardrobe-engine': realitySummary.byModule.avatar.average >= 80 ? 'healthy' : 'warning',
    },
  });

  return NextResponse.json({
    summary: {
      users: {
        total: adminStats.users.total,
        online: getPresenceCount(),
        paid: adminStats.business.paidMembers,
        free: Math.max(0, adminStats.users.total - adminStats.business.paidMembers),
      },
      membership: {
        performer: performerTierCounts,
        fan: fanTierCounts,
      },
      rooms: {
        total: observatorySnapshot.rooms.length,
        active: liveRooms,
        liveSessions: liveSessions.length,
        occupancy: observatorySnapshot.totalOccupancy,
      },
      liveActivity: {
        liveRooms,
        livePerformers: Math.max(liveSessions.length, presence.performer),
        liveFans: presence.fan,
        battlesActive: categoryCount('battle'),
        cyphersActive: categoryCount('cypher'),
        challengesActive: categoryCount('challenge'),
        radioRoomsActive,
        playlistRoomsActive,
      },
      uploadHealth: {
        imagesUploadedToday: mediaSummary.imagesUploaded,
        songsUploadedToday,
        videosUploadedToday,
        failedUploads: mediaSummary.failedUploads,
        failedTranscodes: mediaSummary.failedTranscodes > 0 ? mediaSummary.failedTranscodes : queueStats.failed,
        failedPlaylistImports: mediaSummary.failedPlaylistImports,
      },
      business: {
        revenueToday: adminStats.business.revenueToday,
        revenueMonth: adminStats.business.revenueMonth,
      },
      revenueHealth: {
        revenueToday: revenueFromEvents(dayStart.getTime()),
        revenueWeek: revenueFromEvents(weekStartMs),
        revenueMonth: revenueFromEvents(monthStart.getTime()),
        newSubscriptions: eventTypeCount('customer.subscription.created', 'checkout.session.completed'),
        renewals: eventTypeCount('invoice.paid', 'invoice.payment_succeeded'),
        failedPayments: eventTypeCount('invoice.payment_failed'),
        pendingPayments: eventTypeCount('invoice.created', 'payment_intent.processing', 'payment_intent.requires_action'),
        stripeHealth,
      },
      commerce: {
        tickets: ticketCount,
        sponsors: sponsorCount,
      },
      discoveryHealth: {
        roomsVisibleOnDiscovery: liveSessions.length,
        roomsMissingPreview: missingPreview,
        roomsMissingThumbnails: missingThumbnail,
        roomsMissingStreams: missingStreams,
      },
      observatory: {
        hottestRoom: observatorySnapshot.hottest,
        activeGifts: observatorySnapshot.totalActiveGifts,
        totalConflicts: observatorySnapshot.totalRuntimeConflicts,
      },
      stage: {
        totalEvents: stageSummary.total,
        activeRooms: stageSummary.activeRooms,
        lastEventTs: stageSummary.lastEventTs,
        latestEvent: stageEvents[0] ?? null,
      },
      runtimeRegistry: runtimeSummary,
      runtimeHealth: {
        updatedAtMs: runtimeHealth.updatedAtMs,
        healthy: runtimeHealth.summary.healthy,
        warning: runtimeHealth.summary.warning,
        degraded: runtimeHealth.summary.degraded,
        degradedEngines: runtimeHealth.degradedEngines,
      },
      systemDependencyGraph: {
        edges: listSystemDependencyGraph().length,
      },
      feedRegistry: feedSummary,
      panelRegistry: {
        totalPanels: panels.length,
        livePanels: panels.filter((panel) => panel.status === 'live').length,
        queuedPanels: panels.filter((panel) => panel.status === 'queued').length,
        idlePanels: panels.filter((panel) => panel.status === 'idle').length,
        updatedAtMs: Date.now(),
      },
      broadcastDirector: {
        mode: directorPlan.mode,
        preset: directorPlan.preset,
        timelineItems: directorPlan.timeline.length,
        queuedItems: directorPlan.timeline.filter((item) => item.status === 'queued' || item.status === 'next').length,
        updatedAtMs: directorPlan.updatedAtMs,
      },
      executiveAgents: {
        bigAce: {
          healthScore: executiveRuntime.agents.bigAce.healthScore,
          confidenceScore: executiveRuntime.agents.bigAce.confidenceScore,
          currentObjective: executiveRuntime.agents.bigAce.currentObjective,
          currentTask: executiveRuntime.agents.bigAce.currentTask,
          currentRecommendation: executiveRuntime.agents.bigAce.currentRecommendation,
          activeAlerts: executiveRuntime.agents.bigAce.activeAlerts,
          pendingApprovals: executiveRuntime.agents.bigAce.pendingApprovals,
          recentActions: executiveRuntime.agents.bigAce.recentActions.slice(0, 3),
        },
        mc: {
          healthScore: executiveRuntime.agents.mc.healthScore,
          confidenceScore: executiveRuntime.agents.mc.confidenceScore,
          currentObjective: executiveRuntime.agents.mc.currentObjective,
          currentTask: executiveRuntime.agents.mc.currentTask,
          currentRecommendation: executiveRuntime.agents.mc.currentRecommendation,
          activeAlerts: executiveRuntime.agents.mc.activeAlerts,
          pendingApprovals: executiveRuntime.agents.mc.pendingApprovals,
          recentActions: executiveRuntime.agents.mc.recentActions.slice(0, 3),
        },
      },
      universalAnalytics,
      venueReality: venueRealitySummary,
      realityCertification: {
        updatedAtMs: realitySummary.updatedAtMs,
        totalScorecards: realitySummary.totalScorecards,
        overallAverage: realitySummary.overallAverage,
        venueAverage: realitySummary.byModule.venue.average,
        avatarAverage: realitySummary.byModule.avatar.average,
        uiAverage: realitySummary.byModule.ui.average,
        cameraAverage: realitySummary.byModule.camera.average,
      },
      lastUpdatedTs: Date.now(),
    },
  });
}