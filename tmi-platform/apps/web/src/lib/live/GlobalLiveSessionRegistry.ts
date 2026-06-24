// Re-export barrel — canonical implementation lives at lib/broadcast/GlobalLiveSessionRegistry.ts
// This file exists to prevent silent import failures if future code imports from lib/live/ path.
export * from '@/lib/broadcast/GlobalLiveSessionRegistry';
