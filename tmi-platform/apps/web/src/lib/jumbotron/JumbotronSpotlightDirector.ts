/**
 * JumbotronSpotlightDirector.ts — People Spotlight
 *
 * REAL participants only. Consent required. Minors protected. Friend groups first-class.
 */

import type { SpotlightConsentMode } from "./JumbotronAdContracts";

export type SpotlightPresenceType = "FAN_AVATAR" | "LIVE_VIDEO" | "PERFORMER";

export interface SpotlightCandidate {
  participantId: string;
  displayName: string;
  presenceType: SpotlightPresenceType;
  groupId?: string;
  seatId?: string;
  sectionId?: string;
  worldPosition: [number, number, number];
  avatarMeshUrl?: string;
  publicVideoFeed: boolean;
  jumbotronParticipationConsent: boolean;
  cameraActive: boolean;
  moderationEligible: boolean;
  liveVideoSourceId?: string;
  isMinor?: boolean;
}

export interface SpotlightMoment {
  momentId: string;
  presenceType: SpotlightPresenceType;
  participants: SpotlightCandidate[];
  renderConsent: SpotlightConsentMode;
  template?: string;
  lookUpNoticeText?: string;
  subline?: string;
}

export class JumbotronSpotlightDirector {
  private roster = new Map<string, SpotlightCandidate>();
  private seq = 0;

  public registerParticipant(p: SpotlightCandidate): void {
    if (p.isMinor) {
      // Stored but never eligible for giant-screen
      this.roster.set(p.participantId, p);
      return;
    }
    this.roster.set(p.participantId, p);
  }

  public clearRoster(): void {
    this.roster.clear();
  }

  private eligible(p: SpotlightCandidate): boolean {
    if (p.isMinor) return false;
    if (!p.moderationEligible) return false;
    if (!p.jumbotronParticipationConsent) return false;
    return true;
  }

  public triggerFriendGroupSpotlight(groupId: string): SpotlightMoment | null {
    const members = [...this.roster.values()].filter(
      (p) => p.groupId === groupId && this.eligible(p)
    );
    if (members.length === 0) return null;
    return {
      momentId: `spot-${++this.seq}`,
      presenceType: "FAN_AVATAR",
      participants: members,
      renderConsent: "AVATAR_ONLY",
      template: "FRIEND_GROUP",
      lookUpNoticeText: "LOOK UP — YOUR SQUAD IS ON THE BIG SCREEN",
      subline: `${members.length} friends spotlight`,
    };
  }

  public triggerLiveVideoSpotlight(participantId: string): SpotlightMoment | null {
    const p = this.roster.get(participantId);
    if (!p) return null;
    if (!p.jumbotronParticipationConsent) return null;
    if (p.presenceType === "LIVE_VIDEO" && (!p.publicVideoFeed || !p.cameraActive)) {
      return null;
    }
    if (!this.eligible(p)) return null;
    return {
      momentId: `spot-${++this.seq}`,
      presenceType: p.presenceType,
      participants: [p],
      renderConsent: p.presenceType === "LIVE_VIDEO" ? "LIVE_VIDEO" : "AVATAR_ONLY",
      template: "LIVE_FACE",
      lookUpNoticeText: "LOOK UP — LIVE FAN CAM",
      subline: p.displayName,
    };
  }

  public triggerPrizeWinnerSpotlight(params: {
    winnerId: string;
    winnerDisplayName: string;
    prizeName: string;
    sponsorName: string;
    seatId: string;
  }): SpotlightMoment {
    // Style only — winner identity must be provided by authoritative prize event (never invented)
    const existing = this.roster.get(params.winnerId);
    const participant: SpotlightCandidate = existing ?? {
      participantId: params.winnerId,
      displayName: params.winnerDisplayName,
      presenceType: "FAN_AVATAR",
      seatId: params.seatId,
      worldPosition: [0, 0, 0],
      publicVideoFeed: false,
      jumbotronParticipationConsent: true,
      cameraActive: false,
      moderationEligible: true,
    };
    return {
      momentId: `spot-${++this.seq}`,
      presenceType: participant.presenceType,
      participants: [participant],
      renderConsent: "AVATAR_ONLY",
      template: "CONFETTI",
      lookUpNoticeText: "LOOK UP — WINNER ON THE BIG SCREEN",
      subline: `${params.winnerDisplayName} WON ${params.prizeName} · ${params.sponsorName}`,
    };
  }

  /** Compatibility API used by JumbotronAdContracts-style selectors. */
  public select(request: {
    kind: string;
    roomId: string;
    requestedUserIds?: string[];
    friendGroupId?: string;
    allowRandomFromEligiblePool: boolean;
    preferFriendGroups: boolean;
  }): {
    accepted: boolean;
    reason: string;
    participants: SpotlightCandidate[];
    renderMode: SpotlightConsentMode | "REJECTED";
  } {
    if (this.roster.size === 0) {
      return {
        accepted: false,
        reason: "No real participants registered — spotlight invents nobody",
        participants: [],
        renderMode: "REJECTED",
      };
    }
    if (request.friendGroupId || request.kind === "FRIEND") {
      const moment = this.triggerFriendGroupSpotlight(
        request.friendGroupId ?? [...this.roster.values()][0]?.groupId ?? ""
      );
      if (!moment) {
        return {
          accepted: false,
          reason: "Eligible pool empty",
          participants: [],
          renderMode: "REJECTED",
        };
      }
      return {
        accepted: true,
        reason: "Friend group spotlight",
        participants: moment.participants,
        renderMode: moment.renderConsent,
      };
    }
    const id = request.requestedUserIds?.[0];
    if (!id) {
      if (!request.allowRandomFromEligiblePool) {
        return {
          accepted: false,
          reason: "No candidate ids and random disabled",
          participants: [],
          renderMode: "REJECTED",
        };
      }
      const pool = [...this.roster.values()].filter((p) => this.eligible(p));
      if (!pool.length) {
        return {
          accepted: false,
          reason: "Eligible pool empty (consent OFF, minors, or unknown ids)",
          participants: [],
          renderMode: "REJECTED",
        };
      }
      const moment = this.triggerLiveVideoSpotlight(pool[0]!.participantId);
      if (!moment) {
        return {
          accepted: false,
          reason: "Consent pipeline rejected",
          participants: [],
          renderMode: "REJECTED",
        };
      }
      return {
        accepted: true,
        reason: `Spotlight ${request.kind} accepted`,
        participants: moment.participants,
        renderMode: moment.renderConsent,
      };
    }
    const p = this.roster.get(id);
    if (!p || !this.eligible(p)) {
      return {
        accepted: false,
        reason: p?.jumbotronParticipationConsent === false
          ? `Consent OFF for ${id} — no unexpected giant-screen face`
          : "Eligible pool empty (consent OFF, minors, or unknown ids)",
        participants: [],
        renderMode: "REJECTED",
      };
    }
    return {
      accepted: true,
      reason: `Spotlight ${request.kind} accepted with AVATAR_ONLY`,
      participants: [p],
      renderMode: "AVATAR_ONLY",
    };
  }
}
