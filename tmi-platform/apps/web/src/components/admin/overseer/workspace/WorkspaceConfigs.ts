import type { WorkspaceDefinition } from "./WorkspaceSchema";

export const WORKSPACE_CONFIGS: Record<WorkspaceDefinition["key"], WorkspaceDefinition> = {
  marcel: {
    key: "marcel",
    label: "Marcel",
    title: "Marcel - Founder and CEO",
    subtitle: "Executive oversight, revenue authority, and cross-system command.",
    leftRail: [
      { id: "chain-command", title: "CHAIN COMMAND", widget: "chain-command", accent: "#AA2DFF" },
      { id: "money-billing", title: "MONEY & BILLING", widget: "money-billing", accent: "#FFD700", requiredPermission: "revenue.manage" },
      { id: "bot-roster", title: "BOT ROSTER & SUMMON", widget: "bot-roster", accent: "#FF2DAA", flex: 1, requiredPermission: "automation.manage" },
      { id: "unified-inbox", title: "UNIFIED INBOX", widget: "unified-inbox", accent: "#00FFFF" },
    ],
    center: [
      {
        id: "live-feed-router",
        title: "MEDIA MATRIX ENGINE · CENTER STAGE",
        widget: "media-matrix",
        accent: "#00FFFF",
        fixedHeight: 540,
        fullscreenKey: "tv",
      },
      {
        id: "feed-explorer",
        title: "LIVE FEED EXPLORER",
        widget: "feed-explorer",
        accent: "#00FFFF",
        flex: 1,
        fullscreenKey: "feed",
      },
    ],
    rightRail: [
      { id: "sentinel-wall", title: "SECURITY SENTINEL WALL", widget: "security-wall", accent: "#FF4444", requiredPermission: "security.manage" },
      { id: "account-linker", title: "ACCOUNT LINKER", widget: "account-linker", accent: "#AA2DFF" },
      { id: "stripe-observatory", title: "STRIPE WEBHOOK INTEGRITY", widget: "stripe-observatory", accent: "#00FFFF", flex: 1, requiredPermission: "revenue.manage" },
    ],
    bottom: [
      {
        id: "revenue-analytics",
        title: "ARTIST REVENUE & BUYOUTS",
        widget: "revenue-panel",
        accent: "#FFD700",
        fullscreenKey: "revenue",
        requiredPermission: "revenue.manage",
      },
      { id: "magazine-analytics", title: "MAGAZINE & INDEX ANALYTICS", widget: "magazine-analytics", accent: "#FF2DAA" },
    ],
    dockButtons: [
      { label: "Go Back", href: "/admin" },
      { label: "Legal Center", href: "/admin/overseer?workspace=legal" },
      { label: "Tax / Billing", href: "/admin/revenue" },
      { label: "Messages", href: "/admin/messages" },
      { label: "Users", href: "/admin/users" },
      { label: "Settings", href: "/admin/settings" },
      { label: "Power", href: "/" },
      { label: "Voice", href: "/admin/overseer#live-feed-router" },
      { label: "Audio", href: "/admin/overseer#live-feed-router" },
    ],
  },
  bigace: {
    key: "bigace",
    label: "Big Ace",
    title: "Big Ace - AI Umbrella CEO",
    subtitle: "Executive AI governance, automation mandate, and revenue integrity.",
    leftRail: [
      { id: "cross-business", title: "CROSS-BUSINESS COMMAND", widget: "chain-command", accent: "#AA2DFF" },
      { id: "automation-workforce", title: "AUTOMATION WORKFORCE", widget: "automation-workforce", accent: "#00FFFF", flex: 1, requiredPermission: "automation.manage" },
    ],
    center: [
      { id: "bigace-broadcast", title: "TV SCREEN ROUTER", widget: "broadcast-monitor", accent: "#00FFFF", fixedHeight: 340, fullscreenKey: "tv" },
      { id: "bigace-feed", title: "AI EVENT TIMELINE", widget: "feed-explorer", accent: "#00FFFF", flex: 1, fullscreenKey: "feed" },
    ],
    rightRail: [
      { id: "bigace-revenue", title: "PAYOUT AUTHORITY", widget: "revenue-panel", accent: "#FFD700", requiredPermission: "revenue.manage" },
      { id: "bigace-security", title: "SECURITY SENTINEL", widget: "security-wall", accent: "#FF4444", requiredPermission: "security.manage" },
    ],
    bottom: [
      { id: "bigace-runtime", title: "AI MANDATE BOARD", widget: "runtime-health", accent: "#AA2DFF" },
      { id: "bigace-stripe", title: "STRIPE OBSERVATORY", widget: "stripe-observatory", accent: "#00FFFF" },
    ],
  },
  jaypaul: {
    key: "jaypaul",
    label: "Jay Paul",
    title: "Jay Paul - Music and Studio Director",
    subtitle: "Beat systems, submissions, and studio-focused operations.",
    leftRail: [
      { id: "jay-studio", title: "MUSIC STUDIO", widget: "music-studio", accent: "#AA2DFF", requiredPermission: "music.manage" },
      { id: "jay-submissions", title: "SUBMISSION QUEUE", widget: "music-submissions", accent: "#FFD700", requiredPermission: "music.manage" },
    ],
    center: [
      { id: "jay-monitor", title: "LIVE AUDIO MONITOR", widget: "broadcast-monitor", accent: "#00FFFF", fixedHeight: 340, fullscreenKey: "tv" },
      { id: "jay-feed", title: "DISCOVERY FEED", widget: "feed-explorer", accent: "#00FFFF", flex: 1, fullscreenKey: "feed" },
    ],
    rightRail: [
      { id: "jay-inbox", title: "ARTIST INBOX", widget: "unified-inbox", accent: "#FF2DAA" },
      { id: "jay-accounts", title: "COLLAB ACCOUNT LINKER", widget: "account-linker", accent: "#AA2DFF" },
    ],
    bottom: [
      { id: "jay-revenue", title: "ROYALTY & REVENUE", widget: "revenue-panel", accent: "#FFD700", requiredPermission: "revenue.manage" },
      { id: "jay-mag", title: "MAGAZINE MUSIC ANALYTICS", widget: "magazine-analytics", accent: "#FF2DAA" },
    ],
  },
  justin: {
    key: "justin",
    label: "Justin",
    title: "Justin - Advisory Observer",
    subtitle: "Read-only reports, recommendations, and system observations.",
    leftRail: [
      { id: "justin-observe", title: "OBSERVER REPORTS", widget: "observer-reports", accent: "#00FFFF", requiredPermission: "read.only" },
    ],
    center: [
      { id: "justin-live", title: "LIVE PLATFORM MONITOR", widget: "broadcast-monitor", accent: "#00FFFF", fixedHeight: 340, fullscreenKey: "tv" },
      { id: "justin-feed", title: "SYSTEM FEED", widget: "feed-explorer", accent: "#00FFFF", flex: 1, fullscreenKey: "feed" },
    ],
    rightRail: [
      { id: "justin-security", title: "SECURITY READOUT", widget: "security-wall", accent: "#FF4444" },
      { id: "justin-revenue", title: "REVENUE SNAPSHOT", widget: "stripe-observatory", accent: "#FFD700" },
    ],
    bottom: [
      { id: "justin-runtime", title: "HEALTH MATRIX", widget: "runtime-health", accent: "#AA2DFF" },
      { id: "justin-magazine", title: "PUBLIC SIGNAL ANALYTICS", widget: "magazine-analytics", accent: "#FF2DAA" },
    ],
  },
  michaelcharlie: {
    key: "michaelcharlie",
    label: "Michael Charlie",
    title: "Michael Charlie - Operations CEO",
    subtitle: "Automation workforce, infra runtime, queues, deployment, and media pipeline.",
    leftRail: [
      { id: "mc-automation", title: "AUTOMATION WORKFORCE", widget: "automation-workforce", accent: "#00FFFF", requiredPermission: "automation.manage" },
      { id: "mc-queue", title: "QUEUE PROCESSING", widget: "queue-processing", accent: "#FFD700", requiredPermission: "queue.manage" },
    ],
    center: [
      { id: "mc-runtime", title: "RUNTIME HEALTH MATRIX", widget: "runtime-health", accent: "#00FFFF", fixedHeight: 340, fullscreenKey: "tv" },
      { id: "mc-feed", title: "OPERATIONS FEED", widget: "feed-explorer", accent: "#00FFFF", flex: 1, fullscreenKey: "feed" },
    ],
    rightRail: [
      { id: "mc-deploy", title: "DEPLOYMENT STATUS", widget: "deployment-status", accent: "#AA2DFF", requiredPermission: "deployment.manage" },
      { id: "mc-media", title: "MEDIA ENCODING PIPELINE", widget: "media-pipeline", accent: "#FF2DAA", requiredPermission: "media.manage" },
      { id: "mc-security", title: "INFRA SECURITY", widget: "security-wall", accent: "#FF4444", requiredPermission: "security.manage" },
    ],
    bottom: [
      { id: "mc-revenue", title: "INFRA COST & REVENUE", widget: "revenue-panel", accent: "#FFD700", requiredPermission: "revenue.manage" },
      { id: "mc-stripe", title: "WEBHOOK INTEGRITY", widget: "stripe-observatory", accent: "#00FFFF" },
    ],
  },
  legal: {
    key: "legal",
    label: "Legal",
    title: "Legal and Compliance Center",
    subtitle: "Policy, terms, privacy, DMCA, and legal support operations.",
    leftRail: [
      { id: "legal-disclaimer", title: "DISCLAIMER", widget: "legal-doc-disclaimer", accent: "#FFD700" },
      { id: "legal-promoter", title: "PROMOTER AGREEMENT", widget: "legal-doc-promoter", accent: "#AA2DFF" },
    ],
    center: [
      { id: "legal-dashboard", title: "LEGAL DASHBOARD", widget: "legal-overview", accent: "#00FFFF", fixedHeight: 300, fullscreenKey: "tv" },
      { id: "legal-community", title: "COMMUNITY RULES", widget: "legal-doc-community", accent: "#FF2DAA", flex: 1, fullscreenKey: "feed" },
    ],
    rightRail: [
      { id: "legal-contact", title: "CONTACT SUPPORT", widget: "legal-contact", accent: "#00FFFF" },
      { id: "legal-ticket", title: "TICKET POLICY", widget: "legal-doc-ticket", accent: "#FF4444" },
      { id: "legal-dmca", title: "DMCA", widget: "legal-doc-dmca", accent: "#FFD700", flex: 1 },
    ],
    bottom: [
      { id: "legal-terms", title: "TERMS", widget: "legal-doc-terms", accent: "#AA2DFF" },
      { id: "legal-privacy", title: "PRIVACY", widget: "legal-doc-privacy", accent: "#00FFFF" },
    ],
    dockButtons: [
      { label: "Overseer", href: "/admin/overseer?workspace=marcel" },
      { label: "Legal Site", href: "/legal" },
      { label: "Terms", href: "/legal/terms" },
      { label: "Privacy", href: "/legal/privacy" },
      { label: "DMCA", href: "/legal/dmca" },
      { label: "Contact", href: "/contact" },
      { label: "Support", href: "/support" },
      { label: "Users", href: "/admin/users" },
      { label: "Power", href: "/" },
    ],
  },
};
