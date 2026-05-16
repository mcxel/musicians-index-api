import React from 'react';
import { LobbyState } from '@/lib/lobby/LobbyStateEngine';
import { LobbyPropInteractionEngine } from '@/lib/lobby/LobbyPropInteractionEngine';
import { LobbyPropUseButton } from './LobbyPropUseButton';
import { useUserSubscription } from '@/lib/auth/useUserSubscription';

export const LobbyInventoryTray = ({ state }: { state: LobbyState }) => {
  const canUseProps = LobbyPropInteractionEngine.canUseProps(state);
  const canUseEmotes = LobbyPropInteractionEngine.canUseEmotesOnly(state);
  const { tier } = useUserSubscription();
  
  if (!canUseProps && !canUseEmotes) return null;

  const maxProps = tier === 'gold' ? Infinity : tier === 'pro' ? 5 : 2;
  const availableProps = [
    { id: "glow_stick", icon: "ðŸª„", action: "wave" as const, type: "prop" },
    { id: "confetti", icon: "ðŸŽ‰", action: "toss" as const, type: "prop" },
    { id: "emote_heart", icon: "â¤ï¸", action: "emote" as const, type: "emote" },
    { id: "emote_fire", icon: "ðŸ”¥", action: "emote" as const, type: "emote" },
    { id: "foam_finger", icon: "ðŸ§¤", action: "wave" as const, type: "prop" },
    { id: "emote_crown", icon: "ðŸ‘‘", action: "emote" as const, type: "emote" },
  ].slice(0, maxProps);

  return (
    <div className="absolute bottom-24 left-1/2 -translate-x-1/2 flex gap-2 p-2 bg-black/60 rounded-2xl border border-white/10 backdrop-blur-md z-40 shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
       {availableProps.map(p => (
         ((p.type === "prop" && canUseProps) || (p.type === "emote" && (canUseProps || canUseEmotes))) && (
           <LobbyPropUseButton key={p.id} propId={p.id} icon={p.icon} action={p.action} state={state} />
         )
       ))}
    </div>
  );
};