import React from 'react';
import { motion } from 'framer-motion';
import { LobbyState } from '@/lib/lobby/LobbyStateEngine';
import { LobbyEnvironmentInteractionEngine } from '@/lib/lobby/LobbyEnvironmentInteractionEngine';
import { LOBBY_ENV_TOYS } from '@/lib/lobby/LobbyPropRegistry';

export const LobbyEnvironmentToys = ({
  state,
  onUseToy,
}: {
  state: LobbyState;
  /** Fired with the toy id when touched - caller decides what visibly happens (e.g. trigger a prop burst). */
  onUseToy?: (toyId: string) => void;
}) => {
  if (!LobbyEnvironmentInteractionEngine.canInteract(state)) return null;

  return (
    <div className="absolute inset-0 pointer-events-none z-30">
      {LOBBY_ENV_TOYS.map((toy) => (
        <motion.button
          key={toy.id}
          whileHover={{ scale: 1.15 }}
          whileTap={{ scale: 0.9 }}
          className="pointer-events-auto absolute text-4xl transition-transform"
          style={{
            top: toy.anchor.top,
            left: toy.anchor.left,
            transform: "translate(-50%, -50%)",
            filter: `drop-shadow(0 0 14px ${toy.accent}99)`,
          }}
          onClick={() => {
            LobbyEnvironmentInteractionEngine.interactWith(
              toy.id as Parameters<typeof LobbyEnvironmentInteractionEngine.interactWith>[0],
              state,
            );
            onUseToy?.(toy.id);
          }}
          title={toy.label}
        >
          {toy.icon}
        </motion.button>
      ))}
    </div>
  );
};
