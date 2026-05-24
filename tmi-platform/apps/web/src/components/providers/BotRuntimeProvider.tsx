"use client";

import { useEffect } from "react";
import { activateDefaultBots } from "@/lib/bots/BotActivationEngine";
import { initializeGhostArchetypes } from "@/lib/bots/GhostArchetypeEngine";

export default function BotRuntimeProvider() {
  useEffect(() => {
    activateDefaultBots();
    initializeGhostArchetypes();
  }, []);

  return null;
}
