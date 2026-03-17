// tmi-platform/apps/api/src/modules/email/email.service.ts
import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';

export interface MailOptions {
  to: string;
  subject: string;
  text: string;
  html: string;
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: Transporter;
  private isEnabled: boolean;

  constructor() {
    const {
      EMAIL_SERVER_HOST,
      EMAIL_SERVER_PORT,
      EMAIL_SERVER_USER,
      EMAIL_SERVER_PASSWORD,
    } = process.env;

    if (EMAIL_SERVER_HOST && EMAIL_SERVER_PORT && EMAIL_SERVER_USER && EMAIL_SERVER_PASSWORD) {
      this.isEnabled = true;
      this.transporter = nodemailer.createTransport({
        host: EMAIL_SERVER_HOST,
        port: parseInt(EMAIL_SERVER_PORT, 10),
        secure: parseInt(EMAIL_SERVER_PORT, 10) === 465, // true for 465, false for other ports
        auth: {
          user: EMAIL_SERVER_USER,
          pass: EMAIL_SERVER_PASSWORD,
        },
      });

      this.logger.log('EmailService initialized and enabled.');
    } else {
      this.isEnabled = false;
      this.logger.warn('EmailService is disabled due to missing environment variables.');
    }
  }

  /**
   * Sends an email. If the service is disabled, it logs the email content to the console instead.
   * @param options - Mail options (to, subject, text, html)
   */
  async sendMail(options: MailOptions): Promise<void> {
    if (!this.isEnabled) {
      this.logger.log('--- Email Sending Skipped (Service Disabled) ---');
      this.logger.log(`To: ${options.to}`);
      this.logger.log(`Subject: ${options.subject}`);
      this.logger.log('--- Body ---');
      this.logger.log(options.text);
      this.logger.log('------------------------------------------------');
      return;
    }

    try {
      const info = await this.transporter.sendMail({
        from: process.env.EMAIL_FROM || 'noreply@themusiciansindex.com',
        ...options,
      });
      this.logger.log(`Email sent successfully to ${options.to}. Message ID: ${info.messageId}`);
    } catch (error) {
      this.logger.error(`Failed to send email to ${options.to}`, error);
      // In a real application, you might want to throw the error
      // or add the failed email to a retry queue.
      throw error;
    }
  }
}
