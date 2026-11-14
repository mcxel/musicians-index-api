"use client";

import { useEffect, useState } from "react";
import {
  readMixPresence,
  retainAudibleExperience,
  retainMixSlot,
  retainMonitorWorkspace,
  subscribeMixPresence,
} from "@/lib/audio/mixer/MonitorMixGraph";

export function useMixPresence(): { audible: boolean; monitors: boolean; mixSlot: boolean } {
  const [presence, setPresence] = useState(readMixPresence);
  useEffect(() => subscribeMixPresence(() => setPresence(readMixPresence())), []);
  return presence;
}

export function useRetainAudibleExperience(): void {
  useEffect(() => retainAudibleExperience(), []);
}

export function useRetainMonitorWorkspace(): void {
  useEffect(() => retainMonitorWorkspace(), []);
}

export function useRetainMixSlot(): void {
  useEffect(() => retainMixSlot(), []);
}
