import { clickPatternEngine } from './ClickPatternEngine';
import { dropOffAnalysisEngine } from './DropOffAnalysisEngine';
import { retentionPatternEngine } from './RetentionPatternEngine';
import { visualEvolutionEngine } from './VisualEvolutionEngine';
import { botIntelligenceGrowthEngine } from './BotIntelligenceGrowthEngine';
import { ticketDemandEngine } from './TicketDemandEngine';
import { rewardResponseEngine } from './RewardResponseEngine';

export interface ExperienceDirective {
  id: string;
  priority: 'p0' | 'p1' | 'p2';
  area: 'retention' | 'conversion' | 'bots' | 'visuals' | 'navigation';
  action: string;
  rationale: string;
}

export interface RuntimeOptimizationPlan {
  ticketPricingSuggestions: ReturnType<typeof ticketDemandEngine.getPricingSuggestions>;
  rewardTimingPlans: ReturnType<typeof rewardResponseEngine.getRewardTimingPlans>;
  sponsorVisibilityPacing: 'slow' | 'normal' | 'boost';
  fanConversionSurfacePriority: Array<'home' | 'lobby' | 'battle' | 'tickets'>;
}

function directiveId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export class ExperienceOptimizationEngine {
  generateDirectives(): ExperienceDirective[] {
    const directives: ExperienceDirective[] = [];

    const dropHotspots = dropOffAnalysisEngine.getHotspots(5);
    const weakClicks = clickPatternEngine.getWeakTargets(5);
    const retention = retentionPatternEngine.getSummary();
    const weakVisuals = visualEvolutionEngine.analyzeVisualVariants(20).filter((v) => v.recommendation === 'retire').slice(0, 3);
    const weakPrompts = botIntelligenceGrowthEngine
      .getPromptEffectiveness(20)
      .filter((p) => p.recommendation === 'retire prompt')
      .slice(0, 3);

    if (dropHotspots.length > 0) {
      directives.push({
        id: directiveId('dropoff'),
        priority: 'p0',
        area: 'retention',
        action: `Rebuild exit-prone routes first: ${dropHotspots.map((h) => h.route).join(', ')}`,
        rationale: 'Drop-off hotspots show friction in critical routes.',
      });
    }

    if (retention.churnRiskUsers > retention.retainedUsers) {
      directives.push({
        id: directiveId('retention'),
        priority: 'p0',
        area: 'retention',
        action: 'Deploy stronger onboarding nudges, timed rewards, and quicker first-win flow.',
        rationale: 'Churn-risk users currently exceed retained users.',
      });
    }

    if (weakClicks.length > 0) {
      directives.push({
        id: directiveId('conversion'),
        priority: 'p1',
        area: 'conversion',
        action: `Reposition low-performing CTA targets: ${weakClicks.map((w) => w.key).join(', ')}`,
        rationale: 'Weak CTR signals indicate stale or unclear calls to action.',
      });
    }

    if (weakVisuals.length > 0) {
      directives.push({
        id: directiveId('visual'),
        priority: 'p1',
        area: 'visuals',
        action: `Retire weak visual variants and generate new candidates: ${weakVisuals.map((v) => v.variantId).join(', ')}`,
        rationale: 'Weak variants are repeating and suppressing engagement.',
      });
    }

    if (weakPrompts.length > 0) {
      directives.push({
        id: directiveId('bot'),
        priority: 'p1',
        area: 'bots',
        action: `Disable weak bot prompts and retrain replacements: ${weakPrompts.map((p) => p.promptId).join(', ')}`,
        rationale: 'Repeated failed bot behavior should not loop forever.',
      });
    }

    directives.push({
      id: directiveId('navigation'),
      priority: 'p2',
      area: 'navigation',
      action: 'Continuously rotate navigation emphasis toward top-performing destinations.',
      rationale: 'Adaptive routing improves session depth and conversion probability over time.',
    });

    return directives;
  }

  getRuntimeOptimizationPlan(): RuntimeOptimizationPlan {
    const ticketPricingSuggestions = ticketDemandEngine.getPricingSuggestions(8);
    const rewardTimingPlans = rewardResponseEngine.getRewardTimingPlans(8);
    const avgDemand =
      ticketPricingSuggestions.reduce((sum, row) => sum + row.venueDemandIndicator, 0) /
      Math.max(ticketPricingSuggestions.length, 1);

    const sponsorVisibilityPacing: RuntimeOptimizationPlan['sponsorVisibilityPacing'] =
      avgDemand > 70 ? 'boost' : avgDemand > 40 ? 'normal' : 'slow';

    return {
      ticketPricingSuggestions,
      rewardTimingPlans,
      sponsorVisibilityPacing,
      fanConversionSurfacePriority:
        sponsorVisibilityPacing === 'boost'
          ? ['battle', 'tickets', 'lobby', 'home']
          : sponsorVisibilityPacing === 'normal'
          ? ['lobby', 'battle', 'home', 'tickets']
          : ['home', 'lobby', 'tickets', 'battle'],
    };
  }
}

export const experienceOptimizationEngine = new ExperienceOptimizationEngine();
