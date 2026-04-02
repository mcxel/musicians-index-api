import { Injectable, Logger } from '@nestjs/common';

// We assume a real EmailService is provided by the global EmailModule.
// This is a placeholder for development within this module.
// In the real implementation, we would inject the real EmailService.

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  async send(to: string, subject: string, body: string) {
    this.logger.log(`Simulating sending email to ${to}`);
    this.logger.debug(`Subject: ${subject}`);
    this.logger.debug(`Body: ${body}`);
    // In a real implementation, this would use a service like Nodemailer or a transactional email API (SendGrid, etc.)
    return Promise.resolve({ success: true, messageId: `simulated-${Date.now()}` });
  }
}
