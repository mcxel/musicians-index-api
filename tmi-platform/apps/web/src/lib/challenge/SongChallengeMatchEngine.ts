/**
 * SongChallengeMatchEngine.ts — Phase 5.2 Song Challenge Competition Engine.
 * Manages Best-of-Three series, 3 locked songs per artist, weighted rubric profiles,
 * and live audience crowd support split calculations.
 * Emits pure semantic events ONLY — zero presentation math inside the engine.
 */

import { BaseCompetitionRuntime } from "@/lib/competition/CompetitionRuntime";
import {
  MediaLockerSong,
  acquireMatchAssetLocks,
  releaseMatchAssetLocks,
} from "@/lib/medialocker/MediaLockerChallengeAdapter";

export type SongChallengeState =
  | "LOBBY"
  | "LOADOUT_LOCK"
  | "MEDIA_CHECK"
  | "INTRO"
  | "SONG_A_PLAYING"
  | "SONG_B_PLAYING"
  | "VOTING"
  | "ROUND_RESULT"
  | "COUNTER_WINDOW"
  | "MATCH_RESULT"
  | "CHAMPION_STAYS"
  | "NEXT_CHALLENGER"
  | "COOLDOWN"
  | "ENDED";

export type SongChallengeProfile =
  | "GENERAL"
  | "HIP_HOP"
  | "RNB_SOUL"
  | "ROCK"
  | "COUNTRY"
  | "GOSPEL"
  | "EDM_DANCE"
  | "SPOKEN_WORD"
  | "OPEN_GENRE";

export interface RubricCriteriaWeights {
  originality: number;
  production: number;
  performance: number;
  emotionalImpact: number;
}

export function getRubricWeights(profile: SongChallengeProfile): RubricCriteriaWeights {
  switch (profile) {
    case "RNB_SOUL":
    case "GOSPEL":
      return { originality: 0.2, production: 0.25, performance: 0.25, emotionalImpact: 0.3 };
    case "EDM_DANCE":
      return { originality: 0.2, production: 0.4, performance: 0.2, emotionalImpact: 0.2 };
    case "SPOKEN_WORD":
      return { originality: 0.3, production: 0.1, performance: 0.35, emotionalImpact: 0.25 };
    default:
      return { originality: 0.25, production: 0.25, performance: 0.25, emotionalImpact: 0.25 };
  }
}

export class SongChallengeMatchEngine extends BaseCompetitionRuntime {
  private mode: "BEST_OF_3" = "BEST_OF_3";
  private challengeProfile: SongChallengeProfile = "GENERAL";
  private challengerAId: string = "";
  private challengerBId: string = "";
  private loadoutA: MediaLockerSong[] = [];
  private loadoutB: MediaLockerSong[] = [];
  private currentRound: number = 1;
  private roundWinsA: number = 0;
  private roundWinsB: number = 0;
  private votesA: number = 0;
  private votesB: number = 0;
  private crowdSupportSplit: number = 0.5; // 0.0 (all A) to 1.0 (all B), 0.5 is neutral
  private currentChallengeState: SongChallengeState = "LOBBY";

  constructor(matchId: string, profile: SongChallengeProfile = "GENERAL") {
    super(matchId, "CHALLENGE");
    this.challengeProfile = profile;
  }

  public lockLoadouts(
    artistAId: string,
    loadoutA: MediaLockerSong[],
    artistBId: string,
    loadoutB: MediaLockerSong[],
  ): boolean {
    this.challengerAId = artistAId;
    this.challengerBId = artistBId;
    this.loadoutA = loadoutA;
    this.loadoutB = loadoutB;
    this.currentChallengeState = "LOADOUT_LOCK";

    acquireMatchAssetLocks(this.competitionId, [...loadoutA, ...loadoutB]);

    this.emitSemanticEvent("LoadoutLocked", {
      matchId: this.competitionId,
      challengerAId: artistAId,
      challengerBId: artistBId,
      songCountA: loadoutA.length,
      songCountB: loadoutB.length,
    });
    return true;
  }

  public startRound(roundNumber: number = 1) {
    this.currentRound = roundNumber;
    this.currentChallengeState = "INTRO";
    this.emitSemanticEvent("RoundStarted", {
      matchId: this.competitionId,
      roundNumber: this.currentRound,
      activeSongA: this.loadoutA[this.currentRound - 1],
      activeSongB: this.loadoutB[this.currentRound - 1],
    });
  }

  public playSongA() {
    this.currentChallengeState = "SONG_A_PLAYING";
    const song = this.loadoutA[this.currentRound - 1];
    this.emitSemanticEvent("SongStarted", {
      matchId: this.competitionId,
      side: "A",
      performerId: this.challengerAId,
      song,
    });
  }

  public playSongB() {
    this.currentChallengeState = "SONG_B_PLAYING";
    const song = this.loadoutB[this.currentRound - 1];
    this.emitSemanticEvent("SongStarted", {
      matchId: this.competitionId,
      side: "B",
      performerId: this.challengerBId,
      song,
    });
  }

  public openVoting() {
    this.currentChallengeState = "VOTING";
    this.votesA = 0;
    this.votesB = 0;
    this.crowdSupportSplit = 0.5;
    this.emitSemanticEvent("VotingOpen", {
      matchId: this.competitionId,
      roundNumber: this.currentRound,
    });
  }

  public submitRubricVote(side: "A" | "B", score: number = 10) {
    if (side === "A") this.votesA += score;
    else this.votesB += score;

    const total = Math.max(1, this.votesA + this.votesB);
    this.crowdSupportSplit = this.votesB / total;

    this.emitSemanticEvent("VoteMomentumChanged", {
      matchId: this.competitionId,
      roundNumber: this.currentRound,
      votesA: this.votesA,
      votesB: this.votesB,
      crowdSupportSplit: this.crowdSupportSplit,
    });

    if (side === "A" && this.votesA > this.votesB * 2.5 && this.votesA > 20) {
      this.emitSemanticEvent("PerformerOnFire", {
        matchId: this.competitionId,
        performerId: this.challengerAId,
        side: "A",
      });
    } else if (side === "B" && this.votesB > this.votesA * 2.5 && this.votesB > 20) {
      this.emitSemanticEvent("PerformerOnFire", {
        matchId: this.competitionId,
        performerId: this.challengerBId,
        side: "B",
      });
    }
  }

  public closeRound(): "A" | "B" {
    this.currentChallengeState = "ROUND_RESULT";
    const roundWinner = this.votesA >= this.votesB ? "A" : "B";
    if (roundWinner === "A") this.roundWinsA += 1;
    else this.roundWinsB += 1;

    this.emitSemanticEvent("RoundWon", {
      matchId: this.competitionId,
      roundNumber: this.currentRound,
      winnerSide: roundWinner,
      winnerId: roundWinner === "A" ? this.challengerAId : this.challengerBId,
      roundWinsA: this.roundWinsA,
      roundWinsB: this.roundWinsB,
    });

    return roundWinner;
  }

  public declareWinner(winnerId: string, winnerName: string, isSweep: boolean = false) {
    this.currentChallengeState = "MATCH_RESULT";
    this.winnerId = winnerId;
    this.emitSemanticEvent("WinnerDeclared", {
      matchId: this.competitionId,
      winnerId,
      winnerName,
      isSweep,
      scoreA: this.roundWinsA,
      scoreB: this.roundWinsB,
    });

    if (isSweep) {
      this.emitSemanticEvent("CleanSweep", {
        matchId: this.competitionId,
        winnerId,
      });
    }
  }

  public cooldown() {
    this.currentChallengeState = "COOLDOWN";
    releaseMatchAssetLocks(this.competitionId);
    this.emitSemanticEvent("ChallengeCooldown", {
      matchId: this.competitionId,
    });
  }
}

export default SongChallengeMatchEngine;
