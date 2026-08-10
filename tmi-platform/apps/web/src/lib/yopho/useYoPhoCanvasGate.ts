"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  canAccessFanPortraitCanvas,
  canAccessPerformerLivingCanvas,
  clearYoPhoCanvasRedirectGuard,
  normalizeSessionRole,
  normalizeYoPhoCanvasRole,
  shouldApplyYoPhoCanvasRedirect,
  yoPhoHubDeepLink,
  type YoPhoCanvasRoute,
} from "@/lib/yopho/yophoCanvasAccess";

export interface YoPhoCanvasSessionUser {
  id: string;
  name?: string;
  email: string;
  role: string;
  tier?: string;
  profileSlug?: string;
  image?: string | null;
  activeRole?: string | null;
}

interface GateState {
  loading: boolean;
  user: YoPhoCanvasSessionUser | null;
}

/**
 * Resolves session + activeRole, applies at most one redirect (loop-safe).
 */
export function useYoPhoCanvasGate(currentPath: YoPhoCanvasRoute): GateState {
  const router = useRouter();
  const [state, setState] = useState<GateState>({ loading: true, user: null });
  const decided = useRef(false);

  useEffect(() => {
    let cancelled = false;
    decided.current = false;

    const run = async () => {
      try {
        const [sessionRes, rolesRes] = await Promise.all([
          fetch("/api/auth/session", { credentials: "include", cache: "no-store" }),
          fetch("/api/auth/my-roles", { credentials: "include", cache: "no-store" }),
        ]);

        if (cancelled) return;

        const sessionJson = (await sessionRes.json()) as {
          authenticated?: boolean;
          user?: YoPhoCanvasSessionUser & { activeRole?: string | null };
        };

        if (!sessionJson.authenticated || !sessionJson.user) {
          router.replace("/auth?next=" + encodeURIComponent(currentPath));
          return;
        }

        const rolesJson = (await rolesRes.json()) as {
          activeRole?: string | null;
          primaryRole?: string;
        };

        const cookieRole = normalizeSessionRole(sessionJson.user.role);
        const activeRole = rolesJson.activeRole ?? sessionJson.user.activeRole ?? null;
        const effectiveRole = normalizeYoPhoCanvasRole(activeRole ?? cookieRole);

        const allowed =
          currentPath === "/fan/canvas"
            ? canAccessFanPortraitCanvas(effectiveRole)
            : canAccessPerformerLivingCanvas(effectiveRole);

        if (!allowed) {
          const hub = yoPhoHubDeepLink(effectiveRole);
          if (!decided.current && shouldApplyYoPhoCanvasRedirect(currentPath, hub)) {
            decided.current = true;
            router.replace(hub);
          } else if (!decided.current) {
            decided.current = true;
            router.replace("/hub/fan?drawer=yopho");
          }
          return;
        }

        clearYoPhoCanvasRedirectGuard(currentPath);
        if (cancelled) return;
        setState({
          loading: false,
          user: {
            ...sessionJson.user,
            role: effectiveRole,
          },
        });
      } catch {
        if (!cancelled) router.replace("/auth");
      }
    };

    void run();
    return () => {
      cancelled = true;
    };
  }, [router, currentPath]);

  return state;
}
