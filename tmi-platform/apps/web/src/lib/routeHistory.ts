const routeHistory: string[] = [];

export function pushRoute(route: string) {
  if (routeHistory[routeHistory.length - 1] === route) {
    return;
  }

  routeHistory.push(route);
  if (routeHistory.length > 64) {
    routeHistory.shift();
  }
}

export function getRouteHistory() {
  return [...routeHistory];
}

export function getPreviousRoute(fallback = "/") {
  if (routeHistory.length < 2) {
    return fallback;
  }

  return routeHistory[routeHistory.length - 2] ?? fallback;
}
