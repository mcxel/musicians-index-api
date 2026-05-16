import { listMotionSlots } from "@/lib/ai-motion/AiMotionSlotRegistry";

export default function AdminMotionSlotsPage() {
  const slots = listMotionSlots();

  return (
    <main style={{ padding: 24 }}>
      <h1>Admin Motion Slots</h1>
      <p>Motion slot ownership and state.</p>
      <pre>{JSON.stringify(slots, null, 2)}</pre>
    </main>
  );
}
