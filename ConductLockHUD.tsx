'use client';

import { motion } from 'framer-motion';

/**
 * TMI Conduct Lock HUD
 * 100% Visual legal binding for touring artists.
 */
export function ConductLockHUD({ location }: { location: string }) {
  return (
    <motion.div 
      initial={{ y: 100, opacity: 0 }} 
      animate={{ y: 0, opacity: 1 }}  
      className="p-10 bg-zinc-950 border-t-4 border-yellow-500 rounded-t-[4rem] shadow-2xl fixed bottom-0 w-full max-w-2xl mx-auto left-0 right-0 z-[100]"
    >
      <h2 className="text-yellow-500 font-black italic text-xl uppercase mb-6 tracking-tighter">Behavioral_Lock_In_Active</h2>
      <p className="text-white/60 text-xs mb-10 leading-relaxed font-mono">
        CURRENT_ZONE: {location} <br/>
        STATUS: SECURE_PAY_POTENTIAL_99% <br/>
        INSTRUCTION: Avoid all local law violations to prevent pay forfeiture. Lock in now to enjoy the ride.
      </p>
      
      <motion.button  
        whileTap={{ scale: 0.9, backgroundColor: "#000", color: "#eab308" }}
        className="w-full bg-yellow-500 text-black font-black py-8 rounded-[2.5rem] uppercase tracking-widest text-sm transition-colors"
      >
        Hold to Lock In & Protect Pay
      </motion.button>
    </motion.div>
  );
}