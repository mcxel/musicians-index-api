"use client";

import React, { createContext, useContext, useState } from "react";

// Localized type stubs to guarantee compile success without external dependencies tonight
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

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export function TmiSessionProvider({ children }: { children: React.ReactNode }) {
  const [styleConfig, setStyleConfig] = useState<UserStyleConfig>({
    userId: "user_dev_08",
    backgroundType: "gradient",
    primaryNeonColor: "#4B0082",
    secondaryGlowColor: "#DC143C",
    unlockedThemes: ["default_arena"]
  });

  const [economyState, setEconomyState] = useState<UserEconomy>({
    userId: "user_dev_08",
    platformPoints: 120,
    xpPoints: 340,
    accumulatedXp: 340,
    tierLevel: 1
  });

  const updateUserColors = (primary: string, secondary: string) => {
    setStyleConfig((prev) => ({ ...prev, primaryNeonColor: primary, secondaryGlowColor: secondary }));
  };

  const incrementPoints = (amount: number) => {
    setEconomyState((prev) => ({ ...prev, platformPoints: prev.platformPoints + amount }));
  };

  return (
    <SessionContext.Provider value={{
      userId: "user_dev_08",
      userName: "Marcel_Sr",
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