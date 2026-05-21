// apps/web/src/config/module-registry.ts
// Every platform module with its status and owner surface.

export const MODULE_REGISTRY = [
  // Core
  { id: "auth",         label: "Auth",             status: "active",   surface: "/login, /register" },
  { id: "onboarding",   label: "Onboarding",       status: "active",   surface: "/onboarding/*" },
  { id: "dashboard",    label: "Dashboard",        status: "active",   surface: "/dashboard/*" },
  { id: "profile",      label: "Profile",          status: "active",   surface: "/profile/*, /artists/*, /fans/*" },
  { id: "article",      label: "Articles",         status: "active",   surface: "/articles/*, /editorial/*" },
  { id: "magazine",     label: "Magazine",         status: "active",   surface: "/magazine/*" },

  // Engagement
  { id: "stations",     label: "Stations",         status: "active",   surface: "/stations/*" },
  { id: "lobby",        label: "Lobby",            status: "active",   surface: "/lobby/*" },
  { id: "live",         label: "Live",             status: "active",   surface: "/live/*" },
  { id: "clips",        label: "Clips",            status: "active",   surface: "/clips/*" },
  { id: "contest",      label: "Contests",         status: "active",   surface: "/contest/*" },
  { id: "party",        label: "Party Lobby",      status: "active",   surface: "/party/*" },
  { id: "games",        label: "Games",            status: "active",   surface: "/games/*" },

  // Monetization
  { id: "sponsors",     label: "Sponsors",         status: "active",   surface: "/sponsors/*" },
  { id: "advertisers",  label: "Advertisers",      status: "active",   surface: "/advertisers/*" },
  { id: "ads",          label: "Ads",              status: "active",   surface: "/ads/*" },
  { id: "earnings",     label: "Earnings",         status: "active",   surface: "/earnings/*, /wallet" },
  { id: "payouts",      label: "Payouts",          status: "active",   surface: "/payouts/*" },

  // Future (feature-flagged OFF)
  { id: "store",        label: "Creator Store",    status: "planned",  surface: "/store/*, /shop/*" },
  { id: "checkout",     label: "Checkout",         status: "planned",  surface: "/checkout" },
  { id: "licensing",    label: "Licensing",        status: "planned",  surface: "/licenses/*" },
] as const;
