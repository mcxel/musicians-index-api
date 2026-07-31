/**
 * Presentation Phase 5.1 — director scaffolds.
 * Subscribe to ShowPackageDirector; emit placement intents / telemetry.
 * Call ensurePresentationDirectorsStarted() from preview/admin surfaces.
 */

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
  CameraDirector.start();
  OverlayDirector.start();
  UnderlayDirector.start();
  MotionDirector.start();
  LightingDirector.start();
  FXDirector.start();
  SoundDirector.start();
  CrowdDirector.start();
  BroadcastDirector.start();
  MonitorDirector.start();
  AccessibilityDirector.start();
  PresentationTelemetryDirector.start();
  started = true;
}

export function stopPresentationDirectors(): void {
  CameraDirector.stop();
  OverlayDirector.stop();
  UnderlayDirector.stop();
  MotionDirector.stop();
  LightingDirector.stop();
  FXDirector.stop();
  SoundDirector.stop();
  CrowdDirector.stop();
  BroadcastDirector.stop();
  MonitorDirector.stop();
  AccessibilityDirector.stop();
  PresentationTelemetryDirector.stop();
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
