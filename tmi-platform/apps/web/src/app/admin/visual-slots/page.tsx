import { listSlots } from '@/lib/ai-visuals/VisualSlotRegistry';

export default function AdminVisualSlotsPage() {
  const slots = listSlots();

  return (
    <main style={{ padding: 24 }}>
      <h1>Admin Visual Slots</h1>
      <p>Registered visual slot authority state.</p>
      <pre>{JSON.stringify(slots, null, 2)}</pre>
    </main>
  );
}
