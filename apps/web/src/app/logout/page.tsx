"use client";

import { useEffect, useState } from "react";

/**
 * /logout — forces canonical session termination (not decorative copy).
 */
export default function LogoutPage() {
  const [status, setStatus] = useState<"working" | "done" | "error">("working");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { canonicalLogout } = await import("@/lib/auth/canonicalLogout");
        await canonicalLogout("/auth");
        if (!cancelled) setStatus("done");
      } catch {
        if (!cancelled) {
          setStatus("error");
          window.location.href = "/api/auth/logout";
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div style={{ padding: 40, background: "#050510", minHeight: "100vh", color: "#fff" }}>
      <h1 style={{ fontSize: 22, fontWeight: 900 }}>Logging out…</h1>
      <p style={{ color: "rgba(255,255,255,0.65)" }}>
        {status === "working"
          ? "Ending your session."
          : status === "done"
            ? "You have been logged out."
            : "Redirecting to secure logout…"}
      </p>
    </div>
  );
}
