/**
 * Platform Kernel - Minimal Types
 * Core platform types only - no speculative types
 */

// Lifecycle states
export type LifecycleState = 
  | 'created'
  | 'initializing'
  | 'initialized'
  | 'starting'
  | 'running'
  | 'stopping'
  | 'stopped'
  | 'error';

// Platform configuration
export interface PlatformConfig {
  name: string;
  version: string;
  environment: 'development' | 'staging' | 'production';
  baseUrl: string;
  debug: boolean;
  engines: Record<string, unknown>;
  featureFlags: Record<string, boolean>;
  plugins: string[];
}

// Engine manifest placeholder
export interface EngineManifest {
  name: string;
  version: string;
  description: string;
  entry: string;
  type: 'core' | 'module' | 'plugin';
  dependencies: string[];
}

// Bootstrap options
export interface BootstrapOptions {
  skipValidation?: boolean;
  skipPlugins?: boolean;
  manifestPath?: string;
  config?: Partial<PlatformConfig>;
}
