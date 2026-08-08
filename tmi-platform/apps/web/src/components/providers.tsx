"use client";

import React from "react";
import AudioProvider from "@/components/AudioProvider";
import { ActiveGenreProvider } from "@/lib/context/ActiveGenreContext";
import BotProvider from "@/components/providers/BotProvider";
import GlobalUiSoundRuntime from "@/components/sound/GlobalUiSoundRuntime";
import IncomingMessageBubbleHost from "@/components/messaging/IncomingMessageBubbleHost";

export default function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <AudioProvider>
      <ActiveGenreProvider>
        <BotProvider>
          <GlobalUiSoundRuntime />
          <IncomingMessageBubbleHost />
          {children}
        </BotProvider>
      </ActiveGenreProvider>
    </AudioProvider>
  );
}
