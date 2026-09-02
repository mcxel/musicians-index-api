/**
 * JumbotronAdObservatoryControlRoom.ts
 *
 * Observatory Ad Surface Control Room contract — 4-face preview + TAKE/HOLD/NEXT.
 * Types + in-memory operator commands only (UI scaffold stays OPEN).
 */

import {
  type ObservatoryAdSurfaceControlRoomState,
  type ObservatoryFaceCommand,
  type ObservatoryFacePreview,
  type JumbotronCardinalFace,
  VenueAdPriority,
} from "./JumbotronAdContracts";
import { JumbotronFaceTargetRegistry } from "./JumbotronFaceTargetRegistry";
import { VenueAdSurfaceRegistry } from "../ads/VenueAdSurfaceRegistry";

export class JumbotronAdObservatoryControlRoom {
  private lastCommand: ObservatoryAdSurfaceControlRoomState["lastCommand"];

  constructor(
    public readonly roomId: string,
    public readonly venueId: string,
    private faces: JumbotronFaceTargetRegistry,
    private surfaces: VenueAdSurfaceRegistry
  ) {}

  public preview(): ObservatoryAdSurfaceControlRoomState {
    const previews: ObservatoryFacePreview[] = this.faces.listFaces().map((f) => {
      const inv = this.surfaces.getJumbotronFace(f.orientation);
      return {
        face: f.orientation,
        inventoryId: inv.inventoryId,
        creativeId: f.creativeId,
        campaignId: f.campaignId,
        priorityState: f.priorityState,
        compositionMode: f.compositionMode,
        safetyHold: f.safetyHold,
      };
    });
    return {
      roomId: this.roomId,
      venueId: this.venueId,
      faces: previews,
      lastCommand: this.lastCommand,
    };
  }

  public command(
    face: JumbotronCardinalFace,
    cmd: ObservatoryFaceCommand,
    operatorId: string,
    nowMs = Date.now()
  ): ObservatoryAdSurfaceControlRoomState {
    const state = this.faces.getFace(face);
    if (cmd === "HOLD") {
      this.faces.setSafetyHold(face, "REQUIRED_CUE");
    } else if (cmd === "TAKE") {
      this.faces.clearSafetyHold(face);
      this.faces.assignFace({
        orientation: face,
        source: state.currentSource ?? "PROGRAM",
        campaignId: state.campaignId,
        creativeId: state.creativeId,
        priority: VenueAdPriority.P2_RESULT_TIMER_SCORE,
        nowMs,
      });
    } else if (cmd === "NEXT") {
      // Operator advance — clears commercial hold for house next; UI wires queue later
      this.faces.clearSafetyHold(face);
    }
    this.lastCommand = { face, command: cmd, atMs: nowMs, operatorId };
    return this.preview();
  }
}
