import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationTemplate } from '@prisma/client';

@Injectable()
export class NotificationsTemplateService {
  constructor(private readonly prisma: PrismaService) {}

  async getTemplate(type: string): Promise<NotificationTemplate> {
    const template = await this.prisma.notificationTemplate.findUnique({
      where: { type },
    });

    if (!template) {
      throw new NotFoundException(`Notification template with type "${type}" not found.`);
    }

    return template;
  }

  render(templateString: string, data: Record<string, any>): string {
    if (!templateString) return '';
    try {
      return templateString.replace(/\{\{\s*(\w+)\s*\}\}/g, (match, key) => {
        return data.hasOwnProperty(key) ? String(data[key]) : match;
      });
    } catch (error) {
      throw new InternalServerErrorException('Failed to render notification template.');
    }
  }
}
