"use client";

/**
 * Google auto-FAN recovery modal.
 * Prompt: "Did TMI create a Fan side for you when you intended to be a Performer?"
 * Keep Fan | Add Performer (additive companion — never destructive convert).
 */

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ROLE_CHOICE_RECOVERY_PROMPT } from "@/lib/auth/roleChoiceAuthority";

const SKIP_PATHS = [
  "/auth",
  "/signup",
  "/login",
  "/onboarding",
  "/api",
  "/support/account-recovery",
];

export default function GoogleRoleChoiceRecoveryModal() {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const skip = SKIP_PATHS.some(
    (p) => pathname === p || pathname?.startsWith(`${p}/`),
  );

  useEffect(() => {
    if (skip) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/account/role-choice-recovery", {
          credentials: "include",
          cache: "no-store",
        });
        const data = (await res.json().catch(() => null)) as {
          eligible?: boolean;
        } | null;
        if (!cancelled && data?.eligible) setOpen(true);
      } catch {
        /* stay closed */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [skip, pathname]);

  async function submit(action: "KEEP_FAN" | "ADD_PERFORMER") {
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/account/role-choice-recovery", {
        method: "POST",
        credentials: "include",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        hubUrl?: string;
        error?: string;
      };
      if (!res.ok || !data.ok) {
        setError(data.error ?? "Could not save your choice. Try again.");
        setBusy(false);
        return;
      }
      setOpen(false);
      router.push(data.hubUrl ?? (action === "ADD_PERFORMER" ? "/hub/performer" : "/hub/fan"));
    } catch {
      setError("Network error. Please try again.");
      setBusy(false);
    }
  }

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="role-choice-recovery-title"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 99990,
        background: "rgba(5,5,16,0.82)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 440,
          background: "linear-gradient(165deg, #12081f 0%, #050510 100%)",
          border: "1px solid rgba(0,255,255,0.28)",
          borderRadius: 14,
          padding: "28px 24px",
          boxShadow: "0 0 40px rgba(255,45,170,0.12)",
        }}
      >
        <div
          style={{
            fontSize: 9,
            letterSpacing: "0.28em",
            color: "#FF2DAA",
            fontWeight: 800,
            marginBottom: 10,
          }}
        >
          ROLE CHECK
        </div>
        <h2
          id="role-choice-recovery-title"
          style={{
            margin: 0,
            fontSize: 20,
            fontWeight: 900,
            color: "#fff",
            lineHeight: 1.35,
          }}
        >
          {ROLE_CHOICE_RECOVERY_PROMPT}
        </h2>
        <p
          style={{
            marginTop: 12,
            fontSize: 13,
            color: "rgba(255,255,255,0.55)",
            lineHeight: 1.5,
          }}
        >
          Google sign-in used to create a Fan side automatically. You can keep Fan,
          or add a Performer side without deleting anything.
        </p>

        {error ? (
          <div style={{ marginTop: 12, fontSize: 12, color: "#FF6B8A" }}>{error}</div>
        ) : null}

        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 22 }}>
          <button
            type="button"
            disabled={busy}
            onClick={() => void submit("KEEP_FAN")}
            style={{
              padding: "12px 14px",
              borderRadius: 8,
              border: "1px solid rgba(0,255,255,0.45)",
              background: "rgba(0,255,255,0.08)",
              color: "#00FFFF",
              fontWeight: 800,
              fontSize: 12,
              letterSpacing: "0.06em",
              cursor: busy ? "wait" : "pointer",
            }}
          >
            KEEP FAN
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => void submit("ADD_PERFORMER")}
            style={{
              padding: "12px 14px",
              borderRadius: 8,
              border: "1px solid rgba(255,45,170,0.5)",
              background: "rgba(255,45,170,0.12)",
              color: "#FF2DAA",
              fontWeight: 800,
              fontSize: 12,
              letterSpacing: "0.06em",
              cursor: busy ? "wait" : "pointer",
            }}
          >
            ADD PERFORMER
          </button>
        </div>
      </div>
    </div>
  );
}
