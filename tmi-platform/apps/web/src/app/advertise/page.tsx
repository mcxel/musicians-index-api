'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

export default function AdvertiseCheckoutPage() {
  const searchParams = useSearchParams();
  const packageId = searchParams?.get('package') || 'magazine-inline';
  
  const [brandName, setBrandName] = useState('');
  const [targetUrl, setTargetUrl] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    
    try {
      // Determine price based on package
      const price = packageId === 'arena-stage-sponsor' ? 499 : packageId === 'lobby-wall-featured' ? 199 : 99;
      
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          product: 'ADVERTISEMENT', 
          tier: packageId, 
          amount: price,
          metadata: { brandName, targetUrl, imageUrl }
        })
      });
      
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url; // Redirect to Stripe
      }
    } catch (err) {
      console.error(err);
      setIsProcessing(false);
    }
  };

  return (
    <main style={{ minHeight: '100vh', background: '#050510', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <form onSubmit={handleCheckout} style={{
        width: '100%', maxWidth: 500,
        background: 'rgba(20,25,35,0.6)',
        backdropFilter: 'blur(30px)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 16,
        padding: 32,
        boxShadow: '0 20px 40px rgba(0,0,0,0.5)'
      }}>
        <div style={{ fontSize: 10, fontWeight: 900, letterSpacing: '0.2em', color: '#FFD700', textTransform: 'uppercase', marginBottom: 8 }}>
          Campaign Setup
        </div>
        <h1 style={{ fontSize: 24, fontWeight: 900, textTransform: 'uppercase', margin: '0 0 24px' }}>
          Configure Placement
        </h1>

        <div style={{ marginBottom: 20 }}>
          <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', marginBottom: 8 }}>Brand Name</label>
          <input 
            required type="text" value={brandName} onChange={e => setBrandName(e.target.value)}
            placeholder="e.g. SoundWave Audio"
            style={{ width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '12px 16px', color: '#fff', fontSize: 14, outline: 'none' }} 
          />
        </div>

        <div style={{ marginBottom: 20 }}>
          <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', marginBottom: 8 }}>Target URL (Click Destination)</label>
          <input 
            required type="url" value={targetUrl} onChange={e => setTargetUrl(e.target.value)}
            placeholder="https://..."
            style={{ width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '12px 16px', color: '#fff', fontSize: 14, outline: 'none' }} 
          />
        </div>

        <div style={{ marginBottom: 32 }}>
          <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', marginBottom: 8 }}>Creative Asset URL (1920x1080)</label>
          <input 
            required type="url" value={imageUrl} onChange={e => setImageUrl(e.target.value)}
            placeholder="https://..."
            style={{ width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '12px 16px', color: '#fff', fontSize: 14, outline: 'none' }} 
          />
        </div>

        <button 
          disabled={isProcessing}
          type="submit"
          style={{
            width: '100%',
            padding: '16px',
            background: isProcessing ? 'rgba(255,215,0,0.3)' : '#FFD700',
            border: 'none',
            borderRadius: 8,
            color: '#000',
            fontWeight: 900,
            fontSize: 14,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            cursor: isProcessing ? 'not-allowed' : 'pointer',
            boxShadow: '0 0 20px rgba(255,215,0,0.3)'
          }}
        >
          {isProcessing ? 'PROCESSING...' : 'PROCEED TO STRIPE →'}
        </button>
      </form>
    </main>
  );
}