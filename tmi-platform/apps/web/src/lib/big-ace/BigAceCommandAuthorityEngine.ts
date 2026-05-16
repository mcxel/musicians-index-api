/**
 * BigAceCommandAuthorityEngine
 * Provides system-wide cross-site command authority.
 * Handles deep operational directives across TMI, XXL, and BernoutGlobal contexts.
 */
export type SystemDomain = "TMI" | "BernoutGlobal" | "XXL" | "Global";

export interface BigAceCommand {
  commandId: string;
  domain: SystemDomain;
  action: "override" | "shutdown" | "promote" | "sync" | "ban" | "audit";
  targetId: string;
  payload: Record<string, any>;
  executedAt: number;
}

export class BigAceCommandAuthorityEngine {
  private commandLog: BigAceCommand[] = [];

  issueCommand(domain: SystemDomain, action: BigAceCommand["action"], targetId: string, payload: Record<string, any>): BigAceCommand {
    const command: BigAceCommand = {
      commandId: `ace-cmd-${Date.now()}`,
      domain, action, targetId, payload, executedAt: Date.now(),
    };
    this.commandLog.unshift(command);
    return command;
  }

  getRecentCommands(limit: number = 50): BigAceCommand[] {
    return this.commandLog.slice(0, limit);
  }
}

export const bigAceCommandAuthorityEngine = new BigAceCommandAuthorityEngine();