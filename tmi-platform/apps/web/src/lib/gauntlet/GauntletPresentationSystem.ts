/**
 * GauntletPresentationSystem — original TMI spectacle overlays (NOT CoD IP).
 * Scaffold: overlays/underlays, Pulse, jumbotron data, elimination/survive/champion graphics.
 */

export type GauntletGraphicKind =
  | "ELIMINATION_BURST"
  | "SURVIVOR_LOCK"
  | "CHAMPION_CROWN"
  | "ROUND_REDUCER"
  | "WHOS_ENTERING"
  | "PERFORMANCE_CLOCK"
  | "PULSE_WAVE";

export type GauntletJumbotronData = {
  headline: string;
  subline: string;
  roundLabel: string;
  aliveCount: number;
  clockSeconds: number;
  championName?: string;
};

export type GauntletPresentationFrame = {
  underlay: "void-grid" | "neon-horizon" | "festival-haze";
  overlay: GauntletGraphicKind | null;
  pulseIntensity: number; // 0–1 from real room energy when available
  jumbotron: GauntletJumbotronData;
  accent: string;
};

export function buildGauntletPresentationFrame(input: {
  phase: string;
  roundSize: number;
  aliveCount: number;
  clockSeconds: number;
  championName?: string;
  /** Real energy 0–1 only — never fabricate crowd energy. */
  realPulse?: number;
}): GauntletPresentationFrame {
  const pulse =
    typeof input.realPulse === "number" && Number.isFinite(input.realPulse)
      ? Math.min(1, Math.max(0, input.realPulse))
      : 0;

  let overlay: GauntletGraphicKind | null = "PERFORMANCE_CLOCK";
  let underlay: GauntletPresentationFrame["underlay"] = "neon-horizon";
  let headline = "TMI MUSICAL GAUNTLET";
  let subline = "One life. Survive the round.";

  switch (input.phase) {
    case "ELIMINATION":
      overlay = "ELIMINATION_BURST";
      underlay = "void-grid";
      headline = "ELIMINATED";
      subline = "Stay in the venue — watch the survivors.";
      break;
    case "SURVIVOR_REVEAL":
      overlay = "SURVIVOR_LOCK";
      headline = "SURVIVORS LOCKED";
      subline = `${input.aliveCount} remain · next cut ${input.roundSize}`;
      break;
    case "CHAMPION_CEREMONY":
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
    case "ROUND_ACTIVE":
      overlay = "ROUND_REDUCER";
      headline = `ROUND OF ${input.roundSize}`;
      subline = "Performance clock is live";
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
      roundLabel: `R${input.roundSize}`,
      aliveCount: input.aliveCount,
      clockSeconds: input.clockSeconds,
      championName: input.championName,
    },
    accent: "#FFD700",
  };
}
