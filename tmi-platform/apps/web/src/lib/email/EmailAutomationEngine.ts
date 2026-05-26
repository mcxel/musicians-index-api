import { sendEmail, type EmailType } from '@/lib/email/TMIEmailSystem';

export type EmailTemplate =
  | 'diamond-invite'
  | 'welcome-artist'
  | 'welcome-fan'
  | 'welcome-venue'
  | 'battle-invite'
  | 'ticket-purchase'
  | 'ticket'
  | 'subscription'
  | 'payout'
  | 'invite'
  | 'welcome'
  | 'battle-result'
  | 'weekly-digest';

const TEMPLATE_TO_EMAIL_TYPE: Record<string, EmailType> = {
  'diamond-invite':  'welcome_diamond',
  'welcome-artist':  'welcome_artist',
  'welcome-fan':     'welcome_fan',
  'welcome-venue':   'welcome_venue',
  'welcome':         'welcome_fan',
  'battle-invite':   'battle_invite',
  'battle-result':   'contest_win',
  'ticket':          'ticket_confirmation',
  'ticket-purchase': 'ticket_confirmation',
  'subscription':    'subscription_start',
  'weekly-digest':   'weekly_digest',
  'payout':          'payout_approved',
  'invite':          'invite',
};

export interface AutomationEmailInput {
  to: string;
  subject?: string;
  template: EmailTemplate | string;
  data?: Record<string, unknown>;
}

class EmailAutomationEngineClass {
  private static _instance: EmailAutomationEngineClass | null = null;

  // Spam protection: one send per recipient+template per minute
  private recentSends = new Map<string, number>();
  private readonly RATE_LIMIT_MS = 60_000;

  // Master enable switch — set ENABLE_EMAIL_AUTOMATION=false to suppress all sends
  private readonly isEnabled = process.env.ENABLE_EMAIL_AUTOMATION !== 'false';

  static getInstance(): EmailAutomationEngineClass {
    if (!EmailAutomationEngineClass._instance) {
      EmailAutomationEngineClass._instance = new EmailAutomationEngineClass();
    }
    return EmailAutomationEngineClass._instance;
  }

  sendEmail(input: AutomationEmailInput): void {
    if (!this.isEnabled) {
      console.log(`[EMAIL_AUTOMATION] System paused. Suppressed email to: ${input.to}`);
      return;
    }

    const key = `${input.to}::${input.template}`;
    const last = this.recentSends.get(key) ?? 0;
    if (Date.now() - last < this.RATE_LIMIT_MS) {
      console.warn(`[EMAIL_AUTOMATION] Spam protection: suppressed duplicate ${input.template} to ${input.to}`);
      return;
    }
    this.recentSends.set(key, Date.now());

    const emailType = TEMPLATE_TO_EMAIL_TYPE[input.template] ?? 'invite';
    void sendEmail({ to: input.to, type: emailType, data: input.data ?? {} });
  }
}

export const emailAutomationEngine = EmailAutomationEngineClass.getInstance();
