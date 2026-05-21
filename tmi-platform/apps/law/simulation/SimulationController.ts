/**
 * Law module simulation controller.
 * Manages predefined simulation scenarios for QA, load testing, and demos.
 */

export type ScenarioId =
  | "basic_question"
  | "credit_purchase_flow"
  | "high_stakes_question"
  | "session_drop_recovery"
  | "payment_failure"
  | "wallet_depletion"
  | "cache_hit_storm";

export interface ScenarioResult {
  scenarioId: ScenarioId;
  success: boolean;
  durationMs: number;
  steps: string[];
  error?: string;
}

export class SimulationController {
  private activeScenario: ScenarioId | null = null;

  async runScenario(id: ScenarioId): Promise<ScenarioResult> {
    if (this.activeScenario) {
      throw new Error(`Scenario ${this.activeScenario} already running`);
    }
    this.activeScenario = id;
    const start = Date.now();
    const steps: string[] = [];

    try {
      await this.execute(id, steps);
      return {
        scenarioId: id,
        success: true,
        durationMs: Date.now() - start,
        steps,
      };
    } catch (err) {
      return {
        scenarioId: id,
        success: false,
        durationMs: Date.now() - start,
        steps,
        error: err instanceof Error ? err.message : String(err),
      };
    } finally {
      this.activeScenario = null;
    }
  }

  private async execute(id: ScenarioId, steps: string[]): Promise<void> {
    switch (id) {
      case "basic_question":
        steps.push("user opens LawBubble widget");
        steps.push("GET /api/law-bubble/wallet → balance: 5");
        steps.push("POST /api/law-bubble/ask-question → stream topic: GENERAL");
        steps.push("POST /api/law-bubble/wallet?action=deduct → balance: 4");
        await delay(120);
        break;

      case "credit_purchase_flow":
        steps.push("user opens buy-credits panel");
        steps.push("POST /api/law-bubble/create-payment → mock intent created");
        steps.push("POST /api/law-bubble/wallet?action=purchase → +12 credits");
        steps.push("wallet balance updated in UI");
        await delay(200);
        break;

      case "high_stakes_question":
        steps.push("user submits CRIMINAL topic question");
        steps.push("isHighStakes() → true");
        steps.push("extra disclaimer injected into stream");
        steps.push("answer includes escalation recommendation");
        await delay(250);
        break;

      case "session_drop_recovery":
        steps.push("SSE stream interrupted mid-response");
        steps.push("client detects stream close");
        steps.push("client retries with same correlationId");
        steps.push("server returns cached partial answer");
        await delay(180);
        break;

      case "payment_failure":
        steps.push("Stripe mock returns failure");
        steps.push("wallet balance unchanged");
        steps.push("error message rendered in UI");
        await delay(100);
        break;

      case "wallet_depletion":
        steps.push("user has 1 credit remaining");
        steps.push("question deducts last credit");
        steps.push("showBuyCredits panel auto-opens");
        await delay(150);
        break;

      case "cache_hit_storm":
        steps.push("50 identical questions submitted");
        steps.push("first question hits cold path → 700ms");
        steps.push("subsequent 49 hit answerCache → <10ms each");
        await delay(80);
        break;

      default: {
        const _exhaustive: never = id;
        throw new Error(`Unknown scenario: ${_exhaustive}`);
      }
    }
  }

  getActiveScenario(): ScenarioId | null {
    return this.activeScenario;
  }
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
