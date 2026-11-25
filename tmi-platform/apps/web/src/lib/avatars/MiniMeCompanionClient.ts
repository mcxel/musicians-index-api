/**
 * Mini-Me Phase 3 client — thin fetch wrappers for Phase 2 APIs.
 * No parallel companion authority; all state comes from the backend service.
 */

import type { CompanionMicSurface } from "@/lib/avatars/MiniMeDedicatedMicLaw";
import type { SttAvailability } from "@/lib/venue-hud/SpeechTextAdapter";
import type { PhraseConversationalContext } from "@/lib/avatars/MiniMeLatentLanguageLaw";
import type { MiniMeSpeechSurface } from "@/lib/avatars/MiniMeSpontaneousCallbackPolicy";
import type { MiniMeResetKind } from "@/lib/avatars/MiniMeCreationContracts";
import type {
  MiniMeSkillKind,
  NonQualifyingPresence,
  QualifyingMiniMeInteraction,
} from "@/lib/avatars/MiniMeForgetfulnessAndLifelongLaw";

export type MiniMeApiErrorBody = {
  ok: false;
  error?: string;
  detail?: string;
};

async function postJson<T>(
  url: string,
  body: Record<string, unknown>,
): Promise<{ ok: true; value: T } | { ok: false; status: number; error: string; detail?: string }> {
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(body),
    });
    const data = (await res.json().catch(() => ({}))) as MiniMeApiErrorBody & {
      ok?: boolean;
      value?: T;
      companion?: T;
      forgetfulness?: unknown;
    };
    if (!res.ok || data.ok === false) {
      return {
        ok: false,
        status: res.status,
        error: data.error ?? `HTTP_${res.status}`,
        detail: data.detail,
      };
    }
    return { ok: true, value: (data.value ?? data) as T };
  } catch (err) {
    return {
      ok: false,
      status: 0,
      error: "NETWORK",
      detail: err instanceof Error ? err.message : String(err),
    };
  }
}

export async function startCompanionVoiceSession(input: {
  companionId: string;
  surface: CompanionMicSurface;
  micPermission?: "granted" | "denied" | "unavailable" | "prompt";
  sttAvailability?: SttAvailability;
  nowMs?: number;
}) {
  return postJson<{
    sessionId: string;
    session: unknown;
    fallbackMode: "NONE" | "TYPED_OR_GESTURE_ONLY";
  }>("/api/minime/voice-session", {
    action: "start_session",
    companionId: input.companionId,
    surface: input.surface,
    micPermission: input.micPermission,
    sttAvailability: input.sttAvailability,
    nowMs: input.nowMs ?? Date.now(),
  });
}

export async function activateCompanionMic(input: {
  sessionId: string;
  nowMs?: number;
}) {
  return postJson<{ sessionId: string; session: unknown }>(
    "/api/minime/voice-session",
    {
      action: "activate_mic",
      sessionId: input.sessionId,
      nowMs: input.nowMs ?? Date.now(),
    },
  );
}

export async function submitCompanionUtterance(input: {
  sessionId?: string;
  companionId: string;
  surface: CompanionMicSurface;
  transcript: string;
  variantIndex?: number;
  context?: PhraseConversationalContext;
  nowMs?: number;
}) {
  return postJson<Record<string, unknown>>("/api/minime/voice-session", {
    action: "submit_utterance",
    sessionId: input.sessionId,
    companionId: input.companionId,
    surface: input.surface,
    transcript: input.transcript,
    variantIndex: input.variantIndex,
    context: input.context ?? "GENERAL",
    nowMs: input.nowMs ?? Date.now(),
  });
}

export async function stopCompanionVoiceSession(input: {
  sessionId: string;
  mute?: boolean;
  nowMs?: number;
}) {
  return postJson<{ sessionId: string; session: unknown }>(
    "/api/minime/voice-session",
    {
      action: "stop_session",
      sessionId: input.sessionId,
      mute: Boolean(input.mute),
      nowMs: input.nowMs ?? Date.now(),
    },
  );
}

export async function fetchCompanionState(input: {
  companionId: string;
  nowMs?: number;
}): Promise<
  | { ok: true; companion: Record<string, unknown>; forgetfulness: Record<string, unknown> }
  | { ok: false; status: number; error: string; detail?: string }
> {
  try {
    const url = new URL("/api/minime/companion", window.location.origin);
    url.searchParams.set("companionId", input.companionId);
    if (input.nowMs != null) url.searchParams.set("nowMs", String(input.nowMs));
    const res = await fetch(url.toString(), { credentials: "include" });
    const data = (await res.json().catch(() => ({}))) as {
      ok?: boolean;
      error?: string;
      detail?: string;
      companion?: Record<string, unknown>;
      forgetfulness?: Record<string, unknown>;
    };
    if (!res.ok || data.ok === false || !data.companion || !data.forgetfulness) {
      return {
        ok: false,
        status: res.status,
        error: data.error ?? `HTTP_${res.status}`,
        detail: data.detail,
      };
    }
    return { ok: true, companion: data.companion, forgetfulness: data.forgetfulness };
  } catch (err) {
    return {
      ok: false,
      status: 0,
      error: "NETWORK",
      detail: err instanceof Error ? err.message : String(err),
    };
  }
}

export async function postCompanionAction(input: {
  action: string;
  companionId: string;
  [key: string]: unknown;
}) {
  return postJson<Record<string, unknown>>("/api/minime/companion", {
    ...input,
    nowMs: (input.nowMs as number | undefined) ?? Date.now(),
  });
}

export async function companionInteract(input: {
  companionId: string;
  interactionKind: QualifyingMiniMeInteraction;
  surface?: string;
}) {
  return postCompanionAction({
    action: "interact",
    companionId: input.companionId,
    interactionKind: input.interactionKind,
    surface: input.surface ?? "QUICK_PANEL",
  });
}

export async function companionIdleTick(input: {
  companionId: string;
  ownerInputActive?: boolean;
  performanceOrBroadcastActive?: boolean;
  reducedMotion?: boolean;
  autonomousEnabled?: boolean;
}) {
  return postCompanionAction({
    action: "idle_tick",
    companionId: input.companionId,
    ownerInputActive: Boolean(input.ownerInputActive),
    performanceOrBroadcastActive: Boolean(input.performanceOrBroadcastActive),
    reducedMotion: Boolean(input.reducedMotion),
    autonomousEnabled: input.autonomousEnabled !== false,
  });
}

export async function companionSpontaneousCallback(input: {
  companionId: string;
  surface: MiniMeSpeechSurface;
  idleMs?: number;
  performanceActive?: boolean;
}) {
  return postCompanionAction({
    action: "spontaneous_callback",
    companionId: input.companionId,
    surface: input.surface,
    idleMs: input.idleMs ?? 30_000,
    performanceActive: Boolean(input.performanceActive),
  });
}

export async function companionResetRebirth(input: {
  companionId: string;
  kind: MiniMeResetKind;
}) {
  return postCompanionAction({
    action: "reset_rebirth",
    companionId: input.companionId,
    kind: input.kind,
  });
}

export async function companionPracticeSkill(input: {
  companionId: string;
  skillId: string;
  kind: MiniMeSkillKind;
  label: string;
  isRelearn?: boolean;
}) {
  return postCompanionAction({
    action: "practice_skill",
    companionId: input.companionId,
    skillId: input.skillId,
    kind: input.kind,
    label: input.label,
    isRelearn: input.isRelearn,
  });
}

export async function companionPresenceEvent(input: {
  companionId: string;
  eventKind: QualifyingMiniMeInteraction | NonQualifyingPresence;
  surface?: string;
}) {
  return postCompanionAction({
    action: "presence_event",
    companionId: input.companionId,
    eventKind: input.eventKind,
    surface: input.surface ?? "QUICK_PANEL",
  });
}
