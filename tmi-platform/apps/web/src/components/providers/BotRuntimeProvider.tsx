"use client";

import { useEffect } from "react";
import { activateDefaultBots } from "@/lib/bots/BotActivationEngine";
import { initializeGhostArchetypes } from "@/lib/bots/GhostArchetypeEngine";
import { initCivilizationWiring } from "@/lib/engines/runtime/CivilizationWiring";

export default function BotRuntimeProvider() {
  useEffect(() => {
    activateDefaultBots();
    initializeGhostArchetypes();
    initCivilizationWiring();
  }, []);

  return null;
}
