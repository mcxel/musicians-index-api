type PasswordResetMailPayload = {
  toEmail: string;
  resetLink: string;
  expiresAt: number;
  ip?: string;
  supportUrl?: string;
};

type PasswordResetMailRecord = {
  toEmail: string;
  subject: string;
  body: string;
  sentAt: number;
  status: "queued" | "sent";
};

const mailOutbox: PasswordResetMailRecord[] = [];

function buildExpiryText(expiresAt: number): string {
  const minutes = Math.max(1, Math.round((expiresAt - Date.now()) / 60000));
  return `${minutes} minute${minutes === 1 ? "" : "s"}`;
}

export function buildPasswordResetMail(payload: PasswordResetMailPayload): { subject: string; body: string } {
  const supportUrl = payload.supportUrl ?? "/support/account-recovery";
  const subject = "Reset Your Password";
  const body = [
    "You requested a password reset for your TMI account.",
    "",
    `Reset link: ${payload.resetLink}`,
    `This link expires in ${buildExpiryText(payload.expiresAt)}.`,
    "",
    "If you did not request this reset, ignore this email and secure your account.",
    payload.ip ? `Request source IP: ${payload.ip}` : "",
    `Support: ${supportUrl}`,
  ]
    .filter(Boolean)
    .join("\n");

  return { subject, body };
}

export async function sendPasswordResetMail(payload: PasswordResetMailPayload): Promise<{ accepted: boolean }> {
  const { subject, body } = buildPasswordResetMail(payload);

  // Placeholder delivery implementation (queued/sent simulation).
  const queued: PasswordResetMailRecord = {
    toEmail: payload.toEmail.trim().toLowerCase(),
    subject,
    body,
    sentAt: Date.now(),
    status: "queued",
  };
  mailOutbox.unshift(queued);

  queued.status = "sent";
  return { accepted: true };
}

export function getPasswordResetMailOutbox(limit = 50): PasswordResetMailRecord[] {
  return mailOutbox.slice(0, limit);
}
