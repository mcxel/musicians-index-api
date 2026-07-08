'use client';

import React, { useState } from 'react';

interface VenueTicketingButtonProps {
  skuId: string;
  tier: 'vip' | 'standard';
  price: number; // passed in cents
  seatId?: string;
}

export function VenueTicketingButton({ skuId, tier, price, seatId }: VenueTicketingButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/tickets/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventSlug: 'venue-event',
          venueSlug: 'tmi-platform',
          tier: tier.toUpperCase(),
          quantity: 1,
          faceValue: price / 100,
          seatId: seatId || skuId,
        }),
      });

      const data = await res.json();
      
      if (data.url) {
        // Redirect seamlessly to Stripe Checkout
        window.location.href = data.url;
      } else {
        throw new Error(data.error || 'Failed to initialize checkout');
      }
    } catch (err) {
      console.error(err);
      alert('Checkout error. Please verify your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleCheckout}
      disabled={loading}
      style={{
        background: tier === 'vip' ? 'linear-gradient(90deg, #FFD700, #FF6B35)' : 'linear-gradient(90deg, #00FFFF, #00C8FF)',
        color: '#050510',
        padding: '12px 24px',
        borderRadius: 8,
        fontSize: 12,
        fontWeight: 900,
        letterSpacing: '0.1em',
        cursor: loading ? 'not-allowed' : 'pointer',
        border: 'none',
        boxShadow: tier === 'vip' ? '0 4px 15px rgba(255, 215, 0, 0.4)' : '0 4px 15px rgba(0, 255, 255, 0.4)',
        textTransform: 'uppercase'
      }}
    >
      {loading ? 'Processing...' : `Purchase ${tier} Ticket - $${(price / 100).toFixed(2)}`}
    </button>
  );
}
