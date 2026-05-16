export interface ReturnPath {
  fromRoute: string;
  toRoute: string;
  label: string;
  preserveQuery?: boolean;
}

const RETURN_MAP: Record<string, ReturnPath> = {
  "/song-battle/live":  { fromRoute: "/song-battle/live",  toRoute: "/song-battle",     label: "Back to Battle Arena" },
  "/nft-lab/mint":      { fromRoute: "/nft-lab/mint",      toRoute: "/nft-lab",          label: "Back to NFT Lab" },
  "/nft-lab/publish":   { fromRoute: "/nft-lab/publish",   toRoute: "/nft-lab/my-nfts",  label: "Back to My NFTs" },
  "/camera":            { fromRoute: "/camera",             toRoute: "/performers/dashboard", label: "Back to Dashboard" },
  "/subscriptions":     { fromRoute: "/subscriptions",     toRoute: "/",                 label: "Back to Home" },
  "/onboarding/artist": { fromRoute: "/onboarding/artist", toRoute: "/artists/dashboard",label: "To Artist Hub" },
  "/onboarding/fan":    { fromRoute: "/onboarding/fan",    toRoute: "/fan/dashboard",    label: "To Fan Hub" },
  "/leaderboard":       { fromRoute: "/leaderboard",       toRoute: "/",                 label: "Back to Home" },
  "/writers/submit":    { fromRoute: "/writers/submit",    toRoute: "/writers/dashboard",label: "Back to Dashboard" },
  "/faq":               { fromRoute: "/faq",               toRoute: "/",                 label: "Back to Home" },
  "/seasons":           { fromRoute: "/seasons",           toRoute: "/subscriptions",    label: "View Plans" },
  "/achievements":      { fromRoute: "/achievements",      toRoute: "/",                 label: "Back to Home" },
};

const customPaths = new Map<string, ReturnPath>();

export function getReturnPath(currentRoute: string): ReturnPath | null {
  return customPaths.get(currentRoute) ?? RETURN_MAP[currentRoute] ?? null;
}

export function registerReturnPath(path: ReturnPath): void {
  customPaths.set(path.fromRoute, path);
}

export function buildReturnUrl(currentRoute: string, currentQuery?: string): string {
  const path = getReturnPath(currentRoute);
  if (!path) return "/";
  if (path.preserveQuery && currentQuery) return `${path.toRoute}?${currentQuery}`;
  return path.toRoute;
}

export function getReturnLabel(currentRoute: string): string {
  return getReturnPath(currentRoute)?.label ?? "Back";
}

export function getAllReturnPaths(): ReturnPath[] {
  const all = { ...RETURN_MAP };
  for (const [k, v] of customPaths) all[k] = v;
  return Object.values(all);
}
