import { getRouteNode } from "./tmiRouteGraph";

export function resolveBackRoute(currentPath: string, preferredPreviousPath?: string): string {
  const node = getRouteNode(currentPath);
  if (!node) return "/home/1";

  if (preferredPreviousPath && node.back.includes(preferredPreviousPath)) {
    return preferredPreviousPath;
  }

  if (node.back.length > 0) {
    return node.back[0];
  }

  return node.fallback;
}
