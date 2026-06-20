/**
 * Avatar Runtime Contract (2026-06-20) — the abstraction Marcel asked for so
 * today's 2D animated hosts can be swapped for a future 3D/mesh/point-cloud
 * renderer without rewriting any venue/audience/battle code that displays an
 * avatar.
 *
 * Adaptation note: the original spec described an imperative class API
 * (render(), triggerEmotion(), setSeatState(), ...). This is a React/Next.js
 * codebase with no persistent render-loop object to call methods on — React
 * re-renders declaratively from props. The React-idiomatic equivalent of
 * "call triggerEmotion(x)" is "pass emotion: x in AvatarState and let the
 * component re-render." Every imperative method in the original spec maps to
 * a field here:
 *   triggerEmotion(e)      -> state.emotion
 *   triggerGesture(g)      -> state.gesture
 *   setSeatState(id)       -> state.seatId
 *   setStageState(id)      -> state.stageId
 *   setSpeakingState(b)    -> state.isSpeaking (+ state.activeLine for lip sync)
 *   applySponsorAsset(id)  -> state.sponsorAssetId
 * The contract is preserved (one shared shape, swappable implementations);
 * only the calling convention changed to fit the framework already in use.
 */

import type { ComponentType } from "react";

export type AvatarEmotion =
  | "neutral"
  | "smirk"
  | "laugh"
  | "shock"
  | "serious"
  | "celebrate"
  | "disappointed";

export type AvatarGesture =
  | "wave"
  | "clap"
  | "cheer"
  | "point"
  | "bow"
  | "nod"
  | "dance"
  | "sit"
  | "stand";

/** Self-identifies which implementation is rendering — callers can branch on this without caring how the avatar is actually drawn. */
export type AvatarRendererType =
  | "2D_ANIMATED"
  | "3D_MESH"
  | "POINT_CLOUD"
  | "AI_GENERATED";

export interface AvatarState {
  hostId: string;
  displayName: string;
  /** Real static portrait, or whatever the active renderer needs as its source asset. Never a placeholder presented as real. */
  avatarSrc?: string;
  emotion?: AvatarEmotion;
  gesture?: AvatarGesture;
  isSpeaking?: boolean;
  /** Text currently being spoken — drives lip-sync where the renderer supports it. */
  activeLine?: string;
  seatId?: string | null;
  stageId?: string | null;
  sponsorAssetId?: string | null;
}

export interface IAvatarRenderer {
  type: AvatarRendererType;
  /** The actual component used to draw an avatar from AvatarState. */
  Component: ComponentType<{ state: AvatarState }>;
}
