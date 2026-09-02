/**
 * JumbotronFaceTargetRegistry.ts
 *
 * One Jumbotron runtime → four independent Display Targets (NORTH/EAST/SOUTH/WEST).
 * NOT one ad copied 4×. Includes viewpoint / frustum helpers for Physical Advertising Truth.
 */

import type { DisplayTargetClass } from "../monitors/DisplayTargetDirector";
import {
  type JumbotronCardinalFace,
  type FaceCompositionMode,
  type JumbotronContentKind,
  type AudioPolicy,
  type AdSafetyHoldReason,
  VenueAdPriority,
} from "./JumbotronAdContracts";

export type CardinalFaceDirection = JumbotronCardinalFace;

export const CardinalFaceDirection = {
  NORTH: "NORTH",
  EAST: "EAST",
  SOUTH: "SOUTH",
  WEST: "WEST",
} as const;

const FACE_TO_TARGET: Record<CardinalFaceDirection, DisplayTargetClass> = {
  NORTH: "JUMBOTRON_NORTH",
  EAST: "JUMBOTRON_EAST",
  SOUTH: "JUMBOTRON_SOUTH",
  WEST: "JUMBOTRON_WEST",
};

const CARDINALS: CardinalFaceDirection[] = ["NORTH", "EAST", "SOUTH", "WEST"];

/**
 * Outward normals = direction the screen faces (emits toward viewers).
 * Stage sits at −Z; SOUTH is stage-facing (normal −Z). NORTH faces +Z bowl.
 */
const NORMALS: Record<CardinalFaceDirection, [number, number, number]> = {
  NORTH: [0, 0, 1],
  EAST: [1, 0, 0],
  SOUTH: [0, 0, -1],
  WEST: [-1, 0, 0],
};

export interface JumbotronFaceRecord {
  faceId: string;
  direction: CardinalFaceDirection;
  orientation: CardinalFaceDirection;
  displayTargetId: DisplayTargetClass;
  worldTransform: {
    position: [number, number, number];
    rotationEuler: [number, number, number];
    scale: [number, number, number];
  };
  resolution: { widthPx: number; heightPx: number };
  currentSource: string | null;
  currentCampaign: string | null;
  creativeId: string | null;
  campaignId: string | null;
  compositionMode: FaceCompositionMode;
  visibilityZone: string;
  audioPolicy: AudioPolicy;
  priorityState: VenueAdPriority;
  safetyHold: AdSafetyHoldReason;
  lastAssignedAtMs: number | null;
  /** SOUTH faces the stage/court by arena convention. */
  isStageFacing: boolean;
  /** Alias used by older JumbotronFaceTargetState consumers. */
  currentSourceKind: JumbotronContentKind | null;
}

export interface FaceVisibilitySample {
  direction: CardinalFaceDirection;
  isVisible: boolean;
  shouldRenderGpu: boolean;
  facingDot: number;
  distanceMeters: number;
}

const MAX_GPU_DISTANCE_METERS = 120;
const FACING_DOT_MIN = 0.15;

function dot(a: [number, number, number], b: [number, number, number]): number {
  return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
}

function normalize(v: [number, number, number]): [number, number, number] {
  const len = Math.hypot(v[0], v[1], v[2]) || 1;
  return [v[0] / len, v[1] / len, v[2] / len];
}

export class JumbotronFaceTargetRegistry {
  private faces = new Map<CardinalFaceDirection, JumbotronFaceRecord>();
  public readonly roomId: string;
  public readonly venueId: string;
  private readonly jumbotronCenter: [number, number, number] = [0, 8.5, 0];

  /**
   * @param inventoryOrRoom — `venue:{id}:jumbotron` prefix OR roomId when venueId also passed
   */
  constructor(inventoryOrRoom: string, venueId?: string, centerPosition?: [number, number, number]) {
    if (venueId) {
      this.roomId = inventoryOrRoom;
      this.venueId = venueId;
    } else {
      // e.g. venue:thunder-dome:jumbotron
      const parts = inventoryOrRoom.split(":");
      this.venueId = parts[1] ?? "venue";
      this.roomId = `room:${this.venueId}`;
    }
    if (centerPosition) {
      this.jumbotronCenter = centerPosition;
    }

    const faceOffset = 2.5;
    for (const direction of CARDINALS) {
      const n = NORMALS[direction];
      const yaw =
        direction === "NORTH"
          ? 0
          : direction === "EAST"
            ? Math.PI / 2
            : direction === "SOUTH"
              ? Math.PI
              : -Math.PI / 2;
      this.faces.set(direction, {
        faceId: `${this.venueId}:jumbotron:${direction.toLowerCase()}`,
        direction,
        orientation: direction,
        displayTargetId: FACE_TO_TARGET[direction],
        worldTransform: {
          position: [
            this.jumbotronCenter[0] + n[0] * faceOffset,
            this.jumbotronCenter[1],
            this.jumbotronCenter[2] + n[2] * faceOffset,
          ],
          rotationEuler: [0, yaw, 0],
          scale: [1, 1, 1],
        },
        resolution: { widthPx: 1920, heightPx: 1080 },
        currentSource: null,
        currentCampaign: null,
        creativeId: null,
        campaignId: null,
        compositionMode: "FULL",
        visibilityZone: `zone:${direction.toLowerCase()}`,
        audioPolicy: "DUCK_UNDER_PROGRAM",
        priorityState: VenueAdPriority.P6_AMBIENT,
        safetyHold: "NONE",
        lastAssignedAtMs: null,
        isStageFacing: direction === "SOUTH",
        currentSourceKind: null,
      });
    }
  }

  public getAllFaces(): JumbotronFaceRecord[] {
    return CARDINALS.map((d) => this.faces.get(d)!);
  }

  /** Alias for VenueAdDirector / shared-truth consumers. */
  public listFaces(): JumbotronFaceRecord[] {
    return this.getAllFaces();
  }

  public getFace(direction: CardinalFaceDirection): JumbotronFaceRecord {
    return this.faces.get(direction)!;
  }

  public getDisplayTargetId(orientation: CardinalFaceDirection): DisplayTargetClass {
    return FACE_TO_TARGET[orientation];
  }

  public assignFaceContent(
    direction: CardinalFaceDirection,
    sourceId: string,
    campaignId: string,
    nowMs = Date.now()
  ): JumbotronFaceRecord {
    const face = this.faces.get(direction)!;
    // Mutate in place — callers may hold face references across assigns
    face.currentSource = sourceId;
    face.currentCampaign = campaignId;
    face.creativeId = sourceId;
    face.campaignId = campaignId;
    face.currentSourceKind = "AD";
    face.lastAssignedAtMs = nowMs;
    face.priorityState = VenueAdPriority.P4_DIRECT_AD;
    return face;
  }

  public assignFace(params: {
    orientation: CardinalFaceDirection;
    source: JumbotronContentKind;
    campaignId: string | null;
    creativeId: string | null;
    compositionMode?: FaceCompositionMode;
    priority: VenueAdPriority;
    audioPolicy?: AudioPolicy;
    nowMs?: number;
  }): JumbotronFaceRecord {
    const face = this.faces.get(params.orientation)!;
    if (face.safetyHold !== "NONE" && params.priority >= VenueAdPriority.P3_CONTRACTED_SPONSOR) {
      return face;
    }
    face.currentSource = params.creativeId;
    face.currentCampaign = params.campaignId;
    face.creativeId = params.creativeId;
    face.campaignId = params.campaignId;
    face.currentSourceKind = params.source;
    face.compositionMode = params.compositionMode ?? face.compositionMode;
    face.priorityState = params.priority;
    face.audioPolicy = params.audioPolicy ?? face.audioPolicy;
    face.lastAssignedAtMs = params.nowMs ?? Date.now();
    return face;
  }

  public setSafetyHold(orientation: CardinalFaceDirection | "ALL", reason: AdSafetyHoldReason): void {
    const targets = orientation === "ALL" ? CARDINALS : [orientation];
    for (const o of targets) {
      this.faces.get(o)!.safetyHold = reason;
    }
  }

  public clearSafetyHold(orientation: CardinalFaceDirection | "ALL"): void {
    this.setSafetyHold(orientation, "NONE");
  }

  /**
   * Physical viewability: face is visible when viewer is roughly in front of its outward normal
   * and within GPU distance budget.
   */
  public resolveVisibleFaces(
    viewerPos: [number, number, number],
    viewerGaze: [number, number, number]
  ): FaceVisibilitySample[] {
    const gaze = normalize(viewerGaze);
    return CARDINALS.map((direction) => {
      const face = this.faces.get(direction)!;
      const toFace: [number, number, number] = [
        face.worldTransform.position[0] - viewerPos[0],
        face.worldTransform.position[1] - viewerPos[1],
        face.worldTransform.position[2] - viewerPos[2],
      ];
      const distanceMeters = Math.hypot(toFace[0], toFace[1], toFace[2]);
      const toFaceN = normalize(toFace);
      const faceNormal = NORMALS[direction];
      // Viewer in front of screen when (viewer - face) aligns with outward normal
      const toViewer = normalize([
        viewerPos[0] - face.worldTransform.position[0],
        viewerPos[1] - face.worldTransform.position[1],
        viewerPos[2] - face.worldTransform.position[2],
      ]);
      const facingDot = dot(toViewer, faceNormal);
      const gazeAlign = dot(gaze, toFaceN);
      const isVisible =
        facingDot >= FACING_DOT_MIN && gazeAlign > 0.05 && distanceMeters < MAX_GPU_DISTANCE_METERS;
      const shouldRenderGpu = isVisible && distanceMeters <= MAX_GPU_DISTANCE_METERS;
      return { direction, isVisible, shouldRenderGpu, facingDot, distanceMeters };
    });
  }

  public sharedRoomTruthSnapshot(): Record<
    CardinalFaceDirection,
    { creativeId: string | null; campaignId: string | null; source: JumbotronContentKind | null }
  > {
    const out = {} as Record<
      CardinalFaceDirection,
      { creativeId: string | null; campaignId: string | null; source: JumbotronContentKind | null }
    >;
    for (const o of CARDINALS) {
      const f = this.faces.get(o)!;
      out[o] = {
        creativeId: f.creativeId,
        campaignId: f.campaignId ?? f.currentCampaign,
        source: f.currentSourceKind,
      };
    }
    return out;
  }

  public static cardinalFaces(): CardinalFaceDirection[] {
    return [...CARDINALS];
  }
}
