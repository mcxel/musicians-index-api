import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class SmsService {
  private readonly logger = new Logger(SmsService.name);

  async send(to: string, body: string) {
    this.logger.log(`Simulating sending SMS to ${to}`);
    this.logger.debug(`Body: ${body}`);
    // In a real implementation, this would use a service like Twilio.
    return Promise.resolve({ success: true, messageId: `simulated-sms-${Date.now()}` });
  }
}
