// Tool Registry - Manages tool registration and lookup

import type { ToolConfig, ToolCategory } from './types';

export class ToolRegistry {
  private tools: Map<string, ToolConfig> = new Map();
  private categories: Map<ToolCategory, Set<string>> = new Map();

  register(tool: ToolConfig): void {
    this.tools.set(tool.name, tool);
    
    if (!this.categories.has(tool.category)) {
      this.categories.set(tool.category, new Set());
    }
    this.categories.get(tool.category)!.add(tool.name);
  }

  get(name: string): ToolConfig | undefined {
    return this.tools.get(name);
  }

  getByCategory(category: ToolCategory): ToolConfig[] {
    const toolNames = this.categories.get(category);
    if (!toolNames) return [];
    return Array.from(toolNames).map(name => this.tools.get(name)!).filter(Boolean);
  }

  getAll(): ToolConfig[] {
    return Array.from(this.tools.values());
  }

  getEnabled(): ToolConfig[] {
    return this.getAll().filter(t => t.enabled);
  }

  isEnabled(name: string): boolean {
    const tool = this.tools.get(name);
    return tool?.enabled ?? false;
  }

  hasFallback(name: string): boolean {
    const tool = this.tools.get(name);
    return !!tool?.fallbackTool;
  }

  getFallback(name: string): string | undefined {
    return this.tools.get(name)?.fallbackTool;
  }
}

export const toolRegistry = new ToolRegistry();
