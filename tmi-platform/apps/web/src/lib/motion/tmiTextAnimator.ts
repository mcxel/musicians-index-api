export type TextPulseState = "idle" | "pulse-in" | "pulse-out";

export function resolveTextPulseState(now: number, cycleMs = 1600): TextPulseState {
  const phase = now % cycleMs;
  if (phase < cycleMs * 0.33) return "pulse-in";
  if (phase < cycleMs * 0.66) return "idle";
  return "pulse-out";
}

export function animatedWord(word: string, now: number): string {
  const state = resolveTextPulseState(now);
  if (state === "pulse-in") return `◉ ${word}`;
  if (state === "pulse-out") return `${word} ◌`;
  return word;
}
