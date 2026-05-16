import { listQueueRequests } from "@/lib/ai-visuals/AiVisualQueueEngine";

export default function AdminVisualQueuePage() {
  const items = listQueueRequests();

  return (
    <main style={{ padding: 24 }}>
      <h1>Admin Visual Queue</h1>
      <p>Operational queue view (in-memory runtime).</p>
      <pre>{JSON.stringify(items, null, 2)}</pre>
    </main>
  );
}
