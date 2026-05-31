"use client";
import { useEffect, useRef } from "react";
import { activatePhase1Bots } from "@/lib/bots/Phase1BotActivator";

export default function BotProvider({ children }: { children: React.ReactNode }) {
  const activated = useRef(false);

  useEffect(() => {
    if (activated.current) return;
    activated.current = true;

    // "lobby" is the first Phase 1 active room; "visitor" deduplicates the welcome message
    const cleanup = activatePhase1Bots("lobby", "visitor", {
      onWelcome: (text) => console.log("[bot welcome]", text),
      onBotChat: (botName, text) => console.log("[bot]", botName, text),
      onBotHype: (botName) => console.log("[bot hype]", botName),
      onBotTip: (botName) => console.log("[bot tip]", botName),
      onDiag: (msg) => console.log("[bot diag]", msg),
    });

    return () => cleanup();
  }, []);

  return <>{children}</>;
}
