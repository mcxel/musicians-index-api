import type { TicketBrandingLayer } from "@/lib/tickets/ticketCore";

export function VenueTicketCustomizer(
  branding: TicketBrandingLayer,
  custom: Partial<Pick<TicketBrandingLayer, "venueLogo" | "sponsorLogo" | "eventBranding">>,
): TicketBrandingLayer {
  return {
    ...branding,
    venueLogo: custom.venueLogo ?? branding.venueLogo,
    sponsorLogo: custom.sponsorLogo ?? branding.sponsorLogo,
    eventBranding: custom.eventBranding ?? branding.eventBranding,
  };
}
