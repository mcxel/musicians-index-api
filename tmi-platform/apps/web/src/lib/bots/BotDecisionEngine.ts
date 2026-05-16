/**
 * BotDecisionEngine
 * Gives bots independent choice capabilities based on active goals, memory signals, and energy levels.
 */
import { randomUUID } from "crypto";

export type DecisionAction = "post" | "comment" | "vote" | "join-room" | "leave-room" | "moderate" | "idle";

export interface DecisionContext {
  botId: string;
  currentRoomId?: string;
  activeGoals: string[];
  memorySignals: string[];
  energyLevel: number;
}

export interface DecisionOutcome {
  decisionId: string;
  botId: string;
  action: DecisionAction;
  confidence: number;
  targetId?: string;
  reasoning: string;
  timestampMs: number;
}

export class BotDecisionEngine {
  private decisions = new Map<string, DecisionOutcome[]>();

  async evaluateAndDecide(context: DecisionContext): Promise<DecisionOutcome> {
    const confidence = Math.max(50, Math.random() * 100);
    let action: DecisionAction = "idle";

    if (context.activeGoals.includes("hype-room") && context.currentRoomId) action = "comment";
    else if (context.energyLevel > 80 && !context.currentRoomId) action = "join-room";
    else if (context.energyLevel < 20 && context.currentRoomId) action = "leave-room";
    else if (context.activeGoals.includes("moderate-chat")) action = "moderate";

    const outcome: DecisionOutcome = {
      decisionId: randomUUID(),
      botId: context.botId,
      action,
      confidence,
      reasoning: `Decided to [${action}] driven by ${context.activeGoals.length} goals and energy at ${context.energyLevel}`,
      timestampMs: Date.now(),
    };

    const history = this.decisions.get(context.botId) || [];
    history.push(outcome);
    this.decisions.set(context.botId, history);

    return outcome;
  }
}

export const botDecisionEngine = new BotDecisionEngine();