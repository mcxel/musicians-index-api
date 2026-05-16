import { getRouteNode } from "./tmiRouteGraph";

export type TmiFallbackResolution = {
  target: string;
  banner: string;
};

export function resolveSafeFallback(path: string): TmiFallbackResolution {
  const node = getRouteNode(path);
  if (!node) {
    return {
      target: "/home/1",
      banner: "Continue setup: route is not registered yet.",
    };
  }

  return {
    target: node.fallback || "/home/1",
    banner: "Continue setup: returning to nearest active hub.",
  };
}
