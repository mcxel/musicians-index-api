import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { NotificationJobData } from './notifications.producer.service';
import { NotificationsTemplateService } from './notifications.template.service';
import { PrismaService } from '../prisma/prisma.service';
import { InAppService } from './channels/in-app.service';
import { EmailService } from './channels/email.service';
import { SmsService } from './channels/sms.service';
import { PushService } from './channels/push.service';
import { NotificationChannel } from '@prisma/client';

@Processor('notifications')
export class NotificationsProcessor extends WorkerHost {
  private readonly logger = new Logger(NotificationsProcessor.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly templateService: NotificationsTemplateService,
    private readonly inAppService: InAppService,
    private readonly emailService: EmailService,
    private readonly smsService: SmsService,
    private readonly pushService: PushService,
  ) {
    super();
  }

  async process(job: Job<NotificationJobData>): Promise<void> {
    return this.handleSendNotification(job);
  }

  async handleSendNotification(job: Job<NotificationJobData>): Promise<void> {
    const { userId, type, data } = job.data;
    this.logger.log(`Processing notification job ${job.id} for user ${userId} of type ${type}`);

    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        include: { notificationPreferences: true },
      });

      if (!user) {
        this.logger.warn(`User with ID ${userId} not found. Skipping job ${job.id}.`);
        return;
      }

      const template = await this.templateService.getTemplate(type);

      const preferences = user.notificationPreferences;

      const isChannelEnabled = (channel: NotificationChannel) => {
        const preference = preferences.find((p) => p.type === type && p.channel === channel);
        // Default to true if no preference is explicitly set
        return preference ? preference.enabled : true;
      };

      // IN_APP
      if (template.templateInAppTitle && isChannelEnabled(NotificationChannel.IN_APP)) {
        await this.sendInAppNotification(user.id, type, template, data);
      }

      // EMAIL
      if (user.email && template.templateEmailSubject && isChannelEnabled(NotificationChannel.EMAIL)) {
        await this.sendEmailNotification(user.id, user.email, type, template, data);
      }

      // TODO: Add SMS and PUSH logic when user phone numbers and push tokens are available.

    } catch (error) {
      this.logger.error(`Error processing job ${job.id}: ${error.message}`, error.stack);
      throw error; // Re-throw to let BullMQ handle the retry
    }

    this.logger.log(`Finished processing job ${job.id}`);
  }

  private async sendInAppNotification(userId: string, type: string, template: any, data: any) {
    const title = this.templateService.render(template.templateInAppTitle, data);
    const body = this.templateService.render(template.templateInAppBody, data);
    const href = this.templateService.render(template.templateInAppHref, data);

    const log = await this.prisma.outgoingNotification.create({
      data: {
        userId,
        channel: NotificationChannel.IN_APP,
        status: 'PENDING',
        type,
        data,
        sentContentSubject: title,
        sentContentBody: body,
      },
    });

    try {
      const inAppNotification = await this.inAppService.send(userId, title, body, href);
      await this.prisma.outgoingNotification.update({
        where: { id: log.id },
        data: {
          status: 'SENT',
          processedAt: new Date(),
          inAppNotificationId: inAppNotification.id,
        },
      });
    } catch (error) {
      await this.prisma.outgoingNotification.update({
        where: { id: log.id },
        data: { status: 'FAILED', providerError: error.message, processedAt: new Date() },
      });
      throw error;
    }
  }

  private async sendEmailNotification(userId: string, email: string, type: string, template: any, data: any) {
    const subject = this.templateService.render(template.templateEmailSubject, data);
    const body = this.templateService.render(template.templateEmailBody, data);

    const log = await this.prisma.outgoingNotification.create({
      data: {
        userId,
        channel: NotificationChannel.EMAIL,
        status: 'PENDING',
        type,
        data,
        sentContentSubject: subject,
        sentContentBody: body,
      },
    });

    try {
      const result = await this.emailService.send(email, subject, body);
      await this.prisma.outgoingNotification.update({
        where: { id: log.id },
        data: {
          status: 'SENT',
          provider: 'EmailService',
          providerMessageId: result.messageId,
          processedAt: new Date(),
        },
      });
    } catch (error) {
      await this.prisma.outgoingNotification.update({
        where: { id: log.id },
        data: { status: 'FAILED', providerError: error.message, processedAt: new Date() },
      });
      throw error;
    }
  }
}
