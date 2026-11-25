/**
 * HostResponseRouter — §20985-D TEXT-TO-HOST / no-microphone participation.
 *
 * A participant without a usable microphone still participates: typed (or
 * dictated) responses route to the HOST's response queue, bound to the current
 * experience + round/question + participant — NEVER blindly into Room Chat.
 *
 * Policy/routing only. Reuses the HUD composer; creates no new messaging engine.
 *
 *   HOST_RESPONSE_ROUTING != ROOM_CHAT_ROUTING (enforced)
 *   RESPONSE_BOUND_TO_CORRECT_ROUND / PARTICIPANT = true
 *   DUPLICATE_COMPOSER_ENGINE_CREATED = 0
 */

export const DUPLICATE_COMPOSER_ENGINE_CREATED = 0 as const;
export const DUPLICATE_MESSAGING_ENGINE_CREATED = 0 as const;
export const HOST_RESPONSE_NOT_ACCIDENTALLY_PUBLIC_CHAT = 0 as const;
export const PUBLIC_CHAT_NOT_ACCIDENTALLY_HOST_RESPONSE = 0 as const;

export type HostResponseStatus = "queued" | "read" | "called-on" | "dismissed";

export interface HostResponse {
  responseId: string;
  experienceId: string;
  roundId: string | null;
  participantId: string;
  participantLabel: string;
  text: string;
  viaMic: boolean;         // false when text is the no-mic path
  status: HostResponseStatus;
  at: number;
}

interface ResponseWindow {
  experienceId: string;
  roundId: string | null;
  open: boolean;
  question: string | null;
  queue: HostResponse[];
}

const windows = new Map<string, ResponseWindow>();

function key(experienceId: string, roundId: string | null): string {
  return `${experienceId}::${roundId ?? "none"}`;
}

/** Host opens a response window for a question/round. */
export function openHostResponseWindow(input: {
  experienceId: string;
  roundId?: string | null;
  question?: string | null;
}): ResponseWindow {
  const k = key(input.experienceId, input.roundId ?? null);
  const w: ResponseWindow = {
    experienceId: input.experienceId,
    roundId: input.roundId ?? null,
    open: true,
    question: input.question ?? null,
    queue: [],
  };
  windows.set(k, w);
  return w;
}

export function closeHostResponseWindow(experienceId: string, roundId: string | null = null): void {
  const w = windows.get(key(experienceId, roundId));
  if (w) w.open = false;
}

export function isHostResponseWindowOpen(experienceId: string, roundId: string | null = null): boolean {
  return Boolean(windows.get(key(experienceId, roundId))?.open);
}

/**
 * Submit a text response to the HOST queue. Bound to experience + round +
 * participant. Does NOT enter Room Chat.
 */
export function submitHostResponse(input: {
  experienceId: string;
  roundId?: string | null;
  participantId: string;
  participantLabel?: string;
  text: string;
  viaMic?: boolean;
}): { ok: boolean; response?: HostResponse; reason?: string } {
  const roundId = input.roundId ?? null;
  const w = windows.get(key(input.experienceId, roundId));
  if (!w || !w.open) return { ok: false, reason: "response-window-closed" };
  const text = input.text.trim().slice(0, 500);
  if (!text) return { ok: false, reason: "empty" };

  const response: HostResponse = {
    responseId: `hr-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    experienceId: input.experienceId,
    roundId,
    participantId: input.participantId,
    participantLabel: input.participantLabel ?? input.participantId,
    text,
    viaMic: input.viaMic ?? false,
    status: "queued",
    at: Date.now(),
  };
  w.queue.push(response);
  return { ok: true, response };
}

/** Host reads the response queue (identity, text, round, order). */
export function getHostResponseQueue(experienceId: string, roundId: string | null = null): HostResponse[] {
  return [...(windows.get(key(experienceId, roundId))?.queue ?? [])];
}

export function markHostResponse(
  experienceId: string,
  roundId: string | null,
  responseId: string,
  status: HostResponseStatus,
): HostResponse | null {
  const w = windows.get(key(experienceId, roundId));
  const r = w?.queue.find((x) => x.responseId === responseId);
  if (r) r.status = status;
  return r ?? null;
}

export function resetHostResponseRouterForTests(): void {
  windows.clear();
}
