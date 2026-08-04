/**
 * liveDevicePersistence — last-approved camera/mic deviceIds for Instant Go Live.
 * Auto-reconnect on repeat launch when devices are still available.
 */

const STORAGE_KEY = "tmi.live.devices";

export interface PersistedLiveDevices {
  cameraDeviceId?: string;
  micDeviceId?: string;
  updatedAt: number;
}

export function loadPersistedLiveDevices(): PersistedLiveDevices | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PersistedLiveDevices;
    if (!parsed || typeof parsed !== "object") return null;
    return {
      cameraDeviceId: typeof parsed.cameraDeviceId === "string" ? parsed.cameraDeviceId : undefined,
      micDeviceId: typeof parsed.micDeviceId === "string" ? parsed.micDeviceId : undefined,
      updatedAt: typeof parsed.updatedAt === "number" ? parsed.updatedAt : Date.now(),
    };
  } catch {
    return null;
  }
}

export function persistLiveDevices(devices: {
  cameraDeviceId?: string;
  micDeviceId?: string;
}): void {
  if (typeof window === "undefined") return;
  try {
    const prev = loadPersistedLiveDevices();
    const next: PersistedLiveDevices = {
      cameraDeviceId: devices.cameraDeviceId ?? prev?.cameraDeviceId,
      micDeviceId: devices.micDeviceId ?? prev?.micDeviceId,
      updatedAt: Date.now(),
    };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    /* ignore quota / private mode */
  }
}

export function clearPersistedLiveDevices(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

/** Build getUserMedia constraints preferring last-approved deviceIds. */
export function buildLiveMediaConstraints(
  persisted?: PersistedLiveDevices | null,
): MediaStreamConstraints {
  const video: boolean | MediaTrackConstraints = persisted?.cameraDeviceId
    ? { deviceId: { ideal: persisted.cameraDeviceId }, facingMode: "user" }
    : { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 720 } };
  const audio: boolean | MediaTrackConstraints = persisted?.micDeviceId
    ? { deviceId: { ideal: persisted.micDeviceId }, echoCancellation: true, noiseSuppression: true }
    : { echoCancellation: true, noiseSuppression: true };
  return { video, audio };
}

/** After stream acquire, persist actual track deviceIds when present. */
export function persistDevicesFromStream(stream: MediaStream): void {
  const videoTrack = stream.getVideoTracks()[0];
  const audioTrack = stream.getAudioTracks()[0];
  const cameraDeviceId = videoTrack?.getSettings?.().deviceId;
  const micDeviceId = audioTrack?.getSettings?.().deviceId;
  if (cameraDeviceId || micDeviceId) {
    persistLiveDevices({ cameraDeviceId, micDeviceId });
  }
}

/** True when we have at least one previously approved device id. */
export function hasPriorLiveDevices(): boolean {
  const d = loadPersistedLiveDevices();
  return Boolean(d?.cameraDeviceId || d?.micDeviceId);
}
