import { listQueueRequests, prioritizeQueue } from "@/lib/ai-visuals/AiVisualQueueEngine";
import { listSlots } from "@/lib/ai-visuals/VisualSlotRegistry";

export default function BigAceVisualsPage() {
  const queue = listQueueRequests();
  const prioritized = prioritizeQueue();
  const slots = listSlots();

  return (
    <main style={{ padding: 24 }}>
      <h1>Big Ace Visual Command</h1>
      <p>Queue authority, slot ownership, and replacement command surface.</p>

      <h2>Prioritized Queue</h2>
      <pre>{JSON.stringify(prioritized, null, 2)}</pre>

      <h2>All Queue</h2>
      <pre>{JSON.stringify(queue, null, 2)}</pre>

      <h2>Slots</h2>
      <pre>{JSON.stringify(slots, null, 2)}</pre>
    </main>
  );
}
