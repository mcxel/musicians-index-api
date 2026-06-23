export type DomainOwner =
  | 'Entertainment Domain'
  | 'Media Domain'
  | 'Ticketing Domain'
  | 'Avatar Domain'
  | 'Competition Domain'
  | 'Revenue Domain'
  | 'Operations Domain'
  | 'Developer Domain';

export type DomainRegistryEntry = {
  component: string;
  owner: DomainOwner;
  path: string;
};

export const TMI_DOMAIN_REGISTRY: DomainRegistryEntry[] = [
  {
    component: 'Home1CoverPage',
    owner: 'Entertainment Domain',
    path: 'apps/web/src/components/home/Home1CoverPage.tsx',
  },
  {
    component: 'Home 1-2 Billboard Universe',
    owner: 'Entertainment Domain',
    path: 'apps/web/src/app/home/1-2/page.tsx',
  },
  {
    component: 'MotionPosterPlayer',
    owner: 'Media Domain',
    path: 'apps/web/src/components/media/MotionPosterPlayer.tsx',
  },
  {
    component: 'Ticket Center API',
    owner: 'Ticketing Domain',
    path: 'apps/web/src/app/api/tickets/create/route.ts',
  },
  {
    component: 'AvatarLobbyCanvas',
    owner: 'Avatar Domain',
    path: 'apps/web/src/components/home/AvatarLobbyCanvas.tsx',
  },
  {
    component: 'Battle Reward Settlement Engine',
    owner: 'Competition Domain',
    path: 'apps/web/src/lib/battle/BattleRewardSettlementEngine.ts',
  },
  {
    component: 'Revenue First Rewards Governor',
    owner: 'Revenue Domain',
    path: 'apps/web/src/lib/revenue/RevenueFirstRewardsGovernor.ts',
  },
  {
    component: 'Canonical Population Registry',
    owner: 'Operations Domain',
    path: 'apps/web/src/lib/population/CanonicalPopulationRegistry.ts',
  },
  {
    component: 'Developer Operations HQ',
    owner: 'Developer Domain',
    path: 'apps/web/src/lib/ops/DeveloperOperationsHQ.ts',
  },
];
