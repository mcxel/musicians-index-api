import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as Icons from 'lucide-react'; // HD Minimalist Icon Library
import { DEFAULT_EMOTE_CATALOG, EmoteType } from '@/types/playWidget.contracts';

interface PremiumInteractionBurstProps {
  emoteType: EmoteType;
  onTrigger?: () => void;
}

/**
 * Premium Interaction Burst
 * Replaces standard emojis with high-fidelity, motion-driven vector graphics.
 */
export const PremiumInteractionBurst: React.FC<PremiumInteractionBurstProps> = ({ emoteType, onTrigger }) => {
  const [isActive, setIsActive] = useState(false);
  const config = DEFAULT_EMOTE_CATALOG[emoteType];
  
  // Dynamically resolve the Lucide icon
  const IconComponent = (Icons as any)[config.iconId] || Icons.Circle;

  const handleInteract = () => {
    setIsActive(true);
    if (onTrigger) onTrigger();
    setTimeout(() => setIsActive(false), 800); // Reset after burst
  };

  return (
    <motion.button
      onClick={handleInteract}
      className="relative flex items-center justify-center w-10 h-10 rounded-full bg-black/40 border border-white/10 hover:border-white/30 transition-colors focus:outline-none"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <AnimatePresence>
        {isActive && (
          <motion.div
            className="absolute inset-0 rounded-full"
            style={{ boxShadow: `0 0 20px ${config.color}, inset 0 0 10px ${config.color}` }}
            initial={{ opacity: 0.8, scale: 0.8 }}
            animate={{ opacity: 0, scale: 1.8 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          />
        )}
      </AnimatePresence>
      
      {/* Minimalist HD Icon */}
      <IconComponent size={20} color={isActive ? '#FFFFFF' : config.color} strokeWidth={isActive ? 2.5 : 1.5} />
    </motion.button>
  );
};