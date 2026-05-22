/**
 * tmiForwardBackRouteMap.ts
 * Ensures every route can go forward AND back without dead ends.
 * If a route exists, it must be bidirectional.
 */

export interface RouteLink {
  from: string;
  to: string;
  type: 'chevron' | 'button' | 'link' | 'modal' | 'redirect';
  description?: string;
}

export interface RoutePair {
  forward: string;
  back: string;
  verified: boolean;
  warning?: string;
}

/**
 * FORWARD → BACK ROUTE PAIRINGS
 * Every route must be able to return cleanly.
 */
export const ROUTE_PAIRS: Record<string, RoutePair> = {
  '/': {
    forward: '/home/1',
    back: '/',
    verified: true,
  },
  '/home/1': {
    forward: '/home/2',
    back: '/',
    verified: true,
  },
  '/home/2': {
    forward: '/home/3',
    back: '/home/1',
    verified: true,
  },
  '/home/3': {
    forward: '/home/4',
    back: '/home/2',
    verified: true,
  },
  '/home/4': {
    forward: '/home/5',
    back: '/home/3',
    verified: true,
  },
  '/home/5': {
    forward: '/home/1', // Loop back to start
    back: '/home/4',
    verified: true,
  },
  '/magazine': {
    forward: '/magazine/current',
    back: '/',
    verified: false,
    warning: 'Magazine current issue needs dynamic routing',
  },
  '/venues': {
    forward: '/venues/featured',
    back: '/',
    verified: false,
  },
  '/live-world': {
    forward: '/live-world/featured',
    back: '/',
    verified: false,
  },
  '/profiles/[id]': {
    forward: '/profiles/[id]/articles',
    back: '/',
    verified: false,
    warning: 'Dynamic profile routing needs implementation',
  },
  '/admin/launch': {
    forward: '/admin/overseer',
    back: '/admin',
    verified: false,
  },
  '/admin/overseer': {
    forward: '/admin/launch',
    back: '/admin',
    verified: false,
  },
};

/**
 * DEAD ROUTE DETECTION
 * Routes that forward but have no valid back route.
 */
export const DEAD_ROUTE_CHECKLIST = [
  {
    route: '/home/1',
    hasForward: true,
    hasBack: true,
    status: 'OK',
  },
  // Will be populated by build audit script
];

/**
 * Helper: Get back route for a given forward route
 */
export function getBackRoute(route: string): string | null {
  if (route === '/') return null; // Root has no back
  const pair = ROUTE_PAIRS[route];
  return pair?.back || null;
}

/**
 * Helper: Verify bidirectional routing
 */
export function verifyBidirectionalRoute(route: string): {
  hasForward: boolean;
  hasBack: boolean;
  complete: boolean;
} {
  const pair = ROUTE_PAIRS[route];
  if (!pair) {
    return { hasForward: false, hasBack: false, complete: false };
  }
  return {
    hasForward: !!pair.forward,
    hasBack: !!pair.back,
    complete: !!pair.forward && !!pair.back,
  };
}

/**
 * CRITICAL CHECKPOINT: Belt Loop Navigation
 * Homepages 1-5 must loop seamlessly.
 */
export const HOMEPAGE_BELT_VERIFICATION = {
  '1': { next: '2', prev: null },
  '2': { next: '3', prev: '1' },
  '3': { next: '4', prev: '2' },
  '4': { next: '5', prev: '3' },
  '5': { next: '1', prev: '4' }, // Loops back!
};

/**
 * SECTION NAVIGATION CHAINS
 * Each section must have clear entry/exit points.
 */
export const SECTION_CHAINS = {
  homepages: {
    entry: '/home/1',
    exit: '/',
    internalChain: ['/home/1', '/home/2', '/home/3', '/home/4', '/home/5'],
  },
  magazine: {
    entry: '/magazine',
    exit: '/',
    internalChain: ['/magazine', '/magazine/current', '/magazine/articles/[id]'],
  },
  venues: {
    entry: '/venues',
    exit: '/',
    internalChain: ['/venues', '/venues/[id]', '/live-world/[venueId]'],
  },
  admin: {
    entry: '/admin',
    exit: '/',
    internalChain: ['/admin', '/admin/launch', '/admin/overseer'],
  },
};

/**
 * Launch Gate: Bidirectional Routing Check
 */
export function checkBidirectionalRouting(): {
  totalRoutes: number;
  completeRoutes: number;
  brokenRoutes: string[];
  readyToLaunch: boolean;
} {
  let completeRoutes = 0;
  const brokenRoutes: string[] = [];

  for (const [route, pair] of Object.entries(ROUTE_PAIRS)) {
    if (pair.verified && pair.forward && pair.back) {
      completeRoutes++;
    } else if (!pair.verified || !pair.forward || !pair.back) {
      brokenRoutes.push(route);
    }
  }

  return {
    totalRoutes: Object.keys(ROUTE_PAIRS).length,
    completeRoutes,
    brokenRoutes,
    readyToLaunch: brokenRoutes.length === 0,
  };
}
