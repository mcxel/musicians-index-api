import { listQueueRequests } from './AiVisualQueueEngine';
import { listDeployments } from './VisualDeploymentEngine';
import { listVisualDestinations } from './VisualDestinationMapEngine';

export type VisualDestinationOwnershipRecord = {
  destinationId: string;
  routePath: string;
  slotName: string;
  destinationOwner: string;
  routeOwner: string;
  assetFamily: string;
  pendingJobs: number;
  failedJobs: number;
  totalJobs: number;
  lastDeploymentAt: number | null;
  deploymentCount: number;
  status: 'healthy' | 'watch' | 'critical';
};

const ROUTE_OWNER_REGISTRY: Record<string, string> = {
  'artist-profile': 'artists',
  'performer-profile': 'performers',
  'fan-profile': 'fans',
  'venue-hero': 'venues',
  'venue-skin': 'venues',
  'ticket-visual': 'commerce',
  'article-hero': 'editorial',
  'event-poster': 'events',
  'battle-poster': 'battles',
  'homepage-hero': 'homepage',
  'magazine-cover': 'magazine',
  billboard: 'ads',
  'sponsor-ad': 'sponsors',
  'advertiser-ad': 'advertisers',
  'bot-avatar': 'bots',
  'host-portrait': 'hosts',
  'julius-portrait': 'hosts',
  'big-ace-portrait': 'admin',
};

function normalizeRoute(route: string): string {
  const value = route.trim();
  if (value.length > 1 && value.endsWith('/')) return value.slice(0, -1);
  return value;
}

function toRoutePatternRegex(routePattern: string): RegExp {
  const escaped = routePattern
    .replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    .replace(/\\\[[^/\]]+\\\]/g, '[^/]+');
  return new RegExp(`^${escaped}$`);
}

function isExactRouteMatch(route: string, routePattern: string): boolean {
  const normalizedRoute = normalizeRoute(route);
  const normalizedPattern = normalizeRoute(routePattern);
  return (
    normalizedRoute === normalizedPattern ||
    toRoutePatternRegex(normalizedPattern).test(normalizedRoute)
  );
}

function isDestinationQueueMatch(
  queueItem: { route: string; slotId?: string },
  destination: { routePath: string; slotName: string }
): boolean {
  const slotMatch = (queueItem.slotId ?? null) === destination.slotName;
  const routeMatch = isExactRouteMatch(queueItem.route, destination.routePath);
  return slotMatch || routeMatch;
}

function resolveRouteOwner(destinationId: string, assetFamily: string): string {
  return ROUTE_OWNER_REGISTRY[destinationId] ?? assetFamily;
}

function resolveStatus(pendingJobs: number, failedJobs: number): 'healthy' | 'watch' | 'critical' {
  if (failedJobs >= 2) return 'critical';
  if (failedJobs > 0 || pendingJobs > 4) return 'watch';
  return 'healthy';
}

export function listVisualDestinationOwnership(): VisualDestinationOwnershipRecord[] {
  const destinations = listVisualDestinations();
  const queue = listQueueRequests();
  const deployments = listDeployments();

  return destinations.map((destination) => {
    const matchingQueue = queue.filter((item) => isDestinationQueueMatch(item, destination));

    const matchingDeployments = deployments.filter(
      (deployment) => deployment.slotId === destination.slotName
    );

    const pendingJobs = matchingQueue.filter(
      (item) => item.status === 'queued' || item.status === 'generating'
    ).length;
    const failedJobs = matchingQueue.filter((item) => item.status === 'failed').length;

    const record: VisualDestinationOwnershipRecord = {
      destinationId: destination.destinationId,
      routePath: destination.routePath,
      slotName: destination.slotName,
      destinationOwner: destination.entityOwner,
      routeOwner: resolveRouteOwner(destination.destinationId, destination.assetFamily),
      assetFamily: destination.assetFamily,
      pendingJobs,
      failedJobs,
      totalJobs: matchingQueue.length,
      lastDeploymentAt: matchingDeployments[0]?.deployedAt ?? null,
      deploymentCount: matchingDeployments.length,
      status: resolveStatus(pendingJobs, failedJobs),
    };

    return record;
  });
}

export function getVisualDestinationOwnershipSummary(): {
  healthy: number;
  watch: number;
  critical: number;
  total: number;
} {
  const all = listVisualDestinationOwnership();
  return {
    healthy: all.filter((entry) => entry.status === 'healthy').length,
    watch: all.filter((entry) => entry.status === 'watch').length,
    critical: all.filter((entry) => entry.status === 'critical').length,
    total: all.length,
  };
}
