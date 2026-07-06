import {
  type BroadcastFeedAssignment,
  type BroadcastPanelId,
  type BroadcastPanelState,
  getBroadcastPanelState,
  listBroadcastPanelStates,
  setBroadcastPanelState,
} from '@/lib/broadcast/PanelRegistry';
import { resolveFeedAssignment, type BroadcastFeedId } from '@/lib/broadcast/FeedRegistry';

export type BroadcastPresetId = 'CONCERT_MODE' | 'BATTLE_MODE' | 'MAGAZINE_MODE' | 'MISSION_CONTROL';

export interface BroadcastCommandResult {
  panel: BroadcastPanelState;
  affectedPanels?: BroadcastPanelState[];
}

export type BroadcastRoutingOperation = 'assign' | 'swap' | 'queue' | 'clear' | 'clone' | 'idle';

export interface BroadcastRoutingOperationInput {
  operation: BroadcastRoutingOperation;
  panelId?: BroadcastPanelId;
  panelA?: BroadcastPanelId;
  panelB?: BroadcastPanelId;
  fromPanel?: BroadcastPanelId;
  toPanel?: BroadcastPanelId;
  feed?: BroadcastFeedAssignment;
}

const PRESETS: Record<BroadcastPresetId, Array<{ panelId: BroadcastPanelId; feedId: BroadcastFeedId }>> = {
  CONCERT_MODE: [
    { panelId: 'OBS_P1', feedId: 'LIVE_ABC' },
    { panelId: 'OBS_P2', feedId: 'DRONE_A' },
    { panelId: 'OBS_P3', feedId: 'BACKSTAGE_MAIN' },
    { panelId: 'OBS_P4', feedId: 'ANALYTICS_REVENUE' },
    { panelId: 'OBS_P5', feedId: 'CHAT_LIVE' },
    { panelId: 'OBS_P6', feedId: 'SPONSOR_NIKE' },
  ],
  BATTLE_MODE: [
    { panelId: 'OBS_P1', feedId: 'BATTLE_A' },
    { panelId: 'OBS_P2', feedId: 'BATTLE_B' },
    { panelId: 'OBS_P3', feedId: 'DRONE_A' },
    { panelId: 'OBS_P4', feedId: 'CHAT_LIVE' },
    { panelId: 'OBS_P5', feedId: 'BRACKET_MAIN' },
    { panelId: 'OBS_P6', feedId: 'SPONSOR_NIKE' },
  ],
  MAGAZINE_MODE: [
    { panelId: 'OBS_P1', feedId: 'MAGAZINE_84' },
    { panelId: 'OBS_P2', feedId: 'EDITOR_CAM' },
    { panelId: 'OBS_P3', feedId: 'FEATURE_ARTICLE' },
    { panelId: 'OBS_P4', feedId: 'CHAT_LIVE' },
    { panelId: 'OBS_P5', feedId: 'SPONSOR_NIKE' },
    { panelId: 'OBS_P6', feedId: 'OBS_OUTPUT_A' },
  ],
  MISSION_CONTROL: [
    { panelId: 'OBS_P1', feedId: 'LIVE_ABC' },
    { panelId: 'OBS_P2', feedId: 'CHAT_LIVE' },
    { panelId: 'OBS_P3', feedId: 'ANALYTICS_REVENUE' },
    { panelId: 'OBS_P4', feedId: 'ANALYTICS_REVENUE' },
    { panelId: 'OBS_P5', feedId: 'SECURITY_MAIN' },
    { panelId: 'OBS_P6', feedId: 'CHARTS_MAIN' },
  ],
};

export function listBroadcastPresets(): BroadcastPresetId[] {
  return Object.keys(PRESETS) as BroadcastPresetId[];
}

export function assignFeed(panelId: BroadcastPanelId, feed: BroadcastFeedAssignment): BroadcastCommandResult {
  const panel = setBroadcastPanelState(panelId, (prev) => ({
    ...prev,
    assignment: { ...feed },
    status: 'live',
  }));
  return { panel };
}

export function clearFeed(panelId: BroadcastPanelId): BroadcastCommandResult {
  const panel = setBroadcastPanelState(panelId, (prev) => ({
    ...prev,
    assignment: null,
    status: prev.queue.length > 0 ? 'queued' : 'idle',
  }));
  return { panel };
}

export function setPanelIdle(panelId: BroadcastPanelId): BroadcastCommandResult {
  const panel = setBroadcastPanelState(panelId, (prev) => ({
    ...prev,
    assignment: null,
    queue: [],
    status: 'idle',
  }));
  return { panel };
}

export function queueFeed(panelId: BroadcastPanelId, feed: BroadcastFeedAssignment): BroadcastCommandResult {
  const panel = setBroadcastPanelState(panelId, (prev) => ({
    ...prev,
    queue: [...prev.queue, { ...feed }],
    status: prev.assignment ? 'live' : 'queued',
  }));
  return { panel };
}

export function playNextQueuedFeed(panelId: BroadcastPanelId): BroadcastCommandResult {
  const panel = setBroadcastPanelState(panelId, (prev) => {
    const [next, ...rest] = prev.queue;
    if (!next) {
      return {
        ...prev,
        status: prev.assignment ? 'live' : 'idle',
      };
    }
    return {
      ...prev,
      assignment: next,
      queue: rest,
      status: 'live',
    };
  });
  return { panel };
}

export function moveFeed(fromPanel: BroadcastPanelId, toPanel: BroadcastPanelId): BroadcastCommandResult {
  const from = getBroadcastPanelState(fromPanel);
  if (!from.assignment) {
    return { panel: getBroadcastPanelState(toPanel), affectedPanels: [from] };
  }

  const moved = assignFeed(toPanel, from.assignment).panel;
  const cleared = clearFeed(fromPanel).panel;
  return { panel: moved, affectedPanels: [cleared, moved] };
}

export function cloneFeed(fromPanel: BroadcastPanelId, toPanel: BroadcastPanelId): BroadcastCommandResult {
  const from = getBroadcastPanelState(fromPanel);
  if (!from.assignment) {
    return { panel: getBroadcastPanelState(toPanel), affectedPanels: [from] };
  }
  const cloned = assignFeed(toPanel, from.assignment).panel;
  return { panel: cloned, affectedPanels: [from, cloned] };
}

export function swapFeeds(panelA: BroadcastPanelId, panelB: BroadcastPanelId): BroadcastCommandResult {
  const a = getBroadcastPanelState(panelA);
  const b = getBroadcastPanelState(panelB);

  setBroadcastPanelState(panelA, (prev) => ({
    ...prev,
    assignment: b.assignment,
    status: b.assignment ? 'live' : (prev.queue.length > 0 ? 'queued' : 'idle'),
  }));
  const panel = setBroadcastPanelState(panelB, (prev) => ({
    ...prev,
    assignment: a.assignment,
    status: a.assignment ? 'live' : (prev.queue.length > 0 ? 'queued' : 'idle'),
  }));

  return {
    panel,
    affectedPanels: [getBroadcastPanelState(panelA), getBroadcastPanelState(panelB)],
  };
}

export function applyBroadcastPreset(preset: BroadcastPresetId): BroadcastPanelState[] {
  const assignments = PRESETS[preset] ?? [];
  for (const assignment of assignments) {
    const feed = resolveFeedAssignment(assignment.feedId);
    if (!feed) continue;
    assignFeed(assignment.panelId, feed);
  }
  return listBroadcastPanelStates();
}

export function listBroadcastRoutingOperations(): BroadcastRoutingOperation[] {
  return ['assign', 'swap', 'queue', 'clear', 'clone', 'idle'];
}

export function executeBroadcastRoutingOperation(input: BroadcastRoutingOperationInput): BroadcastCommandResult {
  if (input.operation === 'assign') {
    if (!input.panelId || !input.feed) throw new Error('missing_assign_payload');
    return assignFeed(input.panelId, input.feed);
  }

  if (input.operation === 'swap') {
    if (!input.panelA || !input.panelB) throw new Error('missing_swap_payload');
    return swapFeeds(input.panelA, input.panelB);
  }

  if (input.operation === 'queue') {
    if (!input.panelId || !input.feed) throw new Error('missing_queue_payload');
    return queueFeed(input.panelId, input.feed);
  }

  if (input.operation === 'clear') {
    if (!input.panelId) throw new Error('missing_clear_payload');
    return clearFeed(input.panelId);
  }

  if (input.operation === 'clone') {
    if (!input.fromPanel || !input.toPanel) throw new Error('missing_clone_payload');
    return cloneFeed(input.fromPanel, input.toPanel);
  }

  if (input.operation === 'idle') {
    if (!input.panelId) throw new Error('missing_idle_payload');
    return setPanelIdle(input.panelId);
  }

  throw new Error('unsupported_operation');
}