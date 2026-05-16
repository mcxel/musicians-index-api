export type FailureSeverity = 'warning' | 'critical';

export interface EmailFailureRecord {
  id: string;
  email: string;
  templateKey: string;
  provider: 'resend' | 'sendgrid' | 'dev-stub';
  reason: string;
  attempts: number;
  severity: FailureSeverity;
  escalated: boolean;
  createdAt: number;
}

const failureLog: EmailFailureRecord[] = [];

function nextFailureId(): string {
  return `email-failure-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function normalize(email: string): string {
  return email.trim().toLowerCase();
}

export class EmailFailureEngine {
  static recordFailure(input: {
    email: string;
    templateKey: string;
    provider: 'resend' | 'sendgrid' | 'dev-stub';
    reason: string;
    attempts: number;
    severity?: FailureSeverity;
    escalated?: boolean;
  }): EmailFailureRecord {
    const record: EmailFailureRecord = {
      id: nextFailureId(),
      email: normalize(input.email),
      templateKey: input.templateKey,
      provider: input.provider,
      reason: input.reason,
      attempts: input.attempts,
      severity: input.severity ?? (input.attempts >= 3 ? 'critical' : 'warning'),
      escalated: input.escalated ?? input.attempts >= 3,
      createdAt: Date.now(),
    };

    failureLog.unshift(record);
    if (failureLog.length > 1500) failureLog.pop();
    return record;
  }

  static listFailures(): EmailFailureRecord[] {
    return [...failureLog];
  }

  static listEscalations(): EmailFailureRecord[] {
    return failureLog.filter((item) => item.escalated);
  }
}

export default EmailFailureEngine;
