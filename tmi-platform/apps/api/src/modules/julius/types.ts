import type { JuliusPointAction } from './actions';

export type JuliusActionClass = 'participation' | 'competition' | 'economy' | 'retention';

export interface JuliusPointsWeight {
  xp: number;
  rewardPoints: number;
  bonusPoints: number;
  seasonPoints: number;
}

export interface JuliusPointRule {
  action: JuliusPointAction;
  label: string;
  actionClass: JuliusActionClass;
  weight: JuliusPointsWeight;
}