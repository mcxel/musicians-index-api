import React from 'react';
import { motion } from 'framer-motion';
import { LobbyState } from '@/lib/lobby/LobbyStateEngine';
import { LobbyPropInteractionEngine } from '@/lib/lobby/LobbyPropInteractionEngine';
import { useUserSubscription } from '@/lib/auth/useUserSubscription';
import { LOBBY_HOLDABLE_PROPS, LOBBY_REACTION_PROPS, isPropUnlockedForTier, type LobbyPropDef } from '@/lib/lobby/LobbyPropRegistry';

export const LobbyInventoryTray = ({
  state,
  onUseProp,
}: {
  state: LobbyState;
  /** Fired with the prop id the instant it's pressed - caller drives the local effect + broadcast. */
  onUseProp?: (propId: string) => void;
}) => {
  const canUseProps = LobbyPropInteractionEngine.canUseProps(state);
  const canUseEmotesOnly = LobbyPropInteractionEngine.canUseEmotesOnly(state);
  const { tier } = useUserSubscription();

  if (!canUseProps && !canUseEmotesOnly) return null;

  // Reaction bursts (hearts/fire/confetti/crown) double as lightweight "emotes" -
  // available even during the emotes-only lock; held props need full free-roam.
  const holdable = canUseProps ? LOBBY_HOLDABLE_PROPS.filter((p) => isPropUnlockedForTier(p, tier)) : [];
  const reactions = LOBBY_REACTION_PROPS.filter((p) => isPropUnlockedForTier(p, tier));

  function fire(prop: LobbyPropDef) {
    const action = prop.effect === 'hold' ? 'wave' : 'toss';
    LobbyPropInteractionEngine.triggerAction(action, prop.id, state);
    onUseProp?.(prop.id);
  }

  return (
    // Bottom drawer, not an overlay on top of stage/video content.
    <motion.div
      initial={{ y: 60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 200, damping: 24 }}
      className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2 p-2.5 bg-black/70 rounded-2xl border border-white/10 backdrop-blur-md z-40 shadow-[0_10px_30px_rgba(0,0,0,0.5)] flex-wrap justify-center max-w-[92%]"
    >
      {[...holdable, ...reactions].map((p) => (
        <PropButton key={p.id} prop={p} onPress={() => fire(p)} />
      ))}
    </motion.div>
  );
};

function PropButton({ prop, onPress }: { prop: LobbyPropDef; onPress: () => void }) {
  // Reaction (burst) props render as circles, holdable props as rounded squares -
  // a shape difference the user asked for, not just color, so the tray reads as varied.
  const isHold = prop.effect === 'hold';
  return (
    <motion.button
      onClick={onPress}
      whileHover={{ scale: 1.12, boxShadow: `0 0 14px ${prop.accent}99` }}
      whileTap={{ scale: 0.88 }}
      className="w-11 h-11 flex items-center justify-center text-xl border"
      style={{
        borderRadius: isHold ? 10 : 999,
        background: `${prop.accent}14`,
        borderColor: `${prop.accent}55`,
      }}
      title={prop.label}
    >
      <span className="drop-shadow-md">{prop.icon}</span>
    </motion.button>
  );
}
