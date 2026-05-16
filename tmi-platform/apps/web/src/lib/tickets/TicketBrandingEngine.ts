import type { TicketBrandingLayer } from "@/lib/tickets/ticketCore";

export function TicketBrandingEngine(input: {
  venueSlug: string;
  eventSlug: string;
  venueLogo?: string;
  sponsorLogo?: string;
  eventBranding?: string;
}): TicketBrandingLayer {
  const base = `${input.venueSlug}-${input.eventSlug}-${Date.now()}`;
  return {
    venueLogo: input.venueLogo ?? `${input.venueSlug.toUpperCase()}_LOGO`,
    sponsorLogo: input.sponsorLogo ?? "GLOBAL_SPONSOR",
    eventBranding: input.eventBranding ?? input.eventSlug.toUpperCase(),
    qrCode: `QR-${base}`,
    barcode: `BAR-${base}`,
    hologramNftOverlay: `NFT-OVERLAY-${base}`,
  };
}
