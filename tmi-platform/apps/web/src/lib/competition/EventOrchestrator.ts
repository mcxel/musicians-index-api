import { prisma } from "@/lib/prisma";
import { getShowHosts, type ShowHostAssignment } from "@/lib/hosts/HostShowAssignmentEngine";
import { getHostById, type HostIdentity } from "@/lib/hosts/HostIdentityRegistry";
import { battleFormatRulesEngine, type BattleFormatType, type BattleTier } from "@/lib/competition/BattleFormatRulesEngine";
import { getAdSlotForZone } from "@/lib/commerce/SponsorRegistry";
import { getPA, type PAScriptKey } from "@/lib/hosts/hostEngine";
import { competitionIntegrityEngine } from "@/lib/competition/CompetitionIntegrityEngine";
// MatchHistoryEngine (getHeadToHead, getPlayerStats) stays available as a
// real, separate service for other callers - just not invoked here, since
// competitionIntegrityEngine.recordMatchOutcome already writes the
// MatchHistory row atomically with the rating update.

export interface OrchestratedHost {
  id: string;
  name: string;
  role: string;
  voiceTag: string;
  motionTag: string;
  emoji: string;
  colorHex: string;
}

export interface OrchestratedEvent {
  roomId: string;
  showId: string;
  title: string;
  status: string;
  format: string;
  genreId: string;
  genreName: string;
  mainHost?: OrchestratedHost;
  coHosts: OrchestratedHost[];
  judges: OrchestratedHost[];
  paAnnouncer?: OrchestratedHost;
  prizeHost?: OrchestratedHost;
  countdownSeconds: number;
  absoluteStartTime: Date;
  viewerCount: number;
  sponsorName?: string;
  sponsorCta?: string;
  creatorUserId?: string | null;
  isMini: boolean;
}

// World vs Mini ownership (Rule 21 amendment, 2026-07-24): World events are
// platform/bot-created (no creatorUserId, isMini false). Mini events are
// created by a qualified user, are never bot-hosted (showId won't resolve
// via HostShowAssignmentEngine, so resolveHostsForShow() correctly returns
// no hosts), and must carry a real creatorUserId.
export interface EventOwnership {
  creatorUserId?: string;
  isMini?: boolean;
}

// Helpers to match emojis based on host id
function getHostEmoji(hostId: string): string {
  const map: Record<string, string> = {
    "big-ace": "👑",
    "bobby-stanley": "🎤",
    "kira": "🎙️",
    "bebo": "🤡",
    "jack-obrien": "📝",
    "hector-lvanos": "🕶️",
    "mindy-jean-long": "🎁",
    "julius": "🦊",
    "gregory-marcel": "🎙️",
    "record-ralph": "🎧",
    "nova-mc": "⚔️",
    "aura-pa": "📢",
  };
  return map[hostId] || "👤";
}

export class EventOrchestrator {
  /**
   * Resolves the full host identities assigned to a show
   */
  resolveHostsForShow(showId: string) {
    const assignments = getShowHosts(showId);
    if (!assignments) return null;

    const resolve = (id: string): OrchestratedHost | undefined => {
      const h = getHostById(id);
      if (!h) return undefined;
      return {
        id: h.id,
        name: h.name,
        role: h.role,
        voiceTag: h.voiceTag,
        motionTag: h.motionTag,
        emoji: getHostEmoji(h.id),
        colorHex: h.colorHex,
      };
    };

    const coHosts = (assignments.coHostIds || []).map(resolve).filter((x): x is OrchestratedHost => !!x);
    const judges = (assignments.judgeIds || []).map(resolve).filter((x): x is OrchestratedHost => !!x);

    return {
      mainHost: assignments.mainHostId ? resolve(assignments.mainHostId) : undefined,
      coHosts,
      judges,
      paAnnouncer: assignments.paAnnouncerId ? resolve(assignments.paAnnouncerId) : undefined,
      prizeHost: assignments.prizeHostId ? resolve(assignments.prizeHostId) : undefined,
    };
  }

  /**
   * Compiles and creates/saves a LobbyEvent coordinating all sub-engines
   */
  async compileEvent(
    roomId: string,
    showId: string,
    format: BattleFormatType,
    countdownSeconds: number,
    overrides?: { genreId?: string; genreName?: string; title?: string },
    ownership?: EventOwnership
  ): Promise<OrchestratedEvent | null> {
    // 1. Validate rules via BattleFormatRulesEngine
    const rule = battleFormatRulesEngine.getRule(format);
    if (!rule) {
      console.error(`Invalid format ${format} passed to EventOrchestrator`);
      return null;
    }

    // 2. Resolve hosts via HostShowAssignmentEngine + HostIdentityRegistry
    const hosts = this.resolveHostsForShow(showId);
    
    // 3. Resolve Sponsor fallback via SponsorRegistry (Rule 12)
    const adSlot = getAdSlotForZone(`room-${roomId}-ad`);
    const sponsorName = adSlot.type === "paid" ? adSlot.sponsor?.name : "TMI Network";
    const sponsorCta = adSlot.type === "paid" ? adSlot.sponsor?.ctaLabel : "UPGRADE MEMBERSHIP";

    const genreId = overrides?.genreId || "hip-hop";
    const genreName = overrides?.genreName || "Hip Hop";
    const title = overrides?.title || `${genreName} ${rule.label} Showdown`;

    const absoluteStartTime = new Date();
    absoluteStartTime.setSeconds(absoluteStartTime.getSeconds() + countdownSeconds);

    const mainHost = hosts?.mainHost;
    const coHostIdsStr = hosts?.coHosts.map((h) => h.id).join(",") || "";
    const judgeIdsStr = hosts?.judges.map((h) => h.id).join(",") || "";
    const paAnnouncerId = hosts?.paAnnouncer?.id || null;
    const prizeHostId = hosts?.prizeHost?.id || null;

    const isMini = ownership?.isMini ?? false;
    const creatorUserId = ownership?.creatorUserId ?? null;

    // 4. Save/Upsert into durable database store (Prisma LobbyEvent model)
    const dbEvent = await prisma.lobbyEvent.upsert({
      where: { roomId },
      update: {
        showId,
        title,
        status: countdownSeconds > 0 ? "countdown" : "open",
        format,
        genreId,
        genreName,
        mainHostId: mainHost?.id || null,
        mainHostName: mainHost?.name || null,
        coHostIds: coHostIdsStr,
        judgeIds: judgeIdsStr,
        paAnnouncerId,
        prizeHostId,
        countdownSeconds,
        absoluteStartTime,
      },
      create: {
        roomId,
        showId,
        title,
        status: countdownSeconds > 0 ? "countdown" : "open",
        format,
        genreId,
        genreName,
        mainHostId: mainHost?.id || null,
        mainHostName: mainHost?.name || null,
        coHostIds: coHostIdsStr,
        judgeIds: judgeIdsStr,
        paAnnouncerId,
        prizeHostId,
        countdownSeconds,
        absoluteStartTime,
        creatorUserId,
        isMini,
      },
    });

    return {
      roomId: dbEvent.roomId,
      showId: dbEvent.showId,
      title: dbEvent.title,
      status: dbEvent.status,
      format: dbEvent.format,
      genreId: dbEvent.genreId,
      genreName: dbEvent.genreName,
      mainHost,
      coHosts: hosts?.coHosts || [],
      judges: hosts?.judges || [],
      paAnnouncer: hosts?.paAnnouncer,
      prizeHost: hosts?.prizeHost,
      countdownSeconds: dbEvent.countdownSeconds,
      absoluteStartTime: dbEvent.absoluteStartTime,
      viewerCount: dbEvent.viewerCount,
      sponsorName,
      sponsorCta,
      creatorUserId: dbEvent.creatorUserId,
      isMini: dbEvent.isMini,
    };
  }

  /**
   * Generates a PA announcement string using hostEngine.getPA()
   */
  dispatchPAAnnouncement(
    showId: string,
    key: PAScriptKey,
    variables: Record<string, string> = {}
  ): string {
    const assignments = getShowHosts(showId);
    const announcerName = assignments?.paAnnouncerId ? getHostById(assignments.paAnnouncerId)?.name : "Aura";
    
    const announcementText = getPA(key, variables);
    return `[${announcerName?.toUpperCase()}] ${announcementText}`;
  }

  /**
   * Decrements active countdown in DB
   */
  async tickCountdown(roomId: string): Promise<{ status: string; seconds: number } | null> {
    const event = await prisma.lobbyEvent.findUnique({ where: { roomId } });
    if (!event) return null;

    if (event.countdownSeconds <= 0) {
      return { status: event.status, seconds: 0 };
    }

    const nextSeconds = event.countdownSeconds - 1;
    let nextStatus = event.status;

    if (nextSeconds <= 0) {
      nextStatus = "open";
    }

    const updated = await prisma.lobbyEvent.update({
      where: { roomId },
      data: {
        countdownSeconds: nextSeconds,
        status: nextStatus,
      },
    });

    return { status: updated.status, seconds: updated.countdownSeconds };
  }

  /**
   * Transition show status
   */
  async transitionStatus(roomId: string, nextStatus: string): Promise<string | null> {
    const updated = await prisma.lobbyEvent.update({
      where: { roomId },
      data: { status: nextStatus },
    });
    return updated.status;
  }

  /**
   * Fetches active coordinated room state from database
   */
  async getOrchestratedState(roomId: string): Promise<OrchestratedEvent | null> {
    const event = await prisma.lobbyEvent.findUnique({ where: { roomId } });
    if (!event) return null;

    const hosts = this.resolveHostsForShow(event.showId);
    
    // Resolve sponsor info
    const adSlot = getAdSlotForZone(`room-${roomId}-ad`);
    const sponsorName = adSlot.type === "paid" ? adSlot.sponsor?.name : "TMI Network";
    const sponsorCta = adSlot.type === "paid" ? adSlot.sponsor?.ctaLabel : "UPGRADE MEMBERSHIP";

    return {
      roomId: event.roomId,
      showId: event.showId,
      title: event.title,
      status: event.status,
      format: event.format,
      genreId: event.genreId,
      genreName: event.genreName,
      mainHost: hosts?.mainHost,
      coHosts: hosts?.coHosts || [],
      judges: hosts?.judges || [],
      paAnnouncer: hosts?.paAnnouncer,
      prizeHost: hosts?.prizeHost,
      countdownSeconds: event.countdownSeconds,
      absoluteStartTime: event.absoluteStartTime,
      viewerCount: event.viewerCount,
      sponsorName,
      sponsorCta,
      creatorUserId: event.creatorUserId,
      isMini: event.isMini,
    };
  }

  /**
   * Checks if competitor is eligible, specifically verifying they aren't on disconnect cooldown
   */
  async validateCompetitor(
    userId: string
  ): Promise<{ eligible: boolean; message: string; ratings: any }> {
    const ratings = await competitionIntegrityEngine.fetchRatings(userId);

    if (ratings.cooldownUntil && new Date(ratings.cooldownUntil) > new Date()) {
      const remainMins = Math.ceil(
        (new Date(ratings.cooldownUntil).getTime() - Date.now()) / 60000
      );
      return {
        eligible: false,
        message: `Competitor is currently on timeout cooldown. Re-entry allowed in ${remainMins} minutes.`,
        ratings,
      };
    }

    if (ratings.integrityRating < 30) {
      return {
        eligible: true,
        message: "Warning: low integrity rating. Matches will prioritize high-attendance peers.",
        ratings,
      };
    }

    return {
      eligible: true,
      message: "Competitor is fully eligible.",
      ratings,
    };
  }

  /**
   * Updates scores and dispatches PA Winner Announcements driven by the resolved host definitions
   */
  async recordOutcomeAndAnnounce(
    roomId: string,
    challengerId: string,
    opponentId: string,
    challengerScore: number
  ): Promise<{ announcement: string; challengerRatings: any; opponentRatings: any }> {
    const event = await prisma.lobbyEvent.findUnique({ where: { roomId } });
    const showId = event?.showId || "monthly-idol";
    const competitionType = event?.format || showId;

    // Process persistent Elo + CIR/RR/AR updates AND write the immutable
    // MatchHistory row atomically (competitionIntegrityEngine.recordMatchOutcome
    // does both inside one transaction - do not also call
    // matchHistoryEngine.recordMatchResult here, that would write a second,
    // duplicate history row for the same real match).
    const { challenger, opponent } = await competitionIntegrityEngine.recordMatchOutcome(
      challengerId,
      opponentId,
      challengerScore,
      { venueType: "room", venueId: roomId, competitionType }
    );

    // Generate dynamic PA call-out using host identity
    const winnerName = challengerScore > 0.5 ? `Challenger (${challengerId})` : `Opponent (${opponentId})`;
    const announcement = this.dispatchPAAnnouncement(showId, "winner-announce", {
      winner: winnerName,
    });

    return {
      announcement,
      challengerRatings: challenger,
      opponentRatings: opponent,
    };
  }
}

export const eventOrchestrator = new EventOrchestrator();
