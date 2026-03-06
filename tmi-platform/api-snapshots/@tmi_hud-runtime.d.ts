import type { HudModule } from "@tmi/hud-core";
export declare function registerHudModule(mod: HudModule): void;
export declare function getHudModule(id: string): HudModule | undefined;
export declare function getHudRegistry(): {
    list: () => HudModule[];
    get: (id: string) => HudModule;
};
//# sourceMappingURL=index.d.ts.map