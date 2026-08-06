/**
 * Universal Ranking (MJ Rule) — public surface for Orbital Wheel + Home 1/1-2.
 */
export { compareRank, sortByRank, isHumanActive } from './compareRank';
export type { RankComparable, RankKind } from './compareRank';

export { rankingEvents } from './RankingEvents';
export type {
  RankingEventType,
  RankEnteredDetail,
  RankMovedDetail,
  RankExitedDetail,
  OrbitalCrownChangedDetail,
} from './RankingEvents';

export {
  ORBITAL_TOP_N,
  buildRankingSlots,
  collectRankCandidates,
  publishUniversalRankingSnapshot,
  getUniversalRankingSnapshot,
  subscribeUniversalRanking,
  getOrbitalTopSlots,
  setHumanRankPoints,
  addHumanRankPoints,
  clearHumanRankPoints,
} from './UniversalRankingSnapshot';
export type {
  RankCandidate,
  RankSlot,
  UniversalRankingSnapshot,
} from './UniversalRankingSnapshot';
