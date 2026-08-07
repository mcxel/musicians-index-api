/**
 * GauntletPresentationSystem — original TMI spectacle overlays (NOT CoD IP).
 * Main + side stages are both visible (jumbotron / PiP), sequenced by run phase.
 */

export type GauntletGraphicKind =
  | "ELIMINATION_BURST"
  | "SURVIVOR_REST"
  | "CHAMPION_CROWN"
  | "ROUND_REDUCER"
  | "FIELD_CONTRACT"
  | "AUDIENCE_VOTE"
  | "FINAL_DUEL"
  | "WHOS_ENTERING"
  | "PERFORMANCE_CLOCK"
  | "PULSE_WAVE"
  | "SIDE_STAGE_WINDOW";

export type GauntletJumbotronData = {
  headline: string;
  subline: string;
  roundLabel: string;
  aliveCount: number;
  clockSeconds: number;
  championName?: string;
  sideStageLabel?: string | null;
  voteOpen?: boolean;
};

export type GauntletPresentationFrame = {
  underlay: "void-grid" | "neon-horizon" | "festival-haze";
  overlay: GauntletGraphicKind | null;
  pulseIntensity: number;
  jumbotron: GauntletJumbotronData;
  accent: string;
};

export function buildGauntletPresentationFrame(input: {
  phase: string;
  roundSize: number;
  roundNumber?: number;
  aliveCount: number;
  clockSeconds: number;
  championName?: string;
  sideStageLabel?: string | null;
  voteOpen?: boolean;
  realPulse?: number;
}): GauntletPresentationFrame {
  const pulse =
    typeof input.realPulse === "number" && Number.isFinite(input.realPulse)
      ? Math.min(1, Math.max(0, input.realPulse))
      : 0;

  let overlay: GauntletGraphicKind | null = "PERFORMANCE_CLOCK";
  let underlay: GauntletPresentationFrame["underlay"] = "neon-horizon";
  let headline = "TMI MUSICAL GAUNTLET";
  let subline = "Main rounds · audience elimination · sequenced side battles";
  const roundTag = input.roundNumber ? `R${input.roundNumber}` : `OF ${input.roundSize}`;

  switch (input.phase) {
    case "REGISTRATION":
      overlay = "WHOS_ENTERING";
      headline = "REGISTRATION";
      subline = "Who's entering the main stage?";
      break;
    case "ROUND_ACTIVE":
      overlay = "ROUND_REDUCER";
      headline = `MAIN ROUND · OF ${input.roundSize}`;
      subline = "Survivors perform · audience watches the main stage";
      break;
    case "AUDIENCE_ELIMINATION_VOTE":
      overlay = "AUDIENCE_VOTE";
      headline = "AUDIENCE ELIMINATION VOTE";
      subline = input.voteOpen
        ? "Voting open — pick who is eliminated (gifts never count)"
        : "Voting closed — tallying real ballots only";
      break;
    case "ELIMINATION_RESULT":
      overlay = "ELIMINATION_BURST";
      underlay = "void-grid";
      headline = "ELIMINATION RESULT";
      subline = "That performer didn't win — queued for the side-battle window";
      break;
    case "SURVIVOR_REST":
    case "SIDE_BATTLE_WINDOW":
      overlay = "SIDE_STAGE_WINDOW";
      underlay = "festival-haze";
      headline = "SIDE BATTLE WINDOW";
      subline = "Survivors rest · eliminated compete visibly (PiP / wall)";
      break;
    case "FIELD_CONTRACT":
      overlay = "FIELD_CONTRACT";
      headline = "FIELD CONTRACTS";
      subline = `${input.aliveCount} survivors return rested · next main round`;
      break;
    case "FINAL":
      overlay = "FINAL_DUEL";
      underlay = "festival-haze";
      headline = "FINAL";
      subline = "Two remain on the main stage";
      break;
    case "CHAMPION":
      overlay = "CHAMPION_CROWN";
      underlay = "festival-haze";
      headline = "GAUNTLET CHAMPION";
      subline = input.championName ? `${input.championName} holds the stage` : "Champion crowned";
      break;
    case "WHOS_ENTERING_NEXT":
      overlay = "WHOS_ENTERING";
      headline = "WHO'S ENTERING NEXT?";
      subline = "Continuous runs — room stays open.";
      break;
    default:
      overlay = "PULSE_WAVE";
      break;
  }

  return {
    underlay,
    overlay,
    pulseIntensity: pulse,
    jumbotron: {
      headline,
      subline,
      roundLabel: roundTag,
      aliveCount: input.aliveCount,
      clockSeconds: input.clockSeconds,
      championName: input.championName,
      sideStageLabel: input.sideStageLabel ?? null,
      voteOpen: input.voteOpen,
    },
    accent: "#FFD700",
  };
}
