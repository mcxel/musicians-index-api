// ChaosGridEngine — Non-uniform, race-car sponsor geometry for media tiles.
// Generates clip-paths and positions that match the TMI chaos-tech aesthetic.

export interface ChaosSlot {
  id: string;
  clipPath: string;
  transform: string;
  zIndex: number;
  width: string;
  height: string;
  top: string;
  left: string;
  ambientOpacity: number; // when idle
  focusOpacity: number;   // when active/focused
}

// Predefined "race-car cockpit" clip-path polygons
const CHAOS_SHAPES = [
  "polygon(0% 8%, 92% 0%, 100% 92%, 8% 100%)",
  "polygon(5% 0%, 100% 5%, 95% 100%, 0% 95%)",
  "polygon(0% 0%, 88% 4%, 100% 100%, 12% 96%)",
  "polygon(8% 0%, 100% 0%, 92% 100%, 0% 100%)",
  "polygon(0% 12%, 100% 0%, 88% 88%, 0% 100%)",
  "polygon(4% 4%, 96% 0%, 100% 96%, 0% 100%)",
  "polygon(0% 0%, 100% 8%, 96% 100%, 4% 92%)",
  "polygon(6% 0%, 94% 6%, 100% 94%, 0% 88%)",
];

const CHAOS_ROTATIONS = [-3, 2, -1.5, 3.5, -2.5, 1, -4, 2.5];

// Layout presets for different surface counts
const LAYOUT_PRESETS: Record<number, Array<{ top: string; left: string; width: string; height: string }>> = {
  1: [{ top: "10%", left: "10%", width: "80%", height: "80%" }],
  2: [
    { top: "5%",  left: "2%",  width: "46%", height: "52%" },
    { top: "40%", left: "52%", width: "44%", height: "52%" },
  ],
  3: [
    { top: "2%",  left: "2%",  width: "44%", height: "46%" },
    { top: "2%",  left: "54%", width: "44%", height: "44%" },
    { top: "52%", left: "28%", width: "44%", height: "44%" },
  ],
  4: [
    { top: "2%",  left: "2%",  width: "44%", height: "44%" },
    { top: "2%",  left: "54%", width: "44%", height: "44%" },
    { top: "52%", left: "2%",  width: "44%", height: "44%" },
    { top: "52%", left: "54%", width: "44%", height: "44%" },
  ],
};

export function generateChaosSlots(count: number): ChaosSlot[] {
  const layout = LAYOUT_PRESETS[Math.min(count, 4)] ?? LAYOUT_PRESETS[4];
  return Array.from({ length: count }, (_, i) => ({
    id: `chaos-slot-${i}`,
    clipPath: CHAOS_SHAPES[i % CHAOS_SHAPES.length] ?? CHAOS_SHAPES[0],
    transform: `rotate(${CHAOS_ROTATIONS[i % CHAOS_ROTATIONS.length]}deg)`,
    zIndex: 10 + i,
    width: layout[i]?.width ?? "44%",
    height: layout[i]?.height ?? "44%",
    top: layout[i]?.top ?? "2%",
    left: layout[i]?.left ?? "2%",
    ambientOpacity: 0.35,
    focusOpacity: 1,
  }));
}

export function focusSlot(slot: ChaosSlot): ChaosSlot {
  return {
    ...slot,
    clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)", // rectangular when focused
    transform: "rotate(0deg) scale(1.04)",
    zIndex: 100,
    width: "70%",
    height: "70%",
    top: "15%",
    left: "15%",
    ambientOpacity: 1,
    focusOpacity: 1,
  };
}

export function ambientSlot(slot: ChaosSlot): ChaosSlot {
  return { ...slot, ambientOpacity: 0.2 };
}

// CSS custom-property style object for a slot
export function slotToStyle(slot: ChaosSlot, focused = false): React.CSSProperties {
  return {
    position: "absolute" as const,
    top: slot.top,
    left: slot.left,
    width: slot.width,
    height: slot.height,
    clipPath: slot.clipPath,
    transform: slot.transform,
    zIndex: slot.zIndex,
    opacity: focused ? slot.focusOpacity : slot.ambientOpacity,
    transition: "opacity 0.4s ease, transform 0.4s ease, clip-path 0.5s ease, width 0.5s ease, height 0.5s ease, top 0.5s ease, left 0.5s ease",
    overflow: "hidden",
    borderRadius: 6,
  };
}

// Keep-alive ambient animation CSS — inject once
export const CHAOS_CSS = `
@keyframes chaosAmbientPulse {
  0%, 100% { opacity: 0.35; }
  50%       { opacity: 0.5; }
}
@keyframes chaosFocusEntry {
  from { opacity: 0; transform: scale(0.92); }
  to   { opacity: 1; transform: scale(1); }
}
.chaos-slot-ambient {
  animation: chaosAmbientPulse 4s ease-in-out infinite;
}
.chaos-slot-focus {
  animation: chaosFocusEntry 0.35s ease-out;
}
`;
