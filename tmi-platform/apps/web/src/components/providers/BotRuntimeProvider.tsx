"use client";

import { useEffect } from "react";
import { activateSoftLaunchBots } from "@/lib/bots/activateSoftLaunchBots";
import { initializeGhostArchetypes } from "@/lib/bots/GhostArchetypeEngine";
import { initCivilizationWiring } from "@/lib/engines/runtime/CivilizationWiring";

export default function BotRuntimeProvider() {
  useEffect(() => {
    activateSoftLaunchBots();
    initializeGhostArchetypes();
    initCivilizationWiring();
  }, []);

  return null;
}