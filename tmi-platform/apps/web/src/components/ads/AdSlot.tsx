// AdSlot — Slice 2 placeholder
// Thin wrapper around AdRenderer for named zone placement
// Wired by Copilot in Slice 2 (AdRenderer/sponsors)

import AdRenderer from "./AdRenderer";

export interface AdSlotProps {
  zone: string;
  tier?: "free" | "bronze" | "gold" | "platinum" | "diamond";
  className?: string;
}

export default function AdSlot({ zone, tier, className }: AdSlotProps) {
  return <AdRenderer zone={zone} tier={tier} className={className} />;
}
