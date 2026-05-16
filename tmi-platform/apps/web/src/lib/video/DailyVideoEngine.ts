/**
 * DailyVideoEngine
 * Thin wrapper around the Daily.co REST API for server-side room management.
 * Client-side video is handled by @daily-co/daily-react components.
 */

export interface DailyRoom {
  id: string;
  name: string;
  url: string;
  created_at: number;
  config: {
    exp?: number;
    max_participants?: number;
    enable_chat?: boolean;
  };
}

export interface DailyMeetingToken {
  token: string;
}

const DAILY_API_BASE = 'https://api.daily.co/v1';

function getApiKey(): string {
  const key = process.env.DAILY_API_KEY;
  if (!key) throw new Error('DAILY_API_KEY environment variable not set');
  return key;
}

export async function createDailyRoom(options?: {
  name?: string;
  expiresInMinutes?: number;
  maxParticipants?: number;
}): Promise<DailyRoom> {
  const apiKey = getApiKey();
  const expiry = options?.expiresInMinutes ?? 120;

  const res = await fetch(`${DAILY_API_BASE}/rooms`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: options?.name,
      properties: {
        exp: Math.floor(Date.now() / 1000) + expiry * 60,
        max_participants: options?.maxParticipants ?? 50,
        enable_chat: true,
        enable_knocking: true,
        start_video_off: false,
        start_audio_off: false,
      },
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Daily.co room creation failed: ${err}`);
  }

  return res.json();
}

export async function createMeetingToken(roomName: string, options?: {
  userName?: string;
  isOwner?: boolean;
  expiresInMinutes?: number;
}): Promise<DailyMeetingToken> {
  const apiKey = getApiKey();
  const expiry = options?.expiresInMinutes ?? 120;

  const res = await fetch(`${DAILY_API_BASE}/meeting-tokens`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      properties: {
        room_name: roomName,
        user_name: options?.userName,
        is_owner: options?.isOwner ?? false,
        exp: Math.floor(Date.now() / 1000) + expiry * 60,
      },
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Daily.co token creation failed: ${err}`);
  }

  return res.json();
}

export async function getDailyRoom(roomName: string): Promise<DailyRoom | null> {
  const apiKey = getApiKey();

  const res = await fetch(`${DAILY_API_BASE}/rooms/${roomName}`, {
    headers: { Authorization: `Bearer ${apiKey}` },
  });

  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Daily.co room fetch failed: ${await res.text()}`);

  return res.json();
}

export async function deleteDailyRoom(roomName: string): Promise<void> {
  const apiKey = getApiKey();

  await fetch(`${DAILY_API_BASE}/rooms/${roomName}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${apiKey}` },
  });
}
