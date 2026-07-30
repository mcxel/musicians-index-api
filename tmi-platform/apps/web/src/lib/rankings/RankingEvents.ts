/**
 * RankingEvents — thin EventTarget bus for Universal Ranking + Orbital Wheel.
 *
 * Events: RANK_ENTERED | RANK_MOVED | RANK_EXITED | ORBITAL_CROWN_CHANGED
 * Scope: human-over-bot ranking sync only — not analytics taxonomy / presence.
 */

export type RankingEventType =
  | 'RANK_ENTERED'
  | 'RANK_MOVED'
  | 'RANK_EXITED'
  | 'ORBITAL_CROWN_CHANGED';

export interface RankEnteredDetail {
  profileId: string;
  rank: number;
  points: number;
  kind: 'human' | 'bot' | 'placeholder';
}

export interface RankMovedDetail {
  profileId: string;
  fromRank: number;
  toRank: number;
  points: number;
  kind: 'human' | 'bot' | 'placeholder';
}

export interface RankExitedDetail {
  profileId: string;
  previousRank: number;
  kind: 'human' | 'bot' | 'placeholder';
}

export interface OrbitalCrownChangedDetail {
  previousCrownProfileId: string | null;
  crownProfileId: string | null;
  crownDisplayName: string | null;
  crownProfileRoute: string | null;
}

type RankingEventDetailMap = {
  RANK_ENTERED: RankEnteredDetail;
  RANK_MOVED: RankMovedDetail;
  RANK_EXITED: RankExitedDetail;
  ORBITAL_CROWN_CHANGED: OrbitalCrownChangedDetail;
};

type RankingHandler<T extends RankingEventType> = (detail: RankingEventDetailMap[T]) => void;

class RankingEventBus {
  private readonly target = new EventTarget();

  emit<T extends RankingEventType>(type: T, detail: RankingEventDetailMap[T]): void {
    this.target.dispatchEvent(new CustomEvent(type, { detail }));
  }

  on<T extends RankingEventType>(type: T, handler: RankingHandler<T>): () => void {
    const listener = ((event: Event) => {
      handler((event as CustomEvent<RankingEventDetailMap[T]>).detail);
    }) as EventListener;
    this.target.addEventListener(type, listener);
    return () => this.target.removeEventListener(type, listener);
  }
}

export const rankingEvents = new RankingEventBus();
