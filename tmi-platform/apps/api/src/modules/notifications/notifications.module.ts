import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { NotificationsProducerService } from './notifications.producer.service';
import { NotificationsProcessor } from './notifications.processor';
import { InAppService } from './channels/in-app.service';
import { EmailService } from './channels/email.service';
import { SmsService } from './channels/sms.service';
import { PushService } from './channels/push.service';
import { NotificationsTemplateService } from './notifications.template.service';
import { NotificationsGateway } from './notifications.gateway';

@Module({
  imports: [
    PrismaModule,
    BullModule.registerQueue({
      name: 'notifications',
    }),
  ],
  controllers: [NotificationsController],
  providers: [
    NotificationsService,
    NotificationsProducerService,
    NotificationsProcessor,
    NotificationsTemplateService,
    InAppService,
    EmailService,
    SmsService,
    PushService,
    NotificationsGateway,
  ],
  exports: [NotificationsService, NotificationsProducerService, NotificationsGateway],
})
export class NotificationsModule {}
