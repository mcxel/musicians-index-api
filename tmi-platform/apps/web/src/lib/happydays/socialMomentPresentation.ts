/**
 * Presentation clock for the Community & Identity dock.
 * One panel, two faces. Drafts stay attached to the prompt that was on screen.
 * This module does not submit, moderate, or persist anything.
 */

import type { SocialMomentChannel } from "./HappyDaysContracts";
import {
  publicationDateKeyFromInstant,
  resolvePublicationPrompt,
} from "./HappyDaysPromptRegistry";

export const SOCIAL_MOMENT_DWELL_MS = 18_000;

export type SocialMomentDraft = {
  text: string;
  promptId: string;
  promptText: string;
  publicationDateKey: string;
};

export type SocialMomentPresentation = {
  channel: SocialMomentChannel;
  promptId: string;
  promptText: string;
  publicationDateKey: string;
  drafts: Record<SocialMomentChannel, SocialMomentDraft | null>;
  focused: boolean;
  reducedMotion: boolean;
  nextFlipAt: number;
  motion: "slide" | "instant";
};

function emptyDrafts(): SocialMomentPresentation["drafts"] {
  return { HAPPY_DAYS: null, COMMUNITY_GOSSIP: null };
}

function opposite(channel: SocialMomentChannel): SocialMomentChannel {
  return channel === "HAPPY_DAYS" ? "COMMUNITY_GOSSIP" : "HAPPY_DAYS";
}

function motionFor(reducedMotion: boolean): SocialMomentPresentation["motion"] {
  return reducedMotion ? "instant" : "slide";
}

export function channelDraftIsActive(draft: SocialMomentDraft | null): boolean {
  return Boolean(draft && draft.text.trim().length > 0);
}

export function rotationPinned(state: SocialMomentPresentation): boolean {
  return state.focused || channelDraftIsActive(state.drafts[state.channel]);
}

function faceFor(channel: SocialMomentChannel, publicationDateKey: string) {
  const prompt = resolvePublicationPrompt(channel, publicationDateKey);
  return {
    channel,
    promptId: prompt.id,
    promptText: prompt.promptText,
    publicationDateKey,
  };
}

export function createSocialMomentPresentation(
  now: number,
  reducedMotion = false,
): SocialMomentPresentation {
  const publicationDateKey = publicationDateKeyFromInstant(new Date(now));
  return {
    ...faceFor("HAPPY_DAYS", publicationDateKey),
    drafts: emptyDrafts(),
    focused: false,
    reducedMotion,
    nextFlipAt: now + SOCIAL_MOMENT_DWELL_MS,
    motion: motionFor(reducedMotion),
  };
}

export function setReducedMotion(
  state: SocialMomentPresentation,
  reducedMotion: boolean,
): SocialMomentPresentation {
  return { ...state, reducedMotion, motion: motionFor(reducedMotion) };
}

export function focusSocialMoment(state: SocialMomentPresentation): SocialMomentPresentation {
  return { ...state, focused: true };
}

export function blurSocialMoment(
  state: SocialMomentPresentation,
  now: number,
): SocialMomentPresentation {
  const next = { ...state, focused: false };
  if (rotationPinned(next)) return next;
  return { ...next, nextFlipAt: now + SOCIAL_MOMENT_DWELL_MS };
}

export function writeSocialMomentDraft(
  state: SocialMomentPresentation,
  text: string,
): SocialMomentPresentation {
  const draft: SocialMomentDraft | null = text.trim()
    ? {
        text,
        promptId: state.promptId,
        promptText: state.promptText,
        publicationDateKey: state.publicationDateKey,
      }
    : null;
  return {
    ...state,
    focused: true,
    drafts: { ...state.drafts, [state.channel]: draft },
  };
}

export function clearSocialMomentDraft(
  state: SocialMomentPresentation,
  now: number,
): SocialMomentPresentation {
  const drafts = { ...state.drafts, [state.channel]: null };
  const next = { ...state, drafts, focused: false };
  if (rotationPinned(next)) return next;
  return { ...next, nextFlipAt: now + SOCIAL_MOMENT_DWELL_MS };
}

export function applyPublicationDate(
  state: SocialMomentPresentation,
  publicationDateKey: string,
): SocialMomentPresentation {
  if (rotationPinned(state) || state.publicationDateKey === publicationDateKey) return state;
  return { ...state, ...faceFor(state.channel, publicationDateKey) };
}

export function advanceSocialMoment(
  state: SocialMomentPresentation,
  now: number,
): SocialMomentPresentation {
  if (rotationPinned(state) || now < state.nextFlipAt) return state;
  const channel = opposite(state.channel);
  const held = state.drafts[channel];
  const face = channelDraftIsActive(held) && held
    ? {
        channel,
        promptId: held.promptId,
        promptText: held.promptText,
        publicationDateKey: held.publicationDateKey,
      }
    : faceFor(channel, publicationDateKeyFromInstant(new Date(now)));
  return {
    ...state,
    ...face,
    nextFlipAt: now + SOCIAL_MOMENT_DWELL_MS,
    motion: motionFor(state.reducedMotion),
  };
}
