/**
 * Live Write uses StageDirectorEngine banners.
 * Private teleprompter has no performer-only surface, so it stays blocked.
 * Drafts are memory-only. POST publishes. LIVE TYPE publishes the same way
 * after a debounce, and only while it is on for that room, session, and author.
 */

import {
  clearBannerText,
  getStageState,
  presentPublicLiveText,
  type LiveBannerMode,
} from "@/lib/live/StageDirectorEngine";

export const PRIVATE_TELEPROMPTER_STATUS = "BLOCKED_PRIVATE_PRESENTATION_AUTHORITY" as const;

export const LIVE_TYPE_DEBOUNCE_MS = 300;

export const LIVE_WRITE_DURATIONS = [5000, 10000, 15000, 30000] as const;

export interface LiveWriteDraft {
  performerId: string;
  roomId: string;
  sessionId: string;
  text: string;
}

export interface PublicLiveWrite {
  performerId: string;
  roomId: string;
  sessionId: string;
  text: string;
  mode: LiveBannerMode;
  stayUp: boolean;
  durationMs: number | null;
}

const drafts = new Map<string, LiveWriteDraft>();
const publicByScope = new Map<string, PublicLiveWrite>();
const liveTypeEnabled = new Set<string>();
const liveTypeTimers = new Map<string, ReturnType<typeof setTimeout>>();

function scopeKey(roomId: string, sessionId: string): string {
  return `${roomId}::${sessionId}`;
}

function authorKey(input: { roomId: string; sessionId: string; performerId: string }): string {
  return `${scopeKey(input.roomId, input.sessionId)}::${input.performerId}`;
}

export function getPrivateDraft(performerId: string): LiveWriteDraft | null {
  return drafts.get(performerId) ?? null;
}

export function setPrivateDraft(draft: LiveWriteDraft): LiveWriteDraft {
  const next = { ...draft, text: draft.text };
  drafts.set(draft.performerId, next);
  return next;
}

export function clearPrivateDraft(performerId: string): void {
  drafts.delete(performerId);
}

export function getPublicLiveWrite(): PublicLiveWrite | null {
  const hold = getStageState().bannerHold;
  if (!hold) return null;
  return publicByScope.get(scopeKey(hold.roomId, hold.sessionId)) ?? null;
}

export function getPublicLiveWriteFor(roomId: string, sessionId: string): PublicLiveWrite | null {
  return publicByScope.get(scopeKey(roomId, sessionId)) ?? null;
}

export function setLiveTypeEnabled(
  scope: { performerId: string; roomId: string; sessionId: string },
  enabled: boolean,
): void {
  const key = authorKey(scope);
  const pending = liveTypeTimers.get(key);
  if (pending) clearTimeout(pending);
  liveTypeTimers.delete(key);
  if (enabled) liveTypeEnabled.add(key);
  else liveTypeEnabled.delete(key);
}

export function isLiveTypeEnabled(scope: {
  performerId: string;
  roomId: string;
  sessionId: string;
}): boolean {
  return liveTypeEnabled.has(authorKey(scope));
}

function publishScoped(posted: PublicLiveWrite): void {
  publicByScope.set(scopeKey(posted.roomId, posted.sessionId), posted);
  presentPublicLiveText(posted.text, {
    mode: posted.mode,
    stayUp: posted.stayUp,
    durationMs: posted.durationMs,
    ownerId: posted.performerId,
    roomId: posted.roomId,
    sessionId: posted.sessionId,
  });
}

export function postPublicLiveWrite(input: {
  performerId: string;
  roomId: string;
  sessionId: string;
  text: string;
  mode: LiveBannerMode;
  stayUp: boolean;
  durationMs?: number | null;
}): PublicLiveWrite | null {
  const text = input.text.trim();
  if (!text) return null;
  const posted: PublicLiveWrite = {
    performerId: input.performerId,
    roomId: input.roomId,
    sessionId: input.sessionId,
    text,
    mode: input.mode,
    stayUp: input.stayUp,
    durationMs: input.stayUp ? null : input.durationMs ?? 10000,
  };
  publishScoped(posted);
  return posted;
}

export function noteLiveTypeDraft(
  draft: LiveWriteDraft,
  presentation: { mode: LiveBannerMode; stayUp: boolean; durationMs?: number | null },
  debounceMs: number = LIVE_TYPE_DEBOUNCE_MS,
): { published: boolean } {
  setPrivateDraft(draft);
  const key = authorKey(draft);
  const pending = liveTypeTimers.get(key);
  if (pending) clearTimeout(pending);
  liveTypeTimers.delete(key);
  if (!liveTypeEnabled.has(key)) return { published: false };
  const publish = () => {
    if (!liveTypeEnabled.has(key)) return;
    const current = drafts.get(draft.performerId);
    if (!current || authorKey(current) !== key) return;
    const text = current.text.trim();
    if (!text) return;
    publishScoped({
      performerId: current.performerId,
      roomId: current.roomId,
      sessionId: current.sessionId,
      text,
      mode: presentation.mode,
      stayUp: presentation.stayUp,
      durationMs: presentation.stayUp ? null : presentation.durationMs ?? 10000,
    });
  };
  if (debounceMs <= 0) {
    publish();
    return { published: true };
  }
  liveTypeTimers.set(key, setTimeout(publish, debounceMs));
  return { published: false };
}

export function removePublicLiveWrite(
  performerId: string,
  scope?: { roomId: string; sessionId: string },
): boolean {
  let removed = false;
  for (const [key, row] of publicByScope) {
    if (row.performerId !== performerId) continue;
    if (scope && key !== scopeKey(scope.roomId, scope.sessionId)) continue;
    publicByScope.delete(key);
    removed = true;
  }
  const hold = getStageState().bannerHold;
  if (removed && hold?.ownerId === performerId) clearBannerText();
  return removed;
}

export function releasePerformerLiveWrite(performerId: string): void {
  drafts.delete(performerId);
  for (const key of [...liveTypeEnabled]) {
    if (key.endsWith(`::${performerId}`)) {
      liveTypeEnabled.delete(key);
      const pending = liveTypeTimers.get(key);
      if (pending) clearTimeout(pending);
      liveTypeTimers.delete(key);
    }
  }
  removePublicLiveWrite(performerId);
}

export function publicBannerIsLive(): boolean {
  return Boolean(getStageState().bannerText);
}
