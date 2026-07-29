/**
 * OverseerDeckBlueprintMap — Pass 8.x Observation Deck slot ledger (data only).
 *
 * Locked base #2: ornate gold-filigree OVERSEER DECK / BerntttGlobal administration hub.
 * Blueprint asset: /assets/blueprints/tmi_overseer_deck_north_star.png
 *
 * Do NOT rebuild chrome here. KEEP = mounts real component; ALIGN = exists but
 * diverges from blueprint / Rule 20; DEFER = blueprint target not yet wired.
 */

export type OverseerSlotStatus = "KEEP" | "ALIGN" | "DEFER";

export interface OverseerBlueprintSlot {
  id: string;
  blueprintLabel: string;
  zone: "top" | "left" | "center" | "right" | "bottom" | "footer";
  /** Canonical route or component path in repo */
  codeTarget: string;
  status: OverseerSlotStatus;
  note: string;
}

export const OVERSEER_DECK_ROUTE = "/admin/overseer";
export const OBSERVATORY_ROUTE = "/admin/observatory";

export const OVERSEER_BLUEPRINT_SLOTS: OverseerBlueprintSlot[] = [
  {
    id: "top-brand",
    blueprintLabel: "BerntttGlobal + OVERSEER DECK + LIVE",
    zone: "top",
    codeTarget: "components/admin/CanonOverseerShell.tsx",
    status: "ALIGN",
    note: "Shell exists; certify gold-filigree header vs blueprint. Never hardcode LIVE viewer vanity.",
  },
  {
    id: "top-quick-dock",
    blueprintLabel: "Alerts / Chain Pulse / Start Meeting / Summon / Approve Queue",
    zone: "top",
    codeTarget: "components/admin/overseer/HQDock.tsx + LaunchControlPanel.tsx",
    status: "ALIGN",
    note: "Dock pieces exist; wire real alert/queue counts or honest empty.",
  },
  {
    id: "left-chain-command",
    blueprintLabel: "Chain Command",
    zone: "left",
    codeTarget: "components/admin/overseer/ChainCommandPanel.tsx",
    status: "KEEP",
    note: "Component present; metrics must stay real/empty.",
  },
  {
    id: "left-money-billing",
    blueprintLabel: "Money & Billing",
    zone: "left",
    codeTarget: "WorkspaceConfigs + stripe-observatory widget",
    status: "ALIGN",
    note: "Stripe observatory widget exists; billing avatars must not fake balances.",
  },
  {
    id: "left-bot-roster",
    blueprintLabel: "Bot Roster & Summon",
    zone: "left",
    codeTarget: "lib/bots/* + overseer workspace widgets",
    status: "ALIGN",
    note: "Bot systems exist elsewhere; Overseer roster UI needs real botDutyRegistry bind.",
  },
  {
    id: "left-unified-inbox",
    blueprintLabel: "Unified Inbox",
    zone: "left",
    codeTarget: "components/admin/overseer/UnifiedInbox.tsx → GET /api/admin/inbox",
    status: "ALIGN",
    note: "API is real Conversation-backed; UI still renders hardcoded demo rows — replace with API threads (Rule 20).",
  },
  {
    id: "center-tv-router",
    blueprintLabel: "TV Screen Router (Boardroom Live)",
    zone: "center",
    codeTarget: "components/admin/overseer/LiveFeedRouter.tsx",
    status: "ALIGN",
    note: "Router exists; boardroom feed must be real stream or honest empty — no fake 21.1M.",
  },
  {
    id: "center-live-feed-explorer",
    blueprintLabel: "Live Feed Explorer",
    zone: "center",
    codeTarget: "components/admin/overseer/FeedExplorer.tsx",
    status: "ALIGN",
    note: "Prefer GlobalLiveSessionRegistry; drop ROOM_SEED vanity in ObservatoryDeck.tsx.",
  },
  {
    id: "right-sentinel-wall",
    blueprintLabel: "Security Sentinel Wall",
    zone: "right",
    codeTarget: "components/admin/overseer/SentinelWall.tsx",
    status: "ALIGN",
    note: "No fake threat theater; real moderation signals or honest empty.",
  },
  {
    id: "right-account-linker",
    blueprintLabel: "Account Linker (Stripe/PayPal/…)",
    zone: "right",
    codeTarget: "components/admin/overseer/AccountLinker.tsx",
    status: "KEEP",
    note: "Linker UI present; connection state must reflect real integration status.",
  },
  {
    id: "bottom-artist-revenue",
    blueprintLabel: "Artist Analytics & Revenue",
    zone: "bottom",
    codeTarget: "components/admin/overseer/RevenueAnalytics.tsx",
    status: "ALIGN",
    note: "Never hardcode $70M graphs; Stripe/real ledger or honest empty.",
  },
  {
    id: "bottom-magazine-analytics",
    blueprintLabel: "Musician Index / Magazine Analytics",
    zone: "bottom",
    codeTarget: "components/admin/overseer/MagazineAnalytics.tsx",
    status: "ALIGN",
    note: "Magazine engine exists; certify no vanity billboard $ figures.",
  },
  {
    id: "bottom-engagement-heatmap",
    blueprintLabel: "User Engagement Heatmap",
    zone: "bottom",
    codeTarget: "(missing dedicated component)",
    status: "DEFER",
    note: "No real engagement heatmap engine yet — do not fake purple→orange density grid.",
  },
  {
    id: "bottom-artist-deep-dive",
    blueprintLabel: "Artist Profile Deep Dive",
    zone: "bottom",
    codeTarget: "AnalyticsDeckPanel.tsx / PerformerRegistry consumers",
    status: "DEFER",
    note: "Deep-dive cards need real performer stats from registries/APIs.",
  },
  {
    id: "footer-gold-nav",
    blueprintLabel: "Ornate gold footer nav (gem center)",
    zone: "footer",
    codeTarget: "CanonOverseerShell / OverseerDock",
    status: "ALIGN",
    note: "Footer chrome exists in shell/dock; visual certify vs gold-filigree blueprint later.",
  },
  {
    id: "booking-queue",
    blueprintLabel: "Approve Queue / venue booking requests",
    zone: "top",
    codeTarget:
      "VenueBookingRegistry (feedItem VENUE_BOOKING) + BOOKING_ALERT_EMAIL + /api/venues/booking-request",
    status: "KEEP",
    note: "Pass 8 Venue Concierge writes VenueBookingRegistry; alert email if env set. No parallel admin UI.",
  },
];

export function listOverseerSlotsByStatus(status: OverseerSlotStatus): OverseerBlueprintSlot[] {
  return OVERSEER_BLUEPRINT_SLOTS.filter((s) => s.status === status);
}
