/**
 * EmailDeliveryEngine
 * Top-level coordinator for all transactional email delivery.
 * Wraps EmailQueueEngine + EmailProviderEngine. Single entry point for auth emails.
 */

import { EmailQueueEngine } from "@/lib/email/EmailQueueEngine";
import { EmailProviderEngine } from "@/lib/email/EmailProviderEngine";
import EmailAuditEngine from "@/lib/email/EmailAuditEngine";

export type AuthEmailType =
  | "signup_verification"
  | "password_reset"
  | "password_changed"
  | "session_revoked"
  | "resend_verification"
  | "recovery_success"
  | "suspicious_login"
  | "account_locked";

export interface AuthEmailRequest {
  to: string;
  userId: string;
  type: AuthEmailType;
  variables: Record<string, string | number | boolean>;
}

export interface AuthEmailResult {
  queued: boolean;
  jobId: string | null;
  type: AuthEmailType;
  to: string;
  timestamp: number;
}

const AUTH_EMAIL_TEMPLATES: Record<AuthEmailType, { templateKey: string; subject: string }> = {
  signup_verification:  { templateKey: "auth.verify_email",       subject: "Verify your TMI account" },
  password_reset:       { templateKey: "auth.password_reset",      subject: "Reset your TMI password" },
  password_changed:     { templateKey: "auth.password_changed",    subject: "Your TMI password was changed" },
  session_revoked:      { templateKey: "auth.session_revoked",     subject: "All sessions signed out — TMI" },
  resend_verification:  { templateKey: "auth.verify_email",        subject: "Re-verify your TMI account" },
  recovery_success:     { templateKey: "auth.recovery_success",    subject: "Account recovery complete — TMI" },
  suspicious_login:     { templateKey: "security.suspicious_login",subject: "Unusual login detected — TMI" },
  account_locked:       { templateKey: "security.account_locked",  subject: "TMI account temporarily locked" },
};

export function sendAuthEmail(req: AuthEmailRequest): AuthEmailResult {
  const config = AUTH_EMAIL_TEMPLATES[req.type];
  const timestamp = Date.now();

  let jobId: string | null = null;
  let queued = false;

  try {
    const job = EmailQueueEngine.enqueue({
      to: req.to,
      userId: req.userId,
      channel: "security",
      templateKey: config.templateKey,
      variables: { ...req.variables, emailType: req.type },
      required: true,
    });
    jobId = job.id;
    queued = true;

    EmailAuditEngine.log({
      to: req.to,
      subject: AUTH_EMAIL_TEMPLATES[req.type].subject,
      templateKey: AUTH_EMAIL_TEMPLATES[req.type].templateKey,
      channel: "security",
      state: "queued",
      provider: "resend",
      attempt: 1,
      required: true,
      metadata: { type: req.type, jobId: job.id, userId: req.userId },
    });
  } catch {
    // Queue failed — attempt direct provider send as fallback
    const result = EmailProviderEngine.send({
      to: req.to,
      subject: config.subject,
      html: `<p>TMI: ${req.type} — ${JSON.stringify(req.variables)}</p>`,
      text: `TMI: ${req.type}`,
    });
    queued = result.success;
    jobId = result.success ? result.externalId : null;
  }

  return { queued, jobId, type: req.type, to: req.to, timestamp };
}

export function sendSignupVerification(to: string, userId: string, verifyUrl: string): AuthEmailResult {
  return sendAuthEmail({ to, userId, type: "signup_verification", variables: { verifyUrl } });
}

export function sendPasswordReset(to: string, userId: string, resetUrl: string, expiresInMinutes: number): AuthEmailResult {
  return sendAuthEmail({ to, userId, type: "password_reset", variables: { resetUrl, expiresInMinutes } });
}

export function sendPasswordChanged(to: string, userId: string): AuthEmailResult {
  return sendAuthEmail({ to, userId, type: "password_changed", variables: { changedAt: new Date().toISOString() } });
}

export function sendSessionRevoked(to: string, userId: string, reason: string): AuthEmailResult {
  return sendAuthEmail({ to, userId, type: "session_revoked", variables: { reason } });
}
