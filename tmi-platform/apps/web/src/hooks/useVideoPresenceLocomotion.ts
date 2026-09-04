"use client";

/**
 * Shared free-roam locomotion for video-panel floors (lounge + performer lobby).
 * Touch / keyboard / mouse — panel transform only; WebRTC stream never reconnects.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import {
  updatePanelTransformWithoutReconnect,
  type SpatialVideoPanel,
} from "@/lib/venue-hud/SpatialVideoPresenceDirector";

export interface FloorBounds {
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
}

export interface VideoPresenceLocomotionConfig {
  panelId: string;
  floorBounds: FloorBounds;
  collideMove: (panelId: string, proposed: [number, number, number]) => [number, number, number];
  applyProximity: (
    panelId: string,
    distanceMeters: number,
  ) => { scale: number; voiceGain: number; lod?: SpatialVideoPanel["lodQuality"]; streamReconnected: false };
  initialPosition?: [number, number, number];
  /** Called when proximity voice gain changes (spatial audio hook). */
  onVoiceGain?: (gain: number) => void;
  /** Step size for keyboard nudges (world units). */
  keyboardStep?: number;
}

function clampToBounds(
  [x, y, z]: [number, number, number],
  bounds: FloorBounds,
): [number, number, number] {
  return [
    Math.max(bounds.minX, Math.min(bounds.maxX, x)),
    y,
    Math.max(bounds.minZ, Math.min(bounds.maxZ, z)),
  ];
}

function pctToXyz(xPct: number, yPct: number, bounds: FloorBounds): [number, number, number] {
  const x = bounds.minX + (xPct / 100) * (bounds.maxX - bounds.minX);
  const z = bounds.minZ + (yPct / 100) * (bounds.maxZ - bounds.minZ);
  return [x, 1.5, z];
}

function xyzToPct([x, , z]: [number, number, number], bounds: FloorBounds): { xPct: number; yPct: number } {
  const xPct = ((x - bounds.minX) / (bounds.maxX - bounds.minX)) * 100;
  const yPct = ((z - bounds.minZ) / (bounds.maxZ - bounds.minZ)) * 100;
  return { xPct, yPct };
}

export function useVideoPresenceLocomotion({
  panelId,
  floorBounds,
  collideMove,
  applyProximity,
  initialPosition = [0, 1.5, 0],
  onVoiceGain,
  keyboardStep = 0.35,
}: VideoPresenceLocomotionConfig) {
  const [positionXyz, setPositionXyz] = useState<[number, number, number]>(initialPosition);
  const [viewerPct, setViewerPct] = useState(() => xyzToPct(initialPosition, floorBounds));
  const [voiceGain, setVoiceGain] = useState(1);
  const touchStart = useRef<{ x: number; y: number; px: number; pz: number } | null>(null);
  const keysDown = useRef<Set<string>>(new Set());
  const rafRef = useRef<number | null>(null);

  const commitMove = useCallback(
    (proposed: [number, number, number]) => {
      const clamped = clampToBounds(proposed, floorBounds);
      const resolved = collideMove(panelId, clamped);
      updatePanelTransformWithoutReconnect(panelId, { positionXyz: resolved });
      setPositionXyz(resolved);
      setViewerPct(xyzToPct(resolved, floorBounds));
      return resolved;
    },
    [collideMove, floorBounds, panelId],
  );

  const refreshProximity = useCallback(
    (viewerPos: [number, number, number], panels: SpatialVideoPanel[]) => {
      for (const panel of panels) {
        const dx = panel.positionXyz[0] - viewerPos[0];
        const dz = panel.positionXyz[2] - viewerPos[2];
        const dist = Math.sqrt(dx * dx + dz * dz);
        const prox = applyProximity(panel.panelId, dist);
        if (panel.panelId === panelId) {
          setVoiceGain(prox.voiceGain);
          onVoiceGain?.(prox.voiceGain);
        }
      }
    },
    [applyProximity, onVoiceGain, panelId],
  );

  const onFloorClick = useCallback(
    (xPct: number, yPct: number, panels: SpatialVideoPanel[]) => {
      const target = pctToXyz(xPct, yPct, floorBounds);
      const resolved = commitMove(target);
      refreshProximity(resolved, panels);
    },
    [commitMove, floorBounds, refreshProximity],
  );

  const onFloorTouchStart = useCallback(
    (clientX: number, clientY: number, rect: DOMRect) => {
      touchStart.current = {
        x: clientX,
        y: clientY,
        px: positionXyz[0],
        pz: positionXyz[2],
      };
    },
    [positionXyz],
  );

  const onFloorTouchMove = useCallback(
    (clientX: number, clientY: number, rect: DOMRect, panels: SpatialVideoPanel[]) => {
      const start = touchStart.current;
      if (!start) return;
      const dxPx = clientX - start.x;
      const dyPx = clientY - start.y;
      const worldW = floorBounds.maxX - floorBounds.minX;
      const worldD = floorBounds.maxZ - floorBounds.minZ;
      const dx = (dxPx / rect.width) * worldW;
      const dz = (dyPx / rect.height) * worldD;
      const proposed: [number, number, number] = [start.px + dx, 1.5, start.pz + dz];
      const resolved = commitMove(proposed);
      refreshProximity(resolved, panels);
    },
    [commitMove, floorBounds, refreshProximity],
  );

  const onFloorTouchEnd = useCallback(() => {
    touchStart.current = null;
  }, []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      keysDown.current.add(e.key);
    };
    const onKeyUp = (e: KeyboardEvent) => {
      keysDown.current.delete(e.key);
    };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, []);

  useEffect(() => {
    const tick = () => {
      const keys = keysDown.current;
      let dx = 0;
      let dz = 0;
      if (keys.has("ArrowLeft") || keys.has("a") || keys.has("A")) dx -= keyboardStep;
      if (keys.has("ArrowRight") || keys.has("d") || keys.has("D")) dx += keyboardStep;
      if (keys.has("ArrowUp") || keys.has("w") || keys.has("W")) dz -= keyboardStep;
      if (keys.has("ArrowDown") || keys.has("s") || keys.has("S")) dz += keyboardStep;
      if (dx !== 0 || dz !== 0) {
        commitMove([positionXyz[0] + dx, positionXyz[1], positionXyz[2] + dz]);
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [commitMove, keyboardStep, positionXyz]);

  return {
    positionXyz,
    viewerPct,
    voiceGain,
    onFloorClick,
    onFloorTouchStart,
    onFloorTouchMove,
    onFloorTouchEnd,
    refreshProximity,
    commitMove,
  };
}
