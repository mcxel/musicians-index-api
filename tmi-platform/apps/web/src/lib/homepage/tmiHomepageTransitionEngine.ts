export type TransitionPhase =
  | "hold"
  | "spin"
  | "burst-ignition"
  | "starfield-spread"
  | "feather-dissolve"
  | "reveal";

export type TransitionStep = {
  phase: TransitionPhase;
  durationMs: number;
};

const DEFAULT_STEPS: TransitionStep[] = [
  { phase: "hold", durationMs: 18000 },
  { phase: "spin", durationMs: 1200 },
  { phase: "burst-ignition", durationMs: 450 },
  { phase: "starfield-spread", durationMs: 950 },
  { phase: "feather-dissolve", durationMs: 700 },
  { phase: "reveal", durationMs: 1200 },
];

export function getHomepageTransitionSteps() {
  return DEFAULT_STEPS;
}

export function getTransitionTotalMs() {
  return DEFAULT_STEPS.reduce((acc, s) => acc + s.durationMs, 0);
}

export function createHomepageTransition(_mode: string) {
  const steps = getHomepageTransitionSteps();
  return {
    phase: steps[0]?.phase ?? "hold",
    steps,
    totalMs: getTransitionTotalMs(),
  };
}
