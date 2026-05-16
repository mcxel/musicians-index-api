export type TmiOverlayStoreRoute = {
  id: string;
  route: string;
  backRoute: string;
  state: "active" | "locked";
  lockReason?: string;
};

const STORE_ROUTES: TmiOverlayStoreRoute[] = [
  { id: "store-home", route: "/store", backRoute: "/home/1", state: "active" },
  { id: "store-overlays", route: "/store/overlays", backRoute: "/store", state: "active" },
  { id: "store-inventory", route: "/store/inventory", backRoute: "/store", state: "active" },
  { id: "store-seasonal", route: "/store/seasonal", backRoute: "/store", state: "active" },
  { id: "store-rewards", route: "/store/rewards", backRoute: "/store", state: "locked", lockReason: "REWARDS_SETUP_PENDING" },
  { id: "store-creator", route: "/store/creator-overlays", backRoute: "/store", state: "active" }
];

export function listOverlayStoreRoutes(): TmiOverlayStoreRoute[] {
  return STORE_ROUTES;
}
