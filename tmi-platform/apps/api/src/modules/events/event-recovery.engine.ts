import { Injectable } from '@nestjs/common';

type RecoveryStage = 1 | 2 | 3 | 4;

type RecoveryAction = {
  stage: RecoveryStage;
  type: 'EXPAND_CATEGORY' | 'CONVERT_TO_MINI' | 'CONVERT_TO_SHOWCASE' | 'BOT_FILL';
  reason: string;
  patch: Record<string, unknown>;
};

@Injectable()
export class EventRecoveryEngine {
  private readonly expansionMap: Record<string, string[]> = {
    BATTLE_RAP: ['HIP_HOP_BATTLE'],
    COUNTRY_CYPHER: ['COUNTRY', 'FOLK'],
    DANCE_BATTLE: ['DANCE', 'FREESTYLE'],
    COMEDY: ['COMEDY', 'OPEN_MIC'],
  };

  buildRecoveryPlan(input: {
    eventClass: string;
    mode: 'mini' | 'standard' | 'large';
    category: string;
    slotsFilled: number;
    slotsRequired: number;
    botFillEnabled?: boolean;
  }) {
    const actions: RecoveryAction[] = [];
    if (input.slotsFilled >= input.slotsRequired) {
      return { recovered: true, actions };
    }

    const expanded = this.expansionMap[input.category] ?? [input.category];
    actions.push({
      stage: 1,
      type: 'EXPAND_CATEGORY',
      reason: 'Insufficient fill rate; widening candidate pool',
      patch: { expandedCategories: expanded },
    });

    if (input.mode !== 'mini' && input.slotsFilled < Math.max(2, Math.floor(input.slotsRequired / 2))) {
      actions.push({
        stage: 2,
        type: 'CONVERT_TO_MINI',
        reason: 'Standard/large lobby underfilled, converting to mini format',
        patch: { mode: 'mini', slotsRequired: Math.min(4, input.slotsRequired), timerMultiplier: 0.6 },
      });
    }

    actions.push({
      stage: 3,
      type: 'CONVERT_TO_SHOWCASE',
      reason: 'Competitive bracket still not viable, fallback to showcase mode',
      patch: { showcaseMode: true, competitiveScoring: false },
    });

    if (input.botFillEnabled) {
      actions.push({
        stage: 4,
        type: 'BOT_FILL',
        reason: 'Optional bot fill enabled to start on time',
        patch: {
          botFill: true,
          missingSlots: Math.max(0, input.slotsRequired - input.slotsFilled),
        },
      });
    }

    return { recovered: false, actions };
  }
}
