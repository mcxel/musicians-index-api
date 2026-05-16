/**
 * BotOutreachMessageEngine
 * Structured outreach scripts for ticket seller acquisition bots.
 */

export type TicketSellerTargetType =
  | "venue"
  | "promoter"
  | "event-host"
  | "tournament-organizer"
  | "sports-organizer"
  | "fight-promoter"
  | "comedy-producer"
  | "school"
  | "church-community"
  | "private-organizer";

export type OutreachMessagePack = {
  targetType: TicketSellerTargetType;
  shortIntro: string;
  primaryPitch: string;
  valueBullets: string[];
  callToAction: string;
  routeLinks: {
    eventHostSignup: string;
    venueSignup: string;
    promoterSignup: string;
    ticketCreation: string;
    eventPromotion: string;
    supportContact: string;
  };
};

const CORE_VALUE_BULLETS: string[] = [
  "Sell tickets on TMI with low platform fees: $0.75 to $9.99.",
  "Printable tickets with QR support.",
  "Custom ticket designs with sponsor strip options.",
  "Magazine and article promotion upsells for event acceleration.",
  "Venue pages, event pages, and promoter signup flows included.",
];

function targetHeadline(targetType: TicketSellerTargetType): string {
  switch (targetType) {
    case "venue":
      return "Fill your venue with low-fee ticketing and promotion boosts.";
    case "promoter":
      return "Launch events faster with low fees and built-in promotion routes.";
    case "event-host":
      return "Run any event type with one ticketing stack.";
    case "tournament-organizer":
      return "Sell tournament tickets and promote brackets at scale.";
    case "sports-organizer":
      return "Ticket sports events without expensive platform lock-in.";
    case "fight-promoter":
      return "Promote fight cards with low fees and premium visibility options.";
    case "comedy-producer":
      return "Sell comedy tickets with QR check-in and printable layouts.";
    case "school":
      return "Launch school event ticketing with simple support flows.";
    case "church-community":
      return "Run community event tickets with affordable processing and support.";
    case "private-organizer":
      return "Set up private event tickets quickly with clear support routes.";
    default:
      return "Sell tickets with low fees and built-in event promotion.";
  }
}

export function buildOutreachMessagePack(targetType: TicketSellerTargetType): OutreachMessagePack {
  return {
    targetType,
    shortIntro: "TMI helps event sellers launch and scale ticketing at low cost.",
    primaryPitch: targetHeadline(targetType),
    valueBullets: CORE_VALUE_BULLETS,
    callToAction: "Start by creating your host account, then launch your first event in minutes.",
    routeLinks: {
      eventHostSignup: "/event-hosts/signup",
      venueSignup: "/venues/signup",
      promoterSignup: "/promoters/signup",
      ticketCreation: "/events/new",
      eventPromotion: "/events/promote",
      supportContact: "/events/support/contact",
    },
  };
}

export function buildFollowUpScript(targetType: TicketSellerTargetType): string[] {
  const pack = buildOutreachMessagePack(targetType);
  return [
    `Intro: ${pack.shortIntro}`,
    `Pitch: ${pack.primaryPitch}`,
    ...pack.valueBullets.map((b) => `Value: ${b}`),
    `CTA: ${pack.callToAction}`,
    `Routes: host ${pack.routeLinks.eventHostSignup}, venue ${pack.routeLinks.venueSignup}, promoter ${pack.routeLinks.promoterSignup}`,
  ];
}
