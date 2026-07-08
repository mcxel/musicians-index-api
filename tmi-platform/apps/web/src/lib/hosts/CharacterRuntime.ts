/**
 * CharacterRuntime — the only import components need for AI host behavior.
 *
 * Components give a Character ID in; this runtime assembles voice + emotion +
 * avatar state + wardrobe + environment from the registries. Nothing in the
 * presentation layer imports from BOGVoiceRuntime, CharacterRegistry, or
 * HostEntityRuntime directly — they use this interface.
 *
 * Architecture:
 *   Component
 *     → CharacterRuntime.speak('big-ace', 'winner-announce', { name: 'Wavetek' })
 *     → CharacterRegistry: emotion behavior, avatar state, duration
 *     → BOGVoiceRuntime: generate line text, synthesize audio
 *     → HostEntityRuntime: setHostState → HostAvatarPortrait animation
 *     → Returns: { text, audioUrl, emotion, estimatedDurationMs }
 *
 * Future: when the 3D runtime exists, swap the implementation here only.
 * All component call sites remain identical.
 *
 * Usage:
 *   import { characterRuntime } from '@/lib/hosts/CharacterRuntime';
 *   const result = await characterRuntime.speak('big-ace', 'winner-announce', { name: 'Wavetek' });
 *   const display = characterRuntime.getDisplayProfile('big-ace');
 */

import { bogVoiceRuntime, type BOGHostID, type BOGSpeechOutput } from '@/lib/bog/BOGVoiceRuntime';
import { CHARACTER_REGISTRY, getEmotionForContext, type HostCharacter } from '@/lib/hosts/CharacterRegistry';
import { setHostState, type HostEntityState } from '@/lib/live/HostEntityRuntime';
import type { SpeechContext } from '@/lib/hosts/HostVoicePersonalityEngine';

// ── Public surface types ───────────────────────────────────────────────────────

export type { BOGHostID };

/** What a component needs to display a host portrait, name badge, glow, etc. */
export interface CharacterDisplayProfile {
  id: BOGHostID;
  displayName: string;
  title: string;
  portraitPath: string;
  accentColor: string;
  secondaryColor: string;
  sceneType: HostCharacter['environment']['sceneType'];
  catchphrases: string[];
}

export interface CharacterSpeechResult extends BOGSpeechOutput {
  /** Resolved accent color from the CharacterRegistry for this host */
  accentColor: string;
}

// ── Runtime class ──────────────────────────────────────────────────────────────

class CharacterRuntimeEngine {
  private static _instance: CharacterRuntimeEngine;

  static getInstance(): CharacterRuntimeEngine {
    if (!this._instance) this._instance = new CharacterRuntimeEngine();
    return this._instance;
  }

  /**
   * Generate speech + trigger avatar animation for a host.
   *
   * Assembles the correct emotion behavior, speaking duration, and avatar state
   * from CharacterRegistry, then delegates to BOGVoiceRuntime and HostEntityRuntime.
   *
   * @returns Speech result including text, audioUrl, emotion, duration, accent color.
   */
  async speak(
    hostId: BOGHostID,
    context: SpeechContext,
    templateVars: Record<string, string> = {},
  ): Promise<CharacterSpeechResult> {
    const character = CHARACTER_REGISTRY[hostId];
    if (!character) throw new Error(`CharacterRuntime: unknown host "${hostId}"`);

    // Delegate to BOGVoiceRuntime — it calls setHostState internally (V2 behavior)
    const result = await bogVoiceRuntime.speak(hostId, context, templateVars);

    return {
      ...result,
      accentColor: character.wardrobe.accentColor,
    };
  }

  /**
   * Directly set a host's visual state without generating speech.
   * Use for reactions, gestures, and entrances that don't need a line.
   *
   * @example
   * characterRuntime.setState('mc-michael-charlie', 'celebrating', 3000);
   */
  setState(hostId: BOGHostID, state: HostEntityState, durationMs?: number): void {
    if (typeof window === 'undefined') return;
    setHostState(hostId, state, undefined, durationMs);
  }

  /**
   * Get the display profile a component needs to render a host.
   * Components import this instead of importing CharacterRegistry directly.
   */
  getDisplayProfile(hostId: BOGHostID): CharacterDisplayProfile | null {
    const character = CHARACTER_REGISTRY[hostId];
    if (!character) return null;
    return {
      id: character.id,
      displayName: character.displayName,
      title: character.title,
      portraitPath: character.wardrobe.portraitPath,
      accentColor: character.wardrobe.accentColor,
      secondaryColor: character.wardrobe.secondaryColor,
      sceneType: character.environment.sceneType,
      catchphrases: character.catchphrases,
    };
  }

  /**
   * Get the emotion a host would show for a given context — without speaking.
   * Useful for pre-positioning the avatar before speech starts.
   */
  getEmotionFor(hostId: BOGHostID, context: SpeechContext): HostEntityState {
    const character = CHARACTER_REGISTRY[hostId];
    if (!character) return 'idle';
    return getEmotionForContext(character, context).avatarState;
  }

  /**
   * Pre-warm the most common lines for a host so the first speak() call
   * has no cold-start latency. Call during venue init.
   *
   * @example
   * await characterRuntime.prewarm('big-ace', ['show-open', 'winner-announce', 'crowd-hype']);
   */
  async prewarm(
    hostId: BOGHostID,
    contexts: SpeechContext[],
    vars?: Record<string, string>,
  ): Promise<void> {
    await bogVoiceRuntime.prewarm(hostId, contexts, vars);
  }

  /** All registered host IDs — use to populate host selection UIs. */
  getAllHostIds(): BOGHostID[] {
    return Object.keys(CHARACTER_REGISTRY) as BOGHostID[];
  }

  /** All display profiles — use to populate host roster lists/grids. */
  getAllDisplayProfiles(): CharacterDisplayProfile[] {
    return this.getAllHostIds()
      .map(id => this.getDisplayProfile(id))
      .filter((p): p is CharacterDisplayProfile => p !== null);
  }
}

export const characterRuntime = CharacterRuntimeEngine.getInstance();
