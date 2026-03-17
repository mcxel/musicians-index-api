// Tool Orchestrator - Central system for bots to access approved external tools
// This layer provides controlled access through adapters, permissions, verification, fallbacks, logging, and cost controls

export * from './types';
export * from './events';
export * from './engine';
export * from './tool-registry';

import { ToolOrchestrator } from './engine';
export const toolOrchestrator = new ToolOrchestrator();
