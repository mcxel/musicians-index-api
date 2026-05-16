/**
 * FanLeadEngine
 * Fan lead and referral tracking for acquisition funnels.
 */

export type FanLeadTarget =
  | "music-fans"
  | "local-fans"
  | "venue-audiences"
  | "contest-viewers"
  | "battle-viewers"
  | "cypher-viewers"
  | "event-attendees"
  | "sponsor-audiences";

export type FanLeadState =
  | "discovered"
  | "invited"
  | "signup-started"
  | "onboarded"
  | "activated";

export type FanReferralSourceType =
  | "artist"
  | "venue"
  | "article"
  | "event"
  | "sponsor"
  | "fan-referral"
  | "direct";

export type FanReferralSource = {
  sourceType: FanReferralSourceType;
  sourceId: string;
};

export type FanLead = {
  leadId: string;
  displayName: string;
  contactHandle?: string;
  city?: string;
  region?: string;
  target: FanLeadTarget;
  state: FanLeadState;
  referralSource: FanReferralSource;
  referralCode?: string;
  referredByFanId?: string;
  createdAtMs: number;
  updatedAtMs: number;
  activatedAtMs?: number;
};

const leads = new Map<string, FanLead>();
let leadCounter = 0;

export function createFanLead(input: {
  displayName: string;
  target: FanLeadTarget;
  referralSource: FanReferralSource;
  contactHandle?: string;
  city?: string;
  region?: string;
  referralCode?: string;
  referredByFanId?: string;
}): FanLead {
  const now = Date.now();
  const leadId = `fan-lead-${++leadCounter}`;

  const lead: FanLead = {
    leadId,
    displayName: input.displayName,
    contactHandle: input.contactHandle,
    city: input.city,
    region: input.region,
    target: input.target,
    state: "discovered",
    referralSource: input.referralSource,
    referralCode: input.referralCode,
    referredByFanId: input.referredByFanId,
    createdAtMs: now,
    updatedAtMs: now,
  };

  leads.set(leadId, lead);
  return lead;
}

export function updateFanLeadState(leadId: string, state: FanLeadState): FanLead {
  const lead = leads.get(leadId);
  if (!lead) throw new Error(`Fan lead ${leadId} not found`);

  const updated: FanLead = {
    ...lead,
    state,
    updatedAtMs: Date.now(),
    ...(state === "activated" ? { activatedAtMs: Date.now() } : {}),
  };

  leads.set(leadId, updated);
  return updated;
}

export function trackFanReferralSource(input: {
  leadId: string;
  sourceType: FanReferralSourceType;
  sourceId: string;
  referralCode?: string;
  referredByFanId?: string;
}): FanLead {
  const lead = leads.get(input.leadId);
  if (!lead) throw new Error(`Fan lead ${input.leadId} not found`);

  const updated: FanLead = {
    ...lead,
    referralSource: {
      sourceType: input.sourceType,
      sourceId: input.sourceId,
    },
    referralCode: input.referralCode ?? lead.referralCode,
    referredByFanId: input.referredByFanId ?? lead.referredByFanId,
    updatedAtMs: Date.now(),
  };

  leads.set(updated.leadId, updated);
  return updated;
}

export function getFanLead(leadId: string): FanLead | null {
  return leads.get(leadId) ?? null;
}

export function listFanLeads(filters?: {
  state?: FanLeadState;
  target?: FanLeadTarget;
  sourceType?: FanReferralSourceType;
}): FanLead[] {
  return [...leads.values()]
    .filter((lead) => {
      if (filters?.state && lead.state !== filters.state) return false;
      if (filters?.target && lead.target !== filters.target) return false;
      if (filters?.sourceType && lead.referralSource.sourceType !== filters.sourceType) return false;
      return true;
    })
    .sort((a, b) => b.updatedAtMs - a.updatedAtMs);
}

export function getFanLeadReferralBreakdown(): Record<FanReferralSourceType, number> {
  const breakdown: Record<FanReferralSourceType, number> = {
    artist: 0,
    venue: 0,
    article: 0,
    event: 0,
    sponsor: 0,
    "fan-referral": 0,
    direct: 0,
  };

  for (const lead of leads.values()) {
    breakdown[lead.referralSource.sourceType] += 1;
  }

  return breakdown;
}
