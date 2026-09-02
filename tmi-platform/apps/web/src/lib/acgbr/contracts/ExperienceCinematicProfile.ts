/**
 * ExperienceCinematicProfile — per-experience DNA for ACGBR presentation.
 * Challenge = objective/precision/contract — NOT Battle VS, NOT Cypher circle, NOT Gauntlet.
 */

export type ExperienceDnaKind =
  | "CHALLENGE"
  | "BATTLE"
  | "CYPHER"
  | "GAUNTLET"
  | "CONCERT"
  | "OTHER";

export type CinematicGravity =
  | "OBJECTIVE_CONTRACT"
  | "VS_CORNERS"
  | "CIRCLE_MIC"
  | "PROGRESSION_RAIL"
  | "STAGE_FORWARD"
  | "GENERIC";

export interface ExperienceCinematicProfile {
  experienceKind: ExperienceDnaKind;
  profileId: string;
  gravity: CinematicGravity;
  /** Semantic negatives — DNA this profile must never present as. */
  forbiddenDna: readonly ExperienceDnaKind[];
  allowsVsLayout: boolean;
  prefersObjectiveContract: boolean;
  allowsWinnerlessRotation: boolean;
  allowsIncumbentGauntletRail: boolean;
  lightingPalette: {
    primary: string;
    secondary: string;
    accent: string;
    ambient: string;
  };
  cameraBias: "CONTRACT" | "CORNERS" | "CIRCLE" | "STAGE" | "RAIL";
  dualPresence: {
    fanAvatarRoomsOk: boolean;
    /** Performer lounges use VideoPanelMotionDirector DNA later — Challenge uses real video. */
    loungeUsesVideoPanels: boolean;
    challengeUsesRealPerformerVideo: boolean;
  };
}

export const CHALLENGE_CINEMATIC_PROFILE_ID = "challenge.cinematic.v1" as const;
