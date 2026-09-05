"use client";

/**
 * Client-side WorldScenePlan cache — keyed by roomId.
 * Populated by GO LIVE / preview / session-resume; consumed by Monitor B + stage shells.
 */

import { create } from "zustand";
import { buildWorldScenePlan, type LiveSessionWorldContext } from "@/lib/world/AutonomousWorldDirector";
import type { WorldScenePlan } from "@/lib/world/WorldScenePlan";

interface WorldScenePlanState {
  plans: Record<string, WorldScenePlan>;
  setPlan: (plan: WorldScenePlan) => void;
  getPlan: (roomId: string) => WorldScenePlan | null;
  buildAndStore: (ctx: LiveSessionWorldContext) => WorldScenePlan;
  clearPlan: (roomId: string) => void;
  clearAll: () => void;
}

export const useWorldScenePlanStore = create<WorldScenePlanState>((set, get) => ({
  plans: {},
  setPlan: (plan) =>
    set((s) => ({
      plans: { ...s.plans, [plan.roomId]: plan },
    })),
  getPlan: (roomId) => get().plans[roomId] ?? null,
  buildAndStore: (ctx) => {
    const plan = buildWorldScenePlan(ctx);
    set((s) => ({
      plans: { ...s.plans, [plan.roomId]: plan },
    }));
    return plan;
  },
  clearPlan: (roomId) =>
    set((s) => {
      const next = { ...s.plans };
      delete next[roomId];
      return { plans: next };
    }),
  clearAll: () => set({ plans: {} }),
}));
