/**
 * WorldDancePartyRuntimeEngine.ts — Phase 5.2 Persistent 24/7 World Dance Party Engine.
 * Manages 11 24/7 room states, autonomous Bot DJ vs. Human DJ seamless handovers,
 * crowd heat scoring (0-100), and platform-wide Global Dance Wave synchronization.
 * Emits pure semantic events ONLY — zero presentation math inside the engine.
 */

import { BaseCompetitionRuntime } from "@/lib/competition/CompetitionRuntime";
import { DanceParticipant, SpatialCoordinates } from "./SpatialAudioMixer";

export type DancePartyState =
  | "VENUE_OPENING"
  | "WARMUP"
  | "DANCE_SESSION"
  | "PEAK_HOUR"
  | "SPONSOR_MOMENT"
  | "PRIZE_DROP"
  | "DJ_TRANSITION"
  | "THEME_CHANGE"
  | "COUNTDOWN"
  | "AFTER_HOURS"
  | "LOOP";

export interface DJProfile {
  djId: string;
  name: string;
  isBot: boolean;
  genre: string;
  currentBpm: number;
}

export interface BeatAnalysisSignal {
  timestamp: number;
  bassIntensity: number; // 0.0 to 1.0
  bpm: number;
  isDrop: boolean;
  isBreakdown: boolean;
  silenceDetected: boolean;
}

export class WorldDancePartyRuntimeEngine extends BaseCompetitionRuntime {
  private danceState: DancePartyState = "VENUE_OPENING";
  private currentDj: DJProfile;
  private participantsMap = new Map<string, DanceParticipant>();
  private djBoothPosition: SpatialCoordinates = { x: 0, y: 0 };
  private globalWaveActive: boolean = false;
  private crowdHeatScore: number = 25; // 0-100

  constructor(roomId: string, initialDj?: DJProfile) {
    super(roomId, "CONCERT");
    this.currentDj = initialDj ?? {
      djId: "bot-dj-01",
      name: "DJ CyberBot",
      isBot: true,
      genre: "EDM/House",
      currentBpm: 128,
    };
  }

  public start247Room(title: string = "24/7 Global Dance Arena", genreCategory: string = "EDM") {
    this.danceState = "WARMUP";
    this.status = "IN_PROGRESS";
    this.emitSemanticEvent("RoomStarted", {
      roomId: this.competitionId,
      title,
      genreCategory,
      currentDj: this.currentDj,
    });
  }

  public transitionDj(incomingDj: DJProfile): string {
    const previousDj = this.currentDj;
    this.currentDj = incomingDj;
    this.danceState = "DJ_TRANSITION";

    const transitionMessage = previousDj.isBot && !incomingDj.isBot
      ? `Seamless human takeover: ${incomingDj.name} replaced Bot DJ [${previousDj.name}] with zero audio drop.`
      : `DJ transition completed from ${previousDj.name} to ${incomingDj.name}.`;

    this.emitSemanticEvent("DjTransition", {
      roomId: this.competitionId,
      previousDj,
      incomingDj,
      transitionMessage,
    });

    return transitionMessage;
  }

  public registerParticipant(participant: DanceParticipant) {
    this.participantsMap.set(participant.userId, participant);
    this.recalculateCrowdHeat();
  }

  public updateBeatSignal(signal: BeatAnalysisSignal) {
    this.emitSemanticEvent("BeatSignalProcessed", {
      roomId: this.competitionId,
      signal,
      currentDj: this.currentDj,
    });

    if (signal.isDrop) {
      this.emitSemanticEvent("BeatDropTriggered", {
        roomId: this.competitionId,
        intensity: signal.bassIntensity,
        bpm: signal.bpm,
      });
    } else if (signal.bassIntensity > 0.75) {
      this.emitSemanticEvent("HighBassPulse", {
        roomId: this.competitionId,
        intensity: signal.bassIntensity,
      });
    }
  }

  public recalculateCrowdHeat(): number {
    const total = this.participantsMap.size;
    let dancingCount = 0;
    for (const p of this.participantsMap.values()) {
      if (p.isDancing) dancingCount += 1;
    }
    const ratio = total > 0 ? dancingCount / total : 0.5;
    this.crowdHeatScore = Math.min(100, Math.round(ratio * 70 + Math.min(30, total * 3)));

    if (this.crowdHeatScore >= 75) {
      this.danceState = "PEAK_HOUR";
      this.emitSemanticEvent("CrowdHeatSurge", {
        roomId: this.competitionId,
        heatScore: this.crowdHeatScore,
        tier: this.crowdHeatScore >= 90 ? "LEGENDARY" : "ON_FIRE",
      });
    }

    return this.crowdHeatScore;
  }

  public triggerGlobalDanceWave() {
    this.globalWaveActive = true;
    this.emitSemanticEvent("GlobalDanceWaveSync", {
      roomId: this.competitionId,
      waveColor: "GOLD_CYAN_GRADIENT",
      confettiBurst: true,
    });
  }

  public endGlobalDanceWave() {
    this.globalWaveActive = false;
    this.emitSemanticEvent("GlobalDanceWaveEnded", {
      roomId: this.competitionId,
    });
  }

  public cooldown() {
    this.danceState = "AFTER_HOURS";
    this.status = "IDLE";
    this.participantsMap.clear();
    this.emitSemanticEvent("DancePartyCooldown", {
      roomId: this.competitionId,
    });
  }
}

export default WorldDancePartyRuntimeEngine;
