"use client";

/**
 * DeploymentAutoUpdate — production release convergence notice.
 *
 * Compares this document's release identity with /api/version.
 * A mismatch shows TMI UPDATE AVAILABLE. Update Now reloads the current
 * route and leaves a valid session in place. Live, call, screen-share,
 * checkout, upload, and unsaved-draft states are told immediately and
 * are not reloaded until the customer updates.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import {
  decideReleaseConvergence,
  executeReleaseMigration,
  isReleaseSupported,
  isSafeToPerformMigration,
  releaseUpdateReturnPath,
  type ReleaseConvergenceDecision,
  type TmiReleaseManifest,
} from "@/lib/system/TmiReleaseMigrationAuthority";

const RELOAD_GUARD_PREFIX = "tmi_auto_update_reloaded:";
const CHUNK_RELOAD_KEY = "tmi_chunk_mismatch_reload";
const LATER_PREFIX = "tmi_update_later:";
const RETURN_KEY = "tmi_update_return";
const CHECK_INTERVAL_MS = 5 * 60 * 1000;
const CHECK_DEBOUNCE_MS = 60 * 1000;
const CHANNEL_NAME = "tmi-release-convergence";

type Notice = {
  kind: "available" | "required" | "protected";
  releaseId: string;
  allowLater: boolean;
};

function readClientReleaseId(): string {
  if (typeof document === "undefined") return "dev";
  return (
    document.body.getAttribute("data-build-sha") ||
    process.env.NEXT_PUBLIC_BUILD_SHA ||
    "dev"
  );
}

function isSafeToUpdate(): boolean {
  return isSafeToPerformMigration();
}

function laterKey(releaseId: string): string {
  return `${LATER_PREFIX}${releaseId}`;
}

export default function DeploymentAutoUpdate() {
  const lastCheckRef = useRef(0);
  const pendingReleaseRef = useRef<string | null>(null);
  const [notice, setNotice] = useState<Notice | null>(null);
  const [chip, setChip] = useState(false);

  const applyDecision = useCallback((decision: ReleaseConvergenceDecision, releaseId: string) => {
    if (decision.action === "current") {
      setNotice(null);
      setChip(false);
      return;
    }
    const deferred = sessionStorage.getItem(laterKey(releaseId)) === "1";
    if (decision.action === "required") {
      setChip(false);
      setNotice({
        kind: decision.protectedSession ? "protected" : "required",
        releaseId,
        allowLater: false,
      });
      return;
    }
    if (decision.protectedSession) {
      setNotice({ kind: "protected", releaseId, allowLater: false });
      setChip(false);
      return;
    }
    if (deferred) {
      pendingReleaseRef.current = releaseId;
      setNotice(null);
      setChip(true);
      return;
    }
    pendingReleaseRef.current = releaseId;
    setChip(false);
    setNotice({ kind: "available", releaseId, allowLater: true });
  }, []);

  const publish = useCallback((decision: ReleaseConvergenceDecision, releaseId: string) => {
    applyDecision(decision, releaseId);
    try {
      const channel = new BroadcastChannel(CHANNEL_NAME);
      channel.postMessage({ releaseId, decision });
      channel.close();
    } catch {
      // BroadcastChannel is unavailable in some browsers.
    }
  }, [applyDecision]);

  const updateNow = useCallback(() => {
    if (!isSafeToUpdate()) return;
    try {
      sessionStorage.setItem(RETURN_KEY, releaseUpdateReturnPath(window.location.href));
      const releaseId = notice?.releaseId && notice.releaseId !== "current"
        ? notice.releaseId
        : pendingReleaseRef.current;
      if (releaseId) sessionStorage.setItem(`${RELOAD_GUARD_PREFIX}${releaseId}`, "1");
    } catch {
      // Storage can be blocked. The reload still stays on this URL.
    }
    const waiting = navigator.serviceWorker?.getRegistration?.();
    void Promise.resolve(waiting)
      .then((registration) => {
        registration?.waiting?.postMessage({ type: "TMI_SW_SKIP_WAITING" });
      })
      .finally(() => {
        window.location.reload();
      });
  }, [notice?.releaseId]);

  const chooseLater = useCallback(() => {
    if (!notice?.allowLater) return;
    try {
      sessionStorage.setItem(laterKey(notice.releaseId), "1");
    } catch {
      // The chip still hides the dialog for this view.
    }
    setNotice(null);
    setChip(true);
  }, [notice]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const triggerSafeChunkReload = (reason: string) => {
      if (!isSafeToUpdate()) return;
      const currentPath = window.location.pathname;
      if (sessionStorage.getItem(CHUNK_RELOAD_KEY) === currentPath) return;
      sessionStorage.setItem(CHUNK_RELOAD_KEY, currentPath);
      sessionStorage.setItem(RETURN_KEY, releaseUpdateReturnPath(window.location.href));
      console.info(`[DeploymentAutoUpdate] Recovering from chunk mismatch (${reason})`);
      window.location.reload();
    };

    const handleGlobalError = (event: ErrorEvent) => {
      const msg = event.message || "";
      if (
        msg.includes("Loading chunk") ||
        msg.includes("ChunkLoadError") ||
        msg.includes("Failed to fetch dynamically imported module")
      ) {
        triggerSafeChunkReload(msg.slice(0, 80));
      }
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const reason = event.reason;
      const msg = (typeof reason === "string" ? reason : reason?.message) || "";
      if (
        msg.includes("Loading chunk") ||
        msg.includes("ChunkLoadError") ||
        msg.includes("Failed to fetch dynamically imported module")
      ) {
        triggerSafeChunkReload(msg.slice(0, 80));
      }
    };

    const checkVersion = async () => {
      const now = Date.now();
      if (now - lastCheckRef.current < CHECK_DEBOUNCE_MS) return;
      lastCheckRef.current = now;
      if (document.visibilityState === "hidden") return;

      const clientReleaseId = readClientReleaseId();

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

        if (data.releaseManifest) {
          const clientRelease =
            window.localStorage.getItem("tmi_client_release") ??
            document.body.getAttribute("data-tmi-release") ??
            "R0";
          if (!isReleaseSupported(clientRelease, data.releaseManifest)) {
            await executeReleaseMigration(data.releaseManifest);
            return;
          }
        }

        const decision = decideReleaseConvergence({
          clientReleaseId,
          currentReleaseId: data.sha,
          policy: data.releaseManifest?.updatePolicy,
          protectedSession: !isSafeToUpdate(),
        });
        publish(decision, (data.sha || "").trim());
      } catch {
        // A failed check leaves the current page alone.
      }
    };

    const onVisible = () => {
      if (document.visibilityState === "visible") void checkVersion();
    };

    const onOnline = () => {
      lastCheckRef.current = 0;
      void checkVersion();
    };

    let channel: BroadcastChannel | null = null;
    try {
      channel = new BroadcastChannel(CHANNEL_NAME);
      channel.onmessage = (event: MessageEvent) => {
        const payload = event.data as { releaseId?: string; decision?: ReleaseConvergenceDecision } | null;
        if (!payload?.decision || !payload.releaseId) return;
        applyDecision(payload.decision, payload.releaseId);
      };
    } catch {
      channel = null;
    }

    window.addEventListener("error", handleGlobalError);
    window.addEventListener("unhandledrejection", handleUnhandledRejection);
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("focus", onVisible);
    window.addEventListener("online", onOnline);
    window.addEventListener("pageshow", onVisible);

    const timer = setTimeout(() => {
      lastCheckRef.current = 0;
      void checkVersion();
    }, 1_200);
    const interval = setInterval(() => {
      if (document.visibilityState === "visible") {
        lastCheckRef.current = 0;
        void checkVersion();
      }
    }, CHECK_INTERVAL_MS);

    return () => {
      window.removeEventListener("error", handleGlobalError);
      window.removeEventListener("unhandledrejection", handleUnhandledRejection);
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("focus", onVisible);
      window.removeEventListener("online", onOnline);
      window.removeEventListener("pageshow", onVisible);
      clearTimeout(timer);
      clearInterval(interval);
      channel?.close();
    };
  }, [applyDecision, publish]);

  if (!notice && !chip) return null;

  return (
    <>
      {chip && !notice ? (
        <button
          type="button"
          data-testid="tmi-update-ready-chip"
          onClick={() => {
            setChip(false);
            setNotice({
              kind: "available",
              releaseId: pendingReleaseRef.current || "current",
              allowLater: true,
            });
          }}
          style={{
            position: "fixed",
            right: 12,
            bottom: 12,
            zIndex: 100000,
            minHeight: 44,
            padding: "0 14px",
            borderRadius: 999,
            border: "1px solid rgba(0,255,255,0.55)",
            background: "rgba(5,5,16,0.94)",
            color: "#EAFBFF",
            fontWeight: 800,
            letterSpacing: "0.08em",
            cursor: "pointer",
          }}
        >
          UPDATE READY
        </button>
      ) : null}
      {notice ? (
        <div
          data-testid="tmi-update-available"
          role="dialog"
          aria-modal="true"
          aria-labelledby="tmi-update-title"
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 100000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 16,
            background: "rgba(5,5,16,0.72)",
          }}
        >
          <div
            style={{
              width: "min(420px, 100%)",
              borderRadius: 16,
              border: "1px solid rgba(0,255,255,0.45)",
              background: "#0d0d22",
              boxShadow: "0 18px 50px rgba(0,0,0,0.45)",
              padding: "22px 20px 18px",
              color: "#F4FBFF",
              textAlign: "center",
            }}
          >
            <div
              id="tmi-update-title"
              style={{ fontWeight: 900, letterSpacing: "0.12em", fontSize: 14, marginBottom: 10 }}
            >
              {notice.kind === "required" ? "TMI UPDATE REQUIRED" : notice.kind === "protected" ? "TMI UPDATE READY" : "TMI UPDATE AVAILABLE"}
            </div>
            <p style={{ margin: "0 0 16px", fontSize: 14, lineHeight: 1.45, color: "rgba(255,255,255,0.82)" }}>
              {notice.kind === "protected"
                ? "A new version of TMI is available. You're currently in a live session. We'll update when your session ends."
                : notice.kind === "required"
                  ? "TMI has been updated. Refresh to continue using TMI."
                  : "A new version of TMI is ready. Refresh TMI to get the latest features and improvements."}
            </p>
            <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
              <button
                type="button"
                data-testid="tmi-update-now"
                onClick={updateNow}
                disabled={notice.kind === "protected"}
                style={{
                  minHeight: 44,
                  minWidth: 140,
                  padding: "0 16px",
                  borderRadius: 10,
                  border: "1px solid #00FFFF",
                  background: notice.kind === "protected" ? "rgba(255,255,255,0.08)" : "rgba(0,255,255,0.18)",
                  color: "#EAFBFF",
                  fontWeight: 900,
                  letterSpacing: "0.08em",
                  cursor: notice.kind === "protected" ? "default" : "pointer",
                }}
              >
                {notice.kind === "protected" ? "UPDATE WHEN SAFE" : "UPDATE NOW"}
              </button>
              {notice.allowLater ? (
                <button
                  type="button"
                  data-testid="tmi-update-later"
                  onClick={chooseLater}
                  style={{
                    minHeight: 44,
                    minWidth: 100,
                    padding: "0 16px",
                    borderRadius: 10,
                    border: "1px solid rgba(255,255,255,0.25)",
                    background: "transparent",
                    color: "rgba(255,255,255,0.8)",
                    fontWeight: 800,
                    cursor: "pointer",
                  }}
                >
                  LATER
                </button>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
