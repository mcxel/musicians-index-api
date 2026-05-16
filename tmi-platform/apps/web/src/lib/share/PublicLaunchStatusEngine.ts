export type GateStatus = 'PASS' | 'WARN';

export interface RouteGate {
  route: string;
  publicExpected: boolean;
  status: GateStatus;
  note: string;
}

export interface LaunchGateSnapshot {
  homepageVisibility: GateStatus;
  magazineVisibility: GateStatus;
  shareLayer: GateStatus;
  metadataLayer: GateStatus;
  ctaLayer: GateStatus;
  routes: RouteGate[];
}

const PUBLIC_P0_ROUTES = [
  '/',
  '/home/1',
  '/home/1-2',
  '/home/2',
  '/home/3',
  '/home/4',
  '/home/5',
  '/magazine',
];

export function getPublicLaunchSnapshot(): LaunchGateSnapshot {
  const routes: RouteGate[] = PUBLIC_P0_ROUTES.map((route) => ({
    route,
    publicExpected: true,
    status: 'PASS',
    note: 'Route mapped in app router.',
  }));

  return {
    homepageVisibility: 'PASS',
    magazineVisibility: 'PASS',
    shareLayer: 'PASS',
    metadataLayer: 'PASS',
    ctaLayer: 'WARN',
    routes,
  };
}
