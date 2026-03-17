export type SharePayload = {
  room: string;
  route: string;
  prop?: string | null;
  emote?: string | null;
  latestTip?: string | null;
  health?: string | null;
  ts?: number;
};

const KEY = 'bb_last_share_payload_v1';

export function createSharePayload(p: SharePayload) {
  const payload = { ...p, ts: Date.now() };
  try { sessionStorage.setItem(KEY, JSON.stringify(payload)); } catch (e) {}
  return payload;
}

export function encodePayload(payload: SharePayload) {
  try {
    const raw = JSON.stringify(payload);
    return encodeURIComponent(btoa(raw));
  } catch (e) {
    return '';
  }
}

export function decodePayload(encoded: string) {
  try {
    const raw = decodeURIComponent(encoded);
    const json = atob(raw);
    return JSON.parse(json) as SharePayload;
  } catch (e) {
    return null;
  }
}

export function lastSharePayload(): SharePayload | null {
  try {
    const raw = sessionStorage.getItem(KEY);
    if (raw) return JSON.parse(raw) as SharePayload;
  } catch (e) {}
  return null;
}
