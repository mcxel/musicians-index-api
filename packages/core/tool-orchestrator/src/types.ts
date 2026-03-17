// Types for the Tool Orchestrator system

export type ToolCategory = 
  | 'video_generation'
  | 'image_generation'
  | 'avatar_animation'
  | 'voice_generation'
  | 'research'
  | 'browser_automation'
  | 'workflow_automation'
  | 'security';

export type AuthType = 'api_key' | 'oauth' | 'none';

export type ToolStatus = 'healthy' | 'degraded' | 'down' | 'experimental' | 'unhealthy';

// Bot family types for permissions
export type BotFamily = 
  | 'research-bots'
  | 'video-bots'
  | 'avatar-bots'
  | 'audio-bots'
  | 'workflow-bots'
  | 'browser-bots'
  | 'security-bots';

// Tool name union type
export type ToolName = string;

export interface ToolConfig {
  name: string;
  category: ToolCategory;
  apiEndpoint?: string;
  authType: AuthType;
  requiresApiKey: boolean;
  requiresManualAuth: boolean;
  rateLimit?: number;
  capabilities: string[];
  verificationMethod: string;
  fallbackTool?: string;
  enabled: boolean;
}

export interface ToolResult {
  success: boolean;
  tool: string;
  output?: unknown;
  error?: string;
  cost?: number;
  duration?: number;
  verified: boolean;
}

export interface ToolPermission {
  botFamily: string;
  allowedTools: string[];
  maxCallsPerHour: number;
  requiresApproval: boolean;
}

export interface ToolHealth {
  tool: string;
  status: ToolStatus;
  lastTest?: string;
  failureRate?: number;
  avgResponseTime?: number;
  // Extended fields for runtime monitoring
  latencyMs?: number;
  lastChecked?: Date;
  consecutiveFailures?: number;
  error?: string;
}

export interface ToolExecutionRequest {
  tool: string;
  bot: string;
  task: string;
  input: Record<string, unknown>;
  verify?: boolean;
}

// Permissions configuration type
export interface ToolPermissions {
  botFamilyPermissions: Record<string, {
    allowedTools: string[];
    maxCallsPerHour: number;
    requiresApproval?: string[];
  }>;
}

// Fallback chain type
export interface ToolFallbackChain {
  tool: string;
  fallback: string;
  fallbackFallback?: string | null;
}
