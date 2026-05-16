/**
 * FanAcquisitionBotEngine
 * Fan discovery and capture automation across campaign, event, and article surfaces.
 */

import {
  createFanLead,
  listFanLeads,
  type FanLead,
  type FanLeadTarget,
} from "./FanLeadEngine";
import { createFanInvite, type FanInviteRecord } from "./FanInviteEngine";

const TARGET_DEFAULTS: FanLeadTarget[] = [
  "music-fans",
  "local-fans",
  "venue-audiences",
  "contest-viewers",
  "battle-viewers",
  "cypher-viewers",
  "event-attendees",
  "sponsor-audiences",
];

const SOURCE_PREFILL: Array<{ name: string; handle: string; city: string; region: string }> = [
  { name: "Ari Nova", handle: "@arinova", city: "Houston", region: "TX" },
  { name: "Kai Rhythm", handle: "@kairhythm", city: "Atlanta", region: "GA" },
  { name: "Nia Echo", handle: "@niaecho", city: "Chicago", region: "IL" },
  { name: "Jules Tempo", handle: "@julestempo", city: "Los Angeles", region: "CA" },
  { name: "Milo Wave", handle: "@milowave", city: "Miami", region: "FL" },
];

export function discoverFanLeads(input?: {
  batchSize?: number;
  targets?: FanLeadTarget[];
}): FanLead[] {
  const batchSize = Math.max(1, input?.batchSize ?? 25);
  const targets = input?.targets?.length ? input.targets : TARGET_DEFAULTS;

  const created: FanLead[] = [];
  for (let i = 0; i < batchSize; i += 1) {
    const source = SOURCE_PREFILL[i % SOURCE_PREFILL.length];
    const target = targets[i % targets.length];

    created.push(
      createFanLead({
        displayName: `${source.name} ${i + 1}`,
        contactHandle: `${source.handle}${i + 1}`,
        city: source.city,
        region: source.region,
        target,
        referralSource: {
          sourceType: "direct",
          sourceId: "fan-acquisition-bot",
        },
      })
    );
  }

  return created;
}

export function generateCampaignInvites(input: {
  inviterFanId: string;
  leadIds: string[];
}): FanInviteRecord[] {
  const invites: FanInviteRecord[] = [];

  for (const leadId of input.leadIds) {
    invites.push(
      createFanInvite({
        inviterFanId: input.inviterFanId,
        leadId,
      })
    );
  }

  return invites;
}

export function captureEventFans(input: {
  eventId: string;
  attendees: Array<{ displayName: string; handle?: string; city?: string; region?: string }>;
}): FanLead[] {
  return input.attendees.map((attendee) => {
    return createFanLead({
      displayName: attendee.displayName,
      contactHandle: attendee.handle,
      city: attendee.city,
      region: attendee.region,
      target: "event-attendees",
      referralSource: {
        sourceType: "event",
        sourceId: input.eventId,
      },
    });
  });
}

export function captureArticleFans(input: {
  articleId: string;
  readers: Array<{ displayName: string; handle?: string; city?: string; region?: string }>;
}): FanLead[] {
  return input.readers.map((reader) => {
    return createFanLead({
      displayName: reader.displayName,
      contactHandle: reader.handle,
      city: reader.city,
      region: reader.region,
      target: "music-fans",
      referralSource: {
        sourceType: "article",
        sourceId: input.articleId,
      },
    });
  });
}

export function getFanAcquisitionSnapshot(): {
  totalLeads: number;
  targetBreakdown: Record<FanLeadTarget, number>;
} {
  const leads = listFanLeads();
  const targetBreakdown: Record<FanLeadTarget, number> = {
    "music-fans": 0,
    "local-fans": 0,
    "venue-audiences": 0,
    "contest-viewers": 0,
    "battle-viewers": 0,
    "cypher-viewers": 0,
    "event-attendees": 0,
    "sponsor-audiences": 0,
  };

  for (const lead of leads) {
    targetBreakdown[lead.target] += 1;
  }

  return {
    totalLeads: leads.length,
    targetBreakdown,
  };
}
