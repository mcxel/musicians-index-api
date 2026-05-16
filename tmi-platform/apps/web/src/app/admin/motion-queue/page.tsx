import { listMotionQueueRequests } from "@/lib/ai-motion/AiMotionQueueEngine";

export default function AdminMotionQueuePage() {
  const queue = listMotionQueueRequests();

  return (
    <main style={{ padding: 24 }}>
      <h1>Admin Motion Queue</h1>
      <p>Motion queue runtime state.</p>
      <pre>{JSON.stringify(queue, null, 2)}</pre>
    </main>
  );
}
