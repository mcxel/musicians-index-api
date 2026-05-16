import type { HudModule } from "@/stubs/tmi-hud-core";

const _registry: HudModule[] = [];

export function registerHudModule(mod: HudModule): void {
  if (!_registry.find(m => m.id === mod.id)) {
    _registry.push(mod);
  }
}

export function getHudRegistry() {
  return {
    list: (): HudModule[] => [..._registry],
    get: (id: string): HudModule | undefined => _registry.find(m => m.id === id),
    unregister: (id: string): void => {
      const idx = _registry.findIndex(m => m.id === id);
      if (idx >= 0) _registry.splice(idx, 1);
    },
  };
}
