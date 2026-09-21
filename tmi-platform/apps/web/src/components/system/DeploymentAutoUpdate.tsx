"use client";

/**
 * DeploymentAutoUpdate — safe client-side automatic version convergence.
 *
 * Rules:
 * 1. Checks /api/version periodically when document is visible/focused (debounced to 5 mins).
 * 2. NEVER abruptly reloads during critical operations (Go Live, WebRTC session, Stripe checkout, ticket scan, active typing).
 * 3. Bounded reload with sessionStorage tracking to prevent reload loops.
 * 4. Catches ChunkLoadError (obsolete chunk requested from old deployment) and recovers safely.
 */

import { useEffect, useRef } from "react";
import {
  executeReleaseMigration,
  isReleaseSupported,
  type TmiReleaseManifest,
} from "@/lib/system/TmiReleaseMigrationAuthority";

const RELOAD_GUARD_PREFIX = "tmi_auto_update_reloaded:";
const CHUNK_RELOAD_KEY = "tmi_chunk_mismatch_reload";
const CHECK_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes

function isSafeToUpdate(): boolean {
  if (typeof document === "undefined") return false;

  // 1. Check for active WebRTC / live performance
  const isLive = document.querySelector("[data-tmi-live-stream-active=\"true\"]") !== null;
  const isGoLive = document.querySelector("[data-stage-deck=\"work\"]") !== null;
  if (isLive || isGoLive) return false;

  // 2. Check for active payment / checkout modal
  const isCheckout = document.querySelector("[data-stripe-checkout-active=\"true\"]") !== null ||
    document.querySelector("[data-checkout-modal=\"open\"]") !== null;
  if (isCheckout) return false;

  // 3. Check for active ticket scanning
  const isScanner = document.querySelector("[data-ticket-scanner-active=\"true\"]") !== null;
  if (isScanner) return false;

  // 4. Check for active text composition with content
  const activeEl = document.activeElement;
  if (activeEl instanceof HTMLTextAreaElement || activeEl instanceof HTMLInputElement) {
    if (activeEl.value && activeEl.value.trim().length > 3) {
      return false;
    }
  }

  return true;
}

export default function DeploymentAutoUpdate() {
  const lastCheckRef = useRef<number>(0);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // A. Global ChunkLoadError listener for deployment chunk mismatch
    const triggerSafeChunkReload = (reason: string) => {
      // Critical Safe-State Gate: Never abruptly reload an active live broadcast,
      // WebRTC performance, Stripe checkout, ticket scanner, or active text input!
      if (!isSafeToUpdate()) {
        console.warn(
          `[DeploymentAutoUpdate] Chunk mismatch detected (${reason}) but reload SUPPRESSED: active live broadcast / checkout / text input is protected.`
        );
        return;
      }

      const lastChunkReload = sessionStorage.getItem(CHUNK_RELOAD_KEY);
      const currentPath = window.location.pathname;
      if (lastChunkReload !== currentPath) {
        sessionStorage.setItem(CHUNK_RELOAD_KEY, currentPath);
        console.info(
          `[DeploymentAutoUpdate] Safe state confirmed. Recovering from chunk mismatch (${reason}) -> reloading to current release`
        );
        window.location.reload();
      }
    };

    const handleGlobalError = (event: ErrorEvent) => {
      const msg = event.message || "";
      if (
        msg.includes("Loading chunk") ||
        msg.includes("ChunkLoadError") ||
        msg.includes("Failed to fetch dynamically imported module")
      ) {
        triggerSafeChunkReload("ErrorEvent: " + msg.slice(0, 80));
      }
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const reason = event.reason;
      const msg =
        (typeof reason === "string" ? reason : reason?.message) || "";
      if (
        msg.includes("Loading chunk") ||
        msg.includes("ChunkLoadError") ||
        msg.includes("Failed to fetch dynamically imported module")
      ) {
        triggerSafeChunkReload("UnhandledRejection: " + msg.slice(0, 80));
      }
    };

    window.addEventListener("error", handleGlobalError);
    window.addEventListener("unhandledrejection", handleUnhandledRejection);

    // B. Periodic / visibility-driven version check
    const checkVersion = async () => {
      const now = Date.now();
      if (now - lastCheckRef.current < CHECK_INTERVAL_MS) return;
      lastCheckRef.current = now;

      if (document.visibilityState === "hidden") return;

      const clientSha =
        document.body.getAttribute("data-build-sha") ||
        process.env.NEXT_PUBLIC_BUILD_SHA ||
        "unknown";

      if (clientSha === "unknown" || clientSha === "dev") return;

      try {
        const res = await fetch("/api/version", {
          cache: "no-store",
          headers: { "Cache-Control": "no-cache" },
        });
        if (!res.ok) return;
        const data = (await res.json()) as {
          sha?: string;
          releaseManifest?: TmiReleaseManifest;
        };

        // 1. Release Migration Handshake (Permanent Platform Law)
        if (data.releaseManifest) {
          const clientRelease =
            window.localStorage.getItem("tmi_client_release") ??
            document.body.getAttribute("data-tmi-release") ??
            "R0";

          if (!isReleaseSupported(clientRelease, data.releaseManifest)) {
            console.info(
              `[DeploymentAutoUpdate] Obsolete client release detected (${clientRelease} < ${data.releaseManifest.minimumSupportedClientRelease}). Initiating automatic release migration...`
            );
            await executeReleaseMigration(data.releaseManifest);
            return;
          }
        }

        const serverSha = data.sha?.trim();

        if (
          serverSha &&
          serverSha !== "unknown" &&
          serverSha !== "dev" &&
          serverSha !== clientSha
        ) {
          const guardKey = `${RELOAD_GUARD_PREFIX}${serverSha}`;
          if (sessionStorage.getItem(guardKey) === "1") return;

          if (isSafeToUpdate()) {
            sessionStorage.setItem(guardKey, "1");
            console.info(`[DeploymentAutoUpdate] New release detected (${serverSha} !== ${clientSha}) -> safe auto-update reload`);
            window.location.reload();
          }
        }
      } catch {
        // Silently ignore network failures on version check
      }
    };

    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        void checkVersion();
      }
    };

    document.addEventListener("visibilitychange", onVisibilityChange);
    window.addEventListener("focus", onVisibilityChange);

    // Rapid release convergence on initial return (1.2s after mount)
    const timer = setTimeout(() => {
      lastCheckRef.current = 0;
      void checkVersion();
    }, 1_200);

    return () => {
      window.removeEventListener("error", handleGlobalError);
      window.removeEventListener("unhandledrejection", handleUnhandledRejection);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("focus", onVisibilityChange);
      clearTimeout(timer);
    };
  }, []);

  return null;
}
