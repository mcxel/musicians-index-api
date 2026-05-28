'use client';

import AdSenseUnit from '@/components/placement/AdSenseUnit';

export interface AdRendererProps {
  zone: string;
  tier?: "free" | "bronze" | "gold" | "platinum" | "diamond";
  className?: string;
}

const FORMAT_MAP: Record<string, 'horizontal' | 'rectangle' | 'auto'> = {
  banner: 'horizontal',
  sidebar: 'rectangle',
  rail: 'rectangle',
  inline: 'auto',
};

function zoneFormat(zone: string): 'horizontal' | 'rectangle' | 'auto' {
  for (const key of Object.keys(FORMAT_MAP)) {
    if (zone.toLowerCase().includes(key)) return FORMAT_MAP[key];
  }
  return 'auto';
}

export default function AdRenderer({ zone, tier = "free", className }: AdRendererProps) {
  return (
    <section
      className={className}
      data-ad-zone={zone}
      data-ad-tier={tier}
      aria-label={`Advertisement — ${zone}`}
      style={{ overflow: 'hidden', borderRadius: 8 }}
    >
      <AdSenseUnit format={zoneFormat(zone)} style={{ width: '100%', minHeight: 90 }} />
    </section>
  );
}
