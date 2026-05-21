import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class EventTranslationLayer {
  constructor(private readonly prisma: PrismaService) {}

  async upsertTranslationState(args: {
    eventId: string;
    sourceLanguage: string;
    targetLanguages: string[];
    speechToTextEnabled: boolean;
    textToTextEnabled: boolean;
    subtitlesEnabled: boolean;
    captionReplayEnabled: boolean;
    liveLanguageSwitching: boolean;
  }) {
    const event = await this.prisma.event.findUnique({ where: { id: args.eventId } });
    if (!event) throw new NotFoundException('Event not found');

    const policy = ((event.refundPolicy ?? {}) as Record<string, any>) || {};
    const uef = (policy.uef ?? {}) as Record<string, any>;
    const audit = Array.isArray(uef.auditLogs) ? uef.auditLogs : [];

    return this.prisma.event.update({
      where: { id: args.eventId },
      data: {
        refundPolicy: {
          ...policy,
          uef: {
            ...uef,
            translation: {
              ...args,
              updatedAt: new Date().toISOString(),
            },
            auditLogs: [
              ...audit,
              {
                action: 'TRANSLATION_UPDATED',
                at: new Date().toISOString(),
                details: args,
              },
            ],
          },
        } as any,
      },
    });
  }

  async getTranslationState(eventId: string) {
    const event = await this.prisma.event.findUnique({ where: { id: eventId } });
    if (!event) throw new NotFoundException('Event not found');
    const policy = ((event.refundPolicy ?? {}) as Record<string, any>) || {};
    return (policy.uef ?? {}).translation ?? null;
  }
}
