'use client';

import { motion, AnimatePresence } from 'framer-motion';

export type JuliusMode = 'hidden' | 'poll' | 'celebrate' | 'nudge';

interface JuliusMascotProps {
  mode: JuliusMode;
  visible: boolean;
  pollPrompt?: string;
  nudgeText?: string;
  onDismiss: () => void;
}

export default function JuliusMascot({
  mode,
  visible,
  pollPrompt,
  nudgeText,
  onDismiss,
}: JuliusMascotProps) {
  return (
    <AnimatePresence>
      {visible && mode !== 'hidden' && (
        <motion.div
          initial={{ y: 150, scale: 0.8, opacity: 0, rotate: 10 }}
          animate={{ y: 0, scale: 1, opacity: 1, rotate: 0 }}
          exit={{ y: 150, scale: 0.8, opacity: 0, transition: { duration: 0.25 } }}
          transition={{ type: 'spring', damping: 18, stiffness: 220 }}
          className="fixed bottom-24 right-8 z-[100] flex flex-col items-end pointer-events-none"
        >
          {/* Contextual Utility Items */}
          <AnimatePresence mode="wait">
            {mode === 'poll' && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="mb-4 p-4 rounded-2xl bg-zinc-950 border border-[#00FFFF]/50 shadow-[0_0_25px_rgba(0,255,255,0.2)] pointer-events-auto max-w-[240px]"
              >
                <div className="text-[#00FFFF] text-[9px] font-black uppercase tracking-widest mb-2">
                  Live Poll
                </div>
                <div className="text-sm font-bold text-white mb-4 leading-snug">
                  {pollPrompt || 'Who takes this round?'}
                </div>
                <div className="flex gap-2">
                  <button onClick={onDismiss} className="flex-1 bg-white/10 hover:bg-white/20 text-white text-xs font-bold py-2 rounded-lg transition-colors">
                    A
                  </button>
                  <button onClick={onDismiss} className="flex-1 bg-[#00FFFF]/20 hover:bg-[#00FFFF]/30 border border-[#00FFFF]/50 text-[#00FFFF] text-xs font-bold py-2 rounded-lg transition-colors">
                    B
                  </button>
                </div>
              </motion.div>
            )}

            {mode === 'nudge' && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="mb-4 py-2 px-4 rounded-xl bg-black/90 backdrop-blur-md border border-[#FF2DAA]/40 text-[#FFB8E6] text-xs font-bold shadow-lg"
              >
                {nudgeText || 'Keep the energy up!'}
              </motion.div>
            )}

            {mode === 'celebrate' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.5, y: 50 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="absolute -top-12 left-1/2 -translate-x-1/2 text-5xl"
              >
                🎉✨
              </motion.div>
            )}
          </AnimatePresence>

          {/* Julius Avatar Body (V1 Stylized Stand-in) */}
          <motion.div
            animate={{
              y: [0, -3, 0],
              rotate: [0, -1, 1, 0],
            }}
            transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
            className="relative w-32 h-36 flex items-end justify-center drop-shadow-2xl"
          >
            <div className="absolute inset-0 bg-gradient-to-b from-[#D2B48C] to-[#8B5A2B] rounded-t-full border-[3px] border-zinc-900 flex flex-col items-center justify-start pt-6 overflow-hidden">
              
              {/* Tweed Cap */}
              <div className="absolute -top-1 w-28 h-8 bg-[#4A3B32] rounded-t-xl rounded-b-sm border-b-4 border-zinc-900 z-10" />
              
              {/* Eye Patches & Eyes */}
              <div className="flex gap-2 z-0 mt-2">
                {[1, 2].map((i) => (
                  <div key={i} className="w-9 h-9 bg-[#3E2723] rounded-full flex items-center justify-center">
                    <motion.div 
                      animate={{ scaleY: [1, 0.1, 1] }} 
                      transition={{ duration: 0.15, repeat: Infinity, repeatDelay: 2.5 + Math.random() }}
                      className="w-4 h-4 bg-white rounded-full flex items-center justify-end pr-1"
                    >
                      <div className="w-2 h-2 bg-black rounded-full" />
                    </motion.div>
                  </div>
                ))}
              </div>

              {/* Smirk */}
              <div className="w-5 h-2 border-b-[3px] border-r-[3px] border-black rounded-br-full mt-3 ml-5 rotate-12" />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}