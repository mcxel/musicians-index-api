/**
 * VenueRecruitmentBotEngine
 * Specialized venue, school, church/community, and private event organizer recruitment.
 */

import { createEventSellerLead, createOutreachTask, type EventSellerLead } from "./EventHostOutreachEngine";

export function createVenueLead(input: {
  orgName: string;
  city?: string;
  region?: string;
  website?: string;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  venueCategory: "venue" | "school" | "church-community" | "private-organizer" | "event-host";
  botId?: string;
}): EventSellerLead {
  const lead = createEventSellerLead({
    orgName: input.orgName,
    targetType: input.venueCategory,
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
    dueAtMs: Date.now() + 2 * 60 * 60 * 1000,
  });

  return lead;
}
