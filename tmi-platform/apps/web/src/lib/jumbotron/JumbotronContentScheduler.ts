/**
 * JumbotronContentScheduler.ts — Per-face content queues
 *
 * Each cardinal face maintains independent queues for program / ad / merch /
 * fan-cam / promo. Not one shared queue mirrored 4×.
 */

import type { JumbotronCardinalFace, JumbotronContentKind } from "./JumbotronAdContracts";
import { VenueAdPriority } from "./JumbotronAdContracts";
import { JumbotronFaceTargetRegistry } from "./JumbotronFaceTargetRegistry";

export interface FaceQueueItem {
  id: string;
  kind: JumbotronContentKind;
  creativeId: string | null;
  campaignId: string | null;
  priority: VenueAdPriority;
  durationMs: number;
  enqueuedAtMs: number;
  payload?: Record<string, unknown>;
}

type QueueBucket = "PROGRAM" | "AD" | "MERCH" | "FAN_CAM" | "PROMO";

function bucketFor(kind: JumbotronContentKind): QueueBucket {
  switch (kind) {
    case "PROGRAM":
    case "SCORE":
    case "TIMER":
    case "EMERGENCY":
    case "SPOTLIGHT":
      return "PROGRAM";
    case "AD":
    case "AMBIENT_ART":
      return "AD";
    case "MERCH":
      return "MERCH";
    case "FAN_CAM":
      return "FAN_CAM";
    case "PROMO":
      return "PROMO";
    default:
      return "AD";
  }
}

export class JumbotronContentScheduler {
  private queues = new Map<
    JumbotronCardinalFace,
    Record<QueueBucket, FaceQueueItem[]>
  >();

  constructor(public readonly roomId: string) {
    for (const face of JumbotronFaceTargetRegistry.cardinalFaces()) {
      this.queues.set(face, {
        PROGRAM: [],
        AD: [],
        MERCH: [],
        FAN_CAM: [],
        PROMO: [],
      });
    }
  }

  public enqueue(face: JumbotronCardinalFace, item: FaceQueueItem): void {
    const q = this.queues.get(face)!;
    const bucket = bucketFor(item.kind);
    q[bucket].push(item);
    q[bucket].sort((a, b) => a.priority - b.priority || a.enqueuedAtMs - b.enqueuedAtMs);
  }

  public peek(face: JumbotronCardinalFace): FaceQueueItem | null {
    const q = this.queues.get(face)!;
    const order: QueueBucket[] = ["PROGRAM", "AD", "MERCH", "FAN_CAM", "PROMO"];
    for (const b of order) {
      if (q[b].length > 0) {
        // Within PROGRAM, highest priority (lowest enum) wins across kinds
        const sorted = [...q[b]].sort((a, b2) => a.priority - b2.priority);
        return sorted[0] ?? null;
      }
    }
    return null;
  }

  public takeNext(face: JumbotronCardinalFace): FaceQueueItem | null {
    const next = this.peek(face);
    if (!next) return null;
    const q = this.queues.get(face)!;
    const bucket = bucketFor(next.kind);
    const idx = q[bucket].findIndex((i) => i.id === next.id);
    if (idx >= 0) q[bucket].splice(idx, 1);
    return next;
  }

  public depth(face: JumbotronCardinalFace): number {
    const q = this.queues.get(face)!;
    return q.PROGRAM.length + q.AD.length + q.MERCH.length + q.FAN_CAM.length + q.PROMO.length;
  }

  public clearFace(face: JumbotronCardinalFace): void {
    this.queues.set(face, {
      PROGRAM: [],
      AD: [],
      MERCH: [],
      FAN_CAM: [],
      PROMO: [],
    });
  }
}
