import type { Role } from "@prisma/client";

export type QATier = "FREE" | "PRO" | "RUBY" | "SILVER" | "GOLD" | "PLATINUM" | "DIAMOND";

export type CheckCategory =
  | "auth"
  | "profile"
  | "discovery"
  | "live"
  | "competitive"
  | "social"
  | "media"
  | "commerce"
  | "email"
  | "admin"
  | "moderation"
  | "security"
  | "policy";

export type CertificationRole =
  | "fan"
  | "performer"
  | "band"
  | "venue"
  | "promoter"
  | "advertiser"
  | "sponsor"
  | "writer"
  | "moderator"
  | "staff"
  | "mc"
  | "big-ace"
  | "admin"
  | "super-admin"
  | "ai-bot";

export type CertificationCheck = {
  id: string;
  label: string;
  category: CheckCategory;
  blocking: boolean;
};

export type CrossDeviceTarget =
  | "chrome-desktop"
  | "firefox-desktop"
  | "edge-desktop"
  | "safari-desktop"
  | "chrome-android"
  | "safari-ios"
  | "tablet"
  | "pwa";

export type FleetRunStatus = "PENDING" | "RUNNING" | "PASS" | "FAIL" | "SKIPPED";

export type FleetRunResult = {
  accountSlug: string;
  status: FleetRunStatus;
  lastRunAt: string | null;
  failedCheck: string | null;
  durationMs: number | null;
  deviceTarget?: CrossDeviceTarget;
  pagesVisited?: number;
  buttonsTested?: number;
  apiCallsMade?: number;
  emailsVerified?: number;
  purchases?: number;
  networkFailures?: number;
  consoleErrors?: number;
};

export type QAFleetAccount = {
  slug: string;
  email: string;
  displayName: string;
  role: Role;
  certRole: CertificationRole;
  tier: QATier;
  purpose: string;
  checks: CertificationCheck[];
  deviceTargets: CrossDeviceTarget[];
};

export function isQAAccount(email: string): boolean {
  return email.toLowerCase().endsWith("@themusiciansindex.test");
}

export const QA_EXCLUSION_FILTER = { isQA: false } as const;

const TIERS: QATier[] = ["FREE", "PRO", "RUBY", "SILVER", "GOLD", "PLATINUM", "DIAMOND"];

const ALL_DEVICES: CrossDeviceTarget[] = [
  "chrome-desktop",
  "firefox-desktop",
  "edge-desktop",
  "safari-desktop",
  "chrome-android",
  "safari-ios",
  "tablet",
  "pwa",
];

const CORE_DEVICES: CrossDeviceTarget[] = ["chrome-desktop", "chrome-android", "safari-ios"];

const DESKTOP_DEVICES: CrossDeviceTarget[] = ["chrome-desktop", "firefox-desktop", "edge-desktop"];

const AUTH_CHECKS: CertificationCheck[] = [
  { id: "auth.login", label: "Login with email + password", category: "auth", blocking: true },
  { id: "auth.logout", label: "Logout clears session", category: "auth", blocking: true },
  { id: "auth.session.refresh", label: "Session refresh persists auth", category: "auth", blocking: true },
  { id: "auth.password.reset", label: "Password reset flow", category: "auth", blocking: true },
];

const PROFILE_CHECKS: CertificationCheck[] = [
  { id: "profile.load", label: "Profile page loads", category: "profile", blocking: true },
  { id: "profile.avatar.upload", label: "Avatar upload", category: "media", blocking: true },
  { id: "profile.banner.upload", label: "Banner upload", category: "media", blocking: false },
  { id: "profile.bio.edit", label: "Bio edit/save", category: "profile", blocking: true },
  { id: "profile.public.view", label: "Public profile view", category: "profile", blocking: true },
];

const DISCOVERY_CHECKS: CertificationCheck[] = [
  { id: "discovery.home.1", label: "Home 1 loads", category: "discovery", blocking: true },
  { id: "discovery.home.2", label: "Home 2 loads", category: "discovery", blocking: true },
  { id: "discovery.home.3", label: "Home 3 loads", category: "discovery", blocking: true },
  { id: "discovery.home.4", label: "Home 4 loads", category: "discovery", blocking: true },
  { id: "discovery.home.5", label: "Home 5 loads", category: "discovery", blocking: true },
  { id: "discovery.magazine", label: "Magazine browse", category: "discovery", blocking: true },
  { id: "discovery.billboard", label: "Billboard browse", category: "discovery", blocking: true },
  { id: "discovery.live", label: "Live browse", category: "discovery", blocking: true },
  { id: "discovery.search", label: "Search returns results", category: "discovery", blocking: true },
];

const MESSAGING_CHECKS: CertificationCheck[] = [
  { id: "msg.send", label: "Send message", category: "social", blocking: true },
  { id: "msg.receive", label: "Receive message", category: "social", blocking: true },
  { id: "msg.read", label: "Read status", category: "social", blocking: false },
  { id: "msg.attachments", label: "Attachment send/receive", category: "social", blocking: false },
  { id: "msg.block", label: "Blocked user handling", category: "security", blocking: true },
  { id: "msg.report", label: "Report message", category: "moderation", blocking: true },
  { id: "notify.delivery", label: "Notification delivery", category: "social", blocking: true },
];

const LIVE_CHECKS: CertificationCheck[] = [
  { id: "live.camera", label: "Camera ready", category: "live", blocking: true },
  { id: "live.microphone", label: "Microphone ready", category: "live", blocking: true },
  { id: "live.go", label: "Go live", category: "live", blocking: true },
  { id: "live.end", label: "End live", category: "live", blocking: true },
  { id: "live.audience.join", label: "Audience join", category: "live", blocking: true },
  { id: "live.audience.leave", label: "Audience leave", category: "live", blocking: true },
  { id: "live.reconnect", label: "Stream reconnect", category: "live", blocking: true },
  { id: "live.chat", label: "Live chat", category: "live", blocking: true },
];

const COMPETITIVE_CHECKS: CertificationCheck[] = [
  { id: "comp.battle", label: "Battle flow", category: "competitive", blocking: true },
  { id: "comp.cypher", label: "Cypher flow", category: "competitive", blocking: true },
  { id: "comp.challenge", label: "Challenge flow", category: "competitive", blocking: true },
  { id: "comp.results", label: "Results/archive", category: "competitive", blocking: true },
];

const MEDIA_CHECKS: CertificationCheck[] = [
  { id: "media.image.upload", label: "Image upload", category: "media", blocking: true },
  { id: "media.image.resize", label: "Image resize", category: "media", blocking: false },
  { id: "media.image.crop", label: "Image crop", category: "media", blocking: false },
  { id: "media.video.upload", label: "Video upload", category: "media", blocking: true },
  { id: "media.video.encode", label: "Video encode", category: "media", blocking: true },
  { id: "media.video.stream", label: "Video stream", category: "media", blocking: true },
  { id: "media.audio.upload", label: "Audio upload", category: "media", blocking: true },
  { id: "media.audio.playback", label: "Audio playback", category: "media", blocking: true },
  { id: "media.playlist", label: "Playlist queue", category: "media", blocking: true },
];

const COMMERCE_CORE_CHECKS: CertificationCheck[] = [
  { id: "commerce.membership.buy", label: "Membership purchase", category: "commerce", blocking: true },
  { id: "commerce.membership.upgrade", label: "Membership upgrade", category: "commerce", blocking: true },
  { id: "commerce.membership.downgrade", label: "Membership downgrade", category: "commerce", blocking: true },
  { id: "commerce.membership.cancel", label: "Membership cancel", category: "commerce", blocking: true },
  { id: "commerce.membership.reactivate", label: "Membership reactivate", category: "commerce", blocking: true },
  { id: "commerce.ticket.buy", label: "Ticket purchase", category: "commerce", blocking: true },
  { id: "commerce.ticket.receive", label: "Ticket issued", category: "commerce", blocking: true },
  { id: "commerce.ticket.download", label: "Ticket download", category: "commerce", blocking: false },
  { id: "commerce.tip", label: "Tip performer", category: "commerce", blocking: true },
  { id: "commerce.webhook.stripe", label: "Stripe webhook", category: "commerce", blocking: true },
  { id: "commerce.order.create", label: "Order creation", category: "commerce", blocking: true },
  { id: "commerce.refund", label: "Refund path", category: "commerce", blocking: true },
  { id: "commerce.idempotency", label: "Idempotency protection", category: "security", blocking: true },
];

const ADVERTISER_CHECKS: CertificationCheck[] = [
  { id: "advertiser.ad.purchase", label: "Ad purchased", category: "commerce", blocking: true },
  { id: "advertiser.ad.approval", label: "Ad approved", category: "admin", blocking: true },
  { id: "advertiser.ad.schedule", label: "Ad scheduled", category: "commerce", blocking: true },
  { id: "advertiser.impression", label: "Impression counted", category: "commerce", blocking: true },
  { id: "advertiser.click", label: "Click counted", category: "commerce", blocking: true },
  { id: "advertiser.conversion", label: "Conversion tracked", category: "commerce", blocking: false },
  { id: "advertiser.report.daily", label: "Daily report generated", category: "commerce", blocking: true },
  { id: "advertiser.report.weekly", label: "Weekly report generated", category: "commerce", blocking: false },
  { id: "advertiser.report.monthly", label: "Monthly report generated", category: "commerce", blocking: true },
];

const SPONSOR_CHECKS: CertificationCheck[] = [
  { id: "sponsor.banner.placement", label: "Banner placement", category: "commerce", blocking: true },
  { id: "sponsor.video.placement", label: "Video placement", category: "commerce", blocking: true },
  { id: "sponsor.home.placement", label: "Homepage placement", category: "commerce", blocking: true },
  { id: "sponsor.lobby.placement", label: "Lobby placement", category: "commerce", blocking: true },
  { id: "sponsor.battle.placement", label: "Battle placement", category: "commerce", blocking: false },
  { id: "sponsor.magazine.placement", label: "Magazine placement", category: "commerce", blocking: false },
  { id: "sponsor.impression", label: "Impression counting", category: "commerce", blocking: true },
  { id: "sponsor.click", label: "Click attribution", category: "commerce", blocking: true },
  { id: "sponsor.ctr", label: "CTR calculation", category: "commerce", blocking: true },
  { id: "sponsor.expiry", label: "Campaign expiration", category: "commerce", blocking: true },
  { id: "sponsor.renewal", label: "Renewal reminder", category: "email", blocking: true },
];

const EMAIL_CHECKS: CertificationCheck[] = [
  { id: "email.welcome", label: "Welcome email", category: "email", blocking: true },
  { id: "email.verify", label: "Verification email", category: "email", blocking: true },
  { id: "email.password.reset", label: "Password reset email", category: "email", blocking: true },
  { id: "email.membership.receipt", label: "Membership receipt", category: "email", blocking: true },
  { id: "email.ticket.receipt", label: "Ticket receipt", category: "email", blocking: true },
  { id: "email.sponsor.receipt", label: "Sponsor receipt", category: "email", blocking: false },
  { id: "email.advertiser.receipt", label: "Advertiser receipt", category: "email", blocking: false },
  { id: "email.cancel.confirm", label: "Cancellation confirmation", category: "email", blocking: true },
  { id: "email.refund.confirm", label: "Refund confirmation", category: "email", blocking: true },
  { id: "email.links", label: "Email links valid", category: "email", blocking: true },
  { id: "email.branding", label: "Email branding", category: "policy", blocking: false },
  { id: "email.accessibility", label: "Email accessibility", category: "policy", blocking: true },
  { id: "email.legal.footer", label: "Email legal footer", category: "policy", blocking: true },
  { id: "email.personalization", label: "Email personalization", category: "email", blocking: false },
];

const ADMIN_CHECKS: CertificationCheck[] = [
  { id: "admin.observatory", label: "Observatory mission control", category: "admin", blocking: true },
  { id: "admin.launch.status", label: "Launch status card + API", category: "admin", blocking: true },
  { id: "admin.revenue.health", label: "Revenue health panel", category: "admin", blocking: true },
  { id: "admin.discovery.health", label: "Discovery health panel", category: "admin", blocking: true },
  { id: "admin.bot.population", label: "Bot population panel", category: "admin", blocking: false },
  { id: "admin.alerts", label: "Alert stream", category: "admin", blocking: false },
];

const MODERATION_CHECKS: CertificationCheck[] = [
  { id: "moderation.report.review", label: "Review report", category: "moderation", blocking: true },
  { id: "moderation.content.action", label: "Moderation action", category: "moderation", blocking: true },
  { id: "moderation.user.warn", label: "Warn user", category: "moderation", blocking: false },
];

const POLICY_CHECKS: CertificationCheck[] = [
  { id: "policy.no.fake.data", label: "No fake data compliance", category: "policy", blocking: true },
  { id: "policy.route.integrity", label: "Route integrity", category: "policy", blocking: true },
  { id: "policy.bot.transparency", label: "Bot transparency", category: "policy", blocking: true },
];

const STAFF_CHECKS: CertificationCheck[] = [
  { id: "staff.content.review", label: "Review flagged content", category: "moderation", blocking: true },
  { id: "staff.user.lookup", label: "Look up user account", category: "admin", blocking: true },
  { id: "staff.ticket.resolve", label: "Resolve support ticket", category: "admin", blocking: true },
  { id: "staff.event.monitor", label: "Monitor live event", category: "live", blocking: true },
  { id: "staff.report.action", label: "Act on abuse report", category: "moderation", blocking: true },
  { id: "staff.announcement", label: "Post platform announcement", category: "admin", blocking: false },
  { id: "staff.ban.user", label: "Issue temporary ban", category: "moderation", blocking: true },
];

const MC_CHECKS: CertificationCheck[] = [
  { id: "mc.ops.dashboard", label: "MC Operations dashboard loads", category: "admin", blocking: true },
  { id: "mc.broadcast.start", label: "Start broadcast session", category: "live", blocking: true },
  { id: "mc.broadcast.switch", label: "Switch broadcast camera", category: "live", blocking: true },
  { id: "mc.escalation.view", label: "View escalation queue", category: "admin", blocking: true },
  { id: "mc.escalation.resolve", label: "Resolve escalation", category: "admin", blocking: true },
  { id: "mc.sla.dashboard", label: "SLA tracking dashboard", category: "admin", blocking: true },
  { id: "mc.staff.roster", label: "View and manage staff roster", category: "admin", blocking: true },
  { id: "mc.incident.create", label: "Create incident report", category: "admin", blocking: true },
  { id: "mc.incident.close", label: "Close incident report", category: "admin", blocking: true },
  { id: "mc.queue.manage", label: "Manage ops queue", category: "admin", blocking: true },
  { id: "mc.certification.view", label: "View certification status", category: "admin", blocking: false },
  { id: "mc.cert.sign-off", label: "MC sign-off on certification", category: "admin", blocking: true },
];

const BIG_ACE_CHECKS: CertificationCheck[] = [
  { id: "ace.exec.dashboard", label: "Executive dashboard loads", category: "admin", blocking: true },
  { id: "ace.company.health", label: "Company health panel", category: "admin", blocking: true },
  { id: "ace.revenue.gate", label: "Revenue gate status visible", category: "commerce", blocking: true },
  { id: "ace.deploy.gate", label: "Deploy gate status visible", category: "admin", blocking: true },
  { id: "ace.deploy.approve", label: "Approve deployment", category: "admin", blocking: true },
  { id: "ace.deploy.block", label: "Block deployment", category: "admin", blocking: true },
  { id: "ace.payout.approve", label: "Approve cash payout", category: "commerce", blocking: true },
  { id: "ace.payout.reject", label: "Reject cash payout", category: "commerce", blocking: true },
  { id: "ace.ai.oversight", label: "AI oversight panel", category: "admin", blocking: true },
  { id: "ace.acquisition.view", label: "Acquisition pipeline view", category: "admin", blocking: false },
  { id: "ace.governance.audit", label: "Cross-company governance audit", category: "admin", blocking: true },
  { id: "ace.security.summary", label: "Security sentinel summary", category: "security", blocking: true },
  { id: "ace.cert.final", label: "Final certification sign-off", category: "admin", blocking: true },
  { id: "ace.escalate.to.marcel", label: "Escalate to founder (Marcel)", category: "admin", blocking: true },
];

const BOT_CHECKS: CertificationCheck[] = [
  { id: "bot.audience.fill", label: "Bot audience fill", category: "live", blocking: true },
  { id: "bot.audience.yield", label: "Bot yield to human", category: "live", blocking: true },
  { id: "bot.host.announce", label: "Bot host announce", category: "competitive", blocking: true },
  { id: "bot.dj.announce", label: "Bot DJ announce", category: "live", blocking: false },
  { id: "bot.no.fake.data", label: "No fabricated data", category: "policy", blocking: true },
];

type RoleProfile = {
  certRole: CertificationRole;
  prismaRole: Role;
  devices: CrossDeviceTarget[];
  purpose: string;
  checks: CertificationCheck[];
};

const ROLE_PROFILES: RoleProfile[] = [
  {
    certRole: "fan",
    prismaRole: "FAN",
    devices: ALL_DEVICES,
    purpose: "Fan workflows and commerce behavior",
    checks: [...AUTH_CHECKS, ...PROFILE_CHECKS, ...DISCOVERY_CHECKS, ...MESSAGING_CHECKS, ...LIVE_CHECKS, ...MEDIA_CHECKS, ...COMMERCE_CORE_CHECKS, ...EMAIL_CHECKS],
  },
  {
    certRole: "performer",
    prismaRole: "PERFORMER",
    devices: CORE_DEVICES,
    purpose: "Performer live, media, and competitive workflows",
    checks: [...AUTH_CHECKS, ...PROFILE_CHECKS, ...DISCOVERY_CHECKS, ...MESSAGING_CHECKS, ...LIVE_CHECKS, ...MEDIA_CHECKS, ...COMMERCE_CORE_CHECKS, ...COMPETITIVE_CHECKS, ...EMAIL_CHECKS],
  },
  {
    certRole: "band",
    prismaRole: "PERFORMER",
    devices: CORE_DEVICES,
    purpose: "Band workflows across live and catalog",
    checks: [...AUTH_CHECKS, ...PROFILE_CHECKS, ...DISCOVERY_CHECKS, ...MESSAGING_CHECKS, ...LIVE_CHECKS, ...MEDIA_CHECKS, ...COMMERCE_CORE_CHECKS, ...COMPETITIVE_CHECKS, ...EMAIL_CHECKS],
  },
  {
    certRole: "venue",
    prismaRole: "VENUE",
    devices: CORE_DEVICES,
    purpose: "Venue event and ticket operations",
    checks: [...AUTH_CHECKS, ...PROFILE_CHECKS, ...DISCOVERY_CHECKS, ...COMMERCE_CORE_CHECKS, ...EMAIL_CHECKS],
  },
  {
    certRole: "promoter",
    prismaRole: "PROMOTER",
    devices: CORE_DEVICES,
    purpose: "Promoter event and commerce operations",
    checks: [...AUTH_CHECKS, ...PROFILE_CHECKS, ...DISCOVERY_CHECKS, ...COMMERCE_CORE_CHECKS, ...EMAIL_CHECKS],
  },
  {
    certRole: "advertiser",
    prismaRole: "ADVERTISER",
    devices: DESKTOP_DEVICES,
    purpose: "Advertiser ad lifecycle and reporting",
    checks: [...AUTH_CHECKS, ...PROFILE_CHECKS, ...ADVERTISER_CHECKS, ...EMAIL_CHECKS],
  },
  {
    certRole: "sponsor",
    prismaRole: "SPONSOR",
    devices: DESKTOP_DEVICES,
    purpose: "Sponsor placements and campaign health",
    checks: [...AUTH_CHECKS, ...PROFILE_CHECKS, ...SPONSOR_CHECKS, ...EMAIL_CHECKS],
  },
  {
    certRole: "writer",
    prismaRole: "WRITER",
    devices: DESKTOP_DEVICES,
    purpose: "Writer editorial publishing flows",
    checks: [...AUTH_CHECKS, ...PROFILE_CHECKS, ...DISCOVERY_CHECKS, ...EMAIL_CHECKS],
  },
  {
    certRole: "moderator",
    prismaRole: "STAFF",
    devices: DESKTOP_DEVICES,
    purpose: "Moderation and trust workflows",
    checks: [...AUTH_CHECKS, ...MODERATION_CHECKS, ...EMAIL_CHECKS],
  },
  {
    certRole: "staff",
    prismaRole: "STAFF",
    devices: DESKTOP_DEVICES,
    purpose: "Platform staff operations — content review, support, live event monitoring",
    checks: [...AUTH_CHECKS, ...PROFILE_CHECKS, ...STAFF_CHECKS, ...MODERATION_CHECKS, ...EMAIL_CHECKS],
  },
  {
    certRole: "mc",
    prismaRole: "ADMIN",
    devices: DESKTOP_DEVICES,
    purpose: "MC (Michael Charlie) operations, broadcast direction, escalation management, SLA tracking",
    checks: [...AUTH_CHECKS, ...ADMIN_CHECKS, ...MC_CHECKS, ...STAFF_CHECKS, ...MODERATION_CHECKS, ...EMAIL_CHECKS],
  },
  {
    certRole: "big-ace",
    prismaRole: "ADMIN",
    devices: DESKTOP_DEVICES,
    purpose: "Big Ace executive oversight — company health, deploy gate, revenue approval, AI governance",
    checks: [...AUTH_CHECKS, ...ADMIN_CHECKS, ...BIG_ACE_CHECKS, ...MC_CHECKS, ...COMMERCE_CORE_CHECKS, ...POLICY_CHECKS, ...EMAIL_CHECKS],
  },
  {
    certRole: "admin",
    prismaRole: "ADMIN",
    devices: DESKTOP_DEVICES,
    purpose: "Admin operations and controls",
    checks: [...AUTH_CHECKS, ...ADMIN_CHECKS, ...MODERATION_CHECKS, ...EMAIL_CHECKS],
  },
  {
    certRole: "super-admin",
    prismaRole: "ADMIN",
    devices: DESKTOP_DEVICES,
    purpose: "Super admin controls and observability",
    checks: [...AUTH_CHECKS, ...ADMIN_CHECKS, ...MODERATION_CHECKS, ...EMAIL_CHECKS],
  },
  {
    certRole: "ai-bot",
    prismaRole: "USER",
    devices: [],
    purpose: "Autonomous bot behavior certification",
    checks: [...AUTH_CHECKS, ...BOT_CHECKS, ...POLICY_CHECKS],
  },
];

function uniqueChecks(checks: CertificationCheck[]): CertificationCheck[] {
  const map = new Map<string, CertificationCheck>();
  for (const c of checks) map.set(c.id, c);
  return Array.from(map.values());
}

export const QA_FLEET: QAFleetAccount[] = ROLE_PROFILES.flatMap((profile) =>
  TIERS.map((tier) => {
    const slug = `qa-${profile.certRole}-${tier.toLowerCase()}`;
    return {
      slug,
      email: `${slug}@themusiciansindex.test`,
      displayName: `QA ${profile.certRole.toUpperCase()} ${tier}`,
      role: profile.prismaRole,
      certRole: profile.certRole,
      tier,
      purpose: `${profile.purpose} (${tier})`,
      checks: uniqueChecks([...profile.checks, ...POLICY_CHECKS]),
      deviceTargets: profile.devices,
    };
  }),
);

export const FLEET_STATS = {
  totalAccounts: QA_FLEET.length,
  totalChecks: QA_FLEET.reduce((sum, a) => sum + a.checks.length, 0),
  totalDeviceTargets: QA_FLEET.reduce((sum, a) => sum + a.deviceTargets.length, 0),
  blockingChecks: QA_FLEET.reduce((sum, a) => sum + a.checks.filter((c) => c.blocking).length, 0),
};

const _fleetResults = new Map<string, FleetRunResult>();

export function getFleetResults(): Map<string, FleetRunResult> {
  return _fleetResults;
}

export function recordFleetResult(result: FleetRunResult): void {
  _fleetResults.set(result.accountSlug, result);
}

type ScoreRow = {
  key: string;
  label: string;
  pass: number;
  fail: number;
  pending: number;
  score: number;
};

const CATEGORY_DEFS: Array<{ key: string; label: string; match: (check: CertificationCheck) => boolean; weight: number; required: boolean }> = [
  { key: "authentication", label: "Authentication", match: (c) => c.category === "auth", weight: 1.1, required: true },
  { key: "messaging", label: "Messaging", match: (c) => c.id.startsWith("msg."), weight: 1.0, required: false },
  { key: "commerce", label: "Commerce", match: (c) => c.category === "commerce", weight: 1.3, required: true },
  { key: "liveStreaming", label: "Live Streaming", match: (c) => c.category === "live", weight: 1.0, required: true },
  { key: "mediaUpload", label: "Media Upload", match: (c) => c.id.startsWith("media."), weight: 1.0, required: true },
  { key: "search", label: "Search", match: (c) => c.id.includes("search"), weight: 0.8, required: true },
  { key: "discovery", label: "Discovery", match: (c) => c.category === "discovery", weight: 1.0, required: true },
  { key: "notifications", label: "Notifications", match: (c) => c.id.includes("notify"), weight: 0.8, required: false },
  { key: "emails", label: "Emails", match: (c) => c.category === "email", weight: 1.0, required: true },
  { key: "payments", label: "Payments", match: (c) => c.id.includes("commerce.") || c.id.includes("advertiser") || c.id.includes("sponsor."), weight: 1.3, required: true },
  { key: "admin", label: "Admin", match: (c) => c.category === "admin", weight: 1.0, required: true },
  { key: "security", label: "Security", match: (c) => c.category === "security" || c.category === "moderation", weight: 1.1, required: true },
  { key: "policy", label: "Policy", match: (c) => c.category === "policy", weight: 1.1, required: true },
  { key: "mobile", label: "Mobile", match: (c) => c.id.startsWith("discovery.home") || c.id.startsWith("live."), weight: 0.8, required: false },
  { key: "mcOps", label: "MC Operations", match: (c) => c.id.startsWith("mc."), weight: 1.0, required: false },
  { key: "executiveGate", label: "Executive Gate", match: (c) => c.id.startsWith("ace."), weight: 1.2, required: true },
];

function statusForCheck(result: FleetRunResult | null): "PASS" | "FAIL" | "PENDING" {
  if (!result) return "PENDING";
  if (result.status === "PASS") return "PASS";
  if (result.status === "FAIL" || result.status === "SKIPPED") return "FAIL";
  return "PENDING";
}

function scoreForChecks(match: (check: CertificationCheck) => boolean): ScoreRow {
  let pass = 0;
  let fail = 0;
  let pending = 0;

  for (const account of QA_FLEET) {
    const result = _fleetResults.get(account.slug) ?? null;
    for (const check of account.checks.filter(match)) {
      const status = statusForCheck(result);
      if (status === "PASS") pass += 1;
      else if (status === "FAIL") {
        if (result?.failedCheck && result.failedCheck !== check.id) {
          pass += 1;
        } else {
          fail += 1;
        }
      } else pending += 1;
    }
  }

  const total = pass + fail + pending;
  const score = total > 0 ? Number(((pass / total) * 100).toFixed(1)) : 0;
  return { key: "", label: "", pass, fail, pending, score };
}

function computeCategoryScores(): ScoreRow[] {
  return CATEGORY_DEFS.map((d) => {
    const row = scoreForChecks(d.match);
    return { ...row, key: d.key, label: d.label };
  });
}

function computePlatformHealthScore(categories: ScoreRow[]): number {
  let weighted = 0;
  let weights = 0;
  for (const row of categories) {
    const def = CATEGORY_DEFS.find((d) => d.key === row.key);
    const w = def?.weight ?? 1;
    weighted += row.score * w;
    weights += w;
  }
  return Number((weights > 0 ? weighted / weights : 0).toFixed(1));
}

function computeRoleTierMatrix() {
  const rows: Array<{ role: CertificationRole; healthy: number; total: number; passRate: number }> = [];
  for (const profile of ROLE_PROFILES) {
    const roleAccounts = QA_FLEET.filter((a) => a.certRole === profile.certRole);
    const healthy = roleAccounts.filter((a) => (_fleetResults.get(a.slug)?.status ?? "PENDING") === "PASS").length;
    const total = roleAccounts.length;
    const passRate = Number((total > 0 ? (healthy / total) * 100 : 0).toFixed(1));
    rows.push({ role: profile.certRole, healthy, total, passRate });
  }
  return rows;
}

function computeReleaseGate(categories: ScoreRow[], platformHealthScore: number) {
  const revenueLike = categories.find((c) => c.key === "commerce")?.score ?? 0;
  const requiredViolations = CATEGORY_DEFS.filter((d) => d.required)
    .map((d) => categories.find((c) => c.key === d.key))
    .filter((c): c is ScoreRow => Boolean(c))
    .filter((c) => c.fail > 0 || c.pending > 0);

  const strictEvidencePass = requiredViolations.length === 0;
  const revenueCertification: "GREEN" | "HOLD" = revenueLike >= 99 && strictEvidencePass ? "GREEN" : "HOLD";

  let recommendation: "AUTO_DEPLOY" | "HUMAN_APPROVAL" | "BLOCK" = "BLOCK";
  if (strictEvidencePass && revenueCertification === "GREEN" && platformHealthScore >= 99) {
    recommendation = "AUTO_DEPLOY";
  } else if (strictEvidencePass && platformHealthScore >= 95) {
    recommendation = "HUMAN_APPROVAL";
  }

  return {
    strictEvidencePass,
    requiredFailuresOrSkips: requiredViolations.map((c) => c.label),
    revenueCertification,
    recommendation,
  };
}

export function getFleetSummary(): {
  total: number;
  pass: number;
  fail: number;
  pending: number;
  totalChecks: number;
  blockingChecks: number;
  totalDeviceTargets: number;
  pagesVisited: number;
  buttonsTested: number;
  apiCallsMade: number;
  emailsVerified: number;
  purchases: number;
  warnings: number;
  failures: number;
  categories: ScoreRow[];
  platformHealthScore: number;
  releaseGate: {
    strictEvidencePass: boolean;
    requiredFailuresOrSkips: string[];
    revenueCertification: "GREEN" | "HOLD";
    recommendation: "AUTO_DEPLOY" | "HUMAN_APPROVAL" | "BLOCK";
  };
  roleTierMatrix: Array<{ role: CertificationRole; healthy: number; total: number; passRate: number }>;
  lastRunAt: string | null;
} {
  const results = Array.from(_fleetResults.values());
  const pass = results.filter((r) => r.status === "PASS").length;
  const fail = results.filter((r) => r.status === "FAIL" || r.status === "SKIPPED").length;
  const pending = QA_FLEET.length - pass - fail;
  const lastRun = results.map((r) => r.lastRunAt).filter(Boolean).sort().pop() ?? null;
  const categories = computeCategoryScores();
  const platformHealthScore = computePlatformHealthScore(categories);

  const failures = results.reduce((sum, r) => sum + (r.networkFailures ?? 0) + (r.consoleErrors ?? 0), 0);
  const warnings = results.filter((r) => r.status === "RUNNING" || r.status === "PENDING").length;

  return {
    total: QA_FLEET.length,
    pass,
    fail,
    pending,
    totalChecks: FLEET_STATS.totalChecks,
    blockingChecks: FLEET_STATS.blockingChecks,
    totalDeviceTargets: FLEET_STATS.totalDeviceTargets,
    pagesVisited: results.reduce((s, r) => s + (r.pagesVisited ?? 0), 0),
    buttonsTested: results.reduce((s, r) => s + (r.buttonsTested ?? 0), 0),
    apiCallsMade: results.reduce((s, r) => s + (r.apiCallsMade ?? 0), 0),
    emailsVerified: results.reduce((s, r) => s + (r.emailsVerified ?? 0), 0),
    purchases: results.reduce((s, r) => s + (r.purchases ?? 0), 0),
    warnings,
    failures,
    categories,
    platformHealthScore,
    releaseGate: computeReleaseGate(categories, platformHealthScore),
    roleTierMatrix: computeRoleTierMatrix(),
    lastRunAt: lastRun,
  };
}

export function getFleetByCategory(): Array<{
  category: string;
  accounts: Array<QAFleetAccount & { result: FleetRunResult | null }>;
}> {
  const groups: Record<string, QAFleetAccount[]> = {};
  for (const account of QA_FLEET) {
    if (!groups[account.certRole]) groups[account.certRole] = [];
    groups[account.certRole].push(account);
  }
  return Object.entries(groups).map(([category, accounts]) => ({
    category,
    accounts: accounts.map((a) => ({
      ...a,
      result: _fleetResults.get(a.slug) ?? null,
    })),
  }));
}
