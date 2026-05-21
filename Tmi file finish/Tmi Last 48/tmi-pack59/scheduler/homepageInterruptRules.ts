// apps/web/src/engines/homepage/homepageInterruptRules.ts
// Rules for when urgent events can pre-empt the normal loop.

import type { SceneId } from "./homepageScene.types";

export interface InterruptCondition {
  trigger: string;
  targetScene: SceneId;
  priority: number;
  description: string;
  requiresConfirmation: boolean;  // admin must confirm before interrupting
  maxDurationMs: number;
}

export const INTERRUPT_CONDITIONS: InterruptCondition[] = [
  {
    trigger: "live_stream_started",
    targetScene: "live_event_urgent",
    priority: 100,
    description: "Artist went LIVE — immediately show LIVE NOW",
    requiresConfirmation: false,
    maxDurationMs: 120000,
  },
  {
    trigger: "cypher_battle_started",
    targetScene: "cypher_arena",
    priority: 60,
    description: "Cypher battle is active — show battle CTA",
    requiresConfirmation: false,
    maxDurationMs: 65000,
  },
  {
    trigger: "crown_winner_declared",
    targetScene: "winner_reveal",
    priority: 80,
    description: "Weekly crown winner just declared",
    requiresConfirmation: false,
    maxDurationMs: 70000,
  },
  {
    trigger: "breaking_music_news",
    targetScene: "magazine_insert",
    priority: 50,
    description: "Breaking editorial story — surface magazine card",
    requiresConfirmation: true,
    maxDurationMs: 60000,
  },
  {
    trigger: "sponsor_takeover_paid",
    targetScene: "sponsor_cta",
    priority: 45,
    description: "Paid sponsor takeover — show sponsor card",
    requiresConfirmation: true,
    maxDurationMs: 40000,
  },
];

// ── CHECK INTERRUPT CONDITIONS ─────────────────────────────────
export interface PlatformSignals {
  liveStreamActive: boolean;
  cypherBattleActive: boolean;
  crownWinnerPending: boolean;
  breakingNewsFlagged: boolean;
  sponsorTakeoverActive: boolean;
}

export function checkInterruptConditions(signals: PlatformSignals): InterruptCondition | null {
  if (signals.liveStreamActive) return INTERRUPT_CONDITIONS[0];
  if (signals.cypherBattleActive) return INTERRUPT_CONDITIONS[1];
  if (signals.crownWinnerPending) return INTERRUPT_CONDITIONS[2];
  if (signals.sponsorTakeoverActive) return INTERRUPT_CONDITIONS[4];
  if (signals.breakingNewsFlagged) return INTERRUPT_CONDITIONS[3];
  return null;
}
