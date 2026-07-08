export type RuntimeEngineId =
  | 'avatar-engine'
  | 'playlist-engine'
  | 'memory-wall-engine'
  | 'magazine-engine'
  | 'venue-engine'
  | 'arena-engine'
  | 'stripe-engine'
  | 'observatory-engine'
  | 'omni-presence-engine'
  | 'universal-viewport-engine'
  | 'live-engine'
  | 'broadcast-routing-engine'
  | 'broadcast-director-engine'
  | 'feed-registry-engine'
  | 'panel-registry-engine';

export type RuntimeDependencyId =
  | 'avatar-rig-registry'
  | 'avatar-motion-engine'
  | 'avatar-wardrobe-engine'
  | 'audience-scene'
  | 'webrtc-session-layer'
  | 'media-pipeline'
  | 'stripe-webhook-ingest'
  | 'observatory-summary-api'
  | 'venue-renderer';

export type RuntimeDomain =
  | 'identity'
  | 'media'
  | 'content'
  | 'venue'
  | 'competition'
  | 'commerce'
  | 'operations'
  | 'presence'
  | 'shell';

export type RuntimeOwner = 'copilot' | 'claude' | 'blackbox' | 'gemini' | 'shared';

export type RuntimeHealthStatus = 'healthy' | 'warning' | 'degraded' | 'unknown';

export interface RuntimeDependencyDefinition {
  id: RuntimeDependencyId;
  label: string;
  canonicalSource: string;
}

export interface RuntimeDependencyEdge {
  from: RuntimeEngineId | RuntimeDependencyId;
  to: RuntimeEngineId | RuntimeDependencyId;
}

export interface RuntimeEngineDefinition {
  id: RuntimeEngineId;
  label: string;
  domain: RuntimeDomain;
  owner: RuntimeOwner;
  canonicalSource: string;
  dependencies: RuntimeDependencyId[];
  consumers: string[];
  capabilities: string[];
  notes?: string;
}

export interface RuntimeEngineHealth {
  id: RuntimeEngineId;
  status: RuntimeHealthStatus;
  failedDependencies: RuntimeDependencyId[];
  warningDependencies: RuntimeDependencyId[];
  updatedAtMs: number;
}

export interface RuntimeRegistryHealthSnapshot {
  updatedAtMs: number;
  engines: RuntimeEngineHealth[];
  summary: Record<RuntimeHealthStatus, number>;
  degradedEngines: RuntimeEngineId[];
}

const DEPENDENCY_REGISTRY: Record<RuntimeDependencyId, RuntimeDependencyDefinition> = {
  'avatar-rig-registry': {
    id: 'avatar-rig-registry',
    label: 'Avatar Rig Registry',
    canonicalSource: '@/lib/avatar/AvatarCharacterRegistry',
  },
  'avatar-motion-engine': {
    id: 'avatar-motion-engine',
    label: 'Avatar Motion Engine',
    canonicalSource: '@/lib/ai-motion/AiHostAnimationEngine',
  },
  'avatar-wardrobe-engine': {
    id: 'avatar-wardrobe-engine',
    label: 'Avatar Wardrobe Engine',
    canonicalSource: '@/lib/avatar/AvatarWardrobeEngine',
  },
  'audience-scene': {
    id: 'audience-scene',
    label: 'Audience Scene',
    canonicalSource: '@/components/live/AudienceScene',
  },
  'webrtc-session-layer': {
    id: 'webrtc-session-layer',
    label: 'WebRTC Session Layer',
    canonicalSource: '@/lib/webrtc/webrtcHealth',
  },
  'media-pipeline': {
    id: 'media-pipeline',
    label: 'Media Pipeline',
    canonicalSource: '@/lib/media/MediaProcessingEngine',
  },
  'stripe-webhook-ingest': {
    id: 'stripe-webhook-ingest',
    label: 'Stripe Webhook Ingest',
    canonicalSource: '@/lib/stripe/stripe-telemetry-store',
  },
  'observatory-summary-api': {
    id: 'observatory-summary-api',
    label: 'Observatory Summary API',
    canonicalSource: '@/app/api/admin/observatory-summary/route',
  },
  'venue-renderer': {
    id: 'venue-renderer',
    label: 'Venue Renderer',
    canonicalSource: '@/components/live/ArenaEventShell',
  },
};

const RUNTIME_REGISTRY: Record<RuntimeEngineId, RuntimeEngineDefinition> = {
  'avatar-engine': {
    id: 'avatar-engine',
    label: 'Avatar Engine',
    domain: 'identity',
    owner: 'shared',
    canonicalSource: '@/lib/avatar/AvatarCharacterRegistry',
    dependencies: ['avatar-rig-registry', 'avatar-motion-engine', 'avatar-wardrobe-engine'],
    consumers: ['AudienceScene', 'AvatarLobbyCanvas', 'ProfileShell'],
    capabilities: ['spawn', 'despawn', 'equipWardrobe', 'equipHair', 'equipProp', 'playEmote', 'joinSeat'],
  },
  'playlist-engine': {
    id: 'playlist-engine',
    label: 'Playlist Engine',
    domain: 'media',
    owner: 'shared',
    canonicalSource: '@/engines/PlaylistEngine',
    dependencies: ['media-pipeline'],
    consumers: ['UniversalViewportEngine', 'ProfileCanisters'],
    capabilities: ['loadTrack', 'play', 'pause', 'queueTrack', 'setShuffle', 'setRepeat'],
  },
  'memory-wall-engine': {
    id: 'memory-wall-engine',
    label: 'Memory Wall Engine',
    domain: 'media',
    owner: 'shared',
    canonicalSource: '@/lib/timeline/ActivityTimelineEngine',
    dependencies: ['media-pipeline'],
    consumers: ['ProfileCanisters', 'MagazineArticleShell'],
    capabilities: ['captureMemory', 'listMemories', 'pinMemory', 'archiveMemory'],
  },
  'magazine-engine': {
    id: 'magazine-engine',
    label: 'Magazine Engine',
    domain: 'content',
    owner: 'shared',
    canonicalSource: '@/packages/magazine-engine/contentRegistry',
    dependencies: ['media-pipeline'],
    consumers: ['Home2', 'MagazineRoutes', 'ObservatoryFeeds'],
    capabilities: ['listArticles', 'resolveIssue', 'publishFeature', 'routeCoverStory'],
  },
  'venue-engine': {
    id: 'venue-engine',
    label: 'Venue Engine',
    domain: 'venue',
    owner: 'shared',
    canonicalSource: '@/lib/venue/tmiVenueRuntimeEngine',
    dependencies: ['venue-renderer', 'audience-scene', 'webrtc-session-layer'],
    consumers: ['ArenaEventShell', 'VenueImmersiveRoom'],
    capabilities: ['hydrateVenue', 'setLightingMode', 'bindAudience', 'setStageMode'],
  },
  'arena-engine': {
    id: 'arena-engine',
    label: 'Arena Engine',
    domain: 'competition',
    owner: 'shared',
    canonicalSource: '@/lib/shows/ShowRuntimeEngine',
    dependencies: ['venue-renderer', 'webrtc-session-layer'],
    consumers: ['BattleArenaRoute', 'CypherRoute', 'ChallengeRoute'],
    capabilities: ['startMatch', 'advanceRound', 'scoreEvent', 'finishMatch'],
  },
  'stripe-engine': {
    id: 'stripe-engine',
    label: 'Stripe Engine',
    domain: 'commerce',
    owner: 'shared',
    canonicalSource: '@/lib/stripe/stripe-telemetry-store',
    dependencies: ['stripe-webhook-ingest'],
    consumers: ['RevenueHealthPanel', 'ObservatorySummary'],
    capabilities: ['ingestWebhook', 'summarizeRevenue', 'flagFailures', 'trackRenewals'],
  },
  'observatory-engine': {
    id: 'observatory-engine',
    label: 'Observatory Engine',
    domain: 'operations',
    owner: 'copilot',
    canonicalSource: '@/app/api/admin/observatory-summary/route',
    dependencies: ['observatory-summary-api'],
    consumers: ['AdminObservatoryPage', 'AdminHUD'],
    capabilities: ['buildSummary', 'hydratePanels', 'reportHealth', 'publishFreshness'],
  },
  'omni-presence-engine': {
    id: 'omni-presence-engine',
    label: 'Omni Presence Engine',
    domain: 'presence',
    owner: 'shared',
    canonicalSource: '@/components/admin/OmniPresenceEngine',
    dependencies: ['audience-scene', 'webrtc-session-layer'],
    consumers: ['AdminObservatoryPage', 'LiveOperations'],
    capabilities: ['trackPresence', 'listActiveRooms', 'watchTransitions', 'reportOccupancy'],
  },
  'universal-viewport-engine': {
    id: 'universal-viewport-engine',
    label: 'Universal Viewport Engine',
    domain: 'shell',
    owner: 'shared',
    canonicalSource: '@/components/viewport/UniversalViewportEngine',
    dependencies: ['webrtc-session-layer', 'media-pipeline'],
    consumers: ['Home1', 'LiveRooms', 'BroadcastWall'],
    capabilities: ['setMode', 'renderSession', 'switchViewport', 'showCurtain'],
  },
  'live-engine': {
    id: 'live-engine',
    label: 'Live Engine',
    domain: 'presence',
    owner: 'shared',
    canonicalSource: '@/lib/broadcast/GlobalLiveSessionRegistry',
    dependencies: ['webrtc-session-layer', 'audience-scene'],
    consumers: ['Observatory', 'LiveRoomShells', 'DirectorPanels'],
    capabilities: ['registerSession', 'getSession', 'listSessions', 'getHealth'],
  },
  'broadcast-routing-engine': {
    id: 'broadcast-routing-engine',
    label: 'Broadcast Routing Engine',
    domain: 'operations',
    owner: 'copilot',
    canonicalSource: '@/lib/broadcast/BroadcastRoutingEngine',
    dependencies: ['media-pipeline', 'observatory-summary-api'],
    consumers: ['ObservatoryBroadcastWall', 'DirectorPanels'],
    capabilities: ['assignFeed', 'swapFeeds', 'queueFeed', 'clearFeed', 'cloneFeed', 'setPanelIdle', 'executeBroadcastRoutingOperation', 'applyPreset'],
  },
  'broadcast-director-engine': {
    id: 'broadcast-director-engine',
    label: 'Broadcast Director Engine',
    domain: 'operations',
    owner: 'copilot',
    canonicalSource: '@/lib/broadcast/BroadcastDirectorEngine',
    dependencies: ['media-pipeline', 'observatory-summary-api'],
    consumers: ['ObservatoryDirectorConsole', 'EventAutomations'],
    capabilities: ['activateDirectorMode', 'createTimeline', 'getDirectorPlan', 'listDirectorModes'],
  },
  'feed-registry-engine': {
    id: 'feed-registry-engine',
    label: 'Feed Registry Engine',
    domain: 'media',
    owner: 'copilot',
    canonicalSource: '@/lib/broadcast/FeedRegistry',
    dependencies: ['media-pipeline'],
    consumers: ['BroadcastRoutingEngine', 'BroadcastDirectorEngine'],
    capabilities: ['listFeeds', 'getFeed', 'upsertFeed', 'summarizeFeeds'],
  },
  'panel-registry-engine': {
    id: 'panel-registry-engine',
    label: 'Panel Registry Engine',
    domain: 'operations',
    owner: 'copilot',
    canonicalSource: '@/lib/broadcast/PanelRegistry',
    dependencies: ['observatory-summary-api'],
    consumers: ['BroadcastRoutingEngine', 'ObservatoryVideoWall'],
    capabilities: ['listPanelIds', 'getPanelState', 'setPanelState', 'listPanelStates'],
  },
};

const SYSTEM_DEPENDENCY_GRAPH: RuntimeDependencyEdge[] = [
  { from: 'avatar-engine', to: 'avatar-rig-registry' },
  { from: 'avatar-engine', to: 'avatar-motion-engine' },
  { from: 'avatar-engine', to: 'avatar-wardrobe-engine' },
  { from: 'avatar-engine', to: 'live-engine' },
  { from: 'live-engine', to: 'webrtc-session-layer' },
  { from: 'live-engine', to: 'audience-scene' },
  { from: 'venue-engine', to: 'venue-renderer' },
  { from: 'venue-engine', to: 'audience-scene' },
  { from: 'venue-engine', to: 'webrtc-session-layer' },
  { from: 'arena-engine', to: 'venue-engine' },
  { from: 'arena-engine', to: 'webrtc-session-layer' },
  { from: 'playlist-engine', to: 'media-pipeline' },
  { from: 'memory-wall-engine', to: 'media-pipeline' },
  { from: 'magazine-engine', to: 'media-pipeline' },
  { from: 'universal-viewport-engine', to: 'webrtc-session-layer' },
  { from: 'universal-viewport-engine', to: 'media-pipeline' },
  { from: 'stripe-engine', to: 'stripe-webhook-ingest' },
  { from: 'observatory-engine', to: 'observatory-summary-api' },
  { from: 'omni-presence-engine', to: 'audience-scene' },
  { from: 'omni-presence-engine', to: 'webrtc-session-layer' },
  { from: 'feed-registry-engine', to: 'media-pipeline' },
  { from: 'panel-registry-engine', to: 'observatory-summary-api' },
  { from: 'broadcast-routing-engine', to: 'feed-registry-engine' },
  { from: 'broadcast-routing-engine', to: 'panel-registry-engine' },
  { from: 'broadcast-director-engine', to: 'broadcast-routing-engine' },
  { from: 'broadcast-director-engine', to: 'feed-registry-engine' },
];

export function listRuntimeEngines(): RuntimeEngineDefinition[] {
  return Object.values(RUNTIME_REGISTRY);
}

export function getRuntimeEngine(id: RuntimeEngineId): RuntimeEngineDefinition {
  return RUNTIME_REGISTRY[id];
}

export function listRuntimeEnginesByDomain(domain: RuntimeDomain): RuntimeEngineDefinition[] {
  return listRuntimeEngines().filter((engine) => engine.domain === domain);
}

export function listRuntimeDependencies(): RuntimeDependencyDefinition[] {
  return Object.values(DEPENDENCY_REGISTRY);
}

export function getRuntimeDependency(id: RuntimeDependencyId): RuntimeDependencyDefinition {
  return DEPENDENCY_REGISTRY[id];
}

export function listSystemDependencyGraph(): RuntimeDependencyEdge[] {
  return [...SYSTEM_DEPENDENCY_GRAPH];
}

function deriveEngineHealth(
  engine: RuntimeEngineDefinition,
  dependencySignals: Partial<Record<RuntimeDependencyId, RuntimeHealthStatus>>,
  nowMs: number,
): RuntimeEngineHealth {
  const failedDependencies = engine.dependencies.filter((dep) => dependencySignals[dep] === 'degraded');
  const warningDependencies = engine.dependencies.filter((dep) => dependencySignals[dep] === 'warning');

  let status: RuntimeHealthStatus = 'healthy';
  if (failedDependencies.length > 0) {
    status = 'degraded';
  } else if (warningDependencies.length > 0) {
    status = 'warning';
  }

  return {
    id: engine.id,
    status,
    failedDependencies,
    warningDependencies,
    updatedAtMs: nowMs,
  };
}

export function getRuntimeRegistryHealthSnapshot(input?: {
  dependencySignals?: Partial<Record<RuntimeDependencyId, RuntimeHealthStatus>>;
}): RuntimeRegistryHealthSnapshot {
  const nowMs = Date.now();
  const dependencySignals = input?.dependencySignals ?? {};
  const engines = listRuntimeEngines().map((engine) => deriveEngineHealth(engine, dependencySignals, nowMs));

  const summary: Record<RuntimeHealthStatus, number> = {
    healthy: engines.filter((engine) => engine.status === 'healthy').length,
    warning: engines.filter((engine) => engine.status === 'warning').length,
    degraded: engines.filter((engine) => engine.status === 'degraded').length,
    unknown: engines.filter((engine) => engine.status === 'unknown').length,
  };

  return {
    updatedAtMs: nowMs,
    engines,
    summary,
    degradedEngines: engines.filter((engine) => engine.status === 'degraded').map((engine) => engine.id),
  };
}

export function getRuntimeRegistrySummary(): {
  total: number;
  byDomain: Record<RuntimeDomain, number>;
  byOwner: Record<RuntimeOwner, number>;
  dependencyCount: number;
  graphEdges: number;
  capabilityCount: number;
  updatedAtMs: number;
} {
  const byDomain: Record<RuntimeDomain, number> = {
    identity: 0,
    media: 0,
    content: 0,
    venue: 0,
    competition: 0,
    commerce: 0,
    operations: 0,
    presence: 0,
    shell: 0,
  };
  const byOwner: Record<RuntimeOwner, number> = {
    copilot: 0,
    claude: 0,
    blackbox: 0,
    gemini: 0,
    shared: 0,
  };

  for (const engine of listRuntimeEngines()) {
    byDomain[engine.domain] += 1;
    byOwner[engine.owner] += 1;
  }

  return {
    total: listRuntimeEngines().length,
    byDomain,
    byOwner,
    dependencyCount: listRuntimeDependencies().length,
    graphEdges: listSystemDependencyGraph().length,
    capabilityCount: listRuntimeEngines().reduce((sum, engine) => sum + engine.capabilities.length, 0),
    updatedAtMs: Date.now(),
  };
}