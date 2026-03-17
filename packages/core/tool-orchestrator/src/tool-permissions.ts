/**
 * Tool Permissions Module
 * 
 * Manages permissions and access control for tool usage across bot families.
 */

import type { ToolPermissions, BotFamily, ToolName } from './types';

export class ToolPermissionsManager {
  private permissions: Map<BotFamily, Set<ToolName>> = new Map();
  private maxCallsPerHour: Map<BotFamily, number> = new Map();
  private requiresApproval: Set<string> = new Set();

  /**
   * Check if a bot family has permission to use a specific tool
   */
  hasPermission(botFamily: BotFamily, tool: ToolName): boolean {
    const allowedTools = this.permissions.get(botFamily);
    if (!allowedTools) return false;
    return allowedTools.has(tool);
  }

  /**
   * Get the maximum number of calls allowed per hour for a bot family
   */
  getMaxCallsPerHour(botFamily: BotFamily): number {
    return this.maxCallsPerHour.get(botFamily) ?? 100;
  }

  /**
   * Check if a specific tool requires approval before use
   */
  requiresApprovalCheck(tool: ToolName): boolean {
    return this.requiresApproval.has(tool);
  }

  /**
   * Grant permission for a bot family to use a tool
   */
  grantPermission(botFamily: BotFamily, tool: ToolName): void {
    if (!this.permissions.has(botFamily)) {
      this.permissions.set(botFamily, new Set());
    }
    this.permissions.get(botFamily)!.add(tool);
  }

  /**
   * Revoke permission for a bot family to use a tool
   */
  revokePermission(botFamily: BotFamily, tool: ToolName): void {
    this.permissions.get(botFamily)?.delete(tool);
  }

  /**
   * Get all tools a bot family has permission to use
   */
  getAllowedTools(botFamily: BotFamily): ToolName[] {
    const tools = this.permissions.get(botFamily);
    return tools ? Array.from(tools) : [];
  }

  /**
   * Load permissions from configuration
   */
  loadFromConfig(config: ToolPermissions): void {
    for (const [family, perms] of Object.entries(config.botFamilyPermissions)) {
      for (const tool of perms.allowedTools) {
        this.grantPermission(family as BotFamily, tool as ToolName);
      }
      this.maxCallsPerHour.set(family as BotFamily, perms.maxCallsPerHour);
      if (perms.requiresApproval) {
        perms.requiresApproval.forEach(t => this.requiresApproval.add(t));
      }
    }
  }
}

export const toolPermissionsManager = new ToolPermissionsManager();
