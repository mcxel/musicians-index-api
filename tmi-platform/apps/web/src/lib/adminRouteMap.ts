export type AdminSectionId =
  | "monitor"
  | "chain-command"
  | "security"
  | "integrations"
  | "billing"
  | "bots"
  | "inbox"
  | "live-feed"
  | "artist-analytics"
  | "magazine-analytics"
  | "role-previews";

export type AdminRouteTarget = {
  id: AdminSectionId;
  label: string;
  route: string;
  description: string;
};

export const ADMIN_ROUTE_MAP: Record<AdminSectionId, AdminRouteTarget> = {
  monitor: {
    id: "monitor",
    label: "TV Screen Router",
    route: "/admin",
    description: "Dynamic monitor preview surface",
  },
  "chain-command": {
    id: "chain-command",
    label: "Chain Command",
    route: "/admin/chain-command",
    description: "Big Ace chain, verification, supervision",
  },
  security: {
    id: "security",
    label: "Security Sentinel Wall",
    route: "/admin/security",
    description: "Threats, vulnerabilities, and sentinel status",
  },
  integrations: {
    id: "integrations",
    label: "Account Linker",
    route: "/admin/integrations",
    description: "Stripe, PayPal, Ads, Meta, hosting, sponsors",
  },
  billing: {
    id: "billing",
    label: "Money & Billing",
    route: "/admin/billing",
    description: "Revenue, payouts, wallet state",
  },
  bots: {
    id: "bots",
    label: "Bot Roster & Summon",
    route: "/admin/bots",
    description: "Big Ace, helper bots, sentinel bots",
  },
  inbox: {
    id: "inbox",
    label: "Unified Inbox",
    route: "/admin/inbox",
    description: "Operator + partner message bus",
  },
  "live-feed": {
    id: "live-feed",
    label: "Live Feed Explorer",
    route: "/admin/live-feed",
    description: "Rooms, events, artists, sponsors, feeds",
  },
  "artist-analytics": {
    id: "artist-analytics",
    label: "Artist Analytics & Revenue",
    route: "/admin/artist-analytics",
    description: "Billboard rank, money, subscriptions, tips",
  },
  "magazine-analytics": {
    id: "magazine-analytics",
    label: "Magazine Analytics",
    route: "/admin/magazine-analytics",
    description: "Musician Index + content performance",
  },
  "role-previews": {
    id: "role-previews",
    label: "Role Preview Windows",
    route: "/admin/role-previews",
    description: "Fan, Artist, Performer, Venue, Sponsor, Advertiser snapshots",
  },
};

export const ADMIN_ROUTE_LIST: AdminRouteTarget[] = Object.values(ADMIN_ROUTE_MAP);

export function getAdminRouteById(id: string | null | undefined): AdminRouteTarget {
  if (!id || !(id in ADMIN_ROUTE_MAP)) {
    return ADMIN_ROUTE_MAP.monitor;
  }

  return ADMIN_ROUTE_MAP[id as AdminSectionId];
}
