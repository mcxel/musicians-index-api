"use client";

/**
 * ActivePerformerContext — Living OS ACTIVE_PERFORMER (id/slug).
 *
 * Thin session context so Fan/Performer hubs and drawers can rebind to the
 * selected performer without unmounting shell/drawers. Persist lightly in
 * sessionStorage for the browser tab only.
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  getPerformerById,
  getPerformerBySlug,
} from "@/lib/performers/PerformerRegistry";
import { livingOsCommandBus } from "@/lib/os/livingOsCommandBus";

const STORAGE_KEY = "tmi_living_os_active_performer";

export interface ActivePerformerRef {
  id: string;
  slug: string;
  name?: string;
}

export interface ActivePerformerContextValue {
  /** Canonical ACTIVE_PERFORMER — null when none selected. */
  activePerformer: ActivePerformerRef | null;
  activePerformerId: string | null;
  activePerformerSlug: string | null;
  setActivePerformer: (ref: ActivePerformerRef | string) => void;
  clearActivePerformer: () => void;
  /**
   * Resolve id for panels: active performer, else fallback (e.g. session user
   * for performer hubs).
   */
  resolvePerformerId: (fallbackId?: string | null) => string | null;
}

const ActivePerformerContext = createContext<ActivePerformerContextValue | null>(
  null,
);

function normalizeRef(input: ActivePerformerRef | string): ActivePerformerRef | null {
  if (typeof input === "string") {
    const key = input.trim();
    if (!key) return null;
    const byId = getPerformerById(key);
    if (byId) {
      return { id: byId.id, slug: byId.slug, name: byId.name };
    }
    const bySlug = getPerformerBySlug(key);
    if (bySlug) {
      return { id: bySlug.id, slug: bySlug.slug, name: bySlug.name };
    }
    // Honest passthrough when registry miss — still usable as performerId key
    return { id: key, slug: key };
  }
  const id = input.id?.trim();
  if (!id) return null;
  const fromReg = getPerformerById(id) ?? getPerformerBySlug(input.slug || id);
  return {
    id: fromReg?.id ?? id,
    slug: fromReg?.slug ?? input.slug?.trim() ?? id,
    name: input.name ?? fromReg?.name,
  };
}

function readStored(): ActivePerformerRef | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ActivePerformerRef;
    return normalizeRef(parsed);
  } catch {
    return null;
  }
}

function writeStored(ref: ActivePerformerRef | null): void {
  if (typeof window === "undefined") return;
  try {
    if (!ref) sessionStorage.removeItem(STORAGE_KEY);
    else sessionStorage.setItem(STORAGE_KEY, JSON.stringify(ref));
  } catch {
    /* quota */
  }
}

export interface ActivePerformerProviderProps {
  children: ReactNode;
  /** Default when nothing stored (e.g. performer hub → self). */
  defaultPerformer?: ActivePerformerRef | string | null;
  role?: "fan" | "performer" | "admin";
  userId?: string;
}

export function ActivePerformerProvider({
  children,
  defaultPerformer = null,
  role = "fan",
  userId,
}: ActivePerformerProviderProps) {
  const [activePerformer, setActiveState] = useState<ActivePerformerRef | null>(null);
  const defaultKey =
    typeof defaultPerformer === "string"
      ? defaultPerformer
      : defaultPerformer?.id ?? "";

  useEffect(() => {
    const stored = readStored();
    if (stored) {
      setActiveState(stored);
      return;
    }
    if (defaultPerformer) {
      const norm = normalizeRef(defaultPerformer);
      if (norm) {
        setActiveState(norm);
        writeStored(norm);
      }
    }
    // Only seed once per default performer identity — do not clobber user picks.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- defaultKey is the stable seed
  }, [defaultKey]);

  const setActivePerformer = useCallback(
    (ref: ActivePerformerRef | string) => {
      const next = normalizeRef(ref);
      if (!next) return;
      setActiveState((prev) => {
        if (prev?.id === next.id && prev?.slug === next.slug) return prev;
        writeStored(next);
        livingOsCommandBus.executeAction("ACTION_SET_ACTIVE_PERFORMER", {
          userId,
          role: role === "admin" ? "admin" : role,
          payload: {
            performerId: next.id,
            performerSlug: next.slug,
            performerName: next.name,
          },
          idempotencyKey: `active_perf_${next.id}`,
        });
        return next;
      });
    },
    [role, userId],
  );

  const clearActivePerformer = useCallback(() => {
    setActiveState(null);
    writeStored(null);
  }, []);

  const resolvePerformerId = useCallback(
    (fallbackId?: string | null) => {
      return activePerformer?.id ?? fallbackId ?? null;
    },
    [activePerformer],
  );

  const value = useMemo<ActivePerformerContextValue>(
    () => ({
      activePerformer,
      activePerformerId: activePerformer?.id ?? null,
      activePerformerSlug: activePerformer?.slug ?? null,
      setActivePerformer,
      clearActivePerformer,
      resolvePerformerId,
    }),
    [activePerformer, setActivePerformer, clearActivePerformer, resolvePerformerId],
  );

  return (
    <ActivePerformerContext.Provider value={value}>
      {children}
    </ActivePerformerContext.Provider>
  );
}

const FALLBACK: ActivePerformerContextValue = {
  activePerformer: null,
  activePerformerId: null,
  activePerformerSlug: null,
  setActivePerformer: () => {},
  clearActivePerformer: () => {},
  resolvePerformerId: (fallbackId) => fallbackId ?? null,
};

export function useActivePerformer(): ActivePerformerContextValue {
  return useContext(ActivePerformerContext) ?? FALLBACK;
}
