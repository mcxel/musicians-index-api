import type { CertificationRole } from "./QACertificationFleet";

// ─────────────────────────────────────────────────────────────────────────────
// Page Certification Registry
//
// Every major route in the TMI platform has a corresponding entry here with:
//   - The roles that can access it
//   - The workflow checks that must pass for it to be certified
//   - The current certification status (real zeros until Playwright populates them)
//
// Rule 20: status starts PENDING. Only PASS when automated evidence is stored.
// ─────────────────────────────────────────────────────────────────────────────

export type PageCertStatus = "PASS" | "FAIL" | "PENDING";

export type WorkflowCheck = {
  checkId: string;
  label: string;
  blocking: boolean;
  status: PageCertStatus;
  lastVerifiedAt: string | null;
  durationMs: number | null;
};

export type PageCertRecord = {
  pageId: string;
  route: string;
  title: string;
  roles: CertificationRole[];
  checks: WorkflowCheck[];
  status: PageCertStatus;
  lastCertifiedAt: string | null;
  lastCertifiedBy: string | null;
};

function pending(checks: Omit<WorkflowCheck, "status" | "lastVerifiedAt" | "durationMs">[]): WorkflowCheck[] {
  return checks.map((c) => ({ ...c, status: "PENDING" as const, lastVerifiedAt: null, durationMs: null }));
}

export const PAGE_CERTIFICATION_REGISTRY: PageCertRecord[] = [
  // ── Discovery / Home ───────────────────────────────────────────────────────
  {
    pageId: "home-1-crown",
    route: "/home/1",
    title: "Home 1 — The Crown",
    roles: ["fan", "performer", "band", "venue", "promoter", "sponsor", "advertiser", "writer", "moderator", "admin"],
    status: "PENDING",
    lastCertifiedAt: null,
    lastCertifiedBy: null,
    checks: pending([
      { checkId: "h1.load",              label: "Page loads < 3s",               blocking: true  },
      { checkId: "h1.crown.visible",     label: "Overall Crown section visible",  blocking: true  },
      { checkId: "h1.genre.crowns",      label: "Genre Crowns listed",            blocking: true  },
      { checkId: "h1.crown.real-data",   label: "Crown reads from registry (no hardcode)", blocking: true  },
      { checkId: "h1.discovery-rail",    label: "Discovery Rail renders",         blocking: true  },
      { checkId: "h1.live-badge",        label: "LIVE badges from registry only", blocking: true  },
      { checkId: "h1.no-dead-links",     label: "No href='#' links",             blocking: true  },
      { checkId: "h1.ad-slot",           label: "Ad slot resolves (fallback chain)", blocking: false },
      { checkId: "h1.mobile",            label: "Responsive on 375px",            blocking: true  },
      { checkId: "h1.dark-mode",         label: "Dark mode correct",              blocking: false },
    ]),
  },
  {
    pageId: "home-2-magazine",
    route: "/home/2",
    title: "Home 2 — Magazine",
    roles: ["fan", "performer", "band", "venue", "promoter", "sponsor", "advertiser", "writer", "moderator", "admin"],
    status: "PENDING",
    lastCertifiedAt: null,
    lastCertifiedBy: null,
    checks: pending([
      { checkId: "h2.load",             label: "Page loads",                     blocking: true  },
      { checkId: "h2.issue-feed",       label: "Magazine issue feed visible",    blocking: true  },
      { checkId: "h2.articles",         label: "Articles link to real routes",   blocking: true  },
      { checkId: "h2.discovery-rail",   label: "Discovery Rail renders",         blocking: true  },
      { checkId: "h2.no-placeholder",   label: "No lorem ipsum or stub copy",    blocking: true  },
      { checkId: "h2.mobile",           label: "Responsive on 375px",            blocking: true  },
    ]),
  },
  {
    pageId: "home-3-live",
    route: "/home/3",
    title: "Home 3 — Live World",
    roles: ["fan", "performer", "band", "venue", "promoter", "sponsor", "advertiser", "writer", "moderator", "admin"],
    status: "PENDING",
    lastCertifiedAt: null,
    lastCertifiedBy: null,
    checks: pending([
      { checkId: "h3.load",              label: "Page loads",                     blocking: true  },
      { checkId: "h3.live-grid",         label: "Live room grid visible",         blocking: true  },
      { checkId: "h3.live-badge-real",   label: "LIVE badges from real engine",   blocking: true  },
      { checkId: "h3.join-flow",         label: "Joining room routes through LobbyEntryFlow", blocking: true  },
      { checkId: "h3.discovery-rail",    label: "Discovery Rail renders",         blocking: true  },
      { checkId: "h3.mobile",            label: "Responsive on 375px",            blocking: true  },
    ]),
  },
  {
    pageId: "home-4-marketplace",
    route: "/home/4",
    title: "Home 4 — Marketplace",
    roles: ["fan", "performer", "band", "venue", "promoter", "sponsor", "advertiser", "writer", "moderator", "admin"],
    status: "PENDING",
    lastCertifiedAt: null,
    lastCertifiedBy: null,
    checks: pending([
      { checkId: "h4.load",             label: "Page loads",                     blocking: true  },
      { checkId: "h4.sponsor-slots",    label: "Sponsor slots resolve (Rule 12 chain)", blocking: true  },
      { checkId: "h4.ad-slots",         label: "Ad slots resolve",               blocking: true  },
      { checkId: "h4.discovery-rail",   label: "Discovery Rail renders",         blocking: true  },
      { checkId: "h4.mobile",           label: "Responsive on 375px",            blocking: true  },
    ]),
  },
  {
    pageId: "home-5-arena",
    route: "/home/5",
    title: "Home 5 — Arena",
    roles: ["fan", "performer", "band", "venue", "promoter", "sponsor", "advertiser", "writer", "moderator", "admin"],
    status: "PENDING",
    lastCertifiedAt: null,
    lastCertifiedBy: null,
    checks: pending([
      { checkId: "h5.load",              label: "Page loads",                     blocking: true  },
      { checkId: "h5.competitions",      label: "Competition listings visible",   blocking: true  },
      { checkId: "h5.join-battle",       label: "Join battle navigates correctly", blocking: true  },
      { checkId: "h5.discovery-rail",    label: "Discovery Rail renders",         blocking: true  },
      { checkId: "h5.mobile",            label: "Responsive on 375px",            blocking: true  },
    ]),
  },

  // ── Auth ───────────────────────────────────────────────────────────────────
  {
    pageId: "auth-login",
    route: "/auth/login",
    title: "Login",
    roles: ["fan", "performer", "band", "venue", "promoter", "sponsor", "advertiser", "writer", "moderator", "admin"],
    status: "PENDING",
    lastCertifiedAt: null,
    lastCertifiedBy: null,
    checks: pending([
      { checkId: "login.render",          label: "Form renders",                  blocking: true  },
      { checkId: "login.valid",           label: "Valid credentials → dashboard", blocking: true  },
      { checkId: "login.invalid",         label: "Invalid credentials → error",   blocking: true  },
      { checkId: "login.forgot-link",     label: "Forgot password link works",    blocking: true  },
      { checkId: "login.session-persist", label: "Session persists on refresh",   blocking: true  },
      { checkId: "login.redirect",        label: "Post-login redirect correct per role", blocking: true  },
    ]),
  },
  {
    pageId: "auth-signup",
    route: "/auth/signup",
    title: "Signup",
    roles: ["fan", "performer", "band", "venue", "promoter", "sponsor", "advertiser", "writer"],
    status: "PENDING",
    lastCertifiedAt: null,
    lastCertifiedBy: null,
    checks: pending([
      { checkId: "signup.render",         label: "Form renders",                  blocking: true  },
      { checkId: "signup.all-roles",      label: "All 6 roles selectable",        blocking: true  },
      { checkId: "signup.validation",     label: "Required field validation",     blocking: true  },
      { checkId: "signup.duplicate-email","label": "Duplicate email → clear error", blocking: true  },
      { checkId: "signup.success",        label: "Successful signup → onboarding", blocking: true  },
      { checkId: "signup.email-verify",   label: "Verification email sent",       blocking: true  },
    ]),
  },
  {
    pageId: "auth-reset-password",
    route: "/auth/reset-password",
    title: "Password Reset",
    roles: ["fan", "performer", "band", "venue", "promoter", "sponsor", "advertiser", "writer", "moderator", "admin"],
    status: "PENDING",
    lastCertifiedAt: null,
    lastCertifiedBy: null,
    checks: pending([
      { checkId: "reset.request",   label: "Reset request form submits",   blocking: true  },
      { checkId: "reset.email",     label: "Reset email delivered",        blocking: true  },
      { checkId: "reset.token",     label: "Token link opens reset form",  blocking: true  },
      { checkId: "reset.new-pass",  label: "New password saves + login works", blocking: true  },
    ]),
  },

  // ── Profiles ───────────────────────────────────────────────────────────────
  {
    pageId: "fan-profile",
    route: "/fan/[slug]",
    title: "Fan Profile",
    roles: ["fan", "performer", "band", "admin"],
    status: "PENDING",
    lastCertifiedAt: null,
    lastCertifiedBy: null,
    checks: pending([
      { checkId: "fan.load",             label: "Profile loads from slug",        blocking: true  },
      { checkId: "fan.playlist",         label: "Playlist Canister renders",      blocking: true  },
      { checkId: "fan.memory-wall",      label: "Memory Wall Canister renders",   blocking: true  },
      { checkId: "fan.messaging",        label: "Messaging Canister renders",     blocking: true  },
      { checkId: "fan.avatar",           label: "Avatar visible",                 blocking: true  },
      { checkId: "fan.inventory",        label: "Inventory Canister renders",     blocking: false },
      { checkId: "fan.no-fake-tier",     label: "Tier badge from real DB",        blocking: true  },
      { checkId: "fan.not-found",        label: "Unknown slug → /performers fallback", blocking: true  },
    ]),
  },
  {
    pageId: "performer-profile",
    route: "/performers/[slug]",
    title: "Performer Profile",
    roles: ["fan", "performer", "band", "venue", "promoter", "sponsor", "advertiser", "writer", "moderator", "admin"],
    status: "PENDING",
    lastCertifiedAt: null,
    lastCertifiedBy: null,
    checks: pending([
      { checkId: "perf.load",            label: "Profile loads from registry",    blocking: true  },
      { checkId: "perf.playlist",        label: "Playlist Canister renders",      blocking: true  },
      { checkId: "perf.memory-wall",     label: "Memory Wall Canister renders",   blocking: true  },
      { checkId: "perf.booking",         label: "Booking Canister renders",       blocking: true  },
      { checkId: "perf.messaging",       label: "Messaging Canister renders",     blocking: true  },
      { checkId: "perf.store",           label: "Store Canister renders",         blocking: false },
      { checkId: "perf.live-badge",      label: "LIVE badge from registry only",  blocking: true  },
      { checkId: "perf.tip",             label: "Tip button navigates to Stripe", blocking: true  },
      { checkId: "perf.discovery-rail",  label: "Related performers/articles",    blocking: true  },
      { checkId: "perf.not-found",       label: "Unknown slug → /performers",     blocking: true  },
    ]),
  },
  {
    pageId: "venue-profile",
    route: "/venues/[slug]",
    title: "Venue Profile",
    roles: ["fan", "performer", "band", "venue", "promoter", "sponsor", "admin"],
    status: "PENDING",
    lastCertifiedAt: null,
    lastCertifiedBy: null,
    checks: pending([
      { checkId: "venue.load",           label: "Profile loads",                  blocking: true  },
      { checkId: "venue.booking",        label: "Booking Canister renders",       blocking: true  },
      { checkId: "venue.messaging",      label: "Messaging Canister renders",     blocking: true  },
      { checkId: "venue.lobby-wall",     label: "Live Lobby Wall renders",        blocking: true  },
      { checkId: "venue.events",         label: "Upcoming events listed",         blocking: true  },
      { checkId: "venue.tickets",        label: "Buy ticket routes to checkout",  blocking: true  },
    ]),
  },

  // ── Magazine ───────────────────────────────────────────────────────────────
  {
    pageId: "magazine-home",
    route: "/magazine",
    title: "Magazine — Index",
    roles: ["fan", "performer", "band", "venue", "promoter", "sponsor", "advertiser", "writer", "moderator", "admin"],
    status: "PENDING",
    lastCertifiedAt: null,
    lastCertifiedBy: null,
    checks: pending([
      { checkId: "mag.load",            label: "Page loads",                     blocking: true  },
      { checkId: "mag.issue-1",         label: "Issue 1 visible with 5+ articles", blocking: true  },
      { checkId: "mag.no-lorem",        label: "No lorem ipsum or stub copy",    blocking: true  },
      { checkId: "mag.discovery-rail",  label: "Discovery Rail renders",         blocking: true  },
    ]),
  },
  {
    pageId: "magazine-article",
    route: "/magazine/article/[slug]",
    title: "Magazine Article",
    roles: ["fan", "performer", "band", "venue", "promoter", "sponsor", "advertiser", "writer", "moderator", "admin"],
    status: "PENDING",
    lastCertifiedAt: null,
    lastCertifiedBy: null,
    checks: pending([
      { checkId: "article.load",           label: "Article loads from slug",       blocking: true  },
      { checkId: "article.body",           label: "Article body renders",          blocking: true  },
      { checkId: "article.song-preview",   label: "Song preview present",          blocking: false },
      { checkId: "article.live-link",      label: "Live room link present",        blocking: false },
      { checkId: "article.merch",          label: "Merch section present",         blocking: false },
      { checkId: "article.tip",            label: "Tip button present",            blocking: false },
      { checkId: "article.fan-club",       label: "Fan club CTA present",          blocking: false },
      { checkId: "article.comments",       label: "Comments section present",      blocking: false },
      { checkId: "article.related",        label: "Related articles present",      blocking: true  },
      { checkId: "article.related-perfs",  label: "Related performers present",    blocking: true  },
      { checkId: "article.not-found",      label: "Unknown slug → /magazine",      blocking: true  },
    ]),
  },
  {
    pageId: "performer-article",
    route: "/articles/performer/[slug]",
    title: "Performer Article",
    roles: ["fan", "performer", "band", "venue", "promoter", "sponsor", "advertiser", "writer", "moderator", "admin"],
    status: "PENDING",
    lastCertifiedAt: null,
    lastCertifiedBy: null,
    checks: pending([
      { checkId: "perf-article.load",         label: "Loads from slug",              blocking: true  },
      { checkId: "perf-article.reads-registry","label": "Data from getPerformerBySlug()", blocking: true  },
      { checkId: "perf-article.playlist",     label: "Playlist Canister",            blocking: true  },
      { checkId: "perf-article.booking",      label: "Booking Canister",             blocking: false },
      { checkId: "perf-article.store",        label: "Store Canister",               blocking: false },
      { checkId: "perf-article.related",      label: "Related articles",             blocking: true  },
    ]),
  },

  // ── Live ───────────────────────────────────────────────────────────────────
  {
    pageId: "live-room",
    route: "/live/rooms/[id]",
    title: "Live Room",
    roles: ["fan", "performer", "band", "venue", "promoter", "sponsor", "advertiser", "writer", "moderator", "admin"],
    status: "PENDING",
    lastCertifiedAt: null,
    lastCertifiedBy: null,
    checks: pending([
      { checkId: "lr.join",             label: "Join room",                       blocking: true  },
      { checkId: "lr.leave",            label: "Leave room cleanly",              blocking: true  },
      { checkId: "lr.camera",           label: "Camera initializes",              blocking: true  },
      { checkId: "lr.mic",              label: "Microphone initializes",          blocking: true  },
      { checkId: "lr.chat-send",        label: "Chat — send message",             blocking: true  },
      { checkId: "lr.chat-receive",     label: "Chat — receive message",          blocking: true  },
      { checkId: "lr.raise-hand",       label: "Raise hand",                      blocking: false },
      { checkId: "lr.invite",           label: "Invite friend",                   blocking: false },
      { checkId: "lr.reaction",         label: "Reaction bar fires",              blocking: true  },
      { checkId: "lr.tip",              label: "Tip performer",                   blocking: true  },
      { checkId: "lr.ticket-buy",       label: "Ticket purchase in-room",         blocking: true  },
      { checkId: "lr.memory-wall",      label: "Memory Wall save",                blocking: true  },
      { checkId: "lr.playlist",         label: "Playlist queue",                  blocking: true  },
      { checkId: "lr.report",           label: "Report user",                     blocking: true  },
      { checkId: "lr.reconnect",        label: "Disconnect → reconnect",          blocking: true  },
      { checkId: "lr.audience-count",   label: "Audience count updates",          blocking: true  },
      { checkId: "lr.no-direct-access", label: "Direct URL → LobbyEntryFlow",     blocking: true  },
    ]),
  },
  {
    pageId: "lobby-public",
    route: "/lobby/[slug]",
    title: "Public Lobby",
    roles: ["fan", "performer", "band", "venue", "promoter", "sponsor", "advertiser", "writer", "moderator", "admin"],
    status: "PENDING",
    lastCertifiedAt: null,
    lastCertifiedBy: null,
    checks: pending([
      { checkId: "pub-lobby.load",       label: "Lobby loads",                    blocking: true  },
      { checkId: "pub-lobby.seat",       label: "Seat assignment works",          blocking: true  },
      { checkId: "pub-lobby.avatar",     label: "Avatar renders in seat",         blocking: true  },
      { checkId: "pub-lobby.playlist",   label: "Playlist Canister plays",        blocking: true  },
      { checkId: "pub-lobby.chat",       label: "Chat works",                     blocking: true  },
      { checkId: "pub-lobby.invite",     label: "Invite link generates",          blocking: false },
      { checkId: "pub-lobby.discoverable","label": "Appears in Live Lobby Wall",   blocking: true  },
    ]),
  },
  {
    pageId: "battle-room",
    route: "/battle/[id]",
    title: "Battle Room",
    roles: ["fan", "performer", "band", "admin"],
    status: "PENDING",
    lastCertifiedAt: null,
    lastCertifiedBy: null,
    checks: pending([
      { checkId: "battle.join",          label: "Join as audience",               blocking: true  },
      { checkId: "battle.vs-screen",     label: "VS screen renders",              blocking: true  },
      { checkId: "battle.vote",          label: "Vote registers",                 blocking: true  },
      { checkId: "battle.result",        label: "Result declared correctly",      blocking: true  },
      { checkId: "battle.chat",          label: "Live chat works",                blocking: true  },
      { checkId: "battle.reaction",      label: "Reaction bar works",             blocking: true  },
      { checkId: "battle.xp",            label: "XP awarded post-battle",         blocking: true  },
    ]),
  },
  {
    pageId: "cypher-room",
    route: "/cypher/[id]",
    title: "Cypher Room",
    roles: ["fan", "performer", "band", "admin"],
    status: "PENDING",
    lastCertifiedAt: null,
    lastCertifiedBy: null,
    checks: pending([
      { checkId: "cypher.join",          label: "Join as audience",               blocking: true  },
      { checkId: "cypher.circle",        label: "Cypher circle renders",          blocking: true  },
      { checkId: "cypher.rotate",        label: "Performer rotation works",       blocking: true  },
      { checkId: "cypher.chat",          label: "Live chat works",                blocking: true  },
      { checkId: "cypher.reaction",      label: "Reactions work",                 blocking: true  },
    ]),
  },

  // ── Messaging ──────────────────────────────────────────────────────────────
  {
    pageId: "messenger",
    route: "/messages",
    title: "Messenger",
    roles: ["fan", "performer", "band", "venue", "promoter", "sponsor", "advertiser", "writer", "moderator", "admin"],
    status: "PENDING",
    lastCertifiedAt: null,
    lastCertifiedBy: null,
    checks: pending([
      { checkId: "msg.load",              label: "Inbox loads",                    blocking: true  },
      { checkId: "msg.thread-open",       label: "Thread opens",                   blocking: true  },
      { checkId: "msg.send",              label: "Send message",                   blocking: true  },
      { checkId: "msg.receive",           label: "Receive message",                blocking: true  },
      { checkId: "msg.read-status",       label: "Read status updates",            blocking: false },
      { checkId: "msg.attachment",        label: "Attachment send",                blocking: false },
      { checkId: "msg.block",             label: "Block user",                     blocking: true  },
      { checkId: "msg.report",            label: "Report message",                 blocking: true  },
      { checkId: "msg.new-thread",        label: "Start new conversation",         blocking: true  },
    ]),
  },

  // ── Commerce ───────────────────────────────────────────────────────────────
  {
    pageId: "subscription",
    route: "/account/subscription",
    title: "Subscription / Billing",
    roles: ["fan", "performer", "band", "venue", "promoter", "sponsor", "advertiser", "writer"],
    status: "PENDING",
    lastCertifiedAt: null,
    lastCertifiedBy: null,
    checks: pending([
      { checkId: "sub.load",              label: "Page loads with current tier",   blocking: true  },
      { checkId: "sub.upgrade",           label: "Upgrade → Stripe checkout",      blocking: true  },
      { checkId: "sub.downgrade",         label: "Downgrade flow",                 blocking: true  },
      { checkId: "sub.cancel",            label: "Cancel → confirmation",          blocking: true  },
      { checkId: "sub.reactivate",        label: "Reactivate after cancel",        blocking: true  },
      { checkId: "sub.portal",            label: "Stripe portal link works",       blocking: true  },
      { checkId: "sub.real-tier",         label: "Tier from DB not hardcoded",     blocking: true  },
    ]),
  },
  {
    pageId: "ticket-wallet",
    route: "/fan/[slug]/tickets",
    title: "Fan Ticket Wallet",
    roles: ["fan"],
    status: "PENDING",
    lastCertifiedAt: null,
    lastCertifiedBy: null,
    checks: pending([
      { checkId: "tw.load",              label: "Ticket wallet loads",            blocking: true  },
      { checkId: "tw.ticket-visible",    label: "Purchased tickets visible",      blocking: true  },
      { checkId: "tw.ticket-id",         label: "Ticket ID + Order ID visible",   blocking: true  },
      { checkId: "tw.qr",               label: "QR code renders",                blocking: false },
      { checkId: "tw.empty-state",       label: "Empty state when no tickets",    blocking: true  },
      { checkId: "tw.no-fake-data",      label: "No mock tickets rendered",       blocking: true  },
    ]),
  },
  {
    pageId: "advertiser-dashboard",
    route: "/advertiser",
    title: "Advertiser Dashboard",
    roles: ["advertiser", "admin"],
    status: "PENDING",
    lastCertifiedAt: null,
    lastCertifiedBy: null,
    checks: pending([
      { checkId: "adv.load",             label: "Dashboard loads",                blocking: true  },
      { checkId: "adv.buy-ad",           label: "Buy ad navigates to checkout",   blocking: true  },
      { checkId: "adv.impressions",      label: "Impression count real",          blocking: true  },
      { checkId: "adv.clicks",           label: "Click count real",               blocking: true  },
      { checkId: "adv.ctr",             label: "CTR calculated correctly",       blocking: true  },
      { checkId: "adv.daily-report",     label: "Daily report generates",         blocking: true  },
      { checkId: "adv.geo",             label: "Geo breakdown real",             blocking: false },
      { checkId: "adv.device",          label: "Device breakdown real",          blocking: false },
      { checkId: "adv.time-of-day",     label: "Time-of-day breakdown real",     blocking: false },
      { checkId: "adv.no-fake-stats",   label: "No fabricated impression counts", blocking: true  },
    ]),
  },
  {
    pageId: "sponsor-dashboard",
    route: "/sponsor",
    title: "Sponsor Dashboard",
    roles: ["sponsor", "admin"],
    status: "PENDING",
    lastCertifiedAt: null,
    lastCertifiedBy: null,
    checks: pending([
      { checkId: "spon.load",            label: "Dashboard loads",                blocking: true  },
      { checkId: "spon.placements",      label: "Active placements listed",       blocking: true  },
      { checkId: "spon.impressions",     label: "Impression count real",          blocking: true  },
      { checkId: "spon.ctr",            label: "CTR real",                       blocking: true  },
      { checkId: "spon.expiry",         label: "Campaign expiry shown",          blocking: true  },
      { checkId: "spon.renewal",        label: "Renewal CTA works",              blocking: false },
    ]),
  },

  // ── Media / Creator ────────────────────────────────────────────────────────
  {
    pageId: "avatar-builder",
    route: "/avatar-builder",
    title: "Avatar Builder",
    roles: ["fan", "performer", "band", "venue", "promoter", "sponsor", "advertiser", "writer", "moderator", "admin"],
    status: "PENDING",
    lastCertifiedAt: null,
    lastCertifiedBy: null,
    checks: pending([
      { checkId: "av.load",              label: "Builder loads",                  blocking: true  },
      { checkId: "av.customize",         label: "Customization renders",          blocking: true  },
      { checkId: "av.save",             label: "Save updates profile avatar",    blocking: true  },
    ]),
  },
  {
    pageId: "memory-wall",
    route: "/fan/[slug]/memory",
    title: "Memory Wall",
    roles: ["fan", "performer", "band", "admin"],
    status: "PENDING",
    lastCertifiedAt: null,
    lastCertifiedBy: null,
    checks: pending([
      { checkId: "mw.load",              label: "Memory wall loads",              blocking: true  },
      { checkId: "mw.clips",            label: "Clips from real uploads",        blocking: true  },
      { checkId: "mw.save",             label: "Save new clip",                  blocking: true  },
      { checkId: "mw.empty-state",       label: "Honest empty state",             blocking: true  },
      { checkId: "mw.no-fake-clips",     label: "No mock/demo clips",             blocking: true  },
    ]),
  },
  {
    pageId: "music-studio",
    route: "/performer/studio",
    title: "Music Studio",
    roles: ["performer", "band", "admin"],
    status: "PENDING",
    lastCertifiedAt: null,
    lastCertifiedBy: null,
    checks: pending([
      { checkId: "studio.load",          label: "Studio loads",                   blocking: true  },
      { checkId: "studio.upload",        label: "Song upload completes",          blocking: true  },
      { checkId: "studio.playlist",      label: "Upload → personal playlist",     blocking: true  },
      { checkId: "studio.submit",        label: "Submit to editorial queue",      blocking: true  },
      { checkId: "studio.status",        label: "Submission status dashboard",    blocking: true  },
    ]),
  },

  // ── Admin ──────────────────────────────────────────────────────────────────
  {
    pageId: "admin-observatory",
    route: "/admin/observatory",
    title: "Admin Observatory",
    roles: ["moderator", "admin"],
    status: "PENDING",
    lastCertifiedAt: null,
    lastCertifiedBy: null,
    checks: pending([
      { checkId: "obs.load",             label: "Observatory loads",              blocking: true  },
      { checkId: "obs.revenue",          label: "Revenue panel shows real data",  blocking: true  },
      { checkId: "obs.discovery",        label: "Discovery health panel",         blocking: true  },
      { checkId: "obs.fleet",           label: "QA Fleet panel renders",         blocking: true  },
      { checkId: "obs.launch-status",    label: "Launch status card real",        blocking: true  },
      { checkId: "obs.alerts",           label: "Alert stream visible",           blocking: false },
      { checkId: "obs.no-fake-revenue",  label: "Revenue from real DB, never mock", blocking: true  },
    ]),
  },
  {
    pageId: "admin-sponsors",
    route: "/admin/sponsors",
    title: "Admin — Sponsors",
    roles: ["admin"],
    status: "PENDING",
    lastCertifiedAt: null,
    lastCertifiedBy: null,
    checks: pending([
      { checkId: "adm-spon.load",        label: "Sponsor list loads",             blocking: true  },
      { checkId: "adm-spon.approve",     label: "Approve sponsor works",          blocking: true  },
      { checkId: "adm-spon.revenue",     label: "Revenue shown from DB",          blocking: true  },
    ]),
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Runtime mutators — called by the Playwright runner via PATCH
// /api/admin/certification-fleet (pages sub-path)
// ─────────────────────────────────────────────────────────────────────────────

const _pageResults = new Map<string, Partial<PageCertRecord>>();

export function recordPageResult(pageId: string, patch: {
  status: PageCertStatus;
  lastCertifiedAt: string;
  lastCertifiedBy: string;
  checkResults?: Record<string, { status: PageCertStatus; durationMs: number }>;
}): void {
  _pageResults.set(pageId, patch);
}

export function getPageCertificationSummary(): {
  total: number;
  pass: number;
  fail: number;
  pending: number;
  certifiedRoutes: string[];
  uncertifiedRoutes: string[];
} {
  const total = PAGE_CERTIFICATION_REGISTRY.length;
  const results = _pageResults;

  const pass = PAGE_CERTIFICATION_REGISTRY.filter((p) => results.get(p.pageId)?.status === "PASS").length;
  const fail = PAGE_CERTIFICATION_REGISTRY.filter((p) => results.get(p.pageId)?.status === "FAIL").length;
  const pending = total - pass - fail;

  return {
    total,
    pass,
    fail,
    pending,
    certifiedRoutes: PAGE_CERTIFICATION_REGISTRY.filter((p) => results.get(p.pageId)?.status === "PASS").map((p) => p.route),
    uncertifiedRoutes: PAGE_CERTIFICATION_REGISTRY.filter((p) => (results.get(p.pageId)?.status ?? "PENDING") !== "PASS").map((p) => p.route),
  };
}

export function getPagesByRole(role: CertificationRole): PageCertRecord[] {
  return PAGE_CERTIFICATION_REGISTRY.filter((p) => p.roles.includes(role));
}

export function getTotalWorkflowCheckCount(): number {
  return PAGE_CERTIFICATION_REGISTRY.reduce((sum, p) => sum + p.checks.length, 0);
}
