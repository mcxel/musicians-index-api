import { listMotionQueueRequests, prioritizeMotionQueue } from "@/lib/ai-motion/AiMotionQueueEngine";
import { listMotionSlots } from "@/lib/ai-motion/AiMotionSlotRegistry";
import { listMotionDeployments } from "@/lib/ai-motion/AiMotionDeploymentEngine";

export default function BigAceMotionPage() {
  const queue = listMotionQueueRequests();
  const prioritized = prioritizeMotionQueue();
  const slots = listMotionSlots();
  const deployments = listMotionDeployments();

  return (
    <main style={{ padding: 24 }}>
      <h1>Big Ace Motion Command</h1>
      <p>Motion command center for queue, slots, deployments.</p>

      <h2>Prioritized Queue</h2>
      <pre>{JSON.stringify(prioritized, null, 2)}</pre>

      <h2>All Queue</h2>
      <pre>{JSON.stringify(queue, null, 2)}</pre>

      <h2>Slots</h2>
      <pre>{JSON.stringify(slots, null, 2)}</pre>

      <h2>Deployments</h2>
      <pre>{JSON.stringify(deployments, null, 2)}</pre>
    </main>
  );
}
