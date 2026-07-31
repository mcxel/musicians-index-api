/**
 * Presentation Phase 5.1 — Director Scaffolding & Registration.
 * Subscribes all 12 directors and registers them in DirectorRegistry.
 */

import DirectorRegistry from "../DirectorRegistry";
import CameraDirector from "./CameraDirector";
import OverlayDirector from "./OverlayDirector";
import UnderlayDirector from "./UnderlayDirector";
import MotionDirector from "./MotionDirector";
import LightingDirector from "./LightingDirector";
import FXDirector from "./FXDirector";
import SoundDirector from "./SoundDirector";
import CrowdDirector from "./CrowdDirector";
import BroadcastDirector from "./BroadcastDirector";
import MonitorDirector from "./MonitorDirector";
import AccessibilityDirector from "./AccessibilityDirector";
import PresentationTelemetryDirector from "./PresentationTelemetryDirector";

let started = false;

export function ensurePresentationDirectorsStarted(): void {
  if (started) return;

  // Register in DirectorRegistry
  DirectorRegistry.register(CameraDirector);
  DirectorRegistry.register(OverlayDirector);
  DirectorRegistry.register(UnderlayDirector);
  DirectorRegistry.register(MotionDirector);
  DirectorRegistry.register(LightingDirector);
  DirectorRegistry.register(FXDirector);
  DirectorRegistry.register(SoundDirector);
  DirectorRegistry.register(CrowdDirector);
  DirectorRegistry.register(BroadcastDirector);
  DirectorRegistry.register(MonitorDirector);
  DirectorRegistry.register(AccessibilityDirector);
  DirectorRegistry.register(PresentationTelemetryDirector);

  // Start active listeners
  CameraDirector.start();
  OverlayDirector.start();
  PresentationTelemetryDirector.start();
  MonitorDirector.start();

  started = true;
}

export function stopPresentationDirectors(): void {
  CameraDirector.stop();
  OverlayDirector.stop();
  PresentationTelemetryDirector.stop();
  MonitorDirector.stop();
  started = false;
}

export {
  CameraDirector,
  OverlayDirector,
  UnderlayDirector,
  MotionDirector,
  LightingDirector,
  FXDirector,
  SoundDirector,
  CrowdDirector,
  BroadcastDirector,
  MonitorDirector,
  AccessibilityDirector,
  PresentationTelemetryDirector,
};

export * from "./types";
export type { PresentationDirectorTelemetry } from "./PresentationTelemetryDirector";
