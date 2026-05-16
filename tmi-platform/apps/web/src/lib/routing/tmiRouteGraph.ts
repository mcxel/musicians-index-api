export type TmiRoleAccess =
  | "fan"
  | "artist"
  | "performer"
  | "venue"
  | "sponsor"
  | "advertiser"
  | "admin"
  | "bot"
  | "guest";

export type TmiRouteNode = {
  path: string;
  forward: string[];
  back: string[];
  fallback: string;
  roleAccess: TmiRoleAccess[];
};

export const TMI_ROUTE_GRAPH: TmiRouteNode[] = [
  {
    path: "/home/1",
    forward: ["/home/1-2", "/home/2"],
    back: ["/home/5", "/home"],
    fallback: "/home",
    roleAccess: ["guest", "fan", "artist", "performer", "venue", "sponsor", "advertiser", "admin", "bot"],
  },
  {
    path: "/home/1-2",
    forward: ["/home/2", "/artists"],
    back: ["/home/1"],
    fallback: "/home/1",
    roleAccess: ["guest", "fan", "artist", "performer", "admin", "bot"],
  },
  {
    path: "/home/2",
    forward: ["/home/3", "/discover"],
    back: ["/home/1-2"],
    fallback: "/home/1-2",
    roleAccess: ["guest", "fan", "artist", "performer", "admin", "bot"],
  },
  {
    path: "/home/3",
    forward: ["/home/4", "/live"],
    back: ["/home/2"],
    fallback: "/home/2",
    roleAccess: ["guest", "fan", "performer", "admin", "bot"],
  },
  {
    path: "/home/4",
    forward: ["/home/5", "/admin/monitors"],
    back: ["/home/3"],
    fallback: "/home/3",
    roleAccess: ["admin", "performer", "venue", "sponsor", "advertiser", "bot"],
  },
  {
    path: "/home/5",
    forward: ["/home/1", "/sponsors"],
    back: ["/home/4"],
    fallback: "/home/4",
    roleAccess: ["guest", "fan", "artist", "performer", "venue", "sponsor", "advertiser", "admin", "bot"],
  },
  {
    path: "/admin/overseer",
    forward: ["/admin/launch", "/admin/monitors"],
    back: ["/home/4", "/admin"],
    fallback: "/admin",
    roleAccess: ["admin", "bot"],
  },
];

const graphMap = new Map(TMI_ROUTE_GRAPH.map((node) => [node.path, node]));

export function getRouteNode(path: string): TmiRouteNode | null {
  return graphMap.get(path) ?? null;
}
