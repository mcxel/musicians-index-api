/**
 * CeremonyDirector — Phase 2B scaffold.
 *
 * Listens for WIN_BELT / WIN_CROWN / WIN_TROPHY / LEVEL_UP / UNLOCK_ACHIEVEMENT
 * and plays distinct lightweight CSS/framer celebrations (not full cinematic packages).
 * Animation Registry tiers are stubbed for later CineCall packages.
 */

import { livingOsCommandBus, type LivingOsCommand } from "@/lib/os/livingOsCommandBus";

export type CeremonyEventKind =
  | "WIN_BELT"
  | "WIN_CROWN"
  | "WIN_TROPHY"
  | "LEVEL_UP"
  | "UNLOCK_ACHIEVEMENT";

export type CeremonyAnimationTier = "micro" | "standard" | "cinematic";

/** Stub Animation Registry — tiers reserved; cinematic packages deferred. */
export const CEREMONY_ANIMATION_REGISTRY: Record<
  CeremonyEventKind,
  { tier: CeremonyAnimationTier; accent: string; label: string; cssClass: string }
> = {
  WIN_CROWN: {
    tier: "standard",
    accent: "#FFD700",
    label: "Crown Ceremony",
    cssClass: "tmi-ceremony-crown",
  },
  WIN_BELT: {
    tier: "standard",
    accent: "#FF6B35",
    label: "Belt Ceremony",
    cssClass: "tmi-ceremony-belt",
  },
  WIN_TROPHY: {
    tier: "standard",
    accent: "#00FFFF",
    label: "Trophy Ceremony",
    cssClass: "tmi-ceremony-trophy",
  },
  LEVEL_UP: {
    tier: "micro",
    accent: "#AA2DFF",
    label: "Level Up",
    cssClass: "tmi-ceremony-levelup",
  },
  UNLOCK_ACHIEVEMENT: {
    tier: "micro",
    accent: "#00FF88",
    label: "Achievement Unlocked",
    cssClass: "tmi-ceremony-achievement",
  },
};

export interface CeremonyPulse {
  id: string;
  kind: CeremonyEventKind;
  accent: string;
  label: string;
  cssClass: string;
  tier: CeremonyAnimationTier;
  at: number;
  payload?: Record<string, unknown>;
}

type CeremonyListener = (pulse: CeremonyPulse) => void;

const _listeners = new Set<CeremonyListener>();
let _latest: CeremonyPulse | null = null;
let _wired = false;

function emitPulse(kind: CeremonyEventKind, command: LivingOsCommand): void {
  const def = CEREMONY_ANIMATION_REGISTRY[kind];
  const pulse: CeremonyPulse = {
    id: `cer_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    kind,
    accent: def.accent,
    label: def.label,
    cssClass: def.cssClass,
    tier: def.tier,
    at: Date.now(),
    payload: command.payload,
  };
  _latest = pulse;
  _listeners.forEach((l) => {
    try {
      l(pulse);
    } catch {
      /* celebration must not crash */
    }
  });
}

/** Subscribe to lightweight celebration pulses (UI overlays). */
export function onCeremonyPulse(listener: CeremonyListener): () => void {
  _listeners.add(listener);
  return () => _listeners.delete(listener);
}

export function getLatestCeremonyPulse(): CeremonyPulse | null {
  return _latest;
}

/** Idempotent bus wiring — call from Achievement Center / Command Center mount. */
export function wireCeremonyDirector(): void {
  if (_wired || typeof window === "undefined") return;
  _wired = true;

  const kinds: CeremonyEventKind[] = [
    "WIN_BELT",
    "WIN_CROWN",
    "WIN_TROPHY",
    "LEVEL_UP",
    "UNLOCK_ACHIEVEMENT",
  ];

  for (const kind of kinds) {
    livingOsCommandBus.on(kind, (cmd) => emitPulse(kind, cmd));
  }
}

/** Manual trigger for UI previews / tests — does not invent wins in registries. */
export function previewCeremony(kind: CeremonyEventKind): CeremonyPulse {
  const def = CEREMONY_ANIMATION_REGISTRY[kind];
  const pulse: CeremonyPulse = {
    id: `cer_preview_${Date.now()}`,
    kind,
    accent: def.accent,
    label: `${def.label} (preview)`,
    cssClass: def.cssClass,
    tier: def.tier,
    at: Date.now(),
    payload: { preview: true },
  };
  _latest = pulse;
  _listeners.forEach((l) => l(pulse));
  return pulse;
}
