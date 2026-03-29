"use client";

import React, { createContext, useContext, useMemo, useState } from "react";

export type SharedPreviewSourceType = "artist-media" | "producer-beat" | "sponsor-media" | "venue-info" | "generic";
export type SharedPreviewStatus = "idle" | "loading" | "live" | "paused" | "ended";

export type SharedPreviewContent = {
  sourceType: SharedPreviewSourceType;
  title: string;
  subtitle?: string;
  thumbnailUrl?: string;
  status: SharedPreviewStatus;
};

type SharedPreviewContextValue = {
  isOpen: boolean;
  content: SharedPreviewContent | null;
  openPreview: (content: SharedPreviewContent) => void;
  closePreview: () => void;
  updateStatus: (status: SharedPreviewStatus) => void;
};

const SharedPreviewContext = createContext<SharedPreviewContextValue | undefined>(undefined);

export function useSharedPreview() {
  const context = useContext(SharedPreviewContext);
  if (!context) throw new Error("useSharedPreview must be used within SharedPreviewProvider");
  return context;
}

export default function SharedPreviewProvider({
  children,
}: {
  readonly children: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [content, setContent] = useState<SharedPreviewContent | null>(null);

  const value = useMemo<SharedPreviewContextValue>(
    () => ({
      isOpen,
      content,
      openPreview: (nextContent) => {
        setContent(nextContent);
        setIsOpen(true);
      },
      closePreview: () => {
        setIsOpen(false);
      },
      updateStatus: (status) => {
        setContent((prev) => {
          if (!prev) return prev;
          return { ...prev, status };
        });
      },
    }),
    [isOpen, content]
  );

  return <SharedPreviewContext.Provider value={value}>{children}</SharedPreviewContext.Provider>;
}
