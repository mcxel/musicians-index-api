/**
 * VenueTicketDesignEngine
 * Custom printable ticket layout system for venues.
 * Assembles venue logo, event art, artist art, sponsor strip, QR area, and theme.
 * Separate from TicketPrintEngine — this handles visual design configuration only.
 */

// ─── Types ────────────────────────────────────────────────────────────────────

export type TicketPrintTheme =
  | "dark-neon"
  | "gold-foil"
  | "minimal-white"
  | "magazine-editorial"
  | "graffiti"
  | "retro-80s";

export type TicketLayoutZone =
  | "header"
  | "hero-image"
  | "artist-image"
  | "venue-logo"
  | "sponsor-strip"
  | "event-details"
  | "qr-area"
  | "footer";

export type SponsorStripEntry = {
  sponsorName: string;
  sponsorLogoUrl?: string;
  sponsorWebsite?: string;
};

export type VenueTicketDesign = {
  designId: string;
  venueId: string;
  eventId: string;
  theme: TicketPrintTheme;
  venueName: string;
  venueLogoUrl?: string;
  eventImageUrl?: string;
  artistImageUrl?: string;
  artistName?: string;
  eventTitle: string;
  eventDateIso: string;
  eventTimeLabel: string;
  venueCityState: string;
  sponsorStrip: SponsorStripEntry[];
  qrCodeUrl?: string;
  primaryColor: string;
  accentColor: string;
  enabledZones: TicketLayoutZone[];
  createdAtMs: number;
};

// ─── Theme defaults ───────────────────────────────────────────────────────────

const THEME_COLORS: Record<TicketPrintTheme, { primary: string; accent: string }> = {
  "dark-neon":           { primary: "#050510", accent: "#00FFFF" },
  "gold-foil":           { primary: "#1A1200", accent: "#FFD700" },
  "minimal-white":       { primary: "#FFFFFF", accent: "#111111" },
  "magazine-editorial":  { primary: "#0A0A18", accent: "#FF2DAA" },
  "graffiti":            { primary: "#111111", accent: "#AA2DFF" },
  "retro-80s":           { primary: "#1A0030", accent: "#FF2DAA" },
};

const DEFAULT_ZONES: TicketLayoutZone[] = [
  "header",
  "hero-image",
  "venue-logo",
  "event-details",
  "qr-area",
  "footer",
];

// ─── In-memory store ──────────────────────────────────────────────────────────

const designs: VenueTicketDesign[] = [];
let designCounter = 0;

// ─── Public API ───────────────────────────────────────────────────────────────

export function createVenueTicketDesign(input: {
  venueId: string;
  eventId: string;
  theme: TicketPrintTheme;
  venueName: string;
  eventTitle: string;
  eventDateIso: string;
  eventTimeLabel: string;
  venueCityState: string;
  venueLogoUrl?: string;
  eventImageUrl?: string;
  artistImageUrl?: string;
  artistName?: string;
  sponsorStrip?: SponsorStripEntry[];
  qrCodeUrl?: string;
  additionalZones?: TicketLayoutZone[];
}): VenueTicketDesign {
  const colors = THEME_COLORS[input.theme];
  const zones: TicketLayoutZone[] = [...DEFAULT_ZONES];

  if (input.artistImageUrl && !zones.includes("artist-image")) zones.push("artist-image");
  if ((input.sponsorStrip?.length ?? 0) > 0 && !zones.includes("sponsor-strip")) zones.push("sponsor-strip");
  if (input.additionalZones) {
    input.additionalZones.forEach((z) => { if (!zones.includes(z)) zones.push(z); });
  }

  const design: VenueTicketDesign = {
    designId: `ticket-design-${++designCounter}-${input.eventId}`,
    venueId: input.venueId,
    eventId: input.eventId,
    theme: input.theme,
    venueName: input.venueName,
    venueLogoUrl: input.venueLogoUrl,
    eventImageUrl: input.eventImageUrl,
    artistImageUrl: input.artistImageUrl,
    artistName: input.artistName,
    eventTitle: input.eventTitle,
    eventDateIso: input.eventDateIso,
    eventTimeLabel: input.eventTimeLabel,
    venueCityState: input.venueCityState,
    sponsorStrip: input.sponsorStrip ?? [],
    qrCodeUrl: input.qrCodeUrl,
    primaryColor: colors.primary,
    accentColor: colors.accent,
    enabledZones: zones,
    createdAtMs: Date.now(),
  };

  designs.unshift(design);
  return design;
}

export function getTicketDesign(designId: string): VenueTicketDesign | null {
  return designs.find((d) => d.designId === designId) ?? null;
}

export function getEventTicketDesign(eventId: string): VenueTicketDesign | null {
  return designs.find((d) => d.eventId === eventId) ?? null;
}

export function addSponsorToTicketStrip(designId: string, sponsor: SponsorStripEntry): VenueTicketDesign {
  const design = designs.find((d) => d.designId === designId);
  if (!design) throw new Error(`Ticket design ${designId} not found`);
  design.sponsorStrip.push(sponsor);
  if (!design.enabledZones.includes("sponsor-strip")) design.enabledZones.push("sponsor-strip");
  return design;
}

export function setTicketQrCode(designId: string, qrCodeUrl: string): VenueTicketDesign {
  const design = designs.find((d) => d.designId === designId);
  if (!design) throw new Error(`Ticket design ${designId} not found`);
  design.qrCodeUrl = qrCodeUrl;
  if (!design.enabledZones.includes("qr-area")) design.enabledZones.push("qr-area");
  return design;
}

export function listVenueTicketDesigns(venueId: string): VenueTicketDesign[] {
  return designs.filter((d) => d.venueId === venueId);
}

export function getAvailableThemes(): TicketPrintTheme[] {
  return Object.keys(THEME_COLORS) as TicketPrintTheme[];
}
