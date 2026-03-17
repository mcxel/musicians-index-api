/**
 * Tool Logger - Logs all tool executions for audit and debugging
 */

import type { ToolExecutionRequest, ToolResult } from './types';

export interface ToolLogEntry {
  timestamp: Date;
  request: ToolExecutionRequest;
  result?: ToolResult;
  error?: string;
  durationMs: number;
}

export class ToolLogger {
  private logs: ToolLogEntry[] = [];
  private maxLogs = 10000;

  log(request: ToolExecutionRequest, result: ToolResult, durationMs: number): void {
    const entry: ToolLogEntry = {
      timestamp: new Date(),
      request,
      result,
      durationMs
    };
    
    this.logs.push(entry);
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }
  }

  logError(request: ToolExecutionRequest, error: string, durationMs: number): void {
    const entry: ToolLogEntry = {
      timestamp: new Date(),
      request,
      error,
      durationMs
    };
    
    this.logs.push(entry);
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }
  }

  getLogs(limit = 100): ToolLogEntry[] {
    return this.logs.slice(-limit);
  }

  getLogsByTool(toolName: string, limit = 100): ToolLogEntry[] {
    return this.logs
      .filter(log => log.request.tool === toolName)
      .slice(-limit);
  }

  getLogsByBot(botName: string, limit = 100): ToolLogEntry[] {
    return this.logs
      .filter(log => log.request.bot === botName)
      .slice(-limit);
  }

  clear(): void {
    this.logs = [];
  }
}

export const toolLogger = new ToolLogger();
