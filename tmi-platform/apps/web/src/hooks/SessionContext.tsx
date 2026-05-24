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
  platformPoints: number;
  xpPoints: number;
  accumulatedXp: number;
  tierLevel: number;
}

interface SessionContextType {
  userId: string;
  userName: string;
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

  const [styleConfig, setStyleConfig] = useState<UserStyleConfig>({
    userId: FALLBACK_USER_ID,
    backgroundType: "gradient",
    primaryNeonColor: "#4B0082",
    secondaryGlowColor: "#DC143C",
    unlockedThemes: ["default_arena"]
  });

  const [economyState, setEconomyState] = useState<UserEconomy>({
    userId: FALLBACK_USER_ID,
    platformPoints: 120,
    xpPoints: 340,
    accumulatedXp: 340,
    tierLevel: 1
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

        setUserId(nextUserId);
        setUserName(nextUserName);
        setStyleConfig((prev) => ({ ...prev, userId: nextUserId }));
        setEconomyState((prev) => ({ ...prev, userId: nextUserId }));
      } catch {
        // keep safe fallback identity
      }
    }

    hydrateScopedIdentity();
    return () => {
      active = false;
    };
  }, []);

  const updateUserColors = (primary: string, secondary: string) => {
    setStyleConfig((prev) => ({ ...prev, primaryNeonColor: primary, secondaryGlowColor: secondary }));
  };

  const incrementPoints = (amount: number) => {
    setEconomyState((prev) => ({ ...prev, platformPoints: prev.platformPoints + amount }));
  };

  return (
    <SessionContext.Provider value={{
      userId,
      userName,
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
