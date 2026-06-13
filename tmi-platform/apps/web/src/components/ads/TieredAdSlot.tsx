'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

interface TieredAdSlotProps {
  tier: 'free' | 'pro' | 'silver' | 'gold' | 'gold-platinum' | 'pro-RUBY' | 'platinum' | 'diamond' | string;
  placement: 'leaderboard' | 'in-content' | 'footer-banner' | 'sidebar' | string;
  height?: number;
}

export default function TieredAdSlot({ tier, placement, height = 90 }: TieredAdSlotProps) {
  const [showAd, setShowAd] = useState(true);

  useEffect(() => {
    // Diamond and Platinum users do not see ads (Platform Law)
    if (tier === 'diamond' || tier === 'platinum') {
      setShowAd(false);
    }
  }, [tier]);

  if (!showAd) return null;

  const adContent = placement === 'leaderboard' ? 'TMI SEASON PASS — UPGRADE NOW' : 
                    placement === 'in-content' ? 'BUY EXCLUSIVE BEATS' : 'SECURE YOUR SPONSOR SPOT';
  
  const adLink = placement === 'leaderboard' ? '/pricing' : 
                 placement === 'in-content' ? '/beats/marketplace' : '/sponsor';

  return (
    <div style={{ 
      width: '100%', 
      height, 
      background: 'rgba(255,255,255,0.03)', 
      border: '1px solid rgba(0,255,255,0.2)', 
      borderRadius: '8px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <div style={{ position: 'absolute', top: 4, left: 6, fontSize: 8, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.1em' }}>ADVERTISEMENT</div>
      <Link href={adLink} style={{ textDecoration: 'none', color: '#00FFFF', fontWeight: 900, letterSpacing: '0.1em', fontSize: 'clamp(12px, 2vw, 18px)', textTransform: 'uppercase', fontFamily: "'Bebas Neue','Impact',sans-serif" }}>
        {adContent}
      </Link>
    </div>
  );
}