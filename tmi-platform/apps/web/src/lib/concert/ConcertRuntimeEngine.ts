/**
 * ConcertRuntimeEngine.ts — Phase 5.2 Concert Competition & Arena Show Engine.
 * Manages 18 concert lifecycle states: from venue prep, seating, sponsor roll,
 * stage entrance, audience participation, sponsor moments, prize giveaways,
 * encore votes to credits and after party.
 * Emits pure semantic events ONLY — zero presentation math inside the engine.
 */

import { BaseCompetitionRuntime, Competitor } from "@/lib/competition/CompetitionRuntime";

export type ConcertState =
  | "VENUE_PREP"
  | "HOUSE_LIGHTS"
  | "SEATING"
  | "SPONSOR_ROLL"
  | "ARTIST_INTRO"
  | "STAGE_ENTRANCE"
  | "OPENING_SONG"
  | "PERFORMANCE_ACTIVE"
  | "BETWEEN_SONG_INTERACTION"
  | "GUEST_APPEARANCE"
  | "AUDIENCE_WAVE"
  | "SPONSOR_MOMENT"
  | "ENCORE_VOTE"
  | "ENCORE"
  | "MEET_AND_GREET"
  | "PRIZE_AWARDED"
  | "CREDITS"
  | "AFTER_PARTY";

export interface ConcertSongTrack {
  trackId: string;
  title: string;
  artistName: string;
  durationSeconds: number;
  audioUrl?: string;
  isEncoreTrack?: boolean;
}

export class ConcertRuntimeEngine extends BaseCompetitionRuntime {
  private setlist: ConcertSongTrack[] = [];
  private currentTrackIndex: number = 0;
  private concertState: ConcertState = "VENUE_PREP";
  private headliner?: Competitor;

  constructor(concertId: string) {
    super(concertId, "CONCERT");
  }

  public prepareVenue(headliner: Competitor, setlist: ConcertSongTrack[]) {
    this.headliner = headliner;
    this.setlist = setlist;
    this.participants = [headliner];
    this.concertState = "VENUE_PREP";
    this.emitSemanticEvent("VenuePrep", {
      concertId: this.competitionId,
      headliner,
      trackCount: setlist.length,
    });
  }

  public activateHouseLights() {
    this.concertState = "HOUSE_LIGHTS";
    this.emitSemanticEvent("HouseLightsActivated", {
      concertId: this.competitionId,
    });
  }

  public runSponsorRoll(sponsorName: string = "Nike") {
    this.concertState = "SPONSOR_ROLL";
    this.emitSemanticEvent("SponsorRollStarted", {
      concertId: this.competitionId,
      sponsorName,
    });
  }

  public triggerStageEntrance() {
    this.concertState = "STAGE_ENTRANCE";
    this.status = "IN_PROGRESS";
    this.emitSemanticEvent("StageEntrance", {
      concertId: this.competitionId,
      headliner: this.headliner,
    });
  }

  public startOpeningSong() {
    this.concertState = "OPENING_SONG";
    this.currentTrackIndex = 0;
    const track = this.setlist[0];
    this.emitSemanticEvent("OpeningSongStarted", {
      concertId: this.competitionId,
      track,
    });
  }

  public triggerAudienceWave(mode: "WAVE" | "PHONE_LIGHTS" | "GLOW_STICKS" = "WAVE") {
    this.concertState = "AUDIENCE_WAVE";
    this.emitSemanticEvent("AudienceWaveTriggered", {
      concertId: this.competitionId,
      mode,
    });
  }

  public triggerSponsorMoment(sponsorName: string, sponsorMessage: string) {
    this.concertState = "SPONSOR_MOMENT";
    this.emitSemanticEvent("SponsorMomentStarted", {
      concertId: this.competitionId,
      sponsorName,
      sponsorMessage,
    });
  }

  public awardAudiencePrize(winnerId: string, winnerName: string, prizeTitle: string) {
    this.concertState = "PRIZE_AWARDED";
    this.emitSemanticEvent("PrizeAwarded", {
      concertId: this.competitionId,
      winnerId,
      winnerName,
      prizeTitle,
    });
  }

  public openEncoreVote() {
    this.concertState = "ENCORE_VOTE";
    this.emitSemanticEvent("EncoreVoteOpened", {
      concertId: this.competitionId,
    });
  }

  public startEncore() {
    this.concertState = "ENCORE";
    const encoreTrack = this.setlist.find((t) => t.isEncoreTrack) ?? this.setlist[this.setlist.length - 1];
    this.emitSemanticEvent("EncoreStarted", {
      concertId: this.competitionId,
      track: encoreTrack,
    });
  }

  public endConcert() {
    this.concertState = "CREDITS";
    this.status = "COMPLETED";
    this.emitSemanticEvent("ConcertEnded", {
      concertId: this.competitionId,
    });
  }

  public enterAfterParty() {
    this.concertState = "AFTER_PARTY";
    this.status = "IDLE";
    this.emitSemanticEvent("AfterPartyStarted", {
      concertId: this.competitionId,
    });
  }
}

export default ConcertRuntimeEngine;
