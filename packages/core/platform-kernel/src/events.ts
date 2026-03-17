/**
 * Platform Kernel - Minimal Events
 * Event names only - event-bus is its own package
 */

// Event names
export const PLATFORM_READY = 'platform:ready';
export const PLATFORM_ERROR = 'platform:error';
export const ENGINE_REGISTERED = 'engine:registered';
export const ENGINE_INITIALIZED = 'engine:initialized';
export const ENGINE_STARTED = 'engine:started';
export const ENGINE_STOPPED = 'engine:stopped';
export const LIFECYCLE_STATE_CHANGED = 'lifecycle:state-changed';
