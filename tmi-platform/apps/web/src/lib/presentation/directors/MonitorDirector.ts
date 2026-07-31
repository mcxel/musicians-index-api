/**
 * MonitorDirector.ts — Phase 5.1 Presentation Director Service.
 * Allocates surfaces across the canonical dual-monitor stack by surface intent
 * (PROGRAM, PREVIEW, ANALYTICS, SCORES, CHAT, JUDGES, SPONSOR, TELEMETRY, QUEUE).
 */

import ShowPackageDirector, { type ActiveShowPackageSnapshot } from "../ShowPackageDirector";
import { getShowPack } from "../ShowPackCatalog";
import { getMonitorAnchorZone, type MonitorAnchorZoneId } from "../MonitorAnchorZones";
import {
  DirectorId,
  DirectorSnapshot,
  DirectorValidationResult,
  PresentationCommand,
  PresentationContext,
  PresentationDirectorService,
  emitPlacementIntent,
  type PlacementIntent,
} from "./types";

export type SurfaceIntent =
  | "PROGRAM"
  | "PREVIEW"
  | "ANALYTICS"
  | "SCORES"
  | "CHAT"
  | "JUDGES"
  | "SPONSOR"
  | "TELEMETRY"
  | "QUEUE";

export interface MonitorAllocation {
  surfaceId: string;
  anchorId: MonitorAnchorZoneId;
  intent: SurfaceIntent;
  stackHint: "PRIMARY" | "SECONDARY" | "EITHER";
}

class MonitorDirectorEngine implements PresentationDirectorService {
  public readonly id: DirectorId = "monitor";
  private activeCommands: Map<string, PresentationCommand> = new Map();
  private lastIntents: Map<string, PlacementIntent> = new Map();
  private allocationsByRuntime: Map<string, MonitorAllocation[]> = new Map();
  private unsub: (() => void) | null = null;

  public start() {
    if (this.unsub) return;
    this.unsub = ShowPackageDirector.subscribe((snap) => this.onPackage(snap));
  }

  public stop() {
    this.unsub?.();
    this.unsub = null;
  }

  public validate(command: PresentationCommand): DirectorValidationResult {
    if (command.director !== "MONITOR") {
      return { valid: false, reason: `Invalid director '${command.director}' for MonitorDirector.` };
    }
    return { valid: true };
  }

  public async execute(command: PresentationCommand, _context: PresentationContext): Promise<void> {
    this.activeCommands.set(command.runtimeId, command);

    const payload = (command.payload ?? {}) as { allocations?: MonitorAllocation[] };
    const allocs = payload.allocations ?? [];
    this.allocationsByRuntime.set(command.runtimeId, allocs);

    const intent: PlacementIntent = {
      directorId: "monitor",
      at: Date.now(),
      command: command.action,
      meta: {
        runtimeId: command.runtimeId,
        correlationId: command.correlationId,
        allocations: allocs,
      },
    };

    this.lastIntents.set(command.runtimeId, intent);
    emitPlacementIntent(intent);
  }

  public async cancel(runtimeId: string, _reason: string): Promise<void> {
    this.activeCommands.delete(runtimeId);
    this.allocationsByRuntime.delete(runtimeId);
  }

  public getAllocations(runtimeId: string = "default"): readonly MonitorAllocation[] {
    return this.allocationsByRuntime.get(runtimeId) ?? [];
  }

  public getSnapshot(runtimeId: string = "default"): DirectorSnapshot {
    const last = this.lastIntents.get(runtimeId) ?? null;
    const allocs = this.allocationsByRuntime.get(runtimeId) ?? [];
    return {
      directorId: "monitor",
      status: allocs.length ? "ACTIVE" : "IDLE",
      lastIntent: last,
      activeCommandsCount: this.activeCommands.size,
      notes: "Intent-driven dual-monitor surface allocation.",
    };
  }

  public async reset(runtimeId: string = "default"): Promise<void> {
    this.activeCommands.delete(runtimeId);
    this.lastIntents.delete(runtimeId);
    this.allocationsByRuntime.delete(runtimeId);
  }

  private onPackage(snap: ActiveShowPackageSnapshot) {
    const pack = getShowPack(snap.packId);
    const phase = snap.phaseId && pack ? pack.phases[snap.phaseId] : null;
    const next: MonitorAllocation[] = [];
    if (phase) {
      for (const surface of phase.surfaces) {
        const zone = getMonitorAnchorZone(surface.anchorId);
        if (!zone) continue;
        next.push({
          surfaceId: surface.surfaceId,
          anchorId: surface.anchorId,
          intent: surface.anchorId === "LEFT_PANEL" ? "SCORES" : "PROGRAM",
          stackHint: surface.anchorId === "LEFT_PANEL" ? "SECONDARY" : "PRIMARY",
        });
      }
    }
    this.allocationsByRuntime.set("default", next);
    const intent: PlacementIntent = {
      directorId: "monitor",
      at: Date.now(),
      command: "ALLOCATE_SURFACES",
      meta: { allocations: next, packId: snap.packId, phaseId: snap.phaseId },
    };
    this.lastIntents.set("default", intent);
    emitPlacementIntent(intent);
  }
}

export const MonitorDirector = new MonitorDirectorEngine();
export default MonitorDirector;
