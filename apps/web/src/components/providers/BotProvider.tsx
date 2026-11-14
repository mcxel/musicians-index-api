"use client";
import { useEffect, useRef } from "react";
import { activatePhase1Bots } from "@/lib/bots/Phase1BotActivator";

export default function BotProvider({ children }: { children: React.ReactNode }) {
  const activated = useRef(false);

  useEffect(() => {
    if (activated.current) return;
    activated.current = true;

    // Diagnostic-only callbacks — this Phase 1 activator has no visible UI yet,
    // so these were the only way to observe it, but logging unconditionally
    // spammed the production console on every page load.
    const isBotDiagEnabled = process.env.NEXT_PUBLIC_ENABLE_GHOST_DIAG === "true";
    const cleanup = activatePhase1Bots("lobby", "visitor", {
      onWelcome: (text) => { if (isBotDiagEnabled) console.log("[bot welcome]", text); },
      onBotChat: (botName, text) => { if (isBotDiagEnabled) console.log("[bot]", botName, text); },
      onBotHype: (botName) => { if (isBotDiagEnabled) console.log("[bot hype]", botName); },
      onBotTip: (botName) => { if (isBotDiagEnabled) console.log("[bot tip]", botName); },
      onDiag: (msg) => { if (isBotDiagEnabled) console.log("[bot diag]", msg); },
    });

    return () => cleanup();
  }, []);

  return <>{children}</>;
}
