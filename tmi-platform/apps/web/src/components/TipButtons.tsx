"use client";

import React, { useState } from "react";

export function TipButtons({ disabled }: { disabled?: boolean }) {
  const [tips, setTips] = useState(0);

  function sendTip(amount: number) {
    if (disabled) return;
    setTips((t) => t + amount);
    try {
      window.dispatchEvent(new CustomEvent('bb:tip', { detail: { amount } }));
      try { sessionStorage.setItem('bb_latest_tip', String(amount)); } catch (e) {}
    } catch (e) {}
  }

  return (
    <div className="bg-gray-900 p-3 rounded flex items-center gap-2">
      <button onClick={() => sendTip(1)} disabled={disabled} className={`px-3 py-1 rounded ${disabled ? 'bg-gray-700 opacity-60' : 'bg-yellow-500'}`}>Tip +1</button>
      <button onClick={() => sendTip(5)} disabled={disabled} className={`px-3 py-1 rounded ${disabled ? 'bg-gray-700 opacity-60' : 'bg-yellow-600'}`}>Tip +5</button>
      <div className="text-sm text-gray-300">Total Tips: {tips}</div>
    </div>
  );
}
