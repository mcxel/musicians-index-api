/**
 * ChallengeCinematicProfile — Challenge DNA for ACGBR.
 * Objective / precision / contract — NOT Battle VS, NOT Cypher circle, NOT Gauntlet.
 */

import {
  CHALLENGE_CINEMATIC_PROFILE_ID,
  type ExperienceCinematicProfile,
} from "../contracts/ExperienceCinematicProfile";

export const ChallengeCinematicProfile: ExperienceCinematicProfile =
  Object.freeze({
    experienceKind: "CHALLENGE",
    profileId: CHALLENGE_CINEMATIC_PROFILE_ID,
    gravity: "OBJECTIVE_CONTRACT",
    forbiddenDna: Object.freeze(["BATTLE", "CYPHER", "GAUNTLET"] as const),
    allowsVsLayout: false,
    prefersObjectiveContract: true,
    allowsWinnerlessRotation: false,
    allowsIncumbentGauntletRail: false,
    lightingPalette: Object.freeze({
      primary: "#FFD700",
      secondary: "#00FFFF",
      accent: "#50C878",
      ambient: "#050714",
    }),
    cameraBias: "CONTRACT",
    dualPresence: Object.freeze({
      fanAvatarRoomsOk: true,
      loungeUsesVideoPanels: true,
      challengeUsesRealPerformerVideo: true,
    }),
  });

/** Semantic negatives for cert gates. */
export function assertChallengeDnaNotBattle(
  profile: ExperienceCinematicProfile = ChallengeCinematicProfile
): boolean {
  return (
    profile.experienceKind === "CHALLENGE" &&
    profile.gravity === "OBJECTIVE_CONTRACT" &&
    profile.allowsVsLayout === false &&
    profile.forbiddenDna.includes("BATTLE")
  );
}

export function assertChallengeDnaNotCypher(
  profile: ExperienceCinematicProfile = ChallengeCinematicProfile
): boolean {
  return (
    profile.prefersObjectiveContract &&
    profile.allowsWinnerlessRotation === false &&
    profile.forbiddenDna.includes("CYPHER")
  );
}

export function assertChallengeDnaNotGauntlet(
  profile: ExperienceCinematicProfile = ChallengeCinematicProfile
): boolean {
  return (
    profile.allowsIncumbentGauntletRail === false &&
    profile.forbiddenDna.includes("GAUNTLET")
  );
}
