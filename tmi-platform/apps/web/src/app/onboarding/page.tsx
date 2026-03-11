"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type MePayload = {
  user?: {
    role?: "fan" | "artist" | "admin" | null;
    onboardingState?: "no_role_selected" | "incomplete" | "complete";
  };
  csrfToken?: string | null;
};

async function getCsrfToken(): Promise<string | null> {
  const sessionRes = await fetch("/api/auth/session", { cache: "no-store" });
  if (!sessionRes.ok) return null;
  const session = (await sessionRes.json()) as { csrfToken?: string | null };
  return session.csrfToken || null;
}

export default function OnboardingPage() {
  const router = useRouter();
  const [message, setMessage] = useState("Loading onboarding...");

  useEffect(() => {
    const run = async () => {
      try {
        const res = await fetch("/api/users/me", { cache: "no-store" });
        if (!res.ok) {
          router.replace("/auth?next=%2Fonboarding");
          return;
        }

        const me = (await res.json()) as MePayload;
        const onboardingState = me.user?.onboardingState || "no_role_selected";
        if (me.user?.role === "admin") {
          router.replace("/dashboard/admin");
          return;
        }
        if (onboardingState === "complete") {
          router.replace("/dashboard");
          return;
        }
        if (onboardingState === "incomplete" && me.user?.role === "artist") {
          router.replace("/onboarding/artist");
          return;
        }
        if (onboardingState === "incomplete" && me.user?.role === "fan") {
          router.replace("/onboarding/fan");
          return;
        }

        setMessage("Choose a role to continue onboarding.");
      } catch {
        setMessage("Unable to load onboarding state.");
      }
    };

    void run();
  }, [router]);

  const selectRole = async (role: "fan" | "artist") => {
    const csrfToken = await getCsrfToken();
    if (!csrfToken) {
      setMessage("Role selection failed: CSRF token missing.");
      return;
    }

    const res = await fetch("/api/onboarding/role", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CSRF-Token": csrfToken,
      },
      body: JSON.stringify({ role }),
    });

    if (res.ok) {
      router.replace(role === "artist" ? "/onboarding/artist" : "/onboarding/fan");
      return;
    }

    const err = await res.text();
    setMessage(`Role selection failed: ${err}`);
  };

  return (
    <main className="min-h-screen bg-black text-white px-6 py-16">
      <div className="mx-auto max-w-xl space-y-6">
        <h1 className="text-3xl font-bold">Onboarding</h1>
        <p className="text-white/70">{message}</p>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => void selectRole("fan")}
            className="rounded bg-blue-600 px-4 py-2"
          >
            Continue as Fan
          </button>
          <button
            type="button"
            onClick={() => void selectRole("artist")}
            className="rounded bg-emerald-600 px-4 py-2"
          >
            Continue as Artist
          </button>
        </div>
      </div>
    </main>
  );
}
