import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export type SafetySignal =
  | 'ANTI_HATE'
  | 'ANTI_HARASSMENT'
  | 'ANTI_CHEATING'
  | 'ANTI_SPAM'
  | 'CONTEST_FRAUD'
  | 'VOTE_FRAUD'
  | 'TIP_FRAUD'
  | 'BATTLE_RIGGING';

@Injectable()
export class EventSafetyEngine {
  constructor(private readonly prisma: PrismaService) {}

  async reportSignal(args: {
    eventId: string;
    signal: SafetySignal;
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    reporterId?: string;
    details?: Record<string, unknown>;
  }) {
    const event = await this.prisma.event.findUnique({ where: { id: args.eventId } });
    if (!event) throw new NotFoundException('Event not found');

    const policy = ((event.refundPolicy ?? {}) as Record<string, any>) || {};
    const uef = (policy.uef ?? {}) as Record<string, any>;
    const safety = (uef.safety ?? {}) as Record<string, any>;
    const incidents = Array.isArray(safety.incidents) ? safety.incidents : [];
    const audit = Array.isArray(uef.auditLogs) ? uef.auditLogs : [];

    const incident = {
      signal: args.signal,
      severity: args.severity,
      reporterId: args.reporterId ?? null,
      details: args.details ?? {},
      at: new Date().toISOString(),
    };

    return this.prisma.event.update({
      where: { id: args.eventId },
      data: {
        refundPolicy: {
          ...policy,
          uef: {
            ...uef,
            safety: {
              ...safety,
              incidents: [...incidents, incident],
            },
            auditLogs: [
              ...audit,
              {
                action: 'SAFETY_SIGNAL_REPORTED',
                at: new Date().toISOString(),
                details: incident,
              },
            ],
          },
        } as any,
      },
    });
  }

  async getSafetySummary(eventId: string) {
    const event = await this.prisma.event.findUnique({ where: { id: eventId } });
    if (!event) throw new NotFoundException('Event not found');

    const policy = ((event.refundPolicy ?? {}) as Record<string, any>) || {};
    const incidents = ((((policy.uef ?? {}).safety ?? {}).incidents ?? []) as Array<Record<string, any>>);
    const bySeverity = incidents.reduce<Record<string, number>>((acc, incident) => {
      const severity = String(incident.severity ?? 'UNKNOWN');
      acc[severity] = (acc[severity] ?? 0) + 1;
      return acc;
    }, {});

    return {
      incidentCount: incidents.length,
      bySeverity,
      incidents,
    };
  }
}
