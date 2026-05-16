export type VisualGoalState = "active" | "blocked" | "completed";
export type VisualGoalType =
  | "remove-all-stubs"
  | "fill-empty-slots"
  | "upgrade-weak-visuals"
  | "complete-homepage-rotations"
  | "complete-magazine-visuals"
  | "complete-battle-visuals"
  | "complete-venue-skins"
  | "complete-ticket-art";

export type VisualGoal = {
  goalId: string;
  type: VisualGoalType;
  state: VisualGoalState;
  title: string;
  progress: number;
  target: number;
  createdAt: number;
  updatedAt: number;
};

const goals = new Map<string, VisualGoal>();

function id(): string {
  return `vgoal_${Math.random().toString(36).slice(2, 11)}`;
}

export function createGoal(input: Omit<VisualGoal, "goalId" | "createdAt" | "updatedAt">): VisualGoal {
  const now = Date.now();
  const goal: VisualGoal = { ...input, goalId: id(), createdAt: now, updatedAt: now };
  goals.set(goal.goalId, goal);
  return goal;
}

export function trackGoal(goalId: string, progressIncrement = 1): VisualGoal | null {
  const current = goals.get(goalId);
  if (!current) return null;
  const progress = Math.min(current.target, current.progress + progressIncrement);
  const next: VisualGoal = {
    ...current,
    progress,
    state: progress >= current.target ? "completed" : current.state,
    updatedAt: Date.now(),
  };
  goals.set(goalId, next);
  return next;
}

export function completeGoal(goalId: string): VisualGoal | null {
  const current = goals.get(goalId);
  if (!current) return null;
  const next: VisualGoal = { ...current, progress: current.target, state: "completed", updatedAt: Date.now() };
  goals.set(goalId, next);
  return next;
}

export function listGoals(): VisualGoal[] {
  return [...goals.values()].sort((a, b) => b.updatedAt - a.updatedAt);
}
