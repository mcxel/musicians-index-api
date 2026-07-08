export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { AgentRegistry } from "@/stubs/bernout-agent-network";
import { getStripeIncidentStatus, isStripePayoutQueuePaused } from "@/lib/stripe/stripe-incident-engine";
import { getTaskQueue } from "@/lib/admin/MissionControlTaskStore";

export async function GET() {
  const agents = AgentRegistry.getAll();
  const stripeStatus = getStripeIncidentStatus();
  const payoutPaused = isStripePayoutQueuePaused();
  const taskQueue = getTaskQueue();
  const pendingTasks = taskQueue.filter((t) => t.status === "pending");
  const recentTasks = taskQueue.slice(-10).reverse();

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
