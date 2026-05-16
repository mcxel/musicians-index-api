type TrustedDevice = {
  deviceId: string;
  label?: string;
  trustedAt: number;
  lastSeenAt: number;
  ip?: string;
  userAgent?: string;
};

const trustedDeviceStore = new Map<string, TrustedDevice[]>();

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function trustDevice(params: {
  email: string;
  deviceId: string;
  label?: string;
  ip?: string;
  userAgent?: string;
}): TrustedDevice {
  const email = normalizeEmail(params.email);
  const devices = trustedDeviceStore.get(email) ?? [];
  const now = Date.now();

  const existingIdx = devices.findIndex((d) => d.deviceId === params.deviceId);
  const record: TrustedDevice = {
    deviceId: params.deviceId,
    label: params.label,
    trustedAt: existingIdx >= 0 ? devices[existingIdx].trustedAt : now,
    lastSeenAt: now,
    ip: params.ip,
    userAgent: params.userAgent,
  };

  if (existingIdx >= 0) devices[existingIdx] = record;
  else devices.unshift(record);

  trustedDeviceStore.set(email, devices.slice(0, 20));
  return record;
}

export function isDeviceTrusted(emailRaw: string, deviceId: string): boolean {
  const email = normalizeEmail(emailRaw);
  const devices = trustedDeviceStore.get(email) ?? [];
  return devices.some((d) => d.deviceId === deviceId);
}

export function getTrustedDevices(emailRaw: string): TrustedDevice[] {
  return [...(trustedDeviceStore.get(normalizeEmail(emailRaw)) ?? [])];
}

export function revokeTrustedDevice(emailRaw: string, deviceId: string): boolean {
  const email = normalizeEmail(emailRaw);
  const devices = trustedDeviceStore.get(email) ?? [];
  const next = devices.filter((d) => d.deviceId !== deviceId);
  trustedDeviceStore.set(email, next);
  return next.length !== devices.length;
}
