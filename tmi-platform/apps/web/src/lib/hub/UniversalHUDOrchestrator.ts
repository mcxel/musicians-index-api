/**
 * UniversalHUDOrchestrator
 * Manages HUD module visibility and configuration per hub context.
 * Single authority for what appears in the HUD at any given moment.
 */

export type HubContext =
  | "fan-home"
  | "fan-hub"
  | "performer-hub"
  | "stage-live"
  | "stage-pre"
  | "stage-post"
  | "battle-active"
  | "cypher-active"
  | "lobby"
  | "venue"
  | "magazine"
  | "admin"
  | "onboarding";

export type HUDSlot =
  | "top-bar"
  | "bottom-bar"
  | "left-rail"
  | "right-rail"
  | "center-overlay"
  | "corner-tl"
  | "corner-tr"
  | "corner-bl"
  | "corner-br"
  | "floating";

export interface HUDModule {
  moduleId: string;
  slot: HUDSlot;
  component: string;
  priority: number;
  contexts: HubContext[];
  visible: boolean;
  locked: boolean;
  animateIn: "fade" | "slide-up" | "slide-down" | "expand" | "none";
  config: Record<string, unknown>;
}

export interface HUDLayout {
  context: HubContext;
  modules: HUDModule[];
  timestamp: number;
}

const moduleRegistry = new Map<string, HUDModule>();
const contextListeners = new Map<HubContext, Set<(layout: HUDLayout) => void>>();
let currentContext: HubContext = "fan-home";

const DEFAULT_MODULES: HUDModule[] = [
  { moduleId: "nav-bar",       slot: "top-bar",    component: "GlobalNavBar",       priority: 100, contexts: ["fan-home","fan-hub","performer-hub","lobby","venue","magazine"], visible: true,  locked: true,  animateIn: "none",       config: {} },
  { moduleId: "footer-hud",    slot: "bottom-bar",  component: "FooterHUD",         priority: 90,  contexts: ["fan-home","fan-hub","performer-hub","stage-pre","lobby"],         visible: true,  locked: false, animateIn: "slide-up",   config: {} },
  { moduleId: "crowd-counter", slot: "corner-tr",   component: "CrowdCounter",      priority: 50,  contexts: ["stage-live","stage-pre","battle-active","cypher-active","lobby"], visible: true,  locked: false, animateIn: "fade",       config: {} },
  { moduleId: "live-badge",    slot: "corner-tl",   component: "LiveBadge",         priority: 80,  contexts: ["stage-live","battle-active","cypher-active"],                    visible: true,  locked: false, animateIn: "expand",     config: {} },
  { moduleId: "tip-quick",     slot: "corner-br",   component: "TipQuickLaunch",    priority: 40,  contexts: ["stage-live","stage-post","battle-active"],                       visible: true,  locked: false, animateIn: "slide-up",   config: {} },
  { moduleId: "xp-strip",      slot: "bottom-bar",  component: "XPProgressStrip",   priority: 30,  contexts: ["fan-hub","fan-home"],                                            visible: true,  locked: false, animateIn: "slide-up",   config: {} },
  { moduleId: "reactions-rail",slot: "right-rail",  component: "LiveReactionsRail", priority: 60,  contexts: ["stage-live","battle-active","cypher-active"],                    visible: true,  locked: false, animateIn: "slide-down", config: {} },
  { moduleId: "earnings-strip",slot: "top-bar",     component: "EarningsStrip",     priority: 70,  contexts: ["performer-hub","stage-live","stage-pre"],                        visible: true,  locked: false, animateIn: "fade",       config: {} },
  { moduleId: "encore-overlay",slot: "center-overlay",component: "EncorePrompt",    priority: 95,  contexts: ["stage-post"],                                                    visible: false, locked: false, animateIn: "expand",     config: {} },
  { moduleId: "vote-rail",     slot: "left-rail",   component: "CrowdVoteRail",     priority: 55,  contexts: ["battle-active","cypher-active","stage-live"],                    visible: true,  locked: false, animateIn: "slide-down", config: {} },
];

function initModules(): void {
  for (const m of DEFAULT_MODULES) {
    moduleRegistry.set(m.moduleId, m);
  }
}

initModules();

function getActiveModules(context: HubContext): HUDModule[] {
  return [...moduleRegistry.values()]
    .filter(m => m.contexts.includes(context) && m.visible)
    .sort((a, b) => b.priority - a.priority);
}

function buildLayout(context: HubContext): HUDLayout {
  return { context, modules: getActiveModules(context), timestamp: Date.now() };
}

function notifyContext(context: HubContext): void {
  const layout = buildLayout(context);
  contextListeners.get(context)?.forEach(l => l(layout));
}

export function setHubContext(context: HubContext): HUDLayout {
  currentContext = context;
  notifyContext(context);
  return buildLayout(context);
}

export function getCurrentLayout(): HUDLayout {
  return buildLayout(currentContext);
}

export function registerModule(module: HUDModule): void {
  moduleRegistry.set(module.moduleId, module);
  notifyContext(currentContext);
}

export function setModuleVisible(moduleId: string, visible: boolean): void {
  const mod = moduleRegistry.get(moduleId);
  if (!mod || mod.locked) return;
  moduleRegistry.set(moduleId, { ...mod, visible });
  notifyContext(currentContext);
}

export function updateModuleConfig(moduleId: string, config: Record<string, unknown>): void {
  const mod = moduleRegistry.get(moduleId);
  if (!mod) return;
  moduleRegistry.set(moduleId, { ...mod, config: { ...mod.config, ...config } });
  notifyContext(currentContext);
}

export function subscribeToContext(context: HubContext, listener: (layout: HUDLayout) => void): () => void {
  if (!contextListeners.has(context)) contextListeners.set(context, new Set());
  contextListeners.get(context)!.add(listener);
  listener(buildLayout(context));
  return () => contextListeners.get(context)?.delete(listener);
}

export function getModulesBySlot(slot: HUDSlot, context?: HubContext): HUDModule[] {
  const ctx = context ?? currentContext;
  return getActiveModules(ctx).filter(m => m.slot === slot);
}
