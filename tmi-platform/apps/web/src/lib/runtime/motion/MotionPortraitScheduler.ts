import type { ChatRoomId } from '@/lib/chat/RoomChatEngine';

export interface MotionPortraitTask {
  taskId: string;
  roomId: ChatRoomId;
  portraitId: string;
  visible: boolean;
  offscreen: boolean;
  targetFps: number;
  budgetWeight: number;
  idle: boolean;
  updatedAtMs: number;
}

interface SchedulerState {
  roomId: ChatRoomId;
  frameBudgetMs: number;
  maxTasksPerTick: number;
  processedThisTick: number;
  droppedThisTick: number;
  lastTickAtMs: number;
}

const tasksByRoom = new Map<ChatRoomId, Map<string, MotionPortraitTask>>();
const schedulerByRoom = new Map<ChatRoomId, SchedulerState>();

function roomTasks(roomId: ChatRoomId): Map<string, MotionPortraitTask> {
  const existing = tasksByRoom.get(roomId);
  if (existing) return existing;
  const next = new Map<string, MotionPortraitTask>();
  tasksByRoom.set(roomId, next);
  return next;
}

function roomScheduler(roomId: ChatRoomId): SchedulerState {
  const existing = schedulerByRoom.get(roomId);
  if (existing) return existing;
  const next: SchedulerState = {
    roomId,
    frameBudgetMs: 5,
    maxTasksPerTick: 12,
    processedThisTick: 0,
    droppedThisTick: 0,
    lastTickAtMs: 0,
  };
  schedulerByRoom.set(roomId, next);
  return next;
}

export function registerMotionPortraitTask(input: {
  roomId: ChatRoomId;
  taskId: string;
  portraitId: string;
  visible: boolean;
  offscreen?: boolean;
  targetFps?: number;
  budgetWeight?: number;
  idle?: boolean;
}): MotionPortraitTask {
  const now = Date.now();
  const task: MotionPortraitTask = {
    taskId: input.taskId,
    roomId: input.roomId,
    portraitId: input.portraitId,
    visible: input.visible,
    offscreen: input.offscreen ?? false,
    targetFps: Math.max(1, Math.min(60, input.targetFps ?? 24)),
    budgetWeight: Math.max(1, input.budgetWeight ?? 1),
    idle: input.idle ?? false,
    updatedAtMs: now,
  };

  roomTasks(input.roomId).set(task.taskId, task);
  return task;
}

export function unregisterMotionPortraitTask(roomId: ChatRoomId, taskId: string): boolean {
  return roomTasks(roomId).delete(taskId);
}

export function runMotionPortraitSchedulerTick(roomId: ChatRoomId): {
  processed: MotionPortraitTask[];
  suspended: MotionPortraitTask[];
  scheduler: SchedulerState;
} {
  const scheduler = roomScheduler(roomId);
  const now = Date.now();
  scheduler.lastTickAtMs = now;
  scheduler.processedThisTick = 0;
  scheduler.droppedThisTick = 0;

  const tasks = [...roomTasks(roomId).values()];

  // Visibility-first scheduling with idle degradation.
  tasks.sort((a, b) => {
    if (Number(b.visible) !== Number(a.visible)) return Number(b.visible) - Number(a.visible);
    if (Number(a.offscreen) !== Number(b.offscreen)) return Number(a.offscreen) - Number(b.offscreen);
    if (Number(a.idle) !== Number(b.idle)) return Number(a.idle) - Number(b.idle);
    return b.budgetWeight - a.budgetWeight;
  });

  const processed: MotionPortraitTask[] = [];
  const suspended: MotionPortraitTask[] = [];

  let budgetLeft = scheduler.frameBudgetMs;
  for (const task of tasks) {
    // Offscreen suspension.
    if (task.offscreen || !task.visible) {
      suspended.push(task);
      scheduler.droppedThisTick += 1;
      continue;
    }

    // Idle degradation mode.
    const effectiveFps = task.idle ? Math.max(6, Math.floor(task.targetFps / 2)) : task.targetFps;
    const estimatedCost = Math.max(0.2, task.budgetWeight * (effectiveFps / 60));

    if (processed.length >= scheduler.maxTasksPerTick || budgetLeft - estimatedCost < 0) {
      suspended.push({ ...task, idle: true });
      scheduler.droppedThisTick += 1;
      continue;
    }

    budgetLeft -= estimatedCost;
    processed.push(task);
    scheduler.processedThisTick += 1;
  }

  schedulerByRoom.set(roomId, scheduler);
  return { processed, suspended, scheduler: { ...scheduler } };
}

export function tuneMotionPortraitBudget(input: {
  roomId: ChatRoomId;
  frameBudgetMs?: number;
  maxTasksPerTick?: number;
}) {
  const scheduler = roomScheduler(input.roomId);
  if (typeof input.frameBudgetMs === 'number') {
    scheduler.frameBudgetMs = Math.max(1, input.frameBudgetMs);
  }
  if (typeof input.maxTasksPerTick === 'number') {
    scheduler.maxTasksPerTick = Math.max(1, input.maxTasksPerTick);
  }
  schedulerByRoom.set(input.roomId, scheduler);
  return { ...scheduler };
}

export function getMotionPortraitDiagnostics(roomId?: ChatRoomId) {
  const roomIds = roomId ? [roomId] : [...tasksByRoom.keys()];
  return roomIds.map((id) => {
    const tasks = [...roomTasks(id).values()];
    const scheduler = roomScheduler(id);
    return {
      roomId: id,
      totalTasks: tasks.length,
      visibleTasks: tasks.filter((task) => task.visible && !task.offscreen).length,
      offscreenTasks: tasks.filter((task) => task.offscreen).length,
      idleTasks: tasks.filter((task) => task.idle).length,
      scheduler,
    };
  });
}
