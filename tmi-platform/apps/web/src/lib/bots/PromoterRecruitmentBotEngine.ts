/**
 * PromoterRecruitmentBotEngine
 * Specialized promoter, fight-card, sports, and comedy producer recruitment.
 */

import { createEventSellerLead, createOutreachTask, type EventSellerLead } from "./EventHostOutreachEngine";

export function createPromoterLead(input: {
  orgName: string;
  city?: string;
  region?: string;
  website?: string;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  promoterCategory:
    | "promoter"
    | "fight-promoter"
    | "sports-organizer"
    | "tournament-organizer"
    | "comedy-producer";
  botId?: string;
}): EventSellerLead {
  const lead = createEventSellerLead({
    orgName: input.orgName,
    targetType: input.promoterCategory,
    city: input.city,
    region: input.region,
    website: input.website,
    contactName: input.contactName,
    contactEmail: input.contactEmail,
    contactPhone: input.contactPhone,
    assignedBotId: input.botId,
  });

  createOutreachTask({
    leadId: lead.leadId,
    kind: "first-contact",
    dueAtMs: Date.now() + 4 * 60 * 60 * 1000,
  });

  return lead;
}
