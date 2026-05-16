import { getRouteNode, type TmiRoleAccess } from "./tmiRouteGraph";

export type RouteGuardResult = {
  allowed: boolean;
  reason?: string;
  fallback: string;
};

export function guardRouteAccess(path: string, role: TmiRoleAccess): RouteGuardResult {
  const node = getRouteNode(path);
  if (!node) {
    return { allowed: false, reason: "unknown-route", fallback: "/home/1" };
  }

  if (!node.roleAccess.includes(role)) {
    return { allowed: false, reason: "role-not-allowed", fallback: node.fallback };
  }

  return { allowed: true, fallback: node.fallback };
}
