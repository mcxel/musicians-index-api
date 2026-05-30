export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { AgentRegistry } from "@bernout/agent-network";
import { getStripeIncidentStatus, isStripePayoutQueuePaused } from "@/lib/stripe/stripe-incident-engine";

// In-memory task queue — survives server restarts only while process is alive
export type TaskStatus = "pending" | "approved" | "rejected" | "done";
export type ApprovalTask = {
  id: string;
  title: string;
  description: string;
  requestedBy: string;
  status: TaskStatus;
  createdAt: number;
  resolvedAt?: number;
  resolvedBy?: string;
};

const _taskQueue: ApprovalTask[] = [
  {
    id: "task-001",
    title: "Activate Beat Locker marketplace",
    description: "Publish 6 seed beats to the public Beat Locker store",
    requestedBy: "michael-charlie",
    status: "pending",
    createdAt: Date.now() - 3600_000,
  },
  {
    id: "task-002",
    title: "Enable Stripe live mode",
    description: "Switch STRIPE_SECRET_KEY from test to live and verify webhook signing secret",
    requestedBy: "michael-charlie",
    status: "pending",
    createdAt: Date.now() - 7200_000,
  },
];

export function getTaskQueue(): ApprovalTask[] {
  return _taskQueue;
}

export function approveTask(taskId: string, actorName: string): boolean {
  const task = _taskQueue.find((t) => t.id === taskId);
  if (!task || task.status !== "pending") return false;
  task.status = "approved";
  task.resolvedAt = Date.now();
  task.resolvedBy = actorName;
  return true;
}

export function rejectTask(taskId: string, actorName: string): boolean {
  const task = _taskQueue.find((t) => t.id === taskId);
  if (!task || task.status !== "pending") return false;
  task.status = "rejected";
  task.resolvedAt = Date.now();
  task.resolvedBy = actorName;
  return true;
}

export function addTask(task: Omit<ApprovalTask, "id" | "createdAt" | "status">): ApprovalTask {
  const newTask: ApprovalTask = {
    ...task,
    id: `task-${Date.now()}`,
    createdAt: Date.now(),
    status: "pending",
  };
  _taskQueue.push(newTask);
  return newTask;
}

export async function GET() {
  const agents = AgentRegistry.getAll();
  const stripeStatus = getStripeIncidentStatus();
  const payoutPaused = isStripePayoutQueuePaused();
  const pendingTasks = _taskQueue.filter((t) => t.status === "pending");
  const recentTasks = _taskQueue.slice(-10).reverse();

  return NextResponse.json({
    ok: true,
    timestamp: new Date().toISOString(),
    agents: agents.map((a) => ({
      id: a.id,
      name: a.name,
      role: a.role,
      health: a.health,
      currentGoal: a.currentGoal,
      currentAssignment: a.currentAssignment,
      checkpoints: a.checkpoints,
      tasks: a.tasks,
      reportsTo: a.reportsTo,
    })),
    stripe: {
      payoutPaused,
      incidentCount: stripeStatus.recentIncidents.length,
      latestSeverity: stripeStatus.recentIncidents[0]?.severity ?? null,
      latestMessage: stripeStatus.recentIncidents[0]?.message ?? null,
    },
    approvalQueue: {
      pending: pendingTasks.length,
      tasks: recentTasks,
    },
  });
}
