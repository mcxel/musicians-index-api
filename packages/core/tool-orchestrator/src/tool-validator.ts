/**
 * Tool Validator - Validates tool outputs and verifies results
 */

import type { ToolResult, ToolConfig } from './types';

export interface ValidationRule {
  name: string;
  validate(output: unknown): boolean;
  errorMessage: string;
}

export class ToolValidator {
  private rules: Map<string, ValidationRule[]> = new Map();

  addRule(toolName: string, rule: ValidationRule): void {
    const existing = this.rules.get(toolName) || [];
    existing.push(rule);
    this.rules.set(toolName, existing);
  }

  async validate(toolName: string, result: ToolResult): Promise<{ valid: boolean; errors: string[] }> {
    const errors: string[] = [];
    const rules = this.rules.get(toolName) || [];

    for (const rule of rules) {
      try {
        if (!rule.validate(result.output)) {
          errors.push(rule.errorMessage);
        }
      } catch (e) {
        errors.push(`Validation error: ${(e as Error).message}`);
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  validateSync(toolName: string, result: ToolResult): boolean {
    const rules = this.rules.get(toolName) || [];
    return rules.every(rule => {
      try {
        return rule.validate(result.output);
      } catch {
        return false;
      }
    });
  }
}

export const toolValidator = new ToolValidator();
