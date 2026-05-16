'use client';

import { motion } from 'framer-motion';
import IgnitionBurstConfetti from '@/components/home/effects/IgnitionBurstConfetti';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function DiamondWelcomeProtocol({ inviteeName }: { inviteeName: string }) {
  const [isSealed, setIsSealed] = useState(false);

  useEffect(() => {
    // Auto-dismiss the welcome protocol after 8 seconds to drop them into the hub
    const timer = setTimeout(() => setIsSealed(true), 8000);
    return () => clearTimeout(timer);
  }, []);

  if (isSealed) return null;

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0, scale: 1.05 }}
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/95 backdrop-blur-md"
    >
      <IgnitionBurstConfetti zIndex={99} assetCategory="hipHop" burstDurationMs={3000} cycleMs={10000} burstCount={60} />
      
      <motion.div 
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.8 }}
        style={{ border: '1px solid rgba(0,255,255,0.4)', boxShadow: '0 0 40px rgba(0,255,255,0.15)' }}
        className="p-12 rounded-[2rem] bg-zinc-950 text-center max-w-lg"
      >
        <div className="text-[#00FFFF] text-[10px] font-black tracking-[0.3em] uppercase mb-4">
          Access Granted
        </div>
        <h1 className="text-4xl font-black text-white uppercase tracking-tight mb-6">
          Welcome to the<br />New Main Stage.
        </h1>
        <p className="text-white/60 text-sm leading-relaxed mb-8">
          {inviteeName}, the monopoly is dead. Your Diamond profile is active, your wallet is seeded, and the ghost force is armed. 
        </p>
        <Link href="/hub/performer" className="inline-block w-full py-4 bg-[#00FFFF] text-black font-black uppercase tracking-widest text-xs rounded-full hover:bg-white transition-colors">
          Enter The Index
        </Link>
      </motion.div>
    </motion.div>
  );
}