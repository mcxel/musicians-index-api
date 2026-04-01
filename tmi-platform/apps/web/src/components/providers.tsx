"use client";

import React from "react";
import AudioProvider from "@/components/AudioProvider";

export default function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <AudioProvider>
      {children}
    </AudioProvider>
  );
}
