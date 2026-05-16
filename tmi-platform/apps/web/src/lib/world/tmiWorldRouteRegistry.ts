export type TmiWorldRoute = {
  worldId: string;
  route: string;
  backRoute: string;
  entryPoint: string;
  exitPoint: string;
  locked?: boolean;
  lockReason?: string;
};

const ROUTES = new Map<string, TmiWorldRoute>();

export function registerWorldRoute(route: TmiWorldRoute): void {
  ROUTES.set(route.route, route);
}

export function listWorldRoutes(): TmiWorldRoute[] {
  return [...ROUTES.values()];
}

export function getWorldRoute(route: string): TmiWorldRoute | undefined {
  return ROUTES.get(route);
}
