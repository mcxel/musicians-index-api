'use client';

import { useEffect, useRef } from 'react';

export interface TMIAdSenseUnitProps {
  slotId: string;
  format?: 'auto' | 'fluid' | 'rectangle' | 'horizontal' | 'vertical';
  responsive?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export default function TMIAdSenseUnit({
  slotId,
  format = 'auto',
  responsive = true,
  className,
  style,
}: TMIAdSenseUnitProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const adClientId = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID || 'ca-pub-tmi-platform';

  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && containerRef.current) {
        const win = window as unknown as { adsbygoogle?: unknown[] };
        win.adsbygoogle = win.adsbygoogle || [];
        win.adsbygoogle.push({});
      }
    } catch (err) {
      console.warn('[TMIAdSenseUnit] Error initializing Google AdSense slot:', err);
    }
  }, [slotId]);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        width: '100%',
        overflow: 'hidden',
        minHeight: 90,
        background: 'rgba(5, 5, 16, 0.4)',
        border: '1px dashed rgba(255, 215, 0, 0.18)',
        borderRadius: 6,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBlock: 8,
        ...style,
      }}
    >
      <ins
        className="adsbygoogle"
        style={{ display: 'block', width: '100%', height: '100%' }}
        data-ad-client={adClientId}
        data-ad-slot={slotId}
        data-ad-format={format}
        data-full-width-responsive={responsive ? 'true' : 'false'}
      />
    </div>
  );
}
