import type { HudModule } from "@tmi/hud-core";

const REGISTRY: Record<string, HudModule> = Object.create(null);

export function registerHudModule(mod: HudModule): void {
  REGISTRY[mod.id] = mod;
}

export function getHudModule(id: string): HudModule | undefined {
  return REGISTRY[id];
}

export function getHudRegistry() {
  return {
    list: () => Object.values(REGISTRY),
    get: (id: string) => REGISTRY[id]
  };
}
