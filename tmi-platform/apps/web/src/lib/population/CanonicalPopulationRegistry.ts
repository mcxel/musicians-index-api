export type CanonicalAccountType = 'REAL_USER' | 'SYSTEM_ACTOR' | 'OPERATIONS_AGENT' | 'SIMULATION_AGENT';

export type CanonicalVisibility = 'public' | 'internal';

export type CanonicalPermissions = {
  canJoinRooms: boolean;
  canTestNavigation: boolean;
  canTestMessaging: boolean;
  canAffectRankings: boolean;
  canAffectVotes: boolean;
  canAffectPayouts: boolean;
  canAffectTicketSales: boolean;
  canAffectViewCounts: boolean;
};

export type CanonicalPopulationAccount = {
  id: string;
  slug: string;
  name: string;
  avatarImage: string;
  roleTitle: string;
  accountType: CanonicalAccountType;
  behaviorProfile: string;
  profileRoute: string;
  dashboardRoute: string;
  activityType: string;
  activityPurpose: string;
  visibility: CanonicalVisibility;
  permissions: CanonicalPermissions;
};

const NON_ECONOMIC_PERMISSIONS: CanonicalPermissions = {
  canJoinRooms: true,
  canTestNavigation: true,
  canTestMessaging: true,
  canAffectRankings: false,
  canAffectVotes: false,
  canAffectPayouts: false,
  canAffectTicketSales: false,
  canAffectViewCounts: false,
};

export const CANONICAL_POPULATION_REGISTRY: CanonicalPopulationAccount[] = [
  {
    id: 'sys-actor-tmi-guide',
    slug: 'tmi-guide',
    name: 'TMI Guide',
    avatarImage: '/tmi-curated/host-main.png',
    roleTitle: 'Audience Host',
    accountType: 'SYSTEM_ACTOR',
    behaviorProfile: 'onboarding-assistant',
    profileRoute: '/bots?focus=tmi-host-main',
    dashboardRoute: '/admin/automation',
    activityType: 'navigation-assist',
    activityPurpose: 'Helps new users discover platform features and entry points.',
    visibility: 'public',
    permissions: NON_ECONOMIC_PERMISSIONS,
  },
  {
    id: 'sys-actor-discovery-guide',
    slug: 'discovery-guide',
    name: 'Discovery Guide',
    avatarImage: '/tmi-curated/host-2.png',
    roleTitle: 'Discovery Operations',
    accountType: 'SYSTEM_ACTOR',
    behaviorProfile: 'discovery-routing',
    profileRoute: '/bots?focus=tmi-host-two',
    dashboardRoute: '/admin/automation',
    activityType: 'discovery-routing',
    activityPurpose: 'Recommends performers, rooms, and category journeys.',
    visibility: 'public',
    permissions: NON_ECONOMIC_PERMISSIONS,
  },
  {
    id: 'sys-actor-venue-scout',
    slug: 'venue-scout',
    name: 'Venue Scout',
    avatarImage: '/assets/game show and venue skins/BobbleHead Avatar extras 3.webp',
    roleTitle: 'Venue Operations',
    accountType: 'SYSTEM_ACTOR',
    behaviorProfile: 'venue-coverage',
    profileRoute: '/bots?focus=tmi-onboard-guide',
    dashboardRoute: '/admin/automation',
    activityType: 'venue-discovery',
    activityPurpose: 'Surfaces underused venues and routes performers to audiences.',
    visibility: 'public',
    permissions: NON_ECONOMIC_PERMISSIONS,
  },
  {
    id: 'sys-actor-playlist-curator',
    slug: 'playlist-curator',
    name: 'Playlist Curator',
    avatarImage: '/assets/game show and venue skins/BobbleHead Avatar extras 2.webp',
    roleTitle: 'Music Operations',
    accountType: 'SYSTEM_ACTOR',
    behaviorProfile: 'playlist-ops',
    profileRoute: '/bots?focus=tmi-crowd-beta',
    dashboardRoute: '/admin/automation',
    activityType: 'playlist-testing',
    activityPurpose: 'Tracks active songs and recommends playlists for discovery.',
    visibility: 'public',
    permissions: NON_ECONOMIC_PERMISSIONS,
  },
  {
    id: 'sys-actor-battle-referee',
    slug: 'battle-referee',
    name: 'Battle Referee',
    avatarImage: '/tmi-curated/host-4.png',
    roleTitle: 'Competition Operations',
    accountType: 'SYSTEM_ACTOR',
    behaviorProfile: 'battle-governance',
    profileRoute: '/bots?focus=tmi-host-four',
    dashboardRoute: '/admin/automation',
    activityType: 'battle-governance',
    activityPurpose: 'Manages battle rounds, timers, and rule enforcement.',
    visibility: 'public',
    permissions: NON_ECONOMIC_PERMISSIONS,
  },
  {
    id: 'sys-actor-magazine-reporter',
    slug: 'magazine-reporter',
    name: 'Magazine Reporter',
    avatarImage: '/tmi-curated/host-main.png',
    roleTitle: 'Content Operations',
    accountType: 'SYSTEM_ACTOR',
    behaviorProfile: 'editorial-reporting',
    profileRoute: '/bots?focus=tmi-magazine-reporter',
    dashboardRoute: '/admin/automation',
    activityType: 'editorial-reporting',
    activityPurpose: 'Publishes event recaps and trending highlight stories.',
    visibility: 'public',
    permissions: NON_ECONOMIC_PERMISSIONS,
  },
  {
    id: 'sys-actor-talent-scout',
    slug: 'talent-scout',
    name: 'Talent Scout',
    avatarImage: '/tmi-curated/host-3.png',
    roleTitle: 'Growth Operations',
    accountType: 'SYSTEM_ACTOR',
    behaviorProfile: 'talent-indexing',
    profileRoute: '/bots?focus=tmi-host-three',
    dashboardRoute: '/admin/automation',
    activityType: 'talent-indexing',
    activityPurpose: 'Flags rising performers for feature and billboard consideration.',
    visibility: 'public',
    permissions: NON_ECONOMIC_PERMISSIONS,
  },
  {
    id: 'sys-actor-music-director',
    slug: 'music-director',
    name: 'Music Director',
    avatarImage: '/tmi-curated/host-2.png',
    roleTitle: 'Programming Operations',
    accountType: 'SYSTEM_ACTOR',
    behaviorProfile: 'music-programming',
    profileRoute: '/bots?focus=tmi-music-director',
    dashboardRoute: '/admin/automation',
    activityType: 'music-programming',
    activityPurpose: 'Coordinates programming across playlists and live showcases.',
    visibility: 'public',
    permissions: NON_ECONOMIC_PERMISSIONS,
  },
  {
    id: 'sys-actor-crowd-captain',
    slug: 'crowd-captain',
    name: 'Crowd Captain',
    avatarImage: '/assets/game show and venue skins/BobbleHead Avatar extras 1.webp',
    roleTitle: 'Community Operations',
    accountType: 'SYSTEM_ACTOR',
    behaviorProfile: 'audience-flow',
    profileRoute: '/bots?focus=tmi-crowd-alpha',
    dashboardRoute: '/admin/automation',
    activityType: 'audience-fill',
    activityPurpose: 'Supports audience flow and room-entry readiness checks.',
    visibility: 'public',
    permissions: NON_ECONOMIC_PERMISSIONS,
  },
  {
    id: 'ops-safety-integrity-officer',
    slug: 'safety-integrity-officer',
    name: 'Safety & Integrity Officer',
    avatarImage: '/tmi-curated/julius.png',
    roleTitle: 'Safety Operations',
    accountType: 'OPERATIONS_AGENT',
    behaviorProfile: 'safety-monitoring',
    profileRoute: '/bots?focus=tmi-host-julius',
    dashboardRoute: '/admin/automation',
    activityType: 'abuse-spam-monitoring',
    activityPurpose: 'Detects abuse, spam, and suspicious behavior for escalation.',
    visibility: 'internal',
    permissions: NON_ECONOMIC_PERMISSIONS,
  },
  {
    id: 'sim-test-audience-001',
    slug: 'test-audience-001',
    name: 'Test Audience Member',
    avatarImage: '/assets/game show and venue skins/BobbleHead Avatar extras 1.webp',
    roleTitle: 'Simulation Population',
    accountType: 'SIMULATION_AGENT',
    behaviorProfile: 'audience-simulation',
    profileRoute: '/bots?focus=sim-test-audience-001',
    dashboardRoute: '/admin/automation',
    activityType: 'environment-test',
    activityPurpose: 'Supports room, seat, and navigation test coverage during low traffic.',
    visibility: 'internal',
    permissions: NON_ECONOMIC_PERMISSIONS,
  },
];

export function getCanonicalPopulationByType(accountType: CanonicalAccountType): CanonicalPopulationAccount[] {
  return CANONICAL_POPULATION_REGISTRY.filter((entry) => entry.accountType === accountType);
}
