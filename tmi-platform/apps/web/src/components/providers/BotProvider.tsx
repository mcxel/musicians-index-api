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
    const isDev = process.env.NODE_ENV !== "production";
    const cleanup = activatePhase1Bots("lobby", "visitor", {
      onWelcome: (text) => { if (isDev) console.log("[bot welcome]", text); },
      onBotChat: (botName, text) => { if (isDev) console.log("[bot]", botName, text); },
      onBotHype: (botName) => { if (isDev) console.log("[bot hype]", botName); },
      onBotTip: (botName) => { if (isDev) console.log("[bot tip]", botName); },
      onDiag: (msg) => { if (isDev) console.log("[bot diag]", msg); },
    });

    return () => cleanup();
  }, []);

  return <>{children}</>;
}
