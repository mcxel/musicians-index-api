export type DailyWorkCycleRecord = {
  cycleId: string;
  directivesLoaded: number;
  objectivesLoaded: number;
  goalsCreated: number;
  tasksCreated: number;
  workersAssigned: number;
  checkpointsTracked: number;
  achievementsUnlocked: number;
  completionPercent: number;
  startedAt: number;
  endedAt: number;
};

export function runDailyWorkCycle(input: {
  cycleId: string;
  directivesLoaded: number;
  objectivesLoaded: number;
  goalsCreated: number;
  tasksCreated: number;
  workersAssigned: number;
  checkpointsTracked: number;
  achievementsUnlocked: number;
}): DailyWorkCycleRecord {
  const startedAt = Date.now();
  const completionPercent = Math.min(
    100,
    Math.round(
      ((input.tasksCreated + input.workersAssigned + input.checkpointsTracked) /
        Math.max(1, input.tasksCreated * 3)) *
        100
    )
  );

  return {
    ...input,
    completionPercent,
    startedAt,
    endedAt: Date.now(),
  };
}
