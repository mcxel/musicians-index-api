import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class EventReplayVaultEngine {
  constructor(private readonly prisma: PrismaService) {}

  async appendReplayAsset(args: {
    eventId: string;
    kind: 'REPLAY' | 'CLIP' | 'HIGHLIGHT' | 'WINNING_MOMENT' | 'CROWD_REACTION' | 'JUDGE_COMMENT';
    url: string;
    title?: string;
    metadata?: Record<string, unknown>;
  }) {
    const event = await this.prisma.event.findUnique({ where: { id: args.eventId } });
    if (!event) throw new NotFoundException('Event not found');

    const policy = ((event.refundPolicy ?? {}) as Record<string, any>) || {};
    const uef = (policy.uef ?? {}) as Record<string, any>;
    const replayVault = (uef.replayVault ?? {}) as Record<string, any>;
    const assets = Array.isArray(replayVault.assets) ? replayVault.assets : [];
    const audit = Array.isArray(uef.auditLogs) ? uef.auditLogs : [];

    const entry = {
      kind: args.kind,
      url: args.url,
      title: args.title ?? null,
      metadata: args.metadata ?? {},
      createdAt: new Date().toISOString(),
    };

    return this.prisma.event.update({
      where: { id: args.eventId },
      data: {
        refundPolicy: {
          ...policy,
          uef: {
            ...uef,
            replayVault: {
              ...replayVault,
              assets: [...assets, entry],
            },
            auditLogs: [
              ...audit,
              {
                action: 'REPLAY_ASSET_APPENDED',
                at: new Date().toISOString(),
                details: entry,
              },
            ],
          },
        } as any,
      },
    });
  }

  async getReplayAssets(eventId: string, kind?: string) {
    const event = await this.prisma.event.findUnique({ where: { id: eventId } });
    if (!event) throw new NotFoundException('Event not found');
    const policy = ((event.refundPolicy ?? {}) as Record<string, any>) || {};
    const assets = ((((policy.uef ?? {}).replayVault ?? {}).assets ?? []) as Array<Record<string, any>>);
    if (!kind) return assets;
    return assets.filter((asset) => asset.kind === kind);
  }
}
