/**
 * OverseerDeckBlueprintMap — Observation Deck slot ledger (data only).
 *
 * Locked base #2: ornate gold-filigree OVERSEER DECK / BerntttGlobal administration hub.
 * Blueprint asset: /assets/blueprints/tmi_overseer_deck_north_star.png
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * TWO-DECK ARCHITECTURE (LOCKED — Marcel mandate)
 *
 *   HEADER / COMMAND RIBBON
 *   OPERATIONS DECK  → Left rail | Monitor #1 (16:9) | Right rail
 *                    →           | Monitor #2 (16:9) |
 *   LIVE CHANNEL TICKER  ← architectural divider (NOT sticky)
 *   ════════════════════
 *   INTELLIGENCE DECK (below the fold — scroll past ticker)
 *     Artist Revenue & Buyouts · Magazine & Index Analytics · …
 *   ════════════════════
 *   Bottom nav (sticky OK) · Floating Workspace (Pass 8) · Overlay Portal (Admin Cam on demand)
 *
 * Ops height = MonitorStack content only. Never shrink monitors for analytics.
 * Admin Cam: never permanent DOM — mount on Camera button / center gem only.
 *
 * SUPERSEDED FREEZE (2026-07-29 evening): Marcel mandated ground-up rebuild —
 * OverseerFlightDeck owns layout; congested top Admin Quick Switch → AdminConciergePanel.
 * Prior CanonOverseerShell patch attempts superseded. Do not restore the oval top bar.
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Flight Deck / Overseer contributors (durable credit — no fake UI portraits):
 *   Big Ace · Michael Charlie · J Paul Sanchez · Justin King · Marcel Dickens
 *
 * Do NOT rebuild chrome here. KEEP = mounts real component; ALIGN = exists but
 * diverges from blueprint / Rule 20; DEFER = blueprint target not yet wired.
 */

export type OverseerSlotStatus = "KEEP" | "ALIGN" | "DEFER";

export type OverseerDeckZone =
  | "top"
  | "operations"
  | "ticker"
  | "intelligence"
  | "footer"
  | "overlay"
  /** @deprecated use operations | intelligence */
  | "left"
  | "center"
  | "right"
  | "bottom";

export interface OverseerBlueprintSlot {
  id: string;
  blueprintLabel: string;
  zone: OverseerDeckZone;
  /** Canonical route or component path in repo */
  codeTarget: string;
  status: OverseerSlotStatus;
  note: string;
}

export const OVERSEER_DECK_ROUTE = "/admin/overseer";
export const OBSERVATORY_ROUTE = "/admin/observatory";

export const OVERSEER_FLIGHT_DECK_CREDITS = [
  "Big Ace",
  "Michael Charlie",
  "J Paul Sanchez",
  "Justin King",
  "Marcel Dickens",
] as const;

export const OVERSEER_BLUEPRINT_SLOTS: OverseerBlueprintSlot[] = [
  {
    id: "top-brand",
    blueprintLabel: "BerntttGlobal + OVERSEER DECK + LIVE",
    zone: "top",
    codeTarget: "components/admin/OverseerFlightDeck.tsx (CanonOverseerShell re-exports)",
    status: "KEEP",
    note: "Two-Deck shell: ops = dual stacked 16:9; intelligence below Live Channel Ticker. Minimal header brand+LIVE only. Never hardcode LIVE viewer vanity.",
  },
  {
    id: "admin-concierge",
    blueprintLabel: "Admin Concierge (searchable destinations — replaces top oval switcher)",
    zone: "footer",
    codeTarget: "components/admin/AdminConciergePanel.tsx + AdminConciergeDestinations.ts",
    status: "KEEP",
    note: "Opened from ADMIN dock / header button. Former Admin Quick Switch hrefs live here.",
  },
  {
    id: "top-quick-dock",
    blueprintLabel: "Alerts / Chain Pulse / Start Meeting / Summon / Approve Queue",
    zone: "top",
    codeTarget: "components/admin/overseer/HQDock.tsx + LaunchControlPanel.tsx",
    status: "DEFER",
    note: "Removed from Flight Deck header congestion. Wire real alert/queue counts into Concierge or HQDock later — never fake badges.",
  },
  {
    id: "ops-left-chain-command",
    blueprintLabel: "Chain Command",
    zone: "operations",
    codeTarget: "components/admin/overseer/ChainCommandPanel.tsx",
    status: "KEEP",
    note: "Ops left rail — metrics must stay real/empty.",
  },
  {
    id: "ops-left-money-billing",
    blueprintLabel: "Money & Billing",
    zone: "operations",
    codeTarget: "WorkspaceConfigs + BigAceFinancePanel",
    status: "ALIGN",
    note: "Ops rail OK for billing controls; Artist Revenue analytics belong in Intelligence Deck.",
  },
  {
    id: "ops-left-bot-roster",
    blueprintLabel: "Bot Roster & Summon",
    zone: "operations",
    codeTarget: "components/admin/BotSummonDeck.tsx → BOT_ACCOUNT_REGISTRY",
    status: "KEEP",
    note: "Ops left rail — real BOT_ACCOUNT_REGISTRY rows, each labeled [BOT]. Do not duplicate into Intelligence Deck.",
  },
  {
    id: "ops-left-unified-inbox",
    blueprintLabel: "Unified Inbox",
    zone: "operations",
    codeTarget: "components/admin/overseer/UnifiedInbox.tsx → GET /api/admin/inbox",
    status: "ALIGN",
    note: "API is real Conversation-backed; UI still renders hardcoded demo rows — replace with API threads (Rule 20).",
  },
  {
    id: "ops-center-tv-router",
    blueprintLabel: "TV Screen Router (Boardroom Live)",
    zone: "operations",
    codeTarget: "components/admin/overseer/workspace/widgets/MediaMatrixEngine.tsx",
    status: "ALIGN",
    note: "Monitor #1 — true aspect-ratio 16/9 width-driven. Feed must be real stream or honest empty.",
  },
  {
    id: "ops-center-live-feed-explorer",
    blueprintLabel: "Live Feed Explorer",
    zone: "operations",
    codeTarget: "components/admin/overseer/FeedExplorer.tsx",
    status: "ALIGN",
    note: "Monitor #2 — equal 16:9 stack with Media Matrix. Prefer GlobalLiveSessionRegistry.",
  },
  {
    id: "ops-right-sentinel-wall",
    blueprintLabel: "Security Sentinel Wall",
    zone: "operations",
    codeTarget: "components/admin/overseer/SentinelWall.tsx",
    status: "ALIGN",
    note: "Ops right rail only — never stretch through Intelligence Deck.",
  },
  {
    id: "ops-right-account-linker",
    blueprintLabel: "Account Linker (Stripe/PayPal/…)",
    zone: "operations",
    codeTarget: "components/admin/overseer/AccountLinker.tsx",
    status: "KEEP",
    note: "Linker UI present; connection state must reflect real integration status.",
  },
  {
    id: "ops-right-stripe-integrity",
    blueprintLabel: "Stripe Webhook Integrity",
    zone: "operations",
    codeTarget: "components/admin/StripeObservatoryCard.tsx",
    status: "KEEP",
    note: "Ops telemetry card — distinct from Artist Revenue intelligence panels.",
  },
  {
    id: "live-channel-ticker",
    blueprintLabel: "Live Channel Ticker (fold breakpoint)",
    zone: "ticker",
    codeTarget: "components/admin/overseer/LiveChannelTicker.tsx",
    status: "KEEP",
    note: "Architectural divider — NOT sticky. User must scroll past to reach Intelligence Deck.",
  },
  {
    id: "intel-artist-revenue",
    blueprintLabel: "Artist Analytics & Revenue",
    zone: "intelligence",
    codeTarget: "components/admin/AdminRevenuePanel.tsx",
    status: "ALIGN",
    note: "BELOW ticker only. Never hardcode $70M graphs; Stripe/real ledger or honest empty.",
  },
  {
    id: "intel-magazine-analytics",
    blueprintLabel: "Musician Index / Magazine Analytics",
    zone: "intelligence",
    codeTarget: "components/admin/overseer/MagazineAnalytics.tsx",
    status: "ALIGN",
    note: "BELOW ticker only. Magazine engine exists; certify no vanity billboard $ figures.",
  },
  {
    id: "intel-scam-defense-center",
    blueprintLabel: "Scam Defense Center",
    zone: "intelligence",
    codeTarget: "components/admin/overseer/ScamDefenseCenter.tsx → TrustSafetyRuntime",
    status: "KEEP",
    note: "Intelligence Deck CLIENT of TrustSafetyRuntime. Real case counts from /api/trust-safety/cases. Investigation = portal overlay — never squeeze Ops 16:9 monitors. Detection does NOT live here.",
  },
  {
    id: "intel-observatory-convergence",
    blueprintLabel: "Observatory · Presentation · Platform Core · Rooms",
    zone: "intelligence",
    codeTarget:
      "components/admin/overseer/ObservatoryIntelligencePanel.tsx → PresentationTelemetryDirector + PlatformCapabilityMatrix + /api/live/go",
    status: "KEEP",
    note: "BELOW ticker only. Active pack state from ShowPackageDirector; framework/capability health from lib/platform; rooms from GlobalLiveSessionRegistry. Links to /admin/presentation-preview + /admin/platform-core. No fake counts.",
  },
  {
    id: "intel-runtime-health",
    blueprintLabel: "Live Room Runtime (ObservatoryDeck)",
    zone: "intelligence",
    codeTarget: "components/admin/overseer/ObservatoryDeck.tsx → GlobalLiveSessionRegistry",
    status: "KEEP",
    note: "Honest empty when no sessions. Seeded ROOM_SEED / vanity fallback counts removed (Slice B).",
  },
  {
    id: "intel-engagement-heatmap",
    blueprintLabel: "User Engagement Heatmap",
    zone: "intelligence",
    codeTarget: "(missing dedicated component)",
    status: "DEFER",
    note: "No real engagement heatmap engine yet — do not fake purple→orange density grid.",
  },
  {
    id: "intel-artist-deep-dive",
    blueprintLabel: "Artist Profile Deep Dive",
    zone: "intelligence",
    codeTarget: "AnalyticsDeckPanel.tsx / PerformerRegistry consumers",
    status: "DEFER",
    note: "Deep-dive cards need real performer stats from registries/APIs.",
  },
  {
    id: "footer-gold-nav",
    blueprintLabel: "Ornate gold footer nav (gem center = Admin Cam toggle)",
    zone: "footer",
    codeTarget: "CanonOverseerShell bottom dock + 📷 Camera button",
    status: "ALIGN",
    note: "Sticky bottom nav OK. Center gem + Camera button toggle Admin Cam overlay.",
  },
  {
    id: "overlay-admin-cam",
    blueprintLabel: "Admin Cam (on-demand portal)",
    zone: "overlay",
    codeTarget: "CanonOverseerShell OverlayHost + LiveCameraPreview",
    status: "KEEP",
    note: "Never permanent in admin/layout. Mount on toggle; close destroys. Removed TMIVideoMonitor from layout.",
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

export function listOverseerSlotsByZone(zone: OverseerDeckZone): OverseerBlueprintSlot[] {
  return OVERSEER_BLUEPRINT_SLOTS.filter((s) => s.zone === zone);
}
