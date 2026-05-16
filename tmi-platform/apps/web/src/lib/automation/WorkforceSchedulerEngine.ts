import {
  runBigAceWorkCycle,
  type BigAceWorkCycleRecord,
} from '@/lib/automation/BigAceWorkCycleEngine';
import {
  runDailyWorkCycle,
  type DailyWorkCycleRecord,
} from '@/lib/automation/DailyWorkCycleEngine';
import { runMCWorkCycle, type MCWorkCycleRecord } from '@/lib/automation/MCWorkCycleEngine';
import {
  runMonthlyWorkCycle,
  type MonthlyWorkCycleRecord,
} from '@/lib/automation/MonthlyWorkCycleEngine';
import {
  runWeeklyWorkCycle,
  type WeeklyWorkCycleRecord,
} from '@/lib/automation/WeeklyWorkCycleEngine';
import {
  runYearlyWorkCycle,
  type YearlyWorkCycleRecord,
} from '@/lib/automation/YearlyWorkCycleEngine';

export type WorkforceSchedulerSnapshot = {
  schedulerId: string;
  daily: DailyWorkCycleRecord;
  weekly: WeeklyWorkCycleRecord;
  monthly: MonthlyWorkCycleRecord;
  yearly: YearlyWorkCycleRecord;
  mc: MCWorkCycleRecord;
  bigAce: BigAceWorkCycleRecord;
  updatedAt: number;
};

const snapshots = new Map<string, WorkforceSchedulerSnapshot>();

export function runWorkforceScheduler(input: {
  schedulerId: string;
  daily: Parameters<typeof runDailyWorkCycle>[0];
  weekly: Parameters<typeof runWeeklyWorkCycle>[0];
  monthly: Parameters<typeof runMonthlyWorkCycle>[0];
  yearly: Parameters<typeof runYearlyWorkCycle>[0];
  mc: Parameters<typeof runMCWorkCycle>[0];
  bigAce: Parameters<typeof runBigAceWorkCycle>[0];
}): WorkforceSchedulerSnapshot {
  const next: WorkforceSchedulerSnapshot = {
    schedulerId: input.schedulerId,
    daily: runDailyWorkCycle(input.daily),
    weekly: runWeeklyWorkCycle(input.weekly),
    monthly: runMonthlyWorkCycle(input.monthly),
    yearly: runYearlyWorkCycle(input.yearly),
    mc: runMCWorkCycle(input.mc),
    bigAce: runBigAceWorkCycle(input.bigAce),
    updatedAt: Date.now(),
  };

  snapshots.set(next.schedulerId, next);
  return next;
}

export function getWorkforceSchedulerSnapshot(
  schedulerId: string
): WorkforceSchedulerSnapshot | null {
  return snapshots.get(schedulerId) ?? null;
}

export function listWorkforceSchedulerSnapshots(): WorkforceSchedulerSnapshot[] {
  return [...snapshots.values()].sort((a, b) => b.updatedAt - a.updatedAt);
}
