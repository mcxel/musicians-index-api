"use client";

import { useEffect, useState } from "react";

/**
 * Customer verb for the existing Follow record.
 * Friendship is a separate mutual request and is not changed here.
 * Anonymous visitors see the button. The follow write asks for sign-in.
 */
export default function FanThemButton({
  targetUserId,
  returnPath,
  accent = "#00FFFF",
}: {
  targetUserId: string;
  returnPath: string;
  accent?: string;
}) {
  const [state, setState] = useState<"ready" | "fanned" | "working">("ready");

  useEffect(() => {
    let cancelled = false;
    const params = new URLSearchParams(window.location.search);
    const resume = params.get("fan") === "1";
    fetch(`/api/social/follow?userId=${encodeURIComponent(targetUserId)}`, { credentials: "include" })
      .then((response) => response.json())
      .then(async (body: { following?: boolean }) => {
        if (cancelled) return;
        if (body.following) {
          setState("fanned");
          return;
        }
        if (!resume) return;
        setState("working");
        const posted = await fetch("/api/social/follow", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: targetUserId, action: "follow" }),
        });
        if (cancelled) return;
        setState(posted.ok ? "fanned" : "ready");
        if (posted.ok) {
          params.delete("fan");
          const next = `${window.location.pathname}${params.toString() ? `?${params}` : ""}`;
          window.history.replaceState(null, "", next);
        }
      })
      .catch(() => {
        if (!cancelled) setState("ready");
      });
    return () => {
      cancelled = true;
    };
  }, [targetUserId]);

  async function activate() {
    if (state !== "ready") return;
    setState("working");
    const response = await fetch("/api/social/follow", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: targetUserId, action: "follow" }),
    });
    if (response.status === 401) {
      const back = `${returnPath}${returnPath.includes("?") ? "&" : "?"}fan=1`;
      window.location.href = `/auth?next=${encodeURIComponent(back)}`;
      return;
    }
    setState(response.ok ? "fanned" : "ready");
  }

  return (
    <button
      type="button"
      data-testid="fan-them"
      onClick={() => void activate()}
      disabled={state !== "ready"}
      style={{
        padding: "12px 16px",
        borderRadius: 999,
        border: `1.5px solid ${accent}`,
        background: state === "fanned" ? `${accent}22` : "transparent",
        color: "#fff",
        fontWeight: 900,
        letterSpacing: "0.12em",
        fontSize: 12,
        cursor: state === "ready" ? "pointer" : "default",
        fontFamily: "inherit",
      }}
    >
      {state === "fanned" ? "FANNED" : state === "working" ? "FANNING…" : "FAN THEM"}
    </button>
  );
}
