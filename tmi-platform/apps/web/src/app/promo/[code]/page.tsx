// /promo/[code]: Public promo code redemption page
'use client';

import { PromoRedemptionEngine } from '@/lib/promos/PromoRedemptionEngine';
import { useState } from 'react';

export default function PromoRedeemPage({ params }: { params: { code: string } }) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<string | null>(null);
  const handleRedeem = () => {
    const ok = PromoRedemptionEngine.redeem(params.code, email);
    setStatus(ok ? 'Success! Membership granted.' : 'Invalid or expired code.');
  };
  return (
    <div className="max-w-md mx-auto p-8 bg-black/80 rounded-xl mt-12 text-white">
      <h1 className="text-2xl font-bold mb-4">Redeem Promo Code</h1>
      <div className="mb-2">
        Promo Code: <span className="font-mono text-cyan-400">{params.code}</span>
      </div>
      <input
        className="w-full p-2 rounded bg-gray-900 border border-cyan-400 mb-4"
        placeholder="Enter your email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        type="email"
      />
      <button
        className="w-full py-2 bg-cyan-500 hover:bg-cyan-400 rounded font-bold"
        onClick={handleRedeem}
      >
        Redeem
      </button>
      {status && <div className="mt-4 text-fuchsia-400">{status}</div>}
    </div>
  );
}
