export type TmiBillboardRouteState = "live" | "simulated" | "locked";

export type TmiBillboardRouteRecord = {
  id: string;
  title: string;
  route: string;
  backRoute: string;
  state: TmiBillboardRouteState;
  category:
    | "lobby"
    | "game"
    | "cypher"
    | "watch-party"
    | "venue"
    | "artist"
    | "performer"
    | "sponsor"
    | "advertiser"
    | "booking"
    | "tickets"
    | "magazine"
    | "rewards"
    | "contest"
    | "admin";
  lockReason?: string;
};

const BILLBOARD_ROUTE_MAP = new Map<string, TmiBillboardRouteRecord>();

export function registerBillboardRoute(record: TmiBillboardRouteRecord): void {
  BILLBOARD_ROUTE_MAP.set(record.id, record);
}

export function listBillboardRoutes(): TmiBillboardRouteRecord[] {
  return [...BILLBOARD_ROUTE_MAP.values()];
}
