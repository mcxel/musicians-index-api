/**
 * Tool Health - Monitors health status of external AI tools
 */

import type { ToolHealth } from './types';

export class ToolHealthMonitor {
  private healthStatus: Map<string, ToolHealth> = new Map();
  private checkInterval = 60000;

  async checkHealth(toolName: string): Promise<ToolHealth> {
    const status: ToolHealth = {
      tool: toolName,
      status: 'healthy',
      latencyMs: 0,
      lastChecked: new Date(),
      consecutiveFailures: 0
    };

    try {
      const start = Date.now();
      // Simulate health check - in production would ping actual tool API
      status.latencyMs = Date.now() - start;
      status.status = 'healthy';
    } catch (error) {
      status.status = 'unhealthy';
      status.error = (error as Error).message;
      status.consecutiveFailures = (this.healthStatus.get(toolName)?.consecutiveFailures || 0) + 1;
    }

    this.healthStatus.set(toolName, status);
    return status;
  }

  getHealth(toolName: string): ToolHealth | undefined {
    return this.healthStatus.get(toolName);
  }

  getAllHealth(): ToolHealth[] {
    return Array.from(this.healthStatus.values());
  }

  isHealthy(toolName: string): boolean {
    const health = this.healthStatus.get(toolName);
    return health?.status === 'healthy';
  }

  markHealthy(toolName: string): void {
    this.healthStatus.set(toolName, {
      tool: toolName,
      status: 'healthy',
      latencyMs: 0,
      lastChecked: new Date(),
      consecutiveFailures: 0
    });
  }

  markUnhealthy(toolName: string, error: string): void {
    const existing = this.healthStatus.get(toolName) || {
      tool: toolName,
      status: 'healthy',
      latencyMs: 0,
      lastChecked: new Date(),
      consecutiveFailures: 0
    };

    const currentFailures = existing.consecutiveFailures ?? 0;

    this.healthStatus.set(toolName, {
      ...existing,
      status: 'unhealthy',
      error,
      consecutiveFailures: currentFailures + 1,
      lastChecked: new Date()
    });
  }
}

export const toolHealthMonitor = new ToolHealthMonitor();
