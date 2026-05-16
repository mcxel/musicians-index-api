/**
 * Barrel export — ceremony system
 */
export { winnerCeremonyEngine, PHASE_DURATIONS, PHASE_ORDER } from "./WinnerCeremonyEngine";
export type { CeremonyPhase, BattleContext, CeremonyParticipant, CeremonyResult } from "./WinnerCeremonyEngine";

export { victoryOverlayEngine } from "./VictoryOverlayEngine";
export type { OverlayState } from "./VictoryOverlayEngine";

export { crownTransferEngine } from "./CrownTransferEngine";
export type { CrownContext, CrownHolder, CrownTransferRecord } from "./CrownTransferEngine";

export { confettiEngine } from "./ConfettiEngine";
export type { ConfettiBurst, ConfettiParticle } from "./ConfettiEngine";

export { rewardSplashEngine } from "./RewardSplashEngine";
export type { RewardSplash, RewardLine, RewardSplashParams } from "./RewardSplashEngine";

export { ceremonyPhraseEngine } from "./CeremonyPhraseEvolutionEngine";
export type { CeremonyPhrasePick, PhraseContext, PhraseEngagementFeedback } from "./CeremonyPhraseEvolutionEngine";

export { ceremonyCameraDirector } from "./CeremonyCameraDirectorEngine";
export type { CameraShot, CameraDirective, CameraSequence } from "./CeremonyCameraDirectorEngine";

export { ceremonyCloseoutEngine } from "./CeremonyCloseoutEngine";
export type { CloseoutPhase, CloseoutState } from "./CeremonyCloseoutEngine";
