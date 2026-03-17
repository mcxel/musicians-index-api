// Events for the Tool Orchestrator system

export const ToolEvents = {
  TOOL_REQUESTED: 'tool:requested',
  TOOL_STARTED: 'tool:started',
  TOOL_COMPLETED: 'tool:completed',
  TOOL_FAILED: 'tool:failed',
  TOOL_VERIFIED: 'tool:verified',
  TOOL_FALLBACK_USED: 'tool:fallback_used',
  TOOL_HEALTH_CHANGED: 'tool:health_changed',
  TOOL_PERMISSION_DENIED: 'tool:permission_denied',
  TOOL_RATE_LIMITED: 'tool:rate_limited',
  TOOL_COST_THRESHOLD: 'tool:cost_threshold',
} as const;

export type ToolEventType = typeof ToolEvents[keyof typeof ToolEvents];
