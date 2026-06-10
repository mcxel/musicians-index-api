"use client";

import React from "react";
import AudioProvider from "@/components/AudioProvider";
import { ActiveGenreProvider } from "@/lib/context/ActiveGenreContext";
import BotProvider from "@/components/providers/BotProvider";

export default function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <AudioProvider>
      <ActiveGenreProvider>
        <BotProvider>
          {children}
        </BotProvider>
      </ActiveGenreProvider>
    </AudioProvider>
  );
}
