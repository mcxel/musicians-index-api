"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export interface UserStyleConfig {
  userId: string;
  backgroundType: string;
  primaryNeonColor: string;
  secondaryGlowColor: string;
  unlockedThemes: string[];
}

export interface UserEconomy {
  userId: string;
  /** Real fan-credits balance from GET /api/points/balance. Null until hydrated. */
  platformPoints: number | null;
  /** Real XP from GET /api/fan/stats (metrics.xp.value). Null until hydrated. */
  xpPoints: number | null;
  accumulatedXp: number | null;
  /**
   * No real authority currently defines what "tierLevel" (a number) should
   * mean, distinct from the real string `tier` field above (FREE/PRO/RUBY/...
   * from /api/auth/me). PRODUCT_POLICY_REQUIRED before this is wired to
   * anything — do not derive it from XP level or duplicate `tier` as a guess.
   */
  tierLevel: number | null;
}

interface SessionContextType {
  userId: string;
  userName: string;
  /** Membership tier from /api/auth/me. Null until that response includes one. */
  tier: string | null;
  styleConfig: UserStyleConfig;
  economyState: UserEconomy;
  updateUserColors: (primary: string, secondary: string) => void;
  incrementPoints: (amount: number) => void;
}

type MeResponse = {
  authenticated: boolean;
  user: {
    id: string;
    name?: string;
    email?: string;
    role?: string;
    tier?: string;
  } | null;
};

const FALLBACK_USER_ID = "guest_user";
const FALLBACK_USER_NAME = "Guest";

export const SessionContext = createContext<SessionContextType | undefined>(undefined);

export function TmiSessionProvider({ children }: { children: React.ReactNode }) {
  const [userId, setUserId] = useState(FALLBACK_USER_ID);
  const [userName, setUserName] = useState(FALLBACK_USER_NAME);
  const [tier, setTier] = useState<string | null>(null);

  const [styleConfig, setStyleConfig] = useState<UserStyleConfig>({
    userId: FALLBACK_USER_ID,
    backgroundType: "gradient",
    primaryNeonColor: "#4B0082",
    secondaryGlowColor: "#DC143C",
    unlockedThemes: ["default_arena"]
  });

  const [economyState, setEconomyState] = useState<UserEconomy>({
    userId: FALLBACK_USER_ID,
    // Honest "not yet known" state — these previously hardcoded 120/340/340
    // for every user regardless of who was signed in (Rule 20 violation,
    // 2026-10-04 fix). Real values are hydrated below once authenticated.
    platformPoints: null,
    xpPoints: null,
    accumulatedXp: null,
    tierLevel: null,
  });

  useEffect(() => {
    let active = true;

    async function hydrateScopedIdentity() {
      try {
        const res = await fetch("/api/auth/me", {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        });

        if (!res.ok) return;
        const data = (await res.json()) as MeResponse;
        if (!active || !data?.authenticated || !data.user?.id) return;

        const nextUserId = data.user.id;
        const nextUserName = data.user.name?.trim() || FALLBACK_USER_NAME;
        const nextTier = data.user.tier?.trim() || null;

        setUserId(nextUserId);
        setUserName(nextUserName);
        setTier(nextTier);
        setStyleConfig((prev) => ({ ...prev, userId: nextUserId }));
        setEconomyState((prev) => ({ ...prev, userId: nextUserId }));

        // Real economy values — fire-and-forget, independent of identity
        // hydration above so a slow/failed economy fetch never blocks name/tier.
        void hydrateRealEconomy();
      } catch {
        // keep safe fallback identity
      }
    }

    async function hydrateRealEconomy() {
      try {
        const [statsRes, balanceRes] = await Promise.all([
          fetch("/api/fan/stats", { credentials: "include", cache: "no-store" }),
          fetch("/api/points/balance", { credentials: "include", cache: "no-store" }),
        ]);

        let realXp: number | null = null;
        if (statsRes.ok) {
          const statsData = (await statsRes.json()) as { metrics?: { xp?: { value?: number } } };
          if (typeof statsData?.metrics?.xp?.value === "number") {
            realXp = statsData.metrics.xp.value;
          }
        }

        let realPoints: number | null = null;
        if (balanceRes.ok) {
          const balanceData = (await balanceRes.json()) as { platformPoints?: number };
          if (typeof balanceData?.platformPoints === "number") {
            realPoints = balanceData.platformPoints;
          }
        }

        if (!active) return;
        setEconomyState((prev) => ({
          ...prev,
          xpPoints: realXp,
          accumulatedXp: realXp,
          platformPoints: realPoints,
        }));
      } catch {
        // keep honest null state — never fabricate a value on fetch failure
      }
    }

    hydrateScopedIdentity();

    const onDisplayNameUpdated = () => {
      void hydrateScopedIdentity();
    };
    window.addEventListener("tmi:display-name-updated", onDisplayNameUpdated);
    return () => {
      active = false;
      window.removeEventListener("tmi:display-name-updated", onDisplayNameUpdated);
    };
  }, []);

  const updateUserColors = (primary: string, secondary: string) => {
    setStyleConfig((prev) => ({ ...prev, primaryNeonColor: primary, secondaryGlowColor: secondary }));
  };

  const incrementPoints = (amount: number) => {
    setEconomyState((prev) => ({ ...prev, platformPoints: (prev.platformPoints ?? 0) + amount }));
  };

  return (
    <SessionContext.Provider value={{
      userId,
      userName,
      tier,
      styleConfig,
      economyState,
      updateUserColors,
      incrementPoints
    }}>
      {children}
    </SessionContext.Provider>
  );
}

export const useTmiSession = () => {
  const context = useContext(SessionContext);
  if (!context) throw new Error("useTmiSession must be executed inside a TmiSessionProvider cluster.");
  return context;
};
