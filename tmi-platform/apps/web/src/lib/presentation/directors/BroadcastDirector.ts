/**
 * BroadcastDirector (presentation bridge) — maps show pack category →
 * BroadcastDirectorEngine room profiles. Does not duplicate shot math.
 */

import ShowPackageDirector, {
  type ActiveShowPackageSnapshot,
} from "../ShowPackageDirector";
import { getShowPack } from "../ShowPackCatalog";
import type { RoomType } from "@/lib/live/BroadcastDirectorEngine";
import {
  emitPlacementIntent,
  type DirectorSnapshot,
  type PlacementIntent,
} from "./types";

function categoryToRoomType(category: string | undefined): RoomType {
  switch (category) {
    case "CYPHER":
      return "CYPHER";
    case "CHALLENGE":
      return "CHALLENGE";
    case "LOBBY":
      return "FAN_LOBBY";
    case "BATTLE":
    default:
      return "BATTLE";
  }
}

class BroadcastDirectorBridge {
  private lastIntent: PlacementIntent | null = null;
  private unsub: (() => void) | null = null;
  private lastRoomType: RoomType = "BATTLE";

  public start() {
    if (this.unsub) return;
    this.unsub = ShowPackageDirector.subscribe((snap) => this.onPackage(snap));
  }

  public stop() {
    this.unsub?.();
    this.unsub = null;
  }

  public getSnapshot(): DirectorSnapshot {
    return {
      directorId: "broadcast",
      status: this.lastIntent ? "ACTIVE" : "IDLE",
      lastIntent: this.lastIntent,
      notes: `Bridges to BroadcastDirectorEngine profile: ${this.lastRoomType}`,
    };
  }

  public getSuggestedRoomType(): RoomType {
    return this.lastRoomType;
  }

  private onPackage(snap: ActiveShowPackageSnapshot) {
    const pack = getShowPack(snap.packId);
    this.lastRoomType = categoryToRoomType(pack?.category);
    const intent: PlacementIntent = {
      directorId: "broadcast",
      at: Date.now(),
      command: `PROFILE_${this.lastRoomType}`,
      caption: snap.cameraCaption ?? undefined,
      meta: {
        roomType: this.lastRoomType,
        packId: snap.packId,
        phaseId: snap.phaseId,
        engine: "BroadcastDirectorEngine",
      },
    };
    this.lastIntent = intent;
    emitPlacementIntent(intent);
  }
}

export const BroadcastDirector = new BroadcastDirectorBridge();
export default BroadcastDirector;
