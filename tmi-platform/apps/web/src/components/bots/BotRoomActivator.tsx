"use client";

import { useEffect, useRef } from "react";
import { activatePhase1Bots } from "@/lib/bots/Phase1BotActivator";

interface Props {
  roomId: string;
  fanId: string;
  /** Called when the welcome bot sends a greeting */
  onWelcome?: (text: string) => void;
  /** Called when a ghost bot sends a chat line */
  onBotChat?: (botName: string, text: string) => void;
  /** Called when a ghost bot fires a hype action */
  onBotHype?: (botName: string) => void;
  /** Called when a ghost bot tips the performer */
  onBotTip?: (botName: string) => void;
}

/**
 * Drop-in component — mounts Phase 1 bots for a room, cleans up on unmount.
 * Renders nothing visible; pure side-effect activator.
 */
export default function BotRoomActivator({
  roomId,
  fanId,
  onWelcome,
  onBotChat,
  onBotHype,
  onBotTip,
}: Props) {
  const cleanupRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    const cleanup = activatePhase1Bots(roomId, fanId, {
      onWelcome: (text) => {
        onWelcome?.(text);
      },
      onBotChat: (botName, text) => {
        onBotChat?.(botName, text);
      },
      onBotHype: (botName) => {
        onBotHype?.(botName);
      },
      onBotTip: (botName) => {
        onBotTip?.(botName);
      },
      onDiag: (msg) => {
        if (process.env.NODE_ENV === "development") console.debug("[BotRoomActivator]", msg);
      },
    });
    cleanupRef.current = cleanup;
    return () => cleanupRef.current?.();
  }, [roomId, fanId]); // eslint-disable-line react-hooks/exhaustive-deps

  return null;
}
