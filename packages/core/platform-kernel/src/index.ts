/**
 * Platform Kernel - Main Exports
 */

export { PlatformKernel } from './engine';
export * from './types';
export * from './events';

export type {
  PlatformConfig,
  EngineManifest,
  LifecycleState,
  BootstrapOptions
} from './types';

export const PLATFORM_VERSION = '0.1.0';
