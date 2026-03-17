/**
 * Tool Fallback Module
 * 
 * Manages fallback chains for tools when they fail or become unavailable.
 */

import type { ToolFallbackChain } from './types';

export class ToolFallbackManager {
  private fallbackChains: Map<string, ToolFallbackChain> = new Map();
  private fallbackHistory: Map<string, string[]> = new Map();

  /**
   * Add a fallback chain for a tool
   */
  addFallbackChain(chain: ToolFallbackChain): void {
    this.fallbackChains.set(chain.tool, chain);
  }

  /**
   * Get the fallback tool for a given tool
   */
  getFallback(tool: string): string | undefined {
    return this.fallbackChains.get(tool)?.fallback;
  }

  /**
   * Get the full fallback chain (primary -> fallback -> fallbackFallback)
   */
  getFallbackChain(tool: string): string[] {
    const chain: string[] = [tool];
    let current = tool;

    while (true) {
      const fallback = this.fallbackChains.get(current)?.fallback;
      if (fallback && !chain.includes(fallback)) {
        chain.push(fallback);
        current = fallback;
      } else {
        break;
      }
    }

    return chain;
  }

  /**
   * Record that a fallback was used
   */
  recordFallback(fromTool: string, toTool: string): void {
    const history = this.fallbackHistory.get(fromTool) || [];
    history.push(toTool);
    this.fallbackHistory.set(fromTool, history);

    // Keep only last 10 fallbacks
    if (history.length > 10) {
      history.shift();
    }
  }

  /**
   * Get fallback history for a tool
   */
  getFallbackHistory(tool: string): string[] {
    return this.fallbackHistory.get(tool) || [];
  }

  /**
   * Check if a tool has any fallback configured
   */
  hasFallback(tool: string): boolean {
    return this.fallbackChains.has(tool);
  }

  /**
   * Get all tools that can fall back to a specific tool
   */
  getToolsThatFallbackTo(targetTool: string): string[] {
    const tools: string[] = [];
    for (const [tool, chain] of this.fallbackChains) {
      if (chain.fallback === targetTool || chain.fallbackFallback === targetTool) {
        tools.push(tool);
      }
    }
    return tools;
  }

  /**
   * Load fallback chains from configuration
   */
  loadFromConfig(config: { fallbacks: ToolFallbackChain[] }): void {
    for (const chain of config.fallbacks) {
      this.addFallbackChain(chain);
    }
  }
}

export const toolFallbackManager = new ToolFallbackManager();
