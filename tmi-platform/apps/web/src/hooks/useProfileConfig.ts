"use client";

import { useState, useEffect, useCallback } from "react";
import type { PublicProfileConfig } from "@/lib/profile/PublicProfileStyleEngine";
import { DEFAULT_PUBLIC_PROFILE_CONFIG } from "@/lib/profile/PublicProfileStyleEngine";

type SaveStatus = "idle" | "saving" | "saved" | "error";

export interface UseProfileConfigReturn {
  config: PublicProfileConfig;
  saveStatus: SaveStatus;
  saveError: string | null;
  save: (next: PublicProfileConfig) => Promise<void>;
  reload: () => Promise<void>;
}

/** DB shape → PublicProfileConfig shape (accentColor lives in DB as themeColor). */
function dbToConfig(db: Record<string, unknown>): PublicProfileConfig {
  return {
    accentColor: typeof db.themeColor === "string" ? db.themeColor : DEFAULT_PUBLIC_PROFILE_CONFIG.accentColor,
    activeStylePackId: typeof db.activeStylePackId === "string" ? db.activeStylePackId : DEFAULT_PUBLIC_PROFILE_CONFIG.activeStylePackId,
    animationIntensity: (db.animationIntensity as PublicProfileConfig["animationIntensity"]) ?? DEFAULT_PUBLIC_PROFILE_CONFIG.animationIntensity,
    layout: (db.layout as PublicProfileConfig["layout"]) ?? DEFAULT_PUBLIC_PROFILE_CONFIG.layout,
    font: DEFAULT_PUBLIC_PROFILE_CONFIG.font,
    visibleModules: Array.isArray(db.visibleModules) ? db.visibleModules as string[] : DEFAULT_PUBLIC_PROFILE_CONFIG.visibleModules,
    statusMessage: typeof db.statusMessage === "string" ? db.statusMessage : null,
    pinnedItems: Array.isArray(db.pinnedItems) ? db.pinnedItems as string[] : [],
    published: typeof db.published === "boolean" ? db.published : true,
  };
}

/** PublicProfileConfig shape → PUT request body (remap accentColor → themeColor). */
function configToBody(cfg: PublicProfileConfig): Record<string, unknown> {
  return {
    themeColor: cfg.accentColor,
    activeStylePackId: cfg.activeStylePackId,
    animationIntensity: cfg.animationIntensity,
    layout: cfg.layout,
    visibleModules: cfg.visibleModules,
    statusMessage: cfg.statusMessage,
    pinnedItems: cfg.pinnedItems,
    published: cfg.published,
  };
}

/**
 * Hook for owner-side profile config management.
 * Fetches from GET /api/profile/config on mount; persists via PUT on save.
 * Only call this when `isOwner === true`.
 */
export function useProfileConfig(initialConfig?: PublicProfileConfig): UseProfileConfigReturn {
  const [config, setConfig] = useState<PublicProfileConfig>(initialConfig ?? DEFAULT_PUBLIC_PROFILE_CONFIG);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [saveError, setSaveError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    try {
      const res = await fetch("/api/profile/config", { credentials: "include" });
      if (res.ok) {
        const data = await res.json() as { ok: boolean; config: Record<string, unknown> };
        if (data.ok && data.config) setConfig(dbToConfig(data.config));
      }
    } catch {
      // Network error on load — keep initial/default config visible
    }
  }, []);

  useEffect(() => { void reload(); }, [reload]);

  const save = useCallback(async (next: PublicProfileConfig) => {
    setSaveStatus("saving");
    setSaveError(null);
    try {
      const res = await fetch("/api/profile/config", {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(configToBody(next)),
      });
      const data = await res.json() as { ok: boolean; config?: Record<string, unknown>; error?: string };
      if (!res.ok || !data.ok) {
        setSaveStatus("error");
        setSaveError(data.error ?? "Save failed.");
        return;
      }
      if (data.config) setConfig(dbToConfig(data.config));
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 2500);
    } catch {
      setSaveStatus("error");
      setSaveError("Network error. Please try again.");
    }
  }, []);

  return { config, saveStatus, saveError, save, reload };
}
