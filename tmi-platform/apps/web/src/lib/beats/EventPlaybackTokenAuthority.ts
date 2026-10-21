/**
 * EventPlaybackTokenAuthority.ts
 *
 * TMI Authorized Event Playback & Master Isolation Authority (Step 2B.1)
 *
 * ABSOLUTE SECURITY INVARIANTS:
 * 1. EVENT PLAYBACK RIGHT != MASTER DOWNLOAD RIGHT.
 * 2. Raw master audio (`audioAssetUrl`), storage keys, and filesystem paths are NEVER exposed.
 * 3. Event playback tokens are short-lived, session-bound, room-bound, and beat-bound.
 * 4. Tokens cannot be replayed across rooms, across beats, or used as download tokens.
 * 5. Download entitlements cannot be forged from event playback tokens.
 */

import { createHmac, timingSafeEqual } from "crypto";

export const EVENT_PLAYBACK_SCOPE = "TMI_EVENT_PLAYBACK_V1";
export const DEFAULT_EVENT_PLAYBACK_TTL_SECONDS = 15 * 60; // 15-minute expiring window

export interface EventPlaybackTokenPayload {
  scope: typeof EVENT_PLAYBACK_SCOPE;
  roomId: string;
  beatId: string;
  userId: string;
  issuedAt: number;
  expiresAt: number;
  nonce: string;
}

export interface VerifyEventPlaybackTokenInput {
  token: string;
  expectedRoomId: string;
  expectedBeatId: string;
  expectedUserId?: string;
  nowMs?: number;
}

export interface TokenVerificationResult {
  valid: boolean;
  payload?: EventPlaybackTokenPayload;
  error?:
    | "MISSING_TOKEN"
    | "INVALID_FORMAT"
    | "INVALID_SIGNATURE"
    | "WRONG_SCOPE"
    | "TOKEN_EXPIRED"
    | "ROOM_MISMATCH"
    | "BEAT_MISMATCH"
    | "USER_MISMATCH";
}

function getSecret(): string {
  return (
    process.env.SESSION_IDENTITY_SECRET ||
    process.env.NEXTAUTH_SECRET ||
    "tmi-event-playback-token-secret-dev"
  );
}

function signPayload(encodedPayload: string): string {
  return createHmac("sha256", getSecret()).update(encodedPayload).digest("base64url");
}

/**
 * Issues an HMAC-signed, scoped, expiring event playback token.
 */
export function issueEventPlaybackToken(input: {
  roomId: string;
  beatId: string;
  userId: string;
  ttlSeconds?: number;
}): { token: string; expiresAt: number } {
  const { roomId, beatId, userId, ttlSeconds = DEFAULT_EVENT_PLAYBACK_TTL_SECONDS } = input;
  const now = Date.now();
  const expiresAt = now + ttlSeconds * 1000;
  const nonce = Math.random().toString(36).slice(2, 10);

  const payload: EventPlaybackTokenPayload = {
    scope: EVENT_PLAYBACK_SCOPE,
    roomId: roomId.trim(),
    beatId: beatId.trim(),
    userId: userId.trim(),
    issuedAt: now,
    expiresAt,
    nonce,
  };

  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = signPayload(encodedPayload);
  const token = `${encodedPayload}.${signature}`;

  return { token, expiresAt };
}

/**
 * Cryptographically verifies an event playback token against the calling context.
 */
export function verifyEventPlaybackToken(
  input: VerifyEventPlaybackTokenInput
): TokenVerificationResult {
  const { token, expectedRoomId, expectedBeatId, expectedUserId, nowMs = Date.now() } = input;

  if (!token || typeof token !== "string") {
    return { valid: false, error: "MISSING_TOKEN" };
  }

  const parts = token.split(".");
  if (parts.length !== 2 || !parts[0] || !parts[1]) {
    return { valid: false, error: "INVALID_FORMAT" };
  }

  const [encodedPayload, receivedSignature] = parts;
  const expectedSignature = signPayload(encodedPayload);

  // Constant-time signature comparison to prevent timing attacks
  const a = Buffer.from(receivedSignature);
  const b = Buffer.from(expectedSignature);
  if (a.length !== b.length || a.length === 0 || !timingSafeEqual(a, b)) {
    return { valid: false, error: "INVALID_SIGNATURE" };
  }

  let payload: EventPlaybackTokenPayload;
  try {
    payload = JSON.parse(Buffer.from(encodedPayload, "base64url").toString("utf8"));
  } catch {
    return { valid: false, error: "INVALID_FORMAT" };
  }

  if (payload.scope !== EVENT_PLAYBACK_SCOPE) {
    return { valid: false, error: "WRONG_SCOPE" };
  }

  if (nowMs > payload.expiresAt) {
    return { valid: false, error: "TOKEN_EXPIRED" };
  }

  if (payload.roomId !== expectedRoomId.trim()) {
    return { valid: false, error: "ROOM_MISMATCH" };
  }

  if (payload.beatId !== expectedBeatId.trim()) {
    return { valid: false, error: "BEAT_MISMATCH" };
  }

  if (expectedUserId && payload.userId !== expectedUserId.trim()) {
    return { valid: false, error: "USER_MISMATCH" };
  }

  return { valid: true, payload };
}

/**
 * Builds the authorized streaming URL for a beat in an active room.
 * This URL replaces raw audioAssetUrl so the master is NEVER exposed to room participants.
 */
export function buildAuthorizedPlaybackUrl(input: {
  beatId: string;
  roomId: string;
  userId: string;
  ttlSeconds?: number;
}): string {
  const { token } = issueEventPlaybackToken(input);
  return `/api/beats/${encodeURIComponent(input.beatId)}/event-stream?roomId=${encodeURIComponent(
    input.roomId
  )}&token=${encodeURIComponent(token)}`;
}
