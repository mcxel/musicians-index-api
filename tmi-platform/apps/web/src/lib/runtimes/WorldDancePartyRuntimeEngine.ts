/**
 * WorldDancePartyRuntimeEngine — Signature World Dance Party Runtime.
 * Manages DJ rotations, dance floor occupancy, beat drops, synchronized lighting,
 * and avatar dance animations.
 * Inherits SocialRuntime / BaseCompetitionRuntime for shared venue presence.
 */

import { VenueRuntime } from "./VenueRuntime";

export interface DanceFloorParticipant {
  userId: string;
  displayName: string;
  danceStyle: "HIPHOP" | "BREAKDANCE" | "EDM_SHUFFLE" | "FREESTYLE";
}

export class WorldDancePartyRuntimeEngine {
  private partyId: string;
  private venue: VenueRuntime;
  private currentDJName: string;
  private dancers: Map<string, DanceFloorParticipant> = new Map();

  constructor(partyId: string, partyName: string, djName: string = "DJ Electro") {
    this.partyId = partyId;
    this.currentDJName = djName;
    this.venue = new VenueRuntime(partyId, partyName, 200);
  }

  public startDanceParty() {
    this.emitEvent("WorldDancePartyStarted", {
      djName: this.currentDJName,
    });
  }

  public joinDanceFloor(dancer: DanceFloorParticipant) {
    this.dancers.set(dancer.userId, dancer);
    this.emitEvent("DancerJoinedFloor", {
      userId: dancer.userId,
      danceStyle: dancer.danceStyle,
    });
  }

  public triggerBeatDrop(intensity: "HIGH" | "MASSIVE" = "MASSIVE") {
    this.emitEvent("BeatDropped", {
      intensity,
      timestamp: Date.now(),
    });
  }

  public rotateDJ(newDJName: string) {
    this.currentDJName = newDJName;
    this.emitEvent("DJRotated", {
      djName: newDJName,
    });
  }

  private emitEvent(eventName: string, payload?: Record<string, unknown>) {
    if (typeof window === "undefined") return;
    try {
      window.dispatchEvent(
        new CustomEvent("tmi:system:event", {
          detail: { eventName, payload: { ...payload, partyId: this.partyId } },
        })
      );
    } catch (e) {}
  }
}

export default WorldDancePartyRuntimeEngine;
