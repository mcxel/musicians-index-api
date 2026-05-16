export type ProfileDeviceRecord = {
  slug: string;
  deviceId: string;
  kind: "camera" | "microphone" | "speaker" | "display";
  label?: string;
  trusted: boolean;
  lastSeenAt: number;
};

const deviceRegistry = new Map<string, ProfileDeviceRecord[]>();

function key(slug: string): string {
  return slug.trim().toLowerCase();
}

export function registerProfileDevice(input: Omit<ProfileDeviceRecord, "lastSeenAt">): ProfileDeviceRecord {
  const slug = key(input.slug);
  const list = deviceRegistry.get(slug) ?? [];
  const next: ProfileDeviceRecord = { ...input, slug, lastSeenAt: Date.now() };
  const idx = list.findIndex((d) => d.deviceId === input.deviceId && d.kind === input.kind);
  if (idx >= 0) list[idx] = next;
  else list.unshift(next);
  deviceRegistry.set(slug, list.slice(0, 40));
  return next;
}

export function listProfileDevices(slug: string): ProfileDeviceRecord[] {
  return [...(deviceRegistry.get(key(slug)) ?? [])];
}

export function markProfileDeviceTrusted(
  slug: string,
  deviceId: string,
  kind: ProfileDeviceRecord["kind"],
  trusted: boolean
): boolean {
  const k = key(slug);
  const list = deviceRegistry.get(k) ?? [];
  const idx = list.findIndex((d) => d.deviceId === deviceId && d.kind === kind);
  if (idx < 0) return false;
  list[idx] = { ...list[idx], trusted, lastSeenAt: Date.now() };
  deviceRegistry.set(k, list);
  return true;
}
