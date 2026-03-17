/**
 * Tool Runner - Executes tool calls with timeout and retry logic
 */

import type { ToolExecutionRequest, ToolResult } from './types';

export class ToolRunner {
  private maxRetries = 3;
  private defaultTimeout = 30000;

  async run(request: ToolExecutionRequest): Promise<ToolResult> {
    const { tool: toolName, bot, task, input, verify = true } = request;
    
    let lastError: Error | null = null;
    
    for (let attempt = 0; attempt < this.maxRetries; attempt++) {
      try {
        const result = await this.executeWithTimeout(input, this.defaultTimeout);
        if (verify && !result.verified) {
          throw new Error('Output not verified');
        }
        return result;
      } catch (error) {
        lastError = error as Error;
        if (attempt < this.maxRetries - 1) {
          await this.delay(Math.pow(2, attempt) * 1000);
        }
      }
    }
    
    return {
      success: false,
      tool: toolName,
      error: lastError?.message || 'Max retries exceeded',
      verified: false
    };
  }

  private async executeWithTimeout(input: Record<string, unknown>, timeout: number): Promise<ToolResult> {
    return Promise.race([
      this.execute(input),
      this.timeout(timeout)
    ]) as Promise<ToolResult>;
  }

  private async execute(input: Record<string, unknown>): Promise<ToolResult> {
    return { success: true, tool: 'placeholder', output: {}, verified: false };
  }

  private timeout(ms: number): Promise<never> {
    return new Promise((_, reject) => 
      globalThis.setTimeout(() => reject(new Error('Tool execution timeout')), ms)
    );
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export const toolRunner = new ToolRunner();
