"use client";

import React, { useEffect, useState } from "react";

export function TipEffect() {
  const [amount, setAmount] = useState<number | null>(null);

  useEffect(() => {
    function onTip(e: any) {
      const a = e?.detail?.amount || null;
      setAmount(a);
      setTimeout(() => setAmount(null), 1000);
    }
    window.addEventListener('bb:tip', onTip as EventListener);
    return () => window.removeEventListener('bb:tip', onTip as EventListener);
  }, []);

  if (amount == null) return null;

  return (
    <div className="fixed right-4 top-20 z-50 pointer-events-none">
      <div className="px-3 py-2 bg-yellow-400 text-black font-bold rounded-full shadow-lg animate-pulse">+{amount}</div>
    </div>
  );
}
