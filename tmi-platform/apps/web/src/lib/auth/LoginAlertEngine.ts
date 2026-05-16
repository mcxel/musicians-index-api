type LoginAlertRecord = {
  email: string;
  deviceId: string;
  ip?: string;
  userAgent?: string;
  createdAt: number;
  type: "new_device" | "suspicious_activity";
};

const loginAlertLog: LoginAlertRecord[] = [];

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function recordLoginAlert(params: {
  email: string;
  deviceId: string;
  ip?: string;
  userAgent?: string;
  type?: LoginAlertRecord["type"];
}): LoginAlertRecord {
  const record: LoginAlertRecord = {
    email: normalizeEmail(params.email),
    deviceId: params.deviceId,
    ip: params.ip,
    userAgent: params.userAgent,
    createdAt: Date.now(),
    type: params.type ?? "new_device",
  };

  loginAlertLog.unshift(record);
  return record;
}

export function getLoginAlerts(email?: string, limit = 100): LoginAlertRecord[] {
  if (!email) return loginAlertLog.slice(0, limit);
  const key = normalizeEmail(email);
  return loginAlertLog.filter((r) => r.email === key).slice(0, limit);
}
