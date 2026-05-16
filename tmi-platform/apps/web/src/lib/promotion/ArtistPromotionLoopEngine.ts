import { ArtistExposureEngine } from "@/lib/promotion/ArtistExposureEngine";

export type PromotionStage = "rank" | "publish" | "promote" | "share" | "ticket" | "index";

export interface PromotionLoopStep {
  stage: PromotionStage;
  completed: boolean;
  completedAt?: string;
  detail: string;
}

export interface ArtistPromotionLoop {
  artistSlug: string;
  score: number;
  startedAt: string;
  updatedAt: string;
  steps: PromotionLoopStep[];
}

const DEFAULT_STEPS: PromotionStage[] = ["rank", "publish", "promote", "share", "ticket", "index"];

const loopRegistry = new Map<string, ArtistPromotionLoop>();

export class ArtistPromotionLoopEngine {
  static ensureLoop(artistSlug: string): ArtistPromotionLoop {
    const existing = loopRegistry.get(artistSlug);
    if (existing) return existing;

    const now = new Date().toISOString();
    const loop: ArtistPromotionLoop = {
      artistSlug,
      score: 0,
      startedAt: now,
      updatedAt: now,
      steps: DEFAULT_STEPS.map((stage) => ({
        stage,
        completed: false,
        detail: this.defaultStepDetail(stage),
      })),
    };

    loopRegistry.set(artistSlug, loop);
    return loop;
  }

  static completeStep(artistSlug: string, stage: PromotionStage, detail?: string): ArtistPromotionLoop {
    const loop = this.ensureLoop(artistSlug);
    const now = new Date().toISOString();

    loop.steps = loop.steps.map((step) => {
      if (step.stage !== stage) return step;
      return {
        ...step,
        completed: true,
        completedAt: now,
        detail: detail ?? step.detail,
      };
    });

    loop.score = this.calculateScore(loop);
    loop.updatedAt = now;
    loopRegistry.set(artistSlug, loop);
    return loop;
  }

  static buildAutomationGraph(artistSlug: string): Record<string, string[]> {
    const exposure = ArtistExposureEngine.buildGraph(artistSlug);
    return {
      rank: [exposure.profile, exposure.genreHub, exposure.countryHub],
      publish: exposure.articles,
      promote: exposure.billboards,
      share: exposure.musicLinks,
      ticket: exposure.tickets,
      index: [exposure.profile, ...exposure.articles, ...exposure.billboards],
    };
  }

  static getLoop(artistSlug: string): ArtistPromotionLoop {
    return this.ensureLoop(artistSlug);
  }

  static getCompletionRate(artistSlug: string): number {
    const loop = this.ensureLoop(artistSlug);
    const completeCount = loop.steps.filter((step) => step.completed).length;
    return Math.round((completeCount / loop.steps.length) * 100);
  }

  static listActiveLoops(): ArtistPromotionLoop[] {
    return Array.from(loopRegistry.values()).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }

  private static calculateScore(loop: ArtistPromotionLoop): number {
    const weights: Record<PromotionStage, number> = {
      rank: 15,
      publish: 15,
      promote: 20,
      share: 15,
      ticket: 15,
      index: 20,
    };

    return loop.steps.reduce((score, step) => {
      if (!step.completed) return score;
      return score + weights[step.stage];
    }, 0);
  }

  private static defaultStepDetail(stage: PromotionStage): string {
    switch (stage) {
      case "rank":
        return "Position artist on ranking surfaces";
      case "publish":
        return "Publish artist stories and updates";
      case "promote":
        return "Push billboard and discovery promotions";
      case "share":
        return "Distribute artist links across social surfaces";
      case "ticket":
        return "Attach ticket and event conversion endpoints";
      case "index":
        return "Submit final discoverable URLs for indexing";
      default:
        return "Promotion step";
    }
  }
}

export default ArtistPromotionLoopEngine;
