/**
 * BOGVoiceRuntime (BerntoutGlobal Voice Runtime) V2
 *
 * Every AI host is a complete character: voice + avatar state + emotion.
 * When speak() is called, the host's HostAvatarPortrait automatically transitions
 * to the correct animation state (talking, celebrating, gesturing, etc.) with the
 * generated line shown as a speech bubble, then auto-reverts to idle.
 *
 * Architecture:
 *   bogVoiceRuntime.speak('big-ace', 'winner-announce', { name: 'Wavetek' })
 *     → CharacterRegistry  → emotion + avatar state for this host + context
 *     → HostEntityRuntime  → setHostState('big-ace', 'celebrating', line, durationMs)
 *     → HostAvatarPortrait → framer-motion talking/celebrating animation + speech bubble
 *     → (auto-revert to idle after durationMs)
 *
 * Per Rule 18 (scope honesty): no phoneme-based lip sync or 3D mesh yet.
 * The "lip sync" here is state-driven animation — HostAvatarPortrait's existing
 * framer-motion variants respond to entity state. When the 3D runtime exists,
 * the same speak() call drives it through the same CharacterRegistry path.
 *
 * Usage:
 *   import { bogVoiceRuntime } from '@/lib/bog/BOGVoiceRuntime';
 *   const output = await bogVoiceRuntime.speak('big-ace', 'winner-announce', { name: 'Wavetek' });
 *   // Avatar immediately shows talking/celebrating animation + speech bubble
 *   // output.text, output.audioUrl, output.emotion, output.cacheStatus
 */

import {
  hostVoicePersonalityEngine,
  type SpeechContext,
  type VoicePersonality,
} from '@/lib/hosts/HostVoicePersonalityEngine';
import { setHostState } from '@/lib/live/HostEntityRuntime';
import {
  CHARACTER_REGISTRY,
  getEmotionForContext,
  type EmotionState,
} from '@/lib/hosts/CharacterRegistry';

// ── Host registry ──────────────────────────────────────────────────────────────

export type BOGHostID =
  | 'big-ace'
  | 'mc-michael-charlie'
  | 'dj-record-ralph'
  | 'bobby-stanley'
  | 'judge-jack-obrien'
  | 'judge-hector-lavinius'
  | 'monthly-idol-host-1'
  | 'monthly-idol-host-2'
  | 'monthly-idol-host-3';

export interface BOGHostProfile {
  id: BOGHostID;
  name: string;
  defaultPersonality: VoicePersonality;
  voiceModelId: string;
}

export const BOG_HOST_REGISTRY: Record<BOGHostID, BOGHostProfile> = {
  'big-ace': {
    id: 'big-ace',
    name: 'Big Ace',
    defaultPersonality: 'mentor',
    voiceModelId: 'voice_big_ace_calm_authority',
  },
  'mc-michael-charlie': {
    id: 'mc-michael-charlie',
    name: 'MC Michael Charlie',
    defaultPersonality: 'hype',
    voiceModelId: 'voice_mc_charlie_announcer',
  },
  'dj-record-ralph': {
    id: 'dj-record-ralph',
    name: 'DJ Record Ralph',
    defaultPersonality: 'smooth',
    voiceModelId: 'voice_dj_ralph_club',
  },
  'bobby-stanley': {
    id: 'bobby-stanley',
    name: 'Bobby Stanley',
    defaultPersonality: 'funny',
    voiceModelId: 'voice_bobby_stanley_gameshow',
  },
  'judge-jack-obrien': {
    id: 'judge-jack-obrien',
    name: "Jack O'Brien",
    defaultPersonality: 'serious',
    voiceModelId: 'voice_jack_obrien_judge',
  },
  'judge-hector-lavinius': {
    id: 'judge-hector-lavinius',
    name: 'Hector Lavinius',
    defaultPersonality: 'dramatic',
    voiceModelId: 'voice_hector_lavinius_judge',
  },
  'monthly-idol-host-1': {
    id: 'monthly-idol-host-1',
    name: 'Idol Host Tiana',
    defaultPersonality: 'funny',
    voiceModelId: 'voice_idol_tiana',
  },
  'monthly-idol-host-2': {
    id: 'monthly-idol-host-2',
    name: 'Idol Host Marcus',
    defaultPersonality: 'sarcastic',
    voiceModelId: 'voice_idol_marcus',
  },
  'monthly-idol-host-3': {
    id: 'monthly-idol-host-3',
    name: 'Idol Host Jules',
    defaultPersonality: 'hype',
    voiceModelId: 'voice_idol_jules',
  },
};

// ── Speech duration estimation ─────────────────────────────────────────────────
// Rough average: 130 words/min = ~462 ms/word. Minimum 1.5s.

function estimateSpeechMs(text: string): number {
  const words = text.trim().split(/\s+/).length;
  return Math.max(1500, words * 462);
}

// ── Output types ───────────────────────────────────────────────────────────────

export interface BOGSpeechOutput {
  hostId: BOGHostID;
  text: string;
  personality: VoicePersonality;
  tone: 'neutral' | 'excited' | 'deadpan' | 'warm' | 'intense';
  emotion: EmotionState;
  audioUrl: string;
  estimatedDurationMs: number;
  cacheStatus: 'HIT' | 'MISS' | 'SIMULATED';
}

// ── Runtime class ──────────────────────────────────────────────────────────────

class BOGVoiceRuntimeEngine {
  private static _instance: BOGVoiceRuntimeEngine;
  private readonly cache = new Map<string, string>();

  private constructor() {
    for (const host of Object.values(BOG_HOST_REGISTRY)) {
      hostVoicePersonalityEngine.assignPersonality(host.id, host.defaultPersonality);
    }
  }

  static getInstance(): BOGVoiceRuntimeEngine {
    if (!this._instance) this._instance = new BOGVoiceRuntimeEngine();
    return this._instance;
  }

  /**
   * Speak as a host in a given context.
   *
   * Side effect: immediately transitions the host's HostAvatarPortrait to the
   * correct animation state (talking, celebrating, gesturing, etc.) with the
   * generated line shown as a speech bubble. Auto-reverts to idle when done.
   *
   * Returns text, audio URL, emotion, and estimated duration so callers can
   * schedule follow-up actions (e.g., trigger next event after speech ends).
   */
  async speak(
    hostId: BOGHostID,
    context: SpeechContext,
    templateVars: Record<string, string> = {},
  ): Promise<BOGSpeechOutput> {
    const profile = BOG_HOST_REGISTRY[hostId];
    if (!profile) throw new Error(`BOGVoiceRuntime: unknown host "${hostId}"`);

    const line = hostVoicePersonalityEngine.generateLine(hostId, context, templateVars);
    const cacheKey = `${hostId}:${context}:${JSON.stringify(templateVars)}`;

    // Emotion + avatar state driven by CharacterRegistry per host + context
    const character = CHARACTER_REGISTRY[hostId];
    const emotionBehavior = getEmotionForContext(character, context);
    const speechMs = estimateSpeechMs(line.text);
    const totalDurationMs = speechMs + (emotionBehavior.durationBonus ?? 0);

    // Wire to HostEntityRuntime → HostAvatarPortrait sees talking animation + speech bubble.
    // Guard: HostEntityRuntime is browser-only (module-level Map + setTimeout).
    if (typeof window !== 'undefined') {
      setHostState(hostId, emotionBehavior.avatarState, line.text, totalDurationMs);
    }

    if (this.cache.has(cacheKey)) {
      return {
        hostId,
        text: line.text,
        personality: line.personality,
        tone: line.tone,
        emotion: emotionBehavior.emotion,
        audioUrl: this.cache.get(cacheKey)!,
        estimatedDurationMs: totalDurationMs,
        cacheStatus: 'HIT',
      };
    }

    const audioUrl = await this.synthesize(profile, line.text);
    this.cache.set(cacheKey, audioUrl);

    return {
      hostId,
      text: line.text,
      personality: line.personality,
      tone: line.tone,
      emotion: emotionBehavior.emotion,
      audioUrl,
      estimatedDurationMs: totalDurationMs,
      cacheStatus: 'MISS',
    };
  }

  /**
   * Voice synthesis hook.
   *
   * V1 stub — returns a deterministic path so the full pipeline runs without a
   * real API key. Replace this method body only when ElevenLabs / in-house model
   * is integrated. All callers get the real audio automatically.
   */
  private async synthesize(profile: BOGHostProfile, text: string): Promise<string> {
    const slug = text.slice(0, 32).replace(/\W+/g, '-').toLowerCase();
    return `/audio/hosts/${profile.voiceModelId}/${slug}.mp3`;
  }

  /** Override a host's personality at runtime (e.g., "serious mode" for finals) */
  setPersonality(hostId: BOGHostID, personality: VoicePersonality): void {
    const profile = BOG_HOST_REGISTRY[hostId];
    if (!profile) return;
    hostVoicePersonalityEngine.assignPersonality(hostId, personality);
    profile.defaultPersonality = personality;
  }

  /**
   * Pre-warm commonly needed lines into the cache.
   * Call during venue init to avoid cold-start latency on first speak().
   * Also pre-loads avatar portrait with the 'idle' state for each host.
   */
  async prewarm(
    hostId: BOGHostID,
    contexts: SpeechContext[],
    vars?: Record<string, string>,
  ): Promise<void> {
    await Promise.all(contexts.map((ctx) => this.speak(hostId, ctx, vars)));
  }

  /** Clear the audio cache (call after a voice model update). */
  clearCache(): void {
    this.cache.clear();
  }
}

export const bogVoiceRuntime = BOGVoiceRuntimeEngine.getInstance();
