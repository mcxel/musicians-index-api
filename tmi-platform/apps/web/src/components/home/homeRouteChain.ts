export const HOME_ROUTE_CHAIN = [
  "/home/1",
  "/home/1-2",
  "/home/2",
  "/home/3",
  "/home/4",
  "/home/5",
] as const;

export function getHomeRouteIndex(pathname: string): number {
  if (pathname === "/home") return 0;
  return HOME_ROUTE_CHAIN.indexOf(pathname as (typeof HOME_ROUTE_CHAIN)[number]);
}
